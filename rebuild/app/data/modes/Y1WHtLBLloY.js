/* I got EXPOSED in Drawback Chess?: Drawback Chess (king capture, one drawback per side, shared hooks js/modes/g2_drawback.js). Sources: research/modes/Y1WHtLBLloY.json */
CM.mode({
  "id": "Y1WHtLBLloY",
  "title": "I got EXPOSED in Drawback Chess?",
  "name": "Exposed in Drawback Chess",
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
    "name": "nervous ruby mantis",
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
        "you": "eat_your_vegetables",
        "opp": "simplifier"
      },
      {
        "you": "stockfish",
        "opp": "irresistible"
      },
      {
        "you": "chivalry",
        "opp": "savior_complex"
      },
      {
        "you": "rook_seventh",
        "opp": "paranoid",
        "side": "b"
      },
      {
        "you": "helicopter_parent"
      },
      {
        "you": "savior_complex",
        "opp": "stage_fright",
        "side": "b"
      }
    ],
    "opp_names": [
      "nervous ruby mantis",
      "fancy ivory moose"
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
    "research": "research/modes/Y1WHtLBLloY.json",
    "confidence": "high",
    "notes": "\"Stockfish\" drawback uses the built-in engine top move. Abstinence text not read."
  }
});
