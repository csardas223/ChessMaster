/* Can I BEAT Battle Chess? Standard chess with animated combat on captures; six AI levels Peasant -> Monarch.
   Sources: research/modes/IbRrzKtieqs.json, frames: marble 3D board, fight cutscenes. */
CM.mode({
  id: "IbRrzKtieqs",
  name: "Battle Chess",
  category: "Variants & Games",
  description: "Normal chess where every capture turns into a fight. Climb the Battle Chess AI levels in order: Peasant, Farmer, Artisan, Nobleman, Clergyman and Monarch.",
  how_to_win: "Checkmate each AI level to unlock the next.",
  player_side: "white",
  player: { name: 'You', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },   /* iwantcheckmate's own avatar (purple king) from the videos */
  board: {"files": 8, "ranks": 8, "light": "#d6d6d2", "dark": "#5c5c58"},
  vfx_timeline: [{"trigger": "castle", "effect": {"type": "text", "text": "Fist bump!", "at": "to", "color": "#fff", "duration_ms": 1000}}, {"trigger": "promotion", "effect": {"type": "particles", "kind": "gold", "at": "to", "count": 26}}],
  params: {"chatChance": 0, "ladder": [{"name": "Peasant", "rating": 400}, {"name": "Farmer", "rating": 800}, {"name": "Artisan", "rating": 1200}, {"name": "Nobleman", "rating": 1600}, {"name": "Clergyman", "rating": 2000}, {"name": "Monarch", "rating": 2500}]},
  vfx: [{ type: 'overlay', at: 'board', image: 'assets/modes/IbRrzKtieqs/intro.jpg', fit: 'contain', duration_ms: 1600, id: 'g5intro' /* video art */ }],
  hooks: { extends: 'g5_ladder',   /* battle3d: the rules are unchanged; js/fx/battle3d.js (on CM.scene3d) draws the board as a castle hall with
       animated characters, and every capture is a fight. No WebGL = the 2D board. */
    onStart: function (ctx) { if (this._base.onStart) this._base.onStart.call(this, ctx); CM.util.loadScript('js/fx/battle3d.js').then(function () { if (CM.gameUI.controller === ctx.game) CM.battle3d.attach(ctx); }).catch(function (e) { console.warn(e); }); },
    afterMove: function (ctx, m, info) { if (this._base.afterMove) this._base.afterMove.call(this, ctx, m, info); return CM.battle3d ? CM.battle3d.play(ctx, m, info) : null; },
    onExit: function (ctx) { if (CM.battle3d) CM.battle3d.detach(); if (this._base.onExit) this._base.onExit.call(this, ctx); } },
  source: {"notes": "Level ratings are estimates (the game shows names only). Captures play as 3D fights between original code-built characters in the style of Battle Chess (js/fx/battle3d.js; no Interplay art). The video fight stills stay in assets/modes/IbRrzKtieqs/ as reference only.", "research": "research/modes/IbRrzKtieqs.json", "confidence": "medium"}
});
