/* Can I SURVIVE Crazyhouse Chess? Crazyhouse vs strong humans; wins with a dropped-knight smothered mate.
   Sources: research/modes/XrS4pFAd56c.json. */
CM.mode({
  id: "XrS4pFAd56c",
  name: "Crazyhouse (vs 2200)",
  category: "Variants & Games",
  description: "Captured pieces switch colour and go to your pocket. On your turn you may drop a pocket piece onto any empty square instead of moving (pawns not on the first or last rank). A promoted piece goes back to the pocket as a pawn.",
  how_to_win: "Checkmate. A knight drop smothered mate is the dream.",
  player_side: "white",
  opponent: {"name": "Crazyhouse player", "rating": 2200, "tagline": "First opponent was ~2200"},
  board: {"files": 8, "ranks": 8, "light": "#eeeed2", "dark": "#769656"},
  rules: {"drops": true},
  bot: {"engine": "search", "elo": 2200, "depth": 3, "time_ms": 700},
  vfx: [{ type: 'overlay', at: 'board', image: 'assets/modes/XrS4pFAd56c/intro.jpg', fit: 'contain', duration_ms: 1600, id: 'g5intro' /* video art */ }],
  source: {"research": "research/modes/XrS4pFAd56c.json", "confidence": "high"}
});
