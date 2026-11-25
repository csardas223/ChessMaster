/* Can I MASTER Capture Anything Chess? Capture your own pieces too.
   Sources: research/modes/VV9Wb6egokU.json (Rxh2 own pawn; self-capture escapes mate), frames: YugoBandai (1494). */
CM.mode({
  id: "VV9Wb6egokU",
  name: "Capture Anything",
  category: "Variants & Games",
  description: "Any piece may capture any other piece, including your own (except kings). A self-capture can open a file or even escape a checkmate.",
  how_to_win: "Checkmate.",
  player_side: "white",
  player: {"name": "You", "rating": 1680},
  opponent: {"name": "YugoBandai", "rating": 1494, "tagline": "Capture Anything opponent on chess.com"},
  board: {"files": 8, "ranks": 8, "light": "#ecf2d1", "dark": "#7ba059"},
  rules: {"friendlyCapture": true},
  bot: {"engine": "search", "elo": 1494, "depth": 3, "time_ms": 650},
  clock: {"w": 180, "b": 180, "inc": 0},
  source: {"research": "research/modes/VV9Wb6egokU.json", "confidence": "high"}
});
