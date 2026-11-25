/* g4_rt (group 4): real-time chess with per-piece cooldowns, shared by two videos.
     game.variant 'kungfu' (9M2Mj2WFFys Kung Fu Chess): standard 8x8, no turns, either side moves any ready piece
       at any time; a moved piece cools down (yellow fill) before it can move again; capture the king to win.
     game.variant 'arena'  (CONozr99agQ Chess Arena battle royale, REDUCED): a 24x24 map, 8 kings (you + 7 bots)
       instead of 40, summon an army (action button / Q), guardian pits, queen shrines, a shrinking purple poison
       zone; capturing a king destroys that army; last king standing wins.
   Logic is instant (a move resolves when ordered) and the piece slides over ~200 ms; no check, no castling, pawns
   auto-promote to a queen. Tap a ready piece of yours, then a highlighted square. */
(function () {
  'use strict';
  var CM = window.CM;
  var VAL = { P: 1, N: 3, B: 3, R: 5, Q: 9, K: 100 };
  var DIRS = { N: [[1, 2], [2, 1], [-1, 2], [-2, 1], [1, -2], [2, -1], [-1, -2], [-2, -1]], K: [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]],
    B: [[1, 1], [1, -1], [-1, 1], [-1, -1]], R: [[1, 0], [-1, 0], [0, 1], [0, -1]] };
  DIRS.Q = DIRS.B.concat(DIRS.R);
  var OWNER_COL = ['#f2f2f2', '#2b2b2b', '#c0392b', '#2e86de', '#e1b12c', '#8e44ad', '#16a085', '#e67e22', '#7f8c8d'];

  CM.defineGame('g4_rt', function (host) {
    var cfg = host.spec.game || {}, arena = cfg.variant === 'arena';
    var W, H, board, pieces, owners, me, now = 0, sel = null, targets = [], cam = { x: 0, y: 0 }, pan = { x: 0, y: 0 }, keys = {};
    var level = cfg.level || 'intermediate', imgs = {}, log = [], zone, shrines, pits, running = false, flash = [];
    /* impl-4 pass 2: Kung Fu speed presets (kfchess.com: Standard 1 s per square + 10 s cooldown, Lightning 0.2 s + 2 s) */
    var SPEEDS = { standard: { step: 1, cd: 10 }, lightning: { step: 0.2, cd: 2 } }, speed = cfg.speed || 'standard';
    var CD = arena ? 2.2 : SPEEDS[speed].cd, STEP = arena ? 0 : SPEEDS[speed].step, movers = [];
    function img(c, t) { var k = c + t; if (!imgs[k]) { imgs[k] = new Image(); imgs[k].onload = draw; imgs[k].src = cfg.pieces ? cfg.pieces + '/' + c + t + '.png' : host.pieceUrl(c, t); }  /* impl-4 art: game.pieces = the site's own set cut from the video */ return imgs[k]; }
    function at(x, y) { return x >= 0 && y >= 0 && x < W && y < H ? board[y * W + x] : undefined; }
    function inb(x, y) { return x >= 0 && y >= 0 && x < W && y < H; }
    function add(t, o, x, y) { var p = { t: t, o: o, x: x, y: y, ready: 0, ax: x, ay: y, a0: -1 }; board[y * W + x] = p; pieces.push(p); return p; }
    function kill(p) { if (board[p.y * W + p.x] === p) board[p.y * W + p.x] = null; p.dead = true; pieces = pieces.filter(function (q) { return q !== p; }); }
    function hostile(p, q) { return q && q.o !== p.o && !(owners[p.o] && owners[q.o] && owners[p.o].team && owners[p.o].team === owners[q.o].team); }

    /* pseudo-legal destinations of a piece (instant model; no check) */
    function reserved(x, y, o) { return movers.some(function (m) { return m.o === o && m.mv.tx === x && m.mv.ty === y; }); }
    function gen(p) {
      if (p.mv) return [];
      var out = gen0(p);
      out = out.filter(function (d) { return !reserved(d[0], d[1], p.o); });
      if (!arena && p.t === 'K' && !p.moved) [[0, -1], [7, 1]].forEach(function (c) {  /* castling (king two squares, rook jumps over) */
        var r = at(c[0], p.y); if (!r || r.o !== p.o || r.t !== 'R' || r.moved || r.ready > now) return;
        for (var x = Math.min(c[0], p.x) + 1; x < Math.max(c[0], p.x); x++) if (at(x, p.y) || reserved(x, p.y, p.o)) return;
        out.push([p.x + 2 * c[1], p.y, 'castle']);
      });
      return out;
    }
    function gen0(p) {
      var out = [], o = owners[p.o], f = o.fwd || [0, -1];
      if (p.t === 'P') {
        var x1 = p.x + f[0], y1 = p.y + f[1];
        if (inb(x1, y1) && !at(x1, y1)) { out.push([x1, y1]); var x2 = x1 + f[0], y2 = y1 + f[1]; if (!p.moved && inb(x2, y2) && !at(x2, y2)) out.push([x2, y2]); }
        var side = f[0] ? [[0, 1], [0, -1]] : [[1, 0], [-1, 0]];
        side.forEach(function (s) { var cx = x1 + s[0], cy = y1 + s[1], q = at(cx, cy); if (q && hostile(p, q)) out.push([cx, cy]); });
        return out;
      }
      var slide = p.t === 'B' || p.t === 'R' || p.t === 'Q';
      DIRS[p.t].forEach(function (d) {
        var x = p.x + d[0], y = p.y + d[1];
        while (inb(x, y)) { var q = at(x, y); if (q) { if (hostile(p, q)) out.push([x, y]); break; } out.push([x, y]); if (!slide) break; x += d[0]; y += d[1]; }
      });
      return out;
    }
    function attackedBy(o) { /* squares attacked by every piece not owned by o (ignoring cooldowns) */
      var A = {};
      pieces.forEach(function (p) {
        if (p.o === o || (owners[p.o].team && owners[p.o].team === owners[o].team)) return;
        if (p.t === 'P') { var f = owners[p.o].fwd, side = f[0] ? [[0, 1], [0, -1]] : [[1, 0], [-1, 0]]; side.forEach(function (s) { A[(p.x + f[0] + s[0]) + ',' + (p.y + f[1] + s[1])] = Math.min(A[(p.x + f[0] + s[0]) + ',' + (p.y + f[1] + s[1])] || 99, VAL.P); }); return; }
        var save = p.o; gen(p).forEach(function (d) { var k = d[0] + ',' + d[1]; A[k] = Math.min(A[k] || 99, VAL[p.t]); });
        /* also count defended own squares roughly: a slider "attacks" through to the first piece, covered by gen */
        p.o = save;
      });
      return A;
    }
    function doMove(p, x, y, by) {
      if (STEP) return travel(p, x, y, by);
      var q = at(x, y), name = 'abcdefghijklmnopqrstuvwx'[p.x] + (H - p.y);
      board[p.y * W + p.x] = null; p.ax = p.x; p.ay = p.y; p.a0 = now; p.x = x; p.y = y; p.moved = true; p.ready = now + CD * (by === 'me' ? 1 : (owners[p.o].cdMul || 1));
      if (q) { kill(q); host.sound('capture'); if (arena && p.o === me) owners[me].destroyed = (owners[me].destroyed || 0) + 1; if (q.t === 'K') eliminate(q.o, p.o); if (q.o === 'n' && arena) pitCheck(); }
      else host.sound(by === 'me' ? 'move-self' : 'move-opponent');
      board[y * W + x] = p;
      var o = owners[p.o], last = o.fwd && ((o.fwd[1] < 0 && y === 0) || (o.fwd[1] > 0 && y === H - 1) || (o.fwd[0] > 0 && x === W - 1) || (o.fwd[0] < 0 && x === 0));
      if (p.t === 'P' && last) p.t = 'Q';
      if (!arena) { log.push(p.t === 'P' ? (q ? name[0] + 'x' : '') + 'abcdefgh'[x] + (H - y) : p.t + (q ? 'x' : '') + 'abcdefgh'[x] + (H - y)); host.setMoves(log.slice()); }
      if (arena && p.o === me) o.xp += q ? VAL[q.t] || 1 : 0;
    }
    /* impl-4 pass 2 (Kung Fu): pieces travel square by square (STEP s each); a travelling piece captures whatever enemy it
       runs into and stops there, stops before a friendly piece, and can itself be captured mid-move: when two enemy
       travellers meet, the one that set off first wins, and a piece landing on a traveller's square takes it. Knights
       jump: they only interact on landing. Cooldown starts on arrival. */
    function travel(p, x, y, by) {
      var name = 'abcdefgh'[p.x] + (H - p.y), q = at(x, y), castle = p.t === 'K' && Math.abs(x - p.x) === 2;
      var dx = Math.sign(x - p.x), dy = Math.sign(y - p.y), path = [];
      if (p.t === 'N') path = [[x, y]]; else { var cx = p.x, cy = p.y; while (cx !== x || cy !== y) { cx += dx; cy += dy; path.push([cx, cy]); } }
      board[p.y * W + p.x] = null;
      p.mv = { fx: p.x, fy: p.y, tx: x, ty: y, path: path, i: -1, t0: now, by: by }; p.ready = 1e9; p.moved = true; movers.push(p);
      host.sound(by === 'me' ? 'move-self' : 'move-opponent');
      log.push(castle ? (x > name.charCodeAt(0) - 97 ? 'O-O' : 'O-O-O') : p.t === 'P' ? (q ? name[0] + 'x' : '') + 'abcdefgh'[x] + (H - y) : p.t + (q ? 'x' : '') + 'abcdefgh'[x] + (H - y)); host.setMoves(log.slice());
      if (castle) { var r = at(dx > 0 ? 7 : 0, p.y); if (r) travel0(r, p.x + dx, p.y); }
    }
    function travel0(r, x, y) { /* the castling rook: moves with the king, no log/sound */
      board[r.y * W + r.x] = null; var path = [], cx = r.x, d = Math.sign(x - r.x); while (cx !== x) { cx += d; path.push([cx, y]); }
      r.mv = { fx: r.x, fy: r.y, tx: x, ty: y, path: path, i: -1, t0: now }; r.ready = 1e9; r.moved = true; movers.push(r);
    }
    function moverCell(m) { return m.mv.i >= 0 ? m.mv.path[m.mv.i] : [m.mv.fx, m.mv.fy]; }
    function take(q, by) { if (q.mv) { movers = movers.filter(function (m) { return m !== q; }); q.mv = null; } kill(q); host.sound('capture'); if (q.t === 'K') eliminate(q.o, by.o); }
    function settle(p, c) { /* p ends its trip on cell c */
      movers = movers.filter(function (m) { return m !== p; }); p.mv = null; p.x = c[0]; p.y = c[1]; board[c[1] * W + c[0]] = p; p.ready = now + CD;
      var o = owners[p.o]; if (p.t === 'P' && ((o.fwd[1] < 0 && p.y === 0) || (o.fwd[1] > 0 && p.y === H - 1))) p.t = 'Q';
    }
    function stepMovers() {
      movers.slice().forEach(function (p) {
        if (p.dead || !p.mv) return;
        var mv = p.mv, want = Math.min(mv.path.length - 1, Math.floor((now - mv.t0) / STEP + 1e-9) - 0);
        if (p.t === 'N') want = now - mv.t0 >= STEP * 2 ? 0 : -1;
        while (mv.i < want && p.mv && !p.dead) {
          var c = mv.path[mv.i + 1], last = mv.i + 1 === mv.path.length - 1, q = at(c[0], c[1]);
          if (q && !hostile(p, q)) { settle(p, mv.i >= 0 ? mv.path[mv.i] : [mv.fx, mv.fy]); if (board[p.y * W + p.x] !== p) { board[p.y * W + p.x] = p; } return; }
          mv.i++;
          if (q) { take(q, p); if (!running) return; settle(p, c); return; }
          if (p.t !== 'N') { /* meeting an enemy traveller on this cell */
            var r = movers.filter(function (m) { return m !== p && m.t !== 'N' && hostile(p, m) && moverCell(m)[0] === c[0] && moverCell(m)[1] === c[1]; })[0];
            if (r) { if (r.mv.t0 <= mv.t0) { take(p, r); return; } take(r, p); if (!running) return; }
          } else { /* a knight landing on a traveller's square takes it */
            var r2 = movers.filter(function (m) { return m !== p && hostile(p, m) && m.t !== 'N' && moverCell(m)[0] === c[0] && moverCell(m)[1] === c[1]; })[0];
            if (r2) { take(r2, p); if (!running) return; }
          }
          if (last) { settle(p, c); return; }
        }
      });
      /* stationary pieces cannot be "landed on" by an enemy traveller passing over: handled above; a traveller whose
         current cell is the landing square of an arriving piece is taken in that arrival (settle checks) */
    }
    function eliminate(o, by) {
      var ow = owners[o]; if (!ow || ow.out) return; ow.out = true; ow.place = alive().length + 1;
      pieces.slice().forEach(function (p) { if (p.o === o) kill(p); });
      if (by === me && arena) { owners[me].mates++; host.toast('Checkmate! ' + ow.name + ' is eliminated.', 1800); }
      if (o === me) { finish('loss', arena ? 'Your king was captured: checkmate (#' + ow.place + ' of ' + nOwners() + ').' : 'Your king was captured.', arena ? '#' + ow.place : null); return; }
      if (!arena || alive().length === 1) finish('win', arena ? 'Last king standing. Victory royale!' : 'You captured the AI king.', arena ? '#1 Victory' : null);
    }
    function nOwners() { return Object.keys(owners).filter(function (k) { return k !== 'n'; }).length; }
    function alive() { return Object.keys(owners).filter(function (k) { return k !== 'n' && !owners[k].out; }); }
    function finish(r, why, title) { if (!running) return; running = false; draw(); if (arena) results(r); host.over({ result: r, why: why, title: title || undefined }); }
    /* art-g4b: Chess Arena end-of-match screen as in the video (23:20 frame, research/frames/video_thumbs/CONozr99agQ_frame_1400.jpg):
       purple veil over the map, the VICTORY banner cut from the frame (other results: the same banner plate with the word
       painted out and set in the same white italic; wording inferred), "Match Rank" ring top right, left "Battle Royale
       RESULTS" panel with the five stats the game lists (Level, Checkmates, Pieces Destroyed, Pits Cleared, Queens Summoned). */
    function results(r) {
      var el = host.el; if (!el) return; clearResults();
      var o = owners[me], rank = r === 'win' ? 1 : Math.min(nOwners(), o.place || alive().length + 1), A = 'assets/modes/CONozr99agQ/';
      if (!document.getElementById('g4ar-css')) {
        var st = document.createElement('style'); st.id = 'g4ar-css';
        st.textContent = '.g4ar-end{position:absolute;inset:0;z-index:6;pointer-events:none;color:#fff;font-family:inherit;background:radial-gradient(ellipse at 55% 45%,rgba(120,40,170,.55),rgba(38,12,58,.92) 70%);animation:g4arIn .3s ease-out both}' +
          '.g4ar-end i{font-style:italic}.g4ar-ban{position:absolute;left:50%;top:30%;width:78%;transform:translate(-50%,-50%);aspect-ratio:855/247}.g4ar-ban img{width:100%;height:100%;display:block}' +
          '.g4ar-ban b{position:absolute;left:0;right:0;top:36%;text-align:center;font:italic 900 clamp(18px,7.6vw,44px)/1 system-ui,sans-serif;letter-spacing:.02em;text-shadow:0 2px 0 #5a1f8a,0 3px 6px rgba(0,0,0,.5)}' +
          '.g4ar-name{position:absolute;left:0;right:0;top:9%;text-align:center;font:italic 800 clamp(11px,3.4vw,18px)/1 system-ui,sans-serif}' +
          '.g4ar-rank{position:absolute;right:4%;top:4%;width:22%;aspect-ratio:1;border-radius:50%;border:2px solid rgba(255,255,255,.35);background:radial-gradient(circle,rgba(255,255,255,.12),rgba(255,255,255,0) 70%);text-align:center}' +
          '.g4ar-rank span{display:block;margin-top:14%;font:italic 700 clamp(8px,2.4vw,13px)/1 system-ui,sans-serif}.g4ar-rank b{display:block;font:italic 900 clamp(22px,9vw,54px)/1.05 system-ui,sans-serif}' +
          '.g4ar-res{position:absolute;left:4%;bottom:6%;width:46%;font:italic 700 clamp(9px,2.6vw,14px)/1.5 system-ui,sans-serif}.g4ar-res small{color:#c38cff;font-size:.8em}' +
          '.g4ar-res h3{margin:0;font:italic 900 clamp(16px,5.4vw,30px)/1 system-ui,sans-serif;letter-spacing:.02em}.g4ar-res hr{border:0;border-top:1px solid rgba(255,255,255,.7);margin:4px 0}' +
          '.g4ar-res table{width:100%;border-collapse:collapse}.g4ar-res td{padding:0;color:#d9cfe6;font-weight:600}.g4ar-res td+td{color:#fff;font-weight:900;font-size:1.25em;text-align:left;width:30%}' +
          '@keyframes g4arIn{from{opacity:0}to{opacity:1}}@media (prefers-reduced-motion:reduce){.g4ar-end{animation:none}}';
        document.head.appendChild(st);
      }
      var word = r === 'win' ? '' : r === 'draw' ? 'DRAW' : 'DEFEAT', you = (host.spec.player && host.spec.player.name) || 'You';
      var rows = [['Level', o.lvl], ['Checkmates', o.mates || 0], ['Pieces Destroyed', o.destroyed || 0], ['Pits Cleared', o.pits || 0], ['Queens Summoned', o.queens || 0]];
      var d = document.createElement('div'); d.className = 'g4ar-end';
      d.innerHTML = '<div class="g4ar-name">' + you + '</div>' +
        '<div class="g4ar-ban"><img src="' + A + (word ? 'plate.png' : 'victory.png') + '" alt="">' + (word ? '<b>' + word + '</b>' : '') + '</div>' +
        '<div class="g4ar-rank"><span>Match Rank</span><b>' + rank + '</b></div>' +
        '<div class="g4ar-res"><small>Battle Royale</small><h3>RESULTS</h3><hr><div><b>' + you + '</b></div><table>' +
        rows.map(function (x) { return '<tr><td>' + x[0] + '</td><td>' + x[1] + '</td></tr>'; }).join('') + '</table></div>';
      el.appendChild(d);
    }
    function clearResults() { var el = host.el, old = el && el.querySelector('.g4ar-end'); if (old) old.remove(); }

    /* ---------------- setup ---------------- */
    function kungfu() {
      W = 8; H = 8; board = new Array(64).fill(null); pieces = [];
      owners = { w: { name: 'You', fwd: [0, -1], col: 'w' }, b: { name: 'AI Player', fwd: [0, 1], col: 'b', cdMul: 1, think: (level === 'advanced' ? 0.45 : 0.9) * (speed === 'standard' ? 2 : 1), noise: level === 'advanced' ? 0.4 : 2.2 } };
      me = 'w';
      var back = 'RNBQKBNR';
      for (var i = 0; i < 8; i++) { add(back[i], 'b', i, 0); add('P', 'b', i, 1); add('P', 'w', i, 6); add(back[i], 'w', i, 7); }
      host.setPlayers({ opp: { name: 'AI Player (' + (level === 'advanced' ? 'Advanced' : 'Intermediate') + ')' } });
    }
    function arenaSetup() {
      W = 24; H = 24; board = new Array(W * H).fill(null); pieces = []; owners = { n: { name: 'Guardians', col: 'n', fwd: [0, 1] } };
      var spawns = [[2, 2], [12, 1], [21, 2], [22, 12], [21, 21], [12, 22], [2, 21], [1, 12]];
      var names = ['You', 'Blizzard', 'Eldrin', 'Lore', 'Thorn', 'Vex', 'Mira', 'Grum'];
      spawns.forEach(function (s, i) {
        var id = 'o' + i, c = W / 2 - 0.5, dx = c - s[0], dy = c - s[1];
        var fwd = Math.abs(dx) > Math.abs(dy) ? [dx > 0 ? 1 : -1, 0] : [0, dy > 0 ? 1 : -1];
        owners[id] = { name: names[i], fwd: fwd, col: i === 0 ? 'w' : 'b', tint: OWNER_COL[i + 1], idx: i, think: 0.7 + Math.random() * 0.5, noise: 1.5, summonAt: i === 0 ? 0 : 1 + Math.random() * 3, xp: 0, lvl: 1, mates: 0 };
        add('K', id, s[0], s[1]);
      });
      me = 'o0'; owners.o0.tint = '#f1c40f';
      /* guardian pits: neutral clusters worth XP */
      pits = [[8, 8], [15, 8], [8, 15], [15, 15]].map(function (c, k) {
        var g = [];
        [['R', 0, 0], ['P', 1, 0], ['P', 0, 1], ['N', 1, 1]].forEach(function (d) { g.push(add(k % 2 ? d[0] : (d[0] === 'R' ? 'B' : d[0]), 'n', c[0] + d[1], c[1] + d[2])); });
        g.forEach(function (p) { p.ready = 1e9; });
        return { x: c[0], y: c[1], g: g, cleared: false };
      });
      shrines = [{ x: 11, y: 6, t: 0, used: false }, { x: 12, y: 17, t: 0, used: false }];
      zone = { r0: 17, r: 17, t0: 0 };
      host.setPlayers({ opp: { name: '7 rival kings' } });
    }
    function summon(o) {
      var ow = owners[o], k = pieces.filter(function (p) { return p.o === o && p.t === 'K'; })[0]; if (!k || ow.out) return false;
      if (now < (ow.summonAt || 0)) { if (o === me) host.toast('Summon ready in ' + Math.ceil(ow.summonAt - now) + ' s'); return false; }
      var army = ['P', 'P', 'P', 'N', 'B', 'R'], n = 0;
      for (var r = 1; r <= 3 && n < army.length; r++) for (var dy = -r; dy <= r && n < army.length; dy++) for (var dx = -r; dx <= r && n < army.length; dx++) {
        var x = k.x + dx, y = k.y + dy; if (inb(x, y) && !at(x, y) && !inPoison(x, y)) { add(army[n++], o, x, y).ready = now + 0.6; }
      }
      ow.summonAt = now + Math.max(10, 24 - 2 * ow.lvl);
      if (o === me) host.toast('Army summoned!', 1200);
      return true;
    }
    function pitCheck() {
      pits.forEach(function (pt) { if (!pt.cleared && pt.g.every(function (p) { return p.dead; })) { pt.cleared = true; var o = owners[me]; o.lvl++; o.pits = (o.pits || 0) + 1; host.toast('Pit cleared! Level ' + o.lvl + ' (faster summons).', 1800); } });
    }
    function inPoison(x, y) { if (!arena) return false; var c = W / 2 - 0.5; return Math.max(Math.abs(x - c), Math.abs(y - c)) > zone.r; }

    /* ---------------- AI ---------------- */
    function think(o) {
      var ow = owners[o], mine = pieces.filter(function (p) { return p.o === o && p.ready <= now; });
      if (!mine.length) return;
      var A = attackedBy(o), best = null, bs = -1e9, kingAt = null;
      pieces.forEach(function (p) { if (p.o !== o && p.t === 'K' && hostile(mine[0], p)) { var d = kingAt ? Math.abs(p.x - kingAt.x) + Math.abs(p.y - kingAt.y) : 0; if (!kingAt || d < 0) kingAt = p; } });
      var myK = pieces.filter(function (p) { return p.o === o && p.t === 'K'; })[0];
      mine.forEach(function (p) {
        var here = A[p.x + ',' + p.y];
        gen(p).forEach(function (d) {
          if (o === 'n') { var q0 = at(d[0], d[1]); if (!q0) return; }
          var q = at(d[0], d[1]), s = 0;
          if (q) s += (q.t === 'K' ? 1000 : VAL[q.t] * 10);
          var att = A[d[0] + ',' + d[1]]; if (att) s -= (p.t === 'K' ? 500 : VAL[p.t] * 8) - (q ? 0 : 0);
          if (here && !att) s += (p.t === 'K' ? 400 : VAL[p.t] * 6);
          if (inPoison(d[0], d[1])) s -= 300; if (inPoison(p.x, p.y) && !inPoison(d[0], d[1])) s += 250;
          if (kingAt && p.t !== 'K') s += (Math.abs(p.x - kingAt.x) + Math.abs(p.y - kingAt.y) - Math.abs(d[0] - kingAt.x) - Math.abs(d[1] - kingAt.y)) * 0.6;
          if (p.t === 'K' && !(here) && !q) s -= 3;
          s += Math.random() * ow.noise * 3;
          if (s > bs) { bs = s; best = [p, d]; }
        });
      });
      if (best && (bs > -50 || o !== 'n')) doMove(best[0], best[1][0], best[1][1], o);
    }

    /* ---------------- loop ---------------- */
    function tick(dt) {
      if (!running) { draw(); return; }
      now += dt;
      Object.keys(owners).forEach(function (o) {
        var ow = owners[o]; if (o === me || ow.out) return;
        ow.nt = (ow.nt || 0) - dt;
        if (ow.nt <= 0) {
          ow.nt = o === 'n' ? 1.2 : ow.think;
          if (arena && o !== 'n' && now >= (ow.summonAt || 0)) summon(o);
          think(o);
        }
      });
      if (STEP) stepMovers();
      if (arena) {
        zone.r = Math.max(2.5, zone.r0 - Math.max(0, now - 20) * 0.075);
        pieces.slice().forEach(function (p) {
          if (p.dead) return;
          if (inPoison(p.x, p.y) && p.o !== 'n') { p.pz = (p.pz || 0) + dt; if (p.pz > 2.5) { kill(p); if (p.t === 'K') eliminate(p.o, null); } } else p.pz = 0;
        });
        shrines.forEach(function (s) {
          if (s.used) return; var k = pieces.filter(function (p) { return p.t === 'K' && Math.abs(p.x - s.x) <= 1 && Math.abs(p.y - s.y) <= 1; })[0];
          if (k) { if (s.who !== k.o) { s.who = k.o; s.t = 0; } s.t += dt; if (s.t > 3) { s.used = true; for (var d = 0; d < 8; d++) { var dd = DIRS.K[d]; if (inb(k.x + dd[0], k.y + dd[1]) && !at(k.x + dd[0], k.y + dd[1])) { add('Q', k.o, k.x + dd[0], k.y + dd[1]); break; } } if (k.o === me) { owners[me].queens = (owners[me].queens || 0) + 1; host.toast('Queen shrine acquired: a queen joins you!', 1800); } } }
          else s.t = Math.max(0, s.t - dt);
        });
        var o = owners[me], left = alive().length;
        host.hud('<span>Players left ' + left + '/' + nOwners() + '</span><span>Lv ' + o.lvl + ' · Summon ' + (now >= o.summonAt ? 'READY' : Math.ceil(o.summonAt - now) + 's') + '</span>');
        var k = pieces.filter(function (p) { return p.o === me && p.t === 'K'; })[0];
        if (k) { var vw = view(); cam.x += ((k.x + 0.5 - vw / 2 + pan.x) - cam.x) * Math.min(1, dt * 6); cam.y += ((k.y + 0.5 - vw / 2 + pan.y) - cam.y) * Math.min(1, dt * 6); cam.x = Math.max(0, Math.min(W - vw, cam.x)); cam.y = Math.max(0, Math.min(H - vw, cam.y)); }
        if (keys.left) pan.x -= dt * 6; if (keys.right) pan.x += dt * 6; if (keys.up) pan.y -= dt * 6; if (keys.down) pan.y += dt * 6;
      } else {
        host.hud('');
      }
      if (sel && (sel.dead || sel.ready > now)) { sel = null; targets = []; }
      if (sel) targets = gen(sel);
      draw();
    }
    function view() { return arena ? 11 : 8; }
    function draw() {
      var g = host.g, cv = host.canvas, S = cv.width / view(); if (!board) return;
      g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = arena ? '#24352d' : '#ffffff'; g.fillRect(0, 0, cv.width, cv.height);
      var ox = arena ? cam.x : 0, oy = arena ? cam.y : 0;
      g.save(); g.translate(-ox * S, -oy * S);
      var light = arena ? '#6daa89' : '#FFFEFF', dark = arena ? '#3f5a4d' : '#80DB72';
      for (var y = Math.floor(oy); y < Math.min(H, oy + view() + 1); y++) for (var x = Math.floor(ox); x < Math.min(W, ox + view() + 1); x++) {
        g.fillStyle = (x + y) % 2 ? dark : light; g.fillRect(x * S, y * S, S + 0.5, S + 0.5);
        if (inPoison(x, y)) { g.fillStyle = 'rgba(128,40,190,0.45)'; g.fillRect(x * S, y * S, S + 0.5, S + 0.5); }
      }
      if (arena) {
        pits.forEach(function (pt) { g.strokeStyle = pt.cleared ? 'rgba(255,255,255,0.25)' : '#d35400'; g.lineWidth = S * 0.06; g.strokeRect((pt.x - 0.5) * S, (pt.y - 0.5) * S, 3 * S, 3 * S); });
        shrines.forEach(function (s) { if (s.used) return; g.fillStyle = 'rgba(241,196,15,' + (0.35 + 0.4 * Math.min(1, s.t / 3)) + ')'; g.beginPath(); g.arc((s.x + 0.5) * S, (s.y + 0.5) * S, S * 0.42, 0, 7); g.fill(); g.fillStyle = '#7a5b00'; g.font = 'bold ' + Math.round(S * 0.42) + 'px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('Q', (s.x + 0.5) * S, (s.y + 0.52) * S); });
      }
      if (sel) { g.fillStyle = 'rgba(255,255,51,0.5)'; g.fillRect(sel.x * S, sel.y * S, S, S); targets.forEach(function (d) { g.fillStyle = 'rgba(0,0,0,0.18)'; g.beginPath(); if (at(d[0], d[1])) { g.lineWidth = S * 0.08; g.strokeStyle = 'rgba(0,0,0,0.25)'; g.arc((d[0] + 0.5) * S, (d[1] + 0.5) * S, S * 0.44, 0, 7); g.stroke(); } else { g.arc((d[0] + 0.5) * S, (d[1] + 0.5) * S, S * 0.16, 0, 7); g.fill(); } }); }
      pieces.forEach(function (p) {
        var k = p.a0 >= 0 ? Math.min(1, (now - p.a0) / 0.2) : 1, e = 1 - Math.pow(1 - k, 3);
        var x = (p.ax + (p.x - p.ax) * e) * S, y = (p.ay + (p.y - p.ay) * e) * S;
        if (p.mv) { var L = p.mv.path.length * (p.t === 'N' ? 2 : 1), u = Math.min(1, (now - p.mv.t0) / (STEP * L)); x = (p.mv.fx + (p.mv.tx - p.mv.fx) * u) * S; y = (p.mv.fy + (p.mv.ty - p.mv.fy) * u) * S; }
        if (p.ready > now && !p.mv) { var f = (p.ready - now) / CD; g.fillStyle = 'rgba(247,214,40,0.55)'; g.fillRect(p.x * S, p.y * S + S * (1 - Math.min(1, f)), S, S * Math.min(1, f)); }
        if (arena && owners[p.o].tint) { g.fillStyle = owners[p.o].tint; g.beginPath(); g.ellipse(x + S / 2, y + S * 0.86, S * 0.36, S * 0.1, 0, 0, 7); g.fill(); }
        /* art-g4b: arena = Chess Arena models cut from the video (game.pieces): w your Base Purple army, n brown guardians, b rivals */
        var c = p.o === 'n' ? (arena && cfg.pieces ? 'n' : 'b') : owners[p.o].col, im = img(c, p.t);
        if (im.complete && im.naturalWidth) g.drawImage(im, x + S * 0.05, y + S * 0.05, S * 0.9, S * 0.9);
        if (p.o === 'n') { g.fillStyle = 'rgba(211,84,0,0.35)'; g.fillRect(x, y, S, S); }
        if (arena && p.pz) { g.fillStyle = 'rgba(160,60,220,' + Math.min(0.7, p.pz / 2.5) + ')'; g.fillRect(x, y, S, S); }
      });
      g.restore();
      if (arena) { /* minimap */
        var m = Math.round(cv.width * 0.22), mx = cv.width - m - 6, my = cv.height - m - 6, u = m / W;
        g.fillStyle = 'rgba(0,0,0,0.55)'; g.fillRect(mx, my, m, m);
        var c = W / 2, r = zone.r + 0.5; g.strokeStyle = '#b070ff'; g.lineWidth = 2; g.strokeRect(mx + (c - r) * u, my + (c - r) * u, 2 * r * u, 2 * r * u);
        pieces.forEach(function (p) { if (p.t !== 'K') return; g.fillStyle = p.o === me ? '#f1c40f' : '#e74c3c'; g.fillRect(mx + p.x * u - 1.5, my + p.y * u - 1.5, 3.5, 3.5); });
        g.strokeStyle = 'rgba(255,255,255,0.6)'; g.lineWidth = 1; g.strokeRect(mx + cam.x * u, my + cam.y * u, view() * u, view() * u);
      }
    }
    function tap(e) {
      if (!running) return; var cv = host.canvas, r = cv.getBoundingClientRect(), S = r.width / view();
      var x = Math.floor((e.clientX - r.left) / S + (arena ? cam.x : 0)), y = Math.floor((e.clientY - r.top) / S + (arena ? cam.y : 0));
      var q = at(x, y);
      if (sel && targets.some(function (d) { return d[0] === x && d[1] === y; })) { doMove(sel, x, y, 'me'); sel = null; targets = []; draw(); return; }
      if (q && q.o === me) { if (q.ready > now) { host.status('That piece is cooling down.'); return; } sel = q; targets = gen(q); }
      else { sel = null; targets = []; }
      draw();
    }
    function newGame() {
      now = 0; sel = null; targets = []; log = []; movers = []; if (!arena) { CD = SPEEDS[speed].cd; STEP = SPEEDS[speed].step; } pan = { x: 0, y: 0 }; host.setMoves([]);
      clearResults(); if (arena) arenaSetup(); else kungfu();
      running = true;
      if (arena) { var k = pieces.filter(function (p) { return p.o === me; })[0]; cam.x = Math.max(0, k.x - 5); cam.y = Math.max(0, k.y - 5); host.status('Press the action button (or Q) to summon your army. Tap a piece, then a square.'); }
      else host.status('No turns: tap a ready piece, then a square. Yellow = cooling down.');
      draw();
    }
    return {
      wantsRawKeys: true,
      start: function () {
        host.canvas.addEventListener('pointerdown', tap);
        if (!arena) host.picker('AI level', [{ value: 'intermediate', label: 'Intermediate' }, { value: 'advanced', label: 'Advanced' }], level, function (v) { level = v; newGame(); });
        if (!arena) host.picker('Speed', [{ value: 'standard', label: 'Standard' }, { value: 'lightning', label: 'Lightning' }], speed, function (v) { speed = v; newGame(); });
        newGame(); host.loop(tick);
      },
      newGame: newGame,
      stop: function () { running = false; host.canvas.removeEventListener('pointerdown', tap); },
      key: function (k, down) {
        if (['left', 'right', 'up', 'down'].indexOf(k) >= 0) { keys[k] = down; if (!down && arena) { /* keep the pan */ } return; }
        if (down && (k === 'action' || k === 'jump' || k === 'KeyQ') && arena && running) summon(me);
        if (down && k === 'KeyR') pan = { x: 0, y: 0 };
      },
      resize: function () { draw(); },
      redraw: draw,
      qaEnd: function (r) { finish(r || 'win', 'QA'); }  /* art-g4b: lets QA open the results screen */
    };
  });
})();
