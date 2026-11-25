/* Chess, But Mal0 Is Always Stalking You. Standard chess vs Stockfish (3600) with neutral Mal0 (SCP-1471) on c4.
   Mal0 secretly picks a random target (any piece of either colour, kings included), moves to a square exactly three
   king steps from it, then steps one square toward it after every round, eating whatever it walks onto. When it eats
   its target it picks a new one and resets to distance three. Mal0 eating a king ends the game.
   Sources: research/modes/vPEVQgvjoL4.json (transcript 00:01 "stalks a random piece for three moves before capturing
   it... Malo on C4", 00:31 "pursuant but not inevitable", 02:41 resets three away from the queen, 04:01 takes e4 on the
   way, 09:32 captures the black king), frames visual_c (brown #EAD2B6/#AF8164, pink arrows, dark intro board).
   Inferred: Mal0 cannot be captured; the target stays hidden until the game ends. Art is original. */
(function () {
  function wait(ctx, ms) { return new Promise(function (r) { ctx.after(ms, r); }); }
  function find(st) { for (var i = 0; i < st.b.length; i++) if (st.b[i] && st.b[i].t === 'Mal0') return i; return -1; }
  function targetSq(ctx) { var id = ctx.x.prey; if (id == null) return -1; return ctx.pieces(function (p) { return p.uid === id; })[0] != null ? ctx.pieces(function (p) { return p.uid === id; })[0] : -1; }
  function tagAll(ctx) { var n = 1; ctx.pieces(function (p) { return p.t !== 'Mal0'; }).forEach(function (i) { ctx.transform(i, { props: { uid: n++ } }); }); ctx.setX('uidN', n); }
  function choose(ctx) {
    var g = ctx.geo, s = find(ctx.state), list = ctx.pieces(function (p) { return p.t !== 'Mal0'; });
    if (!list.length) return null;
    var t = ctx.pick(list), id = ctx.at(t).uid; ctx.setX('prey', id);
    var ring = ctx.emptySquares(function (i) { return g.dist(i, t) === 3; });
    if (!ring.length) ring = ctx.emptySquares(function (i) { return g.dist(i, t) >= 2; });
    var to = ctx.pick(ring);
    ctx.fx({ type: 'fade_board', duration_ms: 420 });
    return wait(ctx, 380).then(function () {
      ctx.move(s, to); ctx.sound('notify'); ctx.refresh();
      ctx.toast('Mal0 has chosen its prey.', 1600);
      return wait(ctx, 250);
    });
  }
  function stalk(ctx) {
    var V = ctx.V, g = ctx.geo, s = find(ctx.state); if (s < 0) return null;
    var t = targetSq(ctx);
    if (t < 0) return choose(ctx);
    var best = [], bd = 99;
    for (var dc = -1; dc <= 1; dc++) for (var dr = -1; dr <= 1; dr++) {
      if (!dc && !dr) continue; var j = g.step(s, dc, dr); if (j < 0) continue;
      var d = g.dist(j, t); if (d < bd) { bd = d; best = [j]; } else if (d === bd) best.push(j);
    }
    var to = ctx.pick(best);
    ctx.fx({ type: 'arrow', from: s, to: to, color: 'rgba(236, 92, 160, 0.9)', duration_ms: 800 });
    ctx.fx({ type: 'highlight', squares: [ctx.name(s), ctx.name(to)], color: 'rgba(236, 92, 160, 0.4)', duration_ms: 800 });
    return wait(ctx, 600).then(function () {
      var victim = ctx.at(to);
      ctx.move(s, to); ctx.sound(victim ? 'capture' : 'move-opponent');
      if (victim) {
        ctx.toast('Mal0 took the ' + (victim.c === 'w' ? 'white ' : 'black ') + (V.def(victim.t).name || victim.t).toLowerCase() + ' on ' + ctx.name(to) + '.', 1800);
        if (V.def(victim.t).royal) { ctx.refresh(); ctx.endGame(victim.c === ctx.human ? 'bot' : 'player', victim.c === ctx.human ? 'Mal0 caught your king' : 'Mal0 caught the Stockfish king'); return; }
        if (victim.uid === ctx.x.prey) { ctx.setX('prey', null); ctx.refresh(); return wait(ctx, 300).then(function () { return choose(ctx); }); }
      }
      ctx.refresh();
      return wait(ctx, 200);
    });
  }
  CM.mode({
    id: 'vPEVQgvjoL4',
    name: 'Mal0 (SCP-1471)',
    category: 'Horror Chess',
    description: 'Mal0 starts on c4. It secretly picks a random piece, yours or Stockfish\'s, appears three steps away from it and hunts it one step per round, eating anything it walks onto. Once it eats its prey it picks another. Mal0 cannot be captured.',
    how_to_win: 'Checkmate Stockfish, or hope Mal0 hunts the black king.',
    player_side: 'white',
    opponent: { name: 'Stockfish', rating: 3600, avatar: 'assets/avatars/stockfish.svg', tagline: 'Does not know who Mal0 is hunting either.' },
    board: { files: 8, ranks: 8 },
    theme: { light: '#ead2b6', dark: '#af8164' },
    pieces: { Mal0: { name: 'Mal0', moves: '', value: 0, capturable: false, img: 'assets/modes/vPEVQgvjoL4/mal0.svg', neutralGlow: false } },
    setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR', place: [{ type: 'Mal0', color: 'n', at: 'c4' }] },
    bot: { engine: 'search', style: 'best', depth: 3, time_ms: 650 },
    vfx: [{ type: 'vignette', color: 'rgba(20,8,12,.55)', size: 70, duration_ms: 0, id: 'mal0-vig' }],
    hooks: {
      setup: function (ctx) { tagAll(ctx); ctx.setX('prey', null); },
      afterMove: function (ctx, m, info) {
        if (info.by !== 'bot' || ctx.over) return null;
        return ctx.x.prey == null ? choose(ctx) : stalk(ctx);
      },
      decorate: function (ctx, sq, p) {
        if (ctx.over && p && p.uid != null && p.uid === ctx.x.prey) return { html: '<span class="sq-tint" style="background:rgba(236,92,160,.4)"></span>' };
        return null;
      },
      status: function (ctx) { return ctx.x.prey == null ? 'Mal0 is choosing its prey.' : 'Mal0 is stalking someone.'; }
    },
    messages: { win: 'Mal0 spared you this time' },
    source: { research: 'research/modes/vPEVQgvjoL4.json', confidence: 'high', notes: 'Uncapturable Mal0, hidden target and the first pick after round 1 inferred.' }
  });
})();
