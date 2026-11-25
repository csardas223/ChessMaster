/* Stockfish, But It Loses 300 ELO When I Give Check. Sources: research/modes/vIvVdaTQi3s.json (official site: -300 per check, floor 0 = random moves). */
CM.mode({
  "id": "vIvVdaTQi3s",
  "title": "Stockfish, But It Loses 300 ELO When I Give Check",
  "name": "Panic Fish",
  "category": "Variant Bots",
  "description": "Stockfish starts at 3600 and loses 300 Elo every time you put its king in check.",
  "how_to_win": "Collect checks to weaken Panic Fish, then checkmate it.",
  "player_side": "white",
  "opponent": {
    "name": "Panic Fish",
    "rating": 3600,
    "avatar": "assets/modes/vIvVdaTQi3s/panicfish.png",
    "tagline": "-300 Elo every time you check it."
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
      "playerCheck": -300,
      "min": 0
    }
  },
  "vfx_timeline": [
    {
      "trigger": {
        "on": "check",
        "by": "player"
      },
      "effect": {
        "type": "shake_piece",
        "at": "bot_king",
        "intensity": 4,
        "duration_ms": 500
      }
    }
  ],
  "hooks": "g2_elofish",
  "source": {
    "research": "research/modes/vIvVdaTQi3s.json",
    "confidence": "high",
    "art": "avatar from the video (research/frames/sprites), owner instruction 2026-11-24"
  }
});
