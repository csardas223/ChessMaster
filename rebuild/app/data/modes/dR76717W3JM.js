/* How Many Snakes to BEAT Stockfish: king + N snakes (move B, capture N) vs Fairy-Stockfish. Sources: research/modes/dR76717W3JM.json, frames. Snake art is original. */
CM.mode({
  id: "dR76717W3JM",
  title: "How Many Snakes to BEAT Stockfish?",
  name: "How many Snakes?",
  category: "Challenges & Odds",
  description: "A Snake slides like a bishop but captures like a knight. You get a king and Snakes; Fairy-Stockfish has king, queen, two rooks and eight pawns. One more Snake after every loss.",
  how_to_win: "Checkmate Fairy-Stockfish.",
  player_side: "white",
  opponent: { name: "Fairy-Stockfish", rating: 3000, avatar: "assets/avatars/stockfish.svg", tagline: "lichess level 8" },
  board: { files: 8, ranks: 8 },
  theme: { light: "#eddab7", dark: "#b08467" },
  pieces: {
    S: {
      name: "Snake",
      moves: "mBcN",
      value: 450,
      img: { w: "assets/modes/dR76717W3JM/snake_w.svg", b: "assets/modes/dR76717W3JM/snake_b.svg" }
    }
  },
  setup: { fen: "r2qk2r/pppppppp/8/8/8/8/8/3SK3" },
  bot: { engine: "search", style: "best", depth: 4, time_ms: 900 },
  params: {
    levels: [
      { label: "1 Snake", fen: "r2qk2r/pppppppp/8/8/8/8/8/3SK3" },
      { label: "2 Snakes", fen: "r2qk2r/pppppppp/8/8/8/8/8/3SKS2" },
      { label: "3 Snakes", fen: "r2qk2r/pppppppp/8/8/8/8/8/2SSKS2" },
      { label: "4 Snakes", fen: "r2qk2r/pppppppp/8/8/8/8/8/2SSKSS1" },
      { label: "5 Snakes", fen: "r2qk2r/pppppppp/8/8/8/8/8/1SSSKSS1" },
      { label: "6 Snakes", fen: "r2qk2r/pppppppp/8/8/8/8/8/1SSSKSSS" },
      { label: "7 Snakes", fen: "r2qk2r/pppppppp/8/8/8/8/8/SSSSKSSS" },
      { label: "8 Snakes", fen: "r2qk2r/pppppppp/8/8/8/8/4S3/SSSSKSSS" },
      { label: "9 Snakes", fen: "r2qk2r/pppppppp/8/8/8/8/3SS3/SSSSKSSS" },
      { label: "10 Snakes", fen: "r2qk2r/pppppppp/8/8/8/8/3SSS2/SSSSKSSS" }
    ],
    advance: "fail",
    unit: "Snakes"
  },
  hooks: "g3_ladder",
  source: {
    confidence: "medium",
    notes: "Black army reduced to K, Q, 2R, pawns (frame + sister Knibis video); rules.jsonl says full army.",
    research: "research/modes/dR76717W3JM.json"
  }
});
