/* Martin, But He Gains 200 ELO If I DON'T Make the Best Move. Sources: research/modes/nx6jkHl2k_Y.json (+200 per non-best move, cap 3600). Best = top move of the built-in search. */
CM.mode({
  "id": "nx6jkHl2k_Y",
  "title": "Martin, But He Gains 200 ELO If I DON'T Make the Best Move",
  "name": "Martin +200",
  "category": "Variant Bots",
  "description": "Martin starts at 250 and gains 200 Elo every time you do NOT play the engine's best move (max 3600). Best moves keep him where he is.",
  "how_to_win": "Win before Martin turns into Stockfish. (The video lost.)",
  "player_side": "white",
  "opponent": {
    "name": "Martin",
    "rating": 250,
    "avatar": "assets/modes/nx6jkHl2k_Y/martin.png",
    "tagline": "+200 Elo when you miss the best move."
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
      "start": 250,
      "playerNotBest": 200,
      "max": 3600
    }
  },
  "hooks": "g2_elofish",
  "source": {
    "research": "research/modes/nx6jkHl2k_Y.json",
    "confidence": "high",
    "art": "avatar from the video (research/frames/sprites), owner instruction 2026-11-24"
  }
});
