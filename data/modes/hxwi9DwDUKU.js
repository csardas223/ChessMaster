/* Can I SURVIVE Chaturanga?  Ancient Indian chess: the Elephant (bishop slot) jumps exactly two squares diagonally, the
   Counselor (queen slot) steps one square diagonally, chariots are rooks, pawns move one square only and there is no
   castling. King and Counselor sit on swapped squares compared with modern chess. Sources: research/modes/hxwi9DwDUKU.json
   (FEN rnbkqbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBKQBNR, opponents ~1816-1831). Inferred: pawns promote to a Counselor. */
CM.mode({
  id: 'hxwi9DwDUKU',
  name: 'Chaturanga',
  category: 'Variants & Games',
  description: 'The ancestor of chess. Elephants (in the bishop slots) jump exactly two squares diagonally, the Counselor (instead of a queen) moves one square diagonally, and pawns only ever move one square. No castling, no en passant. King and Counselor start on swapped squares.',
  how_to_win: 'Checkmate.',
  player_side: 'white',
  opponent: { name: 'RobustChill', rating: 1831, avatar: null, tagline: 'Higher-rated Chaturanga player.' },
  board: { files: 8, ranks: 8, light: '#eeeed2', dark: '#769656' },
  pieces: {
    B: { name: 'Elephant', moves: 'A', value: 150, badge: 'E' },
    Q: { name: 'Counselor', moves: 'F', value: 170, badge: 'C' },
    P: { name: 'Pawn', moves: 'fmWfcF', value: 100, pawn: true, promote: true, enPassant: false, san: '' }
  },
  setup: { fen: 'rnbkqbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBKQBNR' },
  rules: { castling: false, enPassant: false, promotion: { choices: ['Q'] } },
  bot: { engine: 'search', elo: 1820, depth: 4, time_ms: 800 },
  vfx_timeline: [{ trigger: 'game_start', once: true, effect: { type: 'overlay', image: 'assets/modes/hxwi9DwDUKU/chaturanga_board.png', fit: 'contain', at: 'board', opacity: 1, duration_ms: 1600, fade_ms: 300 } }],
  source: { research: 'research/modes/hxwi9DwDUKU.json', confidence: 'high', notes: 'Piece art borrows bishop/queen images.' }
});
