/* Magnus: king + N queens vs a full army, one more after each loss. Sources: research/modes/S1TqgKwVgus.json, frames. */
CM.mode({
  id: "S1TqgKwVgus",
  title: "How Many Queens to BEAT Magnus?",
  name: "How many Queens?",
  category: "Challenges & Odds",
  description: "How Many Queens to BEAT Magnus? King + queens against Magnus's full army; one more queen after every loss.",
  how_to_win: "Checkmate Magnus. The video needed 5 queens.",
  player_side: "white",
  player: { name: 'You', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },   /* iwantcheckmate's own avatar (purple king) from the videos */
  opponent: { name: "Magnus", rating: 2882, avatar: "assets/modes/t61xLLQbotM/magnus.png", tagline: "chess.com Magnus Carlsen bot" },
  board: { files: 8, ranks: 8 },
  theme: { light: "#ecd9b3", dark: "#b28567" },
  setup: { fen: "rnbqkbnr/pppppppp/8/8/8/8/8/3QK3" },
  params: {
    levels: [
      { label: "1 Queen", fen: "rnbqkbnr/pppppppp/8/8/8/8/8/3QK3" },
      { label: "2 Queens", fen: "rnbqkbnr/pppppppp/8/8/8/8/8/3QKQ2" },
      { label: "3 Queens", fen: "rnbqkbnr/pppppppp/8/8/8/8/8/2QQKQ2" },
      { label: "4 Queens", fen: "rnbqkbnr/pppppppp/8/8/8/8/8/2QQKQQ1" },
      { label: "5 Queens", fen: "rnbqkbnr/pppppppp/8/8/8/8/8/1QQQKQQ1" },
      { label: "6 Queens", fen: "rnbqkbnr/pppppppp/8/8/8/8/8/1QQQKQQQ" },
      { label: "7 Queens", fen: "rnbqkbnr/pppppppp/8/8/8/8/8/QQQQKQQQ" },
      { label: "8 Queens", fen: "rnbqkbnr/pppppppp/8/8/8/8/4Q3/QQQQKQQQ" }
    ],
    advance: "fail",
    unit: "Queens"
  },
  hooks: "g3_ladder",
  source: { confidence: "high", research: "research/modes/S1TqgKwVgus.json" }
});
