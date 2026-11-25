/* How Many Pawns to BEAT Magnus: king + full ranks of pawns (2-3 up to 2-6). Sources: research/modes/dsIfLYPsTTg.json, frames. */
CM.mode({
  id: "dsIfLYPsTTg",
  title: "How Many Pawns to BEAT Magnus?",
  name: "How many pawns?",
  category: "Challenges & Odds",
  description: "How Many Pawns to BEAT Magnus? A king and ranks full of pawns against Magnus's full army; one more rank of pawns after every loss.",
  how_to_win: "Checkmate Magnus.",
  player_side: "white",
  player: { name: 'You', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },   /* iwantcheckmate's own avatar (purple king) from the videos */
  opponent: { name: "Magnus", rating: 2882, avatar: "assets/modes/t61xLLQbotM/magnus.png", tagline: "chess.com Magnus Carlsen bot" },
  board: { files: 8, ranks: 8 },
  theme: { light: "#eadeae", dark: "#ae8a66" },
  setup: { fen: "rnbqkbnr/pppppppp/8/8/8/PPPPPPPP/PPPPPPPP/4K3" },
  params: {
    levels: [
      { label: "16 Pawns (ranks 2-3)", fen: "rnbqkbnr/pppppppp/8/8/8/PPPPPPPP/PPPPPPPP/4K3" },
      { label: "24 Pawns (ranks 2-4)", fen: "rnbqkbnr/pppppppp/8/8/PPPPPPPP/PPPPPPPP/PPPPPPPP/4K3" },
      { label: "32 Pawns (ranks 2-5)", fen: "rnbqkbnr/pppppppp/8/PPPPPPPP/PPPPPPPP/PPPPPPPP/PPPPPPPP/4K3" },
      { label: "40 Pawns (ranks 2-6)", fen: "rnbqkbnr/pppppppp/PPPPPPPP/PPPPPPPP/PPPPPPPP/PPPPPPPP/PPPPPPPP/4K3" }
    ],
    advance: "fail",
    unit: "Pawns"
  },
  hooks: "g3_ladder",
  source: {
    confidence: "medium",
    notes: "Exact counts per game unknown; frames show ranks 2-6 filled (~40 pawns).",
    research: "research/modes/dsIfLYPsTTg.json"
  }
});
