/* g6_3d: the real-3D looks AND game logic of two group-6 games, on the shared CM.scene3d module (ARCHITECTURE section 14).
   art-3d (2026-11-25) built the looks; g6-3d (2026-11-25) added the logic. Loaded on demand by the mode files' onStart
   hooks; the engine, rules and 2D board are unchanged (the 2D board stays underneath; scene3d raycasts taps to squares).
   No WebGL -> attach resolves null, the 2D board stays and every rule below still works (only the climb needs 3D: without
   it a cleared floor goes straight to the next one).

   CM.g6_3d.tower(ctx, opts)   Who Takes the Crown (iqfHW2_sMmc, zDFsnRE_Gig): the tower is a column of upright 8x8 boards
     stacked one on top of the other, seen face-on (frames: iqfHW2_sMmc 1:03 / 10:03 / 11:57 / ~12:30 summit,
     zDFsnRE_Gig 5:01 + storyboard M2; stills in research/frames/video_thumbs). The floor you play is the live board;
     cleared floors below turn grey with the red MATED plate and a padlock, floors above show their position in the
     orange/brick palette, the summit board is cream/grey-brown with the game's crown floating over it.
     g6-3d logic:
     * JUMPS: checkmating a floor grants a super jump (levels[].jumps, default 1); the HUD counts them (transcript 1:34
       'spam checkmates and then use the super jump that you get from checkmate').
     * CLIMB (Getting Over It style platformer between boards): after a mate the white pawn climber is yours: walk
       (arrows / A D / the on-screen pads), jump (Space / W / Up) and super jump (X / Shift, spends one jump) up the face
       of the next board, where every piece is a ledge you can stand on and the seams between boards are floors. Fall off
       the side and you drop a floor; miss a ledge and you fall as far as the ledges below let you. The HUD shows the super
       jumps the next floor needs (a 0-1 search over the ledges). Not enough? 'Replay board' (or New game) replays the
       board you cleared for another jump ('we need to get a checkmate on one of any of these boards', 5:36). Reaching the
       top seam starts the next floor; on the summit a super jump to the crown wins the run.
     * STACKS (opts.stacks, zDFsnRE_Gig): Famous / Influencer / Random (seeded) picker under the board; the random stack
       plays seeded random openings from the start position (same seed = same tower), the choice is remembered.
   CM.g6_3d.beyond(ctx)        Beyond the Board (xlErokL2-4c): monochrome floating platforms (grey/near-black checker on
     tall black blocks falling into fog), reachable squares glow white, red rings under enemy sentries, camera rotate
     (corner buttons / right click / Q E). Level 1 is the opening board on a light-grey cyclorama with the wooden frame and
     the floating chess clock (0:40). Frames: 0:40, 3:58, 9:17, 12:22, 14:38, 20:05 + storyboard M6.
     g6-3d logic (rules are pure hooks in data/modes/xlErokL2-4c.js; this file draws and stages them):
     * kidnapping cutscene after the first check (pieces dragged up into the dark, the king flees over the edge into the
       abyss, the cyclorama goes dark) -> the rook levels; the plank collapses after its king falls and the rook sinks
       through the abyss while the sinking hymn starts (our own synthesised chorale, assets/modes/xlErokL2-4c/sinking_hymn.wav,
       tools/g6_3d_sounds.py; loops at low volume from then on, follows the sound setting).
     * abyss squares are no platform; switch discs on the board, a tick counter over the rook while a switch holds,
       bridge squares rise out of / sink back into the abyss.
     * the Eldritch King: crimson king with its hexagon counter (0-4 rings, as the 20:05 frame) and the beam when it fires;
       a switch lifts it on a column to your height.
     * wall symbols (black monoliths with the hexagon glyph) reveal the level's hint when tapped.
     * death respawns the level after a short pause; level wins go straight on (no modal) until the demo's end.
   Honours prefers-reduced-motion / animation off: camera, cutscenes and platform moves snap or fade; debris/embers stay
   still. Gameplay (the climb physics) still runs. */
(function () {
  'use strict';
  var CM = window.CM;
  function calm() { return !(CM.settings && CM.settings.animMs && CM.settings.animMs()); }
  function lvIndex(ctx) { var h = ctx.game && ctx.game.hooks; return h && h.runLevel ? h.runLevel(ctx) : 0; }
  function setLevel(ctx, k) { var h = ctx.game && ctx.game.hooks; if (h && h.runSetLevel) h.runSetLevel(ctx, k); }
  function parseFen(fen) {
    var rows = String(fen || '').split(' ')[0].split('/'), out = [];
    rows.forEach(function (r, y) { var x = 0; r.replace(/\[[^\]]*\]|\d+|./g, function (t) { if (/^\d+$/.test(t)) x += +t; else { if (t !== '*' && t !== '#' && t !== '.') out.push({ x: x, y: y, t: t.replace(/[\[\]]/g, '').replace(/^.:/, '').toUpperCase(), c: t === t.toUpperCase() ? 'w' : 'b' }); x++; } return t; }); });
    return out;
  }
  function hud(id, css) {
    var wrap = document.getElementById('board-wrap'); if (!wrap) return null;
    var el = document.getElementById(id); if (el) el.remove();
    el = document.createElement('div'); el.id = id; el.className = 'g6-3d-hud';
    el.style.cssText = 'position:absolute;z-index:5;pointer-events:none;font:700 12px/1.2 "Press Start 2P",ui-monospace,monospace;color:#fff;text-shadow:0 1px 2px rgba(0,0,0,.7);' + (css || '');
    wrap.appendChild(el); return el;
  }
  function clearHud() { Array.prototype.slice.call(document.querySelectorAll('.g6-3d-hud')).forEach(function (e) { e.remove(); }); }
  function hideOverSoon() { Promise.resolve().then(function () { if (CM.gameUI && CM.gameUI.hideOver) CM.gameUI.hideOver(); }); }
  function snd(ctx, n) { try { ctx.sound(n); } catch (e) { /* ignore */ } }
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function textTex(T, draw, w, h) { var cv = document.createElement('canvas'); cv.width = w || 128; cv.height = h || 128; draw(cv.getContext('2d'), cv.width, cv.height); var t = new T.CanvasTexture(cv); t.colorSpace = T.SRGBColorSpace; return t; }

  /* ------------------------------------------------------------------ Who Takes the Crown ------------------------------------------------------------------ */
  var PAL = {
    live: ['#c1552f', '#912213'],     /* orange / brick (zDFsnRE_Gig 5:01, iqfHW2_sMmc 1:03) */
    done: ['#b4a998', '#6e675a'],     /* cleared floors turn grey (zDFsnRE_Gig 5:01 lower board) */
    top: ['#f8d6ad', '#98836a']       /* summit board (iqfHW2_sMmc ~12:30) */
  };
  var PITCH = 8.12;   /* boards sit edge to edge with a thin seam */
  var PHY = { speed: 3.2, grav: 24, jumpH: 1.2, superH: 6.3, maxFall: 30 };
  var W = {};         /* per mode id: { jumps, climb: {from}, pos: {x, y}, stack, stackInit } */
  function TW(ctx) { var id = ctx.spec.id; return W[id] || (W[id] = { jumps: 0, climb: null, pos: null }); }

  function boardCanvas(ctx, fen, pal, opts) {
    var cv = document.createElement('canvas'); cv.width = cv.height = 512; var g = cv.getContext('2d'), q = 64;
    for (var y = 0; y < 8; y++) for (var x = 0; x < 8; x++) { g.fillStyle = (x + y) % 2 ? pal[1] : pal[0]; g.fillRect(x * q, y * q, q, q); }
    var pcs = parseFen(fen), file = location.protocol === 'file:', pend = [];
    pcs.forEach(function (p) {
      var url = !file && ctx.game.pieceImage ? ctx.game.pieceImage({ t: p.t, c: p.c }) : null;
      if (url) { pend.push(new Promise(function (res) { var im = new Image(); im.onload = function () { g.drawImage(im, p.x * q + 4, p.y * q + 4, q - 8, q - 8); res(); }; im.onerror = res; im.src = url; })); return; }
      g.font = '50px "DejaVu Sans","Segoe UI Symbol",serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineWidth = 5;
      g.strokeStyle = p.c === 'w' ? '#1b1b1b' : '#eee'; g.fillStyle = p.c === 'w' ? '#fff' : '#141414';
      var ch = { K: '\u265a', Q: '\u265b', R: '\u265c', B: '\u265d', N: '\u265e', P: '\u265f' }[p.t] || '\u265f';
      g.strokeText(ch, p.x * q + 32, p.y * q + 35); g.fillText(ch, p.x * q + 32, p.y * q + 35);
    });
    function plates() {
      if (opts && opts.mated) {   /* the red italic MATED plate on a grey panel, bottom centre (5:01 / summit frames) */
        g.fillStyle = 'rgba(120,120,120,.85)'; g.fillRect(2 * q, 7 * q + 6, 4 * q, q - 6);
        g.font = 'italic 900 48px Impact, "Arial Black", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
        g.lineWidth = 4; g.strokeStyle = '#fff'; g.strokeText('MATED', 4 * q, 7.55 * q); g.fillStyle = '#e0262c'; g.fillText('MATED', 4 * q, 7.55 * q);
        g.fillStyle = '#5b5b5b'; g.fillRect(14, 30, 34, 26); g.strokeStyle = '#5b5b5b'; g.lineWidth = 6; g.beginPath(); g.arc(31, 30, 10, Math.PI, 0); g.stroke();
        g.fillStyle = '#ddd'; g.fillRect(29, 38, 4, 10);
      }
    }
    return { canvas: cv, ready: Promise.all(pend).then(plates), sync: plates };
  }

  /* ---- the climbing world: one-way ledges (pieces on every face, the seams between boards, side brackets, the ground) ---- */
  function ledges(ctx, levels, k) {
    var L = [], n = levels.length, g = ctx.V.geo;
    for (var j = 0; j < n; j++) {
      var pcs;
      if (j === k && ctx.state) { pcs = []; ctx.state.b.forEach(function (p, i) { if (p && !ctx.V.def(p.t).blocker) pcs.push({ x: g.col(i), y: g.row(i) }); }); }
      else pcs = parseFen(levels[j].fen);
      pcs.forEach(function (p) { L.push({ x0: p.x - 4, x1: p.x - 3, y: j * PITCH + 4 - p.y, kind: 'piece' }); });
      L.push({ x0: -4, x1: 4, y: j * PITCH + 4.06, kind: 'seam', floor: j + 1 });
      L.push({ x0: -4.7, x1: -3.95, y: j * PITCH + 0.06, kind: 'bracket' }, { x0: 3.95, x1: 4.7, y: j * PITCH + 0.06, kind: 'bracket' });
    }
    L.push({ x0: -60, x1: 60, y: -PITCH + 4.06, kind: 'ground', floor: 0 });
    return L;
  }
  /* super jumps needed to reach the goal height from where the climber stands: 0-1 BFS over the ledges (cost 1 = a super
     jump), with the real jump heights and how far you can drift sideways in the air (speed x airtime) */
  function reach(A, B, H) {
    var gap = Math.max(0, B.x0 - A.x1, A.x0 - B.x1), dy = B.y - A.y, g = PHY.grav;
    if (dy > H) return false;
    var t = Math.sqrt(2 * H / g) + Math.sqrt(2 * Math.max(0, H - dy) / g);
    return gap <= PHY.speed * t + 0.25;
  }
  function jumpsNeeded(L, start, goalY, goal) {
    if (typeof start === 'number') { var y0 = start; start = null; L.forEach(function (l) { if (Math.abs(l.y - y0) < 1e-3 && (!start || l.kind === 'seam')) start = l; }); if (!start) return 9; }
    var best = new Map(), dq = [{ l: start, c: 0 }]; best.set(start, 0);
    var target = goal || { x0: -4, x1: 4, y: goalY };
    while (dq.length) {
      var cur = dq.shift(); if (cur.c > best.get(cur.l)) continue;
      if (cur.l.y >= goalY - 0.01 && (!goal || reach(cur.l, target, 0.01))) return cur.c;
      if (goal && reach(cur.l, target, PHY.jumpH)) return cur.c;
      if (goal && reach(cur.l, target, PHY.superH)) { var c2 = cur.c + 1; if (c2 < 9) return c2; }
      for (var i = 0; i < L.length; i++) {
        var l = L[i]; if (l === cur.l) continue;
        var c = reach(cur.l, l, PHY.jumpH) ? 0 : reach(cur.l, l, PHY.superH) ? 1 : -1; if (c < 0) continue;
        var nc = cur.c + c; if (best.has(l) && best.get(l) <= nc) continue; best.set(l, nc);
        if (c === 0) dq.unshift({ l: l, c: nc }); else dq.push({ l: l, c: nc });
      }
    }
    return 9;
  }

  /* ---- stacks (zDFsnRE_Gig): Famous / Influencer / Random (seeded) ---- */
  function mulberry(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function toFen(V, b) {
    var g = V.geo, rows = [];
    for (var r = 0; r < g.ranks; r++) { var s = '', e = 0; for (var c = 0; c < g.files; c++) { var p = b[r * g.files + c]; if (!p) { e++; continue; } if (e) { s += e; e = 0; } s += p.c === 'w' ? p.t.toUpperCase() : p.t.toLowerCase(); } if (e) s += e; rows.push(s); }
    return rows.join('/');
  }
  function randomStack(ctx, seed, floors) {
    var V = ctx.V, rnd = mulberry(seed >>> 0), out = [];
    function mat(b, c) { var s = 0; b.forEach(function (p) { if (p && p.c === c && !V.def(p.t).royal) s += V.def(p.t).value || 0; }); return s; }
    for (var f = 0; f < floors; f++) {
      var fen = null;
      for (var tries = 0; tries < 40 && !fen; tries++) {
        var st = Object.assign(V.clone(ctx.state), { b: CM.spec.parseSetup(V, CM.spec.STD_FEN.split(' ')[0]), turn: 'w', ply: 0, half: 0 });
        var plies = 2 * (7 + Math.floor(rnd() * 6)), ok = true;
        for (var p = 0; p < plies && ok; p++) {
          var ms = V.legal(st); if (!ms.length) { ok = false; break; }
          var quiet = ms.filter(function (m) { return !m.cap; }), pool = quiet.length && rnd() < 0.7 ? quiet : ms;
          var m = pool[Math.floor(rnd() * pool.length)]; st = m.n || V.make(st, m);
        }
        if (!ok || V.result(st, V.legal(st)) || st.turn !== 'w') continue;
        if (Math.abs(mat(st.b, 'w') - mat(st.b, 'b')) > 300) continue;
        fen = toFen(V, st.b);
      }
      out.push({ name: 'Random game ' + seed + '-' + (f + 1), fen: fen || CM.spec.STD_FEN.split(' ')[0] });
    }
    out[out.length - 1].name = 'The crown (random ' + seed + ')';
    return out;
  }
  function stackLevels(ctx, opts, pick) {
    var S = opts.stacks || {};
    if (pick.name === 'Random') return randomStack(ctx, pick.seed || 1, (S.Famous || ctx.params.levels || []).length || 4);
    return (S[pick.name] || S.Famous || ctx.params.levels).map(function (l) { return Object.assign({}, l); });
  }
  function stackPick(ctx) { return CM.store.get('g6_3d.stack.' + ctx.spec.id, { name: 'Famous', seed: 1 + Math.floor(Math.random() * 9999) }); }
  function applyStack(ctx, opts, pick) {
    var w = TW(ctx); CM.store.set('g6_3d.stack.' + ctx.spec.id, pick);
    w.stack = pick; w.stackLevels = stackLevels(ctx, opts, pick); w.jumps = 0; w.climb = null; w.pos = null;
    ctx.spec.params.levels = w.stackLevels; setLevel(ctx, 0); tower._last = null;
  }
  /* called from the WTTC mode files' setup hook (before g6_levels.setup): the chosen stack, and New game during a climb
     replays the board you just cleared for another jump */
  function towerSetup(ctx) {
    var w = TW(ctx);
    if (w.stackLevels) ctx.spec.params.levels = w.stackLevels;
    if (w.climb && !w.replay) { w.replay = true; setLevel(ctx, w.climb.from); }
  }
  function stackBar(ctx, opts) {
    var old = document.getElementById('g6-3d-stacks'); if (old) old.remove();
    if (!opts.stacks) return;
    var st = document.getElementById('status'); if (!st || !st.parentNode) return;
    var w = TW(ctx), pick = w.stack || stackPick(ctx), bar = document.createElement('div'); bar.id = 'g6-3d-stacks'; bar.setAttribute('role', 'group'); bar.setAttribute('aria-label', 'Stacks');
    bar.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;justify-content:center;align-items:center;margin-top:6px;font-size:13px';
    bar.innerHTML = '<span style="opacity:.75">Stacks</span>' + ['Famous', 'Influencer', 'Random'].map(function (nm) {
      return '<button type="button" class="btn" data-s="' + nm + '" aria-pressed="' + (pick.name === nm) + '" style="padding:4px 10px;min-height:32px' + (pick.name === nm ? ';background:#81b64c;color:#fff' : '') + '">' + nm + (nm === 'Random' ? ' #' + (pick.seed || 1) : '') + '</button>';
    }).join('') + (pick.name === 'Random' ? '<button type="button" class="btn" data-s="reseed" title="New seed" aria-label="New random seed" style="padding:4px 10px;min-height:32px">\u21bb</button>' : '');
    bar.onclick = function (e) {
      var b = e.target.closest('[data-s]'); if (!b) return;
      var nm = b.dataset.s, cur = w.stack || pick, next = nm === 'reseed' ? { name: 'Random', seed: 1 + Math.floor(Math.random() * 9999) } : { name: nm, seed: cur.seed || 1 };
      applyStack(ctx, opts, next); ctx.toast(next.name + ' stack' + (next.name === 'Random' ? ' (seed ' + next.seed + ')' : '') + ': floor 1', 2600); ctx.game.newGame();
    };
    st.parentNode.insertBefore(bar, st.nextSibling);
  }

  /* ---- climb controls (on-screen pads + keys) ---- */
  var keys = { l: 0, r: 0, j: 0, s: 0 }, keyFn = null;
  function climbKeys(on) {
    if (keyFn) { document.removeEventListener('keydown', keyFn, true); document.removeEventListener('keyup', keyFn, true); keyFn = null; }
    keys.l = keys.r = keys.j = keys.s = 0;
    if (!on) return;
    keyFn = function (e) {
      if (/input|textarea|select/i.test((e.target || {}).tagName || '')) return;
      var d = e.type === 'keydown', k = e.key, hit = true;
      if (k === 'ArrowLeft' || k === 'a' || k === 'A') keys.l = d; else if (k === 'ArrowRight' || k === 'd' || k === 'D') keys.r = d;
      else if (k === ' ' || k === 'ArrowUp' || k === 'w' || k === 'W') { if (d && !e.repeat) keys.j = 1; }
      else if (k === 'x' || k === 'X' || k === 'Shift') { if (d && !e.repeat) keys.s = 1; }
      else hit = false;
      if (hit) { e.preventDefault(); e.stopPropagation(); }
    };
    document.addEventListener('keydown', keyFn, true); document.addEventListener('keyup', keyFn, true);
  }
  function climbPad(ctx, on) {
    var old = document.getElementById('g6-3d-pad'); if (old) old.remove();
    if (!on) return;
    var wrap = document.getElementById('board-wrap'); if (!wrap) return;
    var w = TW(ctx), pad = document.createElement('div'); pad.id = 'g6-3d-pad'; pad.className = 'g6-3d-hud';
    pad.style.cssText = 'position:absolute;left:6px;right:6px;bottom:6px;z-index:7;display:flex;gap:6px;align-items:flex-end;justify-content:space-between;pointer-events:none';
    var B = 'pointer-events:auto;min-width:44px;height:44px;border-radius:10px;border:1px solid rgba(255,255,255,.5);background:rgba(20,20,22,.62);color:#fff;font:700 15px/1 system-ui,sans-serif;padding:0 10px;touch-action:none;cursor:pointer';
    pad.innerHTML = '<div style="display:flex;gap:6px"><button type="button" data-k="l" aria-label="Walk left" style="' + B + '">\u25c0</button><button type="button" data-k="r" aria-label="Walk right" style="' + B + '">\u25b6</button></div>' +
      '<button type="button" data-k="replay" style="' + B + ';font-size:12px;height:36px" title="Replay the board you cleared to earn another jump">Replay board</button>' +
      '<div style="display:flex;gap:6px"><button type="button" data-k="j" aria-label="Jump" style="' + B + '">Jump</button><button type="button" data-k="s" aria-label="Super jump" style="' + B + ';background:rgba(193,85,47,.85)">\u2912 <span id="g6-3d-padn">' + w.jumps + '</span></button></div>';
    var hold = function (e, d) { var b = e.target.closest('[data-k]'); if (!b) return; e.preventDefault(); e.stopPropagation(); var k = b.dataset.k;
      if (k === 'l' || k === 'r') keys[k] = d; else if (d && (k === 'j' || k === 's')) keys[k] = 1; else if (d && k === 'replay') replayForJump(ctx); };
    pad.addEventListener('pointerdown', function (e) { hold(e, 1); });
    pad.addEventListener('pointerup', function (e) { hold(e, 0); });
    pad.addEventListener('pointerleave', function () { keys.l = keys.r = 0; });
    pad.addEventListener('pointercancel', function () { keys.l = keys.r = 0; });
    wrap.appendChild(pad);
  }
  function replayForJump(ctx) {
    var w = TW(ctx); if (!w.climb) return;
    w.replay = true; setLevel(ctx, w.climb.from); tower._last = { id: ctx.spec.id, k: w.climb.from };
    ctx.toast('Replay this board: checkmate it again for another jump.', 3000); ctx.game.newGame();
  }
  function startClimb(ctx, from, grant) {
    var w = TW(ctx), levels = ctx.params.levels || [], n = levels.length, summit = from >= n - 1;
    w.jumps += grant;
    if (!w.climb) { w.climb = { from: from }; w.pos = { x: 1.5, y: from * PITCH + 4.06, vx: 0, vy: 0, ground: true, peak: from * PITCH + 4.06 }; }
    w.replay = false;
    hideOverSoon();
    var S = CM.scene3d.current();
    if (!S || !S.climbOK) {   /* no 3D: the super jump just happens */
      w.jumps = Math.max(0, w.jumps - grant); w.climb = null; w.pos = null;
      if (summit) return crownWin(ctx);
      tower._last = { id: ctx.spec.id, k: from }; ctx.after(1400, function () { ctx.game.newGame(); }); return;
    }
    snd(ctx, 'notify');
    ctx.toast('Checkmate! +' + grant + ' jump' + (grant > 1 ? 's' : '') + '. ' + (summit ? 'Super jump to the crown!' : 'Climb to floor ' + (from + 2) + ': \u2190 \u2192 walk, Space jump, X super jump.'), 4200);
    climbKeys(true); climbPad(ctx, true);
  }
  function endClimb(ctx) { var w = TW(ctx); w.climb = null; w.pos = null; w.replay = false; climbKeys(false); climbPad(ctx, false); }
  function crownWin(ctx) {
    endClimb(ctx); var w = TW(ctx); w.jumps = 0; tower._last = null;
    snd(ctx, 'superjump'); snd(ctx, 'game-end');
    var G = ctx.game, opp = G.opponent || {};
    CM.gameUI.showOver({ result: 'win', title: 'You Take the Crown!', whyRaw: 'You climbed every floor of the tower', you: Object.assign({}, ctx.spec.player), opp: { name: opp.name, avatar: opp.avatar }, delay: 300 });
  }
  function towerOver(ctx, over, k) {
    if (over.w !== ctx.human) return;
    var lv = (ctx.params.levels || [])[k] || {};
    startClimb(ctx, k, lv.jumps || 1);
  }

  function tower(ctx, opts) {
    opts = opts || {};
    var w = TW(ctx);
    if (opts.stacks && !w.stackInit) {   /* first entry: restore the remembered stack */
      w.stackInit = true; var want = stackPick(ctx);
      if (want.name !== 'Famous' || !w.stackLevels) { applyStack(ctx, opts, want); if (want.name !== 'Famous') { ctx.game.newGame(); return Promise.resolve(null); } }
    }
    stackBar(ctx, opts);
    var levels = ctx.params.levels || [], n = levels.length, k = lvIndex(ctx), top = k === n - 1;
    if (w.climb && !w.replay && k !== w.climb.from) { w.climb = null; w.pos = null; }
    var pal = top ? PAL.top : PAL.live, bg = opts.room ? '#646130' : '#5a2f3d';
    var prevK = tower._last && tower._last.id === ctx.spec.id ? tower._last.k : k;
    if (w.pos) prevK = k;
    tower._last = { id: ctx.spec.id, k: k };
    return CM.scene3d.attach(ctx, {
      board: { light: pal[0], dark: pal[1], edge: '#35120e', thickness: 0.3, basic: true },
      pieces: 'sprite', spriteFallback: 'glyph', spriteScale: .86, spriteLift: .06,
      lastColor: '#1f9e86', lastOpacity: .75,
      background: bg, ambient: 1.4, sun: .9,
      camera: { theta: 0, phi: Math.PI / 2 - 0.0001, dist: 13.4, target: [0, (w.pos && !w.replay ? w.pos.y + 1.2 : prevK * PITCH), 0], fov: 40 }
    }).then(function (S) {
      if (!S) return null;
      var T = S.THREE; S.climbOK = true;
      S.root.rotation.x = Math.PI / 2;            /* the board stands upright, rank 8 at the top, facing the camera */
      S.root.position.y = k * PITCH;
      for (var j = 0; j < n; j++) {
        if (j === k) continue;
        var done = j < k, p2 = j === n - 1 ? PAL.top : done ? PAL.done : PAL.live;
        var bc = boardCanvas(ctx, levels[j].fen, p2, { mated: done }), tx = new T.CanvasTexture(bc.canvas); tx.colorSpace = T.SRGBColorSpace;
        bc.ready.then((function (t) { return function () { t.needsUpdate = true; }; })(tx));
        var edge = new T.MeshBasicMaterial({ color: '#35120e' }), face = new T.MeshBasicMaterial({ map: tx });
        var box = new T.Mesh(new T.BoxGeometry(8, 8, 0.3), [edge, edge, edge, edge, face, edge]);
        box.position.set(0, j * PITCH, -0.15); S.scene.add(box);
      }
      /* side brackets: the mid-height ledges that keep every floor climbable (ours; two super jumps at most) */
      var bm = new T.MeshBasicMaterial({ color: '#4a1c0c' });
      for (var b = 0; b < n; b++) [-4.32, 4.32].forEach(function (x) { var br = new T.Mesh(new T.BoxGeometry(.75, .16, .5), bm); br.position.set(x, b * PITCH - .02, .1); S.scene.add(br); });
      /* the crown over the summit board */
      var crownUrl = 'assets/modes/' + ctx.spec.id + '/crown3d.png', ctex = S.tex(crownUrl), crown;
      if (ctex) crown = new T.Sprite(new T.SpriteMaterial({ map: ctex, transparent: true }));
      else crown = new T.Sprite(new T.SpriteMaterial({ map: textTex(T, function (g) {
        g.fillStyle = '#a8243a'; [[70, 95], [128, 85], [186, 95]].forEach(function (b2) { g.beginPath(); g.arc(b2[0], b2[1], 52, 0, Math.PI * 2); g.fill(); });
        g.fillStyle = '#ffc44f'; g.fillRect(36, 128, 184, 40); g.fillRect(122, 10, 12, 40); g.fillRect(110, 20, 36, 10);
      }, 256, 190), transparent: true }));
      crown.scale.set(5.4, 3.95, 1); var crownY = (n - 1) * PITCH + 4 + 2.6; crown.position.set(0, crownY, 0.4); S.scene.add(crown);
      if (opts.room) {
        var wood = new T.Mesh(new T.PlaneGeometry(80, 14), new T.MeshBasicMaterial({ color: '#682708' })); wood.position.set(0, -4 - 7 + 3.2, -6); S.scene.add(wood);
        for (var wp = -5; wp <= 5; wp++) { var pn = new T.Mesh(new T.PlaneGeometry(4.2, 5), new T.MeshBasicMaterial({ color: '#5a2106' })); pn.position.set(wp * 5.4, -5.5, -5.98); S.scene.add(pn); }
      }
      var deb = [], dm = new T.MeshBasicMaterial({ color: opts.room ? '#4b4823' : '#3e1f29' });
      for (var d = 0; d < 26; d++) { var m = new T.Mesh(new T.PlaneGeometry(.12, .07), dm); m.position.set((Math.random() - .5) * 26, k * PITCH + (Math.random() - .5) * 16, -2 - Math.random() * 3); m.rotation.z = Math.random() * 3; S.scene.add(m); deb.push(m); }
      /* the climber: a white pawn */
      var climb = new T.Sprite(new T.SpriteMaterial({ map: S.tex(ctx.game.pieceImage({ t: 'P', c: 'w' })) || textTex(T, function (g2) { g2.font = '52px "DejaVu Sans",serif'; g2.textAlign = 'center'; g2.textBaseline = 'middle'; g2.lineWidth = 5; g2.strokeStyle = '#1b1b1b'; g2.strokeText('\u265f', 32, 34); g2.fillStyle = '#fff'; g2.fillText('\u265f', 32, 34); }, 64, 64), transparent: true }));
      climb.scale.set(.8, .8, 1); var cy = k * PITCH + 4 + .38; climb.position.set(1.5, cy, .25); climb.renderOrder = 2; S.scene.add(climb);
      /* a soft teal halo marks the climber among the board's own pawns (ours; the game's pawn is a lone 3D figure) */
      var halo = new T.Sprite(new T.SpriteMaterial({ map: textTex(T, function (g3, w3, h3) { var gr = g3.createRadialGradient(w3 / 2, h3 / 2, 4, w3 / 2, h3 / 2, w3 / 2); gr.addColorStop(0, 'rgba(120,255,225,.85)'); gr.addColorStop(.45, 'rgba(31,158,134,.55)'); gr.addColorStop(1, 'rgba(31,158,134,0)'); g3.fillStyle = gr; g3.fillRect(0, 0, w3, h3); }, 64, 64), transparent: true, depthWrite: false }));
      halo.scale.set(1.35, 1.35, 1); halo.renderOrder = 1; S.scene.add(halo);
      var place = function (x, y) { climb.position.set(x, y, .25); halo.position.set(x, y, .2); };
      place(1.5, cy);
      /* HUD: height in feet, stack + floor label, jump counter */
      var ft = hud('g6-3d-ft', 'left:8px;top:6px'), lab = hud('g6-3d-lab', 'left:0;right:0;top:6px;text-align:center'), jc = hud('g6-3d-jumps', 'right:8px;top:6px;text-align:right');
      var feet = function (y) { return (Math.max(0, y) * 6.3 + 8.69).toFixed(2) + ' ft'; };
      var stackName = (w.stack && w.stack.name) || opts.stack || 'Influencer';
      if (lab) lab.textContent = stackName + ' ' + (k + 1) + '/' + n;
      var L = null, need = null, needAt = '';
      function paintJumps() {
        if (!jc) return;
        var t = 'Jumps ' + w.jumps;
        if (w.climb && w.pos) {
          var summit = w.climb.from >= n - 1, goal = summit ? crownY - 0.6 : (w.climb.from + 1) * PITCH + 4.0, at = w.pos.x.toFixed(1) + '|' + w.pos.y.toFixed(2);
          if (needAt !== at && w.pos.ground && L) {
            needAt = at; var under = null; L.forEach(function (l) { if (Math.abs(l.y - w.pos.y) < 1e-3 && w.pos.x >= l.x0 - .15 && w.pos.x <= l.x1 + .15) under = l; });
            need = under ? jumpsNeeded(L, under, goal, summit ? { x0: -2.4, x1: 2.4, y: crownY - 0.6 } : null) : need;
          }
          if (need != null) t += '<br><span style="font-size:10px;opacity:.85">need ' + (need > 8 ? '?' : need) + '</span>';
        }
        if (jc._t !== t) { jc._t = t; jc.innerHTML = t; } var pn2 = document.getElementById('g6-3d-padn'); if (pn2) pn2.textContent = w.jumps;
      }
      if (ft) ft.textContent = feet(w.pos ? w.pos.y : prevK * PITCH);
      if (!w.pos && prevK !== k) {
        var y0 = prevK * PITCH + 4 + .38; place(1.5, y0);
        S.tween(function (e) { place(1.5, y0 + (cy - y0) * e + Math.sin(e * Math.PI) * 1.6); if (ft) ft.textContent = feet(prevK * PITCH + (k - prevK) * PITCH * e); }, 1100);
      } else if (ft && !w.pos) ft.textContent = feet(k * PITCH);
      if (!w.pos) S.setCamera(top ? { target: [0, k * PITCH + 2.3, 0], dist: 18.2 } : { target: [0, k * PITCH, 0] }, prevK !== k ? 1100 : 0);
      if (w.climb && ctx.game.over && !w.replay) { climbKeys(true); climbPad(ctx, true); }   /* re-attached mid-climb (resize / re-render) */
      paintJumps();
      var t0 = performance.now(), fellSnd = false;
      S.o.onFrame = function (S2, dt, now) {
        var P = w.pos;
        if (w.climb && P && ctx.game.over && !w.replay) {
          if (!L) L = ledges(ctx, levels, k);
          step(P, dt);
          place(P.x, P.y + .38);
          var ty = P.y + 1.2, tgt = S.cam.target;
          if (calm()) tgt.set(0, ty, 0); else tgt.lerp(new T.Vector3(0, ty, 0), Math.min(1, dt * 4));
          if (S.cam.dist !== 13.4) S.cam.dist = 13.4;
          if (ft) ft.textContent = feet(P.y);
          paintJumps();
          var from = w.climb.from;
          if (from >= n - 1) { if (Math.abs(P.x) < 2.4 && P.y >= crownY - 0.6) crownWin(ctx); }
          else if (P.ground && P.y >= (from + 1) * PITCH + 4.0) {   /* made it: the next floor goes live */
            snd(ctx, 'land'); endClimb(ctx); tower._last = { id: ctx.spec.id, k: from + 1 }; ctx.game.newGame();
          }
        } else if (P) place(P.x, P.y + .38);
        if (calm()) return;
        var s = (now - t0) / 1000;
        crown.position.y = crownY + Math.sin(s * 1.2) * .08;
        deb.forEach(function (m2, i) { m2.position.y += dt * (.05 + (i % 5) * .02); m2.rotation.z += dt * .3; if (m2.position.y > k * PITCH + 9) m2.position.y -= 18; });
      };
      function step(P, dt) {
        var sub = Math.max(1, Math.ceil(dt / (1 / 120))), h = dt / sub;
        if (keys.j && P.ground) { P.vy = Math.sqrt(2 * PHY.grav * PHY.jumpH); P.ground = false; snd(ctx, 'jump'); }
        if (keys.s && P.ground) {
          if (w.jumps > 0) { w.jumps--; P.vy = Math.sqrt(2 * PHY.grav * PHY.superH); P.ground = false; snd(ctx, 'superjump'); }
          else ctx.toast('No jumps left: replay the board you cleared to earn one.', 2400);
        }
        keys.j = 0; keys.s = 0;
        P.vx = ((keys.r ? 1 : 0) - (keys.l ? 1 : 0)) * PHY.speed;
        for (var i = 0; i < sub; i++) {
          var px = P.x, py = P.y;
          P.x += P.vx * h; P.x = Math.max(-6, Math.min(6, P.x));
          if (P.ground && !support(P.x, P.y)) P.ground = false;
          if (!P.ground) {
            P.vy = Math.max(-PHY.maxFall, P.vy - PHY.grav * h); P.y += P.vy * h;
            if (P.vy <= 0) {
              var land = null;
              for (var q = 0; q < L.length; q++) { var l = L[q]; if (py >= l.y - 1e-6 && P.y <= l.y && P.x >= l.x0 - .15 && P.x <= l.x1 + .15 && (!land || l.y > land.y)) land = l; }
              /* off the side of the tower: you drop about a floor, then catch the seam below */
              if (!land && Math.abs(P.x) > 4.15 && P.peak - P.y > PITCH * .9) {
                for (var q2 = 0; q2 < L.length; q2++) { var l2 = L[q2]; if (l2.kind !== 'seam' && l2.kind !== 'ground') continue; if (py >= l2.y && P.y <= l2.y && (!land || l2.y > land.y)) land = l2; }
                if (land) P.x = P.x > 0 ? 3.7 : -3.7;
              }
              if (land) {
                if (P.peak - land.y > 3) { ctx.toast('You fell ' + Math.round((P.peak - land.y) * 6.3) + ' ft.', 1800); }
                if (P.vy < -6) snd(ctx, 'land');
                P.y = land.y; P.vy = 0; P.ground = true; P.peak = land.y; fellSnd = false;
              }
            }
            if (!P.ground) { if (P.y > P.peak) P.peak = P.y; if (!fellSnd && P.peak - P.y > 3) { fellSnd = true; snd(ctx, 'fall'); } }
          }
        }
      }
      function support(x, y) { for (var q = 0; q < L.length; q++) { var l = L[q]; if (Math.abs(l.y - y) < 1e-4 && x >= l.x0 - .15 && x <= l.x1 + .15) return true; } return false; }
      S.qa = function () { return { k: k, jumps: w.jumps, climb: w.climb, pos: w.pos && { x: w.pos.x, y: w.pos.y, ground: w.pos.ground }, crownY: crownY, need: need, ledges: (L || ledges(ctx, levels, k)).length }; };
      return S;
    });
  }

  /* ------------------------------------------------------------------ Beyond the Board ------------------------------------------------------------------ */
  var hymnEl = null, hymnOn = false;
  function hymn(on) {
    hymnOn = on;
    if (!hymnEl && on) {
      hymnEl = new Audio('assets/modes/xlErokL2-4c/sinking_hymn.wav'); hymnEl.loop = true; hymnEl.preload = 'auto';
      CM.bus.on('settings', function () { hymn(hymnOn); });
    }
    if (!hymnEl) return;
    var en = CM.sound.enabled();
    if (on && en) { hymnEl.volume = Math.max(0, Math.min(1, CM.sound.volume() * 0.35)); if (hymnEl.paused) { var r = hymnEl.play(); if (r && r.catch) r.catch(function () { /* waits for a gesture */ }); } }
    else if (!hymnEl.paused) hymnEl.pause();
  }
  function isVoid(p) { return p && p.t === 'Vd'; }
  function hexTex(T, n, up) {
    return textTex(T, function (g, w, h) {
      var cx = w / 2, cy = h / 2;
      function hexa(r, lw, a) { g.globalAlpha = a; g.lineWidth = lw; g.beginPath(); for (var k = 0; k < 6; k++) { var an = Math.PI / 6 + k * Math.PI / 3, x = cx + r * Math.cos(an), y = cy + r * Math.sin(an); if (k) g.lineTo(x, y); else g.moveTo(x, y); } g.closePath(); g.stroke(); }
      g.strokeStyle = '#ffffff'; g.shadowColor = '#ffffff'; g.shadowBlur = 6;
      hexa(56, 6, 1);
      for (var k = 0; k < n; k++) hexa(44 - k * 10, 5, 1);
      for (var k2 = n; k2 < 4; k2++) hexa(44 - k2 * 10, 2, .25);
      if (up) { g.globalAlpha = 1; g.shadowBlur = 0; g.fillStyle = '#fff'; g.font = '700 22px system-ui,sans-serif'; g.textAlign = 'center'; g.fillText('\u2191', cx, cy + 8); }
    });
  }
  function beyond(ctx) {
    var k = lvIndex(ctx), first = k === 0, levels = ctx.params.levels || [], last = k === levels.length - 1, lv = levels[k] || {};
    var bg = first ? '#c2c2c2' : '#2b2b2e', g = ctx.V.geo;
    hymn(k >= 2);
    var kingSq = function (c) { var r = -1; c.state.b.forEach(function (p, i) { if (p && p.c === 'b' && c.V.def(p.t).royal) r = i; }); return r; };
    var heightOf = first ? null : function (c, i) {
      var r = g.row(i), h = r <= 2 ? 1.0 : r <= 4 ? 0.5 : 0, x = c.state.x || {};
      if (x.boss && x.up && i === kingSq(c)) h += 1.1;   /* the switch lifts the Eldritch King on its column */
      return h;
    };
    var theta0 = first ? 0.35 : 0.6;
    return CM.scene3d.attach(ctx, {
      board: { light: first ? '#e8e6e2' : '#c6c6c6', dark: first ? '#1f1f21' : '#111112', edge: first ? '#7f5340' : '#1a1a1b', thickness: first ? 0.45 : 7 },
      pieces: 'mesh', highlights: false,
      colors: { w: { color: '#d8d8d8', emissive: '#3a3a3a', roughness: .7 }, b: { color: '#3a3a3c', roughness: .75 } },
      pieceStyle: function (c, p) {
        var d = c.V.def(p.t) || {};
        if (p.c === 'b' && d.royal) return last ? { color: '#b0202a', emissive: '#5a0c12' } : { color: '#1c1c1e', emissive: '#3a0508' };
        return null;
      },
      heightOf: heightOf,
      squareVisible: function (c, i) { return !isVoid(c.state.b[i]); },
      background: bg, fog: first ? null : { color: bg, near: 14, far: 34 }, ambient: first ? 1.3 : 0.9, sun: 1.5,
      camera: { theta: theta0, phi: first ? 0.95 : 0.9, dist: first ? 17 : 17, target: first ? [0.7, 0, -0.4] : [0, 0.2, 0.6], fov: 40 }
    }).then(function (S) {
      if (!S) return null;
      var T = S.THREE, G = ctx.game, th = first ? 0.45 : 7;
      if (first) {
        var frame = new T.Mesh(new T.BoxGeometry(g.files + .7, .42, g.ranks + .7), new T.MeshStandardMaterial({ color: '#8a5a44', roughness: .8 }));
        frame.position.y = -.26; frame.receiveShadow = true; S.root.add(frame); S.frame = frame;
        var ctex = S.tex('assets/modes/xlErokL2-4c/chess_clock.png');
        var clock = ctex ? new T.Sprite(new T.SpriteMaterial({ map: ctex, transparent: true })) : new T.Mesh(new T.BoxGeometry(2.4, 1.3, .9), new T.MeshStandardMaterial({ color: '#6b6b6b' }));
        if (ctex) { ctex = ctex.clone(); ctex.repeat.set(1, .78); ctex.needsUpdate = true; clock.material.map = ctex; clock.scale.set(2.4, 1.87, 1); }
        clock.position.set(g.files / 2 + 1.3, 1.0, -2.6); S.root.add(clock); S.clock = clock;
      }
      var glow = new T.Group(), sig = ''; S.root.add(glow);
      var pm = new T.MeshStandardMaterial({ color: '#141415', roughness: .9 });
      G.state.b.forEach(function (p, i) { var d = p && ctx.V.def(p.t); if (!d || !d.blocker || isVoid(p)) return; var col = new T.Mesh(new T.BoxGeometry(1, 1.4, 1), pm); col.position.copy(S.sq2world(i, .7)); col.castShadow = true; col.userData.sq = i; S.root.add(col); });
      var gm = new T.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: .92 }), gm2 = new T.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: .45 });
      var rm = new T.MeshBasicMaterial({ color: '#e0333a', transparent: true, opacity: .85, side: T.DoubleSide });
      var tile = new T.PlaneGeometry(.62, .62).rotateX(-Math.PI / 2), ring = new T.RingGeometry(.36, .45, 32).rotateX(-Math.PI / 2), frameG = new T.RingGeometry(.42, .5, 4, 1, Math.PI / 4).rotateX(-Math.PI / 2);
      /* switch discs */
      var swG = new T.CylinderGeometry(.3, .34, .08, 6), swOff = new T.MeshStandardMaterial({ color: '#9a9a9a', emissive: '#222', roughness: .5 }), swOn = new T.MeshStandardMaterial({ color: '#ffffff', emissive: '#bbbbbb', roughness: .4 });
      var swMesh = {};
      Object.keys(lv.buttons || {}).forEach(function (nm) { var i = g.parse(nm); if (i < 0) return; var m = new T.Mesh(swG, swOff); m.userData.sq = i; S.root.add(m); swMesh[nm] = m; });
      function rebuildGlow() {
        var st = G.state; if (!st) return;
        var s = [G.sel, G.history ? G.history.length : 0, st.b.map(function (p) { return p ? p.t + p.c : ''; }).join(',')].join('|'); if (s === sig) return; sig = s;
        while (glow.children.length) glow.remove(glow.children[0]);
        var Lm = G.last; if (Lm && Lm.f >= 0 && Lm.f !== Lm.t) [Lm.f, Lm.t].forEach(function (i) { if (isVoid(st.b[i])) return; var m = new T.Mesh(frameG, gm2); m.position.copy(S.sq2world(i, .01)); m.userData.sq = i; glow.add(m); });
        if (G.sel >= 0) {
          var sm = new T.Mesh(frameG, gm); sm.position.copy(S.sq2world(G.sel, .012)); sm.userData.sq = G.sel; glow.add(sm);
          (G.moves || []).forEach(function (m) { if (m.f !== G.sel) return; var t = new T.Mesh(m.cap ? ring : tile, m.cap ? rm : gm); t.position.copy(S.sq2world(m.t, .012)); t.userData.sq = m.t; glow.add(t); });
        }
        if (!first) st.b.forEach(function (p, i) { if (!p || p.c !== 'b') return; var d = ctx.V.def(p.t) || {}; if (d.blocker || d.royal) return; var r = new T.Mesh(ring, rm); r.position.copy(S.sq2world(i, .011)); glow.add(r); });
        var x = st.x || {};
        Object.keys(swMesh).forEach(function (nm) { var i = g.parse(nm), m = swMesh[nm]; m.position.copy(S.sq2world(i, .04)); m.material = x.act === nm && x.tick > 0 ? swOn : swOff; });
      }
      /* platforms rising out of / sinking into the abyss */
      var vis = {}, anim = {};
      function platforms(now) {
        S.sqMeshes.forEach(function (m, i) {
          if (!m) return; var v = !isVoid(G.state.b[i]);
          if (vis[i] == null) { vis[i] = v; return; }
          if (vis[i] !== v) { vis[i] = v; anim[i] = { t0: now, up: v }; }
          var a = anim[i]; if (!a) return;
          var k2 = calm() ? 1 : Math.min(1, (now - a.t0) / 650), e = 1 - Math.pow(1 - k2, 3), base = S.sq2world(i, -th / 2);
          if (a.up) { m.visible = true; m.position.set(base.x, base.y - 6 * (1 - e), base.z); }
          else { m.visible = k2 < 1; m.position.set(base.x, base.y - 6 * e, base.z); }
          if (k2 >= 1) { delete anim[i]; m.position.copy(base); m.visible = v; }
        });
      }
      /* tick counter over the rook + the Eldritch King's hexagons */
      var tickSp = new T.Sprite(new T.SpriteMaterial({ transparent: true, depthTest: false })); tickSp.scale.set(.75, .75, 1); tickSp.visible = false; S.root.add(tickSp);
      var hexSp = new T.Sprite(new T.SpriteMaterial({ transparent: true, depthTest: false })); hexSp.scale.set(1.1, 1.1, 1); hexSp.visible = false; S.root.add(hexSp);
      var lastTick = -1, lastHex = '';
      function counters() {
        var st = G.state, x = st.x || {}, rook = -1; st.b.forEach(function (p, i) { if (p && p.c === 'w') rook = i; });
        var tk = x.tick > 0 && rook >= 0 ? x.tick : 0;
        if (tk !== lastTick) { lastTick = tk; if (tk) { if (tickSp.material.map) tickSp.material.map.dispose(); tickSp.material.map = textTex(T, function (c2, w2, h2) { c2.fillStyle = '#fff'; c2.shadowColor = '#000'; c2.shadowBlur = 8; c2.font = '700 84px system-ui,sans-serif'; c2.textAlign = 'center'; c2.textBaseline = 'middle'; c2.fillText(String(tk), w2 / 2, h2 / 2 + 4); }); tickSp.material.needsUpdate = true; } }
        tickSp.visible = !!tk; if (tk) tickSp.position.copy(S.sq2world(rook, 1.55));
        var ks = x.boss ? kingSq(ctx) : -1, hk = ks >= 0 ? (x.hex || 0) + (x.up ? 'u' : '') : '';
        if (hk !== lastHex) { lastHex = hk; if (ks >= 0) { if (hexSp.material.map) hexSp.material.map.dispose(); hexSp.material.map = hexTex(T, x.hex || 0, x.up); hexSp.material.needsUpdate = true; } }
        hexSp.visible = ks >= 0; if (ks >= 0) hexSp.position.copy(S.sq2world(ks, 1.9));
      }
      /* the beam */
      var beamSeen = null, beams = [];
      function beam(now) {
        var x = G.state.x || {}, B = x.beam;
        if (B && B !== beamSeen) {
          beamSeen = B; snd(ctx, 'beam');
          var a = S.sq2world(B.f, .75), b = B.t >= 0 ? S.sq2world(B.t, .5) : a.clone().add(new T.Vector3(0, 1.2, 0));
          var len = Math.max(.3, a.distanceTo(b)), mid = a.clone().add(b).multiplyScalar(.5);
          var grp = new T.Group();
          [[.09, '#ffffff', 1], [.22, '#ff3b3b', .45]].forEach(function (s2) { var cyl = new T.Mesh(new T.CylinderGeometry(s2[0], s2[0], len, 12, 1, true), new T.MeshBasicMaterial({ color: s2[1], transparent: true, opacity: s2[2], depthWrite: false })); grp.add(cyl); });
          grp.position.copy(mid); grp.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), b.clone().sub(a).normalize());
          S.root.add(grp); beams.push({ g: grp, t0: now });
          if (B.hit >= 0) ctx.toast('The Eldritch beam strikes!', 1600);
          else if (B.t < 0) ctx.toast('The beam fizzles: you are out of its line.', 1600);
        }
        beams = beams.filter(function (o) { var k3 = (now - o.t0) / (calm() ? 500 : 750); if (k3 >= 1) { S.root.remove(o.g); return false; } if (!calm()) o.g.children.forEach(function (c3) { c3.material.opacity = c3.material.opacity * 0 + (1 - k3) * (c3.geometry.parameters.radiusTop > .1 ? .45 : 1); }); return true; });
      }
      /* wall symbols: black monoliths beside the board with the hexagon glyph; tap to read the hint */
      var marks = [], wrap = document.getElementById('board-wrap');
      Array.prototype.slice.call(document.querySelectorAll('.g6-3d-sym')).forEach(function (e) { e.remove(); });
      (lv.hints || []).forEach(function (hnt, hi) {
        var i = g.parse(hnt.at); if (i < 0) return;
        var c = g.col(i), r = g.row(i), dx = c <= 0 ? -1 : c >= g.files - 1 ? 1 : 0, dz = dx ? 0 : (r <= 0 ? -1 : r >= g.ranks - 1 ? 1 : (r < g.ranks / 2 ? -1 : 1));
        var base = S.sq2world(i, 0), mono = new T.Mesh(new T.BoxGeometry(.7, 3.2, .7), new T.MeshStandardMaterial({ color: '#0d0d0e', roughness: .95 }));
        mono.position.set(base.x + dx * 1.15, base.y + .6, base.z + dz * 1.15); S.root.add(mono);
        var bt = document.createElement('button'); bt.type = 'button'; bt.className = 'g6-3d-hud g6-3d-sym'; bt.setAttribute('aria-label', 'Wall symbol: read the hint');
        bt.innerHTML = '\u2b21'; bt.title = 'Wall symbol';
        bt.style.cssText = 'position:absolute;z-index:6;width:34px;height:34px;margin:-17px 0 0 -17px;border-radius:50%;border:1px solid rgba(255,255,255,.55);background:rgba(10,10,12,.55);color:#fff;font:400 20px/1 system-ui,sans-serif;cursor:pointer;padding:0;text-shadow:0 0 6px #fff';
        bt.onclick = function (ev) { ev.stopPropagation(); bt.style.background = 'rgba(255,255,255,.25)'; ctx.toast(hnt.text, 5200); snd(ctx, 'notify'); };
        if (wrap) wrap.appendChild(bt);
        marks.push({ el: bt, obj: mono });
      });
      function placeMarks() {
        if (!marks.length) return;
        var r = S.canvas.getBoundingClientRect(), wr = wrap.getBoundingClientRect();
        marks.forEach(function (m) {
          var p = m.obj.position.clone(); p.y += 1.2; S.root.localToWorld(p); p.project(S.camera);
          var on = p.z < 1 && Math.abs(p.x) < 1.05 && Math.abs(p.y) < 1.05;
          m.el.style.display = on ? '' : 'none';
          m.el.style.left = (r.left - wr.left + (p.x + 1) / 2 * r.width) + 'px'; m.el.style.top = (r.top - wr.top + (1 - p.y) / 2 * r.height) + 'px';
        });
      }
      var em = [], emm = new T.MeshBasicMaterial({ color: first ? '#ffffff' : '#e8e8e8', transparent: true, opacity: .8 });
      if (!first) for (var e = 0; e < 40; e++) { var mo = new T.Mesh(new T.SphereGeometry(.03, 6, 4), emm); mo.position.set((Math.random() - .5) * 16, -4 + Math.random() * 9, (Math.random() - .5) * 16); S.scene.add(mo); em.push(mo); }
      S.o.onFrame = function (S2, dt, now) {
        if (S.cutscene) return;
        rebuildGlow(); platforms(now); counters(); beam(now); placeMarks();
        if (calm()) return;
        em.forEach(function (m, i) { m.position.y += dt * (.12 + (i % 4) * .04); if (m.position.y > 6) m.position.y = -4; });
      };
      /* camera rotate: corner buttons, right click, Q / E */
      var old = document.getElementById('g6-3d-rot'); if (old) old.remove();
      var bar = document.createElement('div'); bar.id = 'g6-3d-rot'; bar.className = 'g6-3d-hud';
      bar.style.cssText = 'position:absolute;right:6px;bottom:6px;z-index:6;display:flex;gap:6px';
      [['\u27f2', 1, 'Rotate camera left'], ['\u27f3', -1, 'Rotate camera right']].forEach(function (b) {
        var bt = document.createElement('button'); bt.type = 'button'; bt.textContent = b[0]; bt.title = b[2]; bt.setAttribute('aria-label', b[2]);
        bt.style.cssText = 'width:34px;height:34px;border-radius:8px;border:1px solid rgba(255,255,255,.45);background:rgba(20,20,22,.6);color:#fff;font-size:18px;line-height:1;cursor:pointer';
        bt.onclick = function (ev) { ev.stopPropagation(); S.rotate(b[1] * Math.PI / 2, 500); };
        bar.appendChild(bt);
      });
      if (wrap) wrap.appendChild(bar);
      S.canvas.addEventListener('contextmenu', function (ev) { ev.preventDefault(); S.rotate(Math.PI / 2, 500); });
      var key = function (ev) { if (CM.scene3d.current() !== S) { document.removeEventListener('keydown', key); return; } if (/input|textarea/i.test((ev.target || {}).tagName || '')) return; if (ev.key === 'q' || ev.key === 'Q') S.rotate(Math.PI / 2, 500); else if (ev.key === 'e' || ev.key === 'E') S.rotate(-Math.PI / 2, 500); };
      document.addEventListener('keydown', key);
      S.cleanupKey = key;
      S.qa = function () { var x = G.state.x || {}; return { level: k, tick: x.tick || 0, hex: x.hex || 0, up: !!x.up, voids: G.state.b.filter(isVoid).length, hidden: S.sqMeshes.filter(function (m) { return m && !m.visible; }).length, marks: marks.length, hymn: !!(hymnEl && !hymnEl.paused), hymnOn: hymnOn }; };
      return S;
    });
  }

  /* cutscene driver: f(k 0..1) over ms, eased; snaps under reduced motion */
  function play(S, ms, f) {
    return new Promise(function (res) {
      if (!S || calm()) { f(1); setTimeout(res, calm() ? 350 : 0); return; }
      var t0 = performance.now();
      (function tick(now) { var k = Math.min(1, (now - t0) / ms); f(k); if (k < 1 && CM.scene3d.current() === S) requestAnimationFrame(tick); else res(); })(t0);
    });
  }
  /* the kidnapping: the first check on the opening board */
  function kidnap(ctx, mv) {
    var S = CM.scene3d.current(), T = S && S.THREE, st = ctx.state, keep = -1;
    st.b.forEach(function (p, i) { if (p && p.c === 'w' && p.t === 'R' && (keep < 0 || i === mv.t)) keep = i; });
    snd(ctx, 'kidnap'); ctx.toast('The pieces have been kidnapped! The king flees beyond the board\u2026', 3600);
    if (!S) { ctx.fx({ type: 'fade_board', duration_ms: 900 }); return wait(1400); }
    S.sync(); S.cutscene = true;
    var objs = [], king = null, bgA = new T.Color('#c2c2c2'), bgB = new T.Color('#2b2b2e');
    Object.keys(S.pieces).forEach(function (key) {
      var i = +key.split(':')[0], o = S.pieces[key], p = st.b[i]; if (!p || i === keep) return;
      if (p.c === 'b' && ctx.V.def(p.t).royal) king = { o: o, y0: o.position.y, x0: o.position.x, z0: o.position.z };
      else objs.push({ o: o, y0: o.position.y, d: Math.random() * .35 });
    });
    return play(S, 2200, function (k) {
      objs.forEach(function (a) { var e = Math.max(0, Math.min(1, (k - a.d) / .5)); a.o.position.y = a.y0 + e * e * 7; a.o.scale.setScalar(Math.max(.01, 1 - e)); });
      if (king) { var e1 = Math.min(1, k / .55), e2 = Math.max(0, (k - .55) / .45); king.o.position.z = king.z0 - e1 * (king.z0 + 4.6); king.o.position.y = king.y0 - e2 * e2 * 9; }
      S.scene.background = bgA.clone().lerp(bgB, Math.max(0, (k - .4) / .6));
      if (S.clock) S.clock.visible = k < .5;
    });
  }
  /* the plank collapses and the rook sinks through the abyss; the sinking hymn starts */
  function sinkPlank(ctx) {
    var S = CM.scene3d.current(), T = S && S.THREE;
    hymn(true);
    ctx.toast('The plank gives way\u2026 the sinking hymn.', 3200);
    if (!S) return wait(1200);
    S.sync(); S.cutscene = true;
    var bgA = S.scene.background ? S.scene.background.clone() : new T.Color('#2b2b2e'), bgB = new T.Color('#0b0b0d');
    var slabs = S.sqMeshes.filter(function (m) { return m && m.visible; }).map(function (m) { return { m: m, y0: m.position.y, d: Math.random() * .3 }; });
    var pcs = Object.keys(S.pieces).map(function (key) { return { o: S.pieces[key], y0: S.pieces[key].position.y }; });
    var t0 = S.cam.target.clone();
    return play(S, 2600, function (k) {
      slabs.forEach(function (a) { var e = Math.max(0, (k - a.d) / .7); a.m.position.y = a.y0 - e * e * 14; });
      pcs.forEach(function (a) { a.o.position.y = a.y0 - k * k * 16; });
      S.cam.target.set(t0.x, t0.y - k * k * 12, t0.z);
      S.scene.background = bgA.clone().lerp(bgB, k);
      if (S.scene.fog) S.scene.fog.color.copy(S.scene.background);
    });
  }
  /* afterMove (game hook) of the Beyond the Board mode file */
  function btbAfterMove(ctx, mv, info) {
    var k = lvIndex(ctx), lv = (ctx.params.levels || [])[k] || {};
    if (!lv.kidnap || info.by !== 'player' || ctx.over) return null;
    var V = ctx.V, st = ctx.state, ks = V.royals(st, 'b')[0];
    var hit = ks == null || ks < 0 || V.attacked(st, ks, 'w');
    if (!hit) return null;
    var gid = ctx.game.gid;
    return kidnap(ctx, mv).then(function () { if (ctx.game.gid !== gid) return; setLevel(ctx, k + 1); ctx.game.newGame(); });
  }
  /* onGameOver (game hook) of the Beyond the Board mode file; k = the level that just ended */
  function btbOver(ctx, over, k) {
    var levels = ctx.params.levels || [], lv = levels[k] || {}, gid = ctx.game.gid;
    if (k === 0) return;                                   /* the opening board keeps the normal result */
    if (over.w === ctx.human) {
      if (k >= levels.length - 1) { hymn(false); return; }   /* the end of the demo: keep the modal */
      hideOverSoon();
      (lv.plank ? sinkPlank(ctx) : wait(1100)).then(function () { if (ctx.game.gid === gid) ctx.game.newGame(); });
    } else {
      hideOverSoon();
      ctx.toast('You were taken: ' + (over.why || 'respawning') + '. Respawning\u2026', 2200);
      setTimeout(function () { if (ctx.game.gid === gid) ctx.game.newGame(); }, 1300);
    }
  }

  function detach() {
    clearHud(); climbKeys(false); hymn(false);
    ['g6-3d-rot', 'g6-3d-stacks', 'g6-3d-pad'].forEach(function (id) { var r = document.getElementById(id); if (r) r.remove(); });
    var c = CM.scene3d.current(); if (c && c.cleanupKey) document.removeEventListener('keydown', c.cleanupKey); CM.scene3d.detach();
  }
  CM.g6_3d = { tower: tower, towerSetup: towerSetup, towerOver: towerOver, beyond: beyond, btbAfterMove: btbAfterMove, btbOver: btbOver, detach: detach,
    _qa: { W: W, keys: keys, ledges: ledges, jumpsNeeded: jumpsNeeded, randomStack: randomStack } };
})();
