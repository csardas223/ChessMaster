/* Can I BEAT Blindfold Chess? Online games on a board that shows no pieces.
   Sources: research/modes/LpfXLa5v9Zk.json, frames: empty board with only last-move highlights and click circles. */
CM.mode({
  id: "LpfXLa5v9Zk",
  name: "Blindfold Chess",
  category: "Variants & Games",
  description: "Your board shows no pieces at all, only the last-move highlights and the legal-move dots when you click a square. Keep the position in your head. Pieces reappear when the game ends.",
  how_to_win: "Checkmate.",
  player_side: "white",
  player: {"name": "You", "rating": 1575},
  opponent: {"name": "Demonek_", "rating": 1500, "tagline": "Blindfold opponent on chess.com"},
  board: {"files": 8, "ranks": 8, "light": "#ecf2d1", "dark": "#7ba059"},
  vfx: [{ type: 'overlay', at: 'board', image: 'assets/modes/LpfXLa5v9Zk/blindfold.png', fit: 'contain', duration_ms: 1600, id: 'g5intro' /* video art */ }],
  hooks: {
    decorate: function (ctx, sq, p) { return p && !ctx.over ? { hidePiece: true } : null; },
    stockfishOk: true
  },
  source: {"notes": "Drag-and-drop needs a visible piece; click a square, then its target.", "research": "research/modes/LpfXLa5v9Zk.json", "confidence": "high"}
});
