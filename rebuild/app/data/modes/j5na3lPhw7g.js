/* How Many Fish to BEAT Stockfish: king + N fish (king+knight) vs queenless Fairy-Stockfish. Sources: research/modes/j5na3lPhw7g.json. Fish art copied from the video. */
CM.mode({
  id: "j5na3lPhw7g",
  title: "How Many Fish to BEAT Stockfish?",
  name: "How many Fish?",
  category: "Challenges & Odds",
  description: "A Fish moves like a king or a knight. You get a king and Fish; Stockfish has its full army minus the queen. One more Fish after every loss.",
  how_to_win: "Checkmate Stockfish. The video won with 6 Fish.",
  player_side: "white",
  player: { name: 'You', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },   /* iwantcheckmate's own avatar (purple king) from the videos */
  opponent: {
    name: "Fairy-Stockfish",
    rating: 3000,
    avatar: "assets/modes/j5na3lPhw7g/fish.png",
    tagline: "playing without its queen"
  },
  board: { files: 8, ranks: 8 },
  theme: { light: "#dde4e8", dark: "#89a4af" },
  pieces: {
    F: {
      name: "Fish",
      moves: "KN",
      value: 600,
      img: { w: "assets/modes/j5na3lPhw7g/fish_w.png", b: "assets/modes/j5na3lPhw7g/fish_w.png" },
      glyph: null,
      badge: null
    }
  },
  setup: { fen: "rnb1kbnr/pppppppp/8/8/8/8/8/3FK3" },
  bot: { engine: "search", style: "best", depth: 4, time_ms: 900 },
  params: {
    levels: [
      { label: "1 Fish", fen: "rnb1kbnr/pppppppp/8/8/8/8/8/3FK3" },
      { label: "2 Fish", fen: "rnb1kbnr/pppppppp/8/8/8/8/8/3FKF2" },
      { label: "3 Fish", fen: "rnb1kbnr/pppppppp/8/8/8/8/8/2FFKF2" },
      { label: "4 Fish", fen: "rnb1kbnr/pppppppp/8/8/8/8/8/2FFKFF1" },
      { label: "5 Fish", fen: "rnb1kbnr/pppppppp/8/8/8/8/8/1FFFKFF1" },
      { label: "6 Fish", fen: "rnb1kbnr/pppppppp/8/8/8/8/8/1FFFKFFF" },
      { label: "7 Fish", fen: "rnb1kbnr/pppppppp/8/8/8/8/8/FFFFKFFF" },
      { label: "8 Fish", fen: "rnb1kbnr/pppppppp/8/8/8/8/4F3/FFFFKFFF" }
    ],
    advance: "fail",
    unit: "Fish"
  },
  hooks: "g3_ladder",
  source: { confidence: "high", research: "research/modes/j5na3lPhw7g.json" }
});
