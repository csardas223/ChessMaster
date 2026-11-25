/* Beat Every Beginner Bot but NO QUEEN.  You play White without a queen against chess.com beginner bots in rising order (250, 400, 550, 700). Sources: research/modes/VBsA2Z6ijkg.json, frames visual_d (bot ladder 250/400/550/700; names inferred from avatars). Beginner bots never miss a mate in one (g4_martin). */
CM.mode({
  id: "VBsA2Z6ijkg",
  name: "No Queen vs Beginner Bots",
  category: "Other Videos",
  description: "Your queen is gone from the start. Beat chess.com's beginner bots one after another anyway: Martin (250), Elani (400), Aron (550) and Emir (700).",
  how_to_win: "Checkmate every bot without ever having a queen (you may still promote).",
  player_side: "white",
  opponent: {
    name: "Martin",
    rating: 250,
    avatar: "assets/modes/VBsA2Z6ijkg/martin.svg"
  },
  board: {
    files: 8,
    ranks: 8,
    light: "#ebd8b5",
    dark: "#b08665"
  },
  setup: {
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNB1KBNR"
  },
  params: {
    levels: [
      {
        name: "Martin",
        rating: 250,
        avatar: "assets/modes/VBsA2Z6ijkg/martin.svg"
      },
      {
        name: "Elani",
        rating: 400,
        avatar: "assets/modes/VBsA2Z6ijkg/elani.svg"
      },
      {
        name: "Aron",
        rating: 550,
        avatar: "assets/modes/VBsA2Z6ijkg/aron.svg"
      },
      {
        name: "Emir",
        rating: 700,
        avatar: "assets/modes/VBsA2Z6ijkg/emir.svg"
      }
    ],
    chatChance: 0
  },
  source: {
    research: "research/modes/VBsA2Z6ijkg.json",
    confidence: "medium",
    notes: "Bot names after Martin are inferred."
  },
  title: "Beat Every Beginner Bot but NO QUEEN",
  hooks: 'g4_martin'
});
