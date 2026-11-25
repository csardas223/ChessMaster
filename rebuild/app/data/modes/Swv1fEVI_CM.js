/* Is Tinyhouse Chess Solvable?  Tinyhouse on chess.com (4x4 crazyhouse) against ~1450-1500 players. Sources: research/modes/Swv1fEVI_CM.json (frames visual_b: pocket at the left, 'Solved?' thumbnail). The spec's piece list is unreadable from its frames (K, B/N, pawns); the array follows the higher-confidence Tinyhouse spec cFV76CnbFQk (rook/knight/bishop glyphs are Wazir, Dragon Knight and Ferz). */
CM.mode({
  player: { name: 'You', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },  /* iwantcheckmate's purple king icon from the video */
  vfx: [{ type: 'overlay', at: 'board', image: 'assets/modes/Swv1fEVI_CM/intro.jpg', fit: 'contain', duration_ms: 1400, fade_ms: 300 }],  /* intro card = the video's thumbnail (tools/g4_thumbcrops.py) */
  id: "Swv1fEVI_CM",
  board: {
    files: 4,
    ranks: 4,
    light: "#eaf6d2",
    dark: "#7ea25a"
  },
  pieces: {
    P: {
      name: "Pawn",
      value: 100,
      moves: "fmWfcF",
      pawn: true,
      enPassant: false,
      promote: true
    },
    W: {
      name: "Wazir (Bob)",
      moves: "W",
      value: 200,
      glyph: "R",
      badge: "W"
    },
    F: {
      name: "Ferz",
      moves: "F",
      value: 200,
      glyph: "B",
      badge: "F"
    },
    J: {
      name: "Dragon Knight",
      moves: "nN",
      value: 260,
      glyph: "N",
      badge: "DK"
    }
  },
  setup: {
    fen: "fjwk/3p/P3/KWJF"
  },
  rules: {
    drops: true,
    castling: false,
    enPassant: false,
    promotion: {
      choices: [
        "F",
        "W",
        "J"
      ]
    }
  },
  bot: {
    engine: "search",
    depth: 5,
    time_ms: 800
  },
  name: "Tinyhouse (Solved?)",
  category: "Other Videos",
  description: "Crazyhouse on a 4x4 board: King, Wazir, Dragon Knight, Ferz and a pawn per side. Captured pieces switch sides and can be dropped back onto any empty square.",
  how_to_win: "Checkmate. With 3.5 x 10^13 positions, maybe it is solvable.",
  player_side: "white",
  opponent: { avatar: 'assets/modes/Swv1fEVI_CM/opponent.png',
    name: "RealMrHater",
    rating: 1500,
    tagline: "Tinyhouse opponent on chess.com"
  },
  clock: {
    w: 60,
    b: 60,
    inc: 0,
    bot: false
  },
  source: {
    research: "research/modes/Swv1fEVI_CM.json",
    confidence: "medium",
    notes: "Same array as cFV76CnbFQk.js; frames suggested two pawns each but are not legible."
  },
  title: "Is Tinyhouse Chess Solvable?"
});
