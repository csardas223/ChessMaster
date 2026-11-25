/* g5_chaturanga: chess.com Chaturanga (ancient chess). Elephant H leaps exactly two squares diagonally, the counselor F
   steps one square diagonally, chariots are rooks, pawns step one square (no double step, no en passant) and promote
   to a counselor. No castling. A bare king (no other pieces left) loses; stalemate loses for the stalemated side. */
(function () {
  'use strict';
  function count(st, c) { var n = 0; for (var i = 0; i < st.b.length; i++) { var p = st.b[i]; if (p && p.c === c && p.t !== 'K') n++; } return n; }
  CM.defineHooks('g5_chaturanga', {
    checkWin: function (V, st) {
      var w = count(st, 'w'), b = count(st, 'b');
      if (!w && b) return { w: 'b', why: 'bare king' };
      if (!b && w) return { w: 'w', why: 'bare king' };
      if (!w && !b) return { w: 'd', why: 'only kings left' };
      return null;
    }
  });
})();
