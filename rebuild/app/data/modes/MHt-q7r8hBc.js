/* Drawback Chess, But YOU Don't Know MY Drawback: Drawback Chess (king capture, one drawback per side, shared hooks js/modes/g2_drawback.js). Sources: research/modes/MHt-q7r8hBc.json */
CM.mode({
  "id": "MHt-q7r8hBc",
  "title": "Drawback Chess, But YOU Don't Know MY Drawback",
  "name": "Drawback Chess: You Don't Know Mine",
  "category": "Drawback Chess",
  "description": "Drawback Chess: each side is dealt a secret handicap. There is no check or checkmate: capture the king to win. Your drawback is shown for two seconds, then hidden; your opponent's drawback is revealed when the game ends. Breaking a \"you lose if\" drawback, or having no move it allows, loses.",
  "how_to_win": "Capture the enemy king (or make them run out of moves their drawback allows).",
  "player_side": "black",
  "player": {
    "name": "You",
    "rating": null,
    "avatar": "assets/avatars/you.svg"
  },
  "opponent": {
    "name": "Jolyne Kujo",
    "rating": null,
    "avatar": "assets/avatars/bot.svg",
    "tagline": "Anonymous player on the Drawback Chess site"
  },
  "board": {
    "files": 8,
    "ranks": 8,
    "light": "#eadeba",
    "dark": "#ae7e66"
  },
  "theme": {
    "background": "#2a2238"
  },
  "setup": {
    "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR"
  },
  "rules": {
    "check": "none",
    "castling": true,
    "enPassant": true,
    "promotion": {
      "choices": [
        "Q",
        "N",
        "R",
        "B"
      ]
    },
    "stalemate": "loss"
  },
  "bot": {
    "engine": "search",
    "depth": 3,
    "time_ms": 650
  },
  "params": {
    "games": [
      {
        "you": "devil",
        "opp": "religious_dispute",
        "side": "b"
      },
      {
        "you": "stop_stalling",
        "opp": "cheerleaders",
        "side": "w"
      },
      {
        "you": "shapeshifter",
        "opp": "cowardly"
      }
    ],
    "opp_names": [
      "Jolyne Kujo",
      "lazy indigo dolphin"
    ],
    "view": "flash"
  },
  "messages": {
    "win_title": "You Won!",
    "loss_title": "You Lost"
  },
  "hooks": "g2_drawback",
  "source": {
    "research": "research/modes/MHt-q7r8hBc.json",
    "confidence": "medium",
    "notes": "Own drawback is shown for 2 s then hidden (as in the video). Later pairings inferred."
  }
});
