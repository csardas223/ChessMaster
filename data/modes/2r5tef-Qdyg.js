/* Can I SMASH Drawback Chess?: Drawback Chess (king capture, one drawback per side, shared hooks js/modes/g2_drawback.js). Sources: research/modes/2r5tef-Qdyg.json */
CM.mode({
  "id": "2r5tef-Qdyg",
  "title": "Can I SMASH Drawback Chess?",
  "name": "Smash Drawback Chess",
  "category": "Drawback Chess",
  "description": "Drawback Chess: each side is dealt a secret handicap. There is no check or checkmate: capture the king to win. You can see your own drawback on the card; your opponent's drawback is revealed when the game ends. Breaking a \"you lose if\" drawback, or having no move it allows, loses. Hard drawbacks are enabled.",
  "how_to_win": "Capture the enemy king (or make them run out of moves their drawback allows).",
  "player_side": "white",
  "player": {
    "name": "You",
    "rating": null,
    "avatar": null
  },
  "opponent": {
    "name": "sleepy gold koala",
    "rating": null,
    "avatar": null,
    "tagline": "Anonymous player on the Drawback Chess site"
  },
  "board": {
    "files": 8,
    "ranks": 8,
    "light": "#EBDBBA",
    "dark": "#C2A17B"
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
        "you": "lame_duck",
        "opp": "quit_horsing_around"
      }
    ],
    "opp_names": [
      "sleepy gold koala",
      "brave red wolf"
    ],
    "view": "see",
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
    "research": "research/modes/2r5tef-Qdyg.json",
    "confidence": "medium",
    "notes": "Only two drawbacks are readable; later games deal hard drawbacks at random."
  }
});
