/* g4_solo: chess.com Solo Chess (group 4: DoImibR93tA "I Played With Myself", vvCAEWKttT4 "... COMPETITIVELY").
   Only your own white pieces are on the board. Every move must capture one of your own pieces; each piece may capture
   at most twice (then it greys out); a King can never be captured and must be the last piece if it is on the board.
   Leave exactly one piece to clear the level. Levels 1-10 get more cluttered (level n has n + 2 pieces). Positions are
   generated backwards from a single piece (un-capturing), so every level is solvable.
   params.speedrun: true shows a run timer (starts on the first move, stops when level 10 is cleared).
   No opponent: White keeps the move (rules.movesPerTurn), the side panel shows the level dots. */
(function () {
  'use strict';
  var CM = window.CM;
  var TYPES = ['N', 'B', 'R', 'Q', 'P'];
  var VEC = {
    N: [[1, 2], [2, 1], [-1, 2], [-2, 1], [1, -2], [2, -1], [-1, -2], [-2, -1]],
    B: [[1, 1], [1, -1], [-1, 1], [-1, -1]], R: [[1, 0], [-1, 0], [0, 1], [0, -1]],
    K: [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]
  };
  VEC.Q = VEC.K;
  var SLIDE = { B: 1, R: 1, Q: 1 };

  /* squares (col,row) from which a piece of type t captures onto (c,r); row 0 = top (rank 8) */
  function origins(t, c, r, occ) {
    var o = [];
    if (t === 'P') { [[-1, 1], [1, 1]].forEach(function (d) { var x = c + d[0], y = r + d[1]; if (x >= 0 && x < 8 && y >= 0 && y < 7) o.push([x, y]); }); return o; }
    VEC[t].forEach(function (d) {
      var x = c, y = r;
      for (var s = 0; s < 8; s++) {
        x -= d[0]; y -= d[1]; if (x < 0 || x > 7 || y < 0 || y > 7) break;
        if (occ[y * 8 + x]) break;
        o.push([x, y]);
        if (!SLIDE[t]) break;
      }
    });
    return o;
  }
  function generate(n, rnd) {
    for (var tries = 0; tries < 400; tries++) {
      var occ = {}, caps = {}, withKing = rnd() < 0.35;
      var first = withKing ? 'K' : TYPES[Math.floor(rnd() * 4)];
      var s0 = Math.floor(rnd() * 64); if (first === 'P' && (s0 < 8 || s0 >= 56)) continue;
      occ[s0] = first; caps[s0] = 0;
      var ok = true;
      for (var k = 1; k < n && ok; k++) {
        var cand = Object.keys(occ).filter(function (q) { return caps[q] < 2; });
        ok = false;
        for (var a = 0; a < 30 && !ok; a++) {
          var at = +cand[Math.floor(rnd() * cand.length)], t = occ[at];
          var o = origins(t, at % 8, Math.floor(at / 8), occ);
          if (!o.length) continue;
          var from = o[Math.floor(rnd() * o.length)], fi = from[1] * 8 + from[0];
          var victim = TYPES[Math.floor(rnd() * TYPES.length)];
          if (victim === 'P' && (at < 8 || at >= 56)) victim = 'N';
          if (t === 'P' && (fi < 8 || fi >= 56 || at < 8)) continue;
          occ[fi] = t; caps[fi] = caps[at] + 1; occ[at] = victim; caps[at] = 0; ok = true;
        }
      }
      if (!ok) continue;
      /* caps[] counted backwards = captures this piece will make; must be <= 2 (guaranteed by the filter) */
      return occ;
    }
    return { 27: 'R', 31: 'N' };
  }
  function seeded(seed) { var s = seed >>> 0; return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
  function fenOf(occ) {
    var rows = [];
    for (var r = 0; r < 8; r++) { var row = '', e = 0; for (var c = 0; c < 8; c++) { var t = occ[r * 8 + c]; if (!t) { e++; continue; } if (e) { row += e; e = 0; } row += t; } if (e) row += e; rows.push(row); }
    return rows.join('/');
  }
  function count(st) { var n = 0; st.b.forEach(function (p) { if (p && p.c === 'w') n++; }); return n; }
  function load(ctx) {
    var z = ctx.game._solo, occ = generate(z.level + 2, Math.random);
    ctx.state = CM.spec.initialState(ctx.V, Object.assign({}, ctx.spec, { setup: { fen: fenOf(occ), turn: 'w' } }));
    ctx.state.x = { solo: 1 };
  }

  CM.defineHooks('g4_solo', {
    /* only captures of your own pieces; at most 2 captures per piece; never capture the King */
    filterMoves: function (V, st, legal) {
      return legal.filter(function (m) { var p = st.b[m.f]; return m.cap && m.cap.c === p.c && (p.k || 0) < 2 && m.cap.t !== 'K'; });
    },
    onMake: function (V, st, m, n) { if (m.cap) { var p = n.b[m.t]; n.b[m.t] = Object.assign({}, p, { k: (st.b[m.f].k || 0) + 1 }); } },
    checkWin: function (V, st, moves) {
      if (!st.x.solo) return null;
      var n = count(st); if (n <= 1) return { w: 'w', why: 'one piece left' };
      if (!moves.length) return { w: 'b', why: 'no captures left with ' + n + ' pieces on the board' };
      return null;
    },
    setup: function (ctx) { ctx.game._solo = { level: 1, t0: 0, fails: 0 }; load(ctx); },
    afterMove: function (ctx, m, info) {
      var z = ctx.game._solo; if (!z.t0) z.t0 = performance.now();
      var st = ctx.state, n = count(st);
      if (n === 1) {
        ctx.fx({ type: 'text', text: '\u2714', color: '#81b64c', size: 64, at: 'board', duration_ms: 900 }); ctx.sound('notify');
        if (z.level >= 10) { z.t1 = performance.now(); return; }
        return new Promise(function (res) { setTimeout(function () { z.level++; load(ctx); res(); }, 900); });
      }
      if (!ctx.V.legal(st).length) {
        z.fails++; ctx.toast('Stuck! Level ' + z.level + ' restarts.');
        return new Promise(function (res) { setTimeout(function () { load(ctx); res(); }, 1000); });
      }
    },
    decorate: function (ctx, sq, p) { if (p && (p.k || 0) >= 2) return { cls: 'g4solo-done' }; return null; },
    status: function (ctx) {
      var z = ctx.game._solo; if (!z) return null;
      var dots = ''; for (var i = 1; i <= 10; i++) dots += i < z.level ? '\u25cf' : i === z.level ? '\u25c9' : '\u25cb';
      var t = '';
      if (ctx.params.speedrun && z.t0) { var ms = (z.t1 || performance.now()) - z.t0; t = ' · ' + Math.floor(ms / 60000) + 'm ' + Math.floor(ms / 1000) % 60 + 's ' + Math.floor(ms % 1000) + 'ms'; }
      return 'Level ' + z.level + '/10 ' + dots + t;
    },
  });
  if (typeof document !== 'undefined' && !document.getElementById('g4solo-css')) {
    var css = document.createElement('style'); css.id = 'g4solo-css';
    css.textContent = '.g4solo-done .pc{filter:brightness(.35) grayscale(1)}';
    document.head.appendChild(css);
  }
  void seeded;
})();
