/* Can I BEAT a Fly at Chess? A near-random fly-brain bot that always plays mate-in-one and never allows one.
   Sources: research/modes/OFtVdbxJI2Y.json (Tony estimates ~300 Elo). */
CM.mode({
  id: "OFtVdbxJI2Y",
  name: "The Fly",
  category: "Variants & Games",
  description: "Chess against a simulated fruit-fly brain (about 160,000 neurons). It plays almost at random, but two rules are hard-coded: it always takes a mate in one, and it never walks into a mate in one.",
  how_to_win: "Checkmate the fly. You will need more than a one-move trap.",
  player_side: "white",
  player: { name: 'You', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },   /* iwantcheckmate's own avatar (purple king) from the videos */
  opponent: { "avatar": "assets/modes/OFtVdbxJI2Y/fly.png","name": "The Fly", "rating": 300, "tagline": "164,587 neurons and counting."},
  board: {"files": 8, "ranks": 8, "light": "#e6e2c8", "dark": "#7a9a52"},
  bot: {"engine": "search", "depth": 2, "time_ms": 500},
  vfx_timeline: [{"trigger": "bot_move", "effect": {"type": "tint", "color": "#ff9a3c", "opacity": 0.08, "target": "board", "duration_ms": 420}}],
  messages: {"win": "\"You beat me. For now. But I am 164,587 neurons...\""},
  vfx: [{ type: 'overlay', at: 'board', image: 'assets/modes/OFtVdbxJI2Y/fly_connectome.png', fit: 'contain', duration_ms: 1600, id: 'g5intro' /* video art */ }],
  hooks: {
    botPick: function (ctx, L) {
      var M = CM.MATE / 2;
      if (L[0] && L[0].v >= M) return L[0];
      var safe = L.filter(function (x) { return x.v > -M; });
      return ctx.pick(safe.length ? safe : L);
    }
  },
  source: {"notes": "Board colours approximate the 3D wooden board; brain lighting reduced to a faint orange tint on each fly move.", "research": "research/modes/OFtVdbxJI2Y.json", "confidence": "high"}
});
