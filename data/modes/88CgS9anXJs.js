/* Can I MASTER Horde Chess?  chess.com Horde: White has 36 pawns and no king, Black a normal army. White wins by checkmate, Black by capturing every white piece. The video plays both colours; this mode puts you on Black (the 'Pawn Muncher 9000' games) - 9bvch-UHQhg.js is the horde side. Sources: research/modes/88CgS9anXJs.json, rules.jsonl, frames visual_a. */
CM.mode({
  player: { name: 'You', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },  /* iwantcheckmate's purple king icon from the video */
  vfx: [{ type: 'overlay', at: 'board', image: 'assets/modes/88CgS9anXJs/intro.jpg', fit: 'contain', duration_ms: 1400, fade_ms: 300 }],  /* intro card = the video's thumbnail (tools/g4_thumbcrops.py) */
  id: "88CgS9anXJs",
  board: {
    files: 8,
    ranks: 8,
    light: "#ebf3d0",
    dark: "#7b9e58"
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
  name: "Horde (as Black)",
  category: "Variants & Games",
  description: "White is a horde of 36 pawns with no king; you have a normal army. Pawns on the first rank may double-step. Eat the whole horde before it smothers your king.",
  how_to_win: "Capture every white pawn and piece. If the horde checkmates you, you lose.",
  player_side: "black",
  opponent: { avatar: 'assets/modes/88CgS9anXJs/opponent.png',
    name: "BobbyFisc...",
    rating: 1650,
    tagline: "Horde opponent on chess.com"
  },
  clock: {
    w: 180,
    b: 180,
    inc: 0,
    bot: false
  },
  messages: {
    win: "Pawn Muncher 9000: the horde is gone"
  },
  source: {
    research: "research/modes/88CgS9anXJs.json",
    confidence: "high",
    notes: "Player side fixed to Black (the video plays both)."
  },
  title: "Can I MASTER Horde Chess?",
  hooks: {
    setup: function (ctx) {
      /* chess.com Horde: White's pawns on the first rank may also make a double step */
      ctx.pieces(function (p, i) { return p.c === 'w' && p.t === 'P' && ctx.geo.rank(i) === 1; }).forEach(function (i) { ctx.set(i, Object.assign({}, ctx.at(i), { m: 0 })); });
    }
  }
});
