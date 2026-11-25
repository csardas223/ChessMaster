/* Can I BEAT Drawback Chess?: Drawback Chess (king capture, one drawback per side, shared hooks js/modes/g2_drawback.js). Sources: research/modes/rbfC90ZzPW8.json */
CM.mode({
  "id": "rbfC90ZzPW8",
  "title": "Can I BEAT Drawback Chess?",
  "name": "Beat Drawback Chess",
  "category": "Drawback Chess",
  "description": "Drawback Chess: each side is dealt a secret handicap. There is no check or checkmate: capture the king to win. You can see your own drawback on the card; your opponent's drawback is revealed when the game ends. Breaking a \"you lose if\" drawback, or having no move it allows, loses.",
  "how_to_win": "Capture the enemy king (or make them run out of moves their drawback allows). The video goal: 3 wins.",
  "player_side": "white",
  "player": {
    "name": "You",
    "rating": null,
    "avatar": "assets/avatars/you.svg"
  },
  "opponent": {
    "name": "hasty brown seal",
    "rating": null,
    "avatar": "assets/avatars/bot.svg",
    "tagline": "Anonymous player on the Drawback Chess site"
  },
  "board": {
    "files": 8,
    "ranks": 8,
    "light": "#eddbb7",
    "dark": "#b08467"
  },
  "theme": {
    "background": "#2f2d55"
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
        "you": "stage_fright",
        "opp": "secret_garden"
      },
      {
        "you": "bongcloud",
        "opp": "no_knight_captures"
      },
      {
        "you": "pacman",
        "opp": "diplomatic_immunity"
      },
      {
        "you": "lame_duck",
        "opp": "femme_fatale"
      }
    ],
    "opp_names": [
      "hasty brown seal",
      "noble lime ant"
    ],
    "view": "see",
    "goal": 3
  },
  "messages": {
    "win_title": "You Won!",
    "loss_title": "You Lost"
  },
  "hooks": "g2_drawback",
  "source": {
    "research": "research/modes/rbfC90ZzPW8.json",
    "confidence": "high",
    "notes": "The first Drawback Chess video. \"Can't take knights\" drawback name not shown (labelled Horse Lover)."
  }
});
