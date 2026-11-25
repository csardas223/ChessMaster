/* 1 Nuke vs. 1 Queen: your queen is a Nuke (queen + nightrider) vs Fairy-Stockfish. Sources: research/modes/5m6UP0ghvdA.json, research/frames. Generated for impl group 3. */
CM.mode({
  id: "5m6UP0ghvdA",
  title: "1 Nuke vs. 1 Queen",
  name: "Nuke vs Queen",
  category: "Challenges & Odds",
  description: "Full armies, but your queen is a Nuke: it moves like a queen and like a knight repeated any distance in one line (a nightrider; every landing square on the way must be empty). It can jump to f5 on move one.",
  how_to_win: "Checkmate Fairy-Stockfish (the video wins with a ladder mate).",
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
    "light": "#dee5e7",
    "dark": "#8ca4aa"
  },
  pieces: {
    "Nuke": {
      "name": "Nuke",
      "moves": "QNN",
      "value": 1500,
      "img": {
        "w": "assets/modes/5m6UP0ghvdA/nuke_w.svg",
        "b": "assets/modes/5m6UP0ghvdA/nuke_b.svg"
      }
    }
  },
  setup: {
    "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNB[Nuke]KBNR"
  },
  todo_pass2: [
    "green arrow annotations (optional)"
  ],
  source: {
    "confidence": "high",
    "notes": "Nuke art is original (white missile). Blue-grey board from the video.",
    "research": "research/modes/5m6UP0ghvdA.json"
  }
});
