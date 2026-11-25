/* Can I BEAT Beyond the Board? (Abyss Ending)  The Beyond the Board demo's abyss path: a lone white rook explores
   platforms over a black void (holes it cannot enter, unpushable boxes) toward the end of the path. Sources:
   research/modes/SMOXF1bSsDk.json (single rook, intersection, abyss 3 boxes and holes), frames (void/abyss board,
   lime checker thumbnail #c8f05a/#7cc22a). PASS 1: puzzle levels on the chess board: holes = void, walls = boxes, the
   target is a glowing exit marker the rook must reach (capture). No opponent moves (g5_levels passColor). */
CM.mode({
  id: 'SMOXF1bSsDk',
  title: 'Can I BEAT Beyond the Board? (Abyss Ending)',
  name: 'Beyond the Board: Abyss',
  category: 'Variants & Games',
  description: 'Guide the lone rook down into the abyss. It moves like a rook, but it cannot cross the void (missing squares) or pass the boxes. Find the route to the exit at the bottom of the path.',
  how_to_win: 'Reach the exit marker with your rook.',
  player_side: 'white',
  opponent: { name: 'The Abyss', rating: null, tagline: 'No opponent: just the void.' },
  board: { files: 8, ranks: 8, light: '#c8f05a', dark: '#7cc22a', background: '#05060a',
    mask: ['....xxxx', '.xx.xxxx', '.xx.....', '.xxxxxx.', '...xx...', 'x.xxxx.x', 'x......x', 'xxxx..xx'] },
  pieces: { Ex: { name: 'Exit', moves: '', value: 0, royal: true, glyph: 'K', badge: 'EXIT' } },
  setup: { fen: 'R7/8/8/8/8/8/8/4[ex]3' },
  rules: { check: 'none', castling: false, promotion: false },
  params: {
    passColor: 'b',
    levels: [
      { name: 'Abyss 1', fen: 'R7/8/8/8/8/8/8/4[ex]3' },
      { name: 'Abyss 3: boxes', fen: 'R2*4/8/3*4/8/8/1*4*1/8/4[ex]3' }
    ]
  },
  bot: { engine: 'random' },
  vfx: [{ type: 'overlay', at: 'board', image: 'assets/modes/SMOXF1bSsDk/abyss.png', fit: 'contain', duration_ms: 1600, id: 'g5intro' /* video art */ }],
  hooks: 'g5_levels',
  todo_pass2: ['3D-style platform look and abyss/black-hole backdrop (orange accretion disk)', 'exit marker art', 'collapsing bridge event', 'wall symbols (rook / four stages)', 'tick-counter buttons from the main game'],
  source: { research: 'research/modes/SMOXF1bSsDk.json', confidence: 'low', notes: 'Level layouts invented; video is a 3D exploration game.' }
});
