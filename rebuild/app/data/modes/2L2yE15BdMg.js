/* Martinfish 2.0 Adopted Me. Sources: research/modes/2L2yE15BdMg.json (fixed 2 Stockfish : 1 Martin rotation). */
CM.mode({
  "id": "2L2yE15BdMg",
  "title": "Martinfish 2.0 Adopted Me",
  "name": "Martinfish 2.0",
  "category": "Variant Bots",
  "description": "Martinfish 2.0 follows a fixed rotation: Stockfish plays two moves, then Martin plays one, and repeat. Time your tactics for Martin's turn.",
  "how_to_win": "Checkmate Martinfish 2.0.",
  "player_side": "white",
  "opponent": {
    "name": "Martinfish 2.0",
    "rating": null,
    "avatar": "assets/modes/2L2yE15BdMg/martinfish2.svg",
    "tagline": "Stockfish, Stockfish, Martin. Repeat."
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
        "S",
        "M"
      ],
      "show": true
    }
  },
  "hooks": "g2_elofish",
  "source": {
    "research": "research/modes/2L2yE15BdMg.json",
    "confidence": "high"
  }
});
