/* g5_4pc: chess.com 4 Player Chess family (FFA on the 14x14 cross board, 4 Player Giveaway, Chaturaji on 8x8).
   Colours in turn order Red, Blue, Yellow, Green. When the human sits Yellow the mode names Yellow 'b' (so the board
   turns to show Yellow at the bottom, as chess.com does) and this lib draws those pieces as tinted white pieces.
   Mode params:
     ffa: true        points race: captures score via rules.win points (values per mode), a checkmate scores +20 for the
                      player who moved last (a stalemated player gets the 20 itself); when one player is left (or the
                      move limit hits) the highest score wins. Eliminated armies turn grey and are worth 0.
     tintB: 'y'       draw colour 'b' as tinted white pieces of that colour (r|u|y|g)
     giveaway: true   4 Player Giveaway: bots try to lose material (rules: forcedCapture, eliminate result win)
     names: { r: 'Red', ... } labels for the status line */
(function () {
  'use strict';
  var CM = window.CM;
  function lbl(ctx, c) { var n = (ctx.params.names || {})[c]; if (n) return n; var pr = ctx.game.profile(c) || {}; return pr.name || c; }
  function best(V, st) {
    var sc = st.score || {}, top = null, hi = -1, tie = false;
    V.colors.forEach(function (c) { var v = sc[c] || 0; if (v > hi) { hi = v; top = c; tie = false; } else if (v === hi) tie = true; });
    return { c: tie ? 'd' : top, v: hi };
  }
  /* pol-q2: a type that ships its own art for colour 'b' (Chaturaji's yellow boat from the video) keeps that art, untinted */
  function ownArt(ctx, p) { var d = ctx.V.def(p.t) || {}; return d.img && typeof d.img === 'object' && d.img.b ? d.img.b : null; }
  CM.defineHooks('g5_4pc', {
    setup: function (ctx) {
      var t = ctx.params.tintB; if (!t) return;
      ctx.pieces(function (p) { return p.c === 'b' && !ownArt(ctx, p); }).forEach(function (i) { ctx.set(i, Object.assign({}, ctx.at(i), { cls: 'pc--tint-' + t })); });
    },
    decorate: function (ctx, sq, p) {
      if (!p || !ctx.params.tintB) return null;
      if (p.c === 'b' || (p.dead && p.was === 'b')) { var d = ctx.V.def(p.t), own = ownArt(ctx, p); return { img: own || CM.settings.pieceUrl('w', d.glyph || p.t) }; }
      return null;
    },
    onTrigger: function (ctx, name, info) {
      if (name !== 'knockout') return;
      if (ctx.params.tintB) ctx.pieces(function (p) { return p.dead && p.was === info.side && p.cls; }).forEach(function (i) { var q = Object.assign({}, ctx.at(i)); delete q.cls; ctx.set(i, q); });
      if (!ctx.params.ffa) return;
      var st = ctx.state, last = ctx.last, to = /stalemat/.test(info.why || '') ? info.side : (last ? last.c : null);
      if (!to || to === 'n') return;
      var sc = Object.assign({}, st.score || {}); sc[to] = (sc[to] || 0) + 20; st.score = sc;
      ctx.toast(lbl(ctx, to) + ' +20 for ' + (to === info.side ? 'the stalemate' : 'the checkmate') + '.', 2400);
    },
    checkWin: function (V, st, moves) {
      var p = V.cfg.params || {};
      if (!p.ffa) return null;
      var alive = V.alive(st);
      if (alive.length <= 1 || st.half >= (V.rules.drawPlies || 200) - 1) { var b = best(V, st); return { w: b.c, why: (alive.length <= 1 ? 'one player left' : 'move limit') + ', most points (' + b.v + ')' }; }
      return null;
    },
    evaluate: function (V, st, c) {
      var p = V.cfg.params || {};
      if (!p.giveaway || !c) return 0;
      var own = 0; for (var i = 0; i < st.b.length; i++) { var q = st.b[i]; if (q && q.c === c) own += V.def(q.t).value + 50; }
      return -2 * own * (c === 'b' ? -1 : 1);
    },
    status: function (ctx) {
      var p = ctx.params, st = ctx.state, sc = st.score || {};
      if (!p.ffa) { var left = ctx.pieces(function (q) { return q.c === ctx.human; }).length; return p.giveaway ? 'You have ' + left + ' piece' + (left === 1 ? '' : 's') + ' left. Captures are compulsory.' : null; }
      return ctx.colors.map(function (c) { return lbl(ctx, c) + ' ' + (sc[c] || 0) + (st.out && st.out[c] ? ' (out)' : ''); }).join('  ·  ');
    }
  });
})();
