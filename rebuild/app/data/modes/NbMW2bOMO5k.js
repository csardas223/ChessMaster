/* Can I BEAT Killer King? Normal blitz chess where only a checkmate delivered by a king move counts.
   Sources: research/modes/NbMW2bOMO5k.json, frames: tyrenakka85 (2113), 5-minute clocks. */
CM.mode({
  id: "NbMW2bOMO5k",
  name: "Killer King",
  category: "Variants & Games",
  description: "Normal 5-minute chess, hunting chess.com's Killer King award: the checkmating move must be made by your king, for example a king step that uncovers a discovered mate.",
  how_to_win: "Checkmate with a king move. Any other checkmate is scored as a draw (no award).",
  player_side: "white",
  player: {"name": "You", "rating": 2118},
  opponent: {"name": "tyrenakka85", "rating": 2113, "tagline": "Blitz opponent on chess.com"},
  board: {"files": 8, "ranks": 8, "light": "#eaedd0", "dark": "#759d54"},
  clock: {"w": 300, "b": 300, "inc": 0},
  messages: {"win_title": "Killer King!"},
  vfx: [{ type: 'overlay', at: 'board', image: 'assets/modes/NbMW2bOMO5k/killer_king_award.png', fit: 'contain', duration_ms: 1600, id: 'g5intro' /* video art */ }],
  hooks: {
    onMake: function (V, st, m, n) { n.x.kmove = !!(m.c === 'w' && V.def(m.p).royal); },
    checkWin: function (V, st, moves) {
      if (st.turn === 'b' && !moves.length && V.inCheck(st, 'b')) return st.x.kmove ? { w: 'w', why: 'checkmate with a king move' } : { w: 'd', why: 'checkmate, but not by the king (no award)' };
      return null;
    }
  },
  source: {"notes": "A non-king checkmate is scored as a draw to reflect \"the game only counts\" - inferred.", "research": "research/modes/NbMW2bOMO5k.json", "confidence": "high"}
});
