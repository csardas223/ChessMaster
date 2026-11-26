/* BoardView: renders any files x ranks board (with holes), coordinates, highlights, legal-move dots,
   drag-and-drop + click-to-move, right-click square marks, and eased piece motion.

   Model passed to render():
     { files, ranks, flip, squares: [ { valid, piece: {src, key, badge, cls, label} | null, cls: 'is-last is-sel ...', html: '' } ] }
   Squares are DOM children of the board in DISPLAY order (top-left first), so children[k] is
   square (flip ? size-1-k : k) on a rectangular board, the layout the legacy decorate() relies on.

   Motion: after each render the view diffs the previous piece placement against the new one, slides
   pieces that moved (hint pairs first, then nearest same-looking piece), fades captured pieces out and
   new pieces in. Durations follow settings.animMs() (0 when reduced motion is on). */
(function () {
  'use strict';
  var CM = window.CM, U = CM.util;

  function BoardView(boardEl, fxEl, opts) {
    this.el = boardEl; this.fx = fxEl; this.opts = opts || {};
    this.files = 0; this.ranks = 0; this.flip = false; this.prev = null; this.marks = {}; this.drag = null; this.noClickUntil = 0;
    this.model = null; this.focusI = 0;
    this.cb = { canDrag: function () { return false; }, onTap: function () { }, onDrop: function () { return false; }, onDragStart: function () { }, onDoubleTap: null, onDoubleRightTap: null, tapDelay: null };
    this._pending = null;
    this._bind();
    this._bindZoom();
  }
  var P = BoardView.prototype;
  P.on = function (cbs) { Object.assign(this.cb, cbs); return this; };
  P.dispToSq = function (k) {
    var dr = Math.floor(k / this.files), dc = k % this.files;
    var r = this.flip ? this.ranks - 1 - dr : dr, c = this.flip ? this.files - 1 - dc : dc;
    return r * this.files + c;
  };
  P.sqToDisp = function (i) { return this.flip ? this.files * this.ranks - 1 - i : i; };
  P.sqEl = function (i) { return this.el.children[this.sqToDisp(i)] || null; };
  P.pieceEl = function (i) { var s = this.sqEl(i); return s && s.querySelector(':scope > .pc'); };
  P.rectOf = function (i) { var s = this.sqEl(i); return s ? s.getBoundingClientRect() : null; };

  /* layout from GameUI: pixel size of the visible window and how many squares it shows (viewport for big boards).
     L.zoom = { active, def } switches on the universal zoom/pan camera (boards bigger than 8x8 that do not fit
     legibly, or that declare a viewport); standard boards keep the fixed layout below, unchanged. */
  P.setLayout = function (L) {
    var prevL = this.L; this.L = L; var st = this.el.parentNode;
    this.zoomOn = !!(L.zoom && L.zoom.active && this.files);
    if (this.zoomOn) { this._zoomLayout(L, prevL); return; }
    this.cam = null; this._showCtl(false); st.classList.remove('is-zoomable');
    var sqw = L.bw / L.vf, sqh = L.bh / L.vr;
    st.style.setProperty('--sw', (sqw * this.files) + 'px'); st.style.setProperty('--sh', (sqh * this.ranks) + 'px');
    this.el.style.setProperty('--sqpx', Math.round(sqw) + 'px');
    if (this.camSq != null) this.follow(this.camSq, true); else { st.style.setProperty('--tx', '0px'); st.style.setProperty('--ty', '0px'); }
  };
  /* camera: keep display square sq near the centre of the visible window */
  P.follow = function (sq, instant) {
    if (this.zoomOn) { this._zoomFollow(sq, instant); return; }
    this.camSq = sq; var L = this.L; if (!L || sq == null || sq < 0) return;
    var st = this.el.parentNode, k = this.sqToDisp(sq), dc = k % this.files, dr = Math.floor(k / this.files);
    var sqw = L.bw / L.vf, sqh = L.bh / L.vr, sw = sqw * this.files, sh = sqh * this.ranks;
    var tx = Math.min(0, Math.max(L.bw - sw, L.bw / 2 - (dc + 0.5) * sqw)), ty = Math.min(0, Math.max(L.bh - sh, L.bh / 2 - (dr + 0.5) * sqh));
    tx = Math.round(tx); ty = Math.round(ty);
    if (st._tx === tx && st._ty === ty) return; st._tx = tx; st._ty = ty;
    st.classList.toggle('is-panning', !instant && CM.settings.animMs() > 0);
    st.style.setProperty('--tx', tx + 'px'); st.style.setProperty('--ty', ty + 'px');
  };

  /* ---------------- universal zoom / pan camera (big boards) ----------------
     The camera is { s: square size in px, tx, ty: stage offset in the window, user: the player moved it, set: placed
     for this board yet }. Zoom re-lays the grid at the new square size (no CSS scale), so pieces stay crisp and every
     getBoundingClientRect-based consumer (drag, hit-testing, VFX, arrows, promotion picker) stays correct. */
  P._zoomLayout = function (L, prevL) {
    var st = this.el.parentNode, F = this.files, R = this.ranks;
    st.classList.remove('is-panning'); st.classList.add('is-zoomable'); this._showCtl(true, L.zoom.place);
    var fit = Math.min(L.bw / F, L.bh / R);
    this.zmin = fit; this.zdef = Math.max(fit, L.zoom.def || fit); this.zmax = Math.max(this.zdef * 2.5, 88);
    var c = this.cam;
    if (c && c.user && prevL) {   /* resize: keep the board point at the window centre and the zoom (clamped) */
      var bx = (prevL.bw / 2 - c.tx) / c.s, by = (prevL.bh / 2 - c.ty) / c.s;
      c.s = this._clampS(c.s); c.tx = L.bw / 2 - bx * c.s; c.ty = L.bh / 2 - by * c.s;
    } else {
      this.cam = c = { s: this.zdef, tx: 0, ty: 0, user: false, set: c ? c.set : false };
      this._centerOnDisp(this.camSq != null && this.camSq >= 0 ? this.sqToDisp(this.camSq) : this._homeDisp(), c);
    }
    this._stopTween(); this._applyCam();
  };
  P._clampS = function (s) { return Math.max(this.zmin, Math.min(this.zmax, s)); };
  P._homeDisp = function () { return (this.ranks - 1) * this.files + Math.floor(this.files / 2); };  /* bottom centre: the player's side */
  P._centerOnDisp = function (k, c) {
    var L = this.L; c = c || this.cam; var dc = k % this.files, dr = Math.floor(k / this.files);
    c.tx = L.bw / 2 - (dc + 0.5) * c.s; c.ty = L.bh / 2 - (dr + 0.5) * c.s; return c;
  };
  P._clampCam = function (c) {
    var L = this.L, sw = c.s * this.files, sh = c.s * this.ranks;
    c.tx = sw <= L.bw ? (L.bw - sw) / 2 : Math.min(0, Math.max(L.bw - sw, c.tx));
    c.ty = sh <= L.bh ? (L.bh - sh) / 2 : Math.min(0, Math.max(L.bh - sh, c.ty));
    return c;
  };
  P._applyCam = function () {
    var c = this._clampCam(this.cam), st = this.el.parentNode;
    var sw = c.s * this.files, sh = c.s * this.ranks, tx = Math.round(c.tx), ty = Math.round(c.ty);
    st._tx = tx; st._ty = ty;
    st.style.setProperty('--sw', sw + 'px'); st.style.setProperty('--sh', sh + 'px');
    st.style.setProperty('--tx', tx + 'px'); st.style.setProperty('--ty', ty + 'px');
    this.el.style.setProperty('--sqpx', Math.round(c.s) + 'px');
    this._syncCtl(); this._miniMap();
    if (this.onCamera) this.onCamera(c);
  };
  P._stopTween = function () { if (this._tw) { cancelAnimationFrame(this._tw); this._tw = 0; } };
  /* move the camera to (s, tx, ty); eased unless instant or reduced motion */
  P._camTo = function (t, instant) {
    var c = this.cam; if (!c || this._gesture) return; this._stopTween();   /* never fight a finger on the board */
    t = this._clampCam({ s: this._clampS(t.s), tx: t.tx, ty: t.ty });
    var ms = instant ? 0 : Math.min(320, Math.max(180, CM.settings.animMs() * 1.3)), self = this;
    if (!ms || !CM.settings.animMs()) { c.s = t.s; c.tx = t.tx; c.ty = t.ty; this._applyCam(); return; }
    var a = { s: c.s, tx: c.tx, ty: c.ty }, t0 = performance.now();
    var step = function (now) {
      var k = Math.min(1, (now - t0) / ms), e = 1 - Math.pow(1 - k, 3);
      c.s = a.s + (t.s - a.s) * e; c.tx = a.tx + (t.tx - a.tx) * e; c.ty = a.ty + (t.ty - a.ty) * e;
      self._applyCam(); self._tw = k < 1 ? requestAnimationFrame(step) : 0;
    };
    this._tw = requestAnimationFrame(step);
  };
  /* zoom by factor around a window-local point (default: the window centre) */
  P.zoomBy = function (f, px, py, instant) {
    if (!this.zoomOn) return; var c = this.cam, L = this.L;
    if (px == null) { px = L.bw / 2; py = L.bh / 2; }
    var ns = this._clampS(c.s * f), bx = (px - c.tx) / c.s, by = (py - c.ty) / c.s;
    c.user = true; this._mmLive = true; this._camTo({ s: ns, tx: px - bx * ns, ty: py - by * ns }, instant);
  };
  P.zoomFit = function () { if (!this.zoomOn) return; this.cam.user = true; this._mmLive = true; this._camTo({ s: this.zmin, tx: 0, ty: 0 }); };
  P.isFit = function () { return !!(this.zoomOn && this.cam && this.cam.s <= this.zmin * 1.02); };
  /* back to the default view: default zoom, centred on the followed square / the player's king */
  P.zoomReset = function (instant) {
    if (!this.zoomOn) return; var c = this.cam; c.user = false;
    var sq = this.camSq != null && this.camSq >= 0 ? this.camSq : this._homeSq();
    var t = this._centerOnDisp(sq != null && sq >= 0 ? this.sqToDisp(sq) : this._homeDisp(), { s: this.zdef, tx: 0, ty: 0 });
    this._camTo(t, instant);
  };
  P.resetCam = function () { if (this.cam) { this.cam.user = false; this.cam.set = false; } this._lastSeen = null; };
  P._homeSq = function () { var m = this.model; if (!m || m.home == null) return null; var h = typeof m.home === 'function' ? m.home() : m.home; return h != null && h >= 0 ? h : null; };
  /* pan the least needed so board square sq (and a margin of half a square) is inside the window */
  P.ensureVisible = function (sq, instant) {
    if (!this.zoomOn || sq == null || sq < 0) return; var c = this.cam, L = this.L, k = this.sqToDisp(sq);
    var dc = k % this.files, dr = Math.floor(k / this.files), m = Math.min(c.s * 0.5, L.bw / 4);
    var x0 = c.tx + dc * c.s, y0 = c.ty + dr * c.s, tx = c.tx, ty = c.ty;
    if (x0 < m) tx += m - x0; else if (x0 + c.s > L.bw - m) tx -= x0 + c.s - (L.bw - m);
    if (y0 < m) ty += m - y0; else if (y0 + c.s > L.bh - m) ty -= y0 + c.s - (L.bh - m);
    if (Math.abs(tx - c.tx) < 0.5 && Math.abs(ty - c.ty) < 0.5) return;
    this._camTo({ s: c.s, tx: tx, ty: ty }, instant);
  };
  P._zoomFollow = function (sq, instant) {
    var prev = this.camSq; this.camSq = sq; if (sq == null || sq < 0 || !this.cam) return;
    var c = this.cam;
    if (c.user) { if (sq !== prev) this.ensureVisible(sq, instant); return; }   /* the player is steering: only reveal */
    var t = this._centerOnDisp(this.sqToDisp(sq), { s: c.s, tx: 0, ty: 0 });
    this._camTo(t, instant);
  };
  /* after every render: place the camera once per board, then follow / reveal off-screen moves */
  P._zoomAfterRender = function (model, o, flipChanged) {
    var c = this.cam; if (!c) return;
    var last = [];
    for (var i = 0; i < model.squares.length; i++) { var q = model.squares[i]; if (q && q.cls && /(^| )is-last( |$)/.test(q.cls)) last.push(i); }
    var lastKey = last.join(','), lastChanged = lastKey !== this._lastSeen; this._lastSeen = lastKey;
    if (!c.set || flipChanged) {
      c.set = true;
      var t = model.follow != null && model.follow >= 0 ? model.follow : this._homeSq();
      if (t == null && last.length) t = last[last.length - 1];
      this.camSq = model.follow != null ? model.follow : this.camSq;
      this._camTo(this._centerOnDisp(t != null ? this.sqToDisp(t) : this._homeDisp(), { s: c.s, tx: 0, ty: 0 }), true);
      return;
    }
    if (model.follow != null) this._zoomFollow(model.follow, !!o.instant);
    /* a move that landed off-screen (bot, Key, gravity...): glide just enough to show it */
    if (lastChanged && last.length && !o.instant && (c.user || model.follow == null)) {
      var self = this; last.forEach(function (sq) { self.ensureVisible(sq, false); });
      if (last.length > 1) this.ensureVisible(last[last.length - 1], false);
    }
  };

  /* on-board controls: zoom in / out / whole board, plus a minimap that shows while the camera moves */
  P._makeCtl = function () {
    var wrap = this.el.closest && this.el.closest('.board-wrap'); if (!wrap || this.ctl) return;
    var self = this, d = document.createElement('div');
    d.className = 'zoomctl'; d.hidden = true; d.setAttribute('role', 'group'); d.setAttribute('aria-label', 'Board zoom');
    if (this.el.id) d.setAttribute('aria-controls', this.el.id);
    var ico = {
      in: '<path d="M10 4v12M4 10h12"/>', out: '<path d="M4 10h12"/>',
      fit: '<path d="M3 7V3h4M13 3h4v4M17 13v4h-4M7 17H3v-4"/>'
    };
    d.innerHTML = ['in', 'out', 'fit'].map(function (k) {
      var lab = { in: 'Zoom in', out: 'Zoom out', fit: 'Show whole board' }[k], key = { in: '+', out: '-', fit: '0' }[k];
      return '<button type="button" class="zoomctl__b zoomctl__b--' + k + '" data-z="' + k + '" aria-label="' + lab + '" aria-keyshortcuts="' + key + '" title="' + lab + '"><svg viewBox="0 0 20 20" aria-hidden="true">' + ico[k] + '</svg></button>';
    }).join('');
    d.addEventListener('pointerdown', function (e) { e.stopPropagation(); });
    d.addEventListener('dblclick', function (e) { e.preventDefault(); });   /* fast repeated taps on + never zoom the page */
    d.addEventListener('click', function (e) {
      var b = e.target.closest('[data-z]'); if (!b) return; e.stopPropagation();
      var z = b.getAttribute('data-z');
      if (z === 'in') self.zoomBy(1.4); else if (z === 'out') self.zoomBy(1 / 1.4);
      else if (self.isFit()) self.zoomReset(); else self.zoomFit();
    });
    var mm = document.createElement('div'); mm.className = 'zoommap'; mm.setAttribute('aria-hidden', 'true'); mm.innerHTML = '<i></i>';
    wrap.appendChild(d); wrap.appendChild(mm); this.ctl = d; this.mini = mm;
  };
  /* place: 'overlay' (on the board, mouse windows too narrow for a gutter), 'side' (beside the board: desktop, phone
     landscape) or 'row' (a bar under the board on phones in portrait); off the board the buttons never cover a square */
  P._showCtl = function (on, place) {
    this._makeCtl(); if (!this.ctl) return;
    this.ctl.hidden = !on;
    var pl = on ? (place || 'overlay') : '';
    ['overlay', 'side', 'row'].forEach(function (k) { this.ctl.classList.toggle('zoomctl--' + k, pl === k); }, this);
    if (!on && this.mini) this.mini.classList.remove('is-show');
  };
  P._syncCtl = function () {
    if (!this.ctl || !this.cam) return; var c = this.cam, q = function (k) { return this.ctl.querySelector('[data-z="' + k + '"]'); }.bind(this);
    q('in').disabled = c.s >= this.zmax - 0.01; q('out').disabled = c.s <= this.zmin + 0.01;
    var fit = this.isFit(), fb = q('fit'); fb.classList.toggle('is-on', fit); fb.setAttribute('aria-pressed', fit ? 'true' : 'false');
    var lab = fit ? 'Back to default view' : 'Show whole board'; fb.title = lab; fb.setAttribute('aria-label', lab);
  };
  P._miniMap = function () {
    var mm = this.mini, c = this.cam, L = this.L; if (!mm || !c || !c.set) return;
    var sw = c.s * this.files, sh = c.s * this.ranks;
    if (sw <= L.bw + 1 && sh <= L.bh + 1) { mm.classList.remove('is-show'); return; }   /* whole board visible: no map */
    var W = 72, H = Math.max(20, Math.round(W * this.ranks / this.files)); if (H > 72) { H = 72; W = Math.max(20, Math.round(H * this.files / this.ranks)); }
    mm.style.width = W + 'px'; mm.style.height = H + 'px';
    var r = mm.firstChild, x = Math.max(0, -c.tx / sw), y = Math.max(0, -c.ty / sh);
    r.style.left = (x * 100) + '%'; r.style.top = (y * 100) + '%';
    r.style.width = (Math.min(1, L.bw / sw) * 100) + '%'; r.style.height = (Math.min(1, L.bh / sh) * 100) + '%';
    if (!c.set || !this._mmLive) return;
    mm.classList.add('is-show'); clearTimeout(this._mmT);
    this._mmT = setTimeout(function () { mm.classList.remove('is-show'); }, 1100);
  };

  /* gestures on the window: pinch / two-finger pan, one-finger (or mouse) drag that starts off a movable piece pans,
     space- or middle-button-drag pans anywhere, wheel pans and ctrl/trackpad-pinch wheel zooms. A drag that starts on
     a piece you can move still moves it; a second finger turns it into a pinch instead. */
  P._bindZoom = function () {
    var self = this, vp = this.el.parentNode && this.el.parentNode.parentNode; if (!vp) return;
    var pts = {}, pan = null, pinch = null, raf = 0;
    var local = function (x, y) { var r = vp.getBoundingClientRect(); return { x: x - r.left, y: y - r.top }; };
    var n = function () { return Object.keys(pts).length; };
    var live = function () { self._mmLive = true; };
    var flush = function () { if (raf) return; raf = requestAnimationFrame(function () { raf = 0; self._applyCam(); }); };
    var startPinch = function () {
      var ids = Object.keys(pts); if (ids.length < 2) return;
      var a = pts[ids[0]], b = pts[ids[1]], m = local((a.x + b.x) / 2, (a.y + b.y) / 2), c = self.cam;
      pinch = { ids: [ids[0], ids[1]], d0: Math.max(10, Math.hypot(a.x - b.x, a.y - b.y)), s0: c.s, bx: (m.x - c.tx) / c.s, by: (m.y - c.ty) / c.s };
      pan = null; self._stopTween(); c.user = true; self._gesture = true; live();
    };
    var startPan = function (id, x, y, now) { pan = { id: id, x0: x, y0: y, tx0: self.cam.tx, ty0: self.cam.ty, on: !!now }; if (now) { self._stopTween(); self.cam.user = true; self._gesture = true; vp.classList.add('is-grabbing'); live(); } };
    vp.addEventListener('pointerdown', function (e) {
      if (!self.zoomOn || !self.cam) return;
      if (e.pointerType === 'mouse' && e.button === 2) return;
      pts[e.pointerId] = { x: e.clientX, y: e.clientY };
      if (n() >= 2) {
        if (self.drag && self._endDrag) self._endDrag(null, true);   /* second finger: this is a pinch, not a move */
        if (self._pending) { clearTimeout(self._pending.timer); self._pending = null; }
        self.noClickUntil = performance.now() + 100000;
        Object.keys(pts).forEach(function (id) { try { vp.setPointerCapture(+id); } catch (_) { } });
        startPinch(); return;
      }
      var force = self.spaceHeld || (e.pointerType === 'mouse' && e.button === 1);
      if (self.drag && self.drag.id === e.pointerId && !force) return;   /* a piece drag owns this pointer */
      if (force) { e.preventDefault(); try { vp.setPointerCapture(e.pointerId); } catch (_) { } }
      startPan(e.pointerId, e.clientX, e.clientY, force);
    });
    vp.addEventListener('pointermove', function (e) {
      if (!pts[e.pointerId]) return;
      pts[e.pointerId] = { x: e.clientX, y: e.clientY };
      var c = self.cam; if (!c) return;
      if (pinch) {
        var a = pts[pinch.ids[0]], b = pts[pinch.ids[1]]; if (!a || !b) return;
        var m = local((a.x + b.x) / 2, (a.y + b.y) / 2), d = Math.max(10, Math.hypot(a.x - b.x, a.y - b.y));
        c.s = self._clampS(pinch.s0 * d / pinch.d0); c.tx = m.x - pinch.bx * c.s; c.ty = m.y - pinch.by * c.s; flush(); return;
      }
      if (!pan || pan.id !== e.pointerId || (self.drag && self.drag.id === e.pointerId)) return;
      var dx = e.clientX - pan.x0, dy = e.clientY - pan.y0;
      if (!pan.on) {
        if (Math.hypot(dx, dy) < (e.pointerType === 'touch' ? 8 : 5)) return;
        pan.on = true; self._stopTween(); c.user = true; self._gesture = true; pan.tx0 = c.tx; pan.ty0 = c.ty; pan.x0 = e.clientX; pan.y0 = e.clientY; dx = dy = 0;
        if (self._pending) { clearTimeout(self._pending.timer); self._pending = null; }
        try { vp.setPointerCapture(e.pointerId); } catch (_) { }
        vp.classList.add('is-grabbing'); live();
      }
      c.tx = pan.tx0 + dx; c.ty = pan.ty0 + dy; flush();
    });
    var up = function (e) {
      if (!pts[e.pointerId]) return; delete pts[e.pointerId];
      if (pinch) {
        if (pinch.ids.indexOf(String(e.pointerId)) >= 0) {
          pinch = null; self._clampCam(self.cam); flush();
          var rest = Object.keys(pts); if (rest.length === 1) startPan(+rest[0], pts[rest[0]].x, pts[rest[0]].y, true);
        }
        if (!n()) { self.noClickUntil = performance.now() + 350; vp.classList.remove('is-grabbing'); self._gesture = false; }
        return;
      }
      if (pan && pan.id === e.pointerId) {
        if (pan.on) { self.noClickUntil = performance.now() + 350; }
        pan = null; vp.classList.remove('is-grabbing');
      }
      if (!n() && self.noClickUntil > performance.now() + 1000) self.noClickUntil = performance.now() + 350;
      if (!pan && !pinch) self._gesture = false;
    };
    /* listen on window (capture) so a finger lifted off the board, or a cancel Chrome / Samsung Internet sends when the
       page takes over, never leaves a stale pointer behind that would turn the next one-finger touch into a "pinch" */
    window.addEventListener('pointerup', up, true); window.addEventListener('pointercancel', up, true);
    var wrapEl = vp.parentNode;
    /* iOS Safari: page pinch-zoom arrives as gesture events even under touch-action: none; keep it on the board */
    ['gesturestart', 'gesturechange'].forEach(function (t) { wrapEl.addEventListener(t, function (e) { if (self.zoomOn) e.preventDefault(); }, { passive: false }); });
    /* a touchmove that begins on the zoomable board never scrolls or rubber-bands the page (older WebViews ignore touch-action) */
    vp.addEventListener('touchmove', function (e) { if (self.zoomOn && e.cancelable) e.preventDefault(); }, { passive: false });
    vp.addEventListener('wheel', function (e) {
      if (!self.zoomOn || !self.cam) return;
      e.preventDefault(); self._stopTween();
      var k = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 400 : 1, c = self.cam;
      if (e.ctrlKey || e.metaKey) {   /* trackpad pinch arrives as ctrl+wheel; ctrl+mouse wheel zooms too */
        var p = local(e.clientX, e.clientY), f = Math.exp(-e.deltaY * k * 0.0045);
        var ns = self._clampS(c.s * f), bx = (p.x - c.tx) / c.s, by = (p.y - c.ty) / c.s;
        c.s = ns; c.tx = p.x - bx * ns; c.ty = p.y - by * ns;
      } else {
        var dx = e.deltaX * k, dy = e.deltaY * k; if (e.shiftKey && !dx) { dx = dy; dy = 0; }
        c.tx -= dx; c.ty -= dy;
      }
      c.user = true; live(); flush();
    }, { passive: false });
    /* space-drag: hold Space while the pointer is over the board (Enter still activates the focused square) */
    vp.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') self._hover = true; });
    vp.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') self._hover = false; });
    document.addEventListener('keydown', function (e) {
      if (!self.zoomOn || e.target && /INPUT|SELECT|TEXTAREA|BUTTON/.test(e.target.tagName)) return;
      if ((e.key === ' ' || e.key === 'Spacebar') && self._hover) { e.preventDefault(); e.stopPropagation(); if (!self.spaceHeld) { self.spaceHeld = true; vp.classList.add('is-grab'); } return; }
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (self.el.offsetParent === null) return;
      if (e.key === '+' || e.key === '=') { self.zoomBy(1.4); e.preventDefault(); }
      else if (e.key === '-' || e.key === '_') { self.zoomBy(1 / 1.4); e.preventDefault(); }
      else if (e.key === '0') { if (self.isFit()) self.zoomReset(); else self.zoomFit(); e.preventDefault(); }
    }, true);
    document.addEventListener('keyup', function (e) { if (e.key === ' ' || e.key === 'Spacebar') { self.spaceHeld = false; vp.classList.remove('is-grab'); } }, true);
    window.addEventListener('blur', function () { self.spaceHeld = false; vp.classList.remove('is-grab'); });
  };
  /* while a piece is dragged near the window edge, glide the camera so off-screen targets can be reached */
  P._edgePan = function (x, y) {
    var self = this; if (!this.zoomOn || !this.cam) return;
    var vp = this.el.parentNode.parentNode, r = vp.getBoundingClientRect(), E = 28;
    var vx = x < r.left + E ? 1 : x > r.right - E ? -1 : 0, vy = y < r.top + E ? 1 : y > r.bottom - E ? -1 : 0;
    this._edge = { vx: vx, vy: vy, x: x, y: y };
    if ((!vx && !vy) || this._edgeRaf) return;
    var tick = function () {
      var d = self.drag, g = self._edge; self._edgeRaf = 0;
      if (!d || !d.moved || !g || (!g.vx && !g.vy)) return;
      var c = self.cam, ox = c.tx, oy = c.ty; c.tx += g.vx * 7; c.ty += g.vy * 7; self._clampCam(c);
      if (Math.abs(ox - c.tx) < 0.01 && Math.abs(oy - c.ty) < 0.01) return;   /* already at the board edge */
      c.user = true; self._applyCam();
      if (self._dragHover) self._dragHover(g.x, g.y);
      self._edgeRaf = requestAnimationFrame(tick);
    };
    this._edgeRaf = requestAnimationFrame(tick);
  };

  P._build = function (files, ranks) {
    this.files = files; this.ranks = ranks; this.prev = null; this.marks = {}; this.camSq = null; this.focusI = 0; this.cam = null; this._lastSeen = null; this._gesture = false; this._clearMotion(); if (this.underEl) this.underEl.innerHTML = '';
    this.el.style.setProperty('--files', files); this.el.style.setProperty('--ranks', ranks);
    this.el.parentNode && this.el.parentNode.style.setProperty('--aspect', files + ' / ' + ranks);
    var h = ''; for (var k = 0; k < files * ranks; k++) h += '<div class="sq" role="gridcell"></div>';
    this.el.innerHTML = h;
    this.el.setAttribute('aria-rowcount', ranks); this.el.setAttribute('aria-colcount', files);
  };

  P.render = function (model, o) {
    o = o || {};
    if (model.files !== this.files || model.ranks !== this.ranks || this.el.children.length !== model.files * model.ranks) { this._build(model.files, model.ranks); if (this.onBuild) this.onBuild(); }
    this.model = model;
    var flipChanged = this.flip !== !!model.flip; this.flip = !!model.flip;
    var F = this.files, R = this.ranks, n = F * R, kids = this.el.children, geoName = model.name || defaultName(F, R);
    /* coordinate placement: first valid square of each display row / last valid of each display column */
    var rankAt = {}, fileAt = {};
    for (var dr = 0; dr < R; dr++) for (var dc = 0; dc < F; dc++) { var i0 = this.dispToSq(dr * F + dc); if (model.squares[i0] && model.squares[i0].valid !== false) { rankAt[dr * F + dc] = 1; break; } }
    for (var dc2 = 0; dc2 < F; dc2++) for (var dr2 = R - 1; dr2 >= 0; dr2--) { var i1 = this.dispToSq(dr2 * F + dc2); if (model.squares[i1] && model.squares[i1].valid !== false) { fileAt[dr2 * F + dc2] = 1; break; } }
    var now = {}, nowSrc = {}, nowCls = {};
    var focusI = this.focusI;
    if (!(model.squares[focusI] && model.squares[focusI].valid !== false)) {
      focusI = 0;
      while (focusI < n && !(model.squares[focusI] && model.squares[focusI].valid !== false)) focusI++;
      if (focusI >= n) focusI = 0;
    }
    for (var k = 0; k < n; k++) {
      var i = this.dispToSq(k), s = model.squares[i] || {}, el = kids[k];
      var r = Math.floor(i / F), c = i % F, light = (r + c) % 2 === 0;
      if (s.valid === false) {
        el.className = 'sq is-hole'; el.innerHTML = ''; el.removeAttribute('data-i');
        el.removeAttribute('tabindex'); el.removeAttribute('aria-selected'); el.removeAttribute('aria-label');
        continue;
      }
      var cls = 'sq ' + (light ? 'is-light' : 'is-dark') + (s.cls ? ' ' + s.cls : '') + (this.marks[i] ? ' is-marked' : '');
      var state = (s.cls || '').indexOf('is-sel') >= 0 ? ' selected'
        : (s.cls || '').indexOf('is-target') >= 0 ? ' legal move'
        : (s.cls || '').indexOf('is-check') >= 0 ? ' in check' : '';
      var h = '';
      if (s.piece) {
        var p = s.piece;
        h += '<img class="pc' + (p.cls ? ' ' + p.cls : '') + '" src="' + p.src + '" alt="' + U.esc(p.label || '') + '" draggable="false">';
        if (p.badge) h += '<span class="pc-badge">' + U.esc(p.badge) + '</span>';
        now[i] = p.src + '|' + (p.key || '');
        nowSrc[i] = p.src; if (p.cls) nowCls[i] = p.cls;
      }
      if (s.html) h += s.html;
      if (rankAt[k]) h += '<span class="coord coord-r">' + geoName.rank(i) + '</span>';
      if (fileAt[k]) h += '<span class="coord coord-f">' + geoName.file(i) + '</span>';
      if (el.className !== cls) el.className = cls;
      el.innerHTML = h; el.dataset.i = i;
      el.tabIndex = i === focusI ? 0 : -1;
      el.setAttribute('aria-selected', (s.cls || '').indexOf('is-sel') >= 0 ? 'true' : 'false');
      el.setAttribute('aria-label', geoName.sq(i) + (s.piece && s.piece.label ? ' ' + s.piece.label : '') + state);
    }
    this.focusI = focusI;
    var prevMap = this.prev, prevSrc = this._prevSrc || {}, t = performance.now(); this.prev = now;
    var quiet = this._quiet; this._quiet = false;
    if (!prevMap || flipChanged || o.instant || quiet || !CM.settings.animMs()) this._clearMotion();
    else this._plan(prevMap, now, prevSrc, o.hint || [], t);
    this._prevSrc = nowSrc; this._prevCls = nowCls;
    var mo = this._mo || {};
    for (var mi in mo) { if (mo[mi].key != null && mo[mi].key !== now[mi]) { delete mo[mi]; continue; } this._attach(+mi, t); }
    if (this.drag && this.drag.moved) { var dImg = this.pieceEl(this.drag.i); if (dImg) { dImg.style.opacity = '0'; this.drag.img = dImg; } }   /* a re-render mid-drag keeps the lifted piece hidden */
    if (this.zoomOn) this._zoomAfterRender(model, o, flipChanged);
    else if (model.follow != null) this.follow(model.follow, !!o.instant || flipChanged);
  };
  function defaultName(F, R) {
    var L = 'abcdefghijklmnopqrstuvwxyz';
    return { rank: function (i) { return R - Math.floor(i / F); }, file: function (i) { var c = i % F; return c < 26 ? L[c] : L[Math.floor(c / 26) - 1] + L[c % 26]; },
      sq: function (i) { return this.file(i) + this.rank(i); } };
  }
  /* ---------------- motion ----------------
     Every move slides: the piece's image is drawn at its new square and translated back to where it came from, then eased
     home. Offsets are in squares of the display grid (translate % of the piece's own box), so a slide stays right while
     the zoom camera pans or rescales. Motions live in this._mo keyed by destination square and are re-attached after
     every render at their elapsed time, so the re-renders that follow a move (bot thinking, turn hooks, status, the
     100 ms tick) never cut a slide short and make the piece teleport. A new move that starts from a square whose piece
     is still arriving starts from where that piece visibly is, so premoves and fast replies chain without a jump. */
  function easeOut(p) { return 1 - Math.pow(1 - p, 3); }
  var EASE_OUT = 'cubic-bezier(0.33, 1, 0.68, 1)';   /* = easeOut above (easeOutCubic) */
  P._dpos = function (i) { var k = this.sqToDisp(i); return { c: k % this.files, r: Math.floor(k / this.files) }; };
  P._under = function () {   /* layer under moving pieces (above resting ones) for captured pieces fading out */
    if (this.underEl && this.underEl.parentNode) return this.underEl;
    var st = this.el.parentNode; if (!st) return null;
    var u = document.createElement('div'); u.className = 'board-under'; u.setAttribute('aria-hidden', 'true');
    u.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:2;overflow:visible';
    st.insertBefore(u, this.el.nextSibling); this.underEl = u; return u;
  };
  P._clearMotion = function () {
    var mo = this._mo || {}; for (var i in mo) if (mo[i].an) { try { mo[i].an.cancel(); } catch (_) { } }
    this._mo = {};
  };
  /* where a motion record's piece is right now, as an offset in squares from its destination */
  P._residual = function (rec, now) {
    if (!rec || rec.kind !== 'path') return null;
    var t = (now - rec.t0 - (rec.delay || 0)) / rec.dur; if (t >= 1) return null; if (t < 0) t = 0;
    var pts = rec.pts;
    if (pts.length === 2) { var e = easeOut(t); return { x: pts[0].x * (1 - e), y: pts[0].y * (1 - e) }; }
    for (var k = 1; k < pts.length; k++) {
      var a = pts[k - 1], b = pts[k], oa = a.o != null ? a.o : (k - 1) / (pts.length - 1), ob = b.o != null ? b.o : k / (pts.length - 1);
      if (t <= ob) { var f = ob > oa ? (t - oa) / (ob - oa) : 1; return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f }; }
    }
    return null;
  };
  P._attach = function (i, now) {
    var rec = this._mo[i], img = this.pieceEl(i), self = this; if (!rec) return;
    if (now - rec.t0 >= (rec.delay || 0) + rec.dur) { delete this._mo[i]; return; }
    if (!img) return;
    var frames;
    if (rec.kind === 'path') frames = rec.pts.map(function (q) {
      var f = { transform: 'translate(' + (q.x * 100).toFixed(3) + '%,' + (q.y * 100).toFixed(3) + '%)' + (q.s ? ' scale(' + q.s + ')' : '') };
      if (q.o != null) f.offset = q.o; if (q.e) f.easing = q.e; return f;
    });
    else frames = rec.frames;
    if (rec.src && img.getAttribute('src') !== rec.src) { rec.finalSrc = img.getAttribute('src'); img.setAttribute('src', rec.src); }
    img.classList.add('is-moving');
    var an = img.animate(frames, { duration: rec.dur, delay: rec.delay || 0, easing: rec.kind === 'path' && rec.pts.length === 2 ? EASE_OUT : 'linear', fill: 'backwards' });
    try { an.currentTime = Math.max(0, now - rec.t0); } catch (_) { }
    rec.an = an;
    an.onfinish = function () {
      img.classList.remove('is-moving');
      if (rec.finalSrc) img.setAttribute('src', rec.finalSrc);   /* promotion: the pawn arrives, then becomes the new piece */
      if (self._mo[i] === rec) delete self._mo[i];
    };
    an.oncancel = function () { img.classList.remove('is-moving'); if (rec.finalSrc) img.setAttribute('src', rec.finalSrc); };
  };
  /* public: play a path on the piece standing on square sq. pts = [{x, y, o?, e?, s?}] offsets in display squares from
     the square (last one normally {x:0, y:0}); survives re-renders like every built-in slide. Returns false when off. */
  P.motion = function (sq, pts, dur, opts) {
    var ms = CM.settings.animMs(); if (!ms || !pts || pts.length < 2) return false;
    opts = opts || {}; this._mo = this._mo || {};
    var old = this._mo[sq]; if (old && old.an) { try { old.an.cancel(); } catch (_) { } }
    this._mo[sq] = { kind: 'path', key: this.prev && this.prev[sq], pts: pts, dur: dur || ms, delay: opts.delay || 0, t0: performance.now(), src: opts.src || null };
    this._attach(sq, performance.now()); return true;
  };
  /* public: the next render shows the new position as is (a mode already animated it, e.g. a physics launch) */
  P.quietNext = function () { this._quiet = true; };
  /* public: finish every running slide now */
  P.settle = function () { var mo = this._mo || {}; for (var i in mo) if (mo[i].an) { try { mo[i].an.finish(); } catch (_) { } } this._mo = {}; };
  P._ghost = function (r, src, cls, delay, dur, res, resDur) {
    var u = this._under(); if (!u || !src) return;
    var p = this._dpos(r), g = document.createElement('img');
    g.className = 'pc pc-ghost' + (cls ? ' ' + cls : ''); g.src = src; g.alt = ''; g.setAttribute('draggable', 'false');
    g.style.left = (p.c * 100 / this.files) + '%'; g.style.top = (p.r * 100 / this.ranks) + '%';
    g.style.width = (100 / this.files) + '%'; g.style.height = (100 / this.ranks) + '%'; g.style.right = 'auto'; g.style.bottom = 'auto';
    u.appendChild(g);
    if (res && resDur > 0) g.animate([{ transform: 'translate(' + res.x * 100 + '%,' + res.y * 100 + '%)' }, { transform: 'translate(0,0)' }], { duration: resDur, easing: EASE_OUT });
    var an = g.animate([{ opacity: 1 }, { opacity: 0 }]  /* ov-ui: captured piece fades, no shrink */, { duration: dur, delay: delay, easing: 'ease-out', fill: 'both' });
    an.onfinish = an.oncancel = function () { g.remove(); };
  };
  P._plan = function (prev, now, prevSrc, hint, t) {
    var ms = CM.settings.animMs(); this._mo = this._mo || {};
    var self = this, mo = this._mo, old = Object.assign({}, mo), removed = [], added = [], i;
    for (i in prev) if (now[i] !== prev[i]) removed.push(+i);
    for (i in now) if (prev[i] !== now[i]) added.push(+i);
    if (!removed.length && !added.length) return;
    var used = {}, pairs = [], srcOf = function (v) { return v ? v.split('|')[0] : ''; };
    var drop = this._drop && t - this._drop.at < 600 ? this._drop : null;
    hint.forEach(function (h) {
      if (h.from && (h.f == null || h.f < 0) && added.indexOf(h.t) >= 0 && !used['a' + h.t]) {   /* a drop from the hand / reserve */
        used['a' + h.t] = 1; self._flyIn(h.t, h.from, srcOf(now[h.t]), ms, t); return;
      }
      if (h.f == null || h.f < 0) return;
      if (removed.indexOf(h.f) >= 0 && added.indexOf(h.t) >= 0 && !used['r' + h.f] && !used['a' + h.t]) {
        used['r' + h.f] = used['a' + h.t] = 1;
        if (!h.dragged) pairs.push([h.f, h.t, srcOf(prev[h.f]) !== srcOf(now[h.t]) ? prevSrc[h.f] : null]);
        else if (drop && drop.f === h.f) { drop.used = true; self._settleFrom(h.t, drop, prevSrc[h.f] !== srcOf(now[h.t]) ? prevSrc[h.f] : null, t); }
      }
    });
    /* match remaining by appearance and distance (gravity, monsters, swaps...) */
    added.forEach(function (a) {
      if (used['a' + a]) return;
      var key = srcOf(now[a]), best = -1, bd = 1e9;
      removed.forEach(function (r) {
        if (used['r' + r] || srcOf(prev[r]) !== key) return;
        var d = Math.abs(r % self.files - a % self.files) + Math.abs(Math.floor(r / self.files) - Math.floor(a / self.files));
        if (d < bd) { bd = d; best = r; }
      });
      if (best >= 0) { used['r' + best] = used['a' + a] = 1; pairs.push([best, a, null]); }
    });
    var arrive = {};
    pairs.forEach(function (pr) {
      var f = pr[0], to = pr[1], a = self._dpos(f), b = self._dpos(to), res = self._residual(old[f], t);
      var ox = a.c - b.c + (res ? res.x : 0), oy = a.r - b.r + (res ? res.y : 0), dist = Math.hypot(ox, oy);
      var dur = Math.round(ms * Math.min(1.25, 0.85 + dist * 0.07));
      if (mo[f] && mo[f].an) { try { mo[f].an.cancel(); } catch (_) { } }
      delete mo[f];
      if (mo[to] && mo[to].an) { try { mo[to].an.cancel(); } catch (_) { } }
      mo[to] = { kind: 'path', key: now[to], pts: [{ x: ox, y: oy }, { x: 0, y: 0 }], dur: dur, t0: t, src: pr[2] || null };
      arrive[to] = dur;
    });
    removed.forEach(function (r) { /* captured or vanished: fade the old image out where it stood (on arrival for a capture) */
      if (used['r' + r]) return;
      var res = self._residual(old[r], t), left = res ? Math.max(0, old[r].t0 + (old[r].delay || 0) + old[r].dur - t) : 0;
      if (!arrive[r] && mo[r]) { if (mo[r].an) { try { mo[r].an.cancel(); } catch (_) { } } delete mo[r]; }
      var hit = arrive[r];
      self._ghost(r, prevSrc[r], (self._prevCls || {})[r], hit ? Math.round(hit * 0.62) : Math.round(left), hit ? Math.round(ms * 0.55) : Math.round(ms * 0.8), res, left);
    });
    added.forEach(function (a) { /* appeared from nowhere: fade in */
      if (used['a' + a]) return;
      mo[a] = { kind: 'frames', key: now[a], frames: [{ opacity: 0 }, { opacity: 1 }]  /* ov-ui: fade in, no scale pop */, dur: Math.round(ms * 0.9), t0: t };
    });
  };
  /* a dropped piece settles from where it was let go (drag-and-drop) instead of jumping */
  P._settleFrom = function (to, drop, src, t) {
    var rc = this.rectOf(to); if (!rc || !rc.width) return;
    var ox = (drop.x - (rc.left + rc.width / 2)) / rc.width, oy = (drop.y - (rc.top + rc.height / 2)) / rc.height;
    if (Math.hypot(ox, oy) < 0.04) return;
    var ms = CM.settings.animMs(), dur = Math.round(Math.max(80, Math.min(140, ms * 0.6)));
    this._mo[to] = { kind: 'path', key: this.prev && this.prev[to], pts: [{ x: ox, y: oy }, { x: 0, y: 0 }], dur: dur, t0: t, src: src || null };
  };
  /* a piece put on the board from the hand: a free-flying copy glides from the hand button to the square */
  P._flyIn = function (to, from, src, ms, t) {
    var dur = Math.round(ms * 1.25), self = this;
    this._mo[to] = { kind: 'frames', key: null, frames: [{ opacity: 0 }, { opacity: 0, offset: 0.98 }, { opacity: 1 }], dur: dur, t0: t };
    requestAnimationFrame(function () {
      var rc = self.rectOf(to); if (!rc) return;
      var g = document.createElement('img'); g.className = 'pc-drag pc-fly'; g.src = src; g.alt = '';
      g.style.width = rc.width + 'px'; g.style.height = rc.height + 'px';
      document.body.appendChild(g);
      var x0 = from.x - rc.width / 2, y0 = from.y - rc.height / 2;
      var an = g.animate([{ transform: 'translate(' + x0 + 'px,' + y0 + 'px) scale(.7)' }, { transform: 'translate(' + rc.left + 'px,' + rc.top + 'px)' }], { duration: dur, easing: EASE_OUT, fill: 'forwards' });
      an.onfinish = an.oncancel = function () { g.remove(); };
    });
  };

  /* ---------------- input ---------------- */
  P._sqAt = function (x, y) {
    var e = document.elementFromPoint(x, y), q = e && e.closest && e.closest('.sq');
    return q && q.parentNode === this.el && q.dataset.i != null ? +q.dataset.i : -1;
  };
  /* keyboard: one tab stop on the board, arrow keys walk the squares (skipping holes), Enter/Space acts on the
     focused square through the same click path as the mouse, so every mode's tap/double-tap behaviour is reused. */
  P._focusSquare = function (i) {
    var q = this.sqEl(i); if (!q) return false;
    var old = this.sqEl(this.focusI); if (old && old !== q) old.tabIndex = -1;
    this.focusI = i; q.tabIndex = 0;
    try { q.focus({ preventScroll: true }); } catch (_) { q.focus(); }
    if (this.zoomOn) this.ensureVisible(i, true); else if (q.scrollIntoView) q.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    return true;
  };
  P._stepFocus = function (dr, dc, ctrl) {
    var F = this.files, R = this.ranks, model = this.model; if (!model) return false;
    var k = this.sqToDisp(this.focusI), r = Math.floor(k / F), c = k % F, nr, nc, nk, i;
    if (ctrl) { /* Ctrl+Home / Ctrl+End: first / last square on the board */
      var order = []; for (i = 0; i < F * R; i++) if (model.squares[this.dispToSq(i)] && model.squares[this.dispToSq(i)].valid !== false) order.push(this.dispToSq(i));
      if (!order.length) return false;
      return this._focusSquare(dr < 0 ? order[0] : order[order.length - 1]);
    }
    if (!dr && !dc) return false;
    for (var step = 1; step <= Math.max(F, R); step++) {
      nr = r + dr * step; nc = c + dc * step;
      if (nr < 0 || nr >= R || nc < 0 || nc >= F) return false;
      nk = nr * F + nc; i = this.dispToSq(nk);
      if (model.squares[i] && model.squares[i].valid !== false) return this._focusSquare(i);
    }
    return false;
  };
  P._bind = function () {
    var self = this, el = this.el;
    el.addEventListener('contextmenu', function (e) {
      var q = e.target.closest('.sq'); if (!q || q.dataset.i == null) return; e.preventDefault();
      var i = +q.dataset.i, now = performance.now(), last = self._lastRight; self._lastRight = { i: i, at: now };
      /* double right-click: a mode's second extra gesture (Portals: orange portal), otherwise it toggles a mark */
      if (last && last.i === i && now - last.at < 360 && self.cb.onDoubleRightTap) {
        /* the first right-click of the pair left a mark behind: drop it so the gesture stays clean */
        if (self.marks[i]) { delete self.marks[i]; q.classList.remove('is-marked'); }
        if (self.cb.onDoubleRightTap(i) !== false) return;
      }
      if (self.marks[i]) delete self.marks[i]; else self.marks[i] = 1; q.classList.toggle('is-marked', !!self.marks[i]);
    });
    el.addEventListener('pointerdown', function (e) {
      if (e.button > 0 || self.spaceHeld) return;
      if (Object.keys(self.marks).length) { self.marks = {}; U.qsa('.is-marked', el).forEach(function (q) { q.classList.remove('is-marked'); }); }
      var q = e.target.closest('.sq'); if (!q || q.dataset.i == null) return;
      var i = +q.dataset.i; if (!self.cb.canDrag(i)) return;
      var img = q.querySelector(':scope > .pc'); if (!img) return;
      e.preventDefault();
      var r = q.getBoundingClientRect(), touch = e.pointerType === 'touch';
      self.drag = { i: i, id: e.pointerId, x: e.clientX, y: e.clientY, w: r.width, h: r.height, img: img, ghost: null, moved: false, lift: touch ? r.height * 0.6 : 0, rect: { left: r.left, top: r.top, width: r.width, height: r.height } };
      self.cb.onDragStart(i);
      try { el.setPointerCapture(e.pointerId); } catch (_) { }
    });
    el.addEventListener('pointermove', function (e) {
      var d = self.drag; if (!d || e.pointerId !== d.id) return;
      if (!d.moved && Math.hypot(e.clientX - d.x, e.clientY - d.y) < 4) return;
      if (!d.moved) {
        d.moved = true; var img = self.pieceEl(d.i) || d.img; d.img = img;
        var g = img.cloneNode(true); g.className = 'pc pc-drag'; g.style.width = d.w + 'px'; g.style.height = d.h + 'px';
        document.body.appendChild(g); d.ghost = g; img.style.opacity = '0';
      }
      d.ghost.style.transform = 'translate(' + (e.clientX - d.w / 2) + 'px,' + (e.clientY - d.h / 2 - d.lift) + 'px)';
      self._dragHover(e.clientX, e.clientY);
      self._edgePan(e.clientX, e.clientY);
    });
    self._dragHover = function (x, y) {
      var d = self.drag; if (!d) return;
      var t = self._sqAt(x, y - d.lift);
      if (t !== d.hover) { var old = d.hover != null && self.sqEl(d.hover); if (old) old.classList.remove('is-hover'); d.hover = t; var ne = t >= 0 && self.sqEl(t); if (ne) ne.classList.add('is-hover'); }
    };
    function end(e, cancel) {
      var d = self.drag; if (!d || (e && e.pointerId !== d.id)) return; self.drag = null;
      /* a drag supersedes a tap that was waiting for a possible double-tap */
      if (d.moved && self._pending) { clearTimeout(self._pending.timer); self._pending = null; }
      if (d.hover != null && self.sqEl(d.hover)) self.sqEl(d.hover).classList.remove('is-hover');
      if (d.ghost) d.ghost.remove();
      var img = self.pieceEl(d.i); if (img) img.style.opacity = '';
      if (cancel || !d.moved) return; /* a plain press becomes a click (handled below) */
      self.noClickUntil = performance.now() + 350;
      var t = self._sqAt(e.clientX, e.clientY - d.lift);
      if (t === d.i) { self.cb.onTap(d.i, { dragCancel: true }); return; }
      /* dx/dy are the drag in squares from the piece's centre (y down), so a mode can read direction and distance
         (Launch Pawns: drag a pawn backwards, it fires the opposite way with power = drag length) */
      var rc = self.rectOf(d.i) || d.rect || { left: e.clientX - d.w / 2, top: e.clientY - d.h / 2, width: d.w, height: d.h };
      var py = e.clientY - d.lift;   /* touch drags carry a lift offset: measure from the visual pointer */
      var info = { dx: (e.clientX - (rc.left + rc.width / 2)) / Math.max(1, rc.width), dy: (py - (rc.top + rc.height / 2)) / Math.max(1, rc.height), pointer: { x: e.clientX, y: py } };
      var key0 = self.prev && self.prev[d.i], drop = self._drop = { f: d.i, x: e.clientX, y: py, at: performance.now() };
      self.cb.onDrop(d.i, t, info);
      /* nothing moved (illegal drop, a promotion still being picked): the piece glides back from where it was let go.
         Checked after the controller's move promise has had its turn (tryMove commits in a .then) */
      setTimeout(function () {
        if (drop.used || self._drop !== drop) return;
        self._drop = null;
        if (!self.prev || self.prev[d.i] !== key0 || key0 == null || !CM.settings.animMs()) return;
        var o0 = self.rectOf(d.i);
        if (o0 && o0.width) self.motion(d.i, [{ x: (drop.x - o0.left - o0.width / 2) / o0.width, y: (drop.y - o0.top - o0.height / 2) / o0.height }, { x: 0, y: 0 }], Math.round(Math.min(220, CM.settings.animMs())));
      }, 0);
    }
    self._endDrag = end;
    /* Clicking or scripting focus onto a square moves the roving tab stop there, so arrows continue from it. */
    el.addEventListener('focusin', function (e) {
      var q = e.target.closest && e.target.closest('.sq'); if (!q || q.parentNode !== el || q.dataset.i == null) return;
      var i = +q.dataset.i;
      if (i === self.focusI) return;
      var old = self.sqEl(self.focusI); if (old && old !== q) old.tabIndex = -1;
      self.focusI = i; q.tabIndex = 0;
    });
    el.addEventListener('keydown', function (e) {
      if (e.altKey || e.metaKey) return;
      var q = e.target.closest && e.target.closest('.sq'); if (!q || q.parentNode !== el || q.dataset.i == null) return;
      var i = +q.dataset.i;
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') { e.preventDefault(); q.click(); return; }
      if (e.key === 'Escape') { q.blur(); return; }
      var dir = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] }[e.key];
      if (dir) { e.preventDefault(); self._stepFocus(dir[0], dir[1], false); return; }
      if (e.key === 'Home' || e.key === 'End') {
        e.preventDefault();
        if (e.ctrlKey) { self._stepFocus(e.key === 'Home' ? -1 : 1, 0, true); return; }
        var F = self.files, model = self.model; if (!model) return;
        var k = self.sqToDisp(i), r = Math.floor(k / F), list = [];
        for (var c = 0; c < F; c++) { var si = self.dispToSq(r * F + c); if (model.squares[si] && model.squares[si].valid !== false) list.push(si); }
        if (list.length) self._focusSquare(e.key === 'Home' ? list[0] : list[list.length - 1]);
      }
    });
    el.addEventListener('pointerup', function (e) { end(e, false); });
    el.addEventListener('pointercancel', function (e) { end(e, true); });
    el.addEventListener('click', function (e) {
      if (performance.now() < self.noClickUntil) return;
      var q = e.target.closest('.sq'); if (!q || q.dataset.i == null) return;
      var i = +q.dataset.i, now = performance.now();
      /* keep the roving tab stop on the square the player just used, so Tab/arrows continue from there */
      if (i !== self.focusI) { var oldF = self.sqEl(self.focusI); if (oldF) oldF.tabIndex = -1; self.focusI = i; q.tabIndex = 0; }
      /* a mouse/touch click also focuses the board, so the player can continue with the arrow keys */
      if (document.activeElement !== q) { try { q.focus({ preventScroll: true }); } catch (_) { } }
      /* A second tap on the same square within the window is a double-tap: the controller decides whether it has an
         extra action there (e.g. "snipe" instead of capturing by moving), so modes need no modal picker. */
      var last = self._lastTap; self._lastTap = { i: i, at: now };
      if (last && last.i === i && now - last.at < 360 && self.cb.onDoubleTap) {
        if (self._pending) { clearTimeout(self._pending.timer); self._pending = null; }
        if (self.cb.onDoubleTap(i) !== false) return;
      }
      var delay = self.cb.tapDelay ? self.cb.tapDelay(i) : 0;
      if (delay > 0) {
        if (self._pending) clearTimeout(self._pending.timer);
        self._pending = { i: i, at: now, timer: setTimeout(function () { self._pending = null; self.cb.onTap(i, {}); }, delay) };
        return;
      }
      self.cb.onTap(i, {});
    });
  };

  CM.BoardView = BoardView;
})();
