/* 1 Amazon vs. 1 Queen: your queen is an Amazon (queen + knight) vs Fairy-Stockfish's normal queen. Sources: research/modes/nWdjqATRp5k.json, research/frames. Generated for impl group 3. */
CM.mode({
  id: "nWdjqATRp5k",
  title: "1 Amazon vs. 1 Queen",
  name: "Amazon vs Queen",
  category: "Challenges & Odds",
  description: "Standard armies, but your queen is an Amazon: it moves like a queen or a knight.",
  how_to_win: "Checkmate Fairy-Stockfish.",
  player_side: "white",
  player: { name: 'You', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },   /* iwantcheckmate's own avatar (purple king) from the videos */
  opponent: {
    "name": "Fairy-Stockfish",
    "rating": 3000,
    "avatar": "assets/modes/mvPXhAMcT7I/fairy_stockfish.png",
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
        "w": "assets/modes/nWdjqATRp5k/amazon_w.png",
        "b": "assets/modes/nWdjqATRp5k/amazon_b.png"
      }
    }
  },
  setup: {
    "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNB[Amazon]KBNR"
  },
  vfx_timeline: [{ trigger: { on: "move", piece: "N" }, effect: { type: "arrow", color: "rgba(110,190,60,.8)", duration_ms: 1400 } }],
  source: {
    "confidence": "low",
    "notes": "Transcript unavailable (404). The player holding the amazon is inferred from the frame. Crowned-knight art copied from the video.",
    "research": "research/modes/nWdjqATRp5k.json"
  }
});
