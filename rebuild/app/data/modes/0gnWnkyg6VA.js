/* Martin, But He Gains 1000 ELO If He Captures or Checks. Sources: research/modes/0gnWnkyg6VA.json (transcript 0:01, 5:39 game 2 starts at 1250, 9:02 max 3600). */
CM.mode({
  "id": "0gnWnkyg6VA",
  "title": "Martin, But He Gains 1000 ELO If He Captures or Checks",
  "name": "Hungry Martin",
  "category": "Variant Bots",
  "description": "Martin gains 1000 Elo every time he captures a piece or puts you in check (max 3600). Game 1 he starts at 250, game 2 at 1250.",
  "how_to_win": "Checkmate Martin while keeping your pieces out of his reach.",
  "player_side": "white",
  "opponent": {
    "name": "Hungry Martin",
    "rating": 250,
    "avatar": "assets/modes/0gnWnkyg6VA/hungry-martin.png",
    "tagline": "+1000 Elo for every capture or check."
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
      "starts": [
        250,
        1250
      ],
      "botCapCheck": 1000,
      "max": 3600
    }
  },
  "hooks": "g2_elofish",
  "source": { "notes": "Art: hungry-martin avatar re-cropped without the black strip.",
    "research": "research/modes/0gnWnkyg6VA.json",
    "confidence": "high",
    "art": "avatar from the video (research/frames/sprites), owner instruction 2026-11-24"
  }
});
