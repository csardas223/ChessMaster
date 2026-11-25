/* Can I DEVOUR Drawback Chess?: Drawback Chess (king capture, one drawback per side, shared hooks js/modes/g2_drawback.js). Sources: research/modes/evpcydnu8To.json */
CM.mode({
  "id": "evpcydnu8To",
  "title": "Can I DEVOUR Drawback Chess?",
  "name": "Devour Drawback Chess",
  "category": "Drawback Chess",
  "description": "Drawback Chess: each side is dealt a secret handicap. There is no check or checkmate: capture the king to win. You can see your own drawback on the card; your opponent's drawback is revealed when the game ends. Breaking a \"you lose if\" drawback, or having no move it allows, loses.",
  "how_to_win": "Capture the enemy king (or make them run out of moves their drawback allows). The video goal: 3 wins.",
  "player_side": "white",
  "player": {
    "name": "You",
    "rating": null,
    "avatar": null
  },
  "opponent": {
    "name": "sneaky tan robin",
    "rating": null,
    "avatar": null,
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
  "assets": { "card": "assets/modes/evpcydnu8To/drawback_card.png" },
  "params": {
    "intro_card": "assets/modes/evpcydnu8To/drawback_card.png",
    "games": [
      {
        "you": "social_distancing",
        "opp": "skittish"
      },
      {
        "you": "boastful",
        "opp": "leading_the_charge"
      },
      {
        "you": "eye_for_an_eye",
        "opp": "just_passing_through"
      }
    ],
    "opp_names": [
      "sneaky tan robin",
      "cosmic blue yeti"
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
    "research": "research/modes/evpcydnu8To.json",
    "confidence": "high",
    "notes": ""
  }
});
