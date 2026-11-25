/* g4_cu: shared rules for the Chess Ultimate videos (group 4: CxtttdnwNWk, F0nfkeR-QEg, FxpWhTj2Cv4, ehlf0_asIKo,
   onr_ABfEMGk, pPQDMtvu5rk, w4L_Obw74dE, wwVvGHfEfPI, 1_FSHqyc904). Chess Ultimate is a Steam game where each player
   drafts a point-budget army of cartoon characters; win by checkmating the enemy King.
   Characters with special rules are implemented here (rule hooks are pure: no randomness, no DOM):
     Checker     fmF, captures by jumping an adjacent diagonal-forward enemy (single jump), promotes to CheckerKing
     Mage        king step, or swap places with any ally (move onto the ally)
     Sludge      orthogonal up to 2, never captures; leaves goop on the squares it leaves/passes; an enemy that
                 ends a move on goop, or captures the Sludge, is knocked out
     Berserker   queen lines limited to radius 1 + knockouts it has made
     Ghost       king step; hidden from the opponent unless it captured last move or is next to the enemy King/Jester
     Penguin     king step; after it moves, every adjacent character (not penguins) is frozen while it stays adjacent
     Parasite    king step; capturing a non-royal takes it over (the target turns to your side, parasite is spent);
                 a piece that captures the parasite from an adjacent square is taken over instead
     Devil       king step, or spawn a Minion on an empty square within 2 (the devil then sleeps 1 turn)
     Sniper      steps 1 left/right; or shoots the first character straight ahead (stays put, sleeps 1 turn)
     Bomb        up to 2 in any line; when it captures or is captured everything within 1 square is knocked out
     Angel       king step, or attach to an ally: the angel disappears and the ally gets a shield (one extra life:
                 a capture of a shielded piece only removes the shield and the attacker stays where it was)
     Fisherman   king step, or pull the first non-royal piece along one of 8 lines (2+ squares away) next to itself
   Plain Betza pieces are declared in each mode file (Turtle W, Knight N, Bishop B, Rook R, Queen Q, Ninja WDHFAG,
   Jester K (shown to the opponent as a King), Prince K, Dragon BN).
     Giant       (cu2 2026-11-25, as the game's tutorial shows it: M0Nr98Axpo8 1:01-1:06 "THE GIANT TAKES UP 4 SQUARES! THE
                 GIANT MOVES IN STRAIGHT LINES 4 SQUARES AT A TIME!" / "CAN KNOCK OUT UP TO 4 CHARACTERS IN ONE ATTACK!", frame
                 research/frames/video_thumbs/M0Nr98Axpo8_frame_66.jpg: a 2x2 body; the highlighted targets are the four 2x2
                 blocks right next to it, up/down/left/right, no diagonals). Here: a 2x2 block = an anchor piece 'Giant' plus
                 three 'Giant' parts (prop gp: 1, same gid), drawn as one double-size token. It moves by one block (2 squares)
                 orthogonally onto a block holding no ally, knocking out every enemy in it (up to 4). Taking ANY of its four
                 squares knocks the whole Giant out (inferred: the game treats it as one character). A Giant placed on one
                 square by a setup grows into its 2x2 block (to its owner's right and forward, else the first free
                 orientation; setup hook / CM.g4cuGiant.expand). Not modelled: angel shields on it, Mage swap / Fisherman
                 pull / Angel attach / Parasite take-over with a Giant (excluded).
   Move flags used here: swap, stay, pull/pullTo, attach, spawn.  Piece props: k (kills), zz (asleep until), fz (frozen
   by penguin at square), sh (shield), rv (ghost revealed). */
(function () {
  'use strict';
  var CM = window.CM;
  var DIR8 = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];

  function enemy(V, a, b) { return b && a && V.isEnemy(a.c, b.c); }
  function kstep(V, st, i, p, out) {
    var g = V.geo;
    DIR8.forEach(function (d) {
      var j = g.step(i, d[0], d[1]); if (j < 0) return; var q = st.b[j];
      if (!q) out.push({ f: i, t: j, p: p.t, c: p.c, cap: null });
      else if (enemy(V, p, q) && V.canCapture(p, q)) out.push({ f: i, t: j, p: p.t, c: p.c, cap: q, capSq: j });
    });
  }
  function fwd(V, c) { var fr = V.geo.FR(c); return fr.F; }   /* screen [dc, dr] of forward */
  function asleep(st, p) { return p && p.zz != null && st.ply <= p.zz; }
  function frozen(V, st, i, p) {
    if (!p || p.fz == null || p.t === 'Penguin') return false;
    var q = st.b[p.fz]; return !!(q && q.t === 'Penguin' && V.geo.dist(i, p.fz) <= 1);
  }

  /* ---- cu2: the 2x2 Giant ---- */
  function isGiant(q) { return !!(q && q.t === 'Giant'); }
  function gblock(st, i) {   /* squares of the Giant at i (anchor or part), anchor first */
    var p = st.b[i]; if (!isGiant(p)) return [];
    if (p.gid == null) return [i];
    var a = -1, o = [];
    for (var j = 0; j < st.b.length; j++) { var q = st.b[j]; if (isGiant(q) && q.gid === p.gid && q.c === p.c) { if (q.gp) o.push(j); else a = j; } }
    return a >= 0 ? [a].concat(o) : o;
  }
  var GID = 0;
  function expand(V, b) {
    var g = V.geo, used = {};
    b.forEach(function (q) { if (isGiant(q) && q.gid != null) used[q.gid] = 1; });
    for (var i = 0; i < b.length; i++) {
      var p = b[i]; if (!isGiant(p) || p.gid != null || p.gp) continue;
      var fr = g.FR(p.c), opts = [[1, 1], [-1, 1], [1, -1], [-1, -1]], got = null;
      for (var k = 0; k < opts.length && !got; k++) {
        var r = opts[k][0], f = opts[k][1];
        var sx = [r * fr.R[0], r * fr.R[1]], fy = [f * fr.F[0], f * fr.F[1]];
        var a1 = g.step(i, sx[0], sx[1]), a2 = g.step(i, fy[0], fy[1]), a3 = a2 >= 0 ? g.step(a2, sx[0], sx[1]) : -1;
        if (a1 >= 0 && a2 >= 0 && a3 >= 0 && !b[a1] && !b[a2] && !b[a3]) got = [a1, a2, a3];
      }
      do { GID++; } while (used[GID]); used[GID] = 1;
      b[i] = Object.assign({}, p, { gid: GID, gn: got ? 4 : 1 });
      if (got) got.forEach(function (j) { b[j] = { t: 'Giant', c: p.c, m: 1, gp: 1, gid: GID }; });
    }
    return b;
  }
  /* a Giant missing a square (taken, exploded) is knocked out whole */
  function clean(V, b) {
    var seen = {};
    for (var i = 0; i < b.length; i++) { var q = b[i]; if (isGiant(q) && q.gid != null) { var k = q.c + q.gid; seen[k] = seen[k] || { n: 0, a: null }; seen[k].n++; if (!q.gp) seen[k].a = q; } }
    for (var j = 0; j < b.length; j++) { var p = b[j]; if (!isGiant(p) || p.gid == null) continue; var s2 = seen[p.c + p.gid]; if (!s2.a || s2.n < (s2.a.gn || 1)) b[j] = null; }
  }
  CM.g4cuGiant = { expand: expand, block: gblock };

  var H = {
    cuChecker: function (V, st, i, p, out) {
      var g = V.geo, F = fwd(V, p.c), king = p.t === 'CheckerKing';
      var dirs = [[1, 1], [-1, 1]].concat(king ? [[1, -1], [-1, -1]] : []);
      dirs.forEach(function (d) {
        /* d = [right, forward] in the owner's frame -> screen */
        var fr = g.FR(p.c), dc = d[0] * fr.R[0] + d[1] * fr.F[0], dr = d[0] * fr.R[1] + d[1] * fr.F[1];
        var j = g.step(i, dc, dr); if (j < 0) return; var q = st.b[j];
        if (!q) { out.push({ f: i, t: j, p: p.t, c: p.c, cap: null }); return; }
        if (!enemy(V, p, q) || !V.canCapture(p, q)) return;
        var k = g.step(j, dc, dr); if (k < 0 || (st.b[k] && !st.b[k].probe)) return;
        out.push({ f: i, t: k, p: p.t, c: p.c, cap: q, capSq: j });
      });
      void F;
    },
    cuGiant: function (V, st, i, p, out) {
      if (p.gp) return;
      var g = V.geo, blk = gblock(st, i), cs = blk.map(function (j) { return g.col(j); }), rs = blk.map(function (j) { return g.row(j); });
      var w = Math.max.apply(null, cs) - Math.min.apply(null, cs) + 1, h = Math.max.apply(null, rs) - Math.min.apply(null, rs) + 1;
      [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) {
        var dx = d[0] * w, dy = d[1] * h, dest = [], cap = null, capSq = -1, ok = true;
        blk.forEach(function (j) {
          if (!ok) return; var k = g.step(j, dx, dy); if (k < 0) { ok = false; return; }
          var q = st.b[k]; dest.push(k);
          if (q && !q.probe && (!enemy(V, p, q) || !V.canCapture(p, q))) { ok = false; return; }
          if (q && !cap) { cap = q; capSq = k; }
        });
        if (!ok) return;
        var mv = { f: i, t: dest[0], p: p.t, c: p.c, cap: cap, giant: [dx, dy] };
        if (cap) mv.capSq = capSq;
        out.push(mv);
      });
    },
    cuMage: function (V, st, i, p, out) {
      kstep(V, st, i, p, out);
      for (var j = 0; j < st.b.length; j++) { var q = st.b[j]; if (j !== i && q && q.c === p.c && !V.def(q.t).blocker && !isGiant(q)) out.push({ f: i, t: j, p: p.t, c: p.c, cap: null, swap: 1 }); }
    },
    cuBerserker: function (V, st, i, p, out) {
      var g = V.geo, r = 1 + (p.k || 0);
      DIR8.forEach(function (d) {
        var j = i;
        for (var s = 0; s < r; s++) {
          j = g.step(j, d[0], d[1]); if (j < 0) break; var q = st.b[j];
          if (!q) { out.push({ f: i, t: j, p: p.t, c: p.c, cap: null }); continue; }
          if (enemy(V, p, q) && V.canCapture(p, q)) out.push({ f: i, t: j, p: p.t, c: p.c, cap: q, capSq: j });
          break;
        }
      });
    },
    cuDevil: function (V, st, i, p, out) {
      kstep(V, st, i, p, out);
      var g = V.geo;
      for (var dc = -2; dc <= 2; dc++) for (var dr = -2; dr <= 2; dr++) {
        if (!dc && !dr) continue; var j = g.step(i, dc, dr); if (j < 0 || st.b[j]) continue;
        if (Math.max(Math.abs(dc), Math.abs(dr)) === 1) continue; /* adjacent empty squares are normal steps */
        out.push({ f: i, t: j, p: p.t, c: p.c, cap: null, stay: 1, spawn: 'Minion' });
      }
    },
    cuSniper: function (V, st, i, p, out) {
      var g = V.geo, fr = g.FR(p.c);
      [1, -1].forEach(function (s) { var j = g.step(i, s * fr.R[0], s * fr.R[1]); if (j >= 0 && !st.b[j]) out.push({ f: i, t: j, p: p.t, c: p.c, cap: null }); });
      var j = i;
      while (true) {
        j = g.step(j, fr.F[0], fr.F[1]); if (j < 0) break; var q = st.b[j]; if (!q) continue;
        if (q.probe || (enemy(V, p, q) && V.canCapture(p, q))) out.push({ f: i, t: j, p: p.t, c: p.c, cap: q, capSq: j, stay: 1 });
        break;
      }
    },
    cuAngel: function (V, st, i, p, out) {
      kstep(V, st, i, p, out);
      for (var j = 0; j < st.b.length; j++) { var q = st.b[j]; if (j !== i && q && q.c === p.c && !q.sh && q.t !== 'Angel' && !V.def(q.t).blocker && !isGiant(q)) out.push({ f: i, t: j, p: p.t, c: p.c, cap: null, attach: 1 }); }
    },
    cuFisherman: function (V, st, i, p, out) {
      kstep(V, st, i, p, out);
      var g = V.geo;
      DIR8.forEach(function (d) {
        var j = g.step(i, d[0], d[1]); if (j < 0 || st.b[j]) return; var next = j;
        while (true) {
          var k = g.step(j, d[0], d[1]); if (k < 0) return; var q = st.b[k];
          if (q) { if (!q.probe && !V.def(q.t).royal && !V.def(q.t).blocker && !isGiant(q)) out.push({ f: i, t: k, p: p.t, c: p.c, cap: null, pull: 1, pullTo: next }); return; }
          j = k;
        }
      });
    },

    /* sleeping / frozen pieces cannot move */
    moves: function (V, st, out) {
      return out.filter(function (m) { if (m.f < 0) return true; var p = st.b[m.f]; return !asleep(st, p) && !frozen(V, st, m.f, p); });
    },

    onMake: function (V, st, m, n) {
      if (m.f < 0) return;
      H._onMake(V, st, m, n);
      clean(V, n.b);
    },
    _onMake: function (V, st, m, n) {
      var g = V.geo, b = n.b, mover = st.b[m.f], me = mover.c, at = m.t;
      if (m.giant) {   /* the whole 2x2 block steps over; everything in the new block is knocked out */
        var blk = gblock(st, m.f);
        blk.forEach(function (j) { b[j] = null; });
        blk.forEach(function (j) { var k = g.step(j, m.giant[0], m.giant[1]); b[k] = Object.assign({}, st.b[j], { m: 1 }); });
        return;
      }
      var moved = Object.assign({}, b[m.t] || mover);
      if (m.swap) { b[m.f] = Object.assign({}, st.b[m.t], { m: 1 }); b[m.t] = moved; return; }
      if (m.attach) { b[m.f] = null; b[m.t] = Object.assign({}, st.b[m.t], { sh: 1 }); return; }
      if (m.pull) { b[m.f] = moved; b[m.t] = null; b[m.pullTo] = Object.assign({}, st.b[m.t], { m: 1 }); return; }
      if (m.stay) {
        moved.zz = n.ply + 1; b[m.f] = moved; at = m.f;
        b[m.t] = m.spawn ? V.piece(m.spawn, me, { m: 1 }) : null;
      }
      var cap = m.cap, cs = m.capSq != null ? m.capSq : m.t;
      /* angel shield: the hit only removes the shield; the attacker stays where it started */
      if (cap && cap.sh) {
        b[cs] = Object.assign({}, cap, { sh: 0 });
        if (!m.stay) { b[m.f] = mover; if (cs !== m.t) b[m.t] = null; }
        return;
      }
      /* bomb */
      if (cap && (cap.t === 'Bomb' || mover.t === 'Bomb')) {
        for (var dc = -1; dc <= 1; dc++) for (var dr = -1; dr <= 1; dr++) { var j = (dc || dr) ? g.step(cs, dc, dr) : cs; if (j >= 0 && b[j] && !V.def(b[j].t).blocker) b[j] = null; }
        if (mover.t === 'Bomb' && !m.stay) b[m.t] = null;
        return;
      }
      /* parasite */
      if (cap && mover.t === 'Parasite' && !V.def(cap.t).royal && !isGiant(cap)) { b[m.t] = Object.assign({}, cap, { c: me, m: 1, sh: 0 }); return; }
      if (cap && cap.t === 'Parasite' && !m.stay && g.dist(m.f, m.t) === 1 && !V.def(mover.t).royal && !isGiant(mover)) { b[m.t] = Object.assign({}, moved, { c: cap.c }); return; }
      /* sludge: attacking it knocks the attacker out */
      if (cap && cap.t === 'Sludge' && !m.stay) { b[m.t] = null; return; }
      if (cap && mover.t === 'Berserker') { moved.k = (mover.k || 0) + 1; b[m.t] = moved; }
      if (mover.t === 'Ghost') { var gh = Object.assign({}, b[m.t]); gh.rv = cap ? n.ply : null; b[m.t] = gh; }
      /* goop */
      var goop = st.x.goop || {};
      if (mover.t === 'Sludge') {
        goop = Object.assign({}, goop); goop[m.f] = me;
        var mid = g.dist(m.f, m.t) === 2 ? g.idx((g.col(m.f) + g.col(m.t)) / 2, (g.row(m.f) + g.row(m.t)) / 2) : -1;
        if (mid >= 0) goop[mid] = me; delete goop[m.t]; n.x.goop = goop;
      } else if (goop[at] && goop[at] !== me && b[at] && !V.def(b[at].t).royal) {
        b[at] = null;
      }
      /* penguin freezes its neighbours */
      if (mover.t === 'Penguin') {
        for (var a = -1; a <= 1; a++) for (var c = -1; c <= 1; c++) { var k = g.step(m.t, a, c); if (k >= 0 && k !== m.t && b[k] && b[k].t !== 'Penguin' && !V.def(b[k].t).blocker) b[k] = Object.assign({}, b[k], { fz: m.t }); }
      }
    },

    evaluate: function (V, st) {
      var s = 0; for (var i = 0; i < st.b.length; i++) { var p = st.b[i]; if (p && p.sh) s += p.c === 'w' ? 150 : -150; if (p && p.gp) s -= (p.c === 'w' ? 1 : -1) * (V.def('Giant').value || 600); }
      return s;
    },

    /* a Giant attacks every square of the blocks it can step onto */
    attacks: function (V, st, sq, by) {
      for (var i = 0; i < st.b.length; i++) {
        var p = st.b[i]; if (!isGiant(p) || p.gp || p.c !== by || p.gid == null) continue;
        var out = [], saved = st.b[sq]; if (!saved) st.b[sq] = { t: '?', c: '?', m: 1, probe: 1 };
        H.cuGiant(V, st, i, p, out); st.b[sq] = saved;
        var blk = gblock(st, i);
        for (var k = 0; k < out.length; k++) for (var z = 0; z < blk.length; z++) if (V.geo.step(blk[z], out[k].giant[0], out[k].giant[1]) === sq) return true;
      }
      return false;
    },

    /* ---- game hooks ---- */
    setup: function (ctx) { expand(ctx.V, ctx.state.b); },
    onTap: function (ctx, i) {   /* tapping any square of your Giant selects it */
      var p = ctx.state.b[i], G = ctx.game; if (!p || !p.gp || p.c !== ctx.human || !G) return false;
      var a = gblock(ctx.state, i)[0]; if (a == null || a === i || ctx.state.b[a].gp) return false;
      if (G.sel === a) { G.sel = -1; G.render(); return true; }
      G.sel = a; G.render(); return true;
    },
    visible: function (ctx, sq, p) {
      if (p.t !== 'Ghost') return true;
      if (p.rv != null && ctx.state.ply - p.rv <= 1) return true;
      var g = ctx.geo, b = ctx.state.b;
      for (var i = 0; i < b.length; i++) { var q = b[i]; if (q && q.c === ctx.human && (q.t === 'K' || q.t === 'Jester') && g.dist(i, sq) <= 1) return true; }
      return false;
    },
    decorate: function (ctx, sq, p) {
      var goop = ctx.state.x.goop || {}, o = null;
      if (goop[sq]) o = { cls: 'g4cu-goop' };
      if (p && p.sh) { o = o || {}; o.html = '<span class="g4cu-halo" aria-label="shielded"></span>'; }
      if (p && p.t === 'Jester' && p.c !== ctx.human) { o = o || {}; o.badge = ''; o.img = ctx.game.pieceImage({ t: 'K', c: p.c }); }
      if (p && (asleep(ctx.state, p) || frozen(ctx.V, ctx.state, sq, p))) { o = o || {}; o.cls = ((o.cls || '') + ' g4cu-zz').trim(); }
      if (isGiant(p) && p.gid != null) {   /* one double-size token over the block, drawn from its top-left square on screen */
        var g = ctx.geo, blk = gblock(ctx.state, sq), fl = ctx.game && ctx.game.flipped && ctx.game.flipped();
        var key = function (j) { return (fl ? -1 : 1) * (g.row(j) * 1000 + g.col(j)); }, tl = blk.slice().sort(function (a, b) { return key(a) - key(b); })[0];
        var cs = blk.map(function (j) { return g.col(j); }), rs = blk.map(function (j) { return g.row(j); });
        var w = Math.max.apply(null, cs) - Math.min.apply(null, cs) + 1, h = Math.max.apply(null, rs) - Math.min.apply(null, rs) + 1;
        o = o || {}; o.hidePiece = true;
        if (sq === tl) { var a = ctx.state.b[blk[0]] || p; o.html = (o.html || '') + '<img class="g4cu-giant" alt="Giant" src="' + ctx.game.pieceImage({ t: 'Giant', c: a.c }) + '" style="width:' + (w * 100) + '%;height:' + (h * 100) + '%">' + (a.sh ? '' : ''); }
      }
      return o;
    },
    afterMove: function (ctx, m, info) {
      if (m.cap && (m.cap.t === 'Bomb' || info.piece === 'Bomb')) ctx.fx({ type: 'explosion', at: ctx.name(m.capSq != null ? m.capSq : m.t), radius: 1 });
      if (m.pull) ctx.fx({ type: 'arrow', from: ctx.name(m.f), to: ctx.name(m.t), color: '#c8a063', duration_ms: 700 });
      if (m.stay && m.cap) ctx.fx({ type: 'arrow', from: ctx.name(m.f), to: ctx.name(m.t), color: '#e04b3c', duration_ms: 600 });
      if (m.swap) ctx.fx({ type: 'flash', at: ctx.name(m.f), color: '#9b6cff', duration_ms: 400 });
    },
    status: function (ctx) {
      if (ctx.over) return null;
      var me = 0, them = 0, P = ctx.spec.params && ctx.spec.params.cost || {};
      ctx.state.b.forEach(function (p) { if (p && !p.gp && P[p.t] != null) { if (p.c === ctx.human) me += P[p.t]; else them += P[p.t]; } });
      return 'Army points on the board: you ' + me + ' · opponent ' + them;
    }
  };
  if (typeof document !== 'undefined' && !document.getElementById('g4cu-css')) {
    var css = document.createElement('style'); css.id = 'g4cu-css';
    css.textContent = '.g4cu-goop{box-shadow:inset 0 0 0 999px rgba(110,190,60,.38)}' +
      '.g4cu-halo{position:absolute;left:18%;right:18%;top:2%;height:14%;border:3px solid #ffd84a;border-radius:50%;box-shadow:0 0 6px #fff3a0;pointer-events:none;z-index:3}' +
      '.g4cu-zz .pc{filter:saturate(.35) brightness(.85)}' +
      '.g4cu-giant{position:absolute;left:0;top:0;z-index:4;pointer-events:none;object-fit:contain;transition:none}';
    document.head.appendChild(css);
  }
  CM.defineHooks('g4_cu', H);
})();
