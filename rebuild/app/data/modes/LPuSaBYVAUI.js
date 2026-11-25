/* Can I SURVIVE MORE Drawback Chess?: Drawback Chess (king capture, one drawback per side, shared hooks js/modes/g2_drawback.js). Sources: research/modes/LPuSaBYVAUI.json */
CM.mode({
  "id": "LPuSaBYVAUI",
  "title": "Can I SURVIVE MORE Drawback Chess?",
  "name": "Survive More Drawback Chess III",
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
    "name": "lazy grey zebra",
    "rating": null,
    "avatar": "assets/avatars/bot.svg",
    "tagline": "Anonymous player on the Drawback Chess site"
  },
  "board": {
    "files": 8,
    "ranks": 8,
    "light": "#eddab6",
    "dark": "#b08467"
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
        "opp": "quit_horsing_around"
      },
      {
        "you": "lame_duck",
        "opp": "true_gentleman"
      },
      {
        "you": "stop_stalling",
        "opp": "fixation"
      },
      {
        "you": "rook_fan_club",
        "opp": "pawn_battle"
      }
    ],
    "opp_names": [
      "lazy grey zebra",
      "lazy red giraffe",
      "sleepy black monkey"
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
    "research": "research/modes/LPuSaBYVAUI.json",
    "confidence": "high",
    "notes": "Fixation partly visible: implemented as must keep moving the same piece when it can. Pairings inferred."
  }
});
