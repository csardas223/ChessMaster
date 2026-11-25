/* Can I BEAT 5D Chess?  5D Chess With Multiverse Time Travel: boards along a time axis and a timeline axis; pieces
   can travel back in time and branch new timelines; you move on every present board each turn. He does the tutorial
   puzzles, beats the weak built-in engine and wins a public game. Sources: research/modes/BbgwPj-u_gs.json (beige
   #d2d2c6 / grey-blue #96a2ba boards on grey, purple time-travel arrows, 'Your turn - White pieces').
   REDUCED VERSION (owner-approved), js/games/g4_5d.js: time travel only straight back 1 or 2 turns on the same
   timeline, at most 3 timelines, no check (kings can be captured), no castling/en passant, auto-queen. */
CM.mode({
  player: { name: 'You', rating: null, avatar: 'assets/modes/BbgwPj-u_gs/you.png' },  /* iwantcheckmate's purple king icon from the video */
  vfx: [{ type: 'overlay', at: 'board', image: 'assets/modes/BbgwPj-u_gs/intro.jpg', fit: 'contain', duration_ms: 1400, fade_ms: 300 }],  /* intro card = the video's thumbnail (tools/g4_thumbcrops.py) */
  id: 'BbgwPj-u_gs',
  title: 'Can I BEAT 5D Chess?',
  name: '5D Chess (Lite)',
  category: 'Variants & Games',
  description: 'Chess with multiverse time travel, simplified. Each turn you move once on every timeline\'s present board (the big board on the right of each row). Select a piece, then tap one of the small past boards (1 or 2 turns ago) to send it back in time to the same square: that branches a new timeline. Up to 3 timelines; kings cannot time travel.',
  how_to_win: 'Capture the enemy king on any board in the multiverse (there is no check in this version).',
  frame: 'game',
  player_side: 'white',
  opponent: { avatar: 'assets/modes/BbgwPj-u_gs/opponent.png', name: 'Built-in engine', rating: null, tagline: 'A weak engine that loves time travel captures.' },
  board: { files: 8, ranks: 8, light: '#d2d2c6', dark: '#96a2ba' },
  theme: { background: '#4a4d55' },
  game: { module: 'g4_5d', aspect: 0.8, controls: [] },
  todo_pass2: ['full 4D movement (diagonal through time, across timelines)', 'present line + active/inactive timeline rules', 'multiverse check and checkmate', 'tutorial puzzles (one per piece)', 'board-spawn animation for new timelines', 'submit-turn button'],
  source: { research: 'research/modes/BbgwPj-u_gs.json', confidence: 'medium', notes: 'Reduced rules by design (see header).' }
});
