/* g6_infinite (impl-6): infinitechess.org matches against a YouTuber (iUUoeJL1FvY vs PJs Chess, mf238p7c3bc vs
   TwoNiche). As in the videos: a best-of-N match score kept across New game (status line + game-over text), and the
   site's zoom: a "Zoom out" button cycles the visible window of the big field through params.zoom sizes.
   Mode params: bestOf: 3, zoom: [8, 12, 24] */
(function () {
  'use strict';
  var CM = window.CM;
  var MATCH = {};   // mode id -> { me, opp, games }
  function M(ctx) { var id = ctx.spec.id; return MATCH[id] || (MATCH[id] = { me: 0, opp: 0 }); }
  function need(ctx) { return Math.floor((ctx.params.bestOf || 3) / 2) + 1; }
  function score(ctx) { var m = M(ctx); return 'You ' + m.me + ' - ' + m.opp + ' ' + (ctx.opponent.name || 'Opponent'); }
  function tools(ctx) {
    var old = document.getElementById('g6-tools'); if (old) old.remove();
    var Z = ctx.params.zoom, st = document.getElementById('status'); if (!Z || !st || !st.parentNode) return;
    var bar = document.createElement('div'); bar.id = 'g6-tools'; bar.style.cssText = 'display:flex;gap:8px;justify-content:center;margin-top:6px';
    var vp = ctx.spec.board.viewport || {}, cur = (vp.mobile && window.innerWidth < 900 ? vp.mobile.files : vp.files) || Z[0], zi = Math.max(0, Z.indexOf(cur));
    var b = document.createElement('button'); b.type = 'button'; b.className = 'btn'; b.textContent = zi === Z.length - 1 ? 'Zoom in' : 'Zoom out';
    b.onclick = function () {
      zi = (zi + 1) % Z.length; var n = Z[zi], nv = Object.assign({}, ctx.spec.board.viewport, { files: n, ranks: n, mobile: { files: n, ranks: n } });
      ctx.spec.board.viewport = nv; CM.gameUI.setViewport(nv); ctx.game.render({ instant: true }); b.textContent = zi === Z.length - 1 ? 'Zoom in' : 'Zoom out';
    };
    bar.appendChild(b); st.parentNode.insertBefore(bar, st.nextSibling);
  }
  CM.defineHooks('g6_infinite', {
    setup: function (ctx) { var m = M(ctx); if (m.me >= need(ctx) || m.opp >= need(ctx)) { m.me = 0; m.opp = 0; } tools(ctx); },
    onStart: function (ctx) { var m = M(ctx); ctx.toast('Game ' + (m.me + m.opp + 1) + ' of the best of ' + (ctx.params.bestOf || 3) + '. ' + score(ctx), 2600); },
    onGameOver: function (ctx, over) {
      var m = M(ctx);
      if (over.w === ctx.human) m.me++; else if (over.w !== 'd') m.opp++; else { m.me += 0.5; m.opp += 0.5; }
      var done = m.me >= need(ctx) || m.opp >= need(ctx);
      var txt = 'on ' + (over.why || 'the board').replace(/^by /, '') + '. Match: ' + score(ctx) + (done ? (m.me > m.opp ? ' - you win the match!' : ' - match lost.') : '');
      ctx.spec.messages = Object.assign({}, ctx.spec.messages, { win: txt, loss: txt, draw: txt });
    },
    onExit: function () { var e = document.getElementById('g6-tools'); if (e) e.remove(); },
    status: function (ctx) { return 'Best of ' + (ctx.params.bestOf || 3) + ': ' + score(ctx); }
  });
})();
