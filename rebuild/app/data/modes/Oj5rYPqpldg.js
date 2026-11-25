/* Can I SURVIVE Mini Chess? (Rare Variant) chess.com Minihouse (6x6 crazyhouse) vs 2000-2200 humans, player Black.
   Sources: research/modes/Oj5rYPqpldg.json, frames: 6x6, no queen, chadkatter (2247). */
CM.mode({
  id: "Oj5rYPqpldg",
  name: "Mini Chess (6x6 Crazyhouse)",
  category: "Variants & Games",
  description: "A 6x6 board where each side has only a king, rook, knight, bishop and one pawn. Captured pieces switch colour and go to your pocket; on your turn you may drop one onto an empty square instead of moving.",
  how_to_win: "Checkmate a 2000+ opponent on 1-minute clocks.",
  player_side: "black",
  player: {"name": "You", "rating": 1720, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },
  opponent: { "avatar": "assets/modes/Oj5rYPqpldg/opponent.png","name": "chadkatter", "rating": 2247, "tagline": "Minihouse opponent on chess.com"},
  board: {"files": 6, "ranks": 6, "light": "#ecf1d1", "dark": "#7a9f58"},
  pieces: {"P": {"name": "Pawn", "value": 100, "moves": "fmWfcF", "pawn": true, "enPassant": false, "promote": true}},
  setup: {"fen": "2bnrk/5p/6/6/P5/KRNB2"},
  rules: {"drops": true, "castling": false, "enPassant": false, "promotion": {"choices": ["R", "N", "B"]}},
  bot: {"engine": "search", "elo": 2200, "depth": 3, "time_ms": 600},
  clock: {"w": 60, "b": 60, "inc": 0},
  vfx: [{ type: 'overlay', at: 'board', image: 'assets/modes/Oj5rYPqpldg/intro.jpg', fit: 'contain', duration_ms: 1600, id: 'g5intro' /* video art */ }],
  source: {"notes": "Same chess.com Minihouse start as YjXV6gL8SsA (Fairy-Stockfish minihouse: 2bnrk/5p/6/6/P5/KRNB2); frames confirm K, R, N, B, pawns and no queen.", "research": "research/modes/Oj5rYPqpldg.json", "confidence": "medium"}
});
