/* Chess, But SCP-409 Freezes Your Pieces. Standard chess vs Stockfish (3600) with a neutral SCP-409 crystal on c4. Its
   rounds alternate (after Black's move): one round it moves one square, the next it crystallizes every piece on its 8
   neighbouring squares, so pieces next to it after a move get one turn to step away. Crystallized pieces cannot move
   and neither attack nor defend, but can be captured. Three rounds later each one has a 50% chance to thaw and a 50%
   chance to vanish.
   Sources: research/modes/ndbf05-bvgQ.json (transcript: c4, alternating move/crystallize, "it doesn't actively defend
   E5", three turns then 50/50 defrost or disappear, checkmate win), frames (purple danger tint, icy blue frozen pieces,
   #ead2ae/#ae7e66). Inferred: random wandering, the crystal cannot be captured, a vanished king loses, a frozen king
   still counts for check. Art is original. */
(function () {
  var NAMES = { P: 'Pawn', N: 'Knight', B: 'Bishop', R: 'Rook', Q: 'Queen', K: 'King' };
  function wait(ctx, ms) { return new Promise(function (r) { ctx.after(ms, r); }); }
  function cSq(st) { for (var i = 0; i < st.b.length; i++) if (st.b[i] && st.b[i].t === 'Cry') return i; return -1; }
  function round(ctx) {
    var V = ctx.V, g = ctx.geo, x = ctx.x, chain = Promise.resolve();
    /* 1. frozen pieces count down; at zero: thaw or shatter */
    ctx.pieces(function (p) { return p.frz; }).forEach(function (i) {
      var p = ctx.at(i), left = p.frz - 1;
      if (left > 0) { ctx.set(i, Object.assign({}, p, { frz: left })); return; }
      if (ctx.chance(0.5)) {
        var back = Object.assign({}, p, { t: p.orig }); delete back.frz; delete back.orig; delete back.cls; ctx.set(i, back);
        ctx.fx({ type: 'piece_transform', at: i, style: 'flash', color: '#bfefff' });
      } else {
        ctx.remove(i); ctx.fx({ type: 'particles', kind: 'sparks', at: i, colors: ['#e6f8ff', '#9fdcf5', '#ffffff'] }); ctx.sound('capture');
        ctx.toast('The frozen ' + (p.c === 'w' ? 'white ' : 'black ') + NAMES[p.orig].toLowerCase() + ' shattered.', 1600);
        if (p.orig === 'K') ctx.endGame(p.c === ctx.human ? 'bot' : 'player', p.c === ctx.human ? 'your frozen king shattered' : 'the frozen Stockfish king shattered');
      }
    });
    if (ctx.over) return null;
    var s = cSq(ctx.state); if (s < 0) { ctx.refresh(); return null; }
    if (!x.freezeNext) {
      var steps = [];
      for (var dc = -1; dc <= 1; dc++) for (var dr = -1; dr <= 1; dr++) { if (!dc && !dr) continue; var j = g.step(s, dc, dr); if (j >= 0 && !ctx.at(j)) steps.push(j); }
      if (steps.length) { var to = ctx.pick(steps); ctx.fx({ type: 'arrow', from: s, to: to, color: 'rgba(120, 190, 240, 0.85)', duration_ms: 600 }); chain = wait(ctx, 450).then(function () { ctx.move(s, to); ctx.sound('move-opponent'); }); }
      return chain.then(function () { ctx.setX('freezeNext', 1); ctx.refresh(); });
    }
    ctx.setX('freezeNext', 0);
    var n = 0;
    for (var dc2 = -1; dc2 <= 1; dc2++) for (var dr2 = -1; dr2 <= 1; dr2++) {
      if (!dc2 && !dr2) continue; var k = g.step(s, dc2, dr2); if (k < 0) continue;
      var p = ctx.at(k); if (!p || p.c === 'n' || p.frz || V.def(p.t).blocker) continue;
      ctx.set(k, Object.assign({}, p, { t: 'I' + p.t, orig: p.t, frz: 3, cls: 'pc--tint-u' }));
      ctx.fx({ type: 'flash', at: k, color: '#bfefff', opacity: 0.7, duration_ms: 500 }); n++;
    }
    if (n) { ctx.sound('notify'); ctx.toast('SCP-409 crystallized ' + n + ' piece' + (n === 1 ? '' : 's') + '.', 1500); }
    ctx.refresh();
    return null;
  }
  var pieces = { Cry: { name: 'SCP-409', moves: '', value: 0, capturable: false, img: 'assets/modes/ndbf05-bvgQ/crystal.png', neutralGlow: false } };
  ['P', 'N', 'B', 'R', 'Q', 'K'].forEach(function (t) {
    pieces['I' + t] = { name: 'Frozen ' + NAMES[t].toLowerCase(), moves: '', value: { P: 90, N: 280, B: 300, R: 470, Q: 850, K: 0 }[t], glyph: t, royal: t === 'K' };
  });
  CM.mode({
    id: 'ndbf05-bvgQ',
    name: 'SCP-409 Crystal',
    category: 'Horror Chess',
    description: 'SCP-409 starts on c4. Its rounds alternate: one round it moves a square, the next it crystallizes every piece next to it (either colour). Frozen pieces cannot move, attack or defend, but can be captured. Three rounds later each frozen piece thaws or shatters, 50/50.',
    how_to_win: 'Checkmate Stockfish. Step away from the purple squares before the crystal strikes.',
    player_side: 'white',
    opponent: { name: 'Stockfish', rating: 3600, avatar: 'assets/modes/U_irVoLjtNI/stockfish.png', tagline: 'Cold and calculating.' },
    board: { files: 8, ranks: 8 },
    theme: { light: '#ead2ae', dark: '#ae7e66' },
    pieces: pieces,
    setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR', place: [{ type: 'Cry', color: 'n', at: 'c4' }], x: { freezeNext: 0 } },
    rules: { promotion: { choices: ['Q', 'R', 'B', 'N'] } },
    bot: { engine: 'search', style: 'best', depth: 4, time_ms: 700 },
    hooks: {
      afterMove: function (ctx, m, info) { if (info.by !== 'bot') return null; return round(ctx); },
      evaluate: function (V, st) {
        if (!(st.x && st.x.freezeNext)) return 0; var s = cSq(st); if (s < 0) return 0; var g = V.geo, v = 0;
        for (var i = 0; i < st.b.length; i++) { var p = st.b[i]; if (!p || p.c === 'n' || p.frz) continue; if (g.dist(i, s) === 1) v += (p.c === 'w' ? -1 : 1) * (V.def(p.t).royal ? 600 : V.def(p.t).value * 0.5); }
        return v;
      },
      decorate: function (ctx, sq, p) {
        if (p && p.frz) return { badge: String(p.frz), html: '<span class="sq-tint" style="background:rgba(170,225,255,.45)"></span>' };
        var s = cSq(ctx.state); if (s >= 0 && ctx.x.freezeNext && sq !== s && ctx.geo.dist(sq, s) === 1) return { html: '<span class="sq-tint" style="background:rgba(150,70,210,.32)"></span>' };
        return null;
      },
      status: function (ctx) { return ctx.x.freezeNext ? 'The crystal strikes after this round. Leave the purple squares.' : 'The crystal moves after this round.'; }
    },
    source: { research: 'research/modes/ndbf05-bvgQ.json', confidence: 'high', notes: 'Wander direction random; frozen king still royal.' }
  });
})();
