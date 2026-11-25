/* You Can't Stop Martinfish 3.0... Sources: research/modes/PSSEOUxNTrE.json (fixed 3 Stockfish : 1 Martin cycle). */
CM.mode({
  "id": "PSSEOUxNTrE",
  "title": "You Can't Stop Martinfish 3.0...",
  "name": "Martinfish 3.0",
  "category": "Variant Bots",
  "description": "Martinfish 3.0 follows a fixed cycle: Stockfish plays three moves, then Martin plays one. You always know which brain moves next.",
  "how_to_win": "Checkmate Martinfish 3.0 on one of Martin's turns.",
  "player_side": "white",
  "opponent": {
    "name": "Martinfish 3.0",
    "rating": null,
    "avatar": "assets/modes/PSSEOUxNTrE/martinfish3.png",
    "tagline": "Stockfish x3, then Martin."
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
        "S",
        "M"
      ],
      "show": true
    }
  },
  "hooks": "g2_elofish",
  "source": {
    "research": "research/modes/PSSEOUxNTrE.json",
    "confidence": "high",
    "art": "avatar from the video (research/frames/sprites), owner instruction 2026-11-24"
  }
});
