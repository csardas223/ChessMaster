/* Can I MASTER Infinite Chess?  infinitechess.org practice checkmates: normal chess rules on an unbounded board; your
   pieces must box in a lone king that runs for open space (no edges to mate against). Warm-up Q+R+N vs K, then harder
   combinations. Sources: research/modes/fqfCh3CsTJk.json (practice levels, difficulty tiers), frames (#FBD9AA/#DAAD79,
   Play/Practice/Guide menu, orange arrows). The engine's boards are finite, so "infinite" is a 24x24 field seen
   through a window that follows the enemy king (inferred simplification). The later level line-ups are not listed in
   the transcript: levels 2-5 are representative. Levels via js/modes/g6_levels.js. */
CM.mode({
  id: 'fqfCh3CsTJk',
  title: 'Can I MASTER Infinite Chess?',
  name: 'Infinite Chess Practice (Master)',
  category: 'Variants & Games',
  description: 'Practice checkmates on an enormous open board. Sliding pieces have practically unlimited range and the lone king always runs for open space, so you must cut off files and ranks and build a box before mating. Watch out for stalemate.',
  how_to_win: 'Checkmate the lone king in every practice level.',
  player_side: 'white',
  opponent: { name: 'Practice king', rating: null, tagline: 'infinitechess.org practice engine: a lone king that flees.' },
  board: { files: 24, ranks: 24, light: '#fbd9aa', dark: '#daad79', viewport: { files: 11, ranks: 11, mobile: { files: 8, ranks: 8 }, follow: 'bot_king' } },
  setup: { fen: '24/24/24/24/24/24/24/24/24/24/24/24/24/24/24/24/24/24/24/24/24/24/24/24' },
  rules: { castling: false, enPassant: false },
  params: {
    run: 'Level', levelSelect: true, zoom: [8, 12, 24],
    levels: [
      { name: 'Queen, rook and knight', tier: 'easy', fen: '24/24/24/24/24/24/24/24/24/14k9/24/24/24/24/10QRN11/24/24/24/24/24/24/24/24/24', hint: 'No king of your own: the three pieces mate alone' },
      { name: 'King, queen and rook', tier: 'medium', fen: '24/24/24/24/24/24/24/24/24/14k9/24/24/24/24/10K1QR10/24/24/24/24/24/24/24/24/24' },
      { name: 'Two rooks and two bishops', tier: 'medium', fen: '24/24/24/24/24/24/24/24/24/14k9/24/24/24/24/10RRBB10/24/24/24/24/24/24/24/24/24' },
      { name: 'King and two chancellors', tier: 'hard', fen: '24/24/24/24/24/24/24/24/24/14k9/24/24/24/24/10KCC11/24/24/24/24/24/24/24/24/24', hint: 'A chancellor moves like a rook and a knight' },
      { name: 'Four knights and a queen', tier: 'hard', fen: '24/24/24/24/24/24/24/24/24/14k9/24/24/24/24/9NNNNQ10/24/24/24/24/24/24/24/24/24' }
    ]
  },
  bot: { engine: 'search', depth: 3, time_ms: 500 },
  hooks: 'g6_levels',
  vfx_timeline: [{ trigger: 'game_start', once: true, effect: { type: 'overlay', image: 'assets/modes/fqfCh3CsTJk/black_hole.png', fit: 'contain', at: 'board', opacity: 1, duration_ms: 1600, fade_ms: 300 } }],
  source: { research: 'research/modes/fqfCh3CsTJk.json', confidence: 'medium', notes: 'Finite 24x24 field; levels after the first are representative. The black-hole art is the video thumbnail (shown as the intro card); the practice games themselves are on the plain tan board, as in the frames.' }
});
