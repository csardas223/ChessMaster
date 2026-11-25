/* Can I BEAT Beyond the Board? (Abyss Ending)  The Beyond the Board demo's abyss path: a lone white rook explores
   platforms over a black void (holes it cannot enter, unpushable boxes) toward the end of the path. Sources:
   research/modes/SMOXF1bSsDk.json (single rook, intersection, abyss 3 boxes and holes), frames (void/abyss board,
   lime checker thumbnail #c8f05a/#7cc22a). PASS 1: puzzle levels on the chess board: holes = void, walls = boxes, the
   target is a glowing exit marker the rook must reach (capture). No opponent moves (g5_levels passColor).
   Pass 2 (impl-5, 7th session): look taken from the video's own stills (i.ytimg.com/vi/SMOXF1bSsDk/maxres1..3.jpg):
   white/black checker platforms over a pure black void, grey raised boxes, glowing white exit tile. */
CM.mode({
  id: 'SMOXF1bSsDk',
  title: 'Can I BEAT Beyond the Board? (Abyss Ending)',
  name: 'Beyond the Board: Abyss',
  category: 'Variants & Games',
  description: 'Guide the lone rook down into the abyss. It moves like a rook, but it cannot cross the void (missing squares) or pass the boxes. Find the route to the exit at the bottom of the path.',
  how_to_win: 'Reach the exit marker with your rook.',
  player_side: 'white',
  player: { name: 'You', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },   /* iwantcheckmate's own avatar (purple king) from the videos */
  opponent: { name: 'The Abyss', rating: null, tagline: 'No opponent: just the void.' },
  board: { files: 8, ranks: 8, light: '#ececec', dark: '#1e1e1e', background: '#000000',
    mask: ['....xxxx', '.xx.xxxx', '.xx.....', '.xxxxxx.', '...xx...', 'x.xxxx.x', 'x......x', 'xxxx..xx'] },
  theme: { background: '#000000' },
  pieces: { Ex: { name: 'Exit', moves: '', value: 0, royal: true, glyph: 'K', badge: 'EXIT' } },
  setup: { fen: 'R7/8/8/8/8/8/8/4[ex]3' },
  rules: { check: 'none', castling: false, promotion: false },
  params: {
    passColor: 'b',
    decor: { Ex: 'bb-exit', '#': 'bb-box' },
    css: '.sq.bb-exit .pc,.sq.bb-exit .pc-badge{opacity:0}.sq.bb-exit::after{content:"";position:absolute;inset:14%;background:#fff;box-shadow:0 0 12px 5px rgba(255,255,255,.85);pointer-events:none}.sq.bb-box .blk--wall{background:linear-gradient(#e2e2e2,#a5a5a5);box-shadow:inset 0 -5px 0 #6e6e6e,inset 0 0 0 1px #555}',
    levels: [
      { name: 'Abyss 1', fen: 'R7/8/8/8/8/8/8/4[ex]3' },
      { name: 'Abyss 3: boxes', fen: 'R2*4/8/3*4/8/8/1*4*1/8/4[ex]3' }
    ]
  },
  bot: { engine: 'random' },
  vfx: [{ type: 'overlay', at: 'board', image: 'assets/modes/SMOXF1bSsDk/abyss.png', fit: 'contain', duration_ms: 1600, id: 'g5intro' /* video art */ }],
  hooks: 'g5_levels',
  _deferred: ['true 3D camera / orange accretion-disk backdrop (2D board only; the in-game stills show a black void)', 'collapsing bridge event and wall symbols (not legible in the stills; transcript only)', 'tick-counter buttons from the main game'],
  source: { research: 'research/modes/SMOXF1bSsDk.json', confidence: 'low', notes: 'Level layouts invented; video is a 3D exploration game.' }
});
