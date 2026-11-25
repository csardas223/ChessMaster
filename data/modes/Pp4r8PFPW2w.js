/* Can Magnus Play BULLET?  Bullet (2+1) against the Magnus bot (2882), which spends about three seconds on every move, so you can win on time. Sources: research/modes/Pp4r8PFPW2w.json, frames visual_d (brown board, clocks down to 0:01.7). The best-of-three tracker is not modelled; each game stands alone. */
CM.mode({
  id: "Pp4r8PFPW2w",
  name: "Magnus Bullet (2+1)",
  category: "Other Videos",
  description: "Bullet chess, 2 minutes plus 1 second per move, against the 2882 Magnus bot. The bot always thinks for about three seconds, so its clock burns down. Play solid and fast.",
  how_to_win: "Checkmate Magnus or make him run out of time.",
  player_side: "white",
  opponent: {
    name: "Magnus",
    rating: 2882,
    avatar: "assets/modes/Pp4r8PFPW2w/magnus.png",
    tagline: "Takes about 3 seconds on every move."
  },
  board: {
    files: 8,
    ranks: 8,
    light: "#ebd8b6",
    dark: "#af8665"
  },
  clock: {
    w: 120,
    b: 120,
    inc: 1,
    bot: true
  },
  bot: {
    engine: "auto",
    elo: 2882,
    time_ms: 900,
    min_ms: 3000
  },
  messages: {
    win: "Magnus flagged (or got mated)"
  },
  source: {
    research: "research/modes/Pp4r8PFPW2w.json",
    confidence: "high"
  },
  title: "Can Magnus Play BULLET?"
});
