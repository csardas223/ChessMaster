/* How Many Dragons to BEAT a Chess YouTuber (jacksark): king + N dragons (bishop+knight) vs a full army. Sources: research/modes/eJsNNi7rBro.json, frames. */
CM.mode({
  id: "eJsNNi7rBro",
  title: "How Many Dragons to BEAT a Chess YouTuber? (feat. jacksark)",
  name: "How many Dragons?",
  category: "Challenges & Odds",
  description: "Your army is a king and Dragons (a Dragon moves like a bishop or a knight); jacksark keeps the full army. One more Dragon after every loss.",
  how_to_win: "Checkmate jacksark with as few Dragons as possible.",
  player_side: "white",
  opponent: { name: "jacksark", rating: 2000, avatar: "assets/modes/eJsNNi7rBro/jacksark.png", tagline: "Chess YouTuber Jack Sarkisian (rating inferred)" },
  board: { files: 8, ranks: 8 },
  theme: { light: "#ecdab7", dark: "#ae8766" },
  pieces: { D: { name: "Dragon", moves: "BN", value: 800, img: { w: "assets/modes/cR6r8NZz-CA/dragon_w.png", b: "assets/modes/cR6r8NZz-CA/dragon_b.png" } /* video sprite */ } },
  setup: { fen: "rnbqkbnr/pppppppp/8/8/8/8/8/3DK3" },
  rules: { promotion: { choices: ["Q", "D", "R", "B", "N"] } },
  bot: { engine: "search", style: "elo", depth: 4, time_ms: 900 },
  clock: { w: 300, b: 300, inc: 0, bot: false },
  params: {
    levels: [
      { label: "1 Dragon", fen: "rnbqkbnr/pppppppp/8/8/8/8/8/3DK3" },
      { label: "2 Dragons", fen: "rnbqkbnr/pppppppp/8/8/8/8/8/3DKD2" },
      { label: "3 Dragons", fen: "rnbqkbnr/pppppppp/8/8/8/8/8/2DDKD2" },
      { label: "4 Dragons", fen: "rnbqkbnr/pppppppp/8/8/8/8/8/2DDKDD1" },
      { label: "5 Dragons", fen: "rnbqkbnr/pppppppp/8/8/8/8/8/1DDDKDD1" },
      { label: "6 Dragons", fen: "rnbqkbnr/pppppppp/8/8/8/8/8/1DDDKDDD" },
      { label: "7 Dragons", fen: "rnbqkbnr/pppppppp/8/8/8/8/8/DDDDKDDD" },
      { label: "8 Dragons", fen: "rnbqkbnr/pppppppp/8/8/8/8/4D3/DDDDKDDD" }
    ],
    advance: "fail",
    unit: "Dragons"
  },
  hooks: "g3_ladder",
  source: {
    confidence: "high",
    notes: "Human opponent played by the built-in search at the given rating. 5+0 clock (bot not timed).",
    research: "research/modes/eJsNNi7rBro.json"
  }
});
