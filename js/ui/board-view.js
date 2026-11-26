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
  var EASE = 'cubic-bezier(0.22, 0.61, 0.36, 1)';

  function BoardView(boardEl, fxEl, opts) {
    this.el = boardEl; this.fx = fxEl; this.opts = opts || {};
    this.files = 0; this.ranks = 0; this.flip = false; this.prev = null; this.marks = {}; this.drag = null; this.noClickUntil = 0;
    this.model = null; this.focusI = 0;
    this.cb = { canDrag: function () { return false; }, onTap: function () { }, onDrop: function () { return false; }, onDragStart: function () { }, onDoubleTap: null, onDoubleRightTap: null, tapDelay: null };
    this._pending = null;
    this._bind();
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

  /* layout from GameUI: pixel size of the visible window and how many squares it shows (viewport for big boards) */
  P.setLayout = function (L) {
    this.L = L; var st = this.el.parentNode;
    var sqw = L.bw / L.vf, sqh = L.bh / L.vr;
    st.style.setProperty('--sw', (sqw * this.files) + 'px'); st.style.setProperty('--sh', (sqh * this.ranks) + 'px');
    this.el.style.setProperty('--sqpx', Math.round(sqw) + 'px');
    if (this.camSq != null) this.follow(this.camSq, true); else { st.style.setProperty('--tx', '0px'); st.style.setProperty('--ty', '0px'); }
  };
  /* camera: keep display square sq near the centre of the visible window */
  P.follow = function (sq, instant) {
    this.camSq = sq; var L = this.L; if (!L || sq == null || sq < 0) return;
    var st = this.el.parentNode, k = this.sqToDisp(sq), dc = k % this.files, dr = Math.floor(k / this.files);
    var sqw = L.bw / L.vf, sqh = L.bh / L.vr, sw = sqw * this.files, sh = sqh * this.ranks;
    var tx = Math.min(0, Math.max(L.bw - sw, L.bw / 2 - (dc + 0.5) * sqw)), ty = Math.min(0, Math.max(L.bh - sh, L.bh / 2 - (dr + 0.5) * sqh));
    tx = Math.round(tx); ty = Math.round(ty);
    if (st._tx === tx && st._ty === ty) return; st._tx = tx; st._ty = ty;
    st.classList.toggle('is-panning', !instant && CM.settings.animMs() > 0);
    st.style.setProperty('--tx', tx + 'px'); st.style.setProperty('--ty', ty + 'px');
  };

  P._build = function (files, ranks) {
    this.files = files; this.ranks = ranks; this.prev = null; this.marks = {}; this.camSq = null; this.focusI = 0;
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
    var before = this.prev && !flipChanged ? this._snapshot() : null;
    var now = {};
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
    var prevMap = this.prev; this.prev = now;
    if (before && prevMap && !o.instant) this._animate(prevMap, now, before, o.hint || []);
    if (model.follow != null) this.follow(model.follow, !!o.instant || flipChanged);
  };
  function defaultName(F, R) {
    var L = 'abcdefghijklmnopqrstuvwxyz';
    return { rank: function (i) { return R - Math.floor(i / F); }, file: function (i) { var c = i % F; return c < 26 ? L[c] : L[Math.floor(c / 26) - 1] + L[c % 26]; },
      sq: function (i) { return this.file(i) + this.rank(i); } };
  }
  P._snapshot = function () { /* square rects + current piece images, before the DOM is rewritten */
    var snap = {}, kids = this.el.children;
    for (var k = 0; k < kids.length; k++) {
      var el = kids[k]; if (el.dataset.i == null) continue; var i = +el.dataset.i, img = el.querySelector(':scope > .pc');
      snap[i] = { rect: el.getBoundingClientRect(), img: img ? img.cloneNode(true) : null };
    }
    return snap;
  };
  P._animate = function (prev, now, snap, hint) {
    var ms = CM.settings.animMs(); if (!ms) return;
    var removed = [], added = [], self = this, i;
    for (i in prev) if (now[i] !== prev[i]) removed.push(+i);
    for (i in now) if (prev[i] !== now[i]) added.push(+i);
    if (!removed.length && !added.length) return;
    var used = {}, pairs = [];
    hint.forEach(function (h) {
      if (h.f == null || h.f < 0) return;
      if (removed.indexOf(h.f) >= 0 && added.indexOf(h.t) >= 0 && !used['r' + h.f] && !used['a' + h.t]) {
        used['r' + h.f] = used['a' + h.t] = 1; if (!h.dragged) pairs.push([h.f, h.t]);
      }
    });
    /* match remaining by appearance and distance (gravity, monsters, swaps...) */
    added.forEach(function (a) {
      if (used['a' + a]) return;
      var key = now[a].split('|')[0], best = -1, bd = 1e9;
      removed.forEach(function (r) {
        if (used['r' + r] || prev[r].split('|')[0] !== key) return;
        var d = Math.abs(r % self.files - a % self.files) + Math.abs(Math.floor(r / self.files) - Math.floor(a / self.files));
        if (d < bd) { bd = d; best = r; }
      });
      if (best >= 0) { used['r' + best] = used['a' + a] = 1; pairs.push([best, a]); }
    });
    pairs.forEach(function (pr) {
      var from = snap[pr[0]], img = self.pieceEl(pr[1]), to = self.rectOf(pr[1]);
      if (!from || !img || !to) return;
      var dx = from.rect.left - to.left, dy = from.rect.top - to.top, dist = Math.hypot(dx, dy) / Math.max(1, to.width);
      var dur = Math.round(ms * Math.min(1.35, 0.85 + dist * 0.08));
      img.classList.add('is-moving');
      var an = img.animate([{ transform: 'translate(' + dx + 'px,' + dy + 'px)' }, { transform: 'translate(0,0)' }], { duration: dur, easing: EASE });
      an.onfinish = an.oncancel = function () { img.classList.remove('is-moving'); };
    });
    removed.forEach(function (r) { /* captured or vanished: fade the old image out where it stood */
      if (used['r' + r] || !snap[r] || !snap[r].img) return;
      var g = snap[r].img, br = self.fx.getBoundingClientRect(), rc = snap[r].rect;
      g.className = 'pc pc-ghost'; g.style.left = (rc.left - br.left) + 'px'; g.style.top = (rc.top - br.top) + 'px';
      g.style.width = rc.width + 'px'; g.style.height = rc.height + 'px';
      self.fx.appendChild(g);
      var an = g.animate([{ opacity: 1 }, { opacity: 0 }]  /* ov-ui: captured piece fades, no shrink */, { duration: Math.round(ms * 0.9), delay: Math.round(ms * 0.55), easing: 'ease-out', fill: 'forwards' });
      an.onfinish = an.oncancel = function () { g.remove(); };
    });
    added.forEach(function (a) { /* appeared from nowhere: fade in */
      if (used['a' + a]) return; var img = self.pieceEl(a); if (!img) return;
      img.animate([{ opacity: 0 }, { opacity: 1 }]  /* ov-ui: fade in, no scale pop */, { duration: Math.round(ms * 0.9), easing: EASE });
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
    if (q.scrollIntoView) q.scrollIntoView({ block: 'nearest', inline: 'nearest' });
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
      if (e.button > 0) return;
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
      var t = self._sqAt(e.clientX, e.clientY - d.lift);
      if (t !== d.hover) { var old = d.hover != null && self.sqEl(d.hover); if (old) old.classList.remove('is-hover'); d.hover = t; var ne = t >= 0 && self.sqEl(t); if (ne) ne.classList.add('is-hover'); }
    });
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
      self.cb.onDrop(d.i, t, info);
    }
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
