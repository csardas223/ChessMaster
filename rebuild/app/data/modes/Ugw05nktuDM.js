/* Chess, But I Can LAUNCH My Pawns. Angry-Birds chess vs Stockfish (3600). As your move you can launch one pawn with
   the slingshot: it flies in a straight line (any of 8 directions) with the power you choose (1-7 squares). When it
   hits an enemy piece, the pawn stops in that piece's square and the enemy is knocked onward with the remaining power;
   a piece knocked over the edge is gone. Kings are never bumped, and your own pieces stop the pawn. Too much power
   sends your pawn off the board. A pawn that ends on the last rank becomes a queen.
   Sources: research/modes/Ugw05nktuDM.json (transcript 00:01 "drag back on the pawn... push off enemy penguins...
   pieces snap back", 01:58 "the king is never affected by these bumping mechanics", 11:17 maximum push overkill,
   11:53 launch to g8 ladder mate), frames visual_b (brown #ead2ae/#ae7e66, slingshot icon, purple launch path).
   Discrete remake of the physics: the video's free-physics sliding and snap-to-grid are replaced by straight-line
   square steps (low confidence on exact outcomes). Inferred: unlimited launches; launched pawns auto-queen. */
(function () {
  var DIRS = [[0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1]];
  function bar(ctx, html, on) {
    var el = document.getElementById('game-controls'); if (!el) return;
    el.innerHTML = '<div class="grp">' + html + '</div>'; el.hidden = false;
    el.onpointerdown = el.onpointerup = el.onpointercancel = null;
    el.onclick = function (e) { var b = e.target.closest('[data-k]'); if (b && !b.disabled) on(b.dataset.k); };
    CM.gameUI.layout();
  }
  function unbar() { var el = document.getElementById('game-controls'); if (!el) return; el.hidden = true; el.innerHTML = ''; el.onclick = null; CM.gameUI.layout(); }
  function draw(ctx) {
    var on = !!ctx.x.sling, mine = ctx.state.turn === ctx.human && !ctx.over && !ctx.game.busy;
    bar(ctx, '<button type="button" class="gctl' + (on ? ' gctl--primary' : '') + '" data-k="sling" style="width:auto;padding:0 16px;font-weight:700;font-size:14px;display:flex;gap:8px;align-items:center"' + (mine ? '' : ' disabled') +
      '><img alt="" src="assets/modes/Ugw05nktuDM/slingshot.png" style="width:28px;height:28px">' + (on ? 'Slingshot ON' : 'Slingshot') + '</button>', function () {
      ctx.setX('sling', on ? 0 : 1); ctx.game.sel = -1; ctx.refresh(); draw(ctx);
    });
  }
  /* resolve a launch on a copy of the board; returns {b, end, off: [squares knocked off], lost} */
  function fly(V, b, f, d, pow) {
    var g = V.geo, pos = f, r = pow, P = b[f], off = [], lost = false;
    b[f] = null;
    while (r > 0) {
      var nx = g.step(pos, d[0], d[1]);
      if (nx < 0) { lost = true; break; }
      var q = b[nx];
      if (!q) { pos = nx; r--; continue; }
      var dq = V.def(q.t);
      if (q.c === P.c || dq.royal || dq.blocker || q.c === 'n') break;
      var qp = nx, rr = r - 1, gone = false;
      while (rr > 0) { var n2 = g.step(qp, d[0], d[1]); if (n2 < 0) { gone = true; break; } if (b[n2]) break; qp = n2; rr--; }
      if (gone) { b[nx] = null; off.push(nx); pos = nx; }
      else if (qp !== nx) { b[qp] = q; b[nx] = null; pos = nx; }
      break;
    }
    if (!lost) { var np = Object.assign({}, P, { m: 1 }); if (g.relRow(pos, np.c) === g.depth(np.c) - 1) np = Object.assign(np, { t: 'Q', promoted: 1 }); b[pos] = np; }
    return { b: b, end: lost ? -1 : pos, off: off, lost: lost };
  }
  CM.mode({
    id: 'Ugw05nktuDM',
    name: 'Launch Pawns',
    category: 'Powerups & Rule Twists',
    description: 'Turn on the Slingshot, tap a pawn, then tap a square in a straight line from it: the farther, the harder the launch. The pawn stops where it hits an enemy and knocks it onward; pieces knocked over the edge are gone. Kings never move, your own pieces stop the pawn, and too much power flings your pawn off the board.',
    how_to_win: 'Checkmate Stockfish. Knock its big pieces off the board.',
    player_side: 'white',
    opponent: { name: 'Stockfish', rating: 3600, avatar: 'assets/modes/U_irVoLjtNI/stockfish.png', tagline: 'Has never seen a slingshot.' },
    board: { files: 8, ranks: 8 },
    theme: { light: '#ead2ae', dark: '#ae7e66' },
    setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR', x: { sling: 0 } },
    bot: { engine: 'search', style: 'best', depth: 3, time_ms: 800 },
    sounds: { launch: 'assets/modes/Ugw05nktuDM/launch.wav' },
    hooks: {
      moves: function (V, st, out) {
        if (st.turn !== 'w' || !st.x.sling) return out;
        var g = V.geo;
        out = out.filter(function (m) { return m.p !== 'P' || m.drop; });
        for (var i = 0; i < st.b.length; i++) {
          var p = st.b[i]; if (!p || p.c !== 'w' || p.t !== 'P') continue;
          DIRS.forEach(function (d) { var j = i; for (var k = 1; k <= 7; k++) { j = g.step(j, d[0], d[1]); if (j < 0) break; out.push({ f: i, t: j, p: 'P', c: 'w', cap: null, launch: [d[0], d[1], k] }); } });
        }
        return out;
      },
      onMake: function (V, st, m, n) {
        n.x.sling = 0;
        if (!m.launch) return;
        var r = fly(V, st.b.slice(), m.f, [m.launch[0], m.launch[1]], m.launch[2]);
        n.b = r.b; n.half = 0; n.x.fly = { end: r.end, off: r.off, lost: r.lost };
      },
      afterMove: function (ctx, m) {
        draw(ctx);
        if (!m.launch) return null;
        var F = ctx.x.fly || {}; ctx.setX('fly', null);
        ctx.sound('launch');
        ctx.fx({ type: 'arrow', from: ctx.name(m.f), to: ctx.name(F.end >= 0 ? F.end : m.t), color: 'rgba(150,80,220,.85)', duration_ms: 800 });
        (F.off || []).forEach(function (i) { ctx.fx({ type: 'particles', kind: 'dust', at: i, count: 16 }); });
        if (F.off && F.off.length) ctx.toast('Knocked off the board!', 1500);
        else if (F.lost) ctx.toast('Way too much power: the pawn flew off the board.', 1800);
        return null;
      },
      onStart: function (ctx) { draw(ctx); },
      onTurn: function (ctx) { draw(ctx); },
      onUndo: function (ctx) { ctx.after(30, function () { draw(ctx); }); },
      onGameOver: function (ctx) { draw(ctx); },
      onExit: function () { unbar(); },
      status: function (ctx) { return ctx.x.sling ? 'Slingshot ready: tap a pawn, then a square in line with it (distance = power).' : 'Normal move, or turn on the Slingshot to launch a pawn.'; }
    },
    todo_pass2: ['drag-back aim line with power meter', 'sliding/collision animation of the launch'],
    source: { research: 'research/modes/Ugw05nktuDM.json', confidence: 'medium', notes: 'Discrete straight-line launch replaces the free physics.' }
  });
})();
