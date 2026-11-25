/* Can I Survive MORE Drawback Chess?: Drawback Chess (king capture, one drawback per side, shared hooks js/modes/g2_drawback.js). Sources: research/modes/C4KUaT_EmRQ.json */
CM.mode({
  "id": "C4KUaT_EmRQ",
  "title": "Can I Survive MORE Drawback Chess?",
  "name": "Survive More Drawback Chess",
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
    "name": "smart gray giraffe",
    "rating": null,
    "avatar": "assets/avatars/bot.svg",
    "tagline": "Anonymous player on the Drawback Chess site"
  },
  "board": {
    "files": 8,
    "ranks": 8,
    "light": "#eddab7",
    "dark": "#b18467"
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
        "you": "scorched_earth",
        "opp": "my_kingdom_for_a_horse"
      },
      {
        "you": "farsighted",
        "opp": "lame_duck"
      },
      {
        "you": "true_gentleman",
        "opp": "scouting_ahead"
      },
      {
        "you": "absolution",
        "opp": "farsighted"
      }
    ],
    "opp_names": [
      "smart gray giraffe",
      "angry white elephant",
      "sleepy purple lion"
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
    "research": "research/modes/C4KUaT_EmRQ.json",
    "confidence": "high",
    "notes": "Farsighted distance not shown: implemented as adjacent captures forbidden. Pairings inferred."
  }
});
