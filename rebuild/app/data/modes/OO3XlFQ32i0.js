/* Can I BEAT Passant? [Full Release]  Passant, a chess roguelike: he picks setup 4 'Slip and Push' (6 pawns, 2
   bishops and the king, with the Slippy and Push badges), takes Challenging matches and clears the three rounds of
   level 1 by capturing all enemy pieces ($8 per round). Sources: research/modes/OO3XlFQ32i0.json (victory list,
   badges, may move into check / king capture loses), frames visual (#b7def6/#146fab blue board, pink dots,
   'Unstable' tile, Game Over 'You made it to stage 1, round 1'). Logic in js/modes/g5_passant.js. PASS 1: enemy
   armies per round inferred (not legible); no shop/coins/undo charges. */
CM.mode({
  id: 'OO3XlFQ32i0',
  title: 'Can I BEAT Passant? [Full Release]',
  name: 'Passant: Slip and Push',
  category: 'Variants & Games',
  description: 'Setup 4 "Slip and Push": six pawns, two bishops and your king. Slippy: your moved piece slides one more square in the same direction if it is empty, and can slip off the board. Push: a non-capturing move shoves every adjacent piece (not kings) one square away, even off the edge. You may move into check; a captured king loses. Three rounds per level.',
  how_to_win: 'Any of: capture the king, capture all pieces except the king, check the king 6 turns in a row, or be +7 material for two turns.',
  player_side: 'white',
  opponent: { name: 'Passant AI', rating: null, tagline: 'Challenging match: a stronger enemy army each round.' },
  board: { files: 8, ranks: 8, light: '#b7def6', dark: '#146fab' },
  setup: { fen: '4k3/pppppppp/8/8/8/8/1PPPPPP1/2B1KB2' },
  rules: { check: 'none', castling: false, promotion: { choices: ['Q', 'N', 'R', 'B'] } },
  bot: { engine: 'search', depth: 3, time_ms: 600 },
  params: {
    human: 'w',
    badges: { slippy: true, push: true },
    rounds: [
      { name: 'Challenging match', fen: '3nk3/2pppp2/8/8/8/8/1PPPPPP1/2B1KB2' },
      { name: 'Challenging match', fen: '2bnkn2/1pppppp1/8/8/8/8/1PPPPPP1/2B1KB2' },
      { name: 'Challenging match', fen: '1rbnkbr1/1pppppp1/8/8/8/8/1PPPPPP1/2B1KB2' }
    ]
  },
  hooks: 'g5_passant',
  todo_pass2: ["'Player Turn' banner", 'pink move dots', 'smoke puff on capture', 'Unstable / arrow special tiles', 'shop between rounds (Rainbow pieces, re-roll)', 'red crowned elite pawn art', 'undo charges (1 per round)'],
  source: { research: 'research/modes/OO3XlFQ32i0.json', confidence: 'medium', notes: 'Enemy armies per round invented to escalate (Challenging matches); badge rules from the transcript.' }
});
