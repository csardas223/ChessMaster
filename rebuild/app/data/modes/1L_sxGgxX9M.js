/* Can I BEAT Passant? [Conclusion]  Final Passant runs: shop upgrades between rounds (Rainbow pieces, re-roll),
   escalating enemy armies and a Boss Round against the Rainbow Bishop, whose blue laser beams sweep down files.
   Sources: research/modes/1L_sxGgxX9M.json (frames: SHOP, Balance $12/$10, Boss Round panel "Rainbow Bishop", blue
   laser beam on a file, Undo/Recycle, 'Player Turn'; pink/white + dark brown board), rules shared with the full
   release video OO3XlFQ32i0 (js/modes/g5_passant.js, reused read-only: Slippy + Push badges, four victory
   conditions, may move into check, captured king loses). PASS 1: the shop is represented by the upgraded army each
   round starts with (a Rainbow Bishop bought after round 2); enemy armies and the Rainbow Bishop's move
   (bishop + one orthogonal step) are inferred, the boss's laser is an event that clears a random file of pawns. */
CM.mode({
  id: '1L_sxGgxX9M',
  title: 'Can I BEAT Passant? [Conclusion]',
  name: 'Passant: The Conclusion',
  category: 'Variants & Games',
  description: 'The full Passant run: six rounds against stronger and stronger armies, ending in the Boss Round against the Rainbow Bishop. Your Slippy badge makes moved pieces slide one extra square (even off the edge); Push shoves adjacent pieces away after a quiet move. You may move into check; a captured king loses. Rainbow Bishops move like a bishop or one square straight.',
  how_to_win: 'Win each round by any of: capture the king, capture all pieces except the king, check the king 6 turns in a row, or be +7 material for two turns. Beat the boss to finish the run.',
  player_side: 'white',
  opponent: { name: 'Passant AI', rating: null, tagline: 'Level 2, level 3, then the Rainbow Bishop boss.' },
  board: { files: 8, ranks: 8, light: '#e8b8c8', dark: '#70361c' },
  theme: { background: '#a26535' },
  pieces: {
    Y: { name: 'Rainbow Bishop', moves: 'BW', value: 450, glyph: 'B', badge: 'R' }
  },
  setup: { fen: '4k3/pppppppp/8/8/8/8/1PPPPPP1/2B1KB2' },
  rules: { check: 'none', castling: false, promotion: { choices: ['Q', 'N', 'R', 'B'] } },
  bot: { engine: 'search', depth: 3, time_ms: 600 },
  params: {
    human: 'w',
    badges: { slippy: true, push: true },
    rounds: [
      { name: 'Level 2: Standard match', fen: '2bnkn2/1pppppp1/8/8/8/8/1PPPPPP1/2B1KB2' },
      { name: 'Level 2: Challenging match', fen: '1rbnkbr1/1pppppp1/8/8/8/8/1PPPPPP1/2Y1KB2' },
      { name: 'Level 3: Standard match', fen: 'r1bqk1nr/1pppppp1/8/8/8/8/1PPPPPP1/2Y1KY2' },
      { name: 'Level 3: Challenging match', fen: 'rnbqkbnr/1pppppp1/8/8/8/8/PPPPPPPP/2Y1KY2' },
      { name: 'BOSS ROUND: Rainbow Bishop', fen: 'ryyqkyyr/pppppppp/8/8/8/8/PPPPPPPP/2Y1KY2' }
    ]
  },
  events: [
    { when: 'every_plies:8', do: [{ message: 'Boss: a laser sweeps a file!' }, { remove: { at: 'random_piece', types: ['P'], count: 1 } }, { fx: 'flash:#3aa0ff' }] }
  ],
  hooks: 'g5_passant',
  todo_pass2: ["Rainbow Bishop art (rainbow-tinted bishop) instead of badge", "blue laser beam VFX down a file, only in the Boss Round", "SHOP screen between rounds (upgrades, Re-roll $2, balance)", "'Player Turn' banner", 'pink move dots', 'smoke puff on capture', 'Undo / Recycle charges'],
  source: { research: 'research/modes/1L_sxGgxX9M.json', confidence: 'medium', notes: 'Own transcript unavailable (429); rules from OO3XlFQ32i0. Armies, Rainbow Bishop move and laser rate inferred.' }
});
