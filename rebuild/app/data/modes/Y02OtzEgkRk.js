/* Giving Martin extra bishops until I lose: standard armies + N extra black bishops (+ after each win). Sources: research/modes/Y02OtzEgkRk.json. */
CM.mode({
  id: "Y02OtzEgkRk",
  title: "Giving Martin 1 Extra Bishop Until I LOSE",
  name: "Extra Bishops",
  category: "Challenges & Odds",
  description: "Both sides have full armies, but Martin also gets extra bishops on its side of the board. Every win adds more; the run ends with your first loss.",
  how_to_win: "Keep beating Martin as the extra bishops pile up. The video reached 23-31 bishops.",
  player_side: "white",
  opponent: { name: "Martin", rating: 250, avatar: "assets/avatars/bot.svg", tagline: "chess.com beginner bot" },
  board: { files: 8, ranks: 8 },
  theme: { light: "#ebd9b0", dark: "#af8665" },
  setup: { fen: "rnbqkbnr/pppppppp/7b/8/8/8/PPPPPPPP/RNBQKBNR" },
  params: {
    levels: [
      { label: "+1 Bishop", fen: "rnbqkbnr/pppppppp/7b/8/8/8/PPPPPPPP/RNBQKBNR" },
      { label: "+4 Bishops", fen: "rnbqkbnr/pppppppp/bb4bb/8/8/8/PPPPPPPP/RNBQKBNR" },
      { label: "+8 Bishops", fen: "rnbqkbnr/pppppppp/bbbbbbbb/8/8/8/PPPPPPPP/RNBQKBNR" },
      { label: "+12 Bishops", fen: "rnbqkbnr/pppppppp/bbbbbbbb/bb4bb/8/8/PPPPPPPP/RNBQKBNR" },
      { label: "+16 Bishops", fen: "rnbqkbnr/pppppppp/bbbbbbbb/bbbbbbbb/8/8/PPPPPPPP/RNBQKBNR" },
      { label: "+20 Bishops", fen: "rnbqkbnr/pppppppp/bbbbbbbb/bbbbbbbb/bb4bb/8/PPPPPPPP/RNBQKBNR" },
      { label: "+24 Bishops", fen: "rnbqkbnr/pppppppp/bbbbbbbb/bbbbbbbb/bbbbbbbb/8/PPPPPPPP/RNBQKBNR" },
      { label: "+28 Bishops", fen: "rnbqkbnr/pppppppp/bbbbbbbb/bbbbbbbb/bbbbbbbb/bb4bb/PPPPPPPP/RNBQKBNR" },
      { label: "+32 Bishops", fen: "rnbqkbnr/pppppppp/bbbbbbbb/bbbbbbbb/bbbbbbbb/bbbbbbbb/PPPPPPPP/RNBQKBNR" }
    ],
    advance: "win",
    unit: "Bishops"
  },
  hooks: "g3_ladder",
  source: {
    confidence: "medium",
    notes: "Extra pieces fill rank 6, then 5, 4, 3 (h6 first). Step sizes for knights/bishops/rooks inferred.",
    research: "research/modes/Y02OtzEgkRk.json"
  }
});
