/* Stockfish, But If It Can Sacrifice a Rook, It Must. Sources: research/modes/g1i9Bp0WbJs.json (green board #eaedd0/#749d54). Sacrifice = rook move to a square you attack (inferred). */
CM.mode({
  "id": "g1i9Bp0WbJs",
  "title": "Stockfish, But If It Can Sacrifice a Rook, It Must",
  "name": "GothamFish",
  "category": "Variant Bots",
  "description": "Stockfish, but if it can sacrifice a rook, it must: whenever a rook move lands where you can take it, it plays one (the best such move). A forced sacrifice is shown with a magenta arrow.",
  "how_to_win": "Collect the free rooks, avoid recapture tricks, checkmate the bot.",
  "player_side": "white",
  "opponent": {
    "name": "GothamFish",
    "rating": 3600,
    "avatar": "assets/modes/g1i9Bp0WbJs/gothamfish.png",
    "tagline": "If it can sacrifice a rook, it must."
  },
  "board": {
    "files": 8,
    "ranks": 8,
    "light": "#eaedd0",
    "dark": "#749d54"
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
    "pick": "rooksac",
    "forcedHighlight": "rgba(220,40,40,.55)"
  },
  "hooks": "g2_fish",
  "source": {
    "research": "research/modes/g1i9Bp0WbJs.json",
    "confidence": "high",
    "art": "avatar from the video (research/frames/sprites), owner instruction 2026-11-24"
  }
});
