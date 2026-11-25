/* Can I CRUSH Mini Chess?  Actually chess.com Minihouse: 6x6 crazyhouse with K, R, N, B and one pawn each.
   Sources: research/modes/YjXV6gL8SsA.json (transcript 0:01 "Mini House Chess where the board is only 6x6 and captured
   pieces can be placed back"), start position from Fairy-Stockfish variants.ini [minihouse]:
   startFen 2bnrk/5p/6/6/P5/KRNB2, promotion to N/B/R on the last rank, no pawn double step.
   Opponent in game 1: bb29 (~1520), 1-minute bullet. */
CM.mode({
  id: 'YjXV6gL8SsA',
  name: 'Minihouse (6x6)',
  category: 'Variants & Games',
  description: 'A 6x6 board where each side has only a king, rook, knight, bishop and one pawn. Captured pieces switch colour and go to your pocket: on your turn you may drop one onto any empty square instead of moving. Pawns cannot be dropped on the first or last rank and promote to a knight, bishop or rook.',
  how_to_win: 'Checkmate. Keep the initiative: drops with check win games.',
  player_side: 'white',
  opponent: { name: 'bb29', rating: 1520, tagline: 'Minihouse opponent on chess.com (game 1)' },
  board: { files: 6, ranks: 6, light: '#ecf1d1', dark: '#7a9f58' },
  pieces: { P: { name: 'Pawn', value: 100, moves: 'fmWfcF', pawn: true, enPassant: false, promote: true } },
  setup: { fen: '2bnrk/5p/6/6/P5/KRNB2' },
  rules: { drops: true, castling: false, enPassant: false, promotion: { choices: ['R', 'N', 'B'] } },
  clock: { w: 60, b: 60, inc: 0 },
  bot: { engine: 'search', elo: 1520, depth: 3, time_ms: 600 },
  source: { research: 'research/modes/YjXV6gL8SsA.json', confidence: 'high' }
});
