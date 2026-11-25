/* Can I BEAT Martin in Chess960?  Chess960 against Martin (250): the back rank is shuffled (bishops on opposite colours, king between the rooks), mirrored for Black. Sources: research/modes/4tDIBl14AX8.json, frames visual_d. Castling uses Chess960 rules (js/modes/g4_960.js): move the king onto its rook. */
CM.mode({
  id: "4tDIBl14AX8",
  name: "Chess960 vs Martin",
  category: "Variants & Games",
  description: "A random Chess960 start position against Martin. The pieces behind the pawns are shuffled the same way for both sides. Martin never misses a mate in one. To castle, move your king onto the rook.",
  how_to_win: "Checkmate Martin, and watch out for stalemate.",
  player_side: "white",
  opponent: {
    name: "Martin",
    rating: 250,
    avatar: "assets/modes/4tDIBl14AX8/martin.svg"
  },
  board: {
    files: 8,
    ranks: 8,
    light: "#eeeed2",
    dark: "#769656"
  },
  setup: {
    random: "chess960"
  },
  source: {
    research: "research/modes/4tDIBl14AX8.json",
    confidence: "high"
  },
  title: "Can I BEAT Martin in Chess960?",
  hooks: 'g4_960m'
});
