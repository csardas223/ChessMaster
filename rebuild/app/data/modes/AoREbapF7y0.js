/* Chess, But My Bishops Are Snipers. Chess vs Stockfish (3600); White's two bishops are Sniper Bishops. A sniper
   either moves like a bishop or, as its whole turn, shoots the first enemy piece on one of its diagonals (line of
   sight) and stays where it is. The king cannot be sniped. Snipers can be captured normally.
   Sources: research/modes/AoREbapF7y0.json (transcript 00:01 "every time I snipe a piece, it does cost me a turn",
   00:29 knight sniped, 01:50 line of sight to h8, secondary challenge lost), frames visual_a (brown #e9d3b3/#ae8265,
   camouflaged sniper bishop, purple snipe arrows, magenta target square).
   UI: tap a sniper, then an enemy piece in its sights; a small picker asks Move (capture by moving) or Snipe.
   Inferred: sniping the king is not allowed (checkmate required). */
(function () {
  var DIAG = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
  function targets(V, st, i) {
    var g = V.geo, o = [];
    DIAG.forEach(function (d) {
      var j = i; while (true) { j = g.step(j, d[0], d[1]); if (j < 0) break; var q = st.b[j]; if (!q) continue;
        if (q.c === 'b' && !V.def(q.t).royal && V.def(q.t).capturable !== false && !V.def(q.t).blocker) o.push(j); break; }
    });
    return o;
  }
  /* tap-to-choose when a square is both a normal capture and a special action */
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
  CM.mode({
    id: 'AoREbapF7y0',
    name: 'Sniper Bishops',
    category: 'Powerups & Rule Twists',
    description: 'Your two bishops are snipers. A sniper moves like a bishop, or uses its turn to shoot the first enemy piece on one of its diagonals without moving. Tap a sniper, then a piece in its sights, and pick Move or Snipe. The king cannot be sniped.',
    how_to_win: 'Checkmate Stockfish. Fianchetto the snipers on the long diagonals and pick off its developing pieces.',
    player_side: 'white',
    opponent: { name: 'Stockfish', rating: 3600, avatar: 'assets/avatars/stockfish.svg', tagline: 'Keeps its head down.' },
    board: { files: 8, ranks: 8 },
    theme: { light: '#e9d3b3', dark: '#ae8265' },
    pieces: { SB: { name: 'Sniper Bishop', moves: 'B', value: 520, san: 'B', img: { w: 'assets/modes/AoREbapF7y0/sniper.svg' } } },
    setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RN[SB]QK[SB]NR' },
    rules: { promotion: { choices: ['Q', 'R', 'B', 'N'] } },
    bot: { engine: 'search', style: 'best', depth: 3, time_ms: 800 },
    sounds: { shot: 'assets/modes/AoREbapF7y0/shot.wav' },
    hooks: {
      moves: function (V, st, out) {
        if (st.turn !== 'w') return out;
        for (var i = 0; i < st.b.length; i++) { var p = st.b[i]; if (!p || p.t !== 'SB' || p.c !== 'w') continue;
          targets(V, st, i).forEach(function (j) { out.push({ f: i, t: j, p: 'SB', c: 'w', cap: st.b[j], capSq: j, snipe: 1 }); }); }
        return out;
      },
      onMake: function (V, st, m, n) { if (!m.snipe) return; n.b[m.f] = st.b[m.f]; n.b[m.t] = null; n.half = 0; },
      init: function (ctx) { chooser(ctx, 'snipe', 'assets/modes/AoREbapF7y0/crosshair.svg'); },
      afterMove: function (ctx, m) {
        if (!m.snipe) return null;
        ctx.fx({ type: 'arrow', from: ctx.name(m.f), to: ctx.name(m.t), color: 'rgba(150,80,220,.85)', duration_ms: 700 });
        ctx.fx({ type: 'flash', at: m.t, color: '#d63cc8', opacity: 0.6, duration_ms: 450 });
        ctx.sound('shot');
        return null;
      },
      decorate: function (ctx, sq, p) {
        var G = ctx.game, s = G.sel >= 0 ? ctx.at(G.sel) : null;
        if (s && s.t === 'SB' && s.c === ctx.human && ctx.state.turn === ctx.human && targets(ctx.V, ctx.state, G.sel).indexOf(sq) >= 0)
          return { html: '<img alt="" src="assets/modes/AoREbapF7y0/crosshair.svg" style="position:absolute;inset:8%;width:84%;height:84%;z-index:3;pointer-events:none;opacity:.85">' };
        return null;
      },
      status: function (ctx) { return 'Tap a sniper bishop, then a target in its sights to snipe.'; }
    },
    todo_pass2: [],
    source: { research: 'research/modes/AoREbapF7y0.json', confidence: 'high', notes: 'King cannot be sniped (inferred).' }
  });
})();
