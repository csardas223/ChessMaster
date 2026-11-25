/* Fairy-Stockfish: king + N amazons vs a full army, one more after each loss. Sources: research/modes/onv0NOspxH8.json, frames. */
CM.mode({
  id: "onv0NOspxH8",
  title: "How Many Amazons to BEAT Stockfish?",
  name: "How many Amazons?",
  category: "Challenges & Odds",
  description: "How Many Amazons to BEAT Stockfish? King + Amazons (queen + knight) against Fairy-Stockfish's full army; one more after every loss.",
  how_to_win: "Checkmate Fairy-Stockfish. The video needed 3 Amazons.",
  player_side: "white",
  opponent: { name: "Fairy-Stockfish", rating: 3000, avatar: "assets/avatars/stockfish.svg" },
  board: { files: 8, ranks: 8 },
  theme: { light: "#dee4e7", dark: "#7daeb0" },
  pieces: { M: { name: "Amazon", moves: "QN", value: 1200, glyph: "Q", badge: "QN" } },
  setup: { fen: "rnbqkbnr/pppppppp/8/8/8/8/8/3MK3" },
  bot: { engine: "search", style: "best", depth: 4, time_ms: 900 },
  params: {
    levels: [
      { label: "1 Amazon", fen: "rnbqkbnr/pppppppp/8/8/8/8/8/3MK3" },
      { label: "2 Amazons", fen: "rnbqkbnr/pppppppp/8/8/8/8/8/3MKM2" },
      { label: "3 Amazons", fen: "rnbqkbnr/pppppppp/8/8/8/8/8/2MMKM2" },
      { label: "4 Amazons", fen: "rnbqkbnr/pppppppp/8/8/8/8/8/2MMKMM1" },
      { label: "5 Amazons", fen: "rnbqkbnr/pppppppp/8/8/8/8/8/1MMMKMM1" }
    ],
    advance: "fail",
    unit: "Amazons"
  },
  hooks: "g3_ladder",
  source: { confidence: "high", research: "research/modes/onv0NOspxH8.json" }
});
