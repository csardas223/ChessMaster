/* g4_wheel: Spinner Wheel Chess vs Martin (group 4). Before each of your moves a wheel is spun and decides the move.
   params.wheel:
     'piece'  (6YEM7m8owJ4): slices Pawn, Knight, Bishop, Rook, Queen, King. You must move a piece of that type; if you
              cannot (including when in check and that type cannot get you out of it), you lose at once.
     'action' (nick8PeAXLA): slices Move, Capture, Check, Blunder. Move = any move; Capture = you must capture;
              Check = you must give check; Blunder = you must make a move that loses at least 3 points of material
              (judged by a short search). If the demanded kind of move is impossible, any move is allowed.
   The wheel is a real-game event (random), so the restriction lives in state.x.spin / state.x.allow and filterMoves
   only applies it to the position the spin was made for. Martin (250) plays the chess.com beginner way: random-ish
   but never misses a mate in one and dodges one when he can. */
(function () {
  'use strict';
  var CM = window.CM;
  var PIECE = [['P', 'Pawn'], ['N', 'Knight'], ['B', 'Bishop'], ['R', 'Rook'], ['Q', 'Queen'], ['K', 'King']];
  var ACTION = [['move', 'MOVE'], ['capture', 'CAPTURE'], ['check', 'CHECK'], ['blunder', 'BLUNDER']];
  var COL = ['#d63c8c', '#f06fb0', '#b02a72', '#f59ac8', '#c54591', '#e85fa6'];
  function slices(P) { return P.wheel === 'action' ? ACTION : PIECE; }
  function key(m) { return m.f + '-' + m.t + '-' + (m.promo || '') + '-' + (m.drop || ''); }
  function martinPick(ctx, L) {
    if (!L.length) return null;
    var MATE = (CM.MATE || 100000) - 1000;
    if (L[0].v >= MATE) return L[0];
    var safe = L.filter(function (x) { return x.v > -MATE; }); if (!safe.length) safe = L;
    return CM.bot.pickByStrength(safe, CM.bot.eloStrength(ctx.opponent.elo != null ? ctx.opponent.elo : 250));
  }
  function wheelHtml(ctx, S, k, turns) {
    var n = S.length, seg = 360 / n, r = 80, cx = 90, cy = 90, s = '';
    for (var i = 0; i < n; i++) {
      var a0 = (i * seg - 90 - seg / 2) * Math.PI / 180, a1 = ((i + 1) * seg - 90 - seg / 2) * Math.PI / 180;
      s += '<path d="M' + cx + ' ' + cy + 'L' + (cx + r * Math.cos(a0)).toFixed(1) + ' ' + (cy + r * Math.sin(a0)).toFixed(1) + 'A' + r + ' ' + r + ' 0 0 1 ' + (cx + r * Math.cos(a1)).toFixed(1) + ' ' + (cy + r * Math.sin(a1)).toFixed(1) + 'Z" fill="' + COL[i % COL.length] + '" stroke="#fff" stroke-width="2"/>';
      var am = (i * seg - 90) * Math.PI / 180, tx = cx + 52 * Math.cos(am), ty = cy + 52 * Math.sin(am);
      if (ctx.params.wheel === 'action') s += '<text x="' + tx.toFixed(1) + '" y="' + (ty + 4).toFixed(1) + '" font-family="Arial,Helvetica,sans-serif" font-weight="800" font-size="12" fill="#fff" text-anchor="middle" transform="rotate(' + (i * seg) + ' ' + tx.toFixed(1) + ' ' + ty.toFixed(1) + ')">' + S[i][1] + '</text>';
      else s += '<image href="' + CM.settings.pieceUrl('w', S[i][0]) + '" x="' + (tx - 15).toFixed(1) + '" y="' + (ty - 15).toFixed(1) + '" width="30" height="30"/>';
    }
    var end = 360 * turns - k * seg, id = 'g4w' + Math.floor(Math.random() * 1e9);
    return '<style>@keyframes ' + id + '{from{transform:rotate(0)}to{transform:rotate(' + end + 'deg)}}#' + id + '{animation:' + id + ' 1.9s cubic-bezier(.12,.7,.18,1) forwards;transform-origin:90px 90px}' +
      '@media (prefers-reduced-motion: reduce){#' + id + '{animation:none;transform:rotate(' + end + 'deg)}}</style>' +
      '<div style="display:grid;place-items:center;width:100%;height:100%"><div style="position:relative;width:min(62%,230px);aspect-ratio:1;filter:drop-shadow(0 6px 16px rgba(0,0,0,.45))">' +
      '<svg viewBox="0 0 180 180" width="100%" height="100%"><g id="' + id + '">' + s + '</g><circle cx="90" cy="90" r="12" fill="#fff" stroke="#9b2163" stroke-width="3"/>' +
      '<path d="M90 2l9 16H81z" fill="#fff" stroke="#9b2163" stroke-width="2"/></svg></div></div>';
  }
  function restrict(V, st, legal, spin) {
    if (spin === 'capture') return legal.filter(function (m) { return m.cap; });
    if (spin === 'check') return legal.filter(function (m) { var n = m.n || V.make(st, m); return V.inCheck(n, n.turn); });
    if ('PNBRQK'.indexOf(spin) >= 0) return legal.filter(function (m) { return m.p === spin || (spin === 'K' && m.castle); });
    return legal;
  }
  function blunders(ctx) {
    var V = ctx.V, st = ctx.state, L = new CM.Search(V, {}).rank(st, { maxDepth: 2, timeMs: 400, noise: 0 });
    if (!L.length) return [];
    var base = V.evalFor(st, st.turn);
    return L.filter(function (x) { return x.v <= base - 260; }).map(function (x) { return key(x.m); });
  }
  function apply(ctx) {
    var P = ctx.params, S = slices(P), k = ctx.random(S.length), spin = S[k][0], V = ctx.V;
    ctx.setX('spinning', 1);
    ctx.fx({ type: 'overlay', at: 'board', html: wheelHtml(ctx, S, k, 4), duration_ms: CM.settings.reducedMotion() ? 900 : 2500, fade_ms: 220, id: 'g4wheel' });
    ctx.sound('tick');
    ctx.after(CM.settings.reducedMotion() ? 300 : 1950, function () {
      ctx.sound('notify');
      var allow = null;
      if (spin === 'blunder') allow = blunders(ctx);
      ctx.setX('spin', spin); ctx.setX('allow', allow); ctx.setX('spinning', 0);
      var legal = V.legal(ctx.state);
      if (P.wheel === 'piece' && !legal.length) {
        ctx.toast('The wheel says ' + S[k][1] + ', but no ' + S[k][1].toLowerCase() + ' can move.', 2600);
        ctx.endGame('bot', 'the wheel picked a piece that cannot move');
        return;
      }
      var all = V.legal(Object.assign({}, ctx.state, { x: Object.assign({}, ctx.state.x, { spin: null, allow: null }) }));
      var possible = spin === 'move' || (spin === 'blunder' ? !!(allow && allow.length) : restrict(V, ctx.state, all, spin).length > 0);
      if (P.wheel === 'action') ctx.toast(S[k][1] + (!possible ? ': impossible this turn, play any move.' : spin === 'blunder' ? ': give away at least 3 points!' : spin === 'move' ? ': play any move.' : ': you must ' + spin + '.'), 2200);
      else ctx.toast('Move a ' + S[k][1].toLowerCase() + '.', 1800);
      ctx.refresh();
    });
  }
  CM.defineHooks('g4_wheel', {
    filterMoves: function (V, st, legal) {
      var spin = st.x.spin; if (!spin || st.turn !== (V.cfg.params.side || 'w')) return null;
      if (V.cfg.params.wheel === 'action') {
        if (spin === 'blunder') { var A = st.x.allow; if (!A || !A.length) return null; var b = legal.filter(function (m) { return A.indexOf(key(m)) >= 0; }); return b.length ? b : null; }
        var r = restrict(V, st, legal, spin); return r.length ? r : null;
      }
      return restrict(V, st, legal, spin);
    },
    onMake: function (V, st, m, n) { if (st.x.spin) { n.x.spin = null; n.x.allow = null; n.x.spun = 0; } },
    checkWin: function (V, st, moves) {
      if (moves.length || !st.x.spin || V.cfg.params.wheel !== 'piece' || st.turn !== (V.cfg.params.side || 'w')) return null;
      var all = V.legal(Object.assign({}, st, { x: Object.assign({}, st.x, { spin: null }) }));
      if (!all.length) return null; /* real checkmate / stalemate */
      return { w: V.opp(st.turn), why: 'the wheel picked a piece that cannot move' };
    },
    botPick: martinPick,
    beforeMove: function (ctx) { return !ctx.x.spinning && !!ctx.x.spin; },
    onTurn: function (ctx, c) {
      if (c !== ctx.human || ctx.over || ctx.x.spin || ctx.x.spinning) return;
      apply(ctx);
    },
    onUndo: function (ctx) { ctx.setX('spinning', 0); },
    status: function (ctx) {
      if (ctx.over) return null;
      var s = ctx.x.spin, S = slices(ctx.params);
      if (ctx.x.spinning) return 'Spinning the wheel...';
      if (!s) return ctx.state.turn === ctx.human ? 'Spin coming up' : 'Martin is thinking';
      var nm = S.filter(function (x) { return x[0] === s; })[0];
      return 'Wheel: ' + (nm ? nm[1] : s);
    }
  });
})();
