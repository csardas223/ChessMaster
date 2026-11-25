/* g5_shotgun: Shotgun King: The Final Checkmate. You are the lone black king with a shotgun against a white army
   whose pieces have HP (piece prop hp, shown as a badge). Your turn: step one square like a king (no capturing by
   moving; stepping reloads one shell), or FIRE: tap a white piece in one of the 8 lines within range with a clear
   line of sight. Damage by distance from the gun's fire table (Solomon [3, 2, 1, 1]); with spread the two squares
   beside the target also take 1 damage. Firing costs a shell. White moves one piece per turn by normal chess rules;
   you may never end your turn on an attacked square (standard check rules for Black), and being checkmated is death.
   Kill the White King to clear the floor; params.floors = [{ name, fen }] play in order.
   Pass 2 (run state, all in st.x so the bot's search sees it):
     x.ammo / x.max shells, x.range, x.fire (damage by distance), x.spread, x.souls (types) / x.slots
     Souls: killing a knight, bishop or rook with the gun stores its soul (if a slot is free); the king may then make one
       move like that piece (to an empty square), which uses the soul up.
     Between floors: pick one of two card pairs (your upgrade + a white buff), like the game. Hearts: params.hearts
       lives per run; losing a floor costs a heart and replays it. At the start of a run pick the gun (Solomon /
       Victoria) when params.guns is set.
   Art/sound: params.kingImg sprite for the S piece is set in the mode file; sounds 'blast' / 'reload' when the mode
   declares them. */
(function () {
  'use strict';
  var CM = window.CM, runs = {};
  var HP = { P: 2, N: 3, B: 3, R: 4, Q: 5, K: 6 };
  var D8 = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
  var SOUL = { N: [[1, 2], [2, 1], [-1, 2], [-2, 1], [1, -2], [2, -1], [-1, -2], [-2, -1]], B: [[1, 1], [1, -1], [-1, 1], [-1, -1]], R: [[1, 0], [-1, 0], [0, 1], [0, -1]] };
  var GUNS = {
    solomon: { name: 'Solomon', note: 'range 4, heavy close-range damage, pellet spread', range: 4, fire: [3, 2, 1, 1], spread: true, max: 2 },
    victoria: { name: 'Victoria', note: 'range 6, steady damage, tight shot, 3 shells', range: 6, fire: [2, 2, 2, 1, 1, 1], spread: false, max: 3 }
  };
  var CARDS = [
    { up: 'Holy Gunpowder: +1 damage at every range', down: 'Cardinal: a white pawn becomes a bishop', a: function (r) { r.fireBonus++; r.buffs.cardinal = (r.buffs.cardinal || 0) + 1; } },
    { up: 'Extra Barrel: +1 shell', down: 'Iron Rations: every white piece +1 HP', a: function (r) { r.maxBonus++; r.buffs.hp = (r.buffs.hp || 0) + 1; } },
    { up: 'Long Barrel: +1 fire range', down: 'Tower: white rooks +4 HP', a: function (r) { r.rangeBonus++; r.buffs.rookHp = (r.buffs.rookHp || 0) + 4; } },
    { up: 'Majestic Censer: +1 shell, +1 soul slot', down: 'Reinforcements: White gets an extra knight', a: function (r) { r.maxBonus++; r.slots++; r.buffs.knight = (r.buffs.knight || 0) + 1; } },
    { up: 'Soul Jar: start each floor with a knight soul', down: 'Royal Guard: the White King +3 HP', a: function (r) { r.startSoul = 'N'; r.buffs.kingHp = (r.buffs.kingHp || 0) + 3; } },
    { up: 'Wide Choke: the spread hits both sides for 2', down: 'Drill Sergeant: white pawns +1 HP', a: function (r) { r.spread2 = true; r.buffs.pawnHp = (r.buffs.pawnHp || 0) + 1; } }
  ];
  function prm(V) { return V.cfg.params || {}; }
  function hp(p, V) { var h = prm(V).hp || HP; return p.hp != null ? p.hp : (h[p.t] || 2); }
  function floors(ctx) { return ctx.params.floors || []; }
  function run(ctx) {
    var id = ctx.spec.id, P = ctx.params;
    if (!runs[id]) runs[id] = { floor: 0, hearts: P.hearts || 3, gun: P.gun || 'solomon', fireBonus: 0, maxBonus: 0, rangeBonus: 0, slots: 1, startSoul: null, spread2: false, buffs: {}, picked: !P.guns };
    return runs[id];
  }
  function css() {
    if (document.getElementById('g5-sk-css')) return;
    var s = document.createElement('style'); s.id = 'g5-sk-css';
    s.textContent = '.g5sk-threat{box-shadow:inset 0 0 0 3px rgba(200,40,40,.55)}' +
      '.g5sk-pick{position:fixed;inset:0;z-index:120;background:rgba(14,10,24,.82);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:16px;animation:g5skf .25s ease-out;font-family:ui-monospace,Menlo,monospace}' +
      '@keyframes g5skf{from{opacity:0}to{opacity:1}}.g5sk-pick h3{color:#f2e6ce;margin:0 0 4px;font-size:17px;text-align:center}' +
      '.g5sk-pick button{display:block;width:min(92vw,420px);text-align:left;background:#2b2238;border:3px solid #8b86b8;color:#f2e6ce;padding:10px 12px;font:600 14px/1.35 ui-monospace,Menlo,monospace;cursor:pointer;box-shadow:0 4px 0 #17111f}' +
      '.g5sk-pick button:hover{border-color:#f2c94c}.g5sk-pick .dn{display:block;color:#ff9a9a;margin-top:4px}.g5sk-pick .up{color:#9fe8a8}';
    document.head.appendChild(s);
  }
  function picker(title, opts, onPick) {
    css(); var old = document.querySelector('.g5sk-pick'); if (old) old.remove();
    var el = document.createElement('div'); el.className = 'g5sk-pick'; el.setAttribute('role', 'dialog');
    el.innerHTML = '<h3>' + CM.util.esc(title) + '</h3>' + opts.map(function (o, k) { return '<button type="button" data-k="' + k + '">' + o.html + '</button>'; }).join('');
    el.onclick = function (e) { var b = e.target.closest('[data-k]'); if (!b) return; el.remove(); onPick(+b.dataset.k); };
    document.body.appendChild(el);
  }
  CM.defineHooks('g5_shotgun', {
    setup: function (ctx) {
      var F = floors(ctx), R = run(ctx), k = Math.min(R.floor, F.length - 1), f = F[k], V = ctx.V, st = ctx.state, B = R.buffs;
      if (f) { st.b = CM.spec.parseSetup(V, f.fen); }
      var cards = B.cardinal || 0, knights = B.knight || 0;
      st.b = st.b.map(function (p, i) {
        if (!p) return p; var q = Object.assign({}, p);
        if (q.c === 'w' && q.t === 'P' && cards > 0) { q.t = 'B'; cards--; }
        if (q.c === 'w') { q.hp = hp(q, V) + (B.hp || 0) + (q.t === 'R' ? B.rookHp || 0 : 0) + (q.t === 'K' ? B.kingHp || 0 : 0) + (q.t === 'P' ? B.pawnHp || 0 : 0); }
        if (V.def(q.t).pawn && V.geo.relRow(i, q.c) !== 1) q.m = 1;
        return q;
      });
      for (var j = st.b.length - 1; j >= 0 && knights > 0; j--) if (!st.b[j] && V.geo.relRow(j, 'w') <= 1) { st.b[j] = { t: 'N', c: 'w', hp: hp({ t: 'N' }, V) + (B.hp || 0), m: 1 }; knights--; }
      var G = GUNS[R.gun] || GUNS.solomon, P = prm(V);
      var fire = (P.fire && R.gun === 'solomon' ? P.fire : G.fire).map(function (d) { return d + R.fireBonus; });
      var max = (R.gun === 'solomon' && P.ammo ? P.ammo : G.max) + R.maxBonus;
      st.turn = 'b'; st.x = Object.assign({}, st.x, { ammo: max, max: max, range: (R.gun === 'solomon' && P.range ? P.range : G.range) + R.rangeBonus, fire: fire, spread: G.spread ? (R.spread2 ? 2 : 1) : 0, souls: R.startSoul ? [R.startSoul] : [], slots: R.slots });
      st.start = {}; V.colors.forEach(function (c) { st.start[c + 'Royal'] = V.royals(st, c).length > 0; });
    },
    onStart: function (ctx) {
      var F = floors(ctx), R = run(ctx), k = Math.min(R.floor, F.length - 1);
      if (F[k]) ctx.toast('Floor ' + (k + 1) + '/' + F.length + ': ' + F[k].name + '  ·  hearts ' + R.hearts, 3000);
      if (!R.picked) {
        R.picked = true;
        picker('Choose your shotgun', Object.keys(GUNS).map(function (g) { return { html: '<b>' + GUNS[g].name + '</b><span class="dn" style="color:#cfc6e8">' + GUNS[g].note + '</span>' }; }), function (n) {
          R.gun = Object.keys(GUNS)[n]; ctx.toast(GUNS[R.gun].name + ' it is. Starting the floor.', 2000); ctx.game.newGame ? ctx.game.newGame() : null;
        });
      }
    },
    shotgun: function (V, st, i, p, out) {
      var g = V.geo, b = st.b, P = prm(V), x = st.x || {}, range = x.range || P.range || 4;
      D8.forEach(function (d) { var j = g.step(i, d[0], d[1]); if (j >= 0 && !b[j]) out.push({ f: i, t: j, p: p.t, c: p.c, cap: null }); });
      (x.souls || []).forEach(function (s, si) {
        if ((x.souls || []).indexOf(s) !== si) return;
        var D = SOUL[s] || [], slide = s !== 'N';
        D.forEach(function (d) { var j = i; for (var n = 0; n < (slide ? 8 : 1); n++) { j = g.step(j, d[0], d[1]); if (j < 0 || b[j]) break; if (g.dist(i, j) > 1 || !slide) out.push({ f: i, t: j, p: p.t, c: p.c, cap: null, soul: s }); } });
      });
      if ((x.ammo || 0) <= 0) return;
      D8.forEach(function (d) {
        var j = i;
        for (var s = 1; s <= range; s++) { j = g.step(j, d[0], d[1]); if (j < 0) break; var q = b[j]; if (!q) continue; if (q.c === 'w') out.push({ f: i, t: j, p: p.t, c: p.c, cap: q, capSq: j, shot: s, dx: d[0], dy: d[1] }); break; }
      });
    },
    onMake: function (V, st, m, n) {
      if (m.c !== 'b') return;
      var x = n.x = Object.assign({}, n.x), P = prm(V), max = st.x.max || P.ammo || 2;
      if (m.soul) { var sl = (st.x.souls || []).slice(); sl.splice(sl.indexOf(m.soul), 1); x.souls = sl; return; }
      if (!m.shot) { x.ammo = Math.min(max, (st.x.ammo || 0) + 1); return; }
      var g = V.geo, fire = st.x.fire || P.fire || [3, 2, 1, 1], dmg = fire[Math.min(fire.length - 1, m.shot - 1)];
      n.b[m.f] = st.b[m.f]; n.b[m.t] = null;
      var left = hp(m.cap, V) - dmg, killed = [];
      if (left > 0) n.b[m.t] = Object.assign({}, m.cap, { hp: left }); else killed.push(m.cap.t);
      /* spread: the two squares beside the target, perpendicular to the shot */
      var sp = st.x.spread == null ? 1 : st.x.spread;
      if (sp) [[m.dy, -m.dx], [-m.dy, m.dx]].forEach(function (s) {
        var j = g.step(m.t, s[0], s[1]); if (j < 0) return; var q = n.b[j]; if (!q || q.c !== 'w') return;
        var h = hp(q, V) - sp; if (h > 0) n.b[j] = Object.assign({}, q, { hp: h }); else { n.b[j] = null; killed.push(q.t); }
      });
      x.ammo = (st.x.ammo || 0) - 1;
      killed.forEach(function (t) { if (SOUL[t] && (x.souls || []).length < (x.slots || 1)) x.souls = (x.souls || []).concat([t]); });
    },
    checkWin: function (V, st) {
      if (!V.royals(st, 'w').length) return { w: 'b', why: 'the White King is dead: floor cleared' };
      return null;
    },
    evaluate: function (V, st) {
      var v = 0; for (var i = 0; i < st.b.length; i++) { var p = st.b[i]; if (p && p.c === 'w') v += 30 * hp(p, V); }
      return v - 20 * (st.x.ammo || 0) - 25 * ((st.x.souls || []).length);
    },
    afterMove: function (ctx, m, info) {
      var snd = ctx.spec.sounds || {};
      if (m.shot) {
        ctx.sound(snd.blast ? 'blast' : 'explosion');
        var g = ctx.V.geo, red = CM.settings.reducedMotion();
        ctx.fx({ type: 'arrow', from: m.f, to: m.t, color: 'rgba(255,207,90,.9)', width: 0.12, duration_ms: 260 });
        ctx.fx({ type: 'particles', kind: 'sparks', at: m.t, count: 16 });
        ctx.fx({ type: 'flash', color: '#ffd27a', opacity: 0.45, at: m.t, duration_ms: 260 });
        if (ctx.state.x.spread) [[m.dy, -m.dx], [-m.dy, m.dx]].forEach(function (s) { var j = g.step(m.t, s[0], s[1]); if (j >= 0) { ctx.fx({ type: 'arrow', from: m.f, to: j, color: 'rgba(255,207,90,.55)', width: 0.07, duration_ms: 240 }); ctx.fx({ type: 'particles', kind: 'sparks', at: j, count: 8 }); } });
        if (!red && ctx.params.shake !== false) ctx.fx({ type: 'shake', intensity: 3, duration_ms: 180 });
      } else if (info.by === 'player' && !m.soul && snd.reload) ctx.sound('reload');
      if (m.soul) ctx.fx({ type: 'particles', kind: 'glitch', at: m.t, count: 12 });
      return null;
    },
    decorate: function (ctx, sq, p) {
      var V = ctx.V, st = ctx.state, out = null;
      if (p && p.c === 'w') out = { badge: String(hp(p, V)) };
      if (!p && st.turn === 'b' && V.attacked(st, sq, 'w')) out = { cls: 'g5sk-threat' };
      return out;
    },
    init: function () { css(); },
    onExit: function () { var e = document.querySelector('.g5sk-pick'); if (e) e.remove(); },
    onGameOver: function (ctx, over) {
      var F = floors(ctx), R = run(ctx), k = R.floor, id = ctx.spec.id;
      if (over.w === ctx.human) {
        if (k >= F.length - 1) { delete runs[id]; ctx.toast('Every floor cleared: the throne is yours!', 3400); return; }
        R.floor = k + 1;
        var a = Math.floor(Math.random() * CARDS.length), b = (a + 1 + Math.floor(Math.random() * (CARDS.length - 1))) % CARDS.length;
        ctx.after(900, function () {
          picker('Floor ' + (k + 1) + ' cleared. Pick a card pair', [a, b].map(function (c) { return { html: '<span class="up">' + CARDS[c].up + '</span><span class="dn">' + CARDS[c].down + '</span>' }; }), function (n) {
            CARDS[[a, b][n]].a(R); ctx.toast('Card taken. New game starts floor ' + (R.floor + 1) + '.', 2600);
          });
        });
      } else if (over.w !== 'd') {
        R.hearts--;
        if (R.hearts > 0) ctx.toast('You lost a heart (' + R.hearts + ' left). New game replays floor ' + (k + 1) + '.', 3200);
        else { delete runs[id]; ctx.toast('No hearts left. The run starts over.', 3000); }
      }
    },
    status: function (ctx) {
      var F = floors(ctx), R = run(ctx), k = Math.min(R.floor, F.length - 1), x = ctx.state.x || {}, a = x.ammo || 0, max = x.max || ctx.params.ammo || 2;
      return 'Floor ' + (k + 1) + '/' + F.length + '  ·  ♥' + R.hearts + '  ·  Shells ' + '●'.repeat(a) + '○'.repeat(Math.max(0, max - a)) + ((x.souls || []).length ? '  ·  Soul: ' + x.souls.join(' ') : '') + '  ·  tap a white piece in line to fire';
    }
  });
})();
