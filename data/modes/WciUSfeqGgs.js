/* Manuel Bot Is Terrifying.  Normal chess against Manuel (2100), the strongest chess.com Advanced bot. Sources: research/modes/WciUSfeqGgs.json, frames visual_d (brown board, 'Manuel (2100)'). Avatar is original. */
CM.mode({
  id: "WciUSfeqGgs",
  name: "Manuel (2100)",
  category: "Other Videos",
  description: "A revenge game against Manuel, the 2100-rated chess.com bot that beat the creator in his advanced-bot speedrun. Normal chess.",
  how_to_win: "Checkmate Manuel.",
  player_side: "white",
  opponent: {
    name: "Manuel",
    rating: 2100,
    avatar: "assets/modes/WciUSfeqGgs/manuel.png",
    tagline: "chess.com Advanced bot"
  },
  board: {
    files: 8,
    ranks: 8,
    light: "#ebd9b6",
    dark: "#af8665"
  },
  params: {
    levels: [
      {
        name: "Manuel",
        rating: 2100,
        avatar: "assets/modes/WciUSfeqGgs/manuel.png",
        chat: [
          "I see what you're getting at.",
          "Hmm.",
          "Bold."
        ],
        win: "Well played."
      }
    ],
    chatChance: 0.15
  },
  source: {
    research: "research/modes/WciUSfeqGgs.json",
    confidence: "high"
  },
  title: "Manuel Bot Is Terrifying",
  hooks: 'g4_ladder'
});
