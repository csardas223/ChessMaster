/* g6_levels: group-6 runs of fixed rounds / puzzle levels (chess roguelikes such as Passant, Gambonanza, Shotgun King,
   Pawnbarian; practice menus such as Infinite Chess; puzzle platformers such as Chess with Gravity).
   Mode params:
     levels: [{ name, fen, turn, hint, x, opponent: {name, rating, avatar, tagline}, reward }]
     passColor: 'b'      that colour never moves (static target): it always gets one "pass" move
     passant: true       Passant victory conditions for White (any one wins the round), in addition to checkmate /
                         king capture: deliver check 6 of your turns in a row, capture every enemy piece except the
                         king, or be +7 material ahead after two of your turns in a row. Shows the counters.
     run: 'Run'          label for the progress line ('Stage', 'Floor', 'Level', ...)
     money: true         show a $ total (each level's reward, default $8) earned across the run
     captureOnly: 'b'    that colour only ever captures (sentries that strike what enters their line); else it passes
     freezer: 'Ct'       piece type that freezes the enemy pieces next to it (Passant Courtisan)
     slippy: true        Passant "Slippy" badge: a White piece that moved in a straight line slides one more square in
                         that direction if it is empty (off the board = lost); knight jumps do not slip
   Winning a level moves you to the next one on New game; losing keeps you on it (roguelike retry). */
(function () {
  'use strict';
  var CM = window.CM;
  var mem = {};
  function M(ctx) { var id = ctx.spec.id; return mem[id] || (mem[id] = { k: 0, cash: 0 }); }
  function L(ctx) { return ctx.params.levels || []; }
  function cur(ctx) { var l = L(ctx); return l[Math.min(M(ctx).k, l.length - 1)] || {}; }
  function mat(V, st, c) { var s = 0; st.b.forEach(function (p) { if (p && p.c === c && !p.dead) { var d = V.def(p.t); if (!d.royal && !d.blocker) s += d.value || 0; } }); return s; }
  function nonKing(V, st, c) { var n = 0; st.b.forEach(function (p) { if (p && p.c === c && !p.dead && !V.def(p.t).royal && !V.def(p.t).blocker) n++; }); return n; }
  CM.defineHooks('g6_levels', {
    setup: function (ctx) {
      var lv = cur(ctx), V = ctx.V, st = ctx.state;
      if (lv.fen) {
        st.b = CM.spec.parseSetup(V, lv.fen);
        st.b.forEach(function (p, i) { if (p && p.c !== 'n' && V.def(p.t).pawn && V.geo.relRow(i, p.c) !== 1) st.b[i] = Object.assign({}, p, { m: 1 }); });
      }
      if (lv.turn) st.turn = lv.turn;
      st.x = Object.assign({}, st.x, { chk: 0, lead: 0, enemy0: 0 }, lv.x || {});
      st.start = {}; V.colors.forEach(function (c) { st.start[c + 'Royal'] = V.royals(st, c).length > 0; });
      st.x.enemy0 = nonKing(V, st, 'b');
      if (lv.opponent) Object.assign(ctx.opponent, lv.opponent, lv.opponent.rating ? { elo: lv.opponent.rating } : {});
    },
    onStart: function (ctx) {
      var lv = cur(ctx), l = L(ctx), k = Math.min(M(ctx).k, l.length - 1);
      ctx.toast((ctx.params.run || 'Level') + ' ' + (k + 1) + '/' + l.length + (lv.name ? ': ' + lv.name : '') + (lv.hint ? '. ' + lv.hint : ''), 3600);
    },
    moves: function (V, st, out) {
      var P = V.cfg.params || {}, pc = P.passColor;
      if (P.captureOnly && st.turn === P.captureOnly) {
        var caps = out.filter(function (m) { return m.cap; });
        if (caps.length) return caps;
        pc = P.captureOnly;
      }
      if (!pc || st.turn !== pc) return out;
      for (var i = 0; i < st.b.length; i++) { var p = st.b[i]; if (p && p.c === pc) return [{ f: i, t: i, p: p.t, c: pc, cap: null, pass: 1 }]; }
      return out;
    },
    filterMoves: function (V, st, legal) {
      var T = V.cfg.params && V.cfg.params.freezer; if (!T) return legal;
      var g = V.geo, fz = [];
      st.b.forEach(function (p, i) { if (p && p.t === T && p.c !== st.turn) fz.push(i); });
      if (!fz.length) return legal;
      var out = legal.filter(function (m) { return m.f < 0 || !fz.some(function (z) { return g.dist(z, m.f) === 1; }); });
      return out.length ? out : legal;
    },
    onMake: function (V, st, m, n) {
      var P = V.cfg.params || {}, g = V.geo;
      if (P.slippy && st.turn === 'w' && m.f >= 0 && m.f !== m.t && n.b[m.t] && n.b[m.t].c === 'w') {
        var dc = g.col(m.t) - g.col(m.f), dr = g.row(m.t) - g.row(m.f);
        if (dc === 0 || dr === 0 || Math.abs(dc) === Math.abs(dr)) {
          var s2 = g.step(m.t, Math.sign(dc), Math.sign(dr));
          if (s2 === -1 || s2 === -2) n.b[m.t] = null;
          else if (s2 >= 0 && !n.b[s2]) { n.b[s2] = n.b[m.t]; n.b[m.t] = null; }
        }
      }
      if (!(V.cfg.params && V.cfg.params.passant) || st.turn !== 'w') return;
      var bk = V.royals(n, 'b');
      var chk = bk.length && V.attacked(n, bk[0], 'w');
      n.x.chk = chk ? (st.x.chk || 0) + 1 : 0;
      n.x.lead = mat(V, n, 'w') - mat(V, n, 'b') >= 700 ? (st.x.lead || 0) + 1 : 0;
    },
    checkWin: function (V, st) {
      if (!(V.cfg.params && V.cfg.params.passant)) return null;
      var x = st.x || {};
      if ((x.chk || 0) >= 6) return { w: 'w', why: 'six checks in a row' };
      if ((x.lead || 0) >= 2) return { w: 'w', why: '+7 material for two turns' };
      if (x.enemy0 && nonKing(V, st, 'b') === 0 && V.royals(st, 'b').length) return { w: 'w', why: 'every enemy piece except the king was captured' };
      return null;
    },
    onGameOver: function (ctx, over) {
      var m = M(ctx), l = L(ctx), lv = cur(ctx);
      if (over.w === ctx.human) {
        m.cash += lv.reward != null ? lv.reward : 8;
        if (m.k < l.length - 1) { m.k++; ctx.toast('Round cleared' + (ctx.params.money ? ' (+$' + (lv.reward != null ? lv.reward : 8) + ')' : '') + '! New game starts ' + (ctx.params.run || 'level').toLowerCase() + ' ' + (m.k + 1) + ': ' + (l[m.k].name || ''), 3600); }
        else { m.k = 0; ctx.toast('Run complete! Every ' + (ctx.params.run || 'level').toLowerCase() + ' cleared.', 4000); m.cash = 0; }
      } else if (over.w !== 'd') ctx.toast('Run over at ' + (ctx.params.run || 'level').toLowerCase() + ' ' + (m.k + 1) + '. New game retries it.', 3200);
    },
    status: function (ctx) {
      var l = L(ctx), m = M(ctx), k = Math.min(m.k, l.length - 1), lv = cur(ctx), x = ctx.state.x || {};
      var s = (ctx.params.run || 'Level') + ' ' + (k + 1) + '/' + l.length + (lv.name ? ': ' + lv.name : '');
      if (ctx.params.money) s += ' · $' + m.cash;
      if (ctx.params.passant) s += ' · checks ' + (x.chk || 0) + '/6 · lead turns ' + (x.lead || 0) + '/2';
      return s;
    },
    camera: function (ctx) { var k = ctx.V.royals(ctx.state, ctx.bot)[0]; return k != null ? k : null; }
  });
})();
