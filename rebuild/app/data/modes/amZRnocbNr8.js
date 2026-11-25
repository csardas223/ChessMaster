/* Can I BEAT the Judit Polgar Bots? Bot ladder of Judit Polgar at different ages.
   Sources: research/modes/amZRnocbNr8.json, frames: Age 9 1900, Age 11 2400, Age 15. */
CM.mode({
  id: "amZRnocbNr8",
  name: "Judit Polgar Bots",
  category: "Variants & Games",
  description: "Climb the Judit Polgar bots, each modelled on Judit at a different age. You always have White; beat one to face the next, stronger Judit.",
  how_to_win: "Beat as many Judit bots as you can.",
  player_side: "white",
  board: {"files": 8, "ranks": 8, "light": "#eaedd1", "dark": "#759e55"},
  params: {"ladder": [{"name": "Judit (age 6)", "rating": 1000, "hello": "A game with you? Good luck!", "chat": ["Hmm, let me think.", "I like attacking!"]}, {"name": "Judit (age 9)", "rating": 1900, "chat": ["That was a mistake.", "My sisters play like this too."]}, {"name": "Judit (age 11)", "rating": 2400, "chat": ["Too slow.", "Happy Valentine's Day. Here is a sacrifice."]}, {"name": "Judit (age 15)", "rating": 2700, "chat": ["Youngest grandmaster, remember?"]}]},
  hooks: "g5_ladder",
  source: {"notes": "Age 9 (1900) and age 11 (2400) from the frames; ages 6 and 15 ratings are estimates. Chat lines are original.", "research": "research/modes/amZRnocbNr8.json", "confidence": "medium"}
});
