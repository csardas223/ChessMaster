/* King + Rook vs Bots: bot ladder Zach 1, Martin 250, Juan 400, Noel 550. Sources: research/modes/nK5WQNSbFfE.json. */
CM.mode({
  id: "nK5WQNSbFfE",
  title: "How Many Bots Can I BEAT with 1 Rook?",
  name: "King + Rook vs Bots",
  category: "Challenges & Odds",
  description: "You get only a king and one rook against each bot's full army. Beat a bot to move up the ladder.",
  how_to_win: "Beat as many bots as you can. The video lost to Noel (550).",
  player_side: "white",
  opponent: { name: "Zach", rating: 1, avatar: "assets/modes/nK5WQNSbFfE/juan.png", tagline: "chess.com bot" },
  board: { files: 8, ranks: 8 },
  theme: { light: "#eaefcf", dark: "#759f55" },
  setup: { fen: "rnbqkbnr/pppppppp/8/8/8/8/8/R3K3" },
  params: {
    levels: [
      {
        label: "Zach (1)",
        fen: "rnbqkbnr/pppppppp/8/8/8/8/8/R3K3",
        opponent: { name: "Zach", rating: 1, avatar: "assets/avatars/bot.svg", tagline: "chess.com bot" }
      },
      {
        label: "Martin (250)",
        fen: "rnbqkbnr/pppppppp/8/8/8/8/8/R3K3",
        opponent: { name: "Martin", rating: 250, avatar: "assets/avatars/bot.svg", tagline: "chess.com bot" }
      },
      {
        label: "Juan (400)",
        fen: "rnbqkbnr/pppppppp/8/8/8/8/8/R3K3",
        opponent: { name: "Juan", rating: 400, avatar: "assets/avatars/bot.svg", tagline: "chess.com bot" }
      },
      {
        label: "Noel (550)",
        fen: "rnbqkbnr/pppppppp/8/8/8/8/8/R3K3",
        opponent: { name: "Noel", rating: 550, avatar: "assets/avatars/bot.svg", tagline: "chess.com bot" }
      }
    ],
    advance: "win",
    unit: "Bots",
    pickerLabel: "Opponent",
    statusPrefix: "vs "
  },
  hooks: "g3_ladder",
  source: { confidence: "high", notes: "Rook on a1 inferred.", research: "research/modes/nK5WQNSbFfE.json" }
});
