/* Can I BEAT Martinfish? Sources: research/modes/MwXcULBxA_s.json (95% engine / 5% Martin, hidden; thumbnail labels it 3000 Elo). */
CM.mode({
  "id": "MwXcULBxA_s",
  "title": "Can I BEAT Martinfish?",
  "name": "Martinfish (95%)",
  "category": "Variant Bots",
  "description": "Martinfish plays Stockfish's top move 95% of the time and a Martin move 5% of the time, at random. You never know which one is coming.",
  "how_to_win": "Checkmate Martinfish. In the video it won.",
  "player_side": "white",
  "opponent": {
    "name": "Martinfish",
    "rating": 3000,
    "avatar": "assets/modes/MwXcULBxA_s/martinfish.png",
    "tagline": "95% Stockfish, 5% Martin."
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
      "p": 0.95
    }
  },
  "hooks": "g2_elofish",
  "source": {
    "research": "research/modes/MwXcULBxA_s.json",
    "confidence": "high",
    "art": "avatar from the video (research/frames/sprites), owner instruction 2026-11-24"
  }
});
