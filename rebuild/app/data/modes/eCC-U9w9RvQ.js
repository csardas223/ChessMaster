/* Stockfish, But It Copies Your Last Move Quality... Sources: research/modes/eCC-U9w9RvQ.json (rank matching, purple board #ebe1eb/#8a5294). */
CM.mode({
  "id": "eCC-U9w9RvQ",
  "title": "Stockfish, But It Copies Your Last Move Quality...",
  "name": "MirrorFish",
  "category": "Variant Bots",
  "description": "MirrorFish copies the quality of your last move: play the best move and it plays its best; play your 5th best and it plays its 5th best.",
  "how_to_win": "Play bad moves that create threats so its equally bad replies lose. Checkmate MirrorFish.",
  "player_side": "white",
  "opponent": {
    "name": "MirrorFish",
    "rating": null,
    "avatar": "assets/modes/eCC-U9w9RvQ/mirrorfish.png",
    "tagline": "Copies your move quality."
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
  "bot": {
    "engine": "search",
    "depth": 3,
    "time_ms": 700
  },
  "params": {
    "pick": "mirror"
  },
  "hooks": "g2_fish",
  "source": {
    "research": "research/modes/eCC-U9w9RvQ.json",
    "confidence": "high",
    "art": "avatar from the video (research/frames/sprites), owner instruction 2026-11-24"
  }
});
