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
      var src3 = P.spriteSrc ? P.spriteSrc(pc.src) : pc.src;   /* a preset may swap the 2D token for a standing cutout */
      g.add(spriteObj(V, src3, { badge: pc.badge || null, dim: dim }, sc, P.spriteLift != null ? P.spriteLift : sc / 2));
      if (P.teamRing && p) { var rc = P.teamRing[p.c]; if (rc) { var tr = new T.Mesh(new T.RingGeometry(.34, .44, 32).rotateX(-Math.PI / 2), new T.MeshBasicMaterial({ color: dim ? '#777' : rc, transparent: true, opacity: .9, depthWrite: false })); tr.position.y = .01; tr.renderOrder = 3; g.add(tr); } }
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
      var a = S.sq2world(i), sp = spriteObj(V, V.P.spriteSrc ? V.P.spriteSrc(giant) : giant, {}, 1.7, .85), grp = new T.Group(); grp.add(sp);
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
    var carried = -1, P = V.P, prev = V.pieces, next = {}, last = G.last, lc = P.lastColor || '#ffff33', lo = P.lastOpacity || .45, sqs = model.squares || [];
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
      if (!obj && last && last.t === i && last.f >= 0) { var fk = last.f + '#' + id; if (prev[fk]) { obj = prev[fk]; delete prev[fk];
        if (P.carry && p && p.c !== S.ctx.human && P.carry(V, obj, last.f, i)) carried = i; else slide(V, obj, last.f, i); } }   /* a preset may carry the bot's piece itself (The Fly) */
      if (!obj) { obj = makePieceObj(V, i, q, p); S.root.add(obj); obj.position.copy(S.sq2world(i)); }
      else if (!obj.userData.sliding) obj.position.copy(S.sq2world(i));
      obj.userData.sq = i; obj.traverse(function (o) { o.userData.sq = i; });
      next[key] = obj;
    }
    Object.keys(prev).forEach(function (k) {   /* a piece the carried one captures stays until the carrier lands on it */
      if (carried >= 0 && P.carryCaptured && +k.split('#')[0] === carried) P.carryCaptured(V, prev[k]); else S.root.remove(prev[k]);
    });
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
  function canvasTile(T, w, h, draw, rx, ry) {   /* a small procedural canvas texture (planks, bricks, faces) */
    var cv = document.createElement('canvas'); cv.width = w; cv.height = h; draw(cv.getContext('2d'), w, h);
    var t = new T.CanvasTexture(cv); t.colorSpace = T.SRGBColorSpace; t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(rx || 1, ry || 1); return t;
  }
  /* a blocky R6 Roblox avatar (m-3d 2026-11-26): 2x2x1 torso, 1x2x1 arms, ~1.2 head with the classic smile face; o.sit = seated
     at a table with the arms reaching forward (legs hidden under it); o.jacket = an open jacket over the shirt; o.wings = blue
     crystal shoulder wings (the EqOwqolOZOo opponent). Faces +z; the torso is children[0] (idle breathing). */
  function robloxAvatar(T, o) {
    var av = new T.Group(), mat = function (c) { return new T.MeshStandardMaterial({ color: c, roughness: .75 }); };
    var skin = mat(o.skin || '#f5cd30'), shirt = mat(o.shirt || '#3fa34d'), pants = mat(o.pants || '#2a4f8f'), arm = mat(o.arm || o.skin || '#f5cd30');
    var box = function (w, h, d, m, x, y, z) { var b = new T.Mesh(new T.BoxGeometry(w, h, d), m); b.position.set(x, y, z); b.castShadow = true; av.add(b); return b; };
    box(2, 2, 1, o.jacket ? mat(o.jacket) : shirt, 0, 1, 0);
    if (o.jacket) box(.9, 1.9, .05, shirt, 0, 1.02, .5);   /* the shirt showing between the open jacket */
    if (o.logo) { var lg = new T.Mesh(new T.PlaneGeometry(.35, .35), new T.MeshBasicMaterial({ color: o.logo })); lg.position.set(.45, 1.45, .51); av.add(lg); }
    var la = box(1, 2, 1, o.jacket ? mat(o.jacket) : arm, -1.5, 1, 0), ra = box(1, 2, 1, o.jacket ? mat(o.jacket) : arm, 1.5, 1, 0);
    if (o.sit) { la.rotation.x = ra.rotation.x = -.35; box(2, .9, 1, pants, 0, -.45, .4); }
    else { box(.98, 2, 1, pants, -.5, -1, 0); box(.98, 2, 1, pants, .5, -1, 0); if (o.jacket) { box(.7, .5, .7, skin, -1.5, -.2, 0); box(.7, .5, .7, skin, 1.5, -.2, 0); } }
    var face = canvasTile(T, 128, 128, function (c, w) { c.fillStyle = o.skin || '#f5cd30'; c.fillRect(0, 0, w, w); c.fillStyle = '#111'; c.beginPath(); c.ellipse(44, 52, 7, 12, 0, 0, Math.PI * 2); c.fill(); c.beginPath(); c.ellipse(84, 52, 7, 12, 0, 0, Math.PI * 2); c.fill(); c.lineWidth = 6; c.lineCap = 'round'; c.strokeStyle = '#111'; c.beginPath(); c.arc(64, 70, 26, .2 * Math.PI, .8 * Math.PI); c.stroke(); });
    var hd = new T.Mesh(new T.BoxGeometry(1.25, 1.2, 1.2), [skin, skin, skin, skin, new T.MeshStandardMaterial({ map: face, roughness: .7 }), skin]); hd.position.set(0, 2.62, 0); hd.castShadow = true; av.add(hd);
    if (o.hair) { var hm = mat(o.hair); box(1.4, .45, 1.35, hm, 0, 3.3, -.05); box(1.4, .9, .25, hm, 0, 2.85, -.62); }
    if (o.hat) { var ht = mat(o.hat); box(1.9, .1, 1.9, ht, 0, 3.27, 0); box(1.3, .6, 1.3, ht, 0, 3.6, 0); }
    if (o.wings) { var wg = new T.MeshStandardMaterial({ color: '#7fd0ff', roughness: .25, metalness: .1, emissive: '#2a7fd0', emissiveIntensity: .35, flatShading: true });
      [-1, 1].forEach(function (sx) { for (var k = 0; k < 5; k++) { var c2 = new T.Mesh(new T.ConeGeometry(.16, 1.3 - k * .1, 5), wg); c2.position.set(sx * (1.9 + k * .22), 1.7 + k * .12, -.55); c2.rotation.z = -sx * (.25 + k * .18); av.add(c2); } }); }
    return av;
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
        if (cur !== V || !V.S) return;   /* the first frame runs inside scene3d.attach, before V.S is set */
        var f2 = !!(G.flipped && G.flipped()); if (f2 !== V.flip) { V.flip = f2; S.setCamera({ theta: (V.cam.theta || 0) - (fl ? Math.PI : 0) + (f2 ? Math.PI : 0) }, 700); }   /* Flip button: the camera swings round */
        if (!V.S) V.S = S;   /* s6 fps3d: the first frame runs before attach() resolves */
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
      board: { light: '#a9adae', dark: '#86898b', edge: '#6d6f70', thickness: .32 }, pieces: 'sprite',
      camera: { phi: .68, fov: 42, fit: 1.3 }, background: '#cfeefb', ambient: 1.25, sun: 1.5, lastColor: '#ffe14a', lastOpacity: .55, dotColor: '#2a2a2a',
      /* audit 2026-11-26 (research/ref/fin-battle/sheets/ref_cu.jpg): the videos show the characters standing free on the
         tiles with a team outline, not round tokens -> standing cutouts (assets/modes/CxtttdnwNWk/cu3d, tools/cu3d_cutout.py) + a
         blue / red ring on the tile; a bit lower camera like the game's view from behind the army */
      spriteSrc: function (src) { var m = /assets\/modes\/CxtttdnwNWk\/cu\/(\w+)_[wb]\.png$/.exec(src || ''); return m ? 'assets/modes/CxtttdnwNWk/cu3d/' + m[1] + '.png' : src; },
      teamRing: { w: '#39c6f4', b: '#e0463a' }, spriteScale: 1.05,
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
        var tree = function (x, z, s2) { var t = new T.Mesh(new T.CylinderGeometry(.1 * s2, .16 * s2, 1 * s2, 8), new T.MeshStandardMaterial({ color: '#7a5233', roughness: 1 })); t.position.set(x, -.35 + .5 * s2, z); S.root.add(t);
          [[0, 1.1, 0, .75], [.35, .85, .1, .5], [-.3, .9, -.1, .5]].forEach(function (b) { var l = new T.Mesh(new T.IcosahedronGeometry(b[3] * s2, 1), new T.MeshStandardMaterial({ color: '#3f8f2f', roughness: .9, flatShading: true })); l.position.set(x + b[0] * s2, -.35 + b[1] * s2, z + b[2] * s2); S.root.add(l); }); };
        tree(-R * .82, -R * .1, 1.2); tree(R * .85, -R * .15, 1.4); tree(-R * .45, -R * .78, 1);
        [[-R * .3, R * .8], [R * .35, -R * .82], [R * .8, R * .6]].forEach(function (p) { var rk = new T.Mesh(new T.DodecahedronGeometry(.45, 0), new T.MeshStandardMaterial({ color: '#9b9d9f', roughness: 1, flatShading: true })); rk.position.set(p[0], -.15, p[1]); rk.scale.set(1.3, .8, 1); S.root.add(rk); });
        cloud(S, -R * 1.6, -2, -R * 1.2, 1.4); cloud(S, R * 1.7, -3, -R * .4, 1.7); cloud(S, -R * 1.2, -5, R * 1.3, 1.6); cloud(S, R, 2, -R * 2.2, 1.3);
      },
      blocker: function (V, i, sqm, p, d) {   /* Chess Ultimate pits: a black hole in the stone instead of a tile */
        var S = V.S, T = S.THREE; if (S.sqMeshes[i]) S.sqMeshes[i].visible = false;
        var m = new T.Mesh(new T.CylinderGeometry(.44, .44, .3, 28), new T.MeshBasicMaterial({ color: '#0b0b0d' })); m.position.copy(S.sq2world(i, -.14)); m.userData.sq = i; return m;
      }
    },
    /* Roblox Chess (jXOg1Py4EoA): the match board floats over a sea of clouds (the 'Victory!' frame, maxres3): near-white /
       slate-blue squares on a dark slate slab, blocky white and black pieces, the opponent's Roblox avatar standing over the far
       side (black jacket over a blue shirt, brown hands). The grassy lobby plate with its trees and rocks shows lower down and
       further off (maxres1/2). m-3d audit 2026-11-26: was the board sitting on the grass plate, no avatar. */
    robloxSky: {
      board: { light: '#e6e9ee', dark: '#4d5574', edge: '#363b52', thickness: .4, basic: false }, pieces: 'mesh',
      colors: { w: { color: '#f4f4f4', roughness: .5 }, b: { color: '#1d1d22', roughness: .5 } }, camera: { phi: .9, fov: 45, fit: 1.2 }, background: '#8fc6ee', ambient: 1.2, sun: 1.6,
      scenery: function (V, S, T) {
        gradientBg(S, '#7d97f2', '#eef3fb');
        var D = S.ctx.V.geo.ranks, far = S.ctx.game.flipped && S.ctx.game.flipped() ? 1 : -1;
        slab(S, '#2b2d38', 9.2, 9.2, .5, -.4);
        for (var k = 0; k < 22; k++) { var rr = 6.5 + (k % 5) * 3.4, an = k * 2.3; cloud(S, Math.cos(an) * rr, -4.2 - (k % 4) * .8, Math.sin(an) * rr, 1.8 + k % 3 * .6); }
        var isl = new T.Group(); isl.position.set(-9, -6, far * 14); S.scene.add(isl);   /* the lobby plate, far off and lower */
        var gp = new T.Mesh(new T.BoxGeometry(12, .8, 9), new T.MeshStandardMaterial({ color: '#4ca35c', roughness: .9 })); isl.add(gp);
        var tr = function (x, z, c) { var t = new T.Mesh(new T.CylinderGeometry(.12, .16, 1.4, 8), new T.MeshStandardMaterial({ color: '#7a5233' })); t.position.set(x, 1.1, z); isl.add(t); var l = new T.Mesh(new T.SphereGeometry(.9, 12, 10), new T.MeshStandardMaterial({ color: c, roughness: .9 })); l.position.set(x, 2.2, z); isl.add(l); };
        tr(-4, -2, '#c77dc7'); tr(3.5, -3, '#53b04a');
        [[-3, 3], [4.5, 1.5]].forEach(function (p) { var r = new T.Mesh(new T.DodecahedronGeometry(.6), new T.MeshStandardMaterial({ color: '#a0664a' })); r.position.set(p[0], .8, p[1]); r.scale.y = 1.6; isl.add(r); });
        var av = robloxAvatar(T, { skin: '#7a4b2e', shirt: '#2f8fd0', jacket: '#151518', pants: '#1b1b20', hair: '#111' });
        av.scale.setScalar(.85); av.position.set(0, 1.3, far * (D / 2 + 2.2)); if (far > 0) av.rotation.y = Math.PI; S.root.add(av); V.avatar = av;
      },
      onFrame: function (V, dt, now) { if (V.avatar && animOn()) V.avatar.children[0].scale.y = 1 + Math.sin(now / 900) * .012; }
    },
    /* Roblox Chess at a table (EqOwqolOZOo): near-white / brown wooden board in a brown frame on a grey plank table, light-wood
       vs dark-wood pieces, the opponent's blocky Roblox avatar sitting across the table (green shirt, yellow skin, brown hair,
       the classic smile face, blue crystal shoulder wings), a red-brick room with windows and more tables (maxres1-3; m-3d audit
       2026-11-26, research/ref/fin-battle/thumbs/EqOwqolOZOo_1..3.jpg). */
    robloxTable: {
      board: { light: '#ece5da', dark: '#8a5434', edge: '#5e3a24', thickness: .25 }, pieces: 'mesh',
      colors: { w: { color: '#d9b48a', roughness: .55 }, b: { color: '#4a2c1c', roughness: .5 } }, camera: { phi: .9, fov: 44, fit: 1.25 }, background: '#3a2620', ambient: 1.0, sun: 1.4,
      scenery: function (V, S, T) {
        var g = S.ctx.V.geo, W = g.files, D = g.ranks, fl = !!(S.ctx.game.flipped && S.ctx.game.flipped()), far = fl ? 1 : -1;
        var ctex = function (w, h, draw, rx, ry) { return canvasTile(T, w, h, draw, rx, ry); };
        var planks = ctex(256, 256, function (c, w, h) { c.fillStyle = '#8d857c'; c.fillRect(0, 0, w, h); for (var k = 0; k < 8; k++) { c.fillStyle = k % 2 ? '#958d83' : '#857d74'; c.fillRect(0, k * 32 + 2, w, 29); c.fillStyle = '#5f5852'; c.fillRect(0, k * 32, w, 2); c.fillRect((k * 97) % w, k * 32, 2, 32); } }, 1, 1);
        var brick = ctex(256, 256, function (c, w, h) { c.fillStyle = '#5e3b33'; c.fillRect(0, 0, w, h); for (var r = 0; r < 16; r++) for (var q = -1; q < 5; q++) { c.fillStyle = ['#8e4f40', '#844839', '#96574a'][(r + q) % 3 < 0 ? 0 : (r + q) % 3]; c.fillRect(q * 64 + (r % 2) * 32 + 2, r * 16 + 2, 60, 12); } }, 6, 2);
        var floor = ctex(256, 256, function (c, w, h) { c.fillStyle = '#4a372c'; c.fillRect(0, 0, w, h); for (var k = 0; k < 8; k++) { c.fillStyle = k % 2 ? '#523d31' : '#443228'; c.fillRect(k * 32 + 2, 0, 29, h); c.fillStyle = '#2e221b'; c.fillRect(k * 32, (k * 71) % h, 32, 2); } }, 10, 10);
        boardFrame(S, '#6b4129', .45, .38);
        /* the plank table: top, apron and legs */
        var TW = W + 4.2, TD = D + 3.2, top = new T.Mesh(new T.BoxGeometry(TW, .35, TD), new T.MeshStandardMaterial({ map: planks, roughness: .9 })); top.position.y = -.5; top.receiveShadow = true; S.root.add(top);
        [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (L) { var lg = new T.Mesh(new T.BoxGeometry(.5, 3, .5), new T.MeshStandardMaterial({ color: '#6f675f', roughness: .9 })); lg.position.set(L[0] * (TW / 2 - .5), -2.15, L[1] * (TD / 2 - .5)); S.root.add(lg); });
        var fm = new T.Mesh(new T.PlaneGeometry(90, 90).rotateX(-Math.PI / 2), new T.MeshStandardMaterial({ map: floor, roughness: 1 })); fm.position.y = -3.65; fm.receiveShadow = true; S.scene.add(fm);
        /* red-brick walls with dark window frames, on the three sides around the opponent */
        var wm = new T.MeshStandardMaterial({ map: brick, roughness: 1 });
        [[0, far * 15, 0], [-15, 0, Math.PI / 2], [15, 0, -Math.PI / 2]].forEach(function (w) { var m = new T.Mesh(new T.PlaneGeometry(30, 14), wm); m.position.set(w[0], 3.3, w[1]); m.rotation.y = w[2] + (far > 0 && !w[0] ? Math.PI : 0); S.scene.add(m); });
        [-6, 0, 6].forEach(function (x) { var fr = new T.Mesh(new T.BoxGeometry(3.4, 2.4, .2), new T.MeshStandardMaterial({ color: '#2a1d18', roughness: .8 })); fr.position.set(x, 4.6, far * 14.85); S.scene.add(fr); var gl = new T.Mesh(new T.PlaneGeometry(3, 2), new T.MeshBasicMaterial({ color: '#c8d4dc' })); gl.position.set(x, 4.6, far * 14.7); if (far > 0) gl.rotation.y = Math.PI; S.scene.add(gl); });
        /* more chess tables in the lobby behind */
        [[-9.5, 9], [9.5, 9], [-9.5, -1], [9.5, -1]].forEach(function (t) { var tb = new T.Mesh(new T.BoxGeometry(5, .35, 4), new T.MeshStandardMaterial({ map: planks, roughness: .9 })); tb.position.set(t[0], -.5, far * t[1]); S.scene.add(tb); var bd = new T.Mesh(new T.BoxGeometry(2.6, .12, 2.6), new T.MeshStandardMaterial({ color: '#8a5434', roughness: .8 })); bd.position.set(t[0], -.27, far * t[1]); S.scene.add(bd); });
        /* the opponent: blocky R6 Roblox avatar seated across the table, facing the board */
        var av = robloxAvatar(T, { skin: '#f5cd30', shirt: '#3fa34d', pants: '#2a4f8f', hair: '#6b3a1e', logo: '#f2f2f2', wings: true, sit: true });
        av.position.set(0, -.2, far * (D / 2 + 1.55)); if (far > 0) av.rotation.y = Math.PI; S.root.add(av); V.avatar = av;
        var lamp = new T.PointLight('#ffe2b8', 6, 22); lamp.position.set(0, 7, 0); S.scene.add(lamp);
      },
      onFrame: function (V, dt, now) { if (V.avatar && animOn()) V.avatar.children[0].scale.y = 1 + Math.sin(now / 900) * .012; }   /* idle breathing */
    },
    /* Luxury Chess (tm24Uq9nlBc): cream / reddish-brown wood board with a thin gold rim, set in a big dark-wood table top
       with a gold edge, a red 'Draw!' plaque on one side and a wooden chess clock on the other, black and silver pieces, on a
       sandy floor, camera almost straight down like the game's top view (maxres1-2; m-3d audit 2026-11-26 added the table,
       the plaque and the clock). */
    luxury: {
      board: { light: '#f4e6ce', dark: '#9a6b5a', edge: '#4e3b37', thickness: .25 }, pieces: 'mesh',
      colors: { w: { color: '#cfd3d8', metalness: .55, roughness: .3 }, b: { color: '#141416', roughness: .35 } }, camera: { phi: .42, fov: 40, fit: 1.3 }, background: '#cab061', ambient: 1.1, sun: 1.5,
      scenery: function (V, S, T) {
        var g = S.ctx.V.geo, W = g.files, D = g.ranks;
        boardFrame(S, '#c9a227', .14, .36, { metalness: .7, roughness: .3 });
        var grain = canvasTile(T, 256, 256, function (c, w, h) { c.fillStyle = '#4b3833'; c.fillRect(0, 0, w, h); for (var k = 0; k < 90; k++) { c.strokeStyle = k % 3 ? 'rgba(30,20,18,.35)' : 'rgba(120,90,80,.25)'; c.lineWidth = 1 + k % 2; c.beginPath(); var y = (k * 37) % h; c.moveTo(0, y); c.bezierCurveTo(w * .3, y + 6, w * .6, y - 6, w, y + 2); c.stroke(); } }, 2, 2);
        var TW = W + 3.4, TD = D + 3.4, top = new T.Mesh(new T.BoxGeometry(TW, .3, TD), new T.MeshStandardMaterial({ map: grain, roughness: .55 })); top.position.y = -.42; top.receiveShadow = true; S.root.add(top);
        var rim = new T.MeshStandardMaterial({ color: '#c9a227', metalness: .7, roughness: .3 });
        [[TW + .3, .3, 0, -(TD + .15) / 2], [TW + .3, .3, 0, (TD + .15) / 2], [.3, TD, -(TW + .15) / 2, 0], [.3, TD, (TW + .15) / 2, 0]].forEach(function (r) { var m = new T.Mesh(new T.BoxGeometry(r[0], .38, r[1]), rim); m.position.set(r[2], -.38, r[3]); S.root.add(m); });
        var pl = new T.Mesh(new T.BoxGeometry(.35, .06, 1.3), new T.MeshStandardMaterial({ color: '#c8331f', roughness: .5 })); pl.position.set(-(W / 2 + .95), -.24, 0); S.root.add(pl);   /* 'Draw!' plaque */
        var tt = new T.Mesh(new T.PlaneGeometry(1.2, .4).rotateX(-Math.PI / 2).rotateY(Math.PI / 2), new T.MeshBasicMaterial({ map: textTex(V, 'Draw!', '#fff'), transparent: true })); tt.position.set(-(W / 2 + .95), -.2, 0); S.root.add(tt);
        var ck = new T.Group(), cw = new T.MeshStandardMaterial({ color: '#5a3a22', roughness: .6 }); ck.position.set(W / 2 + 1.05, -.27, 0); S.root.add(ck);   /* chess clock */
        var cb = new T.Mesh(new T.BoxGeometry(.7, .5, 1.6), cw); cb.position.y = .25; cb.castShadow = true; ck.add(cb);
        [-.4, .4].forEach(function (z) { var bt = new T.Mesh(new T.CylinderGeometry(.1, .1, .12, 12), rim); bt.position.set(0, .56, z); ck.add(bt); });
        slab(S, '#3d2d28', TW, TD, .2, -.75); ground(S, '#cab061', 80, -.9);
      }
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
        /* fin-fps: the red carpet with gold diamonds under the table (FPS Chess main menu still) */
        var cv = document.createElement('canvas'); cv.width = 512; cv.height = 384; var cx = cv.getContext('2d');
        cx.fillStyle = '#b3122a'; cx.fillRect(0, 0, 512, 384); cx.strokeStyle = '#e8b23a'; cx.lineWidth = 10; cx.strokeRect(14, 14, 484, 356); cx.fillStyle = '#e8b23a';
        for (var r = 0; r < 9; r++) for (var c = 0; c < 13; c++) { var px = 56 + c * 33.5, py = 56 + r * 34; cx.beginPath(); cx.moveTo(px, py - 7); cx.lineTo(px + 6, py); cx.lineTo(px, py + 7); cx.lineTo(px - 6, py); cx.fill(); }
        var ctex = new T.CanvasTexture(cv); ctex.colorSpace = T.SRGBColorSpace;
        var carpet = new T.Mesh(new T.PlaneGeometry(18, 13.5), new T.MeshStandardMaterial({ map: ctex, roughness: 1 })); carpet.rotation.x = -Math.PI / 2; carpet.position.y = -3.58; carpet.receiveShadow = true; S.scene.add(carpet);
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
    /* Can I BEAT a Fly at Chess (OFtVdbxJI2Y). The video plays Ernesto's "Chess vs. a Fruit Fly" (flychess-hq.vercel.app,
       Three.js; the 164,587-neuron copy and "the fly has been defeated" match the video): a natural-wood board in a stepped wooden
       tray on mown grass, and a small fruit fly hovering off the far side. It is a real animal, not a cursor: tan abdomen, darker
       thorax, dark head, two big glossy red eyes, six thin jointed legs and two clear wings beating fast. On its own moves it flies
       to the piece, takes hold of it with its front legs, carries it across hanging under its body and sets it down; your moves
       slide as usual (the app's own 'slide mode'). The giant fly of the thumbnail is only the end card (same model, zoomed in).
       Sizes are the app's own proportions with a square = 1 unit: body about .85 square wide and 2 squares nose to tail, wings
       clear and faint. Redrawn here as our own meshes from those measurements (fly-carry 2026-11-27, owner: "the fly is way
       smaller, the wings flap, and it actually picks up pieces and moves them not using telekinesis"). */
    fly: (function () {
      var FLY_SCALE = 1.25, HOME = { y: 2.7, z: 5.9 }, CARRY_S = 1.4, GRIP = .45;   /* GRIP: body centre to the top of the held piece */
      function reduced() { return !!(CM.settings && CM.settings.reducedMotion && CM.settings.reducedMotion()); }
      function ease(x) { return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
      function seg(T, len, r0, r1, mat) { var g = new T.CylinderGeometry(r1, r0, len, 8); g.translate(0, -len / 2, 0); var m = new T.Mesh(g, mat); m.castShadow = true; return m; }
      function model(T) {   /* head toward +z (facing the player), wings on their own hinges so they can beat */
        var M = function (c, o) { return new T.MeshStandardMaterial(Object.assign({ color: c, roughness: .55 }, o || {})); };
        var abdM = M('#8a6535', { metalness: .06 }), thxM = M('#6d4f2c', { roughness: .5, metalness: .08 }), headM = M('#3c2a19'),
          eyeM = M('#d42a17', { roughness: .22, metalness: .15, emissive: '#4a0a04', emissiveIntensity: .3 }), legM = M('#2b1e13', { roughness: .8 }),
          wingM = new T.MeshStandardMaterial({ color: '#dce9ff', roughness: .1, metalness: 0, transparent: true, side: T.DoubleSide, depthWrite: false });
        var fly = new T.Group(), body = new T.Group(); fly.add(body);
        var ell = function (r, sx, sy, sz, mat, x, y, z) { var m = new T.Mesh(new T.SphereGeometry(r, 24, 18), mat); m.scale.set(sx, sy, sz); m.position.set(x, y, z); m.castShadow = true; body.add(m); return m; };
        ell(.40, .82, .74, 1.18, abdM, 0, 0, -.50);   /* abdomen */
        ell(.34, 1, .92, 1.02, thxM, 0, 0, 0);       /* thorax */
        ell(.25, 1.05, .92, .86, headM, 0, .02, .42); /* head */
        [-1, 1].forEach(function (s) {
          ell(.165, .86, 1.06, .92, eyeM, s * .155, .055, .50);   /* the big red compound eyes */
          var a = new T.Mesh(new T.CylinderGeometry(.012, .008, .2, 6), legM); a.position.set(s * .07, .13, .58); a.rotation.set(.7, 0, s * .35); body.add(a);
        });
        var sh = new T.Shape(); sh.moveTo(0, 0); sh.bezierCurveTo(.3, .15, .85, .2, 1.18, .09); sh.bezierCurveTo(1.3, .04, 1.3, -.06, 1.16, -.11); sh.bezierCurveTo(.8, -.24, .28, -.16, 0, 0);
        var wings = [];
        [-1, 1].forEach(function (s) {   /* two faint offset leaves per wing: the beat reads as a blur, not a blade */
          var hinge = new T.Group(); hinge.position.set(s * .17, .21, -.04);
          [[0, .30], [.13, .16]].forEach(function (L) { var m = new T.Mesh(new T.ShapeGeometry(sh, 18), wingM.clone()); m.material.opacity = L[1]; m.scale.set(s, 1, 1); m.rotation.x = Math.PI / 2; m.rotation.y = s * L[0]; m.renderOrder = 5; hinge.add(m); });
          body.add(hinge); wings.push({ hinge: hinge, s: s });
        });
        var legs = [];
        [[-1, 0, .30, .16], [1, 0, .30, .16], [-1, 1, .34, -.10], [1, 1, .34, -.10], [-1, 2, .30, -.38], [1, 2, .30, -.38]].forEach(function (L) {
          var root = new T.Group(), parent = root, joints = [];
          [[.34, .042, .030], [.40, .030, .021], [.26, .021, .012]].forEach(function (q) { var j = new T.Group(); j.add(seg(T, q[0], q[1], q[2], legM)); parent.add(j); joints.push(j); var nx = new T.Group(); nx.position.y = -q[0]; j.add(nx); parent = nx; });
          root.position.set(L[0] * L[2], -.14, L[3]); root.rotation.z = L[0] * .85; root.rotation.x = (1 - L[1]) * .42;
          root.userData = { joints: joints, rest: { x: root.rotation.x, z: root.rotation.z } };
          joints[0].rotation.x = -.35; joints[1].rotation.x = -1.15; joints[2].rotation.x = -.75;
          body.add(root); legs.push(root);
        });
        fly.scale.setScalar(FLY_SCALE); fly.userData = { wings: wings, legs: legs };
        return fly;
      }
      function reach(leg, a, fwd) {   /* a = 0 rest .. 1 front legs stretched down and forward round the piece */
        var r = leg.userData.rest, j = leg.userData.joints;
        leg.rotation.x = r.x + (fwd - r.x) * a; leg.rotation.z = r.z * (1 - a * .72);
        j[0].rotation.x = -.35 + (-.95 + .35) * a; j[1].rotation.x = -1.15 + (-.30 + 1.15) * a; j[2].rotation.x = -.75 + (-.22 + .75) * a;
      }
      function home(V) { var T = V.S.THREE, sgn = V.flip ? 1 : -1; return new T.Vector3(0, HOME.y, sgn * HOME.z); }
      function finish(V) {
        var C = V.carry; if (!C) return; V.carry = null;
        if (C.cap && C.cap.parent) C.cap.parent.remove(C.cap);
        var o = C.obj, sq = o.userData.sq; o.userData.sliding = false; if (o.parent && sq != null) o.position.copy(V.S.sq2world(sq));
      }
      function step(V, dt, now) {
        var S = V.S, T = S.THREE, fly = V.fly, C = V.carry, t = now / 1000, H = home(V), yaw = V.flip ? Math.PI : 0, target, a = 0;
        var rm = reduced(), beat = (C ? 78 : 48) * (rm ? .3 : 1);   /* rad/s: ~8 Hz hovering, ~12 Hz carrying (the app's rates); reduced motion beats slower */
        V.wingPhase = (V.wingPhase || 0) + dt * beat; var fl = Math.sin(V.wingPhase), amp = rm ? .6 : 1;
        fly.userData.wings.forEach(function (w) { w.hinge.rotation.z = w.s * (.30 + fl * .46 * amp); w.hinge.rotation.x = fl * .30 * amp; w.hinge.rotation.y = w.s * fl * .16 * amp; });
        fly.rotation.y += (yaw - fly.rotation.y) * Math.min(1, dt * 3);
        if (!C) {   /* calm hover off the far side: a slow bob and a small wander */
          target = new T.Vector3(H.x + Math.sin(t * .77) * .30, H.y + Math.sin(t * 1.9) * .17, H.z + Math.sin(t * .53) * .16);
          fly.position.x += (target.x - fly.position.x) * Math.min(1, dt * 2.2); fly.position.y += (target.y - fly.position.y) * Math.min(1, dt * 3.2); fly.position.z += (target.z - fly.position.z) * Math.min(1, dt * 2.2);
          fly.rotation.z += (Math.sin(t * 1.3) * .09 - fly.rotation.z) * Math.min(1, dt * 3); fly.rotation.x += (Math.sin(t * .9) * .07 - fly.rotation.x) * Math.min(1, dt * 3);
        } else {
          var u = Math.min(1, (now - C.t0) / (V.P.carryMs || CARRY_S * 1000)), A = C.A, B = C.B, hy = C.hover, o = C.obj, held = function () { return new T.Vector3(fly.position.x, fly.position.y - GRIP - C.h, fly.position.z); };
          /* 0-.26 fly over | .26-.38 grip and lift | .38-.72 carry | .72-.84 set down | .84-1 back to its spot */
          if (u < .26) { var k = ease(u / .26); target = new T.Vector3().lerpVectors(C.P0, new T.Vector3(A.x, hy, A.z), k); target.y += Math.sin(k * Math.PI) * .55; }
          else if (u < .38) { var k2 = ease((u - .26) / .12); target = new T.Vector3(A.x, hy - Math.sin(k2 * Math.PI) * .12, A.z); a = k2; var hp = held(); o.position.set(A.x, Math.max(0, hp.y) * k2, A.z); }
          else if (u < .72) { var k3 = ease((u - .38) / .34); a = 1; target = new T.Vector3().lerpVectors(new T.Vector3(A.x, hy, A.z), new T.Vector3(B.x, hy, B.z), k3); target.y += Math.sin(k3 * Math.PI) * .30;
            o.position.copy(held()); o.rotation.z = Math.sin(t * 6) * .04;   /* hangs from the legs with a slight sway */
            if (C.cap) { var c = Math.max(0, Math.min(1, (k3 - .05) / .40)), s = 1 - c; C.cap.scale.setScalar(Math.max(.001, s * (C.capS || 1))); C.cap.position.y = c * .9; C.cap.rotation.z = c * 2.4; if (c >= 1 && C.cap.parent) { C.cap.parent.remove(C.cap); C.cap = null; } } }
          else if (u < .84) { var k4 = ease((u - .72) / .12); a = 1 - k4; target = new T.Vector3(B.x, hy, B.z); var hq = held(); o.position.set(B.x + (hq.x - B.x) * (1 - k4), Math.max(0, hq.y) * (1 - k4), B.z + (hq.z - B.z) * (1 - k4)); o.rotation.z = 0;
            if (C.cap && C.cap.parent) { C.cap.parent.remove(C.cap); C.cap = null; } }
          else { var k5 = ease((u - .84) / .16); target = new T.Vector3().lerpVectors(new T.Vector3(B.x, hy, B.z), H, k5); target.y += Math.sin(k5 * Math.PI) * .5; o.position.copy(B); }
          var bx = fly.position.x, bz = fly.position.z; fly.position.lerp(target, 1 - Math.pow(.000002, dt));
          if (u >= .38 && u < .72) o.position.copy(held());   /* re-hang after the fly moved this frame, so the piece never trails it */
          fly.rotation.z = T.MathUtils.clamp(-(fly.position.x - bx) * 7 * (V.flip ? -1 : 1), -.5, .5); fly.rotation.x = T.MathUtils.clamp((fly.position.z - bz) * 6 * (V.flip ? -1 : 1), -.4, .4);
          if (u >= 1) finish(V);
        }
        var legs = fly.userData.legs;
        if (C || a) { reach(legs[0], a, .95); reach(legs[1], a, .95); reach(legs[2], a * .35, .20); reach(legs[3], a * .35, .20); }
        else legs.forEach(function (leg, i) { var r = leg.userData.rest, w = Math.sin(t * 2.1 + i * 1.1) * .06, j = leg.userData.joints, f = Math.min(1, dt * 4);
          leg.rotation.x += (r.x - w - leg.rotation.x) * f; leg.rotation.z += (r.z - leg.rotation.z) * f;
          j[0].rotation.x += (-.35 - w - j[0].rotation.x) * f; j[1].rotation.x += (-1.15 - j[1].rotation.x) * f; j[2].rotation.x += (-.75 - j[2].rotation.x) * f; });
        /* a soft round shadow under the fly on the board / grass, fainter the higher it flies */
        if (V.flyShadow) { var sd = V.flyShadow; sd.position.set(fly.position.x, Math.abs(fly.position.x) < 4.3 && Math.abs(fly.position.z) < 4.3 ? .015 : -1.13, fly.position.z); sd.material.opacity = Math.max(.08, .32 - (fly.position.y - .5) * .07); }
      }
      return {
        board: { light: '#e7d3b0', dark: '#8a6a45', edge: '#775d3f', thickness: .22 }, pieces: 'mesh',
        colors: { w: { color: '#f3efe6', roughness: .5 }, b: { color: '#222', roughness: .45 } }, camera: { phi: .9, fov: 44 }, background: '#9fd0f0', ambient: 1.15, sun: 1.6,
        scenery: function (V, S, T) {
          gradientBg(S, '#86c3ee', '#d9eefa');
          boardFrame(S, '#775d3f', .6, .45); slab(S, '#6b5236', 9.6, 9.6, .3, -.5);
          slab(S, '#8a6c49', 10.6, 10.6, .3, -.75); slab(S, '#7a5e3e', 11.6, 11.6, .3, -1.0);   /* the stepped wooden plinth (m-3d audit) */
          var grass = canvasTile(T, 256, 256, function (c, w, h) { c.fillStyle = '#5f9a34'; c.fillRect(0, 0, w, h); for (var k = 0; k < 2600; k++) { c.fillStyle = ['#6aa83b', '#548c2e', '#73b043', '#4f8329'][k % 4]; c.fillRect((k * 53) % w, (k * 97 + (k >> 4)) % h, 2, 5); } }, 24, 24);
          var gr = ground(S, '#ffffff', 120, -1.15); gr.material.map = grass; gr.material.needsUpdate = true;
          for (var a2 = 0; a2 < 3; a2++) { var arc = new T.Mesh(new T.RingGeometry(14 + a2 * 9, 14.6 + a2 * 9, 64, 1, 0, Math.PI).rotateX(-Math.PI / 2), new T.MeshBasicMaterial({ color: '#9fcf73', transparent: true, opacity: .45, depthWrite: false })); arc.position.y = -1.13; S.scene.add(arc); }   /* the faint mown arcs */
          var fly = model(T); fly.position.copy(home(V)); fly.rotation.y = V.flip ? Math.PI : 0; S.root.add(fly); V.fly = fly;
          var sd = new T.Mesh(new T.CircleGeometry(.55, 24).rotateX(-Math.PI / 2), new T.MeshBasicMaterial({ color: '#000', transparent: true, opacity: .2, depthWrite: false })); sd.renderOrder = 4; S.root.add(sd); V.flyShadow = sd;
        },
        /* rebuild() hands over the fly's own moves: we fly the piece across instead of sliding it */
        carry: function (V, obj, f, t) {
          if (!V.fly || !V.S) return false;
          finish(V);
          var T = V.S.THREE, bb = new T.Box3().setFromObject(obj), h = Math.max(.3, Math.min(1.6, bb.max.y - bb.min.y || .8));
          obj.userData.sliding = true; obj.position.copy(V.S.sq2world(f));
          V.carry = { obj: obj, A: V.S.sq2world(f), B: V.S.sq2world(t), h: h, hover: h + .95, t0: performance.now(), P0: V.fly.position.clone(), cap: null };
          return true;
        },
        carryCaptured: function (V, obj) { if (V.carry && !V.carry.cap) { V.carry.cap = obj; V.carry.capS = obj.scale.x; } else if (obj.parent) obj.parent.remove(obj); },
        onFrame: function (V, dt, now) { if (V.fly) step(V, dt, now); }
      };
    })(),
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
        var g = S.ctx.V.geo, well = new T.Mesh(new T.BoxGeometry(g.files, 2, g.ranks), new T.MeshBasicMaterial({ color: '#030303' })); well.position.y = -1.32; S.root.add(well);   /* the abyss under the missing squares */
        for (var k = 0; k < 10; k++) { var hx = new T.Mesh(new T.RingGeometry(.12, .17, 6).rotateX(-Math.PI / 2), new T.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: .7 })); hx.position.set((k * 1.7) % g.files - g.files / 2 + .5, -.3, (k * 2.3) % g.ranks - g.ranks / 2 + .5); S.root.add(hx); }
        ground(S, '#c9c9c9', 80, -.56);
        /* the big grey analog chess clock standing beside the board (maxres2, m-3d audit 2026-11-26) */
        var ck = new T.Group(), gm = new T.MeshStandardMaterial({ color: '#8d8f93', roughness: .5 }); ck.position.set(g.files / 2 + 1.2, -.56, -g.ranks / 2 - .6); ck.rotation.y = 1.2; ck.scale.setScalar(.8); S.root.add(ck);
        var body = new T.Mesh(new T.BoxGeometry(1.6, 2.2, 4.4), gm); body.position.y = 1.1; body.castShadow = true; ck.add(body);
        var dial = canvasTile(T, 256, 256, function (c, w) { c.fillStyle = '#f4f4f4'; c.fillRect(0, 0, w, w); c.strokeStyle = '#222'; c.lineWidth = 6; c.beginPath(); c.arc(128, 128, 112, 0, Math.PI * 2); c.stroke();
          c.fillStyle = '#222'; c.font = '600 30px system-ui,sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; for (var h2 = 1; h2 <= 12; h2++) { var an = h2 / 12 * Math.PI * 2; c.fillText(String(h2), 128 + Math.sin(an) * 86, 128 - Math.cos(an) * 86); }
          c.lineWidth = 7; c.beginPath(); c.moveTo(128, 128); c.lineTo(128, 52); c.stroke(); c.lineWidth = 5; c.beginPath(); c.moveTo(128, 128); c.lineTo(150, 72); c.stroke(); });
        [-1, 1].forEach(function (k) { var f = new T.Mesh(new T.PlaneGeometry(1.8, 1.8).rotateY(-Math.PI / 2), new T.MeshBasicMaterial({ map: dial })); f.position.set(-.81, 1.15, k * 1.05); ck.add(f); });
        var btn = new T.Mesh(new T.BoxGeometry(.6, .15, .6), new T.MeshStandardMaterial({ color: '#2a2a2a' })); btn.position.set(0, 2.28, -1.05); ck.add(btn);
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
      camera: { phi: .62, fov: 40, dist: 8 }, background: '#1b1226', fog: { color: '#1b1226', near: 9, far: 22 }, ambient: .8, sun: 1.0, sunColor: '#b9a2ff', wallColor: '#4b4440', wallHeight: .55,
      lastColor: '#f0d24a', lastOpacity: .35, dotColor: '#f0d24a', dotOpacity: .55,
      follow: true,
      scenery: function (V, S, T) {
        var g = S.ctx.V.geo, tx = function (u) { return location.protocol === 'file:' ? null : canvasTex(V, u, { cover: true, size: 256 }); };
        var tl = tx('assets/modes/sGXmiyvZDE4/floor_light.jpg'), td = tx('assets/modes/sGXmiyvZDE4/floor_dark.jpg');
        if (tl && td) S.sqMeshes.forEach(function (m, i) { if (!m) return; var top = new T.MeshStandardMaterial({ map: (g.col(i) + g.row(i)) % 2 ? td : tl, roughness: .95 }); var mats = m.material.slice(); mats[2] = top; m.material = mats; });
        for (var k = 0; k < 3; k++) { var l = new T.PointLight('#ffb35a', 5, 7); l.position.set((k - 1) * 3.5, 2.2, -2 + k * 3); S.scene.add(l); }
        var pl = new T.PointLight('#8a5cff', 4, 14); pl.position.set(0, 5, 0); S.scene.add(pl);
        /* m-3d audit 2026-11-26 (maxres/1/3): the game's purple moonlit gloom + candles on the floor and ledges */
        S.scene.add(new T.HemisphereLight('#a58bff', '#2a1d3a', .9));
        var wax = new T.MeshStandardMaterial({ color: '#e8dcc8', roughness: .8 }), flame = new T.MeshBasicMaterial({ color: '#ffcf6a' });
        for (var c = 0; c < 8; c++) { var cx = (c % 4 - 1.5) * (g.files / 4 + .6) + (c > 3 ? .5 : 0), cz = (c > 3 ? 1 : -1) * (g.ranks / 2 + .45), cd = new T.Group();
          var st = new T.Mesh(new T.CylinderGeometry(.07, .08, .32, 10), wax); st.position.y = .16; cd.add(st); var fl = new T.Mesh(new T.SphereGeometry(.045, 8, 6), flame); fl.scale.y = 1.8; fl.position.y = .38; cd.add(fl);
          cd.position.set(cx, 0, cz); S.root.add(cd); if (c % 3 === 0) { var cl = new T.PointLight('#ffb35a', 2.2, 3.5); cl.position.set(cx, .6, cz); S.scene.add(cl); } }
      }
    }
  };
  /* Chess Ultimate with a normal chess army (dKBSZUzVQ1E uses the standard piece set): same island, turned pieces */
  PRESETS.cuStd = Object.assign({}, PRESETS.cu, { pieces: 'mesh', colors: { w: { color: '#f4f1ea', roughness: .5 }, b: { color: '#2a2a2e', roughness: .5 } } });
  /* a preset may follow a square (Petrified Pawns' big rooms): ease the camera target to the player's King */
  PRESETS.dungeon.onFrame = function (V, dt) {
    var S = V.S, st = S.ctx.game.state; if (!st) return; var k = -1;
    var h = S.ctx.game.hooks; if (h && h.camera) { try { k = h.camera(S.ctx.game.ctx); } catch (e) { k = -1; } }   /* the mode's own camera hook (selection, else the King) */
    if (k == null || k < 0) st.b.forEach(function (p, i) { if (p && p.c === S.ctx.human && p.t === 'K') k = i; });
    if (k >= 0) { var to = S.sq2world(k); to.y = 0; S.cam.target.lerp(to, animOn() ? Math.min(1, dt * 3) : 1); }
  };
  CM.view3d = { attach: attach, detach: detach, current: function () { return cur; }, presets: PRESETS };
})();
