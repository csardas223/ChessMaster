/* Can I BEAT Soko Chess?  Soko Chess (Steam): Sokoban with chess pieces. Move your white piece with its normal chess move;
   running into a black pawn pushes it one square further (if that square is free). Push every black pawn onto a red
   target. Black pawns still capture diagonally (one square down the board) as soon as one of your pieces stands where
   they attack, and losing your last piece restarts the level. Unlimited undo, restart any time (New game).
   Sources: research/modes/7lEglazTlo8.json, frames visual_* (purple tiles #a193f3/#894bdb, level titles such as
   "LEVEL 4 CUNNING PAWNS", red target squares). The real level layouts are not readable from the frames: these six
   levels are original designs in the same style, each checked solvable with a BFS solver (3-10 moves). */
(function () {
  'use strict';
  var LEVELS = [["Humble Beginning", "********/*6*/*6*/*6*/*1[sp]4*/*4R1*/*6*/********", "c6"], ["Two Steps", "********/*6*/*6*/*2[sp]1[sp]1*/*6*/*6*/*R5*/********", "d7 f3"], ["Mind the Diagonal", "8/8/8/2[sp]2[sp]2/8/8/4R3/8", "b7 g7"], ["Corner Push", "**6/*7/4[sp]3/8/3[sp]4/8/1R6/8", "c6 f3"], ["Cunning Pawns", "8/8/3[sp]4/4[sp]3/8/1[sp]6/5R2/8", "d7 c5 b2"], ["Bishop Arrives", "********/*6*/*6*/*2[sp]3*/*3[sp]2*/*6*/*B4R*/********", "c7 f3"]];
  var DIRS = { R: [[1, 0], [-1, 0], [0, 1], [0, -1]], B: [[1, 1], [1, -1], [-1, 1], [-1, -1]] };
  DIRS.Q = DIRS.R.concat(DIRS.B);
  function gen(V, st, i, p, out) {
    var g = V.geo;
    (DIRS[p.t] || []).forEach(function (d) {
      var j = i;
      while (true) {
        j = g.step(j, d[0], d[1]); if (j < 0) break; var q = st.b[j];
        if (!q) { out.push({ f: i, t: j, p: p.t, c: p.c, cap: null }); continue; }
        if (q.t === 'SP') { var k = g.step(j, d[0], d[1]); if (k >= 0 && !st.b[k]) out.push({ f: i, t: j, p: p.t, c: p.c, cap: null, push: k }); }
        break;
      }
    });
  }
  function targets(ctx) { return ctx.geo.parseList(LEVELS[ctx.game._soko.k][2]); }
  function load(ctx) {
    var z = ctx.game._soko, L = LEVELS[z.k];
    ctx.state = CM.spec.initialState(ctx.V, Object.assign({}, ctx.spec, { setup: { fen: L[1], turn: 'w' } }));
    ctx.state.x = { soko: z.k };
    ctx.toast('LEVEL ' + (z.k + 1) + ' \u00b7 ' + L[0].toUpperCase());
  }
  CM.mode({
    id: '7lEglazTlo8',
    title: 'Can I BEAT Soko Chess?',
    name: 'Soko Chess',
    category: 'Other Videos',
    description: 'Sokoban with chess pieces. Your rook (and later a bishop) moves normally, and running into a black pawn pushes it one square further if that square is free. Push every black pawn onto a red target. Careful: black pawns still capture diagonally downward if you stop on a square they attack. Undo as much as you like; New game restarts the level.',
    how_to_win: 'Push all black pawns onto the red targets on every level (6 levels).',
    player_side: 'white',
    opponent: { name: 'Soko Chess', rating: null, tagline: 'Puzzle levels, no opponent.' },
    board: { files: 8, ranks: 8, light: '#a193f3', dark: '#894bdb' },
    theme: { background: '#5b3aa8' },
    pieces: {
      R: { name: 'Rook', moves: '', gen: 'sokoGen', value: 500 },
      B: { name: 'Bishop', moves: '', gen: 'sokoGen', value: 330 },
      Q: { name: 'Queen', moves: '', gen: 'sokoGen', value: 900 },
      SP: { name: 'Black pawn', moves: '', glyph: 'P', value: 100, capturable: false }
    },
    setup: { fen: LEVELS[0][1] },
    rules: { check: 'none', castling: false, enPassant: false, promotion: false, movesPerTurn: { w: 9999, b: 1 }, drawPlies: 9999 },
    bot: { engine: 'random' },
    params: { levels: LEVELS.length },
    hooks: {
      sokoGen: gen,
      onMake: function (V, st, m, n) {
        if (m.push != null) n.b[m.push] = Object.assign({}, st.b[m.t]);
        var g = V.geo, b = n.b;
        for (var i = 0; i < b.length; i++) {
          if (!b[i] || b[i].t !== 'SP') continue;
          for (var s = -1; s <= 1; s += 2) {
            var j = g.step(i, s, 1);
            if (j >= 0 && b[j] && b[j].c === 'w') { b[j] = b[i]; b[i] = null; n.x = Object.assign({}, n.x, { took: j }); return; }
          }
        }
      },
      checkWin: function () { return null; },
      setup: function (ctx) { ctx.game._soko = { k: 0 }; load(ctx); },
      afterMove: function (ctx) {
        var st = ctx.state, T = targets(ctx), done = T.every(function (t) { return st.b[t] && st.b[t].t === 'SP'; });
        var alive = st.b.some(function (p) { return p && p.c === 'w'; });
        if (st.x.took != null) { ctx.fx({ type: 'flash', at: ctx.name(st.x.took), color: '#ff4a4a', duration_ms: 500 }); ctx.sound('capture'); }
        if (done) {
          ctx.sound('notify'); ctx.fx({ type: 'text', text: 'LEVEL COMPLETE', color: '#ffffff', size: 34, at: 'board', duration_ms: 1100 });
          var z = ctx.game._soko;
          if (z.k + 1 >= LEVELS.length) { return new Promise(function (r) { setTimeout(function () { ctx.endGame('player', 'all ' + LEVELS.length + ' levels cleared'); r(); }, 900); }); }
          return new Promise(function (r) { setTimeout(function () { z.k++; load(ctx); r(); }, 1100); });
        }
        if (!alive || !ctx.V.legal(st).length) { ctx.toast('Captured! Restarting the level.'); return new Promise(function (r) { setTimeout(function () { load(ctx); r(); }, 1000); }); }
      },
      decorate: function (ctx, sq) { var T = targets(ctx); return T.indexOf(sq) >= 0 ? { cls: 'g4soko-target' } : null; },
      init: function () {
        if (document.getElementById('g4soko-css')) return;
        var c = document.createElement('style'); c.id = 'g4soko-css';
        c.textContent = '.g4soko-target{box-shadow:inset 0 0 0 4px #ff5a5a,inset 0 0 0 999px rgba(255,90,90,.28)}';
        document.head.appendChild(c);
      },
      status: function (ctx) { var z = ctx.game._soko; return z ? 'Level ' + (z.k + 1) + '/' + LEVELS.length + ': ' + LEVELS[z.k][0] : null; }
    },
    source: { research: 'research/modes/7lEglazTlo8.json', confidence: 'medium', notes: 'Push rule and pawn capture from the transcript; level layouts are original (the game has its own 10+ levels).' },
    todo_pass2: ['flat Soko Chess style pieces and red pawn target icons', 'level title card transition', 'undo/restart HUD icons']
  });
})();
