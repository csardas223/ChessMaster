/* 1 Transforming Piece vs Martin: king + one piece that cycles pawn -> knight -> bishop -> rook -> queen -> pawn each time it moves. Sources: research/modes/A7gdM2GD1b0.json, research/frames. Generated for impl group 3. */
CM.mode({
  id: "A7gdM2GD1b0",
  title: "1 Transforming Piece vs Martin",
  name: "Transforming Piece",
  category: "Challenges & Odds",
  description: "You have a king and one glitchy piece that starts as a pawn on e2. Every time it moves it turns into the next piece: pawn, knight, bishop, rook, queen, then pawn again. Moving your king pauses the cycle. In pawn form it may stand on the back rank and never promotes.",
  how_to_win: "Checkmate Martin.",
  player_side: "white",
  player: { name: 'You', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },   /* iwantcheckmate's own avatar (purple king) from the videos */
  opponent: {
    "name": "Martin",
    "rating": 250,
    "avatar": "assets/modes/XuvZCCFk42k/martin.png",
    "tagline": "chess.com beginner bot (250)"
  },
  board: {
    "files": 8,
    "ranks": 8
  },
  theme: {
    "light": "#ecf2d1",
    "dark": "#7a9f58"
  },
  pieces: {
    "TP": {
      "name": "Transformer (pawn)",
      "moves": "fmWfcFifmnD",
      "value": 250,
      "img": "assets/modes/A7gdM2GD1b0/transformer.png", "glyph": "P", "badge": "P"
    },
    "TN": {
      "name": "Transformer (knight)",
      "moves": "N",
      "value": 500,
      "img": "assets/modes/A7gdM2GD1b0/transformer.png", "glyph": "N", "badge": "N"
    },
    "TB": {
      "name": "Transformer (bishop)",
      "moves": "B",
      "value": 550,
      "img": "assets/modes/A7gdM2GD1b0/transformer.png", "glyph": "B", "badge": "B"
    },
    "TR": {
      "name": "Transformer (rook)",
      "moves": "R",
      "value": 650,
      "img": "assets/modes/A7gdM2GD1b0/transformer.png", "glyph": "R", "badge": "R"
    },
    "TQ": {
      "name": "Transformer (queen)",
      "moves": "Q",
      "value": 800,
      "img": "assets/modes/A7gdM2GD1b0/transformer.png", "glyph": "Q", "badge": "Q"
    }
  },
  setup: {
    "fen": "rnbqkbnr/pppppppp/8/8/8/8/4[TP]3/4K3"
  },
  params: {
    "g3": [
      "transform"
    ],
    "cycle": [
      "TP",
      "TN",
      "TB",
      "TR",
      "TQ"
    ]
  },
  hooks: "g3_odds",
  source: {
    "confidence": "high",
    "notes": "Transformer art = the pixel-glitch piece from the video (research/frames/sprites), badge shows its current type. Values are averages over the cycle (inferred).",
    "research": "research/modes/A7gdM2GD1b0.json"
  }
});
