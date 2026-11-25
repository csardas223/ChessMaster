/* g5_levels: a list of fixed puzzle positions played one after another (practice menus, puzzle games).
   Mode params:
     levels: [{ name, fen, turn, hint, x }]  each level's position (FEN for the mode's board) and optional state.x
     passColor: 'b'   that colour never moves (a static target such as a red king): it always gets one "pass" move
   Winning a level moves you to the next one on New game; the status line shows the level. */
(function () {
  'use strict';
  var CM = window.CM;
  var pos = {};
  function L(ctx) { return ctx.params.levels || []; }
  function cur(ctx) { var l = L(ctx); return l[Math.min(pos[ctx.spec.id] || 0, l.length - 1)] || {}; }
  CM.defineHooks('g5_levels', {
    setup: function (ctx) {
      var lv = cur(ctx), V = ctx.V, st = ctx.state; if (!lv.fen) return;
      st.b = CM.spec.parseSetup(V, lv.fen);
      st.b.forEach(function (p, i) { if (p && p.c !== 'n' && V.def(p.t).pawn && V.geo.relRow(i, p.c) !== 1) st.b[i] = Object.assign({}, p, { m: 1 }); });
      if (lv.turn) st.turn = lv.turn;
      st.x = Object.assign({}, st.x, lv.x || {});
      st.start = {}; V.colors.forEach(function (c) { st.start[c + 'Royal'] = V.royals(st, c).length > 0; });
    },
    onStart: function (ctx) { var lv = cur(ctx), l = L(ctx); ctx.toast('Level ' + (Math.min(pos[ctx.spec.id] || 0, l.length - 1) + 1) + '/' + l.length + (lv.name ? ': ' + lv.name : '') + (lv.hint ? '. ' + lv.hint : ''), 3400); },
    moves: function (V, st, out) {
      var pc = V.cfg.params && V.cfg.params.passColor;
      if (!pc || st.turn !== pc) return out;
      for (var i = 0; i < st.b.length; i++) { var p = st.b[i]; if (p && p.c === pc) return [{ f: i, t: i, p: p.t, c: pc, cap: null, pass: 1 }]; }
      return out;
    },
    onGameOver: function (ctx, over) {
      var id = ctx.spec.id, l = L(ctx), k = pos[id] || 0;
      if (over.w === ctx.human) { pos[id] = k < l.length - 1 ? k + 1 : 0; ctx.toast(k < l.length - 1 ? 'Level cleared! New game starts level ' + (k + 2) + '.' : 'All levels cleared!', 3200); }
    },
    status: function (ctx) { var l = L(ctx), k = Math.min(pos[ctx.spec.id] || 0, l.length - 1), lv = cur(ctx); return 'Level ' + (k + 1) + '/' + l.length + (lv.name ? ': ' + lv.name : ''); },
    camera: function (ctx) { var V = ctx.V, k = V.royals(ctx.state, ctx.bot)[0]; return k != null ? k : null; }
  });
})();
