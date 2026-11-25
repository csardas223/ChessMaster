/* Martin: king + N bishops vs a full army, one more after each loss. Sources: research/modes/admcKjJDGDg.json, frames. */
CM.mode({
  id: "admcKjJDGDg",
  title: "How Many Bishops to BEAT Martin?",
  name: "How many Bishops?",
  category: "Challenges & Odds",
  description: "How Many Bishops to BEAT Martin? King + bishops (starting with two) against Martin's full army; one more bishop after every loss.",
  how_to_win: "Checkmate Martin. The video needed 3 bishops.",
  player_side: "white",
  opponent: { name: "Martin", rating: 250, avatar: "assets/modes/XuvZCCFk42k/martin.png", tagline: "chess.com beginner bot" },
  board: { files: 8, ranks: 8 },
  theme: { light: "#ecd9b4", dark: "#b28567" },
  setup: { fen: "rnbqkbnr/pppppppp/8/8/8/8/8/2B1KB2" },
  params: {
    levels: [
      { label: "2 Bishops", fen: "rnbqkbnr/pppppppp/8/8/8/8/8/2B1KB2" },
      { label: "3 Bishops", fen: "rnbqkbnr/pppppppp/8/8/8/8/8/2B1KBB1" },
      { label: "4 Bishops", fen: "rnbqkbnr/pppppppp/8/8/8/8/8/2BBKBB1" },
      { label: "5 Bishops", fen: "rnbqkbnr/pppppppp/8/8/8/8/8/B1BBKBB1" },
      { label: "6 Bishops", fen: "rnbqkbnr/pppppppp/8/8/8/8/8/BBBBKBB1" }
    ],
    advance: "fail",
    unit: "Bishops"
  },
  hooks: "g3_ladder",
  source: { confidence: "high", research: "research/modes/admcKjJDGDg.json" }
});
