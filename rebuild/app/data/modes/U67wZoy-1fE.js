/* Chess, But He Brings You Despair. Standard chess vs Stockfish (3600) with a neutral Despair entity on g4. Every round
   (after Black's move) it takes one king step toward the nearest piece, of either colour, that is attacked by an enemy
   piece (ties random) and deletes that piece when it reaches it. A deleted king loses.
   Sources: research/modes/U67wZoy-1fE.json (transcript, rules.jsonl: g4 start, nearest attacked piece, 50/50 ties),
   frames (magenta path arrow and target squares, #e9d4b4/#ae8164, Stockfish (3600)). Inferred: it rests when nothing
   is attacked, it walks around other pieces, it cannot be captured. Art is original. */
(function () {
  function wait(ctx, ms) { return new Promise(function (r) { ctx.after(ms, r); }); }
  function entSq(st) { for (var i = 0; i < st.b.length; i++) if (st.b[i] && st.b[i].t === 'Ent') return i; return -1; }
  function targets(V, st, s) {
    var g = V.geo, best = 99, out = [];
    for (var i = 0; i < st.b.length; i++) {
      var p = st.b[i]; if (!p || p.c === 'n' || V.def(p.t).blocker) continue;
      if (!V.attackedByEnemy(st, i, p.c)) continue;
      var d = g.dist(i, s); if (d < best) { best = d; out = [i]; } else if (d === best) out.push(i);
    }
    return out;
  }
  function round(ctx) {
    var V = ctx.V, g = ctx.geo, st = ctx.state, s = entSq(st); if (s < 0) return null;
    var T = targets(V, st, s); if (!T.length) return null;
    var tgt = ctx.pick(T), opts = [], bd = 99;
    for (var dc = -1; dc <= 1; dc++) for (var dr = -1; dr <= 1; dr++) {
      if (!dc && !dr) continue; var j = g.step(s, dc, dr); if (j < 0) continue;
      if (ctx.at(j) && j !== tgt) continue;
      var d = g.dist(j, tgt); if (d < bd) { bd = d; opts = [j]; } else if (d === bd) opts.push(j);
    }
    if (!opts.length) return null;
    var to = ctx.pick(opts);
    ctx.fx({ type: 'arrow', from: s, to: tgt, color: 'rgba(220, 40, 200, 0.7)', duration_ms: 800, width: 0.15 });
    return wait(ctx, 550).then(function () {
      var victim = ctx.at(to);
      ctx.move(s, to);
      if (victim) {
        ctx.sound('capture'); ctx.fx({ type: 'particles', kind: 'smoke', at: to });
        ctx.toast('Despair deleted the ' + (victim.c === 'w' ? 'white ' : 'black ') + (V.def(victim.t).name || victim.t).toLowerCase() + '.', 1800);
        if (V.def(victim.t).royal) { ctx.endGame(victim.c === ctx.human ? 'bot' : 'player', victim.c === ctx.human ? 'Despair took your king' : 'Despair took the Stockfish king'); return; }
      } else ctx.sound('move-opponent');
      ctx.refresh();
    });
  }
  CM.mode({
    id: 'U67wZoy-1fE',
    name: 'Despair',
    category: 'Horror Chess',
    description: 'A Despair entity starts on g4. After every round it steps one square toward the nearest piece, yours or Stockfish\'s, that is under attack by an enemy piece, and deletes it when it arrives. Ties are random. It cannot be captured.',
    how_to_win: 'Checkmate Stockfish, or keep the black king under attack until Despair reaches it.',
    player_side: 'white',
    opponent: { name: 'Stockfish', rating: 3600, avatar: 'assets/modes/U_irVoLjtNI/stockfish.png', tagline: 'Hangs nothing, if it can help it.' },
    board: { files: 8, ranks: 8 },
    theme: { light: '#e9d4b4', dark: '#ae8164' },
    pieces: { Ent: { name: 'Despair', moves: '', value: 0, capturable: false, img: 'assets/modes/U67wZoy-1fE/despair.png', neutralGlow: false } },
    setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR', place: [{ type: 'Ent', color: 'n', at: 'g4' }] },
    bot: { engine: 'search', style: 'best', depth: 4, time_ms: 700 },
    hooks: {
      afterMove: function (ctx, m, info) { if (info.by !== 'bot') return null; return round(ctx); },
      /* attacked pieces near the entity are in danger */
      evaluate: function (V, st) {
        var s = entSq(st); if (s < 0) return 0; var g = V.geo, v = 0;
        for (var i = 0; i < st.b.length; i++) { var p = st.b[i]; if (!p || p.c === 'n') continue; var d = g.dist(i, s); if (d > 3) continue; if (V.attackedByEnemy(st, i, p.c)) v += (p.c === 'w' ? -1 : 1) * (V.def(p.t).royal ? 400 : V.def(p.t).value * 0.15) * (4 - d); }
        return v;
      },
      decorate: function (ctx, sq, p) {
        if (!p || p.c === 'n' || ctx.over) return null;
        var s = entSq(ctx.state); if (s < 0) return null;
        var T = ctx.game._g1t; if (!T || T.ply !== ctx.ply) { T = { ply: ctx.ply, set: {} }; targets(ctx.V, ctx.state, s).forEach(function (i) { T.set[i] = 1; }); ctx.game._g1t = T; }
        return T.set[sq] ? { html: '<span class="sq-tint" style="box-shadow:inset 0 0 0 3px rgba(220,40,200,.7)"></span>' } : null;
      },
      status: function () { return 'Despair hunts the nearest attacked piece (magenta).'; }
    },
    source: { research: 'research/modes/U67wZoy-1fE.json', confidence: 'medium', notes: 'Resting when nothing is attacked inferred.' }
  });
})();
