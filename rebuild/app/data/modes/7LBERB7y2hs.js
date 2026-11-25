/* 1 Bazooka vs 1 Granny: your queen is a Bazooka (queen + nightrider + camel) vs the 2900 Grandma bot. Sources: research/modes/7LBERB7y2hs.json, research/frames. Generated for impl group 3. */
CM.mode({
  id: "7LBERB7y2hs",
  title: "1 Bazooka vs 1 Granny",
  name: "Bazooka vs Granny",
  category: "Challenges & Odds",
  description: "Your queen is replaced by a Bazooka: queen moves, plus repeated knight leaps in a line (nightrider), plus the camel's (3,1) leap. From the start position it already has a mate in one; the video plays 1.d4 instead to give Granny a chance.",
  how_to_win: "Checkmate Grandma (2900).",
  player_side: "white",
  opponent: {
    "name": "Grandma",
    "rating": 2900,
    "avatar": "assets/modes/7LBERB7y2hs/grandma.svg",
    "tagline": "chess.com grandmother bot (2900)"
  },
  board: {
    "files": 8,
    "ranks": 8
  },
  theme: {
    "light": "#fdfddd",
    "dark": "#89ae69"
  },
  pieces: {
    "Bazooka": {
      "name": "Bazooka",
      "moves": "QNNC",
      "value": 1700,
      "img": {
        "w": "assets/modes/7LBERB7y2hs/bazooka_w.svg",
        "b": "assets/modes/7LBERB7y2hs/bazooka_b.svg"
      }
    }
  },
  setup: {
    "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNB[Bazooka]KBNR"
  },
  todo_pass2: [
    "purple bazooka range dots VFX"
  ],
  source: {
    "confidence": "high",
    "notes": "Grandma avatar and bazooka art are original drawings.",
    "research": "research/modes/7LBERB7y2hs.json"
  }
});
