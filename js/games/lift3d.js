/* lift3d: a real three.js view under a canvas mini-game (js/games/*), so a game whose rules and HUD live on the 2D
   canvas can show its world in 3D like the video does. m-3d 2026-11-26, used by Chess Arena (g4_rt variant 'arena',
   CONozr99agQ) and Table Tactics (g6_table_tactics, xvlHij1tgk8).

   The WebGL canvas sits in host.el UNDER the game's 2D canvas (which keeps every pointer event and draws the HUD on a
   transparent background), so the game's input code stays the same: it only swaps its screen -> world mapping for
   L.pick() (a ray onto the ground plane y = 0) and draws screen overlays at L.project() points.
   No WebGL / three.js failed to load -> attach() resolves null and the game keeps its 2D drawing.

     CM.lift3d.attach(host, { background: '#24352d', fov: 40, exposure: 1 }).then(function (L) { ... })
     L: THREE, scene, camera, renderer, canvas, look(target[x,y,z], theta, phi, dist) (spherical camera around a point;
        theta 0 = camera on +z looking towards -z), pick(clientX, clientY) -> Vector3 on y = 0 | null,
        project(x, y, z) -> { x, y } in the 2D canvas' backing pixels, hit(clientX, clientY, objects) -> userData.tag of the
        first object hit (or its nearest tagged ancestor) | null, render(), resize(), dispose(),
        canvasTex(canvas) (sRGB CanvasTexture), alive */
(function () {
  'use strict';
  var CM = window.CM;
  var glOK = null;
  function hasGL() {
    if (glOK != null) return glOK;
    try { var c = document.createElement('canvas'); glOK = !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl'))); } catch (e) { glOK = false; }
    return glOK;
  }
  function three() {
    if (window.THREE) return Promise.resolve(window.THREE);
    return CM.util.loadScript('js/vendor/three.min.js').then(function () { return window.THREE; });
  }
  function attach(host, o) {
    o = o || {};
    if (!hasGL()) return Promise.resolve(null);
    return three().then(function (T) {
      if (!T || !host.el || !host.canvas.isConnected) return null;
      var renderer;
      try { renderer = new T.WebGLRenderer({ antialias: true, alpha: false }); } catch (e) { glOK = false; return null; }
      var coarse = window.matchMedia && matchMedia('(pointer: coarse)').matches;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, coarse ? 1.5 : 2));
      renderer.outputColorSpace = T.SRGBColorSpace;
      renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = o.exposure || 1;
      renderer.shadowMap.enabled = o.shadows !== false; renderer.shadowMap.type = T.PCFSoftShadowMap;
      var cv = renderer.domElement; cv.className = 'lift3d'; cv.setAttribute('aria-hidden', 'true');
      cv.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%;display:block;pointer-events:none;z-index:0';
      host.el.insertBefore(cv, host.canvas);
      host.canvas.style.position = 'relative'; host.canvas.style.zIndex = '1'; host.canvas.style.background = 'transparent';
      var scene = new T.Scene(); scene.background = new T.Color(o.background || '#000');
      var camera = new T.PerspectiveCamera(o.fov || 40, 1, .1, 400);
      var L = { THREE: T, scene: scene, camera: camera, renderer: renderer, canvas: cv, alive: true, host: host };
      var ray = new T.Raycaster(), plane = new T.Plane(new T.Vector3(0, 1, 0), 0), v2 = new T.Vector2(), w = 0, h = 0;
      L.resize = function () {
        var r = host.canvas.getBoundingClientRect(); if (!r.width || !r.height) return;
        if (r.width === w && r.height === h) return; w = r.width; h = r.height;
        renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
      };
      L.look = function (tgt, theta, phi, dist) {
        var sp = Math.sin(phi);
        camera.position.set(tgt[0] + dist * sp * Math.sin(theta), tgt[1] + dist * Math.cos(phi), tgt[2] + dist * sp * Math.cos(theta));
        camera.lookAt(tgt[0], tgt[1], tgt[2]); camera.updateMatrixWorld();
      };
      L.pick = function (cx, cy, y) {
        var r = host.canvas.getBoundingClientRect(); if (!r.width) return null;
        v2.set((cx - r.left) / r.width * 2 - 1, -((cy - r.top) / r.height) * 2 + 1);
        ray.setFromCamera(v2, camera); plane.constant = -(y || 0);
        var out = new T.Vector3(); return ray.ray.intersectPlane(plane, out) ? out : null;
      };
      L.hit = function (cx, cy, objects) {   /* the first object (or its tagged ancestor) a tap ray meets */
        var r = host.canvas.getBoundingClientRect(); if (!r.width) return null;
        v2.set((cx - r.left) / r.width * 2 - 1, -((cy - r.top) / r.height) * 2 + 1); ray.setFromCamera(v2, camera);
        var hs = ray.intersectObjects(objects, true); if (!hs.length) return null;
        var o = hs[0].object; while (o && o.userData.tag == null) o = o.parent; return o ? o.userData.tag : null;
      };
      L.project = function (x, y, z) {
        var v = new T.Vector3(x, y, z).project(camera), c = host.canvas;
        return { x: (v.x + 1) / 2 * c.width, y: (1 - v.y) / 2 * c.height, behind: v.z > 1 };
      };
      L.canvasTex = function (c) { var t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; t.anisotropy = 4; return t; };
      L.render = function () { if (!L.alive) return; L.resize(); renderer.render(scene, camera); };
      L.dispose = function () {
        L.alive = false;
        scene.traverse(function (ob) { if (ob.geometry) ob.geometry.dispose(); if (ob.material) [].concat(ob.material).forEach(function (m) { if (m.map) m.map.dispose(); m.dispose(); }); });
        renderer.dispose(); try { renderer.forceContextLoss(); } catch (e) { /* already lost */ }
        if (cv.parentNode) cv.parentNode.removeChild(cv);
        host.canvas.style.background = '';
      };
      L.resize();
      return L;
    }).catch(function (e) { console.warn('lift3d: 3D view unavailable', e); return null; });
  }
  CM.lift3d = { attach: attach, hasGL: hasGL };
})();
