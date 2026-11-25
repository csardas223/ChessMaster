/* Stockfish, But It Loses 100 ELO If I Play The BEST Move. Sources: research/modes/U6J7XjR_5Ik.json. Best = top move of the built-in search (moves tied with it count). */
CM.mode({
  "id": "U6J7XjR_5Ik",
  "title": "Stockfish, But It Loses 100 ELO If I Play The BEST Move",
  "name": "Tiltfish",
  "category": "Variant Bots",
  "description": "Stockfish starts at 3600 and loses 100 Elo every time you play its best move.",
  "how_to_win": "Keep finding engine moves until Tiltfish is weak enough to beat. (The video lost.)",
  "player_side": "white",
  "opponent": {
    "name": "Tiltfish",
    "rating": 3600,
    "avatar": "assets/modes/U6J7XjR_5Ik/tiltfish.svg",
    "tagline": "-100 Elo when you play the best move."
  },
  "board": {
    "files": 8,
    "ranks": 8,
    "light": "#eeeed2",
    "dark": "#769656"
  },
  "setup": {
    "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR"
  },
  "params": {
    "elo": {
      "start": 3600,
      "playerBest": -100,
      "min": 100
    }
  },
  "hooks": "g2_elofish",
  "source": {
    "research": "research/modes/U6J7XjR_5Ik.json",
    "confidence": "high"
  }
});
