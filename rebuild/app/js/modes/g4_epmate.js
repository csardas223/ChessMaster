/* g4_epmate: "Can I En Passant Checkmate (Martin)?" challenge videos (group 4). Normal chess against Martin (250), but
   only a checkmate delivered BY an en passant capture completes the challenge; any other checkmate of Martin is a
   "challenge failed" draw. Martin plays like the chess.com beginner bot: mostly random, but never misses a mate in one
   and dodges one when he can (same pick as js/modes/g4_martin.js).
   State: x.ep = 1 when the move that produced the position was an en passant capture by White. */
(function () {
  'use strict';
  var CM = window.CM;
  function martinPick(ctx, L) {
    if (!L.length) return null;
    var MATE = (CM.MATE || 100000) - 1000;
    if (L[0].v >= MATE) return L[0];
    var safe = L.filter(function (x) { return x.v > -MATE; }); if (!safe.length) safe = L;
    return CM.bot.pickByStrength(safe, CM.bot.eloStrength(ctx.opponent.elo != null ? ctx.opponent.elo : 250));
  }
  CM.defineHooks('g4_epmate', {
    onMake: function (V, st, m, n) { n.x.ep = m.ep && m.c === 'w' ? 1 : 0; },
    checkWin: function (V, st, moves) {
      if (moves.length || st.turn !== 'b' || !V.inCheck(st, 'b')) return null;
      return st.x.ep ? { w: 'w', why: 'en passant checkmate!' } : { w: 'd', why: 'checkmate, but not by en passant: the challenge failed' };
    },
    botPick: martinPick,
    afterMove: function (ctx, m, info) {
      if (m.ep && info.by === 'player') {
        ctx.fx({ type: 'text', text: 'EN PASSANT!', color: '#ffd23f', size: 44, at: 'board', duration_ms: 1400 });
        if (ctx.over && ctx.over.w === ctx.human) ctx.fx({ type: 'particles', kind: 'confetti', count: 90, at: 'board', duration_ms: 1800 });
      }
    },
    status: function (ctx) {
      if (ctx.over) return null;
      var V = ctx.V, st = ctx.state, n = 0;
      for (var i = 0; i < st.b.length; i++) { var p = st.b[i]; if (p && p.c === 'b' && p.t === 'P' && !p.m) n++; }
      return 'Goal: checkmate with an en passant capture · Martin pawns still unmoved: ' + n;
    }
  });
})();
