/* Chess vs Chaturanga.  Your modern army against Fairy-Stockfish's Chaturanga army on the same squares: Fers instead of the queen (one diagonal step), Elephants instead of bishops (leap exactly two diagonally), Chariots (rooks), horses, king and pawns. Sources: research/modes/o5yiE_GHcrQ.json, rules.jsonl, frames visual_a. Inferred: castling off (9:08), Black pawns step one square and promote to a Fers (Chaturanga rule). */
CM.mode({
  id: "o5yiE_GHcrQ",
  name: "Chess vs Chaturanga",
  category: "Other Videos",
  description: "You have a normal chess army. Fairy-Stockfish has the ancient Chaturanga army: its queen is a Fers that only steps one square diagonally, and its bishops are Elephants that leap exactly two squares diagonally. Chariots move like rooks.",
  how_to_win: "Checkmate Fairy-Stockfish.",
  player_side: "white",
  opponent: {
    name: "Fairy-Stockfish",
    rating: 3000,
    tagline: "Playing the Chaturanga army"
  },
  board: {
    files: 8,
    ranks: 8,
    light: "#fefedd",
    dark: "#89af68"
  },
  pieces: {
    Ch: {
      name: "Chariot",
      moves: "R",
      value: 500,
      glyph: "R",
      badge: "Ch"
    },
    El: {
      name: "Elephant",
      moves: "A",
      value: 150,
      glyph: "B",
      badge: "E"
    },
    Fe: {
      name: "Fers",
      moves: "F",
      value: 170,
      glyph: "Q",
      badge: "F"
    },
    Cp: {
      name: "Pawn",
      moves: "fmWfcF",
      value: 100,
      pawn: true,
      promote: true,
      promoteTo: [
        "Fe"
      ],
      glyph: "P",
      san: ""
    }
  },
  setup: {
    fen: "[ch]n[el][fe]k[el]n[ch]/[cp][cp][cp][cp][cp][cp][cp][cp]/8/8/8/8/PPPPPPPP/RNBQKBNR"
  },
  rules: {
    castling: false
  },
  bot: {
    engine: "search",
    style: "best",
    depth: 4,
    time_ms: 800
  },
  source: {
    research: "research/modes/o5yiE_GHcrQ.json",
    confidence: "high"
  },
  title: "Chess vs Chaturanga"
});
