/* g5_dragon: chess.com Dragon Bishop / Paradigm30. The bishops are Dragon Bishops (type D: bishop + a knight move
   that cannot jump; it is blocked by a piece on the orthogonal square next to it, Betza 'BnN'). params.shuffle: true
   starts from a random Chess960 back rank (same for both sides) with Dragon Bishops in the bishop slots.
   Castling on shuffled starts uses the engine's generic rule (king two squares toward the rook), not exact 960 rules. */
(function () {
  'use strict';
  CM.defineHooks('g5_dragon', {
    setup: function (ctx) {
      ctx.pieces(function (p) { return p.t === 'B'; }).forEach(function (i) { ctx.transform(i, { type: 'D' }); });
    }
  });
})();
