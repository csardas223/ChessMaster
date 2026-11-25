/* g4_shotgun: Shotgun King: The Final Checkmate (group 4: AvZiSnngZjA, 9j7h5kF4X9s "RANK 4").
   You are the lone black King with a shotgun; the white army is led by the White King. Each turn either step one
   square (onto an empty square only: the King cannot capture by moving) or fire: tap any white piece within range to
   shoot a cone of pellets toward it. Every white piece inside the cone (up to params.range squares, about 27 degrees
   either side of the aim) takes damage: firepower at distance 1-2, firepower - 1 further out (min 1). Pieces have HP
   (pawn 1, knight/bishop 2, rook 3, queen 4, king 4). A shot uses one shell; a step reloads one shell.
   White moves one piece per turn by normal chess rules and captures you if you end a turn on a square it attacks
   (threatened squares next to you are marked "!"). Kill the White King to clear the floor; floors get bigger armies;
   after each floor you get an upgrade card and White gets a curse card. Clear params.floors floors to win the run.
   State x: { sh: shells, max: max shells, fp: firepower, rg: range, floor }.  Rule hooks are deterministic. */
(function () {
  'use strict';
  var CM = window.CM;
  var HP = { P: 1, N: 2, B: 2, R: 3, Q: 4, K: 4 };
  var D8 = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
  function hp(p) { return p.hp != null ? p.hp : (HP[p.t] || 1); }
  /* squares hit by a shot from `from` aimed at `aim` */
  function cone(g, from, aim, range) {
    var fc = g.col(from), fr = g.row(from), ax = g.col(aim) - fc, ay = g.row(aim) - fr, al = Math.atan2(ay, ax), out = [];
    for (var j = 0; j < g.size; j++) {
      if (j === from || !g.valid[j]) continue;
      var dx = g.col(j) - fc, dy = g.row(j) - fr, d = Math.max(Math.abs(dx), Math.abs(dy)); if (d > range) continue;
      var a = Math.atan2(dy, dx) - al; while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI;
      if (Math.abs(a) <= 0.48) out.push({ sq: j, d: d });
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
      cone(g, m.f, m.t, x.rg || 3).forEach(function (h) {
        var q = b[h.sq]; if (!q || q.c !== 'w') return;
        var dmg = h.d <= 2 ? (x.fp || 2) : Math.max(1, (x.fp || 2) - 1), left = hp(q) - dmg;
        b[h.sq] = left > 0 ? Object.assign({}, q, { hp: left }) : null;
      });
    },
    evaluate: function (V, st) { var s = 0; st.b.forEach(function (p) { if (p && p.c === 'w') s += hp(p) * 40; }); return s; },

    /* ---- game hooks ---- */
    setup: function (ctx) { ctx.game._sk = { floor: 1, cards: [] }; load(ctx, { sh: 2, max: 2, fp: 2, rg: 3 }); },
    afterMove: function (ctx, m, info) {
      var z = ctx.game._sk, st = ctx.state;
      if (m.shoot) { ctx.fx({ type: 'particles', kind: 'sparks', at: ctx.name(m.t), count: 26, duration_ms: 500 }); ctx.sound('explosion'); }
      var wk = st.b.some(function (p) { return p && p.c === 'w' && p.t === 'K'; });
      if (!wk && info.by === 'player') {
        if (z.floor >= ctx.params.floors) return;
        var x = Object.assign({}, st.x), card = CARDS[(z.floor - 1) % CARDS.length];
        card.apply(x); z.cards.push(card.name); z.floor++;
        ctx.toast('Floor cleared! Card: ' + card.name + ' · Curse: White gets an extra piece');
        return new Promise(function (r) { setTimeout(function () { load(ctx, x); r(); }, 1100); });
      }
    },
    decorate: function (ctx, sq, p) {
      var st = ctx.state, g = ctx.geo, me = -1;
      for (var i = 0; i < st.b.length; i++) if (st.b[i] && st.b[i].c === 'b' && st.b[i].t === 'K') { me = i; break; }
      if (p && p.c === 'w') { var h = hp(p); if (h > 1) return { html: '<span class="g4sk-hp">' + h + '</span>' }; return null; }
      if (me >= 0 && !p && g.dist(me, sq) === 1 && ctx.V.attacked(st, sq, 'w')) return { cls: 'g4sk-threat', html: '<span class="g4sk-bang">!</span>' };
      return null;
    },
    status: function (ctx) {
      var x = ctx.state.x || {}, z = ctx.game._sk; if (!z || ctx.over) return null;
      var sh = ''; for (var i = 0; i < (x.max || 2); i++) sh += i < x.sh ? '\u25ae' : '\u25af';
      return 'FLOOR ' + z.floor + '/' + ctx.params.floors + ' · shells ' + sh + ' · firepower ' + x.fp + ' · range ' + x.rg;
    },
    init: function () {
      if (document.getElementById('g4sk-css')) return;
      var c = document.createElement('style'); c.id = 'g4sk-css';
      c.textContent = '.g4sk-hp{position:absolute;right:4%;bottom:3%;font:700 11px/1 system-ui;color:#fff;background:#b33;border-radius:6px;padding:1px 4px;z-index:3;pointer-events:none}' +
        '.g4sk-bang{position:absolute;inset:0;display:grid;place-items:center;font:900 22px/1 system-ui;color:#e03a3a;pointer-events:none}.g4sk-threat{box-shadow:inset 0 0 0 999px rgba(224,58,58,.16)}';
      document.head.appendChild(c);
    }
  };
  var CARDS = [
    { name: 'Charge one additional shell', apply: function (x) { x.max++; x.sh = x.max; } },
    { name: 'Holy Gunpowder (+1 firepower)', apply: function (x) { x.fp++; } },
    { name: 'Longer barrel (+1 range)', apply: function (x) { x.rg++; } },
    { name: 'Full reload', apply: function (x) { x.sh = x.max; } }
  ];
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
    for (var c = 1; c < n; c++) list.push(c % 3 === 0 ? 'B' : 'P'); /* one curse piece per cleared floor */
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
    st.x = Object.assign({}, x, { sh: Math.max(x.sh || 0, 1), floor: z.floor });
    ctx.state = st;
  }
  CM.defineHooks('g4_shotgun', H);
})();
