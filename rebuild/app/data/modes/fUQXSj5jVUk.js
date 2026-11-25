/* Chess Player Tries Xiangqi (Chinese Chess): standard Xiangqi online. 9 files x 10 ranks (pieces drawn on squares
   here; the river runs between ranks 5 and 6, palaces d1-f3 / d8-f10). Red (you, bottom) moves first.
   Sources: research/modes/fUQXSj5jVUk.json, frames visual_* (cream paper board #f6f6ea/#d2d2c6, purple legal dots).
   General + Advisors stay in the palace, Elephants never cross the river (blocked at the eye), Horses are blocked at
   the leg, Cannons capture by jumping one screen, Soldiers step forward and also sideways after crossing the river,
   the two Generals may never face each other on an open file, and a stalemated side loses (Xiangqi rule). */
CM.mode({
  id: 'fUQXSj5jVUk',
  title: 'Chess Player Tries Xianqi (Chinese Chess)',
  name: 'Xiangqi (Chinese Chess)',
  category: 'Other Videos',
  description: 'Real Xiangqi on a 9x10 board with a river in the middle. Chariots move like rooks; Horses move like knights but are blocked by a piece right next to them; Elephants move exactly two squares diagonally and cannot cross the river; Advisors step diagonally and the General steps straight, both only inside the 3x3 palace; Cannons move like rooks but capture only by jumping exactly one piece; Soldiers step forward, and sideways too once across the river. The two Generals may never face each other on an open file.',
  how_to_win: 'Checkmate (or stalemate) the black General.',
  player_side: 'white',
  player: { name: 'You (Red)' },
  opponent: { name: 'Online opponent', rating: 1200, tagline: 'Xiangqi site player (Black).' },
  board: { files: 9, ranks: 10, light: '#f6f6ea', dark: '#f6f6ea', image: 'assets/modes/fUQXSj5jVUk/board.png' },  /* xiangqi.com board as in the frames: lines through square centres = intersections (tools/g4_thumbcrops.py) */
  theme: { background: '#3b2f22' },
  clock: { w: 600, b: 600, inc: 0 },  /* site clocks in the frames start at 10:00 */
  pieces: {
    XR: { name: 'Chariot', moves: 'R', value: 900, img: { w: 'assets/modes/fUQXSj5jVUk/chariot_r.png', b: 'assets/modes/fUQXSj5jVUk/chariot_b.png' } },
    XH: { name: 'Horse', moves: 'nN', value: 400, img: { w: 'assets/modes/fUQXSj5jVUk/horse_r.png', b: 'assets/modes/fUQXSj5jVUk/horse_b.png' } },
    XE: { name: 'Elephant', moves: 'nA', value: 200, img: { w: 'assets/modes/fUQXSj5jVUk/elephant_r.png', b: 'assets/modes/fUQXSj5jVUk/elephant_b.png' } },
    XA: { name: 'Advisor', moves: 'F', value: 200, glyph: 'B', badge: '士' },
    XK: { name: 'General', moves: 'W', royal: true, value: 0, img: { w: 'assets/modes/fUQXSj5jVUk/general_r.png', b: 'assets/modes/fUQXSj5jVUk/general_b.png' } },
    XC: { name: 'Cannon', moves: 'mRcpR', value: 450, glyph: 'R', badge: '炮' },
    XS: { name: 'Soldier', moves: 'fW', value: 100, img: { w: 'assets/modes/fUQXSj5jVUk/soldier_r.png', b: 'assets/modes/fUQXSj5jVUk/soldier_b.png' } },
    XT: { name: 'Soldier (across the river)', moves: 'fsW', value: 200, img: { w: 'assets/modes/fUQXSj5jVUk/soldier_r.png', b: 'assets/modes/fUQXSj5jVUk/soldier_b.png' } }
  },
  setup: { fen: '[xr][xh][xe][xa][xk][xa][xe][xh][xr]/9/1[xc]5[xc]1/[xs]1[xs]1[xs]1[xs]1[xs]/9/9/[XS]1[XS]1[XS]1[XS]1[XS]/1[XC]5[XC]1/9/[XR][XH][XE][XA][XK][XA][XE][XH][XR]' },
  rules: { castling: false, enPassant: false, promotion: false, stalemate: 'loss', drawPlies: 240 },
  bot: { engine: 'search', elo: 1200, depth: 3, time_ms: 800, min_ms: 400 },
  hooks: {
    filterMoves: function (V, st, legal) {
      var g = V.geo;
      function inPalace(sq, c) { var col = g.col(sq), rr = g.relRow(sq, c); return col >= 3 && col <= 5 && rr <= 2; }
      return legal.filter(function (m) {
        var t = m.p;
        if ((t === 'XK' || t === 'XA') && !inPalace(m.t, m.c)) return false;
        if (t === 'XE' && g.relRow(m.t, m.c) > 4) return false;
        /* flying general: after the move the two generals may not see each other on a file */
        var n = m.n || V.make(st, m), ks = [];
        for (var i = 0; i < n.b.length; i++) if (n.b[i] && n.b[i].t === 'XK') ks.push(i);
        if (ks.length === 2 && g.col(ks[0]) === g.col(ks[1])) {
          var a = Math.min(g.row(ks[0]), g.row(ks[1])), b = Math.max(g.row(ks[0]), g.row(ks[1])), open = true;
          for (var r = a + 1; r < b; r++) if (n.b[g.idx(g.col(ks[0]), r)]) { open = false; break; }
          if (open) return false;
        }
        return true;
      });
    },
    onMake: function (V, st, m, n) {
      var p = n.b[m.t]; if (!p || p.t !== 'XS') return;
      if (V.geo.relRow(m.t, p.c) >= 5) n.b[m.t] = Object.assign({}, p, { t: 'XT' });
    },
    init: function () {
      if (document.getElementById('g4xq-css')) return;
      var c = document.createElement('style'); c.id = 'g4xq-css';
      c.textContent = '.g4xq-palace{box-shadow:inset 0 0 0 999px rgba(160,110,40,.12)}';
      document.head.appendChild(c);
    }
  },
  source: { research: 'research/modes/fUQXSj5jVUk.json', confidence: 'high', notes: 'Standard Xiangqi rules. Pieces sit on squares instead of line intersections in pass 1; opponent rating inferred.' }
});
