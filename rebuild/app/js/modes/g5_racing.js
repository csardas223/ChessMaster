/* g5_racing: Racing Kings. No pawns, everything starts on ranks 1-2. A move that gives check is illegal (for either
   side), so kings are never attacked. First king on the 8th rank wins; if White gets there first, Black may still
   draw by also reaching the 8th rank on the very next move. */
(function () {
  'use strict';
  function kingRank(V, st, c) { var r = V.royals(st, c)[0]; return r == null ? 0 : V.geo.rank(r); }
  CM.defineHooks('g5_racing', {
    filterMoves: function (V, st, legal) {
      var me = st.turn, them = V.opp(me);
      return legal.filter(function (m) { return !V.inCheck(m.n, them); });
    },
    checkWin: function (V, st, moves) {
      var top = V.geo.ranks, w8 = kingRank(V, st, 'w') === top, b8 = kingRank(V, st, 'b') === top;
      if (w8 && b8) return { w: 'd', why: 'both kings reached the 8th rank' };
      if (b8) return { w: 'b', why: 'Black\'s king reached the 8th rank' };
      if (w8) {
        if (st.turn === 'w') return { w: 'w', why: 'White\'s king reached the 8th rank' };
        var reply = moves.some(function (m) { return V.def(m.p).royal && V.geo.rank(m.t) === top; });
        return reply ? null : { w: 'w', why: 'White\'s king reached the 8th rank' };
      }
      return null;
    },
    evaluate: function (V, st) {
      var w = kingRank(V, st, 'w'), b = kingRank(V, st, 'b');
      return (w * w - b * b) * 22 + (st.turn === 'w' ? 30 : -30);
    }
  });
})();
