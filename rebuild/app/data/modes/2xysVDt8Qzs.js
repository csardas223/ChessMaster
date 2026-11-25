/* Can I BEAT 1D Chess?  Martin Gardner's 1D chess on a single row of 8 squares: K N R . . r n k. Kings step one square, rooks slide, knights jump exactly two squares. White has a forced win against perfect defence. Sources: research/modes/2xysVDt8Qzs.json, rules.jsonl, frames visual_b ('Black wins by checkmate!'). */
CM.mode({
  player: { name: 'You', rating: null, avatar: 'assets/modes/2xysVDt8Qzs/you.png' },  /* iwantcheckmate's purple king icon from the video */
  vfx: [{ type: 'overlay', at: 'board', image: 'assets/modes/2xysVDt8Qzs/intro.jpg', fit: 'contain', duration_ms: 1400, fade_ms: 300 }],  /* intro card = the video's thumbnail (tools/g4_thumbcrops.py) */
  id: "2xysVDt8Qzs",
  name: "1D Chess",
  category: "Variants & Games",
  description: "Chess on a single row of eight squares. Each side has a king, a knight and a rook. Kings move one square, rooks slide, and knights jump exactly two squares over whatever is between. White has a forced win, and the computer defends perfectly.",
  how_to_win: "Find the forced checkmate without stalemating Black. King against king is a draw.",
  player_side: "white",
  opponent: {
    name: "1D Chess engine",
    rating: null,
    tagline: "Always plays the best defence."
  },
  board: {
    files: 8,
    ranks: 1,
    light: "#eadeba",
    dark: "#96725a"
  },
  pieces: {
    N: {
      name: "Knight",
      moves: "D",
      value: 300
    }
  },
  setup: {
    fen: "KNR2rnk"
  },
  rules: {
    castling: false,
    enPassant: false,
    drawPlies: 60
  },
  bot: {
    engine: "search",
    style: "best",
    depth: 12,
    time_ms: 1200
  },
  source: {
    research: "research/modes/2xysVDt8Qzs.json",
    confidence: "high"
  },
  title: "Can I BEAT 1D Chess?",
  hooks: {
    checkWin: function (V, st) {
      for (var i = 0; i < st.b.length; i++) { var p = st.b[i]; if (p && p.t !== 'K') return null; }
      return { w: 'd', why: 'only the kings are left' };
    }
  }
});
