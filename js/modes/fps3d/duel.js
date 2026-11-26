/* fps3d/duel: the real-3D first-person duel of FPS Chess (PszkLYudcws, Nz2A-g73_iM). js/modes/g5_fps.js calls
   CM.fps3d.run(ctx, { mine, foe, attacking, mineSq, foeSq }) for every capture attempt and gets back a Promise of
   { won, me, foe } (won = the human's piece survived and the foe fell; me / foe = hp left), the same contract as the
   2D tap duel it replaces (that one stays as the fallback when WebGL or three.js is not available).
   Matches what the videos show (research/ref/m-fps/SPEC.md, m-fps 2026-11-26):
   - Arena: you are a tiny chess piece ON the board, which stands on a table in a giant room. Jump off the board to the
     floor (red carpet with cream diamonds, a rideable toy train on a track, record player on a cabinet, bookshelf with
     green books, red high-back chairs, window with blue sky, fireplace + portrait, twin sconces, chandelier, pink
     curtains, doorway with a pink banner) and climb back up by holding Space against a wall. The other pieces of the
     position stand on their squares as full-size statues (cover).
   - Weapons (models.js, tinted by piece colour): pawn flintlock musket, knight bow (hold to draw, release to shoot),
     bishop long musket, rook scoped sniper, queen minigun (no reload), king big flat sword.
   - Controls: HOLD LEFT CLICK TO SHOOT, HOLD RIGHT CLICK TO BLOCK SHOTS (Q also blocks), LShift movement ability,
     E second ability, Space jump / hold on a wall to climb. Phone: joystick, look-drag, FIRE, BLOCK, JUMP and the two
     ability tiles. No reload.
   - HUD: only the two white tiles bottom-left ("Left Shift", "E"), dimmed with a cooldown number while recharging, and
     the dashed + crosshair. No health bar, ammo, damage numbers, minimap or timer. Damage = white cracked-glass
     overlay; health regenerates; damage carries between duels. A hit foe glows white and a red X flashes.
   - 3-2-1 then GO, "<PIECE> WINS", KILL CAM.
   Abilities (Shift / E icons from the videos; effects marked INFERRED in SPEC.md where the video does not show them):
   P sprint / summon a helper pawn; N gallop / arrows curve inwards (homing, cooldown 8 seen); B fly (hold) / throw a
   bomb; R big hop (cooldown 2 seen) / build a brick wall; Q dash / throw a piece; K leap / pull the enemy to you.
   All numbers (hp, damage, rates, cooldowns other than the seen ones) are INFERRED. A hidden time cap
   (params.duel3d_ms, default 60 s) ends a stalled duel: the defender holds.
   Sounds: our own synthesised gun WAVs from assets/modes/AWFB4EzGtDc/ (Gun King mode) plus the core set.
   QA: CM.fps3d.dbg() (state), CM.fps3d.dbgAim() (point the camera at the foe). */
(function () {
  'use strict';
  var CM = window.CM;
  /* TS: one board square; TX / TZ: the table top's half size, TY its height; HALF: the room's half width */
  var TS = 4.2, TX = 26, TZ = 23, TY = 10, HALF = 58, GRAV = 16;
  var NAMES = { K: 'King', Q: 'Queen', R: 'Rook', B: 'Bishop', N: 'Knight', P: 'Pawn' };
  /* tile icons as the videos draw them (SPEC.md): [Left Shift, E] */
  var ICON = {
    P: ['&#127939;', '&#9823;&#9823;&#9823;'], N: ['&#128014;', '&#10559;'], B: ['&#129718;', '&#128163;'],
    R: ['&#10227;', '&#129521;'], Q: ['&#9813;', '&#9995;'], K: ['&#9876;', '&#10040;']
  };
  var SHIFT_NAME = { P: 'Sprint', N: 'Gallop', B: 'Fly', R: 'Hop', Q: 'Dash', K: 'Leap' };
  var E_NAME = { P: 'Hire a pawn', N: 'Inward arrows', B: 'Bomb', R: 'Wall', Q: 'Throw a piece', K: 'Pull' };
  /* hp matches the 2D duel (g5_fps.js CLS) so damage carries over both ways; weapon numbers and cooldowns INFERRED
     except the seen ones (rook Shift 2 s, knight E 8 s) */
  var CLS = {
    K: { hp: 160, acc: .62, speed: .9, w: 'Sword', kind: 'melee', dmg: 52, rate: .7, range: 3.4, snd: 'fps_crossbow', pref: 1.6, shiftCd: 3, eCd: 8 },
    Q: { hp: 130, acc: .55, speed: 1.05, w: 'Minigun', kind: 'hitscan', dmg: 5, rate: .07, range: 55, snd: 'fps_machine', auto: true, spread: .03, pref: 12, shiftCd: 3, eCd: 6 },
    R: { hp: 150, acc: .62, speed: .85, w: 'Sniper', kind: 'hitscan', dmg: 70, rate: 1.6, range: 140, snd: 'fps_shotgun', spread: .002, pref: 22, shiftCd: 2, eCd: 8 },
    B: { hp: 95, acc: .58, speed: 1.1, w: 'Long musket', kind: 'hitscan', dmg: 40, rate: 1.15, range: 80, snd: 'fps_shotgun', spread: .006, pref: 16, shiftCd: 0, eCd: 6 },
    N: { hp: 100, acc: .6, speed: 1.2, w: 'Bow', kind: 'proj', dmg: 48, rate: .35, range: 70, snd: 'fps_crossbow', pspeed: 50, pgrav: 6, pref: 14, draw: .7, shiftCd: 3, eCd: 8 },
    P: { hp: 75, acc: .52, speed: 1, w: 'Musket', kind: 'hitscan', dmg: 30, rate: .85, range: 60, snd: 'fps_pistol', spread: .008, pref: 12, shiftCd: 3, eCd: 8 }
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
      /* crosshair: a dashed white + (the game's) */
      '.f3d__x{position:absolute;left:50%;top:50%;width:26px;height:26px;transform:translate(-50%,-50%)}.f3d__x i{position:absolute;background:rgba(255,255,255,.95);box-shadow:0 0 2px rgba(0,0,0,.8)}' +
      '.f3d__x i:nth-child(1){left:12px;top:0;width:2px;height:5px}.f3d__x i:nth-child(2){left:12px;top:7px;width:2px;height:4px}.f3d__x i:nth-child(3){left:12px;bottom:7px;width:2px;height:4px}.f3d__x i:nth-child(4){left:12px;bottom:0;width:2px;height:5px}' +
      '.f3d__x i:nth-child(5){top:12px;left:0;height:2px;width:5px}.f3d__x i:nth-child(6){top:12px;left:7px;height:2px;width:4px}.f3d__x i:nth-child(7){top:12px;right:7px;height:2px;width:4px}.f3d__x i:nth-child(8){top:12px;right:0;height:2px;width:5px}' +
      /* ability tiles bottom-left: white rounded squares, icon + key, dimmed with the cooldown number while recharging */
      '.f3d__tiles{position:absolute;z-index:3;left:calc(14px + env(safe-area-inset-left));bottom:calc(16px + env(safe-area-inset-bottom));display:flex;gap:8px}' +
      '.f3d__tile{position:relative;width:62px;height:62px;border-radius:10px;background:rgba(246,243,236,.95);color:#1b1b1b;display:flex;flex-direction:column;align-items:center;justify-content:center;font:400 24px/1 Georgia,serif;text-shadow:none;box-shadow:0 2px 6px rgba(0,0,0,.45);transition:opacity .2s;pointer-events:none;border:0;padding:0;touch-action:none}' +
      '.f3d__tile small{font:600 9px/1 system-ui,sans-serif;margin-top:4px;letter-spacing:.02em}.f3d__tile.off{opacity:.45}' +
      '.f3d__tile b{position:absolute;inset:0;display:none;align-items:center;justify-content:center;font:700 26px/1 system-ui,sans-serif;color:#111}.f3d__tile.off b{display:flex}.f3d__tile.off span{opacity:.25}.f3d__tile.on{background:#dfe9d0}' +
      /* hit marker: a red X */
      '.f3d__hm{position:absolute;left:50%;top:50%;width:30px;height:30px;transform:translate(-50%,-50%) rotate(45deg);opacity:0;transition:opacity .15s ease-out}' +
      '.f3d__hm:before,.f3d__hm:after{content:"";position:absolute;background:#ff2d2d;box-shadow:0 0 3px rgba(0,0,0,.6)}.f3d__hm:before{left:14px;top:0;width:3px;height:30px}.f3d__hm:after{top:14px;left:0;height:3px;width:30px}.f3d__hm.on{opacity:1;transition:none}.f3d__hm.kill{width:40px;height:40px}' +
      /* damage: white cracked glass over the view (opacity = damage taken) */
      '.f3d__crack{position:absolute;inset:0;width:100%;height:100%;opacity:0;transition:opacity .4s ease-out}.f3d__crack.hit{transition:none}' +
      '.f3d__big{position:absolute;left:0;right:0;top:36%;text-align:center;font:700 clamp(40px,11vw,76px)/1 Georgia,"Times New Roman",serif;color:#fff;text-shadow:0 2px 12px rgba(0,0,0,.8)}' +
      '.f3d__kc{position:absolute;left:calc(16px + env(safe-area-inset-left));top:calc(14px + env(safe-area-inset-top));font:700 18px/1 system-ui,sans-serif;letter-spacing:.08em;display:none}.f3d__kc:before{content:"";display:inline-block;width:10px;height:10px;border-radius:50%;background:#ff3b30;margin-right:8px}.f3d--kc .f3d__kc{display:block}' +
      '.f3d--kc .f3d__x,.f3d--kc .f3d__tiles,.f3d--kc .f3d__pad{visibility:hidden}' +
      /* VS card (the game's duel intro): grey / cream diagonal split rendered in 3D behind, names top, an orange "Vs" */
      '.f3d--vs .f3d__hud>*:not(.f3d__vs),.f3d--vs .f3d__pad{visibility:hidden}.f3d__vs{position:absolute;inset:0;transition:opacity .3s ease-out}.f3d__vs b{position:absolute;top:calc(5% + env(safe-area-inset-top));font:800 clamp(24px,7vw,46px)/1 system-ui,sans-serif}' +
      '.f3d__vs b.l{left:12%;color:#fff;text-shadow:0 2px 4px rgba(0,0,0,.45)}.f3d__vs b.r{right:10%;color:#161616;text-shadow:0 1px 2px rgba(255,255,255,.4)}' +
      '.f3d__vs em{position:absolute;left:0;right:0;top:46%;text-align:center;font:800 clamp(40px,12vw,80px)/1 system-ui,sans-serif;font-style:normal;color:rgba(240,150,90,.55)}' +
      '.f3d__vs small{position:absolute;left:6%;right:6%;bottom:calc(5% + env(safe-area-inset-bottom));text-align:center;font:600 14px system-ui,sans-serif;color:#222;text-shadow:0 1px 2px rgba(255,255,255,.6)}' +
      '.f3d__help{position:absolute;left:0;right:0;top:calc(14px + env(safe-area-inset-top));text-align:center;transition:opacity 1s;font:700 12px/1.6 system-ui,sans-serif;letter-spacing:.04em;opacity:.92}' +
      '.f3d__pad{position:absolute;inset:0;display:none}.f3d--touch .f3d__pad{display:block}' +
      '.f3d--touch .f3d__tiles{bottom:calc(196px + env(safe-area-inset-bottom))}.f3d--touch .f3d__tile{pointer-events:auto}' +
      '.f3d__btn{position:absolute;display:flex;align-items:center;justify-content:center;border-radius:50%;background:rgba(20,20,20,.5);border:2px solid rgba(255,255,255,.6);color:#fff;font:700 11px/1.1 system-ui,sans-serif;text-align:center;touch-action:none;padding:0}' +
      '.f3d__btn.on{background:rgba(255,255,255,.75);color:#111}' +
      '.f3d__btn--fire{width:86px;height:86px;font-size:14px;background:rgba(255,255,255,.22)}' +
      '.f3d__joy{position:absolute;width:118px;height:118px;margin:-59px 0 0 -59px;border-radius:50%;border:2px solid rgba(255,255,255,.45);background:rgba(0,0,0,.22);pointer-events:none}' +
      '.f3d__joy i{position:absolute;left:50%;top:50%;width:50px;height:50px;margin:-25px 0 0 -25px;border-radius:50%;background:rgba(255,255,255,.55)}';
    document.head.appendChild(s);
  }
  /* the cracked-glass overlay: white crack lines radiating from a few impact points (drawn once, seeded) */
  function crackSvg() {
    var r = 7, rnd = function () { r = (r * 16807) % 2147483647; return r / 2147483647; }, d = '';
    [[22, 30], [76, 24], [64, 74], [18, 78], [48, 50]].forEach(function (c, k) {
      var n = k === 4 ? 5 : 8;
      for (var i = 0; i < n; i++) {
        var a = i / n * Math.PI * 2 + rnd() * .5, x = c[0], y = c[1], L = (k === 4 ? 8 : 14) + rnd() * 22; d += 'M' + x.toFixed(1) + ' ' + y.toFixed(1);
        for (var sgi = 0; sgi < 4; sgi++) { a += (rnd() - .5) * .6; x += Math.cos(a) * L / 4; y += Math.sin(a) * L / 4; d += 'L' + x.toFixed(1) + ' ' + y.toFixed(1); }
      }
      for (var ring = 0; ring < 2; ring++) { var rr = 3 + ring * 5 + rnd() * 2; d += 'M' + (c[0] + rr) + ' ' + c[1]; for (var q = 1; q <= 7; q++) { var aa = q / 7 * Math.PI * 2; d += 'L' + (c[0] + Math.cos(aa) * rr * (.8 + rnd() * .4)).toFixed(1) + ' ' + (c[1] + Math.sin(aa) * rr * (.8 + rnd() * .4)).toFixed(1); } }
    });
    return '<svg class="f3d__crack" data-r="crack" viewBox="0 0 100 100" preserveAspectRatio="none"><path d="' + d + '" fill="none" stroke="rgba(0,0,0,.35)" stroke-width=".7" vector-effect="non-scaling-stroke" transform="translate(.15 .15)"/>' +
      '<path d="' + d + '" fill="none" stroke="#fff" stroke-width="1.6" vector-effect="non-scaling-stroke"/></svg>';
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

    /* ---- DOM: only the two ability tiles + crosshair (the game's HUD), the cracked glass, big text, kill-cam label ---- */
    var el = D.el = document.createElement('div'); el.className = 'f3d' + (D.touch ? ' f3d--touch' : ''); el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'FPS duel');
    var me0 = o.mine.t in ICON ? o.mine.t : 'P';
    function tile(a, icon, key, name) { return '<button type="button" class="f3d__tile" data-a="' + a + '" data-r="t' + a + '" aria-label="' + key + ': ' + name + '"><span>' + icon + '</span><small>' + key + '</small><b></b></button>'; }
    el.innerHTML = '<div class="f3d__hud">' + crackSvg() +
      '<div class="f3d__x"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div><div class="f3d__hm" data-r="hm"></div>' +
      '<div class="f3d__tiles">' + tile('sprint', ICON[me0][0], 'Left Shift', SHIFT_NAME[me0]) + tile('ability', ICON[me0][1], 'E', E_NAME[me0]) + '</div>' +
      (D.touch ? '' : '<div class="f3d__help" data-r="help">HOLD LEFT CLICK TO SHOOT &middot; HOLD RIGHT CLICK TO BLOCK SHOTS<br>LSHIFT ' + SHIFT_NAME[me0].toUpperCase() + ' &middot; E ' + E_NAME[me0].toUpperCase() + ' &middot; HOLD SPACE ON A WALL TO CLIMB</div>') +
      '<div class="f3d__kc">KILL CAM</div><div class="f3d__big" data-r="big"></div></div>' +
      '<div class="f3d__pad" data-r="pad"><div class="f3d__joy" data-r="joy" style="left:90px;bottom:auto;top:calc(100% - 150px)"><i data-r="knob"></i></div>' +
      btn('fire', 'FIRE', 'right:calc(16px + env(safe-area-inset-right));bottom:calc(96px + env(safe-area-inset-bottom))', 'f3d__btn--fire') +
      btn('jump', 'JUMP', 'right:calc(112px + env(safe-area-inset-right));bottom:calc(60px + env(safe-area-inset-bottom));width:60px;height:60px') +
      btn('block', 'BLOCK', 'right:calc(30px + env(safe-area-inset-right));bottom:calc(200px + env(safe-area-inset-bottom));width:60px;height:60px') + '</div>' +
      '<div class="f3d__vs" data-r="vs"><b class="l">' + NAMES[o.mine.t] + '</b><b class="r">' + NAMES[o.foe.t] + '</b><em>Vs</em><small>' +
      (o.attacking ? 'You attack: win the duel to take the square.' : 'You are attacked: survive to hold the square.') + '</small></div>';
    function btn(a, label, style, extra) { return '<button type="button" class="f3d__btn ' + (extra || '') + '" data-a="' + a + '" style="' + style + '">' + label + '</button>'; }
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
    var scene = D.scene = new T.Scene(), cam = D.cam = new T.PerspectiveCamera(75, 1, .05, 300); cam.rotation.order = 'YXZ';
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
        var x = D.cellC(cc), z = D.cellC(rr), sc = Math.abs(Math.hypot(x - st0.x, z - st0.z) - 14) + .3 * Math.hypot(x - mv.x, z - mv.z) + (D.groundAt(x, z) > TY + .1 ? 3 : 0);
        if (sc < bs) { bs = sc; best = [x, z]; }
      }
      if (best) { mv.x = best[0]; mv.z = best[1]; }
    }
    var maxM = D.mc.hp, maxF = D.fc.hp;
    D.me = { t: o.mine.t, c: mineC, x: ps.x, z: ps.z, y: 0, vy: 0, yaw: 0, pitch: 0, ground: true, hp: hpOf(o.mine), max: maxM, nextFire: 0, draw: 0, lastHit: -9,
      sprintUntil: 0, sprintReady: 0, eReady: 0, fuel: 1.8, flying: false, block: false, stam: 3, power: 0, homing: 0, bigUntil: 0, climbing: false, eye: Math.min(2.3, M.HEIGHT[o.mine.t] * .82), rad: .45 };
    D.me.y = D.groundAt(D.me.x, D.me.z, TY + 2);
    D.me.yaw = Math.atan2(-(fs.x - ps.x), -(fs.z - ps.z));
    D.foeMat = D.pieceMat(foeC).clone(); D.foeMat.emissive = new T.Color('#ffffff'); D.foeMat.emissiveIntensity = 0; D.mats.push(D.foeMat);   /* a hit foe glows white */
    var fu = M.unit(T, o.foe.t, { body: D.foeMat, trim: D.foeMat, c: foeC });
    scene.add(fu);
    D.foe = { t: o.foe.t, c: foeC, mesh: fu, x: fs.x, z: fs.z, y: D.groundAt(fs.x, fs.z, TY + 2), hp: hpOf(o.foe), max: maxF, rad: Math.max(.5, fu.userData.radius * .9), yaw: D.me.yaw + Math.PI,
      move: null, think: .4, nextFire: 1, sawAt: -1, abilityAt: 4 + Math.random() * 6, power: 0, homing: 0, alive: true, deathT: 0, h: fu.userData.height, lastHit: -9, glow: 0 };
    D.helpers = []; D.walls = []; D.stat = { shots: 0, hits: 0, foeShots: 0, taken: 0, abilities: 0 };
    /* viewmodel */
    D.vm = M.viewmodel(T, o.mine.t, mineC); D.vmScene.add(D.vm); D.vmBase = new T.Vector3(.26, -.28, -.5);
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
    D.smoke = []; var smg = new T.SphereGeometry(.5, 7, 5);
    for (var j2 = 0; j2 < 14; j2++) { var smm = new T.Mesh(smg, new T.MeshBasicMaterial({ color: '#e8e4dc', transparent: true, opacity: 0, depthWrite: false })); smm.visible = false; scene.add(smm); D.smoke.push({ m: smm, v: new T.Vector3(), t: 0 }); }
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
      big.textContent = 'GO'; D.phase = 'fight'; D.later(function () { if (big.textContent === 'GO') big.textContent = ''; }, 600);
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
  /* The arena (SPEC.md): the chessboard on a giant table in a big room, you a tiny piece on the board ("much bigger
     when we are a tiny chess piece", PszkLYudcws 1:24). Floor props from the frames: red carpet with cream diamonds, a
     toy train on a track (rideable), record player on a cabinet, bookshelf with green books, red high-back chairs,
     a window with blue sky, fireplace + portrait, twin sconces, chandelier, pink curtains, doorway with a pink banner.
     Collision: D.boxes (solid from `bot` (default 0) up to `top`), D.slabs (walk under, stand on: table top, chair
     seats), D.circles (legs, statues; `bot` for the statues standing on the board). */
  Dp.buildArena = function (T, M, A, g, spec) {
    var D = this, scene = D.scene;
    var sb = spec.board || {}, light = sb.light || '#eaeac6', dark = sb.dark || '#727266';
    var lam = function (c, ex) { var m = new T.MeshLambertMaterial(Object.assign({ color: c }, ex || {})); D.mats.push(m); return m; };
    var WALLH = 50; D.ceil = WALLH; D.slabs = [];
    scene.background = new T.Color('#2a0f0c'); scene.fog = new T.Fog('#3a1712', 70, 190);
    scene.add(new T.HemisphereLight('#ffe8d0', '#5a2a1c', 1.85));
    var sun = new T.DirectionalLight('#ffe6c4', 1.5); sun.position.set(-14, 60, 18); sun.castShadow = true;   /* the chandelier light */
    sun.shadow.mapSize.set(1024, 1024); var sc = sun.shadow.camera; sc.left = -40; sc.right = 40; sc.top = 40; sc.bottom = -40; sc.far = 140; sun.shadow.bias = -.0015;
    scene.add(sun); scene.add(sun.target); D.sun = sun;
    function add(mesh, shadow) { if (shadow) { mesh.castShadow = true; mesh.receiveShadow = true; } scene.add(mesh); return mesh; }
    function solid(mesh, rec) { mesh.castShadow = true; mesh.receiveShadow = true; scene.add(mesh); D.obst.push(mesh); if (rec) D.boxes.push(rec); return mesh; }
    function box(x0, x1, z0, z1, y0, y1, m, rec) {
      var mesh = new T.Mesh(new T.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), m); mesh.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
      return solid(mesh, rec === false ? null : (rec || { x0: x0, x1: x1, z0: z0, z1: z1, top: y1, bot: y0 }));
    }
    function slab(x0, x1, z0, z1, y0, y1, m) { box(x0, x1, z0, z1, y0, y1, m, false); D.slabs.push({ x0: x0, x1: x1, z0: z0, z1: z1, y0: y0, top: y1 }); }
    /* floor planks, walls, ceiling */
    var planks = canvasTex(T, 256, 256, function (x, w, h) {
      for (var i = 0; i < 8; i++) { x.fillStyle = ['#7a4524', '#6e3d1f', '#83502b', '#734221'][i % 4]; x.fillRect(i * 32, 0, 32, h); x.fillStyle = 'rgba(40,18,8,.55)'; x.fillRect(i * 32, 0, 2, h); x.fillRect(i * 32, ((i * 89) % h), 32, 2); }
    }, 18, 18);
    add(new T.Mesh(new T.PlaneGeometry(2 * HALF, 2 * HALF).rotateX(-Math.PI / 2), lam('#ffffff', { map: planks }))).receiveShadow = true;
    var carpet = canvasTex(T, 512, 384, function (x, w, h) {   /* red carpet with cream diamonds */
      x.fillStyle = '#b3122a'; x.fillRect(0, 0, w, h); x.strokeStyle = '#efe2c4'; x.lineWidth = 10; x.strokeRect(14, 14, w - 28, h - 28); x.lineWidth = 3; x.strokeRect(32, 32, w - 64, h - 64);
      x.fillStyle = '#efe2c4'; for (var r = 0; r < 9; r++) for (var c = 0; c < 13; c++) { var cx = 56 + c * 33.5, cy = 56 + r * 34; x.beginPath(); x.moveTo(cx, cy - 8); x.lineTo(cx + 6, cy); x.lineTo(cx, cy + 8); x.lineTo(cx - 6, cy); x.fill(); }
    });
    var cpt = add(new T.Mesh(new T.PlaneGeometry(84, 64).rotateX(-Math.PI / 2), lam('#ffffff', { map: carpet }))); cpt.position.y = .03; cpt.receiveShadow = true;
    var wallTex = canvasTex(T, 512, 512, function (x, w, h) { grain(x, w, h, '#a8402a', '#5e1a10', 9); }, 5, 2);
    var wm = lam('#ffffff', { map: wallTex }), base = lam('#4a1a10');
    [[0, -HALF - .5, 2 * HALF + 2, 1], [0, HALF + .5, 2 * HALF + 2, 1], [-HALF - .5, 0, 1, 2 * HALF + 2], [HALF + .5, 0, 1, 2 * HALF + 2]].forEach(function (w) {
      var m = new T.Mesh(new T.BoxGeometry(w[2], WALLH, w[3]), wm); m.position.set(w[0], WALLH / 2, w[1]); m.receiveShadow = true; scene.add(m); D.obst.push(m);
      var b = new T.Mesh(new T.BoxGeometry(w[2] + .1, 1.6, w[3] + .1), base); b.position.set(w[0], .8, w[1]); scene.add(b);
    });
    var ceil = new T.Mesh(new T.PlaneGeometry(2 * HALF, 2 * HALF).rotateX(Math.PI / 2), lam('#7a1416')); ceil.position.y = WALLH; scene.add(ceil);
    /* the table: top slab (walk under it, stand on it), apron, four turned legs flush with the corners (climbable) */
    var wood = lam('#6b3a1e'), woodL = lam('#7d4626');
    slab(-TX, TX, -TZ, TZ, TY - 1.2, TY, wood);
    box(-TX + .4, TX - .4, -TZ + .4, TZ - .4, TY - 2.6, TY - 1.2, woodL, false);
    var legPts = [[0, 0], [1.3, 0], [1.3, .7], [.9, 1.2], [.8, 3], [1.15, 3.7], [.75, 4.4], [.75, 7.2], [1.05, 7.6], [1, TY - 1.2], [0, TY - 1.2]].map(function (q) { return new T.Vector2(q[0], q[1]); });
    var legGeo = new T.LatheGeometry(legPts, 14);
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (q) {
      var l = new T.Mesh(legGeo, wood); l.position.set(q[0] * (TX - 1.3), 0, q[1] * (TZ - 1.3)); solid(l);
      D.circles.push({ x: l.position.x, z: l.position.z, r: 1.15, top: TY - 1.2 });
    });
    /* the chessboard on the table top, frame, and every other piece of the position as a full-size statue on its square */
    var bt = canvasTex(T, 256, 256, function (x) { for (var r = 0; r < 8; r++) for (var c = 0; c < 8; c++) { x.fillStyle = (r + c) % 2 === 0 ? light : dark; x.fillRect(c * 32, r * 32, 32, 32); } });
    bt.magFilter = T.NearestFilter; bt.repeat.set(1, 1);
    var brd = add(new T.Mesh(new T.PlaneGeometry(8 * TS, 8 * TS).rotateX(-Math.PI / 2), lam('#ffffff', { map: bt }))); brd.position.y = TY + .03; brd.receiveShadow = true;
    var frm = lam('#3e2414');
    [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(function (q) {
      var w = q[0] ? 1.2 : 8 * TS + 2.4, d = q[0] ? 8 * TS + 2.4 : 1.2, f = add(new T.Mesh(new T.BoxGeometry(w, .3, d), frm), true);
      f.position.set(q[0] * (4 * TS + .6), TY + .15, q[1] * (4 * TS + .6));
    });
    var b = D.ctx.state.b, stW = D.pieceMat('w'), stB = D.pieceMat('b');
    for (var i = 0; i < b.length; i++) {
      var p = b[i]; if (!p || i === D.o.mineSq || i === D.o.foeSq || i === D.o.skipSq) continue;
      if (!g.valid[i] || p.c === 'n' && !NAMES[p.t]) continue;
      var st = M.piece(T, NAMES[p.t] ? p.t : 'P', { body: p.c === 'w' ? stW : stB }), sx = (g.col(i) - 3.5) * TS, sz = (g.row(i) - 3.5) * TS;
      st.position.set(sx, TY, sz); st.rotation.y = p.c === 'w' ? Math.PI : 0; scene.add(st); st.traverse(function (o) { if (o.isMesh) D.obst.push(o); });
      D.circles.push({ x: sx, z: sz, r: st.userData.radius * .85, top: TY + st.userData.height, bot: TY - .5, statue: true });
    }
    /* toy train on an oval track round the table (rideable: stand on a car and it carries you) */
    var RX = 37, RZ = 33, rail = lam('#5b5b60'), tie = lam('#4a2c18');
    var tr1 = new T.Mesh(new T.TorusGeometry(1, .012, 4, 96).rotateX(Math.PI / 2), rail), tr2 = tr1.clone();
    tr1.scale.set(RX - .9, 1, RZ - .9); tr2.scale.set(RX + .9, 1, RZ + .9); tr1.position.y = tr2.position.y = .2; scene.add(tr1); scene.add(tr2);
    for (var k = 0; k < 72; k++) { var a = k / 72 * Math.PI * 2, tt = new T.Mesh(new T.BoxGeometry(.5, .15, 2.6), tie); tt.position.set(Math.cos(a) * RX, .1, Math.sin(a) * RZ); tt.rotation.y = -Math.atan2(Math.sin(a) * RZ, Math.cos(a) * RX); scene.add(tt); }
    var carCols = ['#c0392b', '#2f6f9f', '#e1b12c'], wheelM = lam('#1c1c1c');
    D.train = { a: .6, RX: RX, RZ: RZ, cars: [] };
    for (var c2 = 0; c2 < 3; c2++) {
      var cg = new T.Group(), cm = lam(carCols[c2]), H2 = c2 === 0 ? 2.4 : 1.9;
      var bodyM = new T.Mesh(new T.BoxGeometry(2.6, H2 - .5, 4.6), cm); bodyM.position.y = .5 + (H2 - .5) / 2; bodyM.castShadow = true; cg.add(bodyM);
      if (c2 === 0) { var cab = new T.Mesh(new T.BoxGeometry(2.4, 1.6, 1.8), cm); cab.position.set(0, H2 + .8, 1.3); cg.add(cab); var chim = new T.Mesh(new T.CylinderGeometry(.35, .45, 1.2, 8), wheelM); chim.position.set(0, H2 + .6, -1.6); cg.add(chim); }
      for (var w2 = 0; w2 < 4; w2++) { var wh = new T.Mesh(new T.CylinderGeometry(.5, .5, .3, 10).rotateZ(Math.PI / 2), wheelM); wh.position.set(w2 < 2 ? -1.35 : 1.35, .5, w2 % 2 ? 1.4 : -1.4); cg.add(wh); }
      scene.add(cg); var rec = { x0: 0, x1: 0, z0: 0, z1: 0, top: H2, bot: 0, train: true }; D.boxes.push(rec); D.obst.push(bodyM);
      D.train.cars.push({ g: cg, rec: rec, off: -c2 * .16 });
    }
    D.moveTrain(0);
    /* record player on a cabinet (left wall), bookshelf with green books (back wall), window with blue sky + pink
       curtains (right wall), doorway with a pink banner (front wall), fireplace + portrait (back wall), red chairs */
    var cab2 = lam('#5a2e17'), cabL = lam('#6e3a1d');
    box(-HALF, -HALF + 7, -34, -18, 0, 13, cab2); box(-HALF + 7, -HALF + 7.1, -33, -19, 1, 12, cabL, false);
    box(-HALF + .8, -HALF + 6.2, -31, -21, 13, 14.2, lam('#2b211c'));
    var disc = add(new T.Mesh(new T.CylinderGeometry(3.6, 3.6, .2, 24), lam('#111'))); disc.position.set(-HALF + 3.5, 14.35, -26); D.disc = disc;
    var lbl = add(new T.Mesh(new T.CylinderGeometry(1, 1, .22, 16), lam('#c0392b'))); lbl.position.copy(disc.position); disc.add(lbl); lbl.position.set(0, 0, 0);
    var horn = add(new T.Mesh(new T.ConeGeometry(2.6, 5, 16, 1, true), lam('#c9a227', { side: T.DoubleSide }))); horn.position.set(-HALF + 3.5, 19, -21.5); horn.rotation.set(-.9, 0, 0);
    var shelf = lam('#4b2814'), green = ['#2f6b3a', '#3d7f45', '#23542d', '#4c8a52'].map(function (cc) { return lam(cc); });
    box(14, 40, -HALF, -HALF + 6, 0, 34, shelf, { x0: 14, x1: 40, z0: -HALF, z1: -HALF + 6, top: 34, bot: 0 });
    for (var sh = 0; sh < 5; sh++) {
      var y0 = 1.5 + sh * 6.4;
      for (var bk = 0; bk < 16; bk++) { var bw = 1.2 + ((bk * 7 + sh * 3) % 4) * .2, bh = 4 + ((bk * 5 + sh) % 3) * .6, bx = 15.2 + bk * 1.55; var bm = new T.Mesh(new T.BoxGeometry(bw * .9, bh, 4.2), green[(bk + sh) % 4]); bm.position.set(bx, y0 + bh / 2, -HALF + 6.2); scene.add(bm); }
    }
    var sky = canvasTex(T, 128, 128, function (x, w, h) { var gr = x.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#5fa8e8'); gr.addColorStop(1, '#bfe3ff'); x.fillStyle = gr; x.fillRect(0, 0, w, h); x.fillStyle = 'rgba(255,255,255,.9)'; x.beginPath(); x.ellipse(40, 50, 22, 9, 0, 0, 7); x.ellipse(58, 46, 16, 10, 0, 0, 7); x.ellipse(96, 84, 18, 7, 0, 0, 7); x.fill(); });
    var win = add(new T.Mesh(new T.PlaneGeometry(26, 20), new T.MeshBasicMaterial({ map: sky }))); win.position.set(HALF - .05, 24, 0); win.rotation.y = -Math.PI / 2;
    var wf = lam('#f3ead8');
    [[0, 34.2, 28, .9], [0, 13.8, 28, .9], [0, 24, .9, 20], [-13.2, 24, .9, 21], [13.2, 24, .9, 21], [0, 24, 26, .6]].forEach(function (q) { var f = add(new T.Mesh(new T.BoxGeometry(.6, q[3], q[2]), wf)); f.position.set(HALF - .2, q[1], q[0]); });
    var pink = lam('#e58aa0');
    [-17, 17].forEach(function (z) { for (var j = 0; j < 4; j++) { var cu = add(new T.Mesh(new T.CylinderGeometry(.75, .75, WALLH - 6, 8), pink)); cu.position.set(HALF - 1.4, (WALLH - 6) / 2 + 2, z + (j - 1.5) * 1.3); } });
    var door = add(new T.Mesh(new T.BoxGeometry(14, 26, .4), lam('#1e0d07'))); door.position.set(-20, 13, HALF - .05);
    var dfr = lam('#efe2c4'); [[-27.4, 13, .9, 27], [-12.6, 13, .9, 27], [-20, 26.6, 15.7, .9]].forEach(function (q) { var f = add(new T.Mesh(new T.BoxGeometry(q[2], q[3], .6), dfr)); f.position.set(q[0], q[1], HALF - .3); });
    var ban = canvasTex(T, 256, 64, function (x, w, h) { x.fillStyle = '#f08bb0'; x.fillRect(0, 0, w, h); x.fillStyle = '#fff'; x.font = 'bold 34px Georgia'; x.textAlign = 'center'; x.fillText('\u265A \u265B \u265C \u265D \u265E \u265F', w / 2, 45); });
    var bnr = add(new T.Mesh(new T.PlaneGeometry(16, 4), lam('#ffffff', { map: ban, side: T.DoubleSide }))); bnr.position.set(-20, 30, HALF - .4); bnr.rotation.y = Math.PI;
    /* fireplace + portrait on the back wall, left of the bookshelf */
    var brick = lam('#5a2a1a'), mantel = lam('#3e1f12'), FX = -18;
    box(FX - 9, FX - 6, -HALF, -HALF + 2.4, 0, 11, brick); box(FX + 6, FX + 9, -HALF, -HALF + 2.4, 0, 11, brick); box(FX - 10, FX + 10, -HALF, -HALF + 3, 11, 12.4, mantel);
    var back = add(new T.Mesh(new T.PlaneGeometry(12, 11), lam('#1a0b07'))); back.position.set(FX, 5.5, -HALF + .05);
    D.boxes.push({ x0: FX - 6, x1: FX + 6, z0: -HALF, z1: -HALF + 1.6, top: 11, bot: 0 });
    var fireM = new T.MeshBasicMaterial({ color: '#ffb340' }), fireM2 = new T.MeshBasicMaterial({ color: '#ff6a1a' }); D.flames = [];
    for (var f3 = 0; f3 < 7; f3++) { var fl = new T.Mesh(new T.ConeGeometry(.7, 3.2, 6), f3 % 2 ? fireM : fireM2); fl.position.set(FX - 3.6 + f3 * 1.2, 2.2, -HALF + 1); scene.add(fl); D.flames.push(fl); }
    var fl2 = new T.PointLight('#ff9a4a', 90, 45, 2); fl2.position.set(FX, 3.5, -HALF + 5); scene.add(fl2); D.fireLight = fl2;
    var pf = add(new T.Mesh(new T.BoxGeometry(12.4, 9.4, .4), lam('#3a2412'))); pf.position.set(FX, 21, -HALF + .2);
    var art = canvasTex(T, 128, 96, function (x, w, h) { var gr = x.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#2a2622'); gr.addColorStop(1, '#5a4a3c'); x.fillStyle = gr; x.fillRect(0, 0, w, h); x.fillStyle = '#c9b8a0'; x.beginPath(); x.ellipse(60, 40, 14, 18, 0, 0, 7); x.fill(); x.fillStyle = '#1a1614'; x.fillRect(40, 58, 44, 38); });
    var pa = add(new T.Mesh(new T.PlaneGeometry(11, 8), lam('#ffffff', { map: art }))); pa.position.set(FX, 21, -HALF + .45);
    /* twin sconces (white shades) */
    var brass = lam('#d8b878'), shade = new T.MeshBasicMaterial({ color: '#fff4dc' });
    [[-HALF + .3, -40, 1], [-HALF + .3, 30, 1], [HALF - .3, -30, -1], [HALF - .3, 30, -1], [FX - 14, -HALF + .3, 0], [FX + 14, -HALF + .3, 0]].forEach(function (q) {
      var gS = new T.Group(); [-1.2, 1.2].forEach(function (o2) { var arm = new T.Mesh(new T.CylinderGeometry(.12, .18, 2, 6), brass); arm.position.set(o2, 0, .9); gS.add(arm); var shd = new T.Mesh(new T.CylinderGeometry(.5, 1, 1.3, 10, 1, true), shade); shd.position.set(o2, 1.6, .9); gS.add(shd); });
      gS.position.set(q[0], 20, q[1]); gS.rotation.y = q[2] === 0 ? 0 : q[2] > 0 ? Math.PI / 2 : -Math.PI / 2; scene.add(gS);
    });
    /* two red high-back chairs pushed up to the table (seat = high ground you can jump down to from the board) */
    var red = lam('#9e1b22'), redD = lam('#7a1218');
    [1, -1].forEach(function (sd) {
      var z0 = sd > 0 ? TZ + 1 : -TZ - 7.5, z1 = z0 + 6.5, SY = 6.5;
      slab(-5, 5, z0, z1, SY - 1, SY, red);
      [[-4.4, z0 + .6], [4.4, z0 + .6], [-4.4, z1 - .6], [4.4, z1 - .6]].forEach(function (q) { var l = add(new T.Mesh(new T.CylinderGeometry(.45, .55, SY - 1, 8), redD), true); l.position.set(q[0], (SY - 1) / 2, q[1]); D.obst.push(l); D.circles.push({ x: q[0], z: q[1], r: .55, top: SY - 1 }); });
      var bz0 = sd > 0 ? z1 - 1.2 : z0, bz1 = bz0 + 1.2;
      box(-5, 5, bz0, bz1, SY, SY + 16, red, { x0: -5, x1: 5, z0: bz0, z1: bz1, top: SY + 16, bot: SY - 1 });
    });
    /* chandelier (ring of bulbs) */
    var ch = new T.Group(), chw = lam('#6b4022');
    ch.add(new T.Mesh(new T.TorusGeometry(6, .35, 6, 28).rotateX(Math.PI / 2), chw));
    for (var s2 = 0; s2 < 10; s2++) { var a2 = s2 * Math.PI / 5; var sp = new T.Mesh(new T.BoxGeometry(.3, .3, 7.6), chw); sp.rotation.y = a2; ch.add(sp); var bulb = new T.Mesh(new T.SphereGeometry(.6, 8, 6), new T.MeshBasicMaterial({ color: '#ffe9a8' })); bulb.position.set(Math.cos(a2) * 6, .7, Math.sin(a2) * 6); ch.add(bulb); }
    var rod = new T.Mesh(new T.CylinderGeometry(.18, .18, 9, 5), chw); rod.position.y = 4.6; ch.add(rod); ch.position.set(0, WALLH - 9.5, 0); scene.add(ch);
  };
  /* the toy train runs round its oval; a body standing on a car is carried along */
  Dp.moveTrain = function (dt) {
    var D = this, tr = D.train; if (!tr) return;
    tr.a += dt * (D.reduced ? .05 : .1);
    tr.cars.forEach(function (c) {
      var a = tr.a + c.off, x = Math.cos(a) * tr.RX, z = Math.sin(a) * tr.RZ, r = c.rec, dx = x - (r.x0 + r.x1) / 2, dz = z - (r.z0 + r.z1) / 2;
      [D.me].forEach(function (e) {
        if (dt && e && e.ground && Math.abs(e.y - r.top) < .05 && e.x >= r.x0 - .3 && e.x <= r.x1 + .3 && e.z >= r.z0 - .3 && e.z <= r.z1 + .3) { e.x += dx; e.z += dz; }
      });
      r.x0 = x - 2; r.x1 = x + 2; r.z0 = z - 2; r.z1 = z + 2;
      c.g.position.set(x, 0, z); c.g.rotation.y = Math.atan2(-Math.sin(a) * tr.RX, Math.cos(a) * tr.RZ);
    });
  };
  /* glossy cream / black chess-piece material (the VS-card renders) */
  Dp.pieceMat = function (c) {
    var T = this.T, k = 'pm' + c; if (this[k]) return this[k];
    var m = new T.MeshPhongMaterial({ color: c === 'w' ? '#e9dcbc' : '#2e2c2b', specular: c === 'w' ? '#5a5040' : '#6a6a6a', shininess: 70 }); this.mats.push(m); this[k] = m; return m;
  };
  /* the floor height under (x, z) for a body whose feet are at or below `below` (default: any height): the highest box
     top or slab top under the point (pad widens boxes for a body radius). A slab counts only when the body is above its
     underside, so under the table / a chair you walk the floor */
  Dp.groundAt = function (x, z, below, pad) {
    var h = 0, inf = below == null; pad = pad || 0;
    for (var i = 0; i < this.boxes.length; i++) { var b = this.boxes[i]; if (x >= b.x0 - pad && x <= b.x1 + pad && z >= b.z0 - pad && z <= b.z1 + pad && b.top > h && (inf || b.top <= below)) h = b.top; }
    for (var j = 0; j < this.slabs.length; j++) { var s = this.slabs[j]; if (x >= s.x0 - pad && x <= s.x1 + pad && z >= s.z0 - pad && z <= s.z1 + pad && s.top > h && (inf || (s.top <= below && below - .75 >= s.y0 - .05))) h = s.top; }
    return h;
  };
  /* head room under a slab: returns the slab bottom above (x, z, y) or null */
  Dp.headroom = function (x, z, y) {
    for (var j = 0; j < this.slabs.length; j++) { var s = this.slabs[j]; if (x >= s.x0 && x <= s.x1 && z >= s.z0 && z <= s.z1 && y < s.y0) return s.y0; }
    return null;
  };
  /* push a body (circle r, feet at y) out of walls, boxes it cannot step onto, legs and statues; returns true when it
     touched something taller than a step (a wall you can climb by holding Space) */
  Dp.collide = function (e, r, h) {
    var lim = HALF - r, touch = false; h = h || 2;
    if (Math.abs(e.x) >= lim || Math.abs(e.z) >= lim) touch = true;
    e.x = clamp(e.x, -lim, lim); e.z = clamp(e.z, -lim, lim);
    for (var i = 0; i < this.boxes.length; i++) {
      var b = this.boxes[i]; if (b.top <= e.y + .75 || (b.bot || 0) >= e.y + h) continue;
      var cx = clamp(e.x, b.x0, b.x1), cz = clamp(e.z, b.z0, b.z1), dx = e.x - cx, dz = e.z - cz, d = Math.hypot(dx, dz);
      if (d >= r + .05) continue;
      touch = true; if (d >= r) continue;
      if (d < 1e-4) {   /* centre inside: leave by the nearest side */
        var opts = [[b.x0 - r - e.x, 0], [b.x1 + r - e.x, 0], [0, b.z0 - r - e.z], [0, b.z1 + r - e.z]];
        opts.sort(function (a, c) { return Math.abs(a[0] + a[1]) - Math.abs(c[0] + c[1]); }); e.x += opts[0][0]; e.z += opts[0][1];
      } else { e.x = cx + dx / d * r; e.z = cz + dz / d * r; }
    }
    for (var j = 0; j < this.circles.length; j++) {
      var c = this.circles[j]; if (c.top <= e.y + .3 || (c.bot || 0) >= e.y + h) continue;
      var ddx = e.x - c.x, ddz = e.z - c.z, dd = Math.hypot(ddx, ddz), rr = r + c.r;
      if (dd < rr + .05) touch = true;
      if (dd < rr) { if (dd < 1e-4) { ddx = 1; dd = 1; } e.x = c.x + ddx / dd * rr; e.z = c.z + ddz / dd * rr; }
    }
    /* slab edges (the table top, chair seats) seen from the side are climbable too */
    for (var k = 0; k < this.slabs.length; k++) {
      var s = this.slabs[k]; if (e.y >= s.top - .1 || e.y + h < s.y0) continue;
      var qx = clamp(e.x, s.x0, s.x1), qz = clamp(e.z, s.z0, s.z1), qd = Math.hypot(e.x - qx, e.z - qz);
      if (qd > 1e-4 && qd < r + .25) touch = true;
    }
    return touch;
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
        if (!D.locked && !D.touch && cv.requestPointerLock && D.phase === 'fight') { try { var pr = cv.requestPointerLock(); if (pr && pr.catch) pr.catch(function () { }); } catch (err) { /* no pointer lock: drag-look fallback */ } }
        D.mouseLook = { x: e.clientX, y: e.clientY };
        if (e.button === 0) D.pull();   /* hold left click to shoot; every click is also queued (D.fireQ) so a quick click between two slow frames still fires */
        else if (e.button === 2) D.setBlock(true);   /* hold right click to block shots */
        return;
      }
      e.preventDefault();
      var b = e.target.closest && e.target.closest('[data-a]');
      if (b) {
        var a = b.dataset.a; b.classList.add('on');
        if (a === 'fire') { D.pull(); D.look = { id: e.pointerId, x: e.clientX, y: e.clientY, btn: b }; }
        else if (a === 'jump') { D.keys.space = true; D.jump(); }
        else if (a === 'ability') D.ability();
        else if (a === 'sprint') { D.keys.sprintBtn = true; D.shift(); }
        else if (a === 'block') D.setBlock(true);
        (D.held = D.held || {})[e.pointerId] = b;
        return;
      }
      var W = el.clientWidth;
      if (e.clientX < W * .45 && !D.joy) { D.joy = { id: e.pointerId, x0: e.clientX, y0: e.clientY, dx: 0, dy: 0 }; D.r.joy.style.left = e.clientX + 'px'; D.r.joy.style.top = e.clientY + 'px'; }
      else if (!D.look) D.look = { id: e.pointerId, x: e.clientX, y: e.clientY };
    });
    D.on(el, 'pointermove', function (e) {
      /* a press / release while another mouse button is held arrives as a chorded pointermove, not pointerdown / up */
      if (e.pointerType === 'mouse') {
        if (e.button === 0) { if (e.buttons & 1) D.pull(); else D.firing = false; }
        else if (e.button === 2) D.setBlock(!!(e.buttons & 2));
        return;
      }
      if (D.joy && e.pointerId === D.joy.id) {
        var dx = e.clientX - D.joy.x0, dy = e.clientY - D.joy.y0, L = Math.hypot(dx, dy), m = 50;
        if (L > m) { dx = dx / L * m; dy = dy / L * m; }
        D.joy.dx = dx / m; D.joy.dy = dy / m; D.r.knob.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
      } else if (D.look && e.pointerId === D.look.id) {
        D.turn((e.clientX - D.look.x) * .0062, (e.clientY - D.look.y) * .0062); D.look.x = e.clientX; D.look.y = e.clientY;
      }
    });
    function up(e) {
      if (e.pointerType === 'mouse') { if (e.button === 0) D.firing = false; if (e.button === 2) D.setBlock(false); if (!e.buttons) D.mouseLook = null; return; }
      if (D.joy && e.pointerId === D.joy.id) { D.joy = null; D.r.knob.style.transform = ''; }
      if (D.look && e.pointerId === D.look.id) { if (D.look.btn) D.firing = false; D.look = null; }
      var b = D.held && D.held[e.pointerId];
      if (b) {
        delete D.held[e.pointerId]; b.classList.remove('on');
        var a = b.dataset.a; if (a === 'block') D.setBlock(false); if (a === 'sprint') D.keys.sprintBtn = false; if (a === 'fire') D.firing = false; if (a === 'jump') D.keys.space = false;
      }
    }
    D.on(el, 'pointerup', up); D.on(el, 'pointercancel', up);
  };
  Dp.key = function (e, down) {
    var D = this, c = e.code, k = D.keys;
    var map = { KeyW: 'f', ArrowUp: 'f', KeyS: 'b', ArrowDown: 'b', KeyA: 'l', ArrowLeft: 'l', KeyD: 'r', ArrowRight: 'r' };
    var mine = map[c] || /^(Space|ShiftLeft|ShiftRight|KeyE|KeyQ|Escape)$/.test(c);
    if (!mine) return;
    if (c !== 'Escape') { e.preventDefault(); e.stopPropagation(); }
    if (map[c]) { k[map[c]] = down; return; }
    if (c === 'Space') { k.space = down; if (down && !e.repeat) D.jump(); }
    else if (c === 'ShiftLeft' || c === 'ShiftRight') { k.shift = down; if (down && !e.repeat) D.shift(); }
    else if (c === 'KeyE' && down && !e.repeat) D.ability();
    else if (c === 'KeyQ') D.setBlock(down);
  };
  Dp.turn = function (dx, dy) {
    var m = this.me; if (this.phase !== 'fight') return;
    m.yaw -= dx; m.pitch = clamp(m.pitch - dy, -1.35, 1.35);
  };
  Dp.jump = function () { var m = this.me; if (this.phase !== 'fight' || !m.ground) return; m.vy = 6.2; m.ground = false; };
  /* Left Shift: the piece's movement ability (SPEC.md tiles). Bishop: fly while held (fuel). Others: one burst, then a cooldown */
  Dp.shift = function () {
    var D = this, m = D.me, T = D.T, c = D.mc; if (D.phase !== 'fight' || m.t === 'B' || D.clock < m.sprintReady) return;
    m.sprintReady = D.clock + c.shiftCd; D.stat.abilities++;
    var fx = -Math.sin(m.yaw), fz = -Math.cos(m.yaw);
    if (m.t === 'P' || m.t === 'N') m.sprintUntil = D.clock + (m.t === 'N' ? 1.6 : 1.2);   /* pawn sprint, knight gallop */
    else if (m.t === 'R') { m.vy = 11; m.ground = false; }   /* big hop (INFERRED effect; cooldown 2 seen) */
    else if (m.t === 'Q') m.dash = { until: D.clock + .25, vx: fx * 32, vz: fz * 32 };   /* dash (INFERRED) */
    else if (m.t === 'K') { m.vy = 9.5; m.ground = false; m.leap = { vx: fx * 10, vz: fz * 10 }; }   /* leap ("flew off the board") */
    CM.sound.play('move-self', { volume: .45 }); D.hud();
    void T;
  };
  Dp.setBlock = function (on) {
    var D = this, m = D.me; m.block = !!on && D.phase === 'fight' && m.stam > .2;
    if (D.btns.block) D.btns.block.classList.toggle('on', m.block);
  };
  Dp.say = function () { /* the game shows no ability captions (HUD = two tiles only) */ };

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
    D.moveTrain(dt);
    if (D.phase === 'fight') { D.updateMe(dt); D.updateFoe(dt); D.updateHelpers(dt); D.fireTick(dt); D.regen(dt); if (D.clock >= D.cap) D.finish(!D.o.attacking, 'time'); }
    else if (D.phase === 'intro') D.placeCam(0);
    D.updateProjs(dt); D.updateFx(dt);
    if (D.foe.deathT > 0) { var k = Math.min(1, (D.t - D.foe.deathT) / (D.reduced ? .05 : .7)); D.foe.mesh.rotation.x = -k * Math.PI / 2; D.foe.mesh.position.y = D.foe.y - k * .3; }
    if (D.meUnit && D.meDeathT > 0) { var k2 = Math.min(1, (D.t - D.meDeathT) / (D.reduced ? .05 : .7)); D.meUnit.rotation.x = -k2 * Math.PI / 2; }
    if (D.phase === 'end' || D.phase === 'dead') D.killcam();
    D.render();
    if (D.frames % 6 === 0) D.hud();
  };
  /* health regenerates after 3 s without damage (Nz2A 13:58; rate INFERRED) */
  Dp.regen = function (dt) {
    var D = this;
    [D.me, D.foe].forEach(function (e) { if (e.hp > 0 && D.clock - e.lastHit > 3) e.hp = Math.min(e.max, e.hp + e.max * .06 * dt); });
  };
  Dp.updateMe = function (dt) {
    var D = this, m = D.me, k = D.keys, c = D.mc;
    var fx = (k.r ? 1 : 0) - (k.l ? 1 : 0), fz = (k.f ? 1 : 0) - (k.b ? 1 : 0);
    if (D.joy) { fx += D.joy.dx; fz -= D.joy.dy; }
    var L = Math.hypot(fx, fz); if (L > 1) { fx /= L; fz /= L; }
    var spd = (4.4 + 1.4 * c.speed) * (D.clock < m.sprintUntil ? (m.t === 'N' ? 2.1 : 1.7) : 1) * (m.block ? .55 : 1) * (m.draw > 0 ? .7 : 1);
    var sy = Math.sin(m.yaw), cy = Math.cos(m.yaw);
    var vx = (-sy * fz + cy * fx) * spd, vz = (-cy * fz - sy * fx) * spd;
    if (m.dash) { if (D.clock < m.dash.until) { vx += m.dash.vx; vz += m.dash.vz; } else m.dash = null; }
    if (m.leap) { if (m.ground && m.vy <= 0) m.leap = null; else { vx += m.leap.vx; vz += m.leap.vz; } }
    m.x += vx * dt; m.z += vz * dt;
    if (m.pull) { var pl = m.pull; pl.t += dt; var pk = Math.min(1, pl.t / pl.d), pe = pk * pk * (3 - 2 * pk); m.x = pl.x0 + (pl.x1 - pl.x0) * pe; m.z = pl.z0 + (pl.z1 - pl.z0) * pe; if (pk >= 1) { m.pull = null; m.y = Math.max(m.y, D.groundAt(m.x, m.z, m.y + 2)); } }
    /* bishop flight: hold Left Shift, 1.8 s of fuel that refills on the ground */
    var flyHeld = m.t === 'B' && (k.shift || k.sprintBtn) && m.fuel > 0;
    if (flyHeld) { m.vy = Math.min(m.vy + 26 * dt, 4.5); m.fuel -= dt; m.flying = true; } else m.flying = false;
    var touch = D.collide(m, m.rad, m.eye + .2);
    /* hold Space against a wall to climb it (PszkLYudcws tutorial) */
    m.climbing = !!k.space && touch && !flyHeld;
    if (m.climbing) m.vy = Math.max(m.vy, 4.2);
    else m.vy -= GRAV * dt * (flyHeld ? .35 : 1);
    m.y += m.vy * dt;
    var top = D.ceil - m.eye - .3, hr = D.headroom(m.x, m.z, m.y + .3); if (hr != null) top = Math.min(top, hr - m.eye - .2); if (m.y > top) { m.y = top; m.vy = Math.min(0, m.vy); }
    var gnd = D.groundAt(m.x, m.z, m.y + .75, m.rad * .5);
    if (m.y <= gnd) { if (gnd - m.y < .76 && m.vy <= 0) { m.y = gnd; m.vy = 0; m.ground = true; } }
    else m.ground = m.y - gnd < .02;
    if (m.ground && m.t === 'B') m.fuel = Math.min(1.8, m.fuel + dt * .9);
    /* foe body blocks */
    var f = D.foe; if (f.alive && Math.abs(f.y - m.y) < 2) { var dx = m.x - f.x, dz = m.z - f.z, d = Math.hypot(dx, dz), rr = m.rad + f.rad; if (d < rr && d > 1e-3) { m.x = f.x + dx / d * rr; m.z = f.z + dz / d * rr; } }
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
  /* ---- firing: hold left click (or FIRE) to shoot at the weapon's rate; the bow draws while held and shoots on release ---- */
  Dp.pull = function () { this.firing = true; this.fireQ = Math.min(this.mc.auto ? 4 : 2, (this.fireQ | 0) + 1); };
  Dp.fireTick = function (dt) {
    var D = this, m = D.me, c = D.mc;
    if (c.draw) {   /* bow: draw while held (0.7 s to full), release to shoot; a click that came and went between frames shoots a quick draw */
      if (D.phase !== 'fight' || m.block) { m.draw = 0; return; }
      if (D.firing && D.clock >= m.nextFire) m.draw = Math.min(1, m.draw + dt / c.draw);
      else if (m.draw > 0 || D.fireQ > 0) { D.loose(Math.max(.3, m.draw)); m.draw = 0; if (D.fireQ > 0) D.fireQ--; }
      return;
    }
    /* frame dt is capped at 50 ms, so at a few fps game time runs slow; queued clicks may then fire several shots in one
       frame (as many as the weapon's rate allows in the real time that passed, max 4) instead of waiting frames each */
    var n = Math.max(1, Math.min(4, Math.floor((D.rawDt || 0) / c.rate)));
    for (var i = 0; i < n; i++) { if (!D.shootOnce(i > 0)) break; }
  };
  Dp.loose = function (pw) {
    var D = this, m = D.me, c = D.mc, T = D.T; if (D.clock < m.nextFire) return;
    m.nextFire = D.clock + c.rate; D.stat.shots++; CM.sound.play(c.snd, { volume: .6 + .4 * pw }); D.recoil = .3;
    var dir = new T.Vector3(0, 0, -1).applyQuaternion(D.cam.quaternion), start = D.cam.position.clone().add(dir.clone().multiplyScalar(.6)).add(new T.Vector3(0, -.1, 0));
    var mult = D.clock < m.bigUntil ? 2 : 1;
    D.launch({ owner: 'me', pos: start, vel: dir.multiplyScalar(c.pspeed * (.45 + .55 * pw)).add(new T.Vector3(0, c.pgrav * .08, 0)), grav: c.pgrav, dmg: c.dmg * (.4 + .6 * pw) * mult, kind: 'arrow', homing: m.homing > 0 });
    if (m.homing > 0) m.homing--;
  };
  Dp.shootOnce = function (extra) {
    var D = this, m = D.me, c = D.mc;
    if (D.phase !== 'fight' || m.block) return false;
    if (extra ? !(D.fireQ > 0) : (!(D.firing || D.fireQ > 0) || D.clock < m.nextFire)) return false;
    if (D.fireQ > 0) D.fireQ--;
    m.nextFire = D.clock + c.rate; D.stat.shots++;
    CM.sound.play(c.snd, { volume: c.kind === 'melee' ? .7 : c.auto ? .55 : 1 });
    D.recoil = c.kind === 'melee' ? 0 : c.auto ? .25 : (m.t === 'R' ? 1 : .7); if (c.kind === 'melee') D.swing = 1;
    D.flashMe.intensity = c.kind === 'hitscan' ? 14 : 0; D.vmFlash.visible = c.kind === 'hitscan'; D.flashT = .05;
    var T = D.T, origin = D.cam.position.clone(), dir = new T.Vector3(0, 0, -1).applyQuaternion(D.cam.quaternion);
    if (c.kind === 'hitscan' && !c.auto) { D.puff(origin.clone().add(dir.clone().multiplyScalar(1.4)).add(new T.Vector3(0, -.25, 0)), m.c, dir); }   /* musket smoke puff */
    var mult = D.clock < m.bigUntil ? 2 : 1;
    if (c.kind === 'melee') {
      var f = D.foe, dx = f.x - m.x, dz = f.z - m.z, d = Math.hypot(dx, dz), fwd = new T.Vector2(-Math.sin(m.yaw), -Math.cos(m.yaw));
      var ang = d > .01 ? Math.acos(clamp((dx * fwd.x + dz * fwd.y) / d, -1, 1)) : 0;
      if (f.alive && d - f.rad <= c.range && ang < .8 && Math.abs((f.y + f.h * .5) - (m.y + m.eye)) < 3) D.damageFoe(c.dmg * mult, false, new T.Vector3(f.x, f.y + f.h * .6, f.z));
      D.helpers.forEach(function (h) { if (h.side === 'foe' && h.hp > 0 && Math.hypot(h.x - m.x, h.z - m.z) < c.range + .5) D.damageHelper(h, c.dmg); });
      return true;
    }
    var moving = D.keys.f || D.keys.b || D.keys.l || D.keys.r || D.joy, spread = c.spread * (moving ? 1.6 : 1) * (m.ground ? 1 : 2);
    var dd = dir.clone().add(new T.Vector3((Math.random() - .5) * 2 * spread, (Math.random() - .5) * 2 * spread, (Math.random() - .5) * 2 * spread)).normalize();
    D.hitscan(origin, dd, c.range, c.dmg * mult, true);
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
    if (tracer) D.tracer(D.cam.position.clone().add(dir.clone().multiplyScalar(.8)).add(new T.Vector3(0, -.1, 0)), end);
    if (!hb) { if (h) D.burst(h.point, '#d8c9a8', 3); return; }
    var owner = h.object.parent, head = hb === 'head';
    var helper = D.helpers.filter(function (x) { return x.mesh === owner; })[0];
    if (helper) D.damageHelper(helper, dmg); else D.damageFoe(dmg * (head ? 1.5 : 1), head, h.point);
  };
  /* a hit: the foe glows white and a red X flashes (no damage numbers, no health bar) */
  Dp.damageFoe = function (dmg, head, point) {
    var D = this, f = D.foe; if (!f.alive || D.phase !== 'fight') return;
    f.hp -= Math.round(dmg); f.lastHit = D.clock; f.glow = 1; D.stat.hits++; D.marker(f.hp <= 0 || head); D.burst(point, '#ffffff', 4);
    CM.sound.play('move-self', { volume: .5 });
    if (f.hp <= 0) { f.hp = 0; f.alive = false; f.deathT = D.t; D.burst(new D.T.Vector3(f.x, f.y + f.h * .5, f.z), '#ffffff', 16); CM.sound.play('capture'); D.finish(true); }
  };
  Dp.damageHelper = function (h, dmg) {
    var D = this; h.hp -= dmg; D.marker(h.hp <= 0);
    if (h.hp <= 0) { h.mesh.rotation.x = -Math.PI / 2; h.mesh.position.y = h.y + .3; D.burst(new D.T.Vector3(h.x, h.y + 1, h.z), '#ffffff', 10); }
  };
  /* you are hit: the cracked-glass overlay shows how hurt you are (no health bar) */
  Dp.damageMe = function (dmg, from) {
    var D = this, m = D.me; if (D.phase !== 'fight') return;
    if (m.block && m.stam > 0) { CM.sound.play('move-opponent', { volume: .8 }); m.stam = Math.max(0, m.stam - .35); D.blockFx = .15; return; }
    m.hp -= Math.round(dmg); m.lastHit = D.clock; D.shake = .12; D.stat.taken++;
    var cr = D.r.crack; cr.classList.add('hit'); cr.style.opacity = String(Math.min(1, .25 + 1.1 * (1 - m.hp / m.max))); setTimeout(function () { cr.classList.remove('hit'); D.crackLevel(); }, 120);
    CM.sound.play('capture', { volume: .65 });
    if (from && !D.reduced) { /* nudge the view a little towards the shooter so you can find it */ var a = Math.atan2(-(from.x - m.x), -(from.z - m.z)), dd = ((a - m.yaw + Math.PI * 3) % (Math.PI * 2)) - Math.PI; m.yaw += clamp(dd, -.08, .08); }
    if (m.hp <= 0) { m.hp = 0; D.finish(false); }
  };
  Dp.crackLevel = function () { var m = this.me; this.r.crack.style.opacity = m.hp >= m.max ? '0' : String(Math.min(.95, 1.05 * (1 - m.hp / m.max))); };
  /* ---- projectiles (bow arrows, bishop bombs, thrown pieces) ---- */
  Dp.launch = function (p) {
    var D = this, T = D.T, mesh = D.projPool.pop();
    if (!mesh) { mesh = new T.Mesh(new T.CylinderGeometry(.04, .04, .7, 5).rotateX(Math.PI / 2), new T.MeshBasicMaterial({ color: '#fff' })); D.scene.add(mesh); }
    mesh.material.color.set(p.kind === 'bomb' ? '#222' : p.kind === 'piece' ? (p.owner === 'me' ? (D.me.c === 'w' ? '#e9dcbc' : '#2e2c2b') : (D.foe.c === 'w' ? '#e9dcbc' : '#2e2c2b')) : '#e8d6a8');
    var big = p.kind === 'arrow' ? 1 : p.kind === 'piece' ? 6 : 3; mesh.scale.set(big, big, p.kind === 'arrow' ? 1 : p.kind === 'piece' ? 1.6 : .35);
    mesh.visible = true; mesh.position.copy(p.pos); p.mesh = mesh; p.life = 3.5; D.projs.push(p);
  };
  Dp.updateProjs = function (dt) {
    var D = this, T = D.T, keep = [];
    D.projs.forEach(function (p) {
      if (p.done) return;
      /* inward arrows (knight E): the arrow curves towards its target */
      if (p.homing) {
        var tg = p.owner === 'me' ? (D.foe.alive ? new T.Vector3(D.foe.x, D.foe.y + D.foe.h * .55, D.foe.z) : null) : new T.Vector3(D.me.x, D.me.y + D.me.eye - .3, D.me.z);
        if (tg) { var sp = p.vel.length(), want = tg.sub(p.pos).normalize().multiplyScalar(sp); p.vel.lerp(want, Math.min(1, dt * 3.2)).setLength(sp); }
      }
      p.vel.y -= p.grav * dt * (p.homing ? .2 : 1); var step = p.vel.clone().multiplyScalar(dt), L = step.length(), np = p.pos.clone().add(step);
      p.life -= dt; var end = null, hitObj = null;
      if (L > 0) {
        D.ray.set(p.pos, step.clone().normalize()); D.ray.far = L;
        var list = p.owner === 'me' ? D.hitboxes().concat(D.obst) : D.obst, h = D.ray.intersectObjects(list, true)[0];
        if (h) { end = h.point; hitObj = h.object; }
      }
      if (!end && np.y <= D.groundAt(np.x, np.z, p.pos.y + .05)) end = np;
      if (p.owner === 'foe' && !end) {   /* does the segment pass through the player's body? */
        var m = D.me, c = new T.Vector3(m.x, m.y + m.eye * .6, m.z), cl = new T.Line3(p.pos, np).closestPointToPoint(c, true, new T.Vector3());
        if (cl.distanceTo(c) < .55 + (p.kind === 'piece' ? .5 : 0) && Math.abs(cl.y - c.y) < m.eye * .6 + .3) { p.done = true; D.damageMe(p.dmg, p.from); }
      }
      if (p.kind === 'bomb' && end) { D.explode(end, p); p.done = true; }
      else if (end) {
        p.done = true; var hb = hitObj && hitObj.userData.hit;
        if (hb && p.owner === 'me') {
          var owner = hitObj.parent, helper = D.helpers.filter(function (x) { return x.mesh === owner; })[0];
          if (helper) D.damageHelper(helper, p.dmg); else D.damageFoe(p.dmg * (hb === 'head' ? 1.5 : 1), hb === 'head', end);
        } else D.burst(end, '#d8c9a8', 4);
      }
      if (p.life <= 0) p.done = true;
      if (p.done) { p.mesh.visible = false; D.projPool.push(p.mesh); return; }
      p.pos.copy(np); p.mesh.position.copy(np); p.mesh.lookAt(np.clone().add(p.vel));
      keep.push(p);
    });
    D.projs = keep;
    /* enemy bomb warnings: red ring, then the blast */
    D.bombs = D.bombs.filter(function (b) {
      if (D.clock < b.at) { D.ring.visible = true; D.ring.position.set(b.x, b.y + .05, b.z); D.ring.material.opacity = .45 + .35 * Math.sin(D.t * 18); return true; }
      D.ring.visible = false; D.explode(new T.Vector3(b.x, b.y, b.z), { owner: 'foe', dmg: 45 }); return false;
    });
  };
  Dp.explode = function (pt, p) {
    var D = this; CM.sound.play('explosion', { volume: .8 }); D.burst(pt, '#ff8a2a', 16); D.shake = Math.max(D.shake, .2);
    if (p.owner === 'me') { var f = D.foe, d = Math.hypot(f.x - pt.x, f.z - pt.z); if (d < 3.6 && Math.abs(f.y - pt.y) < 3) D.damageFoe(45 * (1 - d / 7.2) * 1.4, false, new D.T.Vector3(f.x, f.y + f.h * .6, f.z)); }
    else { var m = D.me, dm = Math.hypot(m.x - pt.x, m.z - pt.z); if (dm < 3.2 && Math.abs(m.y - pt.y) < 2.5) D.damageMe(p.dmg * (1 - dm / 6.4) * 1.3, pt); }
  };
  /* ---- E: the piece's second ability, on a cooldown (SPEC.md tiles) ---- */
  Dp.ability = function () {
    var D = this, m = D.me, T = D.T; if (D.phase !== 'fight' || D.clock < m.eReady) return;
    m.eReady = D.clock + D.mc.eCd; D.stat.abilities++; D.later(function () { D.hud(); }, 0);
    var dir = new T.Vector3(0, 0, -1).applyQuaternion(D.cam.quaternion);
    if (m.t === 'P') D.addHelper('me', m.x + Math.cos(m.yaw) * 1.6, m.z - Math.sin(m.yaw) * 1.6, m.y);   /* "hire another pawn" */
    else if (m.t === 'K') {   /* pull the enemy to you (slides, never teleports) */
      var f = D.foe; m.bigUntil = D.clock + 2.5;
      f.move = { x0: f.x, z0: f.z, x1: m.x - Math.sin(m.yaw) * 2.4, z1: m.z - Math.cos(m.yaw) * 2.4, t: 0, d: D.reduced ? .01 : .35, arc: Math.max(0, m.y - f.y) > .5 ? 1.5 : 0, toY: m.y }; f.think = 1;
    } else if (m.t === 'B') {   /* throw a bomb */
      D.launch({ owner: 'me', pos: D.cam.position.clone().add(dir.clone().multiplyScalar(.7)), vel: dir.multiplyScalar(16).add(new T.Vector3(0, 4, 0)), grav: GRAV * .8, dmg: 45, kind: 'bomb' });
      CM.sound.play('fps_grenade', { volume: .7 });
    } else if (m.t === 'Q') {   /* pinch a pawn and throw it at the opponent */
      D.launch({ owner: 'me', pos: D.cam.position.clone().add(dir.clone().multiplyScalar(1)), vel: dir.multiplyScalar(30).add(new T.Vector3(0, 2, 0)), grav: 5, dmg: 45, kind: 'piece' });
      CM.sound.play('move-self', { volume: .7 });
    } else if (m.t === 'R') D.buildWall(m.x - Math.sin(m.yaw) * 3, m.z - Math.cos(m.yaw) * 3, m.y, m.yaw);   /* build a brick wall */
    else if (m.t === 'N') m.homing = 3;   /* the next three arrows curve inwards */
  };
  /* rook E: a brick wall across the view, 6 m wide; at most two stand at once (the oldest crumbles) */
  Dp.buildWall = function (x, z, y, yaw) {
    var D = this, T = D.T;
    if (!D.brickMat) {
      var tex = canvasTex(T, 128, 64, function (g2, w, h) { g2.fillStyle = '#9a3b26'; g2.fillRect(0, 0, w, h); g2.fillStyle = '#d8cbb0'; for (var r = 0; r < 4; r++) { g2.fillRect(0, r * 16, w, 2); for (var c = 0; c < 5; c++) g2.fillRect(((c * 32) + (r % 2) * 16) % w, r * 16, 2, 16); } }, 2, 2);
      D.brickMat = new T.MeshLambertMaterial({ map: tex }); D.mats.push(D.brickMat);
    }
    var along = Math.abs(Math.sin(yaw)) > Math.abs(Math.cos(yaw)), w = 6, th = .8, hh = 3.4;   /* walls stay axis aligned (collision boxes) */
    var x0 = along ? x - th / 2 : x - w / 2, x1 = along ? x + th / 2 : x + w / 2, z0 = along ? z - w / 2 : z - th / 2, z1 = along ? z + w / 2 : z + th / 2;
    var mesh = new T.Mesh(new T.BoxGeometry(x1 - x0, hh, z1 - z0), D.brickMat); mesh.position.set(x, y + hh / 2, z); mesh.castShadow = true; mesh.receiveShadow = true; D.scene.add(mesh);
    var rec = { x0: x0, x1: x1, z0: z0, z1: z1, top: y + hh, bot: y }; D.boxes.push(rec); D.obst.push(mesh);
    D.walls.push({ mesh: mesh, rec: rec });
    if (D.walls.length > 2) { var old = D.walls.shift(); D.scene.remove(old.mesh); D.boxes.splice(D.boxes.indexOf(old.rec), 1); D.obst.splice(D.obst.indexOf(old.mesh), 1); }
    CM.sound.play('move-opponent', { volume: .8 });
  };
  Dp.addHelper = function (side, x, z, y) {
    var D = this, T = D.T, M = CM.fps3dModels, c = side === 'me' ? D.me.c : D.foe.c;
    if (D.helpers.filter(function (h) { return h.side === side && h.hp > 0; }).length) return;   /* one hired pawn at a time */
    var u = M.unit(T, 'P', { body: D.pieceMat(c), trim: D.pieceMat(c), c: c });
    var e = { x: x, z: z, y: y }; D.collide(e, .5); e.y = D.groundAt(e.x, e.z, y + .8);
    u.position.set(e.x, e.y, e.z); D.scene.add(u);
    D.helpers.push({ side: side, mesh: u, x: e.x, z: e.z, y: e.y, hp: 40, next: D.clock + .8 });
  };
  Dp.updateHelpers = function () {
    var D = this, T = D.T;
    D.helpers.forEach(function (h) {
      if (h.hp <= 0) return;
      var tx = h.side === 'me' ? D.foe.x : D.me.x, tz = h.side === 'me' ? D.foe.z : D.me.z;
      h.mesh.rotation.y = Math.atan2(-(tx - h.x), -(tz - h.z));
      if (D.clock < h.next || (h.side === 'foe' && CM.fps3d.qaHold)) return; h.next = D.clock + 1.2 + Math.random() * .4;
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
    if (Math.abs(x) > TX - 1.2 || Math.abs(z) > TZ - 1.2) return false;
    for (i = 0; i < this.boxes.length; i++) { var b = this.boxes[i]; if ((b.bot || 0) >= TY - .6 && b.top > TY + .75 && x > b.x0 - .9 && x < b.x1 + .9 && z > b.z0 - .9 && z < b.z1 + .9) return false; }
    for (i = 0; i < this.circles.length; i++) { var q = this.circles[i]; if (q.statue && Math.hypot(x - q.x, z - q.z) < q.r + 1.1) return false; }
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
      var lvl = mv.toY != null ? mv.toY : f.y, g0 = D.groundAt(f.x, f.z, Math.max(f.y, lvl) + 1.6); f.y = mv.arc ? g0 + Math.sin(k * Math.PI) * mv.arc : f.y + (g0 - f.y) * Math.min(1, dt * 12);
      if (k >= 1) { f.move = null; f.think = .25 + Math.random() * .6; f.y = D.groundAt(f.x, f.z, f.y + 1.6); }
    } else {
      var gy = D.groundAt(f.x, f.z, f.y + 1.6); f.y = gy < f.y - .05 ? Math.max(gy, f.y - dt * 14) : gy;   /* off an edge: fall */
      f.think -= dt;
      if (f.think <= 0) {
        var best = null, bs = -1e9, me3 = new T.Vector3(m.x, m.y + m.eye, m.z), low = f.hp < f.max * .35;
        D.moves().forEach(function (cr) {
          var x = D.cellC(cr[0]), z = D.cellC(cr[1]), d = Math.hypot(x - m.x, z - m.z), gh = D.groundAt(x, z, TY + 2);
          var s = -Math.abs(d - (low && c.kind !== 'melee' ? c.pref * 1.4 : c.pref)) * .6 + Math.random() * 1.6;
          if (c.kind !== 'melee' && D.los(new T.Vector3(x, gh + f.h * .8, z), me3)) s += 4;
          if (c.kind !== 'melee' && gh > TY + 1) s += 2.2;
          if (d < 2.2 && c.kind !== 'melee') s -= 5;
          if (s > bs) { bs = s; best = [x, z]; }
        });
        if (best && Math.hypot(best[0] - f.x, best[1] - f.z) > .1) {
          var dist = Math.hypot(best[0] - f.x, best[1] - f.z);
          f.move = { x0: f.x, z0: f.z, x1: best[0], z1: best[1], t: 0, d: f.t === 'N' ? .6 : Math.max(.35, dist / (3.2 + 2.2 * c.speed)), arc: f.t === 'N' ? 2.2 : f.t === 'R' && Math.random() < .3 ? 3 : (Math.abs(D.groundAt(best[0], best[1], TY + 2) - f.y) > .3 ? 1.2 : 0), toY: TY };
        } else f.think = .5;
      }
    }
    var fe = { x: f.x, z: f.z, y: f.y }; D.collide(fe, f.rad * .8); if (!f.move) { f.x = fe.x; f.z = fe.z; }
    f.mesh.position.set(f.x, f.y, f.z);
    var want = Math.atan2(-(m.x - f.x), -(m.z - f.z)), dy = ((want - f.yaw + Math.PI * 3) % (Math.PI * 2)) - Math.PI; f.yaw += dy * Math.min(1, dt * 8); f.mesh.rotation.y = f.yaw;
    /* abilities on a cooldown (first one 4-10 s in) */
    if (!CM.fps3d.qaHold && D.clock > f.abilityAt) {
      f.abilityAt = D.clock + c.eCd + 2 + Math.random() * 4;
      if (f.t === 'P') D.addHelper('foe', f.x + 1.6, f.z, f.y);
      else if (f.t === 'K') { var a = Math.atan2(m.x - f.x, m.z - f.z); m.pull = { x0: m.x, z0: m.z, x1: f.x + Math.sin(a) * 2.6, z1: f.z + Math.cos(a) * 2.6, t: 0, d: D.reduced ? .01 : .35 }; m.y = Math.max(m.y, f.y); f.power = 1; }   /* slide, never teleport */
      else if (f.t === 'B') { D.bombs.push({ x: m.x, z: m.z, y: m.y, at: D.clock + 1.1 }); CM.sound.play('fps_grenade', { volume: .6 }); }
      else if (f.t === 'N') f.homing = 3;
      else if (f.t === 'Q') f.throwPiece = true;
      else f.power = 1;
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
      D.launch({ owner: 'foe', pos: muzzle.clone(), vel: v, grav: c.pgrav, dmg: c.dmg * mult, kind: 'arrow', from: f, homing: f.homing > 0 }); if (f.homing > 0) f.homing--;
      return;
    }
    if (f.throwPiece) { f.throwPiece = false; var tv = tgt.clone().sub(muzzle).normalize().multiplyScalar(30); D.launch({ owner: 'foe', pos: muzzle.clone(), vel: tv, grav: 0, dmg: 40, kind: 'piece', from: f }); return; }
    var dmg = Math.random() < acc ? c.dmg * mult : 0;
    if (!c.auto) D.puff(muzzle.clone(), f.c, tgt.clone().sub(muzzle).normalize());
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
  /* musket smoke puff at the muzzle (tan / cream for white, dark for black, SPEC.md) */
  Dp.puff = function (pt, c, dir) {
    var D = this, n = D.reduced ? 1 : 4;
    for (var i = 0, j = 0; i < D.smoke.length && j < n; i++) {
      var s = D.smoke[i]; if (s.t > 0) continue; j++;
      s.m.visible = true; s.m.position.copy(pt); s.m.material.color.set(c === 'b' ? '#4a4644' : '#e8e0d0'); s.t = 1.1 + Math.random() * .4; s.m.scale.setScalar(.4);
      s.v.set(dir.x * 1.4 + (Math.random() - .5) * .8, .5 + Math.random() * .5, dir.z * 1.4 + (Math.random() - .5) * .8);
    }
  };
  Dp.updateFx = function (dt) {
    var D = this;
    D.tracers.forEach(function (t) { if (t.t > 0) { t.t -= dt; t.l.material.opacity = Math.max(0, t.t / .08) * .9; if (t.t <= 0) t.l.visible = false; } });
    D.sparks.forEach(function (s) { if (s.t > 0) { s.t -= dt; s.v.y -= 14 * dt; s.m.position.addScaledVector(s.v, dt); s.m.scale.setScalar(Math.max(.1, s.t * 2)); if (s.t <= 0) s.m.visible = false; } });
    D.smoke.forEach(function (s) { if (s.t > 0) { s.t -= dt; s.m.position.addScaledVector(s.v, dt); s.m.scale.setScalar(.4 + (1.5 - s.t) * 1.2); s.m.material.opacity = Math.max(0, Math.min(.7, s.t * .6)); if (s.t <= 0) s.m.visible = false; } });
    if (D.flashT > 0) { D.flashT -= dt; if (D.flashT <= 0) { D.flashMe.intensity = 0; D.vmFlash.visible = false; } }
    if (D.efT > 0) { D.efT -= dt; if (D.efT <= 0) { D.flashFoe.intensity = 0; D.efFlash.visible = false; } }
    if (D.fireLight) D.fireLight.intensity = 90 + (D.reduced ? 0 : Math.sin(D.t * 9) * 9 + Math.sin(D.t * 23) * 5);
    if (D.flames && !D.reduced) D.flames.forEach(function (fl, i) { fl.scale.y = 1 + .25 * Math.sin(D.t * (7 + i) + i * 1.3); });
    if (D.disc && !D.reduced) D.disc.rotation.y += dt * 2.5;
    /* the hit foe glows white, fading */
    var f = D.foe; if (f.glow > 0) { f.glow = Math.max(0, f.glow - dt * 5); D.foeMat.emissiveIntensity = f.glow * .9; }
    /* viewmodel: base pose, walk bob, recoil kick, melee swing, bow draw, minigun spin, block raise */
    var vm = D.vm, b = D.vmBase, m = D.me, aspect = D.cam.aspect, ud = vm.userData;
    var pt = aspect < 1;   /* portrait phone: the weapon sits higher and nearer the middle, clear of the FIRE button */
    vm.position.set(b.x * (pt ? .55 : 1), b.y * (pt ? .62 : 1) + (D.reduced ? 0 : Math.sin(D.bob * 1.9) * .012), b.z * (pt ? 1.15 : 1) + D.recoil * .08);
    vm.rotation.set(D.recoil * .25, 0, 0);
    if (m.t === 'K') { vm.rotation.set(.35, -.1, -.25); }
    if (D.swing > 0) { vm.rotation.y = -1.2 * Math.sin(D.swing * Math.PI); vm.rotation.z = .6 * Math.sin(D.swing * Math.PI); D.swing = Math.max(0, D.swing - dt * 3.5); }
    if (ud.arrow) { ud.arrow.position.z = -.3 + m.draw * .22; ud.string.scale.x = 1; ud.string.position.z = -.3 + m.draw * .22; }
    if (ud.spin && D.firing && D.phase === 'fight' && !m.block) ud.spin.rotation.z += dt * 30;
    if (m.block) { vm.position.set(0, -.18, -.42); vm.rotation.set(0, 0, Math.PI / 2.4); }
    D.recoil = Math.max(0, D.recoil - dt * 6);
  };
  Dp.marker = function (kill) { var h = this.r.hm; h.classList.toggle('kill', !!kill); h.classList.add('on'); setTimeout(function () { h.classList.remove('on'); }, 130); };
  /* the two tiles: dimmed with the seconds left while recharging (bishop: dimmed while the wings are out of fuel) */
  Dp.hud = function () {
    var D = this, m = D.me;
    function set(tile, left) {
      if (!tile) return; var off = left > 0; tile.classList.toggle('off', off);
      var bEl = tile.querySelector('b'), txt = off ? String(Math.ceil(left)) : ''; if (bEl.textContent !== txt) bEl.textContent = txt;
    }
    set(D.r.tsprint, m.t === 'B' ? (m.fuel < .3 && !m.flying ? (1.8 - m.fuel) / .9 : 0) : m.sprintReady - D.clock);
    set(D.r.tability, m.eReady - D.clock);
    if (D.r.tsprint) D.r.tsprint.classList.toggle('on', m.flying || D.clock < m.sprintUntil);
    if (D.phase === 'fight' && m.hp > 0 && D.frames % 18 === 0) D.crackLevel();
    if (D.r.help && D.clock > 7) D.r.help.style.opacity = '0';
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
    if (this.phase === 'fight' || (this.phase === 'end' && !this.kcOn)) R.render(this.vmScene, this.vmCam);
  };
  /* ---- the end: "<PIECE> WINS", then the KILL CAM (over the killer's shoulder, looking at the victim), then hand the
     result back to the board ---- */
  Dp.finish = function (won, why) {
    var D = this; if (D.phase === 'end' || D.phase === 'dead' || D.dead) return;
    D.phase = won ? 'end' : 'dead';
    CM.fps3d.lastResult = { won: !!won, why: why || '', me: D.me.t, foe: D.foe.t, clock: D.clock, stat: D.stat };   /* QA: the result survives after the duel closes */
    D.firing = false; D.fireQ = 0; D.setBlock(false); D.endT = D.t;
    if (document.pointerLockElement && document.exitPointerLock) document.exitPointerLock();
    var winner = won ? D.me.t : D.foe.t, big = D.r.big; big.textContent = (NAMES[winner] || 'Piece').toUpperCase() + ' WINS';
    if (why !== 'time') {
      /* my own piece for the kill cam */
      var T = D.T, mu = CM.fps3dModels.unit(T, D.me.t, { body: D.pieceMat(D.me.c), trim: D.pieceMat(D.me.c), c: D.me.c });
      mu.position.set(D.me.x, D.me.y, D.me.z); mu.rotation.y = D.me.yaw; D.scene.add(mu); D.meUnit = mu; if (!won) D.meDeathT = D.t;
      D.kc = { killer: won ? 'me' : 'foe' };
    }
    D.result = { won: won, me: Math.max(1, Math.round(D.me.hp)), foe: Math.max(1, Math.round(D.foe.hp)) };
    D.later(function () { var res = D.resolve, r = D.result; if (live === D) live = null; D.destroy(); res(r); }, why === 'time' ? 1500 : (D.reduced ? 2000 : 2800));
  };
  Dp.killcam = function () {
    var D = this; if (!D.kc || D.t - D.endT < .5) { if (D.phase === 'dead') { D.me.pitch = Math.min(D.me.pitch + .02, .9); D.placeCam(0); } return; }
    if (!D.kcOn) { D.kcOn = true; D.el.classList.add('f3d--kc'); }
    var T = D.T, me = D.me, f = D.foe, K = D.kc.killer === 'me' ? new T.Vector3(me.x, me.y, me.z) : new T.Vector3(f.x, f.y, f.z);
    var V = D.kc.killer === 'me' ? new T.Vector3(f.x, f.y, f.z) : new T.Vector3(me.x, me.y, me.z);
    var dir = V.clone().sub(K); dir.y = 0; if (dir.lengthSq() < 1e-4) dir.set(0, 0, -1); dir.normalize();
    var side = new T.Vector3(-dir.z, 0, dir.x), k = D.reduced ? 0 : Math.min(1, (D.t - D.endT - .5) / 2.2);
    var pos = K.clone().addScaledVector(dir, -3.2 - k * 1.2).addScaledVector(side, 1.4).add(new T.Vector3(0, 2.6 + k * .6, 0));
    D.cam.position.copy(pos); D.cam.lookAt(V.x, V.y + 1.2, V.z);
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
      return { phase: D.phase, clock: D.clock, touch: D.touch, theme: D.theme, me: { t: D.me.t, hp: D.me.hp, x: D.me.x, y: D.me.y, z: D.me.z, yaw: D.me.yaw, pitch: D.me.pitch, block: D.me.block, ready: D.clock >= D.me.nextFire, draw: D.me.draw, sprintReady: D.me.sprintReady, eReady: D.me.eReady, climbing: D.me.climbing, ground: D.me.ground },
        foe: { t: D.foe.t, hp: D.foe.hp, x: D.foe.x, y: D.foe.y, z: D.foe.z, alive: D.foe.alive }, statues: D.circles.length, stat: D.stat, firing: D.firing, helpers: D.helpers.length, pr: D.pr, shadows: D.renderer.shadowMap.enabled };
    },
    /* QA: place the player (feet at y) facing yaw */
    dbgPut: function (x, y, z, yaw) { var D = live; if (!D) return false; var m = D.me; m.x = x; m.y = y; m.z = z; m.vy = 0; if (yaw != null) { m.yaw = yaw; m.pitch = 0; } return true; },
    TY: TY, TX: TX, TZ: TZ,
    dbgAim: function (head) {
      var D = live; if (!D) return false; var m = D.me, f = D.foe;
      var dx = f.x - m.x, dz = f.z - m.z, dy = (f.y + f.h * (head ? .86 : .5)) - (m.y + m.eye);
      m.yaw = Math.atan2(-dx, -dz); m.pitch = Math.atan2(dy, Math.hypot(dx, dz)); return true;
    }
  };
})();
