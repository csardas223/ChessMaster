/* I gave Fairy-Stockfish 1 Snake until I lose: black king + N snakes vs White army. Sources: research/modes/lDlOC8KH0Zc.json, frames. */
CM.mode({
  id: "lDlOC8KH0Zc",
  title: "I Gave Stockfish 1 Snake Until I LOSE",
  name: "Extra Snakes",
  category: "Challenges & Odds",
  description: "Fairy-Stockfish has only a king and Snakes (a Snake slides like a bishop and captures like a knight); you have king, queen, rooks and pawns (no minor pieces). Every win gives it one more; the run ends with your first loss.",
  how_to_win: "Checkmate Fairy-Stockfish each game. The video conceded at 8 Snakes.",
  player_side: "white",
  player: { name: 'You', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },   /* iwantcheckmate's own avatar (purple king) from the videos */
  opponent: { name: "Fairy-Stockfish", rating: 3000, avatar: "assets/modes/lDlOC8KH0Zc/fish.png", tagline: "lichess level 8" },
  board: { files: 8, ranks: 8 },
  theme: { light: "#eddbb7", dark: "#ae8666" },
  pieces: {
    S: {
      name: "Snake",
      moves: "mBcN",
      value: 450,
      img: { w: "assets/modes/lDlOC8KH0Zc/snake_w.png", b: "assets/modes/lDlOC8KH0Zc/snake_b.png" }
    }
  },
  setup: { fen: "3sk3/8/8/8/8/8/PPPPPPPP/R2QK2R" },
  bot: { engine: "search", style: "best", depth: 4, time_ms: 900 },
  params: {
    levels: [
      { label: "1 Snake", fen: "3sk3/8/8/8/8/8/PPPPPPPP/R2QK2R" },
      { label: "2 Snakes", fen: "3sks2/8/8/8/8/8/PPPPPPPP/R2QK2R" },
      { label: "3 Snakes", fen: "2ssks2/8/8/8/8/8/PPPPPPPP/R2QK2R" },
      { label: "4 Snakes", fen: "2sskss1/8/8/8/8/8/PPPPPPPP/R2QK2R" },
      { label: "5 Snakes", fen: "1ssskss1/8/8/8/8/8/PPPPPPPP/R2QK2R" },
      { label: "6 Snakes", fen: "1sssksss/8/8/8/8/8/PPPPPPPP/R2QK2R" },
      { label: "7 Snakes", fen: "ssssksss/8/8/8/8/8/PPPPPPPP/R2QK2R" },
      { label: "8 Snakes", fen: "ssssksss/4s3/8/8/8/8/PPPPPPPP/R2QK2R" },
      { label: "9 Snakes", fen: "ssssksss/3ss3/8/8/8/8/PPPPPPPP/R2QK2R" }
    ],
    advance: "win",
    unit: "Snakes"
  },
  hooks: "g3_ladder",
  source: {
    confidence: "high",
    notes: "Snake squares for small N inferred (d8 first).",
    research: "research/modes/lDlOC8KH0Zc.json"
  }
});
