/* g5_seirawan: Seirawan chess (S-chess). Each side starts with a Hawk (H, bishop + knight) and an Elephant (E, rook +
   knight) in reserve. When a piece on its own back rank moves for the first time, the player may put one reserve
   piece on the square it just left, as part of the same move ("gating"). Once every original back-rank piece has
   moved, unused reserves can no longer enter. Pawns may also promote to Hawk or Elephant.
   Gating is offered through the promotion picker: moving an unmoved back-rank piece shows the piece itself (no gate),
   the Hawk and the Elephant. When castling, the reserve piece goes on the king's square (gating on the rook's square
   is not offered). Reserves live in state.x.res = { w: 'HE', b: 'HE' }. */
(function () {
  'use strict';
  CM.defineHooks('g5_seirawan', {
    moves: function (V, st, out) {
      var me = st.turn, res = (st.x.res || {})[me] || '', g = V.geo, extra = [];
      if (!res) return out;
      for (var k = 0; k < out.length; k++) {
        var m = out[k]; if (m.drop || m.promo || m.f < 0) continue;
        var p = st.b[m.f]; if (!p || p.m || g.relRow(m.f, me) !== 0 || V.def(p.t).pawn) continue;
        m.promo = m.p; m.gateOpt = 1;   /* "no gate" option, shown as the moving piece itself */
        for (var r = 0; r < res.length; r++) extra.push(Object.assign({}, m, { promo: res[r], gate: res[r] }));
      }
      return extra.length ? out.concat(extra) : out;
    },
    onMake: function (V, st, m, n) {
      if (!m.gateOpt && !m.gate) return;
      var q = n.b[m.t]; if (q) { q = Object.assign({}, q, { t: m.p }); delete q.promoted; n.b[m.t] = q; }
      if (m.gate) {
        n.b[m.f] = V.piece(m.gate, m.c, { m: 1 });
        var res = Object.assign({}, st.x.res); res[m.c] = res[m.c].replace(m.gate, ''); n.x.res = res;
      }
    },
    evaluate: function (V, st) {
      /* unused reserves are worth something only while they can still enter */
      var g = V.geo, v = 0, res = st.x.res || {};
      ['w', 'b'].forEach(function (c) {
        var open = 0; for (var i = 0; i < st.b.length; i++) { var p = st.b[i]; if (p && p.c === c && !p.m && g.relRow(i, c) === 0 && !V.def(p.t).pawn) open++; }
        var r = res[c] || '', val = open ? r.length * 380 : 0; v += c === 'w' ? val : -val;
      });
      return v;
    },
    status: function (ctx) {
      var r = (ctx.x.res || {})[ctx.human] || '', names = { H: 'Hawk', E: 'Elephant' };
      return r ? 'Your reserve: ' + r.split('').map(function (t) { return names[t] || t; }).join(', ') + '. Move a back-rank piece for the first time to gate it in.' : null;
    }
  });
})();
