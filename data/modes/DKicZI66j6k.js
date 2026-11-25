/* You're Not Ready for Martinfish. Sources: research/modes/DKicZI66j6k.json (strict 1:1 alternation, Stockfish first). */
CM.mode({
  "id": "DKicZI66j6k",
  "title": "You're Not Ready for Martinfish",
  "name": "Martinfish",
  "category": "Variant Bots",
  "description": "Martinfish strictly alternates brains: Stockfish (depth 35) plays its first move, Martin (250) the next, and so on.",
  "how_to_win": "Checkmate Martinfish by punishing every Martin move.",
  "player_side": "white",
  "opponent": {
    "name": "Martinfish",
    "rating": null,
    "avatar": "assets/modes/DKicZI66j6k/martinfish.png",
    "tagline": "Half Stockfish, half Martin."
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
    "brains": {
      "schedule": [
        "S",
        "M"
      ],
      "show": true
    }
  },
  "hooks": "g2_elofish",
  "source": {
    "research": "research/modes/DKicZI66j6k.json",
    "confidence": "high",
    "art": "avatar from the video (research/frames/sprites), owner instruction 2026-11-24"
  }
});
