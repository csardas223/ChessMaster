/* I Played a BANNED Chess Opening.  Normal rated chess against ~2000 opponents where you must open 1.a4 and 2.Ra3, hanging the rook. Sources: research/modes/mm11vzcLPhk.json, rules.jsonl, frames visual_b. */
CM.mode({
  player: { name: 'You', rating: null, avatar: 'assets/modes/mm11vzcLPhk/you.png' },  /* iwantcheckmate's purple king icon from the video */
  vfx: [{ type: 'overlay', at: 'board', image: 'assets/modes/mm11vzcLPhk/intro.jpg', fit: 'contain', duration_ms: 1400, fade_ms: 300 }],  /* intro card = the video's thumbnail (tools/g4_thumbcrops.py) */
  id: "mm11vzcLPhk",
  name: "Banned Opening: a4 + Ra3",
  category: "Other Videos",
  description: "Normal chess against a ~2080 opponent, but you must open with 1.a4 and 2.Ra3, offering your rook. Then try to win anyway.",
  how_to_win: "Play a4 and Ra3, then checkmate.",
  player_side: "white",
  opponent: { avatar: 'assets/modes/mm11vzcLPhk/opponent.png',
    name: "torima",
    rating: 2080,
    tagline: "~2080 blitz opponent (game 1)"
  },
  board: {
    files: 8,
    ranks: 8,
    light: "#eaead2",
    dark: "#72a25a"
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
        "a2a4",
        "a1a3"
      ]
    },
    forceWhy: "Troll opening: play a4, then Ra3"
  },
  source: {
    research: "research/modes/mm11vzcLPhk.json",
    confidence: "high"
  },
  title: "I Played a BANNED Chess Opening",
  hooks: 'g4_ladder'
});
