/* How Many Dragons to BEAT Stockfish (lichess): king + N dragons vs Fairy-Stockfish, 10 min. Sources: research/modes/o8XcmMCIhIk.json. Low confidence on White's exact army. */
CM.mode({
  id: "o8XcmMCIhIk",
  title: "How Many Dragons to BEAT Stockfish?",
  name: "How many Dragons?",
  category: "Challenges & Odds",
  description: "Your army is a king and Dragons (a Dragon moves like a bishop or a knight); Fairy-Stockfish keeps the full army. One more Dragon after every loss.",
  how_to_win: "Checkmate Fairy-Stockfish with as few Dragons as possible.",
  player_side: "white",
  opponent: { name: "Fairy-Stockfish", rating: 3000, avatar: "assets/avatars/stockfish.svg", tagline: "lichess level 8" },
  board: { files: 8, ranks: 8 },
  theme: { light: "#fefedc", dark: "#89ae67" },
  pieces: { D: { name: "Dragon", moves: "BN", value: 800 } },
  setup: { fen: "rnbqkbnr/pppppppp/8/8/8/8/8/3DK3" },
  rules: { promotion: { choices: ["Q", "D", "R", "B", "N"] } },
  bot: { engine: "search", style: "best", depth: 4, time_ms: 900 },
  clock: { w: 600, b: 600, inc: 0, bot: false },
  params: {
    levels: [
      { label: "1 Dragon", fen: "rnbqkbnr/pppppppp/8/8/8/8/8/3DK3" },
      { label: "2 Dragons", fen: "rnbqkbnr/pppppppp/8/8/8/8/8/3DKD2" },
      { label: "3 Dragons", fen: "rnbqkbnr/pppppppp/8/8/8/8/8/2DDKD2" },
      { label: "4 Dragons", fen: "rnbqkbnr/pppppppp/8/8/8/8/8/2DDKDD1" },
      { label: "5 Dragons", fen: "rnbqkbnr/pppppppp/8/8/8/8/8/1DDDKDD1" },
      { label: "6 Dragons", fen: "rnbqkbnr/pppppppp/8/8/8/8/8/1DDDKDDD" },
      { label: "7 Dragons", fen: "rnbqkbnr/pppppppp/8/8/8/8/8/DDDDKDDD" },
      { label: "8 Dragons", fen: "rnbqkbnr/pppppppp/8/8/8/8/4D3/DDDDKDDD" },
      { label: "9 Dragons", fen: "rnbqkbnr/pppppppp/8/8/8/8/3DD3/DDDDKDDD" },
      { label: "10 Dragons", fen: "rnbqkbnr/pppppppp/8/8/8/8/3DDD2/DDDDKDDD" }
    ],
    advance: "fail",
    unit: "Dragons"
  },
  hooks: "g3_ladder",
  source: {
    confidence: "low",
    notes: "Frames hint at a reduced army plus dragons; uses the series format king + N dragons.",
    research: "research/modes/o8XcmMCIhIk.json"
  }
});
