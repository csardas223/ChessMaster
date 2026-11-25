/* Martin: king + N rooks vs a full army, one more after each loss. Sources: research/modes/mFa35aLmhbQ.json, frames. */
CM.mode({
  id: "mFa35aLmhbQ",
  title: "How Many Rooks to BEAT Martin?",
  name: "How many Rooks?",
  category: "Challenges & Odds",
  description: "How Many Rooks to BEAT Martin? King + rooks against Martin's full army; one more rook after every loss.",
  how_to_win: "Checkmate Martin. The video needed 2 rooks.",
  player_side: "white",
  opponent: { name: "Martin", rating: 250, avatar: "assets/modes/XuvZCCFk42k/martin.png", tagline: "chess.com beginner bot" },
  board: { files: 8, ranks: 8 },
  theme: { light: "#ecd9b3", dark: "#b28567" },
  setup: { fen: "rnbqkbnr/pppppppp/8/8/8/8/8/4K2R" },
  params: {
    levels: [
      { label: "1 Rook", fen: "rnbqkbnr/pppppppp/8/8/8/8/8/4K2R" },
      { label: "2 Rooks", fen: "rnbqkbnr/pppppppp/8/8/8/8/8/R3K2R" },
      { label: "3 Rooks", fen: "rnbqkbnr/pppppppp/8/8/8/8/8/R2RK2R" },
      { label: "4 Rooks", fen: "rnbqkbnr/pppppppp/8/8/8/8/8/R2RKR1R" },
      { label: "5 Rooks", fen: "rnbqkbnr/pppppppp/8/8/8/8/8/R1RRKR1R" }
    ],
    advance: "fail",
    unit: "Rooks"
  },
  hooks: "g3_ladder",
  source: { confidence: "high", research: "research/modes/mFa35aLmhbQ.json" }
});
