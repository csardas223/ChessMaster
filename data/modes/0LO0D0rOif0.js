/* Can I BEAT King of the Bridge? (Good Ending)  King of the Bridge (pixel-art troll chess game): a bridge troll plays chess by his own rule book and
   cheats. Sources: research/modes/0LO0D0rOif0.json (+ base rules WEYUcaJTBso), frames visual_* (dark green pixel art).
   Rule book, cheats, accusations and the good ending: js/modes/g4_kotb.js. */
CM.mode({
  id: '0LO0D0rOif0',
  vfx: [{ type: 'overlay', at: 'board', image: 'assets/modes/0LO0D0rOif0/intro.png', fit: 'contain', duration_ms: 1400, fade_ms: 300 }],  /* intro card from the video (tools/g4_sprites.py) */
  title: 'Can I BEAT King of the Bridge? (Good Ending)',
  name: 'King of the Bridge: Good Ending',
  category: 'Other Videos',
  description: 'Chess on the Troll\'s bridge, by his rule book: pawns step one square up, down or sideways (never diagonally); the Horse guy jumps like a knight or steps one square straight; only the knight jumps; the queen may not capture a king; when the Troll\'s king dies his crown passes to his strongest piece. The Troll cheats now and then. Double-tap the piece he cheated with to accuse him: if you are right you get one payback cheat (move any piece anywhere); if you are wrong you lose your turn. Beat the Troll without using a single payback cheat: the Good Ending shows the Troll with a halo.',
  how_to_win: 'Win without using any payback cheat.',
  player_side: 'white',
  opponent: { name: 'The Troll', rating: null, avatar: 'assets/modes/0LO0D0rOif0/troll.png', tagline: 'I feel like we are really getting to know eachother!' },
  board: { files: 8, ranks: 8, light: '#8a8b72', dark: '#2e3b31' },
  /* the game's pixel pieces cut from the video stills (group 5) + cobble-swamp backdrop cropped from the video (group 6) */
  theme: { pieces: '../modes/WEYUcaJTBso/pixel', background: '#16220f url(../assets/modes/hv_NHWqysZE/swamp.jpg) center / cover no-repeat' },
  sounds: { gong: 'assets/modes/hv_NHWqysZE/gong.wav', laugh: 'assets/modes/hv_NHWqysZE/laugh.wav' },
  vfx_timeline: [{ trigger: 'game_start', effect: { type: 'vignette', color: '#0b1206', size: 30, duration_ms: 0, id: 'swamp' } }],
  pieces: {
    P: { name: 'Small-minded pawn', moves: 'W', value: 120 },
    N: { name: 'Horse guy', moves: 'NW', value: 360 },
    K: { name: 'Crown guy', moves: 'K', royal: true, castle: false, value: 0 }
  },
  setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR', x: { ending: 'good', pay: 0, used: 0 } },
  rules: { check: 'none', castling: false, enPassant: false, promotion: false, drawPlies: 300 },
  bot: { engine: 'search', depth: 2, time_ms: 550 },
  params: { ending: 'good', ending_img: 'assets/modes/0LO0D0rOif0/ending.jpg', intro_line: 'I feel like we are really getting to know eachother!', cheatRate: 0.22 },
  hooks: 'g4_kotb',
  source: { research: 'research/modes/0LO0D0rOif0.json', confidence: 'medium', notes: 'Rule book summarised from the base video; cheat types, cheat rate and payback strength are inferred. Slippery tiles, board flip, out-of-town bishops, gifts/bombs and the goose are not modelled yet.' },
  _gameplay_todo: ['slippery tiles + board flip']
});
