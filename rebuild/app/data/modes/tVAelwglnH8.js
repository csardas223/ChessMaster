/* Can I SURVIVE Capture Anything?  Any piece may capture any piece, including your own (eat your own pawn to free a bishop
   or escape a back-rank mate). Kings cannot be captured. Sources: research/modes/tVAelwglnH8.json (opponents Janak1324 1744,
   genkiman 1743; orange arrow on an own-piece capture; normal check rules). */
CM.mode({
  id: 'tVAelwglnH8',
  name: 'Capture Anything',
  category: 'Variants & Games',
  description: 'Normal chess, except every piece can also capture pieces of its own colour (never a king). Eat your own pawn to open a diagonal, or take your own rook to make an escape square.',
  how_to_win: 'Checkmate.',
  player_side: 'white',
  opponent: { name: 'Janak1324', rating: 1744, avatar: null, tagline: 'Higher-rated Capture Anything player.' },
  board: { files: 8, ranks: 8, light: '#ebf3d0', dark: '#7b9e58' },
  setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR' },
  rules: { friendlyCapture: true },
  clock: { w: 180, b: 180, inc: 0 },
  bot: { engine: 'search', elo: 1744, depth: 3, time_ms: 800 },
  vfx_timeline: [{ trigger: 'game_start', once: true, effect: { type: 'overlay', image: 'assets/modes/tVAelwglnH8/intro.jpg', fit: 'contain', at: 'board', opacity: 1, duration_ms: 1600, fade_ms: 300 } },  { trigger: 'capture', effect: { type: 'highlight', at: 'to', color: 'rgba(255,140,0,.45)', duration_ms: 500 } } ],
  source: { research: 'research/modes/tVAelwglnH8.json', confidence: 'high' }
});
