/* Can I BEAT Beyond the Board?  Demo of a minimalist 3D puzzle adventure: it opens as a winning chess position for White;
   when you give check the pieces are "kidnapped" and the black king flees into the abyss, so you chase it as a lone
   rook over floating platforms. Enemy rooks capture you if you step into their line of sight; the Eldritch King boss
   charges a beam. Sources: research/modes/xlErokL2-4c.json (opening up two rooks and a knight vs two dark-squared
   bishops; rook puzzles; Eldritch King), frames (lime checker #c8f05a/#7cc22a on a black void). PASS 1: level 1 is the
   opening position vs the bot; the rook levels are original layouts on masked boards where the enemy rooks are
   sentries (they only ever capture, js/modes/g6_levels.js captureOnly via level x). */
CM.mode({
  id: 'xlErokL2-4c',
  title: 'Can I BEAT Beyond the Board?',
  name: 'Beyond the Board',
  category: 'Variants & Games',
  description: 'Start from a winning position, then chase the fleeing king with a lone rook across floating platforms over the void. Enemy rooks are sentries: they never wander, but they take you the moment you stand in their line. The missing squares are the abyss.',
  how_to_win: 'Capture the king at the end of every level.',
  player_side: 'white',
  opponent: { name: 'Eldritch King', rating: null, tagline: 'The black king that fled beyond the board.' },
  board: { files: 8, ranks: 8, light: '#c8f05a', dark: '#7cc22a', background: '#05060a' },
  setup: { fen: '2b1k3/8/8/2b5/8/8/8/R2NK2R' },
  rules: { check: 'none', castling: false, promotion: { choices: ['Q', 'N', 'R', 'B'] } },
  params: {
    run: 'Level',
    levels: [
      { name: 'The opening', fen: '2b1k3/8/8/2b5/8/8/8/R2NK2R', hint: 'Up two rooks and a knight: take the king', x: { captureOnly: null } },
      { name: 'The plank', fen: '7k/8/8/8/8/8/8/R7', hint: 'A rook, a plank and a fleeing king', x: { passColor: 'b' } },
      { name: 'Sentries', fen: '3r3k/8/8/8/8/8/6r1/R7', hint: 'Never stop in a sentry\'s line', x: { captureOnly: 'b' } },
      { name: 'Eldritch King', fen: 'r6k/8/8/3**3/3**3/8/1r6/4R3', hint: 'Go around the pillar', x: { captureOnly: 'b' } }
    ]
  },
  bot: { engine: 'search', depth: 3, time_ms: 500 },
  hooks: 'g6_levels',
  todo_pass2: ['3D floating-platform look over the void, camera rotate', 'kidnapping cutscene after the first check', 'buttons with tick counters that move platforms', 'Eldritch King hexagon counter and beam (fires when it reaches 4)', 'wall-symbol hints', 'sinking hymn music'],
  vfx_timeline: [{ trigger: 'game_start', once: true, effect: { type: 'overlay', image: 'assets/modes/xlErokL2-4c/chess_clock.png', fit: 'contain', at: 'board', opacity: 1, duration_ms: 1600, fade_ms: 300 } }],
  source: { research: 'research/modes/xlErokL2-4c.json', confidence: 'medium', notes: 'Opening squares and rook level layouts invented; rules from transcript.' }
});
