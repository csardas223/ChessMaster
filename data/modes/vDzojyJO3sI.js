/* Stockfish, But It Takes 31 Pieces Before Checkmating You. Sources: research/modes/vDzojyJO3sI.json, transcript (cm-recheck2: 0:01, 4:35 rule, 7:35 loss, 10:10 win); green board #f6f6de/#669642. */
CM.mode({
  "id": "vDzojyJO3sI",
  "title": "Stockfish, But It Takes 31 Pieces Before Checkmating You",
  "name": "TortureFish",
  "category": "Variant Bots",
  "description": "TortureFish is Stockfish, but it is not allowed to checkmate you while you still have any piece besides your king: whenever its best move is mate it plays the next best move instead. Otherwise it plays like Stockfish. There is no stalemate escape: it wins once your army is gone.",
  "how_to_win": "Checkmate TortureFish. Hint from the video: walk your king out, it cannot mate you while you have pieces.",
  "player_side": "white",
  "opponent": {
    "name": "TortureFish",
    "rating": null,
    "avatar": "assets/modes/vDzojyJO3sI/torturefish.png",
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
    "confidence": "high",
    "notes": "cm-recheck2 2026-11-25: transcript (analyze_video) 0:01 'Stockfish, but it captures all of your pieces before checkmating you', 4:35 'when it gets to a checkmating position it is not allowed to deliver checkmate, so it just plays the second best move ... not actually programmed to actively capture pieces' (the old capture bias in g2_fish torture was removed), 7:35 game 1 lost, 7:45-10:10 game 2 won by walking the king out. Bot on iwantcheckmate.com.",
    "art": "avatar from the video (research/frames/sprites), owner instruction 2026-11-24"
  }
});
