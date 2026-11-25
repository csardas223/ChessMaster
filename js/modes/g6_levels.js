/* g6_levels: group-6 runs of fixed rounds / puzzle levels (chess roguelikes such as Passant, Gambonanza, Shotgun King,
   Pawnbarian; practice menus such as Infinite Chess; puzzle platformers such as Chess with Gravity).
   Mode params:
     levels: [{ name, fen, turn, hint, x, opponent: {name, rating, avatar, tagline}, reward }]
     passColor: 'b'      that colour never moves (static target): it always gets one "pass" move
     passant: true       Passant victory conditions for White (any one wins the round), in addition to checkmate /
                         king capture: deliver check 6 of your turns in a row, capture every enemy piece except the
                         king, or gain +7 material (relative to the round's starting balance) and keep it for two of your turns. Shows the counters.
     run: 'Run'          label for the progress line ('Stage', 'Floor', 'Level', ...)
     money: true         show a $ total (each level's reward, default $8) earned across the run
     captureOnly: 'b'    that colour only ever captures (sentries that strike what enters their line); else it passes
     freezer: 'Ct'       piece type that freezes the enemy pieces next to it (Passant Courtisan)
     unlock: { key: 'Ky', lock: 'Lk' }  capturing a key piece removes every lock block (puzzle platformers)
     (state.x.passColor / state.x.captureOnly set in a level's x override the params for that level)
     slippy: true        Passant "Slippy" badge: a White piece that moved in a straight line slides one more square in
                         that direction if it is empty (off the board = lost); knight jumps do not slip
     levelSelect: true   a "Levels" button opens the level list (completion ticks, lv.tier labels); picking one
                         starts it (infinitechess.org practice menu)
     zoom: [8, 12, 24]   a "Zoom out" button cycles the visible window of a big board through these sizes
   impl-6 pass 2 (8th session), roguelike run layer (Passant, Gambonanza, Shotgun King, Pawnbarian, Ouroboros, Survivors):
     shop: { title, pieces: [{t, cost}], coins: ['queen','pawn','demotion','money'], badges: [{id, name, cost}], offer: 3,
             reroll: 2, coinCost: 3 }   SHOP after every won round: buy pieces (join your army next round on your first
             free back squares), coins (one-shot buttons under the board) and badges (push, slippy, ...); Re-roll costs $2
     stages: true        then Stage Select: Standard / Challenging (stronger AI, +50% reward) / Skip Round (free pawn)
     undos: 3            Undo charges for the whole run ("Undo (N remaining)"); 0 = no undo
     difficulty: [{name, elo, depth}]  AI difficulty picker before the first round (Passant Standard/Challenging/Grandmaster)
     banner: 'Player Turn'  text over the board on each of your turns; round wins pop the payout ("+$8")
     badges: push = a non-capturing move pushes the neighbouring pieces one square away (off the board = lost)
     levels[].tiles: { e4: 'up'|'down'|'left'|'right'|'unstable' }  arrow tiles slide the piece that lands on them one
             square that way; an unstable tile collapses (becomes a wall) when the piece on it moves off
   impl-6a (2026-11-25), Chessformer puzzle-platformer layer (oAoik9Dj2qQ, p6W3yDU-v88; stills in research/frames/video_thumbs):
     levels[].tiles: { d7: 'button' }  purple button: while any piece stands on a button square every params.buttons.block
             piece (purple block) is lifted off the board; when the buttons are empty again the blocks come back on their
             empty squares (gravity is re-applied both ways)
     buttons: { block: 'Pb', img: '<dome png>' }
     levels[].choice: ['R','B','N','Q']  the level's params.choicePiece pieces ('?' piece) become the piece you pick in a
             yellow picker at level start (the video's R/B/N/Q choice panel)
     fallAnim: true      the moved piece slides to its target, then drops straight down to where gravity puts it
     ledges: true        thin green ledges: levels[].tiles { e9: 'ledge' } = a bar under that square; a piece there rests on it,
             pieces pass through it sideways and from below. The mode sets rules.gravity null and params.gravity instead
             (this lib then applies gravity itself after every move, ledges included)
     dissolve: true      level intro: the board appears through a field of black squares that vanish at random (the
             'Level N' wipe in the stills), with the level name over it
   Named generator: portal (any empty square, captures adjacent only).
   Winning a level moves you to the next one on New game; losing keeps you on it (roguelike retry). */
(function () {
  'use strict';
  var CM = window.CM;
  var mem = {};
  function M(ctx) { var id = ctx.spec.id; return mem[id] || (mem[id] = { k: 0, cash: 0, undoLeft: ctx.params.undos != null ? ctx.params.undos : 99 }); }
  function L(ctx) { return ctx.params.levels || []; }
  function cur(ctx) { var l = L(ctx); return l[Math.min(M(ctx).k, l.length - 1)] || {}; }
  function mat(V, st, c) { var s = 0; st.b.forEach(function (p) { if (p && p.c === c && !p.dead) { var d = V.def(p.t); if (!d.royal && !d.blocker) s += d.value || 0; } }); return s; }
  /* impl-6 pass 2: tool buttons under the status line (level list, zoom), as the sites in the videos have them */
  function tools(ctx) {
    var old = document.getElementById('g6-tools'); if (old) old.remove();
    var P = ctx.params, st = document.getElementById('status'), mm = M(ctx); if (!st || !st.parentNode || !(P.levelSelect || P.zoom || P.shop || P.undos != null)) return;
    var bar = document.createElement('div'); bar.id = 'g6-tools'; bar.style.cssText = 'display:flex;gap:8px;justify-content:center;margin-top:6px';
    var btn = function (label, fn) { var b = document.createElement('button'); b.type = 'button'; b.className = 'btn'; b.textContent = label; b.onclick = fn; bar.appendChild(b); return b; };
    if (P.levelSelect) btn('Levels', function () { levelList(ctx); });
    if (P.zoom) zoomBtn(ctx, btn);
    (mm.coins || []).forEach(function (id, k) { var b = btn(id.charAt(0).toUpperCase() + id.slice(1) + ' coin', function () { useCoin(ctx, k); }); b.title = COINS[id]; b.style.background = '#8a6d1e'; });
    if (P.undos != null) { var u = document.createElement('span'); u.style.cssText = 'align-self:center;font-size:12px;opacity:.8'; u.textContent = 'Undo (' + Math.max(0, mm.undoLeft) + ' remaining)'; bar.appendChild(u); }
    bar.style.flexWrap = 'wrap';
    st.parentNode.insertBefore(bar, st.nextSibling);
  }
  function zoomBtn(ctx, btn) {   // cycles the big board's visible window through params.zoom sizes (keeps the follow target)
    var Z = ctx.params.zoom, vp = ctx.spec.board.viewport || {}, cur = (vp.mobile && window.innerWidth < 900 ? vp.mobile.files : vp.files) || Z[0];
    var zi = Math.max(0, Z.indexOf(cur)), b = btn(zi === Z.length - 1 ? 'Zoom in' : 'Zoom out', function () {
      zi = (zi + 1) % Z.length; var n = Z[zi], nv = Object.assign({}, ctx.spec.board.viewport, { files: n, ranks: n, mobile: { files: n, ranks: n } });
      ctx.spec.board.viewport = nv; CM.gameUI.setViewport(nv); ctx.game.render({ instant: true }); b.textContent = zi === Z.length - 1 ? 'Zoom in' : 'Zoom out';
    });
  }
  function levelList(ctx) {
    var wrap = document.getElementById('board-wrap'); if (!wrap) return;
    var m = M(ctx), done = m.done || {}, el = document.createElement('div'); el.id = 'g6-levels';
    el.style.cssText = 'position:absolute;inset:0;z-index:30;overflow:auto;background:rgba(38,37,34,.96);padding:12px;display:flex;flex-direction:column;gap:6px';
    el.innerHTML = '<b style="text-align:center;color:#fff;font-size:16px;margin-bottom:4px">' + (ctx.params.run || 'Level') + 's</b>' + L(ctx).map(function (lv, k) {
      return '<button type="button" class="btn" data-k="' + k + '" style="justify-content:space-between;text-align:left' + (k === m.k ? ';outline:2px solid #81b64c' : '') + '"><span>' + (k + 1) + '. ' + CM.util.esc(lv.name || '') + (lv.tier ? ' <i style="opacity:.7">(' + CM.util.esc(lv.tier) + ')</i>' : '') + '</span><span style="color:#81b64c">' + (done[k] ? '\u2713' : '') + '</span></button>';
    }).join('') + '<button type="button" class="btn" data-close="1">Close</button>';
    el.onclick = function (e) { var b = e.target.closest('[data-k],[data-close]'); if (!b) return; el.remove(); if (b.dataset.k != null) { m.k = +b.dataset.k; ctx.game.newGame(); } };
    wrap.appendChild(el);
  }
  function nonKing(V, st, c) { var n = 0; st.b.forEach(function (p) { if (p && p.c === c && !p.dead && !V.def(p.t).royal && !V.def(p.t).blocker) n++; }); return n; }

  /* ---------- impl-6 pass 2: run layer (shop, coins, badges, stage select, undo charges, difficulty) ---------- */
  /* Passant coins (research dkCMhNcZezM: 'Pawn coin (demote one enemy piece), Money coin (sell one of your pieces for half its value)';
     queen / demotion coins from the todo list, effects inferred) */
  var COINS = { queen: 'Queen coin: your most advanced pawn becomes a queen', pawn: 'Pawn coin: the strongest enemy piece becomes a pawn',
    demotion: 'Demotion coin: the strongest enemy piece is demoted one step', money: 'Money coin: your weakest piece is sold for half its value' };
  var PANEL = 'position:absolute;inset:0;z-index:30;overflow:auto;background:rgba(28,30,34,.96);padding:10px;display:flex;flex-direction:column;gap:8px;color:#fff;font:14px/1.3 system-ui,sans-serif';
  function rnd(n) { return Math.floor(Math.random() * n); }
  function badgesOf(ctx) { return Object.assign({}, ctx.params.startBadges || {}, M(ctx).badges || {}); }
  function overlay(ctx, html, onClick) {
    var wrap = document.getElementById('board-wrap'); if (!wrap) return null;
    var old = document.getElementById('g6-run'); if (old) old.remove();
    var el = document.createElement('div'); el.id = 'g6-run'; el.style.cssText = PANEL; el.innerHTML = html;
    el.onclick = function (e) { var b = e.target.closest('[data-a]'); if (b && !b.disabled) onClick(b.dataset.a, b.dataset.v, el); };
    wrap.appendChild(el); return el;
  }

  /* impl-6a: gravity with ledge squares (params.gravity = {dir:'down', exempt:[]}, params.ledges) */
  function fallLedges(V, b, tiles) {
    var G = (V.cfg.params || {}).gravity; if (!G) return false; var g = V.geo, ex = G.exempt || [], moved = false, won = false;
    var order = []; for (var i = 0; i < b.length; i++) order.push(i);
    order.sort(function (x, y) { return g.row(y) - g.row(x); });
    order.some(function (s0) {
      var p = b[s0]; if (!p || ex.indexOf(p.t) >= 0 || V.def(p.t).blocker) return false;
      var j = s0, nx = -1; while (!(tiles && tiles[g.name(j)] === 'ledge')) { nx = g.step(j, 0, 1); if (nx < 0 || b[nx]) break; j = nx; }
      /* cf-2: a piece that FALLS (>= 1 square) onto the enemy king's head captures it ('drop on the king's head', p6W3yDU-v88 L45/L48) */
      var land = g.step(j, 0, 1);   /* also a piece moved straight onto the king's head (L26: 'move here and then drop onto the king') */
      if (G.fallCapture && land >= 0 && !(tiles && tiles[g.name(j)] === 'ledge') && b[land] && b[land].c !== p.c && b[land].c !== 'n' && V.def(b[land].t).royal) { b[land] = p; b[s0] = null; return true; }
      if (j !== s0) { b[j] = p; b[s0] = null; moved = true; }
      return false;
    }) && (won = true);
    return won ? 'won' : moved;
  }
  /* cf-2: settle the board to a fixpoint (as tools/g6_cf_levels.py Level.settle): gravity (ledges, fall captures), then the
     purple buttons: while any square with a button tile is occupied every purple block (params.buttons.block) is gone, otherwise
     each block is back on its home square (st.x.pbHome) when that square is empty; repeat until nothing changes. */
  function settle(V, n) {
    var P = V.cfg.params || {}, g = V.geo, TL = n.x && n.x.tiles, B = P.buttons, home = n.x && n.x.pbHome;
    for (var it = 0; it < 12; it++) {
      var ch = false;
      if (V.rules.gravity) V.applyGravity(n.b, V.rules.gravity); else { var r = fallLedges(V, n.b, TL); if (r === 'won') return; if (r) ch = true; }
      if (B && TL && home) {
        var pressed = Object.keys(TL).some(function (nm) { var j = g.parse(nm); return TL[nm] === 'button' && j >= 0 && n.b[j]; });
        home.forEach(function (j) {
          if (pressed && n.b[j] && n.b[j].t === B.block) { n.b[j] = null; ch = true; }
          else if (!pressed && !n.b[j]) { n.b[j] = V.piece(B.block, 'n'); ch = true; }
        });
        n.x.pbHidden = pressed ? 1 : null;
      }
      if (!ch) break;
    }
  }
  function regrav(V, n) { if (V.rules.gravity) V.applyGravity(n.b, V.rules.gravity); else if ((V.cfg.params || {}).gravity) fallLedges(V, n.b, n.x && n.x.tiles); }
  /* ---- impl-6a: Chessformer helpers (choice picker, falling animation, level dissolve) ---- */
  function choicePick(ctx, lv) {
    var left = (ctx.state.x && ctx.state.x.chLeft) || []; if (!left.length || !lv.choice || ctx.ply > 0) return;
    /* cf-2: one pick per '?' slot, in reading order (L47: the first two slots became a bishop and a rook) */
    var slots = left;
    var el = overlay(ctx, '<b style="font-size:16px">Choose your piece' + (slots.length > 1 || lv._nSlots > 1 ? ' (' + ctx.name(slots[0]) + ')' : '') + '</b><div style="display:flex;gap:10px;justify-content:center;background:#d8c54f;border:3px solid #222;border-radius:12px;padding:10px">' +
      lv.choice.map(function (t) { return '<button type="button" data-a="c" data-v="' + t + '" style="background:none;border:0;padding:4px;cursor:pointer"><img alt="' + t + '" src="' + pieceImg(ctx, t) + '" style="width:48px;height:48px"></button>'; }).join('') + '</div>',
      function (a, v) {
        var st = ctx.state; if (ctx.ply > 0) { closeRun(); return; }
        st.b = st.b.slice(); st.b[slots[0]] = Object.assign({}, st.b[slots[0]], { t: v, m: 0 }); st.x.chLeft = slots.slice(1);
        closeRun(); ctx.refresh();
        if (slots.length > 1) { lv._nSlots = 2; choicePick(ctx, lv); }
      });
    if (el) el.style.background = 'rgba(0,0,0,.35)';
  }
  function fallAnim(ctx, mv) {
    var ms = CM.settings.animMs && CM.settings.animMs(); if (!ms || !mv || mv.f == null || mv.f < 0 || mv.f === mv.t) return;
    var st = ctx.state, g = ctx.V.geo, j = mv.t, fin = -1;
    for (var k = 0; k < g.ranks && j >= 0; k++) { var q = st.b[j]; if (q && q.c === mv.c && (q.t === mv.p || q.t === mv.promo)) { fin = j; break; } j = g.step(j, 0, 1); }
    if (fin < 0 || fin === mv.t) return;
    var B = CM.gameUI.board, drop = g.row(fin) - g.row(mv.t);
    requestAnimationFrame(function () {
      var img = B.pieceEl(fin), rf = B.rectOf(mv.f), rt = B.rectOf(mv.t), rz = B.rectOf(fin); if (!img || !rf || !rt || !rz) return;
      var slide = ms, fall = Math.round(ms * 0.45 + drop * 55), tot = slide + fall;
      img.animate([{ transform: 'translate(' + (rf.left - rz.left) + 'px,' + (rf.top - rz.top) + 'px)', easing: 'ease-out' },
        { transform: 'translate(' + (rt.left - rz.left) + 'px,' + (rt.top - rz.top) + 'px)', offset: slide / tot, easing: 'cubic-bezier(.55,0,1,.6)' },
        { transform: 'translate(0,0)' }], { duration: tot });
    });
  }
  function dissolve(ctx, label) {
    var fx = document.getElementById('board-fx'), B = CM.gameUI.board, g = ctx.V.geo; if (!fx || !B) return;
    var reduce = CM.settings.reducedMotion && CM.settings.reducedMotion(), br = fx.getBoundingClientRect(), wrap = document.createElement('div');
    wrap.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:6';
    for (var i = 0; i < g.size; i++) {
      var r = B.rectOf(i); if (!r) continue; var d = document.createElement('div');
      d.style.cssText = 'position:absolute;background:#000;left:' + (r.left - br.left) + 'px;top:' + (r.top - br.top) + 'px;width:' + (r.width + 0.5) + 'px;height:' + (r.height + 0.5) + 'px';
      wrap.appendChild(d);
      if (!reduce) d.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 1, delay: 150 + Math.random() * 1100, fill: 'forwards' });
    }
    if (label) { var t = document.createElement('div'); t.textContent = label; /* art-g6b: as the Level 27 / 35 stills (oAoik9Dj2qQ maxres2/3): plain white regular-weight sans, ~1/8 of the board high,
       thin black outline, centred a little above the middle; black squares cover whole cells and vanish one by one */
      t.style.cssText = 'position:absolute;left:0;right:0;top:50%;transform:translateY(-62%);text-align:center;color:#fff;font:400 ' + Math.max(20, Math.round(br.height * 0.13)) + 'px "DejaVu Sans",Verdana,sans-serif;letter-spacing:.02em;text-shadow:-1px -1px 0 #000,1px -1px 0 #000,-1px 1px 0 #000,1px 1px 0 #000'; wrap.appendChild(t); }
    fx.appendChild(wrap);
    setTimeout(function () { wrap.remove(); }, reduce ? 600 : 1700);
  }
  function closeRun() { var e = document.getElementById('g6-run'); if (e) e.remove(); }
  function pieceImg(ctx, t) { return ctx.game.pieceImage({ t: t, c: ctx.human }); }
  function shopOffer(ctx) {
    var S = ctx.params.shop, m = M(ctx), n = S.offer || 3, pool = [];
    (S.pieces || []).forEach(function (x) { pool.push({ kind: 'piece', t: x.t, cost: x.cost }); });
    (S.coins || []).forEach(function (c) { pool.push({ kind: 'coin', id: c, cost: S.coinCost || 3 }); });
    (S.badges || []).forEach(function (b) { if (!(m.badges || {})[b.id]) pool.push({ kind: 'badge', id: b.id, name: b.name, cost: b.cost }); });
    var out = []; while (pool.length && out.length < n + 1) out.push(pool.splice(rnd(pool.length), 1)[0]);
    m.offer = out;
  }
  function itemLabel(ctx, it) {
    if (it.kind === 'piece') return '<img alt="" src="' + pieceImg(ctx, it.t) + '" style="width:42px;height:42px"><span>' + CM.util.esc(ctx.V.def(it.t).name || it.t) + '</span>';
    if (it.kind === 'coin') return '<span style="width:42px;height:42px;border-radius:50%;background:#e2b33c;display:inline-flex;align-items:center;justify-content:center">' + (it.id === 'money' ? '<b style="color:#3b2a06;font-size:22px">$</b>' : '<img alt="" style="width:34px;height:34px" src="' + pieceImg(ctx, it.id === 'queen' ? 'Q' : it.id === 'pawn' ? 'P' : 'N') + '">') + '</span><span>' + CM.util.esc(COINS[it.id].split(':')[0]) + '</span>';
    return '<span style="width:42px;height:42px;border-radius:8px;background:#7a3fb0;display:inline-flex;align-items:center;justify-content:center;font-weight:800">' + CM.util.esc((it.name || it.id).slice(0, 2)) + '</span><span>' + CM.util.esc(it.name || it.id) + ' badge</span>';
  }
  function shop(ctx) {
    var S = ctx.params.shop, m = M(ctx); if (!m.offer) shopOffer(ctx);
    var cards = m.offer.map(function (it, k) {
      return '<button type="button" class="btn" data-a="buy" data-v="' + k + '"' + (it.sold || m.cash < it.cost ? ' disabled' : '') + ' style="flex:1 1 30%;min-width:92px;flex-direction:column;gap:4px;padding:8px 4px;background:#2e3238">' + itemLabel(ctx, it) + '<b style="color:#8fdc6a">' + (it.sold ? 'Sold' : '$' + it.cost + ' Buy') + '</b></button>';
    }).join('');
    var army = (m.army || []).map(function (t) { return '<img alt="" src="' + pieceImg(ctx, t) + '" style="width:26px;height:26px">'; }).join('');
    overlay(ctx, '<b style="font-size:18px;letter-spacing:.06em">' + CM.util.esc(S.title || 'SHOP') + '</b>' +
      '<div>Balance <b style="font-size:20px;color:#ffd75a">$' + m.cash + '</b>' + (m.coins && m.coins.length ? ' · coins ' + m.coins.length + '/4' : '') + '</div>' +
      '<div style="display:flex;flex-wrap:wrap;gap:6px">' + cards + '</div>' + (army ? '<div>Your extra pieces: ' + army + '</div>' : '') +
      '<div style="display:flex;gap:8px;margin-top:auto"><button type="button" class="btn" data-a="reroll"' + (m.cash < (S.reroll || 2) ? ' disabled' : '') + ' style="background:#1f9bd1;flex:1">Re-roll $' + (S.reroll || 2) + '</button>' +
      '<button type="button" class="btn" data-a="next" style="background:#e3a72a;color:#222;flex:1;font-weight:700">Next ' + CM.util.esc(ctx.params.run || 'Round') + ' &rarr;</button></div>',
      function (a, v) {
        if (a === 'buy') { var it = m.offer[+v]; if (!it || it.sold || m.cash < it.cost) return; m.cash -= it.cost; it.sold = 1;
          if (it.kind === 'piece') (m.army || (m.army = [])).push(it.t);
          else if (it.kind === 'coin') { m.coins = (m.coins || []).concat([it.id]).slice(-4); }
          else (m.badges || (m.badges = {}))[it.id] = 1;
          ctx.sound('notify'); shop(ctx); }
        else if (a === 'reroll') { m.cash -= (S.reroll || 2); shopOffer(ctx); shop(ctx); }
        else if (a === 'next') { m.offer = null; if (ctx.params.stages) stageSelect(ctx); else { closeRun(); ctx.game.newGame(); } }
      });
  }
  function stageSelect(ctx) {
    var m = M(ctx), lv = cur(ctx), rw = lv.reward != null ? lv.reward : 8, l = L(ctx), boss = l[m.k + 1] && /boss/i.test(l[m.k + 1].name || '') ? 'Boss next' : '';
    var card = function (a, title, col, txt) { return '<button type="button" class="btn" data-a="' + a + '" style="flex:1;flex-direction:column;gap:6px;padding:10px 4px;background:#2e3238;border-top:4px solid ' + col + '"><b>' + title + '</b><span style="font-size:12px;opacity:.85">' + txt + '</span></button>'; };
    overlay(ctx, '<b style="font-size:18px">Stage Select</b><div style="background:#b5541c;border-radius:6px;padding:6px;text-align:center">' + CM.util.esc(ctx.params.run || 'Round') + ' ' + (m.k + 1) + (boss ? ' · ' + boss : '') + '</div>' +
      '<div style="display:flex;gap:6px">' + card('std', 'Standard', '#3d8fd6', 'Reward $' + rw) + card('hard', 'Challenging', '#d64a3d', 'Stronger AI · reward $' + Math.round(rw * 1.5)) + card('skip', 'Skip Round', '#8a54c9', 'Get a free pawn and skip straight to the next round') + '</div>',
      function (a) {
        m.hard = a === 'hard';
        if (a === 'skip') { (m.army || (m.army = [])).push('P'); if (m.k < L(ctx).length - 1) m.k++; }
        closeRun(); ctx.game.newGame();
      });
  }
  function diffPick(ctx) {
    var D = ctx.params.difficulty, m = M(ctx);
    overlay(ctx, '<b style="font-size:18px">AI difficulty</b>' + D.map(function (d, k) { return '<button type="button" class="btn" data-a="d" data-v="' + k + '" style="padding:12px;background:#2e3238"><b>' + CM.util.esc(d.name) + '</b>' + (d.elo ? '&nbsp;(' + d.elo + ')' : '') + '</button>'; }).join(''),
      function (a, v) { m.diff = D[+v]; closeRun(); ctx.game.newGame(); });
  }
  function placeArmy(ctx) {
    var m = M(ctx), V = ctx.V, st = ctx.state, g = V.geo, F = g.files || V.geo.files;
    (m.army || []).forEach(function (t) {
      var order = []; [0, 1].forEach(function (rr) { for (var c = 0; c < 8; c++) { var col = [3, 4, 2, 5, 1, 6, 0, 7][c]; order.push({ rr: rr, col: col }); } });
      for (var k = 0; k < order.length; k++) {
        var o = order[k]; if (V.def(t).pawn && o.rr === 0) continue;
        for (var i = 0; i < st.b.length; i++) if (g.isValid(i) && g.relRow(i, ctx.human) === o.rr && g.col(i) === o.col && !st.b[i]) { st.b[i] = V.piece(t, ctx.human, V.def(t).pawn && o.rr !== 1 ? { m: 1 } : {}); return; }
      }
    });
  }
  function useCoin(ctx, k) {
    var m = M(ctx), id = (m.coins || [])[k], V = ctx.V, st = ctx.state, me = ctx.human; if (!id || ctx.over || st.turn !== me || ctx.game.busy) return;
    if (id === 'queen') { var best = -1, br = 99; ctx.pieces(function (p) { return p.c === me && V.def(p.t).pawn; }).forEach(function (i) { var r = V.geo.relRow(i, V.opp(me)); if (r < br) { br = r; best = i; } }); if (best < 0) return ctx.toast('No pawn to crown.'); ctx.transform(best, { type: 'Q' }); }
    else if (id === 'demotion' || id === 'pawn') { var step = { Q: 'R', R: 'B', B: 'N', N: 'P' }, tgt = -1, tv = 0; ctx.pieces(function (p) { return p.c !== me && p.c !== 'n' && !V.def(p.t).royal; }).forEach(function (i) { var v = V.def(ctx.at(i).t).value || 0; if (v > tv && step[ctx.at(i).t]) { tv = v; tgt = i; } });
      if (tgt < 0) return ctx.toast('Nothing to demote.'); var nt = id === 'pawn' ? 'P' : step[ctx.at(tgt).t]; if (nt === 'P' && (V.geo.relRow(tgt, 'w') === 0 || V.geo.relRow(tgt, 'b') === 0)) nt = 'N'; ctx.transform(tgt, { type: nt }); }
    else if (id === 'money') { var low = -1, lv2 = 1e9; ctx.pieces(function (p) { return p.c === me && !V.def(p.t).royal; }).forEach(function (i) { var v = V.def(ctx.at(i).t).value || 0; if (v < lv2) { lv2 = v; low = i; } });
      if (low < 0) return ctx.toast('Nothing to sell.'); m.cash += Math.max(1, Math.round(lv2 / 200)); ctx.remove(low); }
    m.coins.splice(k, 1); ctx.sound('notify'); ctx.toast(COINS[id], 2200); ctx.refresh(); tools(ctx);
  }
  function undoGuard(ctx, on) {
    var b = document.getElementById('undo'); if (!b) return;
    if (b._g6) { b.removeEventListener('click', b._g6, true); b._g6 = null; }
    if (!on) return;
    b._g6 = function (e) { if (M(ctx).undoLeft <= 0) { e.stopImmediatePropagation(); e.preventDefault(); ctx.toast('No undo charges left.'); } };
    b.addEventListener('click', b._g6, true);
  }
  CM.defineHooks('g6_levels', {
    setup: function (ctx) {
      var lv = cur(ctx), V = ctx.V, st = ctx.state;
      if (lv.fen) {
        st.b = CM.spec.parseSetup(V, lv.fen);
        /* cf-2: params.pawnDoubleAnyRank (Chessformer, p6W3yDU-v88 L42 'Can they all move two squares? Oh, they can'): every unmoved pawn may double-step */
        st.b.forEach(function (p, i) { if (p && p.c !== 'n' && V.def(p.t).pawn && (ctx.params.pawnDoubleAnyRank || V.geo.relRow(i, p.c) !== 1)) st.b[i] = ctx.params.pawnDoubleAnyRank ? Object.assign({}, p, { m: 0 }) : Object.assign({}, p, { m: 1 }); });
      }
      if (lv.turn) st.turn = lv.turn;
      st.x = Object.assign({}, st.x, { chk: 0, lead: 0, enemy0: 0 }, lv.x || {});
      st.start = {}; V.colors.forEach(function (c) { st.start[c + 'Royal'] = V.royals(st, c).length > 0; });
      st.x.enemy0 = nonKing(V, st, 'b'); st.x.diff0 = mat(V, st, 'w') - mat(V, st, 'b');
      var lst = document.getElementById('g6-levels'); if (lst) lst.remove();
      /* impl-6 pass 2: run layer */
      var mm = M(ctx), P = ctx.params; closeRun();
      if (P.shop || P.stages) placeArmy(ctx);
      st.x.badges = badgesOf(ctx); if (lv.tiles) st.x.tiles = lv.tiles;
      if (P.buttons) { st.x.pbHome = []; st.b.forEach(function (p, i) { if (p && p.t === P.buttons.block) st.x.pbHome.push(i); }); st.x.pbHidden = null; }
      if (P.gravity && lv.fen) settle(V, st);
      /* cf-2: '?' slots start as the level's first choice (so the position always has moves); the picker then sets each slot */
      if (lv.choice && lv.fen) { var CP0 = P.choicePiece || 'Ch'; st.x.chLeft = []; st.b.forEach(function (p, i) { if (p && p.t === CP0) { st.x.chLeft.push(i); st.b[i] = Object.assign({}, p, { t: lv.choice[0], m: 0 }); } }); }
      if (!ctx.spec._bot0) ctx.spec._bot0 = Object.assign({}, ctx.spec.bot);
      var dd = mm.diff || {}, hard = mm.hard ? 1 : 0;
      ctx.spec.bot = Object.assign({}, ctx.spec._bot0, dd.depth ? { depth: dd.depth } : {}, hard ? { depth: (dd.depth || ctx.spec._bot0.depth || 2) + 1 } : {});
      if (dd.elo || hard) ctx.opponent.elo = (dd.elo || ctx.opponent.rating || 1500) + (hard ? 300 : 0);
      if (dd.name) ctx.opponent.name = ctx.spec.opponent.name.replace(/ \(.*\)$/, '') + ' (' + dd.name + ')';
      if (P.undos != null) undoGuard(ctx, true);
      tools(ctx);
      if (lv.opponent) Object.assign(ctx.opponent, lv.opponent, lv.opponent.rating ? { elo: lv.opponent.rating } : {});
    },
    onStart: function (ctx) {
      var lv = cur(ctx), l = L(ctx), k = Math.min(M(ctx).k, l.length - 1);
      if (ctx.params.difficulty && !M(ctx).diff) { diffPick(ctx); return; }
      if (ctx.params.dissolve) { var nm = (lv.name || '').split(':')[0]; requestAnimationFrame(function () { dissolve(ctx, nm); }); }
      if (lv.choice) choicePick(ctx, lv);
      ctx.toast((ctx.params.run || 'Level') + ' ' + (k + 1) + '/' + l.length + (lv.name ? ': ' + lv.name : '') + (lv.hint ? '. ' + lv.hint : ''), 3600);
    },
    moves: function (V, st, out) {
      var P = V.cfg.params || {}, X = st.x || {}, pc = X.passColor || P.passColor, co = X.captureOnly || P.captureOnly;
      if (co && st.turn === co) {
        var caps = out.filter(function (m) { return m.cap; });
        if (caps.length) return caps;
        pc = co;
      }
      if (!pc || st.turn !== pc) return out;
      for (var i = 0; i < st.b.length; i++) { var p = st.b[i]; if (p && p.c === pc) return [{ f: i, t: i, p: p.t, c: pc, cap: null, pass: 1 }]; }
      return out;
    },
    filterMoves: function (V, st, legal) {
      var T = V.cfg.params && V.cfg.params.freezer; if (!T) return legal;
      var g = V.geo, fz = [];
      st.b.forEach(function (p, i) { if (p && p.t === T && p.c !== st.turn) fz.push(i); });
      if (!fz.length) return legal;
      var out = legal.filter(function (m) { return m.f < 0 || !fz.some(function (z) { return g.dist(z, m.f) === 1; }); });
      return out.length ? out : legal;
    },
    onMake: function (V, st, m, n) {
      var P = V.cfg.params || {}, g = V.geo, BX = (st.x && st.x.badges) || {};
      /* impl-6 pass 2: Push badge (player = White): a non-capturing move pushes every adjacent piece but kings one square away */
      if (BX.push && st.turn === 'w' && !m.cap && m.f >= 0 && m.f !== m.t && n.b[m.t]) {
        for (var ox = -1; ox <= 1; ox++) for (var oy = -1; oy <= 1; oy++) {
          if (!ox && !oy) continue; var s1 = g.step(m.t, ox, oy); if (s1 < 0) continue; var q1 = n.b[s1];
          if (!q1 || V.def(q1.t).royal || V.def(q1.t).blocker) continue;
          var d1 = g.step(s1, ox, oy); if (d1 === -1 || d1 === -2) n.b[s1] = null; else if (!n.b[d1]) { n.b[d1] = q1; n.b[s1] = null; }
        }
      }
      /* impl-6 pass 2: special tiles (arrow = slide one square that way, unstable = collapses when left) */
      var TL = st.x && st.x.tiles;
      if (TL && m.f >= 0 && m.f !== m.t) {
        var fn = g.name(m.f), tn = g.name(m.t), DIR = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
        if (TL[fn] === 'unstable' && !n.b[m.f]) n.b[m.f] = V.piece('#', 'n');
        if (DIR[TL[tn]] && n.b[m.t]) { var a2 = g.step(m.t, DIR[TL[tn]][0], DIR[TL[tn]][1]); if (a2 >= 0 && !n.b[a2]) { n.b[a2] = n.b[m.t]; n.b[m.t] = null; } }
      }
      if ((P.slippy || BX.slippy) && st.turn === 'w' && m.f >= 0 && m.f !== m.t && n.b[m.t] && n.b[m.t].c === 'w') {
        var dc = g.col(m.t) - g.col(m.f), dr = g.row(m.t) - g.row(m.f);
        if (dc === 0 || dr === 0 || Math.abs(dc) === Math.abs(dr)) {
          var s2 = g.step(m.t, Math.sign(dc), Math.sign(dr));
          if (s2 === -1 || s2 === -2) n.b[m.t] = null;
          else if (s2 >= 0 && !n.b[s2]) { n.b[s2] = n.b[m.t]; n.b[m.t] = null; }
        }
      }

      /* impl-6a: removing the locks lets pieces resting on them fall (gravity re-applied) */
      if (P.unlock) {
        var kc0 = st.b[m.capSq != null ? m.capSq : m.t];
        if (kc0 && kc0.t === P.unlock.key && kc0.c !== st.turn && !n.b.some(function (q) { return q && q.t === P.unlock.key; })) { var kr = 0; for (var q0 = 0; q0 < n.b.length; q0++) if (n.b[q0] && n.b[q0].t === P.unlock.lock) { n.b[q0] = null; kr = 1; } if (kr) regrav(V, n); }
      }
      /* cf-2: lib-side gravity (ledges, fall captures) + purple buttons, looped to a fixpoint (replaces the single pass) */
      if (P.gravity || (P.buttons && TL)) settle(V, n);
      /* impl-6a purple buttons: now handled in settle() above (home squares, fixpoint) */
      if (P.buttons && TL && !(n.x && n.x.pbHome)) {
        var pressed = Object.keys(TL).some(function (nm) { var j = g.parse(nm); return TL[nm] === 'button' && j >= 0 && n.b[j]; });
        var hidden = (st.x && st.x.pbHidden) || null;
        if (pressed && !hidden) { var hl = []; n.b.forEach(function (q2, j2) { if (q2 && q2.t === P.buttons.block) { hl.push(j2); n.b[j2] = null; } }); n.x.pbHidden = hl; regrav(V, n); }
        else if (!pressed && hidden) { hidden.forEach(function (j3) { if (!n.b[j3]) n.b[j3] = V.piece(P.buttons.block, 'n'); }); n.x.pbHidden = null; regrav(V, n); }
      }
      if (!P.passant || st.turn !== 'w') return;
      var bk = V.royals(n, 'b');
      var chk = bk.length && V.attacked(n, bk[0], 'w');
      n.x.chk = chk ? (st.x.chk || 0) + 1 : 0;
      n.x.lead = mat(V, n, 'w') - mat(V, n, 'b') - (st.x.diff0 || 0) >= 700 ? (st.x.lead || 0) + 1 : 0;
    },
    checkWin: function (V, st) {
      if (!(V.cfg.params && V.cfg.params.passant)) return null;
      var x = st.x || {};
      if ((x.chk || 0) >= 6) return { w: 'w', why: 'six checks in a row' };
      if ((x.lead || 0) >= 2) return { w: 'w', why: '+7 material for two turns' };
      if (x.enemy0 && nonKing(V, st, 'b') === 0 && V.royals(st, 'b').length) return { w: 'w', why: 'every enemy piece except the king was captured' };
      return null;
    },
    onGameOver: function (ctx, over) {
      var m = M(ctx), l = L(ctx), lv = cur(ctx);
      if (over.w === ctx.human && m.hard) m.cash += Math.round((lv.reward != null ? lv.reward : 8) * 0.5);
      if (over.w === ctx.human && (ctx.params.banner || ctx.params.money)) ctx.fx({ type: 'text', text: '+$' + Math.round((lv.reward != null ? lv.reward : 8) * (m.hard ? 1.5 : 1)), at: 'board', color: '#ffd75a', size: 40, duration_ms: 1400 });
      if (over.w === ctx.human && (ctx.params.shop || ctx.params.stages) && m.k < l.length - 1) { var self = ctx; ctx.after(1500, function () { if (self.params.shop) shop(self); else stageSelect(self); }); }
      if (over.w !== ctx.human && over.w !== 'd' && ctx.params.shop) { m.army = []; m.badges = {}; m.coins = []; m.undoLeft = ctx.params.undos != null ? ctx.params.undos : 99; }
      m.hard = false;
      if (over.w === ctx.human) {
        (m.done || (m.done = {}))[Math.min(m.k, l.length - 1)] = 1;
        m.cash += lv.reward != null ? lv.reward : 8;
        if (m.k < l.length - 1) { m.k++; ctx.toast('Round cleared' + (ctx.params.money ? ' (+$' + (lv.reward != null ? lv.reward : 8) + ')' : '') + '! New game starts ' + (ctx.params.run || 'level').toLowerCase() + ' ' + (m.k + 1) + ': ' + (l[m.k].name || ''), 3600); }
        else { m.k = 0; ctx.toast('Run complete! Every ' + (ctx.params.run || 'level').toLowerCase() + ' cleared.', 4000); m.cash = 0; m.army = []; m.badges = {}; m.coins = []; m.undoLeft = ctx.params.undos != null ? ctx.params.undos : 99; }
      } else if (over.w !== 'd') ctx.toast('Run over at ' + (ctx.params.run || 'level').toLowerCase() + ' ' + (m.k + 1) + '. New game retries it.', 3200);
    },
    status: function (ctx) {
      var l = L(ctx), m = M(ctx), k = Math.min(m.k, l.length - 1), lv = cur(ctx), x = ctx.state.x || {};
      var s = (ctx.params.run || 'Level') + ' ' + (k + 1) + '/' + l.length + (lv.name ? ': ' + lv.name : '');
      if (ctx.params.money) s += ' · $' + m.cash;
      var bg = Object.keys(badgesOf(ctx)); if (bg.length) s += ' · badges: ' + bg.join(', ');
      if (ctx.params.passant) s += ' · checks ' + (x.chk || 0) + '/6 · lead turns ' + (x.lead || 0) + '/2';
      return s;
    },
    /* named generator (pieces.X.gen: 'portal'): Ouroboros King Portal Mage, moves to any empty square, kills only next to itself */
    portal: function (V, st, from, p, out) {
      var g = V.geo;
      for (var i = 0; i < st.b.length; i++) {
        if (i === from || !g.isValid(i)) continue; var q = st.b[i];
        if (!q) out.push({ f: from, t: i, p: p.t, c: p.c, cap: null });
        else if (q.c !== p.c && q.c !== 'n' && g.dist(from, i) === 1) out.push({ f: from, t: i, p: p.t, c: p.c, cap: q });
      }
    },
    afterMove: function (ctx, mv) { if (ctx.params.fallAnim) fallAnim(ctx, mv); if (mv && ctx.params.buttons && ctx.state.x && (!!ctx.state.x.pbHidden) !== (!!(ctx.game.history.length && ctx.game.history[ctx.game.history.length - 1].state.x || {}).pbHidden)) ctx.sound('castle'); },
    onExit: function (ctx) { ['g6-tools', 'g6-levels', 'g6-run'].forEach(function (id) { var e = document.getElementById(id); if (e) e.remove(); }); undoGuard(ctx, false); if (ctx.spec._bot0) ctx.spec.bot = ctx.spec._bot0; },
    onUndo: function (ctx) { var m = M(ctx); if (ctx.params.undos != null) { m.undoLeft = Math.max(0, m.undoLeft - 1); tools(ctx); } },
    onTurn: function (ctx, c) { if (ctx.params.banner && c === ctx.human && !ctx.over && ctx.ply > 0) ctx.fx({ type: 'text', text: ctx.params.banner, at: 'board', color: '#ffffff', size: 30, duration_ms: 800 }); },
    decorate: function (ctx, sq, p) {
      var TL = ctx.state.x && ctx.state.x.tiles, t = TL && TL[ctx.name(sq)]; if (!t) return null;
      /* cf-verify: ledge bar = the video's green (#66cf59, sampled from oAoik9Dj2qQ_frame_29) with a 1px outline so it stays green at 390 px (2px borders left it almost black) */
      if (t === 'ledge') return { html: '<span class="sq-label" style="position:absolute;left:1%;right:1%;bottom:-14%;height:21%;box-sizing:border-box;background:#66cf59;border:1px solid #111;border-radius:3px;box-shadow:inset 0 -1px 0 rgba(0,0,0,.18);pointer-events:none;z-index:2"></span>' };
      if (t === 'button') return { html: '<img class="sq-label" alt="" src="' + (ctx.params.buttons && ctx.params.buttons.img) + '" style="position:absolute;left:4%;bottom:0;width:92%;height:auto;pointer-events:none">' };
      var AR = { up: '\u2191', down: '\u2193', left: '\u2190', right: '\u2192', unstable: '\u2248' };
      return { html: '<span class="sq-label" style="color:' + (t === 'unstable' ? 'rgba(200,60,40,.7)' : 'rgba(40,120,200,.75)') + ';font-size:calc(var(--sqpx,40px)*.5)">' + AR[t] + '</span>' };
    },
    camera: function (ctx) { var k = ctx.V.royals(ctx.state, ctx.bot)[0]; return k != null ? k : null; },
    /* art-3d: current level index for mode-side views (js/fx/g6_3d.js tower / floating platforms) */
    runLevel: function (ctx) { return Math.min(M(ctx).k, L(ctx).length - 1); },
    /* g6-3d: jump the run to level k (Who Takes the Crown replays a floor for jumps / switches stacks; Beyond the Board's
       kidnapping cutscene advances without a game-over) */
    runSetLevel: function (ctx, k) { var m = M(ctx); m.k = Math.max(0, Math.min(k | 0, L(ctx).length - 1)); }
  });
})();
