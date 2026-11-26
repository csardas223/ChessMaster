/* Can I BEAT 5D Chess?  5D Chess With Multiverse Time Travel: boards along a time axis and a timeline axis; pieces
   can travel back in time and branch new timelines; you move on every board on the present line, then submit. He does
   the seven tutorial puzzles (rook, knight, bishop, pawn, queen, king, opening trap), beats the weak built-in engine and
   wins a public game. Sources: research/modes/BbgwPj-u_gs.json (beige #d2d2c6 / grey-blue #96a2ba boards on grey,
   purple time-travel arrows, 'Your turn - White pieces'), transcript 0:11-12:30 (puzzles), frame 9:10 (UI colours).
   FULL rules in js/games/g4_5d.js (header lists them); engine test: node tools/test_5d.js. */
CM.mode({
  player: { name: 'You', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },  /* iwantcheckmate's purple king icon from the video */
  vfx: [{ type: 'overlay', at: 'board', image: 'assets/modes/BbgwPj-u_gs/intro.jpg', fit: 'contain', duration_ms: 1400, fade_ms: 300 }],  /* intro card = the video's thumbnail (tools/g4_thumbcrops.py) */
  id: 'BbgwPj-u_gs',
  title: 'Can I BEAT 5D Chess?',
  name: '5D Chess',
  category: 'Variants & Games',
  description: 'Chess with multiverse time travel. Boards run left to right through time and top to bottom across timelines. Every piece also moves along the time and timeline axes (purple dots): moving onto a past board branches a new timeline. Move on every board on the present line (yellow frame), then press Submit Moves. Pick Versus engine or one of the seven tutorial puzzles under the rules.',
  how_to_win: 'Checkmate across the multiverse: leave Black no turn that gets every king out of check, on any board, past ones included.',
  frame: 'game',
  player_side: 'white',
  opponent: { avatar: 'assets/modes/BbgwPj-u_gs/opponent.png', name: 'Built-in engine', rating: null, tagline: 'The weakest CPU: unnatural moves, loves time-travel captures.' },
  board: { files: 8, ranks: 8, light: '#d2d2c6', dark: '#96a2ba' },
  theme: { background: '#4a4d55' },
  game: { module: 'g4_5d', aspect: 0.8, controls: [] },
  sounds: { 'game-start': 'assets/modes/BbgwPj-u_gs/t5d_start.wav', 'capture': 'assets/modes/BbgwPj-u_gs/t5d_capture.wav' },   /* v6 per-mode sound set (tools/sfx/modes_v6.py, wire_v6.py) */
  source: { research: 'research/modes/BbgwPj-u_gs.json', confidence: 'medium', notes: 'Full 5D rules (Steam game rules). Inferred: the R/N/B/Q/K puzzle positions are our own 5x5 mate-in-one turns (the video shows them only partly) and every puzzle is played as White (the video plays the king puzzle as Black); the public online game is replaced by the built-in engine.' }
});
