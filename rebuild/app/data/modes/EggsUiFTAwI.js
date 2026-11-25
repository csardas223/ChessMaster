/* I Gave Zach 1 Queen Each Game Until I LOSE: standard + extra black queens. Sources: research/modes/EggsUiFTAwI.json. */
CM.mode({
  id: "EggsUiFTAwI",
  title: "I Gave Zach 1 Queen Each Game Until I LOSE",
  name: "Zach's Queens",
  category: "Challenges & Odds",
  description: "You have a normal army; Zach (rated 1) gets more queens after every game you win: 1, then 7, then whole ranks of queens.",
  how_to_win: "Keep beating Zach. The video won every game.",
  player_side: "white",
  player: { name: 'You', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },   /* iwantcheckmate's own avatar (purple king) from the videos */
  opponent: { name: "Zach", rating: 1, avatar: "assets/modes/EggsUiFTAwI/zach.png", tagline: "chess.com beginner bot" },
  board: { files: 8, ranks: 8 },
  theme: { light: "#ebeed0", dark: "#759f55" },
  setup: { fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR" },
  params: {
    levels: [
      { label: "1 Queen", fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR" },
      { label: "7 Queens", fen: "rnbqkbnr/pppppppp/qqq2qqq/8/8/8/PPPPPPPP/RNBQKBNR" },
      { label: "15 Queens", fen: "rnbqkbnr/pppppppp/qqqqqqqq/qqq2qqq/8/8/PPPPPPPP/RNBQKBNR" },
      { label: "23 Queens", fen: "rnbqkbnr/pppppppp/qqqqqqqq/qqqqqqqq/qqq2qqq/8/PPPPPPPP/RNBQKBNR" }
    ],
    advance: "win",
    unit: "Queens"
  },
  hooks: "g3_ladder",
  source: {
    confidence: "medium",
    notes: "Queen counts per game inferred (1, 7, then full extra ranks).",
    research: "research/modes/EggsUiFTAwI.json"
  }
});
