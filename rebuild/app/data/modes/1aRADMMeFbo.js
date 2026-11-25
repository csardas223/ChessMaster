/* Magnus: king + N knights vs a full army, one more after each loss. Sources: research/modes/1aRADMMeFbo.json, frames. Progression between games unknown; levels step by 2 then 4 up to 31 knights (ranks 1-4 full). */
CM.mode({
  id: "1aRADMMeFbo",
  title: "How Many Knights to BEAT Magnus?",
  name: "How many Knights?",
  category: "Challenges & Odds",
  description: "How Many Knights to BEAT Magnus? King + a growing herd of knights (up to four full ranks) against Magnus's full army.",
  how_to_win: "Checkmate Magnus.",
  player_side: "white",
  opponent: { name: "Magnus", rating: 2882, avatar: "assets/modes/t61xLLQbotM/magnus.png", tagline: "chess.com Magnus Carlsen bot" },
  board: { files: 8, ranks: 8 },
  theme: { light: "#eadeba", dark: "#ba8a66" },
  setup: { fen: "rnbqkbnr/pppppppp/8/8/8/8/8/1N2K1N1" },
  params: {
    levels: [
      { label: "2 Knights", fen: "rnbqkbnr/pppppppp/8/8/8/8/8/1N2K1N1" },
      { label: "4 Knights", fen: "rnbqkbnr/pppppppp/8/8/8/8/8/1NN1KNN1" },
      { label: "6 Knights", fen: "rnbqkbnr/pppppppp/8/8/8/8/8/NNNNKNN1" },
      { label: "8 Knights", fen: "rnbqkbnr/pppppppp/8/8/8/8/4N3/NNNNKNNN" },
      { label: "10 Knights", fen: "rnbqkbnr/pppppppp/8/8/8/8/3NNN2/NNNNKNNN" },
      { label: "12 Knights", fen: "rnbqkbnr/pppppppp/8/8/8/8/2NNNNN1/NNNNKNNN" },
      { label: "14 Knights", fen: "rnbqkbnr/pppppppp/8/8/8/8/1NNNNNNN/NNNNKNNN" },
      { label: "16 Knights", fen: "rnbqkbnr/pppppppp/8/8/8/4N3/NNNNNNNN/NNNNKNNN" },
      { label: "20 Knights", fen: "rnbqkbnr/pppppppp/8/8/8/2NNNNN1/NNNNNNNN/NNNNKNNN" },
      { label: "24 Knights", fen: "rnbqkbnr/pppppppp/8/8/4N3/NNNNNNNN/NNNNNNNN/NNNNKNNN" },
      { label: "28 Knights", fen: "rnbqkbnr/pppppppp/8/8/2NNNNN1/NNNNNNNN/NNNNNNNN/NNNNKNNN" },
      { label: "31 Knights", fen: "rnbqkbnr/pppppppp/8/8/NNNNNNNN/NNNNNNNN/NNNNNNNN/NNNNKNNN" }
    ],
    advance: "fail",
    unit: "Knights"
  },
  hooks: "g3_ladder",
  source: {
    confidence: "medium",
    notes: "Progression between games unknown; levels step by 2 then 4 up to 31 knights (ranks 1-4 full).",
    research: "research/modes/1aRADMMeFbo.json"
  }
});
