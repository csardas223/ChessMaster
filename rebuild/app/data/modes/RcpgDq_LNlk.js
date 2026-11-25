/* Fairy-Stockfish: king + N knooks vs a full army, one more after each loss. Sources: research/modes/RcpgDq_LNlk.json, frames. Series format inferred from sister videos. */
CM.mode({
  id: "RcpgDq_LNlk",
  title: "How Many Knooks to BEAT Stockfish?",
  name: "How many Knooks?",
  category: "Challenges & Odds",
  description: "How Many Knooks to BEAT Stockfish? King + Knooks (rook + knight in one piece) against Fairy-Stockfish's full army; one more after every loss.",
  how_to_win: "Checkmate Fairy-Stockfish with as few Knooks as possible.",
  player_side: "white",
  opponent: { name: "Fairy-Stockfish", rating: 3000, avatar: "assets/avatars/stockfish.svg" },
  board: { files: 8, ranks: 8 },
  theme: { light: "#fefedd", dark: "#89ae67" },
  pieces: { C: { name: "Knook", moves: "RN", value: 850, img: { w: "assets/modes/RcpgDq_LNlk/knook_w.svg", b: "assets/modes/RcpgDq_LNlk/knook_b.svg" }, glyph: null, badge: null /* pass 2: original art */ } },
  setup: { fen: "rnbqkbnr/pppppppp/8/8/8/8/8/3CK3" },
  bot: { engine: "search", style: "best", depth: 4, time_ms: 900 },
  params: {
    levels: [
      { label: "1 Knook", fen: "rnbqkbnr/pppppppp/8/8/8/8/8/3CK3" },
      { label: "2 Knooks", fen: "rnbqkbnr/pppppppp/8/8/8/8/8/3CKC2" },
      { label: "3 Knooks", fen: "rnbqkbnr/pppppppp/8/8/8/8/8/2CCKC2" },
      { label: "4 Knooks", fen: "rnbqkbnr/pppppppp/8/8/8/8/8/2CCKCC1" },
      { label: "5 Knooks", fen: "rnbqkbnr/pppppppp/8/8/8/8/8/1CCCKCC1" },
      { label: "6 Knooks", fen: "rnbqkbnr/pppppppp/8/8/8/8/8/1CCCKCCC" },
      { label: "7 Knooks", fen: "rnbqkbnr/pppppppp/8/8/8/8/8/CCCCKCCC" },
      { label: "8 Knooks", fen: "rnbqkbnr/pppppppp/8/8/8/8/4C3/CCCCKCCC" }
    ],
    advance: "fail",
    unit: "Knooks"
  },
  hooks: "g3_ladder",
  source: {
    confidence: "medium",
    notes: "Series format inferred from sister videos.",
    research: "research/modes/RcpgDq_LNlk.json"
  }
});
