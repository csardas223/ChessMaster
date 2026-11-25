/* Can I MASTER Roblox Chess? Normal chess inside a Roblox lobby vs random players (player Black in the frames).
   Sources: research/modes/EqOwqolOZOo.json, frames: 2D picture-in-picture board #eaedd1/#759e55. */
CM.mode({
  id: "EqOwqolOZOo",
  name: "Roblox Chess",
  category: "Variants & Games",
  description: "Normal chess at a table in a Roblox lobby against a random Roblox player. There are no ratings: sit down, press ready and play.",
  how_to_win: "Checkmate the Roblox player.",
  player_side: "black",
  opponent: {"name": "Roblox player", "rating": null, "tagline": "A random avatar who sat down at your table."},
  board: {"files": 8, "ranks": 8, "light": "#eaedd1", "dark": "#759e55"},
  bot: {"engine": "search", "elo": 900, "depth": 3, "time_ms": 500},
  vfx: [{ type: 'overlay', at: 'board', image: 'assets/modes/EqOwqolOZOo/intro.jpg', fit: 'contain', duration_ms: 1600, id: 'g5intro' /* video art */ }],
  source: {"notes": "Roblox opponents have no rating; bot strength ~900 is a guess from the fool's-mate attempts in the video.", "research": "research/modes/EqOwqolOZOo.json", "confidence": "high"}
});
