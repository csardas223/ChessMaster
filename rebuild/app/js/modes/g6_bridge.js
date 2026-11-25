/* g6_bridge: King of the Bridge (pixel-art chess game vs the cheating Troll; endings videos hv_NHWqysZE,
   puKYAUl9x9s, ulE3YPZI9Sc). Base rules from research/modes/WEYUcaJTBso.json and the endings' specs:
   - pawns step one square forward, sideways or back (never diagonally) and capture straight ahead; no double step
   - the Horse guy (knight) also steps one square orthogonally; the Queen may not take a king
   - Rule 11: when the Troll's king dies the crown passes to his strongest remaining piece (no check in this world)
   - the Troll cheats now and then (a diagonal pawn capture or an extra step); the rule book lists unlocked rules
   Mode params: ending: 'rules' | 'bullet' | 'ascension'
     rules      unlock every rule (incl. Rule 28: you may only move a castle - two rooks side by side - when there are
                three or more towers in the game) -> "Rule Savant"
     ascension  promote all eight of your pawns -> "Ascension"
     bullet     beat the Troll before your short clock runs out */
(function () {
  'use strict';
  var CM = window.CM;
  var RULES = [
    ['02', 'You may only move your own coloured pieces.', function (i) { return true; }],
    ['04', 'Pawns are small-minded: one step forward, sideways or back.', function (i) { return i.piece === 'P'; }],
    ['07', 'The Horse guy is troubled: he may also trot one step.', function (i) { return i.piece === 'N'; }],
    ['09', 'Only the Horse guy may jump over others.', function (i) { return i.piece === 'N'; }],
    ['12', 'The Crown guy does as he pleases, but he is lazy.', function (i) { return i.piece === 'K'; }],
    ['13', 'The Bishop travels in an X.', function (i) { return i.piece === 'B'; }],
    ['14', 'Towers stand guard, but here they may walk.', function (i) { return i.piece === 'R'; }],
    ['17', 'The Queen must never lay a hand on a crown.', function (i) { return i.piece === 'Q'; }],
    ['20', 'A small-minded one reaching the far side ascends.', function (i) { return i.move && i.move.promo; }],
    ['11', 'When the Troll king falls, the crown finds a new head.', function (i) { return i.captured && i.captured.t === 'K'; }],
    ['28', 'You may only move the castles when there are three or more towers in the game.', function (i, ctx) { return i.piece === 'R' && i.castleMove; }]
  ];
  function towers(st, c) { var n = 0; st.b.forEach(function (p) { if (p && p.t === 'R' && (!c || p.c === c)) n++; }); return n; }
  function castleRook(V, st, i) {
    var p = st.b[i]; if (!p || p.t !== 'R') return false;
    var g = V.geo; return [[1, 0], [-1, 0], [0, 1], [0, -1]].some(function (d) { var j = g.step(i, d[0], d[1]); return j >= 0 && st.b[j] && st.b[j].t === 'R' && st.b[j].c === p.c; });
  }
  /* pass 2: mode sounds (gong on rule unlock, troll laugh on a cheat) fall back to the built-in notify */
  function snd(ctx, n) { return ctx.spec.sounds && ctx.spec.sounds[n] ? n : 'notify'; }
  CM.defineHooks('g6_bridge', {
    filterMoves: function (V, st, legal) {
      return legal.filter(function (m) {
        if (m.f < 0) return true;
        var p = st.b[m.f], cap = st.b[m.capSq != null ? m.capSq : m.t];
        if (p && p.t === 'Q' && cap && cap.t === 'K' && cap.c !== p.c) return false;
        if (V.cfg.params.ending === 'rules' && p && p.t === 'R' && castleRook(V, st, m.f) && towers(st) < 3) return false;
        return true;
      });
    },
    onMake: function (V, st, m, n) {
      var cap = st.b[m.capSq != null ? m.capSq : m.t];
      if (cap && cap.t === 'K' && cap.c === 'b') {
        var best = -1, bv = -1; n.b.forEach(function (p, i) { if (p && p.c === 'b') { var v = V.def(p.t).value || 0; if (v > bv) { bv = v; best = i; } } });
        if (best >= 0) n.b[best] = Object.assign({}, n.b[best], { t: 'K', crowned: 1 });
      }
      if (st.turn === 'w' && m.f >= 0 && st.b[m.f] && st.b[m.f].t === 'P' && n.b[m.t] && n.b[m.t].t !== 'P') n.x.asc = (st.x.asc || 0) + 1;
    },
    checkWin: function (V, st) {
      var P = V.cfg.params;
      if (P.ending === 'ascension' && (st.x.asc || 0) >= 8) return { w: 'w', why: 'all eight pawns ascended' };
      var bl = 0; st.b.forEach(function (p) { if (p && p.c === 'b') bl++; });
      if (!bl) return { w: 'w', why: 'the Troll has no pieces left' };
      return null;
    },
    setup: function (ctx) { ctx.state.x = Object.assign({}, ctx.state.x, { asc: 0, cheats: 0 }); ctx.game._g6rules = {}; },
    onStart: function (ctx) { ctx.toast('The Troll: "Answer my riddle... or beat me at my own game!"', 3200); },
    beforeMove: function (ctx, mv) { ctx.game._g6castle = mv && mv.f >= 0 && castleRook(ctx.V, ctx.state, mv.f); return true; },
    afterMove: function (ctx, mv, info) {
      var got = ctx.game._g6rules || (ctx.game._g6rules = {});
      if (info.by === 'player') {
        info.castleMove = ctx.game._g6castle;
        RULES.forEach(function (r) { if (!got[r[0]] && r[2](info, ctx)) { got[r[0]] = 1; ctx.toast('RULE ' + r[0] + ' unlocked: ' + r[1], 2600); ctx.sound(snd(ctx, 'gong')); ctx.fx({ type: 'text', text: 'RULE ' + r[0], color: '#e8ecd0', size: 28, at: 'board', duration_ms: 1200 }); } });
        if (ctx.params.ending === 'rules' && Object.keys(got).length === RULES.length && !ctx.over) { ctx.endGame('player', 'every rule unlocked: Rule Savant'); return; }
      }
      if (info.by === 'bot' && !ctx.over && info.ply > 2 && ctx.chance(ctx.params.cheat || 0.18)) {
        /* the Troll cheats: a pawn of his slides one extra step forward if it can, or captures diagonally */
        var V = ctx.V, g = V.geo, st = ctx.state, done = false;
        var ps = ctx.pieces(function (p) { return p.c === 'b' && p.t === 'P'; });
        for (var k = 0; k < ps.length && !done; k++) {
          var i = ps[k];
          [[1, 1], [-1, 1]].forEach(function (d) { if (done) return; var j = g.step(i, d[0], d[1]); if (j >= 0 && st.b[j] && st.b[j].c === 'w' && st.b[j].t !== 'K') { ctx.move(i, j); done = true; } });
        }
        if (!done && ps.length) { var i2 = ctx.pick(ps), j2 = g.step(i2, 0, 1); if (j2 >= 0 && !st.b[j2]) { ctx.move(i2, j2); done = true; } }
        if (done) { ctx.setX('cheats', (st.x.cheats || 0) + 1); ctx.toast('The Troll moved something he should not have... (he cheated)', 2600); ctx.sound(snd(ctx, 'laugh')); ctx.fx({ type: 'flash', color: '#3d6b2a', opacity: 0.25 }); ctx.refresh(); }
      }
    },
    status: function (ctx) {
      var got = Object.keys(ctx.game._g6rules || {}).length, x = ctx.state.x || {}, e = ctx.params.ending;
      var s = 'Rule book: ' + got + '/' + RULES.length + ' rules';
      if (e === 'ascension') s += ' · ascensions ' + (x.asc || 0) + '/8';
      if (x.cheats) s += ' · Troll cheats ' + x.cheats;
      return s;
    }
  });
})();
