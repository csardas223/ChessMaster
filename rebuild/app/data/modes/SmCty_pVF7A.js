/* Can I MASTER the Rosen Score? Alphabet Openings: spell BEEF or CABBAGE with the files of your first moves, then win.
   Sources: research/modes/SmCty_pVF7A.json (BEEF as Black in 23 moves, CABBAGE on time). */
CM.mode({
  id: "SmCty_pVF7A",
  name: "Rosen Score: Alphabet Opening",
  category: "Variants & Games",
  description: "Rosen Score challenge: your first moves must land on files that spell the word, in order (BEEF = b, e, e, f). Only moves that fit the next letter are allowed until the word is done. Then win the game.",
  how_to_win: "Spell the word with your opening moves, then win.",
  player_side: "black",
  player: { name: 'You', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },   /* iwantcheckmate's own avatar (purple king) from the videos */
  opponent: { "avatar": "assets/modes/SmCty_pVF7A/opponent.png","name": "FeFiFoFimothy", "rating": 2041, "tagline": "Blitz pool opponent"},
  board: {"files": 8, "ranks": 8, "light": "#ebecd0", "dark": "#7fa461"},
  clock: {"w": 180, "b": 180, "inc": 0},
  params: {"words": ["BEEF", "CABBAGE"], "side": "b", "by": "file"},
  vfx: [{ type: 'overlay', at: 'board', image: 'assets/modes/SmCty_pVF7A/intro.jpg', fit: 'contain', duration_ms: 1600, id: 'g5intro' /* video art */ }, { type: 'overlay', at: 'board', image: 'assets/modes/SmCty_pVF7A/rosen_card.jpg', fit: 'contain', delay_ms: 1700, duration_ms: 2200, id: 'g5rosen' /* the Rosen Score card from the video (maxres1) */ }],
  hooks: "g5_spell",
  source: {"research": "research/modes/SmCty_pVF7A.json", "confidence": "high"}
});
