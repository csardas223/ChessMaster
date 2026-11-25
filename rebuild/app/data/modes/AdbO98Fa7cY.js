/* King + Queen vs Bots: bot ladder Zach 1, Pepe 100, Elsa 150, Martin 250, Juan 400, Noel 550. Sources: research/modes/AdbO98Fa7cY.json. */
CM.mode({
  id: "AdbO98Fa7cY",
  title: "How Many Bots Can I BEAT with 1 Queen?",
  name: "King + Queen vs Bots",
  category: "Challenges & Odds",
  description: "You get only a king and a queen against each bot's full army. Beat a bot to move up the ladder.",
  how_to_win: "Beat as many bots as you can. The video got past Juan (400) and lost to Noel (550).",
  player_side: "white",
  opponent: { name: "Zach", rating: 1, avatar: "assets/avatars/bot.svg", tagline: "chess.com bot" },
  board: { files: 8, ranks: 8 },
  theme: { light: "#eaeed0", dark: "#759e54" },
  setup: { fen: "rnbqkbnr/pppppppp/8/8/8/8/8/3QK3" },
  params: {
    levels: [
      {
        label: "Zach (1)",
        fen: "rnbqkbnr/pppppppp/8/8/8/8/8/3QK3",
        opponent: { name: "Zach", rating: 1, avatar: "assets/avatars/bot.svg", tagline: "chess.com bot" }
      },
      {
        label: "Pepe (100)",
        fen: "rnbqkbnr/pppppppp/8/8/8/8/8/3QK3",
        opponent: { name: "Pepe", rating: 100, avatar: "assets/avatars/bot.svg", tagline: "chess.com bot" }
      },
      {
        label: "Elsa (150)",
        fen: "rnbqkbnr/pppppppp/8/8/8/8/8/3QK3",
        opponent: { name: "Elsa", rating: 150, avatar: "assets/avatars/bot.svg", tagline: "chess.com bot" }
      },
      {
        label: "Martin (250)",
        fen: "rnbqkbnr/pppppppp/8/8/8/8/8/3QK3",
        opponent: { name: "Martin", rating: 250, avatar: "assets/avatars/bot.svg", tagline: "chess.com bot" }
      },
      {
        label: "Juan (400)",
        fen: "rnbqkbnr/pppppppp/8/8/8/8/8/3QK3",
        opponent: { name: "Juan", rating: 400, avatar: "assets/avatars/bot.svg", tagline: "chess.com bot" }
      },
      {
        label: "Noel (550)",
        fen: "rnbqkbnr/pppppppp/8/8/8/8/8/3QK3",
        opponent: { name: "Noel", rating: 550, avatar: "assets/avatars/bot.svg", tagline: "chess.com bot" }
      }
    ],
    advance: "win",
    unit: "Bots",
    pickerLabel: "Opponent",
    statusPrefix: "vs "
  },
  hooks: "g3_ladder",
  source: {
    confidence: "high",
    notes: "Queen on d1 inferred; the 150 bot is named Elsa as in the sister video.",
    research: "research/modes/AdbO98Fa7cY.json"
  }
});
