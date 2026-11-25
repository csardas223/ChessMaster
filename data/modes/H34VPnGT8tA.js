/* King + Pawn vs Bots: bot ladder Zach 1, Elsa 150, Martin 250, Juan 400, Noel 550. Sources: research/modes/H34VPnGT8tA.json. */
CM.mode({
  id: "H34VPnGT8tA",
  title: "How Many Bots Can I BEAT with 1 Pawn?",
  name: "King + Pawn vs Bots",
  category: "Challenges & Odds",
  description: "You get only a king and one pawn against each bot's full army. Beat a bot to move up the ladder.",
  how_to_win: "Beat as many bots as you can. The video beat Juan (400) and got stuck at Noel (550).",
  player_side: "white",
  player: { name: 'You', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },   /* iwantcheckmate's own avatar (purple king) from the videos */
  opponent: { name: "Zach", rating: 1, avatar: "assets/modes/EggsUiFTAwI/zach.png", tagline: "chess.com bot" },
  board: { files: 8, ranks: 8 },
  theme: { light: "#eaedd0", dark: "#749d54" },
  setup: { fen: "rnbqkbnr/pppppppp/8/8/8/8/4P3/4K3" },
  params: {
    levels: [
      {
        label: "Zach (1)",
        fen: "rnbqkbnr/pppppppp/8/8/8/8/4P3/4K3",
        opponent: { name: "Zach", rating: 1, avatar: "assets/modes/EggsUiFTAwI/zach.png", tagline: "chess.com bot" }
      },
      {
        label: "Elsa (150)",
        fen: "rnbqkbnr/pppppppp/8/8/8/8/4P3/4K3",
        opponent: { name: "Elsa", rating: 150, avatar: "assets/modes/AdbO98Fa7cY/elsa.png", tagline: "chess.com bot" }
      },
      {
        label: "Martin (250)",
        fen: "rnbqkbnr/pppppppp/8/8/8/8/4P3/4K3",
        opponent: { name: "Martin", rating: 250, avatar: "assets/modes/XuvZCCFk42k/martin.png", tagline: "chess.com bot" }
      },
      {
        label: "Juan (400)",
        fen: "rnbqkbnr/pppppppp/8/8/8/8/4P3/4K3",
        opponent: { name: "Juan", rating: 400, avatar: "assets/modes/nK5WQNSbFfE/juan.png", tagline: "chess.com bot" }
      },
      {
        label: "Noel (550)",
        fen: "rnbqkbnr/pppppppp/8/8/8/8/4P3/4K3",
        opponent: { name: "Noel", rating: 550, avatar: "assets/modes/AdbO98Fa7cY/noel.png", tagline: "chess.com bot" }
      }
    ],
    advance: "win",
    unit: "Bots",
    pickerLabel: "Opponent",
    statusPrefix: "vs "
  },
  hooks: "g3_ladder",
  source: { confidence: "high", notes: "Pawn on e2 inferred.", research: "research/modes/H34VPnGT8tA.json" }
});
