/* Giving Martin 1 Extra Pawn Until I LOSE: Martin with 23..40 pawns. Sources: research/modes/zJZKdeIq1Dw.json. */
CM.mode({
  id: "zJZKdeIq1Dw",
  title: "Giving Martin 1 Extra Pawn Until I LOSE",
  name: "Martin's Pawns",
  category: "Challenges & Odds",
  description: "You have a normal army; Martin starts with 23 pawns filling his side of the board and gets more after every game you win.",
  how_to_win: "Keep beating Martin. In the video he finally won at 45 pawns.",
  player_side: "white",
  player: { name: 'You', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },   /* iwantcheckmate's own avatar (purple king) from the videos */
  opponent: { name: "Martin", rating: 250, avatar: "assets/modes/XuvZCCFk42k/martin.png", tagline: "chess.com beginner bot" },
  board: { files: 8, ranks: 8 },
  theme: { light: "#eadeae", dark: "#ae8a66" },
  setup: { fen: "rnbqkbnr/pppppppp/pppppppp/ppppppp1/8/8/PPPPPPPP/RNBQKBNR" },
  params: {
    levels: [
      { label: "23 Pawns", fen: "rnbqkbnr/pppppppp/pppppppp/ppppppp1/8/8/PPPPPPPP/RNBQKBNR" },
      { label: "26 Pawns", fen: "rnbqkbnr/pppppppp/pppppppp/pppppppp/pp6/8/PPPPPPPP/RNBQKBNR" },
      { label: "29 Pawns", fen: "rnbqkbnr/pppppppp/pppppppp/pppppppp/ppppp3/8/PPPPPPPP/RNBQKBNR" },
      { label: "32 Pawns", fen: "rnbqkbnr/pppppppp/pppppppp/pppppppp/pppppppp/8/PPPPPPPP/RNBQKBNR" },
      { label: "35 Pawns", fen: "rnbqkbnr/pppppppp/pppppppp/pppppppp/pppppppp/ppp5/PPPPPPPP/RNBQKBNR" },
      { label: "38 Pawns", fen: "rnbqkbnr/pppppppp/pppppppp/pppppppp/pppppppp/pppppp2/PPPPPPPP/RNBQKBNR" },
      { label: "40 Pawns", fen: "rnbqkbnr/pppppppp/pppppppp/pppppppp/pppppppp/pppppppp/PPPPPPPP/RNBQKBNR" }
    ],
    advance: "win",
    unit: "Pawns"
  },
  hooks: "g3_ladder",
  source: {
    confidence: "medium",
    notes: "Capped at 40 pawns (ranks 3-7 full); the video went to ~47 with pawns on more ranks.",
    research: "research/modes/zJZKdeIq1Dw.json"
  }
});
