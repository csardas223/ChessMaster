/* Can I MASTER Sideways Pawns Chess?  chess.com Sideways Pawns: pawns may also step one square left or right onto an empty square (never capturing sideways). Sources: research/modes/3PfBlaosAmY.json (transcript 11:27 pawn sliding back), frames visual_b (cookieVortex 1687). */
CM.mode({
  player: { name: 'You', rating: null, avatar: 'assets/modes/3PfBlaosAmY/you.png' },  /* iwantcheckmate's purple king icon from the video */
  vfx: [{ type: 'overlay', at: 'board', image: 'assets/modes/3PfBlaosAmY/intro.jpg', fit: 'contain', duration_ms: 1400, fade_ms: 300 }],  /* intro card = the video's thumbnail (tools/g4_thumbcrops.py) */
  id: "3PfBlaosAmY",
  name: "Sideways Pawns",
  category: "Variants & Games",
  description: "Normal chess, except pawns may also move one square sideways to an empty square. They still capture diagonally forward, double-step from the start and promote as usual.",
  how_to_win: "Checkmate. Pawn endgames change completely when pawns can slide.",
  player_side: "white",
  opponent: { avatar: 'assets/modes/3PfBlaosAmY/opponent.png',
    name: "cookieVortex",
    rating: 1687,
    tagline: "Sideways Pawns opponent on chess.com"
  },
  board: {
    files: 8,
    ranks: 8,
    light: "#eaf6d2",
    dark: "#7ea25a"
  },
  pieces: {
    P: {
      name: "Pawn",
      value: 110,
      moves: "fmWfcFifmnDmsW",
      pawn: true,
      enPassant: true,
      promote: true,
      san: ""
    }
  },
  bot: {
    engine: "search",
    depth: 4,
    time_ms: 700
  },
  source: {
    research: "research/modes/3PfBlaosAmY.json",
    confidence: "high"
  },
  title: "Can I MASTER Sideways Pawns Chess?"
});
