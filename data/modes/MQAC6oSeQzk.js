/* Can I SURVIVE Duck Chess? Duck Chess vs 2100-2400 humans.
   Sources: research/modes/MQAC6oSeQzk.json, frames: The-Hatter (2191), Ludo-10 (2373). */
CM.mode({
  id: "MQAC6oSeQzk",
  name: "Duck Chess (vs 2200)",
  category: "Variants & Games",
  description: "After every move the same player must move the yellow duck to a different empty square. Nothing can land on or move through the duck (knights can jump it) and it can never be captured. There is no check: kings can be left attacked.",
  how_to_win: "Capture the enemy king. A player with no legal move wins.",
  player_side: "white",
  player: { name: 'You', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },   /* iwantcheckmate's own avatar (purple king) from the videos */
  opponent: {"name": "The-Hatter", "rating": 2191, "tagline": "Much higher-rated Duck Chess player"},
  board: {"files": 8, "ranks": 8, "light": "#ecf2d1", "dark": "#7aa058"},
  pieces: {"*": {"name": "Duck", "img": "assets/modes/E2x-QTgBD5k/duck.png"}, "K": {"royal": false}},
  rules: {"check": "none", "drops": true, "movesPerTurn": {"w": 2, "b": 2}, "stalemate": "win", "drawPlies": 400, "win": [{"type": "capture", "piece": "K", "why": "the king was captured"}]},
  bot: {"engine": "search", "elo": 2200, "depth": 3, "time_ms": 800},
  hooks: "g5_duck",
  source: {"notes": "Duck placement is a second sub-move (drop of the neutral duck). Stalemate-wins rule from chess.com Duck Chess.", "research": "research/modes/MQAC6oSeQzk.json", "confidence": "high"}
});
