/* Giving Martin extra queens until I lose: standard armies + N extra black queens (+ after each win). Sources: research/modes/Iy-Vr5-3VpY.json. */
CM.mode({
  id: "Iy-Vr5-3VpY",
  title: "Giving Martin 1 Extra Queen Until I LOSE",
  name: "Extra Queens",
  category: "Challenges & Odds",
  description: "Both sides have full armies, but Martin also gets extra queens on its side of the board. Every win adds more; the run ends with your first loss.",
  how_to_win: "Keep beating Martin as the extra queens pile up. The video run ended around 19 queens.",
  player_side: "white",
  player: { name: 'You', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },   /* iwantcheckmate's own avatar (purple king) from the videos */
  opponent: { name: "Martin", rating: 250, avatar: "assets/modes/XuvZCCFk42k/martin.png", tagline: "chess.com beginner bot" },
  board: { files: 8, ranks: 8 },
  theme: { light: "#eadeae", dark: "#ba8a66" },
  setup: { fen: "rnbqkbnr/pppppppp/7q/8/8/8/PPPPPPPP/RNBQKBNR" },
  params: {
    levels: [
      { label: "+1 Queen", fen: "rnbqkbnr/pppppppp/7q/8/8/8/PPPPPPPP/RNBQKBNR" },
      { label: "+2 Queens", fen: "rnbqkbnr/pppppppp/q6q/8/8/8/PPPPPPPP/RNBQKBNR" },
      { label: "+3 Queens", fen: "rnbqkbnr/pppppppp/q5qq/8/8/8/PPPPPPPP/RNBQKBNR" },
      { label: "+4 Queens", fen: "rnbqkbnr/pppppppp/qq4qq/8/8/8/PPPPPPPP/RNBQKBNR" },
      { label: "+5 Queens", fen: "rnbqkbnr/pppppppp/qq3qqq/8/8/8/PPPPPPPP/RNBQKBNR" },
      { label: "+6 Queens", fen: "rnbqkbnr/pppppppp/qqq2qqq/8/8/8/PPPPPPPP/RNBQKBNR" },
      { label: "+7 Queens", fen: "rnbqkbnr/pppppppp/qqq1qqqq/8/8/8/PPPPPPPP/RNBQKBNR" },
      { label: "+8 Queens", fen: "rnbqkbnr/pppppppp/qqqqqqqq/8/8/8/PPPPPPPP/RNBQKBNR" },
      { label: "+9 Queens", fen: "rnbqkbnr/pppppppp/qqqqqqqq/7q/8/8/PPPPPPPP/RNBQKBNR" },
      { label: "+10 Queens", fen: "rnbqkbnr/pppppppp/qqqqqqqq/q6q/8/8/PPPPPPPP/RNBQKBNR" },
      { label: "+11 Queens", fen: "rnbqkbnr/pppppppp/qqqqqqqq/q5qq/8/8/PPPPPPPP/RNBQKBNR" },
      { label: "+12 Queens", fen: "rnbqkbnr/pppppppp/qqqqqqqq/qq4qq/8/8/PPPPPPPP/RNBQKBNR" },
      { label: "+13 Queens", fen: "rnbqkbnr/pppppppp/qqqqqqqq/qq3qqq/8/8/PPPPPPPP/RNBQKBNR" },
      { label: "+14 Queens", fen: "rnbqkbnr/pppppppp/qqqqqqqq/qqq2qqq/8/8/PPPPPPPP/RNBQKBNR" },
      { label: "+15 Queens", fen: "rnbqkbnr/pppppppp/qqqqqqqq/qqq1qqqq/8/8/PPPPPPPP/RNBQKBNR" },
      { label: "+16 Queens", fen: "rnbqkbnr/pppppppp/qqqqqqqq/qqqqqqqq/8/8/PPPPPPPP/RNBQKBNR" },
      { label: "+17 Queens", fen: "rnbqkbnr/pppppppp/qqqqqqqq/qqqqqqqq/7q/8/PPPPPPPP/RNBQKBNR" },
      { label: "+18 Queens", fen: "rnbqkbnr/pppppppp/qqqqqqqq/qqqqqqqq/q6q/8/PPPPPPPP/RNBQKBNR" },
      { label: "+19 Queens", fen: "rnbqkbnr/pppppppp/qqqqqqqq/qqqqqqqq/q5qq/8/PPPPPPPP/RNBQKBNR" },
      { label: "+20 Queens", fen: "rnbqkbnr/pppppppp/qqqqqqqq/qqqqqqqq/qq4qq/8/PPPPPPPP/RNBQKBNR" },
      { label: "+21 Queens", fen: "rnbqkbnr/pppppppp/qqqqqqqq/qqqqqqqq/qq3qqq/8/PPPPPPPP/RNBQKBNR" },
      { label: "+22 Queens", fen: "rnbqkbnr/pppppppp/qqqqqqqq/qqqqqqqq/qqq2qqq/8/PPPPPPPP/RNBQKBNR" },
      { label: "+23 Queens", fen: "rnbqkbnr/pppppppp/qqqqqqqq/qqqqqqqq/qqq1qqqq/8/PPPPPPPP/RNBQKBNR" },
      { label: "+24 Queens", fen: "rnbqkbnr/pppppppp/qqqqqqqq/qqqqqqqq/qqqqqqqq/8/PPPPPPPP/RNBQKBNR" }
    ],
    advance: "win",
    unit: "Queens"
  },
  hooks: "g3_ladder",
  source: {
    confidence: "medium",
    notes: "Extra pieces fill rank 6, then 5, 4, 3 (h6 first). Step sizes for knights/bishops/rooks inferred.",
    research: "research/modes/Iy-Vr5-3VpY.json"
  }
});
