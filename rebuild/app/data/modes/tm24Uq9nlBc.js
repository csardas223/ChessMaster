/* Can I Beat LUXURY Chess?  "Luxury Chess" is a Roblox chess game: a wooden board in a gold frame with avatars around it
   and a VS splash card. Underneath it is ordinary chess. Sources: research/modes/tm24Uq9nlBc.json (frames: light/dark wood
   board #c6ae66/#727266, VS cards mc_waffles vs moralistically). */
CM.mode({
  id: 'tm24Uq9nlBc',
  name: 'Luxury Chess',
  category: 'Variants & Games',
  description: 'A Roblox chess game with a fancy wooden board in a gold frame. Under the luxury it is ordinary chess against another Roblox player.',
  how_to_win: 'Checkmate your opponent.',
  player_side: 'white',
  player: { name: 'mc_waffles', rating: null },
  opponent: { name: 'moralistically', rating: null, avatar: null, tagline: 'Roblox player standing next to the board.' },
  board: { files: 8, ranks: 8, light: '#c6ae66', dark: '#727266' },
  theme: { background: '#3a2c14' },
  setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR' },
  bot: { engine: 'auto', elo: 1350, time_ms: 600 },
  vfx: [ { type: 'text', text: 'mc_waffles  VS  moralistically', at: 'board', color: '#f3d36b', size: 28, duration_ms: 1600 } ],
  vfx_timeline: [{ trigger: 'game_start', once: true, effect: { type: 'overlay', image: 'assets/modes/tm24Uq9nlBc/luxury_board.png', fit: 'contain', at: 'board', opacity: 1, duration_ms: 1600, fade_ms: 300 } }],
  hooks: {   /* ov-3d: real-3D view of the video's game (js/fx/view3d.js on CM.scene3d) wraps the unchanged rules; no WebGL = 2D board */
    onStart: function (ctx) { CM.util.loadScript('js/fx/view3d.js').then(function () { if (CM.gameUI.controller === ctx.game) CM.view3d.attach(ctx, 'luxury'); }).catch(function (e) { console.warn(e); }); },
    onExit: function () { if (CM.view3d) CM.view3d.detach(); } },
  source: { research: 'research/modes/tm24Uq9nlBc.json', confidence: 'medium', notes: 'Opponent strength inferred.' }
});
