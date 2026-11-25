/* Can I BEAT Battle Chess? Standard chess with animated combat on captures; six AI levels Peasant -> Monarch.
   Sources: research/modes/IbRrzKtieqs.json, frames: marble 3D board, fight cutscenes. */
CM.mode({
  id: "IbRrzKtieqs",
  name: "Battle Chess",
  category: "Variants & Games",
  description: "Normal chess where every capture turns into a fight. Climb the Battle Chess AI levels in order: Peasant, Farmer, Artisan, Nobleman, Clergyman and Monarch.",
  how_to_win: "Checkmate each AI level to unlock the next.",
  player_side: "white",
  board: {"files": 8, "ranks": 8, "light": "#d6d6d2", "dark": "#5c5c58"},
  vfx_timeline: [{"trigger": "capture", "effects": [{"type": "particles", "kind": "sparks", "at": "to", "count": 22}, {"type": "flash", "at": "to", "color": "#ffd25a", "opacity": 0.45, "duration_ms": 260}]}, {"trigger": "castle", "effect": {"type": "text", "text": "Fist bump!", "at": "to", "color": "#fff", "duration_ms": 1000}}, {"trigger": "promotion", "effect": {"type": "particles", "kind": "gold", "at": "to", "count": 26}}],
  params: {"chatChance": 0, "ladder": [{"name": "Peasant", "rating": 400}, {"name": "Farmer", "rating": 800}, {"name": "Artisan", "rating": 1200}, {"name": "Nobleman", "rating": 1600}, {"name": "Clergyman", "rating": 2000}, {"name": "Monarch", "rating": 2500}]},
  vfx: [{ type: 'overlay', at: 'board', image: 'assets/modes/IbRrzKtieqs/intro.jpg', fit: 'contain', duration_ms: 1600, id: 'g5intro' /* video art */ }],
  hooks: "g5_ladder",
  source: {"notes": "Level ratings are estimates (the game shows names only). Combat cutscenes are reduced to sparks on captures.", "research": "research/modes/IbRrzKtieqs.json", "confidence": "medium"}
});
