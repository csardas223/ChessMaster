/* Can I BEAT Martin with No Captures?: you may never capture; Martin can. Sources: research/modes/vg3CybHYuIc.json, research/frames. Generated for impl group 3. */
CM.mode({
  id: "vg3CybHYuIc",
  title: "Can I BEAT Martin with No Captures?",
  name: "No Captures vs Martin",
  category: "Challenges & Odds",
  description: "Capturing is banned for you for the whole game (en passant too). Martin plays normally and can take whatever he likes, and you can never take back. If only capturing moves are left, you lose.",
  how_to_win: "Checkmate Martin without ever capturing (the video lost all four games).",
  player_side: "white",
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
    "light": "#eaead2",
    "dark": "#72a25a"
  },
  setup: {
    "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR"
  },
  params: {
    "g3": [
      "nocapture"
    ]
  },
  hooks: "g3_odds",
  source: {
    "confidence": "high",
    "notes": "Having only captures left counts as a loss (inferred).",
    "research": "research/modes/vg3CybHYuIc.json"
  }
});
