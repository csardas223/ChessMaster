/* Can I BEAT Martin with 1 Move on 2 Boards?: one move, played identically on two boards vs Martin. Sources: research/modes/X1aDgLuvLMU.json, research/frames. Generated for impl group 3. */
CM.mode({
  id: "X1aDgLuvLMU",
  title: "Can I BEAT Martin with 1 Move on 2 Boards?",
  name: "1 Move, 2 Boards",
  category: "Challenges & Odds",
  description: "You are White on two boards against Martin. Every move you make is played on both boards (same from and to squares), so it must be legal on both. Martin replies separately on each board. A board where Martin is mated stops; play goes on on the other.",
  how_to_win: "Checkmate Martin on both boards. Being mated on either board, or having no move legal on both, loses.",
  player_side: "white",
  opponent: {
    "name": "Martin",
    "rating": 250,
    "avatar": "assets/avatars/bot.svg",
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
    ]
  },
  theme: {
    "light": "#e9edcf",
    "dark": "#749d54"
  },
  pieces: {
    "K": {
      "royal": false
    }
  },
  setup: {
    "fen": "rnbqkbnr1rnbqkbnr/pppppppp1pppppppp/17/17/17/17/PPPPPPPP1PPPPPPPP/RNBQKBNR1RNBQKBNR"
  },
  rules: {
    "check": "none",
    "drawPlies": 400
  },
  bot: {
    "depth": 1,
    "time_ms": 500
  },
  params: {
    tbArrows: "rgba(255,170,0,.8)",
    "g3": [
      "twoboards"
    ],
    "twoboards": "same_move"
  },
  hooks: "g3_odds",
  source: {
    "confidence": "high",
    "notes": "Two 8x8 boards drawn as one 17x8 board with an empty file between them. After one board is mated the other continues alone (inferred).",
    "research": "research/modes/X1aDgLuvLMU.json"
  }
});
