/* No Queen vs Bots: bot ladder Zach 1, Martin 250, Juan 400, Noel 550, Aaron 700, Zara 850, Maria 1000, Laura 1100, Amir 1200, Vin 1300. Sources: research/modes/vHVSgesfZ0o.json. */
CM.mode({
  id: "vHVSgesfZ0o",
  title: "How Many Bots Can I BEAT with No Queen?",
  name: "No Queen vs Bots",
  category: "Challenges & Odds",
  description: "Normal chess, but you start without your queen. Beat a bot to move up the ladder; the run ends at your first loss.",
  how_to_win: "Climb as far as you can. The video reached Vin (1300).",
  player_side: "white",
  player: { name: 'You', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },   /* iwantcheckmate's own avatar (purple king) from the videos */
  opponent: { name: "Zach", rating: 1, avatar: "assets/modes/EggsUiFTAwI/zach.png", tagline: "chess.com bot" },
  board: { files: 8, ranks: 8 },
  theme: { light: "#e9ecd0", dark: "#749c54" },
  setup: { fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNB1KBNR" },
  params: {
    levels: [
      {
        label: "Zach (1)",
        fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNB1KBNR",
        opponent: { name: "Zach", rating: 1, avatar: "assets/modes/EggsUiFTAwI/zach.png", tagline: "chess.com bot" }
      },
      {
        label: "Martin (250)",
        fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNB1KBNR",
        opponent: { name: "Martin", rating: 250, avatar: "assets/modes/XuvZCCFk42k/martin.png", tagline: "chess.com bot" }
      },
      {
        label: "Juan (400)",
        fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNB1KBNR",
        opponent: { name: "Juan", rating: 400, avatar: "assets/modes/nK5WQNSbFfE/juan.png", tagline: "chess.com bot" }
      },
      {
        label: "Noel (550)",   /* transcript says "Noelle"; chess.com's 550 bots are Noel, Oliver, Milica: it is Noel */
        fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNB1KBNR",
        opponent: { name: "Noel", rating: 550, avatar: "assets/modes/AdbO98Fa7cY/noel.png", tagline: "chess.com bot" }
      },
      {
        label: "Aaron (700)",
        fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNB1KBNR",
        opponent: { name: "Aaron", rating: 700, avatar: "assets/modes/9pHhqAbQS0s/aaron.png", tagline: "chess.com bot" }
      },
      {
        label: "Zara (850)",
        fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNB1KBNR",
        opponent: { name: "Zara", rating: 850, avatar: "assets/modes/vHVSgesfZ0o/zara.png", tagline: "chess.com bot" }
      },
      {
        label: "Maria (1000)",
        fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNB1KBNR",
        opponent: { name: "Maria", rating: 1000, avatar: "assets/modes/AtmctmxLq58/maria.png", tagline: "chess.com bot" }
      },
      {
        label: "Laura (1100)",
        fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNB1KBNR",
        opponent: { name: "Laura", rating: 1100, avatar: "assets/modes/WLmt62Ll9Hs/laura.png", tagline: "chess.com bot" }
      },
      {
        label: "Amir (1200)",
        fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNB1KBNR",
        opponent: { name: "Amir", rating: 1200, avatar: "assets/modes/WLmt62Ll9Hs/amir.png", tagline: "chess.com bot" }
      },
      {
        label: "Vin (1300)",
        fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNB1KBNR",
        opponent: { name: "Vin", rating: 1300, avatar: "assets/modes/WLmt62Ll9Hs/vin.png", tagline: "chess.com bot" }
      }
    ],
    advance: "win",
    unit: "Bots",
    pickerLabel: "Opponent",
    statusPrefix: "vs "
  },
  hooks: "g3_ladder",
  source: { confidence: "high", research: "research/modes/vHVSgesfZ0o.json" }
});
