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
  description: 'Normal chess moves, but every capture is a real 3D first-person duel in the game\'s Victorian red room: VS card, 3-2-1, then fight. The king is the strongest fighter (melee swipe, most health), pawns shoot AKs, knights fire a crossbow and sprint with Left Shift, bishops fly, E is each piece\'s ability and you can block shots. Chairs and book stacks give high ground. Damage carries over between duels. If the attacker loses, the defender keeps its square. No check: kings can be captured.',
  how_to_win: 'Win the duel against the enemy king. (The bongcloud is encouraged.)',
  player_side: 'white',
  player: { name: 'You', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },   /* iwantcheckmate's own avatar (purple king) from the videos */
  opponent: { name: 'Public server player', rating: null, tagline: 'Online FPS Chess player.' },
  board: { files: 8, ranks: 8, light: '#eeeed2', dark: '#769656' },
  setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR' },
  rules: { check: 'none', castling: true, promotion: { choices: ['Q', 'N', 'R', 'B'] } },
  bot: { engine: 'search', depth: 3, time_ms: 600, style: 'aggro' },
  params: { arena: { img: 'assets/modes/PszkLYudcws/arena.jpg', wall: '#4a5568', floor: '#2d3a2e', accent: '#9fb3c8' }, duel_card: 'assets/modes/Nz2A-g73_iM/duel_card.jpg', duel_ms: 7000,
    models: { wK: 'assets/modes/Nz2A-g73_iM/model_king_w.png', bN: 'assets/modes/Nz2A-g73_iM/model_knight_b.png', wR: 'assets/modes/PszkLYudcws/model_rook_w.png' } },
  vfx: [{ type: 'overlay', at: 'board', image: 'assets/modes/Nz2A-g73_iM/ak_pawn.png', fit: 'contain', duration_ms: 1600, id: 'g5intro' /* video art */ }],
  hooks: { extends: 'g5_fps',   /* g5 2026-11-25: duel controls Block (Q) / Sprint-Fly (Shift) / class Ability (E) from the transcript, see js/modes/g5_fps.js */   /* ov-3d: real-3D view of the video's game (js/fx/view3d.js on CM.scene3d) wraps the unchanged rules; no WebGL = 2D board */
    onStart: function (ctx) { if (this._base.onStart) this._base.onStart.call(this, ctx); CM.util.loadScript('js/fx/view3d.js').then(function () { if (CM.gameUI.controller === ctx.game) CM.view3d.attach(ctx, 'fps'); }).catch(function (e) { console.warn(e); }); },
    onExit: function (ctx) { if (CM.view3d) CM.view3d.detach(); if (this._base.onExit) this._base.onExit.call(this, ctx); } },
  _art_gaps: ['weapon models for queen / rook / bishop are inferred (not shown in the video)', 'duel sounds are our own synthesised WAVs (no audio source in the sandbox)', 'room props are code-built approximations of the game art (no model files)'],
  source: { research: 'research/modes/Nz2A-g73_iM.json', confidence: 'medium', notes: 'Board colours not established (default chess.com green used). Weapon numbers invented; abilities (block, E, sprint) not modelled.' }
});
