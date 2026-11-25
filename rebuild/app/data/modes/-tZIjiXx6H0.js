/* Magnus: king + N bishops vs a full army, one more after each loss. Sources: research/modes/-tZIjiXx6H0.json, frames. Extra bishops alternate square colours along ranks 1-2 (spec). */
CM.mode({
  id: "-tZIjiXx6H0",
  title: "How Many Bishops To BEAT Magnus?",
  name: "How many Bishops?",
  category: "Challenges & Odds",
  description: "How Many Bishops To BEAT Magnus? You get a king and bishops, Magnus keeps his whole army. One more bishop after every loss.",
  how_to_win: "Checkmate Magnus. In the video it took 14 bishops.",
  player_side: "white",
  opponent: { name: "Magnus", rating: 2882, avatar: "assets/avatars/bot.svg", tagline: "chess.com Magnus Carlsen bot" },
  board: { files: 8, ranks: 8 },
  theme: { light: "#ebd9b4", dark: "#b38668" },
  setup: { fen: "rnbqkbnr/pppppppp/8/8/8/8/8/2B1KB2" },
  params: {
    levels: [
      { label: "2 Bishops", fen: "rnbqkbnr/pppppppp/8/8/8/8/8/2B1KB2" },
      { label: "3 Bishops", fen: "rnbqkbnr/pppppppp/8/8/8/8/8/2B1KBB1" },
      { label: "4 Bishops", fen: "rnbqkbnr/pppppppp/8/8/8/8/8/2BBKBB1" },
      { label: "5 Bishops", fen: "rnbqkbnr/pppppppp/8/8/8/8/8/B1BBKBB1" },
      { label: "6 Bishops", fen: "rnbqkbnr/pppppppp/8/8/8/8/8/BBBBKBB1" },
      { label: "7 Bishops", fen: "rnbqkbnr/pppppppp/8/8/8/8/3B4/BBBBKBB1" },
      { label: "8 Bishops", fen: "rnbqkbnr/pppppppp/8/8/8/8/3B4/BBBBKBBB" },
      { label: "9 Bishops", fen: "rnbqkbnr/pppppppp/8/8/8/8/3B1B2/BBBBKBBB" },
      { label: "10 Bishops", fen: "rnbqkbnr/pppppppp/8/8/8/8/3BBB2/BBBBKBBB" },
      { label: "11 Bishops", fen: "rnbqkbnr/pppppppp/8/8/8/8/1B1BBB2/BBBBKBBB" },
      { label: "12 Bishops", fen: "rnbqkbnr/pppppppp/8/8/8/8/1BBBBB2/BBBBKBBB" },
      { label: "13 Bishops", fen: "rnbqkbnr/pppppppp/8/8/8/8/1BBBBB1B/BBBBKBBB" },
      { label: "14 Bishops", fen: "rnbqkbnr/pppppppp/8/8/8/8/1BBBBBBB/BBBBKBBB" },
      { label: "15 Bishops", fen: "rnbqkbnr/pppppppp/8/8/8/4B3/1BBBBBBB/BBBBKBBB" },
      { label: "16 Bishops", fen: "rnbqkbnr/pppppppp/8/8/8/4B3/BBBBBBBB/BBBBKBBB" }
    ],
    advance: "fail",
    unit: "Bishops"
  },
  hooks: "g3_ladder",
  source: {
    confidence: "high",
    notes: "Extra bishops alternate square colours along ranks 1-2 (spec).",
    research: "research/modes/-tZIjiXx6H0.json"
  }
});
