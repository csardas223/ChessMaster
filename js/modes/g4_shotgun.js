/* g4_shotgun: Shotgun King: The Final Checkmate (group 4: AvZiSnngZjA, 9j7h5kF4X9s "RANK 4").
   You are the lone black King with a shotgun; the white army is led by the White King. Each turn either step one
   square (onto an empty square only: the King cannot capture by moving) or fire: tap any white piece within range to
   shoot a cone of pellets toward it. Every white piece inside the cone (up to params.range squares, about 27 degrees
   either side of the aim) takes damage: firepower at distance 1-2, firepower - 1 further out (min 1). Pieces have HP
   (pawn 1, knight/bishop 2, rook 3, queen 4, king 4). A shot uses one shell; a step reloads one shell.
   White moves one piece per turn by normal chess rules and captures you if you end a turn on a square it attacks
   (threatened squares next to you are marked "!"). Kill the White King to clear the floor; floors get bigger armies;
   after each floor you get an upgrade card and White gets a curse card. Clear params.floors floors to win the run.
   State x: { sh: shells, max: max shells, fp: firepower, rg: range, arc: firing arc in degrees, floor }.  Rule hooks are
   deterministic.
   PASS 2 (impl-4, 8th session; art from the stills via tools/g4_pass2.py): the player's king is the game's navy pixel king
   (tutorial still), the board keeps the game's cream/lavender tiles, floors have holes (navy gaps, more on later floors)
   as in the FLOOR 6 still, the side panel copies the game's HUD (shotgun + red shells row, FLOOR counter, POWER / RANGE /
   F.ARC stats; the stills show F.ARC 55 and 44 degrees) and its two card columns (left: your cards, right: the white
   army's curse cards) with the card faces cut from the stills. After each floor a draft overlay offers 2 of your card
   faces + shows the curse White draws. The card faces' effects are inferred (the stills show only the art). While the
   king is selected, hovering a target paints the red aim cone; every shot flashes the cone and a muzzle flash.
   White army sprites are not visible in any still: they keep the standard set. Sounds are the app's own. */
(function () {
  'use strict';
  var CM = window.CM;
  var HP = { P: 1, N: 2, B: 2, R: 3, Q: 4, K: 4 };
  var D8 = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
  function hp(p) { return p.hp != null ? p.hp : (HP[p.t] || 1); }
  /* squares hit by a shot from `from` aimed at `aim` */
  function cone(g, from, aim, range, arc) {
    var half = ((arc || 55) / 2) * Math.PI / 180;
    var fc = g.col(from), fr = g.row(from), ax = g.col(aim) - fc, ay = g.row(aim) - fr, al = Math.atan2(ay, ax), out = [];
    for (var j = 0; j < g.size; j++) {
      if (j === from || !g.valid[j]) continue;
      var dx = g.col(j) - fc, dy = g.row(j) - fr, d = Math.max(Math.abs(dx), Math.abs(dy)); if (d > range) continue;
      var a = Math.atan2(dy, dx) - al; while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI;
      if (Math.abs(a) <= half + 1e-9) out.push({ sq: j, d: d });
    }
    return out;
  }
  var H = {
    skKing: function (V, st, i, p, out) {
      var g = V.geo, x = st.x || {};
      if (p.c !== 'b') { /* the White King moves like a normal king */
        D8.forEach(function (d) { var j = g.step(i, d[0], d[1]); if (j < 0) return; var q = st.b[j]; if (!q) out.push({ f: i, t: j, p: p.t, c: p.c, cap: null }); else if (q.c !== p.c && V.canCapture(p, q)) out.push({ f: i, t: j, p: p.t, c: p.c, cap: q, capSq: j }); });
        return;
      }
      D8.forEach(function (d) { var j = g.step(i, d[0], d[1]); if (j >= 0 && !st.b[j]) out.push({ f: i, t: j, p: p.t, c: p.c, cap: null }); });
      if (!(x.sh > 0)) return;
      var rg = x.rg || 3;
      for (var j = 0; j < st.b.length; j++) {
        var q = st.b[j]; if (!q || q.c !== 'w' || q.probe) continue;
        if (g.dist(i, j) > rg) continue;
        out.push({ f: i, t: j, p: p.t, c: p.c, cap: null, shoot: 1 });
      }
    },
    onMake: function (V, st, m, n) {
      var x = n.x = Object.assign({}, st.x);
      if (m.c !== 'b') return;
      if (!m.shoot) { x.sh = Math.min(x.max || 2, (x.sh || 0) + 1); return; }
      var g = V.geo, b = n.b; b[m.f] = st.b[m.f]; b[m.t] = st.b[m.t];
      x.sh = (x.sh || 0) - 1;
      cone(g, m.f, m.t, x.rg || 3, x.arc).forEach(function (h) {
        var q = b[h.sq]; if (!q || q.c !== 'w') return;
        var dmg = h.d <= 2 ? (x.fp || 2) : Math.max(1, (x.fp || 2) - 1), left = hp(q) - dmg;
        b[h.sq] = left > 0 ? Object.assign({}, q, { hp: left }) : null;
      });
    },
    evaluate: function (V, st) { var s = 0; st.b.forEach(function (p) { if (p && p.c === 'w') s += hp(p) * 40; }); return s; },

    /* ---- game hooks ---- */
    setup: function (ctx) {
      ctx.game._sk = { floor: 1, cards: [], curses: [], aim: -1, flash: null }; load(ctx, { sh: 2, max: 2, fp: 2, rg: 3, arc: 55 });
      document.body.classList.add('m-sk'); panel(ctx); aimer(ctx);
    },
    onExit: function () { document.body.classList.remove('m-sk'); ['.g4sk-panel', '.g4sk-draft'].forEach(function (q) { var e = document.querySelector(q); if (e) e.remove(); }); },
    onTurn: function (ctx) { panel(ctx); },
    afterMove: function (ctx, m, info) {
      var z = ctx.game._sk, st = ctx.state;
      if (m.shoot) {
        var x0 = st.x || {}; z.flash = cone(ctx.geo, m.f, m.t, x0.rg || 3, x0.arc).map(function (h) { return h.sq; });
        ctx.fx({ type: 'flash', at: ctx.name(m.f), color: '#ffe9a8', duration_ms: 220 });  /* muzzle flash */
        ctx.fx({ type: 'particles', kind: 'sparks', at: ctx.name(m.t), count: 26, duration_ms: 500 }); ctx.sound('explosion');
        ctx.after(380, function () { z.flash = null; ctx.game.render(); });
      }
      panel(ctx);
      var wk = st.b.some(function (p) { return p && p.c === 'w' && p.t === 'K'; });
      if (!wk && info.by === 'player') {
        if (z.floor >= ctx.params.floors) return;
        var x = Object.assign({}, st.x);
        return draft(ctx).then(function (card) {
          card.apply(x); z.cards.push(card); z.curses.push(CURSES[(z.floor - 1) % CURSES.length]); z.floor++;
          load(ctx, x); panel(ctx); ctx.refresh();
        });
      }
    },
    decorate: function (ctx, sq, p) {
      var st = ctx.state, g = ctx.geo, me = -1, z = ctx.game._sk;
      if (p && p.c === 'b' && p.t === 'K') return { img: KING };
      var hot = z && (z.flash || z.coneSq); if (hot && hot.indexOf(sq) >= 0) return { cls: 'g4sk-cone' + (p && p.c === 'w' && hp(p) > 1 ? '' : ''), html: p && p.c === 'w' && hp(p) > 1 ? '<span class="g4sk-hp">' + hp(p) + '</span>' : '' };
      for (var i = 0; i < st.b.length; i++) if (st.b[i] && st.b[i].c === 'b' && st.b[i].t === 'K') { me = i; break; }
      if (p && p.c === 'w') { var h = hp(p); if (h > 1) return { html: '<span class="g4sk-hp">' + h + '</span>' }; return null; }
      if (me >= 0 && !p && g.dist(me, sq) === 1 && ctx.V.attacked(st, sq, 'w')) return { cls: 'g4sk-threat', html: '<span class="g4sk-bang">!</span>' };
      return null;
    },
    status: function (ctx) {
      var x = ctx.state.x || {}, z = ctx.game._sk; if (!z || ctx.over) return null;
      return 'FLOOR ' + z.floor + '/' + ctx.params.floors + ' · shells ' + (x.sh || 0) + '/' + (x.max || 2) + ' · power ' + x.fp + ' · range ' + x.rg + ' · arc ' + (x.arc || 55) + '\u00b0';
    },
    init: function () {
      if (document.getElementById('g4sk-css')) return;
      var c = document.createElement('style'); c.id = 'g4sk-css';
      c.textContent = '.g4sk-hp{position:absolute;right:4%;bottom:3%;font:700 11px/1 system-ui;color:#fff;background:#b33;border-radius:6px;padding:1px 4px;z-index:3;pointer-events:none}' +
        '.g4sk-bang{position:absolute;inset:0;display:grid;place-items:center;font:900 22px/1 system-ui;color:#e03a3a;pointer-events:none}.g4sk-threat{box-shadow:inset 0 0 0 999px rgba(224,58,58,.16)}' +
        '.g4sk-cone{box-shadow:inset 0 0 0 999px rgba(216,32,76,.45)}' +
        '.m-sk #board .sq:has(.blk--wall){background:#1d2140!important;box-shadow:none}.m-sk .blk--wall{display:none}' +
        '.g4sk-panel{background:#1d2140;color:#b9b3e0;font:700 13px/1.25 ui-monospace,Menlo,monospace;padding:10px;border-radius:8px;margin-bottom:10px;letter-spacing:.04em}' +
        '.g4sk-top{display:flex;align-items:center;gap:10px;margin-bottom:6px}.g4sk-top img{width:64px;image-rendering:pixelated}.g4sk-floor{color:#b9b3e0}.g4sk-floor b{color:#d8204c}' +
        '.g4sk-pips{display:flex;gap:3px;margin:2px 0 8px}.g4sk-pips i{width:7px;height:14px;background:#3a3f6e}.g4sk-pips i.on{background:#d8204c}' +
        '.g4sk-cols{display:grid;grid-template-columns:1fr auto 1fr;gap:8px;align-items:start}.g4sk-cards{display:grid;grid-template-columns:repeat(2,40px);gap:4px}.g4sk-cards img,.g4sk-cards i{width:40px;height:53px;border:1px dashed #3a3f6e;border-radius:3px;display:block;image-rendering:pixelated}.g4sk-cards img{border:0}' +
        '.g4sk-stats{text-align:center;font-size:11px}.g4sk-stats b{display:block;color:#e8e2ff;font-size:13px;margin-bottom:6px}' +
        '.g4sk-draft{position:absolute;inset:0;z-index:30;background:rgba(17,19,42,.88);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;color:#e8e2ff;font:700 14px/1.2 ui-monospace,Menlo,monospace;text-align:center;padding:8px}' +
        '.g4sk-draft .row{display:flex;gap:12px;justify-content:center}.g4sk-draft button{background:none;border:2px solid #b9b3e0;border-radius:6px;padding:4px;color:#e8e2ff;font:inherit;font-size:11px;width:104px;cursor:pointer}.g4sk-draft button img,.g4sk-draft .curse img{width:80px;image-rendering:pixelated;display:block;margin:0 auto 4px}.g4sk-draft .curse{font-size:11px;color:#d8204c;width:104px}';
      document.head.appendChild(c);
    }
  };
  var A = 'assets/modes/9j7h5kF4X9s/', KING = 'assets/modes/AvZiSnngZjA/king_b.png';
  /* card faces cut from the stills; their effects are inferred (only the art is visible) */
  var CARDS = [
    { img: 'card_u4', name: '+1 shell', apply: function (x) { x.max++; x.sh = x.max; } },
    { img: 'card_u0', name: '+1 power', apply: function (x) { x.fp++; } },
    { img: 'card_u1', name: '+1 range', apply: function (x) { x.rg++; } },
    { img: 'card_u2', name: 'Full reload', apply: function (x) { x.sh = x.max; } },
    { img: 'card_u3', name: 'Wider arc (+10\u00b0)', apply: function (x) { x.arc = (x.arc || 55) + 10; } },
    { img: 'card_u5', name: '+1 power', apply: function (x) { x.fp++; } },
    { img: 'card_u6', name: '+1 shell', apply: function (x) { x.max++; x.sh = x.max; } },
    { img: 'card_u7', name: '+1 range', apply: function (x) { x.rg++; } }
  ];
  var CURSES = ['card_c0', 'card_c1', 'card_c2', 'card_c3', 'card_c4', 'card_c5', 'card_c6'];
  function panel(ctx) {
    if (typeof document === 'undefined') return; var side = document.getElementById('side'), z = ctx.game._sk; if (!side || !z) return;
    var el = side.querySelector('.g4sk-panel'); if (!el) { el = document.createElement('div'); el.className = 'g4sk-panel'; side.insertBefore(el, side.firstChild); }
    var x = ctx.state.x || {}, pips = ''; for (var i = 0; i < (x.max || 2); i++) pips += '<i class="' + (i < (x.sh || 0) ? 'on' : '') + '"></i>';
    function col(list) { var h = ''; for (var k = 0; k < 6; k++) h += list[k] ? '<img alt="" src="' + A + list[k] + '.png">' : '<i></i>'; return '<div class="g4sk-cards">' + h + '</div>'; }
    el.innerHTML = '<div class="g4sk-top"><img alt="" src="' + A + 'hud.png"><span class="g4sk-floor">FLOOR: <b>' + z.floor + '</b></span></div><div class="g4sk-pips">' + pips + '</div>' +
      '<div class="g4sk-cols">' + col(z.cards.map(function (c) { return c.img; })) + '<div class="g4sk-stats">POWER<b>' + (x.fp || 2) + '</b>RANGE<b>' + (x.rg || 3) + '</b>F.ARC<b>' + (x.arc || 55) + '\u00b0</b></div>' + col(z.curses) + '</div>';
  }
  function draft(ctx) {
    return new Promise(function (res) {
      var wrap = document.getElementById('board-wrap'), z = ctx.game._sk;
      var a = CARDS[(z.floor * 3) % CARDS.length], b = CARDS[(z.floor * 3 + 1) % CARDS.length], curse = CURSES[(z.floor - 1) % CURSES.length];
      if (!wrap) { res(a); return; }
      var d = document.createElement('div'); d.className = 'g4sk-draft';
      d.innerHTML = '<div>FLOOR ' + z.floor + ' CLEARED</div><div>PICK A CARD</div><div class="row"><button type="button" data-k="0"><img alt="" src="' + A + a.img + '.png">' + a.name + '</button><button type="button" data-k="1"><img alt="" src="' + A + b.img + '.png">' + b.name + '</button></div>' +
        '<div class="curse"><img alt="" src="' + A + curse + '.png">White draws a curse: +1 piece</div>';
      d.addEventListener('click', function (e) { var t = e.target.closest('button'); if (!t) return; d.remove(); res(t.dataset.k === '1' ? b : a); });
      wrap.appendChild(d);
    });
  }
  /* red aim cone while the king is selected and a target is hovered */
  function aimer(ctx) {
    var bd = document.getElementById('board'); if (!bd || bd._g4sk) return; bd._g4sk = 1;
    bd.addEventListener('pointermove', function (e) {
      var G = CM.app && CM.app.current, z = G && G._sk; if (!z) return;
      var q = e.target.closest && e.target.closest('.sq'), t = q && q.dataset.i != null ? +q.dataset.i : -1, sel = G.sel, cs = null;
      if (sel >= 0 && t >= 0 && G.state.b[sel] && G.state.b[sel].t === 'K' && G.state.b[sel].c === 'b' && G.moves.some(function (m) { return m.f === sel && m.t === t && m.shoot; })) {
        var x = G.state.x || {}; cs = cone(G.V.geo, sel, t, x.rg || 3, x.arc).map(function (h) { return h.sq; });
      }
      if (String(cs) !== String(z.coneSq)) { z.coneSq = cs; G.render(); }
    });
    bd.addEventListener('pointerleave', function () { var G = CM.app && CM.app.current, z = G && G._sk; if (z && z.coneSq) { z.coneSq = null; G.render(); } });
  }
  function army(n, rank) {
    var list = ['K']; var pawns = Math.min(8, 3 + n + (rank >= 4 ? 1 : 0));
    for (var i = 0; i < pawns; i++) list.push('P');
    if (n >= 1) list.push('R');           /* floor 1 already has an extra rook */
    if (n >= 2) list.push('N');
    if (n >= 3) list.push('B');
    if (n >= 5) list.push('N');
    if (n >= 6) list.push('Q');
    if (n >= 8) list.push('B');
    if (n >= 10) list.push('R');
    for (var c = 1; c < n; c++) list.push(['P', 'N', 'P', 'B', 'P', 'R', 'P'][(c - 1) % 7]); /* one curse piece per cleared floor */
    return list.slice(0, 22);
  }
  function load(ctx, x) {
    var z = ctx.game._sk, V = ctx.V, g = V.geo, list = army(z.floor, ctx.params.rank || 1);
    var st = CM.spec.initialState(V, Object.assign({}, ctx.spec, { setup: { fen: '4k3/8/8/8/8/8/8/8', turn: 'b' } }));
    var free = []; for (var i = 0; i < g.size; i++) if (g.rank(i) <= 3 && g.valid[i]) free.push(i);
    var k = g.parse('e1'); st.b[k] = V.piece('K', 'w', { m: 1 }); free.splice(free.indexOf(k), 1);
    list.slice(1).forEach(function (t) {
      var pool = free.filter(function (s) { return t === 'P' ? g.rank(s) >= 2 : true; }); if (!pool.length) return;
      var s = pool[Math.floor(Math.random() * pool.length)]; st.b[s] = V.piece(t, 'w', { m: 1 }); free.splice(free.indexOf(s), 1);
    });
    /* holes in the floor (navy gaps as in the FLOOR 6 still): more on later floors, never next to the king or on rank 1 */
    var bk = g.parse('e8'), holes = Math.min(9, z.floor + 1), spots = [];
    for (var j = 0; j < g.size; j++) if (g.valid[j] && !st.b[j] && g.rank(j) >= 3 && g.rank(j) <= 7 && g.dist(j, bk) > 1) spots.push(j);
    for (var h = 0; h < holes && spots.length; h++) { var w = Math.floor(Math.random() * spots.length); st.b[spots[w]] = V.piece('#', 'n'); spots.splice(w, 1); }
    st.x = Object.assign({ arc: 55 }, x, { sh: Math.max(x.sh || 0, 1), floor: z.floor });
    ctx.state = st;
  }
  CM.defineHooks('g4_shotgun', H);
})();
