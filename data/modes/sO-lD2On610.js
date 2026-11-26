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
   pellets). Generals: re-read from the full still maxres1 (cm-recheck3). Inferred: green pawns stepping
   one square orthogonally, a Bob dying on its third check (the counter shows 3 left; "only has one check left" after two).
   cm-g6b pass 2: Blue/Green seat chips, the bonus real Pac-Man game (13:50-15:15: power circles turn the ghosts, eaten ghosts
   are released back, clearing every point moves to the next level), generals left inferred (see source.notes). */
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
  setup: { fen: '3[n:Pr][n:Pr][n:Pr]**[n:Pr][n:Pr][n:Pr]3/3[n:Pr]*[n:Pr]**[n:Pr]*[n:Pr]3/3[n:Pr]*[n:Pp][n:Pr][n:Pr][n:Pp]*[n:Pr]3/[n:Pp][n:Pr][n:Pr][n:Pr][n:Pr][n:Pr]**[n:Pr][n:Pr][n:Pr][n:Pr][n:Pr][n:Pp]/[n:Pr]***[n:Pr]****[n:Pr]***[n:Pr]/[n:Pr][n:Pr][n:Pr][n:Pr][n:Pr][n:Pr][n:Pr][n:Pr][n:Pr][n:Pr][n:Pr][n:Pr][n:Pr][n:Pr]/[n:Pr]*[n:Pr]*[n:Pr]*[n:Gp][n:Gp]*[n:Pr]*[n:Pr]*[n:Pr]/[n:Pr][n:Pr][n:Pr]*[n:Pr]*[n:Gr][n:Gr]*[n:Pr]*[n:Pr][n:Pr][n:Pr]/**[n:Pr]*[n:Pr]****[n:Pr]*[n:Pr]**/[bo]*[n:Pr][n:Pr][n:Pr][n:Pr][n:Pp][n:Pp][n:Pr][n:Pr][n:Pr][n:Pr]*[Bo]/[n:Pr][n:Pr][n:Pr]**[n:Pr]**[n:Pr]**[n:Pr][n:Pr][n:Pr]/3[n:Pr]*[n:Pr][n:Pp][n:Pp][n:Pr]*[n:Pr]3/3[n:Pr]**[n:Pr][n:Pr]**[n:Pr]3/3[n:Pr][n:Pr][n:Pr][n:Pr][n:Pr][n:Pr][n:Pr][n:Pr]3', turn: 'w', x: { sc: { w: 0, b: 0 }, chk: { w: 0, b: 0 } } },
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

    /* cm-g6b: chess.com 4-player seats. Red (you, bottom bar) and Yellow (top bar) keep the 3+2 clocks; Blue is out of the
       game (its pieces are the pellets) and Green is the bot seat: both get chess.com-style chips in the top bar. */
    function seats(ctx, greenNote) {
      var el = document.getElementById('pm-seats'), ref = document.getElementById('others');
      if (!el) { if (!ref || !ref.parentNode) return; el = document.createElement('div'); el.id = 'pm-seats'; el.style.cssText = 'display:flex;flex-direction:column;gap:2px;align-items:flex-end'; ref.parentNode.insertBefore(el, ref.nextSibling); }
      var chip = function (col, name, sub, dim) { return '<span style="display:inline-flex;align-items:center;gap:4px;margin-left:6px;padding:1px 6px;border-radius:4px;background:rgba(255,255,255,.06);font-size:11px;' + (dim ? 'opacity:.45;' : '') + '"><i style="width:9px;height:9px;border-radius:2px;background:' + col + ';display:inline-block"></i><b>' + name + '</b><span style="opacity:.75">' + sub + '</span></span>'; };
      el.innerHTML = chip('#4185bf', 'Blue', 'out \u00b7 pellets', true) + chip('#4e9161', 'Green', greenNote || 'bot \u00b7 50/50', false);
    }
    /* cm-g6b: the bonus real Pac-Man game Tony plays at 13:50 ("if I capture those circles, then I can be the attacking one ...
       the ghost gets released back", grab all the points -> next level). Played on this video's own maze (the board's walls),
       with the video's ghost sprites; the power "circles" sit on the general-pellet squares. Arrows / WASD / swipe / buttons. */
    function pacman(ctx) {
      var wrap = document.getElementById('board-wrap'); if (!wrap || document.getElementById('pm-game')) return;
      var V = ctx.V, g = V.geo, b0 = CM.spec.parseSetup(V, ctx.spec.setup.fen), N = 14, grid = [], start = null, house = [], power = {};
      for (var r = 0; r < N; r++) { grid.push([]); for (var c = 0; c < N; c++) { var i = g.idx(c, r), p = b0[i], wall = !g.valid[i] || (p && p.t === '#');
        grid[r].push(wall ? 1 : 0); if (p && p.t === 'Bo' && p.c === 'w') start = [c, r]; if (p && (p.t === 'Gr' || p.t === 'Gp')) house.push([c, r]); if (p && p.t === 'Pp') power[r * N + c] = 1; } }
      var el = document.createElement('div'); el.id = 'pm-game';
      el.style.cssText = 'position:absolute;inset:0;z-index:35;background:#000;display:flex;flex-direction:column;align-items:center;gap:6px;padding:6px;color:#fff;font:700 13px/1.2 system-ui,sans-serif;touch-action:none';
      el.innerHTML = '<div style="display:flex;gap:14px;width:100%;justify-content:space-between"><span id="pm-score">SCORE 0</span><span id="pm-lv">LEVEL 1</span><span id="pm-lives"></span></div><canvas id="pm-cv" style="flex:1;min-height:0;max-width:100%;aspect-ratio:1"></canvas>' +
        '<div style="display:flex;gap:6px"><button type="button" class="btn" data-d="l">\u2190</button><button type="button" class="btn" data-d="u">\u2191</button><button type="button" class="btn" data-d="d">\u2193</button><button type="button" class="btn" data-d="r">\u2192</button><button type="button" class="btn" data-x="1">Back to chess</button></div>';
      wrap.appendChild(el);
      var cv = el.querySelector('#pm-cv'), G2 = cv.getContext('2d'), DIRS = { l: [-1, 0], r: [1, 0], u: [0, -1], d: [0, 1] };
      var imgs = ['ghost_o', 'ghost_y', 'ghost_o', 'ghost_y'].map(function (n) { var im = new Image(); im.src = 'assets/modes/sO-lD2On610/' + n + '.png'; return im; });
      var stone = new Image(); stone.src = 'assets/modes/sO-lD2On610/wall.png';
      var S = { score: 0, lives: 3, lv: 1, dots: {}, pac: null, ghosts: [], fright: 0, raf: 0, last: 0, over: false, dead: 0 };
      function open(c, r) { return c >= 0 && r >= 0 && c < N && r < N && !grid[r][c]; }
      function level() {
        S.dots = {}; for (var r = 0; r < N; r++) for (var c = 0; c < N; c++) if (!grid[r][c] && !house.some(function (h) { return h[0] === c && h[1] === r; }) && !(c === start[0] && r === start[1])) S.dots[r * N + c] = power[r * N + c] ? 2 : 1;
        reset();
      }
      function reset() {
        S.pac = { c: start[0], r: start[1], x: start[0], y: start[1], d: null, want: 'l' };
        S.ghosts = house.map(function (h, k) { return { c: h[0], r: h[1], x: h[0], y: h[1], d: null, home: h, wait: 0.6 + k * 1.2, img: imgs[k % imgs.length], eaten: 0 }; });
        S.fright = 0; S.dead = 0;
      }
      function step(o, spd, dt, choose) {   /* move along the grid at spd cells/s; at each cell centre pick the next direction */
        var left = spd * dt;
        while (left > 0) {
          if (o.d == null || (o.x === o.c && o.y === o.r)) { var nd = choose(o); if (!nd) return; o.d = nd; var v = DIRS[nd]; if (!open(o.c + v[0], o.r + v[1])) { o.d = null; return; } o.c += v[0]; o.r += v[1]; }
          var dx = o.c - o.x, dy = o.r - o.y, dist = Math.abs(dx) + Math.abs(dy);
          if (dist <= left) { o.x = o.c; o.y = o.r; left -= dist; o.d = null; } else { o.x += Math.sign(dx) * left; o.y += Math.sign(dy) * left; left = 0; }
        }
      }
      function pacChoose(o) { var w = DIRS[o.want]; if (open(o.c + w[0], o.r + w[1])) { o.face = o.want; return o.want; } var k = o.face && DIRS[o.face]; return k && open(o.c + k[0], o.r + k[1]) ? o.face : null; }
      function ghostChoose(o) {
        var back = { l: 'r', r: 'l', u: 'd', d: 'u' }, opts = Object.keys(DIRS).filter(function (d) { var v = DIRS[d]; return open(o.c + v[0], o.r + v[1]) && d !== back[o.last]; });
        if (!opts.length) opts = Object.keys(DIRS).filter(function (d) { var v = DIRS[d]; return open(o.c + v[0], o.r + v[1]); });
        var tx = o.eaten ? o.home[0] : S.pac.c, ty = o.eaten ? o.home[1] : S.pac.r, flee = S.fright > 0 && !o.eaten;
        opts.sort(function (a, b) { var da = Math.abs(o.c + DIRS[a][0] - tx) + Math.abs(o.r + DIRS[a][1] - ty), db = Math.abs(o.c + DIRS[b][0] - tx) + Math.abs(o.r + DIRS[b][1] - ty); return flee ? db - da : da - db; });
        var d = !o.eaten && Math.random() < 0.3 ? opts[Math.floor(Math.random() * opts.length)] : opts[0]; o.last = d; return d;
      }
      function hud() { el.querySelector('#pm-score').textContent = 'SCORE ' + S.score; el.querySelector('#pm-lv').textContent = 'LEVEL ' + S.lv; el.querySelector('#pm-lives').textContent = '\u25D6'.repeat(Math.max(0, S.lives)); }
      function update(dt) {
        if (S.over) return; if (S.dead > 0) { S.dead -= dt; if (S.dead <= 0) { if (S.lives <= 0) { S.over = true; } else reset(); } return; }
        var spd = 4.2 + S.lv * 0.4; step(S.pac, spd, dt, pacChoose);
        var key = S.pac.r * N + S.pac.c; if (Math.abs(S.pac.x - S.pac.c) + Math.abs(S.pac.y - S.pac.r) < 0.5 && S.dots[key]) {
          if (S.dots[key] === 2) { S.fright = 7; S.score += 50; S.ghosts.forEach(function (o) { o.last = { l: 'r', r: 'l', u: 'd', d: 'u' }[o.last]; }); CM.sound.play('notify'); } else { S.score += 10; }
          delete S.dots[key]; if (!Object.keys(S.dots).length) { S.lv++; CM.sound.play('game-start'); level(); } }
        if (S.fright > 0) S.fright -= dt;
        S.ghosts.forEach(function (o) {
          if (o.wait > 0) { o.wait -= dt; return; }
          step(o, o.eaten ? 8 : S.fright > 0 ? 2.6 : 3.4 + S.lv * 0.35, dt, ghostChoose);
          if (o.eaten && o.c === o.home[0] && o.r === o.home[1] && o.x === o.c && o.y === o.r) { o.eaten = 0; o.wait = 1.5; }   /* released back into the wild */
          if (!o.eaten && Math.abs(o.x - S.pac.x) + Math.abs(o.y - S.pac.y) < 0.7) {
            if (S.fright > 0) { o.eaten = 1; S.score += 200; CM.sound.play('capture'); }
            else { S.lives--; S.dead = 1.4; CM.sound.play('game-end'); }
          }
        });
        hud();
      }
      function draw(t) {
        var w = cv.clientWidth, dpr = window.devicePixelRatio || 1; if (cv.width !== Math.round(w * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(w * dpr); }
        var u = cv.width / N; G2.fillStyle = '#262522'; G2.fillRect(0, 0, cv.width, cv.height);
        for (var r = 0; r < N; r++) for (var c = 0; c < N; c++) {
          var i = g.idx(c, r); if (!g.valid[i]) { G2.fillStyle = '#000'; G2.fillRect(c * u, r * u, u, u); continue; }
          if (grid[r][c]) { if (stone.complete && stone.naturalWidth) G2.drawImage(stone, c * u, r * u, u + 0.5, u + 0.5); else { G2.fillStyle = '#9a9a96'; G2.fillRect(c * u, r * u, u, u); } continue; }
          var dv = S.dots[r * N + c]; if (dv) { G2.fillStyle = '#ffd9b8'; G2.beginPath(); G2.arc((c + 0.5) * u, (r + 0.5) * u, dv === 2 ? u * (0.24 + 0.04 * Math.sin(t / 150)) : u * 0.09, 0, 7); G2.fill(); }
        }
        S.ghosts.forEach(function (o) {
          var x = o.x * u, y = o.y * u;
          if (o.eaten) { G2.fillStyle = '#fff'; [0.33, 0.67].forEach(function (k) { G2.beginPath(); G2.arc(x + u * k, y + u * 0.45, u * 0.12, 0, 7); G2.fill(); }); return; }
          if (S.fright > 0) { G2.save(); G2.filter = (S.fright < 2 && Math.floor(t / 200) % 2) ? 'grayscale(1) brightness(2)' : 'hue-rotate(200deg) saturate(2)'; }
          if (o.img.complete && o.img.naturalWidth) G2.drawImage(o.img, x + u * 0.05, y + u * 0.05, u * 0.9, u * 0.9);
          if (S.fright > 0) G2.restore();
        });
        var p = S.pac, mouth = S.dead > 0 ? Math.min(1, 1.4 - S.dead) * Math.PI : (0.25 + 0.2 * Math.sin(t / 60)) * (p.d ? 1 : 0.4), ang = { r: 0, d: Math.PI / 2, l: Math.PI, u: -Math.PI / 2 }[p.face || 'l'];
        G2.fillStyle = '#ffd700'; G2.beginPath(); G2.moveTo((p.x + 0.5) * u, (p.y + 0.5) * u); G2.arc((p.x + 0.5) * u, (p.y + 0.5) * u, u * 0.44, ang + mouth, ang + Math.PI * 2 - mouth); G2.closePath(); G2.fill();
        if (S.over) { G2.fillStyle = 'rgba(0,0,0,.6)'; G2.fillRect(0, 0, cv.width, cv.height); G2.fillStyle = '#ffd700'; G2.font = 'bold ' + Math.round(u * 1.1) + 'px system-ui'; G2.textAlign = 'center'; G2.fillText('GAME OVER', cv.width / 2, cv.height / 2); G2.font = Math.round(u * 0.6) + 'px system-ui'; G2.fillText('tap an arrow to play again', cv.width / 2, cv.height / 2 + u); }
      }
      function frame(t) { if (!el.isConnected) return; var GC = ctx.game && ctx.game.clock; if (GC) GC.t = performance.now();   /* the chess clocks wait while the bonus game is open */ var dt = Math.min(0.05, ((t - (S.last || t)) / 1000)); S.last = t; update(dt); draw(t); S.raf = requestAnimationFrame(frame); }
      function want(d) { if (S.over) { S.over = false; S.score = 0; S.lives = 3; S.lv = 1; level(); } S.pac.want = d; if (!S.pac.face) S.pac.face = d; }
      function key(e) { var k = { ArrowLeft: 'l', KeyA: 'l', ArrowRight: 'r', KeyD: 'r', ArrowUp: 'u', KeyW: 'u', ArrowDown: 'd', KeyS: 'd' }[e.code]; if (k) { e.preventDefault(); e.stopPropagation(); want(k); } }
      function quit() { cancelAnimationFrame(S.raf); document.removeEventListener('keydown', key, true); el.remove(); }
      var sx = 0, sy = 0; cv.addEventListener('pointerdown', function (e) { sx = e.clientX; sy = e.clientY; });
      cv.addEventListener('pointerup', function (e) { var dx = e.clientX - sx, dy = e.clientY - sy; if (Math.max(Math.abs(dx), Math.abs(dy)) < 12) return; want(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'r' : 'l') : (dy > 0 ? 'd' : 'u')); });
      el.addEventListener('click', function (e) { var b = e.target.closest('[data-d],[data-x]'); if (!b) return; if (b.dataset.x) quit(); else want(b.dataset.d); });
      document.addEventListener('keydown', key, true); pacman.quit = quit;
      level(); hud(); S.raf = requestAnimationFrame(frame);
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
      ctx.toast(aggressive ? 'Green plays an attacking move.' : 'Green plays a random move.', 1200); seats(ctx, aggressive ? 'attacking move' : 'random move');
      ctx.refresh();
    }
    return {
      init: function () { if (!document.getElementById('pac-css')) { var s = document.createElement('style'); s.id = 'pac-css'; s.textContent = '.pac-r .pc{filter:sepia(1) saturate(6) hue-rotate(-38deg) brightness(.9)}.pac-y .pc{filter:sepia(1) saturate(7) hue-rotate(5deg) brightness(1.05)}'; document.head.appendChild(s); } },
      onStart: function (ctx) {
        seats(ctx);
        var old = document.getElementById('pm-btn'); if (old) old.remove(); var stl = document.getElementById('status');
        if (stl && stl.parentNode) { var bt = document.createElement('button'); bt.id = 'pm-btn'; bt.type = 'button'; bt.className = 'btn'; bt.textContent = 'Bonus: play one actual game of Pac-Man'; bt.style.cssText = 'display:block;margin:6px auto 0'; bt.onclick = function () { pacman(ctx); }; stl.parentNode.insertBefore(bt, stl.nextSibling); }
      },
      onExit: function () { if (pacman.quit) pacman.quit(); var b = document.getElementById('pm-btn'); if (b) b.remove(); var o = document.getElementById('pm-seats'); if (o) o.remove(); },
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
        return 'Red (you) ' + (s.w || 0) + ' · Yellow ' + (s.b || 0) + ' · points left ' + left(ctx.V, ctx.state) + ' · checks left: Red ' + Math.max(0, 3 - (c.w || 0)) + ', Yellow ' + Math.max(0, 3 - (c.b || 0)); }
    };
  })(),
  source: { research: 'research/modes/sO-lD2On610.json', confidence: 'high', notes: 'Rules from the full transcript (re-run 2026-11-25). cm-recheck3 2026-11-25: the whole start position re-read cell by cell from the full-resolution still i.ytimg.com/vi/sO-lD2On610/maxres1.jpg (14x14, 48 px cells): walls, ghost house and Bobs were right; the 8 generals (+5, pawn icon) sit at (row from the top, col) (2,5) (2,8) (3,0) (3,13) (9,6) (9,7) (11,6) (11,7), every other pellet is a dabbaba (+1) - fixed. Still inferred: green pawns stepping one square orthogonally. Blue/Green seats are chips in the top bar (Red/Yellow keep the 3+2 clocks; Blue is out, Green is the bot seat with no clock). Bonus Pac-Man (13:50) built on the board maze with the ghost sprites.' }
});
