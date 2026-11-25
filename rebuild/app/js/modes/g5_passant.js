/* g5_passant: Passant (Steam chess roguelike) rules for the "Slip and Push" run.
   Badges (player's pieces only, params.badges):
     slippy: a moved piece slides one extra square in its direction if that square is empty; off the edge = lost
             (the king never slips off the board)
             (jumping pieces, i.e. knights, and castling do not slip)
     push:   a non-capturing move pushes every adjacent piece (not kings) one square away if there is room;
             a piece pushed over the edge falls off the board
   Victory (any one, params-free): capture the enemy king (you may move into check), capture every enemy piece
   except the king, check the enemy king 6 turns in a row, or lead by +7 material for two of your turns in a row.
   Rounds: params.rounds = [{ name, fen, boss }] played one after another (win a round -> New game starts the next).
   g5 2026-11-25 (art pass 6, frame OO3XlFQ32i0 17:58 + transcript 16:21-17:50):
     boss 'Cracked Vase' (round 3): "When your pieces take, they become unstable": a player piece that captures gets
             prop un:1 and a floating "Unstable" label; an unstable piece "has a one in three chance to destroy itself
             when capturing any future piece" (not on plain moves). The 1/3 is a deterministic hash of the move and a
             capture counter so the bot's search stays deterministic. Kings are left out (inferred: no frame shows it).
     last-move trail: the squares the moved piece left (origin, and the landing square it slipped on from) show the
             video's pink arrow (assets/modes/OO3XlFQ32i0/arrow.png, cut from the frame) pointing along the move, and
             the moved piece stands in a pink ring (#ffdcf5, dark outline), as in the frame. */
(function () {
  'use strict';
  var CM = window.CM, pos = {};
  var VAL = { P: 1, N: 3, B: 3, R: 5, Q: 9, K: 0 };
  function mat(V, b, c) { var s = 0; for (var i = 0; i < b.length; i++) { var p = b[i]; if (p && p.c === c) s += VAL[p.t] != null ? VAL[p.t] : Math.round(V.def(p.t).value / 100); } return s; }
  function sgn(x) { return x > 0 ? 1 : x < 0 ? -1 : 0; }
  function rounds(ctx) { return ctx.params.rounds || []; }
  /* look copied from the video's stills (impl-5, 7th session): pink move dots (#e55f80 sampled from the frame), the
     selected piece turns red inside a white box, captures leave a smoke puff (mode vfx_timeline) */
  var CSS = '.m-passant .sq.is-target::after{background:radial-gradient(circle,#f27d9a 0,#e55f80 60%,#c94a6c 100%);width:30%;height:30%}' +
    '.m-passant .sq.is-target-cap::after{background:radial-gradient(transparent 0,transparent 74%,#e55f80 76%)}' +
    '.m-passant .sq.is-sel::before{background:transparent;box-shadow:inset 0 0 0 3px #fff}' +
    '.m-passant .sq.is-sel .pc{filter:sepia(1) saturate(7) hue-rotate(-40deg) brightness(.85)}' +
    '.m-passant .g5ps-arrow{position:absolute;left:22%;top:22%;width:56%;height:56%;pointer-events:none;z-index:0}' +
    '.m-passant .g5ps-ring{position:absolute;left:14%;right:14%;bottom:6%;height:34%;border-radius:50%;border:4px solid #ffdcf5;' +
      'box-shadow:0 0 0 1.5px #3a2a33,inset 0 0 0 1.5px #3a2a33;pointer-events:none;z-index:0}' +
    '.m-passant .sq .pc{position:relative;z-index:1}' +
    '.m-passant .g5ps-un{position:absolute;left:50%;top:-4%;transform:translateX(-50%);font:700 11px/1 system-ui,sans-serif;color:#fff;' +
      'text-shadow:0 1px 2px #000,0 0 3px #000;white-space:nowrap;pointer-events:none;z-index:3}';
  var ARROW = 'assets/modes/OO3XlFQ32i0/arrow.png';
  function look(on) {
    if (on && !document.getElementById('g5-passant-css')) { var el = document.createElement('style'); el.id = 'g5-passant-css'; el.textContent = CSS; document.head.appendChild(el); }
    document.body.classList.toggle('m-passant', !!on);
  }
  CM.defineHooks('g5_passant', {
    onExit: function () { look(false); },
    onTurn: function (ctx, c) { if (c === ctx.human && !ctx.over && ctx.ply > 0) ctx.fx({ type: 'text', text: 'Player Turn', at: 'board', color: '#ffffff', size: 30, duration_ms: 800 }); },
    setup: function (ctx) {
      look(true);
      var R = rounds(ctx), k = Math.min(pos[ctx.spec.id] || 0, R.length - 1), r = R[k]; if (!r) return;
      var V = ctx.V, st = ctx.state; st.b = CM.spec.parseSetup(V, r.fen);
      st.b.forEach(function (p, i) { if (p && V.def(p.t).pawn && V.geo.relRow(i, p.c) !== 1) st.b[i] = Object.assign({}, p, { m: 1 }); });
      st.start = {}; V.colors.forEach(function (c) { st.start[c + 'Royal'] = V.royals(st, c).length > 0; });
      st.x = Object.assign({}, st.x, { boss: r.boss || null, caps: 0, trail: null, shattered: null });
    },
    afterMove: function (ctx, m) {
      var x = ctx.state.x || {};
      if (x.shattered != null && m && m.cap) { ctx.fx({ type: 'particles', kind: 'dust', at: x.shattered, count: 18 }); ctx.toast('Unstable: your piece shattered as it took!', 2000); }
      return null;
    },
    decorate: function (ctx, sq, p) {
      var x = ctx.state.x || {}, t = x.trail, h = '', cls = '';
      if (t && t.sq.indexOf(sq) >= 0 && (t.dc || t.dr)) {
        var dc = t.dc, dr = t.dr; if (ctx.game && ctx.game.flipped && ctx.game.flipped()) { dc = -dc; dr = -dr; }
        var deg = Math.round(Math.atan2(dr, dc) * 180 / Math.PI) - 90;
        h += '<img class="g5ps-arrow" src="' + ARROW + '" alt="" draggable="false" style="rotate:' + deg + 'deg">';
      }
      if (t && t.to === sq && p) h += '<span class="g5ps-ring"></span>';
      if (p && p.un) h += '<span class="g5ps-un">Unstable</span>';
      return h || cls ? { html: h, cls: cls } : null;
    },
    onStart: function (ctx) { var R = rounds(ctx), k = Math.min(pos[ctx.spec.id] || 0, R.length - 1); if (R[k]) ctx.toast('Round ' + (k + 1) + '/' + R.length + ': ' + R[k].name + (R[k].boss ? '. Boss Round: ' + R[k].boss + ' (your pieces become Unstable when they take)' : ''), 3400); },
    onMake: function (V, st, m, n) {
      var me = st.turn, badges = (V.cfg.params || {}).badges || {}, g = V.geo, b = n.b;
      var human = (V.cfg.params || {}).human || 'w', at = m.t, sx = st.x || {};
      n.x = Object.assign({}, n.x);
      if (me === human && m.cap && sx.boss === 'Cracked Vase' && b[m.t] && b[m.t].t !== 'K') {
        var mover = st.b[m.f], k = (sx.caps || 0) + 1; n.x.caps = k;
        if (mover && mover.un && (m.f * 31 + m.t * 17 + k * 7) % 3 === 0) { b[m.t] = null; at = -1; n.x.shattered = m.t; }   /* 1 in 3: it destroys itself */
        else { b[m.t] = Object.assign({}, b[m.t], { un: 1 }); n.x.shattered = null; }
      } else n.x.shattered = null;
      if (me === human && !m.drop && !m.castle && at >= 0) {
        var dc = g.col(m.t) - g.col(m.f), dr = g.row(m.t) - g.row(m.f);
        var jump = m.p === 'N' || (Math.abs(dc) && Math.abs(dr) && Math.abs(dc) !== Math.abs(dr));
        if (badges.slippy && !jump && (dc || dr)) {
          var nx = g.step(at, sgn(dc), sgn(dr));
          if ((nx === -1 || nx === -2) && b[at].t !== 'K') { b[at] = null; at = -1; n.x = Object.assign({}, n.x, { slipped: (n.x.slipped || 0) + 1 }); }
          else if (nx >= 0 && !b[nx]) { b[nx] = b[at]; b[at] = null; at = nx; }
        }
        if (badges.push && !m.cap && at >= 0) {
          for (var ox = -1; ox <= 1; ox++) for (var oy = -1; oy <= 1; oy++) {
            if (!ox && !oy) continue; var s = g.step(at, ox, oy); if (s < 0) continue; var q = b[s];
            if (!q || q.t === 'K' || V.def(q.t).blocker) continue;
            var d = g.step(s, ox, oy);
            if (d === -1 || d === -2) b[s] = null; else if (!b[d]) { b[d] = q; b[s] = null; }
          }
        }
      }
      /* last-move trail (pink arrows on the squares left behind, ring on the piece) */
      if (!m.drop) {
        var tdc = sgn(g.col(m.t) - g.col(m.f)), tdr = sgn(g.row(m.t) - g.row(m.f)), tr = [m.f];
        if (at !== m.t) tr.push(m.t);
        n.x.trail = { sq: tr, dc: tdc, dr: tdr, to: at };
      } else n.x.trail = { sq: [], to: m.t };
      /* victory counters, from the mover's view */
      var E = me === 'w' ? 'b' : 'w', x = n.x, ek = V.royals(n, E)[0];
      var chk = ek != null && V.attacked(n, ek, me);
      x['chk_' + me] = chk ? (st.x['chk_' + me] || 0) + 1 : 0;
      x['lead_' + me] = mat(V, b, me) - mat(V, b, E) >= 7 ? (st.x['lead_' + me] || 0) + 1 : 0;
    },
    checkWin: function (V, st) {
      var cs = ['w', 'b'];
      for (var k = 0; k < 2; k++) {
        var c = cs[k], E = cs[1 - k];
        if (!V.royals(st, E).length) return { w: c, why: 'the king was captured' };
        var others = 0; for (var i = 0; i < st.b.length; i++) { var p = st.b[i]; if (p && p.c === E && p.t !== 'K') others++; }
        if (!others) return { w: c, why: 'every piece but the king was captured' };
        if ((st.x['chk_' + c] || 0) >= 6) return { w: c, why: 'six checks in a row' };
        if ((st.x['lead_' + c] || 0) >= 2) return { w: c, why: '+7 material for two turns' };
      }
      return null;
    },
    onGameOver: function (ctx, over) {
      var id = ctx.spec.id, R = rounds(ctx), k = pos[id] || 0;
      if (over.w === ctx.human) { pos[id] = k < R.length - 1 ? k + 1 : 0; ctx.toast(k < R.length - 1 ? 'Round cleared! +$8. New game starts round ' + (k + 2) + '.' : 'Level 1 cleared!', 3200); }
    },
    status: function (ctx) {
      var R = rounds(ctx), k = Math.min(pos[ctx.spec.id] || 0, R.length - 1), x = ctx.state.x, h = ctx.human;
      return 'Round ' + (k + 1) + '/' + R.length + '  ·  checks in a row ' + (x['chk_' + h] || 0) + '/6  ·  +7 lead ' + (x['lead_' + h] || 0) + '/2';
    }
  });
})();
