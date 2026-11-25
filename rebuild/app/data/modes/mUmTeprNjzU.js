/* Stockfish, But It Plays for 0.00 Evaluation. Sources: research/modes/mUmTeprNjzU.json (all legal moves scored; ties to the higher-ranked move; board #eacfac/#aa7a5b). */
CM.mode({
  "id": "mUmTeprNjzU",
  "title": "Stockfish, But It Plays for 0.00 Evaluation",
  "name": "DrawFish",
  "category": "Variant Bots",
  "description": "DrawFish plays whatever move brings the evaluation closest to 0.00. It never takes an advantage and will not recapture if that makes it too winning.",
  "how_to_win": "Win small material in simple positions, promote and checkmate.",
  "player_side": "white",
  "opponent": {
    "name": "DrawFish",
    "rating": null,
    "avatar": "assets/modes/mUmTeprNjzU/drawfish.svg",
    "tagline": "i like draw"
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
    "depth": 3,
    "time_ms": 700
  },
  "params": {
    "pick": "drawish"
  },
  "hooks": "g2_fish",
  "source": {
    "research": "research/modes/mUmTeprNjzU.json",
    "confidence": "high"
  }
});
