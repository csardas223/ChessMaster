/* g6_rosen: Rosen Score "word openings". The first letters of your first N moves must spell params.word:
   a pawn move counts as its file letter (e4, exd5 -> E), a piece move as the piece letter (B, N, R, Q, K), castling
   as O. Only moves that fit the next letter are allowed while one exists. The trophy counts only if you then win.
   params: { word: 'EGG', side: 'w' }  or  { pawns: 12, side: 'w' } (first 12 moves must be pawn moves). */
(function () {
  'use strict';
  function letter(V, m) {
    if (m.castle) return 'O';
    if (m.drop) return '@';
    var d = V.def(m.p);
    if (d.pawn) return V.geo.fileName(V.geo.col(m.f)).toUpperCase();
    return V.letter(m.p).toUpperCase();
  }
  function want(V, st, P) {
    var x = st.x || {}, k = x.spell || 0;
    if (P.word) return k < P.word.length ? { k: k, ok: function (m) { return letter(V, m) === P.word[k]; } } : null;
    if (P.pawns) return k < P.pawns ? { k: k, ok: function (m) { return !!V.def(m.p).pawn && !m.drop; } } : null;
    return null;
  }
  CM.defineHooks('g6_rosen', {
    filterMoves: function (V, st, legal) {
      var P = V.cfg.params || {}; if (st.turn !== (P.side || 'w')) return null;
      var w = want(V, st, P); if (!w) return null;
      var fit = legal.filter(w.ok);
      return fit.length ? fit : null;
    },
    onMake: function (V, prev, m, n) {
      var P = V.cfg.params || {}; if (prev.turn !== (P.side || 'w')) return;
      var w = want(V, prev, P); if (!w) return;
      n.x.spell = w.k + 1;
      if (!w.ok(m)) n.x.broken = 1;
    },
    evaluate: function (V, st) { return 0; },
    status: function (ctx) {
      var P = ctx.params, x = ctx.x || {}, k = x.spell || 0;
      if (P.word) return 'Spell ' + P.word.split('').map(function (c, i) { return i < k ? c : '_'; }).join(' ') + (x.broken ? ' · spelling broken' : k >= P.word.length ? ' · spelled! Now win the game' : '');
      return 'Pawn moves: ' + Math.min(k, P.pawns) + '/' + P.pawns + (x.broken ? ' · broken' : k >= P.pawns ? ' · done! Now win the game' : '');
    },
    onGameOver: function (ctx, res) {
      var x = ctx.x || {}, P = ctx.params, need = P.word ? P.word.length : P.pawns;
      if (res.w === ctx.human) ctx.toast((x.spell || 0) >= need && !x.broken ? 'Rosen Score trophy unlocked: ' + (P.title || P.word) + '!' : 'You won, but the opening did not count.', 3500);
    }
  });
})();
