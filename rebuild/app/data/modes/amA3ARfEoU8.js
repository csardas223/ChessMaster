/* Chess, But SCP-173 Is Coming For You. Standard chess vs Stockfish (3600) with a neutral, uncapturable SCP-173 on a4.
   After every round (after Black's move), if no piece of either colour watches it (attacks its square), it makes one
   knight jump toward the nearest king (by knight distance), capturing whatever it lands on. Watched, it cannot move.
   Landing on a king captures it and that side loses.
   Sources: research/modes/amA3ARfEoU8.json (transcript 00:01 rule and a4, 00:30 "it can't be captured", 01:00 route
   b2-d3-e1 and the c1 bishop freezing it, 02:56 c4 then d6, 09:05 ladder mate), rules.jsonl, frames visual_a (brown
   #e8d3b3/#af8265, purple jump arrows). Inferred: one jump per full round, random tie-break, king-capture rule.
   Art is original. */
(function () {
  var NJ = [[1, 2], [2, 1], [2, -1], [1, -2], [-1, -2], [-2, -1], [-2, 1], [-1, 2]];
  function wait(ctx, ms) { return new Promise(function (r) { ctx.after(ms, r); }); }
  function statueSq(st) { for (var i = 0; i < st.b.length; i++) if (st.b[i] && st.b[i].t === 'Sc') return i; return -1; }
  function watched(V, st, s) { return V.attacked(st, s, 'w') || V.attacked(st, s, 'b'); }
  /* knight distance from every square to `to` (BFS on the empty board) */
  function kdist(g, to) {
    var d = new Array(g.size).fill(99), q = [to]; d[to] = 0;
    while (q.length) { var i = q.shift(); NJ.forEach(function (v) { var j = g.step(i, v[0], v[1]); if (j >= 0 && d[j] > d[i] + 1) { d[j] = d[i] + 1; q.push(j); } }); }
    return d;
  }
  function plan(V, st, s) {
    var g = V.geo, kings = [];
    for (var i = 0; i < st.b.length; i++) if (st.b[i] && st.b[i].t === 'K') kings.push(i);
    if (!kings.length) return null;
    var maps = kings.map(function (k) { return kdist(g, k); });
    var best = 99, which = [];
    maps.forEach(function (m, k) { if (m[s] < best) { best = m[s]; which = [k]; } else if (m[s] === best) which.push(k); });
    return { kings: kings, maps: maps, target: which };
  }
  function jump(ctx) {
    var V = ctx.V, g = ctx.geo, st = ctx.state, s = statueSq(st); if (s < 0 || watched(V, st, s)) return null;
    var P = plan(V, st, s); if (!P) return null;
    var tk = ctx.pick(P.target), map = P.maps[tk], opts = [], bd = 99;
    NJ.forEach(function (v) { var j = g.step(s, v[0], v[1]); if (j < 0) return; var q = st.b[j]; if (q && (q.c === 'n' || V.def(q.t).blocker)) return; if (map[j] < bd) { bd = map[j]; opts = [j]; } else if (map[j] === bd) opts.push(j); });
    if (!opts.length) return null;
    var to = ctx.pick(opts);
    ctx.fx({ type: 'arrow', from: s, to: to, color: 'rgba(150, 70, 210, 0.85)', duration_ms: 700 });
    return wait(ctx, 600).then(function () {
      var victim = ctx.at(to);
      ctx.move(s, to); ctx.sound(victim ? 'capture' : 'move-opponent');
      if (victim) {
        ctx.fx({ type: 'particles', kind: 'dust', at: to });
        ctx.toast('SCP-173 crushed the ' + (victim.c === 'w' ? 'white ' : 'black ') + (V.def(victim.t).name || victim.t).toLowerCase() + '.', 1700);
        if (V.def(victim.t).royal) { ctx.fx({ type: 'jumpscare', image: 'assets/modes/amA3ARfEoU8/scp173.svg', duration_ms: 900 }); ctx.endGame(victim.c === ctx.human ? 'bot' : 'player', victim.c === ctx.human ? 'SCP-173 snapped your king' : 'SCP-173 snapped the Stockfish king'); return; }
      }
      ctx.refresh();
    });
  }
  CM.mode({
    id: 'amA3ARfEoU8',
    name: 'SCP-173',
    category: 'Horror Chess',
    description: 'SCP-173 sits on a4 and cannot be captured. After every round, if no piece (yours or Stockfish\'s) is watching it, meaning attacking its square, it jumps like a knight toward the nearest king and crushes whatever it lands on. While watched it cannot move.',
    how_to_win: 'Checkmate Stockfish, or steer SCP-173 into the black king.',
    player_side: 'white',
    opponent: { name: 'Stockfish', rating: 3600, avatar: 'assets/avatars/stockfish.svg', tagline: 'Never blinks.' },
    board: { files: 8, ranks: 8 },
    theme: { light: '#e8d3b3', dark: '#af8265' },
    pieces: { Sc: { name: 'SCP-173', moves: '', value: 0, capturable: false, img: 'assets/modes/amA3ARfEoU8/scp173.svg', neutralGlow: false } },
    setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR', place: [{ type: 'Sc', color: 'n', at: 'a4' }] },
    bot: { engine: 'search', style: 'best', depth: 4, time_ms: 700 },
    hooks: {
      afterMove: function (ctx, m, info) { if (info.by !== 'bot') return null; return jump(ctx); },
      /* an unwatched statue near a king is bad news for that king */
      evaluate: function (V, st) {
        var s = statueSq(st); if (s < 0 || watched(V, st, s)) return 0; var g = V.geo, v = 0;
        for (var i = 0; i < st.b.length; i++) { var p = st.b[i]; if (p && p.t === 'K') { var d = g.dist(i, s); if (d <= 4) v += (p.c === 'w' ? -1 : 1) * (5 - d) * 70; } }
        return v;
      },
      decorate: function (ctx, sq, p) {
        if (!p || p.t !== 'Sc') return null;
        var w = watched(ctx.V, ctx.state, sq);
        return { html: '<span class="sq-tint" style="background:' + (w ? 'rgba(60,140,255,.35)' : 'rgba(220,40,40,.4)') + '"></span>' };
      },
      status: function (ctx) { var s = statueSq(ctx.state); if (s < 0) return ''; return watched(ctx.V, ctx.state, s) ? 'SCP-173 is being watched. It cannot move.' : 'Nobody is watching SCP-173. It will jump after this round.'; }
    },
    source: { research: 'research/modes/amA3ARfEoU8.json', confidence: 'high', notes: 'Jumps once per full round.' }
  });
})();
