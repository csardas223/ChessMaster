/* Martin, But He Gains 100 ELO Every Move. Sources: research/modes/PPvPTwZg0JQ.json (+100 per Martin move, cap 3600). */
CM.mode({
  "id": "PPvPTwZg0JQ",
  "title": "Martin, But He Gains 100 ELO Every Move",
  "name": "Smarten",
  "category": "Variant Bots",
  "description": "Martin starts at 250 Elo and gains 100 Elo after every move he makes. Win material fast before he becomes Stockfish.",
  "how_to_win": "Checkmate Smarten before his rating runs away.",
  "player_side": "white",
  "opponent": {
    "name": "Smarten",
    "rating": 250,
    "avatar": "assets/modes/PPvPTwZg0JQ/smarten.png",
    "tagline": "+100 Elo every move."
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
      "botMove": 100,
      "max": 3600
    }
  },
  "hooks": "g2_elofish",
  "source": {
    "research": "research/modes/PPvPTwZg0JQ.json",
    "confidence": "high",
    "art": "avatar from the video (research/frames/sprites), owner instruction 2026-11-24"
  }
});
