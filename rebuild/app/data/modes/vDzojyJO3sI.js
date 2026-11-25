/* Stockfish, But It Takes 31 Pieces Before Checkmating You. Sources: research/modes/vDzojyJO3sI.json (LOW confidence: transcript failed; rule inferred from the title and bot panel; green board #f6f6de/#669642). */
CM.mode({
  "id": "vDzojyJO3sI",
  "title": "Stockfish, But It Takes 31 Pieces Before Checkmating You",
  "name": "TortureFish",
  "category": "Variant Bots",
  "description": "TortureFish is Stockfish, but it will not checkmate you until it has taken every one of your pieces. It grabs material and refuses mate while you still have anything left.",
  "how_to_win": "Checkmate TortureFish before it strips your army.",
  "player_side": "white",
  "opponent": {
    "name": "TortureFish",
    "rating": null,
    "avatar": "assets/modes/vDzojyJO3sI/torturefish.svg",
    "tagline": "Takes everything before checkmating you."
  },
  "board": {
    "files": 8,
    "ranks": 8,
    "light": "#f6f6de",
    "dark": "#669642"
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
    "pick": "torture",
    "lastMoveTint": "rgba(214,64,168,.45)"
  },
  "hooks": "g2_fish",
  "source": {
    "research": "research/modes/vDzojyJO3sI.json",
    "confidence": "low"
  }
});
