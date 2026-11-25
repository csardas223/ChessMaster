/* Can I BEAT Infinite Chess? (vs Pjschess)  infinitechess.org Classical: normal chess rules, but the board has no edges, so sliders can run off into the
   distance and kings can wander anywhere; you play Black against PJs Chess in a best-of-three at 5+2. Sources: research/modes/iUUoeJL1FvY.json (best of three, ~5 min clocks),
   frames (#f0d9b5/#deae72, spread-out armies). Approximation: a 24x24 field (the engine's boards are finite) with the
   armies in the middle and extra space between them; the camera window follows your king. */
CM.mode({
  id: 'iUUoeJL1FvY',
  title: 'Can I BEAT Infinite Chess? (vs Pjschess)',
  name: 'Infinite Chess vs PJs Chess',
  category: 'Variants & Games',
  description: 'Chess on an enormous board: the classical armies start in the middle with extra room between them and nothing stops a rook or bishop from flying far away. Long-range checks from behind are the main weapon.',
  how_to_win: 'Checkmate the enemy king.',
  player_side: 'black',
  opponent: { name: 'PJs Chess', rating: null, tagline: 'Chess YouTuber; best of three at 5+2.' },
  board: { files: 24, ranks: 24, light: '#fad8aa', dark: '#daad76', viewport: { files: 12, ranks: 12, mobile: { files: 8, ranks: 8 }, follow: 'player_king' } },
  setup: { fen: '24/24/24/24/24/8rnbqkbnr8/8pppppppp8/24/24/24/24/24/24/24/24/24/24/8PPPPPPPP8/8RNBQKBNR8/24/24/24/24/24' },
  rules: { castling: true, enPassant: true, promotion: { choices: ['Q', 'N', 'R', 'B'], zone: 1 } },
  clock: { w: 300, b: 300, inc: 2, bot: false },
  bot: { engine: 'search', depth: 2, time_ms: 600, min_ms: 350 },
  vfx_timeline: [{ trigger: 'game_start', once: true, effect: { type: 'overlay', image: 'assets/modes/iUUoeJL1FvY/intro.jpg', fit: 'contain', at: 'board', opacity: 1, duration_ms: 1600, fade_ms: 300 } }],
  todo_pass2: ['best-of-three match score', 'PJs Chess avatar (original drawing)', 'zoom out / pan controls', 'perspective endless-board look from the thumbnail'],
  source: { research: 'research/modes/iUUoeJL1FvY.json', confidence: 'medium', notes: 'Finite 24x24 field; pawns promote on the far edge of the field (inferred).' }
});
