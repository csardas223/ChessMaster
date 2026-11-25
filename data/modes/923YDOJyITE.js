/* Can I Beat EVEN MORE Drawback Chess?: Drawback Chess (king capture, one drawback per side, shared hooks js/modes/g2_drawback.js). Sources: research/modes/923YDOJyITE.json */
CM.mode({
  "id": "923YDOJyITE",
  "title": "Can I Beat EVEN MORE Drawback Chess?",
  "name": "Beat Even More Drawback Chess",
  "category": "Drawback Chess",
  "description": "Drawback Chess: each side is dealt a secret handicap. There is no check or checkmate: capture the king to win. You can see your own drawback on the card; your opponent's drawback is revealed when the game ends. Breaking a \"you lose if\" drawback, or having no move it allows, loses.",
  "how_to_win": "Capture the enemy king (or make them run out of moves their drawback allows).",
  "player_side": "white",
  "player": {
    "name": "You",
    "rating": null,
    "avatar": null
  },
  "opponent": {
    "name": "getic orange elephant",
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
        "you": "outflanked",
        "opp": "my_kingdom_for_a_horse"
      },
      {
        "you": "active_volcano",
        "opp": "outflanked"
      },
      {
        "you": "my_kingdom_for_a_horse",
        "opp": "active_volcano"
      }
    ],
    "opp_names": [
      "getic orange elephant",
      "sleepy white giraffe",
      "excited blue panda"
    ],
    "view": "see"
  },
  "messages": {
    "win_title": "You Won!",
    "loss_title": "You Lost"
  },
  "hooks": "g2_drawback",
  "source": {
    "research": "research/modes/923YDOJyITE.json",
    "confidence": "medium",
    "notes": "Pairing of drawbacks per game inferred."
  }
});
