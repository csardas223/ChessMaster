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

  /* Solo Chess side panel as in the video (sprite DoImibR93tA_solo_chess_panel.png): title, a row of level squares that
     turn green when cleared (the current one pulses once), and in the speedrun video the leaderboard rows. */
  function fmt(ms) { return Math.floor(ms / 60000) + 'm ' + Math.floor(ms / 1000) % 60 + 's ' + Math.floor(ms % 1000) + 'ms'; }
  function panel(ctx) {
    if (typeof document === 'undefined') return;
    var host = document.getElementById('side'), z = ctx.game._solo; if (!host || !z) return;
    var el = host.querySelector('.g4solo-panel');
    if (!el) { el = document.createElement('div'); el.className = 'g4solo-panel'; host.insertBefore(el, host.firstChild); }
    var cells = '', done = z.t1 ? 10 : z.level - 1;
    for (var i = 1; i <= 10; i++) cells += '<i class="' + (i <= done ? 'on' : i === z.level && !z.t1 ? 'cur' : '') + '"></i>';
    var lb = '';
    if (ctx.params.speedrun) {
      var rows = [['Leaderboard #1', 152833], ['Leaderboard #2', 162933], ['iwantcheckmate', 287430]], best = CM.store.get('g4solo.best', 0);  /* times read off the video's leaderboard (vvCAEWKttT4_leaderboard_row.png) */
      if (best) rows.push(['You (best)', best]);
      rows.sort(function (a, b) { return a[1] - b[1]; });
      lb = '<ol>' + rows.map(function (r) { return '<li' + (r[0] === 'You (best)' ? ' class="me"' : '') + '><span>' + r[0] + '</span><b>' + fmt(r[1]) + '</b></li>'; }).join('') + '</ol>';
    }
    var key = done + '|' + z.level + '|' + lb.length;
    if (el.dataset.k === key) return; el.dataset.k = key;
    el.innerHTML = '<div class="t">Solo Chess</div><div class="lv">' + cells + '</div>' + lb;
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
    setup: function (ctx) { ctx.game._solo = { level: 1, t0: 0, fails: 0 }; load(ctx); var bw = document.getElementById('board-wrap'); if (bw) bw.classList.add('g4solo'); },
    onExit: function () { var bw = document.getElementById('board-wrap'); if (bw) bw.classList.remove('g4solo'); var el = document.querySelector('.g4solo-panel'); if (el) el.remove(); },
    afterMove: function (ctx, m, info) {
      var z = ctx.game._solo; if (!z.t0) z.t0 = performance.now();
      var st = ctx.state, n = count(st);
      if (n === 1) {
        ctx.fx({ type: 'text', text: '\u2714', color: '#81b64c', size: 64, at: 'board', duration_ms: 900 }); ctx.sound('notify');
        if (z.level >= 10) {
          z.t1 = performance.now();
          if (ctx.params.speedrun) { var best = CM.store.get('g4solo.best', 0), run = Math.round(z.t1 - z.t0); if (!best || run < best) CM.store.set('g4solo.best', run); }
          panel(ctx); return;
        }
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
      panel(ctx);
      var dots = ''; for (var i = 1; i <= 10; i++) dots += i < z.level ? '\u25cf' : i === z.level ? '\u25c9' : '\u25cb';
      var t = '';
      if (ctx.params.speedrun && z.t0) { var ms = (z.t1 || performance.now()) - z.t0; t = ' · ' + Math.floor(ms / 60000) + 'm ' + Math.floor(ms / 1000) % 60 + 's ' + Math.floor(ms % 1000) + 'ms'; }
      return 'Level ' + z.level + '/10 ' + dots + t;
    },
  });
  if (typeof document !== 'undefined' && !document.getElementById('g4solo-css')) {
    var css = document.createElement('style'); css.id = 'g4solo-css';
    css.textContent = '.g4solo-done .pc{filter:brightness(.35) grayscale(1)}' +
      /* chess.com Solo Chess shows capture targets as plain grey dots, not rings */
      '.g4solo .sq.is-target-cap::after{background:radial-gradient(rgba(0,0,0,.2) 0,rgba(0,0,0,.2) 21%,transparent 22%)}' +
      '.g4solo-panel{margin:0 0 8px;padding:6px 8px;background:#262421;border-radius:6px;color:#fff;font:600 12px/1.3 system-ui,sans-serif}' +
      '.g4solo-panel .t{text-align:center;margin-bottom:5px}.g4solo-panel .lv{display:flex;gap:4px;justify-content:center}' +
      '.g4solo-panel .lv i{width:16px;height:16px;border-radius:3px;background:#3c3a37;transition:background .25s ease-out}' +
      '.g4solo-panel .lv i.on{background:#81b64c}.g4solo-panel .lv i.cur{box-shadow:inset 0 0 0 2px #81b64c}' +
      '.g4solo-panel ol{list-style:none;margin:6px 0 0;padding:0}.g4solo-panel li{display:flex;justify-content:space-between;padding:2px 0;color:#bdbbb9;font-weight:500}' +
      '.g4solo-panel li b{color:#fff;font-weight:600}.g4solo-panel li.me span{color:#c27ddb}';
    document.head.appendChild(css);
  }
  void seeded;
})();
