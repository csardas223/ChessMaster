/* Can I BEAT the Judit Polgar Bots? Bot ladder of Judit Polgar at different ages.
   Sources: research/modes/amZRnocbNr8.json, frames: Age 9 1900, Age 11 2400, Age 15. */
CM.mode({
  id: "amZRnocbNr8",
  name: "Judit Polgar Bots",
  category: "Variants & Games",
  description: "Climb the Judit Polgar bots, each modelled on Judit at a different age. You always have White; beat one to face the next, stronger Judit.",
  how_to_win: "Beat as many Judit bots as you can.",
  player_side: "white",
  player: { name: 'You', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },   /* iwantcheckmate's own avatar (purple king) from the videos */
  opponent: { avatar: 'assets/modes/amZRnocbNr8/opponent.png' },
  board: {"files": 8, "ranks": 8, "light": "#eaedd1", "dark": "#759e55"},
  params: {"ladder": [{"name": "Judit (age 6)", "rating": 1000, "avatar": "assets/modes/amZRnocbNr8/opponent.png", "hello": "A game with you? Good luck!", "chat": ["Hmm, let me think.", "I like attacking!"]}, {"name": "Judit (age 9)", "rating": 1900, "avatar": "assets/modes/amZRnocbNr8/judit9.png", "chat": ["That was a mistake.", "My sisters play like this too."]}, {"name": "Judit (age 11)", "rating": 2400, "avatar": "assets/modes/amZRnocbNr8/judit11.png", "chat": ["Too slow.", "Happy Valentine's Day. Here is a sacrifice."]}, {"name": "Judit (age 15)", "rating": 2700, "avatar": "assets/modes/amZRnocbNr8/judit15.png", "chat": ["Youngest grandmaster, remember?"]}]},
  vfx: [{ type: 'overlay', at: 'board', image: 'assets/modes/amZRnocbNr8/intro.jpg', fit: 'contain', duration_ms: 1600, id: 'g5intro' /* video art */ }],
  hooks: "g5_ladder",
  source: {"notes": "Age 9 (1900) and age 11 (2400) from the frames; ages 6 and 15 ratings are estimates. Chat lines are original.", "research": "research/modes/amZRnocbNr8.json", "confidence": "medium"}
});
