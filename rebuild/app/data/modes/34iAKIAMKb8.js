/* Can I MASTER Mini Chess? (Rare Variant)  chess.com Minihouse: 6x6 crazyhouse with K, R, B, N and one pawn each. Sources: research/modes/34iAKIAMKb8.json (transcript, frames visual_a: EstebancS, Dan-kyu_S ~1990, ~1-minute clocks), start array from Fairy-Stockfish [minihouse] as in YjXV6gL8SsA.js. */
CM.mode({
  player: { name: 'You', rating: null, avatar: 'assets/modes/34iAKIAMKb8/you.png' },  /* iwantcheckmate's purple king icon from the video */
  vfx: [{ type: 'overlay', at: 'board', image: 'assets/modes/34iAKIAMKb8/intro.jpg', fit: 'contain', duration_ms: 1400, fade_ms: 300 }],  /* intro card = the video's thumbnail (tools/g4_thumbcrops.py) */
  id: "34iAKIAMKb8",
  board: {
    files: 6,
    ranks: 6,
    light: "#ecf2d1",
    dark: "#7b9e58"
  },
  pieces: {
    P: {
      name: "Pawn",
      value: 100,
      moves: "fmWfcF",
      pawn: true,
      enPassant: false,
      promote: true
    }
  },
  setup: {
    fen: "2bnrk/5p/6/6/P5/KRNB2"
  },
  rules: {
    drops: true,
    castling: false,
    enPassant: false,
    promotion: {
      choices: [
        "R",
        "N",
        "B"
      ]
    }
  },
  name: "Minihouse",
  category: "Variants & Games",
  description: "A 6x6 board with only a king, rook, bishop, knight and one pawn per side. Captured pieces switch colour and go to your pocket; you may drop one on any empty square instead of moving. Pawns step one square and promote to a rook, knight or bishop.",
  how_to_win: "Checkmate. Drops with check decide most games.",
  player_side: "white",
  opponent: { avatar: 'assets/modes/34iAKIAMKb8/opponent.png',
    name: "Dan-kyu_S",
    rating: 1990,
    tagline: "Minihouse opponent on chess.com"
  },
  clock: {
    w: 60,
    b: 60,
    inc: 0,
    bot: false
  },
  bot: {
    engine: "search",
    depth: 4,
    time_ms: 700
  },
  source: {
    research: "research/modes/34iAKIAMKb8.json",
    confidence: "high"
  },
  title: "Can I MASTER Mini Chess? (Rare Variant)"
});
