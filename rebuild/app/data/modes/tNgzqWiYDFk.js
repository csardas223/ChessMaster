/* Stockfish, But If It Can Give Check, It Must. Sources: research/modes/tNgzqWiYDFk.json (green board #f6fff6/#5a9642, magenta highlights). */
CM.mode({
  "id": "tNgzqWiYDFk",
  "title": "Stockfish, But If It Can Give Check, It Must",
  "name": "CheckFish",
  "category": "Variant Bots",
  "description": "CheckFish is Stockfish, but if it can give check, it must (the best checking move). Forced checks are shown with a magenta arrow.",
  "how_to_win": "Lure its pieces away with forced checks and checkmate CheckFish.",
  "player_side": "white",
  "opponent": {
    "name": "CheckFish",
    "rating": null,
    "avatar": "assets/modes/tNgzqWiYDFk/checkfish.svg",
    "tagline": "If it can give check, it must."
  },
  "board": {
    "files": 8,
    "ranks": 8,
    "light": "#f6fff6",
    "dark": "#5a9642"
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
    "pick": "mustcheck"
  },
  "hooks": "g2_fish",
  "source": {
    "research": "research/modes/tNgzqWiYDFk.json",
    "confidence": "medium"
  }
});
