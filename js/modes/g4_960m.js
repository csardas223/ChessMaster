/* g4_960m: identical copy of g4_960.js (loader maps hooks name -> file). */
/* g4_960: Chess960 castling for group-4 modes (setup.random: 'chess960').
   The engine's built-in castling moves the king two squares; Chess960 castling instead puts the king on the g/c file
   and the rook on the f/d file, whatever their start squares. To castle, move the king onto its own rook
   (chess.com 960 convention). Rules: king and that rook unmoved, every square either piece crosses or lands on is empty
   (apart from the two of them), and the king is not in check and does not pass through or land on an attacked square.
   Defines 'g4_960' and 'g4_960m' (the same plus chess.com beginner-bot behaviour: never misses a mate in one). */
(function () {
  'use strict';
  var CM = window.CM;
  function castles960(V, st, out) {
    var g = V.geo, b = st.b, me = st.turn;
    for (var k = 0; k < b.length; k++) {
      var K = b[k]; if (!K || K.c !== me || K.t !== 'K' || K.m) continue;
      if (V.attackedByEnemy(st, k, me)) continue;
      var row = g.row(k);
      for (var r = 0; r < g.files; r++) {
        var rs = g.idx(r, row), R = b[rs]; if (!R || R.c !== me || R.t !== 'R' || R.m) continue;
        var side = r > g.col(k) ? 1 : -1, kt = g.idx(side > 0 ? 6 : 2, row), rt = g.idx(side > 0 ? 5 : 3, row);
        var lo = Math.min(g.col(k), r, 2 + (side > 0 ? 4 : 0), side > 0 ? 5 : 3), hi = Math.max(g.col(k), r, side > 0 ? 6 : 2, side > 0 ? 5 : 3), ok = true;
        for (var c = lo; c <= hi && ok; c++) { var s = g.idx(c, row); if (b[s] && s !== k && s !== rs) ok = false; }
        if (!ok) continue;
        var a = Math.min(g.col(k), g.col(kt)), z = Math.max(g.col(k), g.col(kt));
        for (var c2 = a; c2 <= z && ok; c2++) { var s2 = g.idx(c2, row); if (s2 !== k && V.attackedByEnemy(st, s2, me)) ok = false; }
        if (!ok) continue;
        out.push({ f: k, t: rs, p: 'K', c: me, cap: null, castle: { rf: rs, rt: rt }, c960: { kf: k, rf: rs, kt: kt, rt: rt } });
      }
    }
  }
  var hooks = {
    stockfishOk: true,
    moves: function (V, st, out) {
      var o = out.filter(function (m) { return !m.castle; });
      if (V.rules.castling !== false) castles960(V, st, o);
      return o;
    },
    onMake: function (V, prev, m, n) {
      if (!m.c960) return;
      var c = m.c960, K = prev.b[c.kf], R = prev.b[c.rf];
      [c.kf, c.rf, c.kt, c.rt].forEach(function (s) { n.b[s] = null; });
      n.b[c.kt] = Object.assign({}, K, { m: 1 }); n.b[c.rt] = Object.assign({}, R, { m: 1 });
    }
  };
  CM.defineHooks('g4_960', hooks);
  CM.defineHooks('g4_960m', Object.assign({}, hooks, {
    botPick: function (ctx, L) {
      if (!L.length) return null;
      var MATE = (CM.MATE || 100000) - 1000;
      if (L[0].v >= MATE) return L[0];
      var safe = L.filter(function (x) { return x.v > -MATE; }); if (!safe.length) safe = L;
      return CM.bot.pickByStrength(safe, CM.bot.eloStrength(ctx.opponent.elo || ctx.opponent.rating || 250));
    }
  }));
})();
