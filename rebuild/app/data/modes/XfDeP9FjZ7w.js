/* Can I BEAT Ancient Chess? (Chaturanga)  chess.com Chaturanga at 3+2: elephants jump two squares diagonally, the
   counselor steps one square diagonally, pawns one square only, no castling. Sources: research/modes/XfDeP9FjZ7w.json,
   rules.jsonl (goal three wins), frames (#edf2d0/#7a9e58, chariot/elephant/minister set, Fatehbirs 1500). Bare-king
   rule from js/modes/g5_chaturanga.js (inferred for chess.com). */
CM.mode({
  id: 'XfDeP9FjZ7w',
  title: 'Can I BEAT Ancient Chess? (Chaturanga)',
  name: 'Ancient Chess (Chaturanga)',
  category: 'Variants & Games',
  description: 'The ancestor of chess. Elephants jump exactly two squares diagonally (over anything), the Counselor moves one square diagonally, chariots are rooks, horses are knights and pawns only ever move one square, promoting to a Counselor. No castling.',
  how_to_win: 'Checkmate, or bare the enemy king by capturing everything else. Stalemating your opponent also wins.',
  player_side: 'white',
  player: { name: 'You', rating: 1538, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },
  opponent: { name: 'Fatehbirs', rating: 1500, tagline: 'Chaturanga opponent on chess.com (3+2).' },
  board: { files: 8, ranks: 8, light: '#edf2d0', dark: '#7a9e58' },
  pieces: {
    H: { name: 'Elephant', moves: 'A', value: 160, glyph: 'B', badge: 'E' },
    F: { name: 'Counselor', moves: 'F', value: 190, glyph: 'Q', badge: 'C' },
    R: { name: 'Chariot', moves: 'R', value: 500, castleRook: false },
    P: { name: 'Pawn', moves: 'fmWfcF', value: 100, pawn: true, promote: true, enPassant: false, san: '' }
  },
  setup: { fen: 'rnhkfhnr/pppppppp/8/8/8/8/PPPPPPPP/RNHFKHNR' },
  rules: { castling: false, enPassant: false, stalemate: 'loss', promotion: { auto: 'F', choices: ['F'] } },
  bot: { engine: 'search', elo: 1500, depth: 4, time_ms: 650 },
  clock: { w: 180, b: 180, inc: 2, bot: false },
  vfx: [{ type: 'overlay', at: 'board', image: 'assets/modes/XfDeP9FjZ7w/chaturanga_elephant.svg', fit: 'contain', duration_ms: 1600, id: 'g5intro' /* video art */ }],
  hooks: 'g5_chaturanga',
  source: { research: 'research/modes/XfDeP9FjZ7w.json', confidence: 'high', notes: 'King/counselor placement per Fairy-Stockfish chaturanga.' }
});
