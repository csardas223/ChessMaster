/* How Many Elephants to BEAT Stockfish: 10x8, king + N elephants vs Fairy-Stockfish. Sources: research/modes/ZoSm2Wxlhvo.json. */
CM.mode({
  id: "ZoSm2Wxlhvo",
  title: "How Many Elephants to BEAT Stockfish?",
  name: "How many Elephants?",
  category: "Challenges & Odds",
  description: "A 10x8 board. You have a king and Elephants (an Elephant moves like a rook or a knight); Fairy-Stockfish has a full army with 10 pawns. One more Elephant after every loss.",
  how_to_win: "Checkmate Fairy-Stockfish. The video took 7 Elephants.",
  player_side: "white",
  opponent: { name: "Fairy-Stockfish", rating: 3000, avatar: "assets/avatars/stockfish.svg", tagline: "lichess level 8" },
  board: { files: 10, ranks: 8 },
  theme: { light: "#eadeba", dark: "#ae8a66" },
  pieces: { E: { name: "Elephant", moves: "RN", value: 850, img: { w: "assets/modes/ZoSm2Wxlhvo/elephant_w.svg", b: "assets/modes/ZoSm2Wxlhvo/elephant_b.svg" }, glyph: null, badge: null /* pass 2: original art */ } },
  setup: { fen: "1rnbqkbnr1/pppppppppp/10/10/10/10/10/4EK4" },
  rules: { castling: false },
  bot: { engine: "search", style: "best", depth: 4, time_ms: 900 },
  params: {
    levels: [
      { label: "1 Elephant", fen: "1rnbqkbnr1/pppppppppp/10/10/10/10/10/4EK4" },
      { label: "2 Elephants", fen: "1rnbqkbnr1/pppppppppp/10/10/10/10/10/4EKE3" },
      { label: "3 Elephants", fen: "1rnbqkbnr1/pppppppppp/10/10/10/10/10/3EEKE3" },
      { label: "4 Elephants", fen: "1rnbqkbnr1/pppppppppp/10/10/10/10/10/3EEKEE2" },
      { label: "5 Elephants", fen: "1rnbqkbnr1/pppppppppp/10/10/10/10/10/2EEEKEE2" },
      { label: "6 Elephants", fen: "1rnbqkbnr1/pppppppppp/10/10/10/10/10/2EEEKEEE1" },
      { label: "7 Elephants", fen: "1rnbqkbnr1/pppppppppp/10/10/10/10/10/1EEEEKEEE1" },
      { label: "8 Elephants", fen: "1rnbqkbnr1/pppppppppp/10/10/10/10/10/1EEEEKEEEE" },
      { label: "9 Elephants", fen: "1rnbqkbnr1/pppppppppp/10/10/10/10/10/EEEEEKEEEE" }
    ],
    advance: "fail",
    unit: "Elephants"
  },
  hooks: "g3_ladder",
  source: {
    confidence: "low",
    notes: "Black back rank on files b-i (10-file layout not established).",
    research: "research/modes/ZoSm2Wxlhvo.json"
  }
});
