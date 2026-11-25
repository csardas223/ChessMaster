/* 1 Amazon vs. 1 Queen: your queen is an Amazon (queen + knight) vs Fairy-Stockfish's normal queen. Sources: research/modes/nWdjqATRp5k.json, research/frames. Generated for impl group 3. */
CM.mode({
  id: "nWdjqATRp5k",
  title: "1 Amazon vs. 1 Queen",
  name: "Amazon vs Queen",
  category: "Challenges & Odds",
  description: "Standard armies, but your queen is an Amazon: it moves like a queen or a knight.",
  how_to_win: "Checkmate Fairy-Stockfish.",
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
    "light": "#fefedd",
    "dark": "#89ae67"
  },
  pieces: {
    "Amazon": {
      "name": "Amazon",
      "moves": "QN",
      "value": 1250,
      "img": {
        "w": "assets/modes/nWdjqATRp5k/amazon_w.svg",
        "b": "assets/modes/nWdjqATRp5k/amazon_b.svg"
      }
    }
  },
  setup: {
    "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNB[Amazon]KBNR"
  },
  todo_pass2: [
    "re-run transcript (404) to confirm which side holds the amazon",
    "green knight-shaped arrows"
  ],
  source: {
    "confidence": "low",
    "notes": "Transcript unavailable (404). The player holding the amazon is inferred from the frame. Crowned-knight art is original.",
    "research": "research/modes/nWdjqATRp5k.json"
  }
});
