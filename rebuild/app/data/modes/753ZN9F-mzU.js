/* Can I BEAT Chess960? (Freestyle Chess)  Chess960 on chess.com against ~1500 players on 3-minute clocks; castling exists (king and rook land on the usual g/f or c/d squares). Sources: research/modes/753ZN9F-mzU.json, frames visual_c (nik1959 1547). */
CM.mode({
  id: "753ZN9F-mzU",
  vfx: [{ type: 'overlay', at: 'board', image: 'assets/modes/753ZN9F-mzU/intro.png', fit: 'contain', duration_ms: 1400, fade_ms: 300 }],  /* intro card from the video (tools/g4_sprites.py) */
  name: "Chess960 (Freestyle)",
  category: "Variants & Games",
  description: "Freestyle chess: the back-rank pieces are shuffled into one of 960 start positions, the same for both sides. Castling still works: move your king onto the rook and they land on the usual castled squares.",
  how_to_win: "Checkmate. Develop, castle, and use normal opening principles.",
  player_side: "white",
  opponent: {
    name: "nik1959",
    rating: 1547,
    tagline: "Chess960 opponent on chess.com"
  },
  board: {
    files: 8,
    ranks: 8,
    light: "#EDF2D1",
    dark: "#7AA058"
  },
  setup: {
    random: "chess960"
  },
  clock: {
    w: 180,
    b: 180,
    inc: 0,
    bot: false
  },
  source: {
    research: "research/modes/753ZN9F-mzU.json",
    confidence: "high"
  },
  title: "Can I BEAT Chess960? (Freestyle Chess)",
  hooks: 'g4_960'
});
