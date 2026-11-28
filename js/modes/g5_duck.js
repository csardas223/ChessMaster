/* g5_duck: Duck Chess (chess.com rules). Each turn is two steps: a normal chess move, then the same player must put
   the duck on a different empty square. Nothing can land on or pass through the duck (knights jump it), it can never
   be captured. There is no check: kings may be left attacked and you win by capturing the king. Stalemate wins for
   the stalemated player. The duck step is modelled as a drop of the neutral duck ('*') in a second sub-move
   (rules.movesPerTurn 2, rules.drops true, the duck is the only thing ever in hand). Kings are not royal so a sub-move
   is never cut short by "check"; the win is rules.win capture K. */
(function () {
  'use strict';
  function duckAt(b) { for (var i = 0; i < b.length; i++) if (b[i] && b[i].t === '*') return i; return -1; }
  CM.defineHooks('g5_duck', {
    moves: function (V, st, out) {
      if (st.sub === 1) return out.filter(function (m) { return m.drop === '*'; });
      return out.filter(function (m) { return !m.drop; });
    },
    onMake: function (V, st, m, n) {
      var me = st.turn, hands = { w: [], b: [] };
      if (m.drop === '*') {
        for (var i = 0; i < n.b.length; i++) if (i !== m.t && n.b[i] && n.b[i].t === '*') n.b[i] = null;
        n.b[m.t] = { t: '*', c: 'n', m: 1 };
      } else hands[me] = ['*'];   /* next sub-move: place the duck */
      n.hands = hands;
    },
    /* the side to move in the duck step can't drop on the duck's own square (it is occupied anyway) */
    evaluate: function (V, st) {
      /* a little duck sense for the bot: a duck right in front of the enemy king is annoying, next to your own is safe */
      var d = duckAt(st.b); if (d < 0) return 0;
      var g = V.geo, v = 0;
      for (var i = 0; i < st.b.length; i++) { var p = st.b[i]; if (p && p.t === 'K') { var k = g.dist(i, d); if (k === 1) v += p.c === 'w' ? 12 : -12; } }
      return v;
    },
    onTurn: function (ctx) {
      if (ctx.state.sub === 1 && ctx.state.turn === ctx.human) { ctx.game.hand = '*'; ctx.game.render(); }
    },
    status: function (ctx) {
      if (ctx.over) return null;
      /* critic 2026-11-27: the line was empty outside the duck step; always say what this step is */
      var mine = ctx.state.turn === ctx.human;
      if (ctx.state.sub === 1) return mine ? 'Place the duck on any empty square' : 'Opponent is placing the duck';
      return mine ? 'Move a piece, then place the duck' : 'Opponent is moving';
    }
  });
})();
