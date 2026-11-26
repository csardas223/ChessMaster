/* Chess, But the Boiled One Paralyzes You. Standard chess vs Stockfish (3600) with a neutral cognitohazard, the
   Boiled One, on b4. After both sides have moved it steps one square orthogonally (random empty square). Any piece of
   either colour that attacks ("sees") its square is paralyzed for the rest of the game: drawn red, it can never move
   again. The Boiled One cannot capture and cannot be captured.
   Sources: research/modes/xvibqyL-CqQ.json (transcript 00:00 rule + b4, 00:30 one orthogonal step after both moved,
   00:59 the d5 pawn paralyzed, 01:29 "not capable of capturing pieces", 02:59 queen diagonals), frames visual_a (brown
   #e9d3b3/#9a6b52, Boiled One on a red square, paralyzed pieces of both colours recoloured red). The curse path
   animation and red recolour follow iwantcheckmate.com/challenges/boiled-one (2026-11-25); no tint under him.
   Inferred: paralyzed pieces still block, can be captured and still give check; it only steps to empty squares. */
(function () {
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
  /* the curse travels from the Boiled One back along each new onlooker's line of sight: knights get their L in reverse
     (long leg first), sliders the squares between. As on iwantcheckmate.com/challenges/boiled-one each square of the
     path flashes red (#f00) beneath the pieces, 200 ms after the previous one (0 -> 85% -> 0 over 700 ms); the
     onlooker turns red when the curse reaches it. */
  function sightPath(g, from, to) {
    var c = g.col(from), r = g.row(from), tc = g.col(to), tr = g.row(to), dc = tc - c, dr = tr - r, out = [from];
    var ac = Math.abs(dc), ar = Math.abs(dr);
    if (ac * ar === 2) {   /* knight */
      if (ac === 2) { while (c !== tc) { c += Math.sign(dc); out.push(g.idx(c, r)); } r = tr; out.push(g.idx(c, r)); }
      else { while (r !== tr) { r += Math.sign(dr); out.push(g.idx(c, r)); } c = tc; out.push(g.idx(c, r)); }
      return out;
    }
    var sc = Math.sign(dc), sr = Math.sign(dr), n = Math.max(ac, ar);
    if (!(ac === ar || !ac || !ar)) return [from, to];
    for (var k = 1; k <= n; k++) out.push(g.idx(c + sc * k, r + sr * k));
    return out;
  }
  function gaze(ctx) {
    var s = find(ctx.state); if (s < 0) return null;
    var hit = seers(ctx.V, ctx.state, s); if (!hit.length) return null;
    var AF = CM.abilityFx, g = ctx.geo;
    hit.forEach(function (i) { ctx.transform(i, { props: { para: 1 } }); });   /* the rule applies at once */
    ctx.sound('notify');
    return Promise.all(hit.map(function (i) {
      var p = ctx.at(i), path = sightPath(g, s, i);
      ctx.fx({ type: 'pulse', squares: path, color: '#f00', peak: 0.85, duration_ms: 700, rise: 3 / 7, hold: 4 / 7, stagger_ms: 200, under: true });
      return AF.wait(ctx, (path.length - 1) * 200).then(function () {
        var q = ctx.at(i); if (q && q.para) { ctx.transform(i, { props: { cls: 'g1-para' } }); ctx.refresh({ instant: true }); }
        ctx.toast('The ' + (p.c === 'w' ? 'white ' : 'black ') + (ctx.V.def(p.t).name || p.t).toLowerCase() + ' on ' + ctx.name(i) + ' saw the Boiled One.', 1800);
        return AF.wait(ctx, 700);
      });
    })).then(function () { ctx.refresh(); });
  }
  CM.mode({
    id: 'xvibqyL-CqQ',
    name: 'The Boiled One',
    category: 'Horror Chess',
    description: 'The Boiled One starts on b4 and takes one random orthogonal step after every round. Any piece, yours or Stockfish\'s, that sees it (attacks its square) is paralyzed for the rest of the game and can never move again. It cannot capture and cannot be captured.',
    how_to_win: 'Checkmate Stockfish. Shield your lines and let its pieces stare.',
    player_side: 'white',
    player: { name: 'You', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },   /* iwantcheckmate's own avatar (purple king) from the videos */
    opponent: { name: 'Stockfish', rating: 3600, avatar: 'assets/modes/U_irVoLjtNI/stockfish.png', tagline: 'Tries not to look.' },
    board: { files: 8, ranks: 8 },
    theme: { light: '#e9d3b3', dark: '#9a6b52' },
    pieces: { Boil: { name: 'The Boiled One', moves: '', value: 0, capturable: false, img: 'assets/modes/xvibqyL-CqQ/boiled.png', neutralGlow: false } },
    setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR', place: [{ type: 'Boil', color: 'n', at: 'b4' }] },
    bot: { engine: 'search', style: 'best', depth: 3, time_ms: 650 },
    hooks: {
      init: function () {
        if (document.getElementById('g1-para-css')) return;
        var s = document.createElement('style'); s.id = 'g1-para-css';
        /* paralyzed pieces: the same red recolour iwantcheckmate.com uses (R = .45R + .55, G = .35G, B = .35B) */
        s.textContent = '.g1-para{filter:url(#g1-redtint) !important}';
        document.head.appendChild(s);
        var d = document.createElement('div'); d.setAttribute('aria-hidden', 'true'); d.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
        d.innerHTML = '<svg width="0" height="0"><filter id="g1-redtint" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values=".45 0 0 0 .55  0 .35 0 0 0  0 0 .35 0 0  0 0 0 1 0"/></filter></svg>';
        document.body.appendChild(d);
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
        var AF = CM.abilityFx;
        return Promise.resolve(gaze(ctx)).then(function () {
          if (ctx.over || info.by !== 'bot') return null;
          var g = ctx.geo, s = find(ctx.state); if (s < 0) return null;
          var opts = [[0, -1], [0, 1], [-1, 0], [1, 0]].map(function (d) { return g.step(s, d[0], d[1]); }).filter(function (j) { return j >= 0 && !ctx.at(j); });
          if (!opts.length) return null;
          var to = ctx.pick(opts);
          return AF.wait(ctx, 450).then(function () { ctx.move(s, to); ctx.sound('move-opponent'); ctx.refresh(); return AF.wait(ctx, 320); }).then(function () { return gaze(ctx); });
        });
      },
      status: function (ctx) { var n = ctx.pieces(function (p) { return p.para; }).length; return n ? n + ' piece' + (n > 1 ? 's are' : ' is') + ' paralyzed.' : 'Don\'t look at the Boiled One.'; }
    },
    source: { research: 'research/modes/xvibqyL-CqQ.json', confidence: 'high', notes: 'Paralyzed pieces still block, can be captured and give check (inferred).' }
  });
})();
