/* Can I DEMOLISH Drawback Chess?: Drawback Chess (king capture, one drawback per side, shared hooks js/modes/g2_drawback.js). Sources: research/modes/NKNYOJWVln8.json */
CM.mode({
  "id": "NKNYOJWVln8",
  "title": "Can I DEMOLISH Drawback Chess?",
  "name": "Demolish Drawback Chess",
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
    "name": "moody olive crab",
    "rating": null,
    "avatar": "assets/avatars/bot.svg",
    "tagline": "Anonymous player on the Drawback Chess site"
  },
  "board": {
    "files": 8,
    "ranks": 8,
    "light": "#eddab7",
    "dark": "#ae8668"
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
        "you": "closed_book",
        "opp": "inside_the_lines",
        "side": "w"
      },
      {
        "you": "obsession",
        "opp": "boastful"
      },
      {
        "you": "pack_mentality",
        "opp": "diplomatic_immunity"
      },
      {
        "you": "hopscotch",
        "opp": "bloodthirsty",
        "side": "w"
      },
      {
        "you": "flatterer",
        "opp": "snipers"
      },
      {
        "you": "leaps_and_bounds",
        "opp": "truant"
      }
    ],
    "opp_names": [
      "moody olive crab",
      "eager navy hawk"
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
    "research": "research/modes/NKNYOJWVln8.json",
    "confidence": "high",
    "notes": "Snipers text uses the wording from gOtyz9YEBC4. Obsession square is random per game."
  }
});
