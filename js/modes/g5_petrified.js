/* g5_petrified: chess.com Petrified Chess. When a non-pawn piece captures a non-pawn piece, the capturing piece turns
   to stone on the square it lands on: a permanent, immovable, uncapturable block (type 'Stone', neutral). Capturing a
   pawn, or capturing with a pawn, never petrifies. Kings cannot capture at all. Pawns may also step one square
   sideways (set in the mode's P moves). params.points: true -> the game is scored (captures score P1 N3 B3 R5 Q9 via
   rules.win points; checkmate adds 20 and ends the game; with no legal moves otherwise the higher score wins).
   Sources: research/modes/NWxiv9k1yrQ.json (1:30 queen petrified, 0:20 pawns never petrify, 4:10 kings can't take),
   research/modes/O44sHRw-89k.json (6:15 sideways pawns). */
(function () {
  'use strict';
  var CM = window.CM;
  function scoreWin(V, st, bonusTo) {
    var s = Object.assign({}, st.score || {}); if (bonusTo) s[bonusTo] = (s[bonusTo] || 0) + 20;
    var w = s.w || 0, b = s.b || 0;
    return { w: w > b ? 'w' : b > w ? 'b' : 'd', why: (bonusTo ? 'checkmate (+20), ' : '') + 'final score ' + w + ' : ' + b };
  }
  CM.defineHooks('g5_petrified', {
    moves: function (V, st, out) {
      return out.filter(function (m) { return !(m.cap && V.def(m.p).royal); });
    },
    onMake: function (V, st, m, n) {
      if (!m.cap || m.drop) return;
      if (V.def(m.p).pawn || V.def(m.cap.t).pawn) return;
      var p = n.b[m.t]; if (!p) return;
      n.b[m.t] = { t: 'Stone', c: 'n', m: 1, was: p.c, from: p.t };
    },
    checkWin: function (V, st, moves) {
      var pts = V.cfg.params && V.cfg.params.points;
      if (!pts) return null;
      if (!moves.length) {
        var mated = V.inCheck(st, st.turn);
        return scoreWin(V, st, mated ? V.opp(st.turn) : null);
      }
      if (st.half >= V.rules.drawPlies) return scoreWin(V, st, null);
      return null;
    },
    status: function (ctx) {
      var s = ctx.state.score || {}, n = ctx.pieces(function (p) { return p.t === 'Stone'; }).length;
      return (ctx.params.points ? 'Score: you ' + (s[ctx.human] || 0) + ', opponent ' + (s[ctx.bot] || 0) + '  ·  ' : '') + n + ' stone' + (n === 1 ? '' : 's') + ' on the board';
    },
    /* the petrified piece keeps its shape and turns grey stone (chess.com look in both videos): draw the original
       piece with a stone filter instead of separate art */
    decorate: function (ctx, sq, p) {
      if (!p || p.t !== 'Stone') return null;
      if (!document.getElementById('g5-stone-css')) {
        var st = document.createElement('style'); st.id = 'g5-stone-css';
        st.textContent = '.g5-stone .pc{filter:grayscale(1) brightness(.78) contrast(1.15) drop-shadow(0 0 1px #555)}';
        document.head.appendChild(st);
      }
      return { cls: 'g5-stone', img: CM.settings.pieceUrl(p.was || 'w', p.from || 'P') };
    },
    afterMove: function (ctx, m, info) {
      var p = ctx.at(m.t);
      if (p && p.t === 'Stone') { ctx.fx({ type: 'piece_transform', at: m.t, style: 'fade', duration_ms: 420 }); ctx.fx({ type: 'particles', kind: 'dust', at: m.t, count: 14 }); }
    }
  });
})();
