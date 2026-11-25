/* g5_spell: Rosen Score word openings. Your first moves must spell a word, then you must win.
   params: { words: ['BEEF', 'CABBAGE'], side: 'w'|'b', by: 'file' (the file each move lands on) | 'san' (first
   letter of each move in algebraic notation: pawn moves use their file, piece moves their letter B/N/R/Q/K) }
   Only moves that fit the next letter are offered while the word is unfinished (if none fits, any move is allowed and
   the challenge is lost). Checkmate after spelling the word wins; checkmate without it is scored as a draw. */
(function () {
  'use strict';
  function letter(V, m, by) {
    var g = V.geo;
    if (by === 'san') { if (m.castle) return 'O'; var d = V.def(m.p); return d.pawn ? g.fileName(g.col(m.f)).toUpperCase() : V.letter(m.p).toUpperCase(); }
    return g.fileName(g.col(m.t)).toUpperCase();
  }
  CM.defineHooks('g5_spell', {
    setup: function (ctx) { var w = ctx.params.words || ['BEEF']; ctx.setX('word', ctx.pick(w)); ctx.setX('k', 0); ctx.setX('failed', 0); },
    filterMoves: function (V, st, legal) {
      var side = V.cfg.params.side || 'w', w = st.x.word, k = st.x.k || 0;
      if (st.turn !== side || !w || k >= w.length || st.x.failed) return legal;
      var by = V.cfg.params.by || 'file', want = w[k];
      var ok = legal.filter(function (m) { return !m.drop && letter(V, m, by) === want; });
      return ok.length ? ok : legal;
    },
    onMake: function (V, st, m, n) {
      var side = V.cfg.params.side || 'w', w = st.x.word, k = st.x.k || 0;
      if (m.c !== side || !w || k >= w.length) return;
      if (letter(V, m, V.cfg.params.by || 'file') !== w[k]) n.x.failed = 1;
      n.x.k = k + 1;
    },
    checkWin: function (V, st, moves) {
      var side = V.cfg.params.side || 'w';
      if (moves.length || st.turn === side || !V.inCheck(st, st.turn)) return null;
      var done = st.x.word && (st.x.k || 0) >= st.x.word.length && !st.x.failed;
      return done ? { w: side, why: 'checkmate after spelling ' + st.x.word } : { w: 'd', why: 'checkmate, but ' + (st.x.word || 'the word') + ' was not spelled' };
    },
    status: function (ctx) {
      var w = ctx.x.word, k = ctx.x.k || 0; if (!w) return null;
      if (ctx.x.failed) return 'Word ' + w + ' broken: the challenge is lost';
      return k >= w.length ? 'Spelled ' + w + '! Now win the game.' : 'Spell ' + w + ': ' + w.slice(0, k) + '[' + w[k] + ']' + w.slice(k + 1);
    },
    stockfishOk: true
  });
})();
