/* 1 Amazon vs. 1 Queen: your queen is an Amazon (queen + knight) vs Fairy-Stockfish's normal queen. Sources: research/modes/nWdjqATRp5k.json, research/frames, transcript (cm-recheck2: 0:07, 0:13, 4:44 draw, 10:05 loss). Generated for impl group 3. */
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
        "w": "assets/img/fairy/amazon_w.png",
        "b": "assets/img/fairy/amazon_b.png"
      }
    }
  },
  setup: {
    "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNB[Amazon]KBNR"
  },
  vfx_timeline: [{ trigger: { on: "move", piece: "N" }, effect: { type: "arrow", color: "rgba(110,190,60,.8)", duration_ms: 1400 } }],
  source: {
    "confidence": "high",
    "notes": "cm-recheck2 2026-11-25: transcript (analyze_video) confirms: 0:07 'I have an Amazon facing off against Stockfish's queen', 0:13 'the Amazon moves like a queen and a knight combined', the player is White (London system, queenside castling); game 1 drawn by repetition (4:44), game 2 lost (10:05). The engine is called Stockfish in the video; the Fairy-Stockfish name/avatar comes from the frames. Crowned-knight art copied from the video.",
    "research": "research/modes/nWdjqATRp5k.json"
  }
});
