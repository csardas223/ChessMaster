/* g4_kotb: King of the Bridge (pixel-art troll chess game), group 4 endings: 0LO0D0rOif0 (Good Ending),
   1FKa1LnTDeQ (Overkill Ending), 4KetMbEVvhI (Showdown Ending). params.ending = 'good' | 'overkill' | 'showdown'.
   Rule book (from the base video WEYUcaJTBso, as summarised in the specs):
     - Rule 4: pawns are small-minded: they step one square up, down or sideways (and capture the same way), never diagonally.
     - Rule 7: the Horse guy (knight) jumps like a knight and may also step one square in the 4 straight directions.
     - Rule 9: only the knight can jump over pieces.  Rule 13: bishops travel in an X.
     - Rule 10: if your king dies, the Troll wins.  Rule 11: if the Troll's king dies, the crown passes to his
       strongest remaining piece.  Royal affair: the queen must not capture a king.
     - Rule 00: catch the Troll cheating (double-tap the piece he cheated with, right after his move) and you may
       cheat once: a payback move takes any of your pieces to any square (captures allowed, never a king).
       Rule 1: a false accusation forfeits your turn.
   The Troll cheats now and then (game-level, random): a pawn capturing diagonally (Rule 4), moving one of YOUR
   pieces backwards with his grubby green hand (Rule 2), or his queen jumping over a piece to capture (Rule 9).
   Endings: good = win without using any payback cheat; overkill = win with at least 10 of your 16 pieces;
   showdown = finish with only the two kings left (capture everything else; then the goose carries his king away).
   state.x: { pay: payback available, used: paybacks used }. */
(function () {
  'use strict';
  var CM = window.CM;
  function count(st, c, t) { var n = 0; st.b.forEach(function (p) { if (p && p.c === c && (!t || p.t === t)) n++; }); return n; }
  var H = {
    /* payback cheat moves (pure: depend on state.x.pay) */
    moves: function (V, st, out) {
      if (st.turn !== 'w' || !(st.x && st.x.pay)) return out;
      for (var i = 0; i < st.b.length; i++) {
        var p = st.b[i]; if (!p || p.c !== 'w' || p.t === 'K') continue;
        for (var j = 0; j < st.b.length; j++) {
          if (j === i || !V.geo.valid[j]) continue; var q = st.b[j];
          if (q && (q.c === 'w' || q.t === 'K' || q.probe)) continue;
          out.push({ f: i, t: j, p: p.t, c: 'w', cap: q || null, capSq: q ? j : undefined, payback: 1 });
        }
      }
      return out;
    },
    filterMoves: function (V, st, legal) { return legal.filter(function (m) { return !(m.p === 'Q' && m.cap && m.cap.t === 'K'); }); },
    onMake: function (V, st, m, n) {
      var x = n.x = Object.assign({}, st.x);
      if (m.c === 'w' && x.pay) { if (m.payback) x.used = (x.used || 0) + 1; x.pay = 0; }
      if (m.cap && m.cap.t === 'K' && m.cap.c === 'b') {
        var best = -1, bv = -1;
        for (var i = 0; i < n.b.length; i++) { var p = n.b[i]; if (p && p.c === 'b') { var v = V.def(p.t).value; if (v > bv) { bv = v; best = i; } } }
        if (best >= 0) { n.b[best] = Object.assign({}, n.b[best], { t: 'K', crowned: n.b[best].t }); x.crown = (x.crown || 0) + 1; }
      }
    },
    checkWin: function (V, st) {
      var E = st.x.ending;
      if (!count(st, 'w', 'K')) return { w: 'b', why: 'the Troll got your king' };
      var bl = count(st, 'b'), wl = count(st, 'w');
      if (E === 'showdown' && bl === 1 && wl === 1 && count(st, 'b', 'K') === 1) return { w: 'w', why: 'SHOWDOWN: only the two kings are left. The goose carries the Troll king out of town' };
      if (bl) return null;
      if (E === 'good') return (st.x.used || 0) === 0 ? { w: 'w', why: 'GOOD ENDING: you beat the Troll without a single revenge cheat' } : { w: 'd', why: 'you won, but you cheated ' + st.x.used + 'x: no Good Ending' };
      if (E === 'overkill') return wl >= 10 ? { w: 'w', why: 'OVERKILL: you won with ' + wl + ' of 16 pieces left' } : { w: 'd', why: 'you won with only ' + wl + ' pieces: Overkill needs 10' };
      if (E === 'showdown') return { w: 'd', why: 'the Troll is gone, but your king was not alone: no Showdown' };
      return { w: 'w', why: 'you beat the Troll' };
    },

    /* ---- game hooks ---- */
    setup: function (ctx) { ctx.game._kb = { cheat: null, accused: false }; },
    afterMove: function (ctx, m, info) {
      var z = ctx.game._kb; z.accused = false;
      if (info.by === 'player') { z.cheat = null; if (m.payback) { ctx.toast('Payback cheat used!'); ctx.fx({ type: 'flash', at: ctx.name(m.t), color: '#9be15d', duration_ms: 500 }); } return; }
      if (ctx.over) return;
      var rate = ctx.params.cheatRate || 0.22; if (!ctx.chance(rate)) { z.cheat = null; return; }
      var st = ctx.state, g = ctx.geo, opts = [];
      st.b.forEach(function (p, i) {
        if (!p) return;
        if (p.c === 'b' && p.t === 'P') [[-1, 1], [1, 1]].forEach(function (d) { var j = g.step(i, d[0], d[1]); if (j >= 0 && st.b[j] && st.b[j].c === 'w' && st.b[j].t !== 'K') opts.push({ rule: 4, f: i, t: j, text: 'pawn captured diagonally' }); });
        if (p.c === 'w' && p.t !== 'K') { var j = g.step(i, 0, -1); if (j >= 0 && !st.b[j]) opts.push({ rule: 2, f: i, t: j, text: 'moved one of your pieces' }); }
        if (p.c === 'b' && p.t === 'Q') [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(function (d) {
          var j = i, hop = false;
          for (var s = 0; s < 8; s++) { j = g.step(j, d[0], d[1]); if (j < 0) break; var q = st.b[j]; if (!q) continue; if (!hop) { hop = true; continue; } if (q.c === 'w' && q.t !== 'K') opts.push({ rule: 9, f: i, t: j, text: 'queen jumped' }); break; }
        });
      });
      if (!opts.length) { z.cheat = null; return; }
      var c = ctx.pick(opts); z.cheat = c;
      return new Promise(function (res) { ctx.after(380, function () { ctx.move(c.f, c.t); ctx.refresh(); res(); }); });
    },
    onTap: function (ctx, i) {
      var g = ctx.game, z = g._kb, now = performance.now(), last = g._ktap; g._ktap = { i: i, t: now };
      if (!last || last.i !== i || now - last.t > 420 || ctx.over || ctx.state.turn !== ctx.human || g.busy) return false;
      g._ktap = null; if (z.accused) return true; z.accused = true;
      if (z.cheat && (z.cheat.t === i || z.cheat.f === i)) {
        ctx.state = Object.assign({}, ctx.state, { x: Object.assign({}, ctx.state.x, { pay: 1 }) });
        ctx.toast('Correct accusation! Rule ' + z.cheat.rule + ': ' + z.cheat.text + '. You may cheat once: move any piece anywhere.');
        ctx.sound('notify'); z.cheat = null;
      } else {
        ctx.toast('False accusation (Rule 1): your turn is forfeited.'); ctx.sound('illegal');
        ctx.state = Object.assign({}, ctx.state, { turn: 'b' });
      }
      g.sel = -1; ctx.refresh();
      return true;
    },
    status: function (ctx) {
      if (ctx.over) return null; var x = ctx.state.x || {}, E = ctx.params.ending;
      var goal = E === 'good' ? 'cheats used: ' + (x.used || 0) + ' (Good Ending needs 0)' : E === 'overkill' ? 'your pieces: ' + count(ctx.state, 'w') + ' (need 10+)' : 'pieces left: ' + (count(ctx.state, 'w') + count(ctx.state, 'b')) + ' (Showdown = 2 kings)';
      return (x.pay ? 'PAYBACK READY · ' : '') + 'Double-tap a piece the Troll cheated with to accuse him · ' + goal;
    }
  };
  CM.defineHooks('g4_kotb', H);
})();
