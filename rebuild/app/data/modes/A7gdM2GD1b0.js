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
      "img": { "w": "assets/modes/A7gdM2GD1b0/tp_w.svg", "b": "assets/modes/A7gdM2GD1b0/tp_b.svg" }
    },
    "TN": {
      "name": "Transformer (knight)",
      "moves": "N",
      "value": 500,
      "img": { "w": "assets/modes/A7gdM2GD1b0/tn_w.svg", "b": "assets/modes/A7gdM2GD1b0/tn_b.svg" }
    },
    "TB": {
      "name": "Transformer (bishop)",
      "moves": "B",
      "value": 550,
      "img": { "w": "assets/modes/A7gdM2GD1b0/tb_w.svg", "b": "assets/modes/A7gdM2GD1b0/tb_b.svg" }
    },
    "TR": {
      "name": "Transformer (rook)",
      "moves": "R",
      "value": 650,
      "img": { "w": "assets/modes/A7gdM2GD1b0/tr_w.svg", "b": "assets/modes/A7gdM2GD1b0/tr_b.svg" }
    },
    "TQ": {
      "name": "Transformer (queen)",
      "moves": "Q",
      "value": 800,
      "img": { "w": "assets/modes/A7gdM2GD1b0/tq_w.svg", "b": "assets/modes/A7gdM2GD1b0/tq_b.svg" }
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
    "notes": "Glitch look = original pixel-art SVGs with a magenta/cyan split (no video sprite). Values are averages over the cycle (inferred).",
    "research": "research/modes/A7gdM2GD1b0.json"
  }
});
