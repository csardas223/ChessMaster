/* g6_setup: chess.com Setup Chess. The board starts empty; players alternately place one piece at a time on their own
   first three ranks, spending a budget (default 39: P1 N3 B3 R5 Q9, king free and compulsory). Pawns cannot go on the
   back rank. A side that has spent its budget and placed its king stops placing; the other side keeps placing until it
   is done too. Then normal chess starts with White to move (no castling). A placement may not give check.
   Mode file: setup.hands = g6 pools (see CM.g6setup.hands()), setup.x = { bud: {w:39,b:39}, king: {w:0,b:0} },
   rules: { drops: true, castling: false }, hooks: 'g6_setup', params: { budget: 39 } */
(function () {
  'use strict';
  var COST = { P: 1, N: 3, B: 3, R: 5, Q: 9, K: 0 };
  function placing(st, c) { var x = st.x; return x.bud && (x.bud[c] > 0 || !x.king[c]); }
  function phase(st) { return st.x.bud && (placing(st, 'w') || placing(st, 'b')); }
  CM.g6setup = { hands: function () { var h = ['K']; [['P', 16], ['N', 13], ['B', 13], ['R', 7], ['Q', 4]].forEach(function (a) { for (var k = 0; k < a[1]; k++) h.push(a[0]); }); return h; } };
  CM.defineHooks('g6_setup', {
    filterMoves: function (V, st, legal) {
      if (!phase(st)) return legal.filter(function (m) { return !m.drop; });
      var c = st.turn, bud = st.x.bud[c], opp = V.opp(c);
      if (!placing(st, c)) return [];
      return legal.filter(function (m) {
        if (!m.drop || V.geo.relRow(m.t, c) > 2) return false;
        if (m.drop === 'K') return !st.x.king[c];
        if (COST[m.drop] > bud) return false;
        return !V.royals(m.n, opp).length || !V.inCheck(m.n, opp);
      });
    },
    onMake: function (V, prev, m, n) {
      if (!m.drop || !n.x.bud) return;
      var c = m.c, bud = Object.assign({}, n.x.bud), king = Object.assign({}, n.x.king);
      if (m.drop === 'K') king[c] = 1; else bud[c] -= COST[m.drop] || 0;
      n.x.bud = bud; n.x.king = king;
      if (V.def(m.drop).pawn && V.geo.relRow(m.t, c) === 1) n.b[m.t] = Object.assign({}, n.b[m.t], { m: 0 });
      if (bud[c] <= 0 && king[c]) { n.hands = Object.assign({}, n.hands); n.hands[c] = []; }
      else if (bud[c] <= 0) { n.hands = Object.assign({}, n.hands); n.hands[c] = ['K']; }
      else { var left = bud[c]; n.hands = Object.assign({}, n.hands); n.hands[c] = n.hands[c].filter(function (t) { return t === 'K' ? !king[c] : COST[t] <= left; }); }
    },
    /* turn order fix-ups during placement (game level): a side that is done hands the turn back */
    afterMove: function (ctx) {
      var st = ctx.state, V = ctx.V; if (!st.x.bud) return;
      var t = st.turn, o = V.opp(t);
      if (!phase(st)) { if (st.x.started) return; ctx.state = Object.assign({}, st, { turn: 'w', x: Object.assign({}, st.x, { started: 1 }) }); ctx.toast('Both armies are set. White to move.', 2200); return; }
      if (!placing(st, t) && placing(st, o)) ctx.state = Object.assign({}, st, { turn: o });
    },
    checkWin: function (V, st, moves) { if (phase(st)) return null; return null; },
    evaluate: function (V, st) {
      if (!phase(st)) return 0;
      /* during placement prefer centralised, varied armies: a small bonus for bishops/rooks on open lines is enough */
      var s = 0; st.b.forEach(function (p, i) { if (p && !V.def(p.t).royal) { var f = V.geo.col(i); s += (p.c === 'w' ? 1 : -1) * (3 - Math.abs(3.5 - f)) * 4; } });
      return s;
    },
    status: function (ctx) {
      var x = ctx.x; if (!x.bud) return '';
      if (!phase(ctx.state)) return 'Normal chess from here.';
      var me = ctx.human, op = ctx.bot;
      return 'Placing: you have ' + Math.max(0, x.bud[me]) + ' points' + (x.king[me] ? '' : ' + your king') + ' · opponent ' + Math.max(0, x.bud[op]) + (x.king[op] ? '' : ' + king') + '. Tap a piece in your hand, then a square on your first three ranks.';
    }
  });
})();
