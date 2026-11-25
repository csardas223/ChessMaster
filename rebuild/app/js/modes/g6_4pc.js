/* g6_4pc (impl-6): the group-6 chess.com 4 Player family modes (4PC FFA h7UFq4r59tM, Chaturaji mZUViBNWt6E /
   oGP4TUDjSVk / tsqxjK8GP10, 4 Player Giveaway oejsLcLHwoA). It is the group-5 lib js/modes/g5_4pc.js (points race,
   +20 for a checkmate, Yellow-as-'b' tint, giveaway bots; logic copied unchanged because hook libs cannot load each
   other synchronously) plus what the videos show around the game:
     - placement table on the game-over modal (chess.com 4PC / Chaturaji: 1st +3, 2nd +1, 3rd -1, 4th -3) and a
       running series counter for this page session (the videos keep a win/loss tally across games)
     - "Claim Win" button under the board when only two players are left and you lead by params.claimLead points
       (default 20; chess.com offers it then and ends the game with you first)
     - 4 Player Giveaway: per-player pieces-left counters in the status line (the scoreboard in the frames)
     - Labyrinth 82 (xg_djfCrRes): params.lives = 8 -> each king survives that many checks (a check that empties the
       counter takes the king: knocked out, +20 to the checker); the count is drawn on the king as in the frames.
       params.promoteRank = 1 -> pawns promote only on that relative rank (their 2nd rank: they start on the back row),
       and params.backDouble -> a pawn on its back row may step two squares, skipping (not getting) the promotion.
   Mode params: those of g5_4pc plus placement: [3, 1, -1, -3], claimLead: 20, lives, promoteRank, backDouble */
(function () {
  'use strict';
  var CM = window.CM;
  var SERIES = {};   // mode id -> summed placement score this session
  function lbl(ctx, c) { var n = (ctx.params.names || {})[c]; if (n) return n; var pr = ctx.game.profile(c) || {}; return pr.name || c; }
  function best(V, st) {
    var sc = st.score || {}, top = null, hi = -1, tie = false;
    V.colors.forEach(function (c) { var v = sc[c] || 0; if (v > hi) { hi = v; top = c; tie = false; } else if (v === hi) tie = true; });
    return { c: tie ? 'd' : top, v: hi };
  }
  function ranking(ctx) {   // colours, best first: score, then still alive, then turn order
    var st = ctx.state, sc = st.score || {}, out = st.out || {}, cs = ctx.colors.slice();
    if (ctx.params.giveaway) {   // giveaway: fewest pieces left is best
      var left = {}; cs.forEach(function (c) { left[c] = ctx.pieces(function (p) { return p.c === c && !p.dead; }).length; });
      return cs.sort(function (a, b) { return left[a] - left[b] || cs.indexOf(a) - cs.indexOf(b); });
    }
    return cs.sort(function (a, b) { return (sc[b] || 0) - (sc[a] || 0) || (out[a] ? 1 : 0) - (out[b] ? 1 : 0) || cs.indexOf(a) - cs.indexOf(b); });
  }
  var ORD = ['1st', '2nd', '3rd', '4th'];
  function claimBtn(ctx, show) {
    var b = document.getElementById('g6-claim');
    if (!show) { if (b) b.remove(); return; }
    if (b) return;
    var st = document.getElementById('status'); if (!st || !st.parentNode) return;
    b = document.createElement('button'); b.type = 'button'; b.id = 'g6-claim'; b.className = 'btn'; b.textContent = 'Claim Win';
    b.style.cssText = 'display:block;margin:6px auto 0;padding:0 18px;font-weight:700;background:#81b64c;color:#fff';
    b.onclick = function () { claimBtn(ctx, false); if (!ctx.over) ctx.endGame(ctx.human, 'claimed win (points lead)'); };
    st.parentNode.insertBefore(b, st.nextSibling);
  }
  function checkClaim(ctx) {
    var p = ctx.params; if (!p.ffa || ctx.over) return claimBtn(ctx, false);
    var alive = ctx.V.alive(ctx.state), sc = ctx.state.score || {};
    if (alive.length !== 2 || alive.indexOf(ctx.human) < 0) return claimBtn(ctx, false);
    var other = alive[0] === ctx.human ? alive[1] : alive[0];
    claimBtn(ctx, (sc[ctx.human] || 0) - (sc[other] || 0) >= (p.claimLead || 20));
  }
  function fwd(V, i, c) { var F = V.geo.FR(c).F; return V.geo.step(i, F[0], F[1]); }
  CM.defineHooks('g6_4pc', {
    moves: function (V, st, out) {
      var P = V.cfg.params || {}; if (P.promoteRank == null && !P.backDouble) return out;
      var g = V.geo, seen = {}, res = [];
      out.forEach(function (m) {
        if (m.p !== 'P' || P.promoteRank == null) { res.push(m); return; }
        if (m.promo && g.relRow(m.t, m.c) !== P.promoteRank) { var k = m.f + ':' + m.t; if (seen[k]) return; seen[k] = 1; m = Object.assign({}, m); delete m.promo; }
        res.push(m);
      });
      if (P.backDouble) st.b.forEach(function (p, i) {
        if (!p || p.t !== 'P' || p.c !== st.turn || p.dead || g.relRow(i, p.c) !== 0) return;
        var a = fwd(V, i, p.c); if (a < 0 || st.b[a]) return; var b = fwd(V, a, p.c); if (b < 0 || st.b[b]) return;
        res.push({ f: i, t: b, p: 'P', c: p.c, cap: null });
      });
      return res;
    },
    onMake: function (V, st, m, n) {
      var P = V.cfg.params || {}; if (!P.lives) return;
      var lives = Object.assign({}, (st.x && st.x.lives) || {}), hit = false;
      V.alive(n).forEach(function (c) {
        if (c === m.c || !V.royals(n, c).length) return;
        if (V.inCheck(n, c) && !V.inCheck(st, c)) {
          var left = (lives[c] != null ? lives[c] : P.lives) - 1; lives[c] = left; hit = true;
          if (left <= 0) V.royals(n, c).forEach(function (k) { n.b[k] = null; });
        }
      });
      if (hit) n.x = Object.assign({}, n.x, { lives: lives });
    },
    setup: function (ctx) {
      claimBtn(ctx, false);
      var t = ctx.params.tintB; if (!t) return;
      ctx.pieces(function (p) { return p.c === 'b'; }).forEach(function (i) { ctx.set(i, Object.assign({}, ctx.at(i), { cls: 'pc--tint-' + t })); });
    },
    decorate: function (ctx, sq, p) {
      if (p && ctx.params.lives && !p.dead && ctx.V.def(p.t).royal) { var lv = ((ctx.x || {}).lives || {})[p.c]; return { badge: String(lv != null ? lv : ctx.params.lives) }; }
      if (!p || !ctx.params.tintB) return null;
      if (p.c === 'b' || (p.dead && p.was === 'b')) { var d = ctx.V.def(p.t); if (d.img) return null; return { img: CM.settings.pieceUrl('w', d.glyph || p.t) }; }
      return null;
    },
    afterMove: function (ctx) { checkClaim(ctx); },
    onTrigger: function (ctx, name, info) {
      if (name !== 'knockout') return;
      if (ctx.params.tintB) ctx.pieces(function (p) { return p.dead && p.was === info.side && p.cls; }).forEach(function (i) { var q = Object.assign({}, ctx.at(i)); delete q.cls; ctx.set(i, q); });
      if (!ctx.params.ffa) return;
      var st = ctx.state, last = ctx.last, to = /stalemat/.test(info.why || '') ? info.side : (last ? last.c : null);
      if (!to || to === 'n') return;
      var sc = Object.assign({}, st.score || {}); sc[to] = (sc[to] || 0) + 20; st.score = sc;
      ctx.toast(lbl(ctx, to) + ' +20 for ' + (to === info.side ? 'the stalemate' : 'the checkmate') + '.', 2400);
      checkClaim(ctx);
    },
    checkWin: function (V, st) {
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
    onGameOver: function (ctx) {
      claimBtn(ctx, false);
      var pts = ctx.params.placement || [3, 1, -1, -3], rk = ranking(ctx).filter(function (c) { return !ctx.over || c !== ctx.over.w; }), sc = ctx.state.score || {}, id = ctx.spec.id;
      if (ctx.over && ctx.colors.indexOf(ctx.over.w) >= 0) rk.unshift(ctx.over.w);   // the winner (incl. a claimed win) is 1st
      var me = rk.indexOf(ctx.human), delta = pts[me] || 0;
      SERIES[id] = (SERIES[id] || 0) + delta;
      var table = rk.map(function (c, k) { return ORD[k] + ' ' + lbl(ctx, c) + (ctx.params.ffa ? ' ' + (sc[c] || 0) : '') + ' (' + (pts[k] > 0 ? '+' : '') + pts[k] + ')'; }).join(' · ');
      var txt = 'on placement: ' + table + '. Series ' + (SERIES[id] > 0 ? '+' : '') + SERIES[id];
      ctx.spec.messages = Object.assign({}, ctx.spec.messages, { win: txt, loss: txt, draw: txt, win_title: me === 0 ? 'You Won!' : ORD[me] + ' Place', loss_title: ORD[me] + ' Place' });
    },
    onExit: function (ctx) { claimBtn(ctx, false); },
    status: function (ctx) {
      var p = ctx.params, st = ctx.state, sc = st.score || {};
      if (!p.ffa) {
        if (!p.giveaway) return null;
        return ctx.colors.map(function (c) { var n = ctx.pieces(function (q) { return q.c === c && !q.dead; }).length; return lbl(ctx, c) + ' ' + n; }).join('  ·  ') + '  (pieces left; captures are compulsory)';
      }
      var s = ctx.colors.map(function (c) { return lbl(ctx, c) + ' ' + (sc[c] || 0) + (st.out && st.out[c] ? ' (out)' : ''); }).join('  ·  ');
      return SERIES[ctx.spec.id] ? s + '  ·  Series ' + (SERIES[ctx.spec.id] > 0 ? '+' : '') + SERIES[ctx.spec.id] : s;
    }
  });
})();
