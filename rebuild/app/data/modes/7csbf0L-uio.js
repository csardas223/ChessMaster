/* Chess, But I Can Use Portals. Chess vs Stockfish (3600); only you have Portal-gun portals: one blue and one orange,
   each placed on an EMPTY square. A white piece whose move ends on one portal comes straight out of the other (if that
   square is free), so 1.e4 can really be 1.d4 and a rook on b1 can be on h1 at once. Black pieces ignore portals.
   Placing or moving a portal is free and can be done any number of times on your turn.
   Sources: research/modes/7csbf0L-uio.json (transcript 00:01 "even if I do play E4, I'm actually playing D4... can't
   place portals on squares that have pieces", 02:34 rook b1 -> h1, 03:23 "Only I know", 04:15 portal on d2 then knight
   drop to e8), thumbnail colours #f0f4dd/#629045, glowing blue/orange frames.
   Inferred: placing portals costs no move; the exit must be empty (no capture through a portal); a pawn that exits on
   the last rank becomes a queen. */
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
  function draw(ctx) {
    var G = ctx.game, mine = ctx.state.turn === ctx.human && !ctx.over && !G.busy, P = ctx.x.portals;
    var b = function (k, label, img) { return '<button type="button" class="gctl' + (G._g1place === k ? ' gctl--primary' : '') + '" data-k="' + k + '" ' + BTN + (mine ? '' : ' disabled') + '><span style="width:20px;height:20px;border-radius:3px;background:' + img + '"></span>' + label + '</button>'; };
    bar(ctx, b('u', P.u >= 0 ? 'Move blue' : 'Place blue', '#2090f2') + b('o', P.o >= 0 ? 'Move orange' : 'Place orange', '#f3861d'), function (k) { G._g1place = G._g1place === k ? null : k; G.sel = -1; draw(ctx); G.render(); });
  }
  CM.mode({
    id: '7csbf0L-uio',
    name: 'Portals',
    category: 'Powerups & Rule Twists',
    description: 'You have a blue and an orange portal. Tap Place blue / Place orange, then an empty square (free, any time on your turn). A piece of yours that ends its move on one portal comes out of the other, if that square is empty. Stockfish has no portals.',
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
        if (ex < 0 || n.b[ex]) return;
        var p = n.b[m.t]; n.b[m.t] = null;
        if (V.def(p.t).pawn && V.geo.relRow(ex, 'w') === V.geo.depth('w') - 1) p = Object.assign({}, p, { t: 'Q', promoted: 1 });
        n.b[ex] = p; n.x.ported = [m.t, ex];
      },
      init: function (ctx) {
        var G = ctx.game; if (G._g1portal) return; G._g1portal = 1;
        var tap = G.onTap;
        G.onTap = function (i, o) {
          var k = G._g1place;
          if (k && !G.over && G.state.turn === G.human && !G.busy) {
            if (!G.state.b[i] && G.V.geo.valid[i]) {
              var P = Object.assign({}, G.state.x.portals), other = k === 'u' ? 'o' : 'u';
              if (P[other] === i) P[other] = -1;
              P[k] = i; ctx.setX('portals', P); G._g1place = null;
              ctx.fx({ type: 'flash', at: i, color: k === 'u' ? '#2f8cff' : '#ff8a1f', opacity: 0.6, duration_ms: 400 }); ctx.sound('portal');
              ctx.refresh(); draw(ctx); return;
            }
            CM.sound.play('illegal'); ctx.toast('Portals go on empty squares only.', 1400); return;
          }
          return tap.call(G, i, o);
        };
      },
      onStart: function (ctx) { ctx.game._g1place = null; draw(ctx); },
      onTurn: function (ctx) { draw(ctx); },
      afterMove: function (ctx, m) {
        var pt = ctx.x.ported; draw(ctx);
        if (!pt || m.c !== ctx.human) return null;
        ctx.setX('ported', null);
        ctx.fx({ type: 'flash', at: pt[0], color: '#2f8cff', opacity: 0.55, duration_ms: 350 });
        ctx.fx({ type: 'flash', at: pt[1], color: '#ff8a1f', opacity: 0.55, duration_ms: 450 });
        ctx.sound('portal');
        return null;
      },
      onUndo: function (ctx) { ctx.after(30, function () { draw(ctx); }); },
      onGameOver: function (ctx) { draw(ctx); },
      onExit: function () { unbar(); },
      decorate: function (ctx, sq) {
        var P = ctx.x.portals, k = sq === P.u ? 'blue' : sq === P.o ? 'orange' : null;
        if (!k) return null;
        return { html: '<span class="sq-tint" style="background:' + (k === 'blue' ? '#2090f2' : '#f3861d') + '"></span>' };   /* colours sampled from the video frame */
      },
      status: function (ctx) { var G = ctx.game; if (G._g1place) return 'Tap an empty square for the ' + (G._g1place === 'u' ? 'blue' : 'orange') + ' portal.'; var P = ctx.x.portals; return P.u >= 0 && P.o >= 0 ? 'Portals linked: ' + ctx.name(P.u) + ' <-> ' + ctx.name(P.o) + '.' : 'Place both portals to link them.'; }
    },
    todo_pass2: [],
    source: { research: 'research/modes/7csbf0L-uio.json', confidence: 'medium', notes: 'Free placement, empty exit only, auto-queen on portal exit (inferred).' }
  });
})();
