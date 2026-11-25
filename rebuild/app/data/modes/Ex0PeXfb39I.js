/* How Many Dragons to BEAT Stockfish: king + N dragons (bishop+knight) vs Fairy-Stockfish. Sources: research/modes/Ex0PeXfb39I.json. */
CM.mode({
  id: "Ex0PeXfb39I",
  title: "How Many Dragons to BEAT Stockfish?",
  name: "How many Dragons?",
  category: "Challenges & Odds",
  description: "Your army is a king and Dragons (a Dragon moves like a bishop or a knight); Fairy-Stockfish keeps the full army. One more Dragon after every loss.",
  how_to_win: "Checkmate Fairy-Stockfish.",
  player_side: "white",
  opponent: { name: "Fairy-Stockfish", rating: 3000, avatar: "assets/modes/Ex0PeXfb39I/fish.png", tagline: "lichess level 8" },
  board: { files: 8, ranks: 8 },
  theme: { light: "#fdfedd", dark: "#89ae68" },
  pieces: { D: { name: "Dragon", moves: "BN", value: 800, img: { w: "assets/modes/cR6r8NZz-CA/dragon_w.png", b: "assets/modes/cR6r8NZz-CA/dragon_b.png" } /* video sprite */ } },
  setup: { fen: "rnbqkbnr/pppppppp/8/8/8/8/8/3DK3" },
  rules: { promotion: { choices: ["Q", "D", "R", "B", "N"] } },
  bot: { engine: "search", style: "best", depth: 4, time_ms: 900 },
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
  source: { confidence: "medium", research: "research/modes/Ex0PeXfb39I.json" }
});
