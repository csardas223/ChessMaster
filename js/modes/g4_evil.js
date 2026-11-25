/* g4_evil: Evil Martin (bot by wintrcat), group 4. He plays like Martin (250, chess.com beginner strength) until the
   evaluation reaches params.trigger centipawns against him (600 in the debut video, 500 in the sequel), then he
   "unleashes his fury" and plays like a grandmaster (~3000) for the rest of the game. The player is not told; only the
   avatar, name and rating change (what viewers saw). The trigger is checked after each player move with a short
   search from Evil Martin's side; GM mode switches the bot to Stockfish at 3000 (standard positions). */
(function () {
  'use strict';
  var CM = window.CM;
  function awake(ctx) {
    var P = ctx.params;
    ctx.setX('evil', 1);
    ctx.setOpponent({ name: 'Evil Martin', rating: 3000, elo: 3000, avatar: P.evilAvatar, tagline: 'He is awake now.' });
    ctx.fx({ type: 'vignette', color: 'rgba(160,0,0,0.55)', size: 60, duration_ms: 1600 });
  }
  CM.defineHooks('g4_evil', {
    stockfishOk: true,
    setup: function (ctx) {
      var P = ctx.params;
      ctx.setOpponent({ name: 'Martin', rating: 250, elo: 250, avatar: P.sleepyAvatar, tagline: 'Looks well asleep.' });
    },
    afterMove: function (ctx, m, info) {
      if (info.by !== 'player' || ctx.over || ctx.x.evil) return;
      var L = new CM.Search(ctx.V, {}).rank(ctx.state, { maxDepth: 2, timeMs: 160, noise: 0 });
      if (L.length && L[0].v <= -(ctx.params.trigger || 600)) awake(ctx);
    },
    status: function (ctx) { return ctx.over ? null : 'Evil Martin wakes up at ' + ((ctx.params.trigger || 600) / 100) + ' on the eval bar'; }
  });
})();
