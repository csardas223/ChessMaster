/* Giving Magnus extra rooks until I lose: standard armies + N extra black rooks (+ after each win). Sources: research/modes/t61xLLQbotM.json. */
CM.mode({
  id: "t61xLLQbotM",
  title: "Giving Magnus 1 Extra Rook Until I LOSE",
  name: "Extra Rooks",
  category: "Challenges & Odds",
  description: "Both sides have full armies, but Magnus also gets extra rooks on its side of the board. Every win adds more; the run ends with your first loss.",
  how_to_win: "Keep beating Magnus as the extra rooks pile up. The video run ended around 13 rooks.",
  player_side: "white",
  opponent: { name: "Magnus", rating: 2882, avatar: "assets/modes/t61xLLQbotM/magnus.png", tagline: "chess.com Magnus Carlsen bot" },
  board: { files: 8, ranks: 8 },
  theme: { light: "#ebd9b1", dark: "#b58567" },
  setup: { fen: "rnbqkbnr/pppppppp/7r/8/8/8/PPPPPPPP/RNBQKBNR" },
  params: {
    levels: [
      { label: "+1 Rook", fen: "rnbqkbnr/pppppppp/7r/8/8/8/PPPPPPPP/RNBQKBNR" },
      { label: "+2 Rooks", fen: "rnbqkbnr/pppppppp/r6r/8/8/8/PPPPPPPP/RNBQKBNR" },
      { label: "+3 Rooks", fen: "rnbqkbnr/pppppppp/r5rr/8/8/8/PPPPPPPP/RNBQKBNR" },
      { label: "+4 Rooks", fen: "rnbqkbnr/pppppppp/rr4rr/8/8/8/PPPPPPPP/RNBQKBNR" },
      { label: "+5 Rooks", fen: "rnbqkbnr/pppppppp/rr3rrr/8/8/8/PPPPPPPP/RNBQKBNR" },
      { label: "+6 Rooks", fen: "rnbqkbnr/pppppppp/rrr2rrr/8/8/8/PPPPPPPP/RNBQKBNR" },
      { label: "+7 Rooks", fen: "rnbqkbnr/pppppppp/rrr1rrrr/8/8/8/PPPPPPPP/RNBQKBNR" },
      { label: "+8 Rooks", fen: "rnbqkbnr/pppppppp/rrrrrrrr/8/8/8/PPPPPPPP/RNBQKBNR" },
      { label: "+9 Rooks", fen: "rnbqkbnr/pppppppp/rrrrrrrr/7r/8/8/PPPPPPPP/RNBQKBNR" },
      { label: "+10 Rooks", fen: "rnbqkbnr/pppppppp/rrrrrrrr/r6r/8/8/PPPPPPPP/RNBQKBNR" },
      { label: "+11 Rooks", fen: "rnbqkbnr/pppppppp/rrrrrrrr/r5rr/8/8/PPPPPPPP/RNBQKBNR" },
      { label: "+12 Rooks", fen: "rnbqkbnr/pppppppp/rrrrrrrr/rr4rr/8/8/PPPPPPPP/RNBQKBNR" },
      { label: "+13 Rooks", fen: "rnbqkbnr/pppppppp/rrrrrrrr/rr3rrr/8/8/PPPPPPPP/RNBQKBNR" },
      { label: "+14 Rooks", fen: "rnbqkbnr/pppppppp/rrrrrrrr/rrr2rrr/8/8/PPPPPPPP/RNBQKBNR" },
      { label: "+15 Rooks", fen: "rnbqkbnr/pppppppp/rrrrrrrr/rrr1rrrr/8/8/PPPPPPPP/RNBQKBNR" },
      { label: "+16 Rooks", fen: "rnbqkbnr/pppppppp/rrrrrrrr/rrrrrrrr/8/8/PPPPPPPP/RNBQKBNR" }
    ],
    advance: "win",
    unit: "Rooks"
  },
  hooks: "g3_ladder",
  source: {
    confidence: "medium",
    notes: "Extra pieces fill rank 6, then 5, 4, 3 (h6 first). Step sizes for knights/bishops/rooks inferred.",
    research: "research/modes/t61xLLQbotM.json"
  }
});
