/* Chess, But the Boiled One Paralyzes You. Standard chess vs Stockfish (3600) with a neutral cognitohazard, the
   Boiled One, on b4. After both sides have moved it steps one square orthogonally (random empty square). Any piece of
   either colour that attacks ("sees") its square is paralyzed for the rest of the game: drawn red, it can never move
   again. The Boiled One cannot capture and cannot be captured.
   Sources: research/modes/xvibqyL-CqQ.json (transcript 00:00 rule + b4, 00:30 one orthogonal step after both moved,
   00:59 the d5 pawn paralyzed, 01:29 "not capable of capturing pieces", 02:59 queen diagonals), frames visual_a (brown
   #e9d3b3/#9a6b52, Boiled One on a red square, paralyzed pieces of both colours recoloured red).
   Inferred: paralyzed pieces still block, can be captured and still give check; it only steps to empty squares. */
(function () {
  function wait(ctx, ms) { return new Promise(function (r) { ctx.after(ms, r); }); }
  function find(st) { for (var i = 0; i < st.b.length; i++) if (st.b[i] && st.b[i].t === 'Boil') return i; return -1; }
  function seers(V, st, sq) {
    var b = st.b, saved = b[sq], out = [];
    b[sq] = { t: '?', c: '?', m: 1, probe: 1 };
    for (var i = 0; i < b.length; i++) {
      var p = b[i]; if (!p || i === sq || p.c === 'n' || p.probe || p.para) continue;
      var ms = []; V.genPiece(st, i, ms, true);
      for (var k = 0; k < ms.length; k++) if (ms[k].t === sq && ms[k].cap) { out.push(i); break; }
    }
    b[sq] = saved; return out;
  }
  function gaze(ctx) {
    var s = find(ctx.state); if (s < 0) return 0;
    var hit = seers(ctx.V, ctx.state, s);
    hit.forEach(function (i) {
      var p = ctx.at(i);
      ctx.transform(i, { props: { para: 1, cls: 'g1-para' } });
      ctx.fx({ type: 'arrow', from: i, to: s, color: 'rgba(150, 60, 210, 0.85)', duration_ms: 900 });
      ctx.fx({ type: 'piece_transform', at: i, style: 'flash', color: '#d22' });
      ctx.toast('The ' + (p.c === 'w' ? 'white ' : 'black ') + (ctx.V.def(p.t).name || p.t).toLowerCase() + ' on ' + ctx.name(i) + ' saw the Boiled One.', 1800);
    });
    if (hit.length) { ctx.fx({ type: 'glitch', intensity: 0.6, duration_ms: 320 }); ctx.sound('notify'); ctx.refresh(); }
    return hit.length;
  }
  CM.mode({
    id: 'xvibqyL-CqQ',
    name: 'The Boiled One',
    category: 'Horror Chess',
    description: 'The Boiled One starts on b4 and takes one random orthogonal step after every round. Any piece, yours or Stockfish\'s, that sees it (attacks its square) is paralyzed for the rest of the game and can never move again. It cannot capture and cannot be captured.',
    how_to_win: 'Checkmate Stockfish. Shield your lines and let its pieces stare.',
    player_side: 'white',
    opponent: { name: 'Stockfish', rating: 3600, avatar: 'assets/avatars/stockfish.svg', tagline: 'Tries not to look.' },
    board: { files: 8, ranks: 8 },
    theme: { light: '#e9d3b3', dark: '#9a6b52' },
    pieces: { Boil: { name: 'The Boiled One', moves: '', value: 0, capturable: false, img: 'assets/modes/xvibqyL-CqQ/boiled.png', neutralGlow: false } },
    setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR', place: [{ type: 'Boil', color: 'n', at: 'b4' }] },
    bot: { engine: 'search', style: 'best', depth: 3, time_ms: 650 },
    hooks: {
      init: function () {
        if (document.getElementById('g1-para-css')) return;
        var s = document.createElement('style'); s.id = 'g1-para-css';
        s.textContent = '.g1-para{filter:brightness(.5) sepia(1) saturate(12) hue-rotate(-48deg) !important}';
        document.head.appendChild(s);
      },
      /* paralyzed pieces never move (pure rule hook, also used by the search) */
      filterMoves: function (V, st, legal) { return legal.filter(function (m) { return m.f < 0 || !st.b[m.f] || !st.b[m.f].para; }); },
      evaluate: function (V, st) {
        var s = find(st); if (s < 0) return 0; var v = 0;
        for (var i = 0; i < st.b.length; i++) { var p = st.b[i]; if (p && p.para) { var d = V.def(p.t).value * 0.6; v += p.c === 'w' ? -d : d; } }
        if (V._attBy(st, s, 'w')) v -= 150; if (V._attBy(st, s, 'b')) v += 150;
        return v;
      },
      afterMove: function (ctx, m, info) {
        if (ctx.over) return null;
        gaze(ctx);
        if (info.by !== 'bot') return null;
        var g = ctx.geo, s = find(ctx.state); if (s < 0) return null;
        var opts = [[0, -1], [0, 1], [-1, 0], [1, 0]].map(function (d) { return g.step(s, d[0], d[1]); }).filter(function (j) { return j >= 0 && !ctx.at(j); });
        if (!opts.length) return null;
        var to = ctx.pick(opts);
        return wait(ctx, 450).then(function () { ctx.move(s, to); ctx.sound('move-opponent'); ctx.refresh(); gaze(ctx); return wait(ctx, 200); });
      },
      decorate: function (ctx, sq, p) {
        if (p && p.t === 'Boil') return { html: '<span class="sq-tint" style="background:rgba(200,24,28,.55)"></span>' };
        return null;
      },
      status: function (ctx) { var n = ctx.pieces(function (p) { return p.para; }).length; return n ? n + ' piece' + (n > 1 ? 's are' : ' is') + ' paralyzed.' : 'Don\'t look at the Boiled One.'; }
    },
    source: { research: 'research/modes/xvibqyL-CqQ.json', confidence: 'high', notes: 'Paralyzed pieces still block, can be captured and give check (inferred).' }
  });
})();
