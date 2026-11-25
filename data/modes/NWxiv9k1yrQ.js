/* Can I MASTER Petrified Chess?  chess.com Petrified Chess vs ~1500 humans, scored on points: a non-pawn piece that
   captures a non-pawn piece turns to stone where it lands; pawns never petrify and may step sideways; kings cannot
   capture; captures score P1 N3 B3 R5 Q9 and checkmate is worth 20. Goal five wins (5th in game 6).
   Sources: research/modes/NWxiv9k1yrQ.json (0:20, 1:30, 4:10), frames (#ECF2D1/#7B9F58, grey stones, score beside the
   names, deception2 ~1470, me 1550, 3-min clocks). Rules in js/modes/g5_petrified.js; stone art is original. */
CM.mode({
  id: 'NWxiv9k1yrQ',
  title: 'Can I MASTER Petrified Chess?',
  name: 'Petrified Chess (Points)',
  category: 'Variants & Games',
  description: 'When a piece (not a pawn) captures anything but a pawn, it turns to stone on that square: a permanent block nobody can move or capture. Capturing pawns, and capturing with pawns, is free. Pawns may also step one square sideways. Kings can never capture.',
  how_to_win: 'Score the most points: each capture scores the piece\'s value (pawn 1, knight 3, bishop 3, rook 5, queen 9) and checkmate adds 20 and ends the game.',
  player_side: 'white',
  player: { name: 'You', rating: 1550, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },
  opponent: { name: 'deception2', rating: 1470, tagline: 'Petrified Chess opponent on chess.com.' },
  board: { files: 8, ranks: 8, light: '#ECF2D1', dark: '#7B9F58' },
  pieces: {
    P: { name: 'Pawn', value: 110, moves: 'fmWfcFifmnDmsW', pawn: true, enPassant: true, promote: true, san: '' },
    Stone: { name: 'Stone', moves: '', value: 0, blocker: true, capturable: false }
  },
  rules: { win: [{ type: 'points', target: 9999, values: { P: 1, N: 3, B: 3, R: 5, Q: 9 } }] },
  params: { points: true },
  bot: { engine: 'search', elo: 1500, depth: 3, time_ms: 700 },
  clock: { w: 180, b: 180, inc: 0, bot: false },
  vfx: [{ type: 'overlay', at: 'board', image: 'assets/modes/NWxiv9k1yrQ/moai.png', fit: 'contain', duration_ms: 1600, id: 'g5intro' /* video art */ }],
  hooks: 'g5_petrified',
  source: { research: 'research/modes/NWxiv9k1yrQ.json', confidence: 'high', notes: 'Game end without mate (no legal moves / move limit) is decided on points; the losing side of a petrifying capture scores nothing for the stone.' }
});
