/* g5_shotgun: Shotgun King: The Final Checkmate. You are the lone black king with a shotgun against a white army
   whose pieces have HP (piece prop hp, shown as a badge). Your turn: step one square like a king (no capturing by
   moving; stepping reloads one shell), or FIRE: tap a white piece in one of the 8 lines within params.range with a
   clear line of sight. Damage = params.fire (by distance: [3, 2, 1, 1] at 1..4 squares); the spread also hits the two
   squares beside the target (1 damage each). Firing costs a shell (params.ammo max). White moves one piece per turn
   by normal chess rules; you may never end your turn on an attacked square (standard check rules for Black), and
   being checkmated is death. Kill the White King to clear the floor; params.floors = [{ name, fen }] play in order. */
(function () {
  'use strict';
  var CM = window.CM, pos = {};
  var HP = { P: 2, N: 3, B: 3, R: 4, Q: 5, K: 6 };
  var D8 = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
  function prm(V) { return V.cfg.params || {}; }
  function hp(p, V) { var h = prm(V).hp || HP; return p.hp != null ? p.hp : (h[p.t] || 2); }
  function floors(ctx) { return ctx.params.floors || []; }
  CM.defineHooks('g5_shotgun', {
    setup: function (ctx) {
      var F = floors(ctx), k = Math.min(pos[ctx.spec.id] || 0, F.length - 1), f = F[k], V = ctx.V, st = ctx.state;
      if (f) { st.b = CM.spec.parseSetup(V, f.fen); }
      st.b = st.b.map(function (p, i) { if (!p) return p; var q = Object.assign({}, p); if (q.c === 'w') q.hp = hp(q, V); if (V.def(q.t).pawn && V.geo.relRow(i, q.c) !== 1) q.m = 1; return q; });
      st.turn = 'b'; st.x = Object.assign({}, st.x, { ammo: prm(V).ammo || 2 });
      st.start = {}; V.colors.forEach(function (c) { st.start[c + 'Royal'] = V.royals(st, c).length > 0; });
    },
    onStart: function (ctx) { var F = floors(ctx), k = Math.min(pos[ctx.spec.id] || 0, F.length - 1); if (F[k]) ctx.toast('Floor ' + (k + 1) + '/' + F.length + ': ' + F[k].name, 3000); },
    shotgun: function (V, st, i, p, out) {
      var g = V.geo, b = st.b, P = prm(V), range = P.range || 4;
      D8.forEach(function (d) { var j = g.step(i, d[0], d[1]); if (j >= 0 && !b[j]) out.push({ f: i, t: j, p: p.t, c: p.c, cap: null }); });
      if ((st.x.ammo || 0) <= 0) return;
      D8.forEach(function (d) {
        var j = i;
        for (var s = 1; s <= range; s++) { j = g.step(j, d[0], d[1]); if (j < 0) break; var q = b[j]; if (!q) continue; if (q.c === 'w') out.push({ f: i, t: j, p: p.t, c: p.c, cap: q, capSq: j, shot: s, dx: d[0], dy: d[1] }); break; }
      });
    },
    onMake: function (V, st, m, n) {
      if (m.c !== 'b') return;
      var x = n.x = Object.assign({}, n.x), P = prm(V), max = P.ammo || 2;
      if (!m.shot) { x.ammo = Math.min(max, (st.x.ammo || 0) + 1); return; }
      var g = V.geo, fire = P.fire || [3, 2, 1, 1], dmg = fire[Math.min(fire.length - 1, m.shot - 1)];
      n.b[m.f] = st.b[m.f]; n.b[m.t] = null;
      var left = hp(m.cap, V) - dmg; if (left > 0) n.b[m.t] = Object.assign({}, m.cap, { hp: left });
      /* spread: the two squares beside the target, perpendicular to the shot */
      [[m.dy, -m.dx], [-m.dy, m.dx]].forEach(function (s) {
        var j = g.step(m.t, s[0], s[1]); if (j < 0) return; var q = n.b[j]; if (!q || q.c !== 'w') return;
        var h = hp(q, V) - 1; n.b[j] = h > 0 ? Object.assign({}, q, { hp: h }) : null;
      });
      x.ammo = (st.x.ammo || 0) - 1;
    },
    checkWin: function (V, st) {
      if (!V.royals(st, 'w').length) return { w: 'b', why: 'the White King is dead: floor cleared' };
      return null;
    },
    evaluate: function (V, st) {
      var v = 0; for (var i = 0; i < st.b.length; i++) { var p = st.b[i]; if (p && p.c === 'w') v += 30 * hp(p, V); }
      return v - 20 * (st.x.ammo || 0);
    },
    afterMove: function (ctx, m) {
      if (m.shot) { ctx.sound('explosion'); ctx.fx({ type: 'flash', color: '#ffd27a', opacity: 0.45, at: m.t, duration_ms: 260 }); if (!CM.settings.reducedMotion() && ctx.params.shake !== false) ctx.fx({ type: 'shake', intensity: 3, duration_ms: 180 }); }
      return null;
    },
    decorate: function (ctx, sq, p) {
      var V = ctx.V, st = ctx.state, out = null;
      if (p && p.c === 'w') out = { badge: String(hp(p, V)) };
      if (!p && st.turn === 'b' && V.attacked(st, sq, 'w')) out = { cls: 'g5sk-threat' };
      return out;
    },
    init: function () { if (!document.getElementById('g5-sk-css')) { var s = document.createElement('style'); s.id = 'g5-sk-css'; s.textContent = '.g5sk-threat{box-shadow:inset 0 0 0 3px rgba(200,40,40,.55)}'; document.head.appendChild(s); } },
    onGameOver: function (ctx, over) {
      var id = ctx.spec.id, F = floors(ctx), k = pos[id] || 0;
      if (over.w === ctx.human) { pos[id] = k < F.length - 1 ? k + 1 : 0; ctx.toast(k < F.length - 1 ? 'Floor cleared! New game starts floor ' + (k + 2) + '.' : 'Every floor cleared: the throne is yours!', 3400); }
    },
    status: function (ctx) {
      var F = floors(ctx), k = Math.min(pos[ctx.spec.id] || 0, F.length - 1), a = ctx.state.x.ammo || 0, max = ctx.params.ammo || 2;
      return 'Floor ' + (k + 1) + '/' + F.length + '  ·  Shells ' + '●'.repeat(a) + '○'.repeat(Math.max(0, max - a)) + '  ·  tap a white piece in line to fire';
    }
  });
})();
