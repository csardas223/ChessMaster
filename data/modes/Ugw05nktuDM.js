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
  /* drag-back slingshot (the reference site's control): the release point is the pull, so the pawn flies the OPPOSITE
     way with power = pull length in squares (1-7). Snapped to the eight straight lines the rules support. */
  function snapDir(dx, dy) {
    var best = DIRS[0], bd = -2;
    DIRS.forEach(function (d) { var len = Math.hypot(d[0], d[1]), dot = (dx * d[0] + dy * d[1]) / len; if (dot > bd) { bd = dot; best = d; } });
    return best;
  }
  function dragLaunch(ctx, from, dx, dy) {
    var G = ctx.game;
    if (!G || G.state.turn !== G.human || G.busy) return null;
    var dir = snapDir(-dx, -dy), power = Math.max(0, Math.min(7, Math.round(Math.hypot(dx, dy))));
    for (var p = Math.max(1, power); p >= 1; p--) {
      var m = G.moves.filter(function (x) { return x.f === from && x.launch && x.launch[0] === dir[0] && x.launch[1] === dir[1] && x.launch[2] === p; })[0];
      if (m) return m;
    }
    return null;
  }
  /* resolve a launch on a copy of the board; returns {b, end, off: [squares knocked off], lost} */
  function fly(V, b, f, d, pow) {
    var g = V.geo, pos = f, r = pow, P = b[f], off = [], knock = [], lost = false;
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
      else if (qp !== nx) { b[qp] = q; b[nx] = null; pos = nx; knock.push([nx, qp]); }
      break;
    }
    if (!lost) { var np = Object.assign({}, P, { m: 1 }); if (g.relRow(pos, np.c) === g.depth(np.c) - 1) np = Object.assign(np, { t: 'Q', promoted: 1 }); b[pos] = np; }
    return { b: b, end: lost ? -1 : pos, off: off, knock: knock, lost: lost };
  }
  CM.mode({
    id: 'Ugw05nktuDM',
    name: 'Launch Pawns',
    category: 'Powerups & Rule Twists',
    description: 'Turn on the Slingshot, then drag a pawn backwards and release: it fires the opposite way, as far as you pulled. (You can also tap a pawn, then a numbered square.) The pawn stops where it hits an enemy and knocks it onward; pieces knocked over the edge are gone. Kings never move, your own pieces stop the pawn, and too much power flings your pawn off the board.',
    how_to_win: 'Checkmate Stockfish. Knock its big pieces off the board.',
    player_side: 'white',
    player: { name: 'You', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },   /* iwantcheckmate's own avatar (purple king) from the videos */
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
        n.b = r.b; n.half = 0; n.x.fly = { end: r.end, off: r.off, knock: r.knock, lost: r.lost };
      },
      afterMove: function (ctx, m) {
        draw(ctx);
        if (!m.launch) return null;
        var F = ctx.x.fly || {}; ctx.setX('fly', null);
        ctx.sound('launch');
        ctx.fx({ type: 'arrow', from: ctx.name(m.f), to: ctx.name(F.end >= 0 ? F.end : m.t), color: 'rgba(150,80,220,.85)', duration_ms: 800 });
        /* collision: the hit piece slides on with the leftover power (purple path, as the video draws launches) */
        (F.knock || []).forEach(function (k) { ctx.after(260, function () { ctx.fx({ type: 'particles', kind: 'dust', at: k[0], count: 10 }); ctx.fx({ type: 'arrow', from: ctx.name(k[0]), to: ctx.name(k[1]), color: 'rgba(150,80,220,.85)', duration_ms: 800 }); }); });
        (F.off || []).forEach(function (i) { ctx.fx({ type: 'particles', kind: 'dust', at: i, count: 16 }); });
        if (F.off && F.off.length) ctx.toast('Knocked off the board!', 1500);
        else if (F.lost) ctx.toast('Way too much power: the pawn flew off the board.', 1800);
        return null;
      },
      /* aim + power meter: with the slingshot on and a pawn picked, every target square shows its launch power (1-7),
         shaded stronger with power, and the square where the pawn would stop gets a ring */
      decorate: function (ctx, sq) {
        var G = ctx.game; if (!ctx.x.sling || G.sel < 0 || ctx.over || !G.moves) return null;
        var m = null; for (var k = 0; k < G.moves.length; k++) if (G.moves[k].f === G.sel && G.moves[k].t === sq && G.moves[k].launch) { m = G.moves[k]; break; }
        if (!m) return null;
        var pow = m.launch[2], r = fly(ctx.V, ctx.state.b.slice(), m.f, [m.launch[0], m.launch[1]], pow), stop = r.end === sq;
        return { html: '<span class="sq-tint" style="background:rgba(150,80,220,' + (0.12 + pow * 0.07).toFixed(2) + ');' + (stop ? 'box-shadow:inset 0 0 0 3px rgba(150,80,220,.95);' : '') + '"></span>' +
          '<span style="position:absolute;right:3px;bottom:2px;font:700 12px/1 var(--font,sans-serif);color:#fff;text-shadow:0 1px 2px rgba(0,0,0,.7);pointer-events:none">' + pow + '</span>' };
      },
      onStart: function (ctx) { draw(ctx); },
      onTurn: function (ctx) { draw(ctx); },
      onUndo: function (ctx) { ctx.after(30, function () { draw(ctx); }); },
      onGameOver: function (ctx) { draw(ctx); },
      onExit: function () { unbar(); },
      /* drag a pawn backwards = launch it the other way (power = how far you pulled) */
      drop: function (ctx, from, to, info) {
        if (!ctx.x.sling || !info || info.dx == null) return false;
        var p = ctx.at(from);
        if (!p || p.c !== ctx.human || p.t !== 'P') return false;
        var m = dragLaunch(ctx, from, info.dx, info.dy);
        if (!m) { CM.sound.play('illegal'); return false; }
        ctx.game.commit(m, { dragged: true });
        return true;
      },
      status: function (ctx) { return ctx.x.sling ? 'Slingshot ready: drag a pawn backwards and release (pull farther to fire harder).' : 'Normal move, or turn on the Slingshot to launch a pawn.'; }
    },
    source: { research: 'research/modes/Ugw05nktuDM.json', confidence: 'medium', notes: 'Discrete straight-line launch replaces the free physics.' }
  });
})();
