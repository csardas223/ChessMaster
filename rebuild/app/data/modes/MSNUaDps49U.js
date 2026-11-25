/* I gave Fairy-Stockfish 1 Dragon until I lose: black king + N dragons vs White army. Sources: research/modes/MSNUaDps49U.json, frames. */
CM.mode({
  id: "MSNUaDps49U",
  title: "I Gave 1 Dragon to Stockfish Until I LOSE",
  name: "Extra Dragons",
  category: "Challenges & Odds",
  description: "Fairy-Stockfish has only a king and Dragons (a Dragon moves like a bishop or a knight); you have your normal army. Every win gives it one more; the run ends with your first loss.",
  how_to_win: "Checkmate Fairy-Stockfish each game. The video run ended at 4 Dragons.",
  player_side: "white",
  opponent: { name: "Fairy-Stockfish", rating: 3000, avatar: "assets/avatars/stockfish.svg", tagline: "lichess level 8" },
  board: { files: 8, ranks: 8 },
  theme: { light: "#eddbb7", dark: "#b08466" },
  pieces: { D: { name: "Dragon", moves: "BN", value: 800 } },
  setup: { fen: "3dk3/8/8/8/8/8/PPPPPPPP/RNBQKBNR" },
  rules: { promotion: { choices: ["Q", "D", "R", "B", "N"] } },
  bot: { engine: "search", style: "best", depth: 4, time_ms: 900 },
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
  source: { confidence: "high", research: "research/modes/MSNUaDps49U.json" }
});
