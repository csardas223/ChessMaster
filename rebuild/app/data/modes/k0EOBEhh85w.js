/* I gave jacksark 1 Dragon until I lose: black king + N dragons vs White army. Sources: research/modes/k0EOBEhh85w.json, frames. */
CM.mode({
  id: "k0EOBEhh85w",
  title: "I Added 1 Dragon Each Game Until I LOSE (feat. jacksark)",
  name: "Extra Dragons",
  category: "Challenges & Odds",
  description: "jacksark has only a king and Dragons (a Dragon moves like a bishop or a knight); you have your normal army. Every win gives it one more; the run ends with your first loss.",
  how_to_win: "Checkmate jacksark each game. The video lost at 6 Dragons.",
  player_side: "white",
  opponent: { name: "jacksark", rating: 2000, avatar: null, tagline: "Chess YouTuber Jack Sarkisian (rating inferred)" },
  board: { files: 8, ranks: 8 },
  theme: { light: "#ecdab7", dark: "#ae8766" },
  pieces: { D: { name: "Dragon", moves: "BN", value: 800 } },
  setup: { fen: "3dk3/8/8/8/8/8/PPPPPPPP/RNBQKBNR" },
  rules: { promotion: { choices: ["Q", "D", "R", "B", "N"] } },
  bot: { engine: "search", style: "elo", depth: 4, time_ms: 900 },
  clock: { w: 300, b: 300, inc: 0, bot: false },
  params: {
    levels: [
      { label: "1 Dragon", fen: "3dk3/8/8/8/8/8/PPPPPPPP/RNBQKBNR" },
      { label: "2 Dragons", fen: "3dkd2/8/8/8/8/8/PPPPPPPP/RNBQKBNR" },
      { label: "3 Dragons", fen: "2ddkd2/8/8/8/8/8/PPPPPPPP/RNBQKBNR" },
      { label: "4 Dragons", fen: "2ddkdd1/8/8/8/8/8/PPPPPPPP/RNBQKBNR" },
      { label: "5 Dragons", fen: "1dddkdd1/8/8/8/8/8/PPPPPPPP/RNBQKBNR" },
      { label: "6 Dragons", fen: "1dddkddd/8/8/8/8/8/PPPPPPPP/RNBQKBNR" },
      { label: "7 Dragons", fen: "ddddkddd/8/8/8/8/8/PPPPPPPP/RNBQKBNR" },
      { label: "8 Dragons", fen: "ddddkddd/4d3/8/8/8/8/PPPPPPPP/RNBQKBNR" }
    ],
    advance: "win",
    unit: "Dragons"
  },
  hooks: "g3_ladder",
  source: {
    confidence: "medium",
    notes: "Player side inferred to be the full army (White).",
    research: "research/modes/k0EOBEhh85w.json"
  }
});
