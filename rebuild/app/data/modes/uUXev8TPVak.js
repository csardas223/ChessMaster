/* 3 check is NOT a joke jim: three-check vs ~1700 online players, check counters on the kings. Sources: research/modes/uUXev8TPVak.json, research/frames. Generated for impl group 3. */
CM.mode({
  id: "uUXev8TPVak",
  title: "3 check is NOT a joke jim. millions of kings suffer EVERY year.",
  name: "Three-Check",
  category: "Challenges & Odds",
  description: "Three-check: every check is counted (the number appears on the checked king). The third check wins on the spot; checkmate also wins.",
  how_to_win: "Give three checks, or checkmate.",
  player_side: "white",
  opponent: {
    "name": "CocoCola_8",
    "rating": 1500,
    "avatar": "assets/modes/uUXev8TPVak/human.svg",
    "tagline": "online three-check player"
  },
  board: {
    "files": 8,
    "ranks": 8
  },
  theme: {
    "light": "#eaf6d2",
    "dark": "#7ea25a"
  },
  setup: {
    "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR"
  },
  rules: {
    "win": [
      {
        "type": "nchecks",
        "n": 3
      },
      {
        "type": "checkmate"
      }
    ]
  },
  params: {
    "g3": [
      "checkbadge"
    ]
  },
  hooks: "g3_odds",
  todo_pass2: ["re-run transcript (429)"],
  source: {
    "confidence": "medium",
    "notes": "Transcript unavailable (429); rules are standard three-check, shown in the frames by counters on the kings.",
    "research": "research/modes/uUXev8TPVak.json"
  }
});
