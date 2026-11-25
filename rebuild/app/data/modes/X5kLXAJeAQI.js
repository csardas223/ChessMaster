/* Can I BEAT No Castling? Blitz vs ~1900-2000 humans with castling disabled.
   Sources: research/modes/X5kLXAJeAQI.json. */
CM.mode({
  id: "X5kLXAJeAQI",
  name: "No Castling",
  category: "Variants & Games",
  description: "Standard chess, except neither side may castle.",
  how_to_win: "Checkmate.",
  player_side: "white",
  player: {"name": "You", "rating": 1910},
  opponent: {"name": "papangmaster", "rating": 1994, "tagline": "No Castling opponent on chess.com"},
  board: {"files": 8, "ranks": 8, "light": "#eaedd1", "dark": "#759e55"},
  rules: {"castling": false},
  clock: {"w": 180, "b": 180, "inc": 0},
  source: {"research": "research/modes/X5kLXAJeAQI.json", "confidence": "high"}
});
