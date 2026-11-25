/* Can I BEAT RuneScape Chess Bots? Normal chess vs RuneScape-themed bots of rising strength.
   Sources: research/modes/G4zH8iKfIi0.json, frames: tan/grey stone board, intro cards 300 ... 3150. */
CM.mode({
  id: "G4zH8iKfIi0",
  name: "RuneScape Bots",
  category: "Variants & Games",
  description: "Normal chess against the RuneScape-themed bots in order: the goblins Bentnoze and Wartface, Bob the Cat, Sloke, and finally the wizard. Beat one to face the next.",
  how_to_win: "Checkmate each bot; the wizard is rated 3150.",
  player_side: "white",
  board: {"files": 8, "ranks": 8, "light": "#ebdbb8", "dark": "#aa9a7a"},
  params: {"ladder": [{"name": "Bentnoze and Wartface", "rating": 300, "hello": "Us goblins will smash you!", "chat": ["Smash!", "Dis is goblin chess.", "Bentnoze move! No, Wartface move!"]}, {"name": "Bob the Cat", "rating": 1350, "hello": "Meow.", "chat": ["Meow.", "Purr...", "*knocks a piece off the table*"]}, {"name": "Sloke", "rating": 1800, "chat": ["Hmph.", "Interesting."]}, {"name": "The Wizard", "rating": 3150, "hello": "You dare challenge a wizard?", "chat": ["A simple spell.", "Your king is doomed."]}]},
  hooks: "g5_ladder",
  source: {"notes": "Bot chat lines are original flavour text; names and ratings from the frames.", "research": "research/modes/G4zH8iKfIi0.json", "confidence": "high"}
});
