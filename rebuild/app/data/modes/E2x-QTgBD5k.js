/* Can I MASTER Duck Chess? Five Duck Chess games vs ~1450 humans.
   Sources: research/modes/E2x-QTgBD5k.json, frames: duck blocker, Turb0Trash (1494?), Mitosko (1423?). */
CM.mode({
  id: "E2x-QTgBD5k",
  name: "Duck Chess",
  category: "Variants & Games",
  description: "After every move the same player must move the yellow duck to a different empty square. Nothing can land on or move through the duck (knights can jump it) and it can never be captured. There is no check: kings can be left attacked.",
  how_to_win: "Capture the enemy king. A player with no legal move wins.",
  player_side: "white",
  opponent: {"name": "Turb0Trash", "rating": 1494, "tagline": "Duck Chess opponent on chess.com"},
  board: {"files": 8, "ranks": 8, "light": "#eaf6d2", "dark": "#7ea25a"},
  pieces: {"*": {"name": "Duck", "img": "assets/modes/E2x-QTgBD5k/duck.png"}, "K": {"royal": false}},
  rules: {"check": "none", "drops": true, "movesPerTurn": {"w": 2, "b": 2}, "stalemate": "win", "drawPlies": 400, "win": [{"type": "capture", "piece": "K", "why": "the king was captured"}]},
  bot: {"engine": "search", "elo": 1450, "depth": 3, "time_ms": 700},
  hooks: "g5_duck",
  source: {"notes": "Duck placement is a second sub-move (drop of the neutral duck). Stalemate-wins rule from chess.com Duck Chess.", "research": "research/modes/E2x-QTgBD5k.json", "confidence": "high"}
});
