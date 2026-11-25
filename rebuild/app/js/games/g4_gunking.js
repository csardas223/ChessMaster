/* g4_gunking (group 4): Gun King (AWFB4EzGtDc), a top-down roguelite shooter. You are a king with a gun in an
   octagon arena on a light-blue pixel checker floor; waves of chess-piece enemies chase you (pawns, kamikaze pawns
   with explosives, fast knights, fireball-throwing bishops). Kills drop gold and XP; each level-up offers a pick of
   chess-pun upgrades. Quickplay: survive the level timer. Survival: last as long as you can. Dying = checkmate.
   Controls: arrows / WASD or the on-screen pad to move (or hold a finger on the arena to walk there); the gun
   auto-aims at the nearest enemy and fires while the action button / Space is held, or always with Auto-fire on.
   All art is drawn in code (original pixel shapes). */
(function () {
  'use strict';
  var CM = window.CM;
  var GUNS = {
    pistol: { name: 'Pistol', dmg: 24, rate: 2.6, mag: 10, reload: 1.1, spd: 14, spread: 0.04, n: 1 },
    shotgun: { name: 'Shotgun', dmg: 14, rate: 1.2, mag: 6, reload: 1.6, spd: 12, spread: 0.32, n: 5 },
    crossbow: { name: 'Crossbow', dmg: 60, rate: 1.1, mag: 4, reload: 1.4, spd: 18, spread: 0.01, n: 1, pierce: 2 },
    machine: { name: 'Machine gun', dmg: 11, rate: 9, mag: 40, reload: 2.0, spd: 15, spread: 0.12, n: 1 }
  };
  var UPS = [
    { id: 'endurance', name: "Pawn's Endurance", txt: 'Regenerate 1 HP every 5 s' },
    { id: 'skewer', name: 'Skewer', txt: '+25% reload speed, -5% fire rate' },
    { id: 'pair', name: 'Bishop Pair', txt: '+1 projectile, wider spread, -35% damage' },
    { id: 'race', name: 'Pawn Race', txt: '+30% knockback, +10% move speed' },
    { id: 'reverse', name: 'Reverse Opening', txt: 'Bullets bounce off the first target' },
    { id: 'wing', name: 'Wing Gambit', txt: 'Summon a pawn ally that fights for you' },
    { id: 'aura', name: 'Castle Aura', txt: '20 damage per second to adjacent enemies' },
    { id: 'freeze', name: 'Zugzwang Frost', txt: 'Hits freeze enemies briefly and cost them 10% max HP' },
    { id: 'heavy', name: 'Heavy Pieces', txt: '+25% damage' },
    { id: 'mag', name: 'Deep Pockets', txt: '+50% magazine size' }
  ];
  CM.defineGame('g4_gunking', function (host) {
    var R = 30, cvs = host.canvas, g = host.g;
    var S, me, foes, shots, fshots, drops, fx, keys = {}, t, wave, gold, kills, xp, need, lvl, pick, running, gun, gunId = 'pistol', mode = 'quick', auto = true, touch = null, ally;
    var LEN = 150;
    function reset() {
      me = { x: 0, y: 0, hp: 100, max: 100, spd: 5.2, cd: 0, ammo: 0, rl: 0, inv: 0, regen: 0, kb: 1, dmgMul: 1, extra: 0, spreadAdd: 0, bounce: false, aura: 0, freeze: false, rateMul: 1, reloadMul: 1, magMul: 1, face: 0 };
      gun = GUNS[gunId]; me.ammo = gun.mag; foes = []; shots = []; fshots = []; drops = []; fx = []; t = 0; wave = 0; gold = 0; kills = 0; xp = 0; need = 6; lvl = 1; pick = null; ally = null; running = true;
      host.setPlayers({ opp: { name: mode === 'quick' ? 'Quickplay waves' : 'Survival waves' } });
      host.status(mode === 'quick' ? 'Survive ' + LEN + ' s. Move with the pad; the gun auto-aims.' : 'Survive as long as you can.');
    }
    function inArena(x, y) { var a = Math.abs(x), b = Math.abs(y); return a < R && b < R && a + b < R * 1.42; }
    function clampArena(o) { for (var k = 0; k < 6 && !inArena(o.x, o.y); k++) { o.x *= 0.97; o.y *= 0.97; } }
    function spawn(kind) {
      var a = Math.random() * 6.283, d = R * 0.95, x = Math.cos(a) * d, y = Math.sin(a) * d; clampArena({ x: x, y: y });
      var e = { kind: kind, x: x, y: y, vx: 0, vy: 0, hp: 0, cd: 1 + Math.random(), fr: 0 };
      var hpMul = 1 + wave * 0.12;
      if (kind === 'pawn') { e.hp = 30 * hpMul; e.spd = 2.4; e.r = 0.45; e.dmg = 25; }
      if (kind === 'elite') { e.hp = 90 * hpMul; e.spd = 2.6; e.r = 0.55; e.dmg = 30; }
      if (kind === 'kamikaze') { e.hp = 22 * hpMul; e.spd = 3.6; e.r = 0.45; e.dmg = 30; }
      if (kind === 'knight') { e.hp = 55 * hpMul; e.spd = 2.0; e.r = 0.5; e.dmg = 25; e.lunge = 0; }
      if (kind === 'bishop') { e.hp = 45 * hpMul; e.spd = 1.6; e.r = 0.5; e.dmg = 20; }
      e.max = e.hp; foes.push(e);
    }
    function waveTick(dt) {
      var rate = 0.9 + t / 25;
      if (Math.random() < rate * dt) {
        var r = Math.random(), k = r < 0.55 ? 'pawn' : r < 0.7 ? 'kamikaze' : r < 0.82 ? 'knight' : r < 0.93 ? 'bishop' : 'elite';
        if (t < 15) k = 'pawn'; spawn(k);
      }
      var w = Math.floor(t / 30); if (w > wave) { wave = w; host.toast('Wave ' + (wave + 1), 1200); for (var i = 0; i < 6 + wave * 2; i++) spawn(i % 3 ? 'pawn' : 'kamikaze'); }
    }
    function nearest() { var b = null, bd = 1e9; foes.forEach(function (e) { var d = (e.x - me.x) * (e.x - me.x) + (e.y - me.y) * (e.y - me.y); if (d < bd) { bd = d; b = e; } }); return b; }
    function fire() {
      if (me.rl > 0 || me.cd > 0) return; var tg = nearest(); if (!tg) return;
      var a = Math.atan2(tg.y - me.y, tg.x - me.x); me.face = a;
      var n = gun.n + me.extra, sp = gun.spread + me.spreadAdd;
      for (var i = 0; i < n; i++) { var aa = a + (n > 1 ? (i / (n - 1) - 0.5) * sp * 2 : 0) + (Math.random() - 0.5) * sp * 0.5; shots.push({ x: me.x + Math.cos(a) * 0.6, y: me.y + Math.sin(a) * 0.6, vx: Math.cos(aa) * gun.spd, vy: Math.sin(aa) * gun.spd, life: 1.4, dmg: gun.dmg * me.dmgMul, pierce: gun.pierce || 0, bounce: me.bounce }); }
      fx.push({ k: 'flash', x: me.x + Math.cos(a) * 0.8, y: me.y + Math.sin(a) * 0.8, life: 0.06 });
      host.sound('move-self');
      me.cd = 1 / (gun.rate * me.rateMul); me.ammo--; if (me.ammo <= 0) { me.rl = gun.reload / me.reloadMul; }
    }
    function hurt(dmg) { if (me.inv > 0) return; me.hp -= dmg; me.inv = 0.6; fx.push({ k: 'num', x: me.x, y: me.y - 0.8, txt: '-' + Math.round(dmg), col: '#ff5a5a', life: 0.8 }); host.sound('capture'); if (me.hp <= 0) die(); }
    function die() { running = false; host.over({ result: mode === 'quick' ? 'loss' : 'draw', why: 'Checkmate after ' + fmt(t) + ': ' + gold + ' gold, ' + kills + ' kills, level ' + lvl + '.', title: 'Checkmate' }); }
    function fmt(s) { s = Math.floor(s); return Math.floor(s / 60) + ':' + ('0' + s % 60).slice(-2); }
    function killFoe(e) {
      e.dead = true; kills++; drops.push({ x: e.x, y: e.y, k: 'xp', v: e.kind === 'elite' ? 4 : 1 });
      if (Math.random() < 0.45) drops.push({ x: e.x + 0.3, y: e.y, k: 'gold', v: e.kind === 'elite' ? 5 : 1 });
      fx.push({ k: 'poof', x: e.x, y: e.y, life: 0.35 });
      if (e.kind === 'kamikaze') boom(e.x, e.y, false);
    }
    function boom(x, y, hitsMe) {
      fx.push({ k: 'boom', x: x, y: y, life: 0.4 }); host.sound('explosion');
      foes.forEach(function (f) { if (!f.dead && Math.hypot(f.x - x, f.y - y) < 1.8) { f.hp -= 40; if (f.hp <= 0) killFoe(f); } });
      if (hitsMe && Math.hypot(me.x - x, me.y - y) < 1.9) hurt(30);
    }
    function levelUp() {
      lvl++; xp = 0; need = Math.round(need * 1.45 + 3);
      var pool = UPS.slice(), o = []; while (o.length < 3) o.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
      pick = { opts: o, sel: 1 }; host.sound('promote');
    }
    function apply(u) {
      if (u.id === 'endurance') me.regen += 0.2;
      if (u.id === 'skewer') { me.reloadMul *= 1.25; me.rateMul *= 0.95; }
      if (u.id === 'pair') { me.extra++; me.spreadAdd += 0.1; me.dmgMul *= 0.65; }
      if (u.id === 'race') { me.kb *= 1.3; me.spd *= 1.1; }
      if (u.id === 'reverse') me.bounce = true;
      if (u.id === 'wing') ally = { x: me.x + 1, y: me.y, cd: 0 };
      if (u.id === 'aura') me.aura += 20;
      if (u.id === 'freeze') me.freeze = true;
      if (u.id === 'heavy') me.dmgMul *= 1.25;
      if (u.id === 'mag') me.magMul *= 1.5;
      host.toast(u.name + '!', 1200); pick = null;
    }
    function step(dt) {
      if (!running) { draw(); return; }
      if (pick) { draw(); return; }
      t += dt; if (mode === 'quick' && t >= LEN) { running = false; draw(); host.over({ result: 'win', why: 'Level cleared: ' + gold + ' gold, ' + kills + ' kills, level ' + lvl + '.', title: 'Level Cleared!' }); return; }
      waveTick(dt);
      var mx = (keys.right ? 1 : 0) - (keys.left ? 1 : 0), my = (keys.down ? 1 : 0) - (keys.up ? 1 : 0);
      if (touch && !mx && !my) { var dx = touch.x - me.x, dy = touch.y - me.y, d = Math.hypot(dx, dy); if (d > 0.3) { mx = dx / d; my = dy / d; } }
      var l = Math.hypot(mx, my) || 1; me.x += mx / l * me.spd * dt; me.y += my / l * me.spd * dt; clampArena(me);
      me.cd -= dt; me.inv -= dt; me.hp = Math.min(me.max, me.hp + me.regen * dt);
      if (me.rl > 0) { me.rl -= dt; if (me.rl <= 0) me.ammo = Math.round(gun.mag * me.magMul); }
      if (auto || keys.action || keys.jump) fire();
      if (ally) { var tg = nearest(); ally.cd -= dt; var ax = me.x + 1.2 - ally.x, ay = me.y - ally.y; ally.x += ax * dt * 3; ally.y += ay * dt * 3; if (tg && ally.cd <= 0 && Math.hypot(tg.x - ally.x, tg.y - ally.y) < 6) { ally.cd = 0.7; var a = Math.atan2(tg.y - ally.y, tg.x - ally.x); shots.push({ x: ally.x, y: ally.y, vx: Math.cos(a) * 12, vy: Math.sin(a) * 12, life: 0.8, dmg: 14, pierce: 0 }); } }
      foes.forEach(function (e) {
        if (e.dead) return; if (e.frozen > 0) { e.frozen -= dt; return; }
        var dx = me.x - e.x, dy = me.y - e.y, d = Math.hypot(dx, dy) || 1, sp = e.spd;
        if (e.kind === 'knight') { e.lunge -= dt; if (e.lunge <= 0 && d < 7) { e.lunge = 2.2; e.vx += dx / d * 13; e.vy += dy / d * 13; } }
        if (e.kind === 'bishop') { if (d < 7) sp = -0.6; e.cd -= dt; if (e.cd <= 0 && d < 11) { e.cd = 2.4; fshots.push({ x: e.x, y: e.y, vx: dx / d * 6, vy: dy / d * 6, life: 2.2 }); } }
        e.x += (dx / d * sp + e.vx) * dt; e.y += (dy / d * sp + e.vy) * dt; e.vx *= 0.88; e.vy *= 0.88; clampArena(e);
        if (d < e.r + 0.45) { if (e.kind === 'kamikaze') { e.hp = 0; e.dead = true; kills++; boom(e.x, e.y, true); } else { hurt(e.dmg); e.vx -= dx / d * 6; e.vy -= dy / d * 6; } }
        if (me.aura && d < 1.6) { e.hp -= me.aura * dt; if (e.hp <= 0) killFoe(e); }
      });
      shots.forEach(function (s) {
        s.x += s.vx * dt; s.y += s.vy * dt; s.life -= dt; if (!inArena(s.x, s.y)) s.life = 0;
        for (var i = 0; i < foes.length && s.life > 0; i++) {
          var e = foes[i]; if (e.dead || s.hit === e) continue;
          if (Math.hypot(e.x - s.x, e.y - s.y) < e.r + 0.15) {
            e.hp -= s.dmg; if (me.freeze) { e.frozen = 0.5; e.hp -= e.max * 0.1; }
            var n = Math.hypot(s.vx, s.vy); e.vx += s.vx / n * 3 * me.kb; e.vy += s.vy / n * 3 * me.kb;
            fx.push({ k: 'num', x: e.x, y: e.y - 0.6, txt: String(Math.round(s.dmg)), col: '#fff', life: 0.5 });
            if (e.hp <= 0) killFoe(e);
            s.hit = e;
            if (s.bounce) { s.bounce = false; var o = nearest(); if (o && o !== e) { var a = Math.atan2(o.y - s.y, o.x - s.x); s.vx = Math.cos(a) * n; s.vy = Math.sin(a) * n; } }
            else if (s.pierce > 0) s.pierce--; else s.life = 0;
          }
        }
      });
      fshots.forEach(function (s) { s.x += s.vx * dt; s.y += s.vy * dt; s.life -= dt; if (Math.hypot(s.x - me.x, s.y - me.y) < 0.6) { s.life = 0; hurt(18); } });
      drops.forEach(function (o) { var d = Math.hypot(o.x - me.x, o.y - me.y); if (d < 2.2) { o.x += (me.x - o.x) * dt * 8; o.y += (me.y - o.y) * dt * 8; } if (d < 0.5) { o.got = true; if (o.k === 'gold') gold += o.v; else { xp += o.v; if (xp >= need) levelUp(); } } });
      foes = foes.filter(function (e) { return !e.dead; }); shots = shots.filter(function (s) { return s.life > 0; }); fshots = fshots.filter(function (s) { return s.life > 0; });
      drops = drops.filter(function (o) { return !o.got; }); fx.forEach(function (f) { f.life -= dt; if (f.k === 'num') f.y -= dt; }); fx = fx.filter(function (f) { return f.life > 0; });
      host.hud('<span>HP ' + Math.ceil(me.hp) + ' · ' + (me.rl > 0 ? 'Reloading' : me.ammo + ' ammo') + '</span><span>' + (mode === 'quick' ? fmt(Math.max(0, LEN - t)) : fmt(t)) + ' · ' + gold + 'g · ' + kills + ' kills</span>');
      draw();
    }
    function W2S(x, y) { return [(x - me.x) * S + cvs.width / 2, (y - me.y) * S + cvs.height / 2]; }
    function px(x, y, w, h, c) { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), Math.ceil(w), Math.ceil(h)); }
    /* impl-4 art pass: the video's own sprites (tools/g4_sprites.py) for the Gun King, pawns and red elite pawns;
       knight/bishop/kamikaze have no sprite in the frames we have and keep the drawn pixel fallback below. */
    var SPR = {};
    [['king', 'gun_king'], ['pawn', 'pawn'], ['elite', 'red_pawn']].forEach(function (a) { var im = new Image(); im.src = 'assets/modes/AWFB4EzGtDc/' + a[1] + '.png'; SPR[a[0]] = im; });
    function drawPiece(kind, x, y, s, white, flash) {
      var sp = SPR[kind];
      if (sp && sp.complete && sp.naturalWidth) { g.imageSmoothingEnabled = false; g.globalAlpha = flash ? 0.6 : 1; g.drawImage(sp, x - s * 0.55, y - s * 0.65, s * 1.1, s * 1.1); g.globalAlpha = 1; return; }
      var u = s / 8, b = white ? '#f4f4f4' : '#2a2a2a', o = flash ? '#ffffff' : '#111';
      var red = kind === 'elite' ? '#e03131' : o;
      if (kind === 'king') {
        px(x - 3 * u, y + 2 * u, 6 * u, 2 * u, o); px(x - 2.5 * u, y + 2 * u, 5 * u, 1.4 * u, '#ffd43b');
        px(x - 2 * u, y - 1 * u, 4 * u, 3.4 * u, o); px(x - 1.5 * u, y - 0.6 * u, 3 * u, 2.8 * u, '#ffd43b');
        px(x - 1.6 * u, y - 3 * u, 3.2 * u, 2 * u, o); px(x - 1.1 * u, y - 2.6 * u, 2.2 * u, 1.4 * u, '#ffe066');
        px(x - 0.4 * u, y - 4.6 * u, 0.8 * u, 2 * u, o); px(x - 1 * u, y - 4 * u, 2 * u, 0.8 * u, o);
        return;
      }
      px(x - 3 * u, y + 2 * u, 6 * u, 2 * u, red); px(x - 2.5 * u, y + 2.4 * u, 5 * u, 1.2 * u, b);
      if (kind === 'knight') { px(x - 2 * u, y - 3 * u, 4 * u, 5 * u, red); px(x - 1.5 * u, y - 2.5 * u, 3 * u, 4.6 * u, b); px(x + 1 * u, y - 2 * u, 2.2 * u, 1.6 * u, red); px(x + 1 * u, y - 1.7 * u, 1.8 * u, 1 * u, b); return; }
      if (kind === 'bishop') { px(x - 1.6 * u, y - 3.6 * u, 3.2 * u, 5.8 * u, red); px(x - 1.1 * u, y - 3.1 * u, 2.2 * u, 5.2 * u, '#e8590c'); px(x - 0.4 * u, y - 4.6 * u, 0.8 * u, 1 * u, red); return; }
      px(x - 1.6 * u, y - 2.6 * u, 3.2 * u, 4.8 * u, red); px(x - 1.1 * u, y - 2.1 * u, 2.2 * u, 4.4 * u, b);
      if (kind === 'kamikaze') { px(x - 2 * u, y - 0.2 * u, 4 * u, 1.2 * u, '#c92a2a'); px(x - 0.3 * u, y - 3.4 * u, 0.6 * u, 1 * u, '#ffa94d'); }
    }
    function draw() {
      var Wc = cvs.width, Hc = cvs.height; if (!me) return;
      S = Math.min(Wc, Hc) / 14;
      g.setTransform(1, 0, 0, 1, 0, 0); g.imageSmoothingEnabled = false; px(0, 0, Wc, Hc, '#0b3d5c');
      var x0 = Math.floor(me.x - Wc / S / 2) - 1, x1 = Math.ceil(me.x + Wc / S / 2) + 1, y0 = Math.floor(me.y - Hc / S / 2) - 1, y1 = Math.ceil(me.y + Hc / S / 2) + 1;
      for (var yy = y0; yy <= y1; yy++) for (var xx = x0; xx <= x1; xx++) { if (!inArena(xx + 0.5, yy + 0.5)) continue; var p = W2S(xx, yy); px(p[0], p[1], S + 1, S + 1, (xx + yy) & 1 ? '#aeebfd' : '#e9f8ff'); }
      drops.forEach(function (o) { var p = W2S(o.x, o.y); px(p[0] - S * 0.12, p[1] - S * 0.12, S * 0.24, S * 0.24, o.k === 'gold' ? '#fcc419' : '#51cf66'); });
      foes.forEach(function (e) { var p = W2S(e.x, e.y); drawPiece(e.kind, p[0], p[1], S * (e.kind === 'elite' ? 1.2 : 1), true, e.frozen > 0); if (e.frozen > 0) { g.fillStyle = 'rgba(116,192,252,.45)'; g.fillRect(p[0] - S * 0.4, p[1] - S * 0.5, S * 0.8, S); } if (e.hp < e.max) { px(p[0] - S * 0.4, p[1] - S * 0.75, S * 0.8, S * 0.08, '#333'); px(p[0] - S * 0.4, p[1] - S * 0.75, S * 0.8 * Math.max(0, e.hp / e.max), S * 0.08, '#e03131'); } });
      if (ally) { var pa = W2S(ally.x, ally.y); drawPiece('pawn', pa[0], pa[1], S * 0.8, false); }
      fshots.forEach(function (s) { var p = W2S(s.x, s.y); px(p[0] - S * 0.14, p[1] - S * 0.14, S * 0.28, S * 0.28, '#ff6b00'); px(p[0] - S * 0.07, p[1] - S * 0.07, S * 0.14, S * 0.14, '#ffe066'); });
      shots.forEach(function (s) { var p = W2S(s.x, s.y); px(p[0] - S * 0.07, p[1] - S * 0.07, S * 0.14, S * 0.14, '#212529'); });
      var c = W2S(me.x, me.y); if (!(me.inv > 0 && Math.floor(me.inv * 20) % 2)) drawPiece('king', c[0], c[1], S * 1.1, false);
      g.save(); g.translate(c[0], c[1]); g.rotate(me.face); px(S * 0.25, -S * 0.07, S * 0.5, S * 0.14, '#343a40'); g.restore();
      fx.forEach(function (f) {
        var p = W2S(f.x, f.y);
        if (f.k === 'flash') px(p[0] - S * 0.15, p[1] - S * 0.15, S * 0.3, S * 0.3, '#ffd43b');
        if (f.k === 'poof') { g.fillStyle = 'rgba(255,255,255,' + f.life * 2 + ')'; g.beginPath(); g.arc(p[0], p[1], S * (0.9 - f.life), 0, 7); g.fill(); }
        if (f.k === 'boom') { g.fillStyle = 'rgba(255,120,0,' + f.life * 2 + ')'; g.beginPath(); g.arc(p[0], p[1], S * 1.8 * (1 - f.life), 0, 7); g.fill(); }
        if (f.k === 'num') { g.fillStyle = f.col; g.font = 'bold ' + Math.round(S * 0.4) + 'px monospace'; g.textAlign = 'center'; g.fillText(f.txt, p[0], p[1]); }
      });
      /* HP and XP bars */
      px(8, Hc - 22, Wc * 0.4, 10, '#222'); px(8, Hc - 22, Wc * 0.4 * Math.max(0, me.hp / me.max), 10, '#e03131');
      px(8, Hc - 9, Wc - 16, 5, '#222'); px(8, Hc - 9, (Wc - 16) * Math.min(1, xp / need), 5, '#51cf66');
      g.fillStyle = '#fff'; g.font = 'bold ' + Math.round(Hc / 34) + 'px sans-serif'; g.textAlign = 'right'; g.fillText('Lv ' + lvl, Wc - 8, Hc - 14);
      if (pick) {
        px(0, 0, Wc, Hc, 'rgba(0,0,0,0.6)'); g.textAlign = 'center'; g.fillStyle = '#fff'; g.font = 'bold ' + Math.round(Hc / 18) + 'px sans-serif'; g.fillText('LEVEL UP: pick one', Wc / 2, Hc * 0.18);
        pick.opts.forEach(function (u, i) {
          var y = Hc * (0.26 + i * 0.22), h = Hc * 0.19; px(Wc * 0.08, y, Wc * 0.84, h, i === pick.sel ? '#2f9e44' : '#343a40');
          g.fillStyle = '#fff'; g.font = 'bold ' + Math.round(Hc / 24) + 'px sans-serif'; g.fillText(u.name, Wc / 2, y + h * 0.42);
          g.font = Math.round(Hc / 32) + 'px sans-serif'; g.fillText(u.txt, Wc / 2, y + h * 0.75);
        });
      }
    }
    function toWorld(e) { var r = cvs.getBoundingClientRect(), k = cvs.width / r.width; return { x: ((e.clientX - r.left) * k - cvs.width / 2) / S + me.x, y: ((e.clientY - r.top) * k - cvs.height / 2) / S + me.y, cy: (e.clientY - r.top) * k }; }
    function pdown(e) {
      if (!running) return; var w = toWorld(e);
      if (pick) { var i = Math.floor((w.cy / cvs.height - 0.26) / 0.22); if (i >= 0 && i < 3) apply(pick.opts[i]); return; }
      touch = w; cvs.setPointerCapture && cvs.setPointerCapture(e.pointerId);
    }
    function pmove(e) { if (touch && running) touch = toWorld(e); }
    function pup() { touch = null; }
    function newGame() { reset(); draw(); }
    return {
      start: function () {
        cvs.addEventListener('pointerdown', pdown); cvs.addEventListener('pointermove', pmove); cvs.addEventListener('pointerup', pup); cvs.addEventListener('pointercancel', pup);
        host.picker('Gun / mode', [{ value: 'pistol', label: 'Pistol' }, { value: 'shotgun', label: 'Shotgun' }, { value: 'crossbow', label: 'Crossbow' }, { value: 'machine', label: 'Machine gun' }, { value: 'survival', label: 'Survival' }, { value: 'quick', label: 'Quickplay' }, { value: 'auto', label: 'Auto-fire on/off' }], gunId, function (v) {
          if (v === 'auto') { auto = !auto; host.toast('Auto-fire ' + (auto ? 'on' : 'off (hold action)')); return; }
          if (v === 'survival' || v === 'quick') mode = v; else gunId = v; newGame();
        });
        newGame(); host.loop(step);
      },
      newGame: newGame,
      stop: function () { running = false; cvs.removeEventListener('pointerdown', pdown); cvs.removeEventListener('pointermove', pmove); cvs.removeEventListener('pointerup', pup); cvs.removeEventListener('pointercancel', pup); },
      key: function (k, down) {
        if (pick && down) { if (k === 'up' || k === 'left') pick.sel = (pick.sel + 2) % 3; else if (k === 'down' || k === 'right') pick.sel = (pick.sel + 1) % 3; else if (k === 'action' || k === 'jump') apply(pick.opts[pick.sel]); draw(); return; }
        keys[k] = down;
      },
      resize: function () { draw(); }, redraw: draw
    };
  });
})();
