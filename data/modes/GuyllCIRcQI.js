/* Can I MASTER Chaturanga?  chess.com Chaturanga vs ~1500 humans in 1-minute games, goal five wins. Elephants leap
   exactly two squares diagonally, the counselor steps one square diagonally, pawns step once and promote to a
   counselor, no castling; a bare king loses (learned in game 5). Sources: research/modes/GuyllCIRcQI.json, frames
   (#ECF2D1/#7BA058, 1-5 counter, 1:01 clocks, opponent 483828191a 1500). Setup follows Fairy-Stockfish chaturanga
   (rnbkqbnr/../RNBQKBNR). Bare king + stalemate-loss rules in js/modes/g5_chaturanga.js. */
CM.mode({
  id: 'GuyllCIRcQI',
  title: 'Can I MASTER Chaturanga?',
  name: 'Chaturanga (Bullet)',
  category: 'Variants & Games',
  description: 'Ancient chess. The Elephant (bishop slot) jumps exactly two squares diagonally, the Counselor (queen slot) moves one square diagonally, chariots move like rooks, pawns move one square only and promote to a Counselor. No castling, no en passant.',
  how_to_win: 'Checkmate, or capture everything except the enemy king (a bare king loses). Stalemating your opponent wins too.',
  player_side: 'white',
  player: { name: 'You', rating: 1583, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },
  opponent: { name: '483828191a', rating: 1500, avatar: 'assets/modes/uUXev8TPVak/default.png', tagline: 'Chaturanga bullet opponent on chess.com.' },
  board: { files: 8, ranks: 8, light: '#ECF2D1', dark: '#7BA058' },
  pieces: {
    H: { name: 'Elephant', moves: 'A', value: 160, glyph: 'B', img: { w: 'assets/modes/GuyllCIRcQI/elephant_w.png', b: 'assets/modes/GuyllCIRcQI/elephant_b.png' } },
    F: { name: 'Counselor', moves: 'F', value: 190, glyph: 'Q', badge: null, img: { w: 'assets/modes/GuyllCIRcQI/counselor_w.png', b: 'assets/modes/GuyllCIRcQI/counselor_b.png' } },
    R: { name: 'Chariot', moves: 'R', value: 500, castleRook: false, img: { w: 'assets/modes/GuyllCIRcQI/chariot_w.png', b: 'assets/modes/GuyllCIRcQI/chariot_b.png' } },
    P: { name: 'Pawn', moves: 'fmWfcF', value: 100, pawn: true, promote: true, enPassant: false, san: '' }
  },
  setup: { fen: 'rnhkfhnr/pppppppp/8/8/8/8/PPPPPPPP/RNHFKHNR' },
  rules: { castling: false, enPassant: false, stalemate: 'loss', promotion: { auto: 'F', choices: ['F'] } },
  bot: { engine: 'search', elo: 1500, depth: 4, time_ms: 600 },
  clock: { w: 60, b: 60, inc: 0, bot: false },
  vfx: [{ type: 'overlay', at: 'board', image: 'assets/modes/GuyllCIRcQI/chaturanga_pieces.png', fit: 'contain', duration_ms: 1600, id: 'g5intro' /* video art */ }, { type: 'fade_board', duration_ms: 600 }],
  hooks: 'g5_chaturanga',
  source: { research: 'research/modes/GuyllCIRcQI.json', confidence: 'high', notes: 'Stalemate counted as a win for the stalemating side (chess.com/Fairy-Stockfish chaturanga, inferred). m-art 2026-11-26: Elephant/Counselor/Chariot = chess.com Chaturanga piece art (exact SVGs, source.notes in the mode art folder); opponent avatar = chess.com default (grey pawn) as in the player bar.' }
});
