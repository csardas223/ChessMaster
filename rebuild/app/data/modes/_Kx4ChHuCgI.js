/* Chess, But SCP-106 Traps You In His Pocket Dimension. Two boards vs Stockfish (3600): the normal 8x8 board (files
   a-h) and SCP-106's pocket dimension (files k-p, drawn dark), separated by a void so nothing crosses. SCP-106 starts on
   g4 and wanders one square each round; every piece next to him afterwards (either colour, kings too) is sent to a
   random empty square of the pocket dimension. Each turn a player makes one move on the main board AND one move on the
   pocket board (when they have a legal one there), in either order. A piece that reaches the pocket's centre (m4, m5,
   n4, n5) escapes to a random empty square of the main board. Pawns keep their direction and promote on both boards.
   Sources: research/modes/_Kx4ChHuCgI.json (transcript 00:01 rule and g4, 00:50 three pawns gone at once, 01:13 one
   move on each board, 02:01 king sent there, 07:44 checkmate), frames visual_b (small separate pocket board, red
   corrosion squares, #eadeba/#ae7e66). Inferred: pocket board size (6x8), its 2x2 centre exit, one step per round.
   Art is original. */
(function () {
  var MAINF = 8, PK = 10, PF = 6;                       /* pocket = columns 10..15 */
  var EXITS = ['m4', 'm5', 'n4', 'n5'];
  function wait(ctx, ms) { return new Promise(function (r) { ctx.after(ms, r); }); }
  function inPocket(g, i) { return g.col(i) >= PK; }
  function sideOf(g, i) { return inPocket(g, i) ? 'pocket' : 'main'; }
  function oldSq(st) { for (var i = 0; i < st.b.length; i++) if (st.b[i] && st.b[i].t === 'Old') return i; return -1; }
  /* does colour `me` have a legal move on `board` in st? (only needs a full check when its king is on that board) */
  function hasMoveOn(V, mk, st, me, board) {
    var g = V.geo, tmp = Object.assign({}, st, { turn: me }), ms = V.gen(tmp).filter(function (m) { return m.f >= 0 && sideOf(g, m.f) === board; });
    if (!ms.length) return false;
    var R = V.royals(st, me), kingHere = R.some(function (k) { return sideOf(g, k) === board; });
    if (!kingHere) return true;
    for (var k = 0; k < ms.length; k++) { var n = mk.call(V, tmp, ms[k]); var safe = V.royals(n, me).every(function (q) { return !V.royalAttacked(n, q, me); }); if (safe) return true; }
    return false;
  }
  var holes = [], squares = {};
  (function () {
    var L = 'abcdefghijklmnop';
    for (var r = 1; r <= 8; r++) { holes.push('i' + r, 'j' + r); for (var c = PK; c < PK + PF; c++) squares[L[c] + r] = { color: 'rgba(40,12,6,.42)' }; }
    EXITS.forEach(function (s) { squares[s] = { color: 'rgba(150,20,20,.5)', label: 'EXIT' }; });
  })();
  function teleportToPocket(ctx, i) {
    var g = ctx.geo, p = ctx.at(i), V = ctx.V;
    var cand = ctx.emptySquares(function (j) { return inPocket(g, j) && EXITS.indexOf(ctx.name(j)) < 0; });
    if (!cand.length) return;
    var to = ctx.pick(cand), np = Object.assign({}, p, { m: 1 });
    if (V.def(p.t).pawn && g.relRow(to, p.c) === g.depth(p.c) - 1) np.t = 'Q';
    ctx.remove(i); ctx.set(to, np);
    ctx.fx({ type: 'flash', at: i, color: '#3a1205', opacity: 0.8, duration_ms: 420 });
    ctx.fx({ type: 'flash', at: to, color: '#8a2a10', opacity: 0.6, duration_ms: 520 });
  }
  function escapes(ctx) {
    var g = ctx.geo, n = 0;
    EXITS.forEach(function (s) {
      var i = ctx.sq(s), p = ctx.at(i); if (!p || p.c === 'n') return;
      var cand = ctx.emptySquares(function (j) { return !inPocket(g, j); }); if (!cand.length) return;
      var to = ctx.pick(cand); ctx.remove(i); ctx.set(to, Object.assign({}, p, { m: 1 }));
      ctx.fx({ type: 'flash', at: to, color: '#fff3c0', opacity: 0.6, duration_ms: 520 });
      ctx.toast('The ' + (p.c === 'w' ? 'white ' : 'black ') + (ctx.V.def(p.t).name || p.t).toLowerCase() + ' escaped the pocket dimension to ' + ctx.name(to) + '.', 1900);
      n++;
    });
    return n;
  }
  function wander(ctx) {
    var g = ctx.geo, V = ctx.V, s = oldSq(ctx.state); if (s < 0) return null;
    var steps = [];
    for (var dc = -1; dc <= 1; dc++) for (var dr = -1; dr <= 1; dr++) { if (!dc && !dr) continue; var j = g.step(s, dc, dr); if (j >= 0 && !inPocket(g, j) && !ctx.at(j)) steps.push(j); }
    if (steps.length) { var to = ctx.pick(steps); ctx.move(s, to); s = to; ctx.sound('move-opponent'); }
    return wait(ctx, 420).then(function () {
      var sent = [];
      for (var dc = -1; dc <= 1; dc++) for (var dr = -1; dr <= 1; dr++) {
        if (!dc && !dr) continue; var j = g.step(s, dc, dr); if (j < 0 || inPocket(g, j)) continue;
        var p = ctx.at(j); if (p && p.c !== 'n') { sent.push(p); teleportToPocket(ctx, j); }
      }
      if (sent.length) { ctx.sound('notify'); ctx.toast('SCP-106 dragged ' + sent.length + ' piece' + (sent.length === 1 ? '' : 's') + ' into the pocket dimension.', 1800); }
      ctx.refresh();
    });
  }
  function passIfStuck(ctx) {
    var st = ctx.state; if (!st.x.part) return;
    if (!ctx.V.legal(st).length) { st.turn = ctx.V.opp(st.turn); var x = Object.assign({}, st.x); x.part = null; st.x = x; st.sub = 0; }
  }
  CM.mode({
    id: '_Kx4ChHuCgI',
    name: 'SCP-106 Pocket Dimension',
    category: 'Horror Chess',
    description: 'SCP-106 wanders the main board from g4. After each round, every piece next to him is dragged into his pocket dimension (the dark board on the right). Each turn you make one move on the main board and one in the pocket dimension, if you have a piece there. Reach a red EXIT square in the pocket centre to escape to a random empty square of the main board.',
    how_to_win: 'Checkmate Stockfish, wherever its king ends up.',
    player_side: 'white',
    opponent: { name: 'Stockfish', rating: 3600, avatar: 'assets/avatars/stockfish.svg', tagline: 'Plays on two boards at once.' },
    board: { files: MAINF + 2 + PF, ranks: 8, holes: holes, squares: squares },
    theme: { light: '#eadeba', dark: '#ae7e66', background: '#1a1310' },
    pieces: { Old: { name: 'SCP-106', moves: '', value: 0, capturable: false, img: 'assets/modes/_Kx4ChHuCgI/oldman.svg', neutralGlow: false } },
    setup: { fen: 'rnbqkbnr10/pppppppp10/18/18/18/18/PPPPPPPP10/RNBQKBNR10', place: [{ type: 'Old', color: 'n', at: 'g4' }] },
    bot: { engine: 'search', style: 'best', depth: 3, time_ms: 800 },
    hooks: {
      init: function (ctx) {
        var V = ctx.V; if (V._g1pocket) return; V._g1pocket = 1;
        var mk = V.make;
        V.make = function (st, m) {
          var n = mk.call(this, st, m), me = st.turn, part = st.x && st.x.part;
          n.x.part = null;
          if (part || m.f < 0) return n;
          var board = sideOf(this.geo, m.f), other = board === 'main' ? 'pocket' : 'main';
          if (this.royals(n, me).length && hasMoveOn(this, mk, n, me, other)) { n.turn = me; n.sub = 1; n.x.part = board; }
          return n;
        };
      },
      filterMoves: function (V, st, legal) {
        var part = st.x && st.x.part; if (!part) return legal;
        return legal.filter(function (m) { return m.f >= 0 && sideOf(V.geo, m.f) !== part; });
      },
      afterMove: function (ctx, m, info) {
        if (escapes(ctx)) passIfStuck(ctx);
        if (info.by === 'bot' && ctx.state.turn !== ctx.bot) return wander(ctx);
        passIfStuck(ctx);
        return null;
      },
      decorate: function (ctx, sq) {
        var s = oldSq(ctx.state); if (s < 0 || sq === s || ctx.geo.dist(sq, s) !== 1 || inPocket(ctx.geo, sq)) return null;
        return { html: '<span class="sq-tint" style="background:rgba(170,30,20,.35)"></span>' };
      },
      status: function (ctx) {
        var st = ctx.state; if (ctx.over) return '';
        if (st.x.part) return (st.turn === ctx.human ? 'Now make your ' : 'Stockfish makes its ') + (st.x.part === 'main' ? 'pocket dimension' : 'main board') + ' move.';
        return 'One move on each board per turn. Red EXIT squares lead back.';
      }
    },
    source: { research: 'research/modes/_Kx4ChHuCgI.json', confidence: 'medium', notes: 'Pocket board size 6x8 and 2x2 centre exits are inferred (not established in research).' }
  });
})();
