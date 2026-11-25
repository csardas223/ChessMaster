/* Stockfish, But 5% Chance of Blundering Every Move. Sources: research/modes/ROkJSsMOfu0.json (official site: blunder = random move other than the best; board #eacfac/#aa7a5b). */
CM.mode({
  "id": "ROkJSsMOfu0",
  "title": "Stockfish, But 5% Chance of Blundering Every Move",
  "name": "BlunderFish",
  "category": "Variant Bots",
  "description": "Stockfish with a 5% chance of blundering on any move. A blunder is a random legal move that is not its best move.",
  "how_to_win": "Survive until it blunders, then convert.",
  "player_side": "white",
  "opponent": {
    "name": "BlunderFish",
    "rating": 3600,
    "avatar": "assets/modes/ROkJSsMOfu0/blunderfish.png",
    "tagline": "5% chance to blunder every move."
  },
  "board": {
    "files": 8,
    "ranks": 8,
    "light": "#eacfac",
    "dark": "#aa7a5b"
  },
  "setup": {
    "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR"
  },
  "bot": {
    "engine": "search",
    "depth": 4,
    "time_ms": 800
  },
  "params": {
    "pick": "blunder5"
  },
  "hooks": "g2_fish",
  "source": {
    "research": "research/modes/ROkJSsMOfu0.json",
    "confidence": "high",
    "art": "avatar from the video (research/frames/sprites), owner instruction 2026-11-24"
  }
});
