/* 1 Nuke vs 100 Pawns (12x10): king + Nuke boxed in by Martin's pawn sea, two pawns already threatening promotion. Sources: research/modes/Yp7AnbFcgHI.json, research/frames. Generated for impl group 3. */
CM.mode({
  id: "Yp7AnbFcgHI",
  title: "1 Nuke vs 100 Pawns",
  name: "Nuke Boxed In",
  category: "Challenges & Odds",
  description: "A 12x10 blue-grey board almost full of Martin's pawns. Your king and Nuke (queen + nightrider) start fenced into the bottom-left corner while two black pawns stand one step from promoting.",
  how_to_win: "Survive the promotions and checkmate Martin.",
  player_side: "white",
  opponent: {
    "name": "Martin",
    "rating": 250,
    "avatar": "assets/avatars/bot.svg",
    "tagline": "chess.com beginner bot (250)"
  },
  board: {
    "files": 12,
    "ranks": 10
  },
  theme: {
    "light": "#dee5e7",
    "dark": "#8a9fa2"
  },
  pieces: {
    "Nuke": {
      "name": "Nuke",
      "moves": "QNN",
      "value": 1500,
      "img": {
        "w": "assets/modes/Yp7AnbFcgHI/nuke_w.png",
        "b": "assets/modes/Yp7AnbFcgHI/nuke_b.png"
      }
    }
  },
  setup: {
    "fen": "pppppkpppppp/pppppppppppp/pppppppppppp/pppppppppppp/pppppppppppp/pppppppppppp/pppppppppppp/3ppppppppp/1[Nuke]4p2p2/K11"
  },
  bot: {
    "depth": 2,
    "time_ms": 600
  },
  source: {
    "confidence": "medium",
    "notes": "Exact pawn layout is visual-only; rebuilt as 94 pawns with the box at a1-c3 and promotion threats on g2 and j2 (inferred).",
    "research": "research/modes/Yp7AnbFcgHI.json"
  }
});
