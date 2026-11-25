/* Can I BEAT Behind the Mirror?  chess.com community variant vs online viewers (10 min): two mirrored 8x8 halves
   joined into a ring by a black void column in the middle and extension rows above and below. Each side has a ROYAL
   king (left half) and a PLAYABLE king (right half, an ordinary non-royal piece). Checkmate the royal king, or give
   five checks to it. Sources: research/modes/Zc8ljpWtYWQ.json (ring/O layout, 5-check badge, ~25:09 rook sac fifth
   check), frames visual (#ecf2d3/#7da15c, void column, extension squares). Pass 2 (impl-5, 7th session): layout
   transcribed square by square from the video's own still (i.ytimg.com/vi/Zc8ljpWtYWQ/maxres3.jpg): two 6-file halves
   (R B K Q B R | R B Q K B R) split by a 2-file void, extension arches of 4 and 2 squares above and below, and the
   knights start on isolated extension squares outside the arches. The void is the plain page background, as in the
   frames (no mirror effect). Castling off (not seen; inferred). */
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
    files: 14, ranks: 14, light: '#ecf2d3', dark: '#7da15c',
    mask: ['xxxx.xxxx.xxxx', 'xxx.xx..xx.xxx', 'xxxxx....xxxxx', '......xx......', '......xx......', '......xx......',
           '......xx......', '......xx......', '......xx......', '......xx......', '......xx......', 'xxxxx....xxxxx',
           'xxx.xx..xx.xxx', 'xxxx.xxxx.xxxx']
  },
  pieces: {
    J: { name: 'Playable King', moves: 'K', value: 350, glyph: 'K', badge: 'P', castle: false }
  },
  setup: { fen: '4n4n4/3n6n3/14/rbjqbr2rbqkbr/pppppp2pppppp/14/14/14/14/PPPPPP2PPPPPP/RBKQBR2RBQJBR/14/3N6N3/4N4N4' },
  rules: {
    castling: false,
    promotion: { choices: ['Q', 'N', 'R', 'B'], zone: 4 },
    win: [{ type: 'checkmate' }, { type: 'nchecks', n: 5 }]
  },
  clock: { w: 600, b: 600, inc: 0, bot: true },
  bot: { engine: 'search', depth: 3, time_ms: 700 },
  vfx: [{ type: 'overlay', at: 'board', image: 'assets/modes/Zc8ljpWtYWQ/board_layout.png', fit: 'contain', duration_ms: 1600, id: 'g5intro' /* video art */ }],
  hooks: {
    /* pawns start one row up (the extension row sits behind the back rank): give them their double step */
    setup: function (ctx) { ctx.pieces(function (p) { return p.t === 'P'; }).forEach(function (i) { ctx.set(i, Object.assign({}, ctx.at(i), { m: 0 })); }); },
    decorate: function (ctx, sq, p) { if (p && p.t === 'K') { var n = (ctx.state.checks || {})[p.c === 'w' ? 'b' : 'w'] || 0; return n ? { badge: String(n) } : null; } return null; },
    status: function (ctx) { var c = ctx.state.checks || {}; return 'Checks given: you ' + (c.w || 0) + '/5, opponent ' + (c.b || 0) + '/5'; }
  },
  source: { research: 'research/modes/Zc8ljpWtYWQ.json', confidence: 'low', notes: 'Layout and start position from the maxres3 still (right half of the right board is cut off at the frame edge: mirrored from the left half). Castling off and promotion on the far back rank or beyond: inferred.' }
});
