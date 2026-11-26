/* Chess, But My Bishops Are Snipers. Chess vs Stockfish (3600); White's two bishops are Sniper Bishops. A sniper
   either moves like a bishop or, as its whole turn, shoots the first enemy piece on one of its diagonals (line of
   sight) and stays where it is. The king cannot be sniped. Snipers can be captured normally.
   Sources: research/modes/AoREbapF7y0.json (transcript 00:01 "every time I snipe a piece, it does cost me a turn",
   00:29 knight sniped, 01:50 line of sight to h8, secondary challenge lost), frames visual_a (brown #e9d3b3/#ae8265,
   camouflaged sniper bishop, purple snipe arrows, magenta target square).
   UI (matches iwantcheckmate.com): tap/click a sniper and then a target to capture by moving; DOUBLE-TAP/click any enemy
   piece a sniper attacks diagonally to shoot it without moving. No picker.
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
  /* own snipers that have `target` in their sights (nearest one is used by a double-tap, like the site) */
  function shooters(V, st, target) {
    var o = [];
    for (var i = 0; i < st.b.length; i++) { var p = st.b[i]; if (p && p.t === 'SB' && p.c === 'w' && targets(V, st, i).indexOf(target) >= 0) o.push(i); }
    return o;
  }
  CM.mode({
    id: 'AoREbapF7y0',
    name: 'Sniper Bishops',
    category: 'Powerups & Rule Twists',
    description: 'Your two bishops are snipers. A sniper moves like a bishop, or uses its turn to shoot the first enemy piece on one of its diagonals without moving. Tap a target to capture by moving there, or double-tap an enemy piece in a sniper\'s sights to shoot it. The king cannot be sniped.',
    how_to_win: 'Checkmate Stockfish. Fianchetto the snipers on the long diagonals and pick off its developing pieces.',
    player_side: 'white',
    player: { name: 'You', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },   /* iwantcheckmate's own avatar (purple king) from the videos */
    opponent: { name: 'Stockfish', rating: 3600, avatar: 'assets/modes/U_irVoLjtNI/stockfish.png', tagline: 'Keeps its head down.' },
    board: { files: 8, ranks: 8 },
    theme: { light: '#e9d3b3', dark: '#ae8265' },
    pieces: { SB: { name: 'Sniper Bishop', moves: 'B', value: 520, san: 'B', img: { w: 'assets/modes/AoREbapF7y0/sniper.png' } } },
    setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RN[SB]QK[SB]NR' },
    rules: { promotion: { choices: ['Q', 'R', 'B', 'N'] } },
    bot: { engine: 'search', style: 'best', depth: 3, time_ms: 800 },
    sounds: { shot: 'assets/modes/AoREbapF7y0/shot.wav' },
    hooks: {
      moves: function (V, st, out) {
        if (st.turn !== 'w') return out;
        for (var i = 0; i < st.b.length; i++) { var p = st.b[i]; if (!p || p.t !== 'SB' || p.c !== 'w') continue;
          targets(V, st, i).forEach(function (j) { out.push({ f: i, t: j, p: 'SB', c: 'w', cap: st.b[j], capSq: j, snipe: 1, special: 1 }); }); }
        return out;
      },
      onMake: function (V, st, m, n) { if (!m.snipe) return; n.b[m.f] = st.b[m.f]; n.b[m.t] = null; n.half = 0; },
      /* double-tap a target: the nearest sniper with it in its sights shoots it (no need to select the bishop first) */
      canDoubleTap: function (ctx, sq) {
        var p = ctx.at(sq);
        if (!p || p.c !== 'b') return false;
        return shooters(ctx.V, ctx.state, sq).length > 0;
      },
      doubleTap: function (ctx, sq) {
        var G = ctx.game, f = -1, best = 99;
        shooters(ctx.V, ctx.state, sq).forEach(function (i) { var gap = ctx.geo.dist(i, sq); if (gap < best) { best = gap; f = i; } });
        if (f < 0) return false;
        var m = G.moves.filter(function (x) { return x.f === f && x.t === sq && x.snipe; })[0];
        if (!m) return false;
        G.commit(m, { dragged: false });
        return true;
      },
      onTap: function (ctx, sq) {
        var p = ctx.at(sq);
        if (!ctx.x.snipe_hint && p && p.t === 'SB' && p.c === ctx.human) {
          ctx.setX('snipe_hint', 1);
          ctx.toast('Double-tap an enemy piece in a sniper\'s sights to shoot it.', 2400);
        }
        return false;
      },
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
          return { html: '<span class="sq-tint" style="background:rgba(214,60,200,.45)"></span>' };
        return null;
      },
      status: function (ctx) { return 'Tap a target to move there, or double-tap an enemy piece in a sniper\'s sights to shoot it.'; }
    },
    source: { research: 'research/modes/AoREbapF7y0.json', confidence: 'high', notes: 'King cannot be sniped (inferred).' }
  });
})();
