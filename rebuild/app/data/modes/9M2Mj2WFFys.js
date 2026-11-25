/* Can I BEAT Kung Fu Chess?  Real-time chess against the site AI (Intermediate, then Advanced): no turns, either
   side moves any piece at any time, every moved piece cools down (yellow fill) before it can move again; capture the
   king to win. Sources: research/modes/9M2Mj2WFFys.json (bright green/white board #80DB72/#FFFEFF, cooldown
   highlight, AI Player label). Game module js/games/g4_rt.js (variant 'kungfu'). Pass 2: pieces travel square by square and can be
   captured mid-move (earlier mover wins a head-on meeting), castling, speed picker Standard (1 s/square, 10 s cooldown)
   / Lightning (0.2 s/square, 2 s cooldown) as on kfchess.com; no en passant, auto-queen. */
CM.mode({
  id: '9M2Mj2WFFys',
  title: 'Can I BEAT Kung Fu Chess?',
  name: 'Kung Fu Chess',
  category: 'Real-time Chess',
  description: 'Chess with no turns: you and the AI move whenever you like. Pieces travel across the board in real time and can be captured on the way; after arriving a piece cools down (yellow fill). There is no check: kings can be captured. You can castle. Pick Standard or Lightning speed in the side panel. Tap a ready piece, then a square.',
  how_to_win: 'Capture the AI king before it captures yours.',
  frame: 'game',
  player: { name: 'iwantcheckmate', rating: null, avatar: 'assets/avatars/iwantcheckmate.png' },
  player_side: 'white',
  opponent: { name: 'AI Player', rating: null, tagline: 'Intermediate, then Advanced.' },
  board: { files: 8, ranks: 8, light: '#FFFEFF', dark: '#80DB72' },
  game: { module: 'g4_rt', variant: 'kungfu', pieces: 'assets/modes/9M2Mj2WFFys/pieces',  /* the site's piece set cut from the 25% still (tools/g4_art3.py) */
          aspect: 1, speed: 'standard', controls: [] },
  source: { research: 'research/modes/9M2Mj2WFFys.json', confidence: 'medium', notes: 'Travel/cooldown timings follow kfchess.com Standard/Lightning (the video does not state numbers). No en passant.' }
});
