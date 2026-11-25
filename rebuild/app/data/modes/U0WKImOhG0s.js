/* Can I WIN 3+ Chess Tournament? 1-minute Three-Check Swiss (6/7, 2nd on tiebreak).
   Sources: research/modes/U0WKImOhG0s.json. */
CM.mode({
  id: "U0WKImOhG0s",
  name: "3+ Tournament",
  category: "Variants & Games",
  description: "Normal chess, but every check counts. The first player to give three checks wins on the spot; checkmate also wins.",
  how_to_win: "Give three checks or checkmate.",
  player_side: "white",
  player: {"name": "You", "rating": 1551},
  opponent: {"name": "BRUttines", "rating": 1944, "tagline": "Three-Check tournament opponent"},
  board: {"files": 8, "ranks": 8, "light": "#ebeed0", "dark": "#759e55"},
  rules: {"win": [{"type": "checkmate"}, {"type": "nchecks", "n": 3}]},
  bot: {"engine": "search", "elo": 1944, "depth": 4, "time_ms": 650},
  clock: {"w": 60, "b": 60, "inc": 0},
  vfx_timeline: [{"trigger": "check", "effect": {"type": "flash", "at": "to", "color": "#e8433a", "opacity": 0.35, "duration_ms": 300}}],
  hooks: {
    status: function (ctx) { var c = ctx.state.checks || {}, me = ctx.human, op = ctx.bot; return 'Checks given: you ' + (c[me] || 0) + '/3, opponent ' + (c[op] || 0) + '/3'; }
  },
  source: {"research": "research/modes/U0WKImOhG0s.json", "confidence": "high"}
});
