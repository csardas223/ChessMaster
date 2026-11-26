/* g5_ladder: a bot gauntlet for normal-chess videos where the creator plays a series of bots in order
   (Martin's family, RuneScape bots, Judit Polgar bots, Battle Chess AI levels, beginner-bot speedrun).
   Mode params:
     ladder: [{ name, rating, avatar, tagline, hello, chat: [...], win: 'line when you beat it', lose: 'line when it beats you' }]
     chatChance: 0..1 chance per bot move of a chat line (default 0.18)
     speedrun: true  -> a running timer across the whole ladder in the status line (beginner-bot speedrun)
     cutscenes: [urls] -> on every capture one of these stills from the video is shown over the board for 1.4 s
                          (Battle Chess fight cutscenes; impl-5 art pass 3)
   Beating a bot moves you to the next one on New game; losing keeps you on the same bot. */
(function () {
  'use strict';
  var CM = window.CM;
  var pos = {};      /* spec id -> ladder index (kept while the page is open) */
  var run = {};      /* spec id -> { t0, done } speedrun timer */
  function L(ctx) { return ctx.params.ladder || []; }
  function cur(ctx) { var l = L(ctx), k = pos[ctx.spec.id] || 0; return l[Math.min(k, l.length - 1)] || {}; }
  function fmt(ms) { var s = ms / 1000, m = Math.floor(s / 60); s = s - m * 60; return m + ':' + (s < 10 ? '0' : '') + s.toFixed(2); }
  function line(ctx) {
    var l = L(ctx), k = Math.min(pos[ctx.spec.id] || 0, l.length - 1), b = cur(ctx), txt = 'Opponent ' + (k + 1) + '/' + l.length + ': ' + b.name + (b.rating ? ' (' + b.rating + ')' : '');
    var r = run[ctx.spec.id];
    if (ctx.params.speedrun && r) txt += '  ·  ' + fmt((r.done || performance.now()) - r.t0);
    return txt;
  }
  CM.defineHooks('g5_ladder', {
    setup: function (ctx) {
      var b = cur(ctx), id = ctx.spec.id;
      ctx.setOpponent({ name: b.name, rating: b.rating == null ? null : b.rating, elo: b.elo || b.rating || 800, avatar: b.avatar || (ctx.spec.opponent && ctx.spec.opponent.avatar) || null, tagline: b.tagline || ctx.spec.description });
      if (ctx.params.speedrun && (!run[id] || (run[id].done && (pos[id] || 0) === 0))) run[id] = { t0: performance.now(), done: 0 };
    },
    onStart: function (ctx) { var b = cur(ctx); if (b.hello) ctx.after(500, function () { ctx.toast(b.name + ': "' + b.hello + '"', 3200); }); },
    afterMove: function (ctx, m, info) {
      var b = cur(ctx), cs = ctx.params.cutscenes;
      if (info.capture && cs && cs.length && !ctx.over) ctx.fx({ type: 'overlay', at: 'board', image: ctx.pick(cs), fit: 'cover', duration_ms: 1400, fade_ms: 160, id: 'g5cut' });
      if (info.by !== 'bot' || !b.chat || !b.chat.length || ctx.over) return;
      if (ctx.chance(ctx.params.chatChance == null ? 0.18 : ctx.params.chatChance)) ctx.toast(b.name + ': "' + ctx.pick(b.chat) + '"', 3000);
    },
    onGameOver: function (ctx, over) {
      var id = ctx.spec.id, l = L(ctx), k = pos[id] || 0, b = cur(ctx), won = over.w === ctx.human;
      if (won) {
        if (b.win) ctx.toast(b.name + ': "' + b.win + '"', 3600);
        if (k < l.length - 1) pos[id] = k + 1;
        else { pos[id] = 0; if (run[id]) run[id].done = performance.now(); }
      } else if (b.lose && over.w !== 'd') ctx.toast(b.name + ': "' + b.lose + '"', 3600);
    },
    onTick: function (ctx) {
      if (!ctx.params.speedrun) return;
      var now = performance.now(); if (this._t && now - this._t < 250) return; this._t = now;
      CM.gameUI.setStatus(line(ctx));
    },
    status: function (ctx) { return L(ctx).length > 1 || ctx.params.speedrun ? line(ctx) : null; },
    stockfishOk: true
  });
})();
