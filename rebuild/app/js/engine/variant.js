/* Variant: the rules engine for spec-driven modes (any board size up to 32x32, holes and shaped boards, walls,
   custom/compound/neutral pieces, 2 to 4 players with their own forward direction and teams, drops, atomic,
   gravity, multi-move turns, per-colour check rules, custom win conditions, pure rule hooks).

   State (plain object, cloned per move; hooks must treat nested objects copy-on-write):
     { b: Array(size) of piece|null, turn: colour, ep: -1, epv: -1, ply: 0, half: 0, sub: 0,
       hands: {w:[], b:[]}, checks: {w:0, b:0}, score: {w:0, b:0}, out: {} (eliminated colours), x: {} }
   Colours: 'w' and 'b' by default; spec.players may declare up to 4 (any single lower-case letters other than 'n').
   Piece: { t: typeId, c: colour|'n' (neutral), m: 0|1 (has moved), dead: 1 (eliminated player's piece), ...custom fields }
   Move:  { f, t, p (type), c (colour), cap (piece|null), capSq, promo, castle:{rf,rt}, drop, dbl, ep, n (next state, set by legal) }
*/
(function () {
  'use strict';
  var CM = window.CM, MV = CM.movement;
  var opp2 = function (c) { return c === 'w' ? 'b' : 'w'; };

  function Variant(cfg) {
    this.cfg = cfg;
    var b = cfg.board || {}, self0 = this;
    this.geo = new CM.Geometry(b.files || 8, b.ranks || 8, { holes: b.holes, mask: b.mask, shape: b.shape, wrapFiles: b.wrapFiles || (cfg.rules && cfg.rules.wrapFiles) });
    /* players: [{color, forward, team}] in turn order. Default: White up, Black down. */
    var pl = cfg.players && cfg.players.length ? cfg.players : [{ color: 'w', forward: 'up' }, { color: 'b', forward: 'down' }];
    this.colors = pl.map(function (p) { return p.color; });
    this.team = {}; this.multi = this.colors.length > 2;
    pl.forEach(function (p, k) { self0.geo.setDir(p.color, p.forward || (k === 0 ? 'up' : k === 1 && pl.length === 2 ? 'down' : ['up', 'right', 'down', 'left'][k % 4])); self0.team[p.color] = p.team != null ? p.team : p.color; });
    this.hooks = cfg.hooks || {};
    var r = this.rules = Object.assign({
      check: 'standard', castling: true, enPassant: true, forcedCapture: false, drops: false, atomic: null, gravity: null,
      movesPerTurn: null, friendlyCapture: false, promotion: { to: ['Q', 'R', 'B', 'N'], zone: 1 },
      win: [{ type: 'checkmate' }], stalemate: 'draw', drawPlies: 200, royalSafety: 'all'
    }, cfg.rules || {});
    if (r.promotion && !r.promotion.to) r.promotion.to = ['Q', 'R', 'B', 'N'];
    this.winTypes = {}; var self = this;
    (r.win || []).forEach(function (w) { self.winTypes[typeof w === 'string' ? w : w.type] = typeof w === 'string' ? { type: w } : w; });
    /* piece types: built-ins, then spec overrides/additions */
    this.types = {};
    var all = Object.assign({}, MV.BUILTIN, cfg.pieces || {});
    Object.keys(all).forEach(function (id) {
      var d = Object.assign({ id: id, value: 300, capturable: true }, MV.BUILTIN[id] || {}, all[id]);
      if (typeof d.gen === 'string') d.gen = self.hooks[d.gen] || null;
      d._atoms = MV.compileMoves(d.moves);
      d._simple = !d.gen && d._atoms.every(function (a) { return !a.hop; });
      self.types[id] = d;
    });
    this._buildAttackTables();
  }
  var P = Variant.prototype;

  P.def = function (t) { return this.types[t] || this.types.P; };
  P.piece = function (t, c, extra) { var p = { t: t, c: c, m: 0 }; if (extra) Object.assign(p, extra); return p; };
  /* turn order and sides */
  P.opp = function (c) { if (!this.multi) return opp2(c); var k = this.colors.indexOf(c); return this.colors[(k + 1) % this.colors.length]; };
  P.isEnemy = function (a, b) { return a !== b && a !== 'n' && b !== 'n' && this.team[a] !== this.team[b]; };
  P.enemiesOf = function (c) { var self = this; return this.colors.filter(function (x) { return self.isEnemy(c, x); }); };
  P.nextTurn = function (st, me) {
    var k = this.colors.indexOf(me), n = this.colors.length, out = st.out || {};
    for (var s = 1; s <= n; s++) { var c = this.colors[(k + s) % n]; if (!out[c]) return c; }
    return this.opp(me);
  };
  P.alive = function (st) { var out = st.out || {}; return this.colors.filter(function (c) { return !out[c]; }); };
  /* check rule per colour: rules.check is 'standard' | 'none' or {w:'standard', b:'none', ...} */
  P.checkRule = function (c) { var r = this.rules.check; return typeof r === 'object' && r ? (r[c] || r['default'] || 'standard') : r; };
  P.anyCheck = function () { var self = this; return this.colors.some(function (c) { return self.checkRule(c) !== 'none'; }); };

  /* ---------------- attack tables (reverse lookup for fast check detection) ---------------- */
  P._buildAttackTables = function () {
    var self = this; this.att = { n: [] }; this.slowAttackers = { n: {} };
    this.colors.concat(['n']).forEach(function (c) {
      var map = {}, fr = self.geo.FR(c === 'n' ? 'w' : c); self.slowAttackers[c] = self.slowAttackers[c] || {};
      Object.keys(self.types).forEach(function (t) {
        var d = self.types[t];
        if (c === 'n' && !d.attacks) return;
        if (!d._simple) { self.slowAttackers[c][t] = 1; return; }
        d._atoms.forEach(function (a) {
          if (a.mode === 'm') return;
          a.v.forEach(function (v) {
            var dc = v[0] * fr.R[0] + v[1] * fr.F[0], dr = v[0] * fr.R[1] + v[1] * fr.F[1];
            var key = dc + ',' + dr + ',' + a.range + ',' + (a.lame ? 1 : 0) + ',' + (a.initial ? 1 : 0);
            (map[key] = map[key] || { dc: dc, dr: dr, range: a.range, lame: a.lame, initial: a.initial, types: {} }).types[t] = 1;
          });
        });
      });
      self.att[c] = Object.keys(map).map(function (k) { return map[k]; }); self.slowAttackers[c] = self.slowAttackers[c] || {};
    });
  };

  /* is square sq attacked by colour `by`? (neutral attackers with def.attacks count against both sides) */
  P.attacked = function (st, sq, by) {
    if (this._attBy(st, sq, by)) return true;
    if (this.att.n.length && this._attBy(st, sq, 'n')) return true;
    if (this.hooks.attacks && this.hooks.attacks(this, st, sq, by)) return true;
    return false;
  };
  P._attBy = function (st, sq, by) {
    var g = this.geo, b = st.b, T = this.att[by];
    for (var k = 0; k < T.length; k++) {
      var e = T[k], j = sq, steps = e.range === 0 ? 99 : e.range;
      for (var s = 1; s <= steps; s++) {
        j = g.step(j, -e.dc, -e.dr);
        if (j < 0) break;
        var p = b[j];
        if (p) {
          if (p.c === by && !p.dead && e.types[p.t] && (!e.initial || !p.m)) {
            if (!e.lame || s > 1 || this._lameClear(st, j, e.dc, e.dr)) return true;
          }
          break;
        }
        if (e.range === 1) break;
      }
    }
    /* pieces with custom generators or hoppers: generate their moves with a probe on sq */
    var slow = this.slowAttackers[by];
    for (var t in slow) {
      for (var i = 0; i < b.length; i++) {
        var q = b[i]; if (!q || q.t !== t || q.c !== by || q.dead) continue;
        var saved = b[sq]; if (!saved) b[sq] = { t: '?', c: '?', m: 1, probe: 1 };
        var out = []; this.genPiece(st, i, out, true);
        b[sq] = saved;
        for (var z = 0; z < out.length; z++) if (out[z].t === sq) return true;
      }
    }
    return false;
  };
  P._lameClear = function (st, from, dc, dr) {
    var adc = Math.abs(dc), adr = Math.abs(dr), sc = Math.sign(dc), sr = Math.sign(dr), g = this.geo, j = from;
    if (adc === 0 || adr === 0 || adc === adr) {
      var n = Math.max(adc, adr);
      for (var s = 1; s < n; s++) { j = g.step(j, sc, sr); if (j < 0 || st.b[j]) return false; }
      return true;
    }
    /* oblique (xiangqi horse): first orthogonal step along the longer leg */
    j = adc > adr ? g.step(from, sc, 0) : g.step(from, 0, sr);
    return j >= 0 && !st.b[j];
  };

  P.royals = function (st, c) { var o = []; for (var i = 0; i < st.b.length; i++) { var p = st.b[i]; if (p && p.c === c && !p.dead && this.def(p.t).royal) o.push(i); } return o; };
  /* is square sq attacked by any enemy of colour c? */
  P.attackedByEnemy = function (st, sq, c) {
    var E = this.enemiesOf(c);
    for (var k = 0; k < E.length; k++) if (!(st.out && st.out[E[k]]) && this.attacked(st, sq, E[k])) return true;
    return false;
  };
  P.royalAttacked = function (st, sq, c) {
    if (this.rules.atomic) { /* atomic: a king touching an enemy king cannot be captured (the capture would blow up both) */
      var E = this.enemiesOf(c), g = this.geo;
      for (var i = 0; i < st.b.length; i++) { var p = st.b[i]; if (p && E.indexOf(p.c) >= 0 && this.def(p.t).royal && g.dist(i, sq) === 1) return false; }
    }
    return this.attackedByEnemy(st, sq, c);
  };
  P.inCheck = function (st, c) {
    var R = this.royals(st, c);
    for (var k = 0; k < R.length; k++) if (this.royalAttacked(st, R[k], c)) return true;
    return false;
  };

  /* ---------------- move generation ---------------- */
  P.canCapture = function (mover, target) {
    if (!target) return false;
    if (target.probe) return true;
    var d = this.def(target.t);
    if (d.capturable === false || d.blocker) return false;
    if (target.c === 'n') return true;
    if (target.c === mover.c || !this.isEnemy(mover.c, target.c)) return !!this.rules.friendlyCapture && !d.royal;
    if (this.rules.atomic && this.def(mover.t).royal) return false;
    return true;
  };
  P.genPiece = function (st, i, out, probing) {
    var b = st.b, p = b[i], d = this.def(p.t), g = this.geo, c = p.c, self = this;
    if (d.blocker) return;
    if (d.gen) { d.gen(this, st, i, p, out); if (!probing) this._promos(st, out); return; }
    var fr = g.FR(c === 'n' ? 'w' : c), Rx = fr.R[0], Ry = fr.R[1], Fx = fr.F[0], Fy = fr.F[1];
    for (var k = 0; k < d._atoms.length; k++) {
      var a = d._atoms[k];
      if (a.initial && p.m) continue;
      for (var vi = 0; vi < a.v.length; vi++) {
        var vx = a.v[vi][0], vy = a.v[vi][1], dc = vx * Rx + vy * Fx, dr = vx * Ry + vy * Fy, j = i, steps = a.range === 0 ? 99 : a.range, hopped = false;
        for (var s = 1; s <= steps; s++) {
          j = g.step(j, dc, dr);
          if (j < 0 || j === i) break;
          if (a.lame && s === 1 && !this._lameClear(st, i, dc, dr)) break;
          var q = b[j];
          if (a.hop) {
            if (!hopped) { if (q) { hopped = true; if (a.hop === 'g') { steps = s + 1; } } continue; }
            if (q) { if (a.mode !== 'm' && this.canCapture(p, q)) out.push({ f: i, t: j, p: p.t, c: c, cap: q, capSq: j }); break; }
            if (a.mode !== 'c') out.push({ f: i, t: j, p: p.t, c: c, cap: null });
            continue;
          }
          if (q) {
            if (a.mode !== 'm' && this.canCapture(p, q)) out.push({ f: i, t: j, p: p.t, c: c, cap: q, capSq: j });
            break;
          }
          if (a.mode !== 'c') {
            var mv = { f: i, t: j, p: p.t, c: c, cap: null };
            if (d.enPassant && a.range === 1 && Math.abs(vy) === 2 && vx === 0 && this.rules.enPassant) mv.dbl = g.step(i, dc / 2, dr / 2);
            out.push(mv);
          } else if (d.enPassant && this.rules.enPassant && j === st.ep && st.epv >= 0 && b[st.epv] && this.isEnemy(c, b[st.epv].c)) {
            out.push({ f: i, t: j, p: p.t, c: c, cap: b[st.epv], capSq: st.epv, ep: true });
          }
          if (a.range === 1) break;
        }
      }
    }
    if (d.castle && !p.m && this.rules.castling && !probing) this._castles(st, i, p, out);
    if (!probing) this._promos(st, out, i);
  };
  P._promos = function (st, out, from) {
    var pr = this.rules.promotion; if (!pr) return;
    for (var k = out.length - 1; k >= 0; k--) {
      var m = out[k]; if (from != null && m.f !== from) continue; if (m.promo || m.drop) continue;
      var d = this.def(m.p); if (!d.promote) continue;
      var zone = d.promoteZone || pr.zone || 1;
      if (this.geo.relRow(m.t, m.c) < this.geo.depth(m.c) - zone) continue;
      var to = d.promoteTo || pr.to; if (!to || !to.length) continue;
      var subs = to.map(function (t) { return Object.assign({}, m, { promo: t }); });
      out.splice.apply(out, [k, 1].concat(subs));
    }
  };
  P._castles = function (st, i, p, out) {
    var g = this.geo, b = st.b, self = this, R = g.FR(p.c).R, chk = this.checkRule(p.c) !== 'none';
    if (chk && this.attackedByEnemy(st, i, p.c)) return;
    [-1, 1].forEach(function (dir) {
      var j = i, n = 0, rook = -1, sx = dir * R[0], sy = dir * R[1];
      while (true) { j = g.step(j, sx, sy); if (j < 0) return; n++; if (b[j]) { rook = j; break; } }
      var rp = b[rook]; if (!rp || rp.c !== p.c || rp.m || !self.def(rp.t).castleRook || n < 3) return;
      var kt = g.step(g.step(i, sx, sy), sx, sy), rt = g.step(i, sx, sy);
      if (kt < 0 || rt < 0) return;
      if (chk && (self.attackedByEnemy(st, rt, p.c) || self.attackedByEnemy(st, kt, p.c))) return;
      out.push({ f: i, t: kt, p: p.t, c: p.c, cap: null, castle: { rf: rook, rt: rt } });
    });
  };
  P.gen = function (st) {
    var out = [], b = st.b, me = st.turn;
    for (var i = 0; i < b.length; i++) { var p = b[i]; if (p && p.c === me && !p.dead) this.genPiece(st, i, out); }
    /* neutral pieces a side may move (def.controlledBy: 'both' | 'w' | 'b') */
    for (var j = 0; j < b.length; j++) {
      var q = b[j]; if (!q || q.c !== 'n') continue; var cb = this.def(q.t).controlledBy;
      if (cb === 'both' || cb === me) { var tmp = []; var save = q.c; q.c = me; this.genPiece(st, j, tmp, true); q.c = save; tmp.forEach(function (m) { m.c = me; m.neutral = true; }); out.push.apply(out, tmp); }
    }
    if (this.rules.drops) {
      var hand = st.hands[me], seen = {}, g = this.geo;
      for (var h = 0; h < hand.length; h++) {
        var t = hand[h]; if (seen[t]) continue; seen[t] = 1; var pd = this.def(t);
        for (var s = 0; s < b.length; s++) {
          if (b[s] || !g.valid[s]) continue;
          if (pd.pawn) { var rr = g.relRow(s, me); if (rr === 0 || rr === g.depth(me) - 1) continue; }
          out.push({ f: -1, t: s, p: t, c: me, cap: null, drop: t });
        }
      }
    }
    if (this.hooks.moves) { var r = this.hooks.moves(this, st, out); if (r) out = r; }
    return out;
  };

  /* ---------------- making moves ---------------- */
  P.clone = function (st) {
    return { b: st.b.slice(), turn: st.turn, ep: -1, epv: -1, ply: st.ply, half: st.half, sub: st.sub || 0,
      hands: st.hands, checks: st.checks, score: st.score, out: st.out || {}, x: st.x ? Object.assign({}, st.x) : {}, start: st.start };
  };
  P.make = function (st, m) {
    var n = this.clone(st), b = n.b, me = st.turn, g = this.geo, r = this.rules;
    n.ply = st.ply + 1; n.half = st.half + 1;
    if (m.drop) {
      b[m.t] = this.piece(m.drop, me, { m: 1 });
      var hand = st.hands[me].slice(); hand.splice(hand.indexOf(m.drop), 1);
      n.hands = Object.assign({}, st.hands); n.hands[me] = hand;
    } else {
      var p = b[m.f], cap = m.cap;
      if (cap) b[m.capSq != null ? m.capSq : m.t] = null;
      b[m.f] = null;
      var np = p.m ? p : Object.assign({}, p, { m: 1 });
      if (m.neutral) np = p; /* neutral keeps its colour */
      if (m.promo) np = Object.assign({}, np, { t: m.promo, promoted: 1 });
      b[m.t] = np;
      if (m.castle) { var rp = b[m.castle.rf]; b[m.castle.rf] = null; b[m.castle.rt] = Object.assign({}, rp, { m: 1 }); }
      if (m.dbl != null && m.dbl >= 0) { n.ep = m.dbl; n.epv = m.t; }
      if (cap || this.def(m.p).pawn) n.half = 0;
      if (cap && r.drops && cap.c !== 'n' && !this.def(cap.t).royal && !this.def(cap.t).blocker) {
        n.hands = Object.assign({}, st.hands); n.hands[me] = st.hands[me].concat([cap.promoted ? 'P' : cap.t]);
      }
      if (cap && this.winTypes.points && cap.c !== 'n') {
        var pts = this.winTypes.points.values, pv = pts && pts[cap.t] != null ? pts[cap.t] : (this.def(cap.t).points != null ? this.def(cap.t).points : Math.round(this.def(cap.t).value / 100));
        n.score = Object.assign({}, st.score || {}); n.score[me] = (n.score[me] || 0) + pv;
      }
      if (cap && r.atomic) this._explode(b, m.t, r.atomic === true ? {} : r.atomic);
    }
    if (r.gravity) this.applyGravity(b, r.gravity);
    if (this.hooks.onMake) this.hooks.onMake(this, st, m, n);
    if (this.winTypes.nchecks) {
      var E = this.enemiesOf(me), hit = false;
      for (var e2 = 0; e2 < E.length && !hit; e2++) { var their = this.royals(n, E[e2]); for (var k = 0; k < their.length; k++) if (this.attacked(n, their[k], me)) { hit = true; break; } }
      if (hit) { n.checks = Object.assign({}, st.checks); n.checks[me] = (n.checks[me] || 0) + 1; }
    }
    /* turn order */
    var mpt = r.movesPerTurn, per = mpt ? (mpt[me] || 1) : 1, nx = this.nextTurn(n, me);
    if (per > 1 && (st.sub || 0) + 1 < per && !this.inCheck(n, nx)) { n.turn = me; n.sub = (st.sub || 0) + 1; }
    else { n.turn = nx; n.sub = 0; }
    return n;
  };
  P._explode = function (b, at, cfg) {
    var g = this.geo, rad = cfg.radius || 1, spare = cfg.spare || ['P'];
    b[at] = null;
    for (var dc = -rad; dc <= rad; dc++) for (var dr = -rad; dr <= rad; dr++) {
      if (!dc && !dr) continue;
      var c = g.col(at) + dc, rr = g.row(at) + dr; if (c < 0 || c >= g.files || rr < 0 || rr >= g.ranks) continue;
      var j = g.idx(c, rr), p = b[j]; if (!p) continue; var d = this.def(p.t);
      if (d.blocker || spare.indexOf(p.t) >= 0) continue; b[j] = null;
    }
  };
  /* gravity: { dir: 'down'|'up'|'left'|'right', exempt: ['P','K'] } ('down' = toward rank 1 / the bottom of White's view) */
  P.applyGravity = function (b, cfg) {
    var g = this.geo, dir = cfg.dir || 'down', ex = cfg.exempt || [], dc = 0, dr = 0;
    if (dir === 'down') dr = 1; else if (dir === 'up') dr = -1; else if (dir === 'left') dc = -1; else dc = 1;
    var order = []; for (var i = 0; i < b.length; i++) order.push(i);
    order.sort(function (x, y) { return dr ? (g.row(y) - g.row(x)) * dr : (g.col(y) - g.col(x)) * dc; });
    for (var k = 0; k < order.length; k++) {
      var s = order[k], p = b[s]; if (!p || ex.indexOf(p.t) >= 0 || this.def(p.t).blocker) continue;
      var j = s; while (true) { var nx = g.step(j, dc, dr); if (nx < 0 || b[nx]) break; j = nx; }
      if (j !== s) { b[j] = p; b[s] = null; }
    }
  };

  P.legal = function (st) {
    var me = st.turn, r = this.rules, ms = this.gen(st), out = [], E = this.enemiesOf(me), self = this;
    var hadRoyal = this.royals(st, me).length > 0, cr = this.checkRule(me);
    var enemyRoyals = function (n) { var c = 0; for (var e = 0; e < E.length; e++) c += self.royals(n, E[e]).length; return c; };
    var had = r.atomic ? enemyRoyals(st) : 0;
    for (var k = 0; k < ms.length; k++) {
      var m = ms[k];
      if (r.atomic && m.cap && !m.drop && this.def(m.p).royal) continue;  /* kings cannot capture in atomic */
      var n = m.n = this.make(st, m);
      var R = this.royals(n, me);
      if (r.atomic && hadRoyal && !R.length) continue;                    /* never blow up your own king */
      if (cr === 'none') { out.push(m); continue; }
      if (r.atomic && hadRoyal && enemyRoyals(n) < had) { out.push(m); continue; }  /* exploding the enemy king wins at once */
      if (hadRoyal && !R.length) continue;
      var bad = false;
      if (r.royalSafety === 'any') { bad = R.length > 0 && R.every(function (q) { return self.royalAttacked(n, q, me); }); }
      else for (var z = 0; z < R.length; z++) if (this.royalAttacked(n, R[z], me)) { bad = true; break; }
      if (!bad) out.push(m);
    }
    if (r.forcedCapture) { var caps = out.filter(function (m) { return m.cap; }); if (caps.length) out = caps; }
    if (this.hooks.filterMoves) { var f = this.hooks.filterMoves(this, st, out); if (f) out = f; }
    return out;
  };

  /* ---------------- results ---------------- */
  function countSide(V, st, c, nonRoyal) {
    var n = 0; for (var i = 0; i < st.b.length; i++) { var p = st.b[i]; if (p && p.c === c && !V.def(p.t).blocker && (!nonRoyal || !V.def(p.t).royal)) n++; } return n;
  }
  /* eliminate a player (multi-player): its pieces turn grey and dead (capturable obstacles), it stops taking turns */
  P.eliminate = function (st, c) {
    var n = this.clone(st); n.out = Object.assign({}, st.out || {}); n.out[c] = 1;
    n.b = n.b.map(function (p) { return p && p.c === c ? Object.assign({}, p, { c: 'n', dead: 1, was: c }) : p; });
    if (n.turn === c) n.turn = this.nextTurn(n, c);
    return n;
  };
  /* multi-player: which colour (if any) has just been knocked out in st? (no legal moves, or royal captured) */
  P.knockedOut = function (st, moves) {
    if (!this.multi) return null;
    var start = st.start || {}, self = this, out = st.out || {};
    for (var k = 0; k < this.colors.length; k++) { var c = this.colors[k]; if (!out[c] && start[c + 'Royal'] && !self.royals(st, c).length) return { c: c, why: 'king captured' }; }
    if (!moves.length && !out[st.turn]) return { c: st.turn, why: this.inCheck(st, st.turn) ? 'checkmated' : 'stalemated' };
    return null;
  };
  P.result = function (st, moves) {
    var W = this.winTypes, self = this;
    if (this.hooks.checkWin) { var h = this.hooks.checkWin(this, st, moves); if (h) return h; }
    var start = st.start || {};
    if (this.multi) {
      var teams = {}; this.alive(st).forEach(function (c) { teams[self.team[c]] = c; });
      var tk = Object.keys(teams);
      if (tk.length === 1) return { w: teams[tk[0]], team: tk[0], why: 'last one standing' };
      if (tk.length === 0) return { w: 'd', why: 'nobody is left' };
    }
    /* royal loss (capture variants, atomic, check:'none') */
    var lost = this.colors.filter(function (c) { return start[c + 'Royal'] && !(st.out && st.out[c]) && self.royals(st, c).length === 0; });
    if (!this.multi) {
      if (lost.length === 2) return { w: 'd', why: 'both kings are gone' };
      if (lost.length === 1) return { w: opp2(lost[0]), why: this.rules.atomic ? 'the king exploded' : 'the king was captured' };
    }
    if (W.nchecks) { var n = W.nchecks.n || 3; for (var ci0 = 0; ci0 < this.colors.length; ci0++) if ((st.checks[this.colors[ci0]] || 0) >= n) return { w: this.colors[ci0], why: n + ' checks' }; }
    if (W.points) { var tgt = W.points.target || 10; for (var ci1 = 0; ci1 < this.colors.length; ci1++) { var cc = this.colors[ci1]; if (((st.score || {})[cc] || 0) >= tgt) return { w: cc, why: 'reached ' + tgt + ' points' }; } }
    if (W.capture) {
      var cw = W.capture, list = Array.isArray(cw.pieces) ? cw.pieces : [cw.piece || 'K'], colors = cw.color ? [cw.color] : this.colors;
      for (var ci2 = 0; ci2 < colors.length; ci2++) {
        var col = colors[ci2], left = st.b.some(function (p) { return p && p.c === col && list.indexOf(p.t) >= 0; });
        var had = start['has_' + col + '_' + list.join('')];
        if (had !== false && !left) return { w: this.multi ? 'd' : opp2(col), why: cw.why || 'the target was captured' };
      }
    }
    if (W.survive) { var sv = W.survive, plies = sv.plies || (sv.moves || 20) * this.colors.length; if (st.ply >= plies) return { w: sv.color || 'w', why: sv.why || 'survived ' + (sv.moves || Math.round(plies / 2)) + ' moves' }; }
    if (W.reach) {
      var rc = W.reach, sqs = rc.squares === 'last_rank' || !rc.squares ? null : this.geo.parseList(rc.squares);
      for (var i = 0; i < st.b.length; i++) {
        var p = st.b[i]; if (!p || p.c === 'n' || (rc.piece && p.t !== rc.piece)) continue;
        var hit = sqs ? sqs.indexOf(i) >= 0 : this.geo.relRow(i, p.c) === this.geo.depth(p.c) - 1;
        if (hit && (!rc.color || rc.color === p.c) && p.c !== 'n') return { w: p.c, why: rc.why || 'reached the goal' };
      }
    }
    if (W.eliminate) {
      var e = W.eliminate;
      for (var ci = 0; ci < this.colors.length; ci++) {
        var c = this.colors[ci]; if (e.color && e.color !== c) continue;
        if (countSide(this, st, c, e.nonRoyal) === 0) return e.result === 'win' ? { w: c, why: 'ran out of pieces' } : { w: this.multi ? 'd' : opp2(c), why: e.why || 'all pieces were captured' };
      }
    }
    if (W.turns && st.ply >= W.turns.plies) return { w: W.turns.winner || 'd', why: W.turns.why || 'move limit reached' };
    if (!moves.length && !this.multi) {
      var o = opp2(st.turn);
      if (W.eliminate && W.eliminate.result === 'win') return { w: st.turn, why: 'no moves left' };
      if (this.royals(st, st.turn).length && this.inCheck(st, st.turn) && this.checkRule(st.turn) !== 'none') return { w: o, why: 'checkmate' };
      if (!countSide(this, st, st.turn)) return { w: o, why: 'no pieces left' };
      var sm = this.rules.stalemate;
      return sm === 'win' ? { w: st.turn, why: 'stalemate' } : sm === 'loss' ? { w: o, why: 'stalemate' } : { w: 'd', why: 'stalemate' };
    }
    if (st.half >= this.rules.drawPlies) return { w: 'd', why: 'move limit' };
    return null;
  };

  /* ---------------- evaluation (White's point of view, centipawns) ---------------- */
  P.evaluate = function (st) {
    var g = this.geo, b = st.b, v = 0, cx = (g.files - 1) / 2, cy = (g.ranks - 1) / 2, anti = this.winTypes.eliminate && this.winTypes.eliminate.result === 'win';
    for (var i = 0; i < b.length; i++) {
      var p = b[i]; if (!p || p.c === 'n' || p.c === '?') continue; var d = this.def(p.t); if (d.blocker) continue;
      var x = d.royal ? 0 : d.value;
      if (!d.royal) x += (cx - Math.abs(cx - g.col(i))) * 4 + (cy - Math.abs(cy - g.row(i))) * 3;
      if (d.pawn) x += g.relRow(i, p.c) * 8;
      v += p.c === 'w' ? x : -x;
    }
    if (anti) v = -v;
    if (this.winTypes.nchecks) v += ((st.checks.w || 0) - (st.checks.b || 0)) * 250;
    if (this.winTypes.points) v += (((st.score || {}).w || 0) - ((st.score || {}).b || 0)) * 120;
    if (this.rules.drops) { var self = this; ['w', 'b'].forEach(function (c) { var s = 0; st.hands[c].forEach(function (t) { s += self.def(t).value * 0.9; }); v += c === 'w' ? s : -s; }); }
    if (this.winTypes.reach) {
      var rc = this.winTypes.reach, sqs = rc.squares && rc.squares !== 'last_rank' ? g.parseList(rc.squares) : null;
      for (var j = 0; j < b.length; j++) {
        var q = b[j]; if (!q || q.c === 'n' || (rc.piece && q.t !== rc.piece)) continue;
        var dist = sqs ? Math.min.apply(null, sqs.map(function (s) { return g.dist(s, j); })) : g.depth(q.c) - 1 - g.relRow(j, q.c);
        v += (q.c === 'w' ? -1 : 1) * dist * 40;
      }
    }
    if (this.hooks.evaluate) v += this.hooks.evaluate(this, st) || 0;
    return v;
  };
  /* score from colour c's point of view (2 players: signed evaluate; more: own material minus the strongest rival) */
  P.evalFor = function (st, c) {
    if (!this.multi) { var e = this.evaluate(st); return c === 'w' ? e : -e; }
    var g = this.geo, b = st.b, mat = {}, self = this, cx = (g.files - 1) / 2, cy = (g.ranks - 1) / 2;
    this.colors.forEach(function (k) { mat[k] = (st.out && st.out[k]) ? -50000 : 0; });
    for (var i = 0; i < b.length; i++) {
      var p = b[i]; if (!p || p.dead || mat[p.c] == null) continue; var d = this.def(p.t); if (d.blocker) continue;
      mat[p.c] += (d.royal ? 0 : d.value) + (cx - Math.abs(cx - g.col(i))) * 2 + (cy - Math.abs(cy - g.row(i))) * 2;
    }
    this.colors.forEach(function (k) { if (!(st.out && st.out[k]) && self.inCheck(st, k)) mat[k] -= 60; mat[k] += ((st.score || {})[k] || 0) * 100; });
    var best = -Infinity; this.colors.forEach(function (k) { if (self.isEnemy(c, k) && mat[k] > best) best = mat[k]; });
    var v = mat[c] - (best === -Infinity ? 0 : best);
    if (this.hooks.evaluate) v += (this.hooks.evaluate(this, st, c) || 0) * (c === 'b' ? -1 : 1);
    return v;
  };

  /* ---------------- notation ---------------- */
  P.letter = function (t) { var d = this.def(t); return d.san != null ? d.san : (t.length === 1 ? t : t[0]); };
  P.san = function (st, m, moves, next) {
    var g = this.geo, s;
    if (m.drop) s = (this.def(m.drop).pawn ? '' : this.letter(m.drop)) + '@' + g.name(m.t);
    else if (m.castle) s = g.col(m.t) > g.col(m.f) ? 'O-O' : 'O-O-O';
    else {
      var d = this.def(m.p), cap = !!m.cap;
      if (d.pawn) s = (cap ? g.fileName(g.col(m.f)) + 'x' : '') + g.name(m.t);
      else {
        var others = (moves || []).filter(function (x) { return x !== m && x.f >= 0 && x.t === m.t && x.p === m.p && x.f !== m.f && !x.promo; }), dis = '';
        if (others.length) {
          var sameFile = others.some(function (x) { return g.col(x.f) === g.col(m.f); }), sameRank = others.some(function (x) { return g.row(x.f) === g.row(m.f); });
          dis = !sameFile ? g.fileName(g.col(m.f)) : !sameRank ? String(g.rank(m.f)) : g.name(m.f);
        }
        s = this.letter(m.p) + dis + (cap ? 'x' : '') + g.name(m.t);
      }
      if (m.promo) s += '=' + this.letter(m.promo);
    }
    if (next && this.checkRule(next.turn) !== 'none' && this.inCheck(next, next.turn)) {
      var mate = !this.legal(next).length;
      s += mate ? '#' : '+';
    }
    return s;
  };

  /* standard FEN, only meaningful for 8x8 standard-piece positions (used for Stockfish) */
  P.toFEN = function (st) {
    var g = this.geo, rows = [];
    for (var r = 0; r < g.ranks; r++) {
      var row = '', e = 0;
      for (var c = 0; c < g.files; c++) {
        var p = st.b[g.idx(c, r)];
        if (!p) { e++; continue; }
        if (e) { row += e; e = 0; }
        row += p.c === 'w' ? p.t : p.t.toLowerCase();
      }
      if (e) row += e; rows.push(row);
    }
    var cr = '';
    var K = function (c, side) {
      var ks = st.b.findIndex(function (p) { return p && p.t === 'K' && p.c === c && !p.m; });
      if (ks < 0) return false;
      var rsq = c === 'w' ? (side === 'k' ? 63 : 56) : (side === 'k' ? 7 : 0), rp = st.b[rsq];
      return rp && rp.t === 'R' && rp.c === c && !rp.m;
    };
    if (this.rules.castling) { if (K('w', 'k')) cr += 'K'; if (K('w', 'q')) cr += 'Q'; if (K('b', 'k')) cr += 'k'; if (K('b', 'q')) cr += 'q'; }
    return rows.join('/') + ' ' + st.turn + ' ' + (cr || '-') + ' ' + (st.ep >= 0 ? g.name(st.ep) : '-') + ' ' + st.half + ' ' + (Math.floor(st.ply / 2) + 1);
  };
  P.fromUCI = function (moves, u) {
    if (!u || u.length < 4) return null; var g = this.geo, f = g.parse(u.slice(0, 2)), t = g.parse(u.slice(2, 4)), pr = u[4];
    return moves.find(function (m) { return m.f === f && m.t === t && (pr ? m.promo === pr.toUpperCase() : !m.promo); }) || null;
  };

  CM.Variant = Variant;
})();
