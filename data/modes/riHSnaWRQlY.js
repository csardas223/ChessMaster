/* Chess, But My Pieces Can Time Travel. Chess vs Stockfish (3600) with a once-per-game power: one of your pieces may
   travel back in time to a square it stood on before one of its last three moves. The rest of the board stays as it
   is; the jump is your move, and an enemy piece now standing on that old square is captured.
   Sources: research/modes/riHSnaWRQlY.json (transcript: "double-click a piece to see its past squares", bishop moved
   once can only return to c1, "I've lost the ability to move to b5", plan to win the queen with a jump, ladder mate),
   frames visual_* (brown #eadeba/#ae7e66, magenta past squares, faded ghost copies with clock badges).
   UI: select a piece to see its past squares as ghosts with a clock; tap one to move there normally, or DOUBLE-TAP it
   to time-travel. No picker.
   Inferred: cannot capture the king by time travel, must not leave your king in check. */
(function () {
  function past(V, st, i) {
    var p = st.b[i]; if (!p || !p.h) return [];
    var seen = {}, o = [];
    p.h.forEach(function (s) { if (s === i || seen[s]) return; seen[s] = 1; var q = st.b[s];
      if (!q || (q.c === 'b' && !V.def(q.t).royal && !V.def(q.t).blocker)) o.push(s); });
    return o;
  }
  CM.mode({
    id: 'riHSnaWRQlY',
    name: 'Time Travel',
    category: 'Powerups & Rule Twists',
    description: 'Once per game, one of your pieces can jump back in time to a square it stood on before one of its last three moves. Everything else stays put. It uses your move, and an enemy piece standing on that square now is captured. Select a piece to see its past squares, then double-tap one to jump.',
    how_to_win: 'Checkmate Stockfish. Tour a piece around, then wait for an enemy to step onto its past.',
    player_side: 'white',
    player: { name: 'You', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },   /* iwantcheckmate's own avatar (purple king) from the videos */
    opponent: { name: 'Stockfish', rating: 3600, avatar: 'assets/modes/U_irVoLjtNI/stockfish.png', tagline: 'Lives strictly in the present.' },
    board: { files: 8, ranks: 8 },
    theme: { light: '#eadeba', dark: '#ae7e66' },
    setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR', x: { tt: 0 } },
    bot: { engine: 'search', style: 'best', depth: 3, time_ms: 800 },
    sounds: { warp: 'assets/modes/riHSnaWRQlY/warp.wav' },
    hooks: {
      moves: function (V, st, out) {
        if (st.turn !== 'w' || st.x.tt) return out;
        for (var i = 0; i < st.b.length; i++) { var p = st.b[i]; if (!p || p.c !== 'w' || !p.h) continue;
          past(V, st, i).forEach(function (s) { var q = st.b[s]; out.push({ f: i, t: s, p: p.t, c: 'w', cap: q || null, capSq: q ? s : undefined, tt: 1, special: 1 }); }); }
        return out;
      },
      onMake: function (V, st, m, n) {
        if (m.c !== 'w' || m.drop) return;
        var p = n.b[m.t]; if (!p) return;
        n.b[m.t] = Object.assign({}, p, { h: ((st.b[m.f] && st.b[m.f].h) || []).concat([m.f]).slice(-3) });
        if (m.tt) n.x.tt = 1;
      },
      /* double-tap one of the selected piece's magenta past squares to jump there (a plain tap just moves if it can) */
      canDoubleTap: function (ctx, sq) {
        var G = ctx.game;
        if (ctx.x.tt || G.sel < 0 || ctx.state.turn !== ctx.human || ctx.busy) return false;
        var p = ctx.at(G.sel); if (!p || p.c !== ctx.human) return false;
        return past(ctx.V, ctx.state, G.sel).indexOf(sq) >= 0 && G.moves.some(function (m) { return m.f === G.sel && m.t === sq && m.tt; });
      },
      doubleTap: function (ctx, sq) {
        var G = ctx.game, m = G.moves.filter(function (x) { return x.f === G.sel && x.t === sq && x.tt; })[0];
        if (!m) return false;
        G.commit(m, { dragged: false });
        return true;
      },
      afterMove: function (ctx, m) {
        if (!m.tt) return null;
        ctx.fx({ type: 'flash', at: m.f, color: '#d63cc8', opacity: 0.55, duration_ms: 500 });
        ctx.fx({ type: 'flash', at: m.t, color: '#7a5cff', opacity: 0.6, duration_ms: 650 });
        ctx.fx({ type: 'tint', color: '#6a40c8', opacity: 0.18, target: 'board', duration_ms: 500 });
        ctx.sound('warp'); ctx.toast('Time travel used: back to ' + ctx.name(m.t) + '.', 1800);
        return null;
      },
      decorate: function (ctx, sq) {
        var G = ctx.game; if (ctx.x.tt || G.sel < 0 || ctx.state.turn !== ctx.human) return null;
        var s = ctx.at(G.sel); if (!s || s.c !== ctx.human) return null;
        if (past(ctx.V, ctx.state, G.sel).indexOf(sq) < 0) return null;
        return { html: '<span class="sq-tint" style="background:rgba(214,60,200,.35)"></span><img alt="" src="' + G.pieceImage(s) + '" style="position:absolute;inset:6%;width:88%;height:88%;opacity:.35;z-index:2;pointer-events:none"><img alt="" src="assets/modes/riHSnaWRQlY/clock.png" style="position:absolute;right:4%;top:4%;width:34%;height:34%;z-index:3;pointer-events:none">' };
      },
      status: function (ctx) { return ctx.x.tt ? 'Time travel used.' : 'Time travel ready (once): select a piece, then double-tap a magenta past square to jump.'; }
    },
    source: { research: 'research/modes/riHSnaWRQlY.json', confidence: 'high', notes: 'No king capture by time travel (inferred).' }
  });
})();
