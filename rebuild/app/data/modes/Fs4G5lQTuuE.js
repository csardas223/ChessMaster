/* Drawback Chess, But I KNOW My Drawbacks: Drawback Chess (king capture, one drawback per side, shared hooks js/modes/g2_drawback.js). Sources: research/modes/Fs4G5lQTuuE.json */
CM.mode({
  "id": "Fs4G5lQTuuE",
  "title": "Drawback Chess, But I KNOW My Drawbacks",
  "name": "Drawback Chess: I Know Mine",
  "category": "Drawback Chess",
  "description": "Drawback Chess: each side is dealt a secret handicap. There is no check or checkmate: capture the king to win. You can see your own drawback on the card; your opponent's drawback is revealed when the game ends. Breaking a \"you lose if\" drawback, or having no move it allows, loses.",
  "how_to_win": "Capture the enemy king (or make them run out of moves their drawback allows). The video goal: 3 wins.",
  "player_side": "black",
  "player": {
    "name": "You",
    "rating": null,
    "avatar": "assets/avatars/you.svg"
  },
  "opponent": {
    "name": "Don't Be a Fool, Don't Reveal",
    "rating": null,
    "avatar": "assets/avatars/bot.svg",
    "tagline": "Anonymous player on the Drawback Chess site"
  },
  "board": {
    "files": 8,
    "ranks": 8,
    "light": "#d2c6c6",
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
        "you": "triple_play",
        "opp": "absolution",
        "side": "b"
      },
      {
        "you": "ivory_tower",
        "opp": "wind_up_toys"
      },
      {
        "you": "boxing_with_shadows",
        "opp": "checkers"
      }
    ],
    "opp_names": [
      "Don't Be a Fool, Don't Reveal",
      "quiet amber owl"
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
    "research": "research/modes/Fs4G5lQTuuE.json",
    "confidence": "high",
    "notes": "Game 3 uses the two drawbacks from the intro."
  }
});
