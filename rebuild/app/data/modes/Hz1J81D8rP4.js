/* Can I BEAT Martin with Castling Checkmate? Normal chess vs Martin (250); the win only counts if castling delivers mate.
   Sources: research/modes/Hz1J81D8rP4.json (O-O mate with the rook after Qg8), frames: brown board, Martin (250). */
CM.mode({
  id: "Hz1J81D8rP4",
  name: "Castling Checkmate",
  category: "Variants & Games",
  description: "Normal chess against Martin, but the game only counts if your final move is castling that delivers checkmate. Never move your king, keep a rook unmoved, and avoid stalemate.",
  how_to_win: "Checkmate Martin with O-O or O-O-O. Moving your king, moving both rooks, or castling without mate fails the challenge.",
  player_side: "white",
  player: {"name": "You", "rating": 2171},
  opponent: { "avatar": "assets/modes/Hz1J81D8rP4/martin_wheel.png","name": "Martin", "rating": 250, "tagline": "The wheel always lands on Martin."},
  board: {"files": 8, "ranks": 8, "light": "#ecd9b6", "dark": "#b58667"},
  bot: {"engine": "search", "elo": 250, "depth": 3, "time_ms": 500},
  messages: {"win_title": "Brilliant!!"},
  vfx: [{ type: 'overlay', at: 'board', image: 'assets/modes/Hz1J81D8rP4/castle_mate.png', fit: 'contain', duration_ms: 1600, id: 'g5intro' /* video art */ }],
  hooks: {
    onMake: function (V, st, m, n) { n.x.castleNow = !!(m.castle && m.c === 'w'); if (m.castle && m.c === 'w') n.x.castled = 1; },
    checkWin: function (V, st, moves) {
      if (st.turn === 'b' && !moves.length && V.inCheck(st, 'b')) return st.x.castleNow ? { w: 'w', why: 'checkmate by castling' } : { w: 'd', why: 'checkmate, but not by castling: challenge failed' };
      if (st.x.castled) return { w: 'b', why: 'you castled without checkmate: challenge failed' };
      var b = st.b, k = b[60], ok = function (i) { return b[i] && b[i].t === 'R' && b[i].c === 'w' && !b[i].m; };
      if (!k || k.t !== 'K' || k.c !== 'w' || k.m) return { w: 'b', why: 'your king moved: challenge failed' };
      if (!ok(56) && !ok(63)) return { w: 'b', why: 'both rooks moved: challenge failed' };
      return null;
    },
    status: function (ctx) { return 'Goal: checkmate by castling. Keep the king and a rook unmoved.'; }
  },
  source: {"notes": "Non-castling checkmate scored as a draw (challenge not completed) - inferred.", "research": "research/modes/Hz1J81D8rP4.json", "confidence": "high"}
});
