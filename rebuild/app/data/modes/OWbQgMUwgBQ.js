/* Can I SURVIVE Torpedo Chess? Torpedo vs ~1870-2040 humans.
   Sources: research/modes/OWbQgMUwgBQ.json, frames: NadiaAbood (1867). */
CM.mode({
  id: "OWbQgMUwgBQ",
  name: "Torpedo Chess",
  category: "Variants & Games",
  description: "Torpedo pawns: a pawn may move one or two squares straight forward from any rank, not only from its starting square (both squares must be empty). Any two-square pawn move can be taken en passant.",
  how_to_win: "Checkmate.",
  player_side: "white",
  player: {"name": "You", "rating": 1820},
  opponent: {"name": "NadiaAbood", "rating": 1867, "tagline": "Torpedo opponent on chess.com"},
  board: {"files": 8, "ranks": 8, "light": "#ecf2d1", "dark": "#7a9f59"},
  pieces: {"P": {"name": "Torpedo Pawn", "moves": "fmWfcFfmnD"}},
  bot: {"engine": "search", "elo": 1867, "depth": 4, "time_ms": 650},
  clock: {"w": 180, "b": 180, "inc": 0},
  source: {"research": "research/modes/OWbQgMUwgBQ.json", "confidence": "medium"}
});
