/* Can I Beat The SINTA Bot? Normal chess vs a Santa bot with a hidden rating and Christmas chat.
   Sources: research/modes/QXSrAkEF744.json, frames: brown board, 'Ho...ho...ho...' bubble. */
CM.mode({
  id: "QXSrAkEF744",
  name: "SINTA Bot",
  category: "Variants & Games",
  description: "Normal chess against chess.com's holiday SINTA bot: a creepy Santa with a hidden rating who plays far stronger than his smile suggests.",
  how_to_win: "Checkmate SINTA and get off the naughty list.",
  player_side: "white",
  board: {"files": 8, "ranks": 8, "light": "#ebd9b0", "dark": "#b08665"},
  params: {"ladder": [{"name": "SINTA", "rating": null, "elo": 2450, "tagline": "Rating: !!", "hello": "I see when you're sleeping, and I know when you're awake.", "chat": ["Ho... ho... ho...", "I see when you're sleeping.", "I know when you're awake.", "Have you been naughty or nice?"], "lose": "You've earned a spot on the naughty list. Ho ho ho!"}]},
  hooks: "g5_ladder",
  source: {"notes": "Strength ~2450 from the creator's estimate (2400-2500); rating hidden like the bot card.", "research": "research/modes/QXSrAkEF744.json", "confidence": "high"}
});
