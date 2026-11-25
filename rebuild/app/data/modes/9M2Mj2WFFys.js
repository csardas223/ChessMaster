/* Can I BEAT Kung Fu Chess?  Real-time chess against the site AI (Intermediate, then Advanced): no turns, either
   side moves any piece at any time, every moved piece cools down (yellow fill) before it can move again; capture the
   king to win. Sources: research/modes/9M2Mj2WFFys.json (bright green/white board #80DB72/#FFFEFF, cooldown
   highlight, AI Player label). Game module js/games/g4_rt.js (variant 'kungfu'). PASS 1: moves resolve instantly with
   a 200 ms slide (no mid-flight captures), no castling/en passant, auto-queen; cooldown 3 s (inferred). */
CM.mode({
  id: '9M2Mj2WFFys',
  title: 'Can I BEAT Kung Fu Chess?',
  name: 'Kung Fu Chess',
  category: 'Real-time Chess',
  description: 'Chess with no turns: you and the AI move whenever you like. After a piece moves it cools down (yellow fill) for 3 seconds. There is no check: kings can be captured. Tap a ready piece, then a square.',
  how_to_win: 'Capture the AI king before it captures yours.',
  frame: 'game',
  player: { name: 'iwantcheckmate', rating: null, avatar: 'assets/avatars/iwantcheckmate.png' },
  player_side: 'white',
  opponent: { name: 'AI Player', rating: null, tagline: 'Intermediate, then Advanced.' },
  board: { files: 8, ranks: 8, light: '#FFFEFF', dark: '#80DB72' },
  game: { module: 'g4_rt', variant: 'kungfu', pieces: 'assets/modes/9M2Mj2WFFys/pieces',  /* the site's piece set cut from the 25% still (tools/g4_art3.py) */
          aspect: 1, cooldown: 3, controls: [] },
  todo_pass2: ['pieces travel over time and can be captured mid-move', 'castling', 'speed setting (standard/lightning)'],
  source: { research: 'research/modes/9M2Mj2WFFys.json', confidence: 'medium', notes: 'Cooldown length and instant moves are simplifications.' }
});
