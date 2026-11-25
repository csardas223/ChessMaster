/* Can I WIN 3 Check Chess? (Tournament) 1-minute Three-Check Swiss.
   Sources: research/modes/Fbk0Xbcz728.json, frames: tournament points, bullet clocks. */
CM.mode({
  id: "Fbk0Xbcz728",
  name: "3-Check Tournament",
  category: "Variants & Games",
  description: "Normal chess, but every check counts. The first player to give three checks wins on the spot; checkmate also wins.",
  how_to_win: "Give three checks or checkmate.",
  player_side: "white",
  player: {"name": "You", "rating": 1550, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },
  opponent: { "avatar": "assets/modes/uUXev8TPVak/default.png","name": "HPG_Phuongnguyen2013", "rating": 1589, "tagline": "Three-Check Swiss tournament opponent"},
  board: {"files": 8, "ranks": 8, "light": "#ebedd1", "dark": "#759e55"},
  rules: {"win": [{"type": "checkmate"}, {"type": "nchecks", "n": 3}]},
  bot: {"engine": "search", "elo": 1589, "depth": 4, "time_ms": 650},
  clock: {"w": 60, "b": 60, "inc": 0},
  vfx_timeline: [{"trigger": "check", "effect": {"type": "flash", "at": "to", "color": "#e8433a", "opacity": 0.35, "duration_ms": 300}}],
  vfx: [{ type: 'overlay', at: 'board', image: 'assets/modes/Fbk0Xbcz728/intro.jpg', fit: 'contain', duration_ms: 1600, id: 'g5intro' /* video art */ }],
  hooks: {
    status: function (ctx) { var c = ctx.state.checks || {}, me = ctx.human, op = ctx.bot; return 'Checks given: you ' + (c[me] || 0) + '/3, opponent ' + (c[op] || 0) + '/3'; }
  },
  source: {"research": "research/modes/Fbk0Xbcz728.json", "confidence": "high"}
});
