/* How Many Bishops to BEAT GothamChess: king + 13 bishops (39 points) vs a full army, +2 per loss. Sources: research/modes/7XDtMA4WPSU.json. */
CM.mode({
  id: "7XDtMA4WPSU",
  title: "How Many Bishops to BEAT GothamChess?",
  name: "13 Bishops",
  category: "Challenges & Odds",
  description: "How Many Bishops to BEAT GothamChess? Your army is a king and 13 bishops (39 points, the value of a normal army) on both square colours; GothamChess keeps the standard army. Two more bishops after a loss.",
  how_to_win: "Checkmate GothamChess. Keep bishops on both colours: same-coloured bishops cannot mate.",
  player_side: "white",
  player: { name: 'You', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },   /* iwantcheckmate's own avatar (purple king) from the videos */
  opponent: { name: "GothamChess", rating: 2500, avatar: "assets/modes/7XDtMA4WPSU/gotham.png", tagline: "chess.com Levy Rozman bot" },
  board: { files: 8, ranks: 8 },
  theme: { light: "#eeeed2", dark: "#769656" },
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
    research: "research/modes/7XDtMA4WPSU.json"
  }
});
