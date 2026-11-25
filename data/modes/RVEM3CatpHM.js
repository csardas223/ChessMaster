/* Giving Martin extra knights until I lose: standard armies + N extra black knights (+ after each win). Sources: research/modes/RVEM3CatpHM.json. */
CM.mode({
  id: "RVEM3CatpHM",
  title: "Giving Martin 1 Extra Knight Until I LOSE",
  name: "Extra Knights",
  category: "Challenges & Odds",
  description: "Both sides have full armies, but Martin also gets extra knights on its side of the board. Every win adds more; the run ends with your first loss.",
  how_to_win: "Keep beating Martin as the extra knights pile up. The video reached about 31 knights.",
  player_side: "white",
  player: { name: 'You', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },   /* iwantcheckmate's own avatar (purple king) from the videos */
  opponent: { name: "Martin", rating: 250, avatar: "assets/modes/XuvZCCFk42k/martin.png", tagline: "chess.com beginner bot" },
  board: { files: 8, ranks: 8 },
  theme: { light: "#ebd9b0", dark: "#af8666" },
  setup: { fen: "rnbqkbnr/pppppppp/7n/8/8/8/PPPPPPPP/RNBQKBNR" },
  params: {
    levels: [
      { label: "+1 Knight", fen: "rnbqkbnr/pppppppp/7n/8/8/8/PPPPPPPP/RNBQKBNR" },
      { label: "+4 Knights", fen: "rnbqkbnr/pppppppp/nn4nn/8/8/8/PPPPPPPP/RNBQKBNR" },
      { label: "+8 Knights", fen: "rnbqkbnr/pppppppp/nnnnnnnn/8/8/8/PPPPPPPP/RNBQKBNR" },
      { label: "+12 Knights", fen: "rnbqkbnr/pppppppp/nnnnnnnn/nn4nn/8/8/PPPPPPPP/RNBQKBNR" },
      { label: "+16 Knights", fen: "rnbqkbnr/pppppppp/nnnnnnnn/nnnnnnnn/8/8/PPPPPPPP/RNBQKBNR" },
      { label: "+20 Knights", fen: "rnbqkbnr/pppppppp/nnnnnnnn/nnnnnnnn/nn4nn/8/PPPPPPPP/RNBQKBNR" },
      { label: "+24 Knights", fen: "rnbqkbnr/pppppppp/nnnnnnnn/nnnnnnnn/nnnnnnnn/8/PPPPPPPP/RNBQKBNR" },
      { label: "+28 Knights", fen: "rnbqkbnr/pppppppp/nnnnnnnn/nnnnnnnn/nnnnnnnn/nn4nn/PPPPPPPP/RNBQKBNR" },
      { label: "+32 Knights", fen: "rnbqkbnr/pppppppp/nnnnnnnn/nnnnnnnn/nnnnnnnn/nnnnnnnn/PPPPPPPP/RNBQKBNR" }
    ],
    advance: "win",
    unit: "Knights"
  },
  hooks: "g3_ladder",
  source: {
    confidence: "medium",
    notes: "Extra pieces fill rank 6, then 5, 4, 3 (h6 first). Step sizes for knights/bishops/rooks inferred.",
    research: "research/modes/RVEM3CatpHM.json"
  }
});
