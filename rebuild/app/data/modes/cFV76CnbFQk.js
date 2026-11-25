/* size doesn't matter, tinyhouse chess is actually fun.  chess.com Tinyhouse: 4x4 crazyhouse with King, Wazir 'Bob' (one orthogonal step, rook glyph), Dragon Knight (non-jumping knight), Ferz (one diagonal step, bishop glyph) and one pawn. Sources: research/modes/cFV76CnbFQk.json (transcript), frames visual_b and sprite crop Erv3pR1bWnE_mini_board (White Ka1 Rb1 Nc1 Bd1 Pa2). Black's array is assumed point-symmetric (spec). */
CM.mode({
  id: "cFV76CnbFQk",
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
  name: "Tinyhouse",
  category: "Other Videos",
  description: "A 4x4 crazyhouse. Each side has a king, Bob the Wazir (one step orthogonally), a Dragon Knight (a knight that cannot jump: one straight step then one diagonal, blocked if the straight square is occupied), a Ferz (one step diagonally) and a pawn. Captured pieces go to your pocket and can be dropped.",
  how_to_win: "Checkmate the enemy king. Fear the wrath of Bob.",
  player_side: "white",
  opponent: {
    name: "GRANDMA",
    rating: 1677,
    tagline: "Tinyhouse opponent on chess.com"
  },
  clock: {
    w: 60,
    b: 60,
    inc: 0,
    bot: false
  },
  source: {
    research: "research/modes/cFV76CnbFQk.json",
    confidence: "high",
    notes: "Black array assumed point-symmetric; pawn promotes to Ferz, Wazir or Dragon Knight."
  },
  title: "size doesn't matter, tinyhouse chess is actually fun"
});
