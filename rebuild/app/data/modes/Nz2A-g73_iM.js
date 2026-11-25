/* Can I MASTER FPS Chess?  Back to FPS Chess ('bullet is not a time control') on public servers: every capture
   attempt is a real-time first-person duel (3-2-1 countdown); the king is the strongest fighter (melee swipe), pawns
   shoot, knights have a bow and sprint, bishops fly; damage persists between fights. He bongclouds because the king
   is the best duelist, wins game 1 king vs king, then loses to a sniping pawn. Sources: research/modes/Nz2A-g73_iM.json
   (transcript 1:38 'We start in 3 2 1', class weapons, health carry-over). Duel logic in js/modes/g5_fps.js. */
CM.mode({
  id: 'Nz2A-g73_iM',
  title: 'Can I MASTER FPS Chess?',
  name: 'FPS Chess: Bongcloud',
  category: 'Variants & Games',
  description: 'Normal chess moves, but every capture is a first-person duel: 3-2-1, then tap the enemy to shoot while it shoots back. The king is the strongest fighter (melee swipe, most health), pawns shoot pistols, knights fire a bow and dodge fast, bishops fly. Damage carries over between duels. If the attacker loses, the defender keeps its square. No check: kings can be attacked.',
  how_to_win: 'Win the duel against the enemy king. (The bongcloud is encouraged.)',
  player_side: 'white',
  opponent: { name: 'Public server player', rating: null, tagline: 'Online FPS Chess player.' },
  board: { files: 8, ranks: 8, light: '#eeeed2', dark: '#769656' },
  setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR' },
  rules: { check: 'none', castling: true, promotion: { choices: ['Q', 'N', 'R', 'B'] } },
  bot: { engine: 'search', depth: 3, time_ms: 600, style: 'aggro' },
  params: { arena: { img: 'assets/modes/PszkLYudcws/arena.jpg', wall: '#4a5568', floor: '#2d3a2e', accent: '#9fb3c8' }, duel_card: 'assets/modes/Nz2A-g73_iM/duel_card.jpg', duel_ms: 7000,
    models: { wK: 'assets/modes/Nz2A-g73_iM/model_king_w.png', bN: 'assets/modes/Nz2A-g73_iM/model_knight_b.png', wR: 'assets/modes/PszkLYudcws/model_rook_w.png' } },
  vfx: [{ type: 'overlay', at: 'board', image: 'assets/modes/Nz2A-g73_iM/ak_pawn.png', fit: 'contain', duration_ms: 1600, id: 'g5intro' /* video art */ }],
  hooks: 'g5_fps',
  todo_pass2: ['block / ability (E) and sprint (Shift) controls'],
  _art_gaps: ['3D arena with cover / high ground (the 2D duel uses the Victorian room still from the video)', 'class weapon sprites (not visible in the stills)', 'duel sounds (no audio source in the sandbox)'],
  source: { research: 'research/modes/Nz2A-g73_iM.json', confidence: 'medium', notes: 'Board colours not established (default chess.com green used). Weapon numbers invented; abilities (block, E, sprint) not modelled.' }
});
