/* Martin: king + N knights vs a full army, one more after each loss. Sources: research/modes/bu31Ps0hhao.json, frames. Third knight square inferred (c1). */
CM.mode({
  id: "bu31Ps0hhao",
  title: "How Many Knights to BEAT Martin?",
  name: "How many Knights?",
  category: "Challenges & Odds",
  description: "How Many Knights to BEAT Martin? King + knights (starting with two) against Martin's full army. Stalemate is only a draw.",
  how_to_win: "Checkmate Martin. The video did it with 3 knights.",
  player_side: "white",
  opponent: { name: "Martin", rating: 250, avatar: "assets/avatars/bot.svg", tagline: "chess.com beginner bot" },
  board: { files: 8, ranks: 8 },
  theme: { light: "#eadeba", dark: "#ba8a66" },
  setup: { fen: "rnbqkbnr/pppppppp/8/8/8/8/8/1N2K1N1" },
  params: {
    levels: [
      { label: "2 Knights", fen: "rnbqkbnr/pppppppp/8/8/8/8/8/1N2K1N1" },
      { label: "3 Knights", fen: "rnbqkbnr/pppppppp/8/8/8/8/8/1NN1K1N1" },
      { label: "4 Knights", fen: "rnbqkbnr/pppppppp/8/8/8/8/8/1NN1KNN1" },
      { label: "5 Knights", fen: "rnbqkbnr/pppppppp/8/8/8/8/8/1NNNKNN1" },
      { label: "6 Knights", fen: "rnbqkbnr/pppppppp/8/8/8/8/8/NNNNKNN1" }
    ],
    advance: "fail",
    unit: "Knights"
  },
  hooks: "g3_ladder",
  source: {
    confidence: "high",
    notes: "Third knight square inferred (c1).",
    research: "research/modes/bu31Ps0hhao.json"
  }
});
