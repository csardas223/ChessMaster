/* Stockfish, But It Plays nth Best Move Where P(n) = (1/2)^n. Sources: research/modes/Y0zYxMYDDWQ.json (official site weights 50/25/12/6/4/3 over the top 6, leftover to the last candidate). */
CM.mode({
  "id": "Y0zYxMYDDWQ",
  "title": "Stockfish, But It Plays nth Best Move Where P(n) = (1/2)^n",
  "name": "Geometric Fish",
  "category": "Variant Bots",
  "description": "Stockfish plays its nth best move with probability (1/2)^n: 50% best, 25% second, 12% third, 6%, 4%, 3%.",
  "how_to_win": "Target pieces with only one defender so only the top move saves it.",
  "player_side": "white",
  "opponent": {
    "name": "Geometric Fish",
    "rating": null,
    "avatar": "assets/modes/Y0zYxMYDDWQ/geometricfish.png",
    "tagline": "P(n) = (1/2)^n"
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
  "bot": {
    "engine": "search",
    "depth": 4,
    "time_ms": 800
  },
  "params": {
    "pick": "geometric"
  },
  "hooks": "g2_fish",
  "source": {
    "research": "research/modes/Y0zYxMYDDWQ.json",
    "confidence": "high",
    "art": "avatar from the video (research/frames/sprites), owner instruction 2026-11-24"
  }
});
