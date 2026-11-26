/* Chess, But Mal0 Is Always Stalking You. Standard chess vs Stockfish (3600) with neutral Mal0 (SCP-1471) on c4.
   Mal0 secretly picks a random target (any piece of either colour, kings included), moves to a square exactly three
   king steps from it, then steps one square toward it after every round, eating whatever it walks onto. When it eats
   its target it picks a new one and resets to distance three. Mal0 eating a king ends the game.
   Sources: research/modes/vPEVQgvjoL4.json (transcript 00:01 "stalks a random piece for three moves before capturing
   it... Malo on C4", 00:31 "pursuant but not inevitable", 02:41 resets three away from the queen, 04:01 takes e4 on the
   way, 09:32 captures the black king), frames visual_c (brown #EAD2B6/#AF8164, pink arrows, dark intro board).
   Ability animation follows iwantcheckmate.com/challenges/malo (studied 2026-11-25): it picks the staging square on
   the nearest of the 8 lines through the prey and walks there square by square. Inferred: Mal0 cannot be captured; the target stays hidden until the game ends. Art is original. */
(function () {
  function wait(ctx, ms) { return new Promise(function (r) { ctx.after(ms, r); }); }
  function find(st) { for (var i = 0; i < st.b.length; i++) if (st.b[i] && st.b[i].t === 'Mal0') return i; return -1; }
  function targetSq(ctx) { var id = ctx.x.prey; if (id == null) return -1; return ctx.pieces(function (p) { return p.uid === id; })[0] != null ? ctx.pieces(function (p) { return p.uid === id; })[0] : -1; }
  function tagAll(ctx) { var n = 1; ctx.pieces(function (p) { return p.t !== 'Mal0'; }).forEach(function (i) { ctx.transform(i, { props: { uid: n++ } }); }); ctx.setX('uidN', n); }
  /* Mal0's walk, as iwantcheckmate.com/challenges/malo draws it: no arrows or highlights, Mal0 just walks one square at a
     time, each step 300 / sqrt(steps in the walk) ms with cubic-bezier(.22,.61,.36,1), eating whatever stands on a square
     it walks onto. The walk to a staging square never passes over its prey. */
  var EASE = 'cubic-bezier(.22,.61,.36,1)', STEP_MS = 300;
  function staging(ctx, s, t) {   /* the in-bounds square three steps from the prey along one of the 8 lines, nearest Mal0 */
    var g = ctx.geo, best = -1, low = Infinity;
    for (var df = -1; df <= 1; df++) for (var dr = -1; dr <= 1; dr++) {
      if (!df && !dr) continue; var j = g.step(t, 3 * df, 3 * dr); if (j < 0) continue;
      var c = Math.hypot(g.col(j) - g.col(s), g.row(j) - g.row(s)); if (c < low) { low = c; best = j; }
    }
    return best;
  }
  /* shortest king-step path start -> end (excluding start), keeping close to the straight line, never through `avoid` */
  function travelPath(ctx, start, end, avoid) {
    var g = ctx.geo, q = [{ at: start, path: [] }], seen = {}; seen[start] = 1;
    var err = function (j) { return Math.abs((g.col(end) - g.col(start)) * (g.row(j) - g.row(start)) - (g.row(end) - g.row(start)) * (g.col(j) - g.col(start))); };
    for (var k = 0; k < q.length; k++) {
      var at = q[k].at, path = q[k].path; if (at === end) return path;
      var next = [];
      for (var df = -1; df <= 1; df++) for (var dr = -1; dr <= 1; dr++) {
        if (!df && !dr) continue; var j = g.step(at, df, dr);
        if (j < 0 || j === avoid || seen[j]) continue; next.push(j);
      }
      next.sort(function (a, b) { return g.dist(a, end) - g.dist(b, end) || err(a) - err(b); });
      next.forEach(function (j) { seen[j] = 1; q.push({ at: j, path: path.concat([j]) }); });
    }
    return [];
  }
  /* one step of a walk: slide, then eat. Resolves true when the game ended (a king was eaten). */
  function stepTo(ctx, s, to, ms) {
    var V = ctx.V;
    return Promise.resolve(ctx.fx({ type: 'slide', moves: [{ f: s, t: to }], duration_ms: ms, easing: EASE })).then(function () {
      var victim = ctx.at(to);
      ctx.move(s, to);
      if (victim) {
        ctx.sound('capture');
        ctx.toast('Mal0 took the ' + (victim.c === 'w' ? 'white ' : 'black ') + (V.def(victim.t).name || victim.t).toLowerCase() + ' on ' + ctx.name(to) + '.', 1800);
        if (V.def(victim.t).royal) { ctx.refresh({ instant: true }); ctx.endGame(victim.c === ctx.human ? 'bot' : 'player', victim.c === ctx.human ? 'Mal0 caught your king' : 'Mal0 caught the Stockfish king'); return true; }
      }
      ctx.refresh({ instant: true });
      return false;
    });
  }
  function choose(ctx) {
    var s = find(ctx.state), list = ctx.pieces(function (p) { return p.t !== 'Mal0'; });
    if (!list.length || s < 0) return null;
    var t = ctx.pick(list), id = ctx.at(t).uid; ctx.setX('prey', id);
    var end = staging(ctx, s, t), path = end >= 0 ? travelPath(ctx, s, end, t) : [];
    var ms = path.length ? STEP_MS / Math.sqrt(path.length) : 0, chain = Promise.resolve(false), at = s;
    path.forEach(function (j) {
      chain = chain.then(function (over) {
        if (over || ctx.over) return true;
        var from = at; at = j;
        return stepTo(ctx, from, j, ms);
      });
    });
    return chain.then(function (over) {
      if (over || ctx.over) return;
      if (path.length) ctx.sound('move-opponent');
      ctx.toast('Mal0 has chosen its prey.', 1600);
      return wait(ctx, 250);
    });
  }
  function stalk(ctx) {
    var g = ctx.geo, s = find(ctx.state); if (s < 0) return null;
    var t = targetSq(ctx);
    if (t < 0) return choose(ctx);
    var best = [], bd = 99;
    for (var dc = -1; dc <= 1; dc++) for (var dr = -1; dr <= 1; dr++) {
      if (!dc && !dr) continue; var j = g.step(s, dc, dr); if (j < 0) continue;
      var d = g.dist(j, t); if (d < bd) { bd = d; best = [j]; } else if (d === bd) best.push(j);
    }
    var to = ctx.pick(best), victim = ctx.at(to);
    return stepTo(ctx, s, to, STEP_MS).then(function (over) {
      if (over || ctx.over) return;
      if (!victim) ctx.sound('move-opponent');
      if (victim && victim.uid === ctx.x.prey) { ctx.setX('prey', null); ctx.refresh({ instant: true }); return wait(ctx, 300).then(function () { return choose(ctx); }); }
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
    player: { name: 'You', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },   /* iwantcheckmate's own avatar (purple king) from the videos */
    opponent: { name: 'Stockfish', rating: 3600, avatar: 'assets/modes/U_irVoLjtNI/stockfish.png', tagline: 'Does not know who Mal0 is hunting either.' },
    board: { files: 8, ranks: 8 },
    theme: { light: '#ead2b6', dark: '#af8164' },
    pieces: { Mal0: { name: 'Mal0', moves: '', value: 0, capturable: false, img: 'assets/modes/vPEVQgvjoL4/mal0.png', neutralGlow: false } },
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
