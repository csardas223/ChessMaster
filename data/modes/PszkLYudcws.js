/* Can I BEAT FPS Chess?  FPS Chess: normal chess moves on the board, but every capture attempt becomes a
   first-person-shooter duel between the two pieces in a 3D arena (Victorian red-walled room); the duel winner
   keeps/takes the square. Sources: research/modes/PszkLYudcws.json (duel intro card 'Rook vs Knight', weapons per
   piece inferred), frames visual (#eaeac6/#727266 board, first-person gun view). Duel logic in js/modes/g5_fps.js. */
CM.mode({
  id: 'PszkLYudcws',
  title: 'Can I BEAT FPS Chess?',
  name: 'FPS Chess',
  category: 'Variants & Games',
  description: 'Pieces move like normal chess, but a capture is not automatic: the two pieces fight a real 3D first-person duel. You are a tiny chess piece standing on the board, which sits on a table in a giant red room: jump down to the carpet, ride past the toy train, and hold Space against a wall to climb back up. VS card, 3-2-1, GO. Each piece has its own weapon: pawn musket, knight bow, bishop long musket, rook sniper, queen minigun (no reload), king sword. Desktop: WASD, mouse aim, hold left click to shoot, hold right click to block, Left Shift movement ability, E second ability, Space jump/climb. Phone: joystick, drag to look, FIRE, BLOCK, JUMP and the two ability tiles. There is no health bar: damage cracks the screen and slowly heals, and it carries over to later duels. If the attacker loses, the defender keeps its square. There is no check: kings can be attacked like any piece.',
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
  _art_gaps: ['weapon models are code-built from the frames (pawn musket, knight bow, bishop long musket, rook sniper, queen minigun, king sword; SPEC.md)', 'gunshot / arrow / swipe sounds are our own synthesised WAVs (no audio source in the sandbox)', 'room props are code-built approximations of the game art (no model files)'],
  source: { research: 'research/modes/PszkLYudcws.json', confidence: 'medium', notes: 'Duel per research/ref/m-fps/SPEC.md (m-fps 2026-11-26): weapons, Left Shift/E tiles, HUD, room and KILL CAM from the frames; hp/damage/rates and the effects of unseen abilities are INFERRED (docs/fps3d-wip.md). No check rule assumed (king duel ends it).' }
});
