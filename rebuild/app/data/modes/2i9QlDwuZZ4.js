/* Drawback Chess, But I Can SEE My Drawback: Drawback Chess (king capture, one drawback per side, shared hooks js/modes/g2_drawback.js). Sources: research/modes/2i9QlDwuZZ4.json */
CM.mode({
  "id": "2i9QlDwuZZ4",
  "title": "Drawback Chess, But I Can SEE My Drawback",
  "name": "Drawback Chess: I Can See Mine",
  "category": "Drawback Chess",
  "description": "Drawback Chess: each side is dealt a secret handicap. There is no check or checkmate: capture the king to win. You can see your own drawback on the card; your opponent's drawback is revealed when the game ends. Breaking a \"you lose if\" drawback, or having no move it allows, loses.",
  "how_to_win": "Capture the enemy king (or make them run out of moves their drawback allows). The video goal: 3 wins.",
  "player_side": "white",
  "player": {
    "name": "You",
    "rating": null,
    "avatar": "assets/avatars/you.svg"
  },
  "opponent": {
    "name": "be kind I'm 100 elo",
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
  "clock": "2+1",
  "params": {
    "games": [
      {
        "you": "gorilla_tactics",
        "opp": "paranoid"
      },
      {
        "you": "moving_day",
        "opp": "irresistible"
      },
      {
        "you": "checkers",
        "opp": "bongcloud"
      }
    ],
    "opp_names": [
      "be kind I'm 100 elo",
      "smart teal otter",
      "calm green fox"
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
    "research": "research/modes/2i9QlDwuZZ4.json",
    "confidence": "high",
    "notes": "Game 3 own drawback inferred (Checkers was named in the video)."
  }
});
