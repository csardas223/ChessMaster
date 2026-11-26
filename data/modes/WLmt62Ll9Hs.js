/* No Queen vs Intermediate Bots: bot ladder Maria 1000, Azeez 1100, Emir 1200, Vinh 1300, David 1400. Sources: research/modes/WLmt62Ll9Hs.json.
   m-art 2026-11-26: the 1100/1200/1300 faces are the thumbnail's (bearded smiling man = chess.com Azeez, bearded man in a cap =
   Emir, dark-haired man = Vinh); was "Laura" (a woman on chess.com) with the bearded man's crop, "Amir", "Vin". */
CM.mode({
  id: "WLmt62Ll9Hs",
  title: "Beating Intermediate Bots with NO QUEEN",
  name: "No Queen vs Intermediate Bots",
  category: "Challenges & Odds",
  description: "Normal chess, but you start without your queen, against the intermediate bots one by one.",
  how_to_win: "Beat all five. The finale against David (1400) was a draw by repetition.",
  player_side: "white",
  player: { name: 'You', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },   /* iwantcheckmate's own avatar (purple king) from the videos */
  opponent: { name: "Maria", rating: 1000, avatar: "assets/modes/AtmctmxLq58/maria.png", tagline: "chess.com bot" },
  board: { files: 8, ranks: 8 },
  theme: { light: "#eeeed2", dark: "#769656" },
  setup: { fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNB1KBNR" },
  params: {
    levels: [
      {
        label: "Maria (1000)",
        fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNB1KBNR",
        opponent: { name: "Maria", rating: 1000, avatar: "assets/modes/AtmctmxLq58/maria.png", tagline: "chess.com bot" }
      },
      {
        label: "Azeez (1100)",
        fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNB1KBNR",
        opponent: { name: "Azeez", rating: 1100, avatar: "assets/modes/AtmctmxLq58/azeez.png", tagline: "chess.com bot" }
      },
      {
        label: "Emir (1200)",
        fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNB1KBNR",
        opponent: { name: "Emir", rating: 1200, avatar: "assets/modes/WLmt62Ll9Hs/emir.png", tagline: "chess.com bot" }
      },
      {
        label: "Vinh (1300)",
        fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNB1KBNR",
        opponent: { name: "Vinh", rating: 1300, avatar: "assets/modes/WLmt62Ll9Hs/vinh.png", tagline: "chess.com bot" }
      },
      {
        label: "David (1400)",
        fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNB1KBNR",
        opponent: { name: "David", rating: 1400, avatar: "assets/modes/WLmt62Ll9Hs/david.png", tagline: "chess.com bot" }
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
