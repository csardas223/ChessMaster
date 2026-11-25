/* How Many Dragons to BEAT Stockfish (lichess): king + N dragons vs Fairy-Stockfish, 10 min. Sources: research/modes/o8XcmMCIhIk.json. Re-checked with the transcript (cm-recheck2): king + N dragons only, 1 to 6 dragons in the video (won with six). */
CM.mode({
  id: "o8XcmMCIhIk",
  title: "How Many Dragons to BEAT Stockfish?",
  name: "How many Dragons?",
  category: "Challenges & Odds",
  description: "Your army is a king and Dragons (a Dragon moves like a bishop or a knight); Fairy-Stockfish keeps the full army. One more Dragon after every loss.",
  how_to_win: "Checkmate Fairy-Stockfish with as few Dragons as possible.",
  player_side: "white",
  player: { name: 'You', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },   /* iwantcheckmate's own avatar (purple king) from the videos */
  opponent: { name: "Fairy-Stockfish", rating: 3000, avatar: "assets/modes/o8XcmMCIhIk/fish.png", tagline: "lichess level 8" },
  board: { files: 8, ranks: 8 },
  theme: { light: "#fefedc", dark: "#89ae67" },
  pieces: { D: { name: "Dragon", moves: "BN", value: 800, img: { w: "assets/modes/cR6r8NZz-CA/dragon_w.png", b: "assets/modes/cR6r8NZz-CA/dragon_b.png" } /* video sprite */ } },
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
    confidence: "high",
    notes: "cm-recheck2 2026-11-25: transcript (analyze_video) confirms: 0:01-0:03 'how many dragons I need to defeat Fairy Stockfish. The dragon moves like a bishop and a knight', 0:28 game 1 = a single dragon, 0:49 'I will be left with only a king against the rest of its army' (White = king + dragons only), one more dragon after each loss (1:27 ... 8:46), 4:13 'the best first move is dragon g5' (a c1 dragon), loses with 1-5, 12:26 wins with six (previous record seven). Dragon placement per level is inferred (only c1 is implied).",
    research: "research/modes/o8XcmMCIhIk.json"
  }
});
