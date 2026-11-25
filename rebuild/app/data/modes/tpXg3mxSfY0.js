/* Can I BEAT Stockfish by Castling?  Normal chess against Fairy-Stockfish, except that if you castle (either side) you win
   on the spot. The engine knows it and tries to destroy your castling rights. Sources: research/modes/tpXg3mxSfY0.json
   (game 1 instant kingside castle, game 3 engine sacrifices a bishop to stop castling; normal castling legality). */
CM.mode({
  id: 'tpXg3mxSfY0',
  name: 'Castling Wins',
  category: 'Variants & Games',
  description: 'Normal chess against Fairy-Stockfish, with one change: if you castle, kingside or queenside, you win immediately. Normal castling rules apply (no castling out of, through or into check, and not after the king or that rook has moved). The engine will do anything to stop you.',
  how_to_win: 'Castle legally, or checkmate the engine.',
  player_side: 'white',
  opponent: { name: 'Fairy-Stockfish', rating: 3000, avatar: 'assets/avatars/stockfish.svg', tagline: 'Knows exactly what you are planning.' },
  board: { files: 8, ranks: 8, light: '#eeeed2', dark: '#769656' },
  setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR' },
  bot: { engine: 'search', style: 'best', depth: 4, time_ms: 900 },
  hooks: {
    onMake: function (V, prev, m, n) { if (m.castle && m.c === 'w') n.x.castled = 'w'; },
    checkWin: function (V, st) { return st.x && st.x.castled ? { w: st.x.castled, why: 'castled' } : null; },
    /* the engine fears White's castling rights */
    evaluate: function (V, st) {
      var b = st.b, k = b[60], v = 0;
      if (k && k.t === 'K' && k.c === 'w' && !k.m) {
        if (b[63] && b[63].t === 'R' && b[63].c === 'w' && !b[63].m) v += 220 + (b[61] ? 0 : 60) + (b[62] ? 0 : 60);
        if (b[56] && b[56].t === 'R' && b[56].c === 'w' && !b[56].m) v += 180 + (b[57] ? 0 : 40) + (b[58] ? 0 : 40) + (b[59] ? 0 : 40);
      }
      return v;
    }
  },
  vfx_timeline: [ { trigger: 'castle', effect: { type: 'particles', kind: 'confetti', at: 'board' } } ],
  messages: { win: 'you castled' },
  source: { research: 'research/modes/tpXg3mxSfY0.json', confidence: 'high' }
});
