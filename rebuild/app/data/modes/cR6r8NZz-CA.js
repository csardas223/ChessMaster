/* How Many Dragons to BEAT a Grandmaster: king + N dragons vs GM Arthur Neiksans (search at 2500). Sources: research/modes/cR6r8NZz-CA.json. */
CM.mode({
  id: "cR6r8NZz-CA",
  title: "How Many Dragons to BEAT a Grandmaster?",
  name: "How many Dragons?",
  category: "Challenges & Odds",
  description: "Your army is a king and Dragons (a Dragon moves like a bishop or a knight); GM Arthur Neiksans keeps the full army. One more Dragon after every loss.",
  how_to_win: "Checkmate the grandmaster. The video won with 6 Dragons.",
  player_side: "white",
  opponent: { name: "Arturchix", rating: 2500, avatar: "assets/modes/cR6r8NZz-CA/arturchix.png", tagline: "GM Arthur Neiksans" },
  board: { files: 8, ranks: 8 },
  theme: { light: "#eddab7", dark: "#af8767" },
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
  source: { confidence: "high", research: "research/modes/cR6r8NZz-CA.json" }
});
