/* Can I BEAT Soko Chess?  Soko Chess (Steam, Daisy Games): Sokoban with chess pieces. Rebuilt s6-soko 2026-11-26 from the
   video transcript (full read) and the two readable frames (research/modes/7lEglazTlo8.json key s5_soko_research_2026_11_26).
   RULES (same code in tools/soko_bfs_verify.mjs, which proves every level solvable):
   - Tap a white piece: it moves like its chess piece (rook orthogonal slide, bishop diagonal slide, white pawn one step up).
     Holes (no tile) block. Moving onto a black piece PUSHES it one square on in the same direction (pawns push only
     diagonally up) when that square is an empty tile; the mover takes its old square. No pushing off the board or into
     another piece. A black piece you can push from the selected piece turns YELLOW.
   - Black pieces only move to capture: black pawns capture diagonally DOWN the screen, black rooks along clear lines. The
     capturer moves onto the captured square (that is how sacrifices put a black piece on its target). After every move all
     possible captures happen, lowest priority number first (badge bottom-right); unnumbered pieces go last.
   - A target is a small red pawn/rook icon in the tile's corner; it turns green once a black piece of that type stands on it.
     The level is won when every target is filled (even if that last capture took your last piece). Losing every white piece
     or having no move left restarts the level. Unlimited undo; restart any time; levels unlock in order (localStorage).
   LEVELS (names from the video): L4 Cunning Pawns tile map + targets exact from frame maxres1 (start rebuilt by search so the
   frame's mid-solve position is on a solution path), L9 Sacrifice All exact from frame maxres2 (pieces, priorities 1-4,
   targets). The game's other layouts are not published anywhere readable (checked Steam guides, reviews, YouTube
   2026-11-26), so L1-3, 5-8 and 10 are new layouts built to the transcript's description of each level. Art: flat pieces
   and target icons drawn for this project (tools/soko_art.py). */
(function () {
  'use strict';
  /* ---- Soko rule core (pure; the mode hooks AND tools/soko_bfs_verify.mjs both run exactly this code) ----
     b = board array (index r * W + c, r = 0 top), each cell null or {t, c, n?}; t '#' = no tile.
     White: R rook, B bishop, WP pawn. Black: SP pawn, SR rook; n = capture priority (1 captures first). */
  var ORTH = [[1, 0], [-1, 0], [0, 1], [0, -1]], DIAG = [[1, -1], [-1, -1], [1, 1], [-1, 1]];
  var CORE = {
    W: 9, H: 7,
    step: function (i, dc, dr) { var W = CORE.W, c = i % W + dc, r = Math.floor(i / W) + dr; return (c < 0 || c >= W || r < 0 || r >= CORE.H) ? -1 : r * W + c; },
    tile: function (b, j) { return j >= 0 && !(b[j] && b[j].t === '#'); },
    black: function (p) { return !!p && p.c === 'b'; },
    /* white piece on i: [{t, push}] (push = square the pushed black piece lands on) */
    gen: function (b, i) {
      var p = b[i], out = []; if (!p || p.c !== 'w') return out;
      var pushAt = function (j, d) { var k = CORE.step(j, d[0], d[1]); if (CORE.tile(b, k) && !b[k]) out.push({ t: j, push: k }); };
      if (p.t === 'WP') {                       /* pawn: one step up to an empty tile; pushes only diagonally up */
        var f = CORE.step(i, 0, -1); if (CORE.tile(b, f) && !b[f]) out.push({ t: f, push: null });
        DIAG.slice(0, 2).forEach(function (d) { var j = CORE.step(i, d[0], d[1]); if (CORE.tile(b, j) && CORE.black(b[j])) pushAt(j, d); });
        return out;
      }
      (p.t === 'R' ? ORTH : p.t === 'B' ? DIAG : ORTH.concat(DIAG)).forEach(function (d) {
        var j = i;
        while (true) {
          j = CORE.step(j, d[0], d[1]); if (!CORE.tile(b, j)) break;
          if (!b[j]) { out.push({ t: j, push: null }); continue; }
          if (CORE.black(b[j])) pushAt(j, d);
          break;
        }
      });
      return out;
    },
    /* squares the black piece on i can capture right now */
    attacks: function (b, i) {
      var p = b[i], out = [];
      if (p.t === 'SP') DIAG.slice(2).forEach(function (d) { var j = CORE.step(i, d[0], d[1]); if (CORE.tile(b, j) && b[j] && b[j].c === 'w') out.push(j); });
      else if (p.t === 'SR') ORTH.forEach(function (d) { var j = i; while (true) { j = CORE.step(j, d[0], d[1]); if (!CORE.tile(b, j)) break; if (b[j]) { if (b[j].c === 'w') out.push(j); break; } } });
      return out;
    },
    /* the move itself (mutates b): mover lands on t, a pushed piece lands on push */
    play: function (b, f, mv) { if (mv.push != null) b[mv.push] = b[mv.t]; b[mv.t] = b[f]; b[f] = null; },
    /* black answers: while any black piece attacks a white piece, the lowest priority number (unnumbered last,
       then reading order) captures and moves onto that square. Returns [{f, t}] in order. */
    resolve: function (b) {
      var caps = [];
      for (var guard = 0; guard < 64; guard++) {
        var best = -1, bt = -1, bn = 1e9;
        for (var i = 0; i < b.length; i++) {
          if (!CORE.black(b[i])) continue; var a = CORE.attacks(b, i); if (!a.length) continue;
          var n = b[i].n || 99; if (n < bn) { bn = n; best = i; bt = a[0]; }
        }
        if (best < 0) break;
        b[bt] = b[best]; b[best] = null; caps.push({ f: best, t: bt });
      }
      return caps;
    },
    won: function (b, targets) { return targets.every(function (g) { return b[g.i] && b[g.i].c === 'b' && b[g.i].t === g.t; }); },
    whites: function (b) { var n = 0; for (var i = 0; i < b.length; i++) if (b[i] && b[i].c === 'w') n++; return n; },
    /* level -> {b, targets}; rows: 7 strings of 9 chars ('#' no tile, '.' tile, R B P white, p r black);
       pri: {sq: n}; targets: 'd4:p e3:r' */
    sq: function (s) { return (CORE.H - +s.slice(1)) * CORE.W + 'abcdefghi'.indexOf(s[0]); },
    build: function (L) {
      var b = [], T = { R: 'R', B: 'B', P: 'WP', p: 'SP', r: 'SR' };
      L.rows.forEach(function (row) { for (var c = 0; c < CORE.W; c++) { var ch = row[c] || '#'; b.push(ch === '#' ? { t: '#', c: 'n' } : ch === '.' ? null : { t: T[ch], c: ch === ch.toUpperCase() ? 'w' : 'b' }); } });
      Object.keys(L.pri || {}).forEach(function (s) { var i = CORE.sq(s); if (b[i]) b[i].n = L.pri[s]; });
      var targets = L.targets.split(' ').map(function (s) { var a = s.split(':'); return { i: CORE.sq(a[0]), t: a[1] === 'r' ? 'SR' : 'SP' }; });
      return { b: b, targets: targets };
    },
    fen: function (L) {
      return L.rows.map(function (row) {
        var o = '', e = 0, flush = function () { if (e) { o += e; e = 0; } };
        for (var c = 0; c < CORE.W; c++) { var ch = row[c] || '#'; if (ch === '.') { e++; continue; } flush(); o += { '#': '*', R: 'R', B: 'B', P: '[WP]', p: '[sp]', r: '[sr]' }[ch]; }
        flush(); return o;
      }).join('/');
    }
  };
  /* rows: top row first, 9 x 7; # = no tile, . = tile, R B P = white rook/bishop/pawn, p r = black pawn/rook.
     pri = capture priority badges, targets = square:type. L4 + L9 from the video frames, the rest original (see header). */
  var LEVELS = [
    {"name": "Humble Beginning", "rows": ["#########", "##.....##", "##.....##", "##..p..##", "##...p.##", "##.....##", "##..R..##"], "pri": {}, "targets": "e6:p g3:p"},
    {"name": "Watch the Diagonals", "rows": ["#########", "##....R##", "##.....##", "##.....##", "##.p.p.##", "##.....##", "#########"], "pri": {}, "targets": "c6:p f6:p"},
    {"name": "No Way Back", "rows": ["#########", "#.p.....#", "#..pp..R#", "#.......#", "#########", "#########", "#########"], "pri": {}, "targets": "b4:p e6:p h4:p"},
    {"name": "Cunning Pawns", "rows": ["#....####", "#.#.p####", "#.#p.####", "#.#..####", "#.#R.p..#", "#.......#", "#....####"], "pri": {}, "targets": "e4:p b1:p e2:p"},
    {"name": "A Noble Sacrifice", "rows": ["#########", "#....p..#", "#.p.....#", "#......R#", "#P......#", "#########", "#########"], "pri": {"f6": 1, "c5": 2}, "targets": "c3:p f3:p"},
    {"name": "Two for One", "rows": ["#########", "#......##", "#......##", "#..#.p.##", "#..P.p.##", "#RP.p..##", "#########"], "pri": {"f4": 1, "e2": 2, "f3": 3}, "targets": "b2:p d3:p g5:p"},
    {"name": "March of the Pawns", "rows": ["#########", "#....R..#", "#.p...P.#", "#..r...p#", "#...P...#", "#########", "#########"], "pri": {"d4": 3, "h4": 1, "c5": 2}, "targets": "b6:r e5:p g5:p"},
    {"name": "The Rook's Revenge", "rows": ["#########", "#.....p.#", "#.......#", "#p##.##.#", "#R....R.#", "#..r....#", "#########"], "pri": {"d2": 3, "b4": 1, "g6": 2}, "targets": "b2:r e6:p h4:p"},
    {"name": "Sacrifice All", "rows": ["#########", "###...###", "###p.p..#", "r.....#.r", ".##.R##R.", ".##...#.#", "........#"], "pri": {"a4": 1, "i4": 2, "d5": 3, "f5": 4}, "targets": "d2:p f2:p a1:r i3:r"},
    {"name": "Bishop's Last Stand", "rows": ["#########", "#.B.....#", "#..p...p#", "#.......#", "#.......#", "#.......#", "#########"], "pri": {"d5": 1, "h5": 2}, "targets": "c4:p g4:p"}
  ];
  var A = 'assets/modes/7lEglazTlo8/';
  var IMG = { R: A + 'rook_w.png', B: A + 'bishop_w.png', WP: A + 'pawn_w.png', SP: A + 'pawn_b.png', SR: A + 'rook_b.png' };
  var YEL = { SP: A + 'pawn_y.png', SR: A + 'rook_y.png' };
  var ICON = { SP: [A + 'target_red.png', A + 'target_green.png'], SR: [A + 'target_rook_red.png', A + 'target_rook_green.png'] };
  function lv(ctx) { return LEVELS[ctx.game._soko.k]; }
  function targetsOf(ctx) { var z = ctx.game._soko; if (!z.T || z.Tk !== z.k) { z.T = CORE.build(LEVELS[z.k]).targets; z.Tk = z.k; } return z.T; }
  function unlocked() { return Math.min(LEVELS.length - 1, Math.max(0, +CM.store.get('soko.unlocked', 0) || 0)); }
  function load(ctx, k) {
    var z = ctx.game._soko; if (k != null) z.k = k; var L = LEVELS[z.k];
    var st = CM.spec.initialState(ctx.V, Object.assign({}, ctx.spec, { setup: { fen: CORE.fen(L), turn: 'w' } }));
    Object.keys(L.pri || {}).forEach(function (s) { var i = CORE.sq(s); if (st.b[i]) st.b[i] = Object.assign({}, st.b[i], { n: L.pri[s] }); });
    st.x = { soko: z.k }; ctx.state = st; ctx.game.history = []; ctx.game.sel = -1;
    ctx.fx({ type: 'overlay', at: 'board', html: '<div class="g4soko-title"><span>LEVEL ' + (z.k + 1) + '</span><b>' + L.name.toUpperCase() + '</b></div>', duration_ms: 1500, fade_ms: 300 });
    paintNav(ctx); ctx.refresh();
  }
  function paintNav(ctx) {
    var d = document.querySelector('.g4soko-btns'); if (!d) return; var k = ctx.game._soko.k;
    d.querySelector('.lv').textContent = 'Level ' + (k + 1) + ' / ' + LEVELS.length;
    d.querySelector('.pv').disabled = k <= 0; d.querySelector('.nx').disabled = k >= unlocked();
  }
  CM.sokoCore = CORE; CM.sokoLevels = LEVELS;
  CM.mode({
    id: '7lEglazTlo8',
    title: 'Can I BEAT Soko Chess?',
    name: 'Soko Chess',
    category: 'Other Videos',
    description: 'Sokoban with chess pieces. Your white pieces move like chess pieces, and moving onto a black piece pushes it one square further. Push every black piece onto the red icon of its type. Black pieces never move on their own: they only capture, pawns diagonally down and rooks along open lines, lowest number first. Sacrifices are allowed, and sometimes needed. Unlimited undo.',
    how_to_win: 'Fill every target with a black piece of its type, on all ' + LEVELS.length + ' levels.',
    player_side: 'white',
    opponent: { name: 'Soko Chess', rating: null, tagline: 'Puzzle levels, no opponent.' },
    board: { files: CORE.W, ranks: CORE.H, light: '#9f95ee', dark: '#3d2875' },
    theme: { background: '#6a5ac8' },
    pieces: {
      R: { name: 'Rook', moves: '', gen: 'sokoGen', value: 500, img: { w: IMG.R } },
      B: { name: 'Bishop', moves: '', gen: 'sokoGen', value: 330, img: { w: IMG.B } },
      WP: { name: 'Pawn', moves: '', gen: 'sokoGen', value: 100, img: { w: IMG.WP } },
      SP: { name: 'Black pawn', moves: '', value: 100, capturable: false, img: { b: IMG.SP } },
      SR: { name: 'Black rook', moves: '', value: 500, capturable: false, img: { b: IMG.SR } }
    },
    setup: { fen: CORE.fen(LEVELS[0]) },
    rules: { check: 'none', castling: false, enPassant: false, promotion: false, movesPerTurn: { w: 9999, b: 1 }, drawPlies: 9999 },
    bot: { engine: 'random' },
    params: { levels: LEVELS.length },
    hooks: {
      sokoGen: function (V, st, i, p, out) {
        CORE.gen(st.b, i).forEach(function (mv) {
          var m = { f: i, t: mv.t, p: p.t, c: p.c, cap: null };
          if (mv.push != null) { m.push = mv.push; m.slides = [{ f: mv.t, t: mv.push }]; }
          out.push(m);
        });
      },
      onMake: function (V, st, m, n) {
        if (m.push != null) n.b[m.push] = st.b[m.t];
        n.x = Object.assign({}, n.x, { caps: CORE.resolve(n.b) });
      },
      checkWin: function () { return null; },
      setup: function (ctx) {
        ctx.game._soko = { k: unlocked() }; if (document.body && document.body.classList) document.body.classList.add('m-soko');
        var side = document.getElementById('side');
        if (side && side.querySelector && !side.querySelector('.g4soko-btns')) {
          var d = document.createElement('div'); d.className = 'g4soko-btns';
          d.innerHTML = '<button type="button" class="pv" aria-label="Previous level">&#8249;</button><button type="button" class="u" aria-label="Undo"><img alt="" src="' + A + 'undo.png"></button><span class="lv"></span><button type="button" class="r" aria-label="Restart level"><img alt="" src="' + A + 'restart.png"></button><button type="button" class="nx" aria-label="Next level">&#8250;</button>';
          d.querySelector('.u').onclick = function () { ctx.game.undo(); };
          d.querySelector('.r').onclick = function () { if (!ctx.game.busy) load(ctx); };
          d.querySelector('.pv').onclick = function () { var z = ctx.game._soko; if (!ctx.game.busy && z.k > 0) load(ctx, z.k - 1); };
          d.querySelector('.nx').onclick = function () { var z = ctx.game._soko; if (!ctx.game.busy && z.k < unlocked()) load(ctx, z.k + 1); };
          side.insertBefore(d, side.firstChild);
        }
        load(ctx);
      },
      afterMove: function (ctx) {
        var st = ctx.state, caps = (st.x && st.x.caps) || [];
        caps.forEach(function (c, k) { setTimeout(function () { ctx.fx({ type: 'flash', at: ctx.name(c.t), color: '#ff4a4a', duration_ms: 450 }); ctx.sound('capture'); }, 120 + k * 260); });
        var done = CORE.won(st.b, targetsOf(ctx)), z = ctx.game._soko;
        if (done) {
          if (z.k + 1 > unlocked() && z.k + 1 < LEVELS.length) CM.store.set('soko.unlocked', z.k + 1);
          ctx.sound('notify'); ctx.fx({ type: 'text', text: 'LEVEL COMPLETE', color: '#ffffff', size: 34, at: 'board', duration_ms: 1100 });
          if (z.k + 1 >= LEVELS.length) { CM.store.set('soko.unlocked', LEVELS.length - 1); return new Promise(function (r) { setTimeout(function () { ctx.endGame('player', 'all ' + LEVELS.length + ' levels cleared'); r(); }, 1000); }); }
          return new Promise(function (r) { setTimeout(function () { load(ctx, z.k + 1); r(); }, 1200); });
        }
        if (!CORE.whites(st.b) || !ctx.V.legal(st).length) {
          ctx.toast(CORE.whites(st.b) ? 'No moves left. Restarting the level.' : 'All your pieces were captured. Restarting the level.');
          return new Promise(function (r) { setTimeout(function () { load(ctx); r(); }, 1300); });
        }
      },
      decorate: function (ctx, sq, p) {
        var o = null, T = targetsOf(ctx), g = ctx.game;
        for (var k = 0; k < T.length; k++) if (T[k].i === sq) { var on = p && p.c === 'b' && p.t === T[k].t; o = { cls: 'g4soko-target', follow: false, html: '<img class="g4soko-ic" alt="" src="' + ICON[T[k].t][on ? 1 : 0] + '">' }; }
        if (p && p.c === 'b') {
          var badge = p.n ? '<b class="g4soko-n">' + p.n + '</b>' : '';
          var push = g && g.sel >= 0 && (g.moves || []).some(function (m) { return m.f === g.sel && m.t === sq && m.push != null; });
          if (badge || push) { o = o || {}; if (push) o.img = YEL[p.t]; if (badge) { o.html = (o.follow === false ? o.html + badge : badge); } }
        }
        return o;
      },
      init: function () {
        if (document.getElementById('g4soko-css')) return;
        var c = document.createElement('style'); c.id = 'g4soko-css';
        c.textContent = '.m-soko{--g4soko-bg:linear-gradient(160deg,#546bb9,#8d47db)}.m-soko .board-area,.m-soko .board-wrap{background:var(--g4soko-bg)}.m-soko .board-viewport{border-radius:0}.m-soko #card-top,.m-soko #card-bottom{display:none}.m-soko .view-game{background:linear-gradient(160deg,#546bb9,#8d47db) fixed}.m-soko .board-area,.m-soko .board-wrap{background:transparent}' +
          '.m-soko #board .sq{background:transparent!important;box-shadow:none;border-radius:0}' +
          /* s6b: the game's look (frame maxres2): flat tiles with a gap between them and small rounding, pieces ~66% of a tile */
          '.m-soko #board .sq::before{inset:5.5%;border-radius:11%;background:#3d2875!important;transition:none}.m-soko #board .sq.is-light::before{background:#9f95ee!important}' +
          '.m-soko #board .sq.is-sel::before{background:#b9b1ff!important}.m-soko #board .sq.is-dark.is-sel::before{background:#5a43a3!important}.m-soko #board .sq:has(.blk--wall)::before{display:none}.m-soko .blk--wall{display:none}' +
          '.m-soko #board .pc{box-sizing:border-box;padding:16%;object-fit:contain;image-rendering:auto}.m-soko .sq.is-last::before{opacity:1}' +
          '.m-soko .sq.is-target::after{background:#f7f03a;width:22%;height:22%}.m-soko .sq.is-target-cap::after{background:none}.m-soko .sq .coord,.m-soko .sq .crd{opacity:0}' +
          '.g4soko-ic{position:absolute;left:9%;top:8%;width:30%!important;height:30%!important;max-width:none!important;object-fit:contain;z-index:4;pointer-events:none}' +
          '.g4soko-n{position:absolute;right:9%;bottom:7%;z-index:5;color:#fff;font:800 calc(var(--sqpx,48px)*.26)/1 system-ui,sans-serif;-webkit-text-stroke:calc(var(--sqpx,48px)*.035) #000;paint-order:stroke fill;pointer-events:none}' +
          '.g4soko-title{position:absolute;left:0;right:0;top:3%;text-align:center;color:#fff;font:800 clamp(16px,5vw,30px)/1.15 system-ui,sans-serif;text-shadow:0 2px 0 rgba(40,20,90,.6)}.g4soko-title span,.g4soko-title b{display:block}' +
          '.g4soko-btns{display:flex;align-items:center;justify-content:center;gap:14px;margin:4px auto 10px}.g4soko-btns button{width:48px;height:48px;border:0;padding:0;border-radius:14px;background:none;color:#fff;font:700 34px/1 system-ui,sans-serif;cursor:pointer}.g4soko-btns button:disabled{opacity:.3;cursor:default}.g4soko-btns img{width:100%;height:100%}.g4soko-btns .lv{min-width:104px;text-align:center;font:700 15px/1 system-ui,sans-serif;color:#fff}';
        document.head.appendChild(c);
      },
      onExit: function () { document.body.classList.remove('m-soko'); var e = document.querySelector('.g4soko-btns'); if (e) e.remove(); },
      status: function (ctx) { var z = ctx.game._soko; return z ? 'Level ' + (z.k + 1) + '/' + LEVELS.length + ': ' + LEVELS[z.k].name : null; }
    },
    source: { research: 'research/modes/7lEglazTlo8.json', confidence: 'medium', notes: 'Rules and level names from the transcript; L4 map/targets and L9 exact from video frames; other layouts original, all BFS-verified (tools/soko_bfs_verify.mjs).' }
  });
})();
