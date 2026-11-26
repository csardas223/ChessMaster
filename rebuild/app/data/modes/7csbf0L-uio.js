/* Chess, But I Can Use Portals. Chess vs Stockfish (3600); only you have Portal-gun portals: one blue and one orange,
   each placed on an EMPTY square. A white piece whose move ends on one portal comes straight out of the other (if that
   square is free), so 1.e4 can really be 1.d4 and a rook on b1 can be on h1 at once. Black pieces ignore portals.
   Placing or moving a portal is free and can be done any number of times on your turn.
   Sources: research/modes/7csbf0L-uio.json (transcript 00:01 "even if I do play E4, I'm actually playing D4... can't
   place portals on squares that have pieces", 02:34 rook b1 -> h1, 03:23 "Only I know", 04:15 portal on d2 then knight
   drop to e8), thumbnail colours #f0f4dd/#629045, glowing blue/orange frames.
   Inferred: placing portals costs no move; a pawn that exits on the last rank becomes a queen. Teleporting into an
   enemy captures it (the reference site does the same) except the king, which is never pulled through.
   Site rule (iwantcheckmate.com/challenges/portal-chess JS, read 2026-11-26): portals are single-use. After a piece
   goes through, BOTH portals are gone (a 1 s linear fade in the portal colours) and you place new ones. Portal colours
   are the site's: blue #168cff, orange #ff8a18. */
(function () {
  function bar(ctx, html, on) {
    var el = document.getElementById('game-controls'); if (!el) return;
    el.innerHTML = '<div class="grp">' + html + '</div>'; el.hidden = false;
    el.onpointerdown = el.onpointerup = el.onpointercancel = null;
    el.onclick = function (e) { var b = e.target.closest('[data-k]'); if (b && !b.disabled) on(b.dataset.k); };
    CM.gameUI.layout();
  }
  function unbar() { var el = document.getElementById('game-controls'); if (!el) return; el.hidden = true; el.innerHTML = ''; el.onclick = null; CM.gameUI.layout(); }
  var BTN = 'style="width:auto;padding:0 14px;font-weight:700;font-size:13px;display:flex;gap:6px;align-items:center"';
  /* place/move one portal; free action, empty squares only (the site's double-click and double-right-click gestures) */
  function placeAt(ctx, k, i) {
    var G = ctx.game;
    if (i < 0 || !G.V.geo.valid[i] || G.state.b[i]) { CM.sound.play('illegal'); ctx.toast('Portals go on empty squares only.', 1400); return false; }
    var P = Object.assign({}, G.state.x.portals), other = k === 'u' ? 'o' : 'u';
    if (P[other] === i) P[other] = -1;
    P[k] = i; ctx.setX('portals', P); G._g1place = null; G.sel = -1;
    ctx.fx({ type: 'flash', at: i, color: k === 'u' ? '#168cff' : '#ff8a18', opacity: 0.6, duration_ms: 400 });
    ctx.sound('portal'); ctx.refresh(); draw(ctx);
    return true;
  }
  function draw(ctx) {
    var G = ctx.game, mine = ctx.state.turn === ctx.human && !ctx.over && !G.busy, P = ctx.x.portals;
    var b = function (k, label, img) { return '<button type="button" class="gctl' + (G._g1place === k ? ' gctl--primary' : '') + '" data-k="' + k + '" ' + BTN + (mine ? '' : ' disabled') + '><span style="width:20px;height:20px;border-radius:3px;background:' + img + '"></span>' + label + '</button>'; };
    bar(ctx, b('u', P.u >= 0 ? 'Move blue' : 'Place blue', '#168cff') + b('o', P.o >= 0 ? 'Move orange' : 'Place orange', '#ff8a18'), function (k) { G._g1place = G._g1place === k ? null : k; G.sel = -1; draw(ctx); G.render(); });
  }
  CM.mode({
    id: '7csbf0L-uio',
    name: 'Portals',
    category: 'Powerups & Rule Twists',
    description: 'You have a blue and an orange portal. Double-tap an empty square for blue, double-right-click one for orange (or use the Place buttons); placement is free, any time on your turn. A piece of yours that ends its move on one portal comes out of the other, capturing an enemy there; a king cannot be pulled through, and a pawn that exits on the last rank queens. Portals are single-use: after a piece goes through, both close and you place new ones. Stockfish has no portals.',
    how_to_win: 'Checkmate Stockfish. Use the portals to land pieces next to its king.',
    player_side: 'white',
    player: { name: 'You', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },   /* iwantcheckmate's own avatar (purple king) from the videos */
    opponent: { name: 'Stockfish', rating: 3600, avatar: 'assets/modes/U_irVoLjtNI/stockfish.png', tagline: 'Has never played Portal 2.' },
    board: { files: 8, ranks: 8 },
    theme: { light: '#f0f4dd', dark: '#629045' },
    setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR', x: { portals: { u: -1, o: -1 } } },
    bot: { engine: 'search', style: 'best', depth: 3, time_ms: 800 },
    sounds: { portal: 'assets/modes/7csbf0L-uio/portal.wav' },
    hooks: {
      onMake: function (V, st, m, n) {
        if (m.c !== 'w' || m.drop) return;
        var P = st.x.portals, ex = m.t === P.u ? P.o : m.t === P.o ? P.u : -1;
        if (ex < 0) return;
        /* the other portal may hold an enemy: it is captured on the way out, except the king (the reference site
           refuses to pull a king through). Your own piece blocks the exit. */
        var victim = n.b[ex];
        if (victim && (victim.c === 'w' || V.def(victim.t).royal)) return;
        var p = n.b[m.t]; if (!p) return;
        n.b[m.t] = null; if (victim) n.b[ex] = null;
        if (V.def(p.t).pawn && V.geo.relRow(ex, 'w') === V.geo.depth('w') - 1) p = Object.assign({}, p, { t: 'Q', promoted: 1 });
        n.b[ex] = p; n.x.ported = [m.t, ex]; n.x.portedCap = victim ? victim.t : null;
        n.x.portedCol = m.t === P.u ? ['#168cff', '#ff8a18'] : ['#ff8a18', '#168cff'];
        n.x.portals = { u: -1, o: -1 };   /* single-use: both portals close after a teleport (site rule) */
      },
      init: function (ctx) {
        var G = ctx.game; if (G._g1portal) return; G._g1portal = 1;
        var tap = G.onTap;
        G.onTap = function (i, o) {
          var k = G._g1place;
          if (k && !G.over && G.state.turn === G.human && !G.busy) { placeAt(ctx, k, i); return; }
          return tap.call(G, i, o);
        };
      },
      /* double-click an empty square: blue portal; double right-click: orange portal (the reference site's controls) */
      canDoubleTap: function (ctx, sq) { return !ctx.over && !ctx.busy && ctx.state.turn === ctx.human && ctx.game.sel < 0 && ctx.geo.valid[sq] && !ctx.state.b[sq]; },
      doubleTap: function (ctx, sq) { return placeAt(ctx, 'u', sq); },
      doubleRightTap: function (ctx, sq) { return placeAt(ctx, 'o', sq); },
      /* a white piece that can step onto one portal also attacks the square behind the other one (same rule as the
         other portal mode), so check and checkmate are detected through the portal */
      attacks: function (V, st, sq, by) {
        var P = st.x.portals; if (by !== 'w' || !P || P.u < 0 || P.o < 0) return false;
        var A = sq === P.u ? P.o : sq === P.o ? P.u : -1;
        if (A < 0 || st.b[A]) return false;
        for (var i = 0; i < st.b.length; i++) {
          var p = st.b[i]; if (!p || p.c !== 'w' || V.def(p.t).pawn) continue;
          var out = []; V.genPiece(st, i, out, true);
          for (var k = 0; k < out.length; k++) if (out[k].t === A && !out[k].cap) return true;
        }
        return false;
      },
      onStart: function (ctx) { ctx.game._g1place = null; draw(ctx); },
      onTurn: function (ctx) { draw(ctx); },
      afterMove: function (ctx, m) {
        var pt = ctx.x.ported; draw(ctx);
        if (!pt || m.c !== ctx.human) return null;
        ctx.setX('ported', null); ctx.setX('portedCol', null);
        /* the closed portals fade out over 1 s (site: .portal-fade-overlay, 1s linear 1 -> 0); entry/exit colours as placed */
        var cu = ctx.x.portedCol || ['#168cff', '#ff8a18'];
        ctx.fx({ type: 'pulse', at: pt[0], color: cu[0], peak: 1, shape: 'fade', duration_ms: 1000, under: true });
        ctx.fx({ type: 'pulse', at: pt[1], color: cu[1], peak: 1, shape: 'fade', duration_ms: 1000, under: true });
        ctx.sound('portal');
        return null;
      },
      onUndo: function (ctx) { ctx.after(30, function () { draw(ctx); }); },
      onGameOver: function (ctx) { draw(ctx); },
      onExit: function () { unbar(); },
      decorate: function (ctx, sq) {
        var P = ctx.x.portals, k = sq === P.u ? 'blue' : sq === P.o ? 'orange' : null;
        if (!k) return null;
        return { html: '<span class="sq-tint" style="background:' + (k === 'blue' ? '#168cff' : '#ff8a18') + '"></span>' };   /* the site's portal colours */
      },
      status: function (ctx) { var G = ctx.game; if (G._g1place) return 'Tap an empty square for the ' + (G._g1place === 'u' ? 'blue' : 'orange') + ' portal.'; var P = ctx.x.portals; return P.u >= 0 && P.o >= 0 ? 'Portals linked: ' + ctx.name(P.u) + ' <-> ' + ctx.name(P.o) + '.' : 'Double-tap an empty square for blue, double-right-click for orange.'; }
    },
    source: { research: 'research/modes/7csbf0L-uio.json', confidence: 'medium', notes: 'Free placement, single-use portals (site rule: both close after a teleport), auto-queen on portal exit (inferred; the site offers a promotion menu).' }
  });
})();
