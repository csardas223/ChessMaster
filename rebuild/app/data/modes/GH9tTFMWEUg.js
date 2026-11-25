/* 2 eggs are better than 1: Rosen Score "Double Egg" - your first six moves must spell E-G-G-E-G-G, then win. Sources: research/modes/GH9tTFMWEUg.json, research/frames. Generated for impl group 3. */
CM.mode({
  id: "GH9tTFMWEUg",
  title: "2 eggs are better than 1 (probably)",
  name: "Double Egg",
  category: "Challenges & Odds",
  description: "A Rosen Score trophy hunt: the first letters of your first six moves must spell EGG EGG (e-pawn, g-pawn, g-pawn, e-pawn, g-pawn, g-pawn). Captures count by the moving piece. The trophy only counts if you go on to win against a ~2000 player.",
  how_to_win: "Spell EGGEGG with your opening moves, then win the game.",
  player_side: "white",
  opponent: {
    "name": "Online opponent",
    "rating": 2000,
    "avatar": "assets/modes/uUXev8TPVak/human.svg",
    "tagline": "~2000-rated online player"
  },
  board: {
    "files": 8,
    "ranks": 8
  },
  theme: {
    "light": "#eeeed2",
    "dark": "#769656"
  },
  setup: {
    "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR"
  },
  params: {
    "word": "EGGEGG",
    "side": "w"
  },
  hooks: "g6_rosen",
  todo_pass2: ["30s bullet clock option (the video plays 30-second bullet)"],
  vfx_timeline: [{ trigger: "win", effect: { type: "overlay", image: "assets/modes/GH9tTFMWEUg/trophy.svg", at: "board", fit: "contain", opacity: 0.95, duration_ms: 2600, fade_ms: 300 }, sound: "promote" }],
  source: {
    "confidence": "high",
    "notes": "Uses the shared Rosen Score hooks (js/modes/g6_rosen.js). The video plays 30-second bullet vs humans; no clock here.",
    "research": "research/modes/GH9tTFMWEUg.json"
  }
});
