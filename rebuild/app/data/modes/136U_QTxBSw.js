/* Can I CRUSH Drawback Chess?: Drawback Chess (king capture, one drawback per side, shared hooks js/modes/g2_drawback.js). Sources: research/modes/136U_QTxBSw.json */
CM.mode({
  "id": "136U_QTxBSw",
  "title": "Can I CRUSH Drawback Chess?",
  "name": "Crush Drawback Chess",
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
    "name": "angry indigo bear",
    "rating": null,
    "avatar": "assets/avatars/bot.svg",
    "tagline": "Anonymous player on the Drawback Chess site"
  },
  "board": {
    "files": 8,
    "ranks": 8,
    "light": "#eddab7",
    "dark": "#ae8567"
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
  "clock": "2+1",
  "params": {
    "games": [
      {
        "you": "horse_eats_first",
        "opp": "stockfish",
        "side": "w"
      },
      {
        "you": "sibling_rivalry",
        "opp": "friendly_fire"
      },
      {
        "you": "unlucky",
        "opp": "rook_seventh"
      },
      {
        "you": "cowering_in_fear",
        "opp": "torpedoes"
      },
      {
        "you": "edgelord",
        "opp": "bishop_fan_club"
      },
      {
        "you": "elephants_fear_mice",
        "opp": "true_gentleman",
        "side": "b"
      }
    ],
    "opp_names": [
      "angry indigo bear",
      "Mungo"
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
    "research": "research/modes/136U_QTxBSw.json",
    "confidence": "high",
    "notes": "Friendly Fire text was not read in this video (uses the wording from 0i5a9jD1e5Y). Cowering in Fear wording interpreted."
  }
});
