/* game-fx families (m3-art, owner 2026-11-26 2:05 PM ET: "Don't just do good vfx and UI for the horror, do it for the
   others"). On-board, one-shot effects for NON-horror modes, chosen family by family from the mode's own pieces and
   events, at the quality of the horror ability-fx. Loaded after js/fx/game-fx.js + game-fx-modes.js.

   New effect types (usable in any vfx_timeline / ctx.fx):
     muzzle      { from, at }            gun / bazooka: muzzle flash on the shooter, tracer to the target, impact sparks
     shockwave   { at, radius, color }   nuke / bomb: white core flash, double shock ring, scorch under the pieces, debris
     firebreath  { from, at }            dragon: a cone of flame puffs from the dragon to its victim, embers on impact
     glyph       { at, color }           spell / magic: a rune circle that turns and fades on the square
     chomp       { at, color }           Pac-Man: a yellow mouth bites twice on the square, pellet crumbs pop out
     drop        { at }                  duck / placed piece: landing shadow + dust ring under the piece
   Family wiring (FAMILY below) runs when a game sets its timeline: it reads spec.pieces names (Dragon*, Drake, Nuke,
   Bomb, Bazooka, Gun, Sniper, ...) and spec ids/titles, and appends entries for the capture/move of that piece type, unless
   the mode drives that trigger itself or is a horror mode (CM.horrorCine.REG) or a 3D view mode. Generic capture presets
   (capture_sparks ...) skip the moves a family effect already covers (no double fx).
   Rules (same as game-fx): one-shot pulses only, nothing moves pieces, transform/opacity animations, <= 24 particles,
   prefers-reduced-motion = short fades only (no travel, scale, shake). */
(function () {
  'use strict';
  var CM = window.CM; if (!CM || !CM.VFX) return;
  var P = CM.VFX.prototype;
  function anim(el, frames, opt) { var a = el.animate(frames, opt); return new Promise(function (r) { a.onfinish = a.oncancel = function () { r(); }; }); }
  function rm(el) { return function () { el.remove(); }; }

  P._famC = function (at, info) {
    var sq = this._gfxAt({ at: at }, info);
    if (sq == null || sq < 0) return null;
    var c = this._gfxCenter(sq); c.sq = sq; return c;
  };

  /* ---- muzzle: flash on the shooter, tracer, impact ---- */
  P.fx_muzzle = function (e, info) {
    var a = this._famC(e.from || 'from', info), b = this._famC(e.at || 'to', info); if (!b) return;
    var red = this.reduced(), jobs = [], col = e.color || '#ffe08a';
    if (a) {
      var d = a.s * 0.9, fl = this._el(this.layer, 'gfxf-muzzle', { left: (a.x - d / 2) + 'px', top: (a.y - d / 2) + 'px', width: d + 'px', height: d + 'px' });
      jobs.push(anim(fl, red ? [{ opacity: 0.6 }, { opacity: 0 }] : [{ opacity: 1, transform: 'scale(0.35) rotate(0deg)' }, { opacity: 1, transform: 'scale(1.1) rotate(25deg)', offset: 0.3 }, { opacity: 0, transform: 'scale(1.3) rotate(40deg)' }],
        { duration: red ? 200 : 180, easing: 'ease-out' }).then(rm(fl)));
      if (!red) {
        var dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy), ang = Math.atan2(dy, dx) * 180 / Math.PI, th = Math.max(2, a.s * 0.07);
        var tr = this._el(this.layer, 'gfxf-tracer', { left: a.x + 'px', top: (a.y - th / 2) + 'px', width: len + 'px', height: th + 'px', transform: 'rotate(' + ang + 'deg) scaleX(0)', '--gfx-tr': col });
        jobs.push(anim(tr, [{ transform: 'rotate(' + ang + 'deg) scaleX(0)', opacity: 1 }, { transform: 'rotate(' + ang + 'deg) scaleX(1)', opacity: 1, offset: 0.45 }, { transform: 'rotate(' + ang + 'deg) scaleX(1)', opacity: 0 }],
          { duration: 220, easing: 'ease-out' }).then(rm(tr)));
      }
    }
    var self = this;
    jobs.push(new Promise(function (r) { setTimeout(r, red ? 0 : 90); }).then(function () {
      if (red) return Promise.all([self.fx_flash({ at: b.sq, color: '#fff2c0', opacity: 0.5, duration_ms: 260 }, info), self.fx_ring({ at: b.sq, color: col, size: 1.4 }, info)]);
      return Promise.all([self.fx_flash({ at: b.sq, color: '#fff2c0', opacity: 0.5, duration_ms: 220 }, info),
        self.fx_particles({ at: b.sq, kind: 'sparks', count: 12 }, info),
        self.fx_ring({ at: b.sq, color: col, size: e.big ? 2.4 : 1.4, duration_ms: 380 }, info),
        e.big ? self.fx_explosion({ at: b.sq, intensity: 5 }, info) : self.fx_shake({ intensity: 3, duration_ms: 160 })]);
    }));
    return Promise.all(jobs);
  };

  /* ---- shockwave: nuke / bomb impact ---- */
  P.fx_shockwave = function (e, info) {
    var c = this._famC(e.at || 'to', info); if (!c) return;
    var red = this.reduced(), rad = e.radius || 1, jobs = [], self = this;
    var core = c.s * 1.6, cf = this._el(this.layer, 'gfxf-core', { left: (c.x - core / 2) + 'px', top: (c.y - core / 2) + 'px', width: core + 'px', height: core + 'px' });
    jobs.push(anim(cf, red ? [{ opacity: 0.6 }, { opacity: 0 }] : [{ opacity: 1, transform: 'scale(0.2)' }, { opacity: 1, transform: 'scale(1)', offset: 0.25 }, { opacity: 0, transform: 'scale(1.35)' }],
      { duration: red ? 300 : 520, easing: 'ease-out' }).then(rm(cf)));
    var sc = c.s * (rad * 2 + 1) * 0.95, under = this._underLayer ? this._underLayer() : this.layer;
    var lr = this.layer.getBoundingClientRect(), ur = under.getBoundingClientRect(), ox = lr.left - ur.left, oy = lr.top - ur.top;
    var scorch = this._el(under, 'gfxf-scorch', { left: (c.x + ox - sc / 2) + 'px', top: (c.y + oy - sc / 2) + 'px', width: sc + 'px', height: sc + 'px' });
    jobs.push(anim(scorch, [{ opacity: 0 }, { opacity: 0.75, offset: 0.12 }, { opacity: 0.6, offset: 0.6 }, { opacity: 0 }], { duration: 1500, easing: 'ease-out' }).then(rm(scorch)));
    if (!red) {
      jobs.push(this.fx_ring({ at: c.sq, color: e.color || '#ffb347', size: rad * 2 + 1.6, width: Math.max(3, c.s * 0.12), duration_ms: 620 }, info));
      jobs.push(new Promise(function (r) { setTimeout(r, 90); }).then(function () { return self.fx_ring({ at: c.sq, color: '#ffffff', size: rad * 2 + 2.6, width: 2, duration_ms: 700 }, info); }));
      jobs.push(this.fx_particles({ at: c.sq, kind: 'explosion', count: 22, spread: 2.2 + rad }, info));
      jobs.push(this.fx_particles({ at: c.sq, kind: 'smoke', count: 8, delay_ms: 0 }, info));
      jobs.push(this.fx_shake({ intensity: e.intensity || 9, duration_ms: 420 }));
    }
    if (e.sound !== false) this.sound(e.sound || 'explosion');
    return Promise.all(jobs);
  };

  /* ---- firebreath: dragon flame cone from -> to ---- */
  P.fx_firebreath = function (e, info) {
    var a = this._famC(e.from || 'from', info), b = this._famC(e.at || 'to', info); if (!b) return;
    var red = this.reduced(), self = this, jobs = [];
    if (red || !a) return Promise.all([this.fx_flash({ at: b.sq, color: '#ff7a1a', opacity: 0.45, duration_ms: 320 }, info)]);
    /* flame rides the last move's line: the dragon already slid onto the target, so breathe from one square back */
    var dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L;
    var sx = b.x - ux * Math.min(L, b.s * 1.6), sy = b.y - uy * Math.min(L, b.s * 1.6), n = 10;
    for (var i = 0; i < n; i++) (function (k) {
      var s0 = b.s * (0.22 + 0.05 * k), d = s0 * 2.2, jitter = (Math.random() - 0.5) * b.s * 0.35;
      var px = this._el(this.layer, 'gfxf-flame', { left: (sx - d / 2) + 'px', top: (sy - d / 2) + 'px', width: d + 'px', height: d + 'px' });
      var tx = (b.x - sx) + -uy * jitter, ty = (b.y - sy) + ux * jitter;
      jobs.push(anim(px, [{ transform: 'translate(0,0) scale(0.3)', opacity: 0 }, { transform: 'translate(' + tx * 0.45 + 'px,' + ty * 0.45 + 'px) scale(0.8)', opacity: 0.95, offset: 0.35 },
        { transform: 'translate(' + tx + 'px,' + ty + 'px) scale(1.25)', opacity: 0 }], { duration: 420, delay: k * 32, easing: 'cubic-bezier(.2,.6,.3,1)' }).then(rm(px)));
    }).call(this, i);
    jobs.push(new Promise(function (r) { setTimeout(r, 300); }).then(function () {
      return Promise.all([self.fx_flash({ at: b.sq, color: '#ff8c2a', opacity: 0.5, duration_ms: 300 }, info),
        self.fx_particles({ at: b.sq, kind: 'sparks', colors: ['#ffd35a', '#ff8a2a', '#ff4d1a'], count: 14, gravity: -0.5 }, info),
        self.fx_particles({ at: b.sq, kind: 'smoke', count: 5 }, info)]);
    }));
    return Promise.all(jobs);
  };

  /* ---- glyph: spell rune circle ---- */
  var RUNE = '<svg viewBox="-50 -50 100 100" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor">' +
    '<circle r="46" stroke-width="3"/><circle r="38" stroke-width="1.5" stroke-dasharray="5 4"/>' +
    '<path d="M0-38 33 19-33 19Z M0 38-33-19 33-19Z" stroke-width="2.2"/><circle r="11" stroke-width="2"/></svg>';
  P.fx_glyph = function (e, info) {
    var c = this._famC(e.at || 'to', info); if (!c) return;
    var red = this.reduced(), d = c.s * (e.size || 1.5), col = e.color || '#8fd3ff';
    var g = this._el(this.layer, 'gfxf-glyph', { left: (c.x - d / 2) + 'px', top: (c.y - d / 2) + 'px', width: d + 'px', height: d + 'px', color: col });
    g.innerHTML = RUNE;
    var jobs = [anim(g, red ? [{ opacity: 0 }, { opacity: 0.8, offset: 0.3 }, { opacity: 0 }] : [{ opacity: 0, transform: 'scale(0.55) rotate(-40deg)' }, { opacity: 1, transform: 'scale(1) rotate(0deg)', offset: 0.35 },
      { opacity: 0.85, transform: 'scale(1.02) rotate(35deg)', offset: 0.75 }, { opacity: 0, transform: 'scale(1.12) rotate(60deg)' }], { duration: red ? 500 : 900, easing: 'ease-out' }).then(rm(g))];
    if (!red) jobs.push(this.fx_particles({ at: c.sq, kind: 'sparks', colors: [col, '#ffffff'], count: 10, gravity: -0.4 }, info));
    return Promise.all(jobs);
  };

  /* ---- chomp: Pac-Man bite ---- */
  P.fx_chomp = function (e, info) {
    var c = this._famC(e.at || 'to', info); if (!c) return;
    var red = this.reduced(), d = c.s * 0.86;
    var m = this._el(this.layer, 'gfxf-chomp', { left: (c.x - d / 2) + 'px', top: (c.y - d / 2) + 'px', width: d + 'px', height: d + 'px', background: e.color || '#ffd400' });
    var O = 'polygon(50% 50%, 100% 15%, 100% 0, 0 0, 0 100%, 100% 100%, 100% 85%)', C = 'polygon(50% 50%, 100% 49%, 100% 0, 0 0, 0 100%, 100% 100%, 100% 51%)';
    var jobs = [anim(m, red ? [{ opacity: 0.8, clipPath: O }, { opacity: 0, clipPath: O }] : [{ opacity: 0, clipPath: O, transform: 'scale(0.6)' }, { opacity: 1, clipPath: C, transform: 'scale(1)', offset: 0.22 },
      { opacity: 1, clipPath: O, offset: 0.45 }, { opacity: 1, clipPath: C, offset: 0.68 }, { opacity: 0, clipPath: O, transform: 'scale(1.05)' }], { duration: red ? 300 : 520, easing: 'linear' }).then(rm(m))];
    if (!red) jobs.push(this.fx_particles({ at: c.sq, kind: 'sparks', colors: ['#ffffff', '#ffe9a8'], count: 8, size: [0.05, 0.08], gravity: 0.1 }, info));
    return Promise.all(jobs);
  };

  /* ---- drop: something placed on a square (duck) ---- */
  P.fx_drop = function (e, info) {
    var c = this._famC(e.at || 'to', info); if (!c) return;
    var red = this.reduced(), d = c.s * 0.9, under = this._underLayer ? this._underLayer() : this.layer;
    var lr = this.layer.getBoundingClientRect(), ur = under.getBoundingClientRect();
    var sh = this._el(under, 'gfxf-shadow', { left: (c.x + lr.left - ur.left - d / 2) + 'px', top: (c.y + lr.top - ur.top - d * 0.15) + 'px', width: d + 'px', height: (d * 0.38) + 'px' });
    var jobs = [anim(sh, red ? [{ opacity: 0.4 }, { opacity: 0 }] : [{ opacity: 0.1, transform: 'scale(1.6)' }, { opacity: 0.55, transform: 'scale(0.85)', offset: 0.55 }, { opacity: 0, transform: 'scale(1)' }], { duration: red ? 260 : 460, easing: 'ease-in' }).then(rm(sh))];
    if (!red) {
      var self = this;
      jobs.push(new Promise(function (r) { setTimeout(r, 220); }).then(function () { return Promise.all([self.fx_ring({ at: c.sq, color: e.color || '#e6dcc6', size: 1.3, width: 2, duration_ms: 420 }, info), self.fx_particles({ at: c.sq, kind: 'dust', count: 8 }, info)]); }));
    }
    return Promise.all(jobs);
  };

  /* ---------- family wiring ---------- */
  var FAM = [
    { re: /\b(dragon(?!fly| ?egg| king| horse)|drake|wyvern)/i, fx: 'firebreath' },   /* shogi Dragon King/Horse = promoted rook/bishop, not dragons */
    { re: /\b(nuke|nuclear|atom bomb|bomb|missile|warhead)\b/i, fx: 'shockwave' },
    { re: /\b(bazooka|rocket launcher)\b/i, fx: 'muzzle', big: true },   /* xiangqi Cannon is a chess piece, not a gun */
    { re: /\b(gun|pistol|rifle|musket|sniper|shotgun|minigun|revolver|gunner)\b/i, fx: 'muzzle' }
  ];
  /* modes that already draw their own effect for these pieces (their hooks call ctx.fx / own timelines) */
  var SKIP = { 'AoREbapF7y0': 1, 'd-4NWgCwzco': 1, '0VbTOk8X1TY': 1, 'cYVauucyLyQ': 1, 'PhcIDwTqQKA': 1, 'b0peFhZs4yU': 1, 'uQ0kzL0-taQ': 1, 'wTudFnunSL0': 1,
    'lmmKhSrRn_c': 1, 'Ev0RO3V2_uE': 1, 'IbRrzKtieqs': 1, 'Nz2A-g73_iM': 1, 'AWFB4EzGtDc': 1,
    /* Shotgun King: g4/g5_shotgun draw the video's cone + muzzle flash themselves */
    '9j7h5kF4X9s': 1, 'AvZiSnngZjA': 1, 'NK4Upb_s8Ok': 1, 'pzxXxIsKRRo': 1 };
  function famEntries(spec, own) {
    if (!spec || !spec.pieces || SKIP[spec.id]) return [];
    if (CM.horrorCine && CM.horrorCine.REG && CM.horrorCine.REG[spec.id]) return [];
    if (spec.view3d || spec.lift3d || spec.three) return [];
    var hk = spec.hooks; if (hk && typeof hk === 'object' && /view3d|lift3d|scene3d|battle3d|fps3d/.test(String(hk.onStart || ''))) return [];   /* real-3D views cover the DOM board */
    var takenCap = (own || []).some(function (en) { var t = en.trigger; return (t && typeof t === 'object' ? (t.on || t.kind) : String(t || '').split(':')[0]) === 'capture'; });
    var out = [];
    Object.keys(spec.pieces).forEach(function (t) {
      var p = spec.pieces[t] || {}, nm = (p.name || t) + ' ' + t;
      for (var i = 0; i < FAM.length; i++) if (FAM[i].re.test(nm)) {
        if (takenCap) break;
        var eff = { type: FAM[i].fx }; if (FAM[i].big) eff.big = true;
        out.push({ trigger: { on: 'capture', piece: t }, effect: eff, _fam: t });
        break;
      }
    });
    return out;
  }
  /* per-mode family entries for modes whose signal is an event, not a piece name (filled per family batch) */
  CM.gameFxFamilyModes = CM.gameFxFamilyModes || {};

  var setTimeline = P.setTimeline;
  P.setTimeline = function (list) {
    var r = setTimeline.call(this, list);
    var spec = this.game && this.game.spec, fam = famEntries(spec, list), extra = (spec && CM.gameFxFamilyModes[spec.id]) || [];
    if (!fam.length && !extra.length) return r;
    var famTypes = fam.map(function (f) { return f._fam; });
    /* generic capture presets skip captures a family effect already covers (no double fx) */
    if (famTypes.length) this.timeline.forEach(function (en) { if (en._t && en._t.kind === 'capture' && !en._t.piece) en._t.not_pieces = famTypes; });
    var tl = this.timeline, k0 = tl.length;
    fam.concat(JSON.parse(JSON.stringify(extra))).forEach(function (en, i) {
      var t = en.trigger, o = t && typeof t === 'object' ? Object.assign({ kind: t.on || t.kind || 'event' }, t) : { kind: String(t || '') };
      tl.push(Object.assign({ _k: k0 + i }, en, { _t: o }));
    });
    return r;
  };
  var matches = P._matches;
  P._matches = function (t, name, info) {
    if (t && t.not_pieces && info && t.not_pieces.indexOf(info.piece) >= 0) return false;
    return matches.call(this, t, name, info);
  };
  CM.gameFxFamilies = { FAM: FAM, SKIP: SKIP, entries: famEntries };
})();
