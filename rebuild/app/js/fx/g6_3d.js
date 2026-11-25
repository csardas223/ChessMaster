/* g6_3d: the real-3D looks of two group-6 games, on the shared CM.scene3d module (ARCHITECTURE section 14).
   art-3d (2026-11-25). Loaded on demand by the mode files' onStart hooks; the engine, rules and 2D board are unchanged
   (the 2D board stays underneath; scene3d raycasts taps to squares). No WebGL -> attach resolves null, 2D stays.

   CM.g6_3d.tower(ctx, opts)   Who Takes the Crown (iqfHW2_sMmc, zDFsnRE_Gig): the tower is a column of upright 8x8 boards
     stacked one on top of the other, seen face-on (frames: iqfHW2_sMmc 1:03 / 10:03 / 11:57 / ~12:30 summit,
     zDFsnRE_Gig 5:01 + storyboard M2; stills in research/frames/video_thumbs). The floor you play is the live board;
     cleared floors below turn grey with the red MATED plate and a padlock, floors above show their next position in the
     orange/brick palette, the summit board is cream/grey-brown with the game's crown (cut from the summit frame) floating
     over it. Flat white / black piece silhouettes, teal last-move squares, plum void (Influencer) or olive wall + wood
     wainscot (Famous), drifting debris, height-in-feet HUD, a white pawn climber on the top edge of the live board that
     makes the super jump up when a floor is cleared.
   CM.g6_3d.beyond(ctx, opts)  Beyond the Board (xlErokL2-4c): monochrome floating platforms (grey/near-black checker on
     tall black blocks falling into fog), reachable squares glow white, low-poly Staunton pieces (player rook light grey
     with a white rim, black king with a red glow, crimson Eldritch King), red rings under enemy sentries, rotate the
     camera with the corner buttons / right click / Q E keys (90 degree eased turns). Level 1 is the opening board on a
     light-grey cyclorama with the wooden frame and the floating chess clock (0:40 frame). Frames: 0:40, 3:58, 9:17,
     12:22, 14:38, 20:05 + storyboard M6 (research/frames/video_thumbs/xlErokL2-4c_*). */
(function () {
  'use strict';
  var CM = window.CM;
  function calm() { return !(CM.settings && CM.settings.animMs && CM.settings.animMs()); }
  function lvIndex(ctx) { var h = ctx.hooks; return h && h.runLevel ? h.runLevel(ctx) : 0; }
  function parseFen(fen) {
    var rows = String(fen || '').split(' ')[0].split('/'), out = [];
    rows.forEach(function (r, y) { var x = 0; r.replace(/\d+|./g, function (t) { if (/\d/.test(t)) x += +t; else { if (t !== '*' && t !== '#') out.push({ x: x, y: y, t: t.toUpperCase(), c: t === t.toUpperCase() ? 'w' : 'b' }); x++; } return t; }); });
    return out;
  }
  function hud(id, css) {
    var wrap = document.getElementById('board-wrap'); if (!wrap) return null;
    var el = document.getElementById(id); if (el) el.remove();
    el = document.createElement('div'); el.id = id; el.className = 'g6-3d-hud';
    el.style.cssText = 'position:absolute;z-index:5;pointer-events:none;font:700 12px/1.2 "Press Start 2P",ui-monospace,monospace;color:#fff;text-shadow:0 1px 2px rgba(0,0,0,.7);' + (css || '');
    wrap.appendChild(el); return el;
  }
  function clearHud() { Array.prototype.slice.call(document.querySelectorAll('.g6-3d-hud')).forEach(function (e) { e.remove(); }); }

  /* ------------------------------------------------------------------ Who Takes the Crown ------------------------------------------------------------------ */
  var PAL = {
    live: ['#c1552f', '#912213'],     /* orange / brick (zDFsnRE_Gig 5:01, iqfHW2_sMmc 1:03) */
    done: ['#b4a998', '#6e675a'],     /* cleared floors turn grey (zDFsnRE_Gig 5:01 lower board) */
    top: ['#f8d6ad', '#98836a']       /* summit board (iqfHW2_sMmc ~12:30) */
  };
  var PITCH = 8.12;   /* boards sit edge to edge with a thin seam */
  function boardCanvas(ctx, fen, pal, opts) {
    var cv = document.createElement('canvas'); cv.width = cv.height = 512; var g = cv.getContext('2d'), q = 64;
    for (var y = 0; y < 8; y++) for (var x = 0; x < 8; x++) { g.fillStyle = (x + y) % 2 ? pal[1] : pal[0]; g.fillRect(x * q, y * q, q, q); }
    var pcs = parseFen(fen), file = location.protocol === 'file:', pend = [];
    pcs.forEach(function (p) {
      var url = !file && ctx.game.pieceImage ? ctx.game.pieceImage({ t: p.t, c: p.c }) : null;
      if (url) { pend.push(new Promise(function (res) { var im = new Image(); im.onload = function () { g.drawImage(im, p.x * q + 4, p.y * q + 4, q - 8, q - 8); res(); }; im.onerror = res; im.src = url; })); return; }
      g.font = '50px "DejaVu Sans","Segoe UI Symbol",serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineWidth = 5;
      g.strokeStyle = p.c === 'w' ? '#1b1b1b' : '#eee'; g.fillStyle = p.c === 'w' ? '#fff' : '#141414';
      var ch = { K: '\u265a', Q: '\u265b', R: '\u265c', B: '\u265d', N: '\u265e', P: '\u265f' }[p.t] || '\u265f';
      g.strokeText(ch, p.x * q + 32, p.y * q + 35); g.fillText(ch, p.x * q + 32, p.y * q + 35);
    });
    function plates() {
      if (opts && opts.mated) {   /* the red italic MATED plate on a grey panel, bottom centre (5:01 / summit frames) */
        g.fillStyle = 'rgba(120,120,120,.85)'; g.fillRect(2 * q, 7 * q + 6, 4 * q, q - 6);
        g.font = 'italic 900 48px Impact, "Arial Black", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
        g.lineWidth = 4; g.strokeStyle = '#fff'; g.strokeText('MATED', 4 * q, 7.55 * q); g.fillStyle = '#e0262c'; g.fillText('MATED', 4 * q, 7.55 * q);
        /* padlock on the corner square */
        g.fillStyle = '#5b5b5b'; g.fillRect(14, 30, 34, 26); g.strokeStyle = '#5b5b5b'; g.lineWidth = 6; g.beginPath(); g.arc(31, 30, 10, Math.PI, 0); g.stroke();
        g.fillStyle = '#ddd'; g.fillRect(29, 38, 4, 10);
      }
    }
    return { canvas: cv, ready: Promise.all(pend).then(plates), sync: plates };
  }
  function tower(ctx, opts) {
    opts = opts || {};
    var levels = ctx.params.levels || [], n = levels.length, k = lvIndex(ctx), top = k === n - 1;
    var pal = top ? PAL.top : PAL.live, bg = opts.room ? '#646130' : '#5a2f3d';
    var prevK = tower._last && tower._last.id === ctx.spec.id ? tower._last.k : k;
    tower._last = { id: ctx.spec.id, k: k };
    return CM.scene3d.attach(ctx, {
      board: { light: pal[0], dark: pal[1], edge: '#35120e', thickness: 0.3, basic: true },
      pieces: 'sprite', spriteFallback: 'glyph', spriteScale: .86, spriteLift: .06,
      lastColor: '#1f9e86', lastOpacity: .75,
      background: bg, ambient: 1.4, sun: .9,
      camera: { theta: 0, phi: Math.PI / 2 - 0.0001, dist: 13.4, target: [0, prevK * PITCH, 0], fov: 40 }
    }).then(function (S) {
      if (!S) return null;
      var T = S.THREE;
      S.root.rotation.x = Math.PI / 2;            /* the board stands upright, rank 8 at the top, facing the camera */
      S.root.position.y = k * PITCH;
      /* the other floors */
      for (var j = 0; j < n; j++) {
        if (j === k) continue;
        var done = j < k, p2 = j === n - 1 ? PAL.top : done ? PAL.done : PAL.live;
        var bc = boardCanvas(ctx, levels[j].fen, p2, { mated: done }), tx = new T.CanvasTexture(bc.canvas); tx.colorSpace = T.SRGBColorSpace;
        bc.ready.then((function (t) { return function () { t.needsUpdate = true; }; })(tx));
        var edge = new T.MeshBasicMaterial({ color: '#35120e' }), face = new T.MeshBasicMaterial({ map: tx });
        var box = new T.Mesh(new T.BoxGeometry(8, 8, 0.3), [edge, edge, edge, edge, face, edge]);
        box.position.set(0, j * PITCH, -0.15); S.scene.add(box);
      }
      /* the crown over the summit board (the game's crown, cut from the summit frame) */
      var crownUrl = 'assets/modes/' + ctx.spec.id + '/crown3d.png', ctex = S.tex(crownUrl), crown;
      if (ctex) crown = new T.Sprite(new T.SpriteMaterial({ map: ctex, transparent: true }));
      else {   /* file://: a flat gold crown drawn on a canvas */
        var cc = document.createElement('canvas'); cc.width = 256; cc.height = 190; var g = cc.getContext('2d');
        g.fillStyle = '#a8243a'; [[70, 95], [128, 85], [186, 95]].forEach(function (b) { g.beginPath(); g.arc(b[0], b[1], 52, 0, Math.PI * 2); g.fill(); });
        g.fillStyle = '#ffc44f'; g.fillRect(36, 128, 184, 40); g.fillRect(122, 10, 12, 40); g.fillRect(110, 20, 36, 10);
        var ct = new T.CanvasTexture(cc); ct.colorSpace = T.SRGBColorSpace; crown = new T.Sprite(new T.SpriteMaterial({ map: ct, transparent: true }));
      }
      crown.scale.set(5.4, 3.95, 1); var crownY = (n - 1) * PITCH + 4 + 2.6; crown.position.set(0, crownY, 0.4); S.scene.add(crown);
      /* backdrop: olive wall + wood wainscot (Famous room) or nothing (plum void) */
      if (opts.room) {
        var wood = new T.Mesh(new T.PlaneGeometry(80, 14), new T.MeshBasicMaterial({ color: '#682708' })); wood.position.set(0, -4 - 7 + 3.2, -6); S.scene.add(wood);
        for (var w = -5; w <= 5; w++) { var pn = new T.Mesh(new T.PlaneGeometry(4.2, 5), new T.MeshBasicMaterial({ color: '#5a2106' })); pn.position.set(w * 5.4, -5.5, -5.98); S.scene.add(pn); }
      }
      /* drifting debris (plum frames): a few dark flecks, still under reduced motion */
      var deb = [], dm = new T.MeshBasicMaterial({ color: opts.room ? '#4b4823' : '#3e1f29' });
      for (var d = 0; d < 26; d++) { var m = new T.Mesh(new T.PlaneGeometry(.12, .07), dm); m.position.set((Math.random() - .5) * 26, k * PITCH + (Math.random() - .5) * 16, -2 - Math.random() * 3); m.rotation.z = Math.random() * 3; S.scene.add(m); deb.push(m); }
      /* the climber: a white pawn on the top edge of the live board; jumps up when a floor was cleared */
      var climb = new T.Sprite(new T.SpriteMaterial({ map: S.tex(ctx.game.pieceImage({ t: 'P', c: 'w' })) || (function () { var c2 = document.createElement('canvas'); c2.width = c2.height = 64; var g2 = c2.getContext('2d'); g2.font = '52px "DejaVu Sans",serif'; g2.textAlign = 'center'; g2.textBaseline = 'middle'; g2.lineWidth = 5; g2.strokeStyle = '#1b1b1b'; g2.strokeText('\u265f', 32, 34); g2.fillStyle = '#fff'; g2.fillText('\u265f', 32, 34); var t2 = new T.CanvasTexture(c2); t2.colorSpace = T.SRGBColorSpace; return t2; })(), transparent: true }));
      climb.scale.set(.8, .8, 1); var cy = k * PITCH + 4 + .38; climb.position.set(1.5, cy, .25); S.scene.add(climb);
      /* HUD: height in feet (top-left) + floor label (top-centre), the game's pixel HUD */
      var ft = hud('g6-3d-ft', 'left:8px;top:6px'), lab = hud('g6-3d-lab', 'left:0;right:0;top:6px;text-align:center');
      var feet = function (y) { return (Math.max(0, y) * 6.3 + 8.69).toFixed(2) + ' ft'; };
      if (lab) lab.textContent = (opts.stack || 'Influencer') + ' ' + (k + 1) + '/' + n;
      if (ft) ft.textContent = feet(prevK * PITCH);
      if (prevK !== k) {   /* the super jump: camera and climber rise from the floor you cleared */
        var y0 = prevK * PITCH + 4 + .38;
        climb.position.y = y0;
        S.tween(function (e) { climb.position.y = y0 + (cy - y0) * e + Math.sin(e * Math.PI) * 1.6; if (ft) ft.textContent = feet(prevK * PITCH + (k - prevK) * PITCH * e); }, 1100);
      } else if (ft) ft.textContent = feet(k * PITCH);
      S.setCamera(top ? { target: [0, k * PITCH + 2.3, 0], dist: 18.2 } : { target: [0, k * PITCH, 0] }, prevK !== k ? 1100 : 0);   /* the summit view takes in the crown */
      var t0 = performance.now();
      S.o.onFrame = function (S2, dt, now) {
        if (calm()) return;
        var s = (now - t0) / 1000;
        crown.position.y = crownY + Math.sin(s * 1.2) * .08;
        deb.forEach(function (m, i) { m.position.y += dt * (.05 + (i % 5) * .02); m.rotation.z += dt * .3; if (m.position.y > k * PITCH + 9) m.position.y -= 18; });
      };
      return S;
    });
  }

  /* ------------------------------------------------------------------ Beyond the Board ------------------------------------------------------------------ */
  function beyond(ctx) {
    var k = lvIndex(ctx), first = k === 0, last = k === (ctx.params.levels || []).length - 1;
    var bg = first ? '#c2c2c2' : '#2b2b2e', g = ctx.V.geo;
    /* stepped heights for the rook levels: rows rise in bands away from you, like the stepped bridges in the frames */
    var heightOf = first ? null : function (c, i) { var r = g.row(i); return r <= 2 ? 1.0 : r <= 4 ? 0.5 : 0; };
    var theta0 = first ? 0.35 : 0.6;
    return CM.scene3d.attach(ctx, {
      board: { light: first ? '#e8e6e2' : '#c6c6c6', dark: first ? '#1f1f21' : '#111112', edge: first ? '#7f5340' : '#1a1a1b', thickness: first ? 0.45 : 7 },
      pieces: 'mesh', highlights: false,
      colors: { w: { color: '#d8d8d8', emissive: '#3a3a3a', roughness: .7 }, b: { color: '#3a3a3c', roughness: .75 } },
      pieceStyle: function (c, p) {
        var d = c.V.def(p.t) || {};
        if (p.c === 'b' && d.royal) return last ? { color: '#b0202a', emissive: '#5a0c12' } : { color: '#1c1c1e', emissive: '#3a0508' };
        return null;
      },
      heightOf: heightOf,
            background: bg, fog: first ? null : { color: bg, near: 14, far: 34 }, ambient: first ? 1.3 : 0.9, sun: 1.5,
      camera: { theta: theta0, phi: first ? 0.95 : 0.9, dist: first ? 17 : 17, target: first ? [0.7, 0, -0.4] : [0, 0.2, 0.6], fov: 40 }
    }).then(function (S) {
      if (!S) return null;
      var T = S.THREE, G = ctx.game;
      /* opening board: the wooden frame + the floating chess clock (0:40) */
      if (first) {
        var frame = new T.Mesh(new T.BoxGeometry(g.files + .7, .42, g.ranks + .7), new T.MeshStandardMaterial({ color: '#8a5a44', roughness: .8 }));
        frame.position.y = -.26; frame.receiveShadow = true; S.root.add(frame);
        var ctex = S.tex('assets/modes/xlErokL2-4c/chess_clock.png');
        var clock = ctex ? new T.Sprite(new T.SpriteMaterial({ map: ctex, transparent: true })) : new T.Mesh(new T.BoxGeometry(2.4, 1.3, .9), new T.MeshStandardMaterial({ color: '#6b6b6b' }));
        if (ctex) { ctex = ctex.clone(); ctex.repeat.set(1, .78); ctex.needsUpdate = true; clock.material.map = ctex; clock.scale.set(2.4, 1.87, 1); }   /* skip the sprite's black top band */
        clock.position.set(g.files / 2 + 1.3, 1.0, -2.6); S.root.add(clock);
      }
      /* glow layer: reachable squares glow white (the frames' lit path tiles), selection outline, red rings under sentries */
      var glow = new T.Group(), sig = ''; S.root.add(glow);
      /* blockers (the Eldritch arena pillar) stand as tall black columns */
      var pm = new T.MeshStandardMaterial({ color: '#141415', roughness: .9 });
      G.state.b.forEach(function (p, i) { var d = p && ctx.V.def(p.t); if (!d || !d.blocker) return; var col = new T.Mesh(new T.BoxGeometry(1, 1.4, 1), pm); col.position.copy(S.sq2world(i, .7)); col.castShadow = true; col.userData.sq = i; S.root.add(col); });
      var gm = new T.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: .92 }), gm2 = new T.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: .45 });
      var rm = new T.MeshBasicMaterial({ color: '#e0333a', transparent: true, opacity: .85, side: T.DoubleSide });
      var tile = new T.PlaneGeometry(.62, .62).rotateX(-Math.PI / 2), ring = new T.RingGeometry(.36, .45, 32).rotateX(-Math.PI / 2), frameG = new T.RingGeometry(.42, .5, 4, 1, Math.PI / 4).rotateX(-Math.PI / 2);
      function rebuildGlow() {
        var st = G.state; if (!st) return;
        var s = [G.sel, G.history ? G.history.length : 0, st.b.map(function (p) { return p ? p.t + p.c : ''; }).join(',')].join('|'); if (s === sig) return; sig = s;
        while (glow.children.length) glow.remove(glow.children[0]);
        var L = G.last; if (L && L.f >= 0) [L.f, L.t].forEach(function (i) { var m = new T.Mesh(frameG, gm2); m.position.copy(S.sq2world(i, .01)); m.userData.sq = i; glow.add(m); });
        if (G.sel >= 0) {
          var sm = new T.Mesh(frameG, gm); sm.position.copy(S.sq2world(G.sel, .012)); sm.userData.sq = G.sel; glow.add(sm);
          (G.moves || []).forEach(function (m) { if (m.f !== G.sel) return; var t = new T.Mesh(m.cap ? ring : tile, m.cap ? rm : gm); t.position.copy(S.sq2world(m.t, .012)); t.userData.sq = m.t; glow.add(t); });
        }
        if (!first) st.b.forEach(function (p, i) { if (!p || p.c !== 'b') return; var d = ctx.V.def(p.t) || {}; if (d.blocker || d.royal) return; var r = new T.Mesh(ring, rm); r.position.copy(S.sq2world(i, .011)); glow.add(r); });
      }
      /* embers: slow white motes rising out of the void (3:58, 20:05); none under reduced motion */
      var em = [], emm = new T.MeshBasicMaterial({ color: first ? '#ffffff' : '#e8e8e8', transparent: true, opacity: .8 });
      if (!first) for (var e = 0; e < 40; e++) { var mo = new T.Mesh(new T.SphereGeometry(.03, 6, 4), emm); mo.position.set((Math.random() - .5) * 16, -4 + Math.random() * 9, (Math.random() - .5) * 16); S.scene.add(mo); em.push(mo); }
      S.o.onFrame = function (S2, dt) {
        rebuildGlow();
        if (calm()) return;
        em.forEach(function (m, i) { m.position.y += dt * (.12 + (i % 4) * .04); if (m.position.y > 6) m.position.y = -4; });
      };
      /* camera rotate: corner buttons, right click, Q / E (eased 90 degree turns; snaps under reduced motion) */
      var wrap = document.getElementById('board-wrap'), old = document.getElementById('g6-3d-rot'); if (old) old.remove();
      var bar = document.createElement('div'); bar.id = 'g6-3d-rot'; bar.className = 'g6-3d-hud';
      bar.style.cssText = 'position:absolute;right:6px;bottom:6px;z-index:6;display:flex;gap:6px';
      [['\u27f2', 1, 'Rotate camera left'], ['\u27f3', -1, 'Rotate camera right']].forEach(function (b) {
        var bt = document.createElement('button'); bt.type = 'button'; bt.textContent = b[0]; bt.title = b[2]; bt.setAttribute('aria-label', b[2]);
        bt.style.cssText = 'width:34px;height:34px;border-radius:8px;border:1px solid rgba(255,255,255,.45);background:rgba(20,20,22,.6);color:#fff;font-size:18px;line-height:1;cursor:pointer';
        bt.onclick = function (ev) { ev.stopPropagation(); S.rotate(b[1] * Math.PI / 2, 500); };
        bar.appendChild(bt);
      });
      if (wrap) wrap.appendChild(bar);
      S.canvas.addEventListener('contextmenu', function (ev) { ev.preventDefault(); S.rotate(Math.PI / 2, 500); });
      var key = function (ev) { if (CM.scene3d.current() !== S) { document.removeEventListener('keydown', key); return; } if (/input|textarea/i.test((ev.target || {}).tagName || '')) return; if (ev.key === 'q' || ev.key === 'Q') S.rotate(Math.PI / 2, 500); else if (ev.key === 'e' || ev.key === 'E') S.rotate(-Math.PI / 2, 500); };
      document.addEventListener('keydown', key);
      S.cleanupKey = key;
      return S;
    });
  }

  function detach() { clearHud(); var r = document.getElementById('g6-3d-rot'); if (r) r.remove(); var c = CM.scene3d.current(); if (c && c.cleanupKey) document.removeEventListener('keydown', c.cleanupKey); CM.scene3d.detach(); }
  CM.g6_3d = { tower: tower, beyond: beyond, detach: detach };
})();
