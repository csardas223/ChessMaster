/* g3_odds: shared hooks for the group-3 "Challenges & Odds" videos that need custom rules on top of a ladder.
   One hook object serves many modes, so every feature is switched on per mode by params.g3 (list of names):
     ladder      params.levels (same format as g3_ladder: label, fen, opponent, bot, note) + lv.x (initial state.x)
                 advance 'fail' | 'win' | 'any' | 'none', unit, pickerLabel, statusPrefix, winText
     transform   params.cycle ['TP','TN','TB','TR','TQ']: a piece of a cycle type becomes the next type after it moves
     copycat     pieces with gen: 'copycat' move as the type the opponent moved last (state.x.last); any type before that
     explode     params.explode { TYPE: { shape: 'plus'|'square', radius, spare: ['K','Q'] } }: blast when that piece
                 captures or is captured (the explosive is consumed, kings are never hit, own pieces in range are)
     vent        impostor (gen: 'impostor') moves as a queen or teleports to a secret vent picked before the game
     spawn       infinite pawns. state.x.mode 'and' = move, then place a pawn; 'or' = move OR place (tap an empty
                 square). params.spawn { noRanks: [1], promote: true }  (rank numbers from White's side)
     nocapture   the player may never capture
     capall      with state.x.capall: checkmate only counts once the opponent has nothing but the king
     checkbadge  check counters drawn on the kings (3-check)
     blind       every piece is invisible to the player until the game ends (blindfold)
     twoboards   params.twoboards 'same_move' | 'same_type': two 8x8 games side by side on a 17x8 board (file i is a gap)
     camera      the viewport follows the last move (big boards)
   params.sf: true lets Stockfish play the mode (its rules stay standard for the bot's side).
   Rule hooks check the feature list and do nothing otherwise. */
(function () {
  'use strict';
  var CM = window.CM, U = CM.util;
  var active = null;              /* params of the mode being played (for the stockfishOk getter) */
  var cur = {}, attempts = {}, baseBot = {}, pick = null;

  function F(P) { return P && P._g3set ? P._g3set : (P ? (P._g3set = (P.g3 || []).reduce(function (o, k) { o[k] = 1; return o; }, {})) : {}); }
  function FV(V) { return F(V.cfg && V.cfg.params); }

  /* ---------- styles ---------- */
  function css() {
    if (document.getElementById('g3-odds-css')) return;
    var s = document.createElement('style'); s.id = 'g3-odds-css';
    s.textContent = [
      '.sq.g3-pick::after{content:"";position:absolute;inset:0;margin:auto;width:30%;height:30%;border-radius:50%;background:rgba(20,85,30,.38);pointer-events:none;z-index:3}',
      '.sq.g3-pick{cursor:pointer}',
      '.g3-vent{position:absolute;inset:14%;border-radius:6px;pointer-events:none;opacity:.9;z-index:1;',
      'background:repeating-linear-gradient(0deg,#5b5f66 0 3px,#2b2e33 3px 6px);box-shadow:inset 0 0 0 2px #1d1f22,0 0 0 2px rgba(220,40,40,.75)}',
      '.pc.g3-glitch{filter:drop-shadow(1.5px 0 0 rgba(255,0,200,.85)) drop-shadow(-1.5px 0 0 rgba(0,220,255,.75))}',
      '.g3-tb-hint{color:#c9c6c0;font-size:13px}'
    ].join('');
    document.head.appendChild(s);
  }

  /* ---------- square picking (vent placement, pawn placement) ---------- */
  function cancelPick() { if (pick) { pick.off(); pick = null; } }
  function pickSquare(ctx, allowed, prompt) {
    cancelPick();
    var G = ctx.game, gid = G.gid, set = {};
    allowed.forEach(function (i) { set[i] = 1; });
    return new Promise(function (res) {
      var board = document.getElementById('board');
      var stop = function (e) { var q = e.target.closest && e.target.closest('.sq'); if (!q) return; e.stopPropagation(); e.preventDefault(); };
      var click = function (e) {
        var q = e.target.closest && e.target.closest('.sq'); if (!q || q.dataset.i == null) return;
        e.stopPropagation(); e.preventDefault();
        if (G.gid !== gid) { cancelPick(); return; }
        var i = +q.dataset.i; if (!set[i]) { CM.sound.play('illegal'); return; }
        cancelPick(); G.render(); res(i);
      };
      board.addEventListener('pointerdown', stop, true);
      board.addEventListener('click', click, true);
      pick = { set: set, prompt: prompt, gid: gid, off: function () { board.removeEventListener('pointerdown', stop, true); board.removeEventListener('click', click, true); } };
      G.render();
      if (prompt) CM.gameUI.setStatus(prompt);
    });
  }

  /* ---------- ladder (same behaviour as g3_ladder, plus lv.x) ---------- */
  function levels(ctx) { return (ctx.params && ctx.params.levels) || []; }
  function key(ctx) { return ctx.spec.id; }
  function index(ctx) {
    var k = key(ctx), L = levels(ctx);
    if (cur[k] == null) { var s = CM.store.get('g3ladder.' + k, null); cur[k] = typeof s === 'number' && s >= 0 && s < L.length ? s : (ctx.params.start || 0); }
    return Math.max(0, Math.min(L.length - 1, cur[k]));
  }
  function setIndex(ctx, i) { var k = key(ctx); cur[k] = i; attempts[k] = 0; CM.store.set('g3ladder.' + k, i); drawPicker(ctx); }
  function drawPicker(ctx) {
    var L = levels(ctx); if (L.length < 2) return;
    var pane = document.getElementById('pane-info'); if (!pane) return;
    var box = pane.querySelector('.gpicker.g3ladder');
    if (!box) {
      var h = document.createElement('h2'); h.className = 'info__h g3ladder-h'; h.textContent = ctx.params.pickerLabel || 'Challenge level';
      box = document.createElement('div'); box.className = 'gpicker g3ladder'; box.setAttribute('role', 'group'); box.setAttribute('aria-label', h.textContent);
      box.style.padding = '8px 0 4px';
      var info = pane.querySelector('.info') || pane; info.appendChild(h); info.appendChild(box);
    }
    var on = index(ctx);
    box.innerHTML = L.map(function (lv, i) { return '<button type="button" data-lv="' + i + '" aria-pressed="' + (i === on) + '">' + U.esc(lv.label || String(i + 1)) + '</button>'; }).join('');
    box.onclick = function (e) { var b = e.target.closest('[data-lv]'); if (!b) return; setIndex(ctx, +b.dataset.lv); if (ctx.game && ctx.game.newGame) ctx.game.newGame(); };
  }
  function removePicker() {
    var pane = document.getElementById('pane-info'); if (!pane) return;
    Array.prototype.forEach.call(pane.querySelectorAll('.g3ladder, .g3ladder-h'), function (n) { n.remove(); });
  }
  function applyLevel(ctx) {
    var L = levels(ctx); if (!L.length) return;
    var k = key(ctx), lv = L[index(ctx)], spec = ctx.spec;
    if (!baseBot[k]) baseBot[k] = Object.assign({}, spec.bot);
    var bot = Object.assign({}, baseBot[k], lv.bot || {});
    Object.keys(spec.bot).forEach(function (x) { delete spec.bot[x]; });
    Object.assign(spec.bot, bot);
    var su = Object.assign({}, spec.setup, { fen: lv.fen || spec.setup.fen, x: Object.assign({}, spec.setup.x || {}, lv.x || {}) });
    if (lv.place) su.place = lv.place;
    if (lv.hands) su.hands = lv.hands;
    if (lv.moved) su.moved = lv.moved;
    ctx.state = CM.spec.initialState(ctx.V, Object.assign({}, spec, { setup: su }));
    var opp = Object.assign({}, spec.opponent, lv.opponent || {});
    if (lv.opponent && lv.opponent.rating != null && lv.opponent.elo == null) opp.elo = lv.opponent.rating;
    if (ctx.game && ctx.game.opponent) { Object.keys(ctx.game.opponent).forEach(function (x) { delete ctx.game.opponent[x]; }); Object.assign(ctx.game.opponent, opp); }
  }
  function ladderOver(ctx, over) {
    var L = levels(ctx); if (!L.length) return;
    var i = index(ctx), adv = ctx.params.advance || 'fail';
    var res = over.lost ? 'loss' : over.w === 'd' ? 'draw' : over.w === ctx.human ? 'win' : 'loss';
    if (adv === 'fail' && res === 'win') { ctx.toast(ctx.params.winText || ('Challenge complete with ' + (L[i].label || 'this setup') + '!'), 3200); return; }
    if (adv === 'win' && res !== 'win') { ctx.toast(ctx.params.endText || ('The run ends at ' + (L[i].label || 'this level') + '.'), 3200); return; }
    var step = adv === 'any' || (adv === 'fail' && res !== 'win') || (adv === 'win' && res === 'win');
    if (step && L.length > 1) {
      if (i + 1 < L.length) { setIndex(ctx, i + 1); ctx.toast('Next game: ' + (L[i + 1].label || 'level ' + (i + 2)) + '. Press New game.', 3200); }
      else if (ctx.params.maxText) ctx.toast(ctx.params.maxText, 3200);
    }
  }

  /* ---------- helpers ---------- */
  function playerColor(V) { var P = V.cfg.params || {}; return P.side || 'w'; }
  function other(c) { return c === 'w' ? 'b' : 'w'; }
  function nonKing(V, st, c) { for (var i = 0; i < st.b.length; i++) { var p = st.b[i]; if (p && p.c === c && !V.def(p.t).royal && !V.def(p.t).blocker) return true; } return false; }
  /* moves of piece p on square i as if it were type T (copycat, impostor) */
  function movesAs(V, st, i, p, T, out, keepType) {
    var b2 = st.b.slice(); b2[i] = { t: T, c: p.c, m: p.m };
    var st2 = Object.assign({}, st, { b: b2 }), tmp = [];
    V.genPiece(st2, i, tmp, true);
    tmp.forEach(function (m) { if (m.castle || m.ep) return; m.p = keepType; delete m.dbl; delete m.promo; out.push(m); });
  }

  /* ---------- two boards ---------- */
  var SUBV = null;
  function subV() { return SUBV || (SUBV = new CM.Variant({ board: { files: 8, ranks: 8 } })); }
  function big(k, si) { return ((si / 8) | 0) * 17 + (si % 8) + (k ? 9 : 0); }
  function sub(st, k) {
    var b = new Array(64); for (var si = 0; si < 64; si++) b[si] = st.b[big(k, si)] || null;
    var e = (st.x && st.x.tbep) || [-1, -1, -1, -1];
    return { b: b, turn: st.turn, ep: e[2 * k], epv: e[2 * k + 1], ply: st.ply, half: 0, sub: 0, hands: { w: [], b: [] }, checks: { w: 0, b: 0 }, score: { w: 0, b: 0 }, out: {}, x: {}, start: { wRoyal: true, bRoyal: true } };
  }
  function done(st) { return (st.x && st.x.tbdone) || [null, null]; }
  function live(st) { var d = done(st); return [0, 1].filter(function (k) { return !d[k]; }); }
  function mapMove(k, sm, list) {
    return { f: big(k, sm.f), t: big(k, sm.t), p: sm.p, c: sm.c, cap: sm.cap, capSq: sm.capSq != null ? big(k, sm.capSq) : undefined, promo: sm.promo,
      castle: sm.castle ? { rf: big(k, sm.castle.rf), rt: big(k, sm.castle.rt) } : undefined, tb: list };
  }
  function compose(V, st) {
    var S = subV(), mode = V.cfg.params.twoboards, me = st.turn, L = live(st), out = [];
    var leg = {}; L.forEach(function (k) { leg[k] = S.legal(sub(st, k)); });
    if (me === playerColor(V)) {
      if (L.length === 1) { var k0 = L[0]; leg[k0].forEach(function (sm) { out.push(mapMove(k0, sm, [[k0, sm]])); }); return out; }
      if (mode === 'same_move') {
        var idx = {}; leg[1].forEach(function (sm) { idx[sm.f + ',' + sm.t + ',' + (sm.promo || '')] = sm; });
        leg[0].forEach(function (sm) {
          var o = idx[sm.f + ',' + sm.t + ',' + (sm.promo || '')]; if (!o) return;
          var pair = [[0, sm], [1, o]];
          out.push(mapMove(0, sm, pair)); out.push(mapMove(1, o, pair));
        });
        return out;
      }
      /* same_type: two moves in a row (movesPerTurn w:2); second on the other board with the same piece type */
      var x = st.x || {};
      if ((st.sub || 0) === 1 && x.tbk != null) { var kk = 1 - x.tbk; leg[kk].forEach(function (sm) { if (sm.p === x.tbt) out.push(mapMove(kk, sm, [[kk, sm]])); }); return out; }
      [0, 1].forEach(function (k) {
        var types = {}; leg[1 - k].forEach(function (sm) { types[sm.p] = 1; });
        leg[k].forEach(function (sm) { if (types[sm.p]) out.push(mapMove(k, sm, [[k, sm]])); });
      });
      return out;
    }
    /* the bot: one move on every live board, as one compound move */
    if (L.length === 1) { var k1 = L[0]; leg[k1].forEach(function (sm) { out.push(mapMove(k1, sm, [[k1, sm]])); }); return out; }
    if (!leg[0].length || !leg[1].length) return out;
    leg[0].forEach(function (a) { leg[1].forEach(function (b) { out.push(mapMove(0, a, [[0, a], [1, b]])); }); });
    return out;
  }
  function hasLegal(S, s) {   /* early-exit legality test (cheaper than S.legal) */
    var ms = S.gen(s), me = s.turn;
    for (var i = 0; i < ms.length; i++) { if (ms[i].castle) continue; var n = S.make(s, ms[i]); if (!S.inCheck(n, me)) return true; }
    return S.legal(s).length > 0;
  }
  function tbMake(V, prev, m, n) {
    var S = subV(), e = ((prev.x && prev.x.tbep) || [-1, -1, -1, -1]).slice();
    (m.tb || []).forEach(function (pr) {
      var k = pr[0], sm = pr[1], ns = sm.n || S.make(sub(prev, k), sm);
      for (var si = 0; si < 64; si++) n.b[big(k, si)] = ns.b[si];
      e[2 * k] = ns.ep; e[2 * k + 1] = ns.epv;
    });
    n.x.tbep = e;
    var mode = V.cfg.params.twoboards, me = prev.turn, pc = playerColor(V);
    if (mode === 'same_type' && me === pc && (prev.sub || 0) === 0) { var f = m.tb[0]; n.x.tbk = f[0]; n.x.tbt = f[1].p; return; }
    n.x.tbk = null; n.x.tbt = null;
    /* after a completed turn: has the opponent run out of moves on some board? */
    var d = done(prev).slice(), nx = other(me), cnt = 0;
    live(prev).forEach(function (k) {
      var s2 = sub({ b: n.b, x: n.x, ply: n.ply }, k); s2.turn = nx;
      if (!hasLegal(S, s2)) { d[k] = S.inCheck(s2, nx) ? me : 'd'; cnt++; }
    });
    if (cnt) n.x.tbdone = d;
  }
  function tbResult(V, st, moves) {
    var d = done(st), pc = playerColor(V), bc = other(pc), mode = V.cfg.params.twoboards;
    if (d[0] === bc || d[1] === bc) return { w: bc, why: 'checkmated on the ' + (d[0] === bc ? 'left' : 'right') + ' board' };
    if (mode === 'same_type' && (d[0] || d[1])) {
      if (d[0] === pc && d[1] === pc) return { w: pc, why: 'checkmate on both boards with the same piece type' };
      if (d[0] === 'd' || d[1] === 'd') return { w: 'd', why: 'stalemate on one board' };
      return { w: bc, why: 'checkmate on only one board - both had to fall on the same move' };
    }
    if (d[0] && d[1]) {
      if (d[0] === pc && d[1] === pc) return { w: pc, why: 'checkmate on both boards' };
      return { w: 'd', why: 'one board ended in stalemate' };
    }
    if (!moves.length) {
      if (st.turn === pc) return { w: bc, why: mode === 'same_move' ? 'no move is legal on both boards' : 'no piece type can move on both boards' };
      return { w: 'd', why: 'no moves' };
    }
    return null;
  }

  /* ---------- the hook object ---------- */
  var H = {
    get stockfishOk() { return !!(active && active.sf); },

    /* named generators */
    copycat: function (V, st, i, p, out) {
      var last = st.x && st.x.last, T = last ? [last] : ((V.cfg.params.copyTypes) || ['P', 'N', 'B', 'R', 'Q', 'K']);
      var seen = {};
      T.forEach(function (t) {
        var tmp = []; movesAs(V, st, i, p, t, tmp, p.t);
        tmp.forEach(function (m) { var k = m.t + (m.cap ? 'x' : ''); if (seen[k]) return; seen[k] = 1; m.as = t; out.push(m); });
      });
    },
    impostor: function (V, st, i, p, out) {
      movesAs(V, st, i, p, 'Q', out, p.t);
      var v = st.x && st.x.vent;
      if (v == null || v < 0 || v === i || V._g3hideVent) return;
      var q = st.b[v];
      if (q && (q.c === p.c || q.probe)) { if (q.probe) out.push({ f: i, t: v, p: p.t, c: p.c, cap: q, capSq: v, vent: 1 }); return; }
      if (q && !V.canCapture(p, q)) return;
      out.push({ f: i, t: v, p: p.t, c: p.c, cap: q || null, capSq: q ? v : undefined, vent: 1 });
    },

    moves: function (V, st, out) {
      var f = FV(V);
      if (f.twoboards) return [];
      if (f.spawn && st.x && st.x.mode === 'or' && st.turn === playerColor(V)) {
        var g = V.geo, sp = V.cfg.params.spawn || {}, no = sp.noRanks || [], me = st.turn, depth = g.depth(me);
        for (var s = 0; s < st.b.length; s++) {
          if (st.b[s] || !g.valid[s]) continue;
          var rr = g.relRow(s, me); if (no.indexOf(rr + 1) >= 0) continue;
          if (rr === depth - 1) { if (sp.promote !== false) ['Q', 'R', 'B', 'N'].forEach(function (t) { out.push({ f: -1, t: s, p: 'P', c: me, cap: null, drop: 'P', promo: t, place: 1 }); }); continue; }
          out.push({ f: -1, t: s, p: 'P', c: me, cap: null, drop: 'P', place: 1 });
        }
      }
      return out;
    },
    filterMoves: function (V, st, legal) {
      var f = FV(V);
      if (f.twoboards) return compose(V, st).map(function (m) {   /* lazy next state: the search only builds the children it visits */
        var nx = null; Object.defineProperty(m, 'n', { configurable: true, enumerable: false, get: function () { return nx || (nx = V.make(st, m)); }, set: function (v) { nx = v; } }); return m;
      });
      if (f.nocapture && st.turn === playerColor(V)) return legal.filter(function (m) { return !m.cap; });
      return null;
    },
    onMake: function (V, prev, m, n) {
      var f = FV(V), P = V.cfg.params;
      if (f.twoboards) { tbMake(V, prev, m, n); return; }
      if (f.spawn && m.place) {
        n.hands = { w: [], b: [] };
        var g = V.geo; n.b[m.t] = V.piece(m.promo || 'P', m.c, { m: g.relRow(m.t, m.c) === 1 ? 0 : 1, promoted: m.promo ? 1 : 0 });
      }
      if (f.transform && !m.drop) {
        var cyc = P.cycle || [], k = cyc.indexOf(m.p);
        if (k >= 0 && n.b[m.t] && n.b[m.t].t === m.p) n.b[m.t] = Object.assign({}, n.b[m.t], { t: cyc[(k + 1) % cyc.length] });
      }
      if (f.copycat && prev.turn !== (P.copyOwner || playerColor(V))) n.x.last = m.castle ? 'K' : (m.drop ? 'P' : m.p);
      if (f.explode && m.cap && !m.drop) {
        var E = P.explode || {}, cfg = E[m.p] || E[m.cap.t];
        if (cfg) { blast(V, n.b, m.t, cfg); n.x.boom = m.t; }
      }
    },
    checkWin: function (V, st, moves) {
      var f = FV(V);
      if (f.twoboards) return tbResult(V, st, moves);
      var pc = playerColor(V), bc = other(pc);
      if (f.nocapture && st.turn === pc && !moves.length && !V.inCheck(st, pc)) return { w: bc, why: 'only captures were left, and capturing is banned' };
      if (f.capall && st.x && st.x.capall && st.turn === bc && !moves.length && V.inCheck(st, bc) && nonKing(V, st, bc)) return { w: bc, why: 'checkmate came before every piece was captured - challenge failed' };
      return null;
    },

    /* ---------- game hooks ---------- */
    init: function (ctx) { css(); active = ctx.params; attempts[key(ctx)] = 0; drawPicker(ctx); if (F(ctx.params).twoboards || F(ctx.params).vent) ctx.V._g3hideVent = false; },
    setup: function (ctx) { cancelPick(); active = ctx.params; applyLevel(ctx); ctx.V._g3hideVent = false; },
    onStart: function (ctx) {
      var L = levels(ctx), lv = L[index(ctx)], k = key(ctx), f = F(ctx.params);
      attempts[k] = (attempts[k] || 0) + 1;
      if (lv && L.length > 1) ctx.toast((ctx.params.unit ? '' : 'Level: ') + (lv.label || '') + (lv.note ? '. ' + lv.note : ''), 2200);
      if (f.vent && (ctx.x.vent == null || ctx.x.vent < 0)) {
        var g = ctx.geo, sq = ctx.emptySquares(function (i) { return g.relRow(i, ctx.human) < (ctx.params.ventRows || 4); });
        pickSquare(ctx, sq, 'Pick a secret vent square on your half of the board.').then(function (v) {
          ctx.setX('vent', v); ctx.sound('notify'); ctx.toast('Vent placed. Your impostor can vent there as a move; the engine does not know where it is.', 3200); ctx.refresh();
        });
      }
      if (f.blind) ctx.toast('Blindfold: your board shows no pieces. Click squares to move from memory.', 3200);
    },
    beforeMove: function (ctx, m) {
      if (pick) return false;
      return true;
    },
    afterMove: function (ctx, m, info) {
      var f = F(ctx.params), P = ctx.params;
      if (f.vent) ctx.V._g3hideVent = info.by === 'player';
      if (f.vent && m.vent) { ctx.fx({ type: 'flash', at: info.toName, color: '#d0312d', opacity: 0.45, duration_ms: 420 }); ctx.toast('Vented!', 1200); }
      if (f.transform && P.cycle && P.cycle.indexOf(m.p) >= 0) ctx.fx({ type: 'piece_transform', at: info.toName, style: 'flash', duration_ms: 360 });
      if (f.explode && m.cap && ctx.x.boom === m.t) {
        var E = P.explode || {}, cfg = E[m.p] || E[m.cap.t];
        ctx.fx({ type: 'explosion', at: info.toName, radius: cfg.radius || 1, sound: 'explosion' });
      }
      if (f.spawn && info.by === 'player' && ctx.x.mode === 'and' && !m.place) return placePawn(ctx);
      return null;
    },
    decorate: function (ctx, sq, p) {
      var f = F(ctx.params), o = null;
      if (pick && pick.set[sq] && pick.gid === ctx.game.gid) o = { cls: 'g3-pick' };
      if (f.vent && ctx.x.vent === sq) o = Object.assign(o || {}, { html: '<span class="g3-vent" title="your secret vent"></span>' });
      if (f.blind && p && !ctx.over) return Object.assign(o || {}, { hidePiece: true });
      if (f.checkbadge && p && p.t === 'K') { var c = (ctx.state.checks || {})[other(p.c)] || 0; if (c) return Object.assign(o || {}, { badge: String(c) }); }
      return o;
    },
    camera: function (ctx) { var l = ctx.last; return l && l.t >= 0 ? l.t : ctx.resolveSquare('player_king'); },
    status: function (ctx) {
      var f = F(ctx.params), L = levels(ctx), lv = L[index(ctx)], s = '';
      if (pick && pick.prompt) return pick.prompt;
      if (lv && L.length) {
        var a = attempts[key(ctx)] || 1, adv = ctx.params.advance || 'fail';
        s = (ctx.params.statusPrefix || (L.length > 1 ? 'Game ' + (index(ctx) + 1) + ': ' : '')) + (lv.label || '');
        if (adv === 'none' || a > 1) s += ' (attempt ' + a + ')';
      }
      var add = '';
      if (f.copycat) { var last = ctx.x.last; add = last ? 'Copycat moves like a ' + ({ P: 'pawn', N: 'knight', B: 'bishop', R: 'rook', Q: 'queen', K: 'king' }[last] || last) : 'First move: the copycat may move like any piece'; }
      if (f.spawn) add = ctx.x.mode === 'or' ? 'Move a piece, or tap an empty square to place a pawn' : 'Move, then place a pawn';
      if (f.twoboards && ctx.params.twoboards === 'same_type') add = (ctx.state.sub === 1 && ctx.x.tbt) ? 'Now move a ' + ({ P: 'pawn', N: 'knight', B: 'bishop', R: 'rook', Q: 'queen', K: 'king' }[ctx.x.tbt]) + ' on the other board' : 'Move any piece; then the same piece type on the other board';
      if (f.twoboards && ctx.params.twoboards === 'same_move') add = 'Your move is played on both boards';
      if (f.nocapture) add = 'Capturing is banned for you';
      if (f.capall && ctx.x.capall) add = 'Capture every piece first, then checkmate';
      return s && add ? s + ' · ' + add : (s || add);
    },
    onGameOver: function (ctx, over) { cancelPick(); ladderOver(ctx, over); },
    onUndo: function (ctx) { cancelPick(); ctx.V._g3hideVent = false; },
    onExit: function () { cancelPick(); removePicker(); active = null; }
  };

  function blast(V, b, at, cfg) {
    var g = V.geo, r = cfg.radius || 1, spare = cfg.spare || ['K'], c0 = g.col(at), r0 = g.row(at);
    b[at] = null;
    for (var dc = -r; dc <= r; dc++) for (var dr = -r; dr <= r; dr++) {
      if (!dc && !dr) continue;
      if (cfg.shape === 'plus' && dc && dr) continue;
      var c = c0 + dc, rr = r0 + dr; if (c < 0 || c >= g.files || rr < 0 || rr >= g.ranks) continue;
      var j = g.idx(c, rr), p = b[j]; if (!p) continue; var d = V.def(p.t);
      if (d.royal || d.blocker || spare.indexOf(p.t) >= 0) continue;
      b[j] = null;
    }
  }

  function placePawn(ctx) {
    var g = ctx.geo, sp = ctx.params.spawn || {}, no = sp.noRanks || [], me = ctx.human, depth = g.depth(me);
    var sqs = ctx.emptySquares(function (i) { return no.indexOf(g.relRow(i, me) + 1) < 0; });
    if (!sqs.length) return null;
    return pickSquare(ctx, sqs, 'Place a pawn on any highlighted square.').then(function (i) {
      var rr = g.relRow(i, me);
      var put = function (t) { ctx.set(i, ctx.piece(t, me, { m: rr === 1 ? 0 : 1, promoted: t !== 'P' ? 1 : 0 })); ctx.sound(t !== 'P' ? 'promote' : 'move-self'); ctx.fx({ type: 'flash', at: g.name(i), color: '#d64545', opacity: 0.35, duration_ms: 380 }); };
      if (rr === depth - 1 && sp.promote !== false) {
        var ch = ['Q', 'N', 'R', 'B'];
        return CM.gameUI.promote(i, ch.map(function (t) { return { type: t, src: ctx.game.pieceImage({ t: t, c: me }) }; })).then(function (t) { put(t || 'Q'); });
      }
      put('P');
    });
  }

  /* 'or' mode: tapping an empty square (with nothing selected) places a pawn there */
  document.addEventListener('click', function (e) {
    var G = CM.gameUI && CM.gameUI.controller; if (!G || !G.hooks || G.hooks !== H || pick) return;
    if (!F(G.spec.params).spawn || !G.state || !G.state.x || G.state.x.mode !== 'or') return;
    var q = e.target.closest && e.target.closest('#board .sq'); if (!q || q.dataset.i == null) return;
    if (G.over || G.busy || G.state.turn !== G.human || G.sel >= 0) return;
    var i = +q.dataset.i; if (G.state.b[i]) return;
    var c = G.moves.filter(function (m) { return m.place && m.t === i; }); if (!c.length) return;
    e.stopPropagation(); e.preventDefault();
    if (c.length === 1) { G.commit(c[0], {}); return; }
    CM.gameUI.promote(i, c.map(function (m) { return { type: m.promo, src: G.pieceImage({ t: m.promo, c: G.human }) }; })).then(function (t) {
      var m = c.find(function (x) { return x.promo === t; }); if (m && G.state.turn === G.human) G.commit(m, {});
    });
  }, true);

  CM.defineHooks('g3_odds', H);
})();
