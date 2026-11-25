/* Stockfish vs Infinite Pawns: king + 1 pawn vs Stockfish, and you gain a pawn to place every turn (two modes). Sources: research/modes/D8rD3rTwgjc.json, research/frames. Generated for impl group 3. */
CM.mode({
  id: "D8rD3rTwgjc",
  title: "Stockfish vs ∞ Pawns",
  name: "Infinite Pawns vs Stockfish",
  category: "Challenges & Odds",
  description: "You start with a king and one pawn. Game 1 (\"and\"): every turn you make a move AND then place a new pawn on any empty square. Game 2 (\"either or\"): every turn you either move OR tap an empty square to place a pawn. A pawn placed on the last rank promotes at once.",
  how_to_win: "Checkmate Stockfish (the video wins both modes).",
  player_side: "white",
  opponent: {
    "name": "Stockfish",
    "rating": 3600,
    "avatar": "assets/avatars/stockfish.svg",
    "tagline": "Stockfish at full strength"
  },
  board: {
    "files": 8,
    "ranks": 8
  },
  theme: {
    "light": "#eadeba",
    "dark": "#ba8a72"
  },
  setup: {
    "fen": "rnbqkbnr/pppppppp/8/8/8/8/4P3/4K3",
    "x": {
      "mode": "and"
    }
  },
  params: {
    "g3": [
      "ladder",
      "spawn"
    , "ghost", "drawkings"],
    "sf": true,
    "spawn": {
      "noRanks": [
        1
      ],
      "promote": true
    },
    "levels": [
      {
        "label": "Move and place",
        "x": {
          "mode": "and"
        },
        "note": "Move, then place a pawn"
      },
      {
        "label": "Move or place",
        "x": {
          "mode": "or"
        },
        "note": "Move a piece OR tap an empty square"
      }
    ],
    "advance": "any",
    "pickerLabel": "Mode"
  },
  hooks: "g3_odds",
  vfx_timeline: [{ trigger: "win", effect: { type: "particles", kind: "confetti", count: 60 } }],
  source: {
    "confidence": "high",
    "notes": "Rules from the official site (iwantcheckmate.com/challenges/infinite-pawns). Placing on rank 1 is disabled here (the site allows it) so Stockfish always gets a valid position. Red flash on the placed square from the video frames.",
    "research": "research/modes/D8rD3rTwgjc.json"
  }
});
