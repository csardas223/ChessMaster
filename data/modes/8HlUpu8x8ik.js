/* Removing 1 Piece Until I BEAT Magnus: the opponent starts a rook down, one more piece per loss. Sources: research/modes/8HlUpu8x8ik.json. */
CM.mode({
  id: "8HlUpu8x8ik",
  title: "Removing 1 Piece Until I BEAT Magnus",
  name: "Removing Pieces",
  category: "Challenges & Odds",
  description: "Normal chess, but Magnus starts without a rook. After every loss it loses one more piece.",
  how_to_win: "Checkmate Magnus. The video won in game 1 (one rook removed).",
  player_side: "white",
  player: { name: 'You', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },   /* iwantcheckmate's own avatar (purple king) from the videos */
  opponent: { name: "Magnus", rating: 2850, avatar: "assets/modes/t61xLLQbotM/magnus.png", tagline: "chess.com Magnus Carlsen bot" },
  board: { files: 8, ranks: 8 },
  theme: { light: "#ebd9b0", dark: "#b08665" },
  setup: { fen: "1nbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR" },
  params: {
    levels: [
      { label: "-1 piece", fen: "1nbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR", note: "Removed: a rook" },
      { label: "-2 pieces", fen: "1nbqkb1r/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR", note: "Removed: a rook, a knight" },
      {
        label: "-3 pieces",
        fen: "2bqkb1r/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR",
        note: "Removed: a rook, a knight, the other knight"
      },
      {
        label: "-4 pieces",
        fen: "3qkb1r/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR",
        note: "Removed: a rook, a knight, the other knight, a bishop"
      },
      {
        label: "-5 pieces",
        fen: "3qk2r/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR",
        note: "Removed: a rook, a knight, the other knight, a bishop, the other bishop"
      },
      {
        label: "-6 pieces",
        fen: "3qk3/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR",
        note: "Removed: a rook, a knight, the other knight, a bishop, the other bishop, the other rook"
      },
      {
        label: "-7 pieces",
        fen: "4k3/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR",
        note: "Removed: a rook, a knight, the other knight, a bishop, the other bishop, the other rook, the queen"
      }
    ],
    advance: "fail",
    unit: "Pieces"
  },
  hooks: "g3_ladder",
  source: {
    confidence: "high",
    notes: "Removal order after the a8 rook and g8 knight is inferred.",
    research: "research/modes/8HlUpu8x8ik.json"
  }
});
