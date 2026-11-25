/* 1 Queen vs 1 Impostor: your queen is an Among-Us-style Impostor that can teleport to a secret vent. Sources: research/modes/vzNwF2BH8jg.json, research/frames. Generated for impl group 3. */
CM.mode({
  id: "vzNwF2BH8jg",
  title: "1 Queen vs 1 Impostor",
  name: "Impostor vs Stockfish",
  category: "Challenges & Odds",
  description: "Your queen is an Impostor: it moves like a queen, and as its whole move it can teleport from anywhere to your secret vent, capturing whatever enemy stands there. Before the game you pick the vent square on your half of the board (the video used g4). Fairy-Stockfish does not know where the vent is.",
  how_to_win: "Checkmate Fairy-Stockfish (the video lost to Bc3#).",
  player_side: "white",
  opponent: {
    "name": "Fairy-Stockfish",
    "rating": 3000,
    "avatar": "assets/avatars/stockfish.svg",
    "tagline": "Fairy Stockfish (3000+), the variant engine"
  },
  board: {
    "files": 8,
    "ranks": 8
  },
  theme: {
    "light": "#feffdd",
    "dark": "#89af67"
  },
  pieces: {
    "Imp": {
      "name": "Impostor",
      "moves": "",
      "gen": "impostor",
      "value": 1000,
      "img": {
        "w": "assets/modes/vzNwF2BH8jg/impostor_w.png",
        "b": "assets/modes/vzNwF2BH8jg/impostor_b.svg"
      }
    }
  },
  setup: {
    "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNB[Imp]KBNR"
  },
  params: {
    killSound: "kill",
    "g3": [
      "vent"
    ],
    "ventRows": 4
  },
  hooks: "g3_odds",
  sounds: { kill: "assets/modes/vzNwF2BH8jg/kill.wav" },
  source: {
    "confidence": "high",
    "notes": "Hidden information: the bot's search never sees vent moves. Crewmate and vent art are original drawings.",
    "research": "research/modes/vzNwF2BH8jg.json"
  }
});
