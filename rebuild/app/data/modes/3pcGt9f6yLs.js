/* How Many Knights and Bishops to BEAT Martin: king + N bishop/knight pairs vs Martin. Sources: research/modes/3pcGt9f6yLs.json. Pair placement inferred. */
CM.mode({
  id: "3pcGt9f6yLs",
  title: "How Many Knights and Bishops to BEAT Martin?",
  name: "Knight + Bishop Pairs",
  category: "Challenges & Odds",
  description: "How Many Knights and Bishops to BEAT Martin? King + bishop-and-knight pairs against Martin's full army; one more pair after every failed game. Stalemate is only a draw.",
  how_to_win: "Checkmate Martin with as few pairs as possible.",
  player_side: "white",
  opponent: { name: "Martin", rating: 250, avatar: "assets/avatars/bot.svg", tagline: "chess.com beginner bot" },
  board: { files: 8, ranks: 8 },
  theme: { light: "#eadeae", dark: "#ba8a66" },
  setup: { fen: "rnbqkbnr/pppppppp/8/8/8/8/8/1NB1K3" },
  params: {
    levels: [
      { label: "1 Pair", fen: "rnbqkbnr/pppppppp/8/8/8/8/8/1NB1K3" },
      { label: "2 Pairs", fen: "rnbqkbnr/pppppppp/8/8/8/8/8/1NB1KBN1" },
      { label: "3 Pairs", fen: "rnbqkbnr/pppppppp/8/8/8/8/8/NNBNKBB1" },
      { label: "4 Pairs", fen: "rnbqkbnr/pppppppp/8/8/8/8/4N3/NNBBKBBN" },
      { label: "5 Pairs", fen: "rnbqkbnr/pppppppp/8/8/8/8/3NNN2/BNBBKBBN" },
      { label: "6 Pairs", fen: "rnbqkbnr/pppppppp/8/8/8/8/2NNNNN1/BBBBKBBN" },
      { label: "7 Pairs", fen: "rnbqkbnr/pppppppp/8/8/8/8/1NNBNNNN/BBBBKBBN" }
    ],
    advance: "fail",
    unit: "Pairs"
  },
  hooks: "g3_ladder",
  source: {
    confidence: "medium",
    notes: "Pair squares inferred (c1/b1, f1/g1, then alternating).",
    research: "research/modes/3pcGt9f6yLs.json"
  }
});
