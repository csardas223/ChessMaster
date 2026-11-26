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
  params: {"cutscenes": ["assets/modes/IbRrzKtieqs/fight_1.jpg", "assets/modes/IbRrzKtieqs/fight_2.jpg", "assets/modes/IbRrzKtieqs/fight_3.jpg"] /* the video's own fight cutscene stills (maxres1-3), one per capture */, "chatChance": 0, "ladder": [{"name": "Peasant", "rating": 400}, {"name": "Farmer", "rating": 800}, {"name": "Artisan", "rating": 1200}, {"name": "Nobleman", "rating": 1600}, {"name": "Clergyman", "rating": 2000}, {"name": "Monarch", "rating": 2500}]},
  vfx: [{ type: 'overlay', at: 'board', image: 'assets/modes/IbRrzKtieqs/intro.jpg', fit: 'contain', duration_ms: 1600, id: 'g5intro' /* video art */ }],
  hooks: { extends: 'g5_ladder',   /* ov-3d: real-3D view of the video's game (js/fx/view3d.js on CM.scene3d) wraps the unchanged rules; no WebGL = 2D board */
    onStart: function (ctx) { if (this._base.onStart) this._base.onStart.call(this, ctx); CM.util.loadScript('js/fx/view3d.js').then(function () { if (CM.gameUI.controller === ctx.game) CM.view3d.attach(ctx, 'battle'); }).catch(function (e) { console.warn(e); }); },
    onExit: function (ctx) { if (CM.view3d) CM.view3d.detach(); if (this._base.onExit) this._base.onExit.call(this, ctx); } },
  source: {"notes": "Level ratings are estimates (the game shows names only). Combat cutscenes are the three fight stills from the video shown for 1.4 s on each capture (the animated fights themselves cannot be captured: yt-dlp blocked).", "research": "research/modes/IbRrzKtieqs.json", "confidence": "medium"}
});
