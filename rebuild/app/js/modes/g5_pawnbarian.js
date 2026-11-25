/* g5_pawnbarian: Pawnbarian (roguelike deck-builder). One hero (H) on a small grid against monsters.
   Each turn you hold 3 cards drawn from your deck (params.deck) and take 2 actions; every action plays a card and
   moves/attacks the hero with that chess piece's pattern (moving onto a monster kills it). Moving onto the top row
   promotes every pawn card in your hand to a queen. After your 2 actions, any monster next to the hero hits it for
   1 heart (squares next to monsters are marked); then the monsters move (one per turn, they never capture).
   Horned Cappy Bears can only be attacked diagonally; the boss (X) takes params.bossHp hits.
   Floors: params.floors = [{ name, fen }] in order; kill every monster to clear the floor. Lose all hearts = loss.
   If no card in hand can move, the hero may make one desperate king step without spending a card.
   State x: hand [types], seed (deterministic draws, so the search sees the same cards), hp. */
(function () {
  'use strict';
  var CM = window.CM, pos = {};
  var NAME = { P: 'Pawn', N: 'Knight', B: 'Bishop', R: 'Rook', Q: 'Queen', K: 'King' };
  var ORDER = { P: 0, K: 1, N: 2, B: 3, R: 4, Q: 5 };
  function prm(V) { return V.cfg.params || {}; }
  function rng(seed) { return (seed * 1103515245 + 12345) & 0x7fffffff; }
  function draw(V, x) {
    var deck = prm(V).deck || ['P', 'P', 'P', 'N', 'B', 'P', 'R', 'K'], h = [], s = x.seed || 1;
    for (var k = 0; k < 3; k++) { s = rng(s); h.push(deck[s % deck.length]); }
    x.seed = s; x.hand = h;
  }
  function isMon(p) { return p && p.c === 'b'; }
  function floors(ctx) { return ctx.params.floors || []; }
  CM.defineHooks('g5_pawnbarian', {
    setup: function (ctx) {
      var F = floors(ctx), k = Math.min(pos[ctx.spec.id] || 0, F.length - 1), V = ctx.V, st = ctx.state;
      if (F[k]) st.b = CM.spec.parseSetup(V, F[k].fen);
      var x = Object.assign({}, st.x, { seed: 1 + ctx.random(100000), hp: ctx.params.hearts || 3 }); draw(V, x); st.x = x; st.turn = 'w'; st.sub = 0;
      st.start = {};
    },
    onStart: function (ctx) { var F = floors(ctx), k = Math.min(pos[ctx.spec.id] || 0, F.length - 1); if (F[k]) ctx.toast('Floor ' + (k + 1) + '/' + F.length + ': ' + F[k].name, 3000); },
    hero: function (V, st, i, p, out) {
      var g = V.geo, b = st.b, hand = (st.x.hand || []).slice().sort(function (a, c) { return ORDER[a] - ORDER[c]; }), seen = {};
      function add(j, card) { if (j < 0) return false; var q = b[j]; if (q && !isMon(q)) return false; out.push({ f: i, t: j, p: p.t, c: p.c, cap: q || null, capSq: q ? j : undefined, card: card }); return !q; }
      var n0 = out.length;
      hand.concat(['_']).forEach(function (c) {
        if (c === '_') { if (out.length > n0) return; c = 'K'; }   /* no card can move: a desperate king step (no card spent) */
        if (seen[c]) return; seen[c] = 1;
        if (c === 'P') { var j = g.step(i, 0, -1); if (j >= 0 && !b[j]) add(j, c); [-1, 1].forEach(function (dc) { var d = g.step(i, dc, -1); if (d >= 0 && isMon(b[d])) add(d, c); }); }
        else if (c === 'N') [[1, 2], [2, 1], [-1, 2], [-2, 1], [1, -2], [2, -1], [-1, -2], [-2, -1]].forEach(function (v) { add(g.step(i, v[0], v[1]), c); });
        else if (c === 'K') [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(function (v) { add(g.step(i, v[0], v[1]), c); });
        else {
          var D = c === 'R' ? [[1, 0], [-1, 0], [0, 1], [0, -1]] : c === 'B' ? [[1, 1], [1, -1], [-1, 1], [-1, -1]] : [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
          D.forEach(function (v) { var j = i; while (true) { j = g.step(j, v[0], v[1]); if (j < 0) break; if (!add(j, c)) break; } });
        }
      });
    },
    filterMoves: function (V, st, legal) {
      if (st.turn !== 'w') return legal;
      var g = V.geo;
      return legal.filter(function (m) { if (!m.cap || m.cap.t !== 'Y') return true; var dc = Math.abs(g.col(m.t) - g.col(m.f)), dr = Math.abs(g.row(m.t) - g.row(m.f)); return dc === dr; });
    },
    onMake: function (V, st, m, n) {
      var x = n.x = Object.assign({}, n.x), g = V.geo, P = prm(V);
      if (st.turn === 'w') {
        var h = (st.x.hand || []).slice(), k = h.indexOf(m.card); if (k >= 0) h.splice(k, 1); x.hand = h;
        if (m.cap && m.cap.t === 'X' && (m.cap.hp == null ? (P.bossHp || 3) : m.cap.hp) > 1) {
          n.b[m.f] = st.b[m.f]; n.b[m.t] = Object.assign({}, m.cap, { hp: (m.cap.hp == null ? (P.bossHp || 3) : m.cap.hp) - 1 });
        }
        var at = n.b[m.t] && n.b[m.t].t === 'H' ? m.t : m.f;
        if (g.row(at) === 0) x.hand = x.hand.map(function (c) { return c === 'P' ? 'Q' : c; });
        if ((st.sub || 0) + 1 >= 2) {          /* end of your turn: monsters next to the hero strike, then a fresh hand */
          var hits = 0;
          for (var j = 0; j < n.b.length; j++) if (isMon(n.b[j]) && g.dist(j, at) === 1) hits++;
          if (hits) x.hp = (st.x.hp || 0) - 1;
          draw(V, x);
        }
      }
    },
    checkWin: function (V, st) {
      if ((st.x.hp || 0) <= 0) return { w: 'b', why: 'the Pawnbarian ran out of hearts' };
      for (var i = 0; i < st.b.length; i++) if (isMon(st.b[i])) return null;
      return { w: 'w', why: 'every monster on the floor is dead' };
    },
    evaluate: function (V, st) {
      var hero = -1, v = 0; for (var i = 0; i < st.b.length; i++) if (st.b[i] && st.b[i].t === 'H') hero = i;
      if (hero < 0) return 0;
      for (var j = 0; j < st.b.length; j++) if (isMon(st.b[j])) v += 25 * (4 - Math.min(4, V.geo.dist(j, hero)));
      return 400 * (st.x.hp || 0) - v;
    },
    decorate: function (ctx, sq, p) {
      var st = ctx.state, g = ctx.geo;
      if (p && p.t === 'X') return { badge: String(p.hp == null ? (ctx.params.bossHp || 3) : p.hp) };
      if (p) return null;
      for (var j = 0; j < st.b.length; j++) if (isMon(st.b[j]) && g.dist(j, sq) === 1) return { cls: 'g5pb-threat' };
      return null;
    },
    init: function () { if (!document.getElementById('g5-pb-css')) { var s = document.createElement('style'); s.id = 'g5-pb-css'; s.textContent = '.g5pb-threat{background-image:linear-gradient(135deg,rgba(220,50,50,.55) 0 14%,transparent 14% 86%,rgba(220,50,50,.55) 86%)!important}'; document.head.appendChild(s); } },
    onGameOver: function (ctx, over) {
      var id = ctx.spec.id, F = floors(ctx), k = pos[id] || 0;
      if (over.w === ctx.human) { pos[id] = k < F.length - 1 ? k + 1 : 0; ctx.toast(k < F.length - 1 ? 'Floor cleared! New game starts floor ' + (k + 2) + '.' : 'The area boss is down: area cleared!', 3400); }
    },
    status: function (ctx) {
      var x = ctx.state.x, F = floors(ctx), k = Math.min(pos[ctx.spec.id] || 0, F.length - 1);
      return 'Floor ' + (k + 1) + '/' + F.length + '  ·  ' + '♥'.repeat(Math.max(0, x.hp || 0)) + '  ·  Hand: ' + (x.hand || []).map(function (c) { return NAME[c]; }).join(', ') + '  ·  actions ' + (2 - (ctx.state.sub || 0)) + '/2';
    }
  });
})();
