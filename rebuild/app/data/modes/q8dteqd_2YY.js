/* 1. h4 vs. 2000 ELO Players on Chess.com.  Rated 3-minute blitz where you always open 1.h4 against ~2000 players. Sources: research/modes/q8dteqd_2YY.json (BIGGESTBAUCE 2033), frames visual_c. The ...h5 mirror as Black is not offered (you play White). */
CM.mode({
  player: { name: 'You', rating: null, avatar: 'assets/modes/q8dteqd_2YY/you.png' },  /* iwantcheckmate's purple king icon from the video */
  vfx: [{ type: 'overlay', at: 'board', image: 'assets/modes/q8dteqd_2YY/intro.jpg', fit: 'contain', duration_ms: 1400, fade_ms: 300 }],  /* intro card = the video's thumbnail (tools/g4_thumbcrops.py) */
  id: "q8dteqd_2YY",
  name: "1. h4 vs 2000",
  category: "Other Videos",
  description: "Three-minute blitz against a 2000-rated opponent, but your first move must be 1.h4.",
  how_to_win: "Open with h4, then checkmate (or flag) your opponent.",
  player_side: "white",
  opponent: { avatar: 'assets/modes/q8dteqd_2YY/opponent.png',
    name: "BIGGESTBAUCE",
    rating: 2033,
    tagline: "~2000 blitz opponent"
  },
  board: {
    files: 8,
    ranks: 8,
    light: "#EBEED1",
    dark: "#759F56"
  },
  clock: {
    w: 180,
    b: 180,
    inc: 0,
    bot: false
  },
  params: {
    force: {
      w: [
        "h2h4"
      ]
    },
    forceWhy: "Your first move must be h4"
  },
  source: {
    research: "research/modes/q8dteqd_2YY.json",
    confidence: "high"
  },
  title: "1. h4 vs. 2000 ELO Players on Chess.com",
  hooks: 'g4_ladder'
});
