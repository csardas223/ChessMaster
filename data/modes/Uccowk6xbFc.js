/* Stockfish, But It Loses 50 ELO Every Move. Sources: research/modes/Uccowk6xbFc.json (official site: -50 per bot move, floor 0 = random moves). */
CM.mode({
  "id": "Uccowk6xbFc",
  "title": "Stockfish, But It Loses 50 ELO Every Move",
  "name": "Tired Fish",
  "category": "Variant Bots",
  "description": "Stockfish starts at 3600 and loses 50 Elo after every move it makes. Survive the opening, then it gets sleepy.",
  "how_to_win": "Hold on until Tired Fish weakens, then checkmate it.",
  "player_side": "white",
  "opponent": {
    "name": "Tired Fish",
    "rating": 3600,
    "avatar": "assets/modes/Uccowk6xbFc/tiredfish.png",
    "tagline": "-50 Elo every move."
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
      "botMove": -50,
      "min": 0
    }
  },
  "hooks": "g2_elofish",
  "source": {
    "research": "research/modes/Uccowk6xbFc.json",
    "confidence": "high",
    "art": "avatar from the video (research/frames/sprites), owner instruction 2026-11-24"
  }
});
