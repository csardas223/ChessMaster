/* Beat Every Intermediate Bot With BONGCLOUD?  Normal chess against chess.com intermediate bots (Maria 1000, Azeez 1100, Vinh 1200, ...) where you must open 1.e4 and 2.Ke2. Sources: research/modes/AtmctmxLq58.json, frames visual_d (Ke2 opening, brown board). Only the three bots named in the research are included. */
CM.mode({
  id: "AtmctmxLq58",
  name: "Bongcloud vs Intermediate Bots",
  category: "Other Videos",
  description: "Normal chess against chess.com's intermediate bots, but you must play the Bongcloud: 1.e4 and then 2.Ke2. Beat a bot to face the next one.",
  how_to_win: "Open with e4 and Ke2, then checkmate every bot.",
  player_side: "white",
  opponent: {
    name: "Maria",
    rating: 1000,
    avatar: "assets/modes/AtmctmxLq58/maria.svg"
  },
  board: {
    files: 8,
    ranks: 8,
    light: "#ebd9b0",
    dark: "#b58566"
  },
  rules: {
    win: [
      {
        type: "checkmate"
      }
    ]
  },
  params: {
    levels: [
      {
        name: "Maria",
        rating: 1000,
        avatar: "assets/modes/AtmctmxLq58/maria.svg"
      },
      {
        name: "Azeez",
        rating: 1100,
        avatar: "assets/modes/AtmctmxLq58/azeez.svg"
      },
      {
        name: "Vinh",
        rating: 1200,
        avatar: "assets/modes/AtmctmxLq58/vinh.svg"
      }
    ],
    chatChance: 0,
    force: {
      w: [
        "e2e4",
        "e1e2"
      ]
    },
    forceWhy: "Bongcloud: play e4, then Ke2"
  },
  source: {
    research: "research/modes/AtmctmxLq58.json",
    confidence: "medium",
    notes: "Forced moves are skipped if they are not legal (e.g. Ke2 while in check)."
  },
  title: "Beat Every Intermediate Bot With BONGCLOUD?",
  hooks: 'g4_ladder'
});
