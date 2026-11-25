/* Can I SURVIVE Drawback Chess?: Drawback Chess (king capture, one drawback per side, shared hooks js/modes/g2_drawback.js). Sources: research/modes/nmG8MDaqYTk.json */
CM.mode({
  "id": "nmG8MDaqYTk",
  "title": "Can I SURVIVE Drawback Chess?",
  "name": "Survive Drawback Chess",
  "category": "Drawback Chess",
  "description": "Drawback Chess: each side is dealt a secret handicap. There is no check or checkmate: capture the king to win. You can see your own drawback on the card; your opponent's drawback is revealed when the game ends. Breaking a \"you lose if\" drawback, or having no move it allows, loses.",
  "how_to_win": "Capture the enemy king (or make them run out of moves their drawback allows). The video goal: 5 wins.",
  "player_side": "black",
  "player": {
    "name": "You",
    "rating": null,
    "avatar": null
  },
  "opponent": {
    "name": "rapid ochre mule",
    "rating": null,
    "avatar": null,
    "tagline": "Anonymous player on the Drawback Chess site"
  },
  "board": {
    "files": 8,
    "ranks": 8,
    "light": "#eddbb6",
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
        "you": "leveling_up",
        "opp": "true_love",
        "side": "b"
      },
      {
        "you": "stand_your_ground",
        "opp": "shell_shocked"
      },
      {
        "you": "botez_gambit",
        "opp": "cowering_in_fear"
      },
      {
        "you": "even_keeled",
        "opp": "savior_complex"
      },
      {
        "you": "spread_out",
        "opp": "monkey_see"
      }
    ],
    "opp_names": [
      "rapid ochre mule",
      "humble denim gnu"
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
    "research": "research/modes/nmG8MDaqYTk.json",
    "confidence": "high",
    "notes": ""
  }
});
