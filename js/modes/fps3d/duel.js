/* fps3d/duel: the real-3D first-person duel of FPS Chess (PszkLYudcws, Nz2A-g73_iM). js/modes/g5_fps.js calls
   CM.fps3d.run(ctx, { mine, foe, attacking, mineSq, foeSq }) for every capture attempt and gets back a Promise of
   { won, me, foe } (won = the human's piece survived and the foe fell; me / foe = hp left), the same contract as the
   2D tap duel it replaces (that one stays as the fallback when WebGL or three.js is not available).
   Arena: the 8x8 board as the floor (3 m tiles) with a 1-tile walkway, walls at +-15 m; every other piece on the board
   stands on its square as a statue (cover); raised platforms on a4/a5/h4/h5 with steps (high ground, the sniping pawn of
   Nz2A-g73_iM); crates in the walkway. PszkLYudcws = Victorian red room (ceiling, fireplace, fog); Nz2A-g73_iM = grey
   courtyard under a sky dome. Models: js/modes/fps3d/models.js (original, code-built).
   Controls. Desktop: WASD / arrows move, mouse look (pointer lock; right-drag look without it), left click fire (hold for
   the rifle), R reload, Space jump, Left Shift sprint (bishop: fly), E ability, hold Q block. Phone: left joystick,
   drag anywhere on the right to look (the Fire button also drags), Fire / Jump / Reload / Ability / Sprint / Block buttons.
   Rules from the videos (see g5_fps.js): 3-2-1 then fight; king = melee swipe and most health; pawn pistol; knight bow +
   sprint; bishop flies; E ability once per duel; you can block shots (block stamina 3 s: inferred, so a defender cannot
   block out the clock); damage carries over. Duel cap params.duel3d_ms (default 60 s): time out = the defender holds.
   Sounds: our own synthesised gun WAVs from assets/modes/AWFB4EzGtDc/ (Gun King mode) plus the core set.
   QA: CM.fps3d.dbg() (state), CM.fps3d.dbgAim() (point the camera at the foe). */
(function () {
  'use strict';
  var CM = window.CM;
  var TS = 4.2, HALF = 24, GRAV = 16;   /* TS: one board square on the arena floor; HALF: the room's half width */
  var NAMES = { K: 'King', Q: 'Queen', R: 'Rook', B: 'Bishop', N: 'Knight', P: 'Pawn' };
  var ABIL_ICON = { K: '&#9819;', Q: '&#10040;', R: '&#10040;', B: '&#10041;', N: '&#10148;', P: '&#9823;' };   /* E tile icons: pull, power shot, bomb, inward arrows, second pawn */
  /* hp / acc / speed match the 2D duel (g5_fps.js CLS); weapon numbers from docs/fps3d-wip.md */
  var CLS = {
    K: { hp: 160, acc: .62, speed: .9, w: 'Royal blade', kind: 'melee', dmg: 55, rate: .7, mag: 0, range: 3.3, reload: 0, snd: 'fps_crossbow', pref: 1.6 },
    Q: { hp: 130, acc: .6, speed: 1.1, w: 'Battle rifle', kind: 'hitscan', dmg: 24, rate: .26, mag: 15, range: 55, reload: 1.6, snd: 'fps_machine', auto: true, spread: .012, pref: 13 },
    R: { hp: 150, acc: .55, speed: .8, w: 'Shotgun', kind: 'hitscan', dmg: 8, pellets: 10, rate: .85, mag: 6, range: 22, reload: 1.8, snd: 'fps_shotgun', spread: .07, pref: 6 },
    B: { hp: 95, acc: .55, speed: 1.15, w: 'Wand', kind: 'proj', dmg: 26, rate: .45, mag: 8, range: 45, reload: 1.3, snd: 'fps_crossbow', pspeed: 30, pgrav: 0, pref: 11 },
    N: { hp: 100, acc: .6, speed: 1.25, w: 'Crossbow', kind: 'proj', dmg: 40, rate: .8, mag: 5, range: 60, reload: 1.4, snd: 'fps_crossbow', pspeed: 42, pgrav: 6, pref: 15 },
    P: { hp: 75, acc: .5, speed: 1, w: 'AK rifle', kind: 'hitscan', dmg: 9, rate: .13, mag: 30, range: 50, reload: 1.5, snd: 'fps_machine', auto: true, spread: .014, pref: 12 }   /* Nz2A-g73_iM thumbnail: the pawn holds an AK */
  };
  var SND = { fps_pistol: 'pistol', fps_shotgun: 'shotgun', fps_machine: 'machine', fps_crossbow: 'crossbow', fps_grenade: 'grenade', fps_reload: 'reload' };
  Object.keys(SND).forEach(function (k) { CM.sound.register(k, 'assets/modes/AWFB4EzGtDc/' + SND[k] + '.wav'); });
  function cls(t) { return CLS[t] || CLS.P; }
  var glOK = null, live = null;
  function supported() {
    if (glOK != null) return glOK;
    try { var c = document.createElement('canvas'); glOK = !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl'))); } catch (e) { glOK = false; }
    return glOK;
  }
  function css() {
    if (document.getElementById('fps3d-css')) return;
    var s = document.createElement('style'); s.id = 'fps3d-css';
    s.textContent = '.f3d{position:fixed;inset:0;z-index:95;background:#000;touch-action:none;user-select:none;-webkit-user-select:none;overflow:hidden;font-family:system-ui,sans-serif;color:#fff}' +
      '.f3d>canvas{position:absolute;inset:0;width:100%;height:100%;display:block}' +
      '.f3d__hud{position:absolute;inset:0;pointer-events:none;text-shadow:0 1px 2px #000}' +
      '.f3d__top{position:absolute;left:calc(10px + env(safe-area-inset-left));right:calc(10px + env(safe-area-inset-right));top:calc(8px + env(safe-area-inset-top));display:flex;justify-content:space-between;align-items:flex-start;gap:8px;font:600 12px/1.25 system-ui,sans-serif}' +
      '.f3d__who{min-width:0;max-width:40%}.f3d__who b{display:block;font-size:13px}.f3d__who--foe{text-align:right}' +
      '.f3d__bar{height:8px;width:min(150px,36vw);background:rgba(0,0,0,.55);border-radius:4px;overflow:hidden;margin-top:4px}.f3d__bar i{display:block;height:100%;width:100%;background:#81b64c;transition:width .18s ease-out}' +
      '.f3d__who--foe .f3d__bar{margin-left:auto}.f3d__who--foe .f3d__bar i{background:#e0533d}' +
      '.f3d__stam{height:3px;width:min(150px,36vw);background:rgba(0,0,0,.5);margin-top:3px;border-radius:2px;overflow:hidden}.f3d__stam i{display:block;height:100%;background:#9fd8ff}' +
      '.f3d__clock{font:700 15px system-ui,sans-serif;padding-top:2px}' +
      '.f3d__map{position:absolute;right:calc(10px + env(safe-area-inset-right));top:calc(62px + env(safe-area-inset-top));width:84px;height:84px;border-radius:6px;background:rgba(0,0,0,.45)}' +
      /* crosshair: four short ticks around an open centre, like the game's (PszkLYudcws duel still) */
      '.f3d__x{position:absolute;left:50%;top:50%;width:22px;height:22px;transform:translate(-50%,-50%)}.f3d__x i{position:absolute;background:rgba(255,255,255,.92);box-shadow:0 0 2px rgba(0,0,0,.8)}' +
      '.f3d__x i:nth-child(1){left:10px;top:0;width:2px;height:6px}.f3d__x i:nth-child(2){left:10px;bottom:0;width:2px;height:6px}.f3d__x i:nth-child(3){top:10px;left:0;height:2px;width:6px}.f3d__x i:nth-child(4){top:10px;right:0;height:2px;width:6px}' +
      /* ability tiles bottom-left: white rounded squares with an icon and the key ("Left Shift", "E") as in the duel still */
      '.f3d__tiles{position:absolute;left:calc(14px + env(safe-area-inset-left));bottom:calc(46px + env(safe-area-inset-bottom));display:flex;gap:8px}' +
      '.f3d__tile{width:58px;height:58px;border-radius:9px;background:rgba(244,240,232,.94);color:#1b1b1b;display:flex;flex-direction:column;align-items:center;justify-content:center;font:400 30px/1 Georgia,serif;text-shadow:none;box-shadow:0 2px 6px rgba(0,0,0,.45);transition:opacity .2s}' +
      '.f3d__tile small{font:italic 9px/1 Georgia,serif;margin-top:3px}.f3d__tile.off{opacity:.38}' +
      '.f3d--touch .f3d__btn[data-a=sprint],.f3d--touch .f3d__btn[data-a=ability]{border-radius:9px;background:rgba(244,240,232,.94);color:#1b1b1b;border:0;font:400 24px/1 Georgia,serif;flex-direction:column}' +
      '.f3d--touch .f3d__btn[data-a=sprint] small,.f3d--touch .f3d__btn[data-a=ability] small{font:italic 8px/1 Georgia,serif;margin-top:2px}' +
      '.f3d__hm{position:absolute;left:50%;top:50%;width:34px;height:34px;transform:translate(-50%,-50%) rotate(45deg);opacity:0;transition:opacity .15s ease-out}' +
      '.f3d__hm:before,.f3d__hm:after{content:"";position:absolute;background:#fff}.f3d__hm:before{left:16px;top:0;width:2px;height:34px}.f3d__hm:after{top:16px;left:0;height:2px;width:34px}.f3d__hm.on{opacity:1;transition:none}.f3d__hm.kill:before,.f3d__hm.kill:after{background:#ff4d4d}' +
      '.f3d__vig{position:absolute;inset:0;background:radial-gradient(transparent 45%,rgba(200,0,0,.6));opacity:0;transition:opacity .3s ease-out}.f3d__vig.on{opacity:1;transition:none}' +
      '.f3d__big{position:absolute;left:0;right:0;top:34%;text-align:center;font:800 64px/1 system-ui,sans-serif;text-shadow:0 2px 10px #000}' +
      /* VS card (the game's duel intro): grey / cream diagonal split rendered in 3D behind, names top, an orange "Vs" */
      '.f3d--vs .f3d__hud>*:not(.f3d__vs),.f3d--vs .f3d__pad{visibility:hidden}.f3d__vs{position:absolute;inset:0;transition:opacity .3s ease-out}.f3d__vs b{position:absolute;top:calc(5% + env(safe-area-inset-top));font:800 clamp(24px,7vw,46px)/1 system-ui,sans-serif}' +
      '.f3d__vs b.l{left:12%;color:#fff;text-shadow:0 2px 4px rgba(0,0,0,.45)}.f3d__vs b.r{right:10%;color:#161616;text-shadow:0 1px 2px rgba(255,255,255,.4)}' +
      '.f3d__vs em{position:absolute;left:0;right:0;top:46%;text-align:center;font:800 clamp(40px,12vw,80px)/1 system-ui,sans-serif;font-style:normal;color:rgba(240,150,90,.55)}' +
      '.f3d__vs small{position:absolute;left:6%;right:6%;bottom:calc(5% + env(safe-area-inset-bottom));text-align:center;font:600 14px system-ui,sans-serif;color:#222;text-shadow:0 1px 2px rgba(255,255,255,.6)}' +
      '.f3d__say{position:absolute;left:0;right:0;top:calc(54px + env(safe-area-inset-top));text-align:center;font:700 15px system-ui,sans-serif;color:#ffe08a}' +
      '.f3d__ammo{position:absolute;right:calc(14px + env(safe-area-inset-right));bottom:calc(14px + env(safe-area-inset-bottom));font:700 20px system-ui,sans-serif;text-align:right}.f3d__ammo small{display:block;font:500 11px system-ui,sans-serif;opacity:.85}' +
      '.f3d__help{position:absolute;left:calc(12px + env(safe-area-inset-left));bottom:calc(12px + env(safe-area-inset-bottom));transition:opacity 1s;font:500 11px/1.4 system-ui,sans-serif;opacity:.85}' +
      '.f3d__dmg{position:absolute;font:800 16px system-ui,sans-serif;color:#fff;transform:translate(-50%,-50%);animation:f3dUp .7s ease-out forwards}.f3d__dmg.hd{color:#ffd54a}' +
      '@keyframes f3dUp{to{transform:translate(-50%,-150%);opacity:0}}' +
      '.reduce-motion .f3d__dmg{animation:none;opacity:.9}' +
      '.f3d--touch .f3d__ammo{bottom:calc(282px + env(safe-area-inset-bottom));right:calc(18px + env(safe-area-inset-right))}' +
      '.f3d__pad{position:absolute;inset:0;display:none}.f3d--touch .f3d__pad{display:block}' +
      '.f3d__btn{position:absolute;display:flex;align-items:center;justify-content:center;border-radius:50%;background:rgba(20,20,20,.55);border:2px solid rgba(255,255,255,.55);color:#fff;font:700 11px/1.1 system-ui,sans-serif;text-align:center;touch-action:none;padding:0}' +
      '.f3d__btn.on{background:rgba(129,182,76,.8);color:#111}.f3d__btn.off{opacity:.38}' +
      '.f3d__btn--fire{width:86px;height:86px;font-size:14px;background:rgba(200,40,40,.6)}' +
      '.f3d__joy{position:absolute;width:118px;height:118px;margin:-59px 0 0 -59px;border-radius:50%;border:2px solid rgba(255,255,255,.45);background:rgba(0,0,0,.22);pointer-events:none}' +
      '.f3d__joy i{position:absolute;left:50%;top:50%;width:50px;height:50px;margin:-25px 0 0 -25px;border-radius:50%;background:rgba(255,255,255,.55)}';
    document.head.appendChild(s);
  }

  /* ------------------------------------------------------------------------------------------------ the duel */
  function run(ctx, o) {
    abort();
    return new Promise(function (resolve, reject) {
      try { live = new Duel(ctx, o, resolve); } catch (e) { live = null; reject(e); }
    });
  }
  function abort() { if (live) { var d = live; live = null; d.destroy(); } }

  function Duel(ctx, o, resolve) {
    var T = window.THREE, M = CM.fps3dModels, D = this;
    if (!T || !M) throw new Error('three.js / fps3d models not loaded');
    css();
    D.T = T; D.ctx = ctx; D.o = o; D.resolve = resolve; D.dead = false; D.timers = [];
    var P = ctx.params || {}, A = P.arena || {}, spec = ctx.spec || {}, g = ctx.geo;
    D.reduced = CM.settings.reducedMotion();
    D.touch = !!(window.matchMedia && matchMedia('(pointer: coarse)').matches) || ('ontouchstart' in window && navigator.maxTouchPoints > 0);
    D.cap = (P.duel3d_ms || 60000) / 1000;
    D.theme = 'room';   /* both videos are the same game: every duel is fought in its Victorian red room */
    var mineC = o.mine.c === 'w' ? 'w' : 'b', foeC = o.foe.c === 'w' ? 'w' : 'b';
    D.mc = cls(o.mine.t); D.fc = cls(o.foe.t);

    /* ---- DOM ---- */
    var el = D.el = document.createElement('div'); el.className = 'f3d' + (D.touch ? ' f3d--touch' : ''); el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'FPS duel');
    var sprintLbl = o.mine.t === 'B' ? 'Fly' : 'Sprint';
    el.innerHTML = '<div class="f3d__hud">' +
      '<div class="f3d__top"><div class="f3d__who"><b>You: ' + NAMES[o.mine.t] + '</b>' + D.mc.w + '<div class="f3d__bar"><i data-r="me"></i></div><div class="f3d__stam"><i data-r="stam"></i></div></div>' +
      '<div class="f3d__clock" data-r="clock"></div>' +
      '<div class="f3d__who f3d__who--foe"><b>' + NAMES[o.foe.t] + '</b>' + D.fc.w + '<div class="f3d__bar"><i data-r="foe"></i></div></div></div>' +
      '<canvas class="f3d__map" width="168" height="168" data-r="map"></canvas>' +
      '<div class="f3d__x"><i></i><i></i><i></i><i></i></div><div class="f3d__hm" data-r="hm"></div><div class="f3d__vig" data-r="vig"></div><div class="f3d__say" data-r="say"></div>' +
      '<div class="f3d__ammo" data-r="ammo"></div>' +
      (D.touch ? '' : '<div class="f3d__tiles"><div class="f3d__tile" data-r="tsprint">' + (o.mine.t === 'B' ? '&#10022;' : '&#187;') + '<small>Left Shift</small></div><div class="f3d__tile" data-r="tability">' + ABIL_ICON[o.mine.t] + '<small>E</small></div></div>' +
        '<div class="f3d__help" data-r="help">WASD move · mouse aim · click fire · R reload · Space jump<br>Shift ' + sprintLbl.toLowerCase() + ' · E ability · hold Q block</div>') +
      '<div class="f3d__big" data-r="big"></div></div>' +
      '<div class="f3d__pad" data-r="pad"><div class="f3d__joy" data-r="joy" style="left:90px;bottom:auto;top:calc(100% - 150px)"><i data-r="knob"></i></div>' +
      btn('fire', 'FIRE', 'right:calc(16px + env(safe-area-inset-right));bottom:calc(96px + env(safe-area-inset-bottom))', 'f3d__btn--fire') +
      btn('jump', 'JUMP', 'right:calc(112px + env(safe-area-inset-right));bottom:calc(70px + env(safe-area-inset-bottom));width:58px;height:58px') +
      btn('reload', 'RELOAD', 'right:calc(26px + env(safe-area-inset-right));bottom:calc(194px + env(safe-area-inset-bottom));width:56px;height:56px') +
      btn('ability', ABIL_ICON[o.mine.t] + '<small>E</small>', 'right:calc(118px + env(safe-area-inset-right));bottom:calc(142px + env(safe-area-inset-bottom));width:56px;height:56px') +
      btn('sprint', (o.mine.t === 'B' ? '&#10022;' : '&#187;') + '<small>' + sprintLbl + '</small>', 'right:calc(186px + env(safe-area-inset-right));bottom:calc(84px + env(safe-area-inset-bottom));width:54px;height:54px') +
      btn('block', 'BLOCK', 'right:calc(96px + env(safe-area-inset-right));bottom:calc(214px + env(safe-area-inset-bottom));width:54px;height:54px') + '</div>' +
      '<div class="f3d__vs" data-r="vs"><b class="l">' + NAMES[o.mine.t] + '</b><b class="r">' + NAMES[o.foe.t] + '</b><em>Vs</em><small>' +
      (o.attacking ? 'You attack: win the duel to take the square.' : 'You are attacked: survive to hold the square.') + '</small></div>';
    function btn(a, label, style, extra) { return '<button type="button" class="f3d__btn ' + (extra || '') + '" data-a="' + a + '" style="' + style + ';' + (a === 'fire' ? '' : '') + '">' + label + '</button>'; }
    D.r = {}; [].forEach.call(el.querySelectorAll('[data-r]'), function (n) { D.r[n.dataset.r] = n; });
    D.btns = {}; [].forEach.call(el.querySelectorAll('[data-a]'), function (n) { D.btns[n.dataset.a] = n; });
    document.body.appendChild(el);
    D.prevOverflow = document.body.style.overflow; document.body.style.overflow = 'hidden';
    var vp = document.querySelector('meta[name=viewport]'); D.vp = vp; D.vpOld = vp && vp.getAttribute('content');
    if (vp) vp.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover');
    /* pause the 3D board renderer underneath while the duel owns the screen */
    var S3 = CM.scene3d && CM.scene3d.current && CM.scene3d.current();
    if (S3 && S3.renderer) { D.s3 = S3; D.s3render = S3.renderer.render; S3.renderer.render = function () { }; }

    /* ---- renderer + scenes ---- */
    var R = D.renderer = new T.WebGLRenderer({ antialias: !D.touch, powerPreference: 'high-performance' });
    D.pr = Math.min(CM.fps3d.maxPR || 1.5, window.devicePixelRatio || 1);   /* maxPR: QA lowers it for SwiftShader */ R.setPixelRatio(D.pr);
    R.outputColorSpace = T.SRGBColorSpace; R.shadowMap.enabled = true; R.shadowMap.type = T.PCFShadowMap; R.autoClear = false;
    el.insertBefore(R.domElement, el.firstChild);
    var scene = D.scene = new T.Scene(), cam = D.cam = new T.PerspectiveCamera(75, 1, .05, 200); cam.rotation.order = 'YXZ';
    D.vmScene = new T.Scene(); D.vmCam = new T.PerspectiveCamera(55, 1, .01, 10);
    D.vmScene.add(new T.HemisphereLight(0xffffff, 0x404050, 2.2)); var vdl = new T.DirectionalLight(0xffffff, 1.6); vdl.position.set(1, 2, 1); D.vmScene.add(vdl);
    D.obst = []; D.boxes = []; D.circles = []; D.mats = [];
    D.buildArena(T, M, A, g, spec);
    /* ---- the two fighters ---- */
    var mat = function (c) { return new T.MeshLambertMaterial({ color: c }); };
    D.matW = mat('#ece6d6'); D.matB = mat('#2c2724'); D.trimW = mat('#c9a227'); D.trimB = mat('#a8892a');
    D.bandFoe = new T.MeshBasicMaterial({ color: '#ff4d4d' }); D.bandMe = new T.MeshBasicMaterial({ color: '#4fc3f7' }); D.metal = mat('#3a3d42');
    function cellXZ(i) { return { x: (g.col(i) - 3.5) * TS, z: (g.row(i) - 3.5) * TS }; }
    var ps = cellXZ(o.mineSq), fs = cellXZ(o.foeSq);
    /* spawns: each piece on its own square; when they start closer than 9 m (a pawn capture starts on adjacent squares)
       the attacker steps back to the nearest clear cell about 11 m from the defender */
    if (Math.hypot(ps.x - fs.x, ps.z - fs.z) < 12 || !D.cellOk(Math.round(ps.x / TS + 3.5), Math.round(ps.z / TS + 3.5)) || !D.cellOk(Math.round(fs.x / TS + 3.5), Math.round(fs.z / TS + 3.5))) {
      /* the defender keeps its own cell when it is clear (else the nearest clear one); the attacker steps back to a clear cell ~14 m away */
      var mv = o.attacking ? ps : fs, st0 = o.attacking ? fs : ps, best = null, bs = 1e9;
      if (!D.cellOk(Math.round(st0.x / TS + 3.5), Math.round(st0.z / TS + 3.5))) {
        for (var c1 = -1; c1 <= 8; c1++) for (var r1 = -1; r1 <= 8; r1++) { if (!D.cellOk(c1, r1)) continue; var d1 = Math.hypot(D.cellC(c1) - st0.x, D.cellC(r1) - st0.z); if (d1 < bs) { bs = d1; best = [D.cellC(c1), D.cellC(r1)]; } }
        if (best) { st0.x = best[0]; st0.z = best[1]; } best = null; bs = 1e9;
      }
      for (var cc = -1; cc <= 8; cc++) for (var rr = -1; rr <= 8; rr++) {
        if (!D.cellOk(cc, rr)) continue;
        var x = D.cellC(cc), z = D.cellC(rr), sc = Math.abs(Math.hypot(x - st0.x, z - st0.z) - 14) + .3 * Math.hypot(x - mv.x, z - mv.z) + (D.groundAt(x, z) > 0 ? 3 : 0);
        if (sc < bs) { bs = sc; best = [x, z]; }
      }
      if (best) { mv.x = best[0]; mv.z = best[1]; }
    }
    var maxM = D.mc.hp, maxF = D.fc.hp;
    D.me = { t: o.mine.t, c: mineC, x: ps.x, z: ps.z, y: 0, vy: 0, yaw: 0, pitch: 0, ground: true, hp: hpOf(o.mine), max: maxM, ammo: D.mc.mag, nextFire: 0,
      reloadUntil: 0, sprintUntil: 0, sprintReady: 0, fuel: 1.8, flying: false, block: false, stam: 3, used: false, power: 0, bigUntil: 0, eye: Math.min(2.3, M.HEIGHT[o.mine.t] * .82), rad: .45 };
    D.me.y = D.groundAt(D.me.x, D.me.z);
    D.me.yaw = Math.atan2(-(fs.x - ps.x), -(fs.z - ps.z));
    var fu = M.unit(T, o.foe.t, { body: D.pieceMat(foeC), trim: D.pieceMat(foeC), metal: D.metal });
    /* floating health bar over the enemy piece (Nz2A-g73_iM: health bars) */
    var hb = new T.Group(), hbg = new T.Mesh(new T.PlaneGeometry(1.5, .2), new T.MeshBasicMaterial({ color: '#111', transparent: true, opacity: .65, depthWrite: false }));
    var hfg = new T.Mesh(new T.PlaneGeometry(1.44, .14).translate(.72, 0, 0), new T.MeshBasicMaterial({ color: '#e0533d', depthWrite: false })); hfg.position.set(-.72, 0, .01);
    hb.add(hbg); hb.add(hfg); hb.position.y = fu.userData.height + .45; fu.add(hb); D.hpBar = hb; D.hpFill = hfg;
    scene.add(fu);
    D.foe = { t: o.foe.t, c: foeC, mesh: fu, x: fs.x, z: fs.z, y: D.groundAt(fs.x, fs.z), hp: hpOf(o.foe), max: maxF, rad: Math.max(.5, fu.userData.radius * .9), yaw: D.me.yaw + Math.PI,
      move: null, think: .4, nextFire: 1, sawAt: -1, used: false, abilityAt: 4 + Math.random() * 6, power: 0, alive: true, deathT: 0, h: fu.userData.height };
    D.helpers = []; D.stat = { shots: 0, hits: 0, foeShots: 0, taken: 0 };
    /* viewmodel */
    D.vm = M.viewmodel(T, o.mine.t, '#9fd8ff'); D.vmScene.add(D.vm); D.vmBase = new T.Vector3(.26, -.28, -.5);
    D.vmFlash = new T.Mesh(new T.PlaneGeometry(.22, .22), new T.MeshBasicMaterial({ color: '#ffd27a', transparent: true, opacity: .95, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide }));
    D.vmFlash.visible = false; D.vm.userData.muzzle.add(D.vmFlash);
    D.recoil = 0; D.swing = 0; D.bob = 0; D.shake = 0;
    D.buildVs(T, M, mineC, foeC);
    /* permanent flash lights (intensity pulsed; never add lights at runtime) */
    D.flashMe = new T.PointLight('#ffcf80', 0, 9, 2); scene.add(D.flashMe);
    D.flashFoe = new T.PointLight('#ffcf80', 0, 9, 2); scene.add(D.flashFoe);
    D.efFlash = new T.Mesh(new T.SphereGeometry(.16, 6, 4), new T.MeshBasicMaterial({ color: '#ffd27a' })); D.efFlash.visible = false; scene.add(D.efFlash);
    /* pools: tracers, projectiles, sparks, the bomb warning ring */
    D.tracers = []; var tm = new T.LineBasicMaterial({ color: '#ffe9a8', transparent: true, opacity: .9 });
    for (var i = 0; i < 10; i++) { var lg = new T.BufferGeometry(); lg.setAttribute('position', new T.Float32BufferAttribute([0, 0, 0, 0, 0, 1], 3)); var ln = new T.Line(lg, tm.clone()); ln.visible = false; ln.frustumCulled = false; scene.add(ln); D.tracers.push({ l: ln, t: 0 }); }
    D.projs = []; D.projPool = [];
    D.sparks = []; var sg2 = new T.BoxGeometry(.12, .12, .12);
    for (var j = 0; j < 36; j++) { var sm = new T.Mesh(sg2, new T.MeshBasicMaterial({ color: '#ffb04a' })); sm.visible = false; scene.add(sm); D.sparks.push({ m: sm, v: new T.Vector3(), t: 0 }); }
    D.ring = new T.Mesh(new T.RingGeometry(2.6, 3.2, 28).rotateX(-Math.PI / 2), new T.MeshBasicMaterial({ color: '#ff3030', transparent: true, opacity: .7, side: T.DoubleSide, depthWrite: false }));
    D.ring.visible = false; scene.add(D.ring); D.bombs = [];
    D.ray = new T.Raycaster();
    /* ---- input ---- */
    D.keys = {}; D.joy = null; D.look = null; D.firing = false; D.locked = false;
    D.bind();
    D.resize(); D.hud();
    /* ---- phases: VS card, 3-2-1, fight ---- */
    D.phase = 'intro'; D.t = 0; D.clock = 0; D.frames = 0; D.slow = 0;
    var vs = D.r.vs, big = D.r.big, n = 3;
    D.vsOn = true; el.classList.add('f3d--vs'); D.later(function () { vs.style.opacity = '0'; el.classList.remove('f3d--vs'); D.later(function () { vs.remove(); D.vsOn = false; }, 300); count(); }, 1600);
    function count() {
      if (D.dead) return;
      if (n > 0) { big.textContent = String(n); CM.sound.play('tick'); n--; D.later(count, 600); return; }
      big.textContent = 'FIGHT'; D.phase = 'fight'; D.later(function () { if (big.textContent === 'FIGHT') big.textContent = ''; }, 500);
    }
    D.last = performance.now();
    D.raf = requestAnimationFrame(function loop(now) { if (D.dead) return; D.frame(now); D.raf = requestAnimationFrame(loop); });
  }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function hpOf(p) { return p.hp != null ? p.hp : cls(p.t).hp; }
  var Dp = Duel.prototype;
  Dp.later = function (fn, ms) { var D = this; var id = setTimeout(function () { if (!D.dead) fn(); }, ms); D.timers.push(id); return id; };

  /* the VS card scene: grey (left) / cream (right) diagonal split with a thin white seam, the two glossy pieces leaning */
  Dp.buildVs = function (T, M, mineC, foeC) {
    var D = this, S = D.vsScene2 = new T.Scene(), cam = D.vsCam2 = new T.PerspectiveCamera(40, 1, .1, 50); cam.position.set(0, 0, 9);
    var tex = canvasTex(T, 512, 512, function (x, w, h) {
      x.fillStyle = '#efe6cf'; x.fillRect(0, 0, w, h); x.fillStyle = '#8f8f8b'; x.beginPath(); x.moveTo(0, 0); x.lineTo(w * .44, 0); x.lineTo(w * .5, h); x.lineTo(0, h); x.fill();
      x.strokeStyle = '#fbfaf5'; x.lineWidth = 5; x.beginPath(); x.moveTo(w * .44, 0); x.lineTo(w * .5, h); x.stroke();
    });
    var bg = new T.Mesh(new T.PlaneGeometry(1, 1), new T.MeshBasicMaterial({ map: tex })); bg.position.z = -6; S.add(bg); D.vsBg = bg;
    S.add(new T.HemisphereLight('#ffffff', '#6a6052', 1.6)); var kl = new T.DirectionalLight('#ffffff', 2.4); kl.position.set(-3, 4, 6); S.add(kl);
    D.vsL = M.piece(T, D.me.t, { body: D.pieceMat(mineC), shadow: false }); D.vsR = M.piece(T, D.foe.t, { body: D.pieceMat(foeC), shadow: false });
    D.vsL.rotation.set(.1, .5, .32); D.vsR.rotation.set(.1, D.foe.t === 'N' ? 1.1 : -.4, -.12); S.add(D.vsL); S.add(D.vsR);
  };
  Dp.layoutVs = function () {
    var D = this, cam = D.vsCam2; if (!cam) return; var hh = Math.tan(cam.fov * Math.PI / 360) * 15, hw = hh * cam.aspect;
    D.vsBg.scale.set(hw * 2.2, hh * 2.2, 1);
    var vh = Math.tan(cam.fov * Math.PI / 360) * 9, vw = vh * cam.aspect, size = Math.min(vh * 1.2, vw * 1.15);
    [[D.vsL, -1], [D.vsR, 1]].forEach(function (q) { var g = q[0], k = size / g.userData.height; g.scale.setScalar(k); g.position.set(q[1] * vw * .46, -size * .55, q[1] * .3); });
  };
  /* ---------------------------------------------------------------------------------------------- arena */
  /* canvas textures in the game's cartoon style (main menu + duel stills of PszkLYudcws / Nz2A-g73_iM) */
  function canvasTex(T, w, h, draw, rx, ry) {
    var cv = document.createElement('canvas'); cv.width = w; cv.height = h; draw(cv.getContext('2d'), w, h);
    var t = new T.CanvasTexture(cv); t.colorSpace = T.SRGBColorSpace; t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(rx || 1, ry || 1); t.anisotropy = 4; return t;
  }
  function grain(x, w, h, base, line, knots) {   /* red-orange wood grain: vertical wavy lines and oval knots */
    x.fillStyle = base; x.fillRect(0, 0, w, h); x.strokeStyle = line; x.lineWidth = 2.2; x.globalAlpha = .55;
    for (var i = 0; i < 22; i++) { var x0 = (i + .5) * w / 22; x.beginPath(); for (var y = 0; y <= h; y += 8) x.lineTo(x0 + Math.sin(y / 37 + i * 1.7) * 5 + Math.sin(y / 11 + i) * 1.2, y); x.stroke(); }
    for (var k = 0; k < knots; k++) { var kx = ((k * 97) % w), ky = ((k * 173) % h); x.beginPath(); x.ellipse(kx, ky, 7, 20, 0, 0, 7); x.stroke(); x.beginPath(); x.ellipse(kx, ky, 3, 10, 0, 0, 7); x.stroke(); }
    x.globalAlpha = 1;
  }
  /* The arena is the game's own Victorian red room seen at piece scale (PszkLYudcws duel still at 7:xx: you fight on
     the floor under the giant table that holds the chessboard, chandelier overhead, red wood-grain walls, curtains,
     wall sconces, fireplace, red carpet with gold diamonds, plank floor). Nz2A-g73_iM is the same game and room.
     Cover = table legs, chairs, giant books; high ground = the chair seats (book steps lead up) and two book perches
     (the pawn that sniped "from on top", Nz2A-g73_iM 2:16). */
  Dp.buildArena = function (T, M, A, g, spec) {
    var D = this, scene = D.scene;
    var sb = spec.board || {}, light = sb.light || '#eaeac6', dark = sb.dark || '#727266';
    var lam = function (c, ex) { var m = new T.MeshLambertMaterial(Object.assign({ color: c }, ex || {})); D.mats.push(m); return m; };
    var WALLH = 26; D.ceil = WALLH; D.slabs = [];
    scene.background = new T.Color('#2a0f0c'); scene.fog = new T.Fog('#3a1712', 34, 95);
    scene.add(new T.HemisphereLight('#ffe2c8', '#5a2a1c', 1.75));
    var sun = new T.DirectionalLight('#ffe6c4', 1.5); sun.position.set(-8, 30, 10); sun.castShadow = true;   /* the chandelier light */
    sun.shadow.mapSize.set(1024, 1024); var sc = sun.shadow.camera; sc.left = -HALF; sc.right = HALF; sc.top = HALF; sc.bottom = -HALF; sc.far = 80; sun.shadow.bias = -.0015;
    scene.add(sun); scene.add(sun.target); D.sun = sun;
    function solid(mesh, rec) { mesh.castShadow = true; mesh.receiveShadow = true; scene.add(mesh); D.obst.push(mesh); if (rec) D.boxes.push(rec); return mesh; }
    function box(x0, x1, z0, z1, y0, y1, m, rec) {
      var mesh = new T.Mesh(new T.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), m); mesh.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
      return solid(mesh, rec === false ? null : (rec || { x0: x0, x1: x1, z0: z0, z1: z1, top: y1 }));
    }
    /* floor planks, walls, ceiling */
    var planks = canvasTex(T, 256, 256, function (x, w, h) {
      for (var i = 0; i < 8; i++) { x.fillStyle = ['#7a4524', '#6e3d1f', '#83502b', '#734221'][i % 4]; x.fillRect(i * 32, 0, 32, h); x.fillStyle = 'rgba(40,18,8,.55)'; x.fillRect(i * 32, 0, 2, h); x.fillRect(i * 32, ((i * 89) % h), 32, 2); }
      x.strokeStyle = 'rgba(60,28,12,.35)'; for (var k = 0; k < 40; k++) { var px = (k * 53) % w; x.beginPath(); x.moveTo(px, (k * 31) % h); x.lineTo(px + 3, (k * 31) % h + 40); x.stroke(); }
    }, 10, 10);
    var floor = new T.Mesh(new T.PlaneGeometry(2 * HALF, 2 * HALF).rotateX(-Math.PI / 2), lam('#ffffff', { map: planks })); floor.receiveShadow = true; scene.add(floor);
    var carpet = canvasTex(T, 512, 384, function (x, w, h) {
      x.fillStyle = '#b3122a'; x.fillRect(0, 0, w, h); x.strokeStyle = '#e8b23a'; x.lineWidth = 10; x.strokeRect(14, 14, w - 28, h - 28); x.lineWidth = 3; x.strokeRect(32, 32, w - 64, h - 64);
      x.fillStyle = '#e8b23a'; for (var r = 0; r < 9; r++) for (var c = 0; c < 13; c++) { var cx = 56 + c * 33.5, cy = 56 + r * 34; x.beginPath(); x.moveTo(cx, cy - 7); x.lineTo(cx + 6, cy); x.lineTo(cx, cy + 7); x.lineTo(cx - 6, cy); x.fill(); }
    });
    var cm = new T.Mesh(new T.PlaneGeometry(36, 27).rotateX(-Math.PI / 2), lam('#ffffff', { map: carpet })); cm.position.y = .03; cm.receiveShadow = true; scene.add(cm);
    var wallTex = canvasTex(T, 512, 512, function (x, w, h) { grain(x, w, h, '#a8402a', '#5e1a10', 9); }, 3, 1.4);
    var wm = lam('#ffffff', { map: wallTex }), base = lam('#4a1a10');
    [[0, -HALF - .5, 2 * HALF + 2, 1], [0, HALF + .5, 2 * HALF + 2, 1], [-HALF - .5, 0, 1, 2 * HALF + 2], [HALF + .5, 0, 1, 2 * HALF + 2]].forEach(function (w) {
      var m = new T.Mesh(new T.BoxGeometry(w[2], WALLH, w[3]), wm); m.position.set(w[0], WALLH / 2, w[1]); m.receiveShadow = true; scene.add(m); D.obst.push(m);
      var b = new T.Mesh(new T.BoxGeometry(w[2] + .1, 1.1, w[3] + .1), base); b.position.set(w[0], .55, w[1]); scene.add(b);
    });
    var ceil = new T.Mesh(new T.PlaneGeometry(2 * HALF, 2 * HALF).rotateX(Math.PI / 2), lam('#7a1416')); ceil.position.y = WALLH; scene.add(ceil);
    /* the giant table with the chessboard (and every other piece of the position) on top */
    var wood = lam('#6b3a1e'), woodL = lam('#7d4626');
    var TX = 11, TZ = 7.5, TY = 7.5;
    box(-TX, TX, -TZ, TZ, TY - .7, TY, wood, false); D.slabs.push({ x0: -TX, x1: TX, z0: -TZ, z1: TZ, y0: TY - .7, top: TY });
    box(-TX + .6, TX - .6, -TZ + .6, TZ - .6, TY - 1.6, TY - .7, woodL, false);
    var legPts = [[0, 0], [.75, 0], [.75, .5], [.5, .8], [.45, 2.4], [.7, 2.9], [.42, 3.4], [.42, 5.2], [.62, 5.6], [.55, 6.1], [0, 6.1]].map(function (q) { return new T.Vector2(q[0], q[1]); });
    var legGeo = new T.LatheGeometry(legPts, 12);
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (q) {
      var l = new T.Mesh(legGeo, wood); l.position.set(q[0] * (TX - 1.2), 0, q[1] * (TZ - 1.2)); solid(l);
      D.circles.push({ x: l.position.x, z: l.position.z, r: .75, top: TY });
    });
    var bt = canvasTex(T, 256, 256, function (x) { for (var r = 0; r < 8; r++) for (var c = 0; c < 8; c++) { x.fillStyle = (r + c) % 2 === 0 ? light : dark; x.fillRect(c * 32, r * 32, 32, 32); } });
    bt.magFilter = T.NearestFilter; bt.repeat.set(1, 1);
    var BS = 1.5, brd = new T.Mesh(new T.PlaneGeometry(8 * BS, 8 * BS).rotateX(-Math.PI / 2), lam('#ffffff', { map: bt })); brd.position.y = TY + .02; scene.add(brd);
    var frame = new T.Mesh(new T.BoxGeometry(8 * BS + .8, .2, 8 * BS + .8), lam('#3e2414')); frame.position.y = TY + .09; scene.add(frame); brd.position.y = TY + .2;
    var b = D.ctx.state.b, stW = D.pieceMat('w'), stB = D.pieceMat('b');
    for (var i = 0; i < b.length; i++) {
      var p = b[i]; if (!p || i === D.o.mineSq || i === D.o.foeSq || i === D.o.skipSq) continue;
      if (!g.valid[i] || p.c === 'n' && !NAMES[p.t]) continue;
      var st = M.piece(T, NAMES[p.t] ? p.t : 'P', { body: p.c === 'w' ? stW : stB, shadow: false });
      st.scale.setScalar(.36); st.position.set((g.col(i) - 3.5) * BS, TY + .2, (g.row(i) - 3.5) * BS); st.rotation.y = p.c === 'w' ? Math.PI : 0; scene.add(st);
    }
    /* two chairs (seat = high ground) with giant-book steps up to each seat */
    var books = ['#2f5d3a', '#7b1d1d', '#24446b', '#c9b37e', '#5b3a6b', '#8a5a1e'].map(function (c) { return lam(c); });
    [1, -1].forEach(function (sd) {
      var z0 = sd > 0 ? 10 : -16, z1 = sd > 0 ? 16 : -10, SY = 4.2;
      box(-3.2, 3.2, z0, z1, SY - .5, SY, woodL, false); D.slabs.push({ x0: -3.2, x1: 3.2, z0: z0, z1: z1, y0: SY - .5, top: SY });
      [[-2.8, z0 + .4], [2.8, z0 + .4], [-2.8, z1 - .4], [2.8, z1 - .4]].forEach(function (q) { var l = new T.Mesh(new T.CylinderGeometry(.32, .38, SY - .5, 8), wood); l.position.set(q[0], (SY - .5) / 2, q[1]); solid(l); D.circles.push({ x: q[0], z: q[1], r: .4, top: SY - .5 }); });
      var bz0 = sd > 0 ? z1 - .6 : z0, bz1 = sd > 0 ? z1 : z0 + .6;
      box(-3.2, 3.2, bz0, bz1, SY, SY + 8, wood, { x0: -3.2, x1: 3.2, z0: bz0, z1: bz1, top: SY + 8 });
      box(-3.2, 3.2, bz0, bz1, SY + 8, SY + 8.6, woodL, false);
      /* steps: five giant books, 0.7 m each, beside the seat */
      for (var k = 0; k < 5; k++) {
        var sx0 = 3.2 * sd > 0 ? 3.2 : -5.4, sx1 = sx0 + 2.2, zz0 = sd > 0 ? 9.6 + k * 1.2 : -10.8 - k * 1.2;
        if (sd < 0) { sx0 = -5.4; sx1 = -3.2; }
        box(sx0, sx1, zz0, zz0 + 1.2, 0, .7 * (k + 1), books[k % books.length]);
      }
    });
    /* giant books lying on the floor (cover you can hop onto) and two book perches with a step */
    [[-16, -6, 3.4, 4.4, .9], [16, 6, 3.4, 4.4, .9], [-15, 10, 4.4, 3.2, .7], [15, -10, 4.4, 3.2, .7]].forEach(function (q, k) { box(q[0] - q[2] / 2, q[0] + q[2] / 2, q[1] - q[3] / 2, q[1] + q[3] / 2, 0, q[4], books[(k + 2) % books.length]); });
    box(-21, -16.8, -4.2, 0, 0, 1.4, books[1]); box(-16.8, -15.2, -4.2, 0, 0, .7, books[3]);
    box(16.8, 21, 0, 4.2, 0, 1.4, books[2]); box(15.2, 16.8, 0, 4.2, 0, .7, books[4]);
    /* fireplace on the far wall with the painting above, sconces, curtains, a door, the chandelier */
    var brick = lam('#5a2a1a'), mantel = lam('#3e1f12');
    box(-6, -4, -HALF, -HALF + 1.6, 0, 7.5, brick); box(4, 6, -HALF, -HALF + 1.6, 0, 7.5, brick); box(-6.6, 6.6, -HALF, -HALF + 2, 7.5, 8.4, mantel);
    var back = new T.Mesh(new T.PlaneGeometry(8, 7.5), lam('#1a0b07')); back.position.set(0, 3.75, -HALF + .05); scene.add(back);
    D.boxes.push({ x0: -4, x1: 4, z0: -HALF, z1: -HALF + 1.2, top: 7.5 });
    var fireM = new T.MeshBasicMaterial({ color: '#ffb340' }), fireM2 = new T.MeshBasicMaterial({ color: '#ff6a1a' }); D.flames = [];
    for (var f = 0; f < 7; f++) { var fl = new T.Mesh(new T.ConeGeometry(.45, 2.2, 6), f % 2 ? fireM : fireM2); fl.position.set(-2.4 + f * .8, 1.6, -HALF + .7); scene.add(fl); D.flames.push(fl); }
    var logs = new T.Mesh(new T.CylinderGeometry(.35, .35, 6, 8).rotateZ(Math.PI / 2), lam('#3a2010')); logs.position.set(0, .45, -HALF + .8); scene.add(logs);
    var fl2 = new T.PointLight('#ff9a4a', 60, 30, 2); fl2.position.set(0, 2.4, -HALF + 3.5); scene.add(fl2); D.fireLight = fl2;
    var pf = new T.Mesh(new T.BoxGeometry(8.4, 6.4, .3), lam('#3a2412')); pf.position.set(0, 13.6, -HALF + .2); scene.add(pf);
    var art = canvasTex(T, 128, 96, function (x, w, h) { var gr = x.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#2a2622'); gr.addColorStop(1, '#5a4a3c'); x.fillStyle = gr; x.fillRect(0, 0, w, h); x.fillStyle = '#c9b8a0'; x.beginPath(); x.ellipse(60, 40, 14, 18, 0, 0, 7); x.fill(); x.fillStyle = '#1a1614'; x.fillRect(40, 58, 44, 38); });
    var pa = new T.Mesh(new T.PlaneGeometry(7.4, 5.4), lam('#ffffff', { map: art })); pa.position.set(0, 13.6, -HALF + .37); scene.add(pa);
    var brass = lam('#d8b878'), shade = new T.MeshBasicMaterial({ color: '#fff4dc' });
    [[-HALF + .3, -12, 1], [-HALF + .3, 12, 1], [HALF - .3, -12, -1], [HALF - .3, 12, -1], [-13, -HALF + .3, 0], [13, -HALF + .3, 0]].forEach(function (q) {
      var gS = new T.Group(); [-.8, .8].forEach(function (o2) { var arm = new T.Mesh(new T.CylinderGeometry(.08, .12, 1.4, 6), brass); arm.position.set(o2, 0, .6); gS.add(arm); var sh = new T.Mesh(new T.CylinderGeometry(.35, .7, .9, 10, 1, true), shade); sh.position.set(o2, 1.1, .6); gS.add(sh); });
      gS.position.set(q[0], 12, q[1]); gS.rotation.y = q[2] === 0 ? 0 : q[2] > 0 ? Math.PI / 2 : -Math.PI / 2; scene.add(gS);
    });
    var cur = lam('#d94a5a');
    [[-HALF + 3, HALF - .8], [HALF - 3, HALF - .8], [HALF - .8, -HALF + 3]].forEach(function (q, k) {
      for (var j = 0; j < 4; j++) { var c = new T.Mesh(new T.CylinderGeometry(.55, .55, WALLH - 2, 8), cur); c.position.set(q[0] + (k < 2 ? (j - 1.5) * .9 : 0), (WALLH - 2) / 2, q[1] + (k < 2 ? 0 : (j - 1.5) * .9)); scene.add(c); }
    });
    var door = new T.Mesh(new T.BoxGeometry(.4, 14, 7), lam('#2a120a')); door.position.set(HALF - .1, 7, 8); scene.add(door);
    var ch = new T.Group(), chw = lam('#6b4022');
    var ring = new T.Mesh(new T.TorusGeometry(3.4, .22, 6, 24).rotateX(Math.PI / 2), chw); ch.add(ring);
    for (var s2 = 0; s2 < 8; s2++) { var a2 = s2 * Math.PI / 4; var sp = new T.Mesh(new T.BoxGeometry(.18, .18, 4.4), chw); sp.rotation.y = a2; ch.add(sp); var bulb = new T.Mesh(new T.SphereGeometry(.38, 8, 6), new T.MeshBasicMaterial({ color: '#ffe9a8' })); bulb.position.set(Math.cos(a2) * 3.4, .45, Math.sin(a2) * 3.4); ch.add(bulb); }
    var rod = new T.Mesh(new T.CylinderGeometry(.1, .1, 5, 5), chw); rod.position.y = 2.6; ch.add(rod); ch.position.set(0, WALLH - 5.2, 0); scene.add(ch);
  };
  /* glossy cream / black chess-piece material (the VS-card renders) */
  Dp.pieceMat = function (c) {
    var T = this.T, k = 'pm' + c; if (this[k]) return this[k];
    var m = new T.MeshPhongMaterial({ color: c === 'w' ? '#e9dcbc' : '#2e2c2b', specular: c === 'w' ? '#5a5040' : '#6a6a6a', shininess: 70 }); this.mats.push(m); this[k] = m; return m;
  };
  /* the floor height under (x, z): the highest box top containing the point (pad widens it for a body radius). Slabs
     (table top, chair seats) count only when `below` says the body is up there; underneath them you walk the floor */
  Dp.groundAt = function (x, z, below, pad) {
    var h = 0; pad = pad || 0;
    for (var i = 0; i < this.boxes.length; i++) { var b = this.boxes[i]; if (x >= b.x0 - pad && x <= b.x1 + pad && z >= b.z0 - pad && z <= b.z1 + pad && b.top > h && (below == null || b.top <= below)) h = b.top; }
    if (below != null) for (var j = 0; j < this.slabs.length; j++) { var s = this.slabs[j]; if (x >= s.x0 - pad && x <= s.x1 + pad && z >= s.z0 - pad && z <= s.z1 + pad && s.top > h && s.top <= below && below - .75 >= s.y0 - .05) h = s.top; }
    return h;
  };
  /* head room under a slab: returns the slab bottom above (x, z, y) or null */
  Dp.headroom = function (x, z, y) {
    for (var j = 0; j < this.slabs.length; j++) { var s = this.slabs[j]; if (x >= s.x0 && x <= s.x1 && z >= s.z0 && z <= s.z1 && y < s.y0) return s.y0; }
    return null;
  };
  /* push a body (circle r at feet height y) out of walls, boxes it cannot step onto and statues */
  Dp.collide = function (e, r) {
    var lim = HALF - r; e.x = clamp(e.x, -lim, lim); e.z = clamp(e.z, -lim, lim);
    for (var i = 0; i < this.boxes.length; i++) {
      var b = this.boxes[i]; if (b.top <= e.y + .75) continue;
      var cx = clamp(e.x, b.x0, b.x1), cz = clamp(e.z, b.z0, b.z1), dx = e.x - cx, dz = e.z - cz, d = Math.hypot(dx, dz);
      if (d >= r) continue;
      if (d < 1e-4) {   /* centre inside: leave by the nearest side */
        var opts = [[b.x0 - r - e.x, 0], [b.x1 + r - e.x, 0], [0, b.z0 - r - e.z], [0, b.z1 + r - e.z]];
        opts.sort(function (a, c) { return Math.abs(a[0] + a[1]) - Math.abs(c[0] + c[1]); }); e.x += opts[0][0]; e.z += opts[0][1];
      } else { e.x = cx + dx / d * r; e.z = cz + dz / d * r; }
    }
    for (var j = 0; j < this.circles.length; j++) {
      var c = this.circles[j]; if (c.top <= e.y + .3) continue;
      var ddx = e.x - c.x, ddz = e.z - c.z, dd = Math.hypot(ddx, ddz), rr = r + c.r;
      if (dd < rr) { if (dd < 1e-4) { ddx = 1; dd = 1; } e.x = c.x + ddx / dd * rr; e.z = c.z + ddz / dd * rr; }
    }
  };
  /* true when the straight line a -> b (world points) is not blocked by walls, boxes or statues */
  Dp.los = function (a, b) {
    var T = this.T, dir = new T.Vector3().subVectors(b, a), L = dir.length(); if (L < .01) return true;
    this.ray.set(a, dir.normalize()); this.ray.far = L;
    return this.ray.intersectObjects(this.obst, true).length === 0;
  };
  Dp.hitboxes = function () {
    var out = []; if (this.foe.alive) out = out.concat(this.foe.mesh.userData.hitboxes);
    this.helpers.forEach(function (h) { if (h.side === 'foe' && h.hp > 0) out = out.concat(h.mesh.userData.hitboxes); });
    return out;
  };

  /* --------------------------------------------------------------------------------------------------- input */
  Dp.bind = function () {
    var D = this, el = D.el, cv = D.renderer.domElement;
    D.on = function (t, ev, fn, opt) { t.addEventListener(ev, fn, opt); (D.offs = D.offs || []).push(function () { t.removeEventListener(ev, fn, opt); }); };
    D.on(document, 'keydown', function (e) { D.key(e, true); }, true);
    D.on(document, 'keyup', function (e) { D.key(e, false); }, true);
    D.on(window, 'resize', function () { D.resize(); });
    D.on(window, 'blur', function () { D.keys = {}; D.firing = false; D.setBlock(false); });
    D.on(el, 'contextmenu', function (e) { e.preventDefault(); });
    D.on(document, 'pointerlockchange', function () { D.locked = document.pointerLockElement === cv; });
    D.on(document, 'mousemove', function (e) {
      if (D.locked) D.turn(e.movementX * .0024, e.movementY * .0024);
      else if (D.mouseLook && (e.buttons & 3)) { D.turn((e.clientX - D.mouseLook.x) * .006, (e.clientY - D.mouseLook.y) * .006); D.mouseLook = { x: e.clientX, y: e.clientY }; }
    });
    D.on(el, 'pointerdown', function (e) {
      if (e.pointerType === 'mouse') {
        e.preventDefault();
        if (!D.locked && !D.touch && cv.requestPointerLock && D.phase !== 'end') { try { var pr = cv.requestPointerLock(); if (pr && pr.catch) pr.catch(function () { }); } catch (err) { /* no pointer lock: drag-look fallback */ } }
        D.mouseLook = { x: e.clientX, y: e.clientY };
        if (e.button === 0) D.pull();   /* every click is queued (D.fireQ), so it fires even when it starts and ends between two slow frames */
        return;
      }
      e.preventDefault();
      var b = e.target.closest && e.target.closest('[data-a]');
      if (b) {
        var a = b.dataset.a; b.classList.add('on');
        if (a === 'fire') { D.pull(); D.look = { id: e.pointerId, x: e.clientX, y: e.clientY, btn: b }; }
        else if (a === 'jump') D.jump();
        else if (a === 'reload') D.reload();
        else if (a === 'ability') D.ability();
        else if (a === 'sprint') { D.keys.sprintBtn = true; D.sprint(); }
        else if (a === 'block') D.setBlock(true);
        (D.held = D.held || {})[e.pointerId] = b;
        return;
      }
      var W = el.clientWidth;
      if (e.clientX < W * .45 && !D.joy) { D.joy = { id: e.pointerId, x0: e.clientX, y0: e.clientY, dx: 0, dy: 0 }; D.r.joy.style.left = e.clientX + 'px'; D.r.joy.style.top = e.clientY + 'px'; }
      else if (!D.look) D.look = { id: e.pointerId, x: e.clientX, y: e.clientY };
    });
    D.on(el, 'pointermove', function (e) {
      /* a left press / release while another mouse button is held arrives as a chorded pointermove, not pointerdown / up */
      if (e.pointerType === 'mouse' && e.button === 0) { if (e.buttons & 1) D.pull(); else D.firing = false; return; }
      if (D.joy && e.pointerId === D.joy.id) {
        var dx = e.clientX - D.joy.x0, dy = e.clientY - D.joy.y0, L = Math.hypot(dx, dy), m = 50;
        if (L > m) { dx = dx / L * m; dy = dy / L * m; }
        D.joy.dx = dx / m; D.joy.dy = dy / m; D.r.knob.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
      } else if (D.look && e.pointerId === D.look.id) {
        D.turn((e.clientX - D.look.x) * .0062, (e.clientY - D.look.y) * .0062); D.look.x = e.clientX; D.look.y = e.clientY;
      }
    });
    function up(e) {
      if (e.pointerType === 'mouse') { if (e.button === 0) D.firing = false; D.mouseLook = null; return; }
      if (D.joy && e.pointerId === D.joy.id) { D.joy = null; D.r.knob.style.transform = ''; }
      if (D.look && e.pointerId === D.look.id) { if (D.look.btn) D.firing = false; D.look = null; }
      var b = D.held && D.held[e.pointerId];
      if (b) { delete D.held[e.pointerId]; b.classList.remove('on'); if (b.dataset.a === 'block') D.setBlock(false); if (b.dataset.a === 'sprint') D.keys.sprintBtn = false; if (b.dataset.a === 'fire') D.firing = false; }
    }
    D.on(el, 'pointerup', up); D.on(el, 'pointercancel', up);
  };
  Dp.key = function (e, down) {
    var D = this, c = e.code, k = D.keys;
    var map = { KeyW: 'f', ArrowUp: 'f', KeyS: 'b', ArrowDown: 'b', KeyA: 'l', ArrowLeft: 'l', KeyD: 'r', ArrowRight: 'r' };
    var mine = map[c] || /^(Space|ShiftLeft|ShiftRight|KeyE|KeyR|KeyQ|Escape)$/.test(c);
    if (!mine) return;
    if (c !== 'Escape') { e.preventDefault(); e.stopPropagation(); }
    if (map[c]) { k[map[c]] = down; return; }
    if (c === 'Space' && down) D.jump();
    else if (c === 'ShiftLeft' || c === 'ShiftRight') { k.shift = down; if (down && !e.repeat) D.sprint(); }
    else if (c === 'KeyE' && down) D.ability();
    else if (c === 'KeyR' && down) D.reload();
    else if (c === 'KeyQ') D.setBlock(down);
  };
  Dp.turn = function (dx, dy) {
    var m = this.me; if (this.phase === 'end' || this.phase === 'dead') return;
    m.yaw -= dx; m.pitch = clamp(m.pitch - dy, -1.35, 1.35);
  };
  Dp.jump = function () { var m = this.me; if (this.phase !== 'fight' || !m.ground) return; m.vy = 6; m.ground = false; };
  Dp.sprint = function () {
    var D = this, m = D.me; if (D.phase !== 'fight' || m.t === 'B') return;   /* the bishop flies while Shift / Fly is held */
    if (D.clock < m.sprintReady) return;
    m.sprintUntil = D.clock + 1.2; m.sprintReady = D.clock + 4; D.say('Sprint!');
  };
  Dp.setBlock = function (on) {
    var D = this, m = D.me; m.block = !!on && D.phase === 'fight' && m.stam > .2;
    if (D.btns.block) D.btns.block.classList.toggle('on', m.block);
  };
  Dp.reload = function () {
    var D = this, m = D.me, c = D.mc; if (!c.mag || m.ammo >= c.mag || D.clock < m.reloadUntil || D.phase !== 'fight') return;
    m.reloadUntil = D.clock + c.reload; CM.sound.play('fps_reload', { volume: .8 });
    D.later(function () { m.ammo = c.mag; m.reloadUntil = 0; D.hud(); }, c.reload * 1000);   /* done after the real reload time, also when slow frames make game time lag */
  };
  Dp.say = function (t) { var s = this.r.say; s.textContent = t; clearTimeout(this.sayT); this.sayT = setTimeout(function () { s.textContent = ''; }, 1200); };

  /* ------------------------------------------------------------------------------------------------- frame */
  Dp.frame = function (now) {
    var D = this, raw = Math.max(0, (now - D.last) / 1000), dt = Math.min(.05, raw); D.last = now; D.rawDt = Math.min(raw, 1);
    D.t += dt; if (D.phase === 'fight') D.clock += dt;
    /* adaptive quality: drop the pixel ratio, then shadows, when frames are slow */
    D.frames++; D.slow = D.slow * .95 + (dt > .045 ? .05 : 0);
    if (D.frames > 40 && D.slow > .6) {
      if (D.pr > 1) { D.pr = 1; D.renderer.setPixelRatio(1); D.resize(); }
      else if (D.renderer.shadowMap.enabled) { D.renderer.shadowMap.enabled = false; D.sun.castShadow = false; }
      else if (D.pr > .6) { D.pr = D.pr > .8 ? .75 : .6; D.renderer.setPixelRatio(D.pr); D.resize(); }
      D.slow = 0; D.frames = 0;
    }
    if (D.phase === 'fight') { D.updateMe(dt); D.updateFoe(dt); D.updateHelpers(dt); D.fireTick(); if (D.clock >= D.cap) D.finish(!D.o.attacking, 'time'); }
    else if (D.phase === 'intro') D.placeCam(0);
    D.updateProjs(dt); D.updateFx(dt);
    if (D.foe.deathT > 0) { var k = Math.min(1, (D.t - D.foe.deathT) / (D.reduced ? .05 : .7)); D.foe.mesh.rotation.x = -k * Math.PI / 2; D.foe.mesh.position.y = D.foe.y - k * .3; }
    if (D.phase === 'dead') { D.me.pitch = Math.min(D.me.pitch + dt * 1.2, .9); D.placeCam(0); }
    D.render();
    if (D.frames % 3 === 0) D.minimap();
    if (D.frames % 6 === 0) D.hud();
  };
  Dp.updateMe = function (dt) {
    var D = this, m = D.me, k = D.keys, c = D.mc;
    var fx = (k.r ? 1 : 0) - (k.l ? 1 : 0), fz = (k.f ? 1 : 0) - (k.b ? 1 : 0);
    if (D.joy) { fx += D.joy.dx; fz -= D.joy.dy; }
    var L = Math.hypot(fx, fz); if (L > 1) { fx /= L; fz /= L; }
    var spd = (4.2 + 1.4 * c.speed) * (D.clock < m.sprintUntil ? 1.7 : 1) * (m.block ? .55 : 1);
    var sy = Math.sin(m.yaw), cy = Math.cos(m.yaw);
    var vx = (-sy * fz + cy * fx) * spd, vz = (-cy * fz - sy * fx) * spd;
    m.x += vx * dt; m.z += vz * dt;
    if (m.pull) { var pl = m.pull; pl.t += dt; var pk = Math.min(1, pl.t / pl.d), pe = pk * pk * (3 - 2 * pk); m.x = pl.x0 + (pl.x1 - pl.x0) * pe; m.z = pl.z0 + (pl.z1 - pl.z0) * pe; if (pk >= 1) m.pull = null; }
    /* bishop flight: hold Shift / Fly, 1.8 s of fuel that refills on the ground */
    var flyHeld = m.t === 'B' && (k.shift || k.sprintBtn) && m.fuel > 0;
    if (flyHeld) { m.vy = Math.min(m.vy + 26 * dt, 4.5); m.fuel -= dt; m.flying = true; } else m.flying = false;
    m.vy -= GRAV * dt * (flyHeld ? .35 : 1); m.y += m.vy * dt;
    var top = D.ceil - m.eye - .3, hr = D.headroom(m.x, m.z, m.y + .3); if (hr != null) top = Math.min(top, hr - m.eye - .2); if (m.y > top) { m.y = top; m.vy = Math.min(0, m.vy); }
    D.collide(m, m.rad);
    var gnd = D.groundAt(m.x, m.z, m.y + .75, m.rad * .5);
    if (m.y <= gnd) { if (gnd - m.y < .76 && m.vy <= 0) { m.y = gnd; m.vy = 0; m.ground = true; } }
    else m.ground = m.y - gnd < .02;
    if (m.ground && m.t === 'B') m.fuel = Math.min(1.8, m.fuel + dt * .9);
    /* foe body blocks */
    var f = D.foe; if (f.alive) { var dx = m.x - f.x, dz = m.z - f.z, d = Math.hypot(dx, dz), rr = m.rad + f.rad; if (d < rr && d > 1e-3) { m.x = f.x + dx / d * rr; m.z = f.z + dz / d * rr; } }
    m.stam = m.block ? Math.max(0, m.stam - dt) : Math.min(3, m.stam + dt * .8); if (m.block && m.stam <= 0) D.setBlock(false);
    D.bob += L * spd * dt * (m.ground ? 1 : 0);
    D.placeCam(dt);
  };
  Dp.placeCam = function (dt) {
    var D = this, m = D.me, cam = D.cam, sh = D.reduced ? 0 : D.shake;
    var bobY = D.reduced ? 0 : Math.sin(D.bob * 1.9) * .05;
    cam.position.set(m.x + (Math.random() - .5) * sh, m.y + m.eye + bobY + (Math.random() - .5) * sh, m.z);
    cam.rotation.set(m.pitch, m.yaw, 0);
    D.shake = Math.max(0, D.shake - dt * .6);
    D.flashMe.position.copy(cam.position);
  };
  /* ---- firing ---- */
  /* trigger pull: hold-to-fire plus one queued shot per click (max 4 waiting), so no click is lost at a low frame rate */
  Dp.pull = function () { this.firing = true; this.fireQ = Math.min(4, (this.fireQ | 0) + 1); };
  Dp.fireTick = function () {
    /* frame dt is capped at 50 ms, so at a few fps game time runs slow; queued clicks may then fire several shots in one
       frame (as many as the weapon's rate allows in the real time that passed, max 4) instead of waiting frames each */
    var D = this, c = D.mc, n = Math.max(1, Math.min(4, Math.floor((D.rawDt || 0) / c.rate)));
    for (var i = 0; i < n; i++) { if (!D.shootOnce(i > 0)) break; }
  };
  Dp.shootOnce = function (extra) {
    var D = this, m = D.me, c = D.mc;
    if (D.phase !== 'fight' || m.block || D.clock < m.reloadUntil) return false;
    if (extra ? !(D.fireQ > 0) : (!(D.firing || D.fireQ > 0) || D.clock < m.nextFire)) return false;
    if (c.mag && m.ammo <= 0) { D.reload(); return false; }
    if (D.fireQ > 0) D.fireQ--;
    m.nextFire = D.clock + c.rate;
    if (!c.auto && !D.touch) D.firing = false;   /* desktop: semi-auto weapons fire once per click; phone: holding Fire repeats at the weapon's rate */
    if (c.mag) m.ammo--; D.stat.shots++;
    CM.sound.play(c.snd, { volume: c.kind === 'melee' ? .7 : 1 });
    D.recoil = c.kind === 'melee' ? 0 : (c.pellets ? 1 : .55); if (c.kind === 'melee') D.swing = 1;
    D.flashMe.intensity = c.kind === 'hitscan' ? 14 : 0; D.vmFlash.visible = c.kind === 'hitscan'; D.flashT = .05;
    var T = D.T, origin = D.cam.position.clone(), dir = new T.Vector3(0, 0, -1).applyQuaternion(D.cam.quaternion);
    var mult = (D.clock < m.bigUntil ? 2 : 1) * (m.power > 0 ? 2 : 1); if (m.power > 0) m.power--;
    if (c.kind === 'melee') {
      var f = D.foe, dx = f.x - m.x, dz = f.z - m.z, d = Math.hypot(dx, dz), fwd = new T.Vector2(-Math.sin(m.yaw), -Math.cos(m.yaw));
      var ang = d > .01 ? Math.acos(clamp((dx * fwd.x + dz * fwd.y) / d, -1, 1)) : 0;
      if (f.alive && d - f.rad <= c.range && ang < .75 && Math.abs((f.y + f.h * .5) - (m.y + m.eye)) < 3) D.damageFoe(c.dmg * mult, false, new T.Vector3(f.x, f.y + f.h * .6, f.z));
      D.helpers.forEach(function (h) { if (h.side === 'foe' && h.hp > 0 && Math.hypot(h.x - m.x, h.z - m.z) < c.range + .5) D.damageHelper(h, c.dmg); });
      return true;
    }
    if (c.kind === 'proj') {
      var mz = new T.Vector3(); D.vm.userData.muzzle.getWorldPosition(mz);
      var start = origin.clone().add(dir.clone().multiplyScalar(.6)).add(new T.Vector3(0, -.12, 0));
      D.launch({ owner: 'me', pos: start, vel: dir.clone().multiplyScalar(c.pspeed).add(new T.Vector3(0, c.pgrav * .08, 0)), grav: c.pgrav, dmg: c.dmg * mult, kind: m.t === 'B' ? 'orb' : 'arrow' });
      return true;
    }
    var moving = D.keys.f || D.keys.b || D.keys.l || D.keys.r || D.joy, n = c.pellets || 1, spread = c.spread * (moving ? 1.6 : 1) * (m.ground ? 1 : 2);
    for (var i = 0; i < n; i++) {
      var dd = dir.clone().add(new T.Vector3((Math.random() - .5) * 2 * spread, (Math.random() - .5) * 2 * spread, (Math.random() - .5) * 2 * spread)).normalize();
      D.hitscan(origin, dd, c.range, c.dmg * mult, i === 0);
    }
    return true;
  };
  Dp.hitscan = function (origin, dir, range, dmg, tracer) {
    var D = this, T = D.T, targets = D.hitboxes();
    D.ray.set(origin, dir); D.ray.far = range;
    var hits = D.ray.intersectObjects(targets.concat(D.obst), true), h = hits[0], end;
    var hb = h && h.object.userData.hit;
    /* phone aim help: a near miss within ~2.5 degrees of the foe's chest counts as a body hit when it is in sight */
    if (!hb && D.touch && D.foe.alive) {
      var chest = new T.Vector3(D.foe.x, D.foe.y + D.foe.h * .5, D.foe.z), to = chest.clone().sub(origin), dist = to.length();
      if (dist < range && to.normalize().angleTo(dir) < .044 && D.los(origin, chest.clone().add(to.clone().multiplyScalar(-D.foe.rad)))) { hb = 'body'; h = { point: chest, object: D.foe.mesh.userData.hitboxes[0] }; }
    }
    end = h ? h.point : origin.clone().add(dir.clone().multiplyScalar(range));
    if (tracer) { var st = new T.Vector3(); D.vm.userData.muzzle.getWorldPosition(st); D.tracer(D.cam.position.clone().add(dir.clone().multiplyScalar(.8)).add(new T.Vector3(0, -.1, 0)), end); }
    if (!hb) { if (h) D.burst(h.point, '#d8c9a8', 3); return; }
    var owner = h.object.parent, head = hb === 'head';
    var helper = D.helpers.filter(function (x) { return x.mesh === owner; })[0];
    if (helper) D.damageHelper(helper, dmg); else D.damageFoe(dmg * (head ? 1.5 : 1), head, h.point);
  };
  Dp.damageFoe = function (dmg, head, point) {
    var D = this, f = D.foe; if (!f.alive || D.phase !== 'fight') return;
    dmg = Math.round(dmg); f.hp -= dmg; D.stat.hits++; D.marker(f.hp <= 0 || head); D.number(point, dmg, head); D.burst(point, '#ff5a3a', 5);
    CM.sound.play('move-self', { volume: .5 });
    if (f.hp <= 0) { f.hp = 0; f.alive = false; f.deathT = D.t; if (D.hpBar) D.hpBar.visible = false; D.burst(new D.T.Vector3(f.x, f.y + f.h * .5, f.z), '#ffb04a', 18); CM.sound.play('capture'); D.finish(true); }
    D.hud();
  };
  Dp.damageHelper = function (h, dmg) {
    var D = this; h.hp -= dmg; D.marker(h.hp <= 0); D.number(new D.T.Vector3(h.x, 1.6, h.z), Math.round(dmg), false);
    if (h.hp <= 0) { h.mesh.rotation.x = -Math.PI / 2; h.mesh.position.y = .3; D.burst(new D.T.Vector3(h.x, 1, h.z), '#ffb04a', 10); }
  };
  Dp.damageMe = function (dmg, from) {
    var D = this, m = D.me; if (D.phase !== 'fight') return;
    if (m.block && m.stam > 0) { D.say('Blocked!'); CM.sound.play('move-opponent', { volume: .8 }); m.stam = Math.max(0, m.stam - .35); return; }
    m.hp -= Math.round(dmg); D.shake = .12; D.stat.taken++;
    var v = D.r.vig; v.classList.add('on'); setTimeout(function () { v.classList.remove('on'); }, 90);
    CM.sound.play('capture', { volume: .65 });
    if (from && !D.reduced) { /* nudge the view a little towards the shooter so you can find it */ var a = Math.atan2(-(from.x - m.x), -(from.z - m.z)), dd = ((a - m.yaw + Math.PI * 3) % (Math.PI * 2)) - Math.PI; m.yaw += clamp(dd, -.08, .08); }
    if (m.hp <= 0) { m.hp = 0; D.finish(false); }
    D.hud();
  };
  /* ---- projectiles (bow arrows, wand orbs, bishop bombs) ---- */
  Dp.launch = function (p) {
    var D = this, T = D.T, mesh = D.projPool.pop();
    if (!mesh) { mesh = new T.Mesh(new T.CylinderGeometry(.04, .04, .7, 5).rotateX(Math.PI / 2), new T.MeshBasicMaterial({ color: '#fff' })); D.scene.add(mesh); }
    mesh.material.color.set(p.kind === 'orb' ? '#9fd8ff' : p.kind === 'bomb' ? '#222' : p.owner === 'me' ? '#e8d6a8' : '#ffb0a0');
    mesh.scale.set(p.kind === 'arrow' ? 1 : 3, p.kind === 'arrow' ? 1 : 3, p.kind === 'arrow' ? 1 : .35);
    mesh.visible = true; mesh.position.copy(p.pos); p.mesh = mesh; p.life = 3; D.projs.push(p);
  };
  Dp.updateProjs = function (dt) {
    var D = this, T = D.T, keep = [];
    D.projs.forEach(function (p) {
      if (p.done) return;
      p.vel.y -= p.grav * dt; var step = p.vel.clone().multiplyScalar(dt), L = step.length(), np = p.pos.clone().add(step);
      p.life -= dt; var end = null, hitObj = null;
      if (L > 0) {
        D.ray.set(p.pos, step.clone().normalize()); D.ray.far = L;
        var list = p.owner === 'me' ? D.hitboxes().concat(D.obst) : D.obst, h = D.ray.intersectObjects(list, true)[0];
        if (h) { end = h.point; hitObj = h.object; }
      }
      if (!end && np.y <= D.groundAt(np.x, np.z)) end = np;
      if (p.owner === 'foe' && !end) {   /* does the segment pass through the player's body? */
        var m = D.me, c = new T.Vector3(m.x, m.y + m.eye * .6, m.z), cl = new T.Line3(p.pos, np).closestPointToPoint(c, true, new T.Vector3());
        if (cl.distanceTo(c) < .55 && Math.abs(cl.y - c.y) < m.eye * .6) { p.done = true; D.damageMe(p.dmg, p.from); }
      }
      if (p.kind === 'bomb' && end) { D.explode(end, p); p.done = true; }
      else if (end) {
        p.done = true; var hb = hitObj && hitObj.userData.hit;
        if (hb && p.owner === 'me') {
          var owner = hitObj.parent, helper = D.helpers.filter(function (x) { return x.mesh === owner; })[0];
          if (helper) D.damageHelper(helper, p.dmg); else D.damageFoe(p.dmg * (hb === 'head' ? 1.5 : 1), hb === 'head', end);
        } else D.burst(end, p.kind === 'orb' ? '#9fd8ff' : '#d8c9a8', 4);
      }
      if (p.life <= 0) p.done = true;
      if (p.done) { p.mesh.visible = false; D.projPool.push(p.mesh); return; }
      p.pos.copy(np); p.mesh.position.copy(np); p.mesh.lookAt(np.clone().add(p.vel));
      keep.push(p);
    });
    D.projs = keep;
    /* enemy bomb warnings: red ring, then the blast */
    D.bombs = D.bombs.filter(function (b) {
      if (D.clock < b.at) { D.ring.visible = true; D.ring.position.set(b.x, D.groundAt(b.x, b.z) + .03, b.z); D.ring.material.opacity = .45 + .35 * Math.sin(D.t * 18); return true; }
      D.ring.visible = false; D.explode(new T.Vector3(b.x, D.groundAt(b.x, b.z), b.z), { owner: 'foe', dmg: 45 }); return false;
    });
  };
  Dp.explode = function (pt, p) {
    var D = this; CM.sound.play('explosion', { volume: .8 }); D.burst(pt, '#ff8a2a', 16); D.shake = Math.max(D.shake, .2);
    if (p.owner === 'me') { var f = D.foe, d = Math.hypot(f.x - pt.x, f.z - pt.z); if (d < 3.6) D.damageFoe(45 * (1 - d / 7.2) * 1.4, false, new D.T.Vector3(f.x, f.y + f.h * .6, f.z)); }
    else { var m = D.me, dm = Math.hypot(m.x - pt.x, m.z - pt.z); if (dm < 3.2 && Math.abs(m.y - pt.y) < 2.5) D.damageMe(p.dmg * (1 - dm / 6.4) * 1.3, pt); }
  };
  /* ---- abilities (E), once per duel ---- */
  Dp.ability = function () {
    var D = this, m = D.me, T = D.T; if (D.phase !== 'fight' || m.used) return;
    m.used = true; if (D.btns.ability) D.btns.ability.classList.add('off');
    if (m.t === 'P') { D.addHelper('me', m.x + Math.cos(m.yaw) * 1.6, m.z - Math.sin(m.yaw) * 1.6); D.say('A second pawn joins the fight!'); }
    else if (m.t === 'K') {
      var f = D.foe; D.say('Pulled towards you!'); m.bigUntil = D.clock + 2.5;
      f.move = { x0: f.x, z0: f.z, x1: m.x - Math.sin(m.yaw) * 2.4, z1: m.z - Math.cos(m.yaw) * 2.4, t: 0, d: .35, arc: 0 }; f.think = 1;
    } else if (m.t === 'B') {
      D.say('Bomb!'); var dir = new T.Vector3(0, 0, -1).applyQuaternion(D.cam.quaternion);
      D.launch({ owner: 'me', pos: D.cam.position.clone().add(dir.clone().multiplyScalar(.7)), vel: dir.multiplyScalar(16).add(new T.Vector3(0, 4, 0)), grav: GRAV * .8, dmg: 45, kind: 'bomb' });
      CM.sound.play('fps_grenade', { volume: .7 });
    } else { m.power = m.t === 'N' ? 3 : 1; D.say(m.t === 'N' ? 'Arrows go inwards!' : 'Power shot ready!'); }
  };
  Dp.addHelper = function (side, x, z) {
    var D = this, T = D.T, M = CM.fps3dModels, c = side === 'me' ? D.me.c : D.foe.c;
    var u = M.unit(T, 'P', { body: D.pieceMat(c), trim: D.pieceMat(c), band: side === 'me' ? D.bandMe : null, metal: D.metal });
    var e = { x: x, z: z, y: 0 }; D.collide(e, .5); e.y = D.groundAt(e.x, e.z);
    u.position.set(e.x, e.y, e.z); D.scene.add(u);
    D.helpers.push({ side: side, mesh: u, x: e.x, z: e.z, y: e.y, hp: 40, next: D.clock + .8 });
  };
  Dp.updateHelpers = function (dt) {
    var D = this, T = D.T;
    D.helpers.forEach(function (h) {
      if (h.hp <= 0) return;
      var tx = h.side === 'me' ? D.foe.x : D.me.x, tz = h.side === 'me' ? D.foe.z : D.me.z;
      h.mesh.rotation.y = Math.atan2(-(tx - h.x), -(tz - h.z));
      if (D.clock < h.next || (h.side === 'foe' && CM.fps3d.qaHold)) return; h.next = D.clock + 1 + Math.random() * .3;
      var from = new T.Vector3(h.x, h.y + 1.5, h.z), to = h.side === 'me' ? new T.Vector3(D.foe.x, D.foe.y + D.foe.h * .55, D.foe.z) : new T.Vector3(D.me.x, D.me.y + D.me.eye - .3, D.me.z);
      if ((h.side === 'me' && !D.foe.alive) || !D.los(from, to)) return;
      var hit = Math.random() < .45; CM.sound.play('fps_pistol', { volume: .45 });
      D.tracer(from, hit ? to : to.clone().add(new T.Vector3((Math.random() - .5) * 3, Math.random(), (Math.random() - .5) * 3)));
      if (hit) { if (h.side === 'me') D.damageFoe(12, false, to); else D.damageMe(12, h); }
    });
  };

  /* -------------------------------------------------------------------------------------------------- foe AI */
  /* cells: the 8x8 board plus the walkway ring (-1..8); the foe slides cell to cell in its own chess pattern */
  Dp.cellC = function (c) { return (c - 3.5) * TS; };
  Dp.cellOk = function (c, r) {
    if (c < -1 || c > 8 || r < -1 || r > 8) return false;
    var x = this.cellC(c), z = this.cellC(r), i;
    for (i = 0; i < this.boxes.length; i++) { var b = this.boxes[i]; if (b.top > .75 && x > b.x0 - .9 && x < b.x1 + .9 && z > b.z0 - .9 && z < b.z1 + .9 && !(b.top <= 1.5 && x > b.x0 + .5 && x < b.x1 - .5 && z > b.z0 + .5 && z < b.z1 - .5)) return false; }
    for (i = 0; i < this.circles.length; i++) { var q = this.circles[i]; if (Math.hypot(x - q.x, z - q.z) < q.r + 1.1) return false; }
    for (i = 0; i < this.slabs.length; i++) { var s = this.slabs[i]; if (s.y0 < 5 && x > s.x0 - .6 && x < s.x1 + .6 && z > s.z0 - .6 && z < s.z1 + .6) return false; }   /* not under a chair */
    return true;
  };
  Dp.moves = function () {
    var D = this, f = D.foe, c0 = Math.round(f.x / TS + 3.5), r0 = Math.round(f.z / TS + 3.5), out = [], t = f.t;
    function ray(dirs, max) { dirs.forEach(function (d) { for (var s = 1; s <= max; s++) { var c = c0 + d[0] * s, r = r0 + d[1] * s; if (!D.cellOk(c, r)) break; out.push([c, r]); } }); }
    var O = [[1, 0], [-1, 0], [0, 1], [0, -1]], X = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
    if (t === 'R') ray(O, 3); else if (t === 'B') ray(X, 3); else if (t === 'Q') ray(O.concat(X), 3);
    else if (t === 'N') [[1, 2], [2, 1], [-1, 2], [-2, 1], [1, -2], [2, -1], [-1, -2], [-2, -1]].forEach(function (d) { if (D.cellOk(c0 + d[0], r0 + d[1])) out.push([c0 + d[0], r0 + d[1]]); });
    else ray(O.concat(X), 1);   /* king and pawn: one step (the pawn's forward-only rule is relaxed in the arena) */
    if (!out.length) out.push([clamp(c0, -1, 8), clamp(r0, -1, 8)]);
    return out;
  };
  Dp.updateFoe = function (dt) {
    var D = this, f = D.foe, m = D.me, c = D.fc, T = D.T; if (!f.alive) return;
    /* movement */
    if (f.move) {
      var mv = f.move; mv.t += dt; var k = Math.min(1, mv.t / mv.d), e = D.reduced ? k : k * k * (3 - 2 * k);
      f.x = mv.x0 + (mv.x1 - mv.x0) * e; f.z = mv.z0 + (mv.z1 - mv.z0) * e;
      var g0 = D.groundAt(f.x, f.z); f.y = mv.arc ? g0 + Math.sin(k * Math.PI) * mv.arc : f.y + (g0 - f.y) * Math.min(1, dt * 12);
      if (k >= 1) { f.move = null; f.think = .25 + Math.random() * .6; f.y = D.groundAt(f.x, f.z); }
    } else {
      f.y = D.groundAt(f.x, f.z);
      f.think -= dt;
      if (f.think <= 0) {
        var best = null, bs = -1e9, me3 = new T.Vector3(m.x, m.y + m.eye, m.z), low = f.hp < f.max * .35;
        D.moves().forEach(function (cr) {
          var x = D.cellC(cr[0]), z = D.cellC(cr[1]), d = Math.hypot(x - m.x, z - m.z), gh = D.groundAt(x, z);
          var s = -Math.abs(d - (low && c.kind !== 'melee' ? c.pref * 1.4 : c.pref)) * .6 + Math.random() * 1.6;
          if (c.kind !== 'melee' && D.los(new T.Vector3(x, gh + f.h * .8, z), me3)) s += 4;
          if (c.kind !== 'melee' && gh > 1) s += 2.2;
          if (d < 2.2 && c.kind !== 'melee') s -= 5;
          if (s > bs) { bs = s; best = [x, z]; }
        });
        if (best && Math.hypot(best[0] - f.x, best[1] - f.z) > .1) {
          var dist = Math.hypot(best[0] - f.x, best[1] - f.z);
          f.move = { x0: f.x, z0: f.z, x1: best[0], z1: best[1], t: 0, d: f.t === 'N' ? .6 : Math.max(.35, dist / (3.2 + 2.2 * c.speed)), arc: f.t === 'N' ? 2.2 : (Math.abs(D.groundAt(best[0], best[1]) - f.y) > .3 ? 1.2 : 0) };
        } else f.think = .5;
      }
    }
    var fe = { x: f.x, z: f.z, y: f.y }; D.collide(fe, f.rad * .8); if (!f.move) { f.x = fe.x; f.z = fe.z; }
    f.mesh.position.set(f.x, f.y, f.z);
    if (D.hpBar) { D.hpFill.scale.x = Math.max(.001, f.hp / f.max); var q = D.cam.quaternion.clone(), pq = f.mesh.quaternion.clone().invert(); D.hpBar.quaternion.copy(pq.multiply(q)); }
    var want = Math.atan2(-(m.x - f.x), -(m.z - f.z)), dy = ((want - f.yaw + Math.PI * 3) % (Math.PI * 2)) - Math.PI; f.yaw += dy * Math.min(1, dt * 8); f.mesh.rotation.y = f.yaw;
    /* ability, once */
    if (!f.used && !CM.fps3d.qaHold && D.clock > f.abilityAt) {
      f.used = true;
      if (f.t === 'P') { D.addHelper('foe', f.x + 1.6, f.z); D.say('The enemy pawn calls a friend!'); }
      else if (f.t === 'K') { D.say('You are pulled in!'); var a = Math.atan2(m.x - f.x, m.z - f.z); m.pull = { x0: m.x, z0: m.z, x1: f.x + Math.sin(a) * 2.6, z1: f.z + Math.cos(a) * 2.6, t: 0, d: D.reduced ? .01 : .35 }; f.power = 1; }   /* slide, never teleport */
      else if (f.t === 'B') { D.bombs.push({ x: m.x, z: m.z, at: D.clock + 1.1 }); D.say('Bomb! Get out of the red ring!'); CM.sound.play('fps_grenade', { volume: .6 }); }
      else { f.power = f.t === 'N' ? 3 : 1; D.say('The enemy powers up!'); }
    }
    /* attack */
    var muzzle = new T.Vector3(); (f.mesh.userData.muzzle || f.mesh).getWorldPosition(muzzle);
    var eyeP = new T.Vector3(f.x, f.y + f.h * .8, f.z), tgt = new T.Vector3(m.x, m.y + m.eye - .35, m.z), dist2 = Math.hypot(m.x - f.x, m.z - f.z);
    var sees = Math.abs(dy) < .6 && D.los(eyeP, tgt);
    if (sees && f.sawAt < 0) f.sawAt = D.clock; if (!sees) f.sawAt = -1;
    /* fairness: no enemy shot in the first 1.2 s of the fight, a 0.6 s reaction after it spots you, and on a phone (thumb aim)
       it fires 25% slower and 15% less accurately (fin-fps tuning: a pawn duel lasted ~3 s on touch before) */
    if (CM.fps3d.qaHold || D.clock < 1.2) return;
    if (!sees || D.clock < f.nextFire || D.clock - f.sawAt < .6 || dist2 > c.range + (c.kind === 'melee' ? .6 : 0)) return;
    f.nextFire = D.clock + c.rate * (c.kind === 'melee' ? 1.4 : c.auto ? 2 : 1.9) * (D.touch ? 1.25 : 1) * (.85 + Math.random() * .3);
    var dodge = D.clock < m.sprintUntil || m.flying ? .3 : 1, moving = (D.keys.f || D.keys.b || D.keys.l || D.keys.r || D.joy) ? .85 : 1;
    var acc = c.acc * (D.touch ? .72 : .85) * dodge * moving * (1 - Math.min(.5, dist2 / c.range * .5)) * (m.ground ? 1 : .8), mult = f.power > 0 ? 2 : 1; if (f.power > 0) f.power--;
    D.efFlash.position.copy(muzzle); D.efFlash.visible = c.kind === 'hitscan'; D.flashFoe.position.copy(muzzle); D.flashFoe.intensity = c.kind === 'hitscan' ? 12 : 0; D.efT = .06;
    CM.sound.play(c.snd, { volume: .5 }); D.stat.foeShots++;
    if (c.kind === 'melee') { if (Math.random() < Math.min(.9, acc + .2)) D.damageMe(c.dmg * mult, f); return; }
    if (c.kind === 'proj') {
      var aim = tgt.clone(); if (Math.random() > acc) aim.add(new T.Vector3((Math.random() - .5) * 3.2, (Math.random() - .3) * 1.6, (Math.random() - .5) * 3.2));
      var tt = muzzle.distanceTo(aim) / c.pspeed, v = aim.clone().sub(muzzle).divideScalar(tt); v.y += .5 * c.pgrav * tt;
      D.launch({ owner: 'foe', pos: muzzle.clone(), vel: v, grav: c.pgrav, dmg: c.dmg * mult, kind: f.t === 'B' ? 'orb' : 'arrow', from: f });
      return;
    }
    var n = c.pellets || 1, dmg = 0;
    for (var i = 0; i < n; i++) if (Math.random() < acc * (c.pellets ? (1 - Math.min(.9, dist2 / c.range)) * 1.3 : 1)) dmg += c.dmg * mult;
    var miss = tgt.clone().add(new T.Vector3((Math.random() - .5) * 3, (Math.random() - .2) * 1.2, (Math.random() - .5) * 3));
    D.tracer(muzzle, dmg > 0 ? tgt.clone().add(new T.Vector3(0, -.25, 0)) : miss);
    if (dmg > 0) D.damageMe(dmg, f);
  };

  /* --------------------------------------------------------------------------------------------------- fx + HUD */
  Dp.tracer = function (a, b) {
    var D = this, tr = D.tracers.filter(function (t) { return t.t <= 0; })[0] || D.tracers[0], p = tr.l.geometry.attributes.position;
    p.setXYZ(0, a.x, a.y, a.z); p.setXYZ(1, b.x, b.y, b.z); p.needsUpdate = true; tr.l.visible = true; tr.t = .08; tr.l.material.opacity = .9;
  };
  Dp.burst = function (pt, color, n) {
    var D = this; if (D.reduced) n = Math.min(n, 3);
    for (var i = 0, j = 0; i < D.sparks.length && j < n; i++) {
      var s = D.sparks[i]; if (s.t > 0) continue; j++;
      s.m.visible = true; s.m.position.copy(pt); s.m.material.color.set(color); s.t = .45 + Math.random() * .3;
      s.v.set((Math.random() - .5) * 6, Math.random() * 5, (Math.random() - .5) * 6);
    }
  };
  Dp.updateFx = function (dt) {
    var D = this;
    D.tracers.forEach(function (t) { if (t.t > 0) { t.t -= dt; t.l.material.opacity = Math.max(0, t.t / .08) * .9; if (t.t <= 0) t.l.visible = false; } });
    D.sparks.forEach(function (s) { if (s.t > 0) { s.t -= dt; s.v.y -= 14 * dt; s.m.position.addScaledVector(s.v, dt); s.m.scale.setScalar(Math.max(.1, s.t * 2)); if (s.t <= 0) s.m.visible = false; } });
    if (D.flashT > 0) { D.flashT -= dt; if (D.flashT <= 0) { D.flashMe.intensity = 0; D.vmFlash.visible = false; } }
    if (D.efT > 0) { D.efT -= dt; if (D.efT <= 0) { D.flashFoe.intensity = 0; D.efFlash.visible = false; } }
    if (D.fireLight) D.fireLight.intensity = 60 + (D.reduced ? 0 : Math.sin(D.t * 9) * 7 + Math.sin(D.t * 23) * 4);
    if (D.flames && !D.reduced) D.flames.forEach(function (fl, i) { fl.scale.y = 1 + .25 * Math.sin(D.t * (7 + i) + i * 1.3); });
    /* viewmodel: base pose, walk bob, recoil kick, melee swing, reload dip, block raise */
    var vm = D.vm, b = D.vmBase, m = D.me, aspect = D.cam.aspect;
    var pt = aspect < 1;   /* portrait phone: the gun sits higher and nearer the middle, clear of the Fire button */
    vm.position.set(b.x * (pt ? .55 : 1), b.y * (pt ? .62 : 1) + (D.reduced ? 0 : Math.sin(D.bob * 1.9) * .012), b.z * (pt ? 1.15 : 1) + D.recoil * .08);
    vm.rotation.set(D.recoil * .25, 0, 0);
    if (D.swing > 0) { vm.rotation.y = -1.2 * Math.sin(D.swing * Math.PI) ; vm.rotation.z = .6 * Math.sin(D.swing * Math.PI); D.swing = Math.max(0, D.swing - dt * 3.5); }
    if (D.clock < m.reloadUntil) { vm.position.y -= .14; vm.rotation.x -= .5; }
    if (m.block) { vm.position.set(0, -.18, -.42); vm.rotation.set(0, 0, Math.PI / 2.4); }
    D.recoil = Math.max(0, D.recoil - dt * 6);
  };
  Dp.marker = function (kill) { var h = this.r.hm; h.classList.toggle('kill', !!kill); h.classList.add('on'); setTimeout(function () { h.classList.remove('on'); }, 110); };
  Dp.number = function (pt, n, head) {
    var D = this, v = pt.clone().project(D.cam); if (v.z > 1) return;
    var d = document.createElement('div'); d.className = 'f3d__dmg' + (head ? ' hd' : ''); d.textContent = String(n);
    d.style.left = ((v.x + 1) / 2 * 100) + '%'; d.style.top = ((1 - v.y) / 2 * 100) + '%'; D.r.big.parentNode.appendChild(d);
    setTimeout(function () { d.remove(); }, 750);
  };
  Dp.hud = function () {
    var D = this, m = D.me, f = D.foe, c = D.mc;
    D.r.me.style.width = Math.max(0, 100 * m.hp / m.max) + '%'; D.r.foe.style.width = Math.max(0, 100 * f.hp / f.max) + '%';
    D.r.stam.style.width = (100 * (m.t === 'B' && m.flying ? m.fuel / 1.8 : m.stam / 3)) + '%';
    var left = Math.max(0, Math.ceil(D.cap - D.clock)); D.r.clock.textContent = Math.floor(left / 60) + ':' + ('0' + left % 60).slice(-2);
    D.r.ammo.innerHTML = (c.mag ? (D.clock < m.reloadUntil ? 'Reloading' : m.ammo + ' / ' + c.mag) : 'Melee') + '<small>HP ' + Math.max(0, Math.round(m.hp)) + ' · ' + c.w + (m.power > 0 ? ' · x2' : '') + '</small>';
    var sOff = m.t !== 'B' && D.clock < m.sprintReady; if (D.btns.sprint) D.btns.sprint.classList.toggle('off', sOff);
    if (D.r.tsprint) { D.r.tsprint.classList.toggle('off', sOff); D.r.tability.classList.toggle('off', m.used); }
    if (D.r.help && D.clock > 8) D.r.help.style.opacity = '0';
  };
  Dp.minimap = function () {
    var D = this, cv = D.r.map, g = cv.getContext('2d'), s = cv.width / (2 * HALF), w = cv.width;
    function X(x) { return (x + HALF) * s; }
    g.clearRect(0, 0, w, w); g.fillStyle = 'rgba(180,18,42,.35)'; g.fillRect(X(-18), X(-13.5), 36 * s, 27 * s); g.fillStyle = 'rgba(120,70,30,.45)'; D.slabs.forEach(function (b) { g.fillRect(X(b.x0), X(b.z0), (b.x1 - b.x0) * s, (b.z1 - b.z0) * s); });
    g.fillStyle = 'rgba(200,200,200,.55)'; D.boxes.forEach(function (b) { g.fillRect(X(b.x0), X(b.z0), (b.x1 - b.x0) * s, (b.z1 - b.z0) * s); });
    g.fillStyle = 'rgba(160,160,160,.8)'; D.circles.forEach(function (c) { g.beginPath(); g.arc(X(c.x), X(c.z), Math.max(3, c.r * s), 0, 7); g.fill(); });
    D.helpers.forEach(function (h) { if (h.hp > 0) { g.fillStyle = h.side === 'me' ? '#4fc3f7' : '#ff8a8a'; g.beginPath(); g.arc(X(h.x), X(h.z), 5, 0, 7); g.fill(); } });
    if (D.foe.alive) { g.fillStyle = '#ff4d4d'; g.beginPath(); g.arc(X(D.foe.x), X(D.foe.z), 7, 0, 7); g.fill(); }
    var m = D.me; g.save(); g.translate(X(m.x), X(m.z)); g.rotate(-m.yaw); g.fillStyle = '#7fe0ff';
    g.beginPath(); g.moveTo(0, -10); g.lineTo(7, 7); g.lineTo(-7, 7); g.closePath(); g.fill(); g.restore();
  };
  Dp.resize = function () {
    var D = this, w = Math.max(1, D.el.clientWidth || innerWidth), h = Math.max(1, D.el.clientHeight || innerHeight);
    D.renderer.setSize(w, h, false); D.cam.aspect = w / h; D.cam.fov = w < h ? 82 : 72; D.cam.updateProjectionMatrix();
    D.vmCam.aspect = w / h; D.vmCam.fov = w < h ? 70 : 55; D.vmCam.updateProjectionMatrix();
    if (D.vsCam2) { D.vsCam2.aspect = w / h; D.vsCam2.updateProjectionMatrix(); D.layoutVs(); }
  };
  Dp.render = function () {
    var R = this.renderer; R.clear();
    if (this.vsOn) { if (!this.reduced) { this.vsL.rotation.y = .5 + Math.sin(this.t * .9) * .08; this.vsR.rotation.y = (this.foe.t === 'N' ? 1.1 : -.4) - Math.sin(this.t * .9) * .08; } R.render(this.vsScene2, this.vsCam2); return; }
    R.render(this.scene, this.cam); R.clearDepth();
    if (this.phase !== 'dead') R.render(this.vmScene, this.vmCam);
  };
  /* ---- the end: WIN / LOSS, then hand the result back to the board ---- */
  Dp.finish = function (won, why) {
    var D = this; if (D.phase === 'end' || D.phase === 'dead' || D.dead) return;
    D.phase = won ? 'end' : 'dead'; D.firing = false; D.fireQ = 0; D.setBlock(false);
    if (document.pointerLockElement && document.exitPointerLock) document.exitPointerLock();
    var big = D.r.big; big.textContent = won ? 'WIN' : (why === 'time' ? 'TIME' : 'LOSS'); big.style.color = won ? '#81b64c' : '#e0533d';
    if (why === 'time') D.say(D.o.attacking ? 'Time: the defender holds the square.' : 'Time: you hold the square.');
    D.result = { won: won, me: Math.max(1, Math.round(D.me.hp)), foe: Math.max(1, Math.round(D.foe.hp)) };
    D.later(function () { var res = D.resolve, r = D.result; if (live === D) live = null; D.destroy(); res(r); }, 1300);
  };
  Dp.destroy = function () {
    var D = this; if (D.dead) return; D.dead = true;
    cancelAnimationFrame(D.raf); D.timers.forEach(clearTimeout); clearTimeout(D.sayT);
    (D.offs || []).forEach(function (f) { f(); });
    if (document.pointerLockElement && document.exitPointerLock) document.exitPointerLock();
    try {
      D.scene.traverse(function (ob) { if (ob.geometry && !ob.userData.keepGeo) ob.geometry.dispose(); });
      D.renderer.dispose(); if (D.renderer.forceContextLoss) D.renderer.forceContextLoss();
    } catch (e) { /* ignore */ }
    D.el.remove();
    document.body.style.overflow = D.prevOverflow || '';
    if (D.vp && D.vpOld != null) D.vp.setAttribute('content', D.vpOld);
    if (D.s3) D.s3.renderer.render = D.s3render;
  };

  CM.fps3d = {
    supported: supported, run: run, abort: abort,
    dbg: function () {
      var D = live; if (!D) return null;
      return { phase: D.phase, clock: D.clock, touch: D.touch, theme: D.theme, me: { t: D.me.t, hp: D.me.hp, x: D.me.x, y: D.me.y, z: D.me.z, yaw: D.me.yaw, pitch: D.me.pitch, ammo: D.me.ammo, block: D.me.block },
        foe: { t: D.foe.t, hp: D.foe.hp, x: D.foe.x, y: D.foe.y, z: D.foe.z, alive: D.foe.alive }, statues: D.circles.length, stat: D.stat, firing: D.firing, helpers: D.helpers.length, pr: D.pr, shadows: D.renderer.shadowMap.enabled };
    },
    dbgAim: function (head) {
      var D = live; if (!D) return false; var m = D.me, f = D.foe;
      var dx = f.x - m.x, dz = f.z - m.z, dy = (f.y + f.h * (head ? .86 : .5)) - (m.y + m.eye);
      m.yaw = Math.atan2(-dx, -dz); m.pitch = Math.atan2(dy, Math.hypot(dx, dz)); return true;
    }
  };
})();
