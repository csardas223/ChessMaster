/* Martinfish is BACK (feat. wintrcat). Sources: research/modes/ew6NU1Z_G4k.json (80:20). */
CM.mode({
  "id": "ew6NU1Z_G4k",
  "title": "Martinfish is BACK (feat. wintrcat)",
  "name": "Martinfish (80%)",
  "category": "Variant Bots",
  "description": "Martinfish is back at 80:20: 80% Stockfish's top move, 20% a Martin move, random and hidden.",
  "how_to_win": "Checkmate Martinfish.",
  "player_side": "white",
  "opponent": {
    "name": "Martinfish",
    "rating": null,
    "avatar": "assets/modes/ew6NU1Z_G4k/martinfish.svg",
    "tagline": "80% Stockfish, 20% Martin."
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
      "p": 0.8
    }
  },
  "hooks": "g2_elofish",
  "source": {
    "research": "research/modes/ew6NU1Z_G4k.json",
    "confidence": "high"
  }
});
