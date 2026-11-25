/* Chess, But SCP-966 Is Disturbed at Night. Fog-of-war chess vs Stockfish (3600): you only see squares your pieces can
   move to. SCP-966 (the sleepless killer) wanders hidden in the fog, starting on c4, one square per round, never onto an
   occupied square. After it moves, every piece next to it (either colour) becomes a zombie: neutral, uncontrollable,
   no vision. Each round the zombies move on their own (keeping their piece movement and pawn direction) and capture
   anything; normal pieces can capture zombies. A zombie does not move in the round it was created.
   Sources: research/modes/mwv48BWl2DY.json (transcript: fog, SCP-966 can never move onto an occupied square, pawn walls
   to herd it, zombies capture both colours, former white pawns still move up), frames (grey cloud fog, highlight pulse
   around SCP-966, #ae7e66 dark squares). Inferred: random wandering, zombies move one after another in random order, a
   zombified or captured king loses, zombie pawns promote to queens. Art is original. */
(function () {
  function wait(ctx, ms) { return new Promise(function (r) { ctx.after(ms, r); }); }
  function sSq(st) { for (var i = 0; i < st.b.length; i++) if (st.b[i] && st.b[i].t === 'S9') return i; return -1; }
  function zMoves(V, st, i) {
    var p = st.b[i], out = []; st.b[i] = { t: p.t, c: p.own === 'b' ? 'y' : 'x', m: 1 }; V.genPiece(st, i, out, true); st.b[i] = p;
    return out.filter(function (m) { return !m.cap || V.def(m.cap.t).capturable !== false; });
  }
  function round(ctx) {
    var V = ctx.V, g = ctx.geo, chain = Promise.resolve();
    CM.util.shuffle(ctx.pieces(function (p) { return p.zom; })).forEach(function (z) {
      chain = chain.then(function () {
        if (ctx.over) return; var p = ctx.at(z); if (!p || !p.zom) return;
        var ms = zMoves(V, ctx.state, z); if (!ms.length) return;
        var mv = ctx.pick(ms), victim = ctx.at(mv.t);
        ctx.move(mv.f, mv.t);
        var np = ctx.at(mv.t);
        if (V.def(np.t).pawn && g.relRow(mv.t, np.own) === g.depth(np.own) - 1) ctx.set(mv.t, Object.assign({}, np, { t: 'Q', img: CM.settings.pieceUrl(np.own, 'Q') }));
        if (victim) ctx.sound('capture');
        if (victim && V.def(victim.t).royal && victim.c !== 'n') { ctx.endGame(victim.c === ctx.human ? 'bot' : 'player', victim.c === ctx.human ? 'a zombie got your king' : 'a zombie got the Stockfish king'); return; }
        ctx.refresh(); return wait(ctx, 220);
      });
    });
    return chain.then(function () {
      if (ctx.over) return;
      var s = sSq(ctx.state); if (s < 0) return;
      var steps = [];
      for (var dc = -1; dc <= 1; dc++) for (var dr = -1; dr <= 1; dr++) { if (!dc && !dr) continue; var j = g.step(s, dc, dr); if (j >= 0 && !ctx.at(j)) steps.push(j); }
      if (steps.length) { var to = ctx.pick(steps); ctx.move(s, to); s = to; }
      var n = 0, king = null;
      for (var dc2 = -1; dc2 <= 1; dc2++) for (var dr2 = -1; dr2 <= 1; dr2++) {
        if (!dc2 && !dr2) continue; var k = g.step(s, dc2, dr2); if (k < 0) continue;
        var p = ctx.at(k); if (!p || p.c === 'n' || V.def(p.t).blocker) continue;
        if (V.def(p.t).royal) king = p;
        ctx.set(k, Object.assign({}, p, { c: 'n', own: p.c, zom: 1, img: CM.settings.pieceUrl(p.c, p.t), cls: 'pc--tint-g' }));
        ctx.fx({ type: 'flash', at: k, color: '#7dff6a', opacity: 0.45, duration_ms: 500 }); n++;
      }
      if (n) { ctx.sound('notify'); ctx.toast('Something in the fog turned ' + n + ' piece' + (n === 1 ? '' : 's') + ' into zombies.', 1700); }
      if (king) { ctx.endGame(king.c === ctx.human ? 'bot' : 'player', king.c === ctx.human ? 'SCP-966 zombified your king' : 'SCP-966 zombified the Stockfish king'); return; }
      ctx.refresh();
    });
  }
  CM.mode({
    id: 'mwv48BWl2DY',
    name: 'SCP-966 at Night',
    category: 'Horror Chess',
    description: 'Fog of war: you only see squares your pieces can reach. SCP-966 wanders in the fog one square per round and can never step onto an occupied square. Every piece next to it becomes a zombie that nobody controls; zombies move by themselves each round and capture anything, but you can capture them.',
    how_to_win: 'Checkmate Stockfish. Wall SCP-966 off with pawns and herd it toward the black army.',
    player_side: 'white',
    opponent: { name: 'Stockfish', rating: 3600, avatar: 'assets/avatars/stockfish.svg', tagline: 'Sees through the fog. You do not.' },
    board: { files: 8, ranks: 8 },
    theme: { light: '#ead2ba', dark: '#ae7e66', background: '#121417' },
    pieces: { S9: { name: 'SCP-966', moves: '', value: 0, capturable: false, img: 'assets/modes/mwv48BWl2DY/scp966.svg', neutralGlow: false } },
    setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR', place: [{ type: 'S9', color: 'n', at: 'c4' }] },
    rules: { fog: true },
    bot: { engine: 'search', style: 'best', depth: 3, time_ms: 700 },
    vfx: [{ type: 'vignette', color: 'rgba(5,8,20,0.85)', size: 55, opacity: 0.6 }],
    hooks: {
      init: function (ctx) { ctx.geo.setDir('x', 'up'); ctx.geo.setDir('y', 'down'); },
      afterMove: function (ctx, m, info) { if (info.by !== 'bot') return null; return round(ctx); },
      evaluate: function (V, st) {
        var s = sSq(st); if (s < 0) return 0; var g = V.geo, v = 0;
        for (var i = 0; i < st.b.length; i++) { var p = st.b[i]; if (!p || p.c === 'n') continue; var d = g.dist(i, s); if (d <= 2) v += (p.c === 'w' ? -1 : 1) * (V.def(p.t).royal ? 1200 : V.def(p.t).value * 0.3) * (3 - d); }
        return v;
      },
      status: function (ctx) { var n = ctx.pieces(function (p) { return p.zom; }).length; return n ? n + ' zombie' + (n === 1 ? '' : 's') + ' somewhere on the board.' : 'Something is moving in the fog.'; }
    },
    source: { research: 'research/modes/mwv48BWl2DY.json', confidence: 'medium', notes: 'Random wandering and king zombification inferred.' }
  });
})();
