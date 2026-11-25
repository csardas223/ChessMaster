/* Martin: king + N queens vs a full army, one more after each loss. Sources: research/modes/oHVIMc067J4.json, frames. */
CM.mode({
  id: "oHVIMc067J4",
  title: "How Many Queens to BEAT Martin?",
  name: "How many Queens?",
  category: "Challenges & Odds",
  description: "How Many Queens to BEAT Martin? King + one queen against Martin's full army. A loss or a draw adds a queen.",
  how_to_win: "Checkmate Martin (draws count as a failed attempt). The video did it with 1 queen.",
  player_side: "white",
  player: { name: 'You', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },   /* iwantcheckmate's own avatar (purple king) from the videos */
  opponent: { name: "Martin", rating: 250, avatar: "assets/modes/XuvZCCFk42k/martin.png", tagline: "chess.com beginner bot" },
  board: { files: 8, ranks: 8 },
  theme: { light: "#ecd9b4", dark: "#b28567" },
  setup: { fen: "rnbqkbnr/pppppppp/8/8/8/8/8/3QK3" },
  params: {
    levels: [
      { label: "1 Queen", fen: "rnbqkbnr/pppppppp/8/8/8/8/8/3QK3" },
      { label: "2 Queens", fen: "rnbqkbnr/pppppppp/8/8/8/8/8/3QKQ2" },
      { label: "3 Queens", fen: "rnbqkbnr/pppppppp/8/8/8/8/8/2QQKQ2" },
      { label: "4 Queens", fen: "rnbqkbnr/pppppppp/8/8/8/8/8/2QQKQQ1" }
    ],
    advance: "fail",
    unit: "Queens"
  },
  hooks: "g3_ladder",
  source: { confidence: "high", research: "research/modes/oHVIMc067J4.json" }
});
