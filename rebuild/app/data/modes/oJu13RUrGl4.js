/* Stockfish, But It Alternates Playing Light and Dark Squares. Sources: research/modes/oJu13RUrGl4.json (purple board #ECE1EC/#8A5194). Inferred: the first move is free; if it has no move of the right colour it plays its best move. */
CM.mode({
  "id": "oJu13RUrGl4",
  "title": "Stockfish, But It Alternates Playing Light and Dark Squares",
  "name": "ZebraFish",
  "category": "Variant Bots",
  "description": "ZebraFish is Stockfish, but it alternates between moving onto light and dark squares. The status line shows which colour it must use next.",
  "how_to_win": "Exploit the squares it cannot reach this turn and checkmate ZebraFish.",
  "player_side": "white",
  "opponent": {
    "name": "ZebraFish",
    "rating": null,
    "avatar": "assets/modes/oJu13RUrGl4/zebrafish.svg",
    "tagline": "Light square, dark square, light square..."
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
    "time_ms": 800
  },
  "params": {
    "pick": "zebra"
  },
  "hooks": "g2_fish",
  "source": {
    "research": "research/modes/oJu13RUrGl4.json",
    "confidence": "medium"
  }
});
