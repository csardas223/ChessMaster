/* Can I MASTER Atomic Chess? Five atomic games vs ~1500-1600 humans.
   Sources: research/modes/b0peFhZs4yU.json, frames: PocoWithP (1605), 3-minute clocks. */
CM.mode({
  id: "b0peFhZs4yU",
  name: "Atomic Chess (5 games)",
  category: "Variants & Games",
  description: "Every capture explodes: the capturing piece, the captured piece and every piece next to them are destroyed, except pawns, which only die when they capture or are captured. Kings cannot capture and may stand next to each other.",
  how_to_win: "Blow up the enemy king, or checkmate it. A capture that would explode your own king is not allowed.",
  player_side: "white",
  player: {"name": "You", "rating": 1600},
  opponent: {"name": "PocoWithP", "rating": 1605, "tagline": "Atomic opponent on chess.com"},
  board: {"files": 8, "ranks": 8, "light": "#ecf2d1", "dark": "#7ba059"},
  rules: {"atomic": {"radius": 1, "spare": ["P"]}},
  bot: {"engine": "search", "elo": 1605, "depth": 3, "time_ms": 700},
  clock: {"w": 180, "b": 180, "inc": 0},
  vfx_timeline: [{"trigger": "capture", "effect": {"type": "explosion", "at": "to", "radius": 1, "shake": false}, "sound": "explosion"}],
  messages: {"win": "the enemy king exploded"},
  vfx: [{ type: 'overlay', at: 'board', image: 'assets/modes/b0peFhZs4yU/atomic_icon.png', fit: 'contain', duration_ms: 1600, id: 'g5intro' /* video art */ }],
  source: {"research": "research/modes/b0peFhZs4yU.json", "confidence": "high"}
});
