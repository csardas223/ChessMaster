/* ov-ui 2026-11-25 (owner 8:29 PM ET): mode loading screen. Replaces the big intro thumbnail that faded out over the
   board: while a mode's scripts load, a real 3D pawn (three.js lathe, the vendored js/vendor/three.min.js, lazy) spins
   on its Y axis in the middle of a soft gradient whose 2-3 hues are picked at random on every open. Shown for at least
   MIN_MS so a fast load does not flash, then eased out over FADE_MS. No WebGL / three.js not loaded yet -> an SVG pawn
   turned with a CSS 3D rotateY. Reduced motion -> a static pawn, no spin.
   API: CM.loader.show(), CM.loader.hide() (called by CM.gameUI.setLoading). */
(function () {
  'use strict';
  var CM = window.CM;
  var MIN_MS = 400, FADE_MS = 260, SPIN_S = 1.8;
  var el = null, stage = null, shownAt = 0, hideT = 0, raf = 0, lastH = -999, visible = false;
  var three = null; /* { renderer, scene, camera, pawn } once built */
  var threeP = null;

  var PAWN_SVG = '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M20 6.5a6 6 0 0 0-3.65 10.77c-2.25 1.29-3.55 3.33-3.55 5.85h4.5c-.48 3.54-2.52 5.79-5.47 7.29V33.5h16.34v-3.09c-2.95-1.5-4.99-3.75-5.47-7.29h4.5c0-2.52-1.3-4.56-3.55-5.85A6 6 0 0 0 20 6.5z"/></svg>';

  function reduced() { return CM.settings && CM.settings.reducedMotion ? CM.settings.reducedMotion() : (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches); }
  function rnd(a, b) { return a + Math.random() * (b - a); }
  /* tasteful random gradient: base hue at least 50deg away from the previous open, a neighbour hue and a far accent,
     moderate saturation, dark-to-mid lightness so the white pawn always reads */
  function gradient() {
    var h1; do { h1 = Math.floor(Math.random() * 360); } while (Math.abs(((h1 - lastH + 540) % 360) - 180) < 50);
    lastH = h1;
    var h2 = (h1 + rnd(28, 72)) % 360, h3 = (h1 + rnd(140, 220)) % 360, s = Math.round(rnd(36, 54));
    var c = function (h, l, sa) { return 'hsl(' + Math.round(h) + ' ' + (sa || s) + '% ' + Math.round(l) + '%)'; };
    var ang = Math.round(rnd(130, 220));
    var g = 'radial-gradient(120% 85% at ' + Math.round(rnd(10, 40)) + '% ' + Math.round(rnd(5, 30)) + '%, ' + c(h2, rnd(40, 47)) + ' 0%, transparent 62%),' +
      'radial-gradient(110% 80% at ' + Math.round(rnd(60, 92)) + '% ' + Math.round(rnd(75, 98)) + '%, ' + c(h3, rnd(34, 42), Math.max(32, s - 12)) + ' 0%, transparent 58%),' +
      'linear-gradient(' + ang + 'deg, ' + c(h1, rnd(30, 36)) + ', ' + c(h2, rnd(18, 24)) + ')';
    return { bg: g, hues: [Math.round(h1), Math.round(h2), Math.round(h3)] };
  }

  function build() {
    if (el) return;
    el = document.createElement('div');
    el.className = 'mload'; el.id = 'mode-loader'; el.setAttribute('aria-hidden', 'true'); el.hidden = true;
    el.innerHTML = '<div class="mload__stage" id="mload-stage"><div class="mload__css">' + PAWN_SVG + '</div><i class="mload__shadow"></i></div>';
    var host = document.getElementById('view-game') || document.body;
    host.appendChild(el);
    stage = el.querySelector('.mload__stage');
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
    /* Staunton pawn silhouette (radius, height); base at y=0, ~2 units tall */
    var pts = [[0, 0], [0.66, 0], [0.68, 0.05], [0.66, 0.1], [0.58, 0.14], [0.6, 0.2], [0.55, 0.25], [0.44, 0.3], [0.36, 0.36],
      [0.3, 0.46], [0.25, 0.62], [0.21, 0.82], [0.19, 1.0], [0.33, 1.05], [0.36, 1.1], [0.33, 1.15], [0.2, 1.19], [0.17, 1.23]];
    var cy = 1.5, r = 0.32, a0 = Math.asin((1.23 - cy) / r);  /* head: sphere arc from the neck up to the top */
    for (var i = 1; i <= 16; i++) { var a = a0 + (Math.PI / 2 - a0) * i / 16; pts.push([Math.max(0, Math.cos(a) * r), cy + Math.sin(a) * r]); }
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
      var scene = new T.Scene(), camera = new T.PerspectiveCamera(30, 1, 0.1, 50);
      camera.position.set(0, 1.25, 5.4); camera.lookAt(0, 0.92, 0);
      var geo = new T.LatheGeometry(pawnProfile(T), 64);
      var mat = new T.MeshStandardMaterial({ color: 0xf3efe6, roughness: 0.42, metalness: 0.04 });
      var pawn = new T.Mesh(geo, mat);
      scene.add(pawn);
      scene.add(new T.HemisphereLight(0xffffff, 0x3a3530, 1.15));
      var key = new T.DirectionalLight(0xffffff, 2.2); key.position.set(3, 4, 4); scene.add(key);
      var rim = new T.DirectionalLight(0xffffff, 0.9); rim.position.set(-4, 2, -3); scene.add(rim);
      three = { renderer: renderer, scene: scene, camera: camera, pawn: pawn, canvas: canvas };
      stage.insertBefore(canvas, stage.firstChild);
      size();
      return three;
    } catch (e) { three = false; return null; }
  }
  function size() {
    if (!three) return;
    var px = stage.clientWidth || 180, dpr = Math.min(2, window.devicePixelRatio || 1);
    three.renderer.setPixelRatio(dpr); three.renderer.setSize(px, px, false);
  }
  function frame(t0) {
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
    var g = gradient();
    el.style.background = g.bg; el.dataset.hues = g.hues.join(',');
    el.classList.toggle('is-static', !!reduced());
    el.hidden = false; el.classList.remove('is-out');
    void el.offsetWidth; el.classList.add('is-in');
    shownAt = performance.now(); visible = true;
    loadThree().then(function (T) {
      if (!T || !visible) { if (!T) el.classList.remove('has-gl'); return; }
      if (buildThree(T)) { el.classList.add('has-gl'); size(); three.pawn.rotation.y = reduced() ? 0.5 : Math.random() * Math.PI * 2; frame(); }
    });
  }
  function hide(now) {
    if (!el || !visible) return;
    clearTimeout(hideT);
    var wait = now ? 0 : Math.max(0, MIN_MS - (performance.now() - shownAt));
    hideT = setTimeout(function () {
      el.classList.remove('is-in'); el.classList.add('is-out');
      hideT = setTimeout(function () { visible = false; el.hidden = true; el.classList.remove('is-out'); cancelAnimationFrame(raf); raf = 0; }, reduced() ? 0 : FADE_MS);
    }, wait);
  }
  window.addEventListener('resize', function () { if (visible) size(); });
  /* warm three.js once the lobby is idle so the first open already has the 3D pawn (cached afterwards) */
  function warm() { (window.requestIdleCallback || function (f) { setTimeout(f, 1200); })(function () { loadThree(); }, { timeout: 6000 }); }
  if (document.readyState === 'complete') setTimeout(warm, 1500); else window.addEventListener('load', function () { setTimeout(warm, 1500); });

  CM.loader = { show: show, hide: hide, isVisible: function () { return visible; }, _gradient: gradient };
})();
