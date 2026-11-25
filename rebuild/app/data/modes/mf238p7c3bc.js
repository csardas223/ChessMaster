/* Can I BEAT Infinite Chess? (vs @TwoNiche )  infinitechess.org Classical: normal chess rules, but the board has no edges, so sliders can run off into the
   distance and kings can wander anywhere; you play White against TwoNiche in a best-of-three. Sources: research/modes/mf238p7c3bc.json (best of three, ~5 min clocks),
   frames (#fdd9aa/#d9ac74, spread-out armies). Approximation: a 24x24 field (the engine's boards are finite) with the
   armies in the middle and extra space between them; the camera window follows your king. */
CM.mode({
  id: 'mf238p7c3bc',
  title: 'Can I BEAT Infinite Chess? (vs @TwoNiche )',
  name: 'Infinite Chess vs TwoNiche',
  category: 'Variants & Games',
  description: 'Chess on an enormous board: the classical armies start in the middle with extra room between them and nothing stops a rook or bishop from flying far away. Long-range checks from behind are the main weapon.',
  how_to_win: 'Checkmate the enemy king.',
  player_side: 'white',
  opponent: { name: 'TwoNiche', rating: null, tagline: 'Chess YouTuber; best of three.' },
  board: { files: 24, ranks: 24, light: '#fdd9aa', dark: '#d9ac74', viewport: { files: 12, ranks: 12, mobile: { files: 8, ranks: 8 }, follow: 'player_king' } },
  setup: { fen: '24/24/24/24/24/24/24/24/8rnbqkbnr8/8pppppppp8/24/24/24/24/8PPPPPPPP8/8RNBQKBNR8/24/24/24/24/24/24/24/24' },
  rules: { castling: true, enPassant: true, promotion: { choices: ['Q', 'N', 'R', 'B'], zone: 9 } },
  clock: { w: 300, b: 300, inc: 2, bot: false },
  bot: { engine: 'search', depth: 2, time_ms: 600, min_ms: 350 },
  params: { bestOf: 3, zoom: [8, 12, 24] },
  hooks: 'g6_infinite',
  vfx_timeline: [{ trigger: 'game_start', once: true, effect: { type: 'overlay', image: 'assets/modes/mf238p7c3bc/infinite_king.png', fit: 'contain', at: 'board', opacity: 1, duration_ms: 1600, fade_ms: 300 } }],
  source: { research: 'research/modes/mf238p7c3bc.json', confidence: 'medium', notes: 'Finite 24x24 field; frame colours used (spec thumbnail pink/purple was the thumbnail art).' }
});
