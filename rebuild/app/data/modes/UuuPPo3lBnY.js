/* 1 Nuke vs 100 Pawns: king + Nuke (queen + knight) vs Martin's king and a 5x20 brick of pawns. Sources: research/modes/UuuPPo3lBnY.json, research/frames. Generated for impl group 3. */
CM.mode({
  id: "UuuPPo3lBnY",
  title: "1 Nuke vs 100 Pawns",
  name: "Nuke vs 100 Pawns",
  category: "Challenges & Odds",
  description: "A 20x10 board. Martin has a king behind a solid brick of 100 pawns, five ranks deep. You have a king and a Nuke, which moves like every piece combined (queen + knight). Snipe pawns before one promotes.",
  how_to_win: "Checkmate Martin.",
  player_side: "white",
  opponent: {
    "name": "Martin",
    "rating": 250,
    "avatar": "assets/avatars/bot.svg",
    "tagline": "chess.com beginner bot (250)"
  },
  board: {
    "files": 20,
    "ranks": 10,
    "viewport": {
      "files": 20,
      "ranks": 10,
      "mobile": {
        "files": 10,
        "ranks": 10
      }
    }
  },
  theme: {
    "light": "#ebf4d0",
    "dark": "#7b9c59"
  },
  pieces: {
    "Nuke": {
      "name": "Nuke",
      "moves": "QN",
      "value": 1250,
      "img": {
        "w": "assets/modes/UuuPPo3lBnY/nuke_w.svg",
        "b": "assets/modes/UuuPPo3lBnY/nuke_b.svg"
      }
    }
  },
  setup: {
    "fen": "9k10/pppppppppppppppppppp/pppppppppppppppppppp/pppppppppppppppppppp/pppppppppppppppppppp/pppppppppppppppppppp/20/20/20/9K5[Nuke]4"
  },
  bot: {
    "depth": 2,
    "time_ms": 600
  },
  params: {
    "g3": [
      "camera"
    ]
  },
  hooks: "g3_odds",
  todo_pass2: [
    "nuke range dots VFX"
  ],
  source: {
    "confidence": "medium",
    "notes": "This video's nuke is queen + knight (its transcript says every piece combined); the later 12x10 video uses queen + nightrider. Start squares inferred from frames.",
    "research": "research/modes/UuuPPo3lBnY.json"
  }
});
