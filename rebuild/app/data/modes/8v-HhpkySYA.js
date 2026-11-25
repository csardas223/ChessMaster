/* How Many Queens vs Magnus: game 1 even, then White pawns become queens one by one (h2 first). Sources: research/modes/8v-HhpkySYA.json. */
CM.mode({
  id: "8v-HhpkySYA",
  title: "How Many Queens to BEAT Magnus?",
  name: "How many Queens?",
  category: "Challenges & Odds",
  description: "Both sides start with full armies. After every loss one of your pawns (h2 first, then g2, ...) turns into an extra queen.",
  how_to_win: "Checkmate Magnus (draws do not count). The video needed 2 extra queens.",
  player_side: "white",
  opponent: { name: "Magnus", rating: 2850, avatar: "assets/modes/t61xLLQbotM/magnus.png", tagline: "chess.com Magnus Carlsen bot" },
  board: { files: 8, ranks: 8 },
  theme: { light: "#ecd9b6", dark: "#b68667" },
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
    research: "research/modes/8v-HhpkySYA.json"
  }
});
