/* g5_fps: FPS Chess. Pieces move like normal chess (no check rule: kings are captured), but every capture attempt
   becomes a short first-person duel between the two pieces: a 3-2-1 countdown, then you tap/click the enemy to
   shoot it while it shoots back. Each class has its own weapon (damage), health and dodge speed; damage carries over
   between duels (piece prop hp). The duel winner keeps/takes the square: if the attacker loses, the defender stays
   and the attacker is knocked out. Duels are capped at params.duel_ms (default 7000): a draw means the defender holds.
   Mode params: arena { wall, floor, accent } colours, duel_ms. */
(function () {
  'use strict';
  var CM = window.CM;
  var CLS = {
    K: { hp: 160, dmg: 55, rate: 1500, acc: 0.62, speed: 0.9, w: 'Royal blade (melee swipe)' },
    Q: { hp: 130, dmg: 34, rate: 1100, acc: 0.6, speed: 1.1, w: 'Rifle' },
    R: { hp: 150, dmg: 44, rate: 1600, acc: 0.55, speed: 0.7, w: 'Shotgun' },
    B: { hp: 95, dmg: 26, rate: 1000, acc: 0.55, speed: 1.6, w: 'Wand (flies)' },
    N: { hp: 100, dmg: 40, rate: 1500, acc: 0.6, speed: 1.4, w: 'Bow (sprints)' },
    P: { hp: 75, dmg: 20, rate: 1000, acc: 0.5, speed: 1.0, w: 'Pistol' }
  };
  var token = 0;
  function cls(t) { return CLS[t] || CLS.P; }
  function hpOf(p) { return p.hp != null ? p.hp : cls(p.t).hp; }
  function css() {
    if (document.getElementById('g5-fps-css')) return;
    var s = document.createElement('style'); s.id = 'g5-fps-css';
    s.textContent = '.g5fps{position:fixed;inset:0;z-index:90;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.72);animation:g5fpsIn .22s ease-out}' +
      '@keyframes g5fpsIn{from{opacity:0}to{opacity:1}}' +
      '.g5fps__box{position:relative;width:min(94vw,560px);aspect-ratio:4/3;border-radius:6px;overflow:hidden;cursor:crosshair;touch-action:none;box-shadow:0 8px 30px rgba(0,0,0,.6)}' +
      '.g5fps__tgt{position:absolute;width:22%;aspect-ratio:1;transform:translate(-50%,-50%);pointer-events:none;filter:drop-shadow(0 6px 4px rgba(0,0,0,.5))}' +
      '.g5fps__tgt img{width:100%;height:100%}' +
      '.g5fps__hud{position:absolute;left:0;right:0;top:0;display:flex;justify-content:space-between;gap:8px;padding:8px 10px;font:600 13px/1.2 system-ui,sans-serif;color:#fff;text-shadow:0 1px 2px #000;pointer-events:none}' +
      '.g5fps__bar{height:7px;width:120px;background:rgba(0,0,0,.5);border-radius:4px;overflow:hidden;margin-top:4px}.g5fps__bar i{display:block;height:100%;background:#81b64c;transition:width .2s ease-out}' +
      '.g5fps__bar--e i{background:#e0533d}' +
      '.g5fps__big{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font:800 64px system-ui,sans-serif;color:#fff;text-shadow:0 2px 8px #000;pointer-events:none}' +
      '.g5fps__hit{position:absolute;inset:0;background:radial-gradient(transparent 40%,rgba(200,0,0,.55));opacity:0;pointer-events:none;transition:opacity .25s ease-out}' +
      '.g5fps__gun{position:absolute;right:6%;bottom:-4%;width:28%;pointer-events:none}' +
      '.g5fps__tip{position:absolute;left:0;right:0;bottom:8px;text-align:center;font:500 12px system-ui,sans-serif;color:#eee;text-shadow:0 1px 2px #000;pointer-events:none}' +
      '.g5fps-hp{position:absolute;left:12%;right:12%;bottom:6%;height:9%;background:rgba(0,0,0,.45);border-radius:3px;overflow:hidden;pointer-events:none}.g5fps-hp i{display:block;height:100%;background:#e8c547}';
    document.head.appendChild(s);
  }
  function close() { var o = document.querySelector('.g5fps'); if (o) o.remove(); }
  /* run one duel; resolves to { won: bool, me: hp, foe: hp } (won = the human's piece survived and the foe fell) */
  function duel(ctx, mine, foe, attacking) {
    css(); close();
    var my = token, A = ctx.params.arena || {}, reduced = CM.settings.reducedMotion(), cap = ctx.params.duel_ms || 7000;
    var mc = cls(mine.t), fc = cls(foe.t), hpM = hpOf(mine), hpF = hpOf(foe), maxM = mc.hp, maxF = fc.hp;
    var names = { K: 'King', Q: 'Queen', R: 'Rook', B: 'Bishop', N: 'Knight', P: 'Pawn' };
    var el = document.createElement('div'); el.className = 'g5fps'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'Duel');
    el.innerHTML = '<div class="g5fps__box" style="background:linear-gradient(180deg,' + (A.wall || '#7a1f22') + ' 0 58%,' + (A.floor || '#3b2a20') + ' 58% 100%)">' +
      '<svg viewBox="0 0 100 75" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%"><g fill="' + (A.accent || '#c9a227') + '" opacity=".35"><rect x="6" y="8" width="12" height="30"/><rect x="82" y="8" width="12" height="30"/><rect x="40" y="6" width="20" height="14"/></g><path d="M0 43.5H100" stroke="rgba(0,0,0,.35)" stroke-width=".8"/><g fill="rgba(0,0,0,.3)"><rect x="14" y="48" width="18" height="9"/><rect x="66" y="50" width="20" height="8"/></g></svg>' +
      '<div class="g5fps__tgt"><img alt="" src="' + CM.settings.pieceUrl(foe.c === 'w' ? 'w' : 'b', foe.t) + '"><div class="g5fps-hp"><i></i></div></div>' +
      '<div class="g5fps__hit"></div>' +
      '<svg class="g5fps__gun" viewBox="0 0 60 40"><path d="M6 34 L30 18 L56 14 L58 20 L34 26 L22 38 Z" fill="#2b2926" stroke="#111"/><rect x="40" y="12" width="16" height="4" fill="#555"/></svg>' +
      '<div class="g5fps__hud"><div>You: ' + names[mine.t] + ' · ' + mc.w + '<div class="g5fps__bar"><i class="me"></i></div></div><div style="text-align:right">' + names[foe.t] + ' · ' + fc.w + '<div class="g5fps__bar g5fps__bar--e" style="margin-left:auto"><i class="foe"></i></div></div></div>' +
      '<div class="g5fps__big">3</div><div class="g5fps__tip">' + (attacking ? 'You attack: win the duel to take the square.' : 'You are attacked: survive to hold the square.') + ' Tap the enemy to shoot.</div></div>';
    document.body.appendChild(el);
    var box = el.querySelector('.g5fps__box'), tgt = el.querySelector('.g5fps__tgt'), big = el.querySelector('.g5fps__big'), hit = el.querySelector('.g5fps__hit');
    var barM = el.querySelector('.me'), barF = el.querySelector('.foe'), hpbar = el.querySelector('.g5fps-hp i');
    function bars() { barM.style.width = Math.max(0, 100 * hpM / maxM) + '%'; barF.style.width = Math.max(0, 100 * hpF / maxF) + '%'; hpbar.style.width = Math.max(0, 100 * hpF / maxF) + '%'; }
    bars();
    return new Promise(function (res) {
      var live = false, t0 = 0, x = 0.5, y = 0.55, vx = 0.18 * fc.speed, vy = 0.08 * fc.speed, last = 0, nextShot = 0, done = false;
      function finish(won) {
        if (done) return; done = true; live = false;
        big.textContent = won ? 'WIN' : 'LOSS'; big.style.color = won ? '#81b64c' : '#e0533d';
        setTimeout(function () { close(); res({ won: won, me: Math.max(1, Math.round(hpM)), foe: Math.max(1, Math.round(hpF)) }); }, 650);
      }
      function frame(t) {
        if (my !== token || done) { if (my !== token) close(); return; }
        if (!live) return;
        var dt = last ? Math.min(0.05, (t - last) / 1000) : 0; last = t;
        if (!reduced) { x += vx * dt; y += vy * dt; if (x < 0.14 || x > 0.86) vx = -vx; if (y < 0.4 || y > 0.8) vy = -vy; x = Math.max(0.14, Math.min(0.86, x)); y = Math.max(0.4, Math.min(0.8, y)); }
        tgt.style.left = (x * 100) + '%'; tgt.style.top = (y * 100) + '%';
        if (t >= nextShot) {
          nextShot = t + fc.rate * (0.8 + Math.random() * 0.4);
          if (Math.random() < fc.acc) { hpM -= fc.dmg; hit.style.opacity = '1'; setTimeout(function () { hit.style.opacity = '0'; }, 160); CM.sound.play('capture'); bars(); if (hpM <= 0) return finish(false); }
        }
        if (t - t0 > cap) return finish(!attacking ? true : false);
        requestAnimationFrame(frame);
      }
      tgt.style.left = '50%'; tgt.style.top = '55%';
      box.addEventListener('pointerdown', function (e) {
        if (!live || done) return; e.preventDefault();
        var r = box.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        var tr = tgt.getBoundingClientRect(), hw = tr.width / r.width / 2, hh = tr.height / r.height / 2;
        CM.sound.play('move-self');
        if (Math.abs(px - x) <= hw && Math.abs(py - y) <= hh) { hpF -= mc.dmg; bars(); if (hpF <= 0) finish(true); }
      });
      var n = 3;
      (function count() {
        if (my !== token) return close();
        if (n > 0) { big.textContent = String(n); CM.sound.play('tick'); n--; setTimeout(count, 600); return; }
        big.textContent = ''; live = true; t0 = performance.now(); nextShot = t0 + fc.rate; requestAnimationFrame(frame);
      })();
    });
  }
  CM.defineHooks('g5_fps', {
    setup: function () { token++; close(); },
    onExit: function () { token++; close(); },
    onUndo: function () { token++; close(); },
    afterMove: function (ctx, m, info) {
      if (!m.cap || m.cap.c === 'n') return null;
      var capSq = m.capSq != null ? m.capSq : m.t, att = ctx.at(m.t), def = m.cap, playerAtt = info.by === 'player';
      if (!att) return null;
      var mine = playerAtt ? att : def, foe = playerAtt ? def : att;
      return duel(ctx, mine, foe, playerAtt).then(function (r) {
        var attWon = playerAtt ? r.won : !r.won;
        var attHp = playerAtt ? r.me : r.foe, defHp = playerAtt ? r.foe : r.me;
        if (attWon) { ctx.set(m.t, Object.assign({}, att, { hp: attHp })); ctx.toast((playerAtt ? 'You won the duel' : 'You lost the duel') + ': the square is taken.', 1800); }
        else { ctx.set(m.t, null); ctx.set(capSq, Object.assign({}, def, { hp: defHp })); ctx.toast((playerAtt ? 'You lost the duel' : 'You won the duel') + ': the attacker is knocked out.', 1800); }
      });
    },
    decorate: function (ctx, sq, p) {
      if (!p || p.hp == null) return null; var mx = cls(p.t).hp; if (p.hp >= mx) return null;
      css(); return { html: '<div class="g5fps-hp" style="bottom:3%;height:7%"><i style="width:' + Math.round(100 * p.hp / mx) + '%"></i></div>' };
    },
    status: function (ctx) { return 'Every capture is a duel: tap the enemy to shoot.'; }
  });
})();
