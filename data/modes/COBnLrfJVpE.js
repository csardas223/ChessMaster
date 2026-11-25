/* How Many Queens vs Stockfish 10: game 1 even, then White pawns become queens one by one (h2 first). Sources: research/modes/COBnLrfJVpE.json. */
CM.mode({
  id: "COBnLrfJVpE",
  title: "How Many Queens to BEAT Stockfish 10? (NOT Komodo)",
  name: "How many Queens?",
  category: "Challenges & Odds",
  description: "Both sides start with full armies. After every loss one of your pawns (h2 first, then g2, ...) turns into an extra queen.",
  how_to_win: "Checkmate Stockfish 10. The video needed 1 extra queen.",
  player_side: "white",
  player: { name: 'You', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },   /* iwantcheckmate's own avatar (purple king) from the videos */
  opponent: { name: "Stockfish 10", rating: 3400, avatar: "assets/modes/vEk6QGmqLdA/stockfish.png", tagline: "depth 25" },
  board: { files: 8, ranks: 8 },
  theme: { light: "#f6deae", dark: "#ae7236" },
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
    confidence: "high",
    notes: "Which pawn is replaced first: h2 (series).",
    research: "research/modes/COBnLrfJVpE.json"
  }
});
