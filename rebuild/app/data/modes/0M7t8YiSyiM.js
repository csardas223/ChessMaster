/* How Many Pawns to BEAT Martin (rows): K+Pd2, then +8 pawns per loss. Sources: research/modes/0M7t8YiSyiM.json. */
CM.mode({
  id: "0M7t8YiSyiM",
  title: "How Many Pawns to BEAT Martin?",
  name: "How many pawns?",
  category: "Challenges & Odds",
  description: "How Many Pawns to BEAT Martin? Game 1 is a king and one pawn against Martin's full army; every loss adds a whole row of 8 pawns.",
  how_to_win: "Checkmate Martin. The video won in game 2.",
  player_side: "white",
  opponent: { name: "Martin", rating: 250, avatar: "assets/avatars/bot.svg", tagline: "chess.com beginner bot" },
  board: { files: 8, ranks: 8 },
  theme: { light: "#ead2ba", dark: "#ba8a66" },
  setup: { fen: "rnbqkbnr/pppppppp/8/8/8/8/3P4/4K3" },
  params: {
    levels: [
      { label: "1 Pawn", fen: "rnbqkbnr/pppppppp/8/8/8/8/3P4/4K3" },
      { label: "9 Pawns", fen: "rnbqkbnr/pppppppp/8/8/8/PPPPPPPP/3P4/4K3" },
      { label: "17 Pawns", fen: "rnbqkbnr/pppppppp/8/8/PPPPPPPP/PPPPPPPP/3P4/4K3" },
      { label: "25 Pawns", fen: "rnbqkbnr/pppppppp/8/PPPPPPPP/PPPPPPPP/PPPPPPPP/3P4/4K3" }
    ],
    advance: "fail",
    unit: "Pawns"
  },
  hooks: "g3_ladder",
  source: {
    confidence: "medium",
    notes: "The added row sits on rank 3 (rank not stated).",
    research: "research/modes/0M7t8YiSyiM.json"
  }
});
