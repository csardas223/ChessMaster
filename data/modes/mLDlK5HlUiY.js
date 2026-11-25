/* Can I DEFEAT Drawback Chess?: Drawback Chess (king capture, one drawback per side, shared hooks js/modes/g2_drawback.js). Sources: research/modes/mLDlK5HlUiY.json */
CM.mode({
  "id": "mLDlK5HlUiY",
  "title": "Can I DEFEAT Drawback Chess?",
  "name": "Defeat Drawback Chess",
  "category": "Drawback Chess",
  "description": "Drawback Chess: each side is dealt a secret handicap. There is no check or checkmate: capture the king to win. You can see your own drawback on the card; your opponent's drawback is revealed when the game ends. Breaking a \"you lose if\" drawback, or having no move it allows, loses.",
  "how_to_win": "Capture the enemy king (or make them run out of moves their drawback allows). The video goal: 5 wins.",
  "player_side": "white",
  "player": {
    "name": "You",
    "rating": null,
    "avatar": null
  },
  "opponent": {
    "name": "spicy cocoa lynx",
    "rating": null,
    "avatar": null,
    "tagline": "Anonymous player on the Drawback Chess site"
  },
  "board": {
    "files": 8,
    "ranks": 8,
    "light": "#ecdbb8",
    "dark": "#b08568"
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
  "clock": "2+1",
  "params": {
    "games": [
      {
        "you": "pawn_battle",
        "opp": "lame_duck"
      },
      {
        "you": "true_gentleman",
        "opp": "unlucky"
      },
      {
        "you": "unlucky",
        "opp": "warlord"
      },
      {
        "you": "warlord",
        "opp": "pawn_battle"
      }
    ],
    "opp_names": [
      "spicy cocoa lynx",
      "calm ocean seal"
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
    "research": "research/modes/mLDlK5HlUiY.json",
    "confidence": "medium",
    "notes": "Pairings inferred; the rook-defends-king drawback is left out."
  }
});
