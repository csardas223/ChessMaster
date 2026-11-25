/* Martin: king + N pawns vs a full army, one more after each loss. Sources: research/modes/XuvZCCFk42k.json, frames. Pawn order inferred: rank 2 from the centre outwards, then c1/g1 as in the 10-pawn frame. */
CM.mode({
  id: "XuvZCCFk42k",
  title: "How Many Pawns to BEAT Martin?",
  name: "How many Pawns?",
  category: "Challenges & Odds",
  description: "How Many Pawns to BEAT Martin? King + pawns against Martin's full army; one more pawn after every loss. Pawns promote normally.",
  how_to_win: "Checkmate Martin. The video took 10 pawns.",
  player_side: "white",
  opponent: { name: "Martin", rating: 250, avatar: "assets/avatars/bot.svg", tagline: "chess.com beginner bot" },
  board: { files: 8, ranks: 8 },
  theme: { light: "#ecd9b6", dark: "#b58667" },
  setup: { fen: "rnbqkbnr/pppppppp/8/8/8/8/4P3/4K3" },
  params: {
    levels: [
      { label: "1 Pawn", fen: "rnbqkbnr/pppppppp/8/8/8/8/4P3/4K3" },
      { label: "2 Pawns", fen: "rnbqkbnr/pppppppp/8/8/8/8/3PP3/4K3" },
      { label: "3 Pawns", fen: "rnbqkbnr/pppppppp/8/8/8/8/3PPP2/4K3" },
      { label: "4 Pawns", fen: "rnbqkbnr/pppppppp/8/8/8/8/2PPPP2/4K3" },
      { label: "5 Pawns", fen: "rnbqkbnr/pppppppp/8/8/8/8/2PPPPP1/4K3" },
      { label: "6 Pawns", fen: "rnbqkbnr/pppppppp/8/8/8/8/1PPPPPP1/4K3" },
      { label: "7 Pawns", fen: "rnbqkbnr/pppppppp/8/8/8/8/1PPPPPPP/4K3" },
      { label: "8 Pawns", fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/4K3" },
      { label: "9 Pawns", fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/2P1K3" },
      { label: "10 Pawns", fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/2P1K1P1" },
      { label: "11 Pawns", fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/1PP1K1P1" },
      { label: "12 Pawns", fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/1PP1KPP1" },
      { label: "13 Pawns", fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/1PPPKPP1" },
      { label: "14 Pawns", fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/1PPPKPPP" }
    ],
    advance: "fail",
    unit: "Pawns"
  },
  hooks: "g3_ladder",
  source: {
    confidence: "medium",
    notes: "Pawn order inferred: rank 2 from the centre outwards, then c1/g1 as in the 10-pawn frame.",
    research: "research/modes/XuvZCCFk42k.json"
  }
});
