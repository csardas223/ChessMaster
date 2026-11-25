/* Can I MASTER Chess960? Five bullet Chess960 games vs ~1600-1700 humans.
   Sources: research/modes/WNAxheS0e7E.json, frames: shuffled back rank (e.g. QBRKBNRN), nurludo (1721). */
CM.mode({
  id: "WNAxheS0e7E",
  name: "Chess960",
  category: "Variants & Games",
  description: "Fischer Random: the back-rank pieces are shuffled at random (the same way for both sides), with the bishops on opposite colours and the king between the rooks. Pawns are normal.",
  how_to_win: "Checkmate.",
  player_side: "white",
  player: {"name": "You", "rating": 1590},
  opponent: {"name": "nurludo", "rating": 1721, "tagline": "Chess960 opponent on chess.com"},
  board: {"files": 8, "ranks": 8, "light": "#ecf2d1", "dark": "#7b9f59"},
  setup: {"random": "chess960"},
  bot: {"engine": "search", "elo": 1700, "depth": 4, "time_ms": 650},
  clock: {"w": 60, "b": 60, "inc": 0},
  source: {"notes": "Castling uses the engine's generic rule (king moves two squares toward an unmoved rook), not the exact 960 end squares.", "research": "research/modes/WNAxheS0e7E.json", "confidence": "high"}
});
