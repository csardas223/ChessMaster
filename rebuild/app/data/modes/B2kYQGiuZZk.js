/* 2 Moves vs 3200 Engine: you move twice for every engine move; a check with your first move ends your turn. Sources: research/modes/B2kYQGiuZZk.json, research/frames. Generated for impl group 3. */
CM.mode({
  id: "B2kYQGiuZZk",
  title: "2 Moves vs 3200 Engine",
  name: "2 Moves vs Maximum",
  category: "Challenges & Odds",
  description: "You make two moves in a row, then chess.com's Maximum (3200) makes one. If your first move gives check, your turn ends there.",
  how_to_win: "Checkmate the engine.",
  player_side: "white",
  opponent: {
    "name": "Maximum",
    "rating": 3200,
    "avatar": "assets/modes/3Ie8fj1-9TY/komodo.png",
    "tagline": "chess.com engine bot, Komodo at full strength (3200)"
  },
  board: {
    "files": 8,
    "ranks": 8
  },
  theme: {
    "light": "#eeeed2",
    "dark": "#769656"
  },
  setup: {
    "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR"
  },
  rules: {
    "movesPerTurn": {
      "w": 2
    }
  },
  params: {
    g3: ["ladder", "turnorder"],
    levels: [
      { label: "As White", side: "w", movesPerTurn: { w: 2 }, note: "You move twice, Maximum once" },
      { label: "As Black", side: "b", movesPerTurn: { b: 2 }, note: "Now as Black: Maximum moves first, then you move twice" }
    ],
    advance: "win", pickerLabel: "Game",
    winText: "Both games beaten, like the video!", endText: "Maximum wins this one. Press New game to retry."
  },
  hooks: "g3_odds",
  vfx_timeline: [{ trigger: "bot_move", effect: { type: "arrow", color: "rgba(255,170,0,.8)", duration_ms: 1400 } }],
  source: {
    "confidence": "high",
    "notes": "Two games as in the video: White with 2 moves per turn, then Black with 2 moves per turn (Game picker in the Mode panel). A check with your first move ends your turn.",
    "research": "research/modes/B2kYQGiuZZk.json"
  }
});
