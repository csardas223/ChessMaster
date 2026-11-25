/* How Many Knibis to BEAT Stockfish: king + N knibis (move N, capture B) vs K, Q, 2R, 8P. Sources: research/modes/RqXorBCKAdA.json, frames. */
CM.mode({
  id: "RqXorBCKAdA",
  title: "How Many Knibis to BEAT Stockfish?",
  name: "How many Knibis?",
  category: "Challenges & Odds",
  description: "A Knibis moves like a knight but captures like a bishop. You get a king and Knibis; Fairy-Stockfish has king, queen, two rooks and eight pawns. One more Knibis after every loss.",
  how_to_win: "Checkmate Fairy-Stockfish. The video took 10 Knibis.",
  player_side: "white",
  player: { name: 'You', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },   /* iwantcheckmate's own avatar (purple king) from the videos */
  opponent: { name: "Fairy-Stockfish", rating: 3000, avatar: "assets/modes/RqXorBCKAdA/fish.png", tagline: "lichess level 8" },
  board: { files: 8, ranks: 8 },
  theme: { light: "#eddab7", dark: "#ae8667" },
  pieces: { J: { name: "Knibis", moves: "mNcB", value: 450, img: { w: "assets/modes/RqXorBCKAdA/knibis_w.png", b: "assets/modes/RqXorBCKAdA/knibis_b.png" }, glyph: null, badge: null /* art copied from the video */ } },
  setup: { fen: "r2qk2r/pppppppp/8/8/8/8/8/3JK3" },
  bot: { engine: "search", style: "best", depth: 4, time_ms: 900 },
  params: {
    levels: [
      { label: "1 Knibis", fen: "r2qk2r/pppppppp/8/8/8/8/8/3JK3" },
      { label: "2 Knibis", fen: "r2qk2r/pppppppp/8/8/8/8/8/3JKJ2" },
      { label: "3 Knibis", fen: "r2qk2r/pppppppp/8/8/8/8/8/2JJKJ2" },
      { label: "4 Knibis", fen: "r2qk2r/pppppppp/8/8/8/8/8/2JJKJJ1" },
      { label: "5 Knibis", fen: "r2qk2r/pppppppp/8/8/8/8/8/1JJJKJJ1" },
      { label: "6 Knibis", fen: "r2qk2r/pppppppp/8/8/8/8/8/1JJJKJJJ" },
      { label: "7 Knibis", fen: "r2qk2r/pppppppp/8/8/8/8/8/JJJJKJJJ" },
      { label: "8 Knibis", fen: "r2qk2r/pppppppp/8/8/8/8/4J3/JJJJKJJJ" },
      { label: "9 Knibis", fen: "r2qk2r/pppppppp/8/8/8/8/3JJ3/JJJJKJJJ" },
      { label: "10 Knibis", fen: "r2qk2r/pppppppp/8/8/8/8/3JJJ2/JJJJKJJJ" },
      { label: "11 Knibis", fen: "r2qk2r/pppppppp/8/8/8/8/2JJJJ2/JJJJKJJJ" },
      { label: "12 Knibis", fen: "r2qk2r/pppppppp/8/8/8/8/2JJJJJ1/JJJJKJJJ" }
    ],
    advance: "fail",
    unit: "Knibis"
  },
  hooks: "g3_ladder",
  source: {
    confidence: "high",
    notes: "Knibis squares for N<8 inferred (d1 first).",
    research: "research/modes/RqXorBCKAdA.json"
  }
});
