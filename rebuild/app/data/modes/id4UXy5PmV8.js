/* Can I Beat the HARDEST Drawback?: Drawback Chess (king capture, one drawback per side, shared hooks js/modes/g2_drawback.js). Sources: research/modes/id4UXy5PmV8.json */
CM.mode({
  "id": "id4UXy5PmV8",
  "title": "Can I Beat the HARDEST Drawback?",
  "name": "Beat the Hardest Drawback",
  "category": "Drawback Chess",
  "description": "Drawback Chess: each side is dealt a secret handicap. There is no check or checkmate: capture the king to win. You can see your own drawback on the card; your opponent's drawback is revealed when the game ends. Breaking a \"you lose if\" drawback, or having no move it allows, loses. Hard drawbacks are enabled.",
  "how_to_win": "Capture the enemy king (or make them run out of moves their drawback allows). The video goal: 5 wins.",
  "player_side": "white",
  "player": {
    "name": "You",
    "rating": null,
    "avatar": "assets/avatars/you.svg"
  },
  "opponent": {
    "name": "gloomy rust raven",
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
        "opp": "lame_duck"
      },
      {
        "you": "stand_your_ground",
        "opp": "winds_of_fate"
      }
    ],
    "opp_names": [
      "gloomy rust raven",
      "perky lilac koi"
    ],
    "view": "see",
    "goal": 5,
    "side": "random",
    "hard": true,
    "pool": [
      "winds_of_fate",
      "unlucky",
      "lame_duck",
      "rising_water",
      "closed_book",
      "true_love",
      "fischer_random",
      "scent_of_blood",
      "peons_first",
      "lethal_attraction",
      "bloodthirsty",
      "devil",
      "stockfish",
      "spread_out",
      "checkers",
      "colorblind",
      "edgelord",
      "pawn_battle",
      "leveling_up",
      "stand_your_ground",
      "inside_the_lines",
      "boxing_with_shadows"
    ]
  },
  "messages": {
    "win_title": "You Won!",
    "loss_title": "You Lost"
  },
  "hooks": "g2_drawback",
  "source": {
    "research": "research/modes/id4UXy5PmV8.json",
    "confidence": "high",
    "notes": "Ichthyophobe text not captured; left out."
  }
});
