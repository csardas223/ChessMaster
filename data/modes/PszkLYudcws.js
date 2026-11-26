/* Can I BEAT FPS Chess?  FPS Chess: normal chess moves on the board, but every capture attempt becomes a
   first-person-shooter duel between the two pieces in a 3D arena (Victorian red-walled room); the duel winner
   keeps/takes the square. Sources: research/modes/PszkLYudcws.json (duel intro card 'Rook vs Knight', weapons per
   piece inferred), frames visual (#eaeac6/#727266 board, first-person gun view). Duel logic in js/modes/g5_fps.js. */
CM.mode({
  id: 'PszkLYudcws',
  title: 'Can I BEAT FPS Chess?',
  name: 'FPS Chess',
  category: 'Variants & Games',
  description: 'Pieces move like normal chess, but a capture is not automatic: the two pieces fight a real 3D first-person duel in the game\'s Victorian red room (VS card, 3-2-1, then fight on the floor under the giant table that holds the board). Desktop: WASD, mouse aim, click to fire, Shift sprint (bishop flies), E ability, Q block. Phone: joystick, drag to look, Fire button. Each piece has its own weapon and health (king blade, pawn AK, knight crossbow), and damage carries over to later duels. If the attacker loses, the defender keeps its square. There is no check: kings can be attacked like any piece.',
  how_to_win: 'Win the duel against the enemy king.',
  player_side: 'white',
  player: { name: 'You', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },   /* iwantcheckmate's own avatar (purple king) from the videos */
  opponent: { name: 'FPS Chess player', rating: null, tagline: 'Online FPS Chess opponent.' },
  board: { files: 8, ranks: 8, light: '#eaeac6', dark: '#727266' },
  setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR' },
  rules: { check: 'none', castling: true, promotion: { choices: ['Q', 'N', 'R', 'B'] } },
  bot: { engine: 'search', depth: 3, time_ms: 600 },
  params: { arena: { img: 'assets/modes/PszkLYudcws/arena.jpg', wall: '#7a1f22', floor: '#3b2a20', accent: '#c9a227' }, duel_card: 'assets/modes/PszkLYudcws/duel_card.jpg', duel_ms: 7000,
    models: { wR: 'assets/modes/PszkLYudcws/model_rook_w.png', bN: 'assets/modes/PszkLYudcws/model_knight_b.png', wK: 'assets/modes/Nz2A-g73_iM/model_king_w.png' } },
  hooks: { extends: 'g5_fps',   /* ov-3d: real-3D view of the video's game (js/fx/view3d.js on CM.scene3d) wraps the unchanged rules; no WebGL = 2D board */
    onStart: function (ctx) { if (this._base.onStart) this._base.onStart.call(this, ctx); CM.util.loadScript('js/fx/view3d.js').then(function () { if (CM.gameUI.controller === ctx.game) CM.view3d.attach(ctx, 'fps'); }).catch(function (e) { console.warn(e); }); },
    onExit: function (ctx) { if (CM.view3d) CM.view3d.detach(); if (this._base.onExit) this._base.onExit.call(this, ctx); } },
  _art_gaps: ['weapon models for queen / rook / bishop are inferred (only the knight crossbow and the pawn AK are shown)', 'gunshot / arrow / swipe sounds are our own synthesised WAVs (no audio source in the sandbox)', 'room props are code-built approximations of the game art (no model files)'],
  source: { research: 'research/modes/PszkLYudcws.json', confidence: 'medium', notes: 'Weapon/health numbers per class are invented (the video shows the duels, not stats). No check rule assumed (king duel ends it).' }
});
