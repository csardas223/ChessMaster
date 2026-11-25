/* VFX: data-driven visual + sound effects for modes.

   One VFX instance per game screen. Effects are described by plain objects (or "type:arg" strings):
     { type: 'shake', duration_ms: 400, intensity: 10, sound: 'explosion', at: 'e4', delay_ms: 0, ... }

   Two ways to drive it:
     1. vfx.play(effect, info)           -- imperative (hooks: ctx.fx(...))
     2. vfx_timeline in the mode spec     -- declarative; the game calls vfx.trigger(name, info) on every
        game event and each matching entry plays.  See ARCHITECTURE.md "VFX timeline" for the vocabulary.

   Persistent effects (darkness / vision masks, fog, tint, vignette, scanlines, overlay with duration 0)
   stay until vfx.clear(type) or the game ends. Every effect honours prefers-reduced-motion: shakes,
   zooms and glitches degrade to plain fades; flashes are dimmed. */
(function () {
  'use strict';
  var CM = window.CM, U = CM.util;

  var PARTICLE_KINDS = {
    explosion: { colors: ['#ffd25a', '#ff8a2a', '#e8471f', '#5a4636', '#fff1b8'], count: 26, spread: 2.2, size: [0.06, 0.16], dur: 750, gravity: 0.6 },
    confetti: { colors: ['#ff3b30', '#ffcc00', '#34c759', '#0a84ff', '#bf5af2', '#ff9f0a', '#ff2d55', '#ffffff'], count: 34, spread: 2.6, size: [0.05, 0.09], dur: 900, gravity: 0.9, square: true },
    sparks: { colors: ['#fff6c4', '#ffe066', '#ffb703'], count: 18, spread: 1.6, size: [0.03, 0.06], dur: 520, gravity: 0.2 },
    smoke: { colors: ['#5d5d5d', '#7b7b7b', '#3e3e3e'], count: 12, spread: 0.9, size: [0.22, 0.4], dur: 1100, gravity: -0.4 },
    gold: { colors: ['#ffe9a3', '#f5c542', '#d9a520', '#fff7d6'], count: 22, spread: 1.4, size: [0.04, 0.08], dur: 800, gravity: 0.3 },
    blood: { colors: ['#8a0303', '#b00b0b', '#5c0000'], count: 20, spread: 1.5, size: [0.04, 0.1], dur: 700, gravity: 1 },
    glitch: { colors: ['#00ffe1', '#ff00c8', '#ffffff'], count: 16, spread: 1.2, size: [0.08, 0.3], dur: 380, gravity: 0, square: true },
    dust: { colors: ['#cbbba0', '#a99777', '#e2d6bf'], count: 14, spread: 1, size: [0.04, 0.08], dur: 700, gravity: 0.5 }
  };

  function parseEffect(e) {
    if (!e) return null;
    if (typeof e === 'string') {
      var i = e.indexOf(':'); var t = i < 0 ? e : e.slice(0, i), arg = i < 0 ? null : e.slice(i + 1);
      var o = { type: t.trim() };
      if (arg != null) {
        if (/^(flash|tint|vignette)$/.test(o.type)) o.color = arg;
        else if (/^(jumpscare|overlay)$/.test(o.type)) o.image = arg;
        else if (/^(particles)$/.test(o.type)) o.kind = arg;
        else if (/^(darkness|vision)$/.test(o.type)) o.radius = +arg;
        else if (o.type === 'text') o.text = arg;
        else if (o.type === 'sound') o.sound = arg;
        else o.arg = arg;
      }
      return o;
    }
    return Object.assign({}, e);
  }

  function VFX(o) {
    this.wrap = o.wrap; this.board = o.board; this.layer = o.layer; this.screen = o.screen;
    this.view = o.view;               /* BoardView, for square rects */
    this.game = o.game || null;       /* controller: resolveSquare(at, info), visionSet(opts), ctx */
    this.persist = {}; this.timers = []; this.timeline = []; this.fired = {}; this.startedAt = performance.now();
    this.sounds = {};
  }
  var P = VFX.prototype;
  P.reduced = function () { return CM.settings.reducedMotion(); };
  P.setGame = function (g) { this.game = g; };

  /* ---------- geometry helpers ---------- */
  P._sqRect = function (sq) {
    var el = this.view.sqEl(sq), lr = this.layer.getBoundingClientRect(); if (!el) return null;
    var r = el.getBoundingClientRect();
    return { x: r.left - lr.left, y: r.top - lr.top, w: r.width, h: r.height };
  };
  P._resolve = function (at, info) {
    if (at == null || at === 'board' || at === 'screen') return at == null ? null : at;
    if (typeof at === 'number') return at;
    if (this.game && this.game.resolveSquare) return this.game.resolveSquare(at, info || {});
    return null;
  };

  /* ---------- public API ---------- */
  P.play = function (effect, info) {
    var e = parseEffect(effect); if (!e) return Promise.resolve();
    var self = this;
    if (e.delay_ms) return U.sleep(e.delay_ms).then(function () { var c = Object.assign({}, e); delete c.delay_ms; return self.play(c, info); });
    if (e.sound) this.sound(e.sound);
    var fn = this['fx_' + e.type];
    if (!fn) { console.warn('[vfx] unknown effect type "' + e.type + '"'); return Promise.resolve(); }
    try { return Promise.resolve(fn.call(this, e, info || {})); } catch (err) { console.error('[vfx]', e.type, err); return Promise.resolve(); }
  };
  P.sound = function (name) {
    if (!name || name === 'none') return;
    var custom = this.sounds[name]; CM.sound.play(custom || name);
  };
  P.registerSounds = function (map) { this.sounds = Object.assign({}, map || {}); };
  P.clear = function (type) {
    var self = this;
    Object.keys(this.persist).forEach(function (k) { if (!type || k === type || k.indexOf(type + '#') === 0) { var p = self.persist[k]; if (p && p.remove) p.remove(); delete self.persist[k]; } });
    if (!type || type === 'darkness' || type === 'vision' || type === 'fog') this._mask = null, this._renderMask();
  };
  P.reset = function () {
    this.timers.forEach(clearTimeout); this.timers = []; this.clear(); this.fired = {}; this.timeline = [];
    U.qsa('.fx-tmp', this.layer).forEach(function (n) { n.remove(); });
    U.qsa('.fx-tmp', this.screen).forEach(function (n) { n.remove(); });
    this.wrap.classList.remove('fx-glitching', 'fx-shaking'); this.startedAt = performance.now();
    if (this._tick) { clearInterval(this._tick); this._tick = null; }
  };
  P._after = function (ms, fn) { var t = setTimeout(fn, ms); this.timers.push(t); return t; };
  P._el = function (parent, cls, css) {
    var d = document.createElement('div'); d.className = 'fx-tmp ' + cls; if (css) Object.assign(d.style, css); parent.appendChild(d); return d;
  };
  function anim(el, frames, opt) { var a = el.animate(frames, opt); return new Promise(function (r) { a.onfinish = a.oncancel = function () { r(); }; }); }

  /* ---------- timeline ---------- */
  /* entry: { trigger, effect | effects:[...], duration_ms, sound, at, delay_ms, once, chance, params } */
  P.setTimeline = function (list) {
    var self = this; this.timeline = (list || []).map(function (en, k) { var e = Object.assign({ _k: k }, en); e._t = parseTrigger(e.trigger); return e; });
    if (this._tick) clearInterval(this._tick);
    var timed = this.timeline.filter(function (e) { return e._t.kind === 'time' || e._t.kind === 'every_ms'; });
    if (timed.length) this._tick = setInterval(function () { self._timeTick(); }, 100);
  };
  function parseTrigger(t) {
    if (t && typeof t === 'object') return Object.assign({ kind: t.on || t.kind || 'event' }, t);
    var s = String(t || '').trim(), i = s.indexOf(':'), k = i < 0 ? s : s.slice(0, i), a = i < 0 ? null : s.slice(i + 1);
    var o = { kind: k };
    if (k === 'ply' || k === 'every_plies' || k === 'move_number' || k === 'time' || k === 'every_ms') o.n = +a;
    else if (k === 'random') o.chance = +a;
    else if (k === 'event' || k === 'piece_captured' || k === 'piece_moved' || k === 'square') o.arg = a;
    return o;
  }
  P._matches = function (t, name, info) {
    var k = t.kind;
    if (t.side && info.side && t.side !== info.side) return false;
    if (t.by && info.by && t.by !== info.by) return false;
    if (t.piece && info.piece && t.piece !== info.piece) return false;
    if (t.after_ply != null && (info.ply || 0) < t.after_ply) return false;
    switch (k) {
      case 'ply': return name === 'move' && info.ply === t.n;
      case 'move_number': return name === 'move' && Math.ceil((info.ply || 0) / 2) === t.n && info.side === 'w';
      case 'every_plies': return name === 'move' && t.n > 0 && info.ply % t.n === 0;
      case 'random': return name === 'move' && Math.random() < (t.chance || 0);
      case 'event': return name === 'event:' + t.arg || (name === t.arg);
      case 'piece_captured': return name === 'capture' && (!t.arg || info.captured === t.arg);
      case 'piece_moved': return name === 'move' && (!t.arg || info.piece === t.arg);
      case 'square': return name === 'move' && info.toName === t.arg;
      case 'time': case 'every_ms': return false;
      default: return k === name;
    }
  };
  P.trigger = function (name, info) {
    info = info || {}; var self = this;
    this.timeline.forEach(function (en) {
      if (en.once && self.fired[en._k]) return;
      if (!self._matches(en._t, name, info)) return;
      if (en.chance != null && Math.random() >= en.chance) return;
      self.fired[en._k] = (self.fired[en._k] || 0) + 1;
      self.runEntry(en, info);
    });
  };
  P.runEntry = function (en, info) {
    var self = this, list = en.effects ? en.effects : [en.effect];
    var base = Object.assign({}, en.params || {});
    ['duration_ms', 'at', 'delay_ms', 'intensity', 'color', 'image', 'text', 'radius', 'kind'].forEach(function (k) { if (en[k] != null && base[k] == null) base[k] = en[k]; });
    if (en.sound) this.sound(en.sound);
    list.forEach(function (eff) {
      var e = parseEffect(eff); if (!e) return; var merged = Object.assign({}, base, e);
      if (merged.type === 'sound') return;
      self.play(merged, info);
    });
  };
  P._timeTick = function () {
    if (this.paused) return;
    var t = performance.now() - this.startedAt, self = this;
    this.timeline.forEach(function (en) {
      var tr = en._t;
      if (tr.kind === 'time' && !self.fired[en._k] && t >= tr.n) { self.fired[en._k] = 1; self.runEntry(en, {}); }
      if (tr.kind === 'every_ms' && tr.n > 0) { var due = Math.floor(t / tr.n); if (due > (self.fired[en._k] || 0)) { self.fired[en._k] = due; if (en.chance == null || Math.random() < en.chance) self.runEntry(en, {}); } }
    });
  };

  /* ================= effect implementations ================= */
  P.fx_sound = function () { };
  P.fx_shake = function (e) {
    if (this.reduced()) return;
    var target = e.target === 'screen' ? document.getElementById('app') : this.wrap, amp = e.intensity || 8, dur = e.duration_ms || 420;
    var frames = [], n = Math.max(6, Math.round(dur / 40));
    for (var i = 0; i <= n; i++) { var k = 1 - i / n, x = (Math.random() * 2 - 1) * amp * k, y = (Math.random() * 2 - 1) * amp * k * 0.6; frames.push({ transform: 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)' }); }
    frames[frames.length - 1] = { transform: 'translate(0,0)' };
    return anim(target, frames, { duration: dur, easing: 'linear' });
  };
  P.fx_flash = function (e, info) {
    var at = this._resolve(e.at || e.target || 'screen', info), dur = e.duration_ms || 350, peak = (e.opacity != null ? e.opacity : 0.85) * (this.reduced() ? 0.5 : 1);
    var el;
    if (typeof at === 'number') { var r = this._sqRect(at); if (!r) return; el = this._el(this.layer, 'fx-sqflash', { left: r.x + 'px', top: r.y + 'px', width: r.w + 'px', height: r.h + 'px', background: e.color || '#ff2341' }); }
    else el = this._el(at === 'board' ? this.layer : this.screen, 'fx-flash', { background: e.color || '#ffffff' });
    var hold = e.hold != null ? e.hold : 0.34;
    return anim(el, [{ opacity: 0 }, { opacity: peak, offset: 0.15 }, { opacity: peak, offset: 0.15 + hold }, { opacity: 0 }], { duration: dur, easing: 'ease-out' }).then(function () { el.remove(); });
  };
  P.fx_square_flash = function (e, info) { return this.fx_flash(Object.assign({ hold: 0.33 }, e, { at: e.at || 'to' }), info); };
  P._persistOrTimed = function (key, el, e) {
    var self = this, dur = e.duration_ms || 0, fade = e.fade_ms != null ? e.fade_ms : 300;
    if (this.persist[key]) this.persist[key].remove();
    el.style.opacity = 0; el.getBoundingClientRect();
    el.style.transition = 'opacity ' + fade + 'ms ease'; el.style.opacity = e.opacity != null ? e.opacity : 1;
    var handle = { remove: function () { el.style.opacity = 0; setTimeout(function () { el.remove(); }, fade + 20); } };
    this.persist[key] = handle;
    if (dur > 0) this._after(dur, function () { if (self.persist[key] === handle) { handle.remove(); delete self.persist[key]; } });
    return handle;
  };
  P.fx_tint = function (e) {
    var el = this._el(e.target === 'board' ? this.layer : this.screen, 'fx-tint', { background: e.color || 'rgba(120,0,0,1)', mixBlendMode: e.blend || 'multiply' });
    this._persistOrTimed('tint' + (e.id ? '#' + e.id : ''), el, Object.assign({ opacity: 0.35 }, e));
  };
  P.fx_vignette = function (e) {
    var c = e.color || 'rgba(0,0,0,0.85)', size = e.size || 55;
    var el = this._el(e.target === 'board' ? this.layer : this.screen, 'fx-vignette', { background: 'radial-gradient(ellipse at center, transparent ' + size + '%, ' + c + ' 100%)' });
    this._persistOrTimed('vignette' + (e.id ? '#' + e.id : ''), el, e);
  };
  P.fx_scanlines = function (e) { var el = this._el(this.layer, 'fx-scanlines'); this._persistOrTimed('scanlines', el, Object.assign({ opacity: 0.5 }, e)); };
  P.fx_blur = function (e) {
    var self = this, px = e.intensity || 3, dur = e.duration_ms || 0;
    this.board.style.filter = 'blur(' + px + 'px)';
    var h = { remove: function () { self.board.style.filter = ''; } }; this.persist.blur = h;
    if (dur) this._after(dur, function () { h.remove(); delete self.persist.blur; });
  };
  P.fx_invert = function (e) {
    var self = this; this.wrap.classList.add('fx-invert');
    var h = { remove: function () { self.wrap.classList.remove('fx-invert'); } }; this.persist.invert = h;
    if (e.duration_ms) this._after(e.duration_ms, function () { h.remove(); delete self.persist.invert; });
  };
  P.fx_overlay = function (e, info) {
    var at = this._resolve(e.at || 'screen', info), el, parent = at === 'board' || typeof at === 'number' ? this.layer : this.screen;
    el = this._el(parent, 'fx-overlay' + (e.cls ? ' ' + e.cls : ''));
    if (typeof at === 'number') { var r = this._sqRect(at); if (r) Object.assign(el.style, { left: r.x + 'px', top: r.y + 'px', width: r.w + 'px', height: r.h + 'px', inset: 'auto' }); }
    if (e.image) el.style.backgroundImage = 'url("' + e.image + '")';
    el.style.backgroundSize = e.fit || 'cover';
    if (e.html) el.innerHTML = e.html; else if (e.text) el.innerHTML = '<span>' + U.esc(e.text) + '</span>';
    if (e.blend) el.style.mixBlendMode = e.blend;
    this._persistOrTimed('overlay' + (e.id ? '#' + e.id : '#' + Math.random()), el, e);
  };
  P.fx_text = function (e, info) {
    var at = this._resolve(e.at || 'board', info), el, r = typeof at === 'number' ? this._sqRect(at) : null;
    el = this._el(r ? this.layer : (at === 'screen' ? this.screen : this.layer), 'fx-text' + (r ? ' fx-text--sq' : ''), { color: e.color || '#fff' });
    el.textContent = e.text || '';
    if (e.size) el.style.fontSize = e.size;
    if (r) Object.assign(el.style, { left: (r.x + r.w / 2) + 'px', top: (r.y + r.h * 0.2) + 'px' });
    var dur = e.duration_ms || 1200, rise = this.reduced() ? 0 : (r ? -r.h * 0.6 : -16);
    return anim(el, [{ opacity: 0, transform: 'translate(-50%, 6px)' }, { opacity: 1, transform: 'translate(-50%, 0)', offset: 0.15 }, { opacity: 1, offset: 0.7 }, { opacity: 0, transform: 'translate(-50%,' + rise + 'px)' }], { duration: dur, easing: 'ease-out' }).then(function () { el.remove(); });
  };
  P.fx_jumpscare = function (e) {
    var dur = e.duration_ms || 1100, red = this.reduced(), self = this;
    var el = this._el(this.screen, 'fx-jumpscare' + (e.cls ? ' ' + e.cls : ''), { background: e.background || '#000' });
    var img = document.createElement('div'); img.className = 'fx-jumpscare__img';
    if (e.image) img.style.backgroundImage = 'url("' + e.image + '")';
    el.appendChild(img);
    if (!e.sound && e.sound !== 'none') this.sound('jumpscare');
    var a1 = anim(el, [{ opacity: 0 }, { opacity: 1, offset: red ? 0.25 : 0.04 }, { opacity: 1, offset: 0.8 }, { opacity: 0 }], { duration: dur, easing: 'linear' });
    if (!red) {
      anim(img, [{ transform: 'scale(0.6)' }, { transform: 'scale(1.08)', offset: 0.12 }, { transform: 'scale(1.0)', offset: 0.3 }, { transform: 'scale(1.15)' }], { duration: dur, easing: 'ease-out' });
      if (e.shake !== false) this.fx_shake({ target: 'screen', intensity: e.intensity || 18, duration_ms: Math.min(600, dur) });
    }
    return a1.then(function () { el.remove(); });
  };
  P.fx_glitch = function (e) {
    var self = this, dur = e.duration_ms || 600, w = this.wrap;
    if (this.reduced()) return this.fx_flash({ color: '#000', opacity: 0.35, duration_ms: 300, at: 'board' });
    w.style.setProperty('--glitch-amp', (e.intensity || 6) + 'px');
    w.classList.add('fx-glitching');
    var bars = this._el(this.layer, 'fx-glitchbars');
    for (var i = 0; i < 6; i++) { var b = document.createElement('i'); b.style.top = (Math.random() * 100) + '%'; b.style.height = (2 + Math.random() * 10) + '%'; b.style.animationDelay = (Math.random() * 200) + 'ms'; bars.appendChild(b); }
    return new Promise(function (res) { self._after(dur, function () { w.classList.remove('fx-glitching'); bars.remove(); res(); }); });
  };
  P.fx_particles = function (e, info) {
    var at = this._resolve(e.at || 'to', info), r = typeof at === 'number' ? this._sqRect(at) : null;
    var lr = this.layer.getBoundingClientRect();
    if (!r) r = { x: lr.width / 2 - 20, y: lr.height / 2 - 20, w: lr.width / 8, h: lr.height / 8 };
    var K = Object.assign({}, PARTICLE_KINDS[e.kind || 'explosion'] || PARTICLE_KINDS.explosion, e);
    var n = this.reduced() ? Math.ceil((K.count || 20) / 3) : (K.count || 20), cx = r.x + r.w / 2, cy = r.y + r.h / 2, ps = [];
    for (var i = 0; i < n; i++) {
      var s = (K.size[0] + Math.random() * (K.size[1] - K.size[0])) * r.w, ang = Math.random() * Math.PI * 2, dist = (0.3 + Math.random()) * K.spread * r.w * 0.5;
      var p = this._el(this.layer, 'fx-particle' + (K.square ? ' is-sq' : ''), { left: (cx - s / 2) + 'px', top: (cy - s / 2) + 'px', width: s + 'px', height: s + 'px', background: (K.colors || ['#fff'])[i % (K.colors || ['#fff']).length] });
      if (K.image) { p.style.background = 'url("' + K.image + '") center/contain no-repeat'; }
      var dx = Math.cos(ang) * dist, dy = Math.sin(ang) * dist, g = (K.gravity || 0) * r.h * 0.8, dur = (K.dur || 700) * (0.7 + Math.random() * 0.5);
      ps.push(anim(p, [{ transform: 'translate(0,0) scale(1) rotate(0deg)', opacity: 1 },
        { transform: 'translate(' + dx * 0.8 + 'px,' + (dy * 0.8) + 'px) scale(0.95) rotate(' + (Math.random() * 360) + 'deg)', opacity: 1, offset: 0.55 },
        { transform: 'translate(' + dx + 'px,' + (dy + g) + 'px) scale(0.6) rotate(' + (Math.random() * 540) + 'deg)', opacity: 0 }],
        { duration: dur, easing: 'cubic-bezier(.15,.7,.3,1)' }).then((function (q) { return function () { q.remove(); }; })(p)));
    }
    return Promise.all(ps);
  };
  P.fx_explosion = function (e, info) {
    var at = this._resolve(e.at || 'to', info), r = typeof at === 'number' ? this._sqRect(at) : null;
    if (!e.sound) this.sound('explosion');
    var jobs = [this.fx_particles(Object.assign({}, e, { kind: 'explosion', at: at, sound: null }), info)];
    if (r) {
      var size = (e.radius || 1) * 2 + 1, w = r.w * Math.min(size, 3);
      var img = this._el(this.layer, 'fx-boom', { left: (r.x + r.w / 2 - w / 2) + 'px', top: (r.y + r.h / 2 - w / 2) + 'px', width: w + 'px', height: w + 'px', backgroundImage: 'url("' + (e.image || 'assets/img/boom.png') + '")' });
      jobs.push(anim(img, [{ transform: 'scale(0.3)', opacity: 0 }, { transform: 'scale(1.05)', opacity: 1, offset: 0.25 }, { transform: 'scale(1.15)', opacity: 0 }], { duration: e.duration_ms || 700, easing: 'ease-out' }).then(function () { img.remove(); }));
    }
    if (e.shake !== false) jobs.push(this.fx_shake({ intensity: e.intensity || 7, duration_ms: 380 }));
    return Promise.all(jobs);
  };
  P.fx_highlight = function (e, info) {
    var self = this, sqs = e.squares ? (this.game && this.game.resolveSquares ? this.game.resolveSquares(e.squares) : []) : [this._resolve(e.at || 'to', info)];
    var els = sqs.filter(function (s) { return typeof s === 'number'; }).map(function (s) {
      var r = self._sqRect(s); return r && self._el(self.layer, 'fx-hl', { left: r.x + 'px', top: r.y + 'px', width: r.w + 'px', height: r.h + 'px', background: e.color || 'rgba(204,0,255,.5)' });
    }).filter(Boolean);
    var h = { remove: function () { els.forEach(function (x) { x.remove(); }); } };
    if (e.duration_ms) this._after(e.duration_ms, function () { h.remove(); });
    else this.persist['highlight#' + (e.id || Math.random())] = h;
  };
  /* arrow: chess.com-style translucent arrow from one square to another */
  P.fx_arrow = function (e, info) {
    var f = this._resolve(e.from || 'from', info), t = this._resolve(e.to || 'to', info);
    if (typeof f !== 'number' || typeof t !== 'number' || f === t) return;
    var a = this._sqRect(f), b = this._sqRect(t); if (!a || !b) return;
    var x1 = a.x + a.w / 2, y1 = a.y + a.h / 2, x2 = b.x + b.w / 2, y2 = b.y + b.h / 2, w = (e.width || 0.22) * a.w;
    var ang = Math.atan2(y2 - y1, x2 - x1), len = Math.hypot(x2 - x1, y2 - y1) - a.w * 0.2, head = w * 2.1;
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); svg.setAttribute('class', 'fx-tmp fx-arrow');
    var lr = this.layer.getBoundingClientRect(); svg.setAttribute('width', lr.width); svg.setAttribute('height', lr.height);
    var c = e.color || 'rgba(255, 170, 0, 0.8)';
    svg.innerHTML = '<g transform="translate(' + x1 + ',' + y1 + ') rotate(' + (ang * 180 / Math.PI) + ')"><rect x="0" y="' + (-w / 2) + '" width="' + Math.max(0, len - head) + '" height="' + w + '" fill="' + c + '"/><polygon points="' + (len - head) + ',' + (-head * 0.62) + ' ' + len + ',0 ' + (len - head) + ',' + (head * 0.62) + '" fill="' + c + '"/></g>';
    this.layer.appendChild(svg);
    var dur = e.duration_ms || 900;
    return anim(svg, [{ opacity: 0 }, { opacity: 1, offset: 0.15 }, { opacity: 1, offset: 0.75 }, { opacity: 0 }], { duration: dur, easing: 'ease-out' }).then(function () { svg.remove(); });
  };
  P.fx_shake_piece = function (e, info) {
    var at = this._resolve(e.at || 'to', info), img = typeof at === 'number' ? this.view.pieceEl(at) : null;
    if (!img || this.reduced()) return;
    var amp = e.intensity || 5, frames = []; for (var i = 0; i < 12; i++) frames.push({ transform: 'translateX(' + (i % 2 ? amp : -amp) + '%)' }); frames.push({ transform: 'none' });
    return anim(img, frames, { duration: e.duration_ms || 600, easing: 'linear' });
  };
  /* piece_transform: visual morph on a square; the state change itself is done by the game (ctx.transform) */
  P.fx_piece_transform = function (e, info) {
    var at = this._resolve(e.at || 'to', info), self = this;
    if (typeof at !== 'number') return;
    if (e.to && this.game && this.game.transformPiece) this.game.transformPiece(at, e.to);
    var img = this.view.pieceEl(at); if (!img) return;
    var style = e.style || 'flip';
    if (this.reduced() || style === 'fade') return anim(img, [{ opacity: 0.2 }, { opacity: 1 }], { duration: e.duration_ms || 300 });
    if (style === 'flash') { this.fx_flash({ at: at, color: e.color || '#fff', duration_ms: 300 }, info); return anim(img, [{ filter: 'brightness(3)' }, { filter: 'none' }], { duration: e.duration_ms || 400 }); }
    if (style === 'gold') { this.fx_particles({ kind: 'gold', at: at }, info); return anim(img, [{ filter: 'sepia(1) saturate(4) brightness(1.4)' }, { filter: 'none' }], { duration: e.duration_ms || 500 }); }
    return anim(img, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: e.duration_ms || 260, easing: 'ease-out' });
  };
  P.fx_fade_board = function (e) {
    var b = this.board, to = e.opacity != null ? e.opacity : 0, dur = e.duration_ms || 500;
    return anim(b, [{ opacity: 1 }, { opacity: to, offset: 0.4 }, { opacity: to, offset: 0.6 }, { opacity: 1 }], { duration: dur * 2, easing: 'ease-in-out' });
  };

  /* ---------- darkness / vision / fog masks (square-accurate, recomputed on every render) ---------- */
  P.fx_darkness = function (e) {
    var self = this;
    this._mask = Object.assign({ type: 'darkness', radius: 1, source: 'own_pieces', opacity: 0.94, color: '#000', soft: true }, e);
    var key = e.type === 'fog' ? 'fog' : 'darkness', h = { remove: function () { if (self._mask && self._mask.type === e.type) { self._mask = null; self._renderMask(); } } };
    this.persist[key] = h; this._renderMask();
    if (e.duration_ms) this._after(e.duration_ms, function () { if (self.persist[key] === h) { h.remove(); delete self.persist[key]; } });
  };
  P.fx_vision = P.fx_darkness;
  P.fx_fog = function (e) { return this.fx_darkness(Object.assign({ source: 'reach', radius: 0, opacity: 1, color: '#9aa2a8', texture: 'fog' }, e, { type: 'fog' })); };
  P.refreshMask = function () { if (this._mask) this._renderMask(); };
  P._renderMask = function () {
    var layer = this.layer, old = layer.querySelector(':scope > .fx-mask');
    if (!this._mask) { if (old) { old.style.opacity = 0; setTimeout(function () { old.remove(); }, 320); } return; }
    var m = this._mask, vis = this.game && this.game.visionSet ? this.game.visionSet(m) : null; if (!vis) return;
    var g = this.view, F = g.files, R = g.ranks, el = old;
    if (!el || el.children.length !== F * R) { if (old) old.remove(); el = this._el(layer, 'fx-mask'); el.classList.remove('fx-tmp'); el.style.setProperty('--files', F); el.style.setProperty('--ranks', R);
      var h = ''; for (var k = 0; k < F * R; k++) h += '<i></i>'; el.innerHTML = h; }
    if (m.texture === 'fog') el.classList.add('is-fog');
    for (var k2 = 0; k2 < F * R; k2++) {
      var i = g.dispToSq(k2), d = vis.dist ? vis.dist[i] : (vis.has(i) ? 0 : 99), o;
      if (d === 0) o = 0; else if (m.soft && d === 1 && m.type !== 'fog') o = m.opacity * 0.55; else o = m.opacity;
      var c = el.children[k2]; c.style.opacity = o; c.style.background = m.color;
    }
  };

  CM.VFX = VFX;
  CM.vfxParse = { effect: parseEffect, trigger: parseTrigger, PARTICLE_KINDS: PARTICLE_KINDS };
})();
