/* g1_secretq: shared hooks for the Secret Queen videos (I_TbJqRHtf4, JPDYufARCQU, U_irVoLjtNI).
   Rules (research/modes/I_TbJqRHtf4.json transcript 01:43, U_irVoLjtNI 0:01-0:21):
   * one pawn per side (params.botSecret false: only yours) is secretly a queen: it moves like a pawn OR like a queen;
   * it stays hidden (looks like a pawn) until it gives check, promotes, or makes a move a pawn cannot make; then it
     is revealed and becomes an ordinary queen;
   * you pick yours by tapping a pawn before your first move (params.choose 'tap'), or a wheel picks it
     (params.choose 'wheel');
   * the opponent does not know which pawn is yours: the bot searches "blind" (your secret pawn has only pawn moves
     in its search), while it knows its own.
   Pieces carry sq: 1 while secret. Rule hooks are pure; blindness is a flag on the Variant set only while botPick
   runs its own search. */
(function () {
  'use strict';
  function queenMoves(V, st, i, probing) {
    var b = st.b, p = b[i], out = [];
    b[i] = { t: 'Q', c: p.c, m: 1 }; V.genPiece(st, i, out, true); b[i] = p;
    if (!probing) out.forEach(function (m) { m.sqm = 1; });
    return out;
  }
  function counts(V, st, p) { return p && p.sq && p.t === 'P' && !(V._g1blind && p.c !== V._g1bot); }
  function enemyRoyalHit(V, st, c) {
    for (var i = 0; i < st.b.length; i++) {
      var p = st.b[i]; if (!p || p.c !== c || !p.sq) continue;
      var qm = queenMoves(V, st, i, true);
      for (var k = 0; k < qm.length; k++) if (qm[k].cap && V.def(qm[k].cap.t).royal) return i;
    }
    return -1;
  }
  function wait(ctx, ms) { return new Promise(function (r) { ctx.after(ms, r); }); }
  function mySecret(ctx) { return ctx.pieces(function (p) { return p.sq && p.c === ctx.human; })[0]; }
  function pickBot(ctx) {
    var pw = ctx.pieces(function (p) { return p.t === 'P' && p.c === ctx.bot; });
    if (pw.length) ctx.transform(ctx.pick(pw), { props: { sq: 1 } });
  }
  function chooseHuman(ctx, i) {
    ctx.transform(i, { props: { sq: 1 } }); ctx.setX('choosing', false);
    ctx.fx({ type: 'piece_transform', at: i, style: 'flash', color: '#9b59d0' });
    ctx.sound('notify'); ctx.toast('Your secret queen is the ' + ctx.name(i) + ' pawn. Only you can see the star.', 2200);
    ctx.refresh();
  }
  function wheel(ctx) {
    var pw = ctx.pieces(function (p) { return p.t === 'P' && p.c === ctx.human; });
    var ex = (ctx.params.exclude || []).map(function (n) { return ctx.sq(n); });
    var pool = pw.filter(function (i) { return ex.indexOf(i) < 0; }); if (!pool.length) pool = pw;
    var pick = ctx.pick(pool), cols = ['#e74c3c', '#e67e22', '#f1c40f', '#2ecc71', '#1abc9c', '#3498db', '#9b59b6', '#e84393'];
    var n = pool.length, seg = 360 / n, k = pool.indexOf(pick), rot = 360 * 4 + (360 - (k * seg + seg / 2));
    var parts = pool.map(function (sq, j) {
      var a0 = (j * seg - 90) * Math.PI / 180, a1 = ((j + 1) * seg - 90) * Math.PI / 180, r = 46, am = ((j + 0.5) * seg - 90) * Math.PI / 180;
      var d = 'M50 50L' + (50 + r * Math.cos(a0)).toFixed(2) + ' ' + (50 + r * Math.sin(a0)).toFixed(2) + 'A46 46 0 ' + (seg > 180 ? 1 : 0) + ' 1 ' + (50 + r * Math.cos(a1)).toFixed(2) + ' ' + (50 + r * Math.sin(a1)).toFixed(2) + 'Z';
      return '<path d="' + d + '" fill="' + cols[j % 8] + '" stroke="#fff" stroke-width=".8"/><text x="' + (50 + 31 * Math.cos(am)).toFixed(1) + '" y="' + (52 + 31 * Math.sin(am)).toFixed(1) + '" font-size="8" font-weight="700" text-anchor="middle" fill="#fff" font-family="Arial">' + ctx.name(sq) + '</text>';
    }).join('');
    var reduced = CM.settings.reducedMotion && CM.settings.reducedMotion();
    var id = 'g1w' + Date.now();
    var html = '<div style="display:grid;place-items:center;gap:6px;padding:12px;border-radius:14px;background:rgba(20,18,16,.78)">' +
      '<div style="position:relative;width:180px;height:180px"><svg id="' + id + '" viewBox="0 0 100 100" width="180" height="180" style="transition:transform ' + (reduced ? 300 : 2600) + 'ms cubic-bezier(.17,.67,.2,1)">' + parts + '<circle cx="50" cy="50" r="6" fill="#fff"/></svg>' +
      '<div style="position:absolute;left:50%;top:-4px;transform:translateX(-50%);width:0;height:0;border-left:9px solid transparent;border-right:9px solid transparent;border-top:16px solid #fff"></div></div>' +
      '<div style="color:#fff;font:600 14px system-ui">Spinning for your secret queen…</div></div>';
    ctx.fx({ type: 'overlay', at: 'board', html: html, duration_ms: reduced ? 1400 : 3600, fade_ms: 200, id: 'g1wheel' });
    ctx.after(60, function () { var el = document.getElementById(id); if (el) el.style.transform = 'rotate(' + rot + 'deg)'; });
    ctx.after(reduced ? 900 : 3000, function () { chooseHuman(ctx, pick); });
  }
  CM.defineHooks('g1_secretq', {
    init: function (ctx) {
      ctx.V._g1bot = ctx.bot;
      var G = ctx.game; if (G._g1sqTap) return; G._g1sqTap = 1;
      var tap = G.onTap;
      G.onTap = function (i, o) {
        if (ctx.x.choosing && !ctx.over && (ctx.params.choose || 'tap') === 'tap') {
          var p = ctx.at(i);
          if (p && p.t === 'P' && p.c === ctx.human) { chooseHuman(ctx, i); return; }
          ctx.toast('Tap one of your pawns to make it your secret queen.', 1600); return;
        }
        return tap.call(G, i, o);
      };
    },
    setup: function (ctx) {
      ctx.setX('choosing', true);
      if (ctx.params.botSecret !== false) pickBot(ctx);
      if ((ctx.params.choose || 'tap') === 'wheel') wheel(ctx);
      else ctx.after(300, function () { ctx.toast('Tap the pawn that will secretly be your queen.', 2600); });
    },
    beforeMove: function (ctx) { if (ctx.x.choosing) { ctx.toast((ctx.params.choose || 'tap') === 'tap' ? 'First tap the pawn that will be your secret queen.' : 'Wait for the wheel.', 1500); return false; } },
    /* the secret pawn also moves like a queen (pawn moves keep priority, so they do not reveal it) */
    moves: function (V, st, out) {
      for (var i = 0; i < st.b.length; i++) {
        var p = st.b[i]; if (!p || p.c !== st.turn || !counts(V, st, p)) continue;
        var seen = {}; out.forEach(function (m) { if (m.f === i) seen[m.t] = 1; });
        queenMoves(V, st, i).forEach(function (m) { if (!seen[m.t]) out.push(m); });
      }
      return out;
    },
    attacks: function (V, st, sq, by) {
      for (var i = 0; i < st.b.length; i++) {
        var p = st.b[i]; if (!p || p.c !== by || !counts(V, st, p) || i === sq) continue;
        var saved = st.b[sq]; if (!saved) st.b[sq] = { t: '?', c: '?', m: 1, probe: 1 };
        var qm = queenMoves(V, st, i, true); st.b[sq] = saved;
        for (var k = 0; k < qm.length; k++) if (qm[k].t === sq) return true;
      }
      return false;
    },
    /* reveal: a queen-only move, a promotion, or giving check */
    onMake: function (V, st, m, n) {
      var p = n.b[m.t];
      if (p && p.sq && (m.sqm || m.promo)) { n.b[m.t] = Object.assign({}, p, { t: m.promo || 'Q', sq: 0, revealed: 1 }); return; }
      if (V._g1blind) return;
      var hit = enemyRoyalHit(V, n, m.c);
      if (hit >= 0) n.b[hit] = Object.assign({}, n.b[hit], { t: 'Q', sq: 0, revealed: 1 });
    },
    /* the bot does not know which of your pawns is the queen: search again with it treated as a pawn */
    botPick: function (ctx, ranked) {
      var V = ctx.V, cfg = ctx.spec.bot || {}, st = ctx.state, moves = ranked.map(function (r) { return r.m; });
      V._g1blind = 1;
      var L;
      try { L = new CM.Search(V, {}).rank(st, { moves: moves, maxDepth: cfg.blind_depth || 3, timeMs: cfg.blind_ms || 700 }); }
      finally { V._g1blind = 0; }
      var elo = ctx.opponent.rating || 1600;
      var pick = cfg.style === 'best' ? L[0] : CM.bot.pickByStrength(L, CM.bot.eloStrength(elo));
      return pick ? pick.m : ranked[0].m;
    },
    afterMove: function (ctx, m, info) {
      var p = ctx.at(m.t);
      if (p && p.revealed && !p.shown) {
        ctx.transform(m.t, { props: { shown: 1 } });
        ctx.fx({ type: 'piece_transform', at: m.t, style: 'gold' });
        ctx.fx({ type: 'flash', at: m.t, color: '#b26fe0', opacity: 0.5, duration_ms: 500 });
        ctx.toast((m.c === ctx.human ? 'Your' : (ctx.opponent.name || 'The opponent') + '\'s') + ' secret queen is revealed!', 1800);
      }
      ctx.pieces(function (q) { return q.revealed && !q.shown; }).forEach(function (i) { ctx.transform(i, { props: { shown: 1 } }); ctx.fx({ type: 'piece_transform', at: i, style: 'gold' }); ctx.toast('A secret queen gave check and is revealed!', 1800); });
      return null;
    },
    decorate: function (ctx, sq, p) {
      if (!p || !p.sq) return null;
      if (p.c === ctx.human || ctx.over) return { html: '<span style="position:absolute;right:4%;top:3%;width:32%;height:32%;z-index:3;pointer-events:none;background:url(\'assets/modes/I_TbJqRHtf4/star.svg\') center/contain no-repeat"></span>' };
      return null;
    },
    status: function (ctx) {
      if (ctx.x.choosing) return (ctx.params.choose || 'tap') === 'tap' ? 'Tap a pawn to make it your secret queen.' : 'The wheel picks your secret queen.';
      var s = mySecret(ctx); return s != null ? 'Your secret queen: the pawn on ' + ctx.name(s) + '.' : 'Your secret queen is revealed or gone.';
    }
  });
})();
