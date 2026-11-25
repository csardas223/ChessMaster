/* Can I OUTPLAY Drawback Chess?: Drawback Chess (king capture, one drawback per side, shared hooks js/modes/g2_drawback.js). Sources: research/modes/75lmLixPkCQ.json */
CM.mode({
  "id": "75lmLixPkCQ",
  "title": "Can I OUTPLAY Drawback Chess?",
  "name": "Outplay Drawback Chess",
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
    "name": "I will reveal my drawback",
    "rating": null,
    "avatar": "assets/avatars/bot.svg",
    "tagline": "Anonymous player on the Drawback Chess site"
  },
  "board": {
    "files": 8,
    "ranks": 8,
    "light": "#eddab7",
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
        "you": "torpedoes",
        "opp": "jumpy",
        "side": "b"
      },
      {
        "opp": "eye_for_an_eye"
      },
      {
        "you": "messy_divorce",
        "opp": "gorilla_tactics"
      },
      {
        "you": "even_keeled",
        "opp": "pack_mentality",
        "side": "b"
      },
      {
        "you": "expedition",
        "opp": "active_volcano"
      }
    ],
    "opp_names": [
      "I will reveal my drawback",
      "Shall we both reveal?",
      "lazy blue whale"
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
    "research": "research/modes/75lmLixPkCQ.json",
    "confidence": "high",
    "notes": "Torch Light text was never read, so game 2 deals you a random drawback instead."
  }
});
