/* Can I BEAT the 12 Pawns Opening?  A Rosen Score checklist challenge built around a pawn wall (thumbnail: twelve white
   pawns in a row). Sources: research/modes/u0hl8g63mUg.json (low confidence: rated games ~1600, Rosen Score site).
   Inferred rule: your first 12 moves must all be pawn moves, then win the game. */
CM.mode({
  id: 'u0hl8g63mUg',
  name: '12 Pawns Opening',
  category: 'Variants & Games',
  description: 'The 12 Pawns opening: your first twelve moves must all be pawn moves, building a wall across the board. After that, play normally and try to win.',
  how_to_win: 'Make 12 pawn moves in a row from the start, then win the game.',
  player_side: 'white',
  opponent: { name: 'ra_k_chess', rating: 1600, avatar: null, tagline: 'Online opponent around 1600.' },
  board: { files: 8, ranks: 8, light: '#eaedd0', dark: '#759e55' },
  setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR' },
  bot: { engine: 'search', elo: 1600, depth: 4, time_ms: 700 },
  params: { pawns: 12, side: 'w', title: '12 Pawns Opening' },
  hooks: 'g6_rosen',
  vfx_timeline: [{ trigger: 'game_start', once: true, effect: { type: 'overlay', image: 'assets/modes/u0hl8g63mUg/pawn_wall.png', fit: 'contain', at: 'board', opacity: 1, duration_ms: 1600, fade_ms: 300 } }],
  source: { research: 'research/modes/u0hl8g63mUg.json', confidence: 'low', notes: 'Rule inferred from the title and thumbnail.' }
});
