/* g5_passant: Passant (Steam chess roguelike) rules for the "Slip and Push" run.
   Badges (player's pieces only, params.badges):
     slippy: a moved piece slides one extra square in its direction if that square is empty; off the edge = lost
             (the king never slips off the board)
             (jumping pieces, i.e. knights, and castling do not slip)
     push:   a non-capturing move pushes every adjacent piece (not kings) one square away if there is room;
             a piece pushed over the edge falls off the board
   Victory (any one, params-free): capture the enemy king (you may move into check), capture every enemy piece
   except the king, check the enemy king 6 turns in a row, or lead by +7 material for two of your turns in a row.
   Rounds: params.rounds = [{ name, fen }] played one after another (win a round -> New game starts the next). */
(function () {
  'use strict';
  var CM = window.CM, pos = {};
  var VAL = { P: 1, N: 3, B: 3, R: 5, Q: 9, K: 0 };
  function mat(V, b, c) { var s = 0; for (var i = 0; i < b.length; i++) { var p = b[i]; if (p && p.c === c) s += VAL[p.t] != null ? VAL[p.t] : Math.round(V.def(p.t).value / 100); } return s; }
  function sgn(x) { return x > 0 ? 1 : x < 0 ? -1 : 0; }
  function rounds(ctx) { return ctx.params.rounds || []; }
  CM.defineHooks('g5_passant', {
    setup: function (ctx) {
      var R = rounds(ctx), k = Math.min(pos[ctx.spec.id] || 0, R.length - 1), r = R[k]; if (!r) return;
      var V = ctx.V, st = ctx.state; st.b = CM.spec.parseSetup(V, r.fen);
      st.b.forEach(function (p, i) { if (p && V.def(p.t).pawn && V.geo.relRow(i, p.c) !== 1) st.b[i] = Object.assign({}, p, { m: 1 }); });
      st.start = {}; V.colors.forEach(function (c) { st.start[c + 'Royal'] = V.royals(st, c).length > 0; });
    },
    onStart: function (ctx) { var R = rounds(ctx), k = Math.min(pos[ctx.spec.id] || 0, R.length - 1); if (R[k]) ctx.toast('Round ' + (k + 1) + '/' + R.length + ': ' + R[k].name, 3000); },
    onMake: function (V, st, m, n) {
      var me = st.turn, badges = (V.cfg.params || {}).badges || {}, g = V.geo, b = n.b;
      var human = (V.cfg.params || {}).human || 'w';
      if (me === human && !m.drop && !m.castle) {
        var dc = g.col(m.t) - g.col(m.f), dr = g.row(m.t) - g.row(m.f), at = m.t;
        var jump = m.p === 'N' || (Math.abs(dc) && Math.abs(dr) && Math.abs(dc) !== Math.abs(dr));
        if (badges.slippy && !jump && (dc || dr)) {
          var nx = g.step(at, sgn(dc), sgn(dr));
          if ((nx === -1 || nx === -2) && b[at].t !== 'K') { b[at] = null; at = -1; n.x = Object.assign({}, n.x, { slipped: (n.x.slipped || 0) + 1 }); }
          else if (nx >= 0 && !b[nx]) { b[nx] = b[at]; b[at] = null; at = nx; }
        }
        if (badges.push && !m.cap && at >= 0) {
          for (var ox = -1; ox <= 1; ox++) for (var oy = -1; oy <= 1; oy++) {
            if (!ox && !oy) continue; var s = g.step(at, ox, oy); if (s < 0) continue; var q = b[s];
            if (!q || q.t === 'K' || V.def(q.t).blocker) continue;
            var d = g.step(s, ox, oy);
            if (d === -1 || d === -2) b[s] = null; else if (!b[d]) { b[d] = q; b[s] = null; }
          }
        }
      }
      /* victory counters, from the mover's view */
      var E = me === 'w' ? 'b' : 'w', x = n.x = Object.assign({}, n.x), ek = V.royals(n, E)[0];
      var chk = ek != null && V.attacked(n, ek, me);
      x['chk_' + me] = chk ? (st.x['chk_' + me] || 0) + 1 : 0;
      x['lead_' + me] = mat(V, b, me) - mat(V, b, E) >= 7 ? (st.x['lead_' + me] || 0) + 1 : 0;
    },
    checkWin: function (V, st) {
      var cs = ['w', 'b'];
      for (var k = 0; k < 2; k++) {
        var c = cs[k], E = cs[1 - k];
        if (!V.royals(st, E).length) return { w: c, why: 'the king was captured' };
        var others = 0; for (var i = 0; i < st.b.length; i++) { var p = st.b[i]; if (p && p.c === E && p.t !== 'K') others++; }
        if (!others) return { w: c, why: 'every piece but the king was captured' };
        if ((st.x['chk_' + c] || 0) >= 6) return { w: c, why: 'six checks in a row' };
        if ((st.x['lead_' + c] || 0) >= 2) return { w: c, why: '+7 material for two turns' };
      }
      return null;
    },
    onGameOver: function (ctx, over) {
      var id = ctx.spec.id, R = rounds(ctx), k = pos[id] || 0;
      if (over.w === ctx.human) { pos[id] = k < R.length - 1 ? k + 1 : 0; ctx.toast(k < R.length - 1 ? 'Round cleared! +$8. New game starts round ' + (k + 2) + '.' : 'Level 1 cleared!', 3200); }
    },
    status: function (ctx) {
      var R = rounds(ctx), k = Math.min(pos[ctx.spec.id] || 0, R.length - 1), x = ctx.state.x, h = ctx.human;
      return 'Round ' + (k + 1) + '/' + R.length + '  ·  checks in a row ' + (x['chk_' + h] || 0) + '/6  ·  +7 lead ' + (x['lead_' + h] || 0) + '/2';
    }
  });
})();
