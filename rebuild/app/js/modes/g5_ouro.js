/* g5_ouro: Ouroboros King (tactical chess roguelite). A run of battles (params.battles = [{ name, fen, boss }]) played
   in order on a small board; New game after a win starts the next battle. King capture (no check rule).
   Unit generators (pieces.X.gen):
     portal  Portal Mage: moves to ANY empty square; captures only on the 8 adjacent squares.
     reaper  Reaper: king step (move or capture); also kills any enemy standing on a tile of the Reaper's own colour
             that is not royal (it stays where it is: the victim just disappears).
   Rules:
     Prince (type params.princeType, default 'I'): your royals cannot be captured while within 3 squares of a Prince.
     The Finisher relic (params.finisher !== false): if the enemy has only royals left and you still have other units at
             the start of your turn, you win.
     Glass Queen (type params.glassType, default 'Q' of the player): once she dies she never returns in later battles
             of this run (session only).
   State x: none. Run progress is module state keyed by mode id (like g5_shotgun floors). */
(function () {
  'use strict';
  var CM = window.CM, pos = {}, lost = {};
  var D8 = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
  function prm(V) { return V.cfg.params || {}; }
  function B(ctx) { return ctx.params.battles || []; }
  function idx(ctx) { var l = B(ctx); return Math.min(pos[ctx.spec.id] || 0, l.length - 1); }
  function sqColor(g, i) { return (g.col(i) + g.row(i)) & 1; }
  CM.defineHooks('g5_ouro', {
    setup: function (ctx) {
      var l = B(ctx), k = idx(ctx), V = ctx.V, st = ctx.state, glass = ctx.params.glassType || 'Q';
      if (l[k]) st.b = CM.spec.parseSetup(V, l[k].fen);
      st.b = st.b.map(function (p, i) {
        if (!p) return p;
        if (lost[ctx.spec.id] && p.c === ctx.human && p.t === glass) return null;   /* the Glass Queen never returns */
        if (V.def(p.t).pawn && V.geo.relRow(i, p.c) !== 1) return Object.assign({}, p, { m: 1 });
        return p;
      });
      st.turn = 'w';
      st.start = {}; V.colors.forEach(function (c) { st.start[c + 'Royal'] = V.royals(st, c).length > 0; });
    },
    onStart: function (ctx) {
      var l = B(ctx), k = idx(ctx), b = l[k] || {};
      ctx.toast((b.region ? b.region + ' - ' : '') + 'Battle ' + (k + 1) + '/' + l.length + (b.name ? ': ' + b.name : '') + (b.boss ? '. Boss!' : ''), 3400);
      if (b.boss) ctx.setOpponent({ name: b.boss, rating: null });
    },
    portal: function (V, st, i, p, out) {
      var b = st.b, g = V.geo;
      for (var j = 0; j < b.length; j++) if (j !== i && !b[j] && g.valid[j]) out.push({ f: i, t: j, p: p.t, c: p.c, cap: null });
      D8.forEach(function (d) { var j = g.step(i, d[0], d[1]); if (j >= 0 && b[j] && b[j].c !== p.c && b[j].c !== 'n') out.push({ f: i, t: j, p: p.t, c: p.c, cap: b[j], capSq: j }); });
    },
    reaper: function (V, st, i, p, out) {
      var b = st.b, g = V.geo, own = sqColor(g, i), near = {};
      D8.forEach(function (d) {
        var j = g.step(i, d[0], d[1]); if (j < 0) return; near[j] = 1; var q = b[j];
        if (!q) out.push({ f: i, t: j, p: p.t, c: p.c, cap: null });
        else if (q.c !== p.c && q.c !== 'n') out.push({ f: i, t: j, p: p.t, c: p.c, cap: q, capSq: j });
      });
      for (var j = 0; j < b.length; j++) {
        var q = b[j]; if (!q || q.c === p.c || q.c === 'n' || near[j] || V.def(q.t).royal || V.def(q.t).blocker) continue;
        if (sqColor(g, j) === own) out.push({ f: i, t: i, p: p.t, c: p.c, cap: q, capSq: j, reap: 1 });
      }
    },
    onMake: function (V, st, m, n) {
      if (!m.reap) return;
      n.b[m.f] = st.b[m.f]; n.b[m.capSq] = null;   /* the Reaper stays put; the victim vanishes */
    },
    filterMoves: function (V, st, legal) {
      var pt = prm(V).princeType || 'I', g = V.geo;
      return legal.filter(function (m) {
        if (!m.cap || !V.def(m.cap.t).royal) return true;
        var sq = m.capSq != null ? m.capSq : m.t;
        for (var i = 0; i < st.b.length; i++) { var q = st.b[i]; if (q && q.c === m.cap.c && q.t === pt && g.dist(i, sq) <= 3) return false; }
        return true;
      });
    },
    checkWin: function (V, st) {
      if (prm(V).finisher === false) return null;
      var me = st.turn, opp = me === 'w' ? 'b' : 'w', mine = 0, theirs = 0, theirR = 0;
      for (var i = 0; i < st.b.length; i++) { var p = st.b[i]; if (!p || p.c === 'n') continue; var r = V.def(p.t).royal; if (p.c === me && !r) mine++; if (p.c === opp) { if (r) theirR++; else theirs++; } }
      if (theirR && !theirs && mine && V.royals(st, me).length) return { w: me, why: 'The Finisher: the enemy leader stands alone' };
      return null;
    },
    afterMove: function (ctx, m) {
      if (m && m.reap) { ctx.fx({ type: 'flash', color: '#9b5cff', opacity: 0.5, at: m.capSq, duration_ms: 300 }); ctx.sound('capture'); }
      return null;
    },
    decorate: function (ctx, sq) {
      var zone = ctx.params.enemyRows || 2, g = ctx.V.geo;
      if (g.relRow(sq, ctx.bot) < zone) return { cls: 'g5ob-zone' };
      return null;
    },
    init: function () { if (!document.getElementById('g5-ob-css')) { var s = document.createElement('style'); s.id = 'g5-ob-css'; s.textContent = '.g5ob-zone{box-shadow:inset 0 0 0 999px rgba(214,96,150,.22)}'; document.head.appendChild(s); } },
    onGameOver: function (ctx, over) {
      var id = ctx.spec.id, l = B(ctx), k = pos[id] || 0, glass = ctx.params.glassType || 'Q', human = ctx.human;
      var hasGlass = ctx.state.b.some(function (p) { return p && p.c === human && p.t === glass; });
      if (over.w === human) {
        if (ctx.params.victoryImg) ctx.fx({ type: 'overlay', at: 'board', image: ctx.params.victoryImg, fit: 'contain', duration_ms: 2200, fade_ms: 250, id: 'g5victory' });
        if (!hasGlass && ctx.state.b && l[k] && /Q/.test(l[k].fen)) lost[id] = 1;
        pos[id] = k < l.length - 1 ? k + 1 : 0;
        if (pos[id] === 0) lost[id] = 0;
        ctx.toast(k < l.length - 1 ? 'VICTORY! New game starts battle ' + (k + 2) + '.' + (lost[id] ? ' Your Glass Queen shattered for good.' : '') : 'The Ouroboros is defeated: run complete!', 3600);
      } else { pos[id] = 0; lost[id] = 0; ctx.toast('Your king fell. The run starts over.', 3000); }
    },
    status: function (ctx) { var l = B(ctx), k = idx(ctx), b = l[k] || {}; return (b.region ? b.region + ' - ' : '') + 'Battle ' + (k + 1) + '/' + l.length + (b.name ? ': ' + b.name : ''); }
  });
})();
