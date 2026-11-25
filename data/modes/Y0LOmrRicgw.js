/* Martinfish Just Got WORSE. Sources: research/modes/Y0LOmrRicgw.json (90:10, player black). */
CM.mode({
  "id": "Y0LOmrRicgw",
  "title": "Martinfish Just Got WORSE",
  "name": "Martinfish (90%)",
  "category": "Variant Bots",
  "description": "Martinfish at a 90:10 ratio: 90% Stockfish's top move, 10% a Martin move, chosen at random. You play Black.",
  "how_to_win": "Checkmate Martinfish as Black.",
  "player_side": "black",
  "opponent": {
    "name": "Martinfish",
    "rating": null,
    "avatar": "assets/modes/Y0LOmrRicgw/martinfish.png",
    "tagline": "90% Stockfish, 10% Martin."
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
      "p": 0.9
    }
  },
  "hooks": "g2_elofish",
  "source": {
    "research": "research/modes/Y0LOmrRicgw.json",
    "confidence": "high",
    "art": "avatar from the video (research/frames/sprites), owner instruction 2026-11-24"
  }
});
