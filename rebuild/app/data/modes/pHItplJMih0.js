/* Can I EGG OPENING?  Rosen Score word opening: the first letters of your first moves must spell EGG, and the trophy only
   counts if you then win. Sources: research/modes/pHItplJMih0.json (Rosen Score word opening EGG, opponent ~2068). A pawn move counts as its file letter, a piece move as its piece letter. */
CM.mode({
  id: 'pHItplJMih0',
  name: 'Egg Opening',
  category: 'Variants & Games',
  description: 'A Rosen Score challenge: your first moves must spell EGG (E, G, G: for example e4, g3, g4). Pawn moves count as their file letter (e4 and exd5 are both E), piece moves as their letter (B, N, R, Q, K). While a move fits the next letter, only fitting moves are allowed.',
  how_to_win: 'Spell EGG with your opening, then win the game to unlock the trophy.',
  player_side: 'white',
  opponent: { name: 'ldrpugh', rating: 2068, avatar: null, tagline: 'Online opponent who does not know your plan.' },
  board: { files: 8, ranks: 8, light: '#eaedd1', dark: '#759e55' },
  setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR' },
  bot: { engine: 'search', elo: 2068, depth: 4, time_ms: 700 },
  params: { word: 'EGG', side: 'w', title: 'Egg Opening' },
  hooks: 'g6_rosen',
  vfx_timeline: [{ trigger: 'game_start', once: true, effect: { type: 'overlay', image: 'assets/modes/pHItplJMih0/egg.png', fit: 'contain', at: 'board', opacity: 1, duration_ms: 1600, fade_ms: 300 } }],
  source: { research: 'research/modes/pHItplJMih0.json', confidence: 'medium' }
});
