/* How Many Queens to BEAT A Chess YouTuber? (feat. Croissant): king + N queens vs Croissant's full army, one more queen after each loss. Sources: research/modes/lX407_vwgaA.json, research/frames. Generated for impl group 3. */
CM.mode({
  id: "lX407_vwgaA",
  title: "How Many Queens to BEAT A Chess YouTuber? (feat. Croissant)",
  name: "Queens vs Croissant",
  category: "Challenges & Odds",
  description: "You have only your king and some queens (no pawns) against Croissant's full army. Start with one queen; after each loss you get one more. The video needed four.",
  how_to_win: "Checkmate Croissant.",
  player_side: "white",
  opponent: {
    "name": "Croissant",
    "rating": 2000,
    "avatar": "assets/modes/lX407_vwgaA/croissant.svg",
    "tagline": "chess YouTuber \"croissant dealer\""
  },
  board: {
    "files": 8,
    "ranks": 8
  },
  theme: {
    "light": "#e9ebd1",
    "dark": "#7c9c5a"
  },
  setup: {
    "fen": "rnbqkbnr/pppppppp/8/8/8/8/8/3QK3"
  },
  params: {
    "levels": [
      {
        "label": "1 Queen",
        "fen": "rnbqkbnr/pppppppp/8/8/8/8/8/3QK3"
      },
      {
        "label": "2 Queens",
        "fen": "rnbqkbnr/pppppppp/8/8/8/8/8/2QQK3"
      },
      {
        "label": "3 Queens",
        "fen": "rnbqkbnr/pppppppp/8/8/8/8/8/2QQKQ2"
      },
      {
        "label": "4 Queens",
        "fen": "rnbqkbnr/pppppppp/8/8/8/8/8/1QQQKQ2"
      }
    ],
    "advance": "fail",
    "unit": "Queens",
    "pickerLabel": "Queens",
    "winText": "You beat the YouTuber!"
  },
  hooks: "g3_ladder",
  todo_pass2: [
    "Croissant POV caption panel",
    "\"You Won!\" game review popup styling"
  ],
  source: {
    "confidence": "medium",
    "notes": "Croissant is a human; his strength (2000) and the extra queens' squares are inferred. Avatar is an original croissant cartoon, not the person.",
    "research": "research/modes/lX407_vwgaA.json"
  }
});
