/* Can I SURVIVE 3 Check Chess?  Three-check against higher-rated players on an increment clock: the third check wins at once. Sources: research/modes/92d9wLU4g8U.json, frames visual_c (check-count badge on the king, gulugulu2 1777). */
CM.mode({
  id: "92d9wLU4g8U",
  rules: {
    win: [
      {
        type: "nchecks",
        n: 3
      },
      {
        type: "checkmate"
      }
    ]
  },
  bot: {
    engine: "search",
    depth: 4,
    time_ms: 700
  },
  name: "3 Check",
  category: "Variants & Games",
  description: "Normal chess, but every check counts. Give three checks and you win immediately. The number on each king shows how many checks it has taken.",
  how_to_win: "Give three checks, or checkmate.",
  player_side: "white",
  opponent: {
    name: "gulugulu2",
    rating: 1777,
    tagline: "Three-check opponent on chess.com"
  },
  board: {
    files: 8,
    ranks: 8,
    light: "#eeeed2",
    dark: "#769656"
  },
  clock: {
    w: 180,
    b: 180,
    inc: 2,
    bot: false
  },
  source: {
    research: "research/modes/92d9wLU4g8U.json",
    confidence: "high"
  },
  title: "Can I SURVIVE 3 Check Chess?",
  hooks: {
    decorate: function (ctx, sq, p) {
      /* check counter on each king: how many checks it has received */
      if (!p || p.t !== 'K') return null;
      var n = (ctx.state.checks || {})[p.c === 'w' ? 'b' : 'w'] || 0;
      return n ? { badge: String(n), html: '<span class="sq-tint" style="background:rgba(220,40,40,' + (0.15 * n) + ')"></span>' } : null;
    }
  }
});
