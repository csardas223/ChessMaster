/* Can I BEAT Duck Chess? Three 5+4 Duck Chess games.
   Sources: research/modes/TX8zxTIeby4.json (transcript: duck to a different empty square, no check, capture the king), frames: MaXxFcU (1498?). */
CM.mode({
  id: "TX8zxTIeby4",
  name: "Duck Chess (5+4)",
  category: "Variants & Games",
  description: "After every move the same player must move the yellow duck to a different empty square. Nothing can land on or move through the duck (knights can jump it) and it can never be captured. There is no check: kings can be left attacked.",
  how_to_win: "Capture the enemy king. A player with no legal move wins.",
  player_side: "white",
  player: { name: 'You', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },   /* iwantcheckmate's own avatar (purple king) from the videos */
  opponent: {"name": "MaXxFcU", "rating": 1498, "tagline": "Duck Chess opponent, 5+4"},
  board: {"files": 8, "ranks": 8, "light": "#ebecd0", "dark": "#739552"},
  pieces: {"*": {"name": "Duck", "img": "assets/modes/E2x-QTgBD5k/duck.png"}, "K": {"royal": false}},
  rules: {"check": "none", "drops": true, "movesPerTurn": {"w": 2, "b": 2}, "stalemate": "win", "drawPlies": 400, "win": [{"type": "capture", "piece": "K", "why": "the king was captured"}]},
  bot: {"engine": "search", "elo": 1500, "depth": 3, "time_ms": 700},
  clock: {"w": 300, "b": 300, "inc": 4},
  hooks: "g5_duck",
  source: {"notes": "Duck placement is a second sub-move (drop of the neutral duck). Stalemate-wins rule from chess.com Duck Chess.", "research": "research/modes/TX8zxTIeby4.json", "confidence": "high"}
});
