/* Can I Get the RAREST Checkmate?  (After Paralogical's video.) The goal is a checkmate that is a doubly disambiguated
   bishop capture AND a discovered check, against Martin (250). Tony promotes two extra light-squared bishops, keeps one
   Martin pawn alive, sets a stalemate trap so Martin must push it to b2, then plays B(c1)xb2 (~8:27).
   Sources: research/modes/9S2QuAHo24c.json. Scoring: that exact kind of mate wins; any other checkmate of Martin ends the
   game as "challenge failed" (draw). SAN shows the full-square disambiguation (e.g. Bc1xb2#). */
(function () {
  function martinPick(ctx, L) {
    if (!L.length) return null;
    var MATE = (CM.MATE || 100000) - 1000;
    if (L[0].v >= MATE) return L[0];
    var safe = L.filter(function (x) { return x.v > -MATE; }); if (!safe.length) safe = L;
    return CM.bot.pickByStrength(safe, CM.bot.eloStrength(250));
  }
  /* rare = White bishop capture, another bishop could reach the square from the same file AND another from the same rank,
     and the check comes from a different piece (discovered) */
  function rare(V, st, m, n) {
    if (m.c !== 'w' || m.p !== 'B' || !m.cap) return 0;
    var g = V.geo, sameF = false, sameR = false, ms = [];
    for (var i = 0; i < st.b.length; i++) { var p = st.b[i]; if (p && p.c === 'w' && p.t === 'B' && i !== m.f) V.genPiece(st, i, ms, true); }
    ms.forEach(function (x) { if (x.t === m.t) { if (g.col(x.f) === g.col(m.f)) sameF = true; if (g.row(x.f) === g.row(m.f)) sameR = true; } });
    if (!sameF || !sameR) return 0;
    var K = V.royals(n, 'b')[0]; if (K == null || !V.attacked(n, K, 'w')) return 0;
    var own = []; V.genPiece(n, m.t, own, true);
    return own.some(function (x) { return x.t === K; }) ? 0 : 1;
  }
  CM.mode({
    id: '9S2QuAHo24c',
    title: 'Can I Get the RAREST Checkmate?',
    name: 'The Rarest Checkmate',
    category: 'Other Videos',
    description: 'Deliver the rarest checkmate: a bishop capture that needs both file and rank to say which bishop moved (three bishops able to reach the same square), and that mates with a discovered check from another piece. Promote extra bishops, keep one Martin pawn alive and lure it to the right square. Any other checkmate fails the challenge.',
    how_to_win: 'Checkmate Martin with a doubly disambiguated bishop capture that is a discovered check.',
    player_side: 'white',
    opponent: { name: 'Martin', rating: 250, avatar: 'assets/modes/6qVgF1OO_cw/martin.svg', tagline: 'chess.com beginner bot.' },
    board: { files: 8, ranks: 8, light: '#eeeed2', dark: '#769656' },
    setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR' },
    rules: { promotion: { choices: ['Q', 'N', 'R', 'B'] } },
    bot: { engine: 'search', elo: 250, depth: 2, time_ms: 400 },
    messages: { win_title: 'The Rarest Checkmate!', draw: 'Checkmate, but not the rarest kind. The challenge failed.' },
    hooks: {
      onMake: function (V, st, m, n) { n.x.rare = rare(V, st, m, n); },
      checkWin: function (V, st, moves) {
        if (moves.length || st.turn !== 'b' || !V.inCheck(st, 'b')) return null;
        return st.x.rare ? { w: 'w', why: 'doubly disambiguated bishop capture with discovered checkmate' } : { w: 'd', why: 'checkmate, but not the rarest one: the challenge failed' };
      },
      botPick: martinPick,
      afterMove: function (ctx, m, info) {
        if (info.by === 'player' && ctx.over && ctx.over.w === ctx.human) {
          ctx.fx({ type: 'text', text: 'RAREST CHECKMATE!', color: '#ffd23f', size: 40, at: 'board', duration_ms: 1800 });
          ctx.fx({ type: 'particles', kind: 'gold', count: 80, at: 'board' });
        }
      },
      status: function (ctx) {
        if (ctx.over) return null;
        var n = ctx.pieces(function (p) { return p.c === ctx.human && p.t === 'B'; }).length;
        return 'You have ' + n + ' bishop' + (n === 1 ? '' : 's') + ' (you need three able to reach one square)';
      }
    },
    source: { research: 'research/modes/9S2QuAHo24c.json', confidence: 'medium', notes: 'Engine SAN gives full-square disambiguation when needed.' }
  });
})();
