/* Drawback Chess, But I Don't Know My Own Drawback: Drawback Chess (king capture, one drawback per side, shared hooks js/modes/g2_drawback.js). Sources: research/modes/QZuydaTUCGE.json */
CM.mode({
  "id": "QZuydaTUCGE",
  "title": "Drawback Chess, But I Don't Know My Own Drawback",
  "name": "Drawback Chess: I Don't Know Mine",
  "category": "Drawback Chess",
  "description": "Drawback Chess: each side is dealt a secret handicap. There is no check or checkmate: capture the king to win. Your own drawback is hidden from you: moves it forbids are simply refused, so work it out; your opponent's drawback is revealed when the game ends. Breaking a \"you lose if\" drawback, or having no move it allows, loses.",
  "how_to_win": "Capture the enemy king (or make them run out of moves their drawback allows). The video goal: 1 win.",
  "player_side": "black",
  "player": {
    "name": "You",
    "rating": null,
    "avatar": "assets/avatars/you.svg"
  },
  "opponent": {
    "name": "happy yellow tiger",
    "rating": null,
    "avatar": "assets/avatars/bot.svg",
    "tagline": "Anonymous player on the Drawback Chess site"
  },
  "board": {
    "files": 8,
    "ranks": 8,
    "light": "#eadeba",
    "dark": "#ae7e66"
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
        "you": "unlucky",
        "opp": "savior_complex",
        "side": "b"
      },
      {
        "you": "eat_your_vegetables"
      }
    ],
    "opp_names": [
      "happy yellow tiger",
      "shy beige mole"
    ],
    "view": "hidden",
    "goal": 1
  },
  "messages": {
    "win_title": "You Won!",
    "loss_title": "You Lost"
  },
  "hooks": "g2_drawback",
  "source": {
    "research": "research/modes/QZuydaTUCGE.json",
    "confidence": "medium",
    "notes": "Game 2 opponent drawback not readable."
  }
});
