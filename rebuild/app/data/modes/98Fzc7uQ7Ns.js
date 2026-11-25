/* Can My Viewers BEAT Me with Odds: you (White) give random odds to an ~800 viewer. Sources: research/modes/98Fzc7uQ7Ns.json. */
CM.mode({
  id: "98Fzc7uQ7Ns",
  title: "Can My Viewers BEAT Me with Odds? [VOD 1]",
  name: "Viewers vs Odds",
  category: "Challenges & Odds",
  description: "You play the streamer: each game a viewer picks which of your pieces you give away (minor pieces, queen, rooks or nothing). 3-minute games.",
  how_to_win: "Win the odds game.",
  player_side: "white",
  opponent: { name: "Viewer", rating: 800, avatar: null, tagline: "a chat challenger (rated ~200-1450)" },
  board: { files: 8, ranks: 8 },
  theme: { light: "#e8d1ab", dark: "#aa785b" },
  setup: { fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/R2QK2R" },
  clock: { w: 180, b: 180, inc: 0, bot: false },
  params: {
    levels: [
      { label: "No minor pieces", fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/R2QK2R" },
      { label: "No queen", fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNB1KBNR" },
      { label: "No rooks", fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/1NBQKBN1" },
      { label: "No odds", fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR" }
    ],
    advance: "none",
    unit: "Odds",
    random: true,
    pickerLabel: "Odds",
    statusPrefix: "Odds: "
  },
  hooks: "g3_ladder",
  source: {
    confidence: "medium",
    notes: "Handicap picked at random each new game (picker shows it).",
    research: "research/modes/98Fzc7uQ7Ns.json"
  }
});
