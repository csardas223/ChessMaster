/* Chess, But SCP-939 Hears You Coming. Standard chess vs Stockfish (3600) with a neutral SCP-939 (red lizard) on b4.
   After each round (White's move then Black's) it compares the piece White just moved with the piece Black just
   moved and takes one king step toward the higher-value one (equal values: random), eating whatever stands on the
   square it enters. If it steps onto a king, that king's side loses.
   Sources: research/modes/s2WDIfvefEk.json (transcript 00:01 rule + b4, 00:30 "between what I played and what the fish
   played", 00:56 random on equal values, 02:44 dragged toward d5 eating a pawn, 11:20 takes the black king on g6),
   frames visual_a (brown #e9d4b4/#af8164, magenta arrows, Stockfish (3600)).
   Inferred: SCP-939 cannot be captured; ties between equally close step squares are random; the sound ripple. */
(function () {
  function wait(ctx, ms) { return new Promise(function (r) { ctx.after(ms, r); }); }
  function find(st, t) { for (var i = 0; i < st.b.length; i++) if (st.b[i] && st.b[i].t === t) return i; return -1; }
  var VAL = { P: 1, N: 3, B: 3, R: 5, Q: 9, K: 100 };
  function step(ctx) {
    var V = ctx.V, g = ctx.geo, s = find(ctx.state, 'L'); if (s < 0) return null;
    var a = ctx.x.heardW, b = ctx.x.heardB, tgt = null;
    var live = function (h) { return h && ctx.at(h.sq) && ctx.at(h.sq).c === h.c ? h : null; };
    a = live(a); b = live(b);
    if (a && b) tgt = VAL[a.t] > VAL[b.t] ? a : VAL[b.t] > VAL[a.t] ? b : ctx.pick([a, b]); else tgt = a || b;
    if (!tgt || tgt.sq === s) return null;
    var best = [], bd = 99;
    for (var dc = -1; dc <= 1; dc++) for (var dr = -1; dr <= 1; dr++) {
      if (!dc && !dr) continue; var j = g.step(s, dc, dr); if (j < 0) continue;
      var d = g.dist(j, tgt.sq); if (d < bd) { bd = d; best = [j]; } else if (d === bd) best.push(j);
    }
    var to = ctx.pick(best);
    /* one-shot ability effect (no arrow, no standing ring): the square it heard swells magenta beneath the piece
       (up 0.25 s, hold 0.25 s, down 0.25 s), then SCP-939 glides one square toward it (300 ms) and eats what is there */
    ctx.fx({ type: 'pulse', squares: [tgt.sq], color: '#d63cc8', peak: 0.6, duration_ms: 750, rise: 1 / 3, hold: 2 / 3, under: true });
    return wait(ctx, 450).then(function () {
      return ctx.fx({ type: 'slide', moves: [{ f: s, t: to }], duration_ms: 300, easing: 'cubic-bezier(.22,.61,.36,1)' });
    }).then(function () {
      var victim = ctx.at(to);
      ctx.move(s, to); ctx.sound(victim ? 'capture' : 'move-opponent');
      if (victim) {
        ctx.fx({ type: 'particles', kind: 'blood', at: to });
        ctx.toast('SCP-939 ate the ' + (victim.c === 'w' ? 'white ' : 'black ') + (V.def(victim.t).name || victim.t).toLowerCase() + ' on ' + ctx.name(to) + '.', 1800);
        if (V.def(victim.t).royal) { ctx.refresh({ instant: true }); ctx.endGame(victim.c === ctx.human ? 'bot' : 'player', victim.c === ctx.human ? 'SCP-939 ate your king' : 'SCP-939 ate the Stockfish king'); return; }
      }
      ctx.refresh({ instant: true });
      return wait(ctx, 200);
    });
  }
  CM.mode({
    id: 's2WDIfvefEk',
    name: 'SCP-939',
    category: 'Horror Chess',
    description: 'SCP-939 is blind and starts on b4. After each round it hears the two pieces that just moved and takes one step toward the more valuable one (king, queen, rook, minor piece, pawn; a tie is random), eating anything on the square it enters. It cannot be captured.',
    how_to_win: 'Checkmate Stockfish, or steer SCP-939 into the black king.',
    player_side: 'white',
    player: { name: 'You', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },   /* iwantcheckmate's own avatar (purple king) from the videos */
    opponent: { name: 'Stockfish', rating: 3600, avatar: 'assets/modes/U_irVoLjtNI/stockfish.png', tagline: 'Develops its pieces. SCP-939 is listening.' },
    board: { files: 8, ranks: 8 },
    theme: { light: '#e9d4b4', dark: '#af8164' },
    pieces: { L: { name: 'SCP-939', moves: '', value: 0, capturable: false, img: 'assets/modes/s2WDIfvefEk/scp939.png', neutralGlow: false } },
    setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR', place: [{ type: 'L', color: 'n', at: 'b4' }] },
    bot: { engine: 'search', style: 'best', depth: 3, time_ms: 650 },
    hooks: {
      afterMove: function (ctx, m, info) {
        var p = ctx.at(m.t), h = { sq: m.t, t: m.p, c: m.c };
        if (p) h.t = p.t;
        ctx.setX(m.c === 'w' ? 'heardW' : 'heardB', h);
        if (m.c !== 'b' || ctx.over) return null;
        ctx.fx({ type: 'particles', kind: 'dust', at: m.t });
        return step(ctx);
      },
      status: function (ctx) { var s = find(ctx.state, 'L'); return s < 0 ? '' : 'SCP-939 is on ' + ctx.name(s) + ', listening for heavy pieces.'; }
    },
    source: { research: 'research/modes/s2WDIfvefEk.json', confidence: 'high', notes: 'Uncapturable lizard and random tie-breaks inferred.' }
  });
})();
