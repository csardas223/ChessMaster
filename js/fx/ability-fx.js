/* Ability FX: one-shot "the monster is acting" animations for the horror / SCP modes, in the visual language of
   iwantcheckmate.com's own versions of these games (studied 2026-11-25, reimplemented here; no code copied):
     - zone / zone_out   a set of squares glows in and later out (SCP-2845's teal 3x3 shimmer)
     - pulse             one or more squares flash: opacity 0 -> peak -> hold -> 0 (scan squares, curse paths, alarms)
     - slide             pieces glide to new squares with a given duration / easing, state is applied afterwards
     - shake_sprite      a piece jitters left-right (SCP-096 enraged)
     - shatter           a square breaks into shards that fall into the void (the Locust)
     - aura              a persistent, breathing tint on squares (SCP-409 charging); removed with clearFx('aura')
   Squares are placed in percent of the board, so they survive resizes. `under: true` puts an effect beneath the pieces
   (in #board-abl, between the squares and the resting pieces; z-index 0); otherwise it is drawn over them in #board-fx.
   #board-abl is a sibling of the board view's own `.board-under` layer (z-index 2: captured pieces fading out above
   the resting pieces and below the moving ones), so the two never share a stacking order.
   Slides go through the board view's motion engine (board.motion + quietNext) when it has one, so a re-render during a
   slide keeps the piece where it is and the state change that follows does not animate the same move again. `belowMask`
   keeps an over-the-pieces effect under a fog / darkness mask, so hidden squares stay hidden.
   CM.abilityFx.sweep(ctx, squares, opts, onHit) staggers pulses over squares in order (a clockwise scan) and calls
   onHit(square, index) at the moment each one peaks. */
(function () {
  'use strict';
  var CM = window.CM, P = CM.VFX.prototype;
  function anim(el, frames, opt) { var a = el.animate(frames, opt); return new Promise(function (r) { a.onfinish = a.oncancel = function () { r(); }; }); }

  /* the layer between the squares and the resting pieces (index.html has it; created next to #board if missing) */
  P._underLayer = function () {
    if (this.under && this.under.isConnected) return this.under;
    var u = document.getElementById('board-abl');
    if (!u) { u = document.createElement('div'); u.id = 'board-abl'; u.className = 'board-abl'; u.setAttribute('aria-hidden', 'true'); this.board.parentNode.insertBefore(u, this.board.nextSibling); }
    return (this.under = u);
  };
  P._sqpx = function () { return parseFloat(getComputedStyle(this.board).getPropertyValue('--sqpx')) || 40; };
  P._fxLayer = function (e) {
    if (e.under) return this._underLayer();
    return this.layer;
  };
  /* square box in percent of the board (display coordinates, so a flipped board is right) */
  P._pctBox = function (sq) {
    var v = this.view, F = v.files, R = v.ranks; if (!F || !R || sq == null || sq < 0) return null;
    var d = v.sqToDisp(sq), c = d % F, r = Math.floor(d / F);
    return { left: (c * 100 / F) + '%', top: (r * 100 / R) + '%', width: (100 / F) + '%', height: (100 / R) + '%' };
  };
  P._sqList = function (e, info) {
    var self = this, src = e.squares != null ? e.squares : [e.at != null ? e.at : 'to'];
    return src.map(function (s) { return typeof s === 'number' ? s : self._resolve(s, info); }).filter(function (s) { return typeof s === 'number' && s >= 0; });
  };
  P._tile = function (parent, sq, cls, css, first) {
    var b = this._pctBox(sq); if (!b) return null;
    var d = document.createElement('div'); d.className = 'fx-tmp fx-abl ' + (cls || '');
    Object.assign(d.style, b, css || {});
    if (first && parent.firstChild) parent.insertBefore(d, parent.firstChild); else parent.appendChild(d);
    return d;
  };

  /* zone: { id, squares, color, opacity (peak), fade_ms, easing, under } -> resolves when faded in */
  P.fx_zone = function (e, info) {
    var self = this, key = 'zone#' + (e.id || 'z'), parent = this._fxLayer(e);
    if (this.persist[key]) this.persist[key].remove();
    var box = document.createElement('div'); box.className = 'fx-tmp fx-abl-zone'; box.style.opacity = 0;
    parent.appendChild(box);
    this._sqList(e, info).forEach(function (sq) { self._tile(box, sq, 'fx-abl-tile', { background: e.color || '#175b61' }); });
    var peak = e.opacity != null ? e.opacity : 0.85;
    var h = { box: box, peak: peak, remove: function () { box.remove(); } };
    this.persist[key] = h;
    return anim(box, [{ opacity: 0 }, { opacity: peak }], { duration: e.fade_ms != null ? e.fade_ms : 1000, easing: e.easing || 'linear', fill: 'forwards' });
  };
  P.fx_zone_out = function (e) {
    var self = this, key = 'zone#' + (e.id || 'z'), h = this.persist[key]; if (!h) return;
    delete this.persist[key];
    var from = parseFloat(getComputedStyle(h.box).opacity); if (isNaN(from)) from = h.peak;
    return anim(h.box, [{ opacity: from }, { opacity: 0 }], { duration: e.fade_ms != null ? e.fade_ms : 1000, easing: e.easing || 'linear', fill: 'forwards' }).then(function () { h.remove(); void self; });
  };

  /* pulse: { squares | at, color, duration_ms, peak, rise (0-1), hold (0-1, where the fade-out starts), easing,
     shape: 'swell' (0 -> peak -> hold -> 0, default) | 'fade' (peak -> 0), under, belowMask, stagger_ms, css } */
  P.fx_pulse = function (e, info) {
    var self = this, parent = this._fxLayer(e), dur = e.duration_ms || 700, peak = e.peak != null ? e.peak : 0.85;
    var rise = e.rise != null ? e.rise : 3 / 7, hold = e.hold != null ? e.hold : 4 / 7;
    var frames = e.shape === 'fade' ? [{ opacity: peak }, { opacity: 0 }]
      : [{ opacity: 0 }, { opacity: peak, offset: rise }, { opacity: peak, offset: Math.max(rise, hold) }, { opacity: 0 }];
    var jobs = this._sqList(e, info).map(function (sq, k) {
      var css = Object.assign({ background: e.color || '#000', opacity: 0 }, e.css || {});
      var t = self._tile(parent, sq, 'fx-abl-pulse', css, !!e.belowMask); if (!t) return null;
      return anim(t, frames, { duration: dur, delay: (e.stagger_ms || 0) * k, easing: e.easing || 'linear', fill: 'both' }).then(function () { t.remove(); });
    });
    return Promise.all(jobs);
  };

  /* aura: persistent breathing tint on squares; { id, squares, color, glow, period_ms, under } */
  P.fx_aura = function (e, info) {
    var self = this, key = 'aura#' + (e.id || 'a'), parent = this._fxLayer(e);
    if (this.persist[key]) this.persist[key].remove();
    var box = document.createElement('div'); box.className = 'fx-tmp fx-abl-zone'; parent.appendChild(box);
    var tiles = [];
    this._sqList(e, info).forEach(function (sq) {
      var t = self._tile(box, sq, 'fx-abl-aura', { background: e.color || 'rgba(118,209,234,.27)', boxShadow: 'inset 0 0 ' + Math.round(self._sqpx() * 0.25) + 'px ' + (e.glow || 'rgba(151,234,255,.33)') });
      if (t) tiles.push([t, sq]);
      if (t && !self.reduced()) t.animate([{ opacity: 1 }, { opacity: 0.35 }, { opacity: 1 }], { duration: e.period_ms || 2000, easing: 'ease-in-out', iterations: Infinity });
    });
    box.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, fill: 'forwards' });
    /* the tiles sit in display coordinates: follow a board flip (SCP-409's aura used to stay on the old squares) */
    var onFlip = function () { tiles.forEach(function (p) { var b = self._pctBox(p[1]); if (b) Object.assign(p[0].style, b); }); };
    document.addEventListener('cm:boardflip', onFlip);
    this.persist[key] = { remove: function () { document.removeEventListener('cm:boardflip', onFlip); anim(box, [{ opacity: 1 }, { opacity: 0 }], { duration: 300, fill: 'forwards' }).then(function () { box.remove(); }); } };
  };

  /* slide: { moves: [{ f, t }], duration_ms, easing } - moves the piece images; the caller then changes the state and
     calls ctx.refresh({ instant: true }) so the board does not animate the same move a second time */
  P.fx_slide = function (e) {
    var self = this, dur = e.duration_ms || 300, ease = e.easing || 'ease', v = this.view;
    if (v && typeof v.motion === 'function') {
      /* motion engine: each piece follows a path from its square to the destination (with the mode's easing) and then
         holds there; quietNext makes the caller's refresh show the new position as is, which also ends the hold.
         With animations off (or reduced motion) motion() declines and the pieces simply jump with the state change. */
      if (!CM.settings.animMs()) return;
      /* let a slide the board is still playing (the move that triggered the ability) land first: the instant refresh
         after this slide would otherwise cut it short */
      var now = performance.now(), busy = 0, mo = v._mo || {};
      Object.keys(mo).forEach(function (k) { var r = mo[k]; if (r && r.dur) busy = Math.max(busy, r.t0 + (r.delay || 0) + r.dur - now); });
      var HOLD = 2500, F = v.files, epoch = this._ablEpoch;
      return new Promise(function (r) { setTimeout(r, Math.min(600, Math.max(0, busy))); }).then(function () {
        var ran = false;
        (e.moves || []).forEach(function (m) {
          if (m.f === m.t || m.f < 0 || m.t < 0) return;
          var a = v.sqToDisp(m.f), b = v.sqToDisp(m.t), dx = b % F - a % F, dy = Math.floor(b / F) - Math.floor(a / F);
          if (v.motion(m.f, [{ x: 0, y: 0, o: 0, e: ease }, { x: dx, y: dy, o: dur / (dur + HOLD) }, { x: dx, y: dy, o: 1 }], dur + HOLD)) ran = true;
        });
        if (!ran) return;
        /* a new game while sliding: never resolve, so the old game's script does not touch the new board */
        return new Promise(function (r) { setTimeout(function () { if (self._ablEpoch !== epoch) return; if (typeof v.quietNext === 'function') v.quietNext(); r(); }, dur); });
      });
    }
    if (this.reduced()) dur = Math.min(dur, 160);
    var jobs = (e.moves || []).map(function (m) {
      var img = self.view.pieceEl(m.f), a = self.view.rectOf(m.f), b = self.view.rectOf(m.t);
      if (!img || !a || !b || m.f === m.t) return null;
      img.classList.add('is-moving');
      return anim(img, [{ transform: 'translate(0,0)' }, { transform: 'translate(' + (b.left - a.left) + 'px,' + (b.top - a.top) + 'px)' }], { duration: dur, easing: ease, fill: 'forwards' });
    });
    return Promise.all(jobs);
  };

  /* sprite: an image on a square, kept by id until sprite_out; { id, at, src, under, fade_in_ms, css } */
  P.fx_sprite = function (e, info) {
    var at = this._resolve(e.at || 'to', info); if (typeof at !== 'number') return;
    var key = 'sprite#' + (e.id || 's'); if (this.persist[key]) this.persist[key].remove();
    var t = this._tile(this._fxLayer(e), at, 'fx-abl-sprite'); if (!t) return;
    var img = document.createElement('img'); img.alt = ''; img.src = e.src; if (e.css) Object.assign(img.style, e.css); t.appendChild(img);
    this.persist[key] = { el: t, img: img, remove: function () { t.remove(); } };
    if (e.fade_in_ms) return anim(t, [{ opacity: 0 }, { opacity: 1 }], { duration: e.fade_in_ms, easing: 'linear', fill: 'both' });
  };
  P.fx_sprite_out = function (e) {
    var key = 'sprite#' + (e.id || 's'), h = this.persist[key]; if (!h) return; delete this.persist[key];
    return anim(h.el, [{ opacity: 1 }, { opacity: 0 }], { duration: e.fade_ms != null ? e.fade_ms : 1000, easing: e.easing || 'linear', fill: 'forwards' }).then(function () { h.remove(); });
  };
  /* sprite_tremor: { id, duration_ms } - tiny horizontal tremble of a sprite (the Locust while the square breaks) */
  P.fx_sprite_tremor = function (e) {
    var h = this.persist['sprite#' + (e.id || 's')]; if (!h || this.reduced()) return;
    var dur = e.duration_ms || 1000;
    return anim(h.img, [{ transform: 'translate(0,0)' }, { transform: 'translateX(1%)' }, { transform: 'translateX(-1.4%)' }, { transform: 'translateX(.6%)' }, { transform: 'translate(0,0)' }], { duration: 95, iterations: Math.ceil(dur / 95) });
  };

  /* shake_sprite: { at, duration_ms, amp (percent of a square), period_ms } - fast left-right jitter */
  P.fx_shake_sprite = function (e, info) {
    var at = this._resolve(e.at || 'to', info), img = typeof at === 'number' ? this.view.pieceEl(at) : null;
    if (!img) return;
    if (this.reduced()) return new Promise(function (r) { setTimeout(r, e.duration_ms || 2000); });
    var amp = e.amp != null ? e.amp : 5, per = e.period_ms || 75, n = Math.max(2, Math.round((e.duration_ms || 2000) / per));
    return anim(img, [{ transform: 'translateX(-' + amp + '%)' }, { transform: 'translateX(' + amp + '%)' }], { duration: per, iterations: n, direction: 'alternate', easing: 'linear' }).then(function () { img.style.transform = ''; });
  };

  /* shatter: { at, piece (img src of the piece that falls with it, optional), color (square colour), under }
     The square cracks into seven shards that share their edges, then everything drops out of view through the square. */
  function fracture() {
    var pts = { a: [0, 0], b: [34, 0], c: [76, 0], d: [100, 0], e: [100, 52], f: [100, 100], g: [67, 100], h: [22, 100], i: [0, 100], j: [0, 47], u: [26, 31], v: [60, 25], w: [44, 67], x: [78, 63] };
    var faces = ['abuj', 'bcvu', 'cdexv', 'uvxw', 'juwhi', 'hwxg', 'gxef'], edges = {}, turn = Math.floor(Math.random() * 4);
    'uvwx'.split('').forEach(function (k) { pts[k] = pts[k].map(function (n) { return n + Math.random() * 8 - 4; }); });
    function edge(a, b) {
      var key = [a, b].sort().join('');
      if (!edges[key]) {
        var s = pts[key[0]], t = pts[key[1]], dx = t[0] - s[0], dy = t[1] - s[1], path = [s];
        var rim = (dx === 0 && (s[0] === 0 || s[0] === 100)) || (dy === 0 && (s[1] === 0 || s[1] === 100));
        if (!rim) [0.2, 0.45, 0.7, 0.86].forEach(function (k) { var o = (Math.random() - 0.5) * 0.16; path.push([s[0] + dx * k - dy * o, s[1] + dy * k + dx * o]); });
        edges[key] = path.concat([t]);
      }
      var p = edges[key]; return (a === key[0] ? p : p.slice().reverse()).slice(0, -1);
    }
    return faces.map(function (f) {
      var poly = []; for (var k = 0; k < f.length; k++) poly = poly.concat(edge(f[k], f[(k + 1) % f.length]));
      return poly.map(function (q) { var x = q[0], y = q[1]; for (var r = 0; r < turn; r++) { var t = x; x = 100 - y; y = t; } return [x, y]; });
    });
  }
  P.fx_shatter = function (e, info) {
    var at = this._resolve(e.at || 'to', info); if (typeof at !== 'number') return;
    var parent = this._fxLayer(e), self = this, red = this.reduced();
    var win = this._tile(parent, at, 'fx-abl-fall', { perspective: Math.round(this._sqpx() * 2.75) + 'px' }); if (!win) return;
    var jobs = [];
    var drop = function (node, dx, spin, tilt, dur, delay) {
      if (red) return anim(node, [{ opacity: 1 }, { opacity: 0 }], { duration: 400, delay: delay, fill: 'both' });
      return anim(node, [{ transform: 'translate(0%,0%) rotate(0deg) rotateX(0deg)', filter: 'brightness(1)' },
        { transform: 'translate(' + dx + '%,185%) rotate(' + spin + 'deg) rotateX(' + tilt + 'deg)', filter: 'brightness(.45)' }],
      { duration: dur, delay: delay, easing: 'cubic-bezier(.48,0,.87,.58)', fill: 'both' });
    };
    fracture().forEach(function (poly) {
      var s = document.createElement('div'); s.className = 'fx-abl-shard'; s.style.background = e.color || '#e8d3b3';
      s.style.clipPath = 'polygon(' + poly.map(function (q) { return q[0].toFixed(2) + '% ' + q[1].toFixed(2) + '%'; }).join(',') + ')';
      var cx = 0, cy = 0; poly.forEach(function (q) { cx += q[0] / poly.length; cy += q[1] / poly.length; });
      s.style.transformOrigin = cx.toFixed(1) + '% ' + cy.toFixed(1) + '%';
      win.appendChild(s);
      jobs.push(drop(s, (cx - 50) * 0.35, (Math.random() - 0.5) * 70, Math.random() * 75 - 25, 680 + Math.random() * 270, Math.random() * 95));
    });
    var occ = null;
    if (e.piece) {
      occ = this._tile(parent, at, 'fx-abl-fall', { perspective: Math.round(this._sqpx() * 2.75) + 'px', zIndex: 2 });   /* the falling piece stays in front of sprites on the square */
      var img = document.createElement('img'); img.className = 'fx-abl-shard'; img.alt = ''; img.src = e.piece; img.style.objectFit = 'contain';
      occ.appendChild(img); jobs.push(drop(img, 5, 14, -32, 880, 70));
    }
    return Promise.all(jobs).then(function () { win.remove(); if (occ) occ.remove(); void self; });
  };

  /* swing: { at, toward, src, duration_ms, arc (deg), size (squares), axis (deg: where the image's tip points, default
     -45 = up-right), grip ([x%, y%] pivot in the image) } - an image (a bat) pivots on `at` and sweeps through `toward`
     once, then fades (SCP-956's bonk). One-shot; nothing stays on the board. */
  P.fx_swing = function (e, info) {
    var at = this._resolve(e.at, info), to = this._resolve(e.toward, info), v = this.view;
    if (typeof at !== 'number' || typeof to !== 'number') return;
    var F = v.files, a = v.sqToDisp(at), b = v.sqToDisp(to);
    var ang = Math.atan2(Math.floor(b / F) - Math.floor(a / F), b % F - a % F) * 180 / Math.PI - (e.axis != null ? e.axis : -45);
    var t = this._tile(this._fxLayer(e), at, 'fx-abl-swing', { overflow: 'visible', zIndex: 3 }); if (!t) return;
    var g = e.grip || [12, 88], size = e.size || 1.05, img = document.createElement('img');
    img.alt = ''; img.src = e.src; img.draggable = false;
    Object.assign(img.style, { position: 'absolute', width: (size * 100) + '%', height: (size * 100) + '%',
      left: (50 - g[0] * size) + '%', top: (50 - g[1] * size) + '%', transformOrigin: g[0] + '% ' + g[1] + '%', pointerEvents: 'none' });
    t.appendChild(img);
    var dur = e.duration_ms || 260, arc = e.arc != null ? e.arc : 75;
    if (this.reduced()) return anim(img, [{ opacity: 0, transform: 'rotate(' + ang + 'deg)' }, { opacity: 1, offset: 0.3 }, { opacity: 0, transform: 'rotate(' + ang + 'deg)' }], { duration: 320, fill: 'both' }).then(function () { t.remove(); });
    return anim(img, [{ opacity: 0, transform: 'rotate(' + (ang - arc) + 'deg)' },
      { opacity: 1, transform: 'rotate(' + (ang - arc * 0.8) + 'deg)', offset: 0.15 },
      { opacity: 1, transform: 'rotate(' + (ang + 6) + 'deg)', offset: 0.55, easing: 'ease-out' },
      { opacity: 1, transform: 'rotate(' + (ang + 2) + 'deg)', offset: 0.75 },
      { opacity: 0, transform: 'rotate(' + (ang + 2) + 'deg)' }], { duration: dur + 220, easing: 'cubic-bezier(.55,0,.9,.45)', fill: 'both' }).then(function () { t.remove(); });
  };
  /* knock: { at, piece (img src), from (square the hit came from), duration_ms } - a piece that was just removed from
     the state is knocked off its square: it flies away from `from`, spinning, and fades. One-shot. */
  P.fx_knock = function (e, info) {
    var at = this._resolve(e.at, info), v = this.view; if (typeof at !== 'number' || !e.piece) return;
    var F = v.files, a = v.sqToDisp(at), dx = 0, dy = -1;
    var fr = e.from != null ? this._resolve(e.from, info) : null;
    if (typeof fr === 'number') { var c = v.sqToDisp(fr); dx = a % F - c % F; dy = Math.floor(a / F) - Math.floor(c / F); }
    var n = Math.hypot(dx, dy) || 1; dx /= n; dy /= n;
    var t = this._tile(this._fxLayer(e), at, 'fx-abl-knock', { overflow: 'visible', zIndex: 2 }); if (!t) return;
    var img = document.createElement('img'); img.alt = ''; img.src = e.piece; img.draggable = false;
    Object.assign(img.style, { position: 'absolute', inset: '0', width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none' });
    t.appendChild(img);
    var dur = e.duration_ms || 520, spin = (dx >= 0 ? 1 : -1) * 220;
    if (this.reduced()) return anim(img, [{ opacity: 1 }, { opacity: 0 }], { duration: 260, fill: 'both' }).then(function () { t.remove(); });
    return anim(img, [{ transform: 'translate(0,0) rotate(0deg) scale(1)', opacity: 1 },
      { transform: 'translate(' + (dx * 55) + '%,' + (dy * 55 - 30) + '%) rotate(' + (spin * 0.5) + 'deg) scale(.92)', opacity: 1, offset: 0.45 },
      { transform: 'translate(' + (dx * 95) + '%,' + (dy * 95 + 10) + '%) rotate(' + spin + 'deg) scale(.7)', opacity: 0 }],
    { duration: dur, easing: 'cubic-bezier(.2,.7,.4,1)', fill: 'both' }).then(function () { t.remove(); });
  };

  /* a new game / rematch clears the under-the-pieces layer too */
  var baseReset = P.reset;
  P.reset = function () { baseReset.apply(this, arguments); this._ablEpoch = (this._ablEpoch || 0) + 1; var u = document.getElementById('board-abl'); if (u) u.innerHTML = ''; };

  /* ---------- helpers modes call ---------- */
  var A = CM.abilityFx = {
    wait: function (ctx, ms) { return new Promise(function (r) { ctx.after(ms, r); }); },
    /* the 8 neighbours clockwise from the top-left as the player sees the board (White at the bottom) */
    CW: [[-1, -1], [0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0]],
    ring: function (ctx, s) { var g = ctx.geo, o = []; A.CW.forEach(function (d) { var j = g.step(s, d[0], d[1]); if (j >= 0) o.push(j); }); return o; },
    /* staggered pulses over squares in order; onHit(square, index) fires when each square reaches its peak.
       opts: pulse options (color, duration_ms, rise, hold, peak, under, belowMask) + stagger_ms. Resolves when the
       last pulse is gone. */
    sweep: function (ctx, squares, opts, onHit) {
      opts = opts || {}; var st = opts.stagger_ms != null ? opts.stagger_ms : 200, dur = opts.duration_ms || 700;
      var rise = opts.rise != null ? opts.rise : 3 / 7, jobs = [], show = opts.visible;
      squares.forEach(function (sq, k) {
        jobs.push(A.wait(ctx, st * k).then(function () {
          /* opts.visible(sq) === false: no flash there (a fogged square must not give anything away), timing unchanged */
          var p = show && show(sq) === false ? A.wait(ctx, dur) : ctx.fx(Object.assign({ type: 'pulse' }, opts, { squares: [sq], stagger_ms: 0, visible: null }));
          var hit = onHit ? A.wait(ctx, dur * rise).then(function () { return onHit(sq, k); }) : null;
          return Promise.all([p, hit]);
        }));
      });
      return Promise.all(jobs);
    },
    /* black motes drifting off a zombie (SCP-966), as decorate html for its square; seeded so re-renders match */
    dustHtml: function (seed) {
      var h = '<span class="fx-zdust" aria-hidden="true">', r = (seed * 9301 + 49297) % 233280;
      var rnd = function () { r = (r * 9301 + 49297) % 233280; return r / 233280; };
      for (var k = 0; k < 30; k++) {
        var th = 2 * Math.PI * (k / 30) + (rnd() - 0.5) * 0.18, rad = 0.34 + rnd() * 0.075, tr = 0.09 + rnd() * 0.17;
        h += '<i style="left:' + (50 + Math.cos(th) * rad * 100).toFixed(1) + '%;top:' + (50 + Math.sin(th) * rad * 100).toFixed(1) + '%;--dx:calc(var(--sqpx,40px)*' + (Math.cos(th) * tr).toFixed(3) + ');--dy:calc(var(--sqpx,40px)*' + (Math.sin(th) * tr).toFixed(3) + ');animation-delay:-' + (rnd() * 1.15).toFixed(2) + 's"></i>';
      }
      return h + '</span>';
    },
    /* make refresh skip the slide animation for a state change that an fx already animated */
    refreshInstant: function (ctx) { ctx.refresh({ instant: true }); }
  };
})();
