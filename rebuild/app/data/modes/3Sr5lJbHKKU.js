/* Chess vs Checkers.  Tony's chess army vs Fairy-Stockfish's 16 checkers men in a compressed setup on both square colours
   (ranks 7-8). Men step one square diagonally forward and capture by jumping an adjacent enemy to the empty square
   beyond (multi-jumps continue with the same man); a man reaching rank 1 becomes a checkers king (both directions).
   Jumps cannot land off the board, so edge squares are safe. Chess side wins by eliminating every checker; the checkers
   side wins by checkmating (or capturing) the chess king. Sources: research/modes/3Sr5lJbHKKU.json, rules.jsonl, frames
   (green/cream #ffffde/#8aae66, black discs). Bonus real-checkers segment not modelled. */
(function () {
  var DIAG = [[1, 1], [-1, 1], [1, -1], [-1, -1]];
  function jumps(V, st, i, p) {
    var g = V.geo, out = [], fwd = p.t === 'J' ? DIAG : DIAG.filter(function (d) { return d[1] > 0; });
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
    var g = V.geo, fr = g.FR(p.c), dirs = p.t === 'J' ? DIAG : DIAG.filter(function (d) { return d[1] > 0; });
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
    opponent: { name: 'Fairy-Stockfish', rating: 3000, avatar: 'assets/avatars/stockfish.svg', tagline: 'Playing the checkers side.' },
    board: { files: 8, ranks: 8, light: '#ffffde', dark: '#8aae66' },
    pieces: {
      C: { name: 'Checker', moves: '', gen: 'genChecker', value: 150, glyph: null, badge: null, img: 'assets/modes/3Sr5lJbHKKU/checker_b.png' }  /* clear the built-in Chancellor glyph/badge */,
      J: { name: 'Checkers King', moves: '', gen: 'genChecker', value: 300, glyph: 'P', badge: 'K', img: 'assets/modes/3Sr5lJbHKKU/checker_b.png' }
    },
    setup: { fen: 'cccccccc/cccccccc/8/8/8/8/PPPPPPPP/RNBQKBNR' },
    rules: { win: [{ type: 'checkmate' }, { type: 'eliminate', color: 'b', why: 'every checker was captured' }] },
    bot: { engine: 'search', style: 'best', depth: 3, time_ms: 800 },
    hooks: {
      genChecker: gen,
      moves: function (V, st, out) {
        if (st.x.chain >= 0) return out.filter(function (m) { return m.f === st.x.chain && m.jump; });
        return null;
      },
      onMake: function (V, st, m, n) {
        n.x.chain = -1;
        if (m.p !== 'C' && m.p !== 'J') return;
        var g = V.geo, p = n.b[m.t];
        if (p.t === 'C' && g.relRow(m.t, p.c) === g.depth(p.c) - 1) { n.b[m.t] = Object.assign({}, p, { t: 'J' }); return; }
        if (m.jump && jumps(V, n, m.t, n.b[m.t]).length) { n.turn = m.c; n.x.chain = m.t; }
      },
      attacks: function (V, st, sq, by) {
        var g = V.geo;
        for (var k = 0; k < 4; k++) {
          var d = DIAG[k], from = g.step(sq, d[0], d[1]), to = g.step(sq, -d[0], -d[1]);
          if (from < 0 || to < 0 || st.b[to]) continue;
          var p = st.b[from]; if (!p || p.c !== by || (p.t !== 'C' && p.t !== 'J')) continue;
          if (p.t === 'J' || (by === 'b' ? (-d[1]) > 0 : (-d[1]) < 0)) return true;
        }
        return false;
      }
    },
    source: { research: 'research/modes/3Sr5lJbHKKU.json', confidence: 'high', notes: 'Exact checker squares visual-only (compressed on both colours); multi-jump and kinging from checkers rules (inferred).' },
    todo_pass2: ['jump capture animation', 'bonus real checkers game segment']
  });
})();
