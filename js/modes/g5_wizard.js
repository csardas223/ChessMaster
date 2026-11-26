/* g5_wizard: Wizard Chess (tactics roguelike). Blue units (White) vs golden units (Black) on dungeon rooms.
   Units never capture by moving (all moves are 'm'). Combat happens at the END of each turn: every unit of the side
   that just moved, except the Bard (params.leader, default 'W'), attacks all adjacent enemies (8 neighbours). An enemy
   is HIT when the combined ATK of its adjacent attackers exceeds its DEF. A hit unit becomes Vulnerable (piece prop
   v: 1, red tint); a Vulnerable unit that is hit again dies. Skills: a Druid (type params.druid, default 'Y') makes
   enemies in its row or column lose 2 DEF; a 'lonely' enemy (no friendly unit next to it) loses 1 DEF when the side
   has a Merc (params.merc, default 'C': 'lonely enemies lose 1 DEF').
   Stats: params.stats = { TYPE: { atk, def } } (by piece type letter, same for both colours).
   Rooms: params.rooms = [{ name, fen }] in order; clear a room (kill every golden unit) to advance on New game.
   The Bard is royal: losing him (hit twice) loses the run. A side with no move passes (Guards cannot move).
   Look (g5 2026-11-25, frames DMtaRFMpCWc 17:05 + maxres2): the dungeon is drawn isometric (the square board rotated 45
   degrees and squashed to a diamond, pieces counter-transformed so the sprites stand upright on their tiles); the
   selected unit's move squares are bright green rounded tiles (#7cff2a), and move squares next to an enemy unit are
   magenta (#ff2bd6: the danger colour, inferred from maxres2). Pure CSS under body.m-wizard (no engine change); the
   counter-transform uses the individual rotate/scale/translate properties so it composes with the slide animation's
   transform (net scale 1, so the slide stays exact).
   g5 pass 2 (2026-11-25), from the video's unit cards and frames (frames 6:45 Dog, 7:08 Guard, 8:02 Javelina, 15:22 shop,
   17:05 boss room; research/frames/video_thumbs/DMtaRFMpCWc_frame_*.jpg):
     Stats carry SKL too: params.stats[T] = { atk, def, skl } (card values: Dog 0/6/2, Guard 1/1/1, Javelina 4/5/2, Rogue 4/5/1,
       Druid 0/6/2; skeletons 3/7/2 and Cloaky 5/99+/10 in the boss room).
     Poised (params.poised, Rogue): a unit that moved this turn adds its SKL to its ATK in that turn's combat.
     Javelina (gen 'javelina'): king steps, or, as its action, target a square 2 or more tiles away in a straight line (up to
       2 + SKL away: 'as SKL increases you can target more distant squares'); every end of its side's turn its ATK is added
       against whatever enemy stands on that square, until the Javelina moves or the target moves off it.
     Shield orbs (params.orb type, default 'U'; params.shielded type, default 'Z'): while any orb of its side is alive the boss
       shows DEF 99+ and cannot be hit; the orbs (pink skulls, 0/7/0) never move.
     Skull currency + shop (params.shop): clearing a room pays params.shop.reward skull coins; the shop between rooms sells
       units ('Buy (-6 coin)'); bought units join every later room next to the Bard. Prices other than the 6/7 on screen
       are inferred. */
(function () {
  'use strict';
  var CM = window.CM, pos = {};
  var D8 = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
  function prm(V) { return V.cfg.params || {}; }
  function stat(V, t) { var s = (prm(V).stats || {})[t]; return s || { atk: 1, def: 1, skl: 0 }; }
  function shieldUp(V, b, c) { var o = prm(V).orb || 'U'; for (var i = 0; i < b.length; i++) if (b[i] && b[i].c === c && b[i].t === o) return true; return false; }
  function rooms(ctx) { return ctx.params.rooms || []; }
  function idx(ctx) { var r = rooms(ctx); return Math.min(pos[ctx.spec.id] || 0, r.length - 1); }
  function friendNear(g, b, i, c) { for (var k = 0; k < 8; k++) { var j = g.step(i, D8[k][0], D8[k][1]); if (j >= 0 && b[j] && b[j].c === c) return true; } return false; }
  /* effective DEF of the unit at i against attacker colour a */
  function defOf(V, b, i, a) {
    var g = V.geo, P = prm(V), p = b[i], d = stat(V, p.t).def;
    if (p.t === (P.shielded || 'Z') && shieldUp(V, b, p.c)) return 99;
    var druid = P.druid || 'Y', merc = P.merc || 'C', hasMerc = false;
    for (var j = 0; j < b.length; j++) {
      var q = b[j]; if (!q || q.c !== a) continue;
      if (q.t === druid && (g.col(j) === g.col(i) || g.row(j) === g.row(i))) d -= 2;
      if (q.t === merc) hasMerc = true;
    }
    if (hasMerc && !friendNear(g, b, i, p.c)) d -= 1;
    return d;
  }
  function combat(V, b, a, moved, jav) {
    var g = V.geo, P = prm(V), lead = P.leader || 'W', hits = [], poised = P.poised || 'O';
    function atkOf(j, q) { var s = stat(V, q.t), v = s.atk; if (j === moved && q.t === poised) v += s.skl || 0; return v; }
    for (var i = 0; i < b.length; i++) {
      var e = b[i]; if (!e || e.c === a || e.c === 'n') continue;
      var sum = 0;
      for (var k = 0; k < 8; k++) { var j = g.step(i, D8[k][0], D8[k][1]); if (j < 0) continue; var q = b[j]; if (q && q.c === a && q.t !== lead) sum += atkOf(j, q); }
      if (jav && jav.c === a && jav.sq === i && b[jav.from] && b[jav.from].c === a) sum += stat(V, b[jav.from].t).atk;   /* javelin on its target */
      if (sum > 0 && sum > defOf(V, b, i, a)) hits.push(i);
    }
    hits.forEach(function (i) { var e = b[i]; b[i] = e.v ? null : Object.assign({}, e, { v: 1 }); });
    return hits;
  }
  var ISO = 'body.m-wizard #board{transform:scale(.7071,.3536) rotate(45deg);transform-origin:50% 50%}' +
    'body.m-wizard #board .pc{inset:12%;width:76%;height:76%;rotate:-45deg;scale:1.4142 2.8284;translate:-16% -16%}' +
    'body.m-wizard #board .pc-badge{rotate:-45deg;scale:1.4142 2.8284}' +
    'body.m-wizard #board .coord{display:none}' +
    'body.m-wizard #board .sq.is-target::after{width:80%;height:80%;border-radius:22%;background:#7cff2a;box-shadow:0 0 6px 2px rgba(124,255,42,.55);z-index:0}' +
    'body.m-wizard #board .sq.is-target.g5wz-near::after{background:#ff2bd6;box-shadow:0 0 6px 2px rgba(255,43,214,.55)}' +
    'body.m-wizard #board-wrap{margin-top:-14%;margin-bottom:-14%}';
  function look(on) {
    if (on && !document.getElementById('g5-wz-iso')) { var el = document.createElement('style'); el.id = 'g5-wz-iso'; el.textContent = ISO; document.head.appendChild(el); }
    document.body.classList.toggle('m-wizard', !!on);
  }
  /* ---------- skull currency + shop (params.shop) ---------- */
  var RUN = {}, WA = 'assets/modes/DMtaRFMpCWc/';
  function wcss() {
    if (document.getElementById('g5-wz-shop')) return; var s = document.createElement('style'); s.id = 'g5-wz-shop';
    s.textContent = '#g5wz-hud{display:flex;align-items:center;gap:6px;justify-content:flex-start;margin:2px 6px;color:#fff;font:700 18px/1 system-ui,sans-serif}#g5wz-hud img{width:26px;height:26px}' +
      '.g5wz-dlg{position:fixed;inset:0;z-index:120;display:flex;align-items:center;justify-content:center;padding:12px;background:rgba(0,0,0,.82);animation:g5wzf .22s ease-out;color:#fff;font:15px/1.35 system-ui,sans-serif}@keyframes g5wzf{from{opacity:0}to{opacity:1}}' +
      '.g5wz-box{width:min(94vw,440px);max-height:92vh;overflow:auto;background:#000;border:3px solid #fff;border-radius:14px;padding:14px}.g5wz-box h3{margin:0 0 6px;font:800 italic 22px/1.1 system-ui,sans-serif}' +
      '.g5wz-cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:8px;margin:10px 0}.g5wz-card{border:2px solid #fff;border-radius:10px;padding:8px;display:flex;flex-direction:column;align-items:center;gap:4px;background:#14101a}' +
      '.g5wz-card img{width:56px;height:56px;object-fit:contain;image-rendering:pixelated}.g5wz-card .st{font-size:13px}.g5wz-card .st b:nth-child(1){color:#ff6b5b}.g5wz-card .st b:nth-child(2){color:#5fe0a0}.g5wz-card .st b:nth-child(3){color:#c77dff}' +
      '.g5wz-card button,.g5wz-exit{border:0;border-radius:8px;background:#e8e8e8;color:#111;font:700 italic 14px/1 system-ui,sans-serif;padding:8px 10px;display:flex;align-items:center;gap:4px;cursor:pointer}.g5wz-card button img{width:18px;height:18px}.g5wz-card button[disabled]{opacity:.4;cursor:default}.g5wz-exit{margin:6px auto 0;padding:10px 26px}';
    document.head.appendChild(s);
  }
  function hud(ctx) {
    var SH = ctx.params.shop; if (!SH) return; wcss(); var run = RUN[ctx.spec.id] || (RUN[ctx.spec.id] = { coins: 0, army: [] });
    var el = document.getElementById('g5wz-hud'), area = document.getElementById('board-area');
    if (!el && area && area.parentNode) { el = document.createElement('div'); el.id = 'g5wz-hud'; area.parentNode.insertBefore(el, area); }
    if (el) el.innerHTML = '<img src="' + WA + 'skull_coin.png" alt="skull coins">' + run.coins;
  }
  function shop(ctx) {
    var SH = ctx.params.shop, run = RUN[ctx.spec.id], old = document.querySelector('.g5wz-dlg'); if (old) old.remove(); wcss();
    var el = document.createElement('div'); el.className = 'g5wz-dlg'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'Shop');
    function draw() {
      el.innerHTML = '<div class="g5wz-box"><h3>Shop</h3><div style="display:flex;align-items:center;gap:6px"><img src="' + WA + 'skull_coin.png" alt="" style="width:24px">' + run.coins + '</div><div class="g5wz-cards">' +
        SH.units.map(function (u, k) {
          var d = ctx.spec.pieces[u.t] || {}, s = (ctx.params.stats || {})[u.t] || {};
          return '<div class="g5wz-card"><img alt="" src="' + (typeof d.img === 'string' ? d.img : '') + '"><b>' + (u.name || d.name) + '</b><span class="st"><b>' + s.atk + '</b> / <b>' + s.def + '</b> / <b>' + (s.skl || 0) + '</b></span>' +
            '<button type="button" data-k="' + k + '"' + (run.coins < u.cost ? ' disabled' : '') + '>Buy (-' + u.cost + ' <img src="' + WA + 'skull_coin.png" alt="coins">)</button></div>';
        }).join('') + '</div><button type="button" class="g5wz-exit" data-x="1">Exit</button></div>';
    }
    el.onclick = function (e) {
      var b = e.target.closest('[data-k]'), x = e.target.closest('[data-x]');
      if (b && !b.disabled) { var u = SH.units[+b.dataset.k]; if (run.coins >= u.cost) { run.coins -= u.cost; run.army.push(u.t); ctx.sound('notify'); ctx.toast((u.name || ctx.spec.pieces[u.t].name) + ' joins your party.', 1600); hud(ctx); } draw(); return; }
      if (x) { el.remove(); var go = document.getElementById('gover'); if (go) go.classList.remove('is-open'); ctx.game.newGame(); }
    };
    draw(); document.body.appendChild(el);
  }
  CM.defineHooks('g5_wizard', {
    onExit: function () { look(false); var h = document.getElementById('g5wz-hud'); if (h) h.remove(); var d = document.querySelector('.g5wz-dlg'); if (d) d.remove(); },
    setup: function (ctx) {
      look(ctx.params.iso !== false);
      var r = rooms(ctx), k = idx(ctx), V = ctx.V, st = ctx.state;
      if (r[k]) st.b = CM.spec.parseSetup(V, r[k].fen);
      var run = RUN[ctx.spec.id];
      if (run && run.army.length) {   /* bought units stand next to the Bard (nearest empty squares of your half) */
        var g = V.geo, bard = -1; st.b.forEach(function (p, i) { if (p && p.c === ctx.human && p.t === (ctx.params.leader || 'W')) bard = i; });
        var free = []; for (var i = 0; i < st.b.length; i++) if (!st.b[i] && g.valid[i] && g.relRow(i, ctx.human) <= 2) free.push(i);
        free.sort(function (a, c) { return (bard >= 0 ? g.dist(a, bard) - g.dist(c, bard) : 0) || a - c; });
        run.army.forEach(function (t, j) { if (free[j] != null) st.b[free[j]] = { t: t, c: ctx.human }; });
      }
      st.turn = 'w';
      st.start = {}; V.colors.forEach(function (c) { st.start[c + 'Royal'] = V.royals(st, c).length > 0; });
    },
    onStart: function (ctx) { hud(ctx); var r = rooms(ctx), k = idx(ctx); if (r[k]) ctx.toast('Room ' + (k + 1) + '/' + r.length + ': ' + r[k].name, 3000); if (r[k] && r[k].boss) { ctx.setOpponent({ name: r[k].boss, rating: null }); if (ctx.params.bossIntro) ctx.fx({ type: 'overlay', at: 'board', image: ctx.params.bossIntro, fit: 'contain', duration_ms: 2400, fade_ms: 250, id: 'g5boss' }); } },
    moves: function (V, st, out) {
      if (out.length) return out;
      for (var i = 0; i < st.b.length; i++) { var p = st.b[i]; if (p && p.c === st.turn) return [{ f: i, t: i, p: p.t, c: p.c, cap: null, pass: 1 }]; }
      return out;
    },
    javelina: function (V, st, i, p, out) {
      var g = V.geo, b = st.b, r = 2 + (stat(V, p.t).skl || 0);
      D8.forEach(function (d) {
        var j = g.step(i, d[0], d[1]); if (j >= 0 && !b[j]) out.push({ f: i, t: j, p: p.t, c: p.c, cap: null });
        for (var k = 2; k <= r && j >= 0; k++) { j = g.step(j, d[0], d[1]); if (j < 0) break; var q = b[j]; if (q && (q.c === p.c || V.def(q.t).blocker)) continue; out.push({ f: i, t: j, p: p.t, c: p.c, cap: null, jav: 1 }); }
      });
    },
    onMake: function (V, st, m, n) {
      var x0 = st.x || {}, jav = x0.jav || null;
      if (m.jav) { n.b[m.f] = st.b[m.f]; n.b[m.t] = st.b[m.t]; jav = { sq: m.t, c: m.c, from: m.f }; }
      else if (jav && !m.pass && (m.f === jav.from || m.f === jav.sq)) jav = null;   /* the javelina or its target moved */
      if (jav !== x0.jav) n.x = Object.assign({}, n.x, { jav: jav });
      var hits = combat(V, n.b, m.c, m.jav || m.pass ? -1 : m.t, jav);
      if (hits.length) n.x = Object.assign({}, n.x, { hits: hits });
      else if (n.x && n.x.hits) n.x = Object.assign({}, n.x, { hits: null });
    },
    checkWin: function (V, st) {
      var w = 0, bl = 0; st.b.forEach(function (p) { if (p && p.c === 'w') w++; if (p && p.c === 'b') bl++; });
      if (!bl) return { w: 'w', why: 'room cleared' };
      if (!V.royals(st, 'w').length) return { w: 'b', why: 'the Bard was struck down' };
      return null;
    },
    evaluate: function (V, st) {
      var v = 0, lead = prm(V).leader || 'W';
      st.b.forEach(function (p) {
        if (!p || p.c === 'n') return; var s = stat(V, p.t), x = (s.atk * 2 + s.def) * 25 + 60;
        if (p.t === lead) x = 2000; if (p.v) x = p.t === lead ? 900 : x * 0.45;
        v += p.c === 'w' ? x : -x;
      });
      return v;
    },
    afterMove: function (ctx) {
      var h = ctx.state.x && ctx.state.x.hits;
      if (h && h.length) { ctx.sound(ctx.spec.sounds && ctx.spec.sounds.hit ? 'hit' : 'capture'); h.forEach(function (i) { ctx.fx({ type: 'flash', color: '#ff3b6b', opacity: 0.5, at: i, duration_ms: 320 }); }); }
      var mv = arguments[1];
      if (mv && mv.jav) { ctx.fx({ type: 'arrow', from: ctx.name(mv.f), to: ctx.name(mv.t), color: '#7cff2a', duration_ms: 600 }); ctx.toast('Javelin targets ' + ctx.name(mv.t) + '.', 1400); }
      else if (mv && !mv.pass && mv.p === (ctx.params.poised || 'O') && mv.c === ctx.human) ctx.fx({ type: 'text', text: 'Poised +' + (stat(ctx.V, mv.p).skl || 0), at: mv.t, color: '#c77dff', duration_ms: 800 });
      return null;
    },
    decorate: function (ctx, sq, p) {
      if (!p) {   /* empty square next to an enemy: its move tile shows magenta */
        var g = ctx.geo, b = ctx.state.b, jx = ctx.state.x && ctx.state.x.jav;
        if (jx && jx.sq === sq) return { html: '<span class="g5wz-jav"></span>' };
        for (var k = 0; k < 8; k++) { var j = g.step(sq, D8[k][0], D8[k][1]); if (j >= 0 && b[j] && b[j].c !== ctx.human && b[j].c !== 'n') return { cls: 'g5wz-near' }; }
        return null;
      }
      var s = stat(ctx.V, p.t), cls = (p.c === 'b' ? 'g5wz-gold' : 'g5wz-blue') + (p.v ? ' g5wz-vul' : ''), P = ctx.params;
      var jv = ctx.state.x && ctx.state.x.jav, html = jv && jv.sq === sq ? '<span class="g5wz-jav"></span>' : '';
      if (p.t === (P.orb || 'U')) cls += ' g5wz-orb';
      var shield = p.t === (P.shielded || 'Z') && shieldUp(ctx.V, ctx.state.b, p.c);
      return { cls: cls + (shield ? ' g5wz-shield' : ''), badge: s.atk + '/' + (shield ? '99+' : s.def), html: html };
    },
    init: function () {
      if (document.getElementById('g5-wz-css')) return;
      var s = document.createElement('style'); s.id = 'g5-wz-css';
      s.textContent = '.g5wz-gold .pc{filter:invert(.85) sepia(1) saturate(4) hue-rotate(-12deg) brightness(1.05) drop-shadow(0 1px 1px rgba(0,0,0,.5))!important}' +
        '.g5wz-blue .pc{filter:sepia(1) saturate(5) hue-rotate(175deg) brightness(.95) drop-shadow(0 1px 1px rgba(0,0,0,.5))!important}' +
        '.g5wz-blue .pc[src$=".png"]{filter:none!important}.g5wz-vul{box-shadow:inset 0 0 0 3px rgba(255,59,107,.75)}' +
        '.g5wz-orb .pc{filter:drop-shadow(0 0 6px #4b3cff) drop-shadow(0 0 3px #6a5cff)!important}.g5wz-orb.g5wz-gold .pc{filter:drop-shadow(0 0 6px #4b3cff)!important}' +
        '.g5wz-shield .pc{filter:drop-shadow(0 0 5px #ff2bd6)!important}' +
        '.g5wz-jav{position:absolute;inset:18%;border:3px solid #7cff2a;border-radius:50%;box-shadow:0 0 6px #7cff2a;pointer-events:none;z-index:2}.g5wz-jav::before,.g5wz-jav::after{content:"";position:absolute;background:#7cff2a;left:50%;top:-14%;width:3px;height:128%;transform:translateX(-50%)}.g5wz-jav::after{transform:translateX(-50%) rotate(90deg)}';
      document.head.appendChild(s);
    },
    onGameOver: function (ctx, over) {
      var id = ctx.spec.id, r = rooms(ctx), k = pos[id] || 0;
      var SH = ctx.params.shop, run = RUN[id] || (RUN[id] = { coins: 0, army: [] });
      if (over.w === ctx.human && SH && k < r.length - 1) { run.coins += SH.reward || 5; hud(ctx); setTimeout(function () { if (ctx.game && ctx.game.over) shop(ctx); }, 1600); }
      if (over.w !== ctx.human && over.w !== 'd') { delete RUN[id]; }
      if (over.w === ctx.human && k >= r.length - 1) delete RUN[id];
      if (over.w === ctx.human) { pos[id] = k < r.length - 1 ? k + 1 : 0; ctx.toast(k < r.length - 1 ? 'Room cleared! The doors unlock: New game enters room ' + (k + 2) + '.' : 'Cloaky is beaten: tutorial chapter complete!', 3600); }
      else if (over.w !== 'd') { pos[id] = 0; ctx.toast('The Bard has fallen. The run starts over.', 3000); }
    },
    status: function (ctx) { var r = rooms(ctx), k = idx(ctx); return 'Room ' + (k + 1) + '/' + r.length + (r[k] ? ': ' + r[k].name : '') + '  ·  badges show ATK/DEF, red ring = Vulnerable'; }
  });
})();
