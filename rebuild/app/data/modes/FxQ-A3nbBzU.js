/* I Gave 1 Elephant to Stockfish Until I LOSE: 10x8, black king + N elephants (rook+knight) vs full White army. Sources: research/modes/FxQ-A3nbBzU.json. */
CM.mode({
  id: "FxQ-A3nbBzU",
  title: "I Gave 1 Elephant to Stockfish Until I LOSE",
  name: "Extra Elephants",
  category: "Challenges & Odds",
  description: "A 10x8 board. Fairy-Stockfish has only a king and Elephants (an Elephant moves like a rook or a knight); you have a full army with 10 pawns. Every win adds one Elephant; the run ends with your first loss.",
  how_to_win: "Checkmate Fairy-Stockfish each game. The video lost at 4 Elephants.",
  player_side: "white",
  opponent: { name: "Fairy-Stockfish", rating: 3000, avatar: "assets/modes/FxQ-A3nbBzU/fish.png", tagline: "lichess level 8" },
  board: { files: 10, ranks: 8 },
  theme: { light: "#eedab7", dark: "#b48365" },
  pieces: { E: { name: "Elephant", moves: "RN", value: 850, img: { w: "assets/modes/ZoSm2Wxlhvo/elephant_w.png", b: "assets/modes/ZoSm2Wxlhvo/elephant_b.png" }, glyph: null, badge: null /* art copied from the video */ } },
  setup: { fen: "4ek4/10/10/10/10/10/PPPPPPPPPP/1RNBQKBNR1" },
  rules: { castling: false, promotion: { choices: ["Q", "E", "R", "B", "N"] } },
  bot: { engine: "search", style: "best", depth: 4, time_ms: 900 },
  params: {
    levels: [
      { label: "1 Elephant", fen: "4ek4/10/10/10/10/10/PPPPPPPPPP/1RNBQKBNR1" },
      { label: "2 Elephants", fen: "4eke3/10/10/10/10/10/PPPPPPPPPP/1RNBQKBNR1" },
      { label: "3 Elephants", fen: "3eeke3/10/10/10/10/10/PPPPPPPPPP/1RNBQKBNR1" },
      { label: "4 Elephants", fen: "3eekee2/10/10/10/10/10/PPPPPPPPPP/1RNBQKBNR1" },
      { label: "5 Elephants", fen: "2eeekee2/10/10/10/10/10/PPPPPPPPPP/1RNBQKBNR1" },
      { label: "6 Elephants", fen: "2eeekeee1/10/10/10/10/10/PPPPPPPPPP/1RNBQKBNR1" }
    ],
    advance: "win",
    unit: "Elephants"
  },
  hooks: "g3_ladder",
  source: {
    confidence: "low",
    notes: "The two extra files: White's standard back rank sits on b-i with a1/j1 empty (not established in the video). Castling off.",
    research: "research/modes/FxQ-A3nbBzU.json"
  }
});
