/* 1 Knight vs 100 Pawns: king + knight vs Martin's king and 100 pawns on a 20x10 board. Sources: research/modes/R2e56aLNWR4.json, research/frames. Generated for impl group 3. */
CM.mode({
  id: "R2e56aLNWR4",
  title: "1 Knight vs 100 Pawns",
  name: "Knight vs 100 Pawns",
  category: "Challenges & Odds",
  description: "A wide 20x10 board. Martin has his king and a block of 100 pawns (five full ranks); you have a king and one knight. Pawns move and promote normally.",
  how_to_win: "Checkmate Martin, usually by trapping his king inside his own pawns.",
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
    "light": "#eaf6d2",
    "dark": "#7ea25a"
  },
  setup: {
    "fen": "9k10/pppppppppppppppppppp/pppppppppppppppppppp/pppppppppppppppppppp/pppppppppppppppppppp/pppppppppppppppppppp/20/20/20/9KN9"
  },
  bot: {
    "depth": 2,
    "time_ms": 600
  },
  params: {
    "g3": [
      "camera"
    , "rangedots"]
  },
  hooks: "g3_odds",
  source: {
    "confidence": "medium",
    "notes": "Board size 20x10 and the five-rank pawn block from frame counts; start squares of the kings and knight inferred.",
    "research": "research/modes/R2e56aLNWR4.json"
  }
});
