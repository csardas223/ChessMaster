/* How Many Rooks vs Stockfish 17: game 1 even, then White pawns become rooks one by one (h2 first). Sources: research/modes/vEk6QGmqLdA.json. */
CM.mode({
  id: "vEk6QGmqLdA",
  title: "How Many Rooks to BEAT Stockfish?",
  name: "How many Rooks?",
  category: "Challenges & Odds",
  description: "Both sides start with full armies. After every loss one of your pawns (h2 first, then g2, ...) turns into an extra rook.",
  how_to_win: "Checkmate Stockfish 17. The video needed 2 extra rooks.",
  player_side: "white",
  opponent: { name: "Stockfish 17", rating: 3600, avatar: "assets/modes/vEk6QGmqLdA/stockfish.png", tagline: "depth 35" },
  board: { files: 8, ranks: 8 },
  theme: { light: "#f6deae", dark: "#ae7236" },
  setup: { fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR" },
  params: {
    levels: [
      { label: "Even", fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR" },
      { label: "+1 Rook", fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPR/RNBQKBNR" },
      { label: "+2 Rooks", fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPRR/RNBQKBNR" },
      { label: "+3 Rooks", fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPRRR/RNBQKBNR" },
      { label: "+4 Rooks", fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPRRRR/RNBQKBNR" },
      { label: "+5 Rooks", fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPRRRRR/RNBQKBNR" },
      { label: "+6 Rooks", fen: "rnbqkbnr/pppppppp/8/8/8/8/PPRRRRRR/RNBQKBNR" },
      { label: "+7 Rooks", fen: "rnbqkbnr/pppppppp/8/8/8/8/PRRRRRRR/RNBQKBNR" },
      { label: "+8 Rooks", fen: "rnbqkbnr/pppppppp/8/8/8/8/RRRRRRRR/RNBQKBNR" }
    ],
    advance: "fail",
    unit: "Rooks"
  },
  hooks: "g3_ladder",
  source: {
    confidence: "high",
    notes: "Which pawn is replaced first: h2 (series).",
    research: "research/modes/vEk6QGmqLdA.json"
  }
});
