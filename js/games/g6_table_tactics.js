/* g6_table_tactics: Table Tactics (video xvlHij1tgk8), group 6. A turn-based, physics-driven tactics game on a
   kitchen-table diorama. Your green units defend the castle against purple slimes (and a dragon) that march on it.
   Nothing has health: a unit is defeated only when it is physically knocked over. Every hit adds "tilt" (impulse /
   mass); tilt 1 or more = it topples. Tilt settles back by 60% each round, so a big unit needs a hard hit or several
   quick ones. Each enemy knocked over pays 1 coin; spend coins in the build menu. Enemies that reach the castle cost
   a heart (5 hearts). Survive 9 waves and knock over everything left to finish the level.
   Original art drawn with canvas paths; sounds are synthesised WAVs in assets/modes/xvlHij1tgk8/.
   Source: research/modes/xvlHij1tgk8.json (rules list and transcript quotes). */
(function () {
  'use strict';
  var CM = window.CM;
  var W = 1000, H = 1000, CASTLE = { x: 500, y: 865, r: 62 }, WAVES = 9;
  var TYPES = {
    catapult: { name: 'Catapult', cost: 4, mass: 2.0, r: 30, move: 70, range: 430, desc: 'Lobs a marble that keeps rolling' },
    archer: { name: 'Archer', cost: 2, mass: 1.0, r: 22, move: 120, range: 470, desc: 'Precise arrow' },
    knight: { name: 'Cat Knight', cost: 3, mass: 1.4, r: 25, move: 150, range: 95, desc: 'Rams a neighbour; leaps again after a knockdown' },
    mage: { name: 'Fire Mage', cost: 4, mass: 1.0, r: 22, move: 110, range: 300, desc: 'Throws a bomb (hits everyone nearby)' },
    grand: { name: 'Grand Fire Mage', cost: 7, mass: 1.25, r: 25, move: 100, range: 340, desc: 'Bigger bomb' },
    tower: { name: 'Tower', cost: 5, mass: 4.5, r: 30, move: 0, range: 520, desc: 'Cannot move; long-range arrow' },
    slime: { name: 'Purple Slime', mass: 1.0, r: 24, speed: 120, enemy: true },
    meat: { name: 'Meat Slime', mass: 1.35, r: 27, speed: 100, enemy: true },
    dragon: { name: 'Dragon', mass: 3.2, r: 40, speed: 135, enemy: true }
  };
  var BUILD = ['archer', 'knight', 'mage', 'catapult', 'tower', 'grand'];
  var WALLS = [{ x: 140, y: 380, w: 210, h: 40 }, { x: 650, y: 380, w: 210, h: 40 }, { x: 430, y: 560, w: 140, h: 36 }, { x: 60, y: 690, w: 150, h: 34 }, { x: 790, y: 690, w: 150, h: 34 }];

  CM.defineGame('g6_table_tactics', function (host) {
    var cv = host.canvas, g = host.g, S, uid = 0, toolbar, raf = 0, grass = null, lastT = 0;
    /* video sprites (research/frames/sprites, copied into assets/modes/xvlHij1tgk8/ per owner instruction) */
    var IMG = {}, A = host.spec.assets || {};
    Object.keys(A).forEach(function (k) { var im = new Image(); im.onload = function () { im.ok = true; }; im.src = A[k]; IMG[k] = im; });
    function sprite(k, x, y, w, h) { var im = IMG[k]; if (!im || !im.ok) return false; g.drawImage(im, x, y, w, h); return true; }
    function rnd(a, b) { return a + Math.random() * (b - a); }
    function d2(a, b) { var dx = a.x - b.x, dy = a.y - b.y; return Math.sqrt(dx * dx + dy * dy); }
    function inWall(x, y, r) { for (var i = 0; i < WALLS.length; i++) { var w = WALLS[i]; if (x > w.x - r && x < w.x + w.w + r && y > w.y - r && y < w.y + w.h + r) return w; } return null; }
    function unit(type, x, y, side) { var T = TYPES[type]; return { id: ++uid, type: type, x: x, y: y, side: side, r: T.r, mass: T.mass, tilt: 0, wob: 0, vx: 0, vy: 0, fallen: 0, dead: false, moved: false, acted: false, bonus: false, fresh: false }; }

    function newGame() {
      uid = 0;
      S = { units: [unit('catapult', 380, 790, 'g'), unit('archer', 620, 790, 'g'), unit('knight', 500, 690, 'g'), unit('mage', 280, 730, 'g')],
        hearts: 5, coins: 3, wave: 0, phase: 'player', sel: null, mode: 'move', build: null, shots: [], fx: [], banner: { text: 'Your Turn', t: 1.6 }, log: [], busy: false, over: false, shake: 0, buildOpen: false };
      spawnWave(); spawnWave();
      S.units.forEach(function (u) { u.moved = u.acted = false; });
      select(S.units[0]); renderToolbar(); setStatus();
    }
    function enemies() { return S.units.filter(function (u) { return u.side === 'r' && !u.dead && !u.fallen; }); }
    function mine() { return S.units.filter(function (u) { return u.side === 'g' && !u.dead && !u.fallen; }); }
    function spawnWave() {
      S.wave++;
      if (S.wave > WAVES) return;
      var n = 1 + Math.floor(S.wave / 3);
      for (var k = 0; k < n; k++) {
        var t = S.wave >= 3 && Math.random() < 0.4 ? 'meat' : 'slime', x, tries = 0;
        do { x = rnd(80, 920); tries++; } while (tries < 20 && S.units.some(function (u) { return Math.abs(u.x - x) < 70 && u.y < 160; }));
        S.units.push(unit(t, x, rnd(50, 110), 'r'));
      }
      if (S.wave === 7) { S.units.push(unit('dragon', 500, 70, 'r')); host.toast('A dragon is coming!', 2600); host.sound('roar'); }
    }
    function setStatus() {
      if (!S) return;
      host.status('♥ ' + S.hearts + ' · coins ' + S.coins + ' · wave ' + Math.min(S.wave, WAVES) + '/' + WAVES + (S.phase === 'player' ? (S.sel ? ' · ' + TYPES[S.sel.type].name + ': ' + (S.mode === 'attack' ? 'tap a target' : 'tap where to move') : '') : ' · enemy turn'));
      host.hud('<span>♥ ' + S.hearts + '  ● ' + S.coins + '</span><span>Wave ' + Math.min(S.wave, WAVES) + '/' + WAVES + '</span>');
    }
    function select(u) { S.sel = u || null; S.build = null; if (u) S.mode = (!u.moved && TYPES[u.type].move) ? 'move' : 'attack'; renderToolbar(); setStatus(); }
    function nextUnit(dir) {
      var L = mine(); if (!L.length) return; var i = L.indexOf(S.sel); i = (i + (dir || 1) + L.length) % L.length; select(L[i]);
    }

    /* ---------------- toolbar (DOM over the canvas) ---------------- */
    function renderToolbar() {
      if (!toolbar) {
        toolbar = document.createElement('div'); toolbar.className = 'g6tt-bar';
        toolbar.style.cssText = 'position:absolute;left:0;right:0;bottom:0;display:flex;flex-wrap:wrap;gap:4px;justify-content:center;padding:4px;background:linear-gradient(transparent,rgba(0,0,0,.55));pointer-events:auto;font:600 12px/1 system-ui,sans-serif';
        host.el.appendChild(toolbar);
        toolbar.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b && !b.disabled) cmd(b.dataset.c); });
      }
      var u = S.sel, me = S.phase === 'player' && !S.busy && !S.over, h = '';
      function btn(c, label, on, pressed) { return '<button type="button" data-c="' + c + '"' + (on ? '' : ' disabled') + ' aria-pressed="' + !!pressed + '">' + label + '</button>'; }
      if (S.buildOpen) {
        BUILD.forEach(function (t) { h += btn('b:' + t, TYPES[t].name + ' ' + TYPES[t].cost + '●', me && S.coins >= TYPES[t].cost, S.build === t); });
        h += btn('close', 'Back', true);
      } else {
        h += btn('move', 'Move', me && u && !u.moved && TYPES[u.type].move > 0, S.mode === 'move' && !!u);
        h += btn('attack', 'Attack', me && u && !u.acted, S.mode === 'attack' && !!u);
        h += btn('next', 'Next unit', me);
        h += btn('build', 'Build (' + S.coins + '●)', me);
        h += btn('end', 'End turn', me, false);
      }
      toolbar.innerHTML = h;
    }
    function cmd(c) {
      if (S.over || S.phase !== 'player' || S.busy) return;
      if (c === 'move' && S.sel) S.mode = 'move';
      else if (c === 'attack' && S.sel) S.mode = 'attack';
      else if (c === 'next') nextUnit(1);
      else if (c === 'build') { S.buildOpen = true; }
      else if (c === 'close') { S.buildOpen = false; S.build = null; }
      else if (c === 'end') endTurn();
      else if (c.indexOf('b:') === 0) { S.build = c.slice(2); host.toast('Tap near your castle to place the ' + TYPES[S.build].name + '.', 2200); }
      renderToolbar(); setStatus();
    }

    /* ---------------- input ---------------- */
    function toWorld(e) {
      if (L3) { var hp = pick3d(e); if (hp) return hp; }
      var r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width * W, y: (e.clientY - r.top) / r.height * H };
    }
    function onDown(e) {
      if (!S || S.over || S.phase !== 'player' || S.busy) return;
      e.preventDefault(); var p = toWorld(e);
      if (S.build) { tryBuild(p); return; }
      var hit = mine().filter(function (u) { return d2(u, p) < u.r + 14; })[0];
      if (hit && !(S.mode === 'attack' && S.sel && S.sel.type === 'knight' && false)) { select(hit); return; }
      var u = S.sel; if (!u) return;
      if (S.mode === 'move') tryMove(u, p); else tryAttack(u, p);
    }
    function tryBuild(p) {
      var t = S.build, T = TYPES[t];
      if (d2(p, CASTLE) > 260 || p.y > H - 110) { host.toast('Place new units near your castle.', 1800); return; }
      if (inWall(p.x, p.y, T.r) || S.units.some(function (o) { return !o.dead && d2(o, p) < o.r + T.r; }) || d2(p, CASTLE) < CASTLE.r + T.r) { host.toast('No room there.', 1400); return; }
      S.coins -= T.cost; var u = unit(t, p.x, p.y, 'g'); u.moved = u.acted = true; u.fresh = true; S.units.push(u);
      S.build = null; S.buildOpen = false; host.sound('build'); log(T.name + ' built'); select(u); setStatus();
    }
    function tryMove(u, p) {
      var T = TYPES[u.type]; if (u.moved || !T.move) { S.mode = 'attack'; renderToolbar(); setStatus(); return; }
      var dx = p.x - u.x, dy = p.y - u.y, dd = Math.sqrt(dx * dx + dy * dy), lim = T.move * (u.bonus ? 1.3 : 1);
      if (dd > lim) { p = { x: u.x + dx / dd * lim, y: u.y + dy / dd * lim }; }
      p.x = Math.max(u.r, Math.min(W - u.r, p.x)); p.y = Math.max(u.r, Math.min(H - 95, p.y));
      if (inWall(p.x, p.y, u.r) || d2(p, CASTLE) < CASTLE.r + u.r || S.units.some(function (o) { return o !== u && !o.dead && !o.fallen && d2(o, p) < o.r + u.r; })) { host.sound('illegal'); host.toast('Blocked.', 1000); return; }
      S.busy = true; anim(u, p, 260, function () { u.moved = true; if (u.bonus) { u.bonus = false; } S.busy = false; if (!u.acted) S.mode = 'attack'; renderToolbar(); setStatus(); });
      host.sound('step');
    }
    function tryAttack(u, p) {
      var T = TYPES[u.type]; if (u.acted) { host.toast('This unit already attacked.', 1200); return; }
      var dd = d2(u, p);
      if (dd > T.range) { host.toast('Out of range.', 1000); return; }
      if (u.type === 'knight') {
        var tgt = S.units.filter(function (o) { return o !== u && !o.dead && !o.fallen && d2(o, p) < o.r + 20; })[0];
        if (!tgt || d2(tgt, u) > T.range + tgt.r) { host.toast('Tap a unit next to the knight.', 1300); return; }
        u.acted = true; S.busy = true; var home = { x: u.x, y: u.y }, ang = Math.atan2(tgt.y - u.y, tgt.x - u.x);
        anim(u, { x: tgt.x - Math.cos(ang) * (tgt.r + u.r - 4), y: tgt.y - Math.sin(ang) * (tgt.r + u.r - 4) }, 180, function () {
          host.sound('bonk'); var fell = hit(tgt, Math.cos(ang), Math.sin(ang), 1.3);
          anim(u, home, 200, function () { if (fell) { u.bonus = true; u.moved = false; host.toast('Knockout! The knight may leap again.', 1800); S.mode = 'move'; } settle(); });
        });
      } else if (u.type === 'archer' || u.type === 'tower') {
        var a = Math.atan2(p.y - u.y, p.x - u.x) + rnd(-0.035, 0.035);
        u.acted = true; S.busy = true; host.sound('twang');
        S.shots.push({ kind: 'arrow', x: u.x, y: u.y, vx: Math.cos(a) * 1500, vy: Math.sin(a) * 1500, life: T.range * 1.15 / 1500, power: u.type === 'tower' ? 0.9 : 0.85, from: u });
      } else if (u.type === 'catapult') {
        u.acted = true; S.busy = true; host.sound('launch');
        S.shots.push({ kind: 'marble', x: u.x, y: u.y, sx: u.x, sy: u.y, tx: p.x, ty: p.y, t: 0, dur: 0.55, rolling: false, from: u, power: 1.25 });
      } else {
        u.acted = true; S.busy = true; host.sound('launch');
        S.shots.push({ kind: 'bomb', x: u.x, y: u.y, sx: u.x, sy: u.y, tx: p.x, ty: p.y, t: 0, dur: 0.5, R: u.type === 'grand' ? 105 : 75, power: u.type === 'grand' ? 1.7 : 1.2, from: u });
      }
      renderToolbar(); setStatus();
    }
    /* impulse on a body: returns true when it topples */
    function hit(o, nx, ny, imp) {
      if (o.dead || o.fallen) return false;
      o.tilt += imp / o.mass; o.wob = 1; o.vx += nx * imp * 260 / o.mass; o.vy += ny * imp * 260 / o.mass;
      if (o.tilt >= 1) { topple(o, nx, ny); return true; }
      return false;
    }
    function topple(o, nx, ny) {
      o.fallen = 0.001; o.fdir = Math.atan2(ny || 0.01, nx || 0.01); host.sound('fall');
      if (o.side === 'r') { S.coins++; S.fx.push({ kind: 'coin', x: o.x, y: o.y - 30, t: 0 }); host.sound('coin'); log(TYPES[o.type].name + ' knocked over (+1)'); }
      else log('Your ' + TYPES[o.type].name + ' fell over');
      if (S.sel === o) S.sel = null;
    }
    function explode(x, y, R, power) {
      S.fx.push({ kind: 'boom', x: x, y: y, R: R, t: 0 }); host.sound('boom'); S.shake = 0.35;
      S.units.forEach(function (o) {
        if (o.dead || o.fallen) return; var d = d2(o, { x: x, y: y }); if (d > R + o.r) return;
        var k = 1 - Math.max(0, d - o.r) / R, nx = (o.x - x) / (d || 1), ny = (o.y - y) / (d || 1);
        hit(o, nx, ny, power * (0.35 + 0.65 * k));
      });
    }
    function settle() { S.busy = false; if (S.sel && (S.sel.dead || S.sel.fallen)) S.sel = null; if (S.sel && S.sel.acted && S.sel.moved) { var nx = mine().filter(function (u) { return !u.acted || !u.moved; })[0]; if (nx) select(nx); } renderToolbar(); setStatus(); checkEnd(); }
    function log(t) { S.log.push(t); host.setMoves(S.log.slice(-40)); }

    /* ---------------- enemy turn ---------------- */
    function endTurn() {
      if (S.over) return;
      S.phase = 'enemy'; S.sel = null; S.buildOpen = false; S.build = null; S.banner = { text: 'Enemy Turn', t: 1.2 }; renderToolbar(); setStatus(); host.setActive('top');
      var list = enemies(), k = 0;
      function step() {
        if (S.over) return;
        if (k >= list.length) { host.after(350, startPlayer); return; }
        var e = list[k++]; if (e.dead || e.fallen) { step(); return; }
        var T = TYPES[e.type], dx = CASTLE.x - e.x, dy = CASTLE.y - e.y, dd = Math.sqrt(dx * dx + dy * dy), len = Math.min(T.speed, dd - CASTLE.r - e.r + 4);
        var tgt = { x: e.x + dx / dd * len, y: e.y + dy / dd * len };
        if (inWall(tgt.x, tgt.y, e.r)) { var side = e.x < 500 ? -1 : 1, w = inWall(tgt.x, tgt.y, e.r); tgt = { x: side < 0 ? w.x - e.r - 4 : w.x + w.w + e.r + 4, y: Math.min(tgt.y, w.y - e.r - 2) }; if (Math.abs(tgt.x - e.x) > T.speed) tgt.x = e.x + Math.sign(tgt.x - e.x) * T.speed; }
        S.units.forEach(function (o) { if (o !== e && !o.dead && !o.fallen && d2(o, tgt) < o.r + e.r) { var a = Math.atan2(tgt.y - o.y, tgt.x - o.x); tgt = { x: o.x + Math.cos(a) * (o.r + e.r + 1), y: o.y + Math.sin(a) * (o.r + e.r + 1) }; } });
        anim(e, tgt, 300, function () {
          if (d2(e, CASTLE) <= CASTLE.r + e.r + 8) {
            S.hearts--; S.shake = 0.4; host.sound('castle'); host.fx({ type: 'flash', color: '#d33', opacity: 0.25, duration_ms: 350 });
            log(TYPES[e.type].name + ' hit the castle (♥' + S.hearts + ')'); e.dead = true; setStatus();
            if (S.hearts <= 0) { checkEnd(); return; }
          } else {
            var near = mine().filter(function (o) { return d2(o, e) < o.r + e.r + 22; })[0];
            if (near) { var a = Math.atan2(near.y - e.y, near.x - e.x); host.sound('bonk'); hit(near, Math.cos(a), Math.sin(a), 0.55 * e.mass); }
          }
          host.after(160, step);
        });
      }
      host.after(500, step);
    }
    function startPlayer() {
      if (S.over) return;
      spawnWave();
      S.units.forEach(function (u) { u.tilt *= 0.4; u.moved = u.acted = false; u.bonus = false; u.fresh = false; });
      S.phase = 'player'; S.banner = { text: 'Your Turn', t: 1.4 }; host.setActive('bottom');
      select(mine()[0]); checkEnd(); renderToolbar(); setStatus();
    }
    function checkEnd() {
      if (S.over) return;
      if (S.hearts <= 0) { S.over = true; renderToolbar(); host.over({ result: 'loss', why: 'Your castle was attacked five times.', title: 'Castle Fallen' }); return; }
      if (!mine().length && enemies().length) { S.over = true; renderToolbar(); host.over({ result: 'loss', why: 'All your units were knocked over.' }); return; }
      if (S.wave >= WAVES && !enemies().length && !S.shots.length) { S.over = true; renderToolbar(); host.sound('fanfare'); host.over({ result: 'win', why: 'Every wave knocked over. Level finished!', title: 'Victory!' }); }
    }

    /* ---------------- animation + physics ---------------- */
    var tweens = [];
    function anim(o, p, ms, done) { tweens.push({ o: o, x0: o.x, y0: o.y, x1: p.x, y1: p.y, t: 0, d: (host.reduced() ? ms * 0.5 : ms) / 1000, done: done }); }
    function update(dt) {
      if (!S) return;
      tweens = tweens.filter(function (tw) { tw.t += dt; var k = Math.min(1, tw.t / tw.d), e = 1 - Math.pow(1 - k, 3); tw.o.x = tw.x0 + (tw.x1 - tw.x0) * e; tw.o.y = tw.y0 + (tw.y1 - tw.y0) * e; if (k >= 1) { tw.done && tw.done(); return false; } return true; });
      S.units.forEach(function (o) {
        if (o.dead) return;
        if (o.vx || o.vy) {
          var nx = o.x + o.vx * dt, ny = o.y + o.vy * dt;
          if (inWall(nx, o.y, o.r)) o.vx = -o.vx * 0.4; else o.x = nx;
          if (inWall(o.x, ny, o.r)) o.vy = -o.vy * 0.4; else o.y = ny;
          o.x = Math.max(o.r, Math.min(W - o.r, o.x)); o.y = Math.max(o.r, Math.min(H - o.r, o.y));
          var f = Math.pow(0.02, dt); o.vx *= f; o.vy *= f; if (Math.abs(o.vx) + Math.abs(o.vy) < 4) o.vx = o.vy = 0;
          if (!o.fallen) S.units.forEach(function (q) { if (q === o || q.dead || q.fallen) return; var d = d2(o, q); if (d < o.r + q.r && d > 0) { var sp = Math.sqrt(o.vx * o.vx + o.vy * o.vy); if (sp > 60) { var nx2 = (q.x - o.x) / d, ny2 = (q.y - o.y) / d; hit(q, nx2, ny2, sp / 260 * o.mass * 0.55); o.vx *= 0.4; o.vy *= 0.4; } var push = (o.r + q.r - d) / 2; o.x -= (q.x - o.x) / d * push; o.y -= (q.y - o.y) / d * push; } });
        }
        if (o.wob > 0) o.wob = Math.max(0, o.wob - dt * 1.4);
        if (o.fallen) { o.fallen += dt / 0.7; if (o.fallen >= 1.6) o.dead = true; }
      });
      S.shots = S.shots.filter(function (s) {
        if (s.kind === 'arrow') {
          s.life -= dt; var steps = 4;
          for (var i = 0; i < steps; i++) {
            s.x += s.vx * dt / steps; s.y += s.vy * dt / steps;
            if (inWall(s.x, s.y, 2) || s.x < 0 || s.x > W || s.y < 0 || s.y > H) { host.sound('thunk'); return end(s); }
            var o = S.units.filter(function (q) { return q !== s.from && !q.dead && !q.fallen && d2(q, s) < q.r; })[0];
            if (o) { var speed = Math.sqrt(s.vx * s.vx + s.vy * s.vy); host.sound('thunk'); hit(o, s.vx / speed, s.vy / speed, s.power); return end(s); }
          }
          if (s.life <= 0) return end(s);
          return true;
        }
        if (s.kind === 'bomb' || (s.kind === 'marble' && !s.rolling)) {
          s.t += dt; var k = Math.min(1, s.t / s.dur);
          s.x = s.sx + (s.tx - s.sx) * k; s.y = s.sy + (s.ty - s.sy) * k; s.z = Math.sin(k * Math.PI) * 120;
          if (k >= 1) {
            if (s.kind === 'bomb') { explode(s.tx, s.ty, s.R, s.power); return end(s); }
            var a = Math.atan2(s.ty - s.sy, s.tx - s.sx); s.rolling = true; s.vx = Math.cos(a) * 520; s.vy = Math.sin(a) * 520; s.z = 0; host.sound('roll');
            var o0 = S.units.filter(function (q) { return q !== s.from && !q.dead && !q.fallen && d2(q, s) < q.r + 12; })[0];
            if (o0) { host.sound('bonk'); hit(o0, Math.cos(a), Math.sin(a), s.power * 1.1); s.vx *= 0.5; s.vy *= 0.5; s.power *= 0.7; }
          }
          return true;
        }
        /* rolling marble */
        var nx = s.x + s.vx * dt, ny = s.y + s.vy * dt;
        if (inWall(nx, s.y, 10) || nx < 10 || nx > W - 10) s.vx = -s.vx * 0.7; else s.x = nx;
        if (inWall(s.x, ny, 10) || ny < 10 || ny > H - 10) s.vy = -s.vy * 0.7; else s.y = ny;
        var sp = Math.sqrt(s.vx * s.vx + s.vy * s.vy);
        S.units.forEach(function (q) { if (q === s.from && s.t < 1.2) return; if (q.dead || q.fallen || (s.hitIds && s.hitIds[q.id])) return; if (d2(q, s) < q.r + 11) { (s.hitIds = s.hitIds || {})[q.id] = 1; host.sound('bonk'); hit(q, s.vx / sp, s.vy / sp, s.power * sp / 520); s.vx *= 0.55; s.vy *= 0.55; s.power *= 0.85; } });
        var f = Math.pow(0.25, dt); s.vx *= f; s.vy *= f; s.t += dt;
        if (sp < 30) return end(s);
        return true;
      });
      S.fx = S.fx.filter(function (f) { f.t += dt; return f.t < (f.kind === 'boom' ? 0.6 : 1.0); });
      if (S.banner) { S.banner.t -= dt; if (S.banner.t <= 0) S.banner = null; }
      if (S.shake > 0) S.shake = Math.max(0, S.shake - dt);
      /* watchdog: an attack whose projectiles all finished always hands control back */
      if (S.busy && S.phase === 'player' && !S.shots.length && !tweens.length) { S.idle = (S.idle || 0) + dt; if (S.idle > 1.2) { S.idle = 0; settle(); } } else S.idle = 0;
    }
    function end(s) { host.after(450, function () { if (!S.shots.length && !tweens.length) settle(); }); return false; }

    /* ---------------- drawing (original art, canvas paths) ---------------- */
    function makeGrass() {
      var c = document.createElement('canvas'); c.width = c.height = 256; var x = c.getContext('2d');
      x.fillStyle = '#7cc043'; x.fillRect(0, 0, 256, 256);
      for (var i = 0; i < 900; i++) { x.fillStyle = Math.random() < 0.5 ? 'rgba(60,120,30,.35)' : 'rgba(170,220,110,.3)'; x.fillRect(Math.random() * 256, Math.random() * 256, 2, 4 + Math.random() * 4); }
      return c;
    }
    function draw() {
      if (!S) return;
      var cw = cv.width, ch = cv.height, s = cw / W;
      g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, cw, ch);
      if (L3) { draw3d(); overlay3d(); drawBanner(s, ch); return; }
      var sh = S.shake > 0 && !host.reduced() ? S.shake * 14 * s : 0;
      g.setTransform(s, 0, 0, ch / H, sh ? rnd(-sh, sh) : 0, sh ? rnd(-sh, sh) : 0);
      if (!grass) grass = makeGrass();
      g.fillStyle = g.createPattern(grass, 'repeat'); g.fillRect(0, 0, W, H);
      /* table edge + mug in the corner (kitchen-table diorama) */
      g.strokeStyle = '#6b4a2a'; g.lineWidth = 18; g.strokeRect(9, 9, W - 18, H - 18);
      g.fillStyle = 'rgba(0,0,0,.18)'; g.beginPath(); g.ellipse(935, 960, 40, 38, 0, 0, 7); g.fill();
      g.fillStyle = '#e9e2d4'; g.beginPath(); g.arc(930, 955, 36, 0, 7); g.fill(); g.fillStyle = '#5a3a22'; g.beginPath(); g.arc(930, 955, 28, 0, 7); g.fill();
      g.strokeStyle = '#e9e2d4'; g.lineWidth = 10; g.beginPath(); g.arc(888, 955, 13, Math.PI * 0.5, Math.PI * 1.5); g.stroke();
      WALLS.forEach(function (w) { g.fillStyle = 'rgba(0,0,0,.2)'; g.fillRect(w.x + 6, w.y + 8, w.w, w.h); g.fillStyle = '#7a5532'; g.fillRect(w.x, w.y, w.w, w.h); g.fillStyle = '#9b7146'; g.fillRect(w.x, w.y, w.w, w.h * 0.4); g.strokeStyle = '#4e331c'; g.lineWidth = 2; for (var bx = w.x + 30; bx < w.x + w.w; bx += 30) { g.beginPath(); g.moveTo(bx, w.y); g.lineTo(bx, w.y + w.h); g.stroke(); } });
      drawCastle();
      var u = S.sel;
      if (u && S.phase === 'player' && !S.over) {
        var T = TYPES[u.type];
        if (S.mode === 'move' && !u.moved && T.move) { ring(u.x, u.y, T.move * (u.bonus ? 1.3 : 1), 'rgba(255,255,255,.9)', 'rgba(255,255,255,.12)'); }
        if (S.mode === 'attack' && !u.acted) ring(u.x, u.y, T.range, 'rgba(230,70,60,.9)', 'rgba(230,70,60,.08)');
      }
      if (S.build) ring(CASTLE.x, CASTLE.y, 260, 'rgba(129,182,76,.95)', 'rgba(129,182,76,.15)');
      S.units.slice().sort(function (a, b) { return a.y - b.y; }).forEach(drawUnit);
      S.shots.forEach(function (sh2) {
        if (sh2.kind === 'arrow') { var a = Math.atan2(sh2.vy, sh2.vx); g.save(); g.translate(sh2.x, sh2.y); g.rotate(a); g.strokeStyle = '#5b3b1c'; g.lineWidth = 4; g.beginPath(); g.moveTo(-34, 0); g.lineTo(0, 0); g.stroke(); g.fillStyle = '#bbb'; g.beginPath(); g.moveTo(6, 0); g.lineTo(-4, -5); g.lineTo(-4, 5); g.fill(); g.restore(); }
        else { var z = sh2.z || 0; g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(sh2.x, sh2.y + 6, 10, 5, 0, 0, 7); g.fill(); if (sh2.kind === 'bomb') { g.fillStyle = '#222'; g.beginPath(); g.arc(sh2.x, sh2.y - z, 12, 0, 7); g.fill(); g.fillStyle = '#ffb020'; g.beginPath(); g.arc(sh2.x + 6, sh2.y - z - 12, 4, 0, 7); g.fill(); } else { var gr = g.createRadialGradient(sh2.x - 3, sh2.y - z - 3, 1, sh2.x, sh2.y - z, 11); gr.addColorStop(0, '#fff'); gr.addColorStop(0.4, '#7fc9ff'); gr.addColorStop(1, '#1b5fa8'); g.fillStyle = gr; g.beginPath(); g.arc(sh2.x, sh2.y - z, 11, 0, 7); g.fill(); } }
      });
      S.fx.forEach(function (f) {
        if (f.kind === 'boom') { var k = f.t / 0.6; g.fillStyle = 'rgba(255,' + Math.round(200 - 140 * k) + ',40,' + (1 - k) * 0.85 + ')'; g.beginPath(); g.arc(f.x, f.y, f.R * (0.4 + 0.8 * k), 0, 7); g.fill(); g.fillStyle = 'rgba(90,90,90,' + (1 - k) * 0.5 + ')'; g.beginPath(); g.arc(f.x, f.y - 20 * k, f.R * 0.5 * (0.5 + k), 0, 7); g.fill(); }
        else { g.globalAlpha = 1 - f.t; g.fillStyle = '#f5c518'; g.strokeStyle = '#8a6a00'; g.lineWidth = 3; g.beginPath(); g.arc(f.x, f.y - 50 * f.t, 13, 0, 7); g.fill(); g.stroke(); g.fillStyle = '#fff'; g.font = '700 22px system-ui'; g.fillText('+1', f.x + 18, f.y - 50 * f.t + 7); g.globalAlpha = 1; }
      });
      drawBanner(s, ch);
    }
    function drawBanner(s, ch) {
      g.setTransform(s, 0, 0, ch / H, 0, 0);
      if (S.banner) {
        var al = Math.min(1, S.banner.t * 2.5); g.globalAlpha = al; g.fillStyle = S.banner.text === 'Your Turn' ? 'rgba(60,130,40,.92)' : 'rgba(140,40,60,.92)';
        g.fillRect(0, 430, W, 110); g.fillStyle = '#fff'; g.font = '800 64px system-ui,sans-serif'; g.textAlign = 'center'; g.fillText(S.banner.text, W / 2, 506); g.textAlign = 'start'; g.globalAlpha = 1;
      }
    }
    function ring(x, y, r, st, fi) { g.fillStyle = fi; g.strokeStyle = st; g.lineWidth = 3; g.setLineDash([10, 8]); g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); g.stroke(); g.setLineDash([]); }
    function drawCastle() {
      var x = CASTLE.x, y = CASTLE.y;
      g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(x + 6, y + 10, 70, 30, 0, 0, 7); g.fill();
      g.fillStyle = '#9aa0a6'; g.fillRect(x - 60, y - 60, 120, 70); g.fillStyle = '#c3c8cc'; for (var i = 0; i < 5; i++) g.fillRect(x - 60 + i * 26, y - 76, 16, 18);
      g.fillStyle = '#6d5136'; g.beginPath(); g.moveTo(x - 16, y + 10); g.lineTo(x - 16, y - 18); g.arc(x, y - 18, 16, Math.PI, 0); g.lineTo(x + 16, y + 10); g.fill();
      g.strokeStyle = '#444'; g.lineWidth = 3; g.beginPath(); g.moveTo(x + 40, y - 76); g.lineTo(x + 40, y - 120); g.stroke(); g.fillStyle = '#3fae3f'; g.beginPath(); g.moveTo(x + 40, y - 120); g.lineTo(x + 72, y - 110); g.lineTo(x + 40, y - 100); g.fill();
      for (var h = 0; h < 5; h++) { g.fillStyle = h < S.hearts ? '#e0404a' : 'rgba(0,0,0,.35)'; heart(x - 48 + h * 24, y - 34, 9); }
    }
    function heart(x, y, r) { g.beginPath(); g.moveTo(x, y + r); g.bezierCurveTo(x - r * 1.6, y - r * 0.2, x - r * 0.6, y - r * 1.4, x, y - r * 0.4); g.bezierCurveTo(x + r * 0.6, y - r * 1.4, x + r * 1.6, y - r * 0.2, x, y + r); g.fill(); }
    function drawUnit(o) {
      if (o.dead) return;
      var t = performance.now() / 1000, ang = o.fallen ? Math.min(1, o.fallen) * Math.PI / 2 : Math.sin(t * 18) * o.wob * 0.25 + o.tilt * 0.08;
      g.save(); g.globalAlpha = o.fallen > 1 ? Math.max(0, 1.6 - o.fallen) / 0.6 : 1;
      g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(o.x + 4, o.y + o.r * 0.55, o.r * 1.05, o.r * 0.45, 0, 0, 7); g.fill();
      g.translate(o.x, o.y + o.r * 0.5); g.rotate(o.fallen ? (Math.cos(o.fdir) >= 0 ? ang : -ang) : ang); g.translate(0, -o.r * 0.5);
      var r = o.r;
      if (o.side === 'g') { g.fillStyle = '#2f9e44'; g.beginPath(); g.ellipse(0, r * 0.5, r, r * 0.38, 0, 0, 7); g.fill(); }
      switch (o.type) {
        case 'slime': case 'meat':
          if (sprite('slime', -r * 1.35, -r * 1.6, r * 2.7, r * 2.4)) { if (o.type === 'meat') sprite('meat', r * 0.2, -r * 0.4, r * 1.2, r * 1.2); break; }
          g.fillStyle = '#8e44c9'; g.beginPath(); g.moveTo(-r, r * 0.5); g.quadraticCurveTo(-r, -r * 1.1, 0, -r * 1.05); g.quadraticCurveTo(r, -r * 1.1, r, r * 0.5); g.closePath(); g.fill();
          g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.ellipse(-r * 0.4, -r * 0.5, r * 0.2, r * 0.3, -0.4, 0, 7); g.fill();
          eyes(r * 0.32, -r * 0.2, r * 0.16, '#fff', '#2a1036');
          if (o.type === 'meat') { g.fillStyle = '#c0392b'; g.beginPath(); g.ellipse(r * 0.6, r * 0.1, r * 0.45, r * 0.3, 0.5, 0, 7); g.fill(); g.fillStyle = '#f5f0e0'; g.fillRect(r * 0.85, -r * 0.2, r * 0.45, r * 0.14); }
          break;
        case 'dragon':
          g.fillStyle = '#b83242'; g.beginPath(); g.ellipse(0, 0, r, r * 0.75, 0, 0, 7); g.fill();
          g.fillStyle = '#e0606e'; g.beginPath(); g.moveTo(-r * 0.6, -r * 0.4); g.lineTo(-r * 1.6, -r * 1.2); g.lineTo(-r * 0.9, r * 0.1); g.fill(); g.beginPath(); g.moveTo(r * 0.6, -r * 0.4); g.lineTo(r * 1.6, -r * 1.2); g.lineTo(r * 0.9, r * 0.1); g.fill();
          g.fillStyle = '#b83242'; g.beginPath(); g.arc(0, -r * 0.8, r * 0.5, 0, 7); g.fill(); g.fillStyle = '#ffd34d'; g.beginPath(); g.moveTo(-r * 0.35, -r * 1.15); g.lineTo(-r * 0.2, -r * 1.55); g.lineTo(-r * 0.05, -r * 1.2); g.fill(); g.beginPath(); g.moveTo(r * 0.35, -r * 1.15); g.lineTo(r * 0.2, -r * 1.55); g.lineTo(r * 0.05, -r * 1.2); g.fill();
          eyes(r * 0.2, -r * 0.85, r * 0.1, '#ffd34d', '#000');
          break;
        case 'catapult':
          g.fillStyle = '#8a5a2b'; g.fillRect(-r, -r * 0.2, r * 2, r * 0.6); g.fillStyle = '#5b3b1c'; g.beginPath(); g.arc(-r * 0.7, r * 0.4, r * 0.28, 0, 7); g.arc(r * 0.7, r * 0.4, r * 0.28, 0, 7); g.fill();
          g.strokeStyle = '#a8743f'; g.lineWidth = 6; g.beginPath(); g.moveTo(-r * 0.3, 0); g.lineTo(r * 0.5, -r * 1.2); g.stroke(); g.fillStyle = '#5b3b1c'; g.beginPath(); g.arc(r * 0.55, -r * 1.25, r * 0.25, 0, 7); g.fill(); g.fillStyle = '#7fc9ff'; g.beginPath(); g.arc(r * 0.55, -r * 1.3, r * 0.14, 0, 7); g.fill();
          break;
        case 'tower':
          g.fillStyle = '#9aa0a6'; g.fillRect(-r * 0.7, -r * 1.6, r * 1.4, r * 2); g.fillStyle = '#c3c8cc'; g.fillRect(-r * 0.85, -r * 1.85, r * 1.7, r * 0.4); g.fillStyle = '#333'; g.fillRect(-r * 0.12, -r * 1.2, r * 0.24, r * 0.5);
          g.fillStyle = '#2f9e44'; g.fillRect(-r * 0.85, -r * 1.9, r * 1.7, r * 0.12);
          break;
        default: figure(o, r);
      }
      g.restore();
      if (S.sel === o && !o.fallen) { g.strokeStyle = '#ffd34d'; g.lineWidth = 4; g.beginPath(); g.ellipse(o.x, o.y + o.r * 0.5, o.r + 8, (o.r + 8) * 0.42, 0, 0, 7); g.stroke(); }
      if (o.side === 'g' && S.phase === 'player' && !o.fallen && o.moved && o.acted) { g.fillStyle = 'rgba(0,0,0,.45)'; g.font = '700 18px system-ui'; g.fillText('z', o.x + o.r * 0.7, o.y - o.r); }
      if (o.tilt > 0.05 && !o.fallen) { g.fillStyle = 'rgba(0,0,0,.4)'; g.fillRect(o.x - 20, o.y + o.r + 8, 40, 5); g.fillStyle = o.tilt > 0.66 ? '#e0404a' : '#f5c518'; g.fillRect(o.x - 20, o.y + o.r + 8, 40 * Math.min(1, o.tilt), 5); }
    }
    function eyes(dx, y, er, w, p) { g.fillStyle = w; g.beginPath(); g.arc(-dx, y, er, 0, 7); g.arc(dx, y, er, 0, 7); g.fill(); g.fillStyle = p; g.beginPath(); g.arc(-dx, y + er * 0.2, er * 0.5, 0, 7); g.arc(dx, y + er * 0.2, er * 0.5, 0, 7); g.fill(); }
    function figure(o, r) {
      if (o.type === 'knight' && sprite('knight', -r * 1.3, -r * 2.1, r * 2.6, r * 2.6)) return;
      /* body */
      var col = o.type === 'knight' ? '#b9c2cc' : o.type === 'archer' ? '#3c8d3c' : o.type === 'grand' ? '#b3261e' : '#e0662c';
      g.fillStyle = col; g.beginPath(); g.moveTo(-r * 0.6, r * 0.5); g.lineTo(-r * 0.45, -r * 0.6); g.lineTo(r * 0.45, -r * 0.6); g.lineTo(r * 0.6, r * 0.5); g.fill();
      /* head */
      if (o.type === 'knight') {
        g.fillStyle = '#f0a35a'; g.beginPath(); g.arc(0, -r * 0.95, r * 0.5, 0, 7); g.fill();
        g.beginPath(); g.moveTo(-r * 0.45, -r * 1.15); g.lineTo(-r * 0.3, -r * 1.6); g.lineTo(-r * 0.1, -r * 1.3); g.fill(); g.beginPath(); g.moveTo(r * 0.45, -r * 1.15); g.lineTo(r * 0.3, -r * 1.6); g.lineTo(r * 0.1, -r * 1.3); g.fill();
        g.fillStyle = '#9aa4ae'; g.beginPath(); g.arc(0, -r * 1.05, r * 0.52, Math.PI, 0); g.fill(); eyes(r * 0.2, -r * 0.88, r * 0.1, '#fff', '#222');
        g.strokeStyle = '#ddd'; g.lineWidth = 4; g.beginPath(); g.moveTo(r * 0.55, -r * 0.1); g.lineTo(r * 1.05, -r * 0.9); g.stroke();
      } else {
        g.fillStyle = '#f2c79c'; g.beginPath(); g.arc(0, -r * 0.95, r * 0.42, 0, 7); g.fill(); eyes(r * 0.16, -r * 0.95, r * 0.08, '#222', '#222');
        if (o.type === 'archer') { g.fillStyle = '#2b6e2b'; g.beginPath(); g.moveTo(-r * 0.5, -r * 1.1); g.lineTo(0, -r * 1.75); g.lineTo(r * 0.5, -r * 1.1); g.fill(); g.strokeStyle = '#6b4a2a'; g.lineWidth = 3; g.beginPath(); g.arc(r * 0.7, -r * 0.3, r * 0.6, -1.2, 1.2); g.stroke(); }
        else { g.fillStyle = col; g.beginPath(); g.moveTo(-r * 0.55, -r * 1.15); g.lineTo(0, -r * (o.type === 'grand' ? 2.2 : 1.9)); g.lineTo(r * 0.55, -r * 1.15); g.fill(); g.fillStyle = '#ffd34d'; g.beginPath(); g.arc(r * 0.75, -r * 0.4, r * 0.18, 0, 7); g.fill(); }
      }
    }

    /* ---------------- m-3d (2026-11-26): the kitchen-table diorama in real 3D, like the video ----------------
       The video is a 3D toy diorama: chunky figures on round bases (green for your Green Rangers, red under the
       purple slimes), a grass board with dirt paths, cardboard walls, a little castle, a low chase camera from your
       side (thumbnail + 4 stills in research/ref/fin-battle/thumbs/xvlHij1tgk8*.jpg). js/games/lift3d.js puts a
       three.js view under the 2D canvas, which keeps the input, the turn banner, tilt bars and "+1" pops. Game world
       units (0..1000) map to 3D at K3 = 0.01 per unit: x -> x, y -> z. No WebGL -> the 2D drawing as before. */
    var L3 = null, stopped3d = false, R3 = null, K3 = 0.01, camZ = null;
    function start3d() {
      stopped3d = false;
      var go = function () {
        if (!CM.lift3d || stopped3d) return;
        CM.lift3d.attach(host, { background: '#3b2a1a', fov: 40, exposure: 1.05 }).then(function (L) {
          if (!L) return; if (stopped3d) { L.dispose(); return; }
          L3 = L; build3d(); draw();
        });
      };
      if (CM.lift3d) go(); else CM.util.loadScript('js/games/lift3d.js').then(go).catch(function () { /* stays 2D */ });
    }
    function std(T, c, o) { return new T.MeshStandardMaterial(Object.assign({ color: c, roughness: .7, flatShading: true }, o || {})); }
    function build3d() {
      var T = L3.THREE, sc = L3.scene, M = {}; R3 = { figs: {}, shots: [], fx: [], M: M };
      sc.fog = new T.Fog('#4a3622', 16, 34);
      sc.add(new T.HemisphereLight('#fff4e0', '#4b3a26', 1.0));
      var sun = new T.DirectionalLight('#fff1d6', 1.7); sun.position.set(-3, 12, 9); sun.target.position.set(5, 0, 5); sun.castShadow = true;
      sun.shadow.mapSize.set(1024, 1024); var c2 = sun.shadow.camera; c2.left = -8; c2.right = 8; c2.top = 8; c2.bottom = -8; c2.near = 1; c2.far = 40; sun.shadow.bias = -.0008;
      sc.add(sun); sc.add(sun.target);
      /* grass board with dirt-path tiles (stills 2-4) */
      var gc = document.createElement('canvas'); gc.width = gc.height = 1024; var gx = gc.getContext('2d');
      gx.drawImage(makeGrass(), 0, 0, 1024, 1024);
      var gr = makeGrass(); for (var ty = 0; ty < 4; ty++) for (var tx = 0; tx < 4; tx++) gx.drawImage(gr, tx * 256, ty * 256);
      gx.fillStyle = 'rgba(160,110,60,.55)';
      [[470, 120, 60, 760], [140, 430, 720, 50], [60, 760, 880, 40]].forEach(function (r0) { for (var yy = r0[1]; yy < r0[1] + r0[3]; yy += 40) for (var xx = r0[0]; xx < r0[0] + r0[2]; xx += 40) { gx.fillStyle = (xx + yy) % 80 ? 'rgba(170,120,66,.6)' : 'rgba(150,100,52,.6)'; gx.fillRect(xx + 2, yy + 2, 36, 36); } });
      var ground = new T.Mesh(new T.BoxGeometry(10, .2, 10).translate(5, -.1, 5), [std(T, '#6b4a2a'), std(T, '#6b4a2a'), new T.MeshStandardMaterial({ map: L3.canvasTex(gc), roughness: .95 }), std(T, '#6b4a2a'), std(T, '#6b4a2a'), std(T, '#6b4a2a')]);
      ground.receiveShadow = true; sc.add(ground);
      /* the kitchen table under the diorama + a mug (2D: corner mug) */
      var table = new T.Mesh(new T.BoxGeometry(30, .4, 24).translate(5, -.42, 6), std(T, '#9a6a3c', { flatShading: false, roughness: .55 })); table.receiveShadow = true; sc.add(table);
      var mug = new T.Group(); var mb = new T.Mesh(new T.CylinderGeometry(.36, .34, .7, 18, 1, true), std(T, '#e9e2d4', { side: T.DoubleSide, flatShading: false })); mb.position.y = .35; mug.add(mb);
      var cof = new T.Mesh(new T.CircleGeometry(.34, 18).rotateX(-Math.PI / 2), std(T, '#5a3a22')); cof.position.y = .55; mug.add(cof);
      var hdl = new T.Mesh(new T.TorusGeometry(.17, .045, 6, 12, Math.PI), std(T, '#e9e2d4')); hdl.position.set(-.38, .36, 0); hdl.rotation.z = Math.PI / 2; mug.add(hdl);
      mug.position.set(10.9, -.22, 9.3); mug.traverse(function (o) { o.castShadow = true; }); sc.add(mug);
      /* cardboard / plank walls */
      WALLS.forEach(function (w) {
        var m = new T.Mesh(new T.BoxGeometry(w.w * K3, .42, w.h * K3).translate((w.x + w.w / 2) * K3, .21, (w.y + w.h / 2) * K3), std(T, '#b08355'));
        m.castShadow = m.receiveShadow = true; sc.add(m);
        var top = new T.Mesh(new T.BoxGeometry(w.w * K3 + .02, .04, w.h * K3 + .02).translate((w.x + w.w / 2) * K3, .43, (w.y + w.h / 2) * K3), std(T, '#c99b68')); sc.add(top);
      });
      /* the castle */
      var cs = new T.Group(), stone = std(T, '#a3a8ad'), stone2 = std(T, '#c6cacd');
      var keep = new T.Mesh(new T.BoxGeometry(1.1, .75, .7).translate(0, .375, 0), stone); cs.add(keep);
      [-1, 1].forEach(function (sd) { var tw = new T.Mesh(new T.CylinderGeometry(.2, .22, 1.05, 10).translate(sd * .6, .525, .2), stone2); cs.add(tw); var cone = new T.Mesh(new T.ConeGeometry(.25, .35, 10).translate(sd * .6, 1.22, .2), std(T, '#3f8f3f')); cs.add(cone); });
      for (var i = 0; i < 5; i++) cs.add(new T.Mesh(new T.BoxGeometry(.14, .14, .7).translate(-.44 + i * .22, .82, 0), stone2));
      cs.add(new T.Mesh(new T.BoxGeometry(.3, .4, .05).translate(0, .2, .36), std(T, '#6d5136')));
      cs.add(new T.Mesh(new T.CylinderGeometry(.015, .015, .6, 5).translate(.3, 1.05, -.1), std(T, '#444')));
      var flag = new T.Mesh(new T.BoxGeometry(.3, .16, .01).translate(.46, 1.27, -.1), std(T, '#3fae3f')); cs.add(flag); R3.flag = flag;
      cs.position.set(CASTLE.x * K3, 0, CASTLE.y * K3); cs.traverse(function (o) { o.castShadow = o.receiveShadow = true; }); sc.add(cs);
      /* rings: move (white), attack (red), build (green) + the selected unit's gold ring */
      function ring(col) { var gq = new T.Group(); gq.add(new T.Mesh(new T.CircleGeometry(1, 48).rotateX(-Math.PI / 2), new T.MeshBasicMaterial({ color: col, transparent: true, opacity: .14, depthWrite: false })));
        gq.add(new T.Mesh(new T.RingGeometry(.975, 1, 64).rotateX(-Math.PI / 2), new T.MeshBasicMaterial({ color: col, transparent: true, opacity: .9, depthWrite: false }))); gq.position.y = .012; gq.visible = false; sc.add(gq); return gq; }
      R3.rMove = ring('#ffffff'); R3.rAtk = ring('#e6463c'); R3.rBuild = ring('#81b64c');
      R3.selR = new T.Mesh(new T.TorusGeometry(1, .07, 6, 32).rotateX(Math.PI / 2), new T.MeshBasicMaterial({ color: '#ffd34d' })); R3.selR.visible = false; sc.add(R3.selR);
      M.base = { g: std(T, '#2f9e44'), r: std(T, '#c0392b') }; M.skin = std(T, '#f2c79c'); M.wood = std(T, '#8a5a2b'); M.dark = std(T, '#2a2a2a'); M.steel = std(T, '#aab3bc', { metalness: .5, roughness: .4 });
      M.slime = new T.MeshStandardMaterial({ color: '#8e44c9', roughness: .25, metalness: .05 }); M.spot = std(T, '#c18ae8'); M.white = std(T, '#ffffff'); M.meat = std(T, '#c0392b'); M.bone = std(T, '#f5f0e0');
      M.marble = new T.MeshStandardMaterial({ color: '#7fc9ff', roughness: .05, metalness: .1, transparent: true, opacity: .9 }); M.bomb = std(T, '#1e1e1e', { roughness: .4 }); M.spark = new T.MeshBasicMaterial({ color: '#ffb020' });
      M.boom = new T.MeshBasicMaterial({ color: '#ff9a28', transparent: true, depthWrite: false }); M.smoke = new T.MeshStandardMaterial({ color: '#8a8a8a', transparent: true, depthWrite: false }); M.coin = std(T, '#f5c518', { metalness: .7, roughness: .3 });
      R3.shadowGeo = new T.CircleGeometry(1, 16).rotateX(-Math.PI / 2); R3.shadowMat = new T.MeshBasicMaterial({ color: '#000', transparent: true, opacity: .25, depthWrite: false });
    }
    function figure3d(o) {   /* chunky toy figure on a round base, built once per unit; units are ~2r wide (game units) */
      var T = L3.THREE, M = R3.M, G = new T.Group(), body = new T.Group(), r = o.r * K3, add = function (geo, mat, x, y, z) { var m = new T.Mesh(geo, mat); m.position.set(x || 0, y || 0, z || 0); m.castShadow = true; body.add(m); return m; };
      G.add(body);
      if (o.type !== 'tower' && o.type !== 'catapult') add(new T.CylinderGeometry(r * 1.05, r * 1.1, r * .3, 18), M.base[o.side === 'g' ? 'g' : 'r'], 0, r * .15, 0);
      var h0 = r * .3;
      switch (o.type) {
        case 'slime': case 'meat': {
          var sg = new T.SphereGeometry(r * .95, 18, 12); sg.scale(1, .8, 1); add(sg, M.slime, 0, h0 + r * .55, 0);
          [[.4, .9, .5], [-.5, .75, .45], [.1, 1.25, .2], [-.2, 1.05, -.6], [.6, .7, -.4]].forEach(function (q) { add(new T.SphereGeometry(r * .13, 8, 6), M.spot, q[0] * r, h0 + q[1] * r, q[2] * r); });
          [-1, 1].forEach(function (sd) { add(new T.SphereGeometry(r * .17, 8, 6), M.white, sd * r * .3, h0 + r * .75, r * .72); add(new T.SphereGeometry(r * .08, 6, 4), M.dark, sd * r * .3, h0 + r * .75, r * .87); });
          if (o.type === 'meat') { var hm = add(new T.CylinderGeometry(r * .5, r * .5, r * .35, 16), M.meat, r * .2, h0 + r * 1.55, 0); hm.rotation.x = Math.PI / 2; add(new T.CylinderGeometry(r * .07, r * .07, r * .7, 6), M.bone, r * .75, h0 + r * 1.55, 0).rotation.z = Math.PI / 2; }
          break; }
        case 'dragon': {
          var red = std(T, '#b83242'), red2 = std(T, '#e0606e');
          var bd = new T.SphereGeometry(r * .8, 14, 10); bd.scale(1, .8, 1.25); add(bd, red, 0, h0 + r * .8, 0);
          add(new T.SphereGeometry(r * .45, 12, 8), red, 0, h0 + r * 1.55, r * .75);
          [-1, 1].forEach(function (sd) { var wg = add(new T.ConeGeometry(r * .6, r * 1.4, 3), red2, sd * r * 1.05, h0 + r * 1.35, -r * .1); wg.rotation.z = sd * -1.1; add(new T.ConeGeometry(r * .08, r * .35, 5), std(T, '#ffd34d'), sd * r * .2, h0 + r * 2.0, r * .7); });
          add(new T.ConeGeometry(r * .25, r * 1.1, 6), red, 0, h0 + r * .6, -r * 1.25).rotation.x = -1.3;
          break; }
        case 'catapult': {
          add(new T.BoxGeometry(r * 1.8, r * .35, r * 1.2), M.wood, 0, r * .45, 0);
          [-1, 1].forEach(function (sx) { [-1, 1].forEach(function (sz) { var wh = add(new T.CylinderGeometry(r * .3, r * .3, r * .14, 12), std(T, '#5b3b1c'), sx * r * .7, r * .3, sz * r * .62); wh.rotation.x = Math.PI / 2; }); });
          var arm = add(new T.BoxGeometry(r * .16, r * 1.5, r * .16), std(T, '#a8743f'), 0, r * 1.1, -r * .2); arm.rotation.x = -.5;
          add(new T.SphereGeometry(r * .22, 10, 6, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), std(T, '#5b3b1c'), 0, r * 1.75, -r * .55);
          add(new T.SphereGeometry(r * .15, 10, 8), M.marble, 0, r * 1.8, -r * .55);
          break; }
        case 'tower': {
          add(new T.CylinderGeometry(r * .7, r * .8, r * 2.2, 12), std(T, '#9aa0a6'), 0, r * 1.1, 0);
          add(new T.CylinderGeometry(r * .88, r * .88, r * .35, 12), std(T, '#c3c8cc'), 0, r * 2.35, 0);
          add(new T.ConeGeometry(r * .8, r * .7, 12), std(T, '#2f9e44'), 0, r * 2.85, 0);
          add(new T.BoxGeometry(r * .25, r * .45, r * .1), M.dark, 0, r * 1.5, r * .72);
          break; }
        default: {   /* archer, Cat Knight, fire mages: chubby toy people (thumbnail) */
          var col = o.type === 'knight' ? '#b9c2cc' : o.type === 'archer' ? '#3c8d3c' : o.type === 'grand' ? '#b3261e' : '#e0662c', cm = std(T, col);
          add(new T.CylinderGeometry(r * .5, r * .65, r * 1.0, 12), o.type === 'knight' ? std(T, '#c0392b') : cm, 0, h0 + r * .5, 0);
          add(new T.SphereGeometry(r * .58, 14, 10), o.type === 'knight' ? M.steel : M.skin, 0, h0 + r * 1.45, 0);
          [-1, 1].forEach(function (sd) { add(new T.SphereGeometry(r * .18, 8, 6), o.type === 'knight' ? M.steel : cm, sd * r * .62, h0 + r * .7, 0); });
          if (o.type === 'knight') {   /* the Cat Knight: steel helm with cat ears, visor, sword + shield */
            [-1, 1].forEach(function (sd) { add(new T.ConeGeometry(r * .2, r * .42, 4), M.steel, sd * r * .32, h0 + r * 2.0, 0).rotation.z = sd * -.25; });
            add(new T.BoxGeometry(r * .7, r * .3, r * .1), std(T, '#f0a35a'), 0, h0 + r * 1.42, r * .52);
            add(new T.BoxGeometry(r * .1, r * 1.1, r * .06), M.steel, r * .85, h0 + r * 1.0, r * .2);
            add(new T.CylinderGeometry(r * .45, r * .45, r * .08, 12), std(T, '#8e5b3a'), -r * .72, h0 + r * .7, r * .2).rotation.z = Math.PI / 2;
          } else if (o.type === 'archer') {
            add(new T.ConeGeometry(r * .6, r * .8, 10), std(T, '#2b6e2b'), 0, h0 + r * 2.05, 0);
            add(new T.TorusGeometry(r * .55, r * .04, 4, 14, Math.PI), std(T, '#6b4a2a'), r * .75, h0 + r * .9, 0).rotation.z = -Math.PI / 2;
          } else {
            add(new T.ConeGeometry(r * .62, r * (o.type === 'grand' ? 1.5 : 1.15), 10), cm, 0, h0 + r * (o.type === 'grand' ? 2.45 : 2.25), 0);
            add(new T.CylinderGeometry(r * .75, r * .75, r * .06, 14), cm, 0, h0 + r * 1.75, 0);
            add(new T.SphereGeometry(r * .18, 8, 6), std(T, '#ffd34d', { emissive: '#ff8a00', emissiveIntensity: .6 }), r * .8, h0 + r * 1.0, r * .2);
          }
          [-1, 1].forEach(function (sd) { add(new T.SphereGeometry(r * .07, 6, 4), M.dark, sd * r * .2, h0 + r * 1.5, r * .56); });
        }
      }
      G.position.set(o.x * K3, 0, o.y * K3); G.rotation.y = o.side === 'r' ? 0 : Math.PI; G.scale.setScalar(1.3);   /* chunky toys, a bit bigger than their footprint like the video */
      L3.scene.add(G); return { G: G, body: body };
    }
    function drop3d(m) {   /* remove a per-frame / per-unit object and free its own geometries (materials are shared) */
      L3.scene.remove(m); m.traverse(function (q) { if (q.geometry && q.geometry !== R3.shadowGeo) q.geometry.dispose(); });
    }
    function draw3d() {
      if (!R3) return;
      var T = L3.THREE, sc = L3.scene, t = performance.now() / 1000, seen = {}, M = R3.M;
      S.units.forEach(function (o) {
        if (o.dead) return; seen[o.id] = 1;
        var f = R3.figs[o.id] || (R3.figs[o.id] = figure3d(o)), r = o.r * K3;
        f.G.position.set(o.x * K3, 0, o.y * K3);
        if (o.fallen) {   /* topple away from the hit, then sink into the table */
          var k = Math.min(1, o.fallen), dx = Math.cos(o.fdir || 0), dz = Math.sin(o.fdir || 0);
          f.body.rotation.set(dz * k * Math.PI / 2, 0, -dx * k * Math.PI / 2); f.G.rotation.y = 0;
          f.body.position.set(dx * k * r * .9, -Math.max(0, o.fallen - 1) * r * 3, dz * k * r * .9);
        } else {
          var w = Math.sin(t * 18) * o.wob * .25 + o.tilt * .08; f.body.rotation.set(0, 0, w); f.body.position.set(0, 0, 0);
          if (o.type === 'slime' || o.type === 'meat') { var sq = 1 + (host.reduced() ? 0 : Math.sin(t * 4 + o.id) * .04); f.body.scale.set(1 / Math.sqrt(sq), sq, 1 / Math.sqrt(sq)); }
        }
        f.G.visible = !(o.fallen > 1.6);
      });
      Object.keys(R3.figs).forEach(function (id) { if (!seen[id]) { drop3d(R3.figs[id].G); delete R3.figs[id]; } });
      /* rings */
      var u = S.sel, showM = false, showA = false;
      if (u && S.phase === 'player' && !S.over) {
        var TY = TYPES[u.type];
        if (S.mode === 'move' && !u.moved && TY.move) { showM = true; R3.rMove.position.set(u.x * K3, .012, u.y * K3); R3.rMove.scale.setScalar(TY.move * (u.bonus ? 1.3 : 1) * K3); }
        if (S.mode === 'attack' && !u.acted) { showA = true; R3.rAtk.position.set(u.x * K3, .014, u.y * K3); R3.rAtk.scale.setScalar(TY.range * K3); }
      }
      R3.rMove.visible = showM; R3.rAtk.visible = showA;
      R3.rBuild.visible = !!S.build; if (S.build) { R3.rBuild.position.set(CASTLE.x * K3, .016, CASTLE.y * K3); R3.rBuild.scale.setScalar(260 * K3); }
      R3.selR.visible = !!(u && !u.fallen); if (u) { R3.selR.position.set(u.x * K3, .03, u.y * K3); R3.selR.scale.setScalar((u.r + 8) * K3); }
      /* projectiles (rebuilt each frame: a handful at most) */
      R3.shots.forEach(drop3d); R3.shots = [];
      S.shots.forEach(function (sh) {
        var z = (sh.z || 0) * K3, m;
        if (sh.kind === 'arrow') {
          m = new T.Group(); var a = Math.atan2(sh.vy, sh.vx);
          var shaft = new T.Mesh(new T.CylinderGeometry(.012, .012, .34, 4), M.wood); shaft.rotation.z = Math.PI / 2; shaft.position.x = -.17; m.add(shaft);
          var tip = new T.Mesh(new T.ConeGeometry(.03, .08, 4), M.steel); tip.rotation.z = -Math.PI / 2; m.add(tip);
          m.position.set(sh.x * K3, .35, sh.y * K3); m.rotation.y = -a;
        } else {
          m = new T.Group(); var ball = new T.Mesh(new T.SphereGeometry(sh.kind === 'bomb' ? .12 : .1, 12, 8), sh.kind === 'bomb' ? M.bomb : M.marble); ball.position.y = .1 + z; m.add(ball);
          if (sh.kind === 'bomb') { var sp = new T.Mesh(new T.SphereGeometry(.035, 6, 4), M.spark); sp.position.set(.05, .24 + z, 0); m.add(sp); }
          var shd = new T.Mesh(R3.shadowGeo, R3.shadowMat); shd.scale.setScalar(.1); shd.position.y = .006; m.add(shd);
          m.position.set(sh.x * K3, 0, sh.y * K3);
        }
        m.traverse(function (q) { q.castShadow = true; }); sc.add(m); R3.shots.push(m);
      });
      /* explosions + coins */
      R3.fx.forEach(drop3d); R3.fx = [];
      S.fx.forEach(function (fx) {
        var m;
        if (fx.kind === 'boom') {
          var k = fx.t / .6; m = new T.Group();
          var core = new T.Mesh(new T.SphereGeometry(fx.R * K3 * (.4 + .8 * k), 16, 10), M.boom); core.material.opacity = (1 - k) * .85; core.position.y = .2; m.add(core);
          var smk = new T.Mesh(new T.SphereGeometry(fx.R * K3 * .5 * (.5 + k), 12, 8), M.smoke); smk.material.opacity = (1 - k) * .55; smk.position.y = .4 + k * .6; m.add(smk);
          m.position.set(fx.x * K3, 0, fx.y * K3);
        } else {
          m = new T.Mesh(new T.CylinderGeometry(.13, .13, .03, 16), M.coin); m.rotation.x = Math.PI / 2; m.rotation.y = fx.t * 8; m.position.set(fx.x * K3, .6 + fx.t * .5, (fx.y + 30) * K3);
        }
        sc.add(m); R3.fx.push(m);
      });
      if (R3.flag && !host.reduced()) R3.flag.rotation.y = Math.sin(t * 3) * .2;
      /* low chase camera from your castle's side, like the video; a little shake on explosions */
      var sh2 = S.shake > 0 && !host.reduced() ? S.shake * .12 : 0;
      /* qa3d: on phones the toolbar wraps to two rows (~25% of the view) and hid the castle; aim further toward the castle
         by how much of the view the toolbar covers (one row on desktop ~10% -> unchanged), easing when it changes rows */
      var tbF = toolbar && cv.clientHeight ? toolbar.offsetHeight / cv.clientHeight : 0;
      var wantZ = 5.55 + Math.min(1.4, Math.max(0, tbF - .1) * 7);
      camZ = camZ == null || host.reduced() ? wantZ : camZ + (wantZ - camZ) * .12;
      L3.look([5 + (sh2 ? rnd(-sh2, sh2) : 0), 0, camZ], 0, .8, 11.6);
      L3.render();
    }
    function overlay3d() {   /* screen-space bits over the 3D view: castle hearts, tilt bars, "z" (done), "+1" */
      var pc = L3.project(CASTLE.x * K3, 1.55, CASTLE.y * K3), u0 = cv.width / 390;
      for (var h = 0; h < 5; h++) { g.fillStyle = h < S.hearts ? '#e0404a' : 'rgba(0,0,0,.35)'; heart(pc.x - 28 * u0 + h * 14 * u0, pc.y, 5.5 * u0); }
      S.units.forEach(function (o) {
        if (o.dead || o.fallen) return; var top = L3.project(o.x * K3, o.r * K3 * (o.type === 'tower' ? 3.3 : 2.6), o.y * K3);
        if (o.tilt > 0.05) { g.fillStyle = 'rgba(0,0,0,.45)'; g.fillRect(top.x - 13 * u0, top.y - 6 * u0, 26 * u0, 4 * u0); g.fillStyle = o.tilt > 0.66 ? '#e0404a' : '#f5c518'; g.fillRect(top.x - 13 * u0, top.y - 6 * u0, 26 * u0 * Math.min(1, o.tilt), 4 * u0); }
        if (o.side === 'g' && S.phase === 'player' && o.moved && o.acted) { g.fillStyle = 'rgba(255,255,255,.85)'; g.font = '700 ' + Math.round(12 * u0) + 'px system-ui'; g.fillText('z', top.x + 8 * u0, top.y - 2 * u0); }
      });
      S.fx.forEach(function (fx) { if (fx.kind !== 'coin') return; var q = L3.project(fx.x * K3, .9 + fx.t * .5, (fx.y + 30) * K3); g.globalAlpha = Math.max(0, 1 - fx.t); g.fillStyle = '#fff'; g.font = '700 ' + Math.round(14 * u0) + 'px system-ui'; g.fillText('+1', q.x + 10 * u0, q.y); g.globalAlpha = 1; });
    }
    function pick3d(e) {   /* tap -> game point: the unit whose model the tap ray meets first, else the ground */
      var objs = [], byId = {};
      S.units.forEach(function (o) { var f = R3.figs[o.id]; if (f && !o.dead && !o.fallen) { f.G.userData.tag = o.id; objs.push(f.G); byId[o.id] = o; } });
      var id = L3.hit(e.clientX, e.clientY, objs); if (id != null && byId[id]) return { x: byId[id].x, y: byId[id].y };
      var v = L3.pick(e.clientX, e.clientY); return v ? { x: v.x / K3, y: v.z / K3 } : null;
    }

    function frame(dt) { update(dt); draw(); }
    cv.addEventListener('pointerdown', onDown);
    return {
      start: function () { newGame(); host.setPlayers({ opp: { name: 'AI Team', rating: null }, you: { name: 'Green Rangers' } }); host.setActive('bottom'); host.loop(frame); start3d(); },
      newGame: function () { tweens = []; newGame(); host.setActive('bottom'); },
      stop: function () { stopped3d = true; if (L3) { L3.dispose(); L3 = null; } cv.removeEventListener('pointerdown', onDown); if (toolbar) toolbar.remove(); toolbar = null; },
      qa: function (o) {   /* m-3d: QA snapshot (tools/m3d_canvas3d_qa.py) */
        o = o || {}; var pj = null;
        if (o.proj && L3) { var rr = cv.getBoundingClientRect(), pv = L3.project(o.proj[0] * K3, o.proj[2] ? .3 : 0, o.proj[1] * K3), kk = rr.width / cv.width; pj = [rr.left + pv.x * kk, rr.top + pv.y * kk]; }
        return { three: !!L3, proj: pj, sel: S && S.sel ? S.sel.id : null, mode: S && S.mode, units: S ? S.units.filter(function (u) { return u.side === 'g' && !u.dead && !u.fallen; }).map(function (u) { return { id: u.id, x: Math.round(u.x), y: Math.round(u.y), type: u.type }; }) : [] };
      },
      key: function (k, down) {
        if (!down || !S || S.over || S.phase !== 'player' || S.busy) return;
        if (k === 'left') nextUnit(-1); else if (k === 'right') nextUnit(1);
        else if (k === 'action') { S.mode = S.mode === 'attack' ? 'move' : 'attack'; renderToolbar(); setStatus(); }
        else if (k === 'jump') endTurn();
        else if (k === 'Tab') nextUnit(1);
      },
      resize: function () { draw(); },
      redraw: draw
    };
  });
})();
