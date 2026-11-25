/* How Fast Can I BEAT Beginner Bots? Speedrun through the beginner bot ladder 250-850 with a running timer.
   Sources: research/modes/DB81BuB6CdM.json, frames: brown board, big green timer (4:57.50, 13:15.48). */
CM.mode({
  id: "DB81BuB6CdM",
  name: "Beginner Bot Speedrun",
  category: "Variants & Games",
  description: "Beat the five beginner bots in a row (250, 400, 550, 700, 850) as fast as you can. A speedrun timer runs across all five games; beating a bot moves you to the next one.",
  how_to_win: "Checkmate all five bots; the lower the total time, the better.",
  player_side: "white",
  board: {"files": 8, "ranks": 8, "light": "#ebd9b5", "dark": "#b08666"},
  messages: {"win_title": "Bot Down!"},
  params: {"speedrun": true, "chatChance": 0, "ladder": [{"name": "Martin", "rating": 250}, {"name": "Beginner Bot 400", "rating": 400}, {"name": "Beginner Bot 550", "rating": 550}, {"name": "Beginner Bot 700", "rating": 700}, {"name": "Beginner Bot 850", "rating": 850}]},
  vfx: [{ type: 'overlay', at: 'board', image: 'assets/modes/DB81BuB6CdM/speed_timer.png', fit: 'contain', duration_ms: 1600, id: 'g5intro' /* video art */ }],
  hooks: "g5_ladder",
  source: {"notes": "Bot names after Martin (250) are not legible in the research; shown by rating.", "research": "research/modes/DB81BuB6CdM.json", "confidence": "high"}
});
