/* How Many Queens vs Ding Liren: game 1 even, then White pawns become queens one by one (h2 first). Sources: research/modes/V_3rvGDzv_U.json. */
CM.mode({
  id: "V_3rvGDzv_U",
  title: "How Many Queens to BEAT Ding Liren?",
  name: "How many Queens?",
  category: "Challenges & Odds",
  description: "Both sides start with full armies. After every loss one of your pawns (h2 first, then g2, ...) turns into an extra queen.",
  how_to_win: "Checkmate the Ding bot. The video needed 1 extra queen.",
  player_side: "white",
  opponent: { name: "Ding Liren", rating: 2780, avatar: "assets/avatars/bot.svg", tagline: "chess.com Ding Liren bot" },
  board: { files: 8, ranks: 8 },
  theme: { light: "#ebd8b5", dark: "#af8665" },
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
    research: "research/modes/V_3rvGDzv_U.json"
  }
});
