/* Can I BEAT Jupiter 2011 Chess? (I Turned the Jupiter 2011 Incident Into a Chess Variant). Escort the three astronauts
   Speed, Creek and Queso across a spaceship-shaped board to the escape pod while a swarm of red "Keys", every one moving
   like a queen, hunts them. Each turn only a couple of random Keys move, each one some distance toward the astronaut
   nearest to it, and a chosen Key that sees an astronaut takes it, so a check is a gamble, not a sure loss.
   Sources: research/modes/Mg2Upjjo2yg.json; transcript 0:01 (keys pursue three astronauts, get at least one home through
   the escape pod), 0:15 (spaceship map as a chessboard, white pieces escort), 0:35 (every key moves like a queen), 0:56
   (only a couple of keys move per turn, a game of probability), 3:11 (three keys out of 30 ~ 1 in 10), 4:00 (they move
   some distance closer to whatever astronaut is nearest), 7:01 (astronauts capture keys), 11:30 + 12:14 (the pod has room
   for several astronauts, scoot over to make room), 12:55 (the longest rank leads to the pod), 14:05 (pod launches);
   frames hq1-hq3 (rooms joined by corridors on a brown board over dark grey, red F-shaped Keys, magenta arrows for key
   moves, red square on an astronaut in check).
   Map + start position: traced square by square from the video at 0:00 (research/ref/fin2-jupiter/: 45x23 Skeld mask,
   the 3 grey pod squares in the nose, every white piece, astronaut and the 30 Keys on their video squares; plain CSS
   squares, lichess brown over a #292826 void, no room names, as in the video). Inferred: 1-3 keys per turn, the Launch
   button, astronauts move like kings, keys never enter the pod. Art from the video: key.png = the thumbnail's red F Key
   cut out; speed/creek/queso.png = greyscale head-and-suit cutouts of the thumbnail portraits (the in-game sprites are
   the same photos in greyscale, maxres1/maxres2). */
(function () {
  var ID = 'Mg2Upjjo2yg', A = 'assets/modes/' + ID + '/';
  var ASTRO = { Speed: 1, Creek: 1, Queso: 1 };
  var NAMES = ['Queso', 'Speed', 'Creek'];
  /* The Skeld board traced square by square from the video at 0:00 (research/ref/fin2-jupiter/skeld_mask_45x23.txt,
     skeld_mask_vs_video.jpg): 45x23, x = void, the escape pod = the 3 grey squares in the nose (row 11, cols 42-44). */
  var MASK = [
    'xxxxxxxxxxxxxx........xxxxxxxxxxxxxxxxxxxxxxx',
    'xxxxxxxxxxxxx..........xxxxxxxxxxxxxxxxxxxxxx',
    'xxx.....xxxx............xxxxx...xxxxxxxxxxxxx',
    'xxx.....xxxx.............xxxx....xxxxxxxxxxxx',
    'xxx...............................xxxxxxxxxxx',
    'xxx.....xx.x.............xxxx.....xxxxxxxxxxx',
    'xxxx.xxxxx.x.............xxxx....xxxxxxxxxxxx',
    'x.xx.xxxxx.xx...........xxxxxxxx.xxxxxxxxxxxx',
    '..xx.xx..x...x.........xxx...xxx.xxxxx..xxxxx',
    '..xx.xx..x....xxxxx.xxxxxx..........xx...xxxx',
    '.........x.....xxxx.x....xxxxxxxxxx.......xxx',
    '..xx.xx..x.....xxxx.......xxxxxxxxx.xx.......',
    '..xx.xx..xxxxxxxxxx.x......xxxxxx...xx...xxxx',
    '..xx.xxxxxxxxxxxxxx.x.......xx....xxxxxxxxxxx',
    'x.xx.xxxx...xxxx....x......xxx.xxxxxxxxxxxxxx',
    'xxxx.xxxx....xx.....x.....x....xxxxxxxxxxxxxx',
    'xxx.....x.xxxx......xxxxxx.....xxxxxxxxxxxxxx',
    'xxx.....x.xxxx......xxxxxx.....xxxxxxxxxxxxxx',
    'xxx.....x.xxxx......xxxxxx.....xxxxxxxxxxxxxx',
    'xxx............................xxxxxxxxxxxxxx',
    'xxx.....xxxxxx......x...xx....xxxxxxxxxxxxxxx',
    'xxxxxxxxxxxxxx......x....xxxxxxxxxxxxxxxxxxxx',
    'xxxxxxxxxxxxxx......x....xxxxxxxxxxxxxxxxxxxx'
  ];
  var POD = null, CACHE = { st: null, att: null, lines: null };
  var UIS = { lines: false, map: false, focus: null, hud: null };
  var ROOMS = [];   /* the video's board has no room names drawn on it (README in research/ref/fin2-jupiter) */
  var LABEL = null;
  function labelAt(g, i) { if (!LABEL) { LABEL = {}; ROOMS.forEach(function (r) { LABEL[g.idx(r[1], r[2])] = r[0]; }); } return LABEL[i]; }
  var DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];

  function pod(g) { if (!POD) POD = [g.idx(42, 11), g.idx(43, 11), g.idx(44, 11)]; return POD; }
  function isPod(g, i) { var p = pod(g); return i === p[0] || i === p[1] || i === p[2]; }
  function isAstro(p) { return !!(p && p.c === 'w' && ASTRO[p.t]); }
  function isKey(p) { return !!(p && p.c === 'b' && p.t === 'Key'); }
  /* squares a Key on i can slide to (queen rays; holes and pieces stop it; the pod is sealed to keys) */
  function keyRays(g, b, i) {
    var out = [];
    DIRS.forEach(function (d) {
      var j = i;
      for (;;) { j = g.step(j, d[0], d[1]); if (j < 0 || isPod(g, j)) break; var q = b[j]; if (q) { if (q.c === 'w') out.push(j); break; } out.push(j); }
    });
    return out;
  }
  /* attackers[sq] = number of keys that see sq (any square) */
  function attackMap(g, b) {
    var att = {};
    for (var i = 0; i < b.length; i++) if (isKey(b[i])) {
      DIRS.forEach(function (d) { var j = i; for (;;) { j = g.step(j, d[0], d[1]); if (j < 0 || isPod(g, j)) break; att[j] = (att[j] || 0) + 1; if (b[j]) break; } });
    }
    return att;
  }
  function cached(ctx) { if (CACHE.st !== ctx.state) { CACHE.st = ctx.state; CACHE.att = attackMap(ctx.geo, ctx.state.b); } return CACHE.att; }
  function astros(g, b) { var r = []; for (var i = 0; i < b.length; i++) if (isAstro(b[i])) r.push(i); return r; }
  /* walking distance (king steps through the ship) to the nearest astronaut still outside the pod */
  function distMap(g, b) {
    var D = new Array(b.length), q = [];
    astros(g, b).forEach(function (i) { if (!isPod(g, i)) { D[i] = 0; q.push(i); } });
    for (var h = 0; h < q.length; h++) {
      var i = q[h];
      DIRS.forEach(function (d) { var j = g.step(i, d[0], d[1]); if (j >= 0 && D[j] == null && !isPod(g, j)) { D[j] = D[i] + 1; q.push(j); } });
    }
    return D;
  }
  /* what one Key does when it is picked: take an astronaut it sees, else step some distance closer to the nearest one */
  function keyChoice(ctx, b, i, D) {
    var g = ctx.geo, to = keyRays(g, b, i); if (!to.length) return null;
    var hit = to.filter(function (j) { return isAstro(b[j]); });
    if (hit.length) return { f: i, t: ctx.pick(hit) };
    var here = D[i] == null ? 99 : D[i];
    var closer = to.filter(function (j) { return D[j] != null && D[j] < here; });
    return { f: i, t: ctx.pick(closer.length ? closer : to) };
  }
  function pickKeys(ctx, b, n) {
    var keys = []; for (var i = 0; i < b.length; i++) if (isKey(b[i])) keys.push(i);
    var out = []; while (keys.length && out.length < n) out.push(keys.splice(ctx.random(keys.length), 1)[0]);
    return out;
  }
  function wait(ctx, ms) { return new Promise(function (r) { ctx.after(ms, r); }); }
  function counts(g, b) {
    var on = 0, aboard = 0, keys = 0, names = {};
    for (var i = 0; i < b.length; i++) { var p = b[i]; if (isAstro(p)) { on++; names[p.t] = i; if (isPod(g, i)) aboard++; } else if (isKey(p)) keys++; }
    return { on: on, aboard: aboard, keys: keys, at: names };
  }
  function caughtMsg(ctx, p) { ctx.fx({ type: 'flash', color: '#d22', opacity: 0.28, hold: 0.1, duration_ms: 420, at: 'board' }); ctx.toast(p.t + ' was caught by a Key!', 2200); }

  /* ---------- HUD row (shared .cm-hud / .cm-stat / .cm-chip classes) ---------- */
  function hud(ctx) {
    var col = document.getElementById('board-col'); if (!col) return;
    var el = document.getElementById('nv-hud');
    if (!el) {
      el = document.createElement('div'); el.id = 'nv-hud'; el.className = 'cm-hud';
      var bottom = document.getElementById('card-bottom'); col.insertBefore(el, bottom && bottom.parentNode === col ? bottom.nextSibling : null);
      el.addEventListener('click', function (e) {
        var t = e.target.closest('[data-act]'); if (!t) return;
        var act = t.getAttribute('data-act');
        if (act === 'lines') { UIS.lines = !UIS.lines; ctx.refresh(); }
        else if (act === 'map') { UIS.map = !UIS.map; if (!(CM.gameUI.zoom && CM.gameUI.zoom(UIS.map ? 'fit' : 'reset'))) CM.gameUI.setViewport(UIS.map ? null : ctx.spec.board.viewport); ctx.refresh(); }   /* Map = the universal zoom's whole-board view */
        else if (act === 'launch') { var c = counts(ctx.geo, ctx.state.b); if (c.aboard && !ctx.over) { ctx.fx({ type: 'flash', color: '#fff6d0', opacity: 0.35, hold: 0.15, duration_ms: 600, at: 'board' }); ctx.endGame('player', 'launching the pod with ' + c.aboard + ' of 3 astronauts aboard'); } }
        else if (act === 'focus') { var sq = +t.getAttribute('data-sq'); if (sq >= 0) { UIS.focus = sq; ctx.refresh(); } }
      });
      UIS.hud = el; CM.gameUI.layout();
    }
    var g = ctx.geo, b = ctx.state.b, c = counts(g, b), att = cached(ctx), h = '';
    NAMES.forEach(function (n) {
      var i = c.at[n], st;
      if (i == null) st = '<small>lost</small>'; else if (isPod(g, i)) st = '<small>aboard</small>';
      else if (att[i]) st = '<small style="color:#ff8a80">in check x' + att[i] + '</small>'; else st = '<small>safe</small>';
      h += '<span class="cm-stat" data-act="focus" data-sq="' + (i == null ? -1 : i) + '" role="button" style="cursor:pointer' + (i == null ? ';opacity:.45' : '') + '"><img src="' + A + n.toLowerCase() + '.png" alt="">' + n + ' ' + st + '</span>';
    });
    h += '<span class="cm-stat"><img src="' + A + 'key.png" alt="">' + c.keys + ' <small>keys</small></span>';
    h += '<span class="cm-hud__grow"></span>';
    h += '<button type="button" class="cm-chip' + (UIS.lines ? ' is-on' : '') + '" data-act="lines">Key lines</button>';
    if (window.innerWidth < 900) h += '<button type="button" class="cm-chip' + (UIS.map ? ' is-on' : '') + '" data-act="map">Map</button>';
    if (c.aboard && c.aboard < c.on) h += '<button type="button" class="cm-chip is-on" data-act="launch">Launch pod</button>';
    if (el._h !== h) { el.innerHTML = h; el._h = h; }
  }

  CM.mode({
    id: ID,
    title: 'Can I BEAT Jupiter 2011 Chess?',
    name: 'Jupiter 2011 Chess',
    category: 'Variants & Games',
    description: 'The board is a spaceship. Your white pieces escort three astronauts, Speed, Creek and Queso (they move and capture like kings), to the escape pod in the nose of the ship, past Navigation. The board is the Skeld: Reactor and the engines on the left, Cafeteria in the middle, Navigation on the right. The red Keys all move like queens and hunt them: each turn only one to three random Keys move, each one toward the astronaut nearest to it, and a Key that sees an astronaut when it is picked takes him. Keys cannot enter the pod.',
    how_to_win: 'Get at least one astronaut onto the escape pod: it launches when everyone still alive is aboard, or press Launch pod. Lose all three and the Keys win.',
    player_side: 'white',
    player: { name: 'You', rating: null, avatar: 'assets/avatars/iwantcheckmate.png' },
    opponent: { name: 'The Keys', rating: null, avatar: A + 'key.png', tagline: 'Every Key moves like a queen, but only a couple move each turn.' },
    board: { files: 45, ranks: 23, mask: MASK, viewport: { files: 45, ranks: 23, mobile: { files: 10, ranks: 10 } } },
    theme: { light: '#f0d9b5', dark: '#b58863', background: '#292826' },   /* video: lichess brown squares over a #292826 void */
    pieces: {
      Speed: { name: 'Speed', san: 'Sp', moves: 'K', value: 900, img: A + 'speed.png' },
      Creek: { name: 'Creek', san: 'Cr', moves: 'K', value: 900, img: A + 'creek.png' },
      Queso: { name: 'Queso', san: 'Qu', moves: 'K', value: 900, img: A + 'queso.png' },
      Key: { name: 'Key', san: 'Ky', moves: 'Q', value: 300, img: A + 'key.png' }
    },
    setup: { turn: 'w' },
    rules: { check: 'none', castling: false, enPassant: false, drawPlies: 100000, stalemate: 'loss', promotion: { auto: 'Q' } },
    bot: { engine: 'search', style: 'best', depth: 1, time_ms: 120, min_ms: 380 },
    params: { keyMs: 420 },
    sounds: { 'game-start': 'assets/modes/Mg2Upjjo2yg/j11_start.wav', 'victory': 'assets/modes/Mg2Upjjo2yg/j11_launch.wav', 'defeat': 'assets/modes/Mg2Upjjo2yg/j11_lost.wav', 'j11_key': 'assets/modes/Mg2Upjjo2yg/j11_key.wav', 'j11_catch': 'assets/modes/Mg2Upjjo2yg/j11_catch.wav', 'j11_spotted': 'assets/modes/Mg2Upjjo2yg/j11_spotted.wav' },   /* v6 per-mode sound set (tools/sfx/modes_v6.py, wire_v6.py) */
    messages: { win_title: 'Escape pod launched!', loss: 'the Keys caught every astronaut', loss_title: 'Mission failed' },
    hooks: {
      setup: function (ctx) {
        var g = ctx.geo; POD = null; LABEL = null; UIS.focus = null; UIS.map = false; CACHE.st = null;
        var at = function (c, r) { return g.idx(c, r); };
        /* the start position read square by square from the video at 0:00 (research/ref/fin2-jupiter/README.md, [row, col]) */
        var rc = function (t, c, l) { l.forEach(function (q) { ctx.spawn(t, c, at(q[1], q[0])); }); };
        rc('Creek', 'w', [[2, 13]]); rc('Speed', 'w', [[6, 4]]); rc('Queso', 'w', [[19, 30]]);
        rc('N', 'w', [[0, 14], [4, 20], [8, 16], [16, 18]]); rc('R', 'w', [[2, 7], [6, 17], [12, 25], [13, 21]]);
        rc('B', 'w', [[10, 24], [14, 1], [16, 5], [16, 15]]); rc('Q', 'w', [[8, 17], [21, 24]]);
        rc('P', 'w', [[2, 14], [3, 5], [3, 12], [3, 19], [3, 29], [4, 22], [5, 4], [5, 15], [8, 1], [9, 0], [9, 27], [17, 7], [17, 14], [17, 19], [19, 5], [19, 9]]);
        /* the 30 Keys (transcript 3:11 "three different keys out of 30") */
        rc('Key', 'b', [[2, 17], [2, 20], [3, 6], [4, 12], [4, 32], [5, 17], [6, 14], [6, 22], [7, 14], [8, 21], [8, 22], [9, 11], [9, 33], [10, 40], [11, 4],
          [11, 23], [13, 31], [14, 9], [14, 11], [15, 22], [16, 9], [16, 17], [16, 28], [16, 30], [17, 28], [18, 6], [18, 26], [19, 3], [20, 23], [22, 23]]);
        var A0 = astros(g, ctx.state.b);
        UIS.focus = A0[2];
      },
      onStart: function (ctx) { hud(ctx); },
      onExit: function () { var el = document.getElementById('nv-hud'); if (el) el.remove(); UIS.hud = null; if (UIS.map) { UIS.map = false; } },
      onGameOver: function (ctx) { hud(ctx); },
      /* rule hooks: keys never enter the pod; only astronauts board it, and once aboard they stay aboard */
      filterMoves: function (V, st, legal) {
        var g = V.geo;
        return legal.filter(function (m) {
          var p = st.b[m.f];
          if (isPod(g, m.f)) return isPod(g, m.t);
          if (isPod(g, m.t)) return isAstro(p);
          return true;
        });
      },
      checkWin: function (V, st) {
        var c = counts(V.geo, st.b);
        if (!c.on) return { w: 'b', why: 'catching every astronaut' };
        if (c.aboard === c.on) return { w: 'w', why: 'getting ' + c.aboard + ' of 3 astronauts onto the escape pod' };
        if (!c.keys) return { w: 'w', why: 'destroying every Key with ' + c.on + ' of 3 astronauts alive' };
        return null;
      },
      evaluate: function () { return 0; },
      /* the Keys' turn: the engine plays the first picked Key, afterMove plays the rest */
      botPick: function (ctx, ranked) {
        var b = ctx.state.b, D = distMap(ctx.geo, b), r = ctx.random(10);
        var n = 1 + (r < 6 ? 1 : 0) + (r < 2 ? 1 : 0);
        var keys = pickKeys(ctx, b, n * 3), first = null;
        ctx.state.x = ctx.state.x || {};
        UIS.extra = n - 1;
        for (var k = 0; k < keys.length && !first; k++) {
          var ch = keyChoice(ctx, b, keys[k], D); if (!ch) continue;
          first = ranked.filter(function (e) { var m = e.m || e; return m.f === ch.f && m.t === ch.t; })[0];
        }
        return first ? (first.m || first) : null;
      },
      afterMove: function (ctx, m, info) {
        var g = ctx.geo;
        if (info.by === 'player') { UIS.focus = info.to; return; }
        if (info.by !== 'bot') return;
        ctx.fx({ type: 'arrow', from: info.from, to: info.to, color: 'rgba(222, 60, 200, 0.85)', duration_ms: 900 });
        if (info.captured && ASTRO[info.captured.t]) caughtMsg(ctx, info.captured);
        var extra = UIS.extra || 0; UIS.extra = 0;
        var chain = Promise.resolve(), moved = { }; moved[info.to] = 1;
        for (var k = 0; k < extra; k++) chain = chain.then(function () {
          if (ctx.over) return;
          var b = ctx.state.b, D = distMap(g, b);
          var keys = pickKeys(ctx, b, 40).filter(function (i) { return !moved[i]; }), ch = null;
          for (var j = 0; j < keys.length && !ch; j++) ch = keyChoice(ctx, b, keys[j], D);
          if (!ch) return;
          return wait(ctx, ctx.params.keyMs).then(function () {
            if (ctx.over) return;
            var victim = ctx.at(ch.t);
            ctx.fx({ type: 'arrow', from: ch.f, to: ch.t, color: 'rgba(222, 60, 200, 0.85)', duration_ms: 900 });
            ctx.move(ch.f, ch.t); moved[ch.t] = 1;
            ctx.sound(victim ? 'j11_catch' : 'j11_key');
            if (isAstro(victim)) caughtMsg(ctx, victim);
            ctx.refresh();
          });
        });
        return chain.then(function () {
          if (ctx.over) return;
          var b = ctx.state.b, att = cached(ctx), hot = astros(g, b).filter(function (i) { return att[i] && !isPod(g, i); });
          if (hot.length) { UIS.focus = hot[0]; ctx.sound('j11_spotted'); }
          ctx.refresh();
        });
      },
      camera: function (ctx) {
        var b = ctx.state.b;
        if (UIS.focus != null && b[UIS.focus] && b[UIS.focus].c === 'w') return UIS.focus;
        var a = astros(ctx.geo, b); return a.length ? a[0] : UIS.focus;
      },
      decorate: function (ctx, i, p) {
        var g = ctx.geo, P = pod(g), html = '', lab = labelAt(g, i);
        if (lab) html += '<span class="sq-label" style="left:3%;top:2%;transform:none;font-size:calc(var(--sqpx,40px)*.22);font-weight:700;color:rgba(40,24,10,.5);white-space:nowrap;letter-spacing:.02em">' + lab + '</span>';
        if (isPod(g, i)) html += '<span class="sq-tint" style="background:' + (i === P[0] ? '#84848c' : i === P[1] ? '#b3b8be' : '#969ba1') + '"></span>';   /* the pod: three plain grey squares (video 0:00) */
        var att = cached(ctx);
        if (isAstro(p) && att[i] && !isPod(g, i)) html += '<span class="sq-tint" style="background:rgba(214, 38, 38, 0.72)"></span>';
        else if (UIS.lines && att[i] && !isPod(g, i)) html += '<span class="sq-tint" style="background:rgba(214, 38, 38, 0.26)"></span>';
        return html ? { html: html } : null;
      },
      status: function (ctx) {
        hud(ctx);
        var g = ctx.geo, b = ctx.state.b, c = counts(g, b), att = cached(ctx);
        var hot = astros(g, b).filter(function (i) { return att[i] && !isPod(g, i); }).map(function (i) { return b[i].t; });
        if (ctx.over) return c.aboard + ' of 3 astronauts aboard the escape pod';
        if (hot.length) return hot.join(' and ') + ' in check: a Key that moves next could take ' + (hot.length > 1 ? 'them' : 'him') + '.';
        return c.aboard ? c.aboard + ' aboard the pod. Bring the rest through Navigation, or launch.' : 'Escort an astronaut to the escape pod in the nose of the ship, past Navigation. The board is the Skeld: Reactor and the engines on the left, Cafeteria in the middle, Navigation on the right.';
      }
    },
    source: { research: 'research/modes/' + ID + '.json', confidence: 'medium',
      notes: 'Rules from the transcript (analyze_video, 3710 words) + frames hq1/hq2/hq3.jpg and maxresdefault.jpg. Map and start position traced from the video frame at 0:00 (research/ref/fin2-jupiter/: 45x23 mask, pod = 3 grey squares at row 11 cols 42-44, 16 pawns 4 knights 4 rooks 4 bishops 2 queens, the 3 astronauts and 30 Keys on their video squares). Art from the video thumbnail: key.png (the red F Key cut out), speed/creek/queso.png (greyscale portrait cutouts, as the in-game sprites); see assets/modes/Mg2Upjjo2yg/source.notes (sources).' }
  });
})();
