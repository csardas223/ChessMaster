/* g4_rt (group 4): real-time chess with per-piece cooldowns, shared by two videos.
     game.variant 'kungfu' (9M2Mj2WFFys Kung Fu Chess): standard 8x8, no turns, either side moves any ready piece
       at any time; a moved piece cools down (yellow fill) before it can move again; capture the king to win.
     game.variant 'arena'  (CONozr99agQ Chess Arena battle royale, REDUCED): a 24x24 map, 8 kings (you + 7 bots)
       instead of 40, summon an army (action button / Q), guardian pits, queen shrines, a shrinking purple poison
       zone; capturing a king destroys that army; last king standing wins.
       arena agent (2026-11-25): champion select before the match (Lord Thalric, the Frost Mage: Blizzard / Ice Shield /
       Frostbite, as on the 11:43 CHOOSE A CHAMPION frame; Eldrin: Stone Wall / Tremor / Aftershock, from the 27:59
       transcript), E / R abilities with cooldowns (on-canvas Q E R bar, keys Q E R), bushes that hide pieces (a piece in a
       bush is invisible to a player who has no piece next to it), blue XP orbs (cleared pits and checkmated armies drop
       them; stand next to an orb to collect it; levels speed up summons and grow the army), sliders move at most four
       squares (transcript 3:21 / 4:35), drag a piece to move it, drag on empty ground to box-select several pieces and
       tap a square to send them all toward it. Bots play no champion abilities (simplification).
   Logic is instant (a move resolves when ordered) and the piece slides over ~200 ms; no check, no castling, pawns
   auto-promote to a queen. Tap a ready piece of yours, then a highlighted square. */
(function () {
  'use strict';
  var CM = window.CM;
  var VAL = { P: 1, N: 3, B: 3, R: 5, Q: 9, K: 100, S: 0.5 };
  /* arena: champions (art: assets/modes/CONozr99agQ/ui, tools/g4_arena_ui.py). Thalric's names, texts and cooldowns are read off
     the 11:43 frame; Eldrin's names and texts come from the transcript (27:59-28:28), his cooldowns are inferred. */
  var A_UI = 'assets/modes/CONozr99agQ/ui/';
  var CHAMPS = {
    thalric: { name: 'Lord Thalric', title: 'The Frost Mage', card: A_UI + 'card_thalric.png',
      E: { id: 'blizzard', name: 'Blizzard', cd: 45, aim: true, icon: A_UI + 'ab_blizzard.png', txt: 'Create a blizzard that reduces move speed in an area.' },
      R: { id: 'iceshield', name: 'Ice Shield', cd: 75, icon: A_UI + 'ab_iceshield.png', txt: 'Create a shield that protects from death once.' },
      P: { id: 'frostbite', name: 'Frostbite', icon: A_UI + 'ab_frostbite.png', txt: 'Stun enemies that capture your pieces.' } },
    eldrin: { name: 'Eldrin', title: '',   /* no title shown in the video */
      card: A_UI + 'card_eldrin.png',
      E: { id: 'stonewall', name: 'Stone Wall', cd: 40, aim: true, txt: 'Create destructible rocks that block movement.' },
      R: { id: 'tremor', name: 'Tremor', cd: 60, aim: true, txt: 'Stun all the pieces in an area.' },
      P: { id: 'aftershock', name: 'Aftershock', txt: 'Every four moves, your king stuns nearby enemies.' } }
  };
  var RIVALS = ['KidGhost', 'DarkBlood7', 'Oren', 'BlazeBlood', 'darkblack7', 'Lior', 'Kyren'];   /* names from the kill feed on the 5:52 frame */
  var DIRS = { N: [[1, 2], [2, 1], [-1, 2], [-2, 1], [1, -2], [2, -1], [-1, -2], [-2, -1]], K: [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]],
    B: [[1, 1], [1, -1], [-1, 1], [-1, -1]], R: [[1, 0], [-1, 0], [0, 1], [0, -1]] };
  DIRS.Q = DIRS.B.concat(DIRS.R);
  var OWNER_COL = ['#f2f2f2', '#2b2b2b', '#c0392b', '#2e86de', '#e1b12c', '#8e44ad', '#16a085', '#e67e22', '#7f8c8d'];

  CM.defineGame('g4_rt', function (host) {
    var cfg = host.spec.game || {}, arena = cfg.variant === 'arena';
    var W, H, board, pieces, owners, me, now = 0, sel = null, targets = [], cam = { x: 0, y: 0 }, pan = { x: 0, y: 0 }, keys = {};
    var level = cfg.level || 'intermediate', imgs = {}, log = [], zone, shrines, pits, running = false, flash = [];
    var champ = null, picking = false, pickT = 0, pickSel = 0, aim = null, bush = {}, orbs = [], blizz = [], cds = { E: 0, R: 0 }, msel = [], drag = null, myMoves = 0, uiImg = {};
    /* impl-4 pass 2: Kung Fu speed presets (kfchess.com: Standard 1 s per square + 10 s cooldown, Lightning 0.2 s + 2 s) */
    var SPEEDS = { standard: { step: 1, cd: 10 }, lightning: { step: 0.2, cd: 2 } }, speed = cfg.speed || 'standard';
    var CD = arena ? 2.2 : SPEEDS[speed].cd, STEP = arena ? 0 : SPEEDS[speed].step, movers = [];
    function img(c, t) { var k = c + t; if (!imgs[k]) { imgs[k] = new Image(); imgs[k].onload = draw; imgs[k].src = cfg.pieces ? cfg.pieces + '/' + c + t + '.png' : host.pieceUrl(c, t); }  /* impl-4 art: game.pieces = the site's own set cut from the video */ return imgs[k]; }
    function at(x, y) { return x >= 0 && y >= 0 && x < W && y < H ? board[y * W + x] : undefined; }
    function inb(x, y) { return x >= 0 && y >= 0 && x < W && y < H; }
    function add(t, o, x, y) { var p = { t: t, o: o, x: x, y: y, ready: 0, ax: x, ay: y, a0: -1 }; board[y * W + x] = p; pieces.push(p); return p; }
    function kill(p) { if (board[p.y * W + p.x] === p) board[p.y * W + p.x] = null; p.dead = true; pieces = pieces.filter(function (q) { return q !== p; }); }
    function uimg(u) { if (!uiImg[u]) { uiImg[u] = new Image(); uiImg[u].src = u; } return uiImg[u]; }
    function cheb(a, b) { return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y)); }
    function stunned(p) { return p.stun && p.stun > now; }
    function inBush(x, y) { return !!bush[y * W + x]; }
    /* arena: a piece in a bush is hidden from a player (owner o) who has no piece next to it */
    function hiddenFrom(p, o) { if (!arena || p.o === o || !inBush(p.x, p.y)) return false; return !pieces.some(function (q) { return q.o === o && cheb(q, p) <= 1; }); }
    function hostile(p, q) { return q && q.o !== p.o && !(owners[p.o] && owners[q.o] && owners[p.o].team && owners[p.o].team === owners[q.o].team); }

    /* pseudo-legal destinations of a piece (instant model; no check) */
    function reserved(x, y, o) { return movers.some(function (m) { return m.o === o && m.mv.tx === x && m.mv.ty === y; }); }
    function gen(p) {
      if (p.mv || p.t === 'S' || stunned(p)) return [];
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
      var slide = p.t === 'B' || p.t === 'R' || p.t === 'Q', lim = arena ? 4 : 99;   /* arena: 'only four squares' (transcript 3:21, 4:35) */
      (DIRS[p.t] || []).forEach(function (d) {
        var x = p.x + d[0], y = p.y + d[1], n = 1;
        while (inb(x, y) && n <= lim) { var q = at(x, y); if (q) { if (hostile(p, q)) out.push([x, y]); break; } out.push([x, y]); if (!slide) break; x += d[0]; y += d[1]; n++; }
      });
      return out;
    }
    function attackedBy(o) { /* squares attacked by every piece not owned by o (ignoring cooldowns) */
      var A = {};
      pieces.forEach(function (p) {
        if (p.o === o || p.o === 'r' || (owners[p.o].team && owners[p.o].team === owners[o].team)) return;
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
      if (arena && q && q.t === 'K' && owners[q.o].shield) {   /* Ice Shield: the king survives this capture once; the attacker is frozen */
        owners[q.o].shield = false; p.ready = now + CD; p.stun = now + 3; host.sound('illegal'); flash.push({ x: q.x, y: q.y, t: now, c: '#9bdcff' });
        if (q.o === me) host.toast('Ice Shield shattered: your king survives!', 1800); return;
      }
      var slowed = arena && p.o !== me && inBlizzard(p.x, p.y, p.o);
      board[p.y * W + p.x] = null; p.ax = p.x; p.ay = p.y; p.a0 = now; p.x = x; p.y = y; p.moved = true; p.ready = now + CD * (by === 'me' ? 1 : (owners[p.o].cdMul || 1));
      if (slowed) p.ready = now + CD * 2.4;   /* Blizzard: pieces leaving its area cool down much longer */
      if (q) { kill(q); host.sound('capture'); if (arena && p.o === me && q.o !== 'r') owners[me].destroyed = (owners[me].destroyed || 0) + 1;
        if (arena && q.o === me && p.o !== me && champ === 'thalric') { p.stun = now + 3; flash.push({ x: x, y: y, t: now, c: '#9bdcff' }); }   /* Frostbite */
        if (q.t === 'K') eliminate(q.o, p.o); if (q.o === 'n' && arena) pitCheck(p.o); }
      else host.sound(by === 'me' ? 'move-self' : 'move-opponent');
      board[y * W + x] = p;
      var o = owners[p.o], last = o.fwd && ((o.fwd[1] < 0 && y === 0) || (o.fwd[1] > 0 && y === H - 1) || (o.fwd[0] > 0 && x === W - 1) || (o.fwd[0] < 0 && x === 0));
      if (p.t === 'P' && last) p.t = 'Q';
      if (!arena) { log.push(p.t === 'P' ? (q ? name[0] + 'x' : '') + 'abcdefgh'[x] + (H - y) : p.t + (q ? 'x' : '') + 'abcdefgh'[x] + (H - y)); host.setMoves(log.slice()); }
      if (arena && p.o === me && champ === 'eldrin' && ++myMoves % 4 === 0) {   /* Aftershock: every fourth move the king stuns nearby enemies */
        var mk = pieces.filter(function (k) { return k.o === me && k.t === 'K'; })[0];
        if (mk) { stunArea(mk.x, mk.y, 2, 2); host.toast('Aftershock!', 900); }
      }
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
      pieces.slice().forEach(function (p) { if (p.o === o) { if (arena) orbs.push({ x: p.x, y: p.y, v: p.t === 'K' ? 3 : 1 }); kill(p); } });   /* arena: a checkmated army leaves XP orbs */
      if (by === me && arena) { owners[me].mates++; host.toast('Checkmate! ' + ow.name + ' is eliminated.', 1800); }
      if (o === me) { finish('loss', arena ? 'Your king was captured: checkmate (#' + ow.place + ' of ' + nOwners() + ').' : 'Your king was captured.', arena ? '#' + ow.place : null); return; }
      if (!arena || alive().length === 1) finish('win', arena ? 'Last king standing. Victory royale!' : 'You captured the AI king.', arena ? '#1 Victory' : null);
    }
    function nOwners() { return Object.keys(owners).filter(function (k) { return k !== 'n' && k !== 'r'; }).length; }
    function alive() { return Object.keys(owners).filter(function (k) { return k !== 'n' && k !== 'r' && !owners[k].out; }); }
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
      W = 24; H = 24; board = new Array(W * H).fill(null); pieces = []; owners = { n: { name: 'Guardians', col: 'n', fwd: [0, 1] }, r: { name: 'Rocks', col: 'n', fwd: [0, 1], out: true } };
      var spawns = [[2, 2], [12, 1], [21, 2], [22, 12], [21, 21], [12, 22], [2, 21], [1, 12]];
      var names = [(host.spec.player && host.spec.player.name) || 'You'].concat(RIVALS);
      spawns.forEach(function (s, i) {
        var id = 'o' + i, c = W / 2 - 0.5, dx = c - s[0], dy = c - s[1];
        var fwd = Math.abs(dx) > Math.abs(dy) ? [dx > 0 ? 1 : -1, 0] : [0, dy > 0 ? 1 : -1];
        owners[id] = { name: names[i], fwd: fwd, col: i === 0 ? 'w' : 'b', tint: OWNER_COL[i + 1], idx: i, think: 0.7 + Math.random() * 0.5, noise: 1.5, summonAt: i === 0 ? 0 : 1 + Math.random() * 3, xp: 0, lvl: 1, mates: 0, moves: 0 };
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
      /* arena: hedges of bushes (frames 5:52 / 8:49): straight runs of 2-4 tiles away from spawns, pits and shrines */
      bush = {}; orbs = []; blizz = []; cds = { E: 0, R: 0 }; msel = []; drag = null; aim = null; myMoves = 0;
      var near = function (x, y) { return spawns.some(function (s) { return Math.max(Math.abs(s[0] - x), Math.abs(s[1] - y)) <= 2; }) || pits.some(function (pt) { return x >= pt.x - 1 && x <= pt.x + 3 && y >= pt.y - 1 && y <= pt.y + 3; }) || shrines.some(function (sh) { return Math.max(Math.abs(sh.x - x), Math.abs(sh.y - y)) <= 1; }); };
      for (var hb = 0, tries = 0; hb < 14 && tries < 200; tries++) {
        var bx = 1 + Math.floor(Math.random() * (W - 2)), by = 1 + Math.floor(Math.random() * (H - 2)), hz = Math.random() < 0.5, len = 2 + Math.floor(Math.random() * 3), cells = [];
        for (var l = 0; l < len; l++) { var cx = bx + (hz ? l : 0), cy = by + (hz ? 0 : l); if (!inb(cx, cy) || near(cx, cy) || at(cx, cy)) { cells = null; break; } cells.push(cy * W + cx); }
        if (cells) { cells.forEach(function (c) { bush[c] = 1; }); hb++; }
      }
      zone = { r0: 17, r: 17, t0: 0 };
      host.setPlayers({ opp: { name: '7 rival kings' } });
    }
    function summon(o) {
      var ow = owners[o], k = pieces.filter(function (p) { return p.o === o && p.t === 'K'; })[0]; if (!k || ow.out) return false;
      if (now < (ow.summonAt || 0)) { if (o === me) host.toast('Summon ready in ' + Math.ceil(ow.summonAt - now) + ' s'); return false; }
      var army = ['P', 'P', 'P', 'N', 'B', 'R', 'P', 'N', 'B'].slice(0, Math.min(9, 5 + Math.floor((ow.lvl || 1) / 2))), n = 0;   /* arena: the army grows with your level */
      for (var r = 1; r <= 3 && n < army.length; r++) for (var dy = -r; dy <= r && n < army.length; dy++) for (var dx = -r; dx <= r && n < army.length; dx++) {
        var x = k.x + dx, y = k.y + dy; if (inb(x, y) && !at(x, y) && !inPoison(x, y)) { add(army[n++], o, x, y).ready = now + 0.6; }
      }
      ow.summonAt = now + Math.max(10, 24 - 2 * ow.lvl);
      if (o === me) host.toast('Army summoned!', 1200);
      return true;
    }
    function pitCheck(by) {   /* arena: a cleared pit fills with XP orbs (8:49 frame); collect them to level up */
      pits.forEach(function (pt) {
        if (pt.cleared || !pt.g.every(function (p) { return p.dead; })) return; pt.cleared = true;
        for (var dy = -1; dy < 3; dy++) for (var dx = -1; dx < 3; dx++) if ((dx + dy) % 2 === 0 && inb(pt.x + dx, pt.y + dy)) orbs.push({ x: pt.x + dx, y: pt.y + dy, v: 1 });
        if (by === me) { owners[me].pits = (owners[me].pits || 0) + 1; host.toast('Pit cleared! Collect the XP orbs.', 1600); }
      });
    }
    function need(o) { return 3 + 2 * (o.lvl || 1); }
    function collectOrbs() {
      orbs = orbs.filter(function (b) {
        var p = pieces.filter(function (q) { return q.o !== 'n' && q.o !== 'r' && Math.abs(q.x - b.x) <= 1 && Math.abs(q.y - b.y) <= 1; })[0]; if (!p) return true;
        var o = owners[p.o]; o.xp = (o.xp || 0) + b.v;
        while (o.xp >= need(o)) { o.xp -= need(o); o.lvl++; if (p.o === me) { host.toast('Level ' + o.lvl + '! Faster summons, bigger army.', 1500); host.sound('promote'); } }
        return false;
      });
    }
    function inBlizzard(x, y, o) { return blizz.some(function (z) { return z.by !== o && z.until > now && Math.abs(x - z.x) <= z.r && Math.abs(y - z.y) <= z.r; }); }
    function stunArea(cx, cy, r, sec) { pieces.forEach(function (p) { if (p.o !== me && p.o !== 'r' && Math.abs(p.x - cx) <= r && Math.abs(p.y - cy) <= r) { p.stun = now + sec; } }); flash.push({ x: cx, y: cy, t: now, c: '#c9a26b', r: r }); }
    /* arena: champion abilities (E basic, R ultimate). Aimed ones wait for a tap on the map. */
    function useAbility(k) {
      if (!arena || !champ || !running || picking) return; var A = CHAMPS[champ][k];
      if (cds[k] > now) { host.toast(A.name + ' ready in ' + Math.ceil(cds[k] - now) + ' s', 1000); return; }
      if (A.aim) { aim = aim === k ? null : k; sel = null; targets = []; msel = []; host.status(aim ? 'Tap the map to cast ' + A.name + '.' : 'Cast cancelled.'); return; }
      if (A.id === 'iceshield') { owners[me].shield = true; cds[k] = now + A.cd; host.sound('promote'); host.toast('Ice Shield: your king survives the next capture.', 1600); }
    }
    function cast(k, x, y) {
      var A = CHAMPS[champ][k]; aim = null; cds[k] = now + A.cd; host.status('Tap a piece, drag pieces, or box-select several. Q summon · E ' + CHAMPS[champ].E.name + ' · R ' + CHAMPS[champ].R.name + '.');
      if (A.id === 'blizzard') { blizz.push({ x: x, y: y, r: 2, until: now + 8, by: me }); pieces.forEach(function (p) { if (p.o !== me && p.o !== 'r' && Math.abs(p.x - x) <= 2 && Math.abs(p.y - y) <= 2) p.ready = Math.max(p.ready, now + 2.5); }); host.sound('notify'); }
      if (A.id === 'tremor') { stunArea(x, y, 2, 3); host.sound('explosion'); }
      if (A.id === 'stonewall') {
        var k0 = pieces.filter(function (q) { return q.o === me && q.t === 'K'; })[0], hz = !k0 || Math.abs(k0.y - y) >= Math.abs(k0.x - x), n = 0;
        [0, -1, 1].forEach(function (d) { var rx = x + (hz ? d : 0), ry = y + (hz ? 0 : d); if (inb(rx, ry) && !at(rx, ry)) { var r = add('S', 'r', rx, ry); r.ready = 1e9; r.until = now + 20; n++; } });
        host.sound('castle'); if (!n) host.toast('No room for the wall there.', 1000);
      }
    }
    function inPoison(x, y) { if (!arena) return false; var c = W / 2 - 0.5; return Math.max(Math.abs(x - c), Math.abs(y - c)) > zone.r; }

    /* ---------------- AI ---------------- */
    function think(o) {
      var ow = owners[o], mine = pieces.filter(function (p) { return p.o === o && p.ready <= now && !stunned(p); });
      if (!mine.length) return;
      var A = attackedBy(o), best = null, bs = -1e9, kingAt = null;
      pieces.forEach(function (p) { if (p.o !== o && p.t === 'K' && hostile(mine[0], p) && !hiddenFrom(p, o)) { var d = kingAt ? Math.abs(p.x - kingAt.x) + Math.abs(p.y - kingAt.y) : 0; if (!kingAt || d < 0) kingAt = p; } });
      var myK = pieces.filter(function (p) { return p.o === o && p.t === 'K'; })[0];
      mine.forEach(function (p) {
        var here = A[p.x + ',' + p.y];
        gen(p).forEach(function (d) {
          if (o === 'n') { var q0 = at(d[0], d[1]); if (!q0) return; }
          var q = at(d[0], d[1]), s = 0;
          if (q && hiddenFrom(q, o)) q = null;   /* arena: bots cannot see into bushes either */
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
      if (picking) { pickT -= dt; pickPaint(); if (pickT <= 0) lockIn(pickSel); draw(); return; }
      now += dt;
      Object.keys(owners).forEach(function (o) {
        var ow = owners[o]; if (o === me || o === 'r' || ow.out) return;
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
          if (p.t === 'S') { if (p.until < now) kill(p); return; }
          if (inPoison(p.x, p.y) && p.o !== 'n') { p.pz = (p.pz || 0) + dt; if (p.pz > 2.5) { if (p.t === 'K' && owners[p.o].shield) { owners[p.o].shield = false; p.pz = 0; if (p.o === me) host.toast('Ice Shield shattered in the poison!', 1600); return; } kill(p); if (p.t === 'K') eliminate(p.o, null); } } else p.pz = 0;
        });
        shrines.forEach(function (s) {
          if (s.used) return; var k = pieces.filter(function (p) { return p.t === 'K' && Math.abs(p.x - s.x) <= 1 && Math.abs(p.y - s.y) <= 1; })[0];
          if (k) { if (s.who !== k.o) { s.who = k.o; s.t = 0; } s.t += dt; if (s.t > 3) { s.used = true; for (var d = 0; d < 8; d++) { var dd = DIRS.K[d]; if (inb(k.x + dd[0], k.y + dd[1]) && !at(k.x + dd[0], k.y + dd[1])) { add('Q', k.o, k.x + dd[0], k.y + dd[1]); break; } } if (k.o === me) { owners[me].queens = (owners[me].queens || 0) + 1; host.toast('Queen shrine acquired: a queen joins you!', 1800); } } }
          else s.t = Math.max(0, s.t - dt);
        });
        collectOrbs(); blizz = blizz.filter(function (z) { return z.until > now; }); flash = flash.filter(function (f) { return now - f.t < 0.6; });
        var o = owners[me], left = alive().length;
        host.hud('<span>Players left ' + left + '/' + nOwners() + '</span><span>Lv ' + o.lvl + ' · XP ' + (o.xp || 0) + '/' + need(o) + ' · Summon ' + (now >= o.summonAt ? 'READY' : Math.ceil(o.summonAt - now) + 's') + '</span>');
        var k = pieces.filter(function (p) { return p.o === me && p.t === 'K'; })[0];
        if (k) { var vw = view(); cam.x += ((k.x + 0.5 - vw / 2 + pan.x) - cam.x) * Math.min(1, dt * 6); cam.y += ((k.y + 0.5 - vw / 2 + pan.y) - cam.y) * Math.min(1, dt * 6); cam.x = Math.max(0, Math.min(W - vw, cam.x)); cam.y = Math.max(0, Math.min(H - vw, cam.y)); }
        if (keys.left) pan.x -= dt * 6; if (keys.right) pan.x += dt * 6; if (keys.up) pan.y -= dt * 6; if (keys.down) pan.y += dt * 6;
      } else {
        host.hud('');
      }
      if (sel && (sel.dead || sel.ready > now || stunned(sel))) { sel = null; targets = []; }
      if (msel.length) msel = msel.filter(function (p) { return !p.dead; });
      if (sel) targets = gen(sel);
      draw();
    }
    function view() { return arena ? 11 : 8; }
    function draw() {
      var g = host.g, cv = host.canvas, S = cv.width / view(); if (!board) return;
      if (L3) { draw3d(); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, cv.width, cv.height); drawHud(g, cv); return; }
      g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = arena ? '#24352d' : '#ffffff'; g.fillRect(0, 0, cv.width, cv.height);
      var ox = arena ? cam.x : 0, oy = arena ? cam.y : 0;
      g.save(); g.translate(-ox * S, -oy * S);
      var light = arena ? '#6daa89' : '#FFFEFF', dark = arena ? '#3f5a4d' : '#80DB72';
      var bim = arena && uimg(A_UI + 'bush.png');
      for (var y = Math.floor(oy); y < Math.min(H, oy + view() + 1); y++) for (var x = Math.floor(ox); x < Math.min(W, ox + view() + 1); x++) {
        g.fillStyle = (x + y) % 2 ? dark : light; g.fillRect(x * S, y * S, S + 0.5, S + 0.5);
        if (arena && inBush(x, y)) { if (bim.complete && bim.naturalWidth) g.drawImage(bim, x * S, y * S, S + 0.5, S + 0.5); else { g.fillStyle = '#9ccc2e'; g.fillRect(x * S, y * S, S + 0.5, S + 0.5); } }
        if (inPoison(x, y)) { g.fillStyle = 'rgba(128,40,190,0.45)'; g.fillRect(x * S, y * S, S + 0.5, S + 0.5); }
      }
      if (arena) {
        pits.forEach(function (pt) { g.strokeStyle = pt.cleared ? 'rgba(255,255,255,0.25)' : '#d35400'; g.lineWidth = S * 0.06; g.strokeRect((pt.x - 0.5) * S, (pt.y - 0.5) * S, 3 * S, 3 * S); });
        blizz.forEach(function (z) {   /* Blizzard area: icy veil + calm drifting flakes */
          g.fillStyle = 'rgba(170,220,255,0.32)'; g.fillRect((z.x - z.r) * S, (z.y - z.r) * S, (2 * z.r + 1) * S, (2 * z.r + 1) * S);
          g.strokeStyle = 'rgba(220,245,255,0.8)'; g.lineWidth = S * 0.04; g.strokeRect((z.x - z.r) * S, (z.y - z.r) * S, (2 * z.r + 1) * S, (2 * z.r + 1) * S);
          g.fillStyle = 'rgba(255,255,255,0.85)'; for (var fl = 0; fl < 14; fl++) { var fx0 = ((fl * 37) % 50) / 10, fy0 = ((fl * 53 + now * (host.reduced() ? 0 : 6)) % 50) / 10; g.fillRect((z.x - z.r + fx0) * S, (z.y - z.r + fy0) * S, S * 0.07, S * 0.07); }
        });
        var oim = uimg(A_UI + 'xp_orb.png');
        orbs.forEach(function (b) { var bob = host.reduced() ? 0 : Math.sin(now * 3 + b.x + b.y) * S * 0.04; if (oim.complete && oim.naturalWidth) g.drawImage(oim, (b.x + 0.3) * S, (b.y + 0.3) * S + bob, S * 0.4, S * 0.4); else { g.fillStyle = '#3aa0ff'; g.beginPath(); g.arc((b.x + 0.5) * S, (b.y + 0.5) * S, S * 0.18, 0, 7); g.fill(); } });
        shrines.forEach(function (s) { if (s.used) return; g.fillStyle = 'rgba(241,196,15,' + (0.35 + 0.4 * Math.min(1, s.t / 3)) + ')'; g.beginPath(); g.arc((s.x + 0.5) * S, (s.y + 0.5) * S, S * 0.42, 0, 7); g.fill(); g.fillStyle = '#7a5b00'; g.font = 'bold ' + Math.round(S * 0.42) + 'px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('Q', (s.x + 0.5) * S, (s.y + 0.52) * S); });
      }
      msel.forEach(function (p) { g.fillStyle = 'rgba(255,255,51,0.4)'; g.fillRect(p.x * S, p.y * S, S, S); });
      if (sel) { g.fillStyle = 'rgba(255,255,51,0.5)'; g.fillRect(sel.x * S, sel.y * S, S, S); targets.forEach(function (d) { g.fillStyle = 'rgba(0,0,0,0.18)'; g.beginPath(); var tq = at(d[0], d[1]); if (tq && !hiddenFrom(tq, me)) { g.lineWidth = S * 0.08; g.strokeStyle = 'rgba(0,0,0,0.25)'; g.arc((d[0] + 0.5) * S, (d[1] + 0.5) * S, S * 0.44, 0, 7); g.stroke(); } else { g.arc((d[0] + 0.5) * S, (d[1] + 0.5) * S, S * 0.16, 0, 7); g.fill(); } }); }
      pieces.forEach(function (p) {
        if (arena && hiddenFrom(p, me)) return;   /* in a bush and no piece of yours next to it */
        if (p.t === 'S') {   /* Eldrin's Stone Wall rock (no still shows it: drawn grey boulder, inferred) */
          g.fillStyle = '#6f6a63'; g.beginPath(); g.ellipse((p.x + 0.5) * S, (p.y + 0.58) * S, S * 0.4, S * 0.32, 0, 0, 7); g.fill();
          g.fillStyle = '#9a948b'; g.beginPath(); g.ellipse((p.x + 0.44) * S, (p.y + 0.5) * S, S * 0.26, S * 0.18, 0, 0, 7); g.fill(); return;
        }
        if (drag && drag.p === p && drag.moved) return;
        var k = p.a0 >= 0 ? Math.min(1, (now - p.a0) / 0.2) : 1, e = 1 - Math.pow(1 - k, 3);
        var x = (p.ax + (p.x - p.ax) * e) * S, y = (p.ay + (p.y - p.ay) * e) * S;
        if (p.mv) { var L = p.mv.path.length * (p.t === 'N' ? 2 : 1), u = Math.min(1, (now - p.mv.t0) / (STEP * L)); x = (p.mv.fx + (p.mv.tx - p.mv.fx) * u) * S; y = (p.mv.fy + (p.mv.ty - p.mv.fy) * u) * S; }
        if (p.ready > now && !p.mv) { var f = (p.ready - now) / CD; g.fillStyle = 'rgba(247,214,40,0.55)'; g.fillRect(p.x * S, p.y * S + S * (1 - Math.min(1, f)), S, S * Math.min(1, f)); }
        if (arena && owners[p.o].tint) { g.fillStyle = owners[p.o].tint; g.beginPath(); g.ellipse(x + S / 2, y + S * 0.86, S * 0.36, S * 0.1, 0, 0, 7); g.fill(); }
        /* art-g4b: arena = Chess Arena models cut from the video (game.pieces): w your Base Purple army, n brown guardians, b rivals */
        var c = p.o === 'n' ? (arena && cfg.pieces ? 'n' : 'b') : owners[p.o].col, im = img(c, p.t);
        if (arena && inBush(p.x, p.y)) g.globalAlpha = 0.6;   /* your own piece hiding in a bush */
        if (im.complete && im.naturalWidth) g.drawImage(im, x + S * 0.05, y + S * 0.05, S * 0.9, S * 0.9);
        g.globalAlpha = 1;
        if (arena && stunned(p)) { g.fillStyle = 'rgba(150,210,255,0.45)'; g.fillRect(x, y, S, S); g.strokeStyle = '#dff4ff'; g.lineWidth = S * 0.04; g.strokeRect(x + S * 0.06, y + S * 0.06, S * 0.88, S * 0.88); }
        if (arena && p.t === 'K' && owners[p.o].shield) { g.strokeStyle = 'rgba(140,215,255,0.95)'; g.lineWidth = S * 0.07; g.beginPath(); g.arc(x + S / 2, y + S / 2, S * 0.5, 0, 7); g.stroke(); }
        if (p.o === 'n') { g.fillStyle = 'rgba(211,84,0,0.35)'; g.fillRect(x, y, S, S); }
        if (arena && p.pz) { g.fillStyle = 'rgba(160,60,220,' + Math.min(0.7, p.pz / 2.5) + ')'; g.fillRect(x, y, S, S); }
      });
      flash.forEach(function (f) { var a = 1 - (now - f.t) / 0.6, r = f.r || 0; g.fillStyle = f.c; g.globalAlpha = Math.max(0, a) * 0.5; g.fillRect((f.x - r) * S, (f.y - r) * S, (2 * r + 1) * S, (2 * r + 1) * S); g.globalAlpha = 1; });
      if (drag && drag.moved && drag.p) { var dim = img(owners[drag.p.o].col, drag.p.t); if (dim.complete && dim.naturalWidth) g.drawImage(dim, drag.wx * S - S * 0.5, drag.wy * S - S * 0.6, S, S); }
      if (drag && drag.moved && !drag.p) { var bx0 = Math.min(drag.x0, drag.wx), by0 = Math.min(drag.y0, drag.wy); g.fillStyle = 'rgba(255,255,255,0.12)'; g.fillRect(bx0 * S, by0 * S, Math.abs(drag.wx - drag.x0) * S, Math.abs(drag.wy - drag.y0) * S); g.strokeStyle = '#fff'; g.lineWidth = Math.max(1, S * 0.03); g.strokeRect(bx0 * S, by0 * S, Math.abs(drag.wx - drag.x0) * S, Math.abs(drag.wy - drag.y0) * S); }
      g.restore();
      drawHud(g, cv);
    }
    function drawHud(g, cv) {
      if (arena && champ) drawBar(g, cv);
      if (arena) { /* minimap */
        var m = Math.round(cv.width * 0.22), mx = cv.width - m - 6, my = cv.height - m - 6, u = m / W;
        g.fillStyle = 'rgba(0,0,0,0.55)'; g.fillRect(mx, my, m, m);
        var c = W / 2, r = zone.r + 0.5; g.strokeStyle = '#b070ff'; g.lineWidth = 2; g.strokeRect(mx + (c - r) * u, my + (c - r) * u, 2 * r * u, 2 * r * u);
        pieces.forEach(function (p) { if (p.t !== 'K' || hiddenFrom(p, me)) return; g.fillStyle = p.o === me ? '#f1c40f' : '#e74c3c'; g.fillRect(mx + p.x * u - 1.5, my + p.y * u - 1.5, 3.5, 3.5); });
        g.strokeStyle = 'rgba(255,255,255,0.6)'; g.lineWidth = 1; g.strokeRect(mx + cam.x * u, my + cam.y * u, view() * u, view() * u);
      }
    }
    /* ---------------- arena HUD: champion card + level, Q E R ability bar (tap or keys) ---------------- */
    var barRects = [];
    function drawBar(g, cv) {
      var C = CHAMPS[champ], B = Math.round(cv.width * 0.115), pad = Math.round(cv.width * 0.015), y = cv.height - B - pad, o = owners[me];
      barRects = [];
      [['Q', null], ['E', C.E], ['R', C.R]].forEach(function (it, i) {
        var x = pad + i * (B + pad), k = it[0], A = it[1], left = k === 'Q' ? Math.max(0, (o.summonAt || 0) - now) : Math.max(0, cds[k] - now), full = k === 'Q' ? Math.max(10, 24 - 2 * o.lvl) : A.cd;
        barRects.push({ k: k, x: x, y: y, w: B, h: B });
        g.fillStyle = 'rgba(14,20,40,0.85)'; g.fillRect(x, y, B, B);
        var ic = A && A.icon && uimg(A.icon);
        if (ic && ic.complete && ic.naturalWidth) g.drawImage(ic, x + 2, y + 2, B - 4, B - 4);
        else { g.fillStyle = k === 'Q' ? '#6b3fa0' : '#5b4a33'; g.fillRect(x + 2, y + 2, B - 4, B - 4); g.fillStyle = '#fff'; g.font = '700 ' + Math.round(B * (k === 'Q' ? 0.26 : 0.17)) + 'px system-ui,sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
          if (k === 'Q') { if (left <= 0) g.fillText('ARMY', x + B / 2, y + B * 0.5); } else A.name.split(' ').forEach(function (w, j, all) { g.fillText(w, x + B / 2, y + B / 2 + (j - (all.length - 1) / 2) * B * 0.2); }); }
        if (left > 0) { g.fillStyle = 'rgba(0,0,0,0.55)'; g.fillRect(x, y, B, B * Math.min(1, left / full)); g.fillStyle = '#fff'; g.font = '800 ' + Math.round(B * 0.34) + 'px system-ui,sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(Math.ceil(left)), x + B / 2, y + B / 2); }
        if (aim === k) { g.strokeStyle = '#ffe14d'; g.lineWidth = 3; g.strokeRect(x + 1, y + 1, B - 2, B - 2); } else { g.strokeStyle = 'rgba(120,190,255,0.7)'; g.lineWidth = 1.5; g.strokeRect(x + 0.5, y + 0.5, B - 1, B - 1); }
        g.fillStyle = '#e8ecff'; g.font = '700 ' + Math.round(B * 0.2) + 'px system-ui,sans-serif'; g.textAlign = 'center'; g.textBaseline = 'alphabetic'; g.fillText(k, x + B / 2, y - 3);
      });
      /* champion card + level diamond + XP bar (top left, as the HUD in the 5:52 / 8:49 frames) */
      var cw = Math.round(cv.width * 0.1), ch = Math.round(cw * 1.39), cim = uimg(C.card), top = Math.round(cv.height * 0.085);   /* below the DOM HUD line */
      if (cim.complete && cim.naturalWidth) g.drawImage(cim, pad, top, cw, ch);
      var bw = cv.width * 0.26, bx = pad + cw + pad, by = top + ch * 0.62, bh = Math.max(5, ch * 0.13);
      g.fillStyle = 'rgba(10,16,34,0.8)'; g.fillRect(bx, by, bw, bh); g.fillStyle = '#4aa8ff'; g.fillRect(bx, by, bw * Math.min(1, (o.xp || 0) / need(o)), bh);
      g.fillStyle = '#fff'; g.font = '800 ' + Math.round(ch * 0.3) + 'px system-ui,sans-serif'; g.textAlign = 'left'; g.textBaseline = 'alphabetic'; g.fillText(String(o.lvl), bx, by - ch * 0.08);
      if (o.shield) { g.fillStyle = '#9bdcff'; g.font = '700 ' + Math.round(ch * 0.16) + 'px system-ui,sans-serif'; g.fillText('Ice Shield', bx + ch * 0.36, by - ch * 0.1); }
    }
    function barHit(cx, cy) { for (var i = 0; i < barRects.length; i++) { var b = barRects[i]; if (cx >= b.x && cx <= b.x + b.w && cy >= b.y - b.h * 0.25 && cy <= b.y + b.h) return b.k; } return null; }

    /* ---------------- arena champion select (28 s, as at 1:58 in the video) ---------------- */
    var PICK = ['thalric', 'eldrin'];
    function pickCss() {
      if (document.getElementById('g4ar-pick-css')) return; var st = document.createElement('style'); st.id = 'g4ar-pick-css';
      st.textContent = '.g4ar-pick{position:absolute;inset:0;z-index:7;overflow:auto;color:#fff;background:linear-gradient(180deg,rgba(52,30,92,.97),rgba(26,16,50,.98));display:flex;flex-direction:column;gap:6px;padding:8px;font:12px/1.3 system-ui,sans-serif;animation:g4arIn .25s ease-out both}' +
        '.g4ar-ph{text-align:center;font:italic 800 13px/1 system-ui,sans-serif;letter-spacing:.06em}.g4ar-ph b{font-size:22px;margin-left:6px;vertical-align:middle}' +
        '.g4ar-cards{display:flex;gap:8px;justify-content:center}.g4ar-card{flex:1;max-width:160px;display:flex;gap:6px;align-items:center;background:rgba(255,255,255,.06);border:2px solid rgba(255,255,255,.18);border-radius:6px;padding:4px;color:#fff;cursor:pointer;text-align:left;font:inherit;transition:border-color .2s ease-out,background .2s ease-out}' +
        '.g4ar-card.is-sel{border-color:#d89bff;background:rgba(216,155,255,.16)}.g4ar-card img{width:38px;height:53px;object-fit:cover;border-radius:3px}.g4ar-card i{display:block;color:#b98cff;font-size:10px}.g4ar-card b{font:italic 800 13px/1.1 system-ui,sans-serif}' +
        '.g4ar-ab{display:flex;gap:6px;align-items:flex-start}.g4ar-ab img,.g4ar-ab span.ic{width:30px;height:30px;flex:none;border-radius:3px;background:#5b4a33;display:inline-flex;align-items:center;justify-content:center;font-weight:800}' +
        '.g4ar-ab small{color:#b98cff}.g4ar-ab em{float:right;font-style:normal;color:#9fb6ff;font-size:10px}.g4ar-lock{margin-top:auto;align-self:center;background:#81b64c;color:#fff;border:0;border-radius:6px;padding:7px 22px;font:700 14px system-ui,sans-serif;cursor:pointer}' +
        '@media (prefers-reduced-motion:reduce){.g4ar-pick{animation:none}.g4ar-card{transition:none}}';
      document.head.appendChild(st);
    }
    function pickShow() {
      var el = host.el; if (!el) return; pickCss(); var old = el.querySelector('.g4ar-pick'); if (old) old.remove();
      var d = document.createElement('div'); d.className = 'g4ar-pick'; el.appendChild(d);
      d.addEventListener('click', function (e) { var c = e.target.closest('[data-c]'); if (c) { pickSel = +c.dataset.c; pickPaint(true); return; } if (e.target.closest('.g4ar-lock')) lockIn(pickSel); });
      pickPaint(true);
    }
    function pickPaint(full) {
      var d = host.el && host.el.querySelector('.g4ar-pick'); if (!d) return;
      if (!full) { var t = d.querySelector('.g4ar-ph b'); if (t) t.textContent = Math.max(0, Math.ceil(pickT)); return; }
      var C = CHAMPS[PICK[pickSel]], ab = function (lab, A) { return '<div class="g4ar-ab">' + (A.icon ? '<img src="' + A.icon + '" alt="">' : '<span class="ic">' + A.name.charAt(0) + '</span>') + '<div><small>' + lab + '</small>' + (A.cd ? '<em>Cooldown: ' + A.cd + '</em>' : '') + '<br><b>' + A.name + '</b><br>' + A.txt + '</div></div>'; };
      d.innerHTML = '<div class="g4ar-ph">CHOOSE A CHAMPION <b>' + Math.max(0, Math.ceil(pickT)) + '</b></div><div class="g4ar-cards">' + PICK.map(function (k, i) { var c = CHAMPS[k]; return '<button type="button" class="g4ar-card' + (i === pickSel ? ' is-sel' : '') + '" data-c="' + i + '"><img src="' + c.card + '" alt=""><span><i>' + c.title + '</i><b>' + c.name + '</b></span></button>'; }).join('') + '</div>' +
        ab('Basic (E)', C.E) + ab('Ultimate (R)', C.R) + ab('Passive', C.P) + '<button type="button" class="g4ar-lock">Lock in</button>';
    }
    function lockIn(i) {
      if (!picking) return; picking = false; pickSel = i; champ = PICK[i];
      var d = host.el && host.el.querySelector('.g4ar-pick'); if (d) d.remove();
      host.setPlayers({ you: { avatar: CHAMPS[champ].card } });
      host.status('Q summon · E ' + CHAMPS[champ].E.name + ' · R ' + CHAMPS[champ].R.name + '. Tap or drag a piece; drag on empty ground to box-select several.');
      host.toast(CHAMPS[champ].name + ' locked in. Press Q (or the action button) to summon your army.', 2200);
    }

    /* ---------------- m-3d (2026-11-26): Chess Arena in real 3D, like the video ----------------
       The video's map is a 3D arena seen from a steep chase camera: green / teal tiles, waist-high hedges, the
       Chess Arena piece models standing on their squares, a purple poison wall closing in (frames 352 / 529 / 703).
       js/games/lift3d.js puts a three.js view under the 2D canvas; the 2D canvas keeps the HUD (ability bar, minimap)
       and every pointer event; taps are mapped to tiles by a ray onto the ground (pieces first, by their projected
       body). World units: tile (x, y) covers x..x+1 on the x axis and y..y+1 on the z axis. No WebGL -> 2D as before. */
    var L3 = null, stopped3d = false, R3 = null, TILE3 = 32;
    function start3d() {
      if (!arena) return; stopped3d = false;
      var go = function () {
        if (!CM.lift3d || stopped3d) return;
        CM.lift3d.attach(host, { background: '#14201b', fov: 36, exposure: 1.05 }).then(function (L) {
          if (!L) return; if (stopped3d) { L.dispose(); return; }
          L3 = L; build3d(); draw();
        });
      };
      if (CM.lift3d) go(); else CM.util.loadScript('js/games/lift3d.js').then(go).catch(function () { /* stays 2D */ });
    }
    function build3d() {
      var T = L3.THREE, sc = L3.scene; R3 = { spr: new Map(), tex: {}, hedgeSig: '' };
      sc.fog = new T.Fog('#14201b', 22, 46);
      sc.add(new T.HemisphereLight('#eaf6ff', '#33462f', 1.05));
      var sun = new T.DirectionalLight('#fff3dc', 1.6); sun.position.set(W / 2 - 8, 18, H / 2 + 10); sun.target.position.set(W / 2, 0, H / 2);
      sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024); var sc2 = sun.shadow.camera; sc2.left = -16; sc2.right = 16; sc2.top = 16; sc2.bottom = -16; sc2.near = 1; sc2.far = 60; sun.shadow.bias = -.0008;
      sc.add(sun); sc.add(sun.target); R3.sun = sun;
      /* ground: one plane whose texture is redrawn every frame (tiles + selection / targets / cooldowns / poison) */
      var gc = document.createElement('canvas'); gc.width = W * TILE3; gc.height = H * TILE3; R3.gc = gc; R3.gx = gc.getContext('2d');
      R3.gtex = L3.canvasTex(gc);
      var ground = new T.Mesh(new T.PlaneGeometry(W, H).rotateX(-Math.PI / 2).translate(W / 2, 0, H / 2), new T.MeshStandardMaterial({ map: R3.gtex, roughness: .85 }));
      ground.receiveShadow = true; sc.add(ground);
      /* the arena floor outside the map + a low stone kerb round it */
      var out = new T.Mesh(new T.PlaneGeometry(90, 90).rotateX(-Math.PI / 2).translate(W / 2, -.32, H / 2), new T.MeshStandardMaterial({ color: '#25352c', roughness: 1 })); sc.add(out);
      var km = new T.MeshStandardMaterial({ color: '#6f7d77', roughness: .9 }), kerb = [];
      [[W / 2, -.4, W + .8, .5], [W / 2, H + .4, W + .8, .5]].forEach(function (k) { kerb.push(new T.Mesh(new T.BoxGeometry(k[2], .5, k[3]), km)); kerb[kerb.length - 1].position.set(k[0], -.07, k[1]); });
      [[-.4, H / 2], [W + .4, H / 2]].forEach(function (k) { var m = new T.Mesh(new T.BoxGeometry(.5, .5, H), km); m.position.set(k[0], -.07, k[1]); kerb.push(m); });
      kerb.forEach(function (m) { m.receiveShadow = true; m.castShadow = true; sc.add(m); });
      /* hedge texture: leafy bright green (bush.png colours) */
      var hc = document.createElement('canvas'); hc.width = hc.height = 128; var hx = hc.getContext('2d');
      hx.fillStyle = '#8cc12e'; hx.fillRect(0, 0, 128, 128);
      for (var i = 0; i < 420; i++) { hx.fillStyle = ['#a8d93c', '#6f9e20', '#b9e65a', '#5f8c1c'][i % 4]; hx.beginPath(); hx.ellipse(Math.random() * 128, Math.random() * 128, 3 + Math.random() * 5, 2 + Math.random() * 3, Math.random() * 3, 0, 7); hx.fill(); }
      R3.hedgeMat = new T.MeshStandardMaterial({ map: L3.canvasTex(hc), roughness: 1 });
      R3.hedgeGeo = new T.BoxGeometry(1, .72, 1).translate(0, .36, 0);
      /* shared bits */
      R3.blobGeo = new T.CircleGeometry(.36, 20).rotateX(-Math.PI / 2);
      R3.blobMat = new T.MeshBasicMaterial({ color: '#000', transparent: true, opacity: .32, depthWrite: false });
      R3.rockGeo = new T.DodecahedronGeometry(.42, 0); R3.rockMat = new T.MeshStandardMaterial({ color: '#7d776f', roughness: .95, flatShading: true });
      R3.orbGeo = new T.SphereGeometry(.16, 14, 10); R3.orbMat = new T.MeshStandardMaterial({ color: '#4fb6ff', emissive: '#2a8cff', emissiveIntensity: 1.4, roughness: .2 });
      R3.orbs = []; R3.rocks = [];
      /* queen shrines: stone plinth with a gold crown-gem (gold Q circle in 2D) */
      R3.shr = shrines.map(function () {
        var g0 = new T.Group(), st = new T.Mesh(new T.CylinderGeometry(.42, .5, .3, 12), new T.MeshStandardMaterial({ color: '#8d8a80', roughness: .8 })); st.position.y = .15; st.castShadow = true; g0.add(st);
        var gem = new T.Mesh(new T.OctahedronGeometry(.2), new T.MeshStandardMaterial({ color: '#f1c40f', emissive: '#b8860b', emissiveIntensity: .9, metalness: .6, roughness: .3 })); gem.position.y = .72; g0.add(gem); g0.userData.gem = gem;
        sc.add(g0); return g0;
      });
      /* the poison storm: four translucent purple walls on the zone edge */
      R3.pmat = new T.MeshBasicMaterial({ color: '#9b3fe0', transparent: true, opacity: .3, side: T.DoubleSide, depthWrite: false });
      R3.pwall = [0, 1, 2, 3].map(function () { var m = new T.Mesh(new T.PlaneGeometry(1, 2.2).translate(0, 1.1, 0), R3.pmat); sc.add(m); return m; });
      R3.hedges = null;
    }
    function tex3(url) {
      if (!R3.tex[url]) { var T = L3.THREE, t = new T.TextureLoader().load(url, function () { if (L3) draw(); }); t.colorSpace = T.SRGBColorSpace; R3.tex[url] = t; }
      return R3.tex[url];
    }
    function ppos(p) {   /* a piece's drawn position in tiles (slide + Kung Fu path), as in the 2D draw */
      var k = p.a0 >= 0 ? Math.min(1, (now - p.a0) / 0.2) : 1, e = 1 - Math.pow(1 - k, 3), x = p.ax + (p.x - p.ax) * e, y = p.ay + (p.y - p.ay) * e;
      if (p.mv) { var Lm = p.mv.path.length * (p.t === 'N' ? 2 : 1), u = Math.min(1, (now - p.mv.t0) / (STEP * Lm)); x = p.mv.fx + (p.mv.tx - p.mv.fx) * u; y = p.mv.fy + (p.mv.ty - p.mv.fy) * u; }
      return [x, y];
    }
    function ground3d() {
      var g = R3.gx, S = TILE3, light = '#6daa89', dark = '#3f5a4d';
      for (var y = 0; y < H; y++) for (var x = 0; x < W; x++) {
        g.fillStyle = (x + y) % 2 ? dark : light; g.fillRect(x * S, y * S, S, S);
        g.fillStyle = 'rgba(255,255,255,0.08)'; g.fillRect(x * S, y * S, S, 2); g.fillStyle = 'rgba(0,0,0,0.12)'; g.fillRect(x * S, y * S + S - 2, S, 2);   /* bevelled stone tiles */
        if (inBush(x, y)) { g.fillStyle = '#4d6f1e'; g.fillRect(x * S, y * S, S, S); }
        if (inPoison(x, y)) { g.fillStyle = 'rgba(128,40,190,0.5)'; g.fillRect(x * S, y * S, S, S); }
      }
      pits.forEach(function (pt) { g.strokeStyle = pt.cleared ? 'rgba(255,255,255,0.25)' : '#d35400'; g.lineWidth = 3; g.strokeRect((pt.x - 0.5) * S, (pt.y - 0.5) * S, 3 * S, 3 * S); });
      blizz.forEach(function (z) { g.fillStyle = 'rgba(190,230,255,0.45)'; g.fillRect((z.x - z.r) * S, (z.y - z.r) * S, (2 * z.r + 1) * S, (2 * z.r + 1) * S); g.strokeStyle = 'rgba(230,248,255,0.9)'; g.lineWidth = 2; g.strokeRect((z.x - z.r) * S, (z.y - z.r) * S, (2 * z.r + 1) * S, (2 * z.r + 1) * S); });
      shrines.forEach(function (sh) { if (sh.used) return; g.fillStyle = 'rgba(241,196,15,' + (0.3 + 0.45 * Math.min(1, sh.t / 3)) + ')'; g.beginPath(); g.arc((sh.x + 0.5) * S, (sh.y + 0.5) * S, S * 1.4, 0, 7); g.fill(); });
      msel.forEach(function (p) { g.fillStyle = 'rgba(255,255,51,0.45)'; g.fillRect(p.x * S, p.y * S, S, S); });
      if (sel) {
        g.fillStyle = 'rgba(255,255,51,0.55)'; g.fillRect(sel.x * S, sel.y * S, S, S);
        targets.forEach(function (d) { var tq = at(d[0], d[1]); g.beginPath(); if (tq && !hiddenFrom(tq, me)) { g.lineWidth = S * 0.1; g.strokeStyle = 'rgba(0,0,0,0.35)'; g.arc((d[0] + 0.5) * S, (d[1] + 0.5) * S, S * 0.44, 0, 7); g.stroke(); } else { g.fillStyle = 'rgba(0,0,0,0.28)'; g.arc((d[0] + 0.5) * S, (d[1] + 0.5) * S, S * 0.17, 0, 7); g.fill(); } });
      }
      pieces.forEach(function (p) {
        if (p.t === 'S' || (arena && hiddenFrom(p, me))) return;
        var q = ppos(p), x = q[0] * S, y = q[1] * S;
        if (p.ready > now && !p.mv) { var f = Math.min(1, (p.ready - now) / CD); g.fillStyle = 'rgba(247,214,40,0.6)'; g.fillRect(p.x * S, p.y * S + S * (1 - f), S, S * f); }
        if (owners[p.o].tint) { g.strokeStyle = owners[p.o].tint; g.lineWidth = 3; g.beginPath(); g.arc(x + S / 2, y + S / 2, S * 0.4, 0, 7); g.stroke(); }
        if (p.o === 'n') { g.fillStyle = 'rgba(211,84,0,0.35)'; g.fillRect(x, y, S, S); }
        if (stunned(p)) { g.fillStyle = 'rgba(150,210,255,0.55)'; g.fillRect(x, y, S, S); }
        if (p.pz) { g.fillStyle = 'rgba(160,60,220,' + Math.min(0.7, p.pz / 2.5) + ')'; g.fillRect(x, y, S, S); }
        if (p.t === 'K' && owners[p.o].shield) { g.strokeStyle = 'rgba(140,215,255,0.95)'; g.lineWidth = 4; g.beginPath(); g.arc(x + S / 2, y + S / 2, S * 0.5, 0, 7); g.stroke(); }
      });
      flash.forEach(function (f) { var a = 1 - (now - f.t) / 0.6, r = f.r || 0; g.globalAlpha = Math.max(0, a) * 0.55; g.fillStyle = f.c; g.fillRect((f.x - r) * S, (f.y - r) * S, (2 * r + 1) * S, (2 * r + 1) * S); g.globalAlpha = 1; });
      if (drag && drag.moved && !drag.p) { var bx0 = Math.min(drag.x0, drag.wx), by0 = Math.min(drag.y0, drag.wy); g.fillStyle = 'rgba(255,255,255,0.15)'; g.fillRect(bx0 * S, by0 * S, Math.abs(drag.wx - drag.x0) * S, Math.abs(drag.wy - drag.y0) * S); g.strokeStyle = '#fff'; g.lineWidth = 2; g.strokeRect(bx0 * S, by0 * S, Math.abs(drag.wx - drag.x0) * S, Math.abs(drag.wy - drag.y0) * S); }
      R3.gtex.needsUpdate = true;
    }
    function hedges3d() {
      var keysB = Object.keys(bush), sig = keysB.join(',');
      if (sig === R3.hedgeSig) return; R3.hedgeSig = sig;
      var T = L3.THREE;
      if (R3.hedges) { L3.scene.remove(R3.hedges); R3.hedges.dispose(); }
      var im = new T.InstancedMesh(R3.hedgeGeo, R3.hedgeMat, Math.max(1, keysB.length)), m = new T.Matrix4();
      keysB.forEach(function (c, i) { c = +c; m.makeTranslation(c % W + .5, 0, Math.floor(c / W) + .5); im.setMatrixAt(i, m); });
      im.count = keysB.length; im.castShadow = true; im.receiveShadow = true; L3.scene.add(im); R3.hedges = im;
    }
    function sprite3d(p) {
      var T = L3.THREE, e = R3.spr.get(p);
      if (!e) {
        var c = p.o === 'n' ? (cfg.pieces ? 'n' : 'b') : owners[p.o].col, url = cfg.pieces ? cfg.pieces + '/' + c + p.t + '.png' : host.pieceUrl(c, p.t);
        var sp = new T.Sprite(new T.SpriteMaterial({ map: tex3(url), transparent: true, alphaTest: .25, depthWrite: true }));
        sp.center.set(.5, .06); var sz = p.t === 'P' ? 1.2 : p.t === 'K' || p.t === 'Q' ? 1.55 : 1.4; sp.scale.set(sz, sz, 1);
        var blob = new T.Mesh(R3.blobGeo, R3.blobMat); blob.position.y = .012;
        L3.scene.add(sp); L3.scene.add(blob); e = { sp: sp, blob: blob }; R3.spr.set(p, e);
      }
      return e;
    }
    function draw3d() {
      if (!R3) return;
      var T = L3.THREE, t = performance.now() / 1000, red = host.reduced();
      if (!(t - (R3.gt || 0) < .07)) { R3.gt = t; ground3d(); }   /* the ground texture (overlays, cooldown fills) at ~14 fps: a full upload every frame is heavy on phones */
      hedges3d();
      var seen = new Set();
      pieces.forEach(function (p) {
        if (p.t === 'S') return;
        var e = sprite3d(p), q = ppos(p), hid = hiddenFrom(p, me) || (drag && drag.p === p && drag.moved);
        seen.add(p);
        e.sp.visible = e.blob.visible = !hid;
        if (drag && drag.p === p && drag.moved) { e.sp.visible = true; q = [drag.wx - .5, drag.wy - .5]; }
        var lift = p.mv && !red ? Math.sin(Math.min(1, (now - p.mv.t0) / Math.max(.01, STEP * p.mv.path.length)) * Math.PI) * .25 : 0;
        e.sp.position.set(q[0] + .5, .02 + lift, q[1] + .5); e.blob.position.set(q[0] + .5, .012, q[1] + .5);
        e.sp.material.opacity = inBush(p.x, p.y) ? .6 : 1;
        e.sp.material.color.set(p.ready > now && p.o === me ? '#d9d9d9' : '#ffffff');
      });
      R3.spr.forEach(function (e, p) { if (!seen.has(p)) { L3.scene.remove(e.sp); L3.scene.remove(e.blob); e.sp.material.dispose(); R3.spr.delete(p); } });
      /* Stone Wall rocks */
      var rocks = pieces.filter(function (p) { return p.t === 'S'; });
      while (R3.rocks.length < rocks.length) { var rm = new T.Mesh(R3.rockGeo, R3.rockMat); rm.castShadow = true; L3.scene.add(rm); R3.rocks.push(rm); }
      R3.rocks.forEach(function (m, i) { var r = rocks[i]; m.visible = !!r; if (r) { m.position.set(r.x + .5, .3, r.y + .5); m.rotation.set(r.x, r.y, 0); } });
      /* XP orbs */
      while (R3.orbs.length < orbs.length) { var om = new T.Mesh(R3.orbGeo, R3.orbMat); L3.scene.add(om); R3.orbs.push(om); }
      R3.orbs.forEach(function (m, i) { var b = orbs[i]; m.visible = !!b; if (b) m.position.set(b.x + .5, .45 + (red ? 0 : Math.sin(t * 3 + b.x + b.y) * .08), b.y + .5); });
      shrines.forEach(function (sh, i) { var g0 = R3.shr[i]; g0.visible = !sh.used; g0.position.set(sh.x + .5, 0, sh.y + .5); if (!red) { g0.userData.gem.rotation.y = t * 1.5; g0.userData.gem.position.y = .72 + Math.sin(t * 2) * .05; } });
      /* poison walls on the zone edge */
      var c = W / 2, r = zone.r + .5, sides = [[c, c - r, 0], [c, c + r, 0], [c - r, c, Math.PI / 2], [c + r, c, Math.PI / 2]];
      R3.pwall.forEach(function (m, i) { var s = sides[i]; m.position.set(s[0], 0, s[1]); m.rotation.y = s[2]; m.scale.x = 2 * r; m.visible = r < W / 2 + .5; });
      R3.pmat.opacity = .26 + (red ? 0 : Math.sin(t * 2) * .05);
      /* chase camera over the 2D view window (cam = top-left tile of an 11-tile window) */
      var vw = view(), cx = cam.x + vw / 2, cz = cam.y + vw / 2;
      L3.look([cx, 0, cz + .1], 0, .5, 15.2);
      R3.sun.position.set(cx - 8, 18, cz + 10); R3.sun.target.position.set(cx, 0, cz);
      L3.render();
    }
    function pick3d(e) {   /* the tile under a tap: a piece's standing body first, then the ground */
      var best = null, bd = 1e9, r = host.canvas.getBoundingClientRect(), k = host.canvas.width / r.width;
      var px = (e.clientX - r.left) * k, py = (e.clientY - r.top) * k;
      pieces.forEach(function (p) {
        if (p.t === 'S' || hiddenFrom(p, me)) return;
        var a = L3.project(p.x + .5, .5, p.y + .5), b = L3.project(p.x + 1, .5, p.y + .5), rad = Math.abs(b.x - a.x) * .9, d = Math.hypot(px - a.x, py - a.y);
        if (d < rad && d < bd) { bd = d; best = [p.x + .5, p.y + .5]; }
      });
      if (best && !(drag && drag.moved)) return best;
      var v = L3.pick(e.clientX, e.clientY); return v ? [v.x, v.z] : null;
    }

    /* ---------------- input ---------------- */
    function cellAt(e) {
      var cv = host.canvas, r = cv.getBoundingClientRect(), S = r.width / view(), k = cv.width / r.width;
      var wx = (e.clientX - r.left) / S + (arena ? cam.x : 0), wy = (e.clientY - r.top) / S + (arena ? cam.y : 0);
      if (L3) { var hp = pick3d(e); if (hp) { wx = hp[0]; wy = hp[1]; } }
      return { x: Math.floor(wx), y: Math.floor(wy), wx: wx, wy: wy, cx: (e.clientX - r.left) * k, cy: (e.clientY - r.top) * k, sx: e.clientX, sy: e.clientY };
    }
    function tapCell(x, y) {
      if (msel.length) { groupMove(x, y); return; }
      var q = at(x, y);
      if (sel && targets.some(function (d) { return d[0] === x && d[1] === y; })) { doMove(sel, x, y, 'me'); sel = null; targets = []; draw(); return; }
      if (q && q.o === me) { if (q.ready > now || stunned(q)) { host.status(stunned(q) ? 'That piece is stunned.' : 'That piece is cooling down.'); return; } sel = q; targets = gen(q); }
      else { sel = null; targets = []; }
      draw();
    }
    /* arena: several selected pieces move together; each takes its legal square closest to the tapped one */
    function groupMove(x, y) {
      var list = msel.filter(function (p) { return !p.dead && p.ready <= now && !stunned(p); }), used = {}, n = 0;
      var d2 = function (a, b) { return (a[0] - x) * (a[0] - x) + (a[1] - y) * (a[1] - y); };
      list.sort(function (a, b) { return d2([a.x, a.y]) - d2([b.x, b.y]); });
      list.forEach(function (p) {
        var best = null, bd = d2([p.x, p.y]);
        gen(p).forEach(function (d) { if (used[d[0] + ',' + d[1]]) return; var q = at(d[0], d[1]); if (q && !hiddenFrom(q, me) && !(d[0] === x && d[1] === y)) return; var v = d2(d); if (v < bd) { bd = v; best = d; } });
        if (best) { used[best[0] + ',' + best[1]] = 1; doMove(p, best[0], best[1], 'me'); n++; }
      });
      msel = []; sel = null; targets = [];
      if (!n) host.toast('No selected piece can move closer.', 1000);
      draw();
    }
    function pdown(e) {
      if (!running || picking) return; var c = cellAt(e), hit = arena && champ ? barHit(c.cx, c.cy) : null;
      if (hit) { if (hit === 'Q') summon(me); else useAbility(hit); draw(); return; }
      if (!arena) { tapCell(c.x, c.y); return; }
      if (aim) { if (inb(c.x, c.y)) cast(aim, c.x, c.y); draw(); return; }
      var q = at(c.x, c.y);
      drag = { x0: c.wx, y0: c.wy, wx: c.wx, wy: c.wy, sx: c.sx, sy: c.sy, moved: false, p: q && q.o === me && q.ready <= now && !stunned(q) ? q : null };
      try { host.canvas.setPointerCapture(e.pointerId); } catch (_) { }
    }
    function pmove(e) {
      if (!drag) return; var c = cellAt(e); drag.wx = c.wx; drag.wy = c.wy;
      if (!drag.moved && Math.hypot(c.sx - drag.sx, c.sy - drag.sy) > 8) { drag.moved = true; if (drag.p) { sel = drag.p; targets = gen(drag.p); msel = []; } }
    }
    function pup(e) {
      var d = drag; drag = null; if (!d || !running) return;
      var x = Math.floor(d.wx), y = Math.floor(d.wy);
      if (!d.moved) { tapCell(Math.floor(d.x0), Math.floor(d.y0)); return; }
      if (d.p) { if (sel === d.p && targets.some(function (t) { return t[0] === x && t[1] === y; })) doMove(d.p, x, y, 'me'); sel = null; targets = []; draw(); return; }
      var x0 = Math.floor(Math.min(d.x0, d.wx)), x1 = Math.floor(Math.max(d.x0, d.wx)), y0 = Math.floor(Math.min(d.y0, d.wy)), y1 = Math.floor(Math.max(d.y0, d.wy));
      msel = pieces.filter(function (p) { return p.o === me && p.x >= x0 && p.x <= x1 && p.y >= y0 && p.y <= y1; });
      sel = null; targets = [];
      if (msel.length === 1) { var one = msel[0]; msel = []; if (one.ready <= now && !stunned(one)) { sel = one; targets = gen(one); } }
      else if (msel.length) host.status(msel.length + ' pieces selected: tap a square to send them all toward it.');
      draw();
    }
    function pcancel() { drag = null; }
    function newGame() {
      now = 0; sel = null; targets = []; log = []; movers = []; if (!arena) { CD = SPEEDS[speed].cd; STEP = SPEEDS[speed].step; } pan = { x: 0, y: 0 }; host.setMoves([]);
      clearResults(); if (arena) arenaSetup(); else kungfu();
      running = true;
      if (arena) { var k = pieces.filter(function (p) { return p.o === me; })[0]; cam.x = Math.max(0, k.x - 5); cam.y = Math.max(0, k.y - 5); host.status('Choose a champion, then press Q (or the action button) to summon your army.'); picking = true; pickT = 28; champ = null; pickShow(); }
      else host.status('No turns: tap a ready piece, then a square. Yellow = cooling down.');
      draw();
    }
    return {
      wantsRawKeys: true,
      start: function () {
        host.canvas.addEventListener('pointerdown', pdown); host.canvas.addEventListener('pointermove', pmove); host.canvas.addEventListener('pointerup', pup); host.canvas.addEventListener('pointercancel', pcancel);
        if (!arena) host.picker('AI level', [{ value: 'intermediate', label: 'Intermediate' }, { value: 'advanced', label: 'Advanced' }], level, function (v) { level = v; newGame(); });
        if (!arena) host.picker('Speed', [{ value: 'standard', label: 'Standard' }, { value: 'lightning', label: 'Lightning' }], speed, function (v) { speed = v; newGame(); });
        newGame(); host.loop(tick);
        start3d();
      },
      newGame: newGame,
      stop: function () { running = false; stopped3d = true; if (L3) { L3.dispose(); L3 = null; } host.canvas.removeEventListener('pointerdown', pdown); host.canvas.removeEventListener('pointermove', pmove); host.canvas.removeEventListener('pointerup', pup); host.canvas.removeEventListener('pointercancel', pcancel); var pk = host.el && host.el.querySelector('.g4ar-pick'); if (pk) pk.remove(); },
      key: function (k, down) {
        if (arena && picking) { if (!down) return; if (k === 'left' || k === 'right' || k === 'up' || k === 'down') { pickSel = (pickSel + 1) % PICK.length; pickPaint(true); } else if (k === 'action' || k === 'jump' || k === 'Enter') lockIn(pickSel); return; }
        if (['left', 'right', 'up', 'down'].indexOf(k) >= 0) { keys[k] = down; if (!down && arena) { /* keep the pan */ } return; }
        if (down && (k === 'action' || k === 'jump' || k === 'KeyQ') && arena && running) summon(me);
        if (down && arena && (k === 'KeyE' || k === 'KeyR')) useAbility(k === 'KeyE' ? 'E' : 'R');
        if (down && k === 'Escape') { aim = null; msel = []; }
        if (down && k === (arena ? 'KeyC' : 'KeyR')) pan = { x: 0, y: 0 };   /* arena: R is the ultimate, C re-centres the camera */
      },
      resize: function () { draw(); },
      redraw: draw,
      qaEnd: function (r) { finish(r || 'win', 'QA'); },  /* art-g4b: lets QA open the results screen */
      qa: function (o) {   /* arena agent: QA snapshot + helpers */
        o = o || {};
        if (o.pick != null && picking) lockIn(o.pick);
        if (o.summon) summon(me);
        if (o.ability) useAbility(o.ability);
        if (o.cast) cast(o.cast.k, o.cast.x, o.cast.y);
        if (o.orbAt) orbs.push({ x: o.orbAt[0], y: o.orbAt[1], v: o.orbAt[2] || 1 });
        if (o.selectAll) msel = pieces.filter(function (p) { return p.o === me && p.t !== 'K'; });
        if (o.groupTo) groupMove(o.groupTo[0], o.groupTo[1]);
        if (o.bushAt) bush[o.bushAt[1] * W + o.bushAt[0]] = 1;
        if (o.put) { var pp = add(o.put.t, o.put.o, o.put.x, o.put.y); pp.ready = 0; }
        if (o.wait) now += o.wait;
        if (o.move) { var mp = at(o.move[0], o.move[1]); if (mp) doMove(mp, o.move[2], o.move[3], mp.o); }
        var mine = pieces.filter(function (p) { return p.o === me; }), k = mine.filter(function (p) { return p.t === 'K'; })[0];
        var pj = null;
        if (o.proj && L3) { var rr = host.canvas.getBoundingClientRect(), pv = L3.project(o.proj[0] + .5, .5, o.proj[1] + .5), kk = rr.width / host.canvas.width; pj = [rr.left + pv.x * kk, rr.top + pv.y * kk]; }
        return { three: !!L3, proj: pj, sel: sel ? [sel.x, sel.y] : null, picking: picking, champ: champ, lvl: owners[me] && owners[me].lvl, xp: owners[me] && owners[me].xp, orbs: orbs.length, bushes: Object.keys(bush).length, mine: mine.length,
          king: k ? [k.x, k.y] : null, hiddenFromMe: pieces.filter(function (p) { return hiddenFrom(p, me); }).length, shield: !!(owners[me] && owners[me].shield), cds: { E: Math.max(0, cds.E - now), R: Math.max(0, cds.R - now) },
          blizz: blizz.length, rocks: pieces.filter(function (p) { return p.t === 'S'; }).length, stunned: pieces.filter(stunned).length, msel: msel.length, now: now, positions: mine.map(function (p) { return p.t + p.x + ',' + p.y; }) };
      }
    };
  });
})();
