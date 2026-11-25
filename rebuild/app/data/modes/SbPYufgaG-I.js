/* Stockfish, But It Loses 500 ELO If I Play the WORST Move. Sources: research/modes/SbPYufgaG-I.json (3600, -500 per worst move; floor inferred 100). Worst = lowest of all legal moves by the built-in search. */
CM.mode({
  "id": "SbPYufgaG-I",
  "title": "Stockfish, But It Loses 500 ELO If I Play the WORST Move",
  "name": "Pity Fish",
  "category": "Variant Bots",
  "description": "Stockfish starts at 3600 and loses 500 Elo every time you play the single worst move in the position. Hang pieces on purpose (but never allow mate in one).",
  "how_to_win": "Drag Pity Fish down with terrible moves, then checkmate it.",
  "player_side": "white",
  "opponent": {
    "name": "Pity Fish",
    "rating": 3600,
    "avatar": "assets/modes/SbPYufgaG-I/pityfish.svg",
    "tagline": "-500 Elo when you play the worst move."
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
      "playerWorst": -500,
      "min": 100
    }
  },
  "hooks": "g2_elofish",
  "source": {
    "research": "research/modes/SbPYufgaG-I.json",
    "confidence": "high"
  }
});
