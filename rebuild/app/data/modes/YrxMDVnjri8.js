/* 1 Nuke vs 250,000 Pawns: king + Nuke vs a giant field of Martin's pawns on every other square, his king hidden at the top. Sources: research/modes/YrxMDVnjri8.json, research/frames. Generated for impl group 3. */
CM.mode({
  id: "YrxMDVnjri8",
  title: "1 Nuke vs 250,000 Pawns",
  name: "Nuke vs a Pawn Ocean",
  category: "Challenges & Odds",
  description: "The video uses a 1000x1000 board with 250,000 pawns. This remake uses the largest board the app supports, 32x32, with Martin's pawns on every other square (464 pawns) and his king alone on the top rank. Your Nuke moves like a queen or a nightrider.",
  how_to_win: "Fight your way up the board and checkmate Martin's king.",
  player_side: "white",
  opponent: {
    "name": "Martin",
    "rating": 250,
    "avatar": "assets/avatars/bot.svg",
    "tagline": "chess.com beginner bot (250)"
  },
  board: {
    "files": 32,
    "ranks": 32,
    "viewport": {
      "files": 16,
      "ranks": 12,
      "mobile": {
        "files": 9,
        "ranks": 10
      }
    }
  },
  theme: {
    "light": "#ebf4d0",
    "dark": "#7c9b5a"
  },
  pieces: {
    "Nuke": {
      "name": "Nuke",
      "moves": "QNN",
      "value": 1500,
      "img": {
        "w": "assets/modes/YrxMDVnjri8/nuke_w.png",
        "b": "assets/modes/YrxMDVnjri8/nuke_b.png"
      }
    }
  },
  setup: {
    "fen": "15k16/1p1p1p1p1p1p1p1p1p1p1p1p1p1p1p1p/p1p1p1p1p1p1p1p1p1p1p1p1p1p1p1p1/1p1p1p1p1p1p1p1p1p1p1p1p1p1p1p1p/p1p1p1p1p1p1p1p1p1p1p1p1p1p1p1p1/1p1p1p1p1p1p1p1p1p1p1p1p1p1p1p1p/p1p1p1p1p1p1p1p1p1p1p1p1p1p1p1p1/1p1p1p1p1p1p1p1p1p1p1p1p1p1p1p1p/p1p1p1p1p1p1p1p1p1p1p1p1p1p1p1p1/1p1p1p1p1p1p1p1p1p1p1p1p1p1p1p1p/p1p1p1p1p1p1p1p1p1p1p1p1p1p1p1p1/1p1p1p1p1p1p1p1p1p1p1p1p1p1p1p1p/p1p1p1p1p1p1p1p1p1p1p1p1p1p1p1p1/1p1p1p1p1p1p1p1p1p1p1p1p1p1p1p1p/p1p1p1p1p1p1p1p1p1p1p1p1p1p1p1p1/1p1p1p1p1p1p1p1p1p1p1p1p1p1p1p1p/p1p1p1p1p1p1p1p1p1p1p1p1p1p1p1p1/1p1p1p1p1p1p1p1p1p1p1p1p1p1p1p1p/p1p1p1p1p1p1p1p1p1p1p1p1p1p1p1p1/1p1p1p1p1p1p1p1p1p1p1p1p1p1p1p1p/p1p1p1p1p1p1p1p1p1p1p1p1p1p1p1p1/1p1p1p1p1p1p1p1p1p1p1p1p1p1p1p1p/p1p1p1p1p1p1p1p1p1p1p1p1p1p1p1p1/1p1p1p1p1p1p1p1p1p1p1p1p1p1p1p1p/p1p1p1p1p1p1p1p1p1p1p1p1p1p1p1p1/1p1p1p1p1p1p1p1p1p1p1p1p1p1p1p1p/p1p1p1p1p1p1p1p1p1p1p1p1p1p1p1p1/1p1p1p1p1p1p1p1p1p1p1p1p1p1p1p1p/p1p1p1p1p1p1p1p1p1p1p1p1p1p1p1p1/1p1p1p1p1p1p1p1p1p1p1p1p1p1p1p1p/32/15K[Nuke]15"
  },
  bot: {
    "depth": 1,
    "time_ms": 500
  },
  params: {
    "g3": [
      "camera", "intro"
    ],
    intro: { caption: "1,000 x 1,000 squares... scaled to 32 x 32", hold_ms: 900 }
  },
  hooks: "g3_odds",
  vfx_timeline: [{ trigger: { on: "move", piece: "Nuke" }, effect: { type: "arrow", color: "rgba(150,60,220,.75)", duration_ms: 1500, width: 0.18 } }],
  source: {
    "confidence": "medium",
    "notes": "Scaled down from 1000x1000 (engine maximum is 32x32); same checkerboard pawn pattern and king at the top.",
    "research": "research/modes/YrxMDVnjri8.json"
  }
});
