/* Can I BEAT King of the Bridge? (Overkill Ending)  King of the Bridge (pixel-art troll chess game): a bridge troll plays chess by his own rule book and
   cheats. Sources: research/modes/1FKa1LnTDeQ.json (+ base rules WEYUcaJTBso), frames visual_* (dark green pixel art).
   Rule book, cheats, accusations and the overkill ending: js/modes/g4_kotb.js. */
CM.mode({
  id: '1FKa1LnTDeQ',
  vfx: [{ type: 'overlay', at: 'board', image: 'assets/modes/1FKa1LnTDeQ/intro.png', fit: 'contain', duration_ms: 1400, fade_ms: 300 }],  /* intro card from the video (tools/g4_sprites.py) */
  title: 'Can I BEAT King of the Bridge? (Overkill Ending)',
  name: 'King of the Bridge: Overkill',
  category: 'Other Videos',
  description: 'Chess on the Troll\'s bridge, by his rule book: pawns step one square up, down or sideways (never diagonally); the Horse guy jumps like a knight or steps one square straight; only the knight jumps; the queen may not capture a king; when the Troll\'s king dies his crown passes to his strongest piece. The Troll cheats now and then. Double-tap the piece he cheated with to accuse him: if you are right you get one payback cheat (move any piece anywhere); if you are wrong you lose your turn. Overkill achievement: beat the Troll while keeping at least 10 of your 16 pieces (it took about 45 attempts in the video).',
  how_to_win: 'Wipe out the Troll\'s army with at least 10 of your pieces still standing.',
  player_side: 'white',
  opponent: { name: 'The Troll', rating: null, avatar: 'assets/modes/0LO0D0rOif0/troll.png', tagline: 'I feel like we are really getting to know eachother!' },
  board: { files: 8, ranks: 8, light: '#8a8b72', dark: '#4f5540' },
  theme: { background: '#1f2a1c' },
  pieces: {
    P: { name: 'Small-minded pawn', moves: 'W', value: 120 },
    N: { name: 'Horse guy', moves: 'NW', value: 360 },
    K: { name: 'Crown guy', moves: 'K', royal: true, castle: false, value: 0 }
  },
  setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR', x: { ending: 'overkill', pay: 0, used: 0 } },
  rules: { check: 'none', castling: false, enPassant: false, promotion: false, drawPlies: 300 },
  bot: { engine: 'search', depth: 2, time_ms: 550 },
  params: { ending: 'overkill', cheatRate: 0.22 },
  hooks: 'g4_kotb',
  source: { research: 'research/modes/1FKa1LnTDeQ.json', confidence: 'medium', notes: 'Rule book summarised from the base video; cheat types, cheat rate and payback strength are inferred. Slippery tiles, board flip, out-of-town bishops, gifts/bombs and the goose are not modelled yet.' },
  todo_pass2: ['pixel-art bridge scene + chunky cream/black pixel pieces', 'Troll portrait + dialogue boxes', 'rule book page overlay for accusations', 'slippery tiles + board flip', 'ending cutscene art (overkill)', 'gong sound when a hidden rule unlocks']
});
