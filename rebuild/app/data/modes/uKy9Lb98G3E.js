/* How Many Bishops to BEAT Magnus: king + 13 bishops (39 points) vs a full army, +2 per loss. Sources: research/modes/uKy9Lb98G3E.json. */
CM.mode({
  id: "uKy9Lb98G3E",
  title: "How Many Bishops to BEAT Magnus?",
  name: "13 Bishops",
  category: "Challenges & Odds",
  description: "How Many Bishops to BEAT Magnus? Your army is a king and 13 bishops (39 points, the value of a normal army) on both square colours; Magnus keeps the standard army. Two more bishops after a loss.",
  how_to_win: "Checkmate Magnus. Keep bishops on both colours: same-coloured bishops cannot mate.",
  player_side: "white",
  opponent: { name: "Magnus", rating: 2850, avatar: "assets/avatars/bot.svg", tagline: "chess.com Magnus Carlsen bot" },
  board: { files: 8, ranks: 8 },
  theme: { light: "#ebd9b0", dark: "#b48566" },
  setup: { fen: "rnbqkbnr/pppppppp/8/8/8/8/1BBBBB1B/BBBBKBBB" },
  params: {
    levels: [
      { label: "13 Bishops", fen: "rnbqkbnr/pppppppp/8/8/8/8/1BBBBB1B/BBBBKBBB" },
      { label: "15 Bishops", fen: "rnbqkbnr/pppppppp/8/8/8/4B3/1BBBBBBB/BBBBKBBB" },
      { label: "17 Bishops", fen: "rnbqkbnr/pppppppp/8/8/8/2B1B3/BBBBBBBB/BBBBKBBB" },
      { label: "19 Bishops", fen: "rnbqkbnr/pppppppp/8/8/8/2BBB1B1/BBBBBBBB/BBBBKBBB" }
    ],
    advance: "fail",
    unit: "Bishops"
  },
  hooks: "g3_ladder",
  source: {
    confidence: "medium",
    notes: "Bishop squares inferred (ranks 1-2, alternating colours).",
    research: "research/modes/uKy9Lb98G3E.json"
  }
});
