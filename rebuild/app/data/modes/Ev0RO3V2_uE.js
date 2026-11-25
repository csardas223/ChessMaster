/* Can I BEAT Martin with 1 Piece: king + one piece (nuke, Q, R, B, N, P) vs Martin, next piece after each game. Sources: research/modes/Ev0RO3V2_uE.json. */
CM.mode({
  id: "Ev0RO3V2_uE",
  title: "Can I BEAT Martin with 1 Piece?",
  name: "1 Piece vs Martin",
  category: "Challenges & Odds",
  description: "A king and a single piece against Martin's full army, one game per piece: Nuke (queen + nightrider), queen, rook, bishop, knight, pawn.",
  how_to_win: "Checkmate Martin with each piece. The video won with the nuke, queen, rook and pawn and drew with bishop and knight.",
  player_side: "white",
  opponent: { name: "Martin", rating: 250, avatar: "assets/avatars/bot.svg", tagline: "chess.com beginner bot" },
  board: { files: 8, ranks: 8 },
  theme: { light: "#eeeed2", dark: "#769656" },
  pieces: {
    O: {
      name: "Nuke",
      moves: "QNN",
      value: 1500,
      img: { w: "assets/modes/Ev0RO3V2_uE/nuke_w.svg", b: "assets/modes/Ev0RO3V2_uE/nuke_b.svg" }
    }
  },
  setup: { fen: "rnbqkbnr/pppppppp/8/8/8/8/8/3OK3" },
  params: {
    levels: [
      { label: "Nuke", fen: "rnbqkbnr/pppppppp/8/8/8/8/8/3OK3" },
      { label: "Queen", fen: "rnbqkbnr/pppppppp/8/8/8/8/8/3QK3" },
      { label: "Rook", fen: "rnbqkbnr/pppppppp/8/8/8/8/8/R3K3" },
      { label: "Bishop", fen: "rnbqkbnr/pppppppp/8/8/8/8/8/2B1K3" },
      { label: "Knight", fen: "rnbqkbnr/pppppppp/8/8/8/8/8/4K1N1" },
      { label: "Pawn", fen: "rnbqkbnr/pppppppp/8/8/8/8/4P3/4K3" }
    ],
    advance: "any",
    unit: "Piece",
    pickerLabel: "Your piece",
    statusPrefix: "Your piece: "
  },
  hooks: "g3_ladder",
  source: {
    confidence: "high",
    notes: "Start squares of the single pieces inferred. Nuke art is original.",
    research: "research/modes/Ev0RO3V2_uE.json"
  }
});
