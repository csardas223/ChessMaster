/* scene3d: shared real-3D board renderer (three.js r170, vendored as js/vendor/three.min.js -> window.THREE).
   Owner-approved 2026-11-25 (cm-g6a). Used by Who Takes the Crown x2 (tower), Beyond the Board (floating platforms),
   Roblox jXOg1Py4EoA; built so g4 (Chess Arena) and g5 (FPS duel, Passant, Wizard iso) can reuse it.

   The 2D DOM board stays in the page underneath (rules, legal moves, highlights, QA clicks all keep working): the 3D
   canvas is laid over #board-wrap and the 2D stage is made invisible (opacity 0, still clickable by script). Taps on the
   canvas are raycast to a square and fed to the normal engine (SpecGame.onTap), so a 3D mode is still an ordinary mode.
   No WebGL (or three.js failed to load) -> attach() resolves null and the mode simply keeps its 2D board.

   Usage from a mode hook (game hooks only, never inside rule hooks):
     onStart: function (ctx) {
       CM.scene3d.attach(ctx, {
         board: { light: '#fefefe', dark: '#4e2739', edge: '#2a1520', thickness: 0.3 },   // false = draw no board
         pieces: 'mesh',              // 'mesh' (lathe-turned Staunton set, colours below) | 'sprite' (the piece art as
                                      //  upright billboards; http(s) only, file:// falls back to mesh) | false
         colors: { w: { color: '#f2f0ea' }, b: { color: '#222' }, n: { color: '#666' } },   // MeshStandardMaterial params
         pieceStyle: function (ctx, p, i) { return { color, emissive, scale, hide } },     // optional per-piece override
         heightOf: function (ctx, i) { return 0; },        // per-square y offset (towers, stepped platforms)
         squareVisible: function (ctx, i) { return true; },// e.g. hide squares holding a 'void' blocker
         camera: { theta: 0, phi: 0.95, dist: 11, target: [0, 0, 0], fov: 40 },   // spherical around target (radians)
         follow: function (ctx) { return squareIndex; },   // optional: camera target eases to that square
         background: '#05060a',       // or null for a transparent canvas (the page shows through)
         fog: { color: '#05060a', near: 12, far: 40 },
         highlights: true,            // selected square, legal targets, last move (chess.com colours)
         onFrame: function (S, dt, t) {}                    // per-frame callback for mode VFX
       }).then(function (S) { if (!S) return; ... });
     },
     onExit: function (ctx) { CM.scene3d.detach(); }       // also auto-detached when the game screen changes
   S (the scene handle): THREE, scene, camera, renderer, root (THREE.Group of everything board-related), canvas,
     sq2world(i, y) -> THREE.Vector3 (centre of the square's top face), setCamera({theta, phi, dist, target}, ms),
     rotate(dTheta, ms), sync(true) (force a rebuild after a hook mutated pieces), pieceMesh(t, c) (a fresh piece model),
     tween(fn(k), ms) (ease-out 0..1 driver), tex(url) (cached texture; null on file://), dispose().
   Motion: camera moves and piece slides are ease-out (~200 ms for pieces, configurable for the camera); with
   prefers-reduced-motion / animation off they snap. */
(function () {
  'use strict';
  var CM = window.CM;
  var cur = null, glOK = null;
  function supported() {
    if (glOK != null) return glOK;
    try { var c = document.createElement('canvas'); glOK = !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl'))); } catch (e) { glOK = false; }
    return glOK;
  }
  function ready() {
    if (window.THREE) return Promise.resolve(window.THREE);
    return CM.util.loadScript('js/vendor/three.min.js').then(function () { return window.THREE; });
  }
  function animMs() { return CM.settings && CM.settings.animMs ? CM.settings.animMs() : 200; }
  function easeOut(k) { return 1 - Math.pow(1 - k, 3); }

  /* ---- lathe-turned Staunton piece models (profile points: [radius, height], unit square = 1) ---- */
  var PROFILES = {
    P: [[0, 0], [.34, 0], [.34, .06], [.28, .1], [.2, .14], [.13, .3], [.11, .4], [.19, .43], [.12, .47], [.16, .55], [.17, .62], [.13, .7], [0, .73]],
    R: [[0, 0], [.36, 0], [.36, .07], [.29, .12], [.22, .18], [.19, .5], [.25, .55], [.27, .6], [.27, .78], [.2, .78], [.2, .72], [0, .72]],
    B: [[0, 0], [.35, 0], [.35, .06], [.28, .11], [.2, .16], [.12, .48], [.2, .51], [.13, .55], [.17, .65], [.17, .74], [.11, .86], [.05, .9], [.07, .93], [0, .96]],
    Q: [[0, 0], [.37, 0], [.37, .07], [.29, .12], [.21, .18], [.13, .58], [.22, .62], [.15, .66], [.24, .9], [.2, .93], [.12, .96], [.07, 1.0], [.08, 1.04], [0, 1.07]],
    K: [[0, 0], [.37, 0], [.37, .07], [.29, .12], [.21, .18], [.14, .62], [.23, .66], [.15, .7], [.22, .92], [.14, .96], [.06, .98], [.06, 1.05], [0, 1.05]],
    N: [[0, 0], [.35, 0], [.35, .06], [.28, .11], [.22, .16], [.2, .22], [0, .22]]
  };
  function pieceGeo(T, t) {
    var key = 'PRBQKN'.indexOf(t) >= 0 ? t : 'P', pts = PROFILES[key].map(function (p) { return new T.Vector2(p[0], p[1]); });
    var parts = [new T.LatheGeometry(pts, 28)];
    if (key === 'K') { parts.push(new T.BoxGeometry(.05, .2, .05).translate(0, 1.13, 0)); parts.push(new T.BoxGeometry(.16, .05, .05).translate(0, 1.14, 0)); }
    if (key === 'R') for (var k = 0; k < 4; k++) { var a = k * Math.PI / 2 + Math.PI / 4; parts.push(new T.BoxGeometry(.11, .1, .11).translate(Math.cos(a) * .2, .82, Math.sin(a) * .2)); }
    if (key === 'N') {   /* horse head: an extruded side silhouette on the turned base */
      var s = new T.Shape(); s.moveTo(-.18, .2); s.lineTo(.2, .2); s.lineTo(.16, .45); s.lineTo(.3, .58); s.lineTo(.32, .7); s.lineTo(.12, .86);
      s.lineTo(.02, .95); s.lineTo(-.04, .86); s.lineTo(-.16, .78); s.lineTo(-.22, .55); s.lineTo(-.18, .2);
      parts.push(new T.ExtrudeGeometry(s, { depth: .2, bevelEnabled: true, bevelSize: .03, bevelThickness: .03, bevelSegments: 2 }).translate(0, 0, -.1));
    }
    return parts;
  }
  function makePiece(S, t, c, style) {
    var T = S.THREE, g = new T.Group(), def = S.ctx.V.def(t) || {}, glyph = def.glyph || t;
    var mp = Object.assign({ color: c === 'w' ? '#f0eee8' : c === 'b' ? '#262421' : '#7a7a7a', roughness: .55, metalness: .05 }, (S.o.colors || {})[c] || {}, style || {});
    delete mp.scale; delete mp.hide;
    var mat = new T.MeshStandardMaterial(mp);
    pieceGeo(T, glyph).forEach(function (geo) { var m = new T.Mesh(geo, mat); m.castShadow = true; m.receiveShadow = true; g.add(m); });
    return g;
  }
  function makeSprite(S, p) {
    var T = S.THREE, url = S.ctx.game.pieceImage(p), tx = S.tex(url); if (!tx) return makePiece(S, p.t, p.c);
    var sp = new T.Sprite(new T.SpriteMaterial({ map: tx, transparent: true })); sp.scale.set(.9, .9, 1); sp.position.y = .45;
    var g = new T.Group(); g.add(sp); return g;
  }

  function attach(ctx, o) {
    detach();
    o = o || {};
    if (!supported()) return Promise.resolve(null);
    return ready().then(function (T) {
      if (!T || CM.gameUI.controller !== ctx.game) return null;
      var wrap = document.getElementById('board-wrap'); if (!wrap) return null;
      var renderer;
      try { renderer = new T.WebGLRenderer({ antialias: true, alpha: o.background == null, preserveDrawingBuffer: false }); } catch (e) { glOK = false; return null; }
      var S = { THREE: T, ctx: ctx, o: o, renderer: renderer, scene: new T.Scene(), root: new T.Group(), sqMeshes: [], pieces: {}, tweens: [], sig: '', texCache: {} };
      cur = S;
      renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
      renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFSoftShadowMap;
      renderer.outputColorSpace = T.SRGBColorSpace;
      var cv = S.canvas = renderer.domElement; cv.className = 'cm3d-canvas';
      cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;z-index:4;touch-action:none;display:block;border-radius:inherit';
      wrap.appendChild(cv); wrap.classList.add('cm3d-on');
      if (!document.getElementById('cm3d-css')) { var cs = document.createElement('style'); cs.id = 'cm3d-css'; cs.textContent = '.cm3d-on #board-stage{opacity:0}.cm3d-on #board-stage *{pointer-events:none}'; document.head.appendChild(cs); }
      if (o.background != null) S.scene.background = new T.Color(o.background);
      if (o.fog) S.scene.fog = new T.Fog(o.fog.color, o.fog.near, o.fog.far);
      S.scene.add(S.root);
      var cam = o.camera || {};
      S.camera = new T.PerspectiveCamera(cam.fov || 40, 1, 0.1, 400);
      var gg = ctx.V.geo, fit = Math.max(gg.files, gg.ranks) * 1.35 + 1.5;   /* default distance frames the whole board */
      S.cam = { theta: cam.theta || 0, phi: cam.phi != null ? cam.phi : 0.95, dist: cam.dist || fit, target: new T.Vector3().fromArray(cam.target || [0, 0, 0]) };
      if (o.lights !== false) {
        var hemi = new T.HemisphereLight(0xffffff, 0x444450, o.ambient != null ? o.ambient : 1.1); S.scene.add(hemi);
        var dl = S.sun = new T.DirectionalLight(0xffffff, o.sun != null ? o.sun : 1.6); dl.position.set(-6, 14, 8); dl.castShadow = true;
        dl.shadow.mapSize.set(1024, 1024); var sc = dl.shadow.camera; sc.left = -14; sc.right = 14; sc.top = 14; sc.bottom = -14; sc.far = 60; dl.shadow.bias = -0.0008;
        S.scene.add(dl); S.scene.add(dl.target);
      }
      var g = ctx.V.geo;
      S.sq2world = function (i, y) {
        var h = o.heightOf ? (o.heightOf(ctx, i) || 0) : 0;
        return new T.Vector3(g.col(i) - (g.files - 1) / 2, (y || 0) + h, g.row(i) - (g.ranks - 1) / 2);
      };
      S.tex = function (url) {
        if (!url || location.protocol === 'file:') return null;   /* file:// images taint WebGL: callers fall back to meshes */
        if (!S.texCache[url]) { var tx = new T.TextureLoader().load(url); tx.colorSpace = T.SRGBColorSpace; S.texCache[url] = tx; }
        return S.texCache[url];
      };
      S.tween = function (fn, ms) { if (!ms || animMs() === 0) { fn(1); return; } S.tweens.push({ fn: fn, t0: performance.now(), ms: ms }); };
      S.setCamera = function (c, ms) {
        var a = { theta: S.cam.theta, phi: S.cam.phi, dist: S.cam.dist, target: S.cam.target.clone() };
        var b = { theta: c.theta != null ? c.theta : a.theta, phi: c.phi != null ? c.phi : a.phi, dist: c.dist != null ? c.dist : a.dist, target: c.target ? new T.Vector3().fromArray(c.target.toArray ? c.target.toArray() : c.target) : a.target };
        S.tween(function (k) { S.cam.theta = a.theta + (b.theta - a.theta) * k; S.cam.phi = a.phi + (b.phi - a.phi) * k; S.cam.dist = a.dist + (b.dist - a.dist) * k; S.cam.target.lerpVectors(a.target, b.target, k); }, ms == null ? 600 : ms);
      };
      S.rotate = function (d, ms) { S.setCamera({ theta: S.cam.theta + d }, ms == null ? 500 : ms); };
      S.pieceMesh = function (t, c) { return makePiece(S, t, c); };
      S.add = function (obj) { S.root.add(obj); return obj; };
      S.sync = function (force) { if (force) S.sig = ''; syncNow(S); };
      S.dispose = function () { detach(S); };
      buildBoard(S);
      /* raycast taps -> engine */
      var ray = new T.Raycaster(), down = null;
      cv.addEventListener('pointerdown', function (e) { down = { x: e.clientX, y: e.clientY }; });
      cv.addEventListener('pointerup', function (e) {
        if (!down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 8) { down = null; return; } down = null;
        var r = cv.getBoundingClientRect(), v = new T.Vector2((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1);
        ray.setFromCamera(v, S.camera);
        var hits = ray.intersectObjects(S.root.children, true), i = -1;
        for (var k = 0; k < hits.length && i < 0; k++) { var ob = hits[k].object; while (ob && ob.userData.sq == null) ob = ob.parent; if (ob && ob.visible !== false) i = ob.userData.sq; }
        if (i >= 0 && ctx.game && ctx.game.onTap) ctx.game.onTap(i, {});
      });
      var ro = window.ResizeObserver ? new ResizeObserver(function () { resize(S); }) : null; if (ro) ro.observe(wrap); S.ro = ro;
      resize(S); syncNow(S);
      var last = performance.now();
      (function loop(now) {
        if (cur !== S) return;
        if (CM.gameUI.controller !== ctx.game) { detach(S); return; }
        var dt = Math.min(0.1, (now - last) / 1000); last = now;
        S.tweens = S.tweens.filter(function (tw) { var k = Math.min(1, (now - tw.t0) / tw.ms); tw.fn(easeOut(k)); return k < 1; });
        syncNow(S);
        if (o.follow) { var fi = o.follow(ctx); if (fi != null && fi >= 0) S.cam.target.lerp(S.sq2world(fi), animMs() ? Math.min(1, dt * 4) : 1); }
        if (o.onFrame) try { o.onFrame(S, dt, now); } catch (err) { console.warn('[scene3d] onFrame', err); }
        placeCamera(S); renderer.render(S.scene, S.camera);
        S.raf = requestAnimationFrame(loop);
      })(last);
      return S;
    }).catch(function (e) { console.warn('[scene3d] 3D unavailable, keeping the 2D board:', e && e.message); detach(); return null; });
  }
  function placeCamera(S) {
    var c = S.cam, T = S.THREE, sp = new T.Spherical(c.dist, c.phi, c.theta);
    S.camera.position.setFromSpherical(sp).add(c.target); S.camera.lookAt(c.target);
    if (S.sun) { S.sun.position.copy(c.target).add(new T.Vector3(-6, 14, 8)); S.sun.target.position.copy(c.target); }
  }
  function resize(S) {
    var r = S.canvas.parentNode.getBoundingClientRect(), w = Math.max(1, r.width), h = Math.max(1, r.height);
    S.renderer.setSize(w, h, false); S.camera.aspect = w / h; S.camera.updateProjectionMatrix();
  }
  function buildBoard(S) {
    var o = S.o, b = o.board; if (b === false) return;
    var T = S.THREE, g = S.ctx.V.geo, th = (b && b.thickness) || 0.3, spec = S.ctx.spec, sb = spec.board || {}, thm = spec.theme || {};
    var light = (b && b.light) || thm.light || sb.light || '#ebecd0', dark = (b && b.dark) || thm.dark || sb.dark || '#739552';
    var edge = new T.MeshStandardMaterial({ color: (b && b.edge) || '#1d1b18', roughness: .9 });
    var mL = new T.MeshStandardMaterial({ color: light, roughness: .85 }), mD = new T.MeshStandardMaterial({ color: dark, roughness: .85 });
    var geo = new T.BoxGeometry(1, th, 1);
    for (var i = 0; i < g.size; i++) {
      if (!g.valid[i]) continue;
      var top = (g.col(i) + g.row(i)) % 2 === 0 ? mL : mD;
      var m = new T.Mesh(geo, [edge, edge, top, edge, edge, edge]); m.receiveShadow = true; m.castShadow = !!(b && b.castShadow);
      m.position.copy(S.sq2world(i, -th / 2)); m.userData.sq = i; S.root.add(m); S.sqMeshes[i] = m;
    }
    S.hlGeo = new T.PlaneGeometry(.98, .98).rotateX(-Math.PI / 2);
  }
  function hl(S, i, color, op, kind) {
    var T = S.THREE, m;
    if (kind === 'dot') m = new T.Mesh(new T.CircleGeometry(.16, 24).rotateX(-Math.PI / 2), new T.MeshBasicMaterial({ color: '#000', transparent: true, opacity: .2, depthWrite: false }));
    else if (kind === 'ring') m = new T.Mesh(new T.RingGeometry(.38, .48, 32).rotateX(-Math.PI / 2), new T.MeshBasicMaterial({ color: '#000', transparent: true, opacity: .2, depthWrite: false }));
    else m = new T.Mesh(S.hlGeo, new T.MeshBasicMaterial({ color: color, transparent: true, opacity: op, depthWrite: false }));
    m.position.copy(S.sq2world(i, .004)); m.userData.sq = i; return m;
  }
  function syncNow(S) {
    var ctx = S.ctx, G = ctx.game, st = G.state; if (!st) return;
    var sig = [G.history ? G.history.length : 0, G.sel, G.over ? 1 : 0, st.turn, st.b.map(function (p) { return p ? p.t + p.c : '' }).join(',')].join('|');
    if (sig === S.sig) return;
    var T = S.THREE, o = S.o, g = ctx.V.geo, prev = S.pieces, prevSig = S.sig; S.sig = sig;
    if (S.hlGroup) S.root.remove(S.hlGroup);
    var hg = S.hlGroup = new T.Group(); S.root.add(hg);
    if (o.squareVisible) S.sqMeshes.forEach(function (m, i) { if (m) m.visible = o.squareVisible(ctx, i) !== false; });
    if (o.heightOf) S.sqMeshes.forEach(function (m, i) { if (m) m.position.copy(S.sq2world(i, -((o.board && o.board.thickness) || .3) / 2)); });
    if (o.highlights !== false) {
      var L = G.last; if (L && L.f >= 0 && CM.settings.get('lastMove')) { hg.add(hl(S, L.f, '#ffff33', .42)); hg.add(hl(S, L.t, '#ffff33', .42)); }
      if (G.sel >= 0) { hg.add(hl(S, G.sel, '#ffff33', .5)); (G.moves || []).forEach(function (m) { if (m.f === G.sel) hg.add(hl(S, m.t, null, 0, m.cap ? 'ring' : 'dot')); }); }
    }
    if (o.pieces === false) return;
    var next = {}, moved = G.last && prevSig && G.last.f >= 0 ? G.last : null;
    st.b.forEach(function (p, i) {
      if (!p) return;
      var d = ctx.V.def(p.t) || {};
      if (d.blocker && !o.drawBlockers) return;
      var style = o.pieceStyle ? o.pieceStyle(ctx, p, i) : null; if (style && style.hide) return;
      var key = i + ':' + p.t + p.c + (style ? JSON.stringify(style) : '');
      var obj = prev[key]; delete prev[key];
      if (!obj) { obj = (o.pieces === 'sprite' ? makeSprite(S, p) : makePiece(S, p.t, p.c, style)); obj.userData.sq = i; if (style && style.scale) obj.scale.setScalar(style.scale); if (p.c === 'b' || (ctx.human === 'b' && p.c === 'w')) obj.rotation.y = Math.PI; S.root.add(obj); }
      var to = S.sq2world(i); obj.position.copy(to);
      if (moved && moved.t === i && obj.userData.fresh !== false) {
        var from = S.sq2world(moved.f), ms = animMs(), dist = from.distanceTo(to);
        S.tween(function (k) { obj.position.lerpVectors(from, to, k); obj.position.y = from.y + (to.y - from.y) * k + Math.sin(k * Math.PI) * Math.min(.6, dist * .08); }, ms);
      }
      obj.userData.fresh = false; next[key] = obj;
    });
    Object.keys(prev).forEach(function (k) { S.root.remove(prev[k]); });
    S.pieces = next;
  }
  function detach(S) {
    var s = S || cur; if (!s) return; if (cur === s) cur = null;
    cancelAnimationFrame(s.raf); if (s.ro) s.ro.disconnect();
    var wrap = document.getElementById('board-wrap'); if (wrap) wrap.classList.remove('cm3d-on');
    if (s.canvas && s.canvas.parentNode) s.canvas.parentNode.removeChild(s.canvas);
    try { s.scene.traverse(function (ob) { if (ob.geometry) ob.geometry.dispose(); }); s.renderer.dispose(); s.renderer.forceContextLoss && s.renderer.forceContextLoss(); } catch (e) { /* ignore */ }
  }
  CM.scene3d = { supported: supported, ready: ready, attach: attach, detach: function () { detach(); }, current: function () { return cur; } };
})();
