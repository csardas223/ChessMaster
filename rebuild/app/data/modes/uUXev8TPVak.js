/* 3 check is NOT a joke jim: three-check vs ~1700 online players, check counters on the kings. Sources: research/modes/uUXev8TPVak.json, research/frames. Generated for impl group 3. */
CM.mode({
  id: "uUXev8TPVak",
  title: "3 check is NOT a joke jim. millions of kings suffer EVERY year.",
  name: "Three-Check",
  category: "Challenges & Odds",
  description: "Three-check: every check is counted (the number appears on the checked king). The third check wins on the spot; checkmate also wins.",
  how_to_win: "Give three checks, or checkmate.",
  player_side: "white",
  player: { name: "ireallywantcheckmate", rating: 1667, avatar: "assets/modes/uUXev8TPVak/iwantcheckmate.png" },
  opponent: {
    "name": "CocoCola_8",
    "rating": 1500,
    "avatar": "assets/modes/uUXev8TPVak/cococola.png",
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
      "checkbadge", "ladder"
    ],
    levels: [
      { label: "CocoCola_8 (1500)", opponent: { name: "CocoCola_8", rating: 1500 } },
      { label: "Jim Bob (1500?)", opponent: { name: "Jim Bob", rating: 1500, avatar: "assets/modes/uUXev8TPVak/default.png", tagline: "1500 with a question mark: first three-check games" } },
      { label: "1600 opponent", opponent: { name: "Opponent", rating: 1600, avatar: "assets/modes/uUXev8TPVak/default.png" } },
      { label: "Kruzu (1590)", opponent: { name: "Kruzu", rating: 1590, avatar: "assets/modes/uUXev8TPVak/default.png" } },
      { label: "Even match (1765)", opponent: { name: "Opponent", rating: 1765, avatar: "assets/modes/uUXev8TPVak/default.png", tagline: "custom rating range: same rating as you" } }
    ],
    advance: "win", pickerLabel: "Rating climb", winText: "1800 reached: the video's stopping point!", endText: "Lost a check race. Press New game to retry this opponent."
  },
  hooks: "g3_odds",
  source: {
    "confidence": "high",
    "notes": "Transcript 0:01: win by checkmate or by checking the king three times. The video climbs from 1667 to 1800 on the alt account against ~1500-1765 humans (CocoCola_8 from frames; Jim Bob 16:10, a 1600 at 20:57, Kruzu 1590 at 29:16, an even 1765 at 35:47); played here as a rating-climb ladder. Bot strengths follow the ratings.",
    "research": "research/modes/uUXev8TPVak.json"
  }
});
