/* Can I MASTER Roblox Chess? Normal chess inside a Roblox lobby vs random players (player Black in the frames).
   Sources: research/modes/EqOwqolOZOo.json, frames: 2D picture-in-picture board #eaedd1/#759e55. */
CM.mode({
  id: "EqOwqolOZOo",
  name: "Roblox Chess",
  category: "Variants & Games",
  description: "Normal chess at a table in a Roblox lobby against a random Roblox player. There are no ratings: sit down, press ready and play.",
  how_to_win: "Checkmate the Roblox player.",
  player_side: "black",
  player: { name: 'You', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },   /* iwantcheckmate's own avatar (purple king) from the videos */
  opponent: {"avatar": "assets/modes/EqOwqolOZOo/opponent.png" /* the Roblox avatar across the table (maxres2) */, "name": "Roblox player", "rating": null, "tagline": "A random avatar who sat down at your table."},
  board: {"files": 8, "ranks": 8, "light": "#eaedd1", "dark": "#759e55"},
  bot: {"engine": "search", "elo": 900, "depth": 3, "time_ms": 500},
  vfx: [{ type: 'overlay', at: 'board', image: 'assets/modes/EqOwqolOZOo/intro.jpg', fit: 'contain', duration_ms: 1600, id: 'g5intro' /* video art */ }],
  hooks: {   /* ov-3d: real-3D view of the video's game (js/fx/view3d.js on CM.scene3d) wraps the unchanged rules; no WebGL = 2D board */
    onStart: function (ctx) { CM.util.loadScript('js/fx/view3d.js').then(function () { if (CM.gameUI.controller === ctx.game) CM.view3d.attach(ctx, 'robloxTable'); }).catch(function (e) { console.warn(e); }); },
    onExit: function () { if (CM.view3d) CM.view3d.detach(); } },
  source: {"notes": "Roblox opponents have no rating; bot strength ~900 is a guess from the fool's-mate attempts in the video.", "research": "research/modes/EqOwqolOZOo.json", "confidence": "high"}
});
