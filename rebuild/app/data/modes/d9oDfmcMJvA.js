/* Chess, But Archangel Gabriel Knows What You Are. Standard chess vs Stockfish (3600) with a neutral Archangel Gabriel
   (Mandela Catalogue) on b4. Each round after Black's move: every piece next to Gabriel (8 neighbours, either colour)
   becomes an "alternate", a piece controlled by no one; then Gabriel steps one square in a random orthogonal direction
   (never capturing; no empty square, no move); then every alternate makes a random move with its own movement (pawns
   keep their direction) and may capture anything.
   Sources: research/modes/d9oDfmcMJvA.json (transcript turn order White, Black, Gabriel, alternates; b4 start),
   rules.jsonl, frames (pink square under Gabriel, magenta lines, #e9d3b3/#af8264). Inferred: alternates can be captured
   like any piece, an alternate king (or a captured king) loses, alternate pawns promote to queens, greyed look.
   Art is original. */
(function () {
  var O4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  function wait(ctx, ms) { return new Promise(function (r) { ctx.after(ms, r); }); }
  function gabSq(st) { for (var i = 0; i < st.b.length; i++) if (st.b[i] && st.b[i].t === 'Gab') return i; return -1; }
  function altMoves(V, st, i) {
    var p = st.b[i], out = [];
    st.b[i] = { t: p.t, c: p.own === 'b' ? 'y' : 'x', m: 1 }; V.genPiece(st, i, out, true); st.b[i] = p;
    return out.filter(function (m) { return !m.cap || V.def(m.cap.t).capturable !== false; });
  }
  function convert(ctx) {
    var g = ctx.geo, V = ctx.V, s = gabSq(ctx.state), n = 0, king = null; if (s < 0) return null;
    for (var dc = -1; dc <= 1; dc++) for (var dr = -1; dr <= 1; dr++) {
      if (!dc && !dr) continue; var j = g.step(s, dc, dr); if (j < 0) continue;
      var p = ctx.at(j); if (!p || p.c === 'n' || V.def(p.t).blocker) continue;
      if (V.def(p.t).royal) king = p;
      ctx.set(j, Object.assign({}, p, { c: 'n', own: p.c, alt: 1, img: CM.settings.pieceUrl(p.c, p.t), cls: 'pc--dead g1-alt' }));
      ctx.fx({ type: 'glitch', intensity: 3, duration_ms: 260 }); ctx.fx({ type: 'flash', at: j, color: '#e040c8', opacity: 0.5, duration_ms: 400 }); n++;
    }
    if (n) ctx.toast(n + ' piece' + (n === 1 ? '' : 's') + ' became alternate' + (n === 1 ? '' : 's') + '.', 1500);
    return king;
  }
  function round(ctx) {
    var V = ctx.V, g = ctx.geo;
    var king = convert(ctx);
    if (king) { ctx.endGame(king.c === ctx.human ? 'bot' : 'player', king.c === ctx.human ? 'your king became an alternate' : 'the Stockfish king became an alternate'); return null; }
    ctx.refresh();
    var s = gabSq(ctx.state), chain = wait(ctx, 350);
    if (s >= 0) {
      var steps = O4.map(function (d) { return g.step(s, d[0], d[1]); }).filter(function (j) { return j >= 0 && !ctx.at(j); });
      if (steps.length) chain = chain.then(function () { var to = ctx.pick(steps); ctx.fx({ type: 'arrow', from: s, to: to, color: 'rgba(224, 64, 200, 0.85)', duration_ms: 520 }); ctx.move(s, to); ctx.sound('move-opponent'); ctx.refresh(); return wait(ctx, 350); });
    }
    return chain.then(function () {
      var alts = CM.util.shuffle(ctx.pieces(function (p) { return p.alt; })), c2 = Promise.resolve();
      alts.forEach(function (a) {
        c2 = c2.then(function () {
          if (ctx.over) return; var p = ctx.at(a); if (!p || !p.alt) return;
          var ms = altMoves(V, ctx.state, a); if (!ms.length) return;
          var mv = ctx.pick(ms);
          ctx.fx({ type: 'arrow', from: mv.f, to: mv.t, color: 'rgba(224, 64, 200, 0.75)', duration_ms: 500 });
          return wait(ctx, 360).then(function () {
            var victim = ctx.at(mv.t); ctx.move(mv.f, mv.t); ctx.sound(victim ? 'capture' : 'move-opponent');
            var np = ctx.at(mv.t);
            if (V.def(np.t).pawn && g.relRow(mv.t, np.own) === g.depth(np.own) - 1) ctx.set(mv.t, Object.assign({}, np, { t: 'Q', img: CM.settings.pieceUrl(np.own, 'Q') }));
            if (victim && V.def(victim.t).royal && victim.c !== 'n') { ctx.endGame(victim.c === ctx.human ? 'bot' : 'player', victim.c === ctx.human ? 'an alternate took your king' : 'an alternate took the Stockfish king'); return; }
            ctx.refresh();
          });
        });
      });
      return c2;
    });
  }
  CM.mode({
    id: 'd9oDfmcMJvA',
    name: 'Archangel Gabriel',
    category: 'Horror Chess',
    description: 'Gabriel starts on b4. After each round every piece next to him, yours or Stockfish\'s, becomes an alternate that nobody controls. Then Gabriel steps one square up, down, left or right at random (he never captures), and every alternate makes a random move that can capture anything.',
    how_to_win: 'Checkmate Stockfish. Lead Gabriel into its camp.',
    player_side: 'white',
    opponent: { name: 'Stockfish', rating: 3600, avatar: 'assets/avatars/stockfish.svg', tagline: 'Knows what it is.' },
    board: { files: 8, ranks: 8 },
    theme: { light: '#e9d3b3', dark: '#af8264' },
    pieces: { Gab: { name: 'Gabriel', moves: '', value: 0, capturable: false, img: 'assets/modes/d9oDfmcMJvA/gabriel.png', neutralGlow: false } },
    setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR', place: [{ type: 'Gab', color: 'n', at: 'b4' }] },
    bot: { engine: 'search', style: 'best', depth: 3, time_ms: 700 },
    hooks: {
      init: function (ctx) { ctx.geo.setDir('x', 'up'); ctx.geo.setDir('y', 'down'); },
      afterMove: function (ctx, m, info) { if (info.by !== 'bot') return null; return round(ctx); },
      evaluate: function (V, st) {
        var s = gabSq(st); if (s < 0) return 0; var g = V.geo, v = 0;
        for (var i = 0; i < st.b.length; i++) { var p = st.b[i]; if (!p || p.c === 'n') continue; var d = g.dist(i, s); if (d === 1) v += (p.c === 'w' ? -1 : 1) * (V.def(p.t).royal ? 5000 : V.def(p.t).value * 0.8); }
        return v;
      },
      decorate: function (ctx, sq, p) {
        if (p && p.t === 'Gab') return { html: '<span class="sq-tint" style="background:rgba(236,72,190,.45)"></span>' };
        var s = gabSq(ctx.state); if (s >= 0 && ctx.geo.dist(sq, s) === 1) return { html: '<span class="sq-tint" style="box-shadow:inset 0 0 0 2px rgba(236,72,190,.6)"></span>' };
        return null;
      },
      status: function (ctx) { var n = ctx.pieces(function (p) { return p.alt; }).length; return n ? n + ' alternate' + (n === 1 ? '' : 's') + ' roam the board.' : 'Pieces next to Gabriel become alternates after this round.'; }
    },
    source: { research: 'research/modes/d9oDfmcMJvA.json', confidence: 'high', notes: 'Alternates capturable; alternate king loses (inferred).' }
  });
})();
