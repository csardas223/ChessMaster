/* Can I SURVIVE MORE Drawback Chess?: Drawback Chess (king capture, one drawback per side, shared hooks js/modes/g2_drawback.js). Sources: research/modes/ZlQHLtMma54.json */
CM.mode({
  "id": "ZlQHLtMma54",
  "title": "Can I SURVIVE MORE Drawback Chess?",
  "name": "Survive More Drawback Chess V",
  "category": "Drawback Chess",
  "description": "Drawback Chess: each side is dealt a secret handicap. There is no check or checkmate: capture the king to win. You can see your own drawback on the card; your opponent's drawback is revealed when the game ends. Breaking a \"you lose if\" drawback, or having no move it allows, loses.",
  "how_to_win": "Capture the enemy king (or make them run out of moves their drawback allows). The video goal: 5 wins.",
  "player_side": "black",
  "player": {
    "name": "You",
    "rating": null,
    "avatar": "assets/avatars/you.svg"
  },
  "opponent": {
    "name": "brisk azure newt",
    "rating": null,
    "avatar": "assets/avatars/bot.svg",
    "tagline": "Anonymous player on the Drawback Chess site"
  },
  "board": {
    "files": 8,
    "ranks": 8,
    "light": "#eadeba",
    "dark": "#ae8667"
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
        "you": "leveling_up",
        "opp": "gloomstalker",
        "side": "b"
      },
      {
        "you": "lethal_attraction",
        "opp": "forward_march"
      },
      {
        "you": "spice_of_life",
        "opp": "stage_fright"
      },
      {
        "you": "winds_of_fate"
      },
      {
        "you": "cowardly",
        "opp": "boastful",
        "side": "b"
      },
      {
        "you": "simon_says",
        "opp": "scent_of_blood",
        "side": "b"
      }
    ],
    "opp_names": [
      "brisk azure newt",
      "gentle coal puma"
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
    "research": "research/modes/ZlQHLtMma54.json",
    "confidence": "high",
    "notes": "Gloomstalker uses the wording from I9n4kXe3A-I; Punching Down/Forward March texts not read."
  }
});
