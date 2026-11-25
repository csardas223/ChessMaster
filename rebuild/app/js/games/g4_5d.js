/* g4_5d (group 4): 5D Chess With Multiverse Time Travel (BbgwPj-u_gs), REDUCED version (owner-approved).
   What is kept: standard pieces on 8x8 boards along a time axis and a timeline axis; every turn you move once on
   EVERY active timeline's present board; a piece may travel back in time to the same square of the board 1 or 2
   full turns ago on its timeline (an empty square, or a capture of an enemy piece there), which branches a NEW
   timeline from that past board (at most 3 timelines); capturing an enemy king on any board wins.
   Simplified: no check/checkmate legality (kings can be captured), no castling / en passant, pawns auto-queen, time
   travel only straight back along time (no diagonal or cross-timeline moves). Purple arrows mark time travel.
   Layout per timeline row: two past boards (tap one to time-travel the selected piece there) + the present board. */
(function () {
  'use strict';
  var CM = window.CM;
  var VAL = { P: 100, N: 300, B: 320, R: 500, Q: 900, K: 20000 };
  var D = { N: [[1, 2], [2, 1], [-1, 2], [-2, 1], [1, -2], [2, -1], [-1, -2], [-2, -1]], K: [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]], B: [[1, 1], [1, -1], [-1, 1], [-1, -1]], R: [[1, 0], [-1, 0], [0, 1], [0, -1]] };
  D.Q = D.B.concat(D.R);
  var MAXTL = 3;
  CM.defineGame('g4_5d', function (host) {
    var cvs = host.canvas, g = host.g, imgs = {}, tls, done, sel, running, arrows, log, rects, busy, turnNo;
    function img(c, t) { var k = c + t; if (!imgs[k]) { imgs[k] = new Image(); imgs[k].onload = draw; imgs[k].src = host.pieceUrl(c, t); } return imgs[k]; }
    function start() { var r = 'RNBQKBNR', b = new Array(64).fill(null); for (var i = 0; i < 8; i++) { b[i] = 'b' + r[i]; b[8 + i] = 'bP'; b[48 + i] = 'wP'; b[56 + i] = 'w' + r[i]; } return b; }
    function gen(b, turn) {
      var out = [];
      for (var i = 0; i < 64; i++) {
        var p = b[i]; if (!p || p[0] !== turn) continue; var t = p[1], x = i % 8, y = i >> 3;
        if (t === 'P') {
          var f = turn === 'w' ? -1 : 1, y1 = y + f;
          if (y1 >= 0 && y1 < 8 && !b[y1 * 8 + x]) { out.push([i, y1 * 8 + x]); var y2 = y1 + f; if ((turn === 'w' ? y === 6 : y === 1) && !b[y2 * 8 + x]) out.push([i, y2 * 8 + x]); }
          [-1, 1].forEach(function (dx) { var xx = x + dx; if (xx < 0 || xx > 7 || y1 < 0 || y1 > 7) return; var q = b[y1 * 8 + xx]; if (q && q[0] !== turn) out.push([i, y1 * 8 + xx]); });
          continue;
        }
        var slide = t === 'B' || t === 'R' || t === 'Q';
        D[t].forEach(function (d) { var xx = x + d[0], yy = y + d[1]; while (xx >= 0 && xx < 8 && yy >= 0 && yy < 8) { var q = b[yy * 8 + xx]; if (q) { if (q[0] !== turn) out.push([i, yy * 8 + xx]); break; } out.push([i, yy * 8 + xx]); if (!slide) break; xx += d[0]; yy += d[1]; } });
      }
      return out;
    }
    function apply(b, m) { var n = b.slice(), p = n[m[0]]; n[m[1]] = p; n[m[0]] = null; if (p[1] === 'P' && (m[1] < 8 || m[1] >= 56)) n[m[1]] = p[0] + 'Q'; return n; }
    function evalB(b, me) { var s = 0; b.forEach(function (p, i) { if (!p) return; var v = VAL[p[1]] + (p[1] === 'P' ? (p[0] === 'w' ? 6 - (i >> 3) : (i >> 3) - 1) * 8 : 0) + ((i % 8 > 1 && i % 8 < 6 && (i >> 3) > 1 && (i >> 3) < 6) ? 10 : 0); s += p[0] === me ? v : -v; }); return s; }
    function other(c) { return c === 'w' ? 'b' : 'w'; }
    function present(tl) { return tl.boards[tl.boards.length - 1]; }
    function kingGone(c) { return tls.some(function (tl) { return present(tl).b.indexOf(c + 'K') < 0; }); }
    function name(i) { return 'abcdefgh'[i % 8] + (8 - (i >> 3)); }
    function curTurn() { return present(tls.filter(function (t) { return !done[t.id]; })[0] || tls[0]).turn; }
    function needMove(tl, c) { return present(tl).turn === c && !done[tl.id]; }
    function makeMove(tl, m, by) {
      var P = present(tl), p = P.b[m[0]], cap = P.b[m[1]];
      tl.boards.push({ b: apply(P.b, m), turn: other(P.turn), last: m });
      done[tl.id] = true; log.push('T' + tl.label + ' ' + (p[1] === 'P' ? '' : p[1]) + (cap ? 'x' : '') + name(m[1]));
      host.sound(cap ? 'capture' : by === 'me' ? 'move-self' : 'move-opponent');
      afterMove();
    }
    function timeJump(tl, from, back, by) {
      var P = present(tl), idx = tl.boards.length - 1 - 2 * back, past = tl.boards[idx], p = P.b[from];
      if (!past || tls.length >= MAXTL) return false;
      var q = past.b[from]; if (q && q[0] === p[0]) return false;
      tl.boards.push({ b: (function () { var n = P.b.slice(); n[from] = null; return n; })(), turn: other(P.turn), last: [from, from], gone: true });
      done[tl.id] = true;
      var nb = past.b.slice(); nb[from] = p;
      var label = p[0] === 'w' ? '+' + (tls.filter(function (t) { return t.label[0] === '+'; }).length + 1) : '-' + (tls.filter(function (t) { return t.label[0] === '-'; }).length + 1);
      var ntl = { id: 'L' + tls.length, label: label, t0: tl.t0 + idx, boards: [past, { b: nb, turn: other(past.turn), last: [from, from], arrived: true }] };
      if (p[0] === 'w') tls.push(ntl); else tls.unshift(ntl);
      done[ntl.id] = true; arrows.push({ from: tl.id, to: ntl.id, sq: from, t: performance.now() });
      log.push('T' + tl.label + ' ' + p[1] + name(from) + ' ⟶ ' + back + ' turn' + (back > 1 ? 's' : '') + ' back (new timeline ' + label + ')');
      host.sound('promote'); host.toast('New timeline ' + label + '!', 1400);
      afterMove(); return true;
    }
    function afterMove() {
      host.setMoves(log.slice()); sel = null;
      if (kingGone('b')) return end('win', 'you captured a king in the multiverse');
      if (kingGone('w')) return end('loss', 'your king was captured');
      var c = curTurnColor();
      if (tls.every(function (t) { return !needMove(t, c) || !gen(present(t).b, c).length; })) {
        /* every board of this colour is done: the present moves on */
        done = {}; turnNo++;
        if (tls.every(function (t) { return !gen(present(t).b, present(t).turn).length; })) return end('draw', 'no moves left');
      }
      draw(); hud();
      if (curTurnColor() === 'b' && running) { busy = true; host.setThinking('thinking'); host.after(450, botStep); }
    }
    function curTurnColor() { var c = { w: 0, b: 0 }; tls.forEach(function (t) { if (!done[t.id]) c[present(t).turn]++; }); return c.w >= c.b ? (c.w ? 'w' : 'b') : 'b'; }
    function end(r, why) { running = false; draw(); host.setThinking(''); host.over({ result: r, why: why }); }
    function search(b, me, depth) {
      var ms = gen(b, me); if (!ms.length) return { v: -50, m: null };
      var best = { v: -1e9, m: null };
      ms.forEach(function (m) {
        var v; if (b[m[1]] && b[m[1]][1] === 'K') v = 1e6;
        else if (depth <= 1) v = evalB(apply(b, m), me);
        else { var r = search(apply(b, m), other(me), depth - 1); v = -r.v; }
        v += Math.random() * 6; if (v > best.v) best = { v: v, m: m };
      });
      return best;
    }
    function botStep() {
      if (!running) return; busy = false; host.setThinking('');
      var tl = tls.filter(function (t) { return needMove(t, 'b'); })[0]; if (!tl) { afterMove(); return; }
      var P = present(tl);
      /* time travel: capture a valuable white piece that stood on the same square 1-2 turns ago */
      if (tls.length < MAXTL && Math.random() < 0.7) {
        for (var back = 1; back <= 2; back++) {
          var past = tl.boards[tl.boards.length - 1 - 2 * back]; if (!past) continue;
          for (var i = 0; i < 64; i++) { var p = P.b[i], q = past.b[i]; if (p && p[0] === 'b' && p[1] !== 'K' && q && q[0] === 'w' && VAL[q[1]] > VAL[p[1]]) { timeJump(tl, i, back, 'bot'); return; } }
        }
      }
      var r = search(P.b, 'b', 3); if (!r.m) { done[tl.id] = true; afterMove(); return; }
      makeMove(tl, r.m, 'bot');
    }
    function hud() {
      var c = curTurnColor(), left = tls.filter(function (t) { return needMove(t, c); }).length;
      var tn = Math.floor((tls[0].t0 + tls[0].boards.length - 2) / 2) + 1;
      host.status('Turn ' + tn + ' · ' + tls.length + ' timeline' + (tls.length > 1 ? 's' : '') + ' · ' + (c === 'w' ? 'your move on ' + left + ' more board' + (left === 1 ? '' : 's') : 'Black is moving...'));
      host.hud('');
    }
    function layout() {
      var W = cvs.width, H = cvs.height, n = tls.length, gap = Math.round(W * 0.02), h = Math.min(Math.round(W * 0.6), Math.floor((H - gap * (n + 1)) / n));
      var mini = Math.min(Math.floor((W - h - gap * 4) / 2), h), R = [];
      tls.forEach(function (tl, k) {
        var y = gap + k * (h + gap), L = tl.boards.length;
        R.push({ tl: tl, kind: 'present', x: W - h - gap, y: y, s: h, idx: L - 1 });
        [2, 1].forEach(function (back, j) { var idx = L - 1 - 2 * back; R.push({ tl: tl, kind: 'past', back: back, x: gap + j * (mini + gap), y: y + (h - mini) / 2, s: mini, idx: idx }); });
      });
      return R;
    }
    function drawBoard(r, bd, hi) {
      var s = r.s / 8;
      for (var i = 0; i < 64; i++) { var x = i % 8, y = i >> 3; g.fillStyle = (x + y) % 2 ? '#96a2ba' : '#d2d2c6'; g.fillRect(r.x + x * s, r.y + y * s, s + 0.5, s + 0.5); }
      if (bd.last) { [bd.last[0], bd.last[1]].forEach(function (i) { g.fillStyle = 'rgba(255,255,80,0.35)'; g.fillRect(r.x + (i % 8) * s, r.y + (i >> 3) * s, s, s); }); }
      if (hi) hi(s);
      bd.b.forEach(function (p, i) { if (!p) return; var im = img(p[0], p[1]); if (im.complete && im.naturalWidth) g.drawImage(im, r.x + (i % 8) * s, r.y + (i >> 3) * s, s, s); });
    }
    function draw() {
      if (!tls) return; var W = cvs.width, H = cvs.height; g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#5b5e66'; g.fillRect(0, 0, W, H);
      rects = layout();
      rects.forEach(function (r) {
        var bd = r.tl.boards[r.idx];
        if (!bd) { g.strokeStyle = 'rgba(255,255,255,0.15)'; g.strokeRect(r.x + 0.5, r.y + 0.5, r.s - 1, r.s - 1); return; }
        var canTravel = sel && sel.tl === r.tl && r.kind === 'past' && tls.length < MAXTL && !(bd.b[sel.i] && bd.b[sel.i][0] === 'w');
        drawBoard(r, bd, function (s) {
          if (r.kind === 'present' && sel && sel.tl === r.tl) {
            g.fillStyle = 'rgba(255,255,51,0.5)'; g.fillRect(r.x + (sel.i % 8) * s, r.y + (sel.i >> 3) * s, s, s);
            gen(bd.b, 'w').forEach(function (m) { if (m[0] !== sel.i) return; g.fillStyle = 'rgba(0,0,0,0.22)'; g.beginPath(); g.arc(r.x + (m[1] % 8 + 0.5) * s, r.y + ((m[1] >> 3) + 0.5) * s, s * (bd.b[m[1]] ? 0.42 : 0.16), 0, 7); g.fill(); });
          }
          if (canTravel) { g.fillStyle = 'rgba(150,60,220,0.55)'; g.beginPath(); g.arc(r.x + (sel.i % 8 + 0.5) * s, r.y + ((sel.i >> 3) + 0.5) * s, s * 0.45, 0, 7); g.fill(); }
        });
        g.lineWidth = Math.max(2, r.s / 60); g.strokeStyle = r.kind === 'present' ? (bd.turn === 'w' ? (done[r.tl.id] ? '#888' : '#f1f1f1') : '#222') : (canTravel ? '#a855f7' : 'rgba(0,0,0,0.4)');
        g.strokeRect(r.x - g.lineWidth / 2, r.y - g.lineWidth / 2, r.s + g.lineWidth, r.s + g.lineWidth);
        g.fillStyle = '#fff'; g.font = 'bold ' + Math.max(10, Math.round(r.s / 11)) + 'px sans-serif'; g.textAlign = 'left';
        if (r.kind === 'present') { g.font = 'bold ' + Math.max(11, Math.round(r.s / 14)) + 'px sans-serif'; g.fillText('Timeline ' + r.tl.label + ' · t' + (r.tl.t0 + r.idx), Math.round(W * 0.02), r.y + Math.max(14, r.s / 12)); }
        else g.fillText('-' + r.back, r.x + 2, r.y + Math.max(10, r.s / 9));
      });
      /* purple time-travel arrows (from the source timeline's present board to the new timeline) */
      arrows.forEach(function (a) {
        var A = rects.filter(function (r) { return r.tl.id === a.from && r.kind === 'present'; })[0], B = rects.filter(function (r) { return r.tl.id === a.to && r.kind === 'present'; })[0]; if (!A || !B) return;
        var s1 = A.s / 8, s2 = B.s / 8, x1 = A.x + (a.sq % 8 + 0.5) * s1, y1 = A.y + ((a.sq >> 3) + 0.5) * s1, x2 = B.x + (a.sq % 8 + 0.5) * s2, y2 = B.y + ((a.sq >> 3) + 0.5) * s2;
        g.strokeStyle = 'rgba(168,85,247,0.85)'; g.lineWidth = Math.max(3, s1 * 0.18); g.beginPath(); g.moveTo(x1, y1); g.quadraticCurveTo(Math.min(x1, x2) - A.s * 0.35, (y1 + y2) / 2, x2, y2); g.stroke();
        g.fillStyle = 'rgba(168,85,247,0.95)'; g.beginPath(); g.arc(x2, y2, g.lineWidth, 0, 7); g.fill();
      });
    }
    function tap(e) {
      if (!running || busy || curTurnColor() !== 'w') return;
      var rc = cvs.getBoundingClientRect(), k = cvs.width / rc.width, x = (e.clientX - rc.left) * k, y = (e.clientY - rc.top) * k;
      var r = (rects || []).filter(function (q) { return x >= q.x && x < q.x + q.s && y >= q.y && y < q.y + q.s; })[0]; if (!r) { sel = null; draw(); return; }
      var bd = r.tl.boards[r.idx];
      if (r.kind === 'past') { if (sel && sel.tl === r.tl && bd) { if (present(r.tl).b[sel.i][1] === 'K') { host.toast('Kings stay in their own time in this version.'); return; } if (!timeJump(r.tl, sel.i, r.back, 'me')) host.toast(tls.length >= MAXTL ? 'At most 3 timelines in this version.' : 'Blocked by your own piece there.'); } return; }
      if (!needMove(r.tl, 'w')) { host.toast('You already moved on this timeline.'); return; }
      var s = r.s / 8, i = Math.floor((y - r.y) / s) * 8 + Math.floor((x - r.x) / s);
      if (sel && sel.tl === r.tl) { var m = gen(bd.b, 'w').filter(function (m) { return m[0] === sel.i && m[1] === i; })[0]; if (m) { makeMove(r.tl, m, 'me'); return; } }
      if (bd.b[i] && bd.b[i][0] === 'w') sel = { tl: r.tl, i: i }; else sel = null;
      draw();
    }
    function newGame() {
      tls = [{ id: 'L0', label: '0', t0: 1, boards: [{ b: start(), turn: 'w' }] }]; done = {}; sel = null; running = true; arrows = []; log = []; busy = false; turnNo = 1;
      host.setMoves([]); draw(); hud();
    }
    return {
      start: function () { cvs.addEventListener('pointerdown', tap); newGame(); },
      newGame: newGame,
      stop: function () { running = false; cvs.removeEventListener('pointerdown', tap); },
      key: function () {}, resize: function () { draw(); }, redraw: draw
    };
  });
})();
