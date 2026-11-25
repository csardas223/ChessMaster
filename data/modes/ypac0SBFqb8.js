/* Can I SURVIVE Drawback Chess?: Drawback Chess (king capture, one drawback per side, shared hooks js/modes/g2_drawback.js). Sources: research/modes/ypac0SBFqb8.json */
CM.mode({
  "id": "ypac0SBFqb8",
  "title": "Can I SURVIVE Drawback Chess?",
  "name": "Survive Drawback Chess II",
  "category": "Drawback Chess",
  "description": "Drawback Chess: each side is dealt a secret handicap. There is no check or checkmate: capture the king to win. You can see your own drawback on the card; your opponent's drawback is revealed when the game ends. Breaking a \"you lose if\" drawback, or having no move it allows, loses.",
  "how_to_win": "Capture the enemy king (or make them run out of moves their drawback allows). The video goal: 3 wins.",
  "player_side": "black",
  "player": {
    "name": "You",
    "rating": null,
    "avatar": null
  },
  "opponent": {
    "name": "silly mauve kiwi",
    "rating": null,
    "avatar": null,
    "tagline": "Anonymous player on the Drawback Chess site"
  },
  "board": {
    "files": 8,
    "ranks": 8,
    "light": "#eadeba",
    "dark": "#b08265"
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
  "assets": { "card": "assets/modes/ypac0SBFqb8/drawback_card.png" },
  "params": {
    "intro_card": "assets/modes/ypac0SBFqb8/drawback_card.png",
    "games": [
      {
        "you": "pawn_battle",
        "opp": "true_gentleman",
        "side": "b"
      },
      {
        "you": "rising_water",
        "opp": "blinded_by_the_sun"
      },
      {
        "you": "devil",
        "side": "b"
      }
    ],
    "opp_names": [
      "silly mauve kiwi",
      "stern teal boar"
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
    "research": "research/modes/ypac0SBFqb8.json",
    "confidence": "medium",
    "notes": "Treadmill text not read; game 3 opponent drawback dealt at random. In the video a win only counts if his drawback is harder (not enforced)."
  }
});
