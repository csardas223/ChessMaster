/* Can I BEAT the 12 Pawns Opening?  A Rosen Score checklist challenge built around a pawn wall (thumbnail: twelve white
   pawns in a row). Sources: research/modes/u0hl8g63mUg.json (low confidence: rated games ~1600, Rosen Score site).
   Rule confirmed by the transcript (cm-recheck2): your first 12 moves must all be pawn moves, then win the game. */
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
  source: { research: 'research/modes/u0hl8g63mUg.json', confidence: 'high', notes: 'cm-recheck2 2026-11-25: transcript (analyze_video) confirms the rule: 0:05 "win a game with 12 consecutive opening pawn moves" for the Rosen Score trophy; 1:48 twelve done in game 1 (White, opponent playing a Queen\'s Indian), won by the opponent disconnecting (3:56-4:22 trophy); 5:28 game 2 broken by a capture with check; 12:42 game 3 won without the twelve. Normal chess otherwise; opponent name/rating from the frames.' }
});
