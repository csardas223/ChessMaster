/* Can I MASTER Drawback Chess?: Drawback Chess (king capture, one drawback per side, shared hooks js/modes/g2_drawback.js). Sources: research/modes/cvMXLpdwWsc.json */
CM.mode({
  "id": "cvMXLpdwWsc",
  "title": "Can I MASTER Drawback Chess?",
  "name": "Master Drawback Chess",
  "category": "Drawback Chess",
  "description": "Drawback Chess: each side is dealt a secret handicap. There is no check or checkmate: capture the king to win. You can see your own drawback on the card; your opponent's drawback is revealed when the game ends. Breaking a \"you lose if\" drawback, or having no move it allows, loses.",
  "how_to_win": "Capture the enemy king (or make them run out of moves their drawback allows). The video goal: 5 wins.",
  "player_side": "white",
  "player": {
    "name": "You",
    "rating": null,
    "avatar": "assets/avatars/you.svg"
  },
  "opponent": {
    "name": "honest gray badger",
    "rating": null,
    "avatar": "assets/avatars/bot.svg",
    "tagline": "Anonymous player on the Drawback Chess site"
  },
  "board": {
    "files": 8,
    "ranks": 8,
    "light": "#eddab7",
    "dark": "#b08467"
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
        "you": "winds_of_fate",
        "opp": "medusa"
      },
      {
        "you": "lethal_attraction",
        "opp": "trophy_wife"
      },
      {
        "you": "bipartisanship",
        "opp": "lame_duck"
      },
      {
        "you": "warlord",
        "opp": "lethal_attraction"
      },
      {
        "you": "blinded_by_the_sun"
      }
    ],
    "opp_names": [
      "honest gray badger",
      "witty orange crow"
    ],
    "view": "see",
    "goal": 5
  },
  "messages": {
    "win_title": "You Won!",
    "loss_title": "You Lost"
  },
  "hooks": "g2_drawback",
  "source": {
    "research": "research/modes/cvMXLpdwWsc.json",
    "confidence": "high",
    "notes": "He tells each opponent his drawback in the video (no effect vs the bot)."
  }
});
