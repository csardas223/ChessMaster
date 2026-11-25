/* Can I BEAT Setup Chess?  chess.com Setup Chess: the board starts empty; both players alternately place pieces on their own first three
   ranks with a 39-point budget (P1 N3 B3 R5 Q9, king free and compulsory, no pawns on the back rank), then play normal
   chess with White moving first. Shared logic: js/modes/g6_setup.js. Sources: research/modes/f4O--Ai7B9A.json. Video favours rook and bishop batteries (bishops are OP). */
CM.mode({
  id: 'f4O--Ai7B9A',
  name: 'Setup Chess',
  category: 'Variants & Games',
  description: 'The board starts empty. Take turns placing pieces anywhere on your first three ranks: you have 39 points to spend (pawn 1, knight 3, bishop 3, rook 5, queen 9) and must also place your king (free). Pawns cannot go on the back rank. When both armies are built, normal chess begins with White to move.',
  how_to_win: 'Checkmate the enemy king.',
  player_side: 'white',
  player: { name: 'ireallywantcheckmate', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },   /* iwantcheckmate's chess.com handle + purple-king avatar from the frames */
  opponent: { name: 'John_Doyl…', rating: 1500, avatar: 'assets/modes/f4O--Ai7B9A/opp1.png', tagline: 'Builds an army from 39 points.' },
  board: { files: 8, ranks: 8, light: '#ecf2d1', dark: '#7a9e59' },
  setup: { fen: '8/8/8/8/8/8/8/8', turn: 'w', hands: { w: ['K','P','P','P','P','P','P','P','P','P','P','P','P','P','P','P','P','N','N','N','N','N','N','N','N','N','N','N','N','N','B','B','B','B','B','B','B','B','B','B','B','B','B','R','R','R','R','R','R','R','Q','Q','Q','Q'], b: ['K','P','P','P','P','P','P','P','P','P','P','P','P','P','P','P','P','N','N','N','N','N','N','N','N','N','N','N','N','N','B','B','B','B','B','B','B','B','B','B','B','B','B','R','R','R','R','R','R','R','Q','Q','Q','Q'] }, x: { bud: { w: 39, b: 39 }, king: { w: 0, b: 0 } } },
  rules: { drops: true, castling: false },
  clock: null,
  bot: { engine: 'search', elo: 1600, depth: 2, time_ms: 700 },
  hooks: 'g6_setup',
  params: { series: {opponents: [{name: 'John_Doyl…', rating: 1500, avatar: 'assets/modes/f4O--Ai7B9A/opp1.png'}, {name: 'd3sspair', rating: 1522, avatar: 'assets/modes/f4O--Ai7B9A/opp2.png'}]}, budget: 39 },
  vfx_timeline: [{ trigger: 'game_start', once: true, effect: { type: 'overlay', image: 'assets/modes/f4O--Ai7B9A/intro.jpg', fit: 'contain', at: 'board', opacity: 1, duration_ms: 1600, fade_ms: 300 } }, { trigger: 'win', once: true, effect: { type: 'overlay', image: 'assets/modes/f4O--Ai7B9A/you_won.png', fit: 'contain', at: 'board', opacity: 1, duration_ms: 2200, fade_ms: 300 } }],
  source: { research: 'research/modes/f4O--Ai7B9A.json', confidence: 'high', notes: 'Placement order alternates; a side that finishes early stops placing. Castling off (inferred).' }
});
