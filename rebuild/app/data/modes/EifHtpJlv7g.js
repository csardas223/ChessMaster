/* Can I SURVIVE Fog of War? chess.com Fog of War vs ~1600-1800 humans.
   Sources: research/modes/EifHtpJlv7g.json (no check warning, capture the king), frames: grey fog over unseen squares, mint0x (1803). */
CM.mode({
  id: "EifHtpJlv7g",
  name: "Fog of War",
  category: "Variants & Games",
  description: "You only see your own pieces and the squares they can move to; everything else is hidden in fog. Nobody tells you when you are in check, and kings can be captured.",
  how_to_win: "Capture the enemy king.",
  player_side: "white",
  player: {"name": "You", "rating": 1590},
  opponent: {"name": "mint0x", "rating": 1803, "tagline": "Fog of War opponent on chess.com"},
  board: {"files": 8, "ranks": 8, "light": "#ebf2d1", "dark": "#7a9f58"},
  rules: {"fog": true, "check": "none"},
  bot: {"engine": "search", "elo": 1800, "depth": 3, "time_ms": 650},
  messages: {"win": "you captured the king in the fog"},
  source: {"notes": "The bot sees the whole board (no hidden-information play). The opponent's last-move highlight stays visible as in the video.", "research": "research/modes/EifHtpJlv7g.json", "confidence": "high"}
});
