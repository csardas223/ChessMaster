/* g6_tiny5d (impl-6a, 2026-11-25): Tiny 5D Chess (qSwTtgUWqUw), the 4x4 mode of "5D Chess With Multiverse Time Travel".
   Sources: research/modes/qSwTtgUWqUw.json + research/frames/sprites/qSwTtgUWqUw_tiny_4x4_board.png (start: Black
   N B R K on rank 4, White K R B N on rank 1, four pawns each on ranks 3 / 2; tan #f6daad/#d3b07e squares on a light
   blue-grey table) and qSwTtgUWqUw_multiverse_timelines.png (boards in rows per timeline joined by purple bands, purple
   time-travel arrows, Undo Move / Submit Moves pills on top, a lighter column marking the present).
   Rules (5D Chess, from game knowledge; the video shows them in play):
   - The multiverse is timelines (rows, L) of boards along time (columns, T = half-moves; even T = White to move).
   - Pieces move on 4 axes: file, rank, time (one step = one full turn back/forward: T +-2) and timeline (L +-1).
     Rook: one axis, any distance. Bishop: exactly two axes, equal distance. Queen/King: any axes (King 1 step).
     Knight: 2 on one axis + 1 on another. Pawn: one step forward on its board (diagonal capture), or one timeline
     "forward" (White toward the negative timelines above, Black toward the positive ones below), capturing one turn
     back or forward on that timeline; promotes to a queen on the last rank.
   - Only a timeline's newest board can be moved from (when it is your colour's turn there). Moving onto an older
     board branches a NEW timeline (White's below, Black's above) whose first board is that board plus the piece.
   - The present = the earliest newest-board among all timelines. You must move on every board at the present, then
     press Submit Moves; you may also move on your other newest boards. You may not submit while any of your kings
     could be captured (check), and the turn passes only when the present has moved to the opponent.
   - No legal submission: checkmate if in check, otherwise stalemate (draw).
   Simplified (stated in the mode text): all timelines are active (no inactive-timeline rule), at most 6 timelines,
   no castling / en passant (4x4 has neither in Tiny anyway). The bot samples submissions and scores them by material.
   Sounds: chess.com core set (move-self / move-opponent / capture / move-check / promote / game-end). */
(function () {
  'use strict';
  var CM = window.CM;
  var N = 4, VAL = { P: 100, N: 300, B: 320, R: 500, Q: 900, K: 0 }, MAXTL = 6;
  function combos(maxNonZero, minNonZero, equal) {
    var out = [];
    for (var a = -1; a <= 1; a++) for (var b = -1; b <= 1; b++) for (var c = -1; c <= 1; c++) for (var d = -1; d <= 1; d++) {
      var nz = (a ? 1 : 0) + (b ? 1 : 0) + (c ? 1 : 0) + (d ? 1 : 0);
      if (nz >= minNonZero && nz <= maxNonZero) out.push([a, b, c, d]);
    }
    return out;
  }
  var DIR = { R: combos(1, 1), B: combos(2, 2), Q: combos(4, 1), K: combos(4, 1) };
  DIR.N = (function () { var o = []; for (var i = 0; i < 4; i++) for (var j = 0; j < 4; j++) { if (i === j) continue; [-2, 2].forEach(function (s2) { [-1, 1].forEach(function (s1) { var v = [0, 0, 0, 0]; v[i] = s2; v[j] = s1; o.push(v); }); }); } return o; })();
  function other(c) { return c === 'w' ? 'b' : 'w'; }
  function colorAt(T) { return T % 2 === 0 ? 'w' : 'b'; }

  /* ---------- multiverse ---------- */
  function startBoard() { var b = new Array(16).fill(null); 'NBRK'.split('').forEach(function (t, i) { b[i] = 'b' + t; b[4 + i] = 'bP'; b[8 + i] = 'wP'; }); 'KRBN'.split('').forEach(function (t, i) { b[12 + i] = 'w' + t; }); return b; }
  function clone(mv) { var t = {}; Object.keys(mv.tls).forEach(function (k) { var x = mv.tls[k]; t[k] = { L: x.L, start: x.start, boards: x.boards.slice(), parent: x.parent }; }); return { tls: t, arrows: mv.arrows.slice() }; }
  function Ls(mv) { return Object.keys(mv.tls).map(Number).sort(function (a, b) { return a - b; }); }
  function endT(tl) { return tl.start + tl.boards.length - 1; }
  function boardAt(mv, L, T) { var tl = mv.tls[L]; if (!tl || T < tl.start || T > endT(tl)) return null; return tl.boards[T - tl.start]; }
  function present(mv) { var p = 1e9; Ls(mv).forEach(function (L) { p = Math.min(p, endT(mv.tls[L])); }); return p; }
  function playable(mv, L, T, c) { var tl = mv.tls[L]; return tl && endT(tl) === T && colorAt(T) === c; }

  /* all moves of the piece at (L, T, sq) */
  function pieceMoves(mv, L, T, sq, out) {
    var B = boardAt(mv, L, T), p = B && B[sq]; if (!p) return out; var c = p[0], t = p[1], x = sq % N, y = (sq / N) | 0;
    function push(L2, T2, x2, y2, capOnly, quietOnly) {
      if (x2 < 0 || x2 >= N || y2 < 0 || y2 >= N) return 'off';
      var D = boardAt(mv, L2, T2); if (!D) return 'off';
      var q = D[y2 * N + x2];
      if (q) { if (q[0] !== c && !quietOnly) out.push({ L: L, T: T, f: sq, L2: L2, T2: T2, t: y2 * N + x2, cap: q }); return 'stop'; }
      if (!capOnly) out.push({ L: L, T: T, f: sq, L2: L2, T2: T2, t: y2 * N + x2, cap: null });
      return 'go';
    }
    if (t === 'P') {
      var fy = c === 'w' ? -1 : 1, fl = c === 'w' ? -1 : 1;
      push(L, T, x, y + fy, false, true);
      push(L, T, x - 1, y + fy, true); push(L, T, x + 1, y + fy, true);
      push(L + fl, T, x, y, false, true);
      push(L + fl, T - 2, x, y, true); push(L + fl, T + 2, x, y, true);
      return out;
    }
    var slide = t === 'R' || t === 'B' || t === 'Q';
    DIR[t].forEach(function (d) {
      for (var k = 1; k <= 8; k++) {
        var r = push(L + k * d[3], T + 2 * k * d[2], x + k * d[0], y + k * d[1]);
        if (r !== 'go' || !slide) break;
      }
    });
    return out;
  }
  function boardMoves(mv, L, T) { var B = boardAt(mv, L, T), out = []; if (!B) return out; var c = colorAt(T); for (var i = 0; i < 16; i++) if (B[i] && B[i][0] === c) pieceMoves(mv, L, T, i, out); return out; }
  function promo(p, sq) { return p[1] === 'P' && ((p[0] === 'w' && sq < N) || (p[0] === 'b' && sq >= 12)) ? p[0] + 'Q' : p; }
  /* apply in place on a cloned multiverse; returns the arrow it drew (time / timeline travel) or null */
  function apply(mv, m) {
    var S = boardAt(mv, m.L, m.T), p = S[m.f], ns = S.slice(); ns[m.f] = null; var c = p[0];
    if (m.L2 === m.L && m.T2 === m.T) { ns[m.t] = promo(p, m.t); mv.tls[m.L].boards.push(ns); return null; }
    var D = boardAt(mv, m.L2, m.T2), wasEnd = endT(mv.tls[m.L2]) === m.T2;
    mv.tls[m.L].boards.push(ns);
    var nd = D.slice(), toL = m.L2, toT = m.T2 + 1; nd[m.t] = promo(p, m.t);
    if (wasEnd && !(m.L2 === m.L)) mv.tls[m.L2].boards.push(nd);
    else {
      var ls = Ls(mv); toL = c === 'w' ? ls[ls.length - 1] + 1 : ls[0] - 1;
      mv.tls[toL] = { L: toL, start: toT, boards: [nd], parent: { L: m.L2, T: m.T2 } };
    }
    var a = { L: m.L, T: m.T, f: m.f, L2: toL, T2: toT, t: m.t, branch: !wasEnd || m.L2 === m.L };
    mv.arrows.push(a); return a;
  }
  /* can colour `by` capture a king of `of` from any of by's playable boards? */
  function attacked(mv, of, by) {
    var hit = false;
    Ls(mv).some(function (L) {
      var tl = mv.tls[L], T = endT(tl); if (colorAt(T) !== by) return false;
      var ms = boardMoves(mv, L, T);
      for (var i = 0; i < ms.length; i++) if (ms[i].cap && ms[i].cap === of + 'K') { hit = true; return true; }
      return false;
    });
    return hit;
  }
  function mandatory(mv, c) { var P = present(mv); if (colorAt(P) !== c) return []; return Ls(mv).filter(function (L) { return endT(mv.tls[L]) === P; }); }
  function canSubmit(mv, c) { return colorAt(present(mv)) !== c && !attacked(mv, c, other(c)); }
  function tlCount(mv) { return Ls(mv).length; }
  function legalHere(mv, m) { if (tlCount(mv) >= MAXTL && (m.L2 !== m.L || m.T2 !== m.T)) { var ok = playable(mv, m.L2, m.T2, colorAt(m.T)) && m.L2 !== m.L; return ok; } return true; }
  /* does colour c have any legal submission? (bounded DFS over the mandatory boards) */
  function hasLegal(mv, c) {
    var budget = { n: 6000 };
    function dfs(cur) {
      if (--budget.n < 0) return true; /* assume yes when the search is too big */
      var man = mandatory(cur, c); if (!man.length) return canSubmit(cur, c);
      var L = man[0], ms = boardMoves(cur, L, endT(cur.tls[L])).filter(function (m) { return legalHere(cur, m); });
      for (var i = 0; i < ms.length; i++) { var n = clone(cur); apply(n, ms[i]); if (dfs(n)) return true; }
      return false;
    }
    return dfs(mv);
  }
  function material(mv) { var s = 0; Ls(mv).forEach(function (L) { var tl = mv.tls[L], B = tl.boards[tl.boards.length - 1]; B.forEach(function (p, i) { if (!p) return; var v = VAL[p[1]] + (p[1] === 'P' ? (p[0] === 'b' ? ((i / N) | 0) : 3 - ((i / N) | 0)) * 15 : 0); s += p[0] === 'b' ? v : -v; }); }); return s; }

  CM.defineGame('g6_tiny5d', function (host) {
    var cvs = host.canvas, g = host.g, imgs = {}, pend = [], mv, hist, sel, running, busy, log, turnNo, pan, rects, btns, lastArrows, cur;
    var P0 = host.params || {}, LIGHT = P0.light || '#f6daad', DARK = P0.dark || '#d3b07e', BG = P0.bg || '#d9dee3';
    function img(c, t) { var k = c + t; if (!imgs[k]) { imgs[k] = new Image(); imgs[k].onload = draw; imgs[k].src = host.pieceUrl(c, t); } return imgs[k]; }
    function name(m) { return 'abcd'[m.t % N] + (N - ((m.t / N) | 0)); }
    function label(L) { return L === 0 ? '0' : (L > 0 ? '+' : '') + L; }
    function mname(m, a) {
      var B = boardAt(mv, m.L, m.T), p = B[m.f];
      return '(L' + label(m.L) + ' T' + (Math.floor(m.T / 2) + 1) + ')' + (p[1] === 'P' ? '' : p[1]) + (m.cap ? 'x' : '') + (m.L2 !== m.L || m.T2 !== m.T ? '\u2192(L' + label(m.L2) + ' T' + (Math.floor(m.T2 / 2) + 1) + ')' : '') + name(m);
    }
    function doMove(m, by) {
      var line = mname(m), cap = m.cap; hist.push(clone(mv)); var a = apply(mv, m); pend.push(line);
      if (a) { cur.push(a); if (a.branch) host.toast('New timeline L' + label(a.L2) + '!', 1300); }
      host.sound(cap ? 'capture' : by === 'me' ? 'move-self' : 'move-opponent');
      showMoves(); sel = null;
    }
    function showMoves() { host.setMoves(log.concat(pend.length ? [pend.join(' ')] : [])); }
    function commit() { if (pend.length) log.push(pend.join(' ')); pend = []; showMoves(); }
    function submit() {
      if (!running || busy) return;
      if (colorAt(present(mv)) === 'w') { host.toast('Move on every board at the present first.', 1600); return; }
      if (attacked(mv, 'w', 'b')) { host.toast('Your king is in check: you cannot submit these moves.', 1800); host.sound('illegal'); return; }
      hist = []; lastArrows = cur; cur = []; commit();
      if (!hasLegal(mv, 'b')) return end(attacked(mv, 'b', 'w') ? 'win' : 'draw', attacked(mv, 'b', 'w') ? 'checkmate across the multiverse' : 'stalemate');
      if (attacked(mv, 'b', 'w')) host.sound('move-check');
      busy = true; host.setThinking('thinking'); draw(); hud();
      host.after(450, botTurn);
    }
    function botTurn() {
      if (!running) return;
      var best = null, bestV = -1e9;
      for (var k = 0; k < 160; k++) {
        var t = clone(mv), seq = [], ok = true;
        for (var guard = 0; guard < 8; guard++) {
          var man = mandatory(t, 'b'); if (!man.length) break;
          var L = man[0], ms = boardMoves(t, L, endT(t.tls[L])).filter(function (m) { return legalHere(t, m); });
          if (!ms.length) { ok = false; break; }
          ms.forEach(function (m) { m.s = (m.cap ? (m.cap[1] === 'K' ? 1e5 : VAL[m.cap[1]]) : 0) + Math.random() * 120 + (m.L2 !== m.L || m.T2 !== m.T ? 15 : 0); });
          ms.sort(function (a, b) { return b.s - a.s; });
          var pick = ms[Math.min(ms.length - 1, Math.floor(Math.random() * Math.random() * 4))];
          seq.push(pick); apply(t, pick);
        }
        if (!ok || !canSubmit(t, 'b')) continue;
        var threat = 0; Ls(t).forEach(function (L) { var T = endT(t.tls[L]); if (colorAt(T) !== 'w') return; boardMoves(t, L, T).forEach(function (m) { if (m.cap) threat = Math.max(threat, VAL[m.cap[1]] || 0); }); });
        var v = material(t) - threat * 0.6 + (attacked(t, 'w', 'b') ? 40 : 0) + Math.random() * 10;
        if (v > bestV) { bestV = v; best = seq; }
      }
      if (!best) { /* fall back to the first legal sequence */
        (function dfs(curMv, seq) { if (best) return; var man = mandatory(curMv, 'b'); if (!man.length) { if (canSubmit(curMv, 'b')) best = seq; return; } var L = man[0]; boardMoves(curMv, L, endT(curMv.tls[L])).filter(function (m) { return legalHere(curMv, m); }).some(function (m) { var n = clone(curMv); apply(n, m); dfs(n, seq.concat([m])); return !!best; }); })(mv, []);
      }
      busy = false; host.setThinking('');
      if (!best) return end('win', 'Black has no legal moves');
      /* replay the chosen moves on the real multiverse (re-resolve by coordinates) */
      best.forEach(function (m) { doMove(m, 'bot'); });
      hist = []; lastArrows = cur; cur = []; commit(); turnNo++;
      if (!hasLegal(mv, 'w')) return end(attacked(mv, 'w', 'b') ? 'loss' : 'draw', attacked(mv, 'w', 'b') ? 'checkmated across the multiverse' : 'stalemate');
      if (attacked(mv, 'w', 'b')) { host.sound('move-check'); host.toast('Check!', 1000); }
      if (turnNo > 60) return end('draw', 'move limit');
      pan = 0; draw(); hud();
    }
    function end(r, why) { running = false; busy = false; host.setThinking(''); draw(); hud(); host.over({ result: r, why: why }); }
    function hud() {
      var man = mandatory(mv, 'w').length, ok = running && !busy && canSubmit(mv, 'w');
      host.status(!running ? 'Game over' : busy ? '5D opponent is moving...' : (man ? 'Your move: ' + man + ' board' + (man > 1 ? 's' : '') + ' at the present still need a move' : ok ? 'Press Submit Moves' : 'Your king is in check: change your moves') + ' · ' + tlCount(mv) + ' timeline' + (tlCount(mv) > 1 ? 's' : ''));
    }
    /* ---------- layout + drawing ---------- */
    function geom() {
      var W = cvs.width, H = cvs.height, top = Math.round(H * 0.09), ls = Ls(mv), rows = ls.length, minT = 1e9, maxT = -1;
      ls.forEach(function (L) { var tl = mv.tls[L]; minT = Math.min(minT, tl.start); maxT = Math.max(maxT, endT(tl)); });
      var cols = Math.min(4, maxT - minT + 1), gap = Math.round(W * 0.03);
      var s = Math.floor(Math.min((W - gap * (cols + 1)) / cols, (H - top - gap * (rows + 1)) / rows));
      var t1 = Math.max(minT + cols - 1, maxT - pan), t0 = t1 - cols + 1;
      return { W: W, H: H, top: top, ls: ls, s: s, gap: gap, t0: t0, t1: t1, cols: cols, minT: minT, maxT: maxT,
        x: function (T) { return gap + (T - t0) * (s + gap) + Math.max(0, (W - gap - cols * (s + gap)) / 2); },
        y: function (L) { return top + gap + ls.indexOf(L) * (s + gap) + Math.max(0, (H - top - gap - rows * (s + gap)) / 2); } };
    }
    function rr(x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
    function draw() {
      if (!mv) return; var G = geom(), s = G.s, W = G.W, H = G.H, pad = s * 0.07, sq = (s - 2 * pad) / N; rects = []; btns = [];
      g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = BG; g.fillRect(0, 0, W, H);
      /* present column */
      var Pt = present(mv); if (Pt >= G.t0 && Pt <= G.t1) { g.fillStyle = 'rgba(255,255,255,0.55)'; g.fillRect(G.x(Pt) - G.gap * 0.4, G.top, s + G.gap * 0.8, H - G.top); }
      /* purple timeline bands + branch connectors */
      g.lineCap = 'round';
      G.ls.forEach(function (L) {
        var tl = mv.tls[L], a = Math.max(tl.start, G.t0), b = Math.min(endT(tl), G.t1), y = G.y(L) + s / 2;
        g.strokeStyle = 'rgba(140,90,200,0.75)'; g.lineWidth = s * 0.28;
        if (a <= b) { g.beginPath(); g.moveTo(G.x(a) + s / 2, y); g.lineTo(G.x(b) + s / 2 + (endT(tl) === b ? 0 : s), y); g.stroke(); }
        if (tl.parent && tl.start >= G.t0) { var px = G.x(tl.parent.T) + s / 2, py = G.y(tl.parent.L) + s / 2; g.beginPath(); g.moveTo(px, py); g.bezierCurveTo(px + s * 0.6, py, G.x(tl.start) - s * 0.2, y, G.x(tl.start) + s / 2, y); g.stroke(); }
      });
      /* boards */
      var dests = {}; if (sel) pieceMoves(mv, sel.L, sel.T, sel.sq, []).forEach(function (m) { if (legalHere(mv, m)) dests[m.L2 + ':' + m.T2 + ':' + m.t] = m; });
      G.ls.forEach(function (L) {
        var tl = mv.tls[L];
        for (var T = Math.max(tl.start, G.t0); T <= Math.min(endT(tl), G.t1); T++) {
          var B = boardAt(mv, L, T), x = G.x(T), y = G.y(L), isEnd = T === endT(tl), play = running && !busy && playable(mv, L, T, 'w');
          rects.push({ L: L, T: T, x: x, y: y, s: s });
          g.fillStyle = colorAt(T) === 'w' ? '#f7f7f5' : '#3b3b3e'; rr(x, y, s, s, s * 0.09); g.fill();
          if (play) { g.strokeStyle = '#7d4bd1'; g.lineWidth = Math.max(2, s * 0.035); rr(x, y, s, s, s * 0.09); g.stroke(); }
          for (var i = 0; i < 16; i++) {
            var cx = x + pad + (i % N) * sq, cy = y + pad + ((i / N) | 0) * sq;
            g.fillStyle = ((i % N) + ((i / N) | 0)) % 2 ? DARK : LIGHT; g.fillRect(cx, cy, sq + 0.5, sq + 0.5);
            if (sel && sel.L === L && sel.T === T && sel.sq === i) { g.fillStyle = 'rgba(255,255,60,0.55)'; g.fillRect(cx, cy, sq, sq); }
            var p = B[i]; if (p) { var im = img(p[0], p[1]); if (im.complete && im.naturalWidth) g.drawImage(im, cx, cy, sq, sq); }
            var d = dests[L + ':' + T + ':' + i];
            if (d) { g.fillStyle = d.L2 !== sel.L || d.T2 !== sel.T ? 'rgba(125,75,209,0.6)' : 'rgba(0,0,0,0.25)'; g.beginPath(); g.arc(cx + sq / 2, cy + sq / 2, sq * (p ? 0.44 : 0.18), 0, 7); g.fill(); }
          }
          g.fillStyle = colorAt(T) === 'w' ? '#555' : '#ddd'; g.font = Math.max(9, Math.round(s * 0.075)) + 'px sans-serif'; g.textAlign = 'right';
          g.fillText('L' + label(L) + ' T' + (Math.floor(T / 2) + 1), x + s - pad * 0.4, y + s - pad * 0.15);
        }
      });
      /* purple time-travel arrows (this turn's and the last turn's) */
      (lastArrows || []).concat(cur || []).forEach(function (a) {
        if (a.T < G.t0 || a.T > G.t1 || a.T2 < G.t0 || a.T2 > G.t1 || G.ls.indexOf(a.L) < 0 || G.ls.indexOf(a.L2) < 0) return;
        var x1 = G.x(a.T) + pad + (a.f % N + 0.5) * sq, y1 = G.y(a.L) + pad + (((a.f / N) | 0) + 0.5) * sq, x2 = G.x(a.T2) + pad + (a.t % N + 0.5) * sq, y2 = G.y(a.L2) + pad + (((a.t / N) | 0) + 0.5) * sq;
        g.strokeStyle = 'rgba(150,80,230,0.9)'; g.lineWidth = Math.max(3, sq * 0.22); g.beginPath(); g.moveTo(x1, y1); g.quadraticCurveTo((x1 + x2) / 2, Math.min(y1, y2) - s * 0.35, x2, y2); g.stroke();
        var ang = Math.atan2(y2 - (Math.min(y1, y2) - s * 0.35), x2 - (x1 + x2) / 2), hs = sq * 0.45; g.fillStyle = 'rgba(150,80,230,0.95)'; g.beginPath(); g.moveTo(x2, y2); g.lineTo(x2 - hs * Math.cos(ang - 0.5), y2 - hs * Math.sin(ang - 0.5)); g.lineTo(x2 - hs * Math.cos(ang + 0.5), y2 - hs * Math.sin(ang + 0.5)); g.closePath(); g.fill();
      });
      /* Undo Move / Submit Moves pills (as in the game) */
      var bh = G.top * 0.62, bw = W * 0.3, by = G.top * 0.2, okSub = running && !busy && canSubmit(mv, 'w');
      [{ k: 'undo', t: 'Undo Move', x: W / 2 - bw - W * 0.02, on: running && !busy && hist.length > 0 }, { k: 'submit', t: 'Submit Moves', x: W / 2 + W * 0.02, on: okSub }].forEach(function (b) {
        g.fillStyle = b.on ? (b.k === 'submit' ? '#7d4bd1' : '#ffffff') : 'rgba(255,255,255,0.45)'; rr(b.x, by, bw, bh, bh / 2); g.fill();
        g.strokeStyle = 'rgba(0,0,0,0.12)'; g.lineWidth = 1; g.stroke();
        g.fillStyle = b.on ? (b.k === 'submit' ? '#fff' : '#444') : 'rgba(60,60,60,0.45)'; g.font = Math.round(bh * 0.42) + 'px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(b.t, b.x + bw / 2, by + bh / 2); g.textBaseline = 'alphabetic';
        btns.push({ k: b.k, x: b.x, y: by, w: bw, h: bh });
      });
      if (G.maxT - G.minT + 1 > G.cols) { g.fillStyle = 'rgba(0,0,0,0.45)'; g.font = Math.round(G.top * 0.28) + 'px sans-serif'; g.textAlign = 'left'; g.fillText(pan > 0 ? '\u25b6 newer' : '\u25c0 history', G.gap, H - G.gap * 0.3); }
    }
    function undoMove() { if (!hist.length || busy || !running) return; mv = hist.pop(); cur = cur.filter(function (a) { return mv.arrows.indexOf(a) >= 0; }); pend.pop(); showMoves(); sel = null; draw(); hud(); }
    function tap(e) {
      if (!running || busy) return;
      var rc = cvs.getBoundingClientRect(), k = cvs.width / rc.width, x = (e.clientX - rc.left) * k, y = (e.clientY - rc.top) * k;
      var b = (btns || []).filter(function (q) { return x >= q.x && x < q.x + q.w && y >= q.y && y < q.y + q.h; })[0];
      if (b) { if (b.k === 'undo') undoMove(); else submit(); return; }
      var r = (rects || []).filter(function (q) { return x >= q.x && x < q.x + q.s && y >= q.y && y < q.y + q.s; })[0]; if (!r) { sel = null; draw(); return; }
      var pad = r.s * 0.07, sq = (r.s - 2 * pad) / N, cx = Math.floor((x - r.x - pad) / sq), cy = Math.floor((y - r.y - pad) / sq); if (cx < 0 || cy < 0 || cx >= N || cy >= N) return;
      var i = cy * N + cx, B = boardAt(mv, r.L, r.T);
      if (sel) {
        var m = pieceMoves(mv, sel.L, sel.T, sel.sq, []).filter(function (q) { return q.L2 === r.L && q.T2 === r.T && q.t === i && legalHere(mv, q); })[0];
        if (m) { doMove(m, 'me'); draw(); hud(); return; }
      }
      if (B[i] && B[i][0] === 'w' && playable(mv, r.L, r.T, 'w')) sel = { L: r.L, T: r.T, sq: i };
      else { if (B[i] && B[i][0] === 'w') host.toast('Only the newest board of a timeline can move.', 1400); sel = null; }
      draw();
    }
    function newGame() {
      mv = { tls: { 0: { L: 0, start: 0, boards: [startBoard()], parent: null } }, arrows: [] };
      hist = []; cur = []; lastArrows = []; sel = null; running = true; busy = false; log = []; pend = []; turnNo = 1; pan = 0;
      host.setMoves([]); draw(); hud();
    }
    return {
      start: function () { cvs.addEventListener('pointerdown', tap); newGame(); },
      newGame: newGame,
      stop: function () { running = false; cvs.removeEventListener('pointerdown', tap); },
      undo: undoMove,
      key: function (k, down) {
        if (!down) return; var G = geom();
        if (k === 'left') { pan = Math.min(pan + 1, Math.max(0, G.maxT - G.minT + 1 - G.cols)); draw(); }
        else if (k === 'right') { pan = Math.max(0, pan - 1); draw(); }
        else if (k === 'action' || k === 'jump') submit();
      },
      resize: function () { draw(); }, redraw: draw,
      /* QA hook: state snapshot */
      qa: function () { return { timelines: tlCount(mv), present: present(mv), running: running, busy: busy, canSubmit: canSubmit(mv, 'w') }; }
    };
  });
  CM.tiny5d = { boardMoves: boardMoves, apply: apply, clone: clone, attacked: attacked, hasLegal: hasLegal, present: present };
})();
