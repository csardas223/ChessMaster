/* How Many Dragons to BEAT My Chess Bot: king + 1..15 dragons vs Tony (Fairy-Stockfish 2100). Sources: research/modes/CSjh4NrnxLE.json (official site order). */
CM.mode({
  id: "CSjh4NrnxLE",
  title: "How Many Dragons to BEAT My Chess Bot?",
  name: "How many Dragons?",
  category: "Challenges & Odds",
  description: "Your army is a king and Dragons (a Dragon moves like a bishop or a knight); Tony keeps the full army. One more Dragon after every loss. A draw also adds a Dragon; at 15 you have run out of Dragons.",
  how_to_win: "Checkmate Tony with as few Dragons as possible. The video won with 6.",
  player_side: "white",
  player: { name: 'You', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },   /* iwantcheckmate's own avatar (purple king) from the videos */
  opponent: {
    name: "Tony",
    rating: 2100,
    avatar: "assets/modes/CSjh4NrnxLE/tony.png",
    tagline: "Fairy-Stockfish limited to 2100 on the challenge site"
  },
  board: { files: 8, ranks: 8 },
  theme: { light: "#f1f4dd", dark: "#619044" },
  pieces: { D: { name: "Dragon", moves: "BN", value: 800, img: { w: "assets/modes/CSjh4NrnxLE/dragon_w.png", b: "assets/modes/CSjh4NrnxLE/dragon_b.png" } /* video sprite */ } },
  setup: { fen: "rnbqkbnr/pppppppp/8/8/8/8/8/3DK3" },
  rules: { promotion: { choices: ["Q", "D", "R", "B", "N"] } },
  bot: { engine: "search", style: "elo", depth: 4, time_ms: 900 },
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
      { label: "10 Dragons", fen: "rnbqkbnr/pppppppp/8/8/8/8/3DDD2/DDDDKDDD" },
      { label: "11 Dragons", fen: "rnbqkbnr/pppppppp/8/8/8/8/2DDDD2/DDDDKDDD" },
      { label: "12 Dragons", fen: "rnbqkbnr/pppppppp/8/8/8/8/2DDDDD1/DDDDKDDD" },
      { label: "13 Dragons", fen: "rnbqkbnr/pppppppp/8/8/8/8/1DDDDDD1/DDDDKDDD" },
      { label: "14 Dragons", fen: "rnbqkbnr/pppppppp/8/8/8/8/1DDDDDDD/DDDDKDDD" },
      { label: "15 Dragons", fen: "rnbqkbnr/pppppppp/8/8/8/8/DDDDDDDD/DDDDKDDD" }
    ],
    advance: "fail",
    unit: "Dragons",
    maxText: "You ran out of Dragons!"
  },
  hooks: "g3_ladder",
  source: {
    confidence: "high",
    notes: "Dragon order from the official site: d1, f1, c1, g1, b1, h1, a1, e2, d2, ...",
    research: "research/modes/CSjh4NrnxLE.json"
  }
});
