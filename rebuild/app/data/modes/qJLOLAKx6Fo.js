/* Stockfish, But It Randomly Picks 1 of 3 Top Moves. Sources: research/modes/qJLOLAKx6Fo.json. */
CM.mode({
  "id": "qJLOLAKx6Fo",
  "title": "Stockfish, But It Randomly Picks 1 of 3 Top Moves",
  "name": "Random Fish",
  "category": "Variant Bots",
  "description": "Stockfish randomly plays one of its top three moves (1/3 each; fewer when it has fewer moves).",
  "how_to_win": "Capture pieces with only one recapture so two of its three choices fail.",
  "player_side": "white",
  "opponent": {
    "name": "Random Fish",
    "rating": null,
    "avatar": "assets/modes/qJLOLAKx6Fo/randomfish.png",
    "tagline": "1 of the top 3, at random."
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
  "bot": {
    "engine": "search",
    "depth": 4,
    "time_ms": 800
  },
  "params": {
    "pick": "top3"
  },
  "hooks": "g2_fish",
  "source": {
    "research": "research/modes/qJLOLAKx6Fo.json",
    "confidence": "high",
    "art": "avatar from the video (research/frames/sprites), owner instruction 2026-11-24"
  }
});
