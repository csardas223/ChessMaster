/* Martin Explodes My Pieces.  4th of July special vs Martin (250): every so often one of Martin's stray fireworks flies
   across the board (purple outlined path in the frames) and explodes one of the player's pieces. Martin's own pieces are
   never hit. Tony loses a knight (0:35), the a1 rook (1:45), a bishop (2:08), pawns and the queen, and still mates (5:16).
   Sources: research/modes/30CbSsx8ixM.json, frames (purple path squares). Inferred: about one firework every 3 of your
   moves on average, never the king, only after the first two moves. Avatar is original art. */
(function () {
  function martinPick(ctx, L) {
    if (!L.length) return null;
    var MATE = (CM.MATE || 100000) - 1000;
    if (L[0].v >= MATE) return L[0];
    var safe = L.filter(function (x) { return x.v > -MATE; }); if (!safe.length) safe = L;
    return CM.bot.pickByStrength(safe, CM.bot.eloStrength(250));
  }
  function wait(ctx, ms) { return new Promise(function (r) { ctx.after(ms, r); }); }
  function firework(ctx) {
    var V = ctx.V, g = ctx.geo, me = ctx.human;
    var targets = ctx.pieces(function (p) { return p.c === me && !V.def(p.t).royal; });
    if (!targets.length) return null;
    var t = ctx.pick(targets), col = g.col(t), row = g.row(t);
    /* launched from Martin's side of the board, straight down the file or along a diagonal */
    var dirs = [[0, -1], [1, -1], [-1, -1]].filter(function (d) { return g.step(t, d[0], d[1]) >= 0; }), d = dirs.length ? ctx.pick(dirs) : [0, -1];
    var path = [], j = t; while (true) { var nx = g.step(j, d[0], d[1]); if (nx < 0) break; j = nx; path.unshift(j); if (path.length > 6) break; }
    var launch = path.length ? path[0] : t;
    var hi = path.map(function (s) { return g.name(s); });
    ctx.sound('notify');
    if (hi.length) ctx.fx({ type: 'highlight', squares: hi, color: 'rgba(150,70,220,.55)', duration_ms: 700 });
    ctx.fx({ type: 'arrow', from: g.name(launch), to: g.name(t), color: 'rgba(150,70,220,.85)', duration_ms: 700 });
    return wait(ctx, 650).then(function () {
      if (ctx.over) return;
      var p = ctx.at(t); if (!p) return;
      ctx.remove(t);
      ctx.fx({ type: 'explosion', at: g.name(t), radius: 0, shake: false });
      ctx.fx({ type: 'particles', kind: 'sparks', at: g.name(t), count: 40 });
      ctx.sound('explosion');
      ctx.toast('A firework blew up your ' + (V.def(p.t).name || p.t).toLowerCase() + '!', 2000);
      ctx.refresh();
    });
  }
  CM.mode({
    id: '30CbSsx8ixM',
    title: 'Martin Explodes My Pieces',
    name: 'Martin\'s Fireworks',
    category: 'Other Videos',
    description: 'Martin is having a little too much fun with the 4th of July fireworks. Every so often a stray rocket streaks across the board and explodes one of your pieces (never your king, never his pieces). Win anyway.',
    how_to_win: 'Checkmate Martin before the fireworks take your whole army.',
    player_side: 'white',
    opponent: { name: 'Martin', rating: 250, avatar: 'assets/modes/30CbSsx8ixM/martin_fireworks.png', tagline: 'Happy 4th of July! Watch out for the rockets.' },
    board: { files: 8, ranks: 8, light: '#ebf2d0', dark: '#7a9e58' },
    theme: { background: '#141a33' },
    setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR' },
    bot: { engine: 'search', elo: 250, depth: 2, time_ms: 400 },
    params: { chance: 0.33, after_ply: 4 },
    sounds: { 'explosion': 'assets/modes/30CbSsx8ixM/fireworks.wav' },   /* v6 per-mode sound set (tools/sfx/modes_v6.py, wire_v6.py) */
    hooks: {
      botPick: martinPick,
      afterMove: function (ctx, m, info) {
        if (info.by !== 'player' || ctx.over || ctx.state.ply < ctx.params.after_ply || !ctx.chance(ctx.params.chance)) return null;
        return firework(ctx);
      },
      status: function (ctx) { return ctx.over ? null : 'Fireworks are flying: any of your pieces except the king can explode'; }
    },
    source: { research: 'research/modes/30CbSsx8ixM.json', confidence: 'medium', notes: 'Firework rate and path inferred; transcript only says "every so often".' }
  });
})();
