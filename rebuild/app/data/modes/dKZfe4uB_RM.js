/* How Many Martins to BEAT Stockfish: king + 1/7/15/31 commoners vs Fairy-Stockfish. Sources: research/modes/dKZfe4uB_RM.json. Martin face art copied from the video. */
CM.mode({
  id: "dKZfe4uB_RM",
  title: "How Many Martins to BEAT Stockfish?",
  name: "How many Martins?",
  category: "Challenges & Odds",
  description: "A Martin moves one square in any direction (like a king, but losing one is fine). You get a king and Martins against Fairy-Stockfish's full army. The count jumps after each loss: 1, 7, 15, 31.",
  how_to_win: "Checkmate Fairy-Stockfish. The video won with 31 Martins.",
  player_side: "white",
  opponent: { name: "Fairy-Stockfish", rating: 3000, avatar: "assets/modes/dKZfe4uB_RM/fish.png" },
  board: { files: 8, ranks: 8 },
  theme: { light: "#def6ea", dark: "#72aeae" },
  pieces: {
    U: {
      name: "Martin",
      moves: "K",
      value: 300,
      img: { w: "assets/modes/dKZfe4uB_RM/face_w.png", b: "assets/modes/dKZfe4uB_RM/face_w.png" },
      glyph: null,
      badge: null
    }
  },
  setup: { fen: "rnbqkbnr/pppppppp/8/8/8/8/4U3/4K3" },
  bot: { engine: "search", style: "best", depth: 4, time_ms: 900 },
  params: {
    levels: [
      { label: "1 Martin", fen: "rnbqkbnr/pppppppp/8/8/8/8/4U3/4K3" },
      { label: "7 Martins", fen: "rnbqkbnr/pppppppp/8/8/8/8/1UUUUUUU/4K3" },
      { label: "15 Martins", fen: "rnbqkbnr/pppppppp/8/8/8/1UUUUUUU/UUUUUUUU/4K3" },
      { label: "31 Martins", fen: "rnbqkbnr/pppppppp/8/1UUUUUUU/UUUUUUUU/UUUUUUUU/UUUUUUUU/4K3" }
    ],
    advance: "fail",
    unit: "Martins"
  },
  hooks: "g3_ladder",
  source: {
    confidence: "high",
    notes: "Martin squares fill ranks 2-5 around the king (frames).",
    research: "research/modes/dKZfe4uB_RM.json"
  }
});
