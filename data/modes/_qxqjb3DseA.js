/* Can I BEAT the Bad Egg? Rosen Score word opening B-A-D-E-G-G, then win.
   Sources: research/modes/_qxqjb3DseA.json, frames: Aganche82 (2074), animated 'BAD E(GG)' text. */
CM.mode({
  id: "_qxqjb3DseA",
  name: "Rosen Score: Bad Egg",
  category: "Variants & Games",
  description: "Rosen Score \"Bad Egg\": the first letters of your first six moves in notation must spell B-A-D-E-G-G (pawn moves count as their file, piece moves as their letter, so B can be a bishop or b-pawn move). Then win the game.",
  how_to_win: "Spell BADEGG with your opening, then win.",
  player_side: "white",
  player: {"name": "You", "rating": 2059, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },
  opponent: {"name": "Aganche82", "rating": 2074, "tagline": "Online opponent"},
  board: {"files": 8, "ranks": 8, "light": "#eaeed0", "dark": "#759e55"},
  clock: {"w": 180, "b": 180, "inc": 0},
  params: {"words": ["BADEGG"], "side": "w", "by": "san"},
  vfx: [{ type: 'overlay', at: 'board', image: 'assets/modes/_qxqjb3DseA/evil_egg.png', fit: 'contain', duration_ms: 1600, id: 'g5intro' /* video art */ }],
  hooks: "g5_spell",
  source: {"research": "research/modes/_qxqjb3DseA.json", "confidence": "medium"}
});
