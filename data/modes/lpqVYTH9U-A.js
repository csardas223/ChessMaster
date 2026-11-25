/* Chess, But SCP-426 Makes Every Piece Think They're Toasters. Standard chess vs Stockfish (3600) with a neutral SCP-426
   (a toaster) on a4. Every round (after Black's move) it steps one square in a random orthogonal direction (it may step
   onto a normal piece and capture it, never onto a toaster); then every piece next to it (either colour) turns into a
   toaster: an immobile obstacle nobody can enter, for the rest of the game. Only the original toaster moves, so walls
   of toasters and pawns can trap it.
   Sources: research/modes/lpqVYTH9U-A.json (transcript: random orthogonal steps, "the toaster could actually just move
   onto the knight, capturing the knight", walled off on the queenside, ladder mate), rules.jsonl, frames (grey toaster
   sprites, purple arrows, #ead2ba/#ae7e66). Inferred: toasted squares cannot be entered; a toasted or captured king
   loses. Art is original. */
(function () {
  var O4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  function wait(ctx, ms) { return new Promise(function (r) { ctx.after(ms, r); }); }
  function tSq(st) { for (var i = 0; i < st.b.length; i++) if (st.b[i] && st.b[i].t === 'Tst') return i; return -1; }
  function round(ctx) {
    var V = ctx.V, g = ctx.geo, s = tSq(ctx.state); if (s < 0) return null;
    var steps = O4.map(function (d) { return g.step(s, d[0], d[1]); }).filter(function (j) { if (j < 0) return false; var q = ctx.at(j); return !q || (q.c !== 'n' && !V.def(q.t).blocker); });
    var chain = Promise.resolve();
    if (steps.length) {
      var to = ctx.pick(steps);
      ctx.fx({ type: 'arrow', from: s, to: to, color: 'rgba(150, 70, 210, 0.85)', duration_ms: 600 });
      chain = wait(ctx, 500).then(function () {
        var victim = ctx.at(to); ctx.move(s, to); s = to; ctx.sound(victim ? 'capture' : 'move-opponent');
        if (victim && V.def(victim.t).royal) { ctx.endGame(victim.c === ctx.human ? 'bot' : 'player', victim.c === ctx.human ? 'SCP-426 ran over your king' : 'SCP-426 ran over the Stockfish king'); }
      });
    }
    return chain.then(function () {
      if (ctx.over) return;
      var n = 0, king = null;
      for (var dc = -1; dc <= 1; dc++) for (var dr = -1; dr <= 1; dr++) {
        if (!dc && !dr) continue; var j = g.step(s, dc, dr); if (j < 0) continue;
        var p = ctx.at(j); if (!p || p.c === 'n' || V.def(p.t).blocker) continue;
        if (V.def(p.t).royal) king = p;
        ctx.set(j, ctx.piece('Toast', 'n', { was: p.c, wasT: p.t }));
        ctx.fx({ type: 'piece_transform', at: j, style: 'flip' }); n++;
      }
      if (n) { ctx.sound('notify'); ctx.toast(n + ' piece' + (n === 1 ? ' thinks it is' : 's think they are') + ' a toaster now.', 1500); }
      if (king) { ctx.endGame(king.c === ctx.human ? 'bot' : 'player', king.c === ctx.human ? 'your king became a toaster' : 'the Stockfish king became a toaster'); return; }
      ctx.refresh();
    });
  }
  CM.mode({
    id: 'lpqVYTH9U-A',
    name: 'SCP-426 Toaster',
    category: 'Horror Chess',
    description: 'SCP-426 starts on a4 and steps one square up, down, left or right at random every round, capturing any piece it steps on. Every piece next to it then becomes a toaster: a dead, immobile obstacle for the rest of the game. Toasters can wall it in.',
    how_to_win: 'Checkmate Stockfish while keeping your army away from the toaster.',
    player_side: 'white',
    player: { name: 'You', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },   /* iwantcheckmate's own avatar (purple king) from the videos */
    opponent: { name: 'Stockfish', rating: 3600, avatar: 'assets/modes/U_irVoLjtNI/stockfish.png', tagline: 'Definitely not a toaster.' },
    board: { files: 8, ranks: 8 },
    theme: { light: '#ead2ba', dark: '#ae7e66' },
    pieces: {
      Tst: { name: 'SCP-426', moves: '', value: 0, capturable: false, img: 'assets/modes/lpqVYTH9U-A/toaster.png', neutralGlow: false },
      Toast: { name: 'Toaster', moves: '', value: 0, blocker: true, capturable: false, img: 'assets/modes/lpqVYTH9U-A/toaster.png', neutralGlow: false }
    },
    setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR', place: [{ type: 'Tst', color: 'n', at: 'a4' }] },
    bot: { engine: 'search', style: 'best', depth: 4, time_ms: 700 },
    hooks: {
      afterMove: function (ctx, m, info) { if (info.by !== 'bot') return null; return round(ctx); },
      evaluate: function (V, st) {
        var s = tSq(st); if (s < 0) return 0; var g = V.geo, v = 0;
        for (var i = 0; i < st.b.length; i++) { var p = st.b[i]; if (!p || p.c === 'n') continue; var d = g.dist(i, s); if (d <= 2) v += (p.c === 'w' ? -1 : 1) * (V.def(p.t).royal ? 1500 : V.def(p.t).value * 0.3) * (d === 1 ? 2 : 1); }
        return v;
      },
      decorate: function (ctx, sq) {
        var s = tSq(ctx.state); if (s < 0 || sq === s || ctx.geo.dist(sq, s) !== 1) return null;
        return { html: '<span class="sq-tint" style="background:rgba(150,70,210,.18)"></span>' };
      },
      status: function (ctx) { var n = ctx.pieces(function (p) { return p.t === 'Toast'; }).length; return n ? n + ' toaster' + (n === 1 ? '' : 's') + ' on the board.' : 'Stay away from the toaster.'; }
    },
    source: { research: 'research/modes/lpqVYTH9U-A.json', confidence: 'high', notes: 'Toasted squares cannot be entered (inferred).' }
  });
})();
