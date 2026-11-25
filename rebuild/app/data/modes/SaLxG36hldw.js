/* Can I MASTER Crazyhouse Chess? Crazyhouse vs ~1480 humans (bonus game vs a 1900).
   Sources: research/modes/SaLxG36hldw.json, frames: pocket on the left, drop dots. */
CM.mode({
  id: "SaLxG36hldw",
  name: "Crazyhouse",
  category: "Variants & Games",
  description: "Captured pieces switch colour and go to your pocket. On your turn you may drop a pocket piece onto any empty square instead of moving (pawns not on the first or last rank). A promoted piece goes back to the pocket as a pawn.",
  how_to_win: "Checkmate. Drops with check win games.",
  player_side: "white",
  player: {"name": "You", "rating": 1590},
  opponent: {"name": "kastet2", "rating": 1480, "tagline": "Crazyhouse opponent on chess.com"},
  board: {"files": 8, "ranks": 8, "light": "#ecf2d1", "dark": "#7b9f59"},
  rules: {"drops": true},
  bot: {"engine": "search", "elo": 1480, "depth": 3, "time_ms": 650},
  clock: {"w": 180, "b": 180, "inc": 0},
  source: {"research": "research/modes/SaLxG36hldw.json", "confidence": "high"}
});
