/* How Many Pawns to BEAT Martin (h-pawn retries): K + Ph2 vs Martin, attempt counter. Sources: research/modes/F5y72_MVsMA.json. */
CM.mode({
  id: "F5y72_MVsMA",
  title: "How Many Pawns to BEAT Martin?",
  name: "King + h-Pawn",
  category: "Challenges & Odds",
  description: "A king and a single h-pawn against Martin's full army. Same setup every game until you win.",
  how_to_win: "Checkmate Martin (you will need to promote).",
  player_side: "white",
  player: { name: 'You', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },   /* iwantcheckmate's own avatar (purple king) from the videos */
  opponent: { name: "Martin", rating: 250, avatar: "assets/modes/XuvZCCFk42k/martin.png", tagline: "chess.com beginner bot" },
  board: { files: 8, ranks: 8 },
  theme: { light: "#ecd9b4", dark: "#b38567" },
  setup: { fen: "rnbqkbnr/pppppppp/8/8/8/8/7P/4K3" },
  params: {
    levels: [{ label: "King + h-pawn", fen: "rnbqkbnr/pppppppp/8/8/8/8/7P/4K3" }],
    advance: "none",
    unit: "Pawn",
    statusPrefix: ""
  },
  hooks: "g3_ladder",
  source: { confidence: "high", research: "research/modes/F5y72_MVsMA.json" }
});
