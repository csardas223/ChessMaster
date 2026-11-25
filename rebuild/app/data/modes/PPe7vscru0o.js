/* Can I SURVIVE King of the Hill? King to d4/e4/d5/e5 wins (player Black in game 1).
   Sources: research/modes/PPe7vscru0o.json, frames: shaded centre squares, theturk222 (1667). */
CM.mode({
  id: "PPe7vscru0o",
  name: "King of the Hill",
  category: "Variants & Games",
  description: "Normal chess, plus a second way to win: move your king onto one of the four centre squares (d4, e4, d5, e5).",
  how_to_win: "Reach the hill with your king, or checkmate.",
  player_side: "black",
  player: {"name": "You", "rating": 1640},
  opponent: {"name": "theturk222", "rating": 1667, "tagline": "King of the Hill opponent on chess.com"},
  board: {"files": 8, "ranks": 8, "light": "#ecf2d1", "dark": "#7a9f58", "squares": {"d4": {"color": "rgba(255, 196, 0, 0.28)"}, "e4": {"color": "rgba(255, 196, 0, 0.28)"}, "d5": {"color": "rgba(255, 196, 0, 0.28)"}, "e5": {"color": "rgba(255, 196, 0, 0.28)"}}},
  rules: {"win": [{"type": "checkmate"}, {"type": "reach", "squares": "d4 e4 d5 e5", "piece": "K", "why": "the king reached the hill"}]},
  bot: {"engine": "search", "elo": 1667, "depth": 4, "time_ms": 650},
  vfx: [{ type: 'overlay', at: 'board', image: 'assets/modes/PPe7vscru0o/hill_icon.png', fit: 'contain', duration_ms: 1600, id: 'g5intro' /* video art */ }],
  source: {"research": "research/modes/PPe7vscru0o.json", "confidence": "high"}
});
