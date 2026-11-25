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
   transform (net scale 1, so the slide stays exact). */
(function () {
  'use strict';
  var CM = window.CM, pos = {};
  var D8 = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
  function prm(V) { return V.cfg.params || {}; }
  function stat(V, t) { var s = (prm(V).stats || {})[t]; return s || { atk: 1, def: 1 }; }
  function rooms(ctx) { return ctx.params.rooms || []; }
  function idx(ctx) { var r = rooms(ctx); return Math.min(pos[ctx.spec.id] || 0, r.length - 1); }
  function friendNear(g, b, i, c) { for (var k = 0; k < 8; k++) { var j = g.step(i, D8[k][0], D8[k][1]); if (j >= 0 && b[j] && b[j].c === c) return true; } return false; }
  /* effective DEF of the unit at i against attacker colour a */
  function defOf(V, b, i, a) {
    var g = V.geo, P = prm(V), p = b[i], d = stat(V, p.t).def, druid = P.druid || 'Y', merc = P.merc || 'C', hasMerc = false;
    for (var j = 0; j < b.length; j++) {
      var q = b[j]; if (!q || q.c !== a) continue;
      if (q.t === druid && (g.col(j) === g.col(i) || g.row(j) === g.row(i))) d -= 2;
      if (q.t === merc) hasMerc = true;
    }
    if (hasMerc && !friendNear(g, b, i, p.c)) d -= 1;
    return d;
  }
  function combat(V, b, a) {
    var g = V.geo, lead = prm(V).leader || 'W', hits = [];
    for (var i = 0; i < b.length; i++) {
      var e = b[i]; if (!e || e.c === a || e.c === 'n') continue;
      var sum = 0;
      for (var k = 0; k < 8; k++) { var j = g.step(i, D8[k][0], D8[k][1]); if (j < 0) continue; var q = b[j]; if (q && q.c === a && q.t !== lead) sum += stat(V, q.t).atk; }
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
  CM.defineHooks('g5_wizard', {
    onExit: function () { look(false); },
    setup: function (ctx) {
      look(ctx.params.iso !== false);
      var r = rooms(ctx), k = idx(ctx), V = ctx.V, st = ctx.state;
      if (r[k]) st.b = CM.spec.parseSetup(V, r[k].fen);
      st.turn = 'w';
      st.start = {}; V.colors.forEach(function (c) { st.start[c + 'Royal'] = V.royals(st, c).length > 0; });
    },
    onStart: function (ctx) { var r = rooms(ctx), k = idx(ctx); if (r[k]) ctx.toast('Room ' + (k + 1) + '/' + r.length + ': ' + r[k].name, 3000); if (r[k] && r[k].boss) { ctx.setOpponent({ name: r[k].boss, rating: null }); if (ctx.params.bossIntro) ctx.fx({ type: 'overlay', at: 'board', image: ctx.params.bossIntro, fit: 'contain', duration_ms: 2400, fade_ms: 250, id: 'g5boss' }); } },
    moves: function (V, st, out) {
      if (out.length) return out;
      for (var i = 0; i < st.b.length; i++) { var p = st.b[i]; if (p && p.c === st.turn) return [{ f: i, t: i, p: p.t, c: p.c, cap: null, pass: 1 }]; }
      return out;
    },
    onMake: function (V, st, m, n) {
      var hits = combat(V, n.b, m.c);
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
      if (h && h.length) { ctx.sound('capture'); h.forEach(function (i) { ctx.fx({ type: 'flash', color: '#ff3b6b', opacity: 0.5, at: i, duration_ms: 320 }); }); }
      return null;
    },
    decorate: function (ctx, sq, p) {
      if (!p) {   /* empty square next to an enemy: its move tile shows magenta */
        var g = ctx.geo, b = ctx.state.b;
        for (var k = 0; k < 8; k++) { var j = g.step(sq, D8[k][0], D8[k][1]); if (j >= 0 && b[j] && b[j].c !== ctx.human && b[j].c !== 'n') return { cls: 'g5wz-near' }; }
        return null;
      }
      var s = stat(ctx.V, p.t), cls = (p.c === 'b' ? 'g5wz-gold' : 'g5wz-blue') + (p.v ? ' g5wz-vul' : '');
      return { cls: cls, badge: s.atk + '/' + s.def };
    },
    init: function () {
      if (document.getElementById('g5-wz-css')) return;
      var s = document.createElement('style'); s.id = 'g5-wz-css';
      s.textContent = '.g5wz-gold .pc{filter:invert(.85) sepia(1) saturate(4) hue-rotate(-12deg) brightness(1.05) drop-shadow(0 1px 1px rgba(0,0,0,.5))!important}' +
        '.g5wz-blue .pc{filter:sepia(1) saturate(5) hue-rotate(175deg) brightness(.95) drop-shadow(0 1px 1px rgba(0,0,0,.5))!important}' +
        '.g5wz-blue .pc[src$=".png"]{filter:none!important}.g5wz-vul{box-shadow:inset 0 0 0 3px rgba(255,59,107,.75)}';
      document.head.appendChild(s);
    },
    onGameOver: function (ctx, over) {
      var id = ctx.spec.id, r = rooms(ctx), k = pos[id] || 0;
      if (over.w === ctx.human) { pos[id] = k < r.length - 1 ? k + 1 : 0; ctx.toast(k < r.length - 1 ? 'Room cleared! The doors unlock: New game enters room ' + (k + 2) + '.' : 'Cloaky is beaten: tutorial chapter complete!', 3600); }
      else if (over.w !== 'd') { pos[id] = 0; ctx.toast('The Bard has fallen. The run starts over.', 3000); }
    },
    status: function (ctx) { var r = rooms(ctx), k = idx(ctx); return 'Room ' + (k + 1) + '/' + r.length + (r[k] ? ': ' + r[k].name : '') + '  ·  badges show ATK/DEF, red ring = Vulnerable'; }
  });
})();
