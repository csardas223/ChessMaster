/* Can I BEAT Horde Chess?  Horde chess as the horde: 36 white pawns and no king against a full black army. White wins by checkmate, Black by capturing every white piece. Sources: research/modes/9bvch-UHQhg.json, frames visual_b (Gandalf_77 1710). First-rank pawns may double-step (chess.com rule). */
CM.mode({
  player: { name: 'You', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },  /* iwantcheckmate's purple king icon from the video */
  vfx: [{ type: 'overlay', at: 'board', image: 'assets/modes/9bvch-UHQhg/intro.jpg', fit: 'contain', duration_ms: 1400, fade_ms: 300 }],  /* intro card = the video's thumbnail (tools/g4_thumbcrops.py) */
  id: "9bvch-UHQhg",
  board: {
    files: 8,
    ranks: 8,
    light: "#eaf6d2",
    dark: "#7ea25a"
  },
  setup: {
    fen: "rnbqkbnr/pppppppp/8/1PP2PP1/PPPPPPPP/PPPPPPPP/PPPPPPPP/PPPPPPPP"
  },
  rules: {
    win: [
      {
        type: "checkmate"
      },
      {
        type: "eliminate",
        color: "w",
        result: "loss",
        why: "the horde was wiped out"
      }
    ]
  },
  bot: {
    engine: "search",
    depth: 3,
    time_ms: 800
  },
  name: "Horde Chess",
  category: "Variants & Games",
  description: "You are a horde of 36 pawns with no king. Black has a normal army. Keep your pawns together, close the gaps, and overrun Black.",
  how_to_win: "Checkmate Black. You lose if every one of your pawns and pieces is captured.",
  player_side: "white",
  opponent: { avatar: 'assets/modes/9bvch-UHQhg/opponent.png',
    name: "Gandalf_77",
    rating: 1710,
    tagline: "Horde opponent on chess.com"
  },
  clock: {
    w: 180,
    b: 180,
    inc: 0,
    bot: false
  },
  source: {
    research: "research/modes/9bvch-UHQhg.json",
    confidence: "high"
  },
  title: "Can I BEAT Horde Chess?",
  hooks: {
    setup: function (ctx) {
      /* chess.com Horde: White's pawns on the first rank may also make a double step */
      ctx.pieces(function (p, i) { return p.c === 'w' && p.t === 'P' && ctx.geo.rank(i) === 1; }).forEach(function (i) { ctx.set(i, Object.assign({}, ctx.at(i), { m: 0 })); });
    }
  }
});
