/* Can I MASTER Gothic Chess? Five games on a 10x8 board with Archbishop and Chancellor.
   Sources: research/modes/cigOpktP92s.json (setup rnbqckabnr), frames: 10x8 board, outis3. */
CM.mode({
  id: "cigOpktP92s",
  name: "Gothic Chess",
  category: "Variants & Games",
  description: "A 10x8 board with ten pawns per side and two extra pieces: the Chancellor (rook + knight) next to the queen and the Archbishop (bishop + knight) next to the king.",
  how_to_win: "Checkmate.",
  player_side: "white",
  opponent: {"name": "outis3", "rating": 1500, "tagline": "Gothic Chess opponent on chess.com"},
  board: {"files": 10, "ranks": 8, "light": "#eaf6d2", "dark": "#7ea25a"},
  setup: {"fen": "rnbqckabnr/pppppppppp/10/10/10/10/PPPPPPPPPP/RNBQCKABNR"},
  rules: {"promotion": {"choices": ["Q", "C", "A", "R", "B", "N"]}},
  bot: {"engine": "search", "elo": 1500, "depth": 3, "time_ms": 700},
  vfx: [{ type: 'overlay', at: 'board', image: 'assets/modes/cigOpktP92s/gothic_piece_crowned.png', fit: 'contain', duration_ms: 1600, id: 'g5intro' /* video art */ }],
  source: {"notes": "Castling uses the engine's generic rule (king two squares toward the rook); Gothic Chess moves the king three squares on the kingside.", "research": "research/modes/cigOpktP92s.json", "confidence": "high"}
});
