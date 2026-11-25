/* Can I UNSEE Drawback Chess?: Drawback Chess (king capture, one drawback per side, shared hooks js/modes/g2_drawback.js). Sources: research/modes/ul-ZFraZdkc.json */
CM.mode({
  "id": "ul-ZFraZdkc",
  "title": "Can I UNSEE Drawback Chess?",
  "name": "Unsee Drawback Chess",
  "category": "Drawback Chess",
  "description": "Drawback Chess: each side is dealt a secret handicap. There is no check or checkmate: capture the king to win. You can see your own drawback on the card; your opponent's drawback is revealed when the game ends. Breaking a \"you lose if\" drawback, or having no move it allows, loses.",
  "how_to_win": "Capture the enemy king (or make them run out of moves their drawback allows).",
  "player_side": "white",
  "player": {
    "name": "You",
    "rating": null,
    "avatar": "assets/avatars/you.svg"
  },
  "opponent": {
    "name": "Porkburger",
    "rating": null,
    "avatar": "assets/avatars/bot.svg",
    "tagline": "Anonymous player on the Drawback Chess site"
  },
  "board": {
    "files": 8,
    "ranks": 8,
    "light": "#f0d9b5",
    "dark": "#b58863"
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
        "you": "triple_play_bishops"
      }
    ],
    "opp_names": [
      "Porkburger"
    ],
    "view": "see"
  },
  "messages": {
    "win_title": "You Won!",
    "loss_title": "You Lost"
  },
  "hooks": "g2_drawback",
  "todo_pass2": [
    "original anonymous-player avatars (Drawback site style animal names)",
    "drawback card art polish (card overlay is generic HTML)"
  ],
  "source": {
    "research": "research/modes/ul-ZFraZdkc.json",
    "confidence": "medium",
    "notes": "Only Triple Play (three bishops) is readable."
  }
});
