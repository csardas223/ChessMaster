/* Can I BEAT Passant? [Full Release]  Passant, a chess roguelike: he picks setup 4 'Slip and Push' (6 pawns, 2
   bishops and the king, with the Slippy and Push badges), takes Challenging matches and clears the three rounds of
   level 1 by capturing all enemy pieces ($8 per round). Sources: research/modes/OO3XlFQ32i0.json (victory list,
   badges, may move into check / king capture loses), frames visual (#b7def6/#146fab blue board, pink dots,
   'Unstable' tile, Game Over 'You made it to stage 1, round 1'). Logic in js/modes/g5_passant.js. PASS 1: enemy
   armies per round inferred (not legible); no shop/coins/undo charges. Pass 2 (impl-5, 7th session): pink move
   dots, red selected piece in a white box, smoke on capture, 'Player Turn' text, all from the video (js/modes/g5_passant.js).
   g5 art pass 6 (2026-11-25): 'Unstable' is the round-3 boss "Cracked Vase" (a piece status, not a tile) and the pink
   arrows are the last-move trail, both from the transcript + the 17:58 frame; arrow cut by tools/g5_art6.py. */
CM.mode({
  id: 'OO3XlFQ32i0',
  title: 'Can I BEAT Passant? [Full Release]',
  name: 'Passant: Slip and Push',
  category: 'Variants & Games',
  description: 'Setup 4 "Slip and Push": six pawns, two bishops and your king. Slippy: your moved piece slides one more square in the same direction if it is empty, and can slip off the board. Push: a non-capturing move shoves every adjacent piece (not kings) one square away, even off the edge. You may move into check; a captured king loses. Three rounds per level; round 3 is the Boss Round "Cracked Vase": a piece of yours that captures becomes Unstable and has a 1 in 3 chance to destroy itself on each later capture. Pink arrows mark the squares your last moved piece left.',
  how_to_win: 'Any of: capture the king, capture all pieces except the king, check the king 6 turns in a row, or be +7 material for two turns.',
  player_side: 'white',
  player: { name: 'You', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },   /* iwantcheckmate's own avatar (purple king) from the videos */
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
      { name: 'Boss Round', fen: '1rbnkbr1/1pppppp1/8/8/8/8/1PPPPPP1/2B1KB2', boss: 'Cracked Vase' /* transcript 16:21-17:50, frame 17:58 */ }
    ]
  },
  vfx: [{ type: 'overlay', at: 'board', image: 'assets/modes/OO3XlFQ32i0/passant_logo.png', fit: 'contain', duration_ms: 1600, id: 'g5intro' /* video art */ }],
  vfx_timeline: [{ trigger: 'capture', effect: { type: 'particles', kind: 'smoke', at: 'to', count: 14 } }],
  hooks: 'g5_passant',
  todo_pass2: ['shop between rounds (Rainbow pieces, re-roll)', 'undo charges (1 per round)'],
  _art_notes: 'The red crowned piece in the stills is the selected king (red tint inside a white box), not an elite pawn. Passant 3D piece models: only pawns and the black king/knight are visible in the stills, so the standard set is kept.',
  source: { research: 'research/modes/OO3XlFQ32i0.json', confidence: 'medium', notes: 'Enemy armies per round invented to escalate (Challenging matches); badge rules from the transcript.' }
});
