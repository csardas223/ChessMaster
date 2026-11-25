/* How Many Rooks vs GothamChess: game 1 even, then White pawns become rooks one by one (h2 first). Sources: research/modes/49AZVEzA7zU.json. */
CM.mode({
  id: "49AZVEzA7zU",
  title: "How Many ROOOOKS To BEAT GothamChess?",
  name: "How many Rooks?",
  category: "Challenges & Odds",
  description: "Both sides start with full armies. After every loss one of your pawns (h2 first, then g2, ...) turns into an extra rook.",
  how_to_win: "Beat the Gotham bot (the video accepted a 125-move draw in game 1).",
  player_side: "white",
  opponent: { name: "GothamChess", rating: 2500, avatar: "assets/avatars/bot.svg", tagline: "chess.com Levy Rozman bot" },
  board: { files: 8, ranks: 8 },
  theme: { light: "#ebd9b3", dark: "#b28567" },
  setup: { fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR" },
  params: {
    levels: [
      { label: "Even", fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR" },
      { label: "+1 Rook", fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPR/RNBQKBNR" },
      { label: "+2 Rooks", fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPRR/RNBQKBNR" },
      { label: "+3 Rooks", fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPRRR/RNBQKBNR" },
      { label: "+4 Rooks", fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPRRRR/RNBQKBNR" },
      { label: "+5 Rooks", fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPRRRRR/RNBQKBNR" },
      { label: "+6 Rooks", fen: "rnbqkbnr/pppppppp/8/8/8/8/PPRRRRRR/RNBQKBNR" },
      { label: "+7 Rooks", fen: "rnbqkbnr/pppppppp/8/8/8/8/PRRRRRRR/RNBQKBNR" },
      { label: "+8 Rooks", fen: "rnbqkbnr/pppppppp/8/8/8/8/RRRRRRRR/RNBQKBNR" }
    ],
    advance: "fail",
    unit: "Rooks"
  },
  hooks: "g3_ladder",
  source: {
    confidence: "medium",
    notes: "Which pawn is replaced first: h2 (series).",
    research: "research/modes/49AZVEzA7zU.json"
  }
});
