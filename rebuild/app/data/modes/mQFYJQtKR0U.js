/* Can I ENDURE Drawback Chess?: Drawback Chess (king capture, one drawback per side, shared hooks js/modes/g2_drawback.js). Sources: research/modes/mQFYJQtKR0U.json */
CM.mode({
  "id": "mQFYJQtKR0U",
  "title": "Can I ENDURE Drawback Chess?",
  "name": "Endure Drawback Chess",
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
    "name": "proud scarlet ox",
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
        "opp": "just_passing_through"
      },
      {
        "you": "alternator",
        "opp": "rook_seventh"
      },
      {
        "you": "my_kingdom_for_a_horse",
        "opp": "conscientious_objectors",
        "side": "w"
      },
      {
        "you": "simp",
        "opp": "number_of_the_beast"
      },
      {
        "opp": "rook_seventh"
      },
      {
        "you": "warlord",
        "side": "w"
      }
    ],
    "opp_names": [
      "proud scarlet ox",
      "dusty sage mink"
    ],
    "view": "see",
    "goal": 5
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
    "research": "research/modes/mQFYJQtKR0U.json",
    "confidence": "high",
    "notes": "Ladies First, Covering Fire and Oddball texts were not read: those games deal a random drawback."
  }
});
