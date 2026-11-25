/* Can I B̵͍͛Ȇ̶͈ͅA̴̢̙͗Ţ̸̌  Drawback Chess?: Drawback Chess (king capture, one drawback per side, shared hooks js/modes/g2_drawback.js). Sources: research/modes/0i5a9jD1e5Y.json */
CM.mode({
  "id": "0i5a9jD1e5Y",
  "title": "Can I B̵͍͛Ȇ̶͈ͅA̴̢̙͗Ţ̸̌  Drawback Chess?",
  "name": "Beat Drawback Chess (Glitched)",
  "category": "Drawback Chess",
  "description": "Drawback Chess: each side is dealt a secret handicap. There is no check or checkmate: capture the king to win. You can see your own drawback on the card; your opponent's drawback is revealed when the game ends. Breaking a \"you lose if\" drawback, or having no move it allows, loses.",
  "how_to_win": "Capture the enemy king (or make them run out of moves their drawback allows).",
  "player_side": "white",
  "player": {
    "name": "You",
    "rating": null,
    "avatar": "assets/avatars/you.svg"
  },
  "opponent": {
    "name": "WanAli4504",
    "rating": null,
    "avatar": "assets/avatars/bot.svg",
    "tagline": "Anonymous player on the Drawback Chess site"
  },
  "board": {
    "files": 8,
    "ranks": 8,
    "light": "#eadeba",
    "dark": "#ae8a66"
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
        "you": "friendly_fire",
        "opp": "religious_dispute"
      },
      {
        "you": "religious_dispute",
        "opp": "friendly_fire"
      }
    ],
    "opp_names": [
      "WanAli4504",
      "smart purple lion"
    ],
    "view": "see"
  },
  "messages": {
    "win_title": "You Won!",
    "loss_title": "You Lost"
  },
  "hooks": "g2_drawback",
  "todo_pass2": [
    "original anonymous-player avatars (Drawback site style animal names)",
    "drawback card art polish (card overlay is generic HTML)",
    "glitch VFX on the intro title"
  ],
  "source": {
    "research": "research/modes/0i5a9jD1e5Y.json",
    "confidence": "medium",
    "notes": "Which side had which drawback is not stated; the pairing is inferred."
  }
});
