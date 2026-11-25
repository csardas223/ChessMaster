/* g6_ladder: a ladder of chess.com-style bots played in rising order (Earth Day bots, Advanced bots speedrun,
   Christmas bots). Normal chess. params: { ladder: [{ name, rating, avatar, tagline, lines: [chat lines] }],
   chance: chat chance per bot move, speedrun: true (status shows a running timer across the whole ladder) }.
   Winning a game moves you to the next bot on New game; a loss keeps the same bot (speedrun: a loss restarts the run). */
(function () {
  'use strict';
  var mem = {};   /* per mode id: { level, t0, done } survives New game within the session */
  function M(ctx) { var id = ctx.spec.id; return mem[id] || (mem[id] = { level: 0, t0: 0, finished: false }); }
  function cur(ctx) { var L = ctx.params.ladder || []; return L[Math.min(M(ctx).level, L.length - 1)] || {}; }
  function fmt(ms) { var s = Math.floor(ms / 1000), m = Math.floor(s / 60); s %= 60; return m + ':' + (s < 10 ? '0' : '') + s; }
  CM.defineHooks('g6_ladder', {
    setup: function (ctx) {
      var m = M(ctx), b = cur(ctx), L = ctx.params.ladder || [];
      if (!m.t0 || m.finished) { m.t0 = performance.now(); m.finished = false; }
      Object.assign(ctx.opponent, { name: b.name, rating: b.rating, elo: b.rating, avatar: b.avatar || 'assets/avatars/bot.svg', tagline: b.tagline || '' });
      ctx.toast('Bot ' + (m.level + 1) + ' of ' + L.length + ': ' + b.name + (b.rating ? ' (' + b.rating + ')' : ''), 2200);
    },
    afterMove: function (ctx, mv, info) {
      if (info.by !== 'bot' || ctx.over) return;
      var b = cur(ctx), lines = b.lines || [];
      if (lines.length && (info.ply <= 2 || Math.random() < (ctx.params.chance || 0.3))) ctx.toast(b.name + ': ' + ctx.pick(lines), 2600);
    },
    onGameOver: function (ctx, res) {
      var m = M(ctx), L = ctx.params.ladder || [], won = res.w === ctx.human, b = cur(ctx);
      if (won) {
        if (m.level >= L.length - 1) { m.finished = true; ctx.toast('You beat every bot' + (ctx.params.speedrun ? ' in ' + fmt(performance.now() - m.t0) : '') + '!', 4000); m.level = 0; }
        else { m.level++; ctx.toast('Next up: ' + L[m.level].name + '. Press New game.', 3200); }
      } else if (ctx.params.speedrun && res.w !== 'd') { m.level = 0; m.t0 = 0; ctx.toast('Run over. A new run starts with ' + L[0].name + '.', 3200); }
      if (b.lose_line && won) ctx.toast(b.name + ': ' + b.lose_line, 3000);
      if (b.win_line && !won && res.w !== 'd') ctx.toast(b.name + ': ' + b.win_line, 3000);
    },
    status: function (ctx) {
      var m = M(ctx), L = ctx.params.ladder || [];
      var s = 'Bot ' + (m.level + 1) + '/' + L.length + ' · ' + L.map(function (b, k) { return (k < m.level ? '✓ ' : k === m.level ? '▶ ' : '') + b.name.split(' ')[0]; }).join('  ');
      if (ctx.params.speedrun && m.t0) s += ' · ' + fmt(performance.now() - m.t0);
      return s;
    },
    onTick: function (ctx) { if (ctx.params.speedrun) { var t = Math.floor(performance.now() / 1000); if (t !== M(ctx).lastT) { M(ctx).lastT = t; CM.gameUI.setStatus(this.status(ctx)); } } }
  });
})();
