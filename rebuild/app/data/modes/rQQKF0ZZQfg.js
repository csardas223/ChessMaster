/* Spinner Wheel Chess | Can I Beat Martin?  Before each of your moves a wheel picks MOVE (anything), CAPTURE (you must
   capture), CHECK (you must give check) or BLUNDER (you must hang at least 3 points of material). If the demanded kind
   of move does not exist you may play any move; getting out of check always comes first. Martin (250) plays normally.
   Sources: research/modes/rQQKF0ZZQfg.json (transcript), frames visual (brown board, rainbow wheel beside it). */
(function () {
  var SEG = ['MOVE', 'CAPTURE', 'CHECK', 'BLUNDER'];
  function fits(V, st, m, seg) {
    var opp = V.opp(m.c), d = V.def(m.p);
    if (seg === 'CAPTURE') return !!m.cap;
    if (seg === 'CHECK') return V.inCheck(m.n, opp);
    if (seg === 'BLUNDER') return !d.royal && d.value >= 300 && V.attacked(m.n, m.t, opp) && (!m.cap || V.def(m.cap.t).value + 300 <= d.value);
    return true;
  }
  CM.mode({
    id: 'rQQKF0ZZQfg',
    name: 'Spinner Wheel Chess',
    category: 'Variants & Games',
    description: 'Before every one of your moves the wheel spins: MOVE lets you play anything, CAPTURE forces a capture, CHECK forces a check and BLUNDER forces you to hang a piece worth 3 or more. If no such move exists you play freely. Martin plays normally.',
    how_to_win: 'Checkmate Martin despite the wheel.',
    player_side: 'white',
    opponent: { name: 'Martin', rating: 250, avatar: 'assets/modes/rQQKF0ZZQfg/martin.png', tagline: 'Principled for a 250.' },
    board: { files: 8, ranks: 8, light: '#ead4af', dark: '#b68667' },
    setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR' },
    bot: { engine: 'auto', elo: 250, style: 'elo' },
    assets: { wheel: 'assets/modes/rQQKF0ZZQfg/spinner_wheel.png' },
    hooks: {
      stockfishOk: true,
      filterMoves: function (V, st, legal) {
        var w = st.x.wheel; if (!w || w.ply !== st.ply || w.c !== st.turn || w.seg === 'MOVE') return legal;
        var ok = legal.filter(function (m) { return fits(V, st, m, w.seg); });
        return ok.length ? ok : legal;
      },
      onTurn: function (ctx, c) {
        if (c !== ctx.human || ctx.over) return;
        var w = ctx.x.wheel; if (w && w.ply === ctx.ply) return;
        var seg = ctx.pick(SEG);
        ctx.setX('wheel', { c: c, ply: ctx.ply, seg: seg });
        ctx.fx({ type: 'overlay', image: 'assets/modes/rQQKF0ZZQfg/spinner_wheel.png', fit: 'contain', opacity: 0.92, duration_ms: 1100, fade_ms: 250 });
        ctx.after(1000, function () {
          var any = ctx.game.moves.some(function (m) { return fits(ctx.V, ctx.state, m, seg); });
          ctx.toast('Wheel: ' + seg + (seg !== 'MOVE' && !any ? ' (impossible, play any move)' : ''), 2400);
        });
        ctx.refresh();
      },
      status: function (ctx) { var w = ctx.x.wheel; return w && w.ply === ctx.ply && ctx.state.turn === ctx.human ? 'Wheel says: ' + w.seg : 'Martin is thinking about chess, not wheels.'; }
    },
    source: { research: 'research/modes/rQQKF0ZZQfg.json', confidence: 'high', notes: 'BLUNDER = moving a piece worth 3+ onto a square the opponent attacks (approximation of "try to lose 3 points").' }
  });
})();
