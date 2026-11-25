/* Can I BEAT Sideways Pawns Chess? Pawns can step sideways (orange circles in the video).
   Sources: research/modes/aK1cIhZDzkI.json, frames: intro 3x3 diagram, xianchess_jake (1484). */
CM.mode({
  id: "aK1cIhZDzkI",
  name: "Sideways Pawns",
  category: "Variants & Games",
  description: "Pawns may also step one square sideways (left or right) onto an empty square, in addition to their normal moves. Sideways steps never capture.",
  how_to_win: "Checkmate.",
  player_side: "white",
  player: {"name": "You", "rating": 1627},
  opponent: {"name": "xianchess_jake", "rating": 1484, "tagline": "Sideways Pawns opponent on chess.com"},
  board: {"files": 8, "ranks": 8, "light": "#ecf2d1", "dark": "#7ba059"},
  pieces: {"P": {"name": "Pawn", "moves": "fmWfcFifmnDsmW"}},
  bot: {"engine": "search", "elo": 1484, "depth": 4, "time_ms": 650},
  clock: {"w": 180, "b": 180, "inc": 0},
  source: {"research": "research/modes/aK1cIhZDzkI.json", "confidence": "medium"}
});
