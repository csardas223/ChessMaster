/* Chess, But He Knows You Are Alone. Standard chess vs Stockfish (3600) with a neutral shadow entity, Room, on b4. A
   piece is isolated when none of its 8 neighbouring squares holds a piece (enemy pieces count). Every round (after
   Black's move) Room steps one square toward the nearest isolated piece of either colour; if that piece is still alone
   when Room reaches it, Room takes it. With no isolated piece Room waits.
   Sources: research/modes/mymJwfSPeFA.json (transcript: b4, "enemy pieces do count as neighbors", captures only if the
   target is still alone), rules.jsonl, frames (purple path arrows, #e9d3b3/#af8265). Inferred: Room itself does not
   count as a neighbour, random tie-break, a taken king loses. Art is original. */
(function () {
  function wait(ctx, ms) { return new Promise(function (r) { ctx.after(ms, r); }); }
  function rSq(st) { for (var i = 0; i < st.b.length; i++) if (st.b[i] && st.b[i].t === 'Rm') return i; return -1; }
  function isolated(V, st, i) {
    var g = V.geo;
    for (var dc = -1; dc <= 1; dc++) for (var dr = -1; dr <= 1; dr++) { if (!dc && !dr) continue; var j = g.step(i, dc, dr); if (j < 0) continue; var q = st.b[j]; if (q && q.t !== 'Rm') return false; }
    return true;
  }
  function lonely(V, st) { var o = []; for (var i = 0; i < st.b.length; i++) { var p = st.b[i]; if (p && p.c !== 'n' && !V.def(p.t).blocker && isolated(V, st, i)) o.push(i); } return o; }
  function round(ctx) {
    var V = ctx.V, g = ctx.geo, st = ctx.state, s = rSq(st); if (s < 0) return null;
    var L = lonely(V, st); if (!L.length) return null;
    var bd = Math.min.apply(null, L.map(function (i) { return g.dist(i, s); }));
    var tgt = ctx.pick(L.filter(function (i) { return g.dist(i, s) === bd; })), to;
    if (bd === 1) to = tgt;
    else {
      var opts = [], best = 99;
      for (var dc = -1; dc <= 1; dc++) for (var dr = -1; dr <= 1; dr++) { if (!dc && !dr) continue; var j = g.step(s, dc, dr); if (j < 0 || ctx.at(j)) continue; var d = g.dist(j, tgt); if (d < best) { best = d; opts = [j]; } else if (d === best) opts.push(j); }
      if (!opts.length) return null; to = ctx.pick(opts);
    }
    ctx.fx({ type: 'arrow', from: s, to: to, color: 'rgba(140, 60, 200, 0.85)', duration_ms: 650 });
    return wait(ctx, 520).then(function () {
      var victim = ctx.at(to); ctx.move(s, to);
      if (victim) {
        ctx.sound('capture'); ctx.fx({ type: 'vignette', color: 'rgba(0,0,0,0.9)', size: 40, duration_ms: 700, id: 'room', fade_ms: 200 });
        ctx.toast('Room took the lonely ' + (victim.c === 'w' ? 'white ' : 'black ') + (V.def(victim.t).name || victim.t).toLowerCase() + '.', 1800);
        if (V.def(victim.t).royal) { ctx.endGame(victim.c === ctx.human ? 'bot' : 'player', victim.c === ctx.human ? 'your king was alone' : 'the Stockfish king was alone'); return; }
      } else ctx.sound('move-opponent');
      ctx.refresh();
    });
  }
  CM.mode({
    id: 'mymJwfSPeFA',
    name: 'He Knows You Are Alone',
    category: 'Horror Chess',
    description: 'Room starts on b4. Any piece with no piece at all on its 8 neighbouring squares is alone. After every round Room steps toward the nearest lonely piece, yours or Stockfish\'s, and takes it if it is still alone when he arrives.',
    how_to_win: 'Checkmate Stockfish. Keep your pieces in pairs.',
    player_side: 'white',
    opponent: { name: 'Stockfish', rating: 3600, avatar: 'assets/avatars/stockfish.svg', tagline: 'Never alone.' },
    board: { files: 8, ranks: 8 },
    theme: { light: '#e9d3b3', dark: '#af8265' },
    pieces: { Rm: { name: 'Room', moves: '', value: 0, capturable: false, img: 'assets/modes/mymJwfSPeFA/shadow.png', neutralGlow: false } },
    setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR', place: [{ type: 'Rm', color: 'n', at: 'b4' }] },
    bot: { engine: 'search', style: 'best', depth: 4, time_ms: 700 },
    hooks: {
      afterMove: function (ctx, m, info) { if (info.by !== 'bot') return null; return round(ctx); },
      evaluate: function (V, st) {
        var s = rSq(st); if (s < 0) return 0; var g = V.geo, v = 0;
        lonely(V, st).forEach(function (i) { var p = st.b[i], d = g.dist(i, s); if (d <= 3) v += (p.c === 'w' ? -1 : 1) * (V.def(p.t).royal ? 800 : V.def(p.t).value * 0.25) * (4 - d); });
        return v;
      },
      decorate: function (ctx, sq, p) {
        if (!p || p.c === 'n' || ctx.over) return null;
        return isolated(ctx.V, ctx.state, sq) ? { html: '<span class="sq-tint" style="box-shadow:inset 0 0 0 3px rgba(140,60,200,.6)"></span>' } : null;
      },
      status: function () { return 'Purple-ringed pieces are alone.'; }
    },
    source: { research: 'research/modes/mymJwfSPeFA.json', confidence: 'high' }
  });
})();
