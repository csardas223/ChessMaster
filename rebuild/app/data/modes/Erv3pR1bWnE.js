/* investigating opponents to climb the minihouse leaderboard is actually useful.  Minihouse (6x6 crazyhouse) leaderboard climb against ~1800 players in bullet. Sources: research/modes/Erv3pR1bWnE.json, frames visual_c (Schnackerl 1779, pocket icons, ~1-minute clocks). Start array as chess.com Minihouse (Fairy-Stockfish [minihouse]). */
CM.mode({
  id: "Erv3pR1bWnE",
  vfx: [{ type: 'overlay', at: 'board', image: 'assets/modes/Erv3pR1bWnE/intro.png', fit: 'contain', duration_ms: 1400, fade_ms: 300 }],  /* intro card from the video (tools/g4_sprites.py) */
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
  name: "Minihouse Leaderboard",
  category: "Other Videos",
  description: "Minihouse on a 6x6 board: king, rook, bishop, knight and a pawn each, with crazyhouse drops. Captured pieces go to your pocket and can be dropped back as a move.",
  how_to_win: "Checkmate. The leaderboard starts at 2175.",
  player_side: "white",
  opponent: {
    name: "Schnackerl",
    rating: 1779,
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
    research: "research/modes/Erv3pR1bWnE.json",
    confidence: "medium"
  },
  title: "investigating opponents to climb the minihouse leaderboard is actually useful"
});
