/* Stockfish, But It Plays the 2nd Best Move... Sources: research/modes/TQR5zCSzrqw.json (board #eacfac/#aa7a5b). */
CM.mode({
  "id": "TQR5zCSzrqw",
  "title": "Stockfish, But It Plays the 2nd Best Move...",
  "name": "BetaFish",
  "category": "Variant Bots",
  "description": "Stockfish always plays its second best move (if it has only one legal move, it plays that). Create positions where only one move holds.",
  "how_to_win": "Checkmate BetaFish.",
  "player_side": "white",
  "opponent": {
    "name": "BetaFish",
    "rating": null,
    "avatar": "assets/modes/TQR5zCSzrqw/betafish.svg",
    "tagline": "Always the 2nd best move."
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
    "pick": "second"
  },
  "hooks": "g2_fish",
  "source": {
    "research": "research/modes/TQR5zCSzrqw.json",
    "confidence": "high"
  }
});
