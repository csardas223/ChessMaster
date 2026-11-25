/* 1 Move vs 2 Martins: two boards vs Martin; every turn you move the same piece type on both boards. Sources: research/modes/KCQ75vB5Jzw.json, research/frames. Generated for impl group 3. */
CM.mode({
  id: "KCQ75vB5Jzw",
  title: "1 Move vs 2 Martins",
  name: "Same Piece, 2 Boards",
  category: "Challenges & Odds",
  description: "You play Martin on two boards at once (left and right). Each turn you move a piece on one board, then a piece of the same type on the other board (squares may differ). Martin answers on both boards. A piece type that cannot move on both boards cannot be chosen.",
  how_to_win: "Checkmate Martin on both boards on the same turn, with the same piece type. Mating only one board fails the challenge.",
  player_side: "white",
  opponent: {
    "name": "Martin",
    "rating": 250,
    "avatar": "assets/modes/XuvZCCFk42k/martin.png",
    "tagline": "Martin on both boards"
  },
  board: {
    "files": 17,
    "ranks": 8,
    "holes": [
      "i1",
      "i2",
      "i3",
      "i4",
      "i5",
      "i6",
      "i7",
      "i8"
    ],
    /* pass 2: phones show one 8x8 board at a time (Board 1/2 toggle; pans to the board of the next move) */
    "viewport": { "files": 17, "ranks": 8, "mobile": { "files": 8, "ranks": 8 } }
  },
  theme: {
    "light": "#eaedd1",
    "dark": "#749e55"
  },
  pieces: {
    "K": {
      "royal": false
    }
  },
  vfx_timeline: [{ trigger: "game_start", once: true, effect: { type: "overlay", image: "assets/modes/KCQ75vB5Jzw/multi_boards.png", at: "board", fit: "contain", opacity: 1, duration_ms: 1800, fade_ms: 300 } }],  /* the video's own art, shown as its intro */
  setup: {
    "fen": "rnbqkbnr1rnbqkbnr/pppppppp1pppppppp/17/17/17/17/PPPPPPPP1PPPPPPPP/RNBQKBNR1RNBQKBNR"
  },
  rules: {
    "check": "none",
    "movesPerTurn": {
      "w": 2
    },
    "drawPlies": 400
  },
  bot: {
    "depth": 1,
    "time_ms": 500
  },
  params: {
    "g3": [
      "twoboards"
    ],
    "twoboards": "same_type"
  },
  hooks: "g3_odds",
  source: {
    "confidence": "medium",
    "notes": "Two 8x8 boards drawn as one 17x8 board with an empty file between them; each board keeps its own check, castling and en passant rules.",
    "research": "research/modes/KCQ75vB5Jzw.json"
  }
});
