/* view3d (ov-3d, 2026-11-25): a real-3D view that WRAPS an ordinary board mode, on the shared CM.scene3d module
   (ARCHITECTURE section 14). Used by the modes whose video is a 3D game but whose mode was drawn 2D: Chess Ultimate x12,
   Roblox x3, Battle Chess, FPS Chess x2, The Fly, Hyper Chess, Beyond the Board: Abyss, Petrified Pawns.

   How it wraps: the mode's rules, hooks and 2D board are untouched. The 2D board keeps rendering underneath (invisible,
   still clickable by script); this file captures the exact model the 2D board is drawn from (CM.gameUI.board.render:
   piece art after hooks.visible / decorate / fog, square classes, decoration html) and mirrors it in 3D, so ghosts stay
   hidden, Jesters keep their King disguise, Giants draw 2x2, HP bars, fog, tints and highlights all follow the game.
   Taps on the canvas are raycast to a square (scene3d) and go to the normal SpecGame.onTap. The board's VFX layer
   (#board-fx: overlays, banners, meters) is lifted above the canvas while the view is on and put back on detach.

   Usage (mode file):  hooks: { extends: '<lib>', onStart: function (ctx) { base onStart; CM.util.loadScript('js/fx/view3d.js')
     .then(function () { CM.view3d.attach(ctx, '<preset>'); }); }, onExit: function (ctx) { if (CM.view3d) CM.view3d.detach(); base onExit } }
   Presets are at the bottom (one per video look). No WebGL -> scene3d resolves null and the 2D board stays (fallback).
   Motion: the camera eases in from a higher orbit (900 ms) and pieces slide ~200 ms ease-out with a small arc; both snap
   under prefers-reduced-motion / animation off (scene3d's tween). */
(function () {
  'use strict';
  var CM = window.CM;
  var cur = null;

  function animOn() { return !!(CM.settings && CM.settings.animMs && CM.settings.animMs()); }

  /* ---- textures: any image (png/jpg/svg) drawn into a square canvas, optional badge / dim ---- */
  var imgCache = {};
  function loadImg(url) {
    if (!imgCache[url]) imgCache[url] = new Promise(function (res) { var im = new Image(); im.onload = function () { res(im); }; im.onerror = function () { res(null); }; im.src = url; });
    return imgCache[url];
  }
  function canvasTex(V, url, opt) {
    var key = url + '|' + JSON.stringify(opt || {}); if (V.tex[key]) return V.tex[key];
    var T = V.S.THREE, cv = document.createElement('canvas'), N = (opt && opt.size) || 256; cv.width = cv.height = N;
    var tx = new T.CanvasTexture(cv); tx.colorSpace = T.SRGBColorSpace; tx.anisotropy = 4; V.tex[key] = tx;
    loadImg(url).then(function (im) {
      if (!im || !V.S) return; var g = cv.getContext('2d'), w = im.naturalWidth || N, h = im.naturalHeight || N, s = Math.min(N / w, N / h);
      if (opt && opt.cover) s = Math.max(N / w, N / h);
      g.clearRect(0, 0, N, N); if (opt && opt.dim) g.filter = 'saturate(.35) brightness(.8)';
      g.drawImage(im, (N - w * s) / 2, (N - h * s) / 2, w * s, h * s); g.filter = 'none';
      if (opt && opt.badge) { g.font = '900 ' + (N * .26) + 'px system-ui,sans-serif'; g.textAlign = 'right'; g.textBaseline = 'bottom'; g.lineWidth = N * .04; g.strokeStyle = '#000'; g.fillStyle = '#fff'; g.strokeText(opt.badge, N * .97, N * .99); g.fillText(opt.badge, N * .97, N * .99); }
      tx.needsUpdate = true;
    });
    return tx;
  }
  function textTex(V, text, color, bg) {
    var key = 'txt|' + text + color + bg; if (V.tex[key]) return V.tex[key];
    var T = V.S.THREE, cv = document.createElement('canvas'); cv.width = 256; cv.height = 96; var g = cv.getContext('2d');
    if (bg) { g.fillStyle = bg; g.fillRect(0, 0, 256, 96); }
    g.font = '900 64px system-ui,sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineWidth = 8; g.strokeStyle = '#000'; g.fillStyle = color || '#fff';
    g.strokeText(text, 128, 50); g.fillText(text, 128, 50);
    var tx = new T.CanvasTexture(cv); tx.colorSpace = T.SRGBColorSpace; V.tex[key] = tx; return tx;
  }
  function attr(html, re) { var m = re.exec(html); return m ? m[1] : null; }

  /* ---- one square's 3D content from the 2D model ---- */
  function hlPlane(V, i, color, op, y, size) {
    var T = V.S.THREE, m = new T.Mesh(new T.PlaneGeometry(size || .98, size || .98).rotateX(-Math.PI / 2), new T.MeshBasicMaterial({ color: color, transparent: true, opacity: op, depthWrite: false }));
    m.position.copy(V.S.sq2world(i, y || .006)); m.userData.sq = i; m.renderOrder = 2; return m;
  }
  function marker(V, i, kind) {
    var T = V.S.THREE, P = V.P, m;
    if (kind === 'dot') m = new T.Mesh(new T.CircleGeometry(.16, 24).rotateX(-Math.PI / 2), new T.MeshBasicMaterial({ color: P.dotColor || '#000', transparent: true, opacity: P.dotOpacity || .25, depthWrite: false }));
    else m = new T.Mesh(new T.RingGeometry(.38, .48, 32).rotateX(-Math.PI / 2), new T.MeshBasicMaterial({ color: P.dotColor || '#000', transparent: true, opacity: P.dotOpacity || .25, depthWrite: false }));
    m.position.copy(V.S.sq2world(i, .012)); m.userData.sq = i; m.renderOrder = 3; return m;
  }
  function spriteObj(V, url, opt, scale, lift) {
    var T = V.S.THREE, sp = new T.Sprite(new T.SpriteMaterial({ map: canvasTex(V, url, opt), transparent: true, alphaTest: .05 }));
    sp.scale.set(scale, scale, 1); sp.position.y = lift; sp.castShadow = true; return sp;
  }
  function makePieceObj(V, i, sqm, p) {
    var S = V.S, T = S.THREE, P = V.P, d = (p && S.ctx.V.def(p.t)) || {}, g = new T.Group(), pc = sqm.piece;
    var dim = /pc--dead/.test(pc.cls || '') || /g4cu-zz/.test(sqm.cls || '');
    var custom = d.img || (pc.src && !/assets\/pieces\//.test(pc.src));
    var useSprite = location.protocol !== 'file:' && (P.pieces === 'sprite' || (P.pieces === 'auto' && custom));
    if (useSprite) {
      var sc = (P.spriteScale || .95) * (d.royal && P.kingScale ? P.kingScale : 1);
      g.add(spriteObj(V, pc.src, { badge: pc.badge || null, dim: dim }, sc, P.spriteLift != null ? P.spriteLift : sc / 2));
      if (P.shadowDisc !== false) { var sh = new T.Mesh(new T.CircleGeometry(.3, 20).rotateX(-Math.PI / 2), new T.MeshBasicMaterial({ color: '#000', transparent: true, opacity: .22, depthWrite: false })); sh.position.y = .008; g.add(sh); }
    } else {
      var c = p ? p.c : 'w', st = Object.assign({}, (P.colors || {})[c] || {});
      if (dim) st.color = '#777';
      var m = S.pieceMesh(d.glyph || (p && p.t) || 'P', c); /* scene3d's lathe Staunton set */
      m.traverse(function (o) { if (o.material) { o.material = o.material.clone(); Object.keys(st).forEach(function (k) { if (k === 'color' || k === 'emissive') o.material[k] = new T.Color(st[k]); else o.material[k] = st[k]; }); } });
      if (P.meshScale) m.scale.setScalar(P.meshScale);
      g.add(m);
      if (c === 'b' || (S.ctx.human === 'b' && c === 'w')) m.rotation.y = Math.PI;
      if (pc.badge) { var bs = new T.Sprite(new T.SpriteMaterial({ map: textTex(V, String(pc.badge), '#fff'), transparent: true, depthTest: false })); bs.scale.set(.5, .19, 1); bs.position.set(.25, 1.2, 0); g.add(bs); }
    }
    g.userData.sq = i; return g;
  }
  function decorObjs(V, i, sqm, p, out) {
    var S = V.S, T = S.THREE, html = sqm.html || '', cls = sqm.cls || '';
    if (/is-fog/.test(cls)) out.push(hlPlane(V, i, '#000', .55, .02));
    if (/g4cu-goop/.test(cls)) out.push(hlPlane(V, i, '#6ebe3c', .45, .008));
    var tint = attr(html, /class="sq-tint"[^>]*style="background:([^";]+)/); if (tint) out.push(hlPlane(V, i, tint, .5, .007));
    var zimg = attr(html, /<img class="sq-tint"[^>]*src="([^"]+)"/);
    if (zimg && location.protocol !== 'file:') { var zm = new T.Mesh(new T.PlaneGeometry(.98, .98).rotateX(-Math.PI / 2), new T.MeshBasicMaterial({ map: canvasTex(V, zimg, { cover: true, size: 128 }), transparent: true })); zm.position.copy(S.sq2world(i, .005)); zm.userData.sq = i; out.push(zm); }
    if (/g4cu-halo/.test(html)) { var ring = new T.Mesh(new T.TorusGeometry(.26, .035, 8, 28).rotateX(Math.PI / 2), new T.MeshBasicMaterial({ color: '#ffd84a' })); ring.position.copy(S.sq2world(i, (V.P.spriteScale || .95) + .08)); ring.userData.sq = i; out.push(ring); }
    var giant = attr(html, /<img class="g4cu-giant"[^>]*src="([^"]+)"/);
    if (giant) {   /* Chess Ultimate Giant: one double-size token over its 2x2 block */
      var w = +(attr(html, /width:(\d+)%/) || 200) / 100, h = +(attr(html, /height:(\d+)%/) || 200) / 100, fl = S.ctx.game.flipped && S.ctx.game.flipped();
      var a = S.sq2world(i), sp = spriteObj(V, giant, {}, 1.7, .85), grp = new T.Group(); grp.add(sp);
      grp.position.set(a.x + (fl ? -1 : 1) * (w - 1) / 2, a.y, a.z + (fl ? -1 : 1) * (h - 1) / 2); grp.userData.sq = i; out.push(grp);
    }
    var hm = /pp-hp pp-hp--(\w)"><i style="width:(\d+)%/.exec(html);
    if (hm) {   /* Petrified Pawns HP bar over the unit (green = yours, red = monsters) */
      var bg = new T.Sprite(new T.SpriteMaterial({ color: '#111', depthTest: false })), fg = new T.Sprite(new T.SpriteMaterial({ color: hm[1] === S.ctx.human ? '#3fd14b' : '#e03b2f', depthTest: false }));
      var fr = Math.max(0, +hm[2] / 100), y = (V.P.spriteScale || .95) + .12, base = S.sq2world(i, y);
      bg.scale.set(.7, .08, 1); bg.position.copy(base); fg.scale.set(.66 * fr, .05, 1); fg.position.copy(base); fg.position.x -= .33 * (1 - fr);
      bg.renderOrder = 8; fg.renderOrder = 9; bg.userData.sq = fg.userData.sq = i; out.push(bg, fg);
    }
    if (/pp-fire/.test(html)) { var f = hlPlane(V, i, '#ff7a1a', .6, .01); out.push(f); }
    if (/pp-spk/.test(html)) { var up = /pp-spk up/.test(html); for (var k = 0; k < 4; k++) { var cn = new T.Mesh(new T.ConeGeometry(.08, up ? .3 : .08, 8), new T.MeshStandardMaterial({ color: '#9aa0a8', metalness: .6, roughness: .4 })); var pp = S.sq2world(i, up ? .15 : .04); cn.position.set(pp.x + (k % 2 ? .2 : -.2), pp.y, pp.z + (k > 1 ? .2 : -.2)); cn.userData.sq = i; out.push(cn); } }
    var nova = attr(html, /pp-nova">(\d+)</); if (nova != null) { var ns = new T.Sprite(new T.SpriteMaterial({ map: textTex(V, nova, '#ffd84a'), transparent: true, depthTest: false })); ns.scale.set(.6, .22, 1); ns.position.copy(S.sq2world(i, .5)); ns.userData.sq = i; out.push(ns); }
    var mk = attr(html, /<img class="pp-door-mk"[^>]*src="([^"]+)"/); if (mk && location.protocol !== 'file:') { var ms = spriteObj(V, mk, {}, .45, 1.15); ms.userData.sq = i; var mg = new T.Group(); mg.add(ms); mg.position.copy(S.sq2world(i)); mg.userData.sq = i; out.push(mg); }
    if (V.P.decor) V.P.decor(V, i, sqm, p, out);
  }
  function blockerObj(V, i, sqm, p) {
    var S = V.S, T = S.THREE, P = V.P, d = S.ctx.V.def(p.t) || {};
    if (P.blocker) { var o = P.blocker(V, i, sqm, p, d); if (o !== undefined) return o; }
    var src = sqm.piece && sqm.piece.src, mats;
    var side = new T.MeshStandardMaterial({ color: P.wallColor || '#8d8d8d', roughness: .9 });
    if (src && location.protocol !== 'file:') { var top = new T.MeshStandardMaterial({ map: canvasTex(V, src, { cover: true, size: 128 }), roughness: .9 }); mats = P.wallTexTop ? [side, side, top, side, side, side] : top; } else mats = side;
    var hgt = P.wallHeight || .6, m = new T.Mesh(new T.BoxGeometry(.98, hgt, .98), mats); m.castShadow = m.receiveShadow = true;
    m.position.copy(S.sq2world(i, hgt / 2)); m.userData.sq = i; return m;
  }

  function rebuild(V) {
    var S = V.S, T = S.THREE, G = S.ctx.game, model = V.cap.model, st = G.state; if (!model || !st) return;
    if (V.layer) S.root.remove(V.layer);
    var L = V.layer = new T.Group(); S.root.add(L);
    var P = V.P, prev = V.pieces, next = {}, last = G.last, lc = P.lastColor || '#ffff33', lo = P.lastOpacity || .45, sqs = model.squares || [];
    for (var i = 0; i < sqs.length; i++) {
      var q = sqs[i]; if (!q || q.valid === false) continue;
      var cls = q.cls || '', p = st.b[i], d = p ? (S.ctx.V.def(p.t) || {}) : {}, out = [];
      if (/is-last/.test(cls)) out.push(hlPlane(V, i, lc, lo));
      if (/is-sel/.test(cls)) out.push(hlPlane(V, i, lc, Math.min(1, lo + .12)));
      if (/is-premove/.test(cls)) out.push(hlPlane(V, i, '#f45d48', .45));
      if (/is-check/.test(cls)) out.push(hlPlane(V, i, '#ff2a2a', .55, .009, .9));
      if (/is-target-cap/.test(cls)) out.push(marker(V, i, 'ring')); else if (/is-target/.test(cls)) out.push(marker(V, i, 'dot'));
      decorObjs(V, i, q, p, out);
      out.forEach(function (o) { L.add(o); });
      if (p && d.blocker) { var bk = 'blk' + i + p.t; var bo = prev[bk] || blockerObj(V, i, q, p); delete prev[bk]; if (bo) { if (!bo.parent) S.root.add(bo); next[bk] = bo; } continue; }
      if (!q.piece || (P.hidePiece && P.hidePiece(p))) continue;
      var id = q.piece.key + '|' + q.piece.src + '|' + (q.piece.badge || '') + '|' + (/pc--dead|g4cu-zz/.test((q.piece.cls || '') + cls) ? 'd' : '');
      var key = i + '#' + id, obj = prev[key]; delete prev[key];
      if (!obj && last && last.t === i && last.f >= 0) { var fk = last.f + '#' + id; if (prev[fk]) { obj = prev[fk]; delete prev[fk]; slide(V, obj, last.f, i); } }
      if (!obj) { obj = makePieceObj(V, i, q, p); S.root.add(obj); obj.position.copy(S.sq2world(i)); }
      else if (!obj.userData.sliding) obj.position.copy(S.sq2world(i));
      obj.userData.sq = i; obj.traverse(function (o) { o.userData.sq = i; });
      next[key] = obj;
    }
    Object.keys(prev).forEach(function (k) { S.root.remove(prev[k]); });
    V.pieces = next;
  }
  function slide(V, obj, f, t) {
    var S = V.S, a = S.sq2world(f), b = S.sq2world(t), dist = a.distanceTo(b); obj.userData.sliding = true;
    S.tween(function (k) { obj.position.lerpVectors(a, b, k); obj.position.y = a.y + (b.y - a.y) * k + Math.sin(k * Math.PI) * Math.min(.6, dist * .08); if (k >= 1) obj.userData.sliding = false; }, (CM.settings.animMs && CM.settings.animMs()) || 0);
    if (!animOn()) obj.userData.sliding = false;
  }

  /* ---- scenery helpers shared by presets ---- */
  function boardFrame(S, color, w, h, opt) {   /* a raised frame (rim) around the board */
    var T = S.THREE, g = S.ctx.V.geo, W = g.files, D = g.ranks, m = new T.MeshStandardMaterial(Object.assign({ color: color, roughness: .6 }, opt || {})), grp = new T.Group();
    [[W + 2 * w, w, 0, -(D + w) / 2], [W + 2 * w, w, 0, (D + w) / 2], [w, D, -(W + w) / 2, 0], [w, D, (W + w) / 2, 0]].forEach(function (r) {
      var b = new T.Mesh(new T.BoxGeometry(r[0], h, r[1]), m); b.position.set(r[2], h / 2 - .3, r[3]); b.castShadow = b.receiveShadow = true; grp.add(b);
    });
    S.root.add(grp); return grp;
  }
  function slab(S, color, w, d, h, y, opt) { var T = S.THREE, m = new T.Mesh(new T.BoxGeometry(w, h, d), new T.MeshStandardMaterial(Object.assign({ color: color, roughness: .85 }, opt || {}))); m.position.y = y; m.receiveShadow = m.castShadow = true; S.root.add(m); return m; }
  function ground(S, color, size, y, opt) { var T = S.THREE, m = new T.Mesh(new T.PlaneGeometry(size, size).rotateX(-Math.PI / 2), new T.MeshStandardMaterial(Object.assign({ color: color, roughness: 1 }, opt || {}))); m.position.y = y; m.receiveShadow = true; S.scene.add(m); return m; }
  function cloud(S, x, y, z, s) { var T = S.THREE, g = new T.Group(), m = new T.MeshStandardMaterial({ color: '#ffffff', roughness: 1, emissive: '#cfd8e8', emissiveIntensity: .35 });
    [[0, 0, 0, 1], [1, .1, .2, .8], [-1, .05, -.1, .75], [.4, .45, 0, .7]].forEach(function (b) { var sp = new T.Mesh(new T.SphereGeometry(b[3], 14, 10), m); sp.position.set(b[0], b[1], b[2]); g.add(sp); });
    g.position.set(x, y, z); g.scale.setScalar(s); S.scene.add(g); return g; }
  function gradientBg(S, top, bottom) {
    var T = S.THREE, cv = document.createElement('canvas'); cv.width = 4; cv.height = 256; var g = cv.getContext('2d'), gr = g.createLinearGradient(0, 0, 0, 256);
    gr.addColorStop(0, top); gr.addColorStop(1, bottom); g.fillStyle = gr; g.fillRect(0, 0, 4, 256);
    var tx = new T.CanvasTexture(cv); tx.colorSpace = T.SRGBColorSpace; S.scene.background = tx;
  }
  function spriteAt(V, url, x, y, z, w, h) { var T = V.S.THREE; if (location.protocol === 'file:') return null; var sp = new T.Sprite(new T.SpriteMaterial({ map: canvasTex(V, url, { size: 512 }), transparent: true })); sp.scale.set(w, h || w, 1); sp.position.set(x, y, z); V.S.root.add(sp); return sp; }

  /* ---- attach / detach ---- */
  function attach(ctx, name, extra) {
    detach();
    var P = Object.assign({}, PRESETS[name] || {}, extra || {}); P.name = name;
    var G = ctx.game, B = CM.gameUI && CM.gameUI.board; if (!G || !B) return Promise.resolve(null);
    var V = { P: P, tex: {}, pieces: {}, cap: { model: null, n: 0 }, seen: -1 }; cur = V;
    /* capture the 2D board's model (runtime wrapper, removed on detach; the 2D renderer itself is unchanged) */
    var orig = B.render; V.restore = function () { if (B.render === wrapped) B.render = orig; };
    var wrapped = function (model) { V.cap.model = model; V.cap.n++; return orig.apply(this, arguments); };
    B.render = wrapped;
    var fl = G.flipped && G.flipped(), cam = Object.assign({ theta: 0, phi: .8, fov: 40 }, P.camera || {}), gg = ctx.V.geo;
    if (!cam.dist) cam.dist = (Math.max(gg.files, gg.ranks) * 1.35 + 1.5) * (cam.fit || 1.15);
    V.flip = !!fl; V.cam = cam;
    cam.theta = (cam.theta || 0) + (fl ? Math.PI : 0);
    var start = Object.assign({}, cam, { phi: Math.max(.12, cam.phi - .45), dist: cam.dist * 1.25 });
    return CM.scene3d.attach(ctx, {
      board: P.board == null ? {} : P.board, pieces: false, highlights: false, camera: animOn() ? start : cam,
      background: P.background === undefined ? '#000' : P.background, fog: P.fog, ambient: P.ambient, sun: P.sun, heightOf: P.heightOf,
      squareVisible: P.squareVisible,
      onFrame: function (S, dt, now) {
        if (cur !== V) return;
        var f2 = !!(G.flipped && G.flipped()); if (f2 !== V.flip) { V.flip = f2; S.setCamera({ theta: (V.cam.theta || 0) - (fl ? Math.PI : 0) + (f2 ? Math.PI : 0) }, 700); }   /* Flip button: the camera swings round */
        if (V.cap.n !== V.seen) { V.seen = V.cap.n; try { rebuild(V); } catch (e) { console.warn('[view3d] rebuild', e); } }
        if (P.onFrame) P.onFrame(V, dt, now);
      }
    }).then(function (S) {
      if (!S || cur !== V) { V.restore(); if (cur === V) cur = null; return null; }
      V.S = S; S.view3d = V;
      if (S.sun && P.sunColor) S.sun.color = new S.THREE.Color(P.sunColor);
      if (P.scenery) try { P.scenery(V, S, S.THREE); } catch (e) { console.warn('[view3d] scenery', e); }
      if (animOn()) S.setCamera(cam, 900);
      /* lift the VFX layer (#board-fx) above the canvas while 3D is on */
      var fx = document.getElementById('board-fx'), wrap = document.getElementById('board-wrap');
      if (fx && wrap) { V.fxHome = fx.parentNode; V.fxNext = fx.nextSibling; wrap.appendChild(fx); fx.style.zIndex = '6'; V.fx = fx; }
      if (wrap) wrap.classList.add('v3d-on');
      G.render();   /* first model capture */
      return S;
    }).catch(function (e) { console.warn('[view3d] 3D unavailable, keeping the 2D board:', e && e.message); detach(); return null; });
  }
  function detach() {
    var V = cur; if (!V) return; cur = null;
    if (V.restore) V.restore();
    if (V.fx && V.fxHome) { V.fx.style.zIndex = ''; V.fxHome.insertBefore(V.fx, V.fxNext && V.fxNext.parentNode === V.fxHome ? V.fxNext : null); }
    var wrap = document.getElementById('board-wrap'); if (wrap) wrap.classList.remove('v3d-on');
    if (V.S && CM.scene3d.current() === V.S) CM.scene3d.detach();
  }
  /* scene3d detaches itself when the game screen changes; make sure our wrapper goes too */
  setInterval(function () { if (cur && cur.S && CM.scene3d.current() !== cur.S) detach(); }, 1000);

  /* ======================= presets: one per video look (frames under /workspace/work/ov_3d_shots/ref, notes in
     research/polish_report.md 'ov-3d') ======================= */
  var PRESETS = {
    /* Chess Ultimate (Steam): grey stone tiles on a grassy floating island in a pale sky, cartoon characters standing on
       the tiles (the cut character art as billboards), seen from high behind the player (frames dKBSZUzVQ1E 3, Cxttt 3). */
    cu: {
      board: { light: '#a9adae', dark: '#86898b', edge: '#6d6f70', thickness: .32 }, pieces: 'sprite', spriteScale: 1.0,
      camera: { phi: .6, fov: 42, fit: 1.3 }, background: '#cfeefb', ambient: 1.25, sun: 1.5, lastColor: '#ffe14a', lastOpacity: .55, dotColor: '#2a2a2a',
      scenery: function (V, S, T) {
        gradientBg(S, '#7cc6f0', '#e3f6fd');
        var g = S.ctx.V.geo, R = Math.max(g.files, g.ranks) * .78 + 1.6;
        var top = new T.Mesh(new T.CylinderGeometry(R, R * .96, .7, 40), new T.MeshStandardMaterial({ color: '#58a03a', roughness: 1 })); top.position.y = -.68; top.receiveShadow = true; S.root.add(top);
        var rock = new T.Mesh(new T.ConeGeometry(R * .95, R * 1.3, 40), new T.MeshStandardMaterial({ color: '#7a5b3e', roughness: 1 })); rock.rotation.x = Math.PI; rock.position.y = -1.03 - R * .65; S.root.add(rock);
        slab(S, '#8a7b66', g.files + .5, g.ranks + .5, .3, -.33);
        for (var h = 0; h < g.size; h++) if (!g.valid[h]) {   /* the map's holes (board.holes) are black pits in the stone */
          var pit = new T.Mesh(new T.BoxGeometry(1, .34, 1), new T.MeshBasicMaterial({ color: '#0b0b0d' })); pit.position.copy(S.sq2world(h, -.15)); S.root.add(pit);
        }
        [[-R * .7, -R * .5], [R * .72, R * .35], [R * .55, -R * .6], [-R * .6, R * .55]].forEach(function (p, k) {   /* the island's red-capped mushrooms */
          var st = new T.Mesh(new T.CylinderGeometry(.12, .15, .45, 10), new T.MeshStandardMaterial({ color: '#f3ead8' })); st.position.set(p[0], -.1, p[1]);
          var cap = new T.Mesh(new T.SphereGeometry(.38, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), new T.MeshStandardMaterial({ color: '#d8342c', roughness: .6 })); cap.position.set(p[0], .1, p[1]);
          S.root.add(st); S.root.add(cap);
        });
        cloud(S, -R * 1.6, -2, -R * 1.2, 1.4); cloud(S, R * 1.7, -3, -R * .4, 1.7); cloud(S, -R * 1.2, -5, R * 1.3, 1.6); cloud(S, R, 2, -R * 2.2, 1.3);
      },
      blocker: function (V, i, sqm, p, d) {   /* Chess Ultimate pits: a black hole in the stone instead of a tile */
        var S = V.S, T = S.THREE; if (S.sqMeshes[i]) S.sqMeshes[i].visible = false;
        var m = new T.Mesh(new T.CylinderGeometry(.44, .44, .3, 28), new T.MeshBasicMaterial({ color: '#0b0b0d' })); m.position.copy(S.sq2world(i, -.14)); m.userData.sq = i; return m;
      }
    },
    /* Roblox Chess (jXOg1Py4EoA): grey / slate checker slab floating on a grassy plate over a sea of clouds, blocky white and
       black pieces, avatars' view from behind the board (maxres1/2). */
    robloxSky: {
      board: { light: '#ccd0d2', dark: '#4e5067', edge: '#3a3c4c', thickness: .5, basic: false }, pieces: 'mesh',
      colors: { w: { color: '#f4f4f4', roughness: .5 }, b: { color: '#1d1d22', roughness: .5 } }, camera: { phi: .9, fov: 45 }, background: '#8fc6ee', ambient: 1.2, sun: 1.6,
      scenery: function (V, S, T) {
        gradientBg(S, '#7d97f2', '#eef3fb');
        slab(S, '#4ca35c', 16, 16, .6, -.8); slab(S, '#2b2d38', 9.2, 9.2, .5, -.4);
        for (var k = 0; k < 14; k++) cloud(S, Math.cos(k * 2.3) * (12 + k % 3 * 3), -4 - (k % 4), Math.sin(k * 2.3) * (12 + k % 3 * 3), 2 + k % 3);
        var tr = function (x, z, c) { var t = new T.Mesh(new T.CylinderGeometry(.12, .16, 1.4, 8), new T.MeshStandardMaterial({ color: '#7a5233' })); t.position.set(x, .2, z); S.root.add(t); var l = new T.Mesh(new T.SphereGeometry(.9, 12, 10), new T.MeshStandardMaterial({ color: c, roughness: .9 })); l.position.set(x, 1.3, z); S.root.add(l); };
        tr(-6.3, -5, '#c77dc7'); tr(5.8, -6, '#53b04a');
        [[-6, 3], [6.5, 1.5], [3, -6.8]].forEach(function (p) { var r = new T.Mesh(new T.DodecahedronGeometry(.6), new T.MeshStandardMaterial({ color: '#a0664a' })); r.position.set(p[0], -.2, p[1]); r.scale.y = 1.6; S.root.add(r); });
      }
    },
    /* Roblox Chess at a table (EqOwqolOZOo): cream / brown wooden board on a plank table in a dim wooden room (maxres1-3). */
    robloxTable: {
      board: { light: '#d3c7c0', dark: '#764e37', edge: '#3d2a1f', thickness: .25 }, pieces: 'mesh',
      colors: { w: { color: '#efe6d8', roughness: .45 }, b: { color: '#4a2e1e', roughness: .45 } }, camera: { phi: .85, fov: 42 }, background: '#2a211d', ambient: .9, sun: 1.5,
      scenery: function (V, S, T) { slab(S, '#69524c', 13, 11, .4, -.45); ground(S, '#3c2c25', 60, -3.5); var w = new T.Mesh(new T.PlaneGeometry(60, 20), new T.MeshStandardMaterial({ color: '#5a3b33', roughness: 1 })); w.position.set(0, 5, -14); S.scene.add(w); }
    },
    /* Luxury Chess (tm24Uq9nlBc): cream / reddish-brown wood board, dark wood frame with a gold rim, black and silver
       pieces, on a sandy floor, camera almost straight down like the game's top view (maxres2). */
    luxury: {
      board: { light: '#f4e6ce', dark: '#9a6b5a', edge: '#4e3b37', thickness: .25 }, pieces: 'mesh',
      colors: { w: { color: '#cfd3d8', metalness: .55, roughness: .3 }, b: { color: '#141416', roughness: .35 } }, camera: { phi: .42, fov: 40 }, background: '#cab061', ambient: 1.1, sun: 1.5,
      scenery: function (V, S, T) { boardFrame(S, '#c9a227', .18, .42, { metalness: .7, roughness: .3 }); var f = boardFrame(S, '#4e3b37', 1.1, .3); f.scale.set(1.08, 1, 1.08); slab(S, '#4e3b37', 11.2, 11.2, .2, -.42); ground(S, '#cab061', 80, -.55); }
    },
    /* Battle Chess (IbRrzKtieqs): glossy black / pale marble floor squares in a pillared castle hall, the blue army vs the
       red army, low camera (maxres1-3). Pieces = turned Staunton models in the armies' blue and red (the animated
       characters themselves are not reproducible). */
    battle: {
      board: { light: '#d8d6cc', dark: '#1a121c', edge: '#2a2a2e', thickness: .15 }, pieces: 'mesh',
      colors: { w: { color: '#3d6fc4', roughness: .35, metalness: .25 }, b: { color: '#b3242a', roughness: .35, metalness: .25 } }, camera: { phi: 1.0, fov: 45 }, background: '#95a2b2', ambient: 1.0, sun: 1.5, fog: { color: '#95a2b2', near: 18, far: 45 },
      scenery: function (V, S, T) {
        ground(S, '#8e8c7c', 80, -.16, { roughness: .4 });
        var cm = new T.MeshStandardMaterial({ color: '#c9cbc8', roughness: .7 }), ban = new T.MeshStandardMaterial({ color: '#5b1f5e', roughness: .8 });
        for (var k = -2; k <= 2; k++) [-7, 7].forEach(function (x) { var c = new T.Mesh(new T.CylinderGeometry(.45, .5, 7, 16), cm); c.position.set(x, 3.4, k * 3.2); c.castShadow = true; S.scene.add(c); });
        var wall = new T.Mesh(new T.BoxGeometry(30, 10, .5), new T.MeshStandardMaterial({ color: '#a7b0bb', roughness: .9 })); wall.position.set(0, 4.8, -10); S.scene.add(wall);
        for (var b = -3; b <= 3; b++) { var bn = new T.Mesh(new T.PlaneGeometry(1.2, 4), ban); bn.position.set(b * 3.2, 6, -9.7); S.scene.add(bn); }
        var bowl = new T.Mesh(new T.CylinderGeometry(.6, .25, .4, 16), new T.MeshStandardMaterial({ color: '#2b2b2b', metalness: .6 })); bowl.position.set(-5.6, 1.1, 2); S.scene.add(bowl);
        var fire = new T.PointLight('#ffae3c', 6, 8); fire.position.set(-5.6, 1.6, 2); S.scene.add(fire);
        V.flame = new T.Mesh(new T.ConeGeometry(.3, .8, 10), new T.MeshBasicMaterial({ color: '#ffb23c' })); V.flame.position.set(-5.6, 1.7, 2); S.scene.add(V.flame);
      },
      onFrame: function (V, dt, now) { if (V.flame && animOn()) V.flame.scale.y = 1 + Math.sin(now / 90) * .15; }
    },
    /* FPS Chess (PszkLYudcws, Nz2A-g73_iM): cream / black wooden board on a table in the Victorian red-walled room with a
       wooden floor, fireplace glow; cream and black Staunton pieces like the duel cards (main menu + duel card stills). */
    fps: {
      board: { light: '#eaeac6', dark: '#2b2622', edge: '#5a3a22', thickness: .25 }, pieces: 'mesh',
      colors: { w: { color: '#e9dcc0', roughness: .4 }, b: { color: '#1c1c1e', roughness: .35 } }, camera: { phi: .85, fov: 44 }, background: '#3a0d0d', ambient: .8, sun: 1.3, sunColor: '#ffe6c8',
      scenery: function (V, S, T) {
        boardFrame(S, '#6b4326', .35, .38); slab(S, '#7a4b2a', 10, 10, .3, -.5);
        var leg = new T.MeshStandardMaterial({ color: '#5a3a22' }); [[-4.5, -4.5], [4.5, -4.5], [-4.5, 4.5], [4.5, 4.5]].forEach(function (p) { var l = new T.Mesh(new T.BoxGeometry(.4, 3, .4), leg); l.position.set(p[0], -2.1, p[1]); S.root.add(l); });
        ground(S, '#6e3f25', 60, -3.6, { roughness: .7 });
        var red = new T.MeshStandardMaterial({ color: '#7a1f22', roughness: .9 });
        var w1 = new T.Mesh(new T.PlaneGeometry(40, 16), red); w1.position.set(0, 4, -12); S.scene.add(w1);
        var w2 = new T.Mesh(new T.PlaneGeometry(40, 16), red); w2.rotation.y = Math.PI / 2; w2.position.set(-12, 4, 0); S.scene.add(w2);
        var w3 = w2.clone(); w3.rotation.y = -Math.PI / 2; w3.position.x = 12; S.scene.add(w3);
        var fp = new T.Mesh(new T.BoxGeometry(5, 3.4, .8), new T.MeshStandardMaterial({ color: '#4a2a18' })); fp.position.set(0, -1.9, -11.6); S.scene.add(fp);
        var hole = new T.Mesh(new T.PlaneGeometry(2.6, 1.8), new T.MeshBasicMaterial({ color: '#ff8a2a' })); hole.position.set(0, -2.4, -11.15); S.scene.add(hole);
        var glow = new T.PointLight('#ff9a3c', 10, 16); glow.position.set(0, -1.6, -9.5); S.scene.add(glow); V.glow = glow;
        var cur2 = new T.Mesh(new T.PlaneGeometry(2.5, 12), new T.MeshStandardMaterial({ color: '#d0505a', roughness: 1 })); cur2.position.set(9, 3, -11.9); S.scene.add(cur2);
      },
      onFrame: function (V, dt, now) { if (V.glow && animOn()) V.glow.intensity = 9 + Math.sin(now / 130) * 1.5 + Math.sin(now / 47) * .6; }
    },
    /* Can I BEAT a Fly at Chess (OFtVdbxJI2Y): light / dark natural-wood board in a wooden tray on green grass, the giant
       cartoon fly looming over the far side (the fly art from the video as a billboard), white and black pieces. */
    fly: {
      board: { light: '#e7d3b0', dark: '#8a6a45', edge: '#775d3f', thickness: .22 }, pieces: 'mesh',
      colors: { w: { color: '#f3efe6', roughness: .5 }, b: { color: '#222', roughness: .45 } }, camera: { phi: .9, fov: 44 }, background: '#9fd0f0', ambient: 1.15, sun: 1.6,
      scenery: function (V, S, T) {
        gradientBg(S, '#86c3ee', '#d9eefa');
        boardFrame(S, '#775d3f', .6, .45); slab(S, '#6b5236', 9.6, 9.6, .3, -.5);
        ground(S, '#709f3e', 120, -.65);
        /* the giant cartoon fly gripping the far side of the board (thumbnail + 'Fly at Chess' stills): olive-brown head,
           two big glossy orange-red eyes, bristles and thin jointed legs reaching onto the tray */
        var fly = new T.Group(), body = new T.MeshStandardMaterial({ color: '#6e5a34', roughness: .55 }), eye = new T.MeshStandardMaterial({ color: '#e5472b', roughness: .18, metalness: .05 }), leg = new T.MeshStandardMaterial({ color: '#5a4426', roughness: .7 });
        var head = new T.Mesh(new T.SphereGeometry(2.1, 32, 24), body); head.scale.set(1.15, .95, 1); fly.add(head);
        [-1, 1].forEach(function (sx) { var e = new T.Mesh(new T.SphereGeometry(1.25, 32, 24), eye); e.position.set(sx * 1.35, .55, .95); e.scale.set(1, 1.1, .9); fly.add(e); });
        for (var b = 0; b < 5; b++) { var br = new T.Mesh(new T.CylinderGeometry(.03, .06, .9, 6), leg); br.position.set((b - 2) * .45, 2.1, .2); br.rotation.z = (b - 2) * .25; fly.add(br); }
        [[-1, .8], [1, .8], [-1, -.2], [1, -.2]].forEach(function (L) {
          var up = new T.Mesh(new T.CylinderGeometry(.09, .12, 3, 8), leg); up.position.set(L[0] * 2.4, -.2, L[1] + .6); up.rotation.z = L[0] * .9; up.rotation.x = .5; fly.add(up);
          var lo = new T.Mesh(new T.CylinderGeometry(.06, .09, 2.6, 8), leg); lo.position.set(L[0] * 3.3, -1.6, L[1] + 2.1); lo.rotation.x = 1.0; lo.rotation.z = L[0] * .25; fly.add(lo);
        });
        fly.position.set(0, 1.9, -5.6); fly.traverse(function (o) { o.castShadow = true; }); S.root.add(fly); V.fly = fly;
      },
      onFrame: function (V, dt, now) { if (V.fly && animOn()) V.fly.position.y = 1.9 + Math.sin(now / 650) * .08; }
    },
    /* Hyper Chess (d8pJkdxtXAA): white / green board floating over the game's blue grid (the mode's own grid.jpg shows
       through a transparent canvas), oak-brown vs beige wooden pieces, camera low behind your side (maxres2). */
    hyper: {
      board: { light: '#eef0ee', dark: '#2f7a3c', edge: '#1d4f27', thickness: .3 }, pieces: 'mesh', background: null,
      colors: { w: { color: '#e2c79a', roughness: .55 }, b: { color: '#7a4a26', roughness: .55 } }, camera: { phi: 1.0, fov: 46 }, ambient: 1.2, sun: 1.5
    },
    /* Beyond the Board: Abyss (SMOXF1bSsDk): white / black checker platforms in the demo's wooden frame on the light-grey
       cyclorama; missing squares are the black abyss (a dark pit with drifting hexagons), boxes are grey raised blocks,
       the exit is the glowing white tile (maxres1-3). Same look as xlErokL2-4c level 1. */
    abyss: {
      board: { light: '#f0f0f0', dark: '#151515', edge: '#2a2a2a', thickness: .3, basic: true }, pieces: 'mesh',
      colors: { w: { color: '#f2f2f2', roughness: .5 }, b: { color: '#1a1a1a' } }, camera: { phi: .8, fov: 42 }, background: '#c9c9c9', ambient: 1.1, sun: 1.4, wallColor: '#b5b5b5', wallHeight: .55,
      scenery: function (V, S, T) {
        boardFrame(S, '#6f4a2e', .55, .5);
        var g = S.ctx.V.geo; slab(S, '#050505', g.files, g.ranks, .2, -2.4);   /* the abyss floor under the missing squares */
        for (var k = 0; k < 10; k++) { var hx = new T.Mesh(new T.RingGeometry(.12, .17, 6).rotateX(-Math.PI / 2), new T.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: .7 })); hx.position.set((k * 1.7) % g.files - g.files / 2 + .5, -1.6 + (k % 3) * .4, (k * 2.3) % g.ranks - g.ranks / 2 + .5); S.root.add(hx); }
        ground(S, '#c9c9c9', 80, -.56);
      },
      decor: function (V, i, sqm, p, out) {
        if (p && p.t === 'Ex') { var T = V.S.THREE, m = new T.Mesh(new T.PlaneGeometry(.75, .75).rotateX(-Math.PI / 2), new T.MeshBasicMaterial({ color: '#ffffff' })); m.position.copy(V.S.sq2world(i, .02)); m.userData.sq = i; out.push(m); var l = new T.PointLight('#ffffff', 2, 2.5); l.position.copy(V.S.sq2world(i, .5)); out.push(l); }
      },
      hidePiece: function (p) { return p && p.t === 'Ex'; }
    },
    /* Petrified Pawns (sGXmiyvZDE4): dark slate dungeon floor (the mode's own warped stone tiles), stone-brick wall blocks,
       purple torch-lit gloom, the unit art (cut from the game's 3D renders) standing on the tiles, high 3/4 camera that
       follows your King (maxres1-3, frames 21/192/471). */
    dungeon: {
      board: { light: '#4a423b', dark: '#3a3430', edge: '#221e1c', thickness: .3 }, pieces: 'sprite', spriteScale: .95,
      camera: { phi: .72, fov: 40, dist: 9.5 }, background: '#151019', fog: { color: '#151019', near: 9, far: 22 }, ambient: .75, sun: 1.0, sunColor: '#c9b8ff', wallColor: '#4b4440', wallHeight: .9,
      lastColor: '#f0d24a', lastOpacity: .35, dotColor: '#f0d24a', dotOpacity: .55,
      follow: true,
      scenery: function (V, S, T) {
        var g = S.ctx.V.geo, tx = function (u) { return location.protocol === 'file:' ? null : canvasTex(V, u, { cover: true, size: 256 }); };
        var tl = tx('assets/modes/sGXmiyvZDE4/floor_light.jpg'), td = tx('assets/modes/sGXmiyvZDE4/floor_dark.jpg');
        if (tl && td) S.sqMeshes.forEach(function (m, i) { if (!m) return; var top = new T.MeshStandardMaterial({ map: (g.col(i) + g.row(i)) % 2 ? td : tl, roughness: .95 }); var mats = m.material.slice(); mats[2] = top; m.material = mats; });
        for (var k = 0; k < 3; k++) { var l = new T.PointLight('#ffb35a', 5, 7); l.position.set((k - 1) * 3.5, 2.2, -2 + k * 3); S.scene.add(l); }
        var pl = new T.PointLight('#8a5cff', 4, 14); pl.position.set(0, 5, 0); S.scene.add(pl);
      }
    }
  };
  /* Chess Ultimate with a normal chess army (dKBSZUzVQ1E uses the standard piece set): same island, turned pieces */
  PRESETS.cuStd = Object.assign({}, PRESETS.cu, { pieces: 'mesh', colors: { w: { color: '#f4f1ea', roughness: .5 }, b: { color: '#2a2a2e', roughness: .5 } } });
  /* a preset may follow a square (Petrified Pawns' big rooms): ease the camera target to the player's King */
  PRESETS.dungeon.onFrame = function (V, dt) {
    var S = V.S, st = S.ctx.game.state; if (!st) return; var k = -1;
    st.b.forEach(function (p, i) { if (p && p.c === S.ctx.human && p.t === 'K') k = i; });
    if (k >= 0) { var to = S.sq2world(k); to.y = 0; S.cam.target.lerp(to, animOn() ? Math.min(1, dt * 3) : 1); }
  };
  CM.view3d = { attach: attach, detach: detach, current: function () { return cur; }, presets: PRESETS };
})();
