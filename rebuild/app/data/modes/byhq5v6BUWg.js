/* Chess, But SCP-049 Cures Your Pieces. Standard chess vs Stockfish (3600) with a neutral SCP-049 (Plague Doctor) on b4.
   Every round (after Black's move) the zombies each make a random move, then the doctor steps one square orthogonally in
   a random direction and "cures" every piece next to it into an immortal neutral zombie. Zombies belong to no one,
   cannot be captured, move with their own piece movement (zombie pawns randomly forward or backward, promoting to a
   zombie queen on either back rank) and capture white and black pieces alike, kings included.
   Sources: research/modes/byhq5v6BUWg.json (transcript 00:01 rule and b4 start, 00:27 random orthogonal steps, 00:57
   pawns forward and backward and zombie queen, 01:50 a stuck zombie skips, 06:59 king capture win), rules.jsonl,
   frames visual_a (brown #e9d4b4/#af8264, magenta squares, purple arrows). Inferred: zombies move before the doctor,
   a zombified king loses, zombies are drawn as their old piece tinted green. Art is original. */
(function () {
  var O4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  function wait(ctx, ms) { return new Promise(function (r) { ctx.after(ms, r); }); }
  function docSq(st) { for (var i = 0; i < st.b.length; i++) if (st.b[i] && st.b[i].t === 'Doc') return i; return -1; }
  function zMoves(V, st, i) {
    var p = st.b[i], base = p.base, out = [];
    var dirs = base === 'P' ? ['x', 'y'] : [p.own === 'b' ? 'y' : 'x'];
    dirs.forEach(function (fc) {
      st.b[i] = { t: base, c: fc, m: 1 }; V.genPiece(st, i, out, true); st.b[i] = p;
    });
    return out.filter(function (m) { return !m.cap || V.def(m.cap.t).capturable !== false; });
  }
  function zombify(ctx, i) {
    var p = ctx.at(i);
    ctx.set(i, { t: 'Z' + p.t, c: 'n', m: 1, base: p.t, own: p.c, img: CM.settings.pieceUrl(p.c, p.t), cls: 'pc--tint-g' });
    ctx.fx({ type: 'flash', at: i, color: '#e040c8', opacity: 0.6, duration_ms: 420 });
  }
  function kingLost(ctx, victim, how) {
    ctx.endGame(victim.own ? (victim.own === ctx.human ? 'bot' : 'player') : (victim.c === ctx.human ? 'bot' : 'player'), how);
  }
  function round(ctx) {
    var V = ctx.V, g = ctx.geo, chain = Promise.resolve();
    var zs = CM.util.shuffle(ctx.pieces(function (p) { return p.base; }));
    zs.forEach(function (z0) {
      chain = chain.then(function () {
        if (ctx.over) return;
        var z = z0, p = ctx.at(z); if (!p || !p.base) return;
        var ms = zMoves(V, ctx.state, z); if (!ms.length) return;
        var mv = ctx.pick(ms);
        ctx.fx({ type: 'arrow', from: mv.f, to: mv.t, color: 'rgba(150, 70, 210, 0.8)', duration_ms: 520 });
        return wait(ctx, 380).then(function () {
          var victim = ctx.at(mv.t); ctx.move(mv.f, mv.t); ctx.sound(victim ? 'capture' : 'move-opponent');
          var np = ctx.at(mv.t), r = g.row(mv.t);
          if (np.base === 'P' && (r === 0 || r === g.ranks - 1)) ctx.set(mv.t, Object.assign({}, np, { t: 'ZQ', base: 'Q', img: CM.settings.pieceUrl(np.own, 'Q') }));
          if (victim && V.def(victim.t).royal) { kingLost(ctx, victim, victim.c === ctx.human ? 'a zombie ate your king' : 'a zombie ate the Stockfish king'); return; }
          ctx.refresh();
        });
      });
    });
    return chain.then(function () {
      if (ctx.over) return;
      var s = docSq(ctx.state); if (s < 0) return;
      var steps = O4.map(function (d) { return g.step(s, d[0], d[1]); }).filter(function (j) { return j >= 0 && !ctx.at(j); });
      if (steps.length) { var to = ctx.pick(steps); ctx.fx({ type: 'arrow', from: s, to: to, color: 'rgba(224, 64, 200, 0.85)', duration_ms: 520 }); ctx.move(s, to); s = to; ctx.sound('move-opponent'); }
      return wait(ctx, 380).then(function () {
        var lostKing = null, n = 0;
        for (var dc = -1; dc <= 1; dc++) for (var dr = -1; dr <= 1; dr++) {
          if (!dc && !dr) continue; var j = g.step(s, dc, dr); if (j < 0) continue;
          var p = ctx.at(j); if (!p || p.c === 'n' || V.def(p.t).blocker) continue;
          if (V.def(p.t).royal) lostKing = p;
          zombify(ctx, j); n++;
        }
        if (n) { ctx.sound('notify'); ctx.toast('SCP-049 cured ' + n + ' piece' + (n === 1 ? '' : 's') + '.', 1500); }
        if (lostKing) { ctx.endGame(lostKing.c === ctx.human ? 'bot' : 'player', lostKing.c === ctx.human ? 'SCP-049 cured your king' : 'SCP-049 cured the Stockfish king'); return; }
        ctx.refresh();
      });
    });
  }
  var pieces = { Doc: { name: 'SCP-049', moves: '', value: 0, capturable: false, img: 'assets/modes/byhq5v6BUWg/doctor.png', neutralGlow: false } };
  ['P', 'N', 'B', 'R', 'Q', 'K'].forEach(function (t) { pieces['Z' + t] = { name: 'Zombie ' + { P: 'pawn', N: 'knight', B: 'bishop', R: 'rook', Q: 'queen', K: 'king' }[t], moves: '', value: 0, capturable: false, neutralGlow: false, glyph: t }; });
  CM.mode({
    id: 'byhq5v6BUWg',
    name: 'SCP-049 Plague Doctor',
    category: 'Horror Chess',
    description: 'SCP-049 starts on b4 and wanders one square up, down, left or right at random each round. Every piece next to it becomes an immortal zombie: it belongs to no one, cannot be captured, moves randomly each round and captures white and black pieces alike.',
    how_to_win: 'Checkmate Stockfish, or capture its king when the zombies tear its defence apart.',
    player_side: 'white',
    opponent: { name: 'Stockfish', rating: 3600, avatar: 'assets/modes/U_irVoLjtNI/stockfish.png', tagline: 'Not interested in the cure.' },
    board: { files: 8, ranks: 8 },
    theme: { light: '#e9d4b4', dark: '#af8264' },
    pieces: pieces,
    setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR', place: [{ type: 'Doc', color: 'n', at: 'b4' }] },
    bot: { engine: 'search', style: 'best', depth: 3, time_ms: 700 },
    hooks: {
      init: function (ctx) { ctx.geo.setDir('x', 'up'); ctx.geo.setDir('y', 'down'); },
      afterMove: function (ctx, m, info) { if (info.by !== 'bot') return null; return round(ctx); },
      evaluate: function (V, st) {
        var s = docSq(st); if (s < 0) return 0; var g = V.geo, v = 0;
        for (var i = 0; i < st.b.length; i++) { var p = st.b[i]; if (!p || p.c === 'n') continue; var d = g.dist(i, s); if (d <= 2) v += (p.c === 'w' ? -1 : 1) * (V.def(p.t).royal ? 900 : V.def(p.t).value * 0.35) * (d === 1 ? 2 : 1); }
        return v;
      },
      decorate: function (ctx, sq) {
        var s = docSq(ctx.state); if (s < 0 || sq === s || ctx.geo.dist(sq, s) !== 1) return null;
        return { html: '<span class="sq-tint" style="background:rgba(224,64,200,.22)"></span>' };
      },
      status: function (ctx) { var n = ctx.pieces(function (p) { return p.base; }).length; return n ? n + ' zombie' + (n === 1 ? '' : 's') + ' on the board.' : 'Keep your pieces away from SCP-049.'; }
    },
    source: { research: 'research/modes/byhq5v6BUWg.json', confidence: 'high', notes: 'Zombies move before the doctor each round; zombified king loses.' }
  });
})();
