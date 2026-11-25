/* Can I OUTSMART Drawback Chess?: Drawback Chess (king capture, one drawback per side, shared hooks js/modes/g2_drawback.js). Sources: research/modes/W_RqmvTVTNs.json */
CM.mode({
  "id": "W_RqmvTVTNs",
  "title": "Can I OUTSMART Drawback Chess?",
  "name": "Outsmart Drawback Chess",
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
    "name": "wild umber ferret",
    "rating": null,
    "avatar": "assets/avatars/bot.svg",
    "tagline": "Anonymous player on the Drawback Chess site"
  },
  "board": {
    "files": 8,
    "ranks": 8,
    "light": "#eadeba",
    "dark": "#c6a27e"
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
        "you": "my_kingdom_for_a_horse",
        "opp": "krenolations"
      },
      {
        "you": "jumpy",
        "opp": "colorblind"
      },
      {
        "you": "enormous",
        "opp": "separation_anxiety"
      },
      {
        "you": "theocracy",
        "opp": "bongcloud"
      }
    ],
    "opp_names": [
      "wild umber ferret",
      "merry jade crane"
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
    "research": "research/modes/W_RqmvTVTNs.json",
    "confidence": "high",
    "notes": "\"Give me whatever\" difficulty. Opponent pairings inferred."
  }
});
