/* Can I BEAT King of the Bridge? (Showdown Ending)  King of the Bridge (pixel-art troll chess game): a bridge troll plays chess by his own rule book and
   cheats. Sources: research/modes/4KetMbEVvhI.json (+ base rules WEYUcaJTBso), frames visual_* (dark green pixel art).
   Rule book, cheats, accusations and the showdown ending: js/modes/g4_kotb.js. */
CM.mode({
  id: '4KetMbEVvhI',
  vfx: [{ type: 'overlay', at: 'board', image: 'assets/modes/4KetMbEVvhI/intro.png', fit: 'contain', duration_ms: 1400, fade_ms: 300 }],  /* intro card from the video (tools/g4_sprites.py) */
  title: 'Can I BEAT King of the Bridge? (Showdown Ending)',
  name: 'King of the Bridge: Showdown',
  category: 'Other Videos',
  description: 'Chess on the Troll\'s bridge, by his rule book: pawns step one square up, down or sideways (never diagonally); the Horse guy jumps like a knight or steps one square straight; only the knight jumps; the queen may not capture a king; when the Troll\'s king dies his crown passes to his strongest piece. The Troll cheats now and then. Double-tap the piece he cheated with to accuse him: if you are right you get one payback cheat (move any piece anywhere); if you are wrong you lose your turn. Showdown award: trade everything off until only the two kings are left; then the goose carries the Troll king out of town.',
  how_to_win: 'End with only the two kings on the board.',
  player_side: 'white',
  opponent: { name: 'The Troll', rating: null, avatar: 'assets/modes/0LO0D0rOif0/troll.png', tagline: 'I feel like we are really getting to know eachother!' },
  board: { files: 8, ranks: 8, light: '#8a8b72', dark: '#4f5540' },
  theme: { background: '#1f2a1c' },
  pieces: {
    P: { name: 'Small-minded pawn', moves: 'W', value: 120 },
    N: { name: 'Horse guy', moves: 'NW', value: 360 },
    K: { name: 'Crown guy', moves: 'K', royal: true, castle: false, value: 0 }
  },
  setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR', x: { ending: 'showdown', pay: 0, used: 0 } },
  rules: { check: 'none', castling: false, enPassant: false, promotion: false, drawPlies: 300 },
  bot: { engine: 'search', depth: 2, time_ms: 550 },
  params: { ending: 'showdown', cheatRate: 0.22 },
  hooks: 'g4_kotb',
  source: { research: 'research/modes/4KetMbEVvhI.json', confidence: 'medium', notes: 'Rule book summarised from the base video; cheat types, cheat rate and payback strength are inferred. Slippery tiles, board flip, out-of-town bishops, gifts/bombs and the goose are not modelled yet.' },
  todo_pass2: ['pixel-art bridge scene + chunky cream/black pixel pieces', 'Troll portrait + dialogue boxes', 'rule book page overlay for accusations', 'slippery tiles + board flip', 'ending cutscene art (showdown)', 'gong sound when a hidden rule unlocks']
});
