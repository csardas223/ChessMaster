/* Drawback Chess, But My Paranoia is All-Consuming: Drawback Chess (king capture, one drawback per side, shared hooks js/modes/g2_drawback.js). Sources: research/modes/eHMLdUzYvzo.json */
CM.mode({
  "id": "eHMLdUzYvzo",
  "title": "Drawback Chess, But My Paranoia is All-Consuming",
  "name": "Drawback Chess: All-Consuming Paranoia",
  "category": "Drawback Chess",
  "description": "Drawback Chess: each side is dealt a secret handicap. There is no check or checkmate: capture the king to win. Your drawback is shown for two seconds, then hidden; your opponent's drawback is revealed when the game ends. Breaking a \"you lose if\" drawback, or having no move it allows, loses.",
  "how_to_win": "Capture the enemy king (or make them run out of moves their drawback allows). The video goal: 1 win.",
  "player_side": "white",
  "player": {
    "name": "You",
    "rating": null,
    "avatar": null
  },
  "opponent": {
    "name": "lucky jade otter",
    "rating": null,
    "avatar": null,
    "tagline": "Anonymous player on the Drawback Chess site"
  },
  "board": {
    "files": 8,
    "ranks": 8,
    "light": "#eadeba",
    "dark": "#ae7e66"
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
        "you": "vacation",
        "opp": "centralized_command",
        "side": "w"
      },
      {
        "you": "winds_of_fate",
        "opp": "cowardly"
      },
      {
        "you": "death_wish",
        "opp": "shapeshifter"
      }
    ],
    "opp_names": [
      "lucky jade otter",
      "grim violet goat"
    ],
    "view": "flash",
    "goal": 1
  },
  "messages": {
    "win_title": "You Won!",
    "loss_title": "You Lost"
  },
  "hooks": "g2_drawback",
  "source": {
    "research": "research/modes/eHMLdUzYvzo.json",
    "confidence": "high",
    "notes": "Own drawback flashed for 2 s at the start. The left/right half-switching drawback (name not read) is left out."
  }
});
