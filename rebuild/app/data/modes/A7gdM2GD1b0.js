/* 1 Transforming Piece vs Martin: king + one piece that cycles pawn -> knight -> bishop -> rook -> queen -> pawn each time it moves. Sources: research/modes/A7gdM2GD1b0.json, research/frames. Generated for impl group 3. */
CM.mode({
  id: "A7gdM2GD1b0",
  title: "1 Transforming Piece vs Martin",
  name: "Transforming Piece",
  category: "Challenges & Odds",
  description: "You have a king and one glitchy piece that starts as a pawn on e2. Every time it moves it turns into the next piece: pawn, knight, bishop, rook, queen, then pawn again. Moving your king pauses the cycle. In pawn form it may stand on the back rank and never promotes.",
  how_to_win: "Checkmate Martin.",
  player_side: "white",
  opponent: {
    "name": "Martin",
    "rating": 250,
    "avatar": "assets/avatars/bot.svg",
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
      "glyph": "P",
      "cls": "g3-glitch"
    },
    "TN": {
      "name": "Transformer (knight)",
      "moves": "N",
      "value": 500,
      "glyph": "N",
      "cls": "g3-glitch"
    },
    "TB": {
      "name": "Transformer (bishop)",
      "moves": "B",
      "value": 550,
      "glyph": "B",
      "cls": "g3-glitch"
    },
    "TR": {
      "name": "Transformer (rook)",
      "moves": "R",
      "value": 650,
      "glyph": "R",
      "cls": "g3-glitch"
    },
    "TQ": {
      "name": "Transformer (queen)",
      "moves": "Q",
      "value": 800,
      "glyph": "Q",
      "cls": "g3-glitch"
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
  todo_pass2: [
    "custom pixel/glitch transforming-piece art (now CSS glitch on standard glyphs)",
    "magenta move-path + glitch morph VFX on transform"
  ],
  source: {
    "confidence": "high",
    "notes": "Glitch look = the standard piece with a magenta/cyan split shadow (original CSS, no video sprite). Values are averages over the cycle (inferred).",
    "research": "research/modes/A7gdM2GD1b0.json"
  }
});
