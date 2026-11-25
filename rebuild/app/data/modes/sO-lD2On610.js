/* Can I BEAT Pac-Man Chess?  chess.com 4-player community variant "Pac-Man". Rules re-checked from the full transcript
   (g6b 2026-11-25, analyze_video): "each yellow and red player starts with a wazir, a Bob that can survive three checks"
   (0:03); "for every blue piece captured, points are earned with checkmate being 10 points" (0:10); "the green pieces ...
   are played by a bot with a 50% chance of playing an attacking move and a 50% chance of playing a random move. And green
   pieces can never be captured" (0:17); "the goal is to have the most points before either player is checkmated. And if
   you get captured by green, the value of the remaining pieces goes to the opponent" (0:28); generals are worth more than
   the dabbabas next to them (1:13; "this final general for five points" 2:03); red moves first; 3 min + 2 s (6:52);
   opponents Captain Rex 1476 (0:44), givemethewin 1495 (2:45). Board: the maze crop research/frames/sprites/
   sO-lD2On610_maze.png read cell by cell (14x14 4-player board, 3x3 corners cut, grey stone walls, ghost house of two green
   pawns over two green rooks, yellow Bob on the left edge, red Bob on the right). Blue is out of the game (its pieces are the
   pellets). Inferred: which pellets are generals (the crop is too small to tell them from dabbabas), green pawns stepping
   one square orthogonally, a Bob dying on its third check (the counter shows 3 left; "only has one check left" after two). */
CM.mode({
  id: 'sO-lD2On610',
  title: 'Can I BEAT Pac-Man Chess?',
  name: 'Pac-Man Chess',
  category: 'Variants & Games',
  description: 'You (Red) and Yellow each have one piece: Bob, a wazir (one step straight) who survives two checks and dies on the third. The blue pellets are points: dabbabas 1, generals 5. Green\'s ghosts are a bot (half attacking moves, half random), give check and can never be captured. Checkmate is worth 10, and whoever survives also takes every pellet still on the board.',
  how_to_win: 'Have the most points when a Bob is checkmated, captured or out of checks.',
  player_side: 'white',
  player: { name: 'You (Red)', rating: null, avatar: 'assets/avatars/iwantcheckmate.png' },
  opponent: { name: 'Captain Rex', rating: 1476, avatar: null, tagline: 'Yellow. Green is a 50% attacking / 50% random bot.' },
  board: { files: 14, ranks: 14, light: '#3d3f3b', dark: '#373934', background: '#262522',
    mask: ['xxx........xxx', 'xxx........xxx', 'xxx........xxx', '..............', '..............', '..............', '..............', '..............', '..............', '..............', '..............', 'xxx........xxx', 'xxx........xxx', 'xxx........xxx'] },
  pieces: {
    Bo: { name: 'Bob', san: 'W', moves: 'W', royal: true, value: 1000, glyph: 'K', badge: null },
    Pr: { name: 'Dabbaba pellet', moves: '', value: 60, points: 1, img: 'assets/modes/sO-lD2On610/pellet_rook.png', neutralGlow: false },
    Pp: { name: 'General pellet', moves: '', value: 300, points: 5, img: 'assets/modes/sO-lD2On610/pellet_pawn.png', neutralGlow: false },
    Gr: { name: 'Green rook', moves: 'R', value: 0, capturable: false, attacks: true, glyph: 'R', glyphColor: 'w', cls: 'pc--tint-g', neutralGlow: false },
    Gp: { name: 'Green pawn', moves: 'W', value: 0, capturable: false, attacks: true, glyph: 'P', glyphColor: 'w', cls: 'pc--tint-g', neutralGlow: false },
    '#': { name: 'Wall', overlay: null, img: 'assets/modes/sO-lD2On610/wall.png' }   /* stone cell cut from the maze crop */
  },
  setup: { fen: '3[n:Pr][n:Pp][n:Pr]**[n:Pr][n:Pp][n:Pr]3/3[n:Pr]*[n:Pr]**[n:Pr]*[n:Pr]3/3[n:Pr]*[n:Pr][n:Pp][n:Pp][n:Pr]*[n:Pr]3/[n:Pr][n:Pr][n:Pr][n:Pr][n:Pr][n:Pr]**[n:Pr][n:Pr][n:Pr][n:Pr][n:Pr][n:Pr]/[n:Pr]***[n:Pr]****[n:Pr]***[n:Pr]/[n:Pp][n:Pr][n:Pr][n:Pr][n:Pr][n:Pr][n:Pp][n:Pp][n:Pr][n:Pr][n:Pr][n:Pr][n:Pr][n:Pp]/[n:Pr]*[n:Pr]*[n:Pr]*[n:Gp][n:Gp]*[n:Pr]*[n:Pr]*[n:Pr]/[n:Pr][n:Pr][n:Pr]*[n:Pr]*[n:Gr][n:Gr]*[n:Pr]*[n:Pr][n:Pr][n:Pr]/**[n:Pr]*[n:Pr]****[n:Pr]*[n:Pr]**/[bo]*[n:Pr][n:Pr][n:Pr][n:Pr][n:Pr][n:Pr][n:Pr][n:Pr][n:Pr][n:Pr]*[Bo]/[n:Pp][n:Pr][n:Pr]**[n:Pr]**[n:Pr]**[n:Pr][n:Pr][n:Pp]/3[n:Pr]*[n:Pr][n:Pr][n:Pr][n:Pr]*[n:Pr]3/3[n:Pr]**[n:Pr][n:Pr]**[n:Pr]3/3[n:Pr][n:Pp][n:Pr][n:Pr][n:Pr][n:Pr][n:Pp][n:Pr]3', turn: 'w', x: { sc: { w: 0, b: 0 }, chk: { w: 0, b: 0 } } },
  rules: { check: 'standard', castling: false, enPassant: false, promotion: false, drawPlies: 400, stalemate: 'draw' },
  clock: '3+2',
  bot: { engine: 'search', depth: 3, time_ms: 500 },
  params: { series: { opponents: [{ name: 'Captain Rex', rating: 1476 }, { name: 'givemethewin', rating: 1495 }, { name: 'Yellow', rating: null }, { name: 'New player', rating: null }] } },
  hooks: (function () {
    var OP = { w: 'b', b: 'w' }, NAME = { w: 'Red', b: 'Yellow' };
    function pts(V, p) { return p && p.c === 'n' && !p.dead ? (V.def(p.t).points || 0) : 0; }
    function left(V, st) { var s = 0; for (var i = 0; i < st.b.length; i++) s += pts(V, st.b[i]); return s; }
    function X(st) { return st.x || {}; }
    function finish(V, st, loser, why, mated) {   /* the survivor takes the pellets still on the board (+10 for a checkmate) */
      var sc = Object.assign({ w: 0, b: 0 }, X(st).sc), win = OP[loser];
      sc[win] += left(V, st) + (mated ? 10 : 0);
      var tag = ' (Red ' + sc.w + ' · Yellow ' + sc.b + ')';
      if (sc.w === sc.b) return { w: 'd', why: NAME[loser] + ' ' + why + ', points tied' + tag };
      return { w: sc.w > sc.b ? 'w' : 'b', why: NAME[loser] + ' ' + why + tag };
    }
    function greenMoves(V, st) {   /* rooks slide, pawns step one square (inferred); they eat pellets and Bobs, never walls or ghosts */
      var g = V.geo, out = [], D = [[1, 0], [-1, 0], [0, 1], [0, -1]];
      st.b.forEach(function (p, i) {
        if (!p || p.c !== 'n' || (p.t !== 'Gr' && p.t !== 'Gp')) return;
        D.forEach(function (d) {
          var j = i;
          for (var s = 0; s < (p.t === 'Gr' ? 99 : 1); s++) {
            j = g.step(j, d[0], d[1]); if (j < 0) break; var q = st.b[j];
            if (!q) { out.push({ f: i, t: j }); continue; }
            if (q.t !== '#' && q.t !== 'Gr' && q.t !== 'Gp') out.push({ f: i, t: j, cap: q });
            break;
          }
        });
      });
      return out;
    }
    function greenTurn(ctx) {
      var V = ctx.V, st = ctx.state, ms = greenMoves(V, st); if (!ms.length || ctx.over) return;
      var bobs = ['w', 'b'].map(function (c) { return V.royals(st, c)[0]; }).filter(function (k) { return k != null; });
      var attack = ms.filter(function (m) {   /* takes a Bob, or lands where it hits a Bob */
        if (m.cap && m.cap.t === 'Bo') return true;
        var b2 = st.b.slice(); b2[m.t] = b2[m.f]; b2[m.f] = null; var s2 = Object.assign({}, st, { b: b2 });
        return bobs.some(function (k) { return V._attBy(s2, k, 'n'); });
      });
      var aggressive = attack.length && ctx.chance(0.5), m = aggressive ? ctx.pick(attack.filter(function (a) { return a.cap && a.cap.t === 'Bo'; }).concat(attack.some(function (a) { return a.cap && a.cap.t === 'Bo'; }) ? [] : attack)) : ctx.pick(ms);
      var before = {}; ['w', 'b'].forEach(function (c) { var k = V.royals(st, c)[0]; before[c] = k != null && V.inCheck(st, c); });
      ctx.move(m.f, m.t); ctx.sound(m.cap ? 'capture' : 'move-opponent');
      var now = ctx.state, chk = Object.assign({ w: 0, b: 0 }, X(now).chk);
      ['w', 'b'].forEach(function (c) { if (V.royals(now, c).length && !before[c] && V.inCheck(now, c)) { chk[c]++; ctx.toast('Green checks ' + NAME[c] + ' (' + Math.max(0, 3 - chk[c]) + ' checks left)', 1800); } });
      ctx.setX('chk', chk);
      ctx.toast(aggressive ? 'Green plays an attacking move.' : 'Green plays a random move.', 1200);
      ctx.refresh();
    }
    return {
      init: function () { if (!document.getElementById('pac-css')) { var s = document.createElement('style'); s.id = 'pac-css'; s.textContent = '.pac-r .pc{filter:sepia(1) saturate(6) hue-rotate(-38deg) brightness(.9)}.pac-y .pc{filter:sepia(1) saturate(7) hue-rotate(5deg) brightness(1.05)}'; document.head.appendChild(s); } },
      onMake: function (V, st, m, n) {
        var cap = st.b[m.capSq != null ? m.capSq : m.t], x = Object.assign({}, n.x);
        var p = pts(V, cap); if (p) { x.sc = Object.assign({ w: 0, b: 0 }, x.sc); x.sc[st.turn] += p; }
        var o = OP[st.turn]; if (V.royals(n, o).length && V.inCheck(n, o)) { x.chk = Object.assign({ w: 0, b: 0 }, x.chk); x.chk[o]++; }
        n.x = x;
      },
      checkWin: function (V, st, moves) {
        var chk = X(st).chk || {};
        for (var k = 0; k < 2; k++) { var c = k ? 'b' : 'w';
          if (!V.royals(st, c).length) return finish(V, st, c, 'lost Bob', true);
          if ((chk[c] || 0) >= 3) return finish(V, st, c, 'ran out of checks', true); }
        if (!moves.length) return V.inCheck(st, st.turn) ? finish(V, st, st.turn, 'was checkmated', true) : finish(V, st, st.turn, 'was stalemated', false);
        return null;
      },
      evaluate: function (V, st) { var s = X(st).sc || {}, c = X(st).chk || {}; return ((s.w || 0) - (s.b || 0)) * 40 - ((c.w || 0) - (c.b || 0)) * 150; },
      afterMove: function (ctx, m, info) {
        if (!info || info.by !== 'bot' || ctx.over) return null;   /* turn order Red, (Blue out), Yellow, Green */
        return new Promise(function (res) { ctx.after(320, function () { greenTurn(ctx); res(); }); });
      },
      decorate: function (ctx, sq, p) {
        if (!p || p.t !== 'Bo') return null; var c = X(ctx.state).chk || {};
        return { cls: p.c === 'w' ? 'pac-r' : 'pac-y', badge: String(Math.max(0, 3 - (c[p.c] || 0))) };   /* checks left, as the board shows */
      },
      status: function (ctx) { var s = X(ctx.state).sc || {}, c = X(ctx.state).chk || {};
        return 'Red (you) ' + (s.w || 0) + ' · Yellow ' + (s.b || 0) + ' · pellets left ' + left(ctx.V, ctx.state) + ' · checks left: Red ' + Math.max(0, 3 - (c.w || 0)) + ', Yellow ' + Math.max(0, 3 - (c.b || 0)); }
    };
  })(),
  todo_pass2: ['Blue/Green player bars and per-seat clocks (chess.com 4-player layout); green is a hook, not a seat', 'which pellets are generals (inferred; the maze crop is too small to tell)', 'the bonus real Pac-Man game at 13:50 (not built)'],
  source: { research: 'research/modes/sO-lD2On610.json', confidence: 'medium', notes: 'Rules from the full transcript (re-run 2026-11-25); maze read from the video crop; general placement and green pawn steps inferred.' }
});
