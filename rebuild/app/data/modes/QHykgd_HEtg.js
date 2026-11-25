/* 3 Martins vs 1 Move: Martin moves three times for each of your moves; a check ends his turn. Sources: research/modes/QHykgd_HEtg.json, research/frames. Generated for impl group 3. */
CM.mode({
  id: "QHykgd_HEtg",
  title: "3 Martins vs 1 Move",
  name: "3 Moves for Martin",
  category: "Challenges & Odds",
  description: "Martin makes three moves in a row for every one of yours. If he gives check during his sequence, his turn ends at once.",
  how_to_win: "Checkmate Martin (the video lost after 17 minutes).",
  player_side: "white",
  opponent: {
    "name": "Martin",
    "rating": 250,
    "avatar": "assets/avatars/bot.svg",
    "tagline": "chess.com beginner bot (250)"
  },
  board: {
    "files": 8,
    "ranks": 8
  },
  theme: {
    "light": "#eaedd0",
    "dark": "#749d54"
  },
  setup: {
    "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR"
  },
  rules: {
    "movesPerTurn": {
      "b": 3
    }
  },
  todo_pass2: [
    "orange arrows for Martin's three-move chains",
    "three-Martin-heads mode image"
  ],
  source: {
    "confidence": "high",
    "notes": "The video simulated the triple moves by resetting the board; here Martin simply moves three times.",
    "research": "research/modes/QHykgd_HEtg.json"
  }
});
