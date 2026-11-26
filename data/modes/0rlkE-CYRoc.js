/* Stockfish, But It Gains 3600 ELO in 5 Seconds. Sources: research/modes/0rlkE-CYRoc.json, frames (purple board #ECE1EC/#8A5194, ClockFish (100) -> (2400)). Inferred: the ramp; thumbnail pairs clock 10:00/05:00/00:01 with 250/1450/2650, i.e. about +240 Elo per minute of game time. */
CM.mode({
  "id": "0rlkE-CYRoc",
  "title": "Stockfish, But It Gains 3600 ELO in 5 Seconds",
  "name": "ClockFish",
  "category": "Variant Bots",
  "description": "Every time it is your move ClockFish drops to 0 Elo and gains 100 Elo every 0.14 s you think, reaching 3600 after 5 seconds. It plays at the rating it had when you moved (iwantcheckmate.com rules).",
  "how_to_win": "Checkmate ClockFish quickly, or flag it.",
  "player_side": "white",
  "opponent": {
    "name": "ClockFish",
    "rating": 0,
    "avatar": "assets/modes/0rlkE-CYRoc/clockfish.png",
    "tagline": "Gets stronger every second."
  },
  "board": {
    "files": 8,
    "ranks": 8,
    "light": "#ece1ec",
    "dark": "#8a5194"
  },
  "theme": {
    "background": "#2a1f33"
  },
  "setup": {
    "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR"
  },
  "clock": {
    "w": 600,
    "b": 600,
    "inc": 0,
    "bot": true
  },
  "params": {
    "elo": {
      "start": 0,
      "turnRamp": { "ms": 5000, "to": 3600, "step": 100 },
      "max": 3600
    }
  },
  "hooks": "g2_elofish",
  "source": {
    "research": "research/modes/0rlkE-CYRoc.json",
    "confidence": "medium",
    "art": "avatar from the video (research/frames/sprites), owner instruction 2026-11-24"
  }
});
