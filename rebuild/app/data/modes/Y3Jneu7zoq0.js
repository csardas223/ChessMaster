/* I gave Fairy-Stockfish 1 Knibis until I lose: black king + N knibis vs White army. Sources: research/modes/Y3Jneu7zoq0.json, frames. */
CM.mode({
  id: "Y3Jneu7zoq0",
  title: "I Gave Stockfish 1 Knibis Until I LOSE",
  name: "Extra Knibis",
  category: "Challenges & Odds",
  description: "Fairy-Stockfish has only a king and Knibis (a Knibis moves like a knight and captures like a bishop); you have king, queen, rooks and pawns (no minor pieces). Every win gives it one more; the run ends with your first loss.",
  how_to_win: "Checkmate Fairy-Stockfish each game. 5 Knibis was a draw and 6 a loss in the video.",
  player_side: "white",
  opponent: { name: "Fairy-Stockfish", rating: 3000, avatar: "assets/modes/Y3Jneu7zoq0/fish.png", tagline: "lichess level 8" },
  board: { files: 8, ranks: 8 },
  theme: { light: "#eddab7", dark: "#b08265" },
  pieces: { J: { name: "Knibis", moves: "mNcB", value: 450, img: { w: "assets/modes/RqXorBCKAdA/knibis_w.png", b: "assets/modes/RqXorBCKAdA/knibis_b.png" }, glyph: null, badge: null /* art copied from the video */ } },
  setup: { fen: "3jk3/8/8/8/8/8/PPPPPPPP/R2QK2R" },
  bot: { engine: "search", style: "best", depth: 4, time_ms: 900 },
  params: {
    levels: [
      { label: "1 Knibis", fen: "3jk3/8/8/8/8/8/PPPPPPPP/R2QK2R" },
      { label: "2 Knibis", fen: "3jkj2/8/8/8/8/8/PPPPPPPP/R2QK2R" },
      { label: "3 Knibis", fen: "2jjkj2/8/8/8/8/8/PPPPPPPP/R2QK2R" },
      { label: "4 Knibis", fen: "2jjkjj1/8/8/8/8/8/PPPPPPPP/R2QK2R" },
      { label: "5 Knibis", fen: "1jjjkjj1/8/8/8/8/8/PPPPPPPP/R2QK2R" },
      { label: "6 Knibis", fen: "1jjjkjjj/8/8/8/8/8/PPPPPPPP/R2QK2R" },
      { label: "7 Knibis", fen: "jjjjkjjj/8/8/8/8/8/PPPPPPPP/R2QK2R" },
      { label: "8 Knibis", fen: "jjjjkjjj/4j3/8/8/8/8/PPPPPPPP/R2QK2R" }
    ],
    advance: "win",
    unit: "Knibis"
  },
  hooks: "g3_ladder",
  source: {
    confidence: "medium",
    notes: "Knibis squares inferred (d8 first).",
    research: "research/modes/Y3Jneu7zoq0.json"
  }
});
