/* 1 Nuke vs. 1 Dragon: your queen is a Nuke (queen + nightrider), Stockfish's queen is a Dragon (bishop + knight). Sources: research/modes/JW9VnzQocLk.json, research/frames. Generated for impl group 3. */
CM.mode({
  id: "JW9VnzQocLk",
  title: "1 Nuke vs. 1 Dragon",
  name: "Nuke vs Dragon",
  category: "Challenges & Odds",
  description: "Full armies. Your queen is a Nuke: queen moves plus nightrider leaps. Fairy-Stockfish's queen is a Dragon that moves like a bishop or a knight. No explosions; standard rules otherwise.",
  how_to_win: "Checkmate Fairy-Stockfish (game 1 of the video was a stalemate, game 2 a win).",
  player_side: "white",
  opponent: {
    "name": "Fairy-Stockfish",
    "rating": 3600,
    "avatar": "assets/modes/JW9VnzQocLk/stockfish.png",
    "tagline": "Fairy Stockfish at full strength"
  },
  board: {
    "files": 8,
    "ranks": 8
  },
  theme: {
    "light": "#e9d3b0",
    "dark": "#ae8164"
  },
  pieces: {
    "Nuke": {
      "name": "Nuke",
      "moves": "QNN",
      "value": 1500,
      "img": {
        "w": "assets/modes/JW9VnzQocLk/nuke_w.png",
        "b": "assets/modes/JW9VnzQocLk/nuke_b.png"
      }
    },
    "Drake": {
      "name": "Dragon",
      "moves": "BN",
      "value": 850,
      "img": {
        "w": "assets/modes/JW9VnzQocLk/drake_w.png",
        "b": "assets/modes/JW9VnzQocLk/drake_b.png"
      }
    }
  },
  setup: {
    "fen": "rnb[drake]kbnr/pppppppp/8/8/8/8/PPPPPPPP/RNB[Nuke]KBNR"
  },
  source: {
    "confidence": "high",
    "notes": "Board colours from the frames (brown); the thumbnail's purple board is not the game board. Dragon art is the app's existing dragon piece.",
    "research": "research/modes/JW9VnzQocLk.json"
  }
});
