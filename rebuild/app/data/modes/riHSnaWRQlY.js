/* Chess, But My Pieces Can Time Travel. Chess vs Stockfish (3600) with a once-per-game power: one of your pieces may
   travel back in time to a square it stood on before one of its last three moves. The rest of the board stays as it
   is; the jump is your move, and an enemy piece now standing on that old square is captured.
   Sources: research/modes/riHSnaWRQlY.json (transcript: "double-click a piece to see its past squares", bishop moved
   once can only return to c1, "I've lost the ability to move to b5", plan to win the queen with a jump, ladder mate),
   frames visual_* (brown #eadeba/#ae7e66, magenta past squares, faded ghost copies with clock badges).
   UI: past squares of the selected piece show a ghost with a clock; tap one (pick Move or Time travel if both fit).
   Inferred: cannot capture the king by time travel, must not leave your king in check. */
(function () {
  function chooser(ctx, flag, icon) {
    var G = ctx.game; if (G['_g1ch' + flag]) return; G['_g1ch' + flag] = 1;
    var tm = G.tryMove;
    G.tryMove = function (f, t, d) {
      var c = G.moves.filter(function (m) { return m.f === f && m.t === t; }), sp = c.filter(function (m) { return m[flag]; }), nm = c.filter(function (m) { return !m[flag]; });
      if (!sp.length || G.state.turn !== G.human || G.busy) return tm.call(G, f, t, d);
      var run = function (special) {
        if (special) return G.commit(sp[0], { dragged: d });
        var save = G.moves, only = save.filter(function (m) { return !(m.f === f && m.t === t && m[flag]); }); G.moves = only; tm.call(G, f, t, d); if (G.moves === only) G.moves = save;
      };
      if (!nm.length) return run(true);
      CM.gameUI.promote(t, [{ type: 'move', src: G.pieceImage(G.state.b[f]) }, { type: flag, src: icon }]).then(function (ch) { if (!ch) { G.sel = -1; G.render(); return; } run(ch === flag); });
    };
  }
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
    description: 'Once per game, one of your pieces can jump back in time to a square it stood on before one of its last three moves. Everything else stays put. It uses your move, and an enemy piece standing on that square now is captured. Select a piece to see its past squares.',
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
          past(V, st, i).forEach(function (s) { var q = st.b[s]; out.push({ f: i, t: s, p: p.t, c: 'w', cap: q || null, capSq: q ? s : undefined, tt: 1 }); }); }
        return out;
      },
      onMake: function (V, st, m, n) {
        if (m.c !== 'w' || m.drop) return;
        var p = n.b[m.t]; if (!p) return;
        n.b[m.t] = Object.assign({}, p, { h: ((st.b[m.f] && st.b[m.f].h) || []).concat([m.f]).slice(-3) });
        if (m.tt) n.x.tt = 1;
      },
      init: function (ctx) { chooser(ctx, 'tt', 'assets/modes/riHSnaWRQlY/tt_rook.png'); },
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
      status: function (ctx) { return ctx.x.tt ? 'Time travel used.' : 'Time travel ready (once). Select a piece to see its past squares.'; }
    },
    todo_pass2: [],
    source: { research: 'research/modes/riHSnaWRQlY.json', confidence: 'high', notes: 'No king capture by time travel (inferred).' }
  });
})();
