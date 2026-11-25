/* Can I MASTER Torpedo Chess? Five Torpedo wins; en passant after any double step.
   Sources: research/modes/RnMKtGgKknQ.json (1:55, 8:24 en passant), frames: crxyz (1605), 1-minute clocks. */
CM.mode({
  id: "RnMKtGgKknQ",
  name: "Torpedo Chess (5 wins)",
  category: "Variants & Games",
  description: "Torpedo pawns: a pawn may move one or two squares straight forward from any rank, not only from its starting square (both squares must be empty). Any two-square pawn move can be taken en passant.",
  how_to_win: "Checkmate.",
  player_side: "white",
  player: {"name": "You", "rating": 1740},
  opponent: {"name": "crxyz", "rating": 1605, "tagline": "Torpedo opponent on chess.com"},
  board: {"files": 8, "ranks": 8, "light": "#ecf2d1", "dark": "#7a9f59"},
  pieces: {"P": {"name": "Torpedo Pawn", "moves": "fmWfcFfmnD"}},
  bot: {"engine": "search", "elo": 1605, "depth": 4, "time_ms": 650},
  clock: {"w": 60, "b": 60, "inc": 0},
  source: {"research": "research/modes/RnMKtGgKknQ.json", "confidence": "high"}
});
