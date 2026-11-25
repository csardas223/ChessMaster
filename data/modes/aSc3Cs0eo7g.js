/* Chess, But Pieces Fall Through Breaking Squares. Standard chess vs Stockfish (3600). Every time a piece lands on a
   square the square cracks; the third landing breaks it: the piece standing there falls through and is lost, and the
   square is a permanent hole (nothing lands on it, sliders cannot cross). Castling cracks both destination squares.
   A capture onto a twice-cracked square loses both pieces. A king that falls loses the game.
   Sources: research/modes/aSc3Cs0eo7g.json (transcript 00:01 "after three uses the square breaks away", 01:25 "E3
   stepped on twice... rather large crack", 01:55 castling cracks both, 03:49 holes unplayable, 07:51 "King to C6 loses
   the king, which does in fact win us the game"), frames visual_* (brown #ead2ae/#ba8a72, crack lines, black holes).
   Inferred: the start position counts as zero cracks; a falling king stays drawn until the game-over screen. */
(function () {
  function crack(n, i) { var c = n.x.cr; if (!c[i]) { c = n.x.cr = Object.assign({}, c); c[i] = 1; return 1; } c = n.x.cr = Object.assign({}, c); return (c[i] = c[i] + 1); }
  function land(V, n, i) {
    var k = crack(n, i); if (k < 3) return;
    var p = n.b[i];
    if (p && V.def(p.t).royal) { n.x.fell = p.c; n.x.fellAt = i; return; }
    n.b[i] = { t: 'Hole', c: 'n', m: 1 };
    n.x.drop = (n.x.drop || []).concat([i]);
  }
  CM.mode({
    id: 'aSc3Cs0eo7g',
    name: 'Breaking Squares',
    category: 'Powerups & Rule Twists',
    description: 'Each time a piece lands on a square, the square cracks. On the third landing it breaks: the piece on it falls through and is gone, and the square becomes a hole nobody can use. Castling cracks both squares. A king that falls loses.',
    how_to_win: 'Checkmate Stockfish, or lure its king onto a twice-cracked square.',
    player_side: 'white',
    player: { name: 'You', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },   /* iwantcheckmate's own avatar (purple king) from the videos */
    opponent: { name: 'Stockfish', rating: 3600, avatar: 'assets/modes/U_irVoLjtNI/stockfish.png', tagline: 'Mind the cracks.' },
    board: { files: 8, ranks: 8 },
    theme: { light: '#ead2ae', dark: '#ba8a72' },
    pieces: { Hole: { name: 'Broken square', moves: '', value: 0, blocker: true, capturable: false, overlay: 'void' } },
    setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR', x: { cr: {}, fell: null } },
    bot: { engine: 'search', style: 'best', depth: 3, time_ms: 800 },
    sounds: { 'break': 'assets/modes/aSc3Cs0eo7g/break.wav' },
    hooks: {
      onMake: function (V, st, m, n) {
        n.x.drop = null;
        land(V, n, m.t);
        if (m.castle) land(V, n, m.castle.rt);
      },
      checkWin: function (V, st) {
        var f = st.x && st.x.fell; if (!f) return null;
        return { w: V.opp(f), why: (f === 'w' ? 'your' : "Stockfish's") + ' king fell through a broken square' };
      },
      evaluate: function (V, st) {
        var c = st.x.cr, v = 0;
        for (var i in c) { if (c[i] !== 2) continue; var p = st.b[i]; if (p && p.c !== 'n') v += (p.c === 'w' ? -1 : 1) * 15; }
        return v;
      },
      afterMove: function (ctx) {
        var d = ctx.x.drop, f = ctx.x.fell;
        (d || []).forEach(function (i) { ctx.fx({ type: 'particles', kind: 'dust', at: i, count: 18 }); ctx.fx({ type: 'flash', at: i, color: '#000', opacity: 0.9, duration_ms: 450 }); ctx.sound('break'); });
        if (f) ctx.sound('break');
        if (d && d.length) ctx.toast('The square on ' + ctx.name(d[0]) + ' broke away!', 1500);
        if (f) ctx.fx({ type: 'particles', kind: 'dust', at: ctx.x.fellAt, count: 24 });
        return null;
      },
      decorate: function (ctx, sq, p) {
        if (p && p.t === 'Hole') return { html: '<span class="sq-tint" style="background:#0b0a09"></span>' };
        if (ctx.x.fell && sq === ctx.x.fellAt) return { html: '<span class="sq-tint" style="background:#0b0a09"></span>', cls: 'g1-fall' };
        var k = ctx.x.cr[sq]; if (!k) return null;
        return { html: '<img alt="" src="assets/modes/aSc3Cs0eo7g/' + (k === 1 ? 'cracked' : 'broken') + '.png" style="position:absolute;inset:0;width:100%;height:100%;z-index:1;pointer-events:none;opacity:.9;mix-blend-mode:multiply">' };
      },
      status: function (ctx) { var c = ctx.x.cr, n = 0; for (var i in c) if (c[i] === 2) n++; return n + ' square' + (n === 1 ? '' : 's') + ' about to break (two cracks).'; }
    },
    source: { research: 'research/modes/aSc3Cs0eo7g.json', confidence: 'high', notes: 'Start position has no cracks (inferred).' }
  });
})();
