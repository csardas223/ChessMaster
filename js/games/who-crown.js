/* who-crown: "Can I BEAT Who Takes the Crown?" (video UzoZVdmGpyc), the tutorial map of the platformer Who Wears the
   Crown? as played in the video: a little pawn climbs a tower of chessboards to the royal crown, Getting Over It style.
   Rules from the transcript (times): tap Space = small jump, hold Space = bigger jump, hold too long = failed jump and
   you fall (0:30-0:40); the pieces are the platforms; boards with a lock are scenery, boards without one are games
   against Stockfish 1300 where you move White's pieces to build platforms (0:20, 2:21-2:40); the tutorial hands you
   leading moves (0:47 d4 ... Qg5, 3:40 f4, 6:53); being put into check makes you immobile until you get out of check
   (3:58-4:05); a piece that moves away from under you drops you (17:38 the king moved); checkmate grants a Super Jump:
   E to activate, hold Space to charge, let go, it jumps through pieces such as the rows of pawns above (7:11-7:50);
   checkpoints, hold R to respawn at the last one and reset the boards (3:40, 12:01, 19:10); speedrun timer (1:20);
   F toggles free cam / follow, drag to move the camera (3:23, 21:35); you can fall off the board (10:28); the tutorial
   ends by jumping up to the crown (26:35, 36:39 in the video).
   Look from the video stills (i.ytimg.com/vi/UzoZVdmGpyc/maxres2.jpg, maxres3.jpg): orange/red playable boards
   #ba5134/#8a1913, locked boards pink/maroon #b86253/#772026, teal last-move squares #168676, dark-red tutorial
   panels with gold corners in a pixel font, a brown castle wall with framed paintings and torches, white pieces with a
   dark outline, a flag pole for checkpoints. The crowned pawn / crown are cut from the video thumbnail.
   Inferred (the video never shows the whole map): the exact tower layout and every board position except the opening
   (1.d4 Qg5), the maxres2 board (f4 / Re1+ / Kf2 skewer) and the maxres3 board; jump heights and timings. */
(function () {
  'use strict';
  var CM = window.CM;

  /* ---------------- tower (world units = squares, y up, board origin = its a1 corner) ---------------- */
  var TOWER = {
    width: 20, height: 70,
    spawn: { x: 2.5, y: 0 },
    boards: [
      /* 0:47 "they obviously want us to play D4 ... we get queen to G5 ... the position has been adjusted so we can climb" */
      { x: 7, y: 0, fen: 'rnbqk3/5p2/7p/4p3/8/2P5/1P1P4/R3K3', hints: [['d2d4', 'd8g5']] },
      /* locked staircase: "up to the knight ... up to the king ... straight down that staircase" (1:46-2:10) */
      { x: 0, y: 8, locked: true, fen: '2n1k3/p7/1n6/3p4/5b2/8/6p1/8' },
      /* 2:21 first board without a lock: take the hanging pawn with check, the bishop covers d8, the king can only go to f8 */
      { x: 6, y: 16, fen: '4k2r/8/1N2p2N/6B1/3P4/2P5/1P6/K3R3', hints: [['e1e6', 'e8f8']] },
      /* 3:40 "they want us to play F4 ... we are put in check ... skewered ... D2 or F2 ... rook captures" (maxres2 board) */
      { x: 12, y: 25, fen: '2n5/pp1r3p/8/6P1/4Q3/2PP4/1k2KP2/1r3R2', hints: [['f2f4', 'b1e1'], ['e2f2', 'e1e4']] },
      /* 6:57 "we'll move the bishop to C3 ... it's checkmate" -> Super Jump */
      { x: 10, y: 34, fen: '7k/5K1p/4P3/3P4/2P5/1P6/P7/4B3', hints: [['e1c3', null]] },
      /* 7:27 "climb to the top of the board and try jumping through the rows of pawns above with your power up" */
      { x: 10, y: 43, locked: true, fen: '8/q7/2r5/3b4/5n2/8/pppppppp/PPPPPPPP' },
      /* 24:25 "knight to D4 check ... the only place the king can move is somewhere on the A file ... check, then mate" */
      { x: 2, y: 52, fen: '8/8/4R3/1k3p2/1P4p1/P7/1K2N2P/2R5', hints: [['e2d4', null]] },
      /* 26:20 "why is this position locked? ... we just hop onto the pawn, the knight, and the king ... do I just jump up?" */
      { x: 4, y: 62, locked: true, fen: '8/8/8/8/8/5k2/4n3/3p4' }
    ],
    /* stone floors the upper boards stand on (maxres2) */
    ledges: [{ x: 12, y: 24, w: 8 }, { x: 9, y: 33, w: 9 }, { x: 1, y: 51, w: 9 }],
    checkpoints: [{ x: 12.5, y: 25, label: 'Checkpoint 1' }, { x: 16.5, y: 34, label: 'Checkpoint 2' }, { x: 1.5, y: 52, label: 'Checkpoint 3' }],
    crown: { x: 9.5, y: 66.3 },
    signs: [
      { x: 0.3, y: 1.6, w: 5.6, h: 3.4, text: 'Tap SPACE: small jump.\nHold SPACE: bigger jump.\nHold too long and you\nfail the jump.' },
      { x: 15.2, y: 3.2, w: 4.6, h: 3.4, text: 'Tap a white piece,\nthen a square, to\nmove it. Stockfish\n(1300) answers.' },
      { x: 9.2, y: 10.2, w: 6.2, h: 2.6, text: 'Locked boards cannot\nbe moved. Climb them.' },
      { x: 14.4, y: 17.2, w: 5.4, h: 3.6, text: 'Press F to toggle\nbetween free cam and\nfollow. In free cam,\nhold and drag.' },
      { x: 2.2, y: 26.2, w: 7.2, h: 3.0, text: 'Being put into check\nmakes you immobile.\nGet out of check to\nmove again.' },
      { x: 1.2, y: 35.2, w: 7.6, h: 5.8, text: 'Give checkmate to gain\nsuper jump.\nE to activate super jump.\nSpace hold to charge the\njump. Let go when ready.\nThe super jump lets you\njump through peices.' },
      { x: 0.6, y: 43.6, w: 8.8, h: 5.6, text: 'On the boards, climb to the top\nof the board and try jumping\nthrough the rows of pawns above\nwith your power up. If you miss,\nreset (hold R) or checkmate\nanother board.' }
    ]
  };

  /* ---------------- physics (pure; also used by tools/qa_who_crown.mjs) ---------------- */
  var PH = { G: 28, WALK: 2.4, HW: 0.27, BH: 0.78, CHARGE: 0.9, FAIL: 1.35,
    jumpH: function (c) { return 1.25 + 1.15 * c; }, superH: function (c) { return 3.2 + 4.3 * c; } };
  PH.jump = function (c, dir, sup) {
    c = Math.max(0, Math.min(1, c));
    var h = sup ? PH.superH(c) : PH.jumpH(c);
    return { vy: Math.sqrt(2 * PH.G * h), vx: dir * (sup ? 1.3 + 1.1 * c : 1.5 + 1.7 * c) };
  };
  /* one step of the pawn's box. solid(cx, cy) -> 0 empty, 1 static (floor/walls), 2 piece. While b.phase is set
     (super jump on its way up) pieces do not stop it; cells the box already overlaps never block (no snagging). */
  PH.step = function (b, dt, solid) {
    var n = Math.max(1, Math.ceil(Math.max(Math.abs(b.vy), Math.abs(b.vx)) * dt / 0.3)), h = dt / n, landed = null;
    for (var s = 0; s < n; s++) {
      if (!b.ground) b.vy -= PH.G * h;
      var ign = function (k) { return k === 2 && b.phase && b.vy > 0; };
      var block = function (cx, cy, x, y) { var k = solid(cx, cy); return k && !ign(k) && !overlaps(x, y, cx, cy); };
      /* horizontal */
      var nx = b.x + b.vx * h;
      if (b.vx) {
        var y0 = Math.floor(b.y + 0.02), y1 = Math.floor(b.y + PH.BH - 0.02), cx = b.vx > 0 ? Math.floor(nx + PH.HW) : Math.floor(nx - PH.HW);
        for (var cy = y0; cy <= y1; cy++) if (block(cx, cy, b.x, b.y)) { nx = b.vx > 0 ? cx - PH.HW - 1e-4 : cx + 1 + PH.HW + 1e-4; b.vx = 0; break; }
      }
      b.x = nx;
      /* vertical */
      var ny = b.y + b.vy * h, c0 = Math.floor(b.x - PH.HW + 1e-4), c1 = Math.floor(b.x + PH.HW - 1e-4), wasGround = b.ground;
      b.ground = false;
      if (b.vy <= 0) {
        var rr = Math.floor(ny - 1e-6);
        for (var c = c0; c <= c1; c++) {
          var k = solid(c, rr);
          if (k && b.y >= rr + 1 - 1e-3 && !(k === 2 && overlaps(b.x, b.y, c, rr))) { ny = rr + 1; b.ground = true; break; }
        }
        if (b.ground) { if (!wasGround) landed = { vy: b.vy }; b.vy = 0; b.phase = false; }
      } else {
        var rt = Math.floor(ny + PH.BH);
        for (c = c0; c <= c1; c++) if (block(c, rt, b.x, b.y) && b.y + PH.BH <= rt + 1e-3) { ny = rt - PH.BH; b.vy = 0; break; }
      }
      b.y = ny;
      if (b.ground) b.vx = b.walk ? b.vx : 0;
    }
    return landed;
  };
  function overlaps(x, y, cx, cy) { return x + PH.HW > cx + 1e-3 && x - PH.HW < cx + 1 - 1e-3 && y + PH.BH > cy + 1e-3 && y < cy + 1 - 1e-3; }
  function fenRows(fen) {
    return fen.split(' ')[0].split('/').map(function (r) { var o = []; r.split('').forEach(function (ch) { if (/\d/.test(ch)) for (var i = 0; i < +ch; i++) o.push('.'); else o.push(ch); }); return o; });
  }
  CM.whoCrown = { TOWER: TOWER, phys: PH, fenRows: fenRows };

  if (!CM.defineGame) return;
  CM.defineGame('who-crown', function (host) {
    var A = host.spec.assets || {};
    var COL = { light: '#ba5134', dark: '#8a1913', lockLight: '#b86253', lockDark: '#772026', teal: '#168676', wall: '#523632', wall2: '#46302c',
      stone: '#45494a', panel: '#6e1418', gold: '#e0a243', text: '#f4e9e1' };
    var FILES = 'abcdefgh';
    var V = CM.spec.buildVariant({ board: { files: 8, ranks: 8 }, pieces: {}, rules: { check: 'standard', castling: false, enPassant: true, promotion: { auto: 'Q' }, win: [{ type: 'checkmate' }] } }, {});
    var imgs = {};
    function img(c, t) { var k = c + t; if (!imgs[k]) { imgs[k] = new Image(); imgs[k].src = host.pieceUrl(c, t); } return imgs[k]; }
    function asset(u) { var i = new Image(); if (u) i.src = u; return i; }
    var crownImg = asset(A.crown), crownedImg = asset(A.crowned_pawn);
    /* the tutorial panels' pixel font: VT323 (assets/fonts, SIL OFL 1.1), loaded for the canvas */
    var FONT = '"Courier New", monospace';
    try { if (window.FontFace && document.fonts) { var ff = new FontFace('CrownPixel', 'url(assets/fonts/VT323.woff2)'); document.fonts.add(ff); ff.load().then(function () { FONT = 'CrownPixel, "Courier New", monospace'; }).catch(function () { }); } } catch (_) { }
    var cv = host.canvas, W = cv.width, H = cv.height;
    var S = null, keys = {}, cam = { x: 10, y: 4, free: false, zoom: false }, drag = null;
    var BOT = { engine: 'stockfish', elo: 1320 };
    var botCtx = { spec: host.spec, game: { opponent: { name: 'Stockfish', rating: 1300 }, history: [] } };

    /* ---------- state ---------- */
    function boardState(B) {
      var st = CM.spec.initialState(V, { setup: { fen: B.fen, turn: 'w' }, board: { files: 8, ranks: 8 } });
      return { B: B, st: st, hint: B.hints ? 0 : -1, last: null, sel: -1, over: null, busy: false, anim: null, sans: [] };
    }
    function fresh() {
      S = { boards: TOWER.boards.map(boardState), pawn: { x: TOWER.spawn.x, y: TOWER.spawn.y, vx: 0, vy: 0, ground: false, phase: false, face: 1 },
        charge: -1, fail: 0, supers: 0, armed: false, cp: -1, t: 0, best: 0, won: false, fx: [], immobile: false, rHold: 0 };
      cam.x = S.pawn.x; cam.y = S.pawn.y + 3; cam.free = false; cam.zoom = false; keys = {};
      host.setMoves([]); host.setCaptured([], []);
      host.status('Climb the tower. Tap the pieces on boards without a lock to move them.');
      hud();
    }
    function respawn() {
      if (!S) return;
      var cp = S.cp >= 0 ? TOWER.checkpoints[S.cp] : null;
      var P = S.pawn; P.x = cp ? cp.x : TOWER.spawn.x; P.y = cp ? cp.y : TOWER.spawn.y; P.vx = P.vy = 0; P.ground = false; P.phase = false;
      /* every board from the checkpoint up starts over, so a mate (and its super jump) can be played again (12:01) */
      var fromY = cp ? cp.y - 8 : -1;
      S.boards = S.boards.map(function (bs) { return bs.B.y >= fromY ? boardState(bs.B) : bs; });
      S.supers = 0; S.armed = false; S.charge = -1; S.fail = 0;
      cam.free = false; cam.zoom = false; host.setMoves([]);
      host.toast(cp ? 'Back at ' + cp.label : 'Back at the start', 1400);
    }

    /* ---------- world queries ---------- */
    function pieceAt(cx, cy) {
      for (var i = 0; i < S.boards.length; i++) {
        var bs = S.boards[i], B = bs.B;
        if (cx >= B.x && cx < B.x + 8 && cy >= B.y && cy < B.y + 8) { var p = bs.st.b[(7 - (cy - B.y)) * 8 + (cx - B.x)]; if (p) return p; }
      }
      return null;
    }
    function solid(cx, cy) {
      if (cy < 0 || cx < 0 || cx >= TOWER.width) return 1;
      if (ledgeAt(cx, cy)) return 1;
      return pieceAt(cx, cy) ? 2 : 0;
    }
    function ledgeAt(cx, cy) { for (var i = 0; i < TOWER.ledges.length; i++) { var L = TOWER.ledges[i]; if (cy === L.y && cx >= L.x && cx < L.x + L.w) return true; } return false; }
    function boardAtPoint(x, y) {
      for (var i = 0; i < S.boards.length; i++) { var B = S.boards[i].B; if (x >= B.x && x < B.x + 8 && y >= B.y && y < B.y + 8) return S.boards[i]; }
      return null;
    }
    function sqOf(bs, x, y) { var B = bs.B, f = Math.floor(x - B.x), r = Math.floor(y - B.y); return (7 - r) * 8 + f; }
    function cellOfSq(bs, i) { return { x: bs.B.x + (i % 8), y: bs.B.y + 7 - Math.floor(i / 8) }; }
    function uciMove(bs, u) { var ms = V.legal(bs.st); return V.fromUCI(ms, u); }

    /* ---------- chess on the unlocked boards ---------- */
    function inCheckHere() {
      var P = S.pawn, bs = boardAtPoint(P.x, P.y + 0.4);
      return !!(bs && !bs.B.locked && !bs.over && bs.st.turn === 'w' && V.inCheck(bs.st, 'w'));
    }
    function applyMove(bs, m, who) {
      var ms = V.legal(bs.st), next = V.make(bs.st, m);
      var san = V.san(bs.st, m, ms, next);
      bs.anim = { f: m.f, t: m.t, p: bs.st.b[m.f], t0: performance.now(), dur: host.reduced() ? 1 : 200 };
      bs.st = next; bs.last = { f: m.f, t: m.t }; bs.sel = -1;
      bs.sans.push({ san: san, c: who });
      host.setMoves(bs.sans.concat());
      host.sound(m.cap ? 'capture' : V.inCheck(next, next.turn) ? 'move-check' : who === 'w' ? 'move-self' : 'move-opponent');
      /* a piece landing on the pawn lifts it on top (it never gets stuck inside a piece) */
      var c = cellOfSq(bs, m.t), P = S.pawn;
      if (overlaps(P.x, P.y, c.x, c.y)) { P.y = c.y + 1; P.vy = 0; }
      var res = V.result(next, V.legal(next));
      if (res) {
        bs.over = res;
        if (res.w === 'w' && res.why === 'checkmate') {
          S.supers++;
          host.sound('promote');
          host.toast('Checkmate! Super jump gained: press E (or the action button), then hold and release jump.', 4200);
          burst(c.x + 0.5, c.y + 0.5, '#7fe3ff');
        } else if (res.w === 'b') host.toast('Stockfish mated you on this board. Hold R to reset to your checkpoint.', 4200);
        else host.toast('This board is finished (' + res.why + ').', 2600);
      }
      return next;
    }
    function botTurn(bs) {
      if (bs.over || bs.st.turn !== 'b') return;
      bs.busy = true; host.setThinking('Stockfish');
      var ms = V.legal(bs.st), scripted = null;
      if (bs.hint >= 0 && bs.B.hints && bs.B.hints[bs.hint - 1] && bs.B.hints[bs.hint - 1][1]) scripted = V.fromUCI(ms, bs.B.hints[bs.hint - 1][1]);
      var go = function (m) {
        bs.busy = false; host.setThinking('');
        if (!S || S.boards.indexOf(bs) < 0 || bs.st.turn !== 'b' || bs.over) return;
        if (!m || ms.indexOf(m) < 0) m = ms[0];
        if (m) applyMove(bs, m, 'b');
      };
      if (scripted) { host.after(420, function () { go(scripted); }); return; }
      var t0 = performance.now();
      Promise.resolve(CM.bot && CM.bot.choose ? CM.bot.choose(V, bs.st, ms, BOT, {}, botCtx) : null).then(function (m) {
        host.after(Math.max(0, 380 - (performance.now() - t0)), function () { go(m); });
      }).catch(function () { go(null); });
    }
    function tapBoard(bs, i) {
      if (bs.B.locked) { host.toast('This board is locked.', 1200); return; }
      if (bs.over || bs.busy || bs.st.turn !== 'w') return;
      var p = bs.st.b[i], ms = V.legal(bs.st);
      if (bs.sel >= 0) {
        var m = ms.filter(function (x) { return x.f === bs.sel && x.t === i; })[0];
        if (m) {
          if (m.promo && m.promo !== 'Q') m = ms.filter(function (x) { return x.f === bs.sel && x.t === i && x.promo === 'Q'; })[0] || m;
          /* the leading move: follow it and the reply is the tutorial's; leave it and Stockfish plays on its own */
          if (bs.hint >= 0 && bs.B.hints && bs.B.hints[bs.hint]) {
            var h = V.fromUCI(ms, bs.B.hints[bs.hint][0]);
            bs.hint = h === m ? bs.hint + 1 : -1;
          }
          applyMove(bs, m, 'w');
          if (!bs.over) botTurn(bs);
          return;
        }
      }
      if (p && p.c === 'w' && ms.some(function (x) { return x.f === i; })) { bs.sel = bs.sel === i ? -1 : i; host.sound('premove'); }
      else bs.sel = -1;
    }

    /* ---------- input ---------- */
    function toWorld(e) {
      var r = cv.getBoundingClientRect(), px = (e.clientX - r.left) / r.width * W, py = (e.clientY - r.top) / r.height * H, sc = scale();
      return { x: cam.x + (px - W / 2) / sc, y: cam.y - (py - H / 2) / sc };
    }
    function onDown(e) {
      if (!S || host.isOver) return;
      var w = toWorld(e); drag = { sx: e.clientX, sy: e.clientY, cx: cam.x, cy: cam.y, moved: false, w: w };
      try { cv.setPointerCapture(e.pointerId); } catch (_) { }
    }
    function onMove(e) {
      if (!drag) return;
      var r = cv.getBoundingClientRect(), sc = scale() * r.width / W, dx = (e.clientX - drag.sx) / sc, dy = (e.clientY - drag.sy) / sc;
      if (!drag.moved && Math.abs(dx) + Math.abs(dy) < 0.3) return;
      drag.moved = true; cam.free = true;   /* drag = free cam (the video's F + hold and drag); moving the pawn returns to follow */
      cam.x = drag.cx - dx; cam.y = drag.cy + dy; clampCam();
    }
    function onUp() {
      if (!drag) return; var d = drag; drag = null;
      if (d.moved) return;
      var bs = boardAtPoint(d.w.x, d.w.y);
      if (bs) tapBoard(bs, sqOf(bs, d.w.x, d.w.y));
    }
    function startCharge() {
      var P = S.pawn;
      if (!P.ground || S.fail > 0 || S.won) return;
      if (S.immobile) { host.sound('illegal'); return; }
      S.charge = 0;
    }
    function release() {
      if (S.charge < 0) return;
      var P = S.pawn, t = S.charge; S.charge = -1;
      if (!P.ground || S.immobile) return;
      var c = t < 0.12 ? 0 : Math.min(1, t / PH.CHARGE), dir = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
      var sup = S.armed; S.armed = false;
      var j = PH.jump(c, dir, sup);
      P.vx = j.vx; P.vy = j.vy; P.ground = false; P.walk = false; P.phase = sup;
      if (dir) P.face = dir;
      if (sup) { S.supers--; burst(P.x, P.y, '#7fe3ff'); }
      host.sound('premove');
    }
    function failJump() {
      /* held too long: the pawn loses its footing and tumbles backwards (0:38 "you fail the jump and you fall") */
      var P = S.pawn; S.charge = -1; S.fail = 0.9; S.armed = false;
      P.vx = -P.face * 1.9; P.vy = Math.sqrt(2 * PH.G * 0.45); P.ground = false; P.walk = false;
      host.sound('illegal'); host.toast('Held too long: failed jump!', 1100);
    }

    /* ---------- loop ---------- */
    function step(dt) {
      if (!S) return;
      var P = S.pawn;
      if (!S.won && !host.isOver) S.t += dt;
      S.immobile = inCheckHere();
      if (S.charge >= 0) { S.charge += dt; if (S.charge > PH.FAIL) failJump(); if (S.immobile) S.charge = -1; }
      if (S.fail > 0 && P.ground) S.fail = Math.max(0, S.fail - dt);
      var dir = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
      if (P.ground) {
        if (S.charge < 0 && S.fail <= 0 && !S.immobile && !S.won) { P.vx = dir * PH.WALK; P.walk = !!dir; if (dir) P.face = dir; }
        else { P.vx = 0; P.walk = false; if (dir && S.charge >= 0) P.face = dir; }
      }
      var fromY = P.y, landed = PH.step(P, dt, solid);
      if (landed && landed.vy < -14) { host.sound('move-self'); if (!host.reduced()) shake(0.18); }
      if (P.y > S.best) S.best = P.y;
      if (P.y < -20) { P.y = 0; }
      /* checkpoints */
      TOWER.checkpoints.forEach(function (F, i) {
        if (i > S.cp && Math.abs(P.x - F.x) < 0.9 && P.y >= F.y - 0.3 && P.y < F.y + 2) { S.cp = i; host.sound('notify'); host.toast(F.label + ' reached. Hold R to respawn here.', 2000); burst(F.x, F.y + 1, '#ffd35a'); }
      });
      /* the crown */
      var C = TOWER.crown;
      if (!S.won && Math.abs(P.x - C.x) < 0.75 && P.y + PH.BH > C.y && P.y < C.y + 0.9) win();
      /* R held: respawn */
      if (keys.reset) { S.rHold += dt; if (S.rHold > 0.45) { S.rHold = -99; respawn(); } }
      if (!cam.free) {
        var k = Math.min(1, dt * 5);
        cam.x += (P.x - cam.x) * k; cam.y += (P.y + 1.5 - cam.y) * k; clampCam();
      }
      void fromY;
      hud(); draw(dt);
    }
    function win() {
      S.won = true; S.pawn.vx = 0;
      burst(TOWER.crown.x, TOWER.crown.y, '#ffd35a');
      host.after(900, function () {
        host.over({ result: 'win', title: 'You wear the crown!', whyRaw: 'Tutorial tower cleared in ' + clock(S.t) + ' (the video: 36:39)' });
      });
    }
    function clock(t) { var m = Math.floor(t / 60), s = t - m * 60; return m + ':' + (s < 10 ? '0' : '') + s.toFixed(2); }
    function hud() {
      if (!S) return;
      host.hud('<span>' + clock(S.t) + '</span><span>Height ' + Math.max(0, S.pawn.y).toFixed(1) + '</span>' +
        (S.supers > 0 || S.armed ? '<span>Super jump' + (S.armed ? ' ready' : ' x' + S.supers) + '</span>' : '') +
        (S.immobile ? '<span>In check: immobile</span>' : ''));
    }

    /* ---------- drawing ---------- */
    function scale() { return W / (cam.zoom ? 22 : 11); }
    function clampCam() {
      var vw = W / scale() / 2, vh = H / scale() / 2;
      cam.x = Math.max(vw - 1, Math.min(TOWER.width + 1 - vw, cam.x));
      cam.y = Math.max(vh - 1.5, Math.min(TOWER.height - vh + 1, cam.y));
    }
    var shakeT = 0;
    function shake(t) { shakeT = t; }
    function burst(x, y, col) { if (host.reduced()) return; S.fx.push({ x: x, y: y, col: col, t: 0 }); }
    function sx(x) { return (x - cam.x) * scale() + W / 2; }
    function sy(y) { return H / 2 - (y - cam.y) * scale(); }
    function draw(dt) {
      var g = host.g; if (!g || !S) return;
      W = cv.width; H = cv.height;
      var sc = scale();
      g.setTransform(1, 0, 0, 1, 0, 0);
      if (shakeT > 0) { shakeT -= dt || 0; g.translate((Math.random() - 0.5) * sc * 0.06, (Math.random() - 0.5) * sc * 0.06); }
      /* castle wall */
      g.fillStyle = COL.wall; g.fillRect(0, 0, W, H);
      g.strokeStyle = COL.wall2; g.lineWidth = Math.max(1, sc * 0.03);
      var yb = Math.floor(cam.y - H / sc), yt = Math.ceil(cam.y + H / sc);
      for (var y = yb; y <= yt; y += 2) { g.beginPath(); g.moveTo(0, sy(y)); g.lineTo(W, sy(y)); g.stroke(); }
      /* side walls (stone) and floor */
      g.fillStyle = COL.stone;
      g.fillRect(0, 0, Math.max(0, sx(0)), H); g.fillRect(sx(TOWER.width), 0, W, H);
      g.fillRect(0, sy(0), W, H);
      g.fillStyle = '#3a3d3e'; g.fillRect(0, sy(0), W, sc * 0.12);
      drawDecor(g, sc);
      TOWER.signs.forEach(function (s) { drawSign(g, sc, s); });
      TOWER.ledges.forEach(function (L) {
        var x = sx(L.x), y = sy(L.y + 1);
        g.fillStyle = COL.stone; g.fillRect(x, y, L.w * sc, sc);
        g.fillStyle = '#5b6061'; g.fillRect(x, y, L.w * sc, sc * 0.14);
        g.strokeStyle = '#3a3d3e'; g.lineWidth = Math.max(1, sc * 0.03);
        for (var k = 1; k < L.w; k += 2) { g.beginPath(); g.moveTo(x + k * sc, y + sc * 0.14); g.lineTo(x + k * sc, y + sc); g.stroke(); }
      });
      S.boards.forEach(function (bs) { drawBoard(g, sc, bs); });
      TOWER.checkpoints.forEach(function (F, i) { drawFlag(g, sc, F, i <= S.cp); });
      /* the crown */
      if (!S.won) {
        var C = TOWER.crown, bob = host.reduced() ? 0 : Math.sin(performance.now() / 400) * 0.08;
        if (crownImg.complete && crownImg.naturalWidth) g.drawImage(crownImg, sx(C.x - 0.5), sy(C.y + 0.9 + bob), sc, sc);
      }
      drawPawn(g, sc);
      S.fx = S.fx.filter(function (f) {
        f.t += dt || 0; var q = f.t / 0.7; if (q > 1) return false;
        g.strokeStyle = f.col; g.globalAlpha = 1 - q; g.lineWidth = sc * 0.08;
        g.beginPath(); g.arc(sx(f.x), sy(f.y), sc * (0.3 + 1.2 * q), 0, Math.PI * 2); g.stroke(); g.globalAlpha = 1; return true;
      });
    }
    function drawDecor(g, sc) {
      /* framed paintings and torches on the wall, every 8 squares (maxres3) */
      for (var k = 0; k < 9; k++) {
        var fx = k % 2 ? 15.6 : 0.6, fy = 4 + k * 7.3;
        if (TOWER.signs.some(function (s) { return fx < s.x + s.w && fx + 3 > s.x && fy < s.y + s.h && fy + 3.6 > s.y; })) continue;
        if (S.boards.some(function (bs) { var B = bs.B; return fx < B.x + 8 && fx + 3 > B.x && fy < B.y + 8 && fy + 3.6 > B.y; })) continue;
        var x = sx(fx), y = sy(fy + 3.6), w = 3 * sc, h = 3.6 * sc, b = sc * 0.22;
        g.fillStyle = '#e8a14c'; g.fillRect(x, y, w, h);
        g.fillStyle = '#4f86c6'; g.fillRect(x + b, y + b, w - 2 * b, (h - 2 * b) * 0.45);
        g.fillStyle = '#8c8fb4'; g.beginPath(); g.moveTo(x + b, y + b + (h - 2 * b) * 0.55); g.lineTo(x + w * 0.45, y + h * 0.33); g.lineTo(x + w - b, y + b + (h - 2 * b) * 0.55); g.fill();
        g.fillStyle = '#4f9a36'; g.fillRect(x + b, y + b + (h - 2 * b) * 0.55, w - 2 * b, (h - 2 * b) * 0.45);
      }
    }
    function drawSign(g, sc, s) {
      var x = sx(s.x), y = sy(s.y + s.h), w = s.w * sc, h = s.h * sc, c = sc * 0.14;
      if (x > W || x + w < 0 || y > H || y + h < 0) return;
      g.fillStyle = COL.panel; g.fillRect(x, y, w, h);
      g.fillStyle = COL.gold; [[x, y], [x + w - c, y], [x, y + h - c], [x + w - c, y + h - c]].forEach(function (p) { g.fillRect(p[0], p[1], c, c); });
      var lines = s.text.split('\n'), fs = Math.min(sc * 0.5, h / (lines.length + 0.6));
      g.font = fs + 'px ' + FONT;
      var widest = Math.max.apply(null, lines.map(function (l) { return g.measureText(l).width; }));
      if (widest > w * 0.9) { fs *= w * 0.9 / widest; g.font = fs + 'px ' + FONT; }
      g.fillStyle = COL.text; g.textAlign = 'center'; g.textBaseline = 'middle';
      lines.forEach(function (l, i) { g.fillText(l, x + w / 2, y + h / 2 + (i - (lines.length - 1) / 2) * fs); });
    }
    function drawFlag(g, sc, F, on) {
      var x = sx(F.x), y = sy(F.y);
      g.fillStyle = '#5a3b26'; g.fillRect(x - sc * 0.04, y - sc * 1.5, sc * 0.08, sc * 1.5);
      g.fillStyle = on ? '#e8e2d8' : '#9aa0a6';
      g.beginPath(); g.moveTo(x + sc * 0.04, y - sc * 1.5); g.lineTo(x + sc * 0.5, y - sc * 1.33); g.lineTo(x + sc * 0.04, y - sc * 1.16); g.fill();
    }
    function drawBoard(g, sc, bs) {
      var B = bs.B, x0 = sx(B.x), y0 = sy(B.y + 8);
      if (x0 > W || x0 + 8 * sc < 0 || y0 > H || y0 + 8 * sc < 0) return;
      var L = B.locked ? COL.lockLight : COL.light, D = B.locked ? COL.lockDark : COL.dark;
      for (var r = 0; r < 8; r++) for (var f = 0; f < 8; f++) {
        g.fillStyle = (r + f) % 2 ? L : D;
        g.fillRect(Math.floor(x0 + f * sc), Math.floor(y0 + (7 - r) * sc), Math.ceil(sc), Math.ceil(sc));
      }
      var cell = function (i) { return { x: x0 + (i % 8) * sc, y: y0 + Math.floor(i / 8) * sc }; };
      if (bs.last) [bs.last.f, bs.last.t].forEach(function (i) { var c = cell(i); g.fillStyle = COL.teal; g.fillRect(c.x, c.y, sc, sc); });
      /* the leading move: dashed outline on the piece and its square (maxres2 f4) */
      if (bs.hint >= 0 && B.hints && B.hints[bs.hint] && bs.st.turn === 'w' && !bs.over) {
        var u = B.hints[bs.hint][0];
        [u.slice(0, 2), u.slice(2, 4)].forEach(function (n) {
          var i = (8 - (+n[1])) * 8 + FILES.indexOf(n[0]), c = cell(i);
          g.save(); g.setLineDash([sc * 0.1, sc * 0.08]); g.strokeStyle = '#fff'; g.lineWidth = sc * 0.04; g.strokeRect(c.x + sc * 0.04, c.y + sc * 0.04, sc * 0.92, sc * 0.92); g.restore();
        });
      }
      if (bs.sel >= 0) {
        var cs = cell(bs.sel); g.strokeStyle = '#fff'; g.lineWidth = sc * 0.05; g.strokeRect(cs.x + sc * 0.03, cs.y + sc * 0.03, sc * 0.94, sc * 0.94);
        V.legal(bs.st).forEach(function (m) { if (m.f !== bs.sel) return; var c = cell(m.t); g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.arc(c.x + sc / 2, c.y + sc / 2, sc * (m.cap ? 0.42 : 0.15), 0, Math.PI * 2); g.fill(); });
      }
      var now = performance.now(), Am = bs.anim;
      for (var i = 0; i < 64; i++) {
        var p = bs.st.b[i]; if (!p) continue;
        var c = cell(i);
        if (Am && Am.t === i && now - Am.t0 < Am.dur) { var e = (now - Am.t0) / Am.dur, fc = cell(Am.f); e = 1 - Math.pow(1 - e, 3); c = { x: fc.x + (c.x - fc.x) * e, y: fc.y + (c.y - fc.y) * e }; }
        var im = img(p.c, p.t); if (im.complete && im.naturalWidth) g.drawImage(im, c.x, c.y, sc, sc);
      }
      if (Am && now - Am.t0 >= Am.dur) bs.anim = null;
      if (B.locked) drawLock(g, x0 + 8 * sc - sc * 0.55, y0 + sc * 0.12, sc * 0.42);
      else if (bs.over) { g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(x0, y0, 8 * sc, 8 * sc); }
    }
    function drawLock(g, x, y, s) {
      g.fillStyle = '#e0a243'; g.fillRect(x, y + s * 0.42, s, s * 0.58);
      g.strokeStyle = '#e0a243'; g.lineWidth = s * 0.14; g.beginPath(); g.arc(x + s / 2, y + s * 0.42, s * 0.3, Math.PI, 0); g.stroke();
      g.fillStyle = '#5a2a10'; g.fillRect(x + s * 0.44, y + s * 0.6, s * 0.12, s * 0.22);
    }
    function drawPawn(g, sc) {
      var P = S.pawn, x = sx(P.x), y = sy(P.y);
      var sq = S.charge >= 0 ? Math.min(1, S.charge / PH.CHARGE) * 0.12 : 0;   /* squash while charging */
      var w = sc * 0.95, h = sc * 0.95 * (1 - sq);
      if (S.armed || P.phase) { g.fillStyle = 'rgba(127,227,255,.28)'; g.beginPath(); g.arc(x, y - h * 0.45, sc * 0.62, 0, Math.PI * 2); g.fill(); }
      g.fillStyle = 'rgba(0,0,0,.28)'; g.beginPath(); g.ellipse(x, y - sc * 0.02, sc * 0.3, sc * 0.07, 0, 0, Math.PI * 2); g.fill();
      var tilt = S.fail > 0 && !host.reduced() ? -P.face * Math.min(1.2, S.fail * 1.6) : 0;
      g.save(); g.translate(x, y); g.rotate(tilt); g.scale(P.face < 0 ? -1 : 1, 1);
      var im = S.won && crownedImg.complete && crownedImg.naturalWidth ? crownedImg : img('w', 'P');
      if (im.complete && im.naturalWidth) g.drawImage(im, -w / 2, -h - (S.won ? sc * 0.35 : 0), w, h + (S.won ? sc * 0.35 : 0));
      g.restore();
      if (S.charge >= 0) {
        var t = S.charge, k = Math.min(1, t / PH.CHARGE), over = t > PH.CHARGE;
        g.fillStyle = 'rgba(0,0,0,.55)'; g.fillRect(x - sc * 0.4, y - sc * 1.25, sc * 0.8, sc * 0.12);
        g.fillStyle = over ? '#e0473c' : S.armed ? '#7fe3ff' : '#81b64c'; g.fillRect(x - sc * 0.4, y - sc * 1.25, sc * 0.8 * k, sc * 0.12);
      }
      if (S.immobile) {
        /* "that little cross red thing that says we can't move" (4:01) */
        g.strokeStyle = '#e0473c'; g.lineWidth = sc * 0.09; var cx = x, cy = y - sc * 1.25, r = sc * 0.2;
        g.beginPath(); g.moveTo(cx - r, cy - r); g.lineTo(cx + r, cy + r); g.moveTo(cx + r, cy - r); g.lineTo(cx - r, cy + r); g.stroke();
      }
    }

    cv.addEventListener('pointerdown', onDown); cv.addEventListener('pointermove', onMove); cv.addEventListener('pointerup', onUp); cv.addEventListener('pointercancel', onUp);
    host.el.__crown = { S: function () { return S; }, cam: cam, T: TOWER, warp: function (x, y) { S.pawn.x = x; S.pawn.y = y; S.pawn.vx = S.pawn.vy = 0; S.pawn.ground = false; },
      move: function (bi, u) { var bs = S.boards[bi], m = uciMove(bs, u); if (!m) return false; tapBoard(bs, m.f); tapBoard(bs, m.t); return true; } };
    function newGame() { fresh(); host.toast('Tap Space (or the jump button) for a small jump, hold it for a bigger one, not too long.', 3800); }
    return {
      wantsRawKeys: true,
      start: function () { W = cv.width; H = cv.height; newGame(); host.loop(step); },
      newGame: newGame,
      stop: function () { cv.removeEventListener('pointerdown', onDown); cv.removeEventListener('pointermove', onMove); cv.removeEventListener('pointerup', onUp); cv.removeEventListener('pointercancel', onUp); S = null; },
      qa: function () { return S && { x: S.pawn.x, y: S.pawn.y, ground: S.pawn.ground, supers: S.supers, cp: S.cp, won: S.won, t: S.t, immobile: S.immobile }; },
      key: function (k, down) {
        if (!S) return;
        if (down && cam.free && (k === 'jump' || k === 'up' || k === 'left' || k === 'right')) { cam.free = false; cam.zoom = false; }
        if (k === 'jump' || k === 'up' || k === 'Space') { if (down) startCharge(); else release(); return; }
        if (k === 'action' || k === 'KeyE') {
          if (down && S.supers > 0 && !S.armed) { S.armed = true; host.sound('promote'); host.toast('Super jump ready: hold jump to charge, let go.', 1600); }
          return;
        }
        if (k === 'KeyR' || k === 'reset') { keys.reset = down; if (!down) S.rHold = 0; return; }
        if (k === 'KeyF' || k === 'cam') { if (down) { cam.free = !cam.free; cam.zoom = cam.free; clampCam(); host.toast(cam.free ? 'Free cam: drag to move the camera' : 'Camera follows the pawn', 1200); } return; }
        if (k === 'left' || k === 'right') keys[k] = down;
      },
      resize: function (w, h) { W = w; H = h; draw(0); },
      redraw: function () { draw(0); }
    };
  });
})();
