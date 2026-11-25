/* Can I FIRMLY GRASP Drawback Chess?: Drawback Chess (king capture, one drawback per side, shared hooks js/modes/g2_drawback.js). Sources: research/modes/gOtyz9YEBC4.json */
CM.mode({
  "id": "gOtyz9YEBC4",
  "title": "Can I FIRMLY GRASP Drawback Chess?",
  "name": "Firmly Grasp Drawback Chess",
  "category": "Drawback Chess",
  "description": "Drawback Chess: each side is dealt a secret handicap. There is no check or checkmate: capture the king to win. You can see your own drawback on the card; your opponent's drawback is revealed when the game ends. Breaking a \"you lose if\" drawback, or having no move it allows, loses.",
  "how_to_win": "Capture the enemy king (or make them run out of moves their drawback allows). The video goal: 10 wins.",
  "player_side": "white",
  "player": {
    "name": "You",
    "rating": null,
    "avatar": "assets/avatars/you.svg"
  },
  "opponent": {
    "name": "ViperKing fan",
    "rating": null,
    "avatar": "assets/avatars/bot.svg",
    "tagline": "Anonymous player on the Drawback Chess site"
  },
  "board": {
    "files": 8,
    "ranks": 8,
    "light": "#eadeba",
    "dark": "#c6a27e"
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
  "clock": "1+2",
  "params": {
    "games": [
      {
        "you": "superstitious",
        "opp": "outflanked"
      },
      {
        "you": "bottled_lightning",
        "opp": "hipster"
      },
      {
        "you": "eat_your_vegetables",
        "opp": "secret_garden"
      },
      {
        "you": "relay_race",
        "opp": "stop_stalling"
      },
      {
        "you": "snipers",
        "opp": "turn_the_other_cheek"
      },
      {
        "you": "truant",
        "opp": "hedonic_treadmill"
      },
      {
        "you": "going_the_distance",
        "opp": "gorilla_tactics"
      },
      {
        "you": "death_wish",
        "opp": "winds_of_fate"
      },
      {
        "you": "alternator",
        "opp": "botvinnik_gambit"
      },
      {
        "you": "undefended",
        "opp": "outflanked"
      },
      {
        "you": "pacman",
        "opp": "hipster"
      }
    ],
    "opp_names": [
      "ViperKing fan",
      "swift khaki emu",
      "jumpy pearl orca"
    ],
    "view": "see",
    "goal": 10
  },
  "messages": {
    "win_title": "You Won!",
    "loss_title": "You Lost"
  },
  "hooks": "g2_drawback",
  "source": {
    "research": "research/modes/gOtyz9YEBC4.json",
    "confidence": "high",
    "notes": "Own/opponent pairings per game inferred; all drawbacks from the video."
  }
});
