/* g5_racing: Racing Kings. No pawns, everything starts on ranks 1-2. A move that gives check is illegal (for either
   side), so kings are never attacked. First king on the 8th rank wins; if White gets there first, Black may still
   draw by also reaching the 8th rank on the very next move. */
(function () {
  'use strict';
  function kingRank(V, st, c) { var r = V.royals(st, c)[0]; return r == null ? 0 : V.geo.rank(r); }
  /* impl-5 art pass 3: the video marks a move that would give check with a big red X (bLwXpCK_h4k maxres1, cut by
     tools/g5_frames2.py) and the attacked king's square in dark red. Here, when you pick up a piece, every square it
     could reach but may not (because it would give check) gets that X, and the enemy king's square turns red. */
  var xCache = { st: null, sel: -1, set: null, king: -1 };
  function checkingTargets(ctx) {
    var G = ctx.game, st = ctx.state, sel = G ? G.sel : -1;
    if (xCache.st === st && xCache.sel === sel) return xCache;
    xCache = { st: st, sel: sel, set: {}, king: -1 };
    if (sel == null || sel < 0 || ctx.over || st.turn !== ctx.human) return xCache;
    var p = st.b[sel]; if (!p || p.c !== ctx.human) return xCache;
    var V = ctx.V, them = V.opp(ctx.human), legal = {}, any = false;
    (G.moves || []).forEach(function (m) { if (m.f === sel) legal[m.t] = 1; });
    V.gen(st).forEach(function (m) {
      if (m.f !== sel || legal[m.t]) return;
      var n = m.n || V.make(st, m);
      if (V.inCheck(n, them) && !V.inCheck(n, ctx.human)) { xCache.set[m.t] = 1; any = true; }
    });
    if (any) xCache.king = V.royals(st, them)[0];
    return xCache;
  }
  CM.defineHooks('g5_racing', {
    decorate: function (ctx, sq) {
      if (!ctx.params.redX) return null;
      var c = checkingTargets(ctx);
      if (c.set && c.set[sq]) return { html: '<img alt="" src="' + ctx.params.redX + '" style="position:absolute;left:8%;top:8%;width:84%;height:84%;pointer-events:none;z-index:3">' };
      if (sq === c.king) return { html: '<span class="sq-tint" style="background:#8b0000"></span>' };
      return null;
    },
    filterMoves: function (V, st, legal) {
      var me = st.turn, them = V.opp(me);
      return legal.filter(function (m) { return !V.inCheck(m.n, them); });
    },
    checkWin: function (V, st, moves) {
      var top = V.geo.ranks, w8 = kingRank(V, st, 'w') === top, b8 = kingRank(V, st, 'b') === top;
      if (w8 && b8) return { w: 'd', why: 'both kings reached the 8th rank' };
      if (b8) return { w: 'b', why: 'Black\'s king reached the 8th rank' };
      if (w8) {
        if (st.turn === 'w') return { w: 'w', why: 'White\'s king reached the 8th rank' };
        var reply = moves.some(function (m) { return V.def(m.p).royal && V.geo.rank(m.t) === top; });
        return reply ? null : { w: 'w', why: 'White\'s king reached the 8th rank' };
      }
      return null;
    },
    evaluate: function (V, st) {
      var w = kingRank(V, st, 'w'), b = kingRank(V, st, 'b');
      return (w * w - b * b) * 22 + (st.turn === 'w' ? 30 : -30);
    }
  });
})();
