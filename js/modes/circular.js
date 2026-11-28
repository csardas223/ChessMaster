/* circular: the round board of "Can I BEAT Circular Chess?" (iwantcheckmate, ePpFGTNs5sE), Circular Chess from
   Green Lemon Games' Deckmate. Game hooks only: the rules are plain engine config in the mode file (20 files a-t that
   wrap into rings, 8 ranks from the outer ring (1) to the inner ring (8), 8 missing squares, both armies' pawns
   moving inward), so the bot and the rules engine never see this file.

   The engine keeps its 20x8 grid in the DOM underneath (rules, legal moves, undo and QA clicks unchanged, made
   invisible like js/fx/scene3d.js does for 3D), and this draws the board as the video shows it: an annulus of 20
   sectors x 8 rings, hole in the middle, the two outer rings missing on the four side sectors (i, j, s, t), a1 dark.
   Geometry measured from the video's top-down frames (maxres2/3): hole radius 72, ring width 35.5, outer radius 356
   (of a 712 px board), files counter-clockwise from a at lower left (a centred 63 degrees round from the bottom).

   Pieces slide along the board's own lines: a move along a ring follows the arc (the clear way round), a move along
   a file is straight, a diagonal curves with the grid, a knight eases through the grid. Castling slides the king and
   hops the rook (the video: "the rook had the little jump animation"). Reduced motion snaps. */
(function () {
  'use strict';
  var CM = window.CM;
  var NS = 'http://www.w3.org/2000/svg';
  var VB = 1000, C = VB / 2, R_OUT = 498, HOLE = R_OUT * 72 / 356, W = (R_OUT - HOLE) / 8;   /* proportions from the video */
  var A0 = 63, DA = 18;                     /* file a's centre angle (degrees round from the bottom, clockwise on screen), sector width */
  var COL = { light: '#efedb2', dark: '#856347', lastL: 'rgba(255,255,120,.5)', dot: 'rgba(84,52,28,.72)', ink: { light: '#856347', dark: '#efedb2' } };
  var cur = null;

  function animMs() { return CM.settings && CM.settings.animMs ? CM.settings.animMs() : 200; }
  function easeOut(k) { return 1 - Math.pow(1 - k, 3); }
  function el(tag, attrs, parent) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }

  /* ---- polar geometry: (file coordinate, row coordinate) -> board point. row 0 = rank 8 = the inner ring. ---- */
  function ang(S, fc) { return (A0 - DA * fc + (S.flip ? 180 : 0)) * Math.PI / 180; }
  function rad(rc) { return HOLE + (rc + 0.5) * W; }
  function pt(S, fc, rc) { var a = ang(S, fc), r = rad(rc); return [C - Math.sin(a) * r, C + Math.cos(a) * r]; }
  function arcPt(S, fc, r) { var a = ang(S, fc); return [C - Math.sin(a) * r, C + Math.cos(a) * r]; }
  function cellPath(S, c, row) {
    var r0 = HOLE + row * W, r1 = r0 + W, f0 = c - 0.5, f1 = c + 0.5;
    var p0 = arcPt(S, f0, r1), p1 = arcPt(S, f1, r1), p2 = arcPt(S, f1, r0), p3 = arcPt(S, f0, r0);
    /* increasing file coordinate turns anticlockwise on screen (sweep 0) */
    return 'M' + p0[0].toFixed(2) + ' ' + p0[1].toFixed(2) + 'A' + r1 + ' ' + r1 + ' 0 0 0 ' + p1[0].toFixed(2) + ' ' + p1[1].toFixed(2) +
      'L' + p2[0].toFixed(2) + ' ' + p2[1].toFixed(2) + 'A' + r0 + ' ' + r0 + ' 0 0 1 ' + p3[0].toFixed(2) + ' ' + p3[1].toFixed(2) + 'Z';
  }
  /* board point -> square index (or -1) */
  function hit(S, x, y) {
    var g = S.g, dx = x - C, dy = y - C, r = Math.hypot(dx, dy);
    if (r < HOLE || r > R_OUT) return -1;
    var row = Math.floor((r - HOLE) / W); if (row < 0 || row >= g.ranks) return -1;
    var a = Math.atan2(-dx, dy) * 180 / Math.PI - (S.flip ? 180 : 0);   /* clockwise from the bottom */
    var fc = (A0 - a) / DA, c = ((Math.round(fc) % g.files) + g.files) % g.files;
    var i = g.idx(c, row); return g.valid[i] ? i : -1;
  }
  function centre(S, i) { return pt(S, S.g.col(i), S.g.row(i)); }

  /* the path a piece takes from f to t, as a signed file delta: a ring move goes the clear way round (shorter if both are) */
  function fileDelta(S, b, f, t, p) {
    var g = S.g, F = g.files, c0 = g.col(f), c1 = g.col(t), d = ((c1 - c0) % F + F) % F, alt = d - F;
    var short = Math.abs(alt) < d ? alt : d;
    if (g.row(f) !== g.row(t) || !p || 'RQ'.indexOf(p.t) < 0 || Math.abs(short) <= 1) return short;
    var clear = function (dd) { var s = dd > 0 ? 1 : -1, row = g.row(f); for (var k = 1; k < Math.abs(dd); k++) { var j = g.idx(((c0 + s * k) % F + F) % F, row); if (!g.valid[j] || (b[j] && j !== t)) return false; } return true; };
    var long = short === d ? alt : d;
    if (clear(short)) return short; if (clear(long)) return long; return short;
  }

  /* ---------------- build ---------------- */
  function attach(ctx) {
    detach();
    if (typeof document === 'undefined' || typeof document.createElementNS !== 'function' || typeof requestAnimationFrame !== 'function' || !CM.gameUI) return null;   /* engine sweep / Node: rules only */
    var wrap = document.getElementById('board-wrap'); if (!wrap || !ctx.game) return null;
    var g = ctx.V.geo, S = { ctx: ctx, g: g, G: ctx.game, wrap: wrap, flip: false, pieces: {}, tw: [], sig: '', geoSig: '' };
    cur = S;
    if (!document.getElementById('cmpolar-css')) {
      var cs = document.createElement('style'); cs.id = 'cmpolar-css';
      cs.textContent = '.cmpolar-on #board-stage{opacity:0}.cmpolar-on #board-stage *{pointer-events:none}' +
        '.cmpolar{position:absolute;inset:0;width:100%;height:100%;z-index:4;display:block;touch-action:none;-webkit-tap-highlight-color:transparent;user-select:none;-webkit-user-select:none}' +
        '.cmpolar text{font:700 19px/1 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;pointer-events:none}' +
        '.cmpolar .pc{pointer-events:none}.cmpolar .pc.is-drag{filter:drop-shadow(0 6px 6px rgba(0,0,0,.35))}';
      document.head.appendChild(cs);
    }
    var svg = S.svg = el('svg', { 'class': 'cmpolar', viewBox: '0 0 ' + VB + ' ' + VB, 'aria-label': 'Circular chess board', role: 'img' });
    S.gBoard = el('g', {}, svg); S.gHl = el('g', {}, svg); S.gCoord = el('g', {}, svg); S.gDots = el('g', {}, svg); S.gPcs = el('g', {}, svg); S.gTop = el('g', {}, svg);
    wrap.appendChild(svg); wrap.classList.add('cmpolar-on');
    /* rectOf: the promotion picker, VFX and arrows ask the board where a square is; answer with the round cell */
    var bv = CM.gameUI && CM.gameUI.board; S.bv = bv;
    if (bv) { S.rectOf0 = bv.hasOwnProperty('rectOf') ? bv.rectOf : null; bv.rectOf = function (i) { return rectOf(S, i); }; }
    bindInput(S);
    S.raf = requestAnimationFrame(function loop(now) {
      if (cur !== S) return;
      if (!CM.gameUI || CM.gameUI.controller !== ctx.game) { detach(S); return; }
      sync(S); step(S, now);
      S.raf = requestAnimationFrame(loop);
    });
    sync(S);
    return S;
  }
  function rectOf(S, i) {
    if (i == null || i < 0 || !S.g.valid[i]) return null;
    var m = S.svg.getScreenCTM(); if (!m) return null;
    var c = centre(S, i), x = m.a * c[0] + m.c * c[1] + m.e, y = m.b * c[0] + m.d * c[1] + m.f, s = Math.max(W * m.a, 40);
    return { left: x - s / 2, top: y - s / 2, right: x + s / 2, bottom: y + s / 2, width: s, height: s, x: x - s / 2, y: y - s / 2 };
  }
  function drawBoard(S) {
    var g = S.g, gb = S.gBoard, gc = S.gCoord; gb.textContent = ''; gc.textContent = '';
    /* dark base under every cell (no hairline seams of the page between neighbours), light cells on top */
    var dark = '', light = '';
    for (var i = 0; i < g.size; i++) { if (!g.valid[i]) continue; var p = cellPath(S, g.col(i), g.row(i)); dark += p; if ((g.col(i) + g.row(i)) % 2 === 0) light += p;   /* a1 dark, as in the video */ }
    el('path', { d: dark, fill: COL.dark, stroke: COL.dark, 'stroke-width': 0.6, 'stroke-linejoin': 'round' }, gb);
    el('path', { d: light, fill: COL.light }, gb);
    /* Deckmate's board shows a fine seam on its four axis lines (between d|e, i|j, n|o, s|t); drawing only, the rules
       cross them (the video's Queen i8xc2 runs over the d|e seam) */
    var seam = '';
    [3.5, 8.5, 13.5, 18.5].forEach(function (fc) {
      var c0 = Math.floor(fc), c1 = (c0 + 1) % g.files, top = 0;
      for (var r = 0; r < g.ranks; r++) if (g.valid[g.idx(c0, r)] && g.valid[g.idx(c1, r)]) top = r + 1;
      var a = arcPt(S, fc, HOLE), b = arcPt(S, fc, HOLE + top * W); seam += 'M' + a[0].toFixed(2) + ' ' + a[1].toFixed(2) + 'L' + b[0].toFixed(2) + ' ' + b[1].toFixed(2);
    });
    el('path', { d: seam, stroke: '#5e4130', 'stroke-opacity': '.45', 'stroke-width': 2.4, fill: 'none' }, gb);
    if (CM.settings && CM.settings.get('coords') === 'off') return;
    /* file letters in each sector's outer cell by its edge with the next file; rank numbers down the a and k edges
       (each player's left-hand wing edge), turned with the board and kept readable, as in the video */
    var label = function (txt, fc, rc, i) {
      var p = pt(S, fc, rc), a = ang(S, fc) * 180 / Math.PI, rot = ((a % 360) + 360) % 360; if (rot > 90 && rot < 270) rot -= 180;
      el('text', { x: p[0].toFixed(1), y: p[1].toFixed(1), fill: (g.col(i) + g.row(i)) % 2 === 0 ? COL.ink.light : COL.ink.dark, 'text-anchor': 'middle', 'dominant-baseline': 'central',
        opacity: '.9', transform: 'rotate(' + rot.toFixed(1) + ' ' + p[0].toFixed(1) + ' ' + p[1].toFixed(1) + ')' }, gc).textContent = txt;
    };
    for (var c = 0; c < g.files; c++) {
      var row = g.ranks - 1; while (row > 0 && !g.valid[g.idx(c, row)]) row--;
      label(g.fileName(c), c + 0.34, row + 0.28, g.idx(c, row));
    }
    [0, 10].forEach(function (c) { for (var r = 0; r < g.ranks; r++) label(String(g.rank(g.idx(c, r))), c - 0.36, r, g.idx(c, r)); });
  }

  /* ---------------- per-change sync ---------------- */
  function targetsOf(S) {
    var G = S.G, V = S.ctx.V, st = G.state, out = {};
    if (G.sel < 0 || !(CM.settings && CM.settings.get('legalDots'))) return out;
    var src = st.turn === G.human && !G.busy ? G.moves : V.gen(Object.assign({}, st, { turn: G.human }));
    (src || []).forEach(function (m) { if (m.f === G.sel && m.t >= 0) out[m.t] = m.cap ? 2 : (out[m.t] || 1); });
    return out;
  }
  function sync(S) {
    var G = S.G, st = G.state; if (!st) return;
    var flip = !!(G.flipped && G.flipped()), coords = CM.settings ? CM.settings.get('coords') : '';
    var gs = flip + '|' + coords;
    if (gs !== S.geoSig) { S.geoSig = gs; S.flip = flip; drawBoard(S); S.sig = ''; Object.keys(S.pieces).forEach(function (k) { S.pieces[k].snap = true; }); }
    var last = G.last, pm = G.premove;
    var sig = [G.history ? G.history.length : 0, G.sel, G.over ? 1 : 0, st.turn, G.busy ? 1 : 0, pm ? pm.f + '>' + pm.t : '', last ? last.f + '>' + last.t : '',
      CM.settings && CM.settings.get('lastMove') ? 1 : 0, st.b.map(function (p) { return p ? p.t + p.c : ''; }).join(',')].join('|');
    if (sig === S.sig) return;
    var prevBoard = S.board; S.sig = sig; S.board = st.b.slice();
    drawHighlights(S);
    drawPieces(S, prevBoard);
  }
  function hlCell(S, i, fill, parent) { el('path', { d: cellPath(S, S.g.col(i), S.g.row(i)), fill: fill }, parent || S.gHl); }
  function drawHighlights(S) {
    var G = S.G, V = S.ctx.V, st = G.state, g = S.g; S.gHl.textContent = ''; S.gDots.textContent = '';
    var L = G.last;
    if (L && L.f >= 0 && L.t >= 0 && CM.settings.get('lastMove') !== false) { hlCell(S, L.f, COL.lastL); hlCell(S, L.t, COL.lastL); }
    if (G.sel >= 0) hlCell(S, G.sel, COL.lastL);
    if (G.premove) { hlCell(S, G.premove.f, 'rgba(244,67,54,.42)'); hlCell(S, G.premove.t, 'rgba(244,67,54,.42)'); }
    /* check: the chess.com red glow on the king's cell */
    V.colors.forEach(function (c) {
      if (V.checkRule(c) === 'none' || !V.inCheck(st, c)) return;
      V.royals(st, c).forEach(function (k) {
        var gid = 'cmpolar-chk'; if (!document.getElementById(gid)) { var d = el('defs', {}, S.svg), rg = el('radialGradient', { id: gid }, d); el('stop', { offset: '0', 'stop-color': '#ff2b1c', 'stop-opacity': '1' }, rg); el('stop', { offset: '.55', 'stop-color': '#e8170b', 'stop-opacity': '.75' }, rg); el('stop', { offset: '1', 'stop-color': '#a90000', 'stop-opacity': '0' }, rg); }
        var p = centre(S, k); el('circle', { cx: p[0], cy: p[1], r: W * 0.62, fill: 'url(#' + gid + ')' }, S.gHl);
      });
    });
    var T = targetsOf(S);
    Object.keys(T).forEach(function (k) {
      var i = +k, p = centre(S, i);
      if (T[k] === 2) el('circle', { cx: p[0], cy: p[1], r: W * 0.43, fill: 'none', stroke: COL.dot, 'stroke-width': W * 0.11 }, S.gDots);
      else el('circle', { cx: p[0], cy: p[1], r: W * 0.17, fill: COL.dot }, S.gDots);
    });
    void g;
  }
  var PS = W * 0.94;   /* piece size: uniform on every ring, as Deckmate draws them */
  function newPiece(S, p) {
    var grp = el('g', { 'class': 'pc' }, S.gPcs);
    el('ellipse', { cx: 0, cy: PS * 0.36, rx: PS * 0.3, ry: PS * 0.085, fill: 'rgba(40,28,16,.22)' }, grp);   /* Deckmate's soft base shadow */
    var im = el('image', { x: -PS / 2, y: -PS / 2, width: PS, height: PS, preserveAspectRatio: 'xMidYMid meet' }, grp);
    im.setAttribute('href', S.G.pieceImage(p)); im.setAttributeNS('http://www.w3.org/1999/xlink', 'href', S.G.pieceImage(p));
    return { g: grp, key: p.t + p.c, src: S.G.pieceImage(p) };
  }
  function place(o, x, y, s, op) { o.x = x; o.y = y; o.g.setAttribute('transform', 'translate(' + x.toFixed(2) + ' ' + y.toFixed(2) + ')' + (s && s !== 1 ? ' scale(' + s.toFixed(3) + ')' : '')); if (op != null) o.g.setAttribute('opacity', op.toFixed(3)); }
  function slide(S, o, from, to, f, t, b, p, opts) {
    opts = opts || {};
    var g = S.g, df = fileDelta(S, b, f, t, p), dr = g.row(t) - g.row(f), c0 = g.col(f), r0 = g.row(f);
    var steps = Math.max(Math.abs(df), Math.abs(dr)), ms = animMs();
    var t1 = centre(S, t);
    if (!ms) { place(o, t1[0], t1[1], 1, 1); return; }
    ms = Math.min(ms * 2.2, ms * (1 + Math.max(0, steps - 1) * 0.12));
    var start = opts.drop;   /* a drag settles from where the finger let go */
    o.anim = true;
    S.tw.push({ t0: performance.now(), ms: start ? Math.min(ms, animMs()) : ms, fn: function (k) {
      var x, y;
      if (start) { x = start[0] + (t1[0] - start[0]) * k; y = start[1] + (t1[1] - start[1]) * k; }
      else { var q = pt(S, c0 + df * k, r0 + dr * k); x = q[0]; y = q[1]; }
      place(o, x, y, opts.hop ? 1 + Math.sin(k * Math.PI) * 0.22 : 1);
      if (k >= 1) o.anim = false;
    } });
  }
  function drawPieces(S, prevBoard) {
    var G = S.G, st = G.state, b = st.b, g = S.g, old = S.pieces, next = {}, pool = {};
    /* index the old placement by square */
    Object.keys(old).forEach(function (k) { pool[k] = old[k]; });
    var gone = [];   /* squares whose old piece is not there any more */
    var arrive = []; /* squares that got a different piece */
    for (var i = 0; i < g.size; i++) {
      var p = b[i], o = pool[i];
      if (o && p && o.key === p.t + p.c && !o.snap && o.src === G.pieceImage(p)) { next[i] = o; delete pool[i]; var c = centre(S, i); if (!o.anim && (Math.abs(o.x - c[0]) > .5 || Math.abs(o.y - c[1]) > .5)) place(o, c[0], c[1], 1, 1); continue; }
      if (o) gone.push(i);
      if (p) arrive.push(i);
    }
    /* pair arrivals with departures of the same piece: the last move (and castling rook) first, then nearest */
    var L = G.last, hints = [];
    if (L && L.f >= 0) { hints.push([L.f, L.t, false]); if (L.castle) hints.push([L.castle.rf, L.castle.rt, true]); }
    var used = {};
    var take = function (from, to, hop) {
      var o = pool[from], p = b[to]; if (!o || !p || used[from] || next[to]) return false;
      var key = p.t + p.c, promo = o.key !== key && L && L.promo && L.t === to;
      if (o.key !== key && !promo) return false;
      used[from] = 1; delete pool[from];
      if (promo || o.src !== G.pieceImage(p)) { S.gPcs.removeChild(o.g); var n = newPiece(S, p); place(n, o.x, o.y, 1, 1); o = n; }
      next[to] = o; S.gPcs.appendChild(o.g);
      var drop = S.dropAt && S.dropAt.f === from && S.dropAt.t === to ? S.dropAt.p : null;
      if (o.snap) { var c = centre(S, to); place(o, c[0], c[1], 1, 1); o.snap = false; }
      else slide(S, o, null, null, from, to, prevBoard || b, p, { hop: hop, drop: drop });
      return true;
    };
    hints.forEach(function (h) { take(h[0], h[1], h[2]); });
    arrive.forEach(function (t) {
      if (next[t]) return; var p = b[t], best = -1, bd = 1e9;
      gone.forEach(function (f) { var o = pool[f]; if (!o || used[f] || o.key !== p.t + p.c || o.snap) return; var d = g.dist(f, t); if (d < bd) { bd = d; best = f; } });
      if (best >= 0 && bd <= 8) { take(best, t, false); return; }
      var n = newPiece(S, p), c = centre(S, t); place(n, c[0], c[1], 1, animMs() ? 0 : 1); next[t] = n;
      if (animMs()) S.tw.push({ t0: performance.now(), ms: animMs(), fn: function (k) { n.g.setAttribute('opacity', k.toFixed(3)); } });
    });
    /* whatever is left was captured or removed: fade it out where it stands */
    Object.keys(pool).forEach(function (k) {
      var o = pool[k]; if (used[k]) return;
      if (!animMs() || o.snap) { if (o.g.parentNode) o.g.parentNode.removeChild(o.g); return; }
      S.gPcs.insertBefore(o.g, S.gPcs.firstChild);
      S.tw.push({ t0: performance.now(), ms: animMs(), fn: function (k2) { o.g.setAttribute('opacity', (1 - k2).toFixed(3)); if (k2 >= 1 && o.g.parentNode) o.g.parentNode.removeChild(o.g); } });
    });
    S.pieces = next; S.dropAt = null;
  }
  function step(S, now) {
    if (!S.tw.length) return;
    S.tw = S.tw.filter(function (tw) { var k = Math.min(1, (now - tw.t0) / tw.ms); tw.fn(easeOut(k)); return k < 1; });
  }

  /* ---------------- input: tap to select / move, drag to move ---------------- */
  function toBoard(S, e) {
    var m = S.svg.getScreenCTM(); if (!m) return null; var inv = m.inverse();
    return [inv.a * e.clientX + inv.c * e.clientY + inv.e, inv.b * e.clientX + inv.d * e.clientY + inv.f];
  }
  /* a tap near a legal target counts for it (the inner cells are small on a phone) */
  function pick(S, p) {
    var i = hit(S, p[0], p[1]), G = S.G;
    if (G.sel < 0) return i;
    var T = targetsOf(S), best = -1, bd = W * 0.8;
    Object.keys(T).forEach(function (k) { var c = centre(S, +k), d = Math.hypot(c[0] - p[0], c[1] - p[1]); if (d < bd) { bd = d; best = +k; } });
    if (best >= 0 && (i < 0 || !T[i]) && !(i >= 0 && i !== G.sel && G.state.b[i] && G.state.b[i].c === G.human)) return best;
    return i;
  }
  function bindInput(S) {
    var svg = S.svg, down = null, drag = null;
    svg.addEventListener('pointerdown', function (e) {
      if (e.button > 0) return; var p = toBoard(S, e); if (!p) return;
      down = { x: e.clientX, y: e.clientY, p: p, i: hit(S, p[0], p[1]), id: e.pointerId };
      try { svg.setPointerCapture(e.pointerId); } catch (_) { /* old browsers */ }
    });
    svg.addEventListener('pointermove', function (e) {
      if (!down || e.pointerId !== down.id) return;
      var G = S.G;
      if (!drag) {
        if (Math.hypot(e.clientX - down.x, e.clientY - down.y) < 7) return;
        if (down.i < 0 || !G.canDrag(down.i) || !S.pieces[down.i]) return;
        drag = { i: down.i, o: S.pieces[down.i] }; G.onDragStart(down.i);
        drag.o.g.classList.add('is-drag'); S.gPcs.appendChild(drag.o.g);
      }
      var p = toBoard(S, e); if (p) place(drag.o, p[0], p[1] - W * 0.35, 1.25, 1);
    });
    var up = function (e) {
      if (!down || e.pointerId !== down.id) return;
      var G = S.G, p = toBoard(S, e), d = down; down = null;
      if (drag) {
        var o = drag.o, f = drag.i; drag = null; o.g.classList.remove('is-drag');
        var t = p ? pick(S, p) : -1, c = centre(S, f);
        if (e.type === 'pointercancel' || t === f || t < 0) { place(o, c[0], c[1], 1, 1); if (t === f) G.onTap(f, { dragCancel: true }); else G.onDrop(f, -1, {}); return; }
        S.dropAt = { f: f, t: t, p: [o.x, o.y] }; place(o, c[0], c[1], 1, 1);
        G.onDrop(f, t, {});
        if (S.G.state.b[f]) { S.dropAt = null; S.sig = ''; }   /* refused: the piece goes home */
        return;
      }
      if (e.type === 'pointercancel' || !p) return;
      var i = pick(S, p); if (i < 0) { if (G.sel >= 0) { G.sel = -1; G.render(); } return; }
      void d; G.onTap(i, {});
    };
    svg.addEventListener('pointerup', up); svg.addEventListener('pointercancel', up);
    svg.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    /* the tap is handled on pointerup; stop the browser's follow-up click, which would land on whatever the tap just opened
       (the promotion picker sits over the target square and would choose for the player) */
    svg.addEventListener('touchend', function (e) { if (e.cancelable) e.preventDefault(); }, { passive: false });
  }

  function detach(S) {
    var s = S || cur; if (!s) return; if (cur === s) cur = null;
    cancelAnimationFrame(s.raf);
    if (s.bv) { if (s.rectOf0) s.bv.rectOf = s.rectOf0; else delete s.bv.rectOf; }
    if (s.wrap) s.wrap.classList.remove('cmpolar-on');
    if (s.svg && s.svg.parentNode) s.svg.parentNode.removeChild(s.svg);
  }

  CM.polarBoard = { attach: attach, detach: function () { detach(); }, current: function () { return cur; }, hit: function (x, y) { return cur ? hit(cur, x, y) : -1; }, centre: function (i) { return cur ? centre(cur, i) : null; } };

  CM.defineHooks('circular', {
    /* rule hook (pure, also runs in the bot's search): on a wrapped ring a rook or queen reaches every square of its ring
       both ways round, so the engine lists those moves twice; keep one of each */
    moves: function (V, st, out) {
      var seen = {}, res = [];
      for (var k = 0; k < out.length; k++) { var m = out[k], key = m.f + ':' + m.t + ':' + (m.promo || '') + (m.castle ? 'c' : '') + (m.drop || ''); if (!seen[key]) { seen[key] = 1; res.push(m); } }
      return res;
    },
    setup: function (ctx) { if (typeof document !== 'undefined' && document.getElementById && document.getElementById('board-wrap') && (!cur || cur.ctx.game !== ctx.game)) attach(ctx); },
    onStart: function (ctx) { if (typeof document !== 'undefined' && document.getElementById && (!cur || cur.ctx.game !== ctx.game)) attach(ctx); },
    onExit: function () { detach(); }
  });
})();
