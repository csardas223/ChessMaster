/* 1 Move vs 5 Moves: Martin makes five moves for each of yours. Sources: research/modes/lfxkP2cWADg.json, research/frames. Generated for impl group 3. */
CM.mode({
  id: "lfxkP2cWADg",
  title: "1 Move vs 5 Moves",
  name: "5 Moves for Martin",
  category: "Challenges & Odds",
  description: "Martin gets five moves in a row for every one of yours. A check ends his sequence early.",
  how_to_win: "Checkmate Martin (the video ended in a threefold-repetition draw).",
  player_side: "white",
  opponent: {
    "name": "Martin",
    "rating": 250,
    "avatar": "assets/modes/XuvZCCFk42k/martin.png",
    "tagline": "chess.com beginner bot (250)"
  },
  board: {
    "files": 8,
    "ranks": 8
  },
  theme: {
    "light": "#eaedd0",
    "dark": "#759e55"
  },
  setup: {
    "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR"
  },
  rules: {
    "movesPerTurn": {
      "b": 5
    }
  },
  vfx_timeline: [{ trigger: "bot_move", effect: { type: "arrow", color: "rgba(255,170,0,.8)", duration_ms: 1400 } }],
  source: {
    "confidence": "medium",
    "notes": "The video simulated this with four wasted moves; whether a check ends Martin's run is not stated, the engine ends it (inferred from the video having to answer checks).",
    "research": "research/modes/lfxkP2cWADg.json"
  }
});
