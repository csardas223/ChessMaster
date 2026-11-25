/* g4_martin: identical copy of g4_ladder.js (the loader maps hooks name -> file name; this file defines both). */
/* g4_ladder: shared hooks for "normal chess vs a line-up of bots" videos (group 4).
   params:
     levels:  [{ name, rating, elo, avatar, tagline, chat: ['line', ...], win: 'line when you beat it', loss: 'line when it beats you' }]
              played in order; beating a level moves on to the next (kept while the page is open).
     chat:    shared chat lines (used when a level has none); chatChance (default 0.25) per bot move.
     force:   { w: ['e2e4', 'e1e2'], b: [...] } forced opening moves for that colour (skipped when not legal).
     forceWhy: toast shown when a forced move is due.
     blind:   true = blindfold (no pieces drawn on the board; last move still highlighted).
     speedrun: { ms: 300000 } total time across all levels; the run fails when it runs out.
     mateGuard: true = the bot never misses a mate in one and never allows one when it can avoid it
               (chess.com beginner bots); only used by the g4_martin variant of these hooks.
   Hooks live in a module so several mode files share them; per-mode state is keyed by spec id. */
(function () {
  'use strict';
  var CM = window.CM;
  var RUN = {};   /* spec id -> { level, startT, spent } */
  function run(ctx) { var id = ctx.spec.id; return RUN[id] || (RUN[id] = { level: 0, spent: 0, startT: 0 }); }
  function levels(ctx) { return ctx.params.levels || []; }
  function level(ctx) { var L = levels(ctx); return L.length ? L[Math.min(run(ctx).level, L.length - 1)] : null; }
  function fmt(ms) { var s = Math.max(0, Math.round(ms / 100) / 10), m = Math.floor(s / 60); s = (s - m * 60).toFixed(1); return m + ':' + (s < 10 ? '0' : '') + s; }

  var base = {
    stockfishOk: true,   /* filterMoves only forces the human's opening moves; Stockfish may play the bot side */
    setup: function (ctx) {
      var lv = level(ctx);
      if (lv) ctx.setOpponent({ name: lv.name, rating: lv.rating != null ? lv.rating : null, elo: lv.elo != null ? lv.elo : lv.rating, avatar: lv.avatar || ctx.spec.opponent.avatar || null, tagline: lv.tagline || ctx.spec.opponent.tagline });
      var r = run(ctx); r.startT = 0;
    },
    onStart: function (ctx) {
      var L = levels(ctx), lv = level(ctx);
      if (L.length > 1 && lv) ctx.toast('Bot ' + (Math.min(run(ctx).level, L.length - 1) + 1) + ' of ' + L.length + ': ' + lv.name + (lv.rating != null ? ' (' + lv.rating + ')' : ''), 2200);
      if (lv && lv.hello) ctx.after(900, function () { ctx.toast(lv.name + ': ' + lv.hello, 2600); });
    },
    afterMove: function (ctx, m, info) {
      var P = ctx.params, r = run(ctx);
      if (P.speedrun && !r.startT && info.by === 'player') r.startT = performance.now();
      if (info.by !== 'bot' || ctx.over) return;
      var lv = level(ctx), lines = (lv && lv.chat) || P.chat;
      if (lines && lines.length && ctx.chance(P.chatChance == null ? 0.25 : P.chatChance)) ctx.toast((lv ? lv.name : ctx.opponent.name) + ': ' + ctx.pick(lines), 2600);
    },
    onTick: function (ctx, now) {
      var P = ctx.params, r = run(ctx);
      if (!P.speedrun || ctx.over || !r.startT) return;
      if (r.spent + (now - r.startT) > P.speedrun.ms) ctx.endGame('bot', 'the speedrun clock ran out');
    },
    onGameOver: function (ctx, over) {
      var L = levels(ctx), r = run(ctx), lv = level(ctx), P = ctx.params;
      if (P.speedrun && r.startT) { r.spent += performance.now() - r.startT; r.startT = 0; }
      if (lv && over.w === ctx.human && lv.win) ctx.toast(lv.name + ': ' + lv.win, 2600);
      if (lv && over.w !== ctx.human && over.w !== 'd' && lv.loss) ctx.toast(lv.name + ': ' + lv.loss, 2600);
      if (!L.length) return;
      if (over.w === ctx.human) {
        r.level++;
        if (r.level >= L.length) { ctx.after(1400, function () { ctx.toast(P.doneText || 'You beat every bot! New game starts the ladder again.', 3200); }); r.level = 0; r.spent = 0; }
        else ctx.after(1400, function () { ctx.toast('Next up: ' + L[r.level].name + (L[r.level].rating != null ? ' (' + L[r.level].rating + ')' : '') + '. Press New game.', 3000); });
      } else if (P.speedrun) { r.level = 0; r.spent = 0; }
    },
    /* forced opening moves (rule hook: also restricts the search, so it stays pure) */
    filterMoves: function (V, st, legal) {
      var F = V.cfg.params && V.cfg.params.force; if (!F || !F[st.turn]) return null;
      var k = Math.floor(st.ply / 2), list = F[st.turn]; if (k >= list.length) return null;
      var u = list[k], f = V.geo.parse(u.slice(0, 2)), t = V.geo.parse(u.slice(2, 4));
      var only = legal.filter(function (m) { return m.f === f && m.t === t; });
      return only.length ? only : null;
    },
    decorate: function (ctx, sq, p) {
      if (ctx.params.blind && p && !ctx.over) return { hidePiece: true };
      return null;
    },
    status: function (ctx) {
      var P = ctx.params, L = levels(ctx), r = run(ctx), bits = [];
      if (L.length > 1) bits.push('Bot ' + (Math.min(r.level, L.length - 1) + 1) + '/' + L.length);
      if (P.speedrun) bits.push('Speedrun ' + fmt(r.spent + (r.startT ? performance.now() - r.startT : 0)) + ' / ' + fmt(P.speedrun.ms));
      if (P.force && P.force[ctx.human] && Math.floor(ctx.state.ply / 2) < P.force[ctx.human].length && ctx.state.turn === ctx.human) bits.push(P.forceWhy || 'Forced opening move');
      if (P.blind && !ctx.over) bits.push('Blindfold: pieces are hidden');
      return bits.join(' · ');
    }
  };
  CM.defineHooks('g4_ladder', base);

  /* chess.com beginner bots: random-ish play, but they always take a mate in one and dodge one when they can */
  CM.defineHooks('g4_martin', Object.assign({}, base, {
    botPick: function (ctx, L) {
      if (!L.length) return null;
      var MATE = (CM.MATE || 100000) - 1000;
      if (L[0].v >= MATE) return L[0];
      var elo = ctx.opponent.elo != null ? ctx.opponent.elo : (ctx.opponent.rating || 250);
      var safe = L.filter(function (x) { return x.v > -MATE; }); if (!safe.length) safe = L;
      return CM.bot.pickByStrength(safe, CM.bot.eloStrength(elo));
    }
  }));
})();
