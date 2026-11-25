/* Can I BEAT Giveaway Chess?  Giveaway / antichess on chess.com: captures are compulsory, the king is an ordinary piece, and you win by losing all your pieces (or being stalemated). Sources: research/modes/3_eutZExN2c.json (opponents StarRoman 1553, minhduc77 1746, 3-min clocks). Promotion to king and stalemate-wins follow chess.com antichess (inferred in the spec). */
CM.mode({
  player: { name: 'You', rating: null, avatar: 'assets/modes/3_eutZExN2c/you.png' },  /* iwantcheckmate's purple king icon from the video */
  vfx: [{ type: 'overlay', at: 'board', image: 'assets/modes/3_eutZExN2c/intro.jpg', fit: 'contain', duration_ms: 1400, fade_ms: 300 }],  /* intro card = the video's thumbnail (tools/g4_thumbcrops.py) */
  id: "3_eutZExN2c",
  board: {
    files: 8,
    ranks: 8,
    light: "#eaf0cc",
    dark: "#789c54"
  },
  pieces: {
    K: {
      name: "King",
      moves: "K",
      royal: false,
      castle: false,
      value: 250
    }
  },
  rules: {
    check: "none",
    castling: false,
    forcedCapture: true,
    stalemate: "win",
    win: [
      {
        type: "eliminate",
        result: "win"
      }
    ],
    promotion: {
      choices: [
        "Q",
        "N",
        "R",
        "B",
        "K"
      ]
    }
  },
  bot: {
    engine: "search",
    depth: 4,
    time_ms: 700
  },
  name: "Giveaway Chess",
  category: "Variants & Games",
  description: "Antichess: if you can capture, you must. There is no check or checkmate and the king is just a piece. Pawns may also promote to a king.",
  how_to_win: "Lose all your pieces, or have no legal move.",
  player_side: "white",
  opponent: { avatar: 'assets/modes/3_eutZExN2c/opponent.png',
    name: "minhduc77",
    rating: 1746,
    tagline: "Giveaway opponent on chess.com"
  },
  clock: {
    w: 180,
    b: 180,
    inc: 0,
    bot: false
  },
  messages: {
    win: "you gave everything away"
  },
  source: {
    research: "research/modes/3_eutZExN2c.json",
    confidence: "medium"
  },
  title: "Can I BEAT Giveaway Chess?"
});
