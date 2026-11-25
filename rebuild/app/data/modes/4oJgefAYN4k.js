/* Can I BEAT Torpedo Chess?  Torpedo chess: pawns may move one or two squares forward from any rank; en passant applies to every double step. Sources: research/modes/4oJgefAYN4k.json, rules.jsonl, frames visual_a (miradilzey 1843, 3-min clocks). */
CM.mode({
  player: { name: 'You', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },  /* iwantcheckmate's purple king icon from the video */
  vfx: [{ type: 'overlay', at: 'board', image: 'assets/modes/4oJgefAYN4k/intro.jpg', fit: 'contain', duration_ms: 1400, fade_ms: 300 }],  /* intro card = the video's thumbnail (tools/g4_thumbcrops.py) */
  id: "4oJgefAYN4k",
  name: "Torpedo Chess",
  category: "Variants & Games",
  description: "Pawns can always move one or two squares forward, not only on their first move (the path must be empty). En passant works after any double step.",
  how_to_win: "Checkmate. Grab space with torpedo pawns.",
  player_side: "white",
  opponent: { avatar: 'assets/modes/4oJgefAYN4k/opponent.png',
    name: "miradilzey",
    rating: 1843,
    tagline: "Torpedo opponent on chess.com"
  },
  board: {
    files: 8,
    ranks: 8,
    light: "#ebf3d0",
    dark: "#7b9e58"
  },
  pieces: {
    P: {
      name: "Pawn",
      value: 110,
      moves: "fmWfcFfmnD",
      pawn: true,
      enPassant: true,
      promote: true,
      san: ""
    }
  },
  clock: {
    w: 180,
    b: 180,
    inc: 0,
    bot: false
  },
  bot: {
    engine: "search",
    depth: 4,
    time_ms: 700
  },
  source: {
    research: "research/modes/4oJgefAYN4k.json",
    confidence: "high"
  },
  title: "Can I BEAT Torpedo Chess?"
});
