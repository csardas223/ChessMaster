/* Can I BEAT Leela Piece Odds: Leela (Stockfish at 3000 here) missing pieces by level 1/2/9/12/14. Sources: research/modes/DStCmEElxW0.json. */
CM.mode({
  id: "DStCmEElxW0",
  title: "Can I BEAT Leela Piece Odds?",
  name: "Leela Piece Odds",
  category: "Challenges & Odds",
  description: "Leela gives piece odds: it starts without some of its pieces, and the higher the level the less it gives away. Climb the levels.",
  how_to_win: "Checkmate Leela (draws do not count). The video won levels 1 and 2, stalemated level 9 and lost level 12.",
  player_side: "white",
  player: { name: 'You', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },   /* iwantcheckmate's own avatar (purple king) from the videos */
  opponent: { name: "LeelaPieceOdds", rating: 3000, avatar: "assets/modes/DStCmEElxW0/leela.png", tagline: "lichess bot" },
  board: { files: 8, ranks: 8 },
  theme: { light: "#fefedd", dark: "#89ae67" },
  setup: { fen: "1nb1kbn1/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR" },
  params: {
    levels: [
      {
        label: "Level 1",
        fen: "1nb1kbn1/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR",
        note: "Leela is missing queen + both rooks"
      },
      {
        label: "Level 2",
        fen: "2b1kbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR",
        note: "Leela is missing queen + rook + knight"
      },
      {
        label: "Level 9",
        fen: "2bqkb1r/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR",
        note: "Leela is missing both knights + a rook"
      },
      {
        label: "Level 12",
        fen: "2bqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR",
        note: "Leela is missing a rook + a knight"
      },
      {
        label: "Level 14",
        fen: "r1bqkb1r/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR",
        note: "Leela is missing both knights"
      }
    ],
    advance: "fail",
    unit: "Level",
    statusPrefix: ""
  },
  hooks: "g3_ladder",
  source: {
    confidence: "medium",
    notes: "Only the levels shown in the video are offered; level 2's exact odds are inferred.",
    research: "research/modes/DStCmEElxW0.json"
  }
});
