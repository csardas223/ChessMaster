/* Chess, But I Can LAUNCH My Pawns. Angry-Birds / penguin-push chess vs Stockfish (3600). As your move you can tap
   the launcher, then drag backward from one of your pawns and let go: a red aim arrow shows the shot (the pull is
   capped at 2 squares) and the pawn shoots off the opposite way at pull x 10.5 squares a second, at any angle.
   Top-down slingshot physics, not an arc: every piece is a disc (radius 0.37 of a square) that slides with friction
   and bounces off the others (pawn 1, knight/bishop 1.25, rook 1.5, queen 1.8). Kings never move; anything that hits
   a king is pushed out of it. Any other piece, yours too, can be knocked, and one that goes more than 0.45 of a square
   past the edge falls off and is gone. When everything is nearly still (0.18 s) or after 6.5 s, the board pauses for
   a second and every piece glides to the nearest free square, nearest first. No pawn may end on the first or last
   rank, except the launched pawn reaching rank 8, which promotes (Q/R/B/N). Castling rights are re-read from the home
   squares and en passant is cleared. Stockfish only plays normal moves.
   Sources: research/modes/Ugw05nktuDM.json (transcript 00:01 "drag back on the pawn... push off enemy penguins...
   pieces snap back", 01:58 "the king is never affected by these bumping mechanics", 11:17 maximum push, 11:53 launch
   to g8 ladder mate) and the original game iwantcheckmate.com/challenges/catapult-chess (constants and order of
   operations above). Reimplemented as a deterministic fixed-timestep (1/60 s) simulation: the drop handler runs it to
   animate and onMake runs it again to build the position, so the board always lands where the animation stopped. */
(function () {
  var DT = 1 / 60, RAD = 0.37, SPEED = 10.5, MAXPULL = 2, REST = 1.25, FRIC = 0.965, EDGE = 0.45, STILL = 0.12, QUIET = 0.18, MAXT = 6.5;
  var PAUSE = 1000, GLIDE = 400, FADE = 1000;
  var MASS = { P: 1, N: 1.25, B: 1.25, R: 1.5, Q: 1.8 };

  /* ---------------- physics (pure, deterministic) ----------------
     Board units: x = file 0..8 from a, y = row 0..8 from rank 8 (the engine's square order). A piece on square i sits at
     (col + .5, row + .5). Returns the recorded path (positions per 1/60 s step), impacts and the snapped result. */
  function simulate(b, F, R, from, vx, vy) {
    var bodies = [], i;
    for (i = 0; i < b.length; i++) {
      var p = b[i]; if (!p) continue;
      var king = p.t === 'K';
      bodies.push({ sq: i, p: p, x: i % F + 0.5, y: Math.floor(i / F) + 0.5, vx: 0, vy: 0, m: king ? 99 : (MASS[p.t] || 1.25), king: king, alive: true, dieAt: -1 });
    }
    var L = -1; for (i = 0; i < bodies.length; i++) if (bodies[i].sq === from) L = i;
    if (L < 0) return null;
    bodies[L].vx = vx; bodies[L].vy = vy;
    var path = [snap()], hits = [], t = 0, quiet = 0, step = 0;
    function snap() { var a = new Array(bodies.length * 2); for (var k = 0; k < bodies.length; k++) { a[2 * k] = bodies[k].x; a[2 * k + 1] = bodies[k].y; } return a; }
    while (true) {
      step++; t += DT;
      var o, k;
      for (k = 0; k < bodies.length; k++) { o = bodies[k]; if (!o.alive || o.king) continue; o.x += o.vx * DT; o.y += o.vy * DT; o.vx *= FRIC; o.vy *= FRIC; }
      for (var a = 0; a < bodies.length; a++) for (var c = a + 1; c < bodies.length; c++) {
        var A = bodies[a], B = bodies[c]; if (!A.alive || !B.alive) continue;
        var dx = B.x - A.x, dy = B.y - A.y, d = Math.hypot(dx, dy), min = 2 * RAD;
        if (d >= min || d === 0) continue;
        var nx = dx / d, ny = dy / d, over = min - d;
        if (A.king && B.king) continue;
        if (A.king || B.king) {   /* a king is a wall: the other piece is pushed straight out of it */
          var s = A.king ? 1 : -1, P = A.king ? B : A;
          P.x += s * nx * over; P.y += s * ny * over;
          continue;
        }
        A.x -= nx * over / 2; A.y -= ny * over / 2; B.x += nx * over / 2; B.y += ny * over / 2;
        var rel = (B.vx - A.vx) * nx + (B.vy - A.vy) * ny;
        if (rel < 0) {
          var imp = -REST * rel / (1 / A.m + 1 / B.m);
          A.vx -= imp * nx / A.m; A.vy -= imp * ny / A.m; B.vx += imp * nx / B.m; B.vy += imp * ny / B.m;
          if (-rel > 1.2) hits.push({ step: step, x: A.x + nx * RAD, y: A.y + ny * RAD, v: -rel });
        }
      }
      for (k = 0; k < bodies.length; k++) {
        o = bodies[k];
        if (o.alive && !o.king && (o.x < -EDGE || o.x > F + EDGE || o.y < -EDGE || o.y > R + EDGE)) { o.alive = false; o.dieAt = step; }
      }
      path.push(snap());
      var max = 0; for (k = 0; k < bodies.length; k++) { o = bodies[k]; if (o.alive && !o.king) max = Math.max(max, Math.hypot(o.vx, o.vy)); }
      quiet = max < STILL ? quiet + DT : 0;
      if (quiet > QUIET || t > MAXT) break;
    }
    /* snap: nearest pieces first, each to the nearest free square; pawns never on the first/last rank except the
       launched White pawn on rank 8 (it promotes) */
    var live = bodies.filter(function (o) { return o.alive; });
    function off(o) { var cx = Math.round(o.x - 0.5) + 0.5, cy = Math.round(o.y - 0.5) + 0.5; return Math.hypot(o.x - cx, o.y - cy); }
    live = live.map(function (o, k) { return { o: o, k: k, d: off(o) }; }).sort(function (u, v) { return u.d - v.d || u.k - v.k; }).map(function (u) { return u.o; });
    var used = {}, launched = bodies[L];
    live.forEach(function (o) {
      var best = -1, bd = 1e9;
      for (var r = 0; r < R; r++) for (var cc = 0; cc < F; cc++) {
        var j = r * F + cc; if (used[j]) continue;
        if (o.p.t === 'P' && (r === 0 || r === R - 1) && !(o === launched && o.p.c === 'w' && r === 0)) continue;
        var dd = (o.x - (cc + 0.5)) * (o.x - (cc + 0.5)) + (o.y - (r + 0.5)) * (o.y - (r + 0.5));
        if (dd < bd) { bd = dd; best = j; }
      }
      used[best] = 1; o.to = best; o.tx = best % F + 0.5; o.ty = Math.floor(best / F) + 0.5;
    });
    return { bodies: bodies, L: L, path: path, hits: hits, steps: step, end: launched.alive ? launched.to : -1,
      promote: launched.alive && launched.p.c === 'w' && launched.to >= 0 && launched.to < F };
  }
  /* the position after a launch: castling rights re-read from the home squares, en passant cleared */
  function boardAfter(st, sim, promo, F, R) {
    var nb = new Array(st.b.length).fill(null), home = { w: [(R - 1) * F, R * F - 1], b: [0, F - 1] };
    sim.bodies.forEach(function (o, k) {
      if (!o.alive || o.to == null || o.to < 0) return;
      var p = Object.assign({}, o.p), s = o.to, moved = s !== o.sq, row = Math.floor(s / F);
      if (k === sim.L && sim.promote) { p.t = promo || 'Q'; p.promoted = 1; p.m = 1; }
      else if (p.t === 'R' && home[p.c].indexOf(s) >= 0) { var was = st.b[s]; if (was && was.t === 'R' && was.c === p.c && !was.m) delete p.m; else if (moved) p.m = 1; }
      else if (p.t === 'P') { if (row === (p.c === 'w' ? R - 2 : 1)) delete p.m; else if (moved) p.m = 1; }
      else if (moved) p.m = 1;
      nb[s] = p;
    });
    return nb;
  }
  function launchMove(st, F, R, from, vx, vy, promo) {
    var sim = simulate(st.b, F, R, from, vx, vy); if (!sim) return null;
    var cap = null, capSq = -1;
    sim.bodies.forEach(function (o) { if (!o.alive && !cap && o.p.c !== 'w') { cap = o.p; capSq = o.sq; } });
    var m = { f: from, t: sim.end >= 0 ? sim.end : from, p: 'P', c: 'w', cap: cap, launch: { vx: vx, vy: vy } };
    if (cap) m.capSq = capSq;
    if (sim.promote) { m.promo = promo || 'Q'; m.launch.promo = m.promo; }
    return { m: m, sim: sim };
  }
  CM._catapult = { simulate: simulate, boardAfter: boardAfter, launchMove: launchMove };

  /* ---------------- controls ---------------- */
  var CTX = null, AIM = null, ANIM = null, BOUND = null;
  function bar(ctx, html, on) {
    var el = document.getElementById('game-controls'); if (!el) return;
    el.innerHTML = '<div class="grp">' + html + '</div>'; el.hidden = false;
    el.onpointerdown = el.onpointerup = el.onpointercancel = null;
    el.onclick = function (e) { var b = e.target.closest('[data-k]'); if (b && !b.disabled) on(b.dataset.k); };
    CM.gameUI.layout();
  }
  function unbar() { var el = document.getElementById('game-controls'); if (!el) return; el.hidden = true; el.innerHTML = ''; el.onclick = null; CM.gameUI.layout(); }
  function draw(ctx) {
    var on = !!ctx.x.sling, mine = ctx.state.turn === ctx.human && !ctx.over && !ctx.game.busy && !ANIM;
    bar(ctx, '<button type="button" class="gctl' + (on ? ' gctl--primary' : '') + '" data-k="sling" aria-pressed="' + on + '" title="Toggle Pawn Launcher" style="width:auto;padding:0 16px;font-weight:700;font-size:14px;display:flex;gap:8px;align-items:center"' + (mine ? '' : ' disabled') +
      '><img alt="" src="assets/modes/Ugw05nktuDM/slingshot.png" style="width:28px;height:28px;transition:transform .2s cubic-bezier(.22,.75,.3,1);transform:scale(' + (on ? 1.2 : 1) + ')">' + (on ? 'Launcher ON' : 'Pawn Launcher') + '</button>', function () {
      if (ANIM || ctx.game.busy || ctx.state.turn !== ctx.human || ctx.over) return;
      ctx.setX('sling', on ? 0 : 1); ctx.game.sel = -1; ctx.refresh(); draw(ctx);
    });
  }
  function css() {
    if (document.getElementById('cat-css')) return;
    var s = document.createElement('style'); s.id = 'cat-css';
    s.textContent = '.cat-hide > .board .pc{visibility:hidden}' +
      '.cat-layer{position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:6;overflow:visible}' +
      '.cat-pc{position:absolute;pointer-events:none;user-select:none;will-change:left,top,opacity;transform-origin:50% 50%}' +
      '.cat-pc.is-falling{transition:opacity ' + FADE + 'ms linear,transform ' + FADE + 'ms ease-in;opacity:0;transform:scale(.7)}' +
      '.cat-puff{position:absolute;border-radius:50%;pointer-events:none;background:radial-gradient(circle,rgba(255,255,255,.95) 0,rgba(240,230,210,.7) 45%,rgba(240,230,210,0) 70%);transform:translate(-50%,-50%) scale(.3);animation:cat-puff 360ms ease-out forwards}' +
      '@keyframes cat-puff{to{transform:translate(-50%,-50%) scale(1.25);opacity:0}}' +
      '.cat-aim{position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:7;overflow:visible}';
    document.head.appendChild(s);
  }
  function BV() { return CM.gameUI.board; }
  function stage() { var b = BV(); return b && b.el && b.el.parentNode; }
  /* display squares <-> board units (the board may be flipped) */
  function toBoard(dx, dy) { return BV().flip ? { x: -dx, y: -dy } : { x: dx, y: dy }; }
  function dispXY(x, y) { var b = BV(); return b.flip ? { x: b.files - x, y: b.ranks - y } : { x: x, y: y }; }
  function pointerSq(e) {
    var b = BV(), r = b.el.getBoundingClientRect();
    return { x: (e.clientX - r.left) / r.width * b.files, y: (e.clientY - r.top) / r.height * b.ranks };
  }
  function canAim(ctx) { var G = ctx && ctx.game; return !!(G && ctx.x.sling && !ctx.over && !G.busy && !ANIM && G.state.turn === G.human && G.ctx === ctx); }
  function svgEl() {
    var s = stage(); if (!s) return null;
    var el = s.querySelector(':scope > .cat-aim');
    if (!el) { el = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); el.setAttribute('class', 'cat-aim'); el.setAttribute('aria-hidden', 'true'); el.setAttribute('preserveAspectRatio', 'none'); s.appendChild(el); }
    el.setAttribute('viewBox', '0 0 ' + BV().files + ' ' + BV().ranks);
    return el;
  }
  function drawAim() {
    var svg = svgEl(); if (!svg) return; svg.innerHTML = '';
    if (!AIM) return;
    var dx = AIM.sx - AIM.px, dy = AIM.sy - AIM.py, n = Math.hypot(dx, dy), pull = Math.min(MAXPULL, n);
    if (pull < 0.08) return;
    var ux = dx / n, uy = dy / n, head = 0.4, w = 0.213, total = Math.max(head, pull), tx = AIM.sx + ux * total, ty = AIM.sy + uy * total, bx = tx - ux * head, by = ty - uy * head;
    var h = '';
    if (total > head) h += '<line x1="' + AIM.sx + '" y1="' + AIM.sy + '" x2="' + bx + '" y2="' + by + '" stroke="#ff0000" stroke-opacity="0.7" stroke-width="' + w + '" stroke-linecap="butt"/>';
    h += '<polygon points="' + tx + ',' + ty + ' ' + (bx - uy * head / 2) + ',' + (by + ux * head / 2) + ' ' + (bx + uy * head / 2) + ',' + (by - ux * head / 2) + '" fill="#ff0000" fill-opacity="0.7"/>';
    svg.innerHTML = h;
  }
  function bind() {
    var b = BV(); if (!b || !b.el || (BOUND && BOUND.el === b.el)) return;
    unbind(); css();
    var el = b.el;
    var down = function (e) {
      if (e.button > 0 || !canAim(CTX)) return;
      var q = e.target.closest && e.target.closest('.sq'); if (!q || q.dataset.i == null) return;
      var i = +q.dataset.i, p = CTX.state.b[i];
      if (!p || p.c !== CTX.human || p.t !== 'P') return;
      e.preventDefault(); e.stopImmediatePropagation();
      var k = b.sqToDisp(i), pt = pointerSq(e);
      AIM = { i: i, id: e.pointerId, sx: k % b.files + 0.5, sy: Math.floor(k / b.files) + 0.5, px: pt.x, py: pt.y };
      try { el.setPointerCapture(e.pointerId); } catch (_) { }
      drawAim();
    };
    var move = function (e) { if (!AIM || e.pointerId !== AIM.id) return; e.stopImmediatePropagation(); var pt = pointerSq(e); AIM.px = pt.x; AIM.py = pt.y; drawAim(); };
    var up = function (e) {
      if (!AIM || e.pointerId !== AIM.id) return; e.stopImmediatePropagation();
      var a = AIM; AIM = null; drawAim(); b.noClickUntil = performance.now() + 350;
      fire(CTX, a.i, a.sx - a.px, a.sy - a.py);
    };
    var cancel = function (e) { if (!AIM || e.pointerId !== AIM.id) return; e.stopImmediatePropagation(); AIM = null; drawAim(); };
    el.addEventListener('pointerdown', down, true); el.addEventListener('pointermove', move, true);
    el.addEventListener('pointerup', up, true); el.addEventListener('pointercancel', cancel, true);
    BOUND = { el: el, down: down, move: move, up: up, cancel: cancel };
  }
  function unbind() {
    if (!BOUND) return; var el = BOUND.el;
    el.removeEventListener('pointerdown', BOUND.down, true); el.removeEventListener('pointermove', BOUND.move, true);
    el.removeEventListener('pointerup', BOUND.up, true); el.removeEventListener('pointercancel', BOUND.cancel, true);
    BOUND = null; AIM = null; drawAim();
  }

  /* ---------------- the launch: simulate, animate on an overlay, then commit ---------------- */
  /* dx, dy: the shot in display squares (pawn centre minus the release point: drag back, fire forward) */
  function fire(ctx, from, dx, dy) {
    var G = ctx.game, n = Math.hypot(dx, dy), pull = Math.min(MAXPULL, n);
    if (pull < 0.08 || !canAim(ctx)) return false;
    var v = toBoard(dx / n * pull * SPEED, dy / n * pull * SPEED), g = ctx.geo, st = G.state;
    var L = launchMove(st, g.files, g.ranks, from, v.x, v.y); if (!L) return false;
    /* the engine still needs a legal position: a launch may not leave your own king in check */
    var test = ctx.V.make(st, L.m);
    if (ctx.V.checkRule(ctx.human) !== 'none' && ctx.V.inCheck(test, ctx.human)) { CM.sound.play('illegal'); ctx.toast('That launch would leave your king in check.', 1800); return true; }
    ctx.sound('launch');
    play(ctx, st, L, function (promo) {
      if (promo) { L.m.promo = promo; L.m.launch.promo = promo; }
      BV().quietNext();
      G.commit(L.m, {});
    });
    return true;
  }
  function play(ctx, st, L, done) {
    var G = ctx.game, gid = G.gid, b = BV(), s = stage(), sim = L.sim, F = b.files, R = b.ranks;
    var ms = CM.settings.animMs();
    var finish = function (promo) {
      /* where the overlay left every piece (QA reads it to prove the board lands on the same squares) */
      CM._catapult.last = sim.bodies.filter(function (o) { return o.alive; }).map(function (o, k) { return [o.to, o.p.c + (o === sim.bodies[sim.L] && sim.promote ? (promo || 'Q') : o.p.t)]; });
      cleanup(); if (gid !== G.gid || G.state !== st) return; done(promo); };
    var pick = function () {
      if (gid !== G.gid || G.state !== st) { cleanup(); return; }
      if (!sim.promote) return finish(null);
      var to = sim.end, opts = ['Q', 'R', 'B', 'N'].map(function (t) { return { type: t, src: G.pieceImage({ t: t, c: 'w' }) }; });
      /* the overlay stays up (the pawn sits on rank 8) while the picker is open */
      CM.gameUI.promote(to, opts).then(function (t) { finish(t || 'Q'); });
    };
    G.busy = true; G.sel = -1;
    ANIM = { gid: gid, layer: null };
    draw(ctx);
    if (!ms || !s) { ANIM.instant = true; pick(); return; }
    var layer = document.createElement('div'); layer.className = 'cat-layer'; layer.setAttribute('aria-hidden', 'true'); s.appendChild(layer); ANIM.layer = layer;
    var imgs = sim.bodies.map(function (o) {
      var src = (b.pieceEl(o.sq) && b.pieceEl(o.sq).getAttribute('src')) || G.pieceImage(o.p);
      var im = document.createElement('img'); im.className = 'cat-pc'; im.src = src; im.alt = ''; im.draggable = false;
      im.style.width = (100 / F) + '%'; im.style.height = (100 / R) + '%';
      layer.appendChild(im); return im;
    });
    function put(im, x, y) { var d = dispXY(x, y); im.style.left = ((d.x - 0.5) * 100 / F) + '%'; im.style.top = ((d.y - 0.5) * 100 / R) + '%'; }
    function frame(k) { var P = sim.path[k]; for (var j = 0; j < imgs.length; j++) put(imgs[j], P[2 * j], P[2 * j + 1]); }
    frame(0);
    s.classList.add('cat-hide');
    var t0 = performance.now(), lastStep = 0, hitI = 0, fell = false;
    function tick(now) {
      if (!ANIM || ANIM.gid !== gid || gid !== G.gid || G.state !== st) { cleanup(); return; }
      var k = Math.min(sim.steps, Math.floor((now - t0) / 1000 * 60));
      if (k > lastStep) {
        frame(k);
        sim.bodies.forEach(function (o, j) { if (o.dieAt > lastStep && o.dieAt <= k) { imgs[j].classList.add('is-falling'); fell = true; } });
        while (hitI < sim.hits.length && sim.hits[hitI].step <= k) { puff(layer, sim.hits[hitI], F, R); hitI++; }
        lastStep = k;
      }
      if (k < sim.steps) { ANIM.raf = requestAnimationFrame(tick); return; }
      if (fell) CM.sound.play('capture');
      ANIM.timer = setTimeout(function () {
        if (!ANIM || gid !== G.gid || G.state !== st) { cleanup(); return; }
        sim.bodies.forEach(function (o, j) {
          if (!o.alive) return;
          var im = imgs[j]; im.style.transition = 'left ' + GLIDE + 'ms ease, top ' + GLIDE + 'ms ease'; put(im, o.tx, o.ty);
        });
        ANIM.timer = setTimeout(pick, GLIDE + 20);
      }, PAUSE);
    }
    ANIM.raf = requestAnimationFrame(tick);
  }
  var lastPuff = -99;
  function puff(layer, h, F, R) {
    if (h.step - lastPuff < 3 && layer.childElementCount > 40) return; lastPuff = h.step;
    var d = dispXY(h.x, h.y), e = document.createElement('span'), size = Math.min(0.9, 0.35 + h.v * 0.03);
    e.className = 'cat-puff'; e.style.left = (d.x * 100 / F) + '%'; e.style.top = (d.y * 100 / R) + '%';
    e.style.width = (size * 100 / F) + '%'; e.style.height = (size * 100 / R) + '%';
    layer.appendChild(e); setTimeout(function () { e.remove(); }, 420);
  }
  function cleanup() {
    var a = ANIM; ANIM = null;
    if (a) { if (a.raf) cancelAnimationFrame(a.raf); clearTimeout(a.timer); if (a.layer) a.layer.remove(); }
    var s = stage(); if (s) s.classList.remove('cat-hide');
    var G = CTX && CTX.game; if (G && a && a.gid === G.gid) G.busy = false;
  }

  CM.mode({
    id: 'Ugw05nktuDM',
    name: 'Launch Pawns',
    category: 'Powerups & Rule Twists',
    description: 'Tap the Pawn Launcher, then drag backward from one of your pawns and let go: it shoots the opposite way (pull up to 2 squares for full power) and slides, bounces and knocks pieces around. Anything pushed off the edge is gone, your own pieces too. Kings never move. When everything stops, the pieces snap to the nearest squares; a launched pawn that reaches the last rank promotes. Launching uses your turn.',
    how_to_win: 'Checkmate Stockfish. Knock its big pieces off the board.',
    player_side: 'white',
    player: { name: 'You', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },   /* iwantcheckmate's own avatar (purple king) from the videos */
    opponent: { name: 'Stockfish', rating: 3600, avatar: 'assets/modes/U_irVoLjtNI/stockfish.png', tagline: 'Has never seen a slingshot.' },
    board: { files: 8, ranks: 8 },
    theme: { light: '#ead2ae', dark: '#ae7e66' },
    setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR', x: { sling: 0 } },
    bot: { engine: 'search', style: 'best', depth: 3, time_ms: 800 },
    sounds: { launch: 'assets/modes/Ugw05nktuDM/launch.wav' },
    hooks: {
      /* the same simulation again, from the position before the launch: the result is exactly the animated one */
      onMake: function (V, st, m, n) {
        n.x.sling = 0;
        if (!m.launch) return;
        var g = V.geo, sim = simulate(st.b, g.files, g.ranks, m.f, m.launch.vx, m.launch.vy); if (!sim) return;
        n.b = boardAfter(st, sim, m.launch.promo, g.files, g.ranks); n.half = 0; n.ep = -1; n.epv = -1;
      },
      afterMove: function (ctx) { draw(ctx); return null; },
      /* with the launcher on, the board only takes launches (the original ignores taps and normal drags) */
      onTap: function (ctx) { return !!(ctx.x.sling || ANIM); },
      /* fallback for a drag the board itself tracked: same launch, measured from the pawn centre */
      drop: function (ctx, from, to, info) {
        if (!ctx.x.sling && !ANIM) return false;
        var p = ctx.at(from);
        if (ANIM || !info || info.dx == null || !p || p.c !== ctx.human || p.t !== 'P') return true;
        fire(ctx, from, -info.dx, -info.dy);
        return true;
      },
      onStart: function (ctx) { cleanup(); CTX = ctx; bind(); draw(ctx); },
      onTurn: function (ctx) { CTX = ctx; bind(); draw(ctx); },
      onUndo: function (ctx) { cleanup(); ctx.after(30, function () { draw(ctx); }); },
      onGameOver: function (ctx) { draw(ctx); },
      onExit: function () { cleanup(); unbind(); CTX = null; unbar(); },
      status: function (ctx) { return ANIM ? 'Launching...' : ctx.x.sling ? 'Launcher ready: drag backward from a pawn and let go (pull farther to shoot harder).' : 'Make a move, or tap the Pawn Launcher to launch a pawn.'; }
    },
    source: { research: 'research/modes/Ugw05nktuDM.json', confidence: 'high', notes: 'Physics constants and snap order match the original web game (catapult-chess).' }
  });
})();
