/* Chess, But the Darkness is All-Consuming. Standard chess vs Stockfish (3600) with SCP-280's darkness starting on b4.
   After every round (after Black's move) the darkness grows by one square, orthogonally, into a square that no piece
   protects (a piece does not protect its own square). A piece standing there is consumed; a consumed king loses.
   Darkness squares are solid: nothing moves onto or through them, so a wall of darkness can split the board.
   Sources: research/modes/BYg7rV53WrM.json (transcript 00:01 b4, orthogonal, unprotected squares only, "B3 is
   protected"; 00:54 a bridge cuts the board; 03:18 "a piece does not defend itself"; 04:07 it eats the queen; 05:52 it
   consumes the king), frames visual_c (black squares with two white eyes, pink highlights, #EAD2B6/#AF8164).
   Inferred: among candidate squares it prefers the most valuable piece, else a random square; no growth when no
   candidate exists. Art is original. */
(function () {
  var O4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  function wait(ctx, ms) { return new Promise(function (r) { ctx.after(ms, r); }); }
  function protectedSq(V, st, sq) { return V.attacked(st, sq, 'w') || V.attacked(st, sq, 'b'); }
  /* squares the darkness may grow into next */
  function frontier(V, st) {
    var g = V.geo, seen = {}, out = [];
    for (var i = 0; i < st.b.length; i++) {
      var p = st.b[i]; if (!p || p.t !== 'Dk') continue;
      for (var k = 0; k < 4; k++) {
        var j = g.step(i, O4[k][0], O4[k][1]); if (j < 0 || seen[j]) continue; seen[j] = 1;
        var q = st.b[j]; if (q && q.t === 'Dk') continue;
        if (!protectedSq(V, st, j)) out.push(j);
      }
    }
    return out;
  }
  function grow(ctx) {
    var V = ctx.V, st = ctx.state, fr = frontier(V, st); if (!fr.length || ctx.over) return null;
    var val = function (i) { var p = st.b[i]; return !p ? 0 : V.def(p.t).royal ? 1e6 : V.def(p.t).value; };
    var top = Math.max.apply(null, fr.map(val)), cand = fr.filter(function (i) { return val(i) === top; }), at = ctx.pick(cand);
    ctx.fx({ type: 'highlight', squares: fr, color: 'rgba(230, 60, 170, 0.45)', duration_ms: 650 });
    return wait(ctx, 600).then(function () {
      var victim = ctx.at(at);
      ctx.spawn('Dk', 'n', at);
      ctx.fx({ type: 'flash', at: at, color: '#000', opacity: 0.9, duration_ms: 420 });
      if (victim) {
        ctx.sound('capture'); ctx.fx({ type: 'particles', kind: 'smoke', at: at });
        ctx.toast('The darkness consumed the ' + (victim.c === 'w' ? 'white ' : 'black ') + (V.def(victim.t).name || victim.t).toLowerCase() + '.', 1800);
        if (V.def(victim.t).royal) { ctx.endGame(victim.c === ctx.human ? 'bot' : 'player', victim.c === ctx.human ? 'the darkness consumed your king' : 'the darkness consumed the Stockfish king'); return; }
      } else ctx.sound('move-opponent');
      ctx.refresh();
    });
  }
  CM.mode({
    id: 'BYg7rV53WrM',
    name: 'All-Consuming Darkness',
    category: 'Horror Chess',
    description: 'The darkness starts on b4. After every round it spreads one square up, down, left or right into a square that no piece protects (a piece does not protect its own square), consuming any piece there. Darkness squares are solid: nothing can enter or cross them.',
    how_to_win: 'Checkmate Stockfish, or let the darkness consume the black king.',
    player_side: 'white',
    opponent: { name: 'Stockfish', rating: 3600, avatar: 'assets/avatars/stockfish.svg', tagline: 'Afraid of the dark.' },
    board: { files: 8, ranks: 8 },
    theme: { light: '#ead2b6', dark: '#af8164' },
    pieces: { Dk: { name: 'Darkness', moves: '', value: 0, blocker: true, capturable: false, img: 'assets/modes/BYg7rV53WrM/darkness.svg', neutralGlow: false, cls: 'g1-dark' } },
    setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR', place: [{ type: 'Dk', color: 'n', at: 'b4' }] },
    bot: { engine: 'search', style: 'best', depth: 4, time_ms: 700 },
    vfx: [{ type: 'vignette', color: 'rgba(0,0,0,0.7)', size: 60, opacity: 0.55 }],
    hooks: {
      afterMove: function (ctx, m, info) { if (info.by !== 'bot') return null; return grow(ctx); },
      /* unprotected pieces next to the darkness are about to be eaten */
      evaluate: function (V, st) {
        var fr = frontier(V, st), v = 0;
        fr.forEach(function (i) { var p = st.b[i]; if (p && p.c !== 'n') v += (p.c === 'w' ? -1 : 1) * (V.def(p.t).royal ? 3000 : V.def(p.t).value * 0.6); });
        return v;
      },
      decorate: function (ctx, sq, p) {
        if (p && p.t === 'Dk') return { cls: 'g1-darksq', html: '<span class="sq-tint" style="background:#050505;z-index:0"></span>' };
        if (ctx.over || !ctx.game._g1fr) return null;
        return ctx.game._g1fr[sq] ? { html: '<span class="sq-tint" style="box-shadow:inset 0 0 0 3px rgba(230,60,170,.55)"></span>' } : null;
      },
      onTurn: function (ctx) { var m = {}; frontier(ctx.V, ctx.state).forEach(function (i) { m[i] = 1; }); ctx.game._g1fr = m; },
      status: function (ctx) { var n = ctx.pieces(function (p) { return p.t === 'Dk'; }).length; return 'The darkness covers ' + n + ' square' + (n === 1 ? '' : 's') + '. Pink squares are unprotected.'; }
    },
    source: { research: 'research/modes/BYg7rV53WrM.json', confidence: 'high', notes: 'Choice among candidate squares inferred (most valuable piece, else random).' }
  });
})();
