/* Can I SURVIVE MORE Drawback Chess?: Drawback Chess (king capture, one drawback per side, shared hooks js/modes/g2_drawback.js). Sources: research/modes/PQAWp964-b4.json */
CM.mode({
  "id": "PQAWp964-b4",
  "title": "Can I SURVIVE MORE Drawback Chess?",
  "name": "Survive More Drawback Chess IV",
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
    "name": "lazy pink dolphin",
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
        "you": "rising_water",
        "side": "b"
      },
      {
        "you": "edgelord",
        "opp": "sibling_rivalry",
        "side": "b"
      },
      {
        "you": "cowardly",
        "opp": "forward_march"
      },
      {
        "you": "remorseful",
        "opp": "fischer_random",
        "side": "b"
      },
      {
        "you": "farsighted",
        "opp": "closed_book"
      },
      {
        "you": "scouting_ahead",
        "opp": "separation_of_church_and_state"
      }
    ],
    "opp_names": [
      "lazy pink dolphin",
      "lazy pink zebra"
    ],
    "view": "see",
    "goal": 5
  },
  "messages": {
    "win_title": "You Won!",
    "loss_title": "You Lost"
  },
  "hooks": "g2_drawback",
  "todo_pass2": [
    "original anonymous-player avatars (Drawback site style animal names)",
    "drawback card art polish (card overlay is generic HTML)"
  ],
  "source": {
    "research": "research/modes/PQAWp964-b4.json",
    "confidence": "high",
    "notes": "Punching Down and Forward March texts not read; Forward March implemented as no backward moves (low confidence)."
  }
});
