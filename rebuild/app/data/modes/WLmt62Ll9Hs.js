/* No Queen vs Intermediate Bots: bot ladder Maria 1000, Laura 1100, Amir 1200, Vin 1300, David 1400. Sources: research/modes/WLmt62Ll9Hs.json. */
CM.mode({
  id: "WLmt62Ll9Hs",
  title: "Beating Intermediate Bots with NO QUEEN",
  name: "No Queen vs Intermediate Bots",
  category: "Challenges & Odds",
  description: "Normal chess, but you start without your queen, against the intermediate bots one by one.",
  how_to_win: "Beat all five. The finale against David (1400) was a draw by repetition.",
  player_side: "white",
  opponent: { name: "Maria", rating: 1000, avatar: "assets/avatars/bot.svg", tagline: "chess.com bot" },
  board: { files: 8, ranks: 8 },
  theme: { light: "#eeeed2", dark: "#769656" },
  setup: { fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNB1KBNR" },
  params: {
    levels: [
      {
        label: "Maria (1000)",
        fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNB1KBNR",
        opponent: { name: "Maria", rating: 1000, avatar: "assets/avatars/bot.svg", tagline: "chess.com bot" }
      },
      {
        label: "Laura (1100)",
        fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNB1KBNR",
        opponent: { name: "Laura", rating: 1100, avatar: "assets/avatars/bot.svg", tagline: "chess.com bot" }
      },
      {
        label: "Amir (1200)",
        fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNB1KBNR",
        opponent: { name: "Amir", rating: 1200, avatar: "assets/avatars/bot.svg", tagline: "chess.com bot" }
      },
      {
        label: "Vin (1300)",
        fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNB1KBNR",
        opponent: { name: "Vin", rating: 1300, avatar: "assets/avatars/bot.svg", tagline: "chess.com bot" }
      },
      {
        label: "David (1400)",
        fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNB1KBNR",
        opponent: { name: "David", rating: 1400, avatar: "assets/avatars/bot.svg", tagline: "chess.com bot" }
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
    notes: "Names of the 1100 and 1200 bots taken from the sister video (vHVSgesfZ0o).",
    research: "research/modes/WLmt62Ll9Hs.json"
  }
});
