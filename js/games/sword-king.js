/* Sword King: "Chess, But My Pieces Have Gravity" (rx-HCGCNuDo). A real-time side-view platformer on an 8x8 board:
   rank 1 is the floor, gravity pulls your king down, and Black's full army sits on its usual squares as solid
   blocks you can stand on. You run, jump and swing a diamond-style sword (original art): a swing removes the black
   piece in front of you (or below you while you are in the air). Stockfish moves on a fixed timer (3 s, 2 s, 1 s,
   0.5 s by level); for its move your king is rounded to the nearest square, and a black piece landing on that square
   captures you. Stab the black king to win.
   Sources: research/modes/rx-HCGCNuDo.json (transcript 00:01 rules + speeds, 00:30 rounding to the nearest square,
   02:14 pawn "ladders"). Inferred: jump height (about 1.3 squares), run speed, sword reach, king start square e1,
   black pieces do not fall (the narrator climbs pawns standing on b3 and c5). Uses CM.Variant + CM.Search for
   Black's moves (king capture rules, white = a lone king on the rounded square). */
(function () {
  'use strict';
  var CM = window.CM;

  CM.defineGame('sword-king', function (host) {
    var P = host.params || {};
    var LEVELS = [3, 2, 1, 0.5];
    var G = 30, JUMP = Math.sqrt(2 * G * (P.jumpSquares || 1.35)), RUN = P.runSpeed || 3.4;
    var KW = 0.62, KH = 0.86;           /* king box in squares */
    var FILES = 'abcdefgh';
    var V = CM.spec.buildVariant({ board: { files: 8, ranks: 8 }, pieces: {}, rules: { check: 'none', castling: false, enPassant: false, promotion: { auto: 'Q' }, win: [{ type: 'checkmate' }] } }, {});
    var imgs = {}, sword = new Image(), skImg = new Image();
    skImg.src = (host.spec.assets && host.spec.assets.king) || '';   /* the video's sword-king sprite (research/frames/sprites) */
    if (host.spec.assets && host.spec.assets.sword) sword.src = host.spec.assets.sword;   /* the video sprite (king + sword) is the default */
    function img(c, t) { var k = c + t; if (!imgs[k]) { imgs[k] = new Image(); imgs[k].src = host.pieceUrl(c, t); imgs[k].onload = redraw; } return imgs[k]; }

    var S = null, level = 0, keys = {}, W = 0, H = 0;

    function idx(col, rank) { return (8 - rank) * 8 + col; }          /* rank 1..8 */
    function cellOf(i) { return { col: i % 8, rank: 8 - Math.floor(i / 8) }; }
    function solidAt(col, rank) { if (col < 0 || col > 7 || rank < 1 || rank > 8) return false; return !!S.b[idx(col, rank)]; }

    function fresh() {
      var b = new Array(64).fill(null), back = 'RNBQKBNR';
      for (var c = 0; c < 8; c++) { b[idx(c, 8)] = V.piece(back[c], 'b'); b[idx(c, 7)] = V.piece('P', 'b'); }
      S = { b: b, kx: 4.5, ky: 0, vx: 0, vy: 0, face: 1, ground: true, swing: 0, swingHit: false, timer: LEVELS[level], moves: [], caps: [], anim: null, deadT: 0, stabs: 0 };
      keys = {};
      host.setMoves([]); host.setCaptured([], []);
      host.setPlayers({ opp: { name: 'Stockfish', rating: 3600 } });
      host.status('Level ' + (level + 1) + ': Stockfish moves every ' + LEVELS[level] + ' s');
      hud();
    }
    function hud() {
      var t = S ? Math.max(0, S.timer) : 0;
      host.hud('<span>Lv ' + (level + 1) + ' · ' + LEVELS[level] + 's</span><span>next move ' + t.toFixed(1) + 's</span>');
    }

    /* ---------- the king's square for Stockfish: nearest square to the king's centre ---------- */
    function kingSquare() {
      var col = Math.max(0, Math.min(7, Math.floor(S.kx))), rank = Math.max(1, Math.min(8, Math.round(S.ky + KH / 2 - 0.5) + 1));
      if (S.b[idx(col, rank)]) rank = Math.min(8, rank + 1);   /* standing on a piece: you are above it */
      return idx(col, rank);
    }
    function san(m, cap) {
      var p = S.b[m.f], c = cellOf(m.t), fc = cellOf(m.f);
      var l = p.t === 'P' ? (cap ? FILES[fc.col] : '') : p.t;
      return l + (cap ? 'x' : '') + FILES[c.col] + c.rank + (m.promo ? '=Q' : '');
    }
    function blackMove() {
      if (host.isOver) return;
      var ks = kingSquare(), b = S.b.slice();
      if (b[ks]) return;
      b[ks] = V.piece('K', 'w', { m: 1 });
      var st = { b: b, turn: 'b', ep: -1, epv: -1, ply: 1, half: 0, sub: 0, hands: { w: [], b: [] }, checks: { w: 0, b: 0 }, score: { w: 0, b: 0 }, out: {}, x: {}, start: { wRoyal: true, bRoyal: true } };
      var ms = V.legal(st);
      if (!ms.length) return;
      var hit = ms.filter(function (m) { return m.t === ks; });
      var m;
      if (hit.length) m = hit[0];
      else {
        var ranked = new CM.Search(V, {}).rank(st, { maxDepth: level >= 2 ? 2 : 3, timeMs: Math.min(220, LEVELS[level] * 300), noise: 30 });
        m = ranked.length ? ranked[0].m : ms[0];
      }
      var cap = m.t === ks || !!S.b[m.t];
      S.moves.push({ san: san(m, cap) + (m.t === ks ? '#' : ''), c: 'b' });
      host.setMoves(S.moves.concat());
      var piece = S.b[m.f], promo = piece.t === 'P' && cellOf(m.t).rank === 1;
      S.anim = { f: m.f, t: m.t, p: piece, t0: performance.now(), dur: host.reduced() ? 1 : Math.min(200, LEVELS[level] * 300) };
      S.b[m.f] = null; S.b[m.t] = promo ? V.piece('Q', 'b') : piece;
      if (m.t === ks) {
        host.sound('capture'); S.dead = true;
        host.after(260, function () { host.over({ result: 'loss', why: 'Stockfish captured your king on ' + FILES[cellOf(ks).col] + cellOf(ks).rank, title: 'You Lost' }); });
        return;
      }
      host.sound(cap ? 'capture' : 'move-opponent');
      /* a piece that lands where the king overlaps it pushes the king on top of it */
      var c = cellOf(m.t);
      if (overlap(S.kx - KW / 2, S.ky, c.col, c.rank)) { S.ky = c.rank; S.vy = 0; }
    }
    function overlap(x0, y0, col, rank) {
      return x0 < col + 1 && x0 + KW > col && y0 < rank && y0 + KH > rank - 1;
    }

    /* ---------- sword ---------- */
    function swing() {
      if (S.swing > 0 || S.dead) return;
      S.swing = 0.28; host.sound('swing');
      var cx = S.kx, cy = S.ky + KH / 2, targets = [];
      /* in front, at body height */
      var fc = Math.floor(cx + S.face * 0.75), fr = Math.floor(cy) + 1;
      targets.push([fc, fr]);
      if (!S.ground) targets.push([Math.floor(cx), Math.floor(S.ky - 0.15) + 1], [fc, Math.floor(S.ky - 0.15) + 1]);
      else targets.push([Math.floor(cx), Math.floor(S.ky - 0.15) + 1]);   /* stab down into the piece you stand on */
      for (var k = 0; k < targets.length; k++) {
        var t = targets[k]; if (!solidAt(t[0], t[1])) continue;
        var i = idx(t[0], t[1]), p = S.b[i];
        S.b[i] = null; S.stabs++;
        S.caps.push(host.pieceUrl('b', p.t)); host.setCaptured([], S.caps);
        S.moves.push({ san: 'K×' + (p.t === 'P' ? '' : p.t) + FILES[t[0]] + t[1], c: 'w' }); host.setMoves(S.moves.concat());
        host.sound('stab');
        if (p.t === 'K') {
          host.after(240, function () {
            /* QA: the first level is not the end - level 1 cleared leads straight into the next speed */
            var more = level < LEVELS.length - 1, cleared = level + 1;
            if (more) level++;
            host.over(more
              ? { result: 'win', whyRaw: 'Next: one move every ' + LEVELS[level] + ' s', title: 'Level ' + cleared + ' cleared', newLabel: 'Next level' }
              : { result: 'win', whyRaw: 'You stabbed the black king while it moved every ' + LEVELS[level] + ' s', title: 'You Won!' });
            if (more) pick();   /* the speed picker follows the new level */
          });
        }
        break;
      }
    }

    /* ---------- physics ---------- */
    function step(dt) {
      if (!S || host.isOver || S.dead) { draw(); return; }
      var dir = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
      S.vx = dir * RUN; if (dir) S.face = dir;
      S.vy -= G * dt;
      /* horizontal */
      var nx = S.kx + S.vx * dt, x0 = nx - KW / 2;
      if (x0 < 0) nx = KW / 2; if (x0 + KW > 8) nx = 8 - KW / 2;
      x0 = nx - KW / 2;
      for (var r = Math.floor(S.ky + 0.02) + 1; r <= Math.floor(S.ky + KH - 0.02) + 1; r++) {
        for (var c = Math.floor(x0); c <= Math.floor(x0 + KW - 1e-6); c++) {
          if (solidAt(c, r)) { nx = S.vx > 0 ? c - KW / 2 - 1e-4 : c + 1 + KW / 2 + 1e-4; x0 = nx - KW / 2; }
        }
      }
      S.kx = nx;
      /* vertical */
      var ny = S.ky + S.vy * dt; S.ground = false; x0 = S.kx - KW / 2;
      if (ny <= 0) { ny = 0; S.vy = 0; S.ground = true; }
      for (c = Math.floor(x0); c <= Math.floor(x0 + KW - 1e-6); c++) {
        if (S.vy <= 0) { var rr = Math.floor(ny) + 1; if (rr >= 1 && solidAt(c, rr) && S.ky >= rr - 0.001) { ny = rr; S.vy = 0; S.ground = true; } }
        else { var rt = Math.floor(ny + KH) + 1; if (solidAt(c, rt) && S.ky + KH <= rt - 1 + 0.001) { ny = rt - 1 - KH; S.vy = 0; } }
      }
      if (ny + KH > 8.6) { ny = 8.6 - KH; S.vy = Math.min(0, S.vy); }
      S.ky = ny;
      if (S.swing > 0) S.swing = Math.max(0, S.swing - dt);
      S.timer -= dt;
      if (S.timer <= 0) { S.timer += LEVELS[level]; blackMove(); }
      hud(); draw();
    }

    /* ---------- drawing ---------- */
    function draw() {
      var g = host.g; if (!g || !W) return;
      var sq = W / 8, light = '#ead2ba', dark = '#ae7e66';
      g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H);
      for (var r = 1; r <= 8; r++) for (var c = 0; c < 8; c++) {
        g.fillStyle = (c + r) % 2 === 0 ? dark : light;
        g.fillRect(Math.floor(c * sq), Math.floor((8 - r) * sq), Math.ceil(sq), Math.ceil(sq));
      }
      /* coordinates, chess.com style */
      g.font = '600 ' + Math.round(sq * 0.18) + 'px system-ui, sans-serif';
      for (c = 0; c < 8; c++) { g.fillStyle = c % 2 ? dark : light; g.fillText(FILES[c], c * sq + sq * 0.82, H - sq * 0.06); }
      for (r = 1; r <= 8; r++) { g.fillStyle = r % 2 ? light : dark; g.fillText(String(r), sq * 0.05, (8 - r) * sq + sq * 0.2); }
      /* the square Stockfish thinks you are on */
      if (S && !host.isOver) {
        var ks = cellOf(kingSquare());
        g.fillStyle = 'rgba(235, 97, 80, 0.28)'; g.fillRect(ks.col * sq, (8 - ks.rank) * sq, sq, sq);
      }
      if (!S) return;
      var now = performance.now(), A = S.anim, k;
      for (var i = 0; i < 64; i++) {
        var p = S.b[i]; if (!p) continue;
        var cc = cellOf(i), x = cc.col, y = 8 - cc.rank;
        if (A && A.t === i && now - A.t0 < A.dur) {
          var f = cellOf(A.f), e = (now - A.t0) / A.dur; e = 1 - Math.pow(1 - e, 3);
          x = f.col + (cc.col - f.col) * e; y = (8 - f.rank) + ((8 - cc.rank) - (8 - f.rank)) * e;
        }
        var im = img(p.c, p.t); if (im.complete && im.naturalWidth) g.drawImage(im, x * sq, y * sq, sq, sq);
      }
      /* king + sword */
      if (!S.dead) {
        var kx = (S.kx - 0.5) * sq, ky = (8 - S.ky - 1) * sq + (1 - KH) * sq * 0.35, ki = img('w', 'K'), useSk = skImg.complete && skImg.naturalWidth;
        if (useSk) {
          /* sprite: king holding the sword; tilt it through the swing, mirror when facing left */
          var tt = S.swing > 0 ? 1 - S.swing / 0.28 : 0, rot = S.swing > 0 && !host.reduced() ? Math.sin(tt * Math.PI) * 0.5 : 0;
          g.save(); g.translate(kx + sq / 2, ky + sq * 0.55); g.scale(S.face, 1); g.rotate(rot); g.drawImage(skImg, -sq * 0.6, -sq * 0.62, sq * 1.2, sq * 1.2); g.restore();
          if (S.swing > 0) { g.save(); g.strokeStyle = 'rgba(120,255,240,' + (0.8 * S.swing / 0.28) + ')'; g.lineWidth = sq * 0.06; g.beginPath(); g.arc(kx + sq / 2, ky + sq * 0.55, sq * 0.7, S.face > 0 ? -1.2 : Math.PI - 1.2 + 0.4, S.face > 0 ? 1.0 : Math.PI + 1.6); g.stroke(); g.restore(); }
        } else if (ki.complete && ki.naturalWidth) g.drawImage(ki, kx, ky, sq, sq);
        if (!useSk && sword.complete && sword.naturalWidth) {
          var t = S.swing > 0 ? 1 - S.swing / 0.28 : 0, ang = S.swing > 0 ? (-1.2 + 2.4 * t) : -0.35;
          if (host.reduced() && S.swing > 0) ang = 0.6;
          g.save(); g.translate(kx + sq * (0.5 + S.face * 0.32), ky + sq * 0.62); g.scale(S.face, 1); g.rotate(ang + 0.785);
          g.drawImage(sword, -sq * 0.12, -sq * 0.62, sq * 0.62, sq * 0.62); g.restore();
        }
      }
      if (A && now - A.t0 >= A.dur) S.anim = null;
    }
    function redraw() { draw(); }

    function pick() {
      host.picker('Speed', LEVELS.map(function (s, k) { return { value: k, label: s + ' s' }; }), level, function (v) { level = +v || 0; host.status(''); newGame(); });
    }
    function newGame() { fresh(); host.toast('Run with ← →, jump with Space or ↑, swing with J. Stab the black king.', 3600); }

    return {
      start: function () { var c = host.canvas; W = c.width; H = c.height; pick(); newGame(); host.loop(step); },
      newGame: function () { newGame(); },
      stop: function () { S = null; },
      /* QA hook (tools/qa_all.py): plain snapshot of the run state, no side effects */
      qa: function () { return S && { kx: S.kx, ky: S.ky, vx: S.vx, vy: S.vy, ground: S.ground, swing: S.swing, timer: S.timer, moves: S.moves.length, stabs: S.stabs, black: S.b.filter(Boolean).length, level: level }; },
      key: function (k, down) {
        if (!S) return;
        if (k === 'up') k = 'jump';
        if (k === 'jump') { if (down && S.ground && !S.dead) { S.vy = JUMP; S.ground = false; host.sound('jump'); } return; }
        if (k === 'action') { if (down) swing(); return; }
        keys[k] = down;
      },
      resize: function (w, h) { W = w; H = h; draw(); },
      redraw: redraw
    };
  });
})();
