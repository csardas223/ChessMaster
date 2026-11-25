/* Chess vs Checkers.  Tony's chess army vs Fairy-Stockfish's 16 checkers men in a compressed setup on both square colours
   (ranks 7-8). Men step one square diagonally forward and capture by jumping an adjacent enemy to the empty square
   beyond (multi-jumps continue with the same man); a man reaching rank 1 becomes a checkers king (both directions).
   Jumps cannot land off the board, so edge squares are safe. Chess side wins by eliminating every checker; the checkers
   side wins by checkmating (or capturing) the chess king. Sources: research/modes/3Sr5lJbHKKU.json, rules.jsonl, frames
   (green/cream #ffffde/#8aae66, black discs). Bonus real-checkers segment (red vs black on the video's wood board): the 'Bonus: real checkers' button. */
(function () {
  var DIAG = [[1, 1], [-1, 1], [1, -1], [-1, -1]];
  var KING = { J: 1, Mk: 1 }, MAN = { C: 'J', Man: 'Mk' }, CHK = { C: 1, J: 1, Man: 1, Mk: 1 };
  var BONUS_FEN = '1[man]1[man]1[man]1[man]/[man]1[man]1[man]1[man]1/1[man]1[man]1[man]1[man]/8/8/[Man]1[Man]1[Man]1[Man]1/1[Man]1[Man]1[Man]1[Man]/[Man]1[Man]1[Man]1[Man]1';
  var A = 'assets/modes/3Sr5lJbHKKU/';
  function bonusOn() { return CM.store.get('g4chk.bonus', false); }
  function bonusBtn(ctx) {
    var host = document.getElementById('side'); if (!host) return;
    var el = host.querySelector('.g4chk-btn');
    if (!el) {
      el = document.createElement('button'); el.type = 'button'; el.className = 'btn g4chk-btn'; el.style.cssText = 'width:100%;margin:0 0 8px';
      el.addEventListener('click', function () { CM.store.set('g4chk.bonus', !bonusOn()); ctx.game.newGame(); });
      host.insertBefore(el, host.firstChild);
    }
    el.textContent = bonusOn() ? 'Back to Chess vs Checkers' : 'Bonus: real checkers (red vs black)';
  }
  function jumps(V, st, i, p) {
    var g = V.geo, out = [], fwd = KING[p.t] ? DIAG : DIAG.filter(function (d) { return d[1] > 0; });
    var fr = g.FR(p.c);
    fwd.forEach(function (d) {
      var dc = d[0] * fr.R[0] + d[1] * fr.F[0], dr = d[0] * fr.R[1] + d[1] * fr.F[1];
      var mid = g.step(i, dc, dr); if (mid < 0) return; var q = st.b[mid];
      if (!q || q.c === p.c || !V.canCapture(p, q)) return;
      var to = g.step(mid, dc, dr); if (to < 0 || st.b[to]) return;
      out.push({ f: i, t: to, p: p.t, c: p.c, cap: q, capSq: mid, jump: 1 });
    });
    return out;
  }
  function gen(V, st, i, p, out) {
    var g = V.geo, fr = g.FR(p.c), dirs = KING[p.t] ? DIAG : DIAG.filter(function (d) { return d[1] > 0; });
    if (!(st.x.chain >= 0)) dirs.forEach(function (d) {
      var j = g.step(i, d[0] * fr.R[0] + d[1] * fr.F[0], d[0] * fr.R[1] + d[1] * fr.F[1]);
      if (j >= 0 && !st.b[j]) out.push({ f: i, t: j, p: p.t, c: p.c, cap: null });
    });
    jumps(V, st, i, p).forEach(function (m) { out.push(m); });
  }
  CM.mode({
    id: '3Sr5lJbHKKU',
    title: 'Chess vs Checkers',
    name: 'Chess vs Checkers',
    category: 'Other Videos',
    description: 'Your chess army against 16 checkers men packed onto both colours of the top two ranks. A checker steps one square diagonally forward and captures by jumping over an adjacent piece onto the empty square behind it, and can keep jumping. A checker reaching your back rank becomes a checkers king. Jumps can never land off the board, so the edges are safe.',
    how_to_win: 'Capture every checker. Fairy-Stockfish wins by checkmating your king.',
    player_side: 'white',
    opponent: { name: 'Fairy-Stockfish', rating: 3000, avatar: 'assets/modes/mvPXhAMcT7I/fairy_stockfish.png', tagline: 'Playing the checkers side.' },
    board: { files: 8, ranks: 8, light: '#ffffde', dark: '#8aae66' },
    pieces: {
      C: { name: 'Checker', moves: '', gen: 'genChecker', value: 150, glyph: null, badge: null, img: 'assets/modes/3Sr5lJbHKKU/checker_b.png' }  /* clear the built-in Chancellor glyph/badge */,
      J: { name: 'Checkers King', moves: '', gen: 'genChecker', value: 300, glyph: 'P', badge: 'K', img: 'assets/modes/3Sr5lJbHKKU/checker_b.png' },
      /* bonus real-checkers game: your black men vs red men, discs cut from the video's checkers board */
      Man: { name: 'Checker', moves: '', gen: 'genChecker', value: 100, img: { w: A + 'black.png', b: A + 'red.png' } },
      Mk: { name: 'Checkers King', moves: '', gen: 'genChecker', value: 250, badge: 'K', img: { w: A + 'black.png', b: A + 'red.png' } }
    },
    setup: { fen: 'cccccccc/cccccccc/8/8/8/8/PPPPPPPP/RNBQKBNR' },
    rules: { win: [{ type: 'checkmate' }, { type: 'eliminate', color: 'b', why: 'every checker was captured' }] },
    bot: { engine: 'search', style: 'best', depth: 3, time_ms: 800 },
    hooks: {
      genChecker: gen,
      moves: function (V, st, out) {
        if (st.x.chain >= 0) return out.filter(function (m) { return m.f === st.x.chain && m.jump; });
        if (st.x.bonus && out.some(function (m) { return m.jump; })) return out.filter(function (m) { return m.jump; });  /* real checkers: jumps are compulsory */
        return null;
      },
      checkWin: function (V, st, moves) {
        if (!st.x.bonus) return null;
        if (!moves.length) return { w: st.turn === 'w' ? 'b' : 'w', why: (st.turn === 'w' ? 'you have' : 'red has') + ' no moves left' };
        return null;
      },
      setup: function (ctx) {
        var on = bonusOn(); ctx.setX('bonus', on);
        if (on) {
          var st0 = CM.spec.initialState(ctx.V, Object.assign({}, ctx.spec, { setup: { fen: BONUS_FEN } }));
          st0.x = Object.assign({}, ctx.state.x, { bonus: true, chain: -1 }); ctx.state = st0;
          ctx.setOpponent({ name: 'Checkers bot', rating: null, avatar: A + 'red.png', tagline: 'Bonus round: real checkers on the video\'s wood board.' });
          CM.settings.applyBoard({ light: '#d9b27c', dark: '#a8722f', lightImg: '../' + A + 'wood_light.png', darkImg: '../' + A + 'wood_dark.png' });
        } else {
          ctx.setOpponent({ name: 'Fairy-Stockfish', rating: 3000, avatar: ctx.spec.opponent.avatar, tagline: 'Playing the checkers side.' });
          CM.settings.applyBoard({ light: '#ffffde', dark: '#8aae66' });
        }
      },
      afterMove: function (ctx, m) { if (m.jump && m.capSq != null) ctx.fx({ type: 'particles', kind: 'dust', at: ctx.name(m.capSq), count: 10, duration_ms: 450 }); },  /* hop over the captured man */
      status: function (ctx) { bonusBtn(ctx); return ctx.x.bonus ? 'Bonus: real checkers. Jumps are compulsory.' : null; },
      onExit: function () { var el = document.querySelector('.g4chk-btn'); if (el) el.remove(); CM.store.set('g4chk.bonus', false); },
      onMake: function (V, st, m, n) {
        n.x.chain = -1;
        if (!CHK[m.p]) return;
        var g = V.geo, p = n.b[m.t];
        if (MAN[p.t] && g.relRow(m.t, p.c) === g.depth(p.c) - 1) { n.b[m.t] = Object.assign({}, p, { t: MAN[p.t] }); return; }
        if (m.jump && jumps(V, n, m.t, n.b[m.t]).length) { n.turn = m.c; n.x.chain = m.t; }
      },
      attacks: function (V, st, sq, by) {
        var g = V.geo;
        for (var k = 0; k < 4; k++) {
          var d = DIAG[k], from = g.step(sq, d[0], d[1]), to = g.step(sq, -d[0], -d[1]);
          if (from < 0 || to < 0 || st.b[to]) continue;
          var p = st.b[from]; if (!p || p.c !== by || !CHK[p.t]) continue;
          if (KING[p.t] || (by === 'b' ? (-d[1]) > 0 : (-d[1]) < 0)) return true;
        }
        return false;
      }
    },
    source: { research: 'research/modes/3Sr5lJbHKKU.json', confidence: 'high', notes: 'Exact checker squares visual-only (compressed on both colours); multi-jump and kinging from checkers rules (inferred). Bonus game: standard 8x8 checkers with compulsory jumps vs the search bot (video plays it online; opponent strength unknown).' }
  });
})();
