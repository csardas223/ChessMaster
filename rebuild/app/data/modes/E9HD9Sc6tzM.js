/* playing a chess variant until i am unstoppable (100% losing my mind).  A long three-check session against ~1800 players on 3-minute clocks, chasing the leaderboard (~2000). Sources: research/modes/E9HD9Sc6tzM.json, rules.jsonl, frames visual_a (check counters drawn on the kings, Einstein1592 1720, nochessdo... 1810). */
CM.mode({
  id: "E9HD9Sc6tzM",
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
  name: "3 Check Grind",
  category: "Other Videos",
  description: "Three-check chess: checks are counted on each king, and the third check wins on the spot. Checkmate still wins too.",
  how_to_win: "Give three checks or checkmate. Reach ~2000 for the leaderboard.",
  player_side: "white",
  opponent: {
    name: "nochessdo...",
    rating: 1810,
    tagline: "Three-check opponent on chess.com"
  },
  board: {
    files: 8,
    ranks: 8,
    light: "#ebf3d1",
    dark: "#7b9e58"
  },
  clock: {
    w: 180,
    b: 180,
    inc: 0,
    bot: false
  },
  source: {
    research: "research/modes/E9HD9Sc6tzM.json",
    confidence: "high"
  },
  title: "playing a chess variant until i am unstoppable (100% losing my mind)",
  hooks: {
    decorate: function (ctx, sq, p) {
      /* check counter on each king: how many checks it has received */
      if (!p || p.t !== 'K') return null;
      var n = (ctx.state.checks || {})[p.c === 'w' ? 'b' : 'w'] || 0;
      return n ? { badge: String(n), html: '<span class="sq-tint" style="background:rgba(220,40,40,' + (0.15 * n) + ')"></span>' } : null;
    }
  }
});
