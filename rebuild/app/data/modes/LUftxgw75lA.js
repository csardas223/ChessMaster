/* How Many Queens vs Stockfish: game 1 even, then White pawns become queens one by one (h2 first). Sources: research/modes/LUftxgw75lA.json. */
CM.mode({
  id: "LUftxgw75lA",
  title: "How Many Queens To BEAT Stockfish?",
  name: "How many Queens?",
  category: "Challenges & Odds",
  description: "Both sides start with full armies. After every loss one of your pawns (h2 first, then g2, ...) turns into an extra queen.",
  how_to_win: "Checkmate the engine. The video needed 1 extra queen.",
  player_side: "white",
  opponent: {
    name: "Stockfish",
    rating: 3200,
    avatar: "assets/modes/vEk6QGmqLdA/stockfish.png",
    tagline: "chess.com engine at 3200"
  },
  board: { files: 8, ranks: 8 },
  theme: { light: "#ecd9b4", dark: "#b28567" },
  setup: { fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR" },
  params: {
    levels: [
      { label: "Even", fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR" },
      { label: "+1 Queen", fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPQ/RNBQKBNR" },
      { label: "+2 Queens", fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPQQ/RNBQKBNR" },
      { label: "+3 Queens", fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPQQQ/RNBQKBNR" },
      { label: "+4 Queens", fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPQQQQ/RNBQKBNR" },
      { label: "+5 Queens", fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPQQQQQ/RNBQKBNR" },
      { label: "+6 Queens", fen: "rnbqkbnr/pppppppp/8/8/8/8/PPQQQQQQ/RNBQKBNR" },
      { label: "+7 Queens", fen: "rnbqkbnr/pppppppp/8/8/8/8/PQQQQQQQ/RNBQKBNR" },
      { label: "+8 Queens", fen: "rnbqkbnr/pppppppp/8/8/8/8/QQQQQQQQ/RNBQKBNR" }
    ],
    advance: "fail",
    unit: "Queens"
  },
  hooks: "g3_ladder",
  source: {
    confidence: "medium",
    notes: "Which pawn is replaced first: h2 (series).",
    research: "research/modes/LUftxgw75lA.json"
  }
});
