/* Giving Martin extra rooks until I lose: standard armies + N extra black rooks (+ after each win). Sources: research/modes/qUROR6pcKKw.json. */
CM.mode({
  id: "qUROR6pcKKw",
  title: "Giving Martin 1 Extra Rook Until I LOSE",
  name: "Extra Rooks",
  category: "Challenges & Odds",
  description: "Both sides have full armies, but Martin also gets extra rooks on its side of the board. Every win adds more; the run ends with your first loss.",
  how_to_win: "Keep beating Martin as the extra rooks pile up. The video reached about 27 rooks.",
  player_side: "white",
  player: { name: 'You', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },   /* iwantcheckmate's own avatar (purple king) from the videos */
  opponent: { name: "Martin", rating: 250, avatar: "assets/modes/XuvZCCFk42k/martin.png", tagline: "chess.com beginner bot" },
  board: { files: 8, ranks: 8 },
  theme: { light: "#ebd9b1", dark: "#b58667" },
  vfx_timeline: [{ trigger: "game_start", once: true, effect: { type: "overlay", image: "assets/modes/qUROR6pcKKw/promotion_picker.png", at: "board", fit: "contain", opacity: 1, duration_ms: 1800, fade_ms: 300 } }],  /* the video's own art, shown as its intro */
  setup: { fen: "rnbqkbnr/pppppppp/7r/8/8/8/PPPPPPPP/RNBQKBNR" },
  params: {
    levels: [
      { label: "+1 Rook", fen: "rnbqkbnr/pppppppp/7r/8/8/8/PPPPPPPP/RNBQKBNR" },
      { label: "+4 Rooks", fen: "rnbqkbnr/pppppppp/rr4rr/8/8/8/PPPPPPPP/RNBQKBNR" },
      { label: "+8 Rooks", fen: "rnbqkbnr/pppppppp/rrrrrrrr/8/8/8/PPPPPPPP/RNBQKBNR" },
      { label: "+12 Rooks", fen: "rnbqkbnr/pppppppp/rrrrrrrr/rr4rr/8/8/PPPPPPPP/RNBQKBNR" },
      { label: "+16 Rooks", fen: "rnbqkbnr/pppppppp/rrrrrrrr/rrrrrrrr/8/8/PPPPPPPP/RNBQKBNR" },
      { label: "+20 Rooks", fen: "rnbqkbnr/pppppppp/rrrrrrrr/rrrrrrrr/rr4rr/8/PPPPPPPP/RNBQKBNR" },
      { label: "+24 Rooks", fen: "rnbqkbnr/pppppppp/rrrrrrrr/rrrrrrrr/rrrrrrrr/8/PPPPPPPP/RNBQKBNR" },
      { label: "+28 Rooks", fen: "rnbqkbnr/pppppppp/rrrrrrrr/rrrrrrrr/rrrrrrrr/rr4rr/PPPPPPPP/RNBQKBNR" },
      { label: "+32 Rooks", fen: "rnbqkbnr/pppppppp/rrrrrrrr/rrrrrrrr/rrrrrrrr/rrrrrrrr/PPPPPPPP/RNBQKBNR" }
    ],
    advance: "win",
    unit: "Rooks"
  },
  hooks: "g3_ladder",
  source: {
    confidence: "medium",
    notes: "Extra pieces fill rank 6, then 5, 4, 3 (h6 first). Step sizes for knights/bishops/rooks inferred.",
    research: "research/modes/qUROR6pcKKw.json"
  }
});
