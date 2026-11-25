/* Magnus: king + N rooks vs a full army, one more after each loss. Sources: research/modes/D1xzjaq6swA.json, frames. Rook squares beyond h1/a1 follow the series order d1, f1, c1, ... */
CM.mode({
  id: "D1xzjaq6swA",
  title: "How Many Rooks to BEAT Magnus?",
  name: "How many Rooks?",
  category: "Challenges & Odds",
  description: "How Many Rooks to BEAT Magnus? King + rooks (no pawns) against Magnus's full army; one more rook after every loss. You may castle with the h1 rook.",
  how_to_win: "Checkmate Magnus. The video needed 9 rooks.",
  player_side: "white",
  opponent: { name: "Magnus", rating: 2882, avatar: "assets/modes/t61xLLQbotM/magnus.png", tagline: "chess.com Magnus Carlsen bot" },
  board: { files: 8, ranks: 8 },
  theme: { light: "#ecd9b3", dark: "#b28567" },
  setup: { fen: "rnbqkbnr/pppppppp/8/8/8/8/8/4K2R" },
  params: {
    levels: [
      { label: "1 Rook", fen: "rnbqkbnr/pppppppp/8/8/8/8/8/4K2R" },
      { label: "2 Rooks", fen: "rnbqkbnr/pppppppp/8/8/8/8/8/R3K2R" },
      { label: "3 Rooks", fen: "rnbqkbnr/pppppppp/8/8/8/8/8/R2RK2R" },
      { label: "4 Rooks", fen: "rnbqkbnr/pppppppp/8/8/8/8/8/R2RKR1R" },
      { label: "5 Rooks", fen: "rnbqkbnr/pppppppp/8/8/8/8/8/R1RRKR1R" },
      { label: "6 Rooks", fen: "rnbqkbnr/pppppppp/8/8/8/8/8/R1RRKRRR" },
      { label: "7 Rooks", fen: "rnbqkbnr/pppppppp/8/8/8/8/8/RRRRKRRR" },
      { label: "8 Rooks", fen: "rnbqkbnr/pppppppp/8/8/8/8/8/RRRRKRRR" },
      { label: "9 Rooks", fen: "rnbqkbnr/pppppppp/8/8/8/8/8/RRRRKRRR" },
      { label: "10 Rooks", fen: "rnbqkbnr/pppppppp/8/8/8/8/4R3/RRRRKRRR" },
      { label: "11 Rooks", fen: "rnbqkbnr/pppppppp/8/8/8/8/3RR3/RRRRKRRR" },
      { label: "12 Rooks", fen: "rnbqkbnr/pppppppp/8/8/8/8/3RRR2/RRRRKRRR" }
    ],
    advance: "fail",
    unit: "Rooks"
  },
  hooks: "g3_ladder",
  source: {
    confidence: "high",
    notes: "Rook squares beyond h1/a1 follow the series order d1, f1, c1, ...",
    research: "research/modes/D1xzjaq6swA.json"
  }
});
