/* Stockfish, But It Wants to Capture Your Queen... Sources: research/modes/My1sUnkiNfU.json, frames (purple board #EBE0EC/#8B5194, thumbnail picks Qxe4 over M1). Inferred: it skips mating moves while your queen is alive. */
CM.mode({
  "id": "My1sUnkiNfU",
  "title": "Stockfish, But It Wants to Capture Your Queen...",
  "name": "SimpFish",
  "category": "Variant Bots",
  "description": "SimpFish is Stockfish, but it is in love with your queen: it takes her whenever it can and will not try to checkmate you while she is on the board.",
  "how_to_win": "Use your queen as bait and checkmate SimpFish.",
  "player_side": "white",
  "opponent": {
    "name": "SimpFish",
    "rating": null,
    "avatar": "assets/modes/My1sUnkiNfU/simpfish.png",
    "tagline": "Stockfish, but it wants your queen before checkmating you."
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
    "depth": 4,
    "time_ms": 700
  },
  "params": {
    "pick": "simp"
  },
  "hooks": "g2_fish",
  "source": {
    "research": "research/modes/My1sUnkiNfU.json",
    "confidence": "medium",
    "art": "avatar from the video (research/frames/sprites), owner instruction 2026-11-24"
  }
});
