/* Can I BEAT Gothic Chess?  10x8 board with a Chancellor (rook + knight) and an Archbishop (bishop + knight) per side.
   Setup R N B Q C K A B N R. Castling moves the king three squares toward the rook. Pawns may also promote to Chancellor
   or Archbishop. Sources: research/modes/yXE14E0QKNI.json (2:34 castling, 9:32 promotion to a Chancellor). */
CM.mode({
  id: 'yXE14E0QKNI',
  name: 'Gothic Chess',
  category: 'Variants & Games',
  description: 'Chess on a 10x8 board with two extra pieces each: the Chancellor (moves as rook or knight) and the Archbishop (bishop or knight). Castling moves the king three squares toward the rook, which lands on the other side of it. Pawns can promote to any piece, including the new ones.',
  how_to_win: 'Checkmate.',
  player_side: 'white',
  opponent: { name: 'professork', rating: 1500, avatar: null, tagline: 'Online Gothic Chess player.' },
  board: { files: 10, ranks: 8, light: '#ebecd0', dark: '#739552' },
  setup: { fen: 'rnbqckabnr/pppppppppp/10/10/10/10/PPPPPPPPPP/RNBQCKABNR' },
  rules: { promotion: { choices: ['Q', 'C', 'A', 'R', 'B', 'N'] } },
  clock: { w: 300, b: 300, inc: 0 },
  bot: { engine: 'search', elo: 1500, depth: 3, time_ms: 800 },
  hooks: {
    /* the engine castles two squares; Gothic castling moves the king three */
    moves: function (V, st, out) {
      var g = V.geo;
      for (var k = out.length - 1; k >= 0; k--) {
        var m = out[k]; if (!m.castle) continue;
        var dir = g.col(m.t) > g.col(m.f) ? 1 : -1, kt = g.step(m.f, 3 * dir, 0), rt = g.step(m.f, 2 * dir, 0);
        var ok = kt >= 0 && rt >= 0 && (!st.b[kt] || kt === m.castle.rf) && (!st.b[rt] || rt === m.castle.rf);
        for (var s = 1; s <= 3 && ok; s++) { var j = g.step(m.f, s * dir, 0); if (s < 3 && V.attackedByEnemy(st, j, m.c)) ok = false; }
        if (!ok) { out.splice(k, 1); continue; }
        out[k] = Object.assign({}, m, { t: kt, castle: { rf: m.castle.rf, rt: rt } });
      }
    }
  },
  vfx_timeline: [{ trigger: 'game_start', once: true, effect: { type: 'overlay', image: 'assets/modes/yXE14E0QKNI/intro.jpg', fit: 'contain', at: 'board', opacity: 1, duration_ms: 1600, fade_ms: 300 } }],
  source: { research: 'research/modes/yXE14E0QKNI.json', confidence: 'high' }
});
