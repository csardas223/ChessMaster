/* Can I SURVIVE Chess960?  Plain Chess960 against ~1620-1800 players; castling allowed (Chess960 rules). Sources: research/modes/8uamUF9_3is.json, frames visual_d (MVoigt 1623, back-rank shuffle reveal). */
CM.mode({
  id: "8uamUF9_3is",
  name: "Chess960",
  category: "Variants & Games",
  description: "Chess960 (Fischer Random): a shuffled back rank, mirrored for both sides, with normal rules otherwise. Castle by moving your king onto the rook.",
  how_to_win: "Checkmate your opponent.",
  player_side: "white",
  opponent: {
    name: "MVoigt",
    rating: 1623,
    tagline: "Chess960 opponent on chess.com"
  },
  board: {
    files: 8,
    ranks: 8,
    light: "#ecf2d1",
    dark: "#7a9f58"
  },
  setup: {
    random: "chess960"
  },
  vfx: [{ type: 'overlay', at: 'board', image: 'assets/modes/8uamUF9_3is/intro.png', fit: 'contain', duration_ms: 1400, fade_ms: 300 },  /* intro card from the video (tools/g4_sprites.py) */
    
    {
      type: "text",
      text: "Chess960",
      at: "board",
      duration_ms: 1200
    }
  ],
  source: {
    research: "research/modes/8uamUF9_3is.json",
    confidence: "high"
  },
  title: "Can I SURVIVE Chess960?",
  hooks: 'g4_960'
});
