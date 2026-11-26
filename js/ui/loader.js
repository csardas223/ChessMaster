/* loader-v2 2026-11-25 (owner 9:12 PM ET: the ov-ui gradient loader "is not sleek"; make it like the lobby thumbnail
   loading). The mode-open loader is now the game screen drawn as skeletons in the lobby thumbnail language
   (css/lobby.css .vrow__th: hsl(h 18% 24%) -> hsl(h 14% 15%) surfaces, the same 100deg white sweep, `skel` 1.3s
   ease-in-out infinite): a top bar, both player bars (avatar, name lines, clock) and the board, each placed on the
   real element's rect so the page appears to build in place. Centrepiece: a small matte light-grey three.js lathe pawn
   (js/vendor/three.min.js, lazy) turning slowly on its Y axis on the skeleton board, soft hemisphere + key light.
   Each open picks a random hue used only as a faint low-saturation tint (mostly the #312e2b / #262421 palette).
   Shown at least MIN_MS, then an opacity-only fade over FADE_MS (no movement). Reduced motion: static (no sweep, no
   spin). No WebGL / three.js not loaded: an SVG pawn turned with CSS rotateY. The overlay takes no pointer events, so
   the real back button under the skeleton top bar keeps working.
   API (unchanged): CM.loader.show(), CM.loader.hide(now) (called by CM.gameUI.setLoading). */
(function () {
  'use strict';
  var CM = window.CM;
  var MIN_MS = 400, FADE_MS = 240, SPIN_S = 6;
  var el = null, stage = null, shownAt = 0, hideT = 0, raf = 0, lastH = -999, visible = false;
  var three = null, threeP = null;

  var PAWN_SVG = '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M20 6.5a6 6 0 0 0-3.65 10.77c-2.25 1.29-3.55 3.33-3.55 5.85h4.5c-.48 3.54-2.52 5.79-5.47 7.29V33.5h16.34v-3.09c-2.95-1.5-4.99-3.75-5.47-7.29h4.5c0-2.52-1.3-4.56-3.55-5.85A6 6 0 0 0 20 6.5z"/></svg>';
  var BACK_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>';

  function reduced() { return CM.settings && CM.settings.reducedMotion ? CM.settings.reducedMotion() : (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches); }
  /* a hue at least 60deg from the previous open; only ever used at very low saturation */
  function hue() { var h; do { h = Math.floor(Math.random() * 360); } while (Math.abs(((h - lastH + 540) % 360) - 180) < 60); lastH = h; return h; }

  function pbarHTML(id) {
    return '<div class="mload__pbar" data-k="' + id + '"><i class="sk sk--ava"></i><span class="mload__lines"><i class="sk sk--l1"></i><i class="sk sk--l2"></i></span><i class="sk sk--clock"></i></div>';
  }
  function build() {
    if (el) return;
    el = document.createElement('div');
    el.className = 'mload'; el.id = 'mode-loader'; el.setAttribute('aria-hidden', 'true'); el.hidden = true;
    el.innerHTML = '<div class="mload__bar"><span class="mload__back">' + BACK_SVG + '</span><span class="mload__title"><i class="sk sk--t1"></i><i class="sk sk--t2"></i></span><span class="mload__icons"><i class="sk sk--ic"></i><i class="sk sk--ic"></i></span></div>' +
      pbarHTML('top') +
      '<div class="mload__board sk"><div class="mload__stage" id="mload-stage"><div class="mload__css">' + PAWN_SVG + '</div><i class="mload__shadow"></i></div></div>' +
      pbarHTML('bottom') +
      '<div class="mload__side sk"><i class="sk sk--tab"></i><i class="sk sk--row"></i><i class="sk sk--row"></i><i class="sk sk--row sk--short"></i></div>';
    (document.getElementById('view-game') || document.body).appendChild(el);
    stage = el.querySelector('.mload__stage');
  }

  /* place each skeleton block on the real element it stands for (the game layout is already laid out under
     .is-loading, its contents only visibility:hidden); fall back to a centred column when a rect is empty */
  function rectOf(id) { var n = document.getElementById(id); if (!n) return null; var r = n.getBoundingClientRect(); return r.width > 8 && r.height > 8 ? r : null; }
  function put(node, r) { if (!r) { node.style.display = 'none'; return; } node.style.display = ''; Object.assign(node.style, { left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px' }); }
  function layout() {
    if (!el) return;
    var W = window.innerWidth, H = window.innerHeight;
    var bar = rectOf('view-game') ? document.querySelector('#view-game .gamebar') : null, br = bar && bar.getBoundingClientRect();
    put(el.querySelector('.mload__bar'), br && br.height > 8 ? br : { left: 0, top: 0, width: W, height: 52 });
    var board = rectOf('board-wrap'), top = rectOf('card-top'), bot = rectOf('card-bottom'), side = rectOf('side');
    if (!board) { var s = Math.min(W - 16, H - 52 - 140, 640), x = (W - s) / 2, y = 52 + 56 + Math.max(0, (H - 52 - s - 112) / 2 - 0); board = { left: x, top: y, width: s, height: s }; }
    if (!top) top = { left: board.left, top: board.top - 56, width: board.width, height: 56 };
    if (!bot) bot = { left: board.left, top: board.top + board.height, width: board.width, height: 56 };
    put(el.querySelector('.mload__board'), board);
    put(el.querySelector('[data-k="top"]'), top); put(el.querySelector('[data-k="bottom"]'), bot);
    put(el.querySelector('.mload__side'), side && side.left >= board.left + board.width - 1 ? { left: side.left, top: side.top, width: side.width, height: Math.min(side.height, H - side.top) } : null);
    size();
  }

  /* ---------- three.js pawn ---------- */
  function webgl() { try { var c = document.createElement('canvas'); return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl'))); } catch (e) { return false; } }
  function loadThree() {
    if (threeP) return threeP;
    if (!webgl()) { threeP = Promise.resolve(null); return threeP; }
    threeP = (window.THREE ? Promise.resolve() : CM.util.loadScript('js/vendor/three.min.js')).then(function () { return window.THREE || null; }).catch(function () { return null; });
    return threeP;
  }
  function pawnProfile(T) {
    /* Staunton pawn silhouette (radius, height); base at y=0, ~1.8 units tall */
    var pts = [[0, 0], [0.62, 0], [0.64, 0.04], [0.62, 0.09], [0.55, 0.13], [0.56, 0.18], [0.5, 0.23], [0.4, 0.28], [0.33, 0.35],
      [0.27, 0.46], [0.23, 0.62], [0.2, 0.82], [0.18, 0.98], [0.31, 1.03], [0.33, 1.08], [0.3, 1.13], [0.19, 1.17], [0.16, 1.21]];
    var cy = 1.47, r = 0.3, a0 = Math.asin((1.21 - cy) / r);
    for (var i = 1; i <= 20; i++) { var a = a0 + (Math.PI / 2 - a0) * i / 20; pts.push([Math.max(0, Math.cos(a) * r), cy + Math.sin(a) * r]); }
    pts[pts.length - 1][0] = 0;
    return pts.map(function (p) { return new T.Vector2(p[0], p[1]); });
  }
  function buildThree(T) {
    if (three) return three;
    try {
      var canvas = document.createElement('canvas'); canvas.className = 'mload__gl';
      var renderer = new T.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
      renderer.setClearColor(0x000000, 0);
      if ('outputColorSpace' in renderer && T.SRGBColorSpace) renderer.outputColorSpace = T.SRGBColorSpace;
      var scene = new T.Scene(), camera = new T.PerspectiveCamera(26, 1, 0.1, 50);
      camera.position.set(0, 1.35, 5.6); camera.lookAt(0, 0.86, 0);
      var mat = new T.MeshStandardMaterial({ color: 0xc9c7c3, roughness: 0.88, metalness: 0 });   /* matte light grey */
      var pawn = new T.Mesh(new T.LatheGeometry(pawnProfile(T), 72), mat);
      scene.add(pawn);
      scene.add(new T.HemisphereLight(0xf4f2ee, 0x26241f, 1.25));
      var key = new T.DirectionalLight(0xffffff, 1.35); key.position.set(2.5, 4, 3.5); scene.add(key);
      var rim = new T.DirectionalLight(0xffffff, 0.45); rim.position.set(-3.5, 2, -3); scene.add(rim);
      three = { renderer: renderer, scene: scene, camera: camera, pawn: pawn, canvas: canvas };
      stage.insertBefore(canvas, stage.firstChild);
      size();
      return three;
    } catch (e) { three = false; return null; }
  }
  function size() {
    if (!three || !stage) return;
    var px = stage.clientWidth || 120, dpr = Math.min(2, window.devicePixelRatio || 1);
    three.renderer.setPixelRatio(dpr); three.renderer.setSize(px, px, false);
    if (visible) three.renderer.render(three.scene, three.camera);
  }
  function frame() {
    var last = performance.now();
    var tick = function (now) {
      if (!visible || !three) { raf = 0; return; }
      if (!reduced()) three.pawn.rotation.y += (now - last) / 1000 * (Math.PI * 2 / SPIN_S);
      last = now;
      three.renderer.render(three.scene, three.camera);
      raf = requestAnimationFrame(tick);
    };
    cancelAnimationFrame(raf); raf = requestAnimationFrame(tick);
  }

  function show() {
    build();
    clearTimeout(hideT);
    var h = hue();
    el.style.setProperty('--mh', h); el.dataset.hue = h;
    el.classList.toggle('is-static', !!reduced());
    el.hidden = false; el.classList.remove('is-out');
    layout();
    void el.offsetWidth; el.classList.add('is-in');
    requestAnimationFrame(layout);   /* once the loading layout has settled */
    shownAt = performance.now(); visible = true;
    loadThree().then(function (T) {
      if (!T || !visible) return;
      if (buildThree(T)) { el.classList.add('has-gl'); size(); three.pawn.rotation.y = reduced() ? 0.6 : Math.random() * Math.PI * 2; frame(); }
    });
  }
  function hide(now) {
    if (!el || !visible) return;
    clearTimeout(hideT);
    var wait = now ? 0 : Math.max(0, MIN_MS - (performance.now() - shownAt));
    hideT = setTimeout(function () {
      el.classList.remove('is-in'); el.classList.add('is-out');
      hideT = setTimeout(function () { visible = false; el.hidden = true; el.classList.remove('is-out'); cancelAnimationFrame(raf); raf = 0; }, FADE_MS);
    }, wait);
  }
  window.addEventListener('resize', function () { if (visible) layout(); });
  /* warm three.js once the lobby is idle so the first open already has the 3D pawn (cached afterwards) */
  function warm() { (window.requestIdleCallback || function (f) { setTimeout(f, 1200); })(function () { loadThree(); }, { timeout: 6000 }); }
  if (document.readyState === 'complete') setTimeout(warm, 1500); else window.addEventListener('load', function () { setTimeout(warm, 1500); });

  CM.loader = { show: show, hide: hide, isVisible: function () { return visible; }, MIN_MS: MIN_MS, FADE_MS: FADE_MS };
})();
