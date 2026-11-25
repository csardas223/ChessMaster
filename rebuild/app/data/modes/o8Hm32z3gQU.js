/* Can I SILENCE Drawback Chess?: Drawback Chess (king capture, one drawback per side, shared hooks js/modes/g2_drawback.js). Sources: research/modes/o8Hm32z3gQU.json */
CM.mode({
  "id": "o8Hm32z3gQU",
  "title": "Can I SILENCE Drawback Chess?",
  "name": "Silence Drawback Chess",
  "category": "Drawback Chess",
  "description": "Drawback Chess: each side is dealt a secret handicap. There is no check or checkmate: capture the king to win. Your own drawback is hidden from you: moves it forbids are simply refused, so work it out; your opponent's drawback is revealed when the game ends. Breaking a \"you lose if\" drawback, or having no move it allows, loses.",
  "how_to_win": "Capture the enemy king (or make them run out of moves their drawback allows). The video goal: 3 wins.",
  "player_side": "white",
  "player": {
    "name": "You",
    "rating": null,
    "avatar": "assets/avatars/you.svg"
  },
  "opponent": {
    "name": "mellow rose tapir",
    "rating": null,
    "avatar": "assets/avatars/bot.svg",
    "tagline": "Anonymous player on the Drawback Chess site"
  },
  "board": {
    "files": 8,
    "ranks": 8,
    "light": "#eadeba",
    "dark": "#ae8a66"
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
        "you": "cowardly",
        "opp": "pacman"
      },
      {
        "you": "warlord",
        "opp": "devil"
      },
      {
        "you": "devil",
        "opp": "warlord"
      },
      {
        "you": "pacman",
        "opp": "cowardly"
      }
    ],
    "opp_names": [
      "mellow rose tapir",
      "feisty gold squid"
    ],
    "view": "hidden",
    "goal": 3,
    "side": "random"
  },
  "messages": {
    "win_title": "You Won!",
    "loss_title": "You Lost"
  },
  "hooks": "g2_drawback",
  "source": {
    "research": "research/modes/o8Hm32z3gQU.json",
    "confidence": "high",
    "notes": "Own drawback hidden; the devil's suggestion arrow is still drawn, as on the site. Pairings inferred."
  }
});
