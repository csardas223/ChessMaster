/* 2 Moves vs 1 Move Against Stockfish: a king-capture variant where you move twice for every Stockfish move. Sources: research/modes/wD9UssXbCqA.json, research/frames. Generated for impl group 3. */
CM.mode({
  id: "wD9UssXbCqA",
  title: "2 Moves vs 1 Move Against Stockfish",
  name: "2 Moves, King Capture",
  category: "Challenges & Odds",
  description: "On a viewer-made engine site: you make two moves, then Stockfish makes one (turn order white, white, black). There is no check - you win by actually capturing the king, so double threats like Qf3 then Qxf7 are deadly.",
  how_to_win: "Capture Stockfish's king.",
  player_side: "white",
  opponent: {
    "name": "Stockfish",
    "rating": 3200,
    "avatar": "assets/modes/wD9UssXbCqA/engine.svg",
    "tagline": "Stockfish on a viewer-built variant site"
  },
  board: {
    "files": 8,
    "ranks": 8
  },
  theme: {
    "light": "#ddcab2",
    "dark": "#805c4b",
    "background": "#1b2340"
  },
  pieces: {
    "K": {
      "royal": false,
      "value": 20000
    }
  },
  setup: {
    "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR"
  },
  rules: {
    "check": "none",
    "movesPerTurn": {
      "w": 2
    },
    "win": [
      {
        "type": "capture",
        "piece": "K",
        "why": "king captured"
      }
    ]
  },
  todo_pass2: [
    "turn-order boxes UI (white, white, black)",
    "bonus game: player Black, 3 moves vs Stockfish 2"
  ],
  source: {
    "confidence": "high",
    "notes": "The bonus games (player as Black, 3 moves vs 2) are not included. Kings are non-royal so a check never cuts your double move short.",
    "research": "research/modes/wD9UssXbCqA.json"
  }
});
