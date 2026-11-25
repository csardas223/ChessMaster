/* Drawback Chess, But I Don't Know My Drawback: Drawback Chess (king capture, one drawback per side, shared hooks js/modes/g2_drawback.js). Sources: research/modes/ZOcZ-pkPuYQ.json */
CM.mode({
  "id": "ZOcZ-pkPuYQ",
  "title": "Drawback Chess, But I Don't Know My Drawback",
  "name": "Drawback Chess: I Don't Know My Drawback",
  "category": "Drawback Chess",
  "description": "Drawback Chess: each side is dealt a secret handicap. There is no check or checkmate: capture the king to win. Your own drawback is hidden from you: moves it forbids are simply refused, so work it out; your opponent's drawback is revealed when the game ends. Breaking a \"you lose if\" drawback, or having no move it allows, loses.",
  "how_to_win": "Capture the enemy king (or make them run out of moves their drawback allows). The video goal: 1 win.",
  "player_side": "white",
  "player": {
    "name": "You",
    "rating": null,
    "avatar": "assets/avatars/you.svg"
  },
  "opponent": {
    "name": "clever plum heron",
    "rating": null,
    "avatar": "assets/avatars/bot.svg",
    "tagline": "Anonymous player on the Drawback Chess site"
  },
  "board": {
    "files": 8,
    "ranks": 8,
    "light": "#EDDBB7",
    "dark": "#B08266"
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
        "you": "two_steps_forward",
        "opp": "rook_fan_club",
        "side": "w"
      },
      {
        "you": "eye_for_an_eye",
        "opp": "ivory_tower"
      },
      {
        "you": "true_love",
        "side": "b"
      },
      {
        "side": "w"
      }
    ],
    "opp_names": [
      "clever plum heron",
      "silent sand viper"
    ],
    "view": "hidden",
    "goal": 1
  },
  "messages": {
    "win_title": "You Won!",
    "loss_title": "You Lost"
  },
  "hooks": "g2_drawback",
  "source": {
    "research": "research/modes/ZOcZ-pkPuYQ.json",
    "confidence": "high",
    "notes": "King of the Hill / Body Snatcher / Nurturer texts not shown: game 4 (White, the King of the Hill game) deals random hidden drawbacks (g2 verify pass)."
  }
});
