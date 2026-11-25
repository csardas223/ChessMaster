/* Can I BEAT Crazyhouse Chess?  chess.com Crazyhouse against ~1500 players: captured pieces switch colour and go to your pocket; drop them on any empty square instead of moving (no pawns on the first or last rank; promoted pieces return as pawns). Sources: research/modes/5K72RRDBN5U.json, frames visual_b (PhillipsHea 1557). */
CM.mode({
  player: { name: 'You', rating: null, avatar: 'assets/modes/5K72RRDBN5U/you.png' },  /* iwantcheckmate's purple king icon from the video */
  vfx: [{ type: 'overlay', at: 'board', image: 'assets/modes/5K72RRDBN5U/intro.jpg', fit: 'contain', duration_ms: 1400, fade_ms: 300 }],  /* intro card = the video's thumbnail (tools/g4_thumbcrops.py) */
  id: "5K72RRDBN5U",
  name: "Crazyhouse",
  category: "Variants & Games",
  description: "Captured pieces change colour and go to your pocket. On your turn you may drop one onto any empty square instead of moving. Pawns cannot be dropped on the first or last rank, and a promoted piece turns back into a pawn when captured.",
  how_to_win: "Checkmate. Drops with check are deadly.",
  player_side: "white",
  opponent: { avatar: 'assets/modes/5K72RRDBN5U/opponent.png',
    name: "PhillipsHea",
    rating: 1557,
    tagline: "Crazyhouse opponent on chess.com"
  },
  board: {
    files: 8,
    ranks: 8,
    light: "#eaf6d2",
    dark: "#7ea25a"
  },
  rules: {
    drops: true
  },
  bot: {
    engine: "search",
    depth: 3,
    time_ms: 700
  },
  source: {
    research: "research/modes/5K72RRDBN5U.json",
    confidence: "high"
  },
  title: "Can I BEAT Crazyhouse Chess?"
});
