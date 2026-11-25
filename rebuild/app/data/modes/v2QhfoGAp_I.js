/* Can I BEAT Mini Chess? (Rare Variant)  chess.com Minihouse: a 6x6 board, each side with king, rook, knight, bishop and
   one pawn; captured pieces go to your pocket and can be dropped back as a move. No promotion to a queen.
   Sources: research/modes/v2QhfoGAp_I.json (1-minute games, 3:46 "you can't promote to a queen", drop reserve icon);
   start position from Fairy-Stockfish variants.ini [minihouse]: 2bnrk/5p/6/6/P5/KRNB2, no pawn double step. */
CM.mode({
  id: 'v2QhfoGAp_I',
  name: 'Minihouse (6x6)',
  category: 'Variants & Games',
  description: 'A 6x6 board where each side has only a king, rook, knight, bishop and one pawn. Captured pieces switch colour and go to your pocket: on your turn you may drop one onto any empty square instead of moving. Pawns cannot be dropped on the first or last rank and promote to a knight, bishop or rook (never a queen).',
  how_to_win: 'Checkmate. Drops with check win games.',
  player_side: 'white',
  opponent: { name: 'Online opponent', rating: 1500, avatar: null, tagline: '1-minute Minihouse player.' },
  board: { files: 6, ranks: 6, light: '#ebecd0', dark: '#739552' },
  pieces: { P: { name: 'Pawn', value: 100, moves: 'fmWfcF', pawn: true, enPassant: false, promote: true, san: '' } },
  setup: { fen: '2bnrk/5p/6/6/P5/KRNB2' },
  rules: { drops: true, castling: false, enPassant: false, promotion: { choices: ['R', 'N', 'B'] } },
  clock: { w: 60, b: 60, inc: 0 },
  bot: { engine: 'search', elo: 1500, depth: 3, time_ms: 500 },
  vfx_timeline: [{ trigger: 'game_start', once: true, effect: { type: 'overlay', image: 'assets/modes/v2QhfoGAp_I/reserve_icon.png', fit: 'contain', at: 'board', opacity: 1, duration_ms: 1600, fade_ms: 300 } }],
  source: { research: 'research/modes/v2QhfoGAp_I.json', confidence: 'medium', notes: 'Exact army from Fairy-Stockfish minihouse, consistent with frames (K, R, N, B, pawns).' }
});
