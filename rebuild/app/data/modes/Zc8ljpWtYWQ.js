/* Can I BEAT Behind the Mirror?  chess.com community variant vs online viewers (10 min): two mirrored 8x8 halves
   joined into a ring by a black void column in the middle and extension rows above and below. Each side has a ROYAL
   king (left half) and a PLAYABLE king (right half, an ordinary non-royal piece). Checkmate the royal king, or give
   five checks to it. Sources: research/modes/Zc8ljpWtYWQ.json (ring/O layout, 5-check badge, ~25:09 rook sac fifth
   check), frames visual (#ecf2d3/#7da15c, void column, extension squares). PASS 1: extension rows are empty (the
   few extra pieces on them were not legible); 17x10 ring approximates the 18x10 estimate. */
CM.mode({
  id: 'Zc8ljpWtYWQ',
  title: 'Can I BEAT Behind the Mirror?',
  name: 'Behind the Mirror',
  category: 'Variants & Games',
  description: 'Two mirrored boards side by side with a void between them; the top and bottom extension rows join them into a ring, so pieces can travel round from one half to the other. Your left king is royal (it must not be checkmated); your right king is a playable king that moves like a king but can be captured and ignores check.',
  how_to_win: 'Checkmate the enemy royal king, or check it five times.',
  player_side: 'white',
  opponent: { name: 'JmeMeister', rating: 1500, tagline: 'Online viewer on chess.com variants.' },
  board: {
    files: 17, ranks: 10, light: '#ecf2d3', dark: '#7da15c',
    mask: ['.................', '........x........', '........x........', '........x........', '........x........',
           '........x........', '........x........', '........x........', '........x........', '.................']
  },
  pieces: {
    J: { name: 'Playable King', moves: 'K', value: 350, glyph: 'K', badge: 'P', castle: false }
  },
  setup: { fen: '17/rnbqkbnr1rnbjqbnr/pppppppp1pppppppp/17/17/17/17/PPPPPPPP1PPPPPPPP/RNBQKBNR1RNBJQBNR/17' },
  rules: {
    castling: true,
    promotion: { choices: ['Q', 'N', 'R', 'B'] },
    win: [{ type: 'checkmate' }, { type: 'nchecks', n: 5 }]
  },
  clock: { w: 600, b: 600, inc: 0, bot: true },
  bot: { engine: 'search', depth: 3, time_ms: 700 },
  hooks: {
    /* pawns start one row up (the extension row sits behind the back rank): give them their double step */
    setup: function (ctx) { ctx.pieces(function (p) { return p.t === 'P'; }).forEach(function (i) { ctx.set(i, Object.assign({}, ctx.at(i), { m: 0 })); }); },
    decorate: function (ctx, sq, p) { if (p && p.t === 'K') { var n = (ctx.state.checks || {})[p.c === 'w' ? 'b' : 'w'] || 0; return n ? { badge: String(n) } : null; } return null; },
    status: function (ctx) { var c = ctx.state.checks || {}; return 'Checks given: you ' + (c.w || 0) + '/5, opponent ' + (c.b || 0) + '/5'; }
  },
  todo_pass2: ['mirror-reflection look on the void column', 'extension-row extra pieces (not legible in frames)'],
  source: { research: 'research/modes/Zc8ljpWtYWQ.json', confidence: 'low', notes: 'Ring layout from frames; exact extension-square shape and extra pieces inferred. 17 files instead of the estimated 18.' }
});
