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
    var jobs = [anim(sh, red ? [{ opacity: 0.4 }, { opacity: 0 }] : [{ opacity: 0.1, transform: 'scale(1.6)' }, { opacity: 0.55, transform: 'scale(0.85)', offset: 0.55 }, { opacity: 0, transform: 'scale(1)' }], { duration: red ? 380 : 460, easing: 'ease-in' }).then(rm(sh))];
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
/* game-fx families batch 2 (s5-vfx, 2026-11-26; owner 2:05 PM ET "Don't just do good vfx and UI for the horror, do it
   for the others"). Per-family effects for modes whose signal is an event or one of the mode's own ctx.fx calls:
     Pac-Man sO-lD2On610      pacbite: the arcade Pac-Man (pixel sprite, 3 mouth frames, faces the move) bites the pellet,
                              '+1' / '+5' pixel score pops when Red or Yellow eats it (ghosts eat silently)
     Spell Chess (4 modes)    freeze cast: ice sweeps the 3x3 out from the centre + the video's freeze potion pops;
                              jump cast: the video's jump potion pops on the landing square
     Duck Chess (5 modes)     drop: landing shadow + dust ring when the duck is placed
     Dice Chess (15 modes)    the rolled dice tumble in and settle (the mode's own dice overlay)
     Spinner Wheel (2 modes)  the pointer flicks on every slice the spinning wheel passes, the picked slice label pops
     Roguelikes               Pawnbarian: the video's splash / zap / bolt sprites pop on their square; Ouroboros: the
                              Reaper's purple reap gets a scythe arc; Gambonanza: '+$1' pixel pop on your captures, a
                              falling tile drops away into the hole
     Drawback (all g2_drawback modes)  the site's drawback card deals in; the game-over dialog rises and the two difficulty
                              markers glide to their places (the reveal)
   Two hooks: object triggers in CM.gameFxFamilyModes[id] (extra keys: captured, flag = a truthy key of the move,
   by_side), and CM.gameFxUpgrades = one-shot extras that run after a mode's OWN ctx.fx call with a given signature
   (mode files stay untouched). Same rules as above: one-shot eased pulses, nothing persistent, transform/opacity,
   reduced motion = short fades or nothing. */
(function () {
  'use strict';
  var CM = window.CM; if (!CM || !CM.VFX) return;
  var P = CM.VFX.prototype;
  function anim(el, frames, opt) { var a = el.animate(frames, opt); return new Promise(function (r) { a.onfinish = a.oncancel = function () { r(); }; }); }
  function rm(el) { return function () { el.remove(); }; }
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  /* ---- extra trigger keys for family entries ---- */
  var matches = P._matches;
  P._matches = function (t, name, info) {
    if (t && (t.captured || t.flag || t.by_side)) {
      if (t.captured) { var cs = [].concat(t.captured); if (cs.indexOf(info.captured) < 0) return false; }
      if (t.flag && !(info.move && info.move[t.flag])) return false;
      if (t.by_side && [].concat(t.by_side).indexOf(info.side) < 0) return false;
    }
    return matches.call(this, t, name, info);
  };

  /* remember the element the last effect made (an overlay's node, for the upgrades below) */
  var mk = P._el;
  P._el = function () { var el = mk.apply(this, arguments); this._lastEl = el; return el; };

  /* ---- pacbite: arcade Pac-Man, 13x13 pixels, mouth frames wide / half / shut ---- */
  var PAC = {};
  function pacSvg(half) {
    if (PAC[half]) return PAC[half];
    var d = '', R = 6.5, a = half * Math.PI / 180;
    for (var y = 0; y < 13; y++) for (var x = 0; x < 13; x++) {
      var dx = x + 0.5 - R, dy = y + 0.5 - R;
      if (dx * dx + dy * dy > R * R) continue;
      if (half && dx > 0 && Math.abs(Math.atan2(dy, dx)) < a) continue;
      d += 'M' + x + ' ' + y + 'h1v1h-1z';
    }
    return (PAC[half] = '<svg viewBox="0 0 13 13" shape-rendering="crispEdges" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="' + d + '"/></svg>');
  }
  P.fx_pacbite = function (e, info) {
    var c = this._famC(e.at || 'to', info); if (!c) return;
    var a = this._famC(e.from || 'from', info), red = this.reduced(), d = c.s * 0.84;
    var ang = 0; if (a && (a.x !== c.x || a.y !== c.y)) { var dx = c.x - a.x, dy = c.y - a.y; ang = Math.abs(dx) >= Math.abs(dy) ? (dx < 0 ? 180 : 0) : (dy < 0 ? -90 : 90); }
    var box = this._el(this.layer, 'gfxf-pac', { left: (c.x - d / 2) + 'px', top: (c.y - d / 2) + 'px', width: d + 'px', height: d + 'px', color: e.color || '#ffe600' });
    var turn = document.createElement('div'); turn.className = 'gfxf-pac__turn'; turn.style.transform = 'rotate(' + ang + 'deg)'; box.appendChild(turn);
    var SEQ = [0, 1, 2, 1, 0, 1, 2], FR = [50, 26, 0], jobs = [], dur = red ? 0 : 470;
    FR.forEach(function (half, f) {
      var fr = document.createElement('div'); fr.className = 'gfxf-pac__fr'; fr.innerHTML = pacSvg(half); turn.appendChild(fr);
      if (red) { fr.style.opacity = f === 2 ? 1 : 0; return; }
      var kf = SEQ.map(function (s, i) { return { offset: i / SEQ.length, opacity: s === f ? 1 : 0, easing: 'step-end' }; });
      kf.push({ offset: 1, opacity: SEQ[SEQ.length - 1] === f ? 1 : 0 });
      jobs.push(anim(fr, kf, { duration: dur, fill: 'forwards' }));
    });
    var back = c.s * 0.42, rad = ang * Math.PI / 180, bx = -Math.cos(rad) * back, by = -Math.sin(rad) * back;
    jobs.push(anim(box, red ? [{ opacity: 0 }, { opacity: 0.9, offset: 0.3 }, { opacity: 0 }]
      : [{ opacity: 0, transform: 'translate(' + bx + 'px,' + by + 'px)' }, { opacity: 1, transform: 'translate(' + bx * 0.6 + 'px,' + by * 0.6 + 'px)', offset: 0.12 },
        { opacity: 1, transform: 'translate(0,0)', offset: 0.7 }, { opacity: 0, transform: 'translate(0,0)' }], { duration: red ? 360 : dur + 90, easing: 'linear' }).then(rm(box)));
    return Promise.all(jobs);
  };

  /* ---- pixpop: arcade score text (VT323, hard shadow, no glow) ---- */
  P.fx_pixpop = function (e, info) {
    var c = this._famC(e.at || 'to', info); if (!c) return;
    var red = this.reduced(), el = this._el(this.layer, 'gfxf-pix', { left: c.x + 'px', top: (c.y - c.s * 0.2) + 'px', color: e.color || '#ffffff', fontSize: Math.round(c.s * (e.scale || 0.62)) + 'px' });
    el.textContent = e.text || '';
    var rise = red ? 0 : -c.s * 0.55;
    return anim(el, [{ opacity: 0, transform: 'translate(-50%,-50%)' }, { opacity: 1, transform: 'translate(-50%,-50%)', offset: 0.1 },
      { opacity: 1, transform: 'translate(-50%,calc(-50% + ' + rise * 0.7 + 'px))', offset: 0.7 }, { opacity: 0, transform: 'translate(-50%,calc(-50% + ' + rise + 'px))' }],
      { duration: e.duration_ms || 820, easing: 'steps(8, end)' }).then(rm(el));
  };

  /* ---- sprite pop: one of the video's own sprites springs up on a square and fades (spell potions) ---- */
  P.fx_spritepop = function (e, info) {
    var c = this._famC(e.at || 'to', info); if (!c || !e.image) return;
    var red = this.reduced(), d = c.s * (e.size || 0.9);
    var el = this._el(this.layer, 'gfxf-sprite', { left: (c.x - d / 2) + 'px', top: (c.y - d / 2 - (e.lift || 0) * c.s) + 'px', width: d + 'px', height: d + 'px', backgroundImage: 'url("' + e.image + '")' });
    return anim(el, red ? [{ opacity: 0 }, { opacity: 1, offset: 0.25 }, { opacity: 1, offset: 0.7 }, { opacity: 0 }]
      : [{ opacity: 0, transform: 'translateY(30%) scale(0.35)' }, { opacity: 1, transform: 'translateY(-6%) scale(1.12)', offset: 0.24, easing: 'cubic-bezier(.3,.7,.4,1)' },
        { opacity: 1, transform: 'translateY(0) scale(1)', offset: 0.4 }, { opacity: 1, transform: 'translateY(-10%) scale(1)', offset: 0.72, easing: 'ease-in' },
        { opacity: 0, transform: 'translateY(-34%) scale(0.92)' }], { duration: red ? 700 : (e.duration_ms || 900), easing: 'ease-out' }).then(rm(el));
  };

  /* ---- frost: Spell Chess freeze, ice sweeps the 3x3 from the centre outwards ---- */
  P.fx_frost = function (e, info) {
    var c = this._famC(e.at || 'to', info), g = this.game, geo = g && g.V && g.V.geo; if (!c) return;
    var red = this.reduced(), jobs = [], self = this;
    for (var dr = -1; dr <= 1; dr++) for (var dc = -1; dc <= 1; dc++) {
      var sq = dc || dr ? (geo && geo.step ? geo.step(c.sq, dc, dr) : -1) : c.sq; if (sq == null || sq < 0) continue;
      var r = this._sqRect(sq); if (!r) continue;
      var k = Math.max(Math.abs(dc), Math.abs(dr));
      var t = this._el(this.layer, 'gfxf-ice', { left: r.x + 'px', top: r.y + 'px', width: r.w + 'px', height: r.h + 'px' });
      jobs.push(anim(t, red ? [{ opacity: 0 }, { opacity: 0.55, offset: 0.3 }, { opacity: 0 }]
        : [{ opacity: 0, transform: 'scale(0.55)' }, { opacity: 0.85, transform: 'scale(1)', offset: 0.3, easing: 'ease-out' }, { opacity: 0.6, transform: 'scale(1)', offset: 0.6 }, { opacity: 0, transform: 'scale(1)' }],
        { duration: red ? 500 : 760, delay: red ? 0 : k * 90, easing: 'cubic-bezier(.2,.7,.3,1)', fill: 'backwards' }).then(rm(t)));
    }
    if (!red) jobs.push(this.fx_particles({ at: c.sq, kind: 'sparks', colors: ['#ffffff', '#d6f0ff', '#9fd4ff'], count: 14, spread: 1.9, gravity: 0.15, size: [0.03, 0.06] }, info));
    if (e.image) jobs.push(wait(red ? 0 : 60).then(function () { return self.fx_spritepop({ at: c.sq, image: e.image, size: 0.95, lift: 0.1 }, info); }));
    return Promise.all(jobs);
  };

  /* ---- tilefall: Gambonanza, a floor tile drops away into the hole ---- */
  P.fx_tilefall = function (e, info) {
    var c = this._famC(e.at || 'to', info); if (!c) return;
    var sqEl = this.view && this.view.sqEl ? this.view.sqEl(c.sq) : null, cs = sqEl ? getComputedStyle(sqEl) : null;
    var r = this._sqRect(c.sq); if (!r) return;
    var red = this.reduced(), el = this._el(this.layer, 'gfxf-tile', { left: r.x + 'px', top: r.y + 'px', width: r.w + 'px', height: r.h + 'px',
      backgroundColor: cs ? cs.backgroundColor : '#777', backgroundImage: cs && cs.backgroundImage !== 'none' ? cs.backgroundImage : '' });
    var sh = document.createElement('i'); el.appendChild(sh);
    if (!red) anim(sh, [{ opacity: 0 }, { opacity: 0.75 }], { duration: 620, easing: 'ease-in', fill: 'forwards' });
    return anim(el, red ? [{ opacity: 1 }, { opacity: 0 }] : [{ opacity: 1, transform: 'translateY(0) scale(1) rotate(0)' }, { opacity: 1, transform: 'translateY(4%) scale(0.86) rotate(3deg)', offset: 0.35 },
      { opacity: 0, transform: 'translateY(18%) scale(0.42) rotate(11deg)' }], { duration: red ? 300 : 640, easing: 'cubic-bezier(.5,0,.9,.6)' }).then(rm(el));
  };

  /* ---- reap: Ouroboros Reaper, one scythe arc across the square ---- */
  var ARC = '<svg viewBox="-50 -50 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M-40 18 A44 44 0 0 1 34-30 A38 38 0 0 0-28 22 Z" fill="currentColor"/></svg>';
  P.fx_reap = function (e, info) {
    var c = this._famC(e.at || 'to', info); if (!c || this.reduced()) return;
    var d = c.s * 1.35, el = this._el(this.layer, 'gfxf-reap', { left: (c.x - d / 2) + 'px', top: (c.y - d / 2) + 'px', width: d + 'px', height: d + 'px', color: e.color || '#e7d6ff' });
    el.innerHTML = ARC;
    return anim(el, [{ opacity: 0, transform: 'rotate(-70deg) scale(0.8)' }, { opacity: 1, transform: 'rotate(-10deg) scale(1)', offset: 0.35 }, { opacity: 0, transform: 'rotate(35deg) scale(1.05)' }],
      { duration: 340, easing: 'cubic-bezier(.2,.8,.3,1)' }).then(rm(el));
  };

  /* ---------- per-mode family entries (object triggers) ---------- */
  var FM = CM.gameFxFamilyModes = CM.gameFxFamilyModes || {};
  function each(ids, list) { ids.forEach(function (id) { FM[id] = (FM[id] || []).concat(JSON.parse(JSON.stringify(list))); }); }
  /* (b) Pac-Man: pellets are the blue dabbabas (1 point) and generals (5) */
  each(['sO-lD2On610'], [
    { trigger: { on: 'capture', captured: ['Pr', 'Pp'] }, effect: { type: 'pacbite' }, _famx: 'pacbite' },
    { trigger: { on: 'capture', captured: 'Pr', piece: 'Bo' }, effect: { type: 'pixpop', text: '+1', delay_ms: 260 }, _famx: 'pixpop' },
    { trigger: { on: 'capture', captured: 'Pp', piece: 'Bo' }, effect: { type: 'pixpop', text: '+5', color: '#ffe600', delay_ms: 260 }, _famx: 'pixpop' }
  ]);
  /* (c) Spell Chess: jump moves carry move.jump (js/modes/g6_spellc.js); freeze is an upgrade below */
  var SPELL = ['8CtX9G07bMU', 'Ag3KKsIrax4', 'hTTtJIdPVrc', 'q_153NJxO1M'];
  /* chess.com's spell icons (8CtX9G07bMU frames) everywhere except hTTtJIdPVrc, whose video draws its own potions */
  function potion(id, k) { return id === 'hTTtJIdPVrc' ? 'assets/modes/hTTtJIdPVrc/' + k + '_potion.png' : 'assets/modes/8CtX9G07bMU/' + k + '.png'; }
  SPELL.forEach(function (id) { each([id], [{ trigger: { on: 'move', flag: 'jump' }, effect: { type: 'spritepop', image: potion(id, 'jump'), size: 0.8, lift: 0.15 }, _famx: 'spritepop' }]); });
  /* (d) Duck Chess: the duck ('*') is dropped in the second sub-move */
  each(['Bzbzs0K5IBs', 'E2x-QTgBD5k', 'MQAC6oSeQzk', 'TX8zxTIeby4', 'ioUPg_z2KpA'], [{ trigger: { on: 'move', piece: '*' }, effect: { type: 'drop', color: '#f3e9c8' }, _famx: 'drop' }]);
  /* (f) Gambonanza: every captured enemy piece pays $1 at the end of the stage (CRT '+$' popups in the video) */
  each(['qqvbb2r2k5I'], [{ trigger: { on: 'capture', by: 'player' }, effect: { type: 'pixpop', text: '+$1', color: '#ffd75a', delay_ms: 120 }, _famx: 'pixpop' }]);

  /* ---------- upgrades: extras after a mode's own ctx.fx calls (by signature) ---------- */
  var DICE = ['B5LGzOEZSyo', 'CEkC0TINhm8', 'Cr3j7jf5xXk', 'CuwO5ygTGCM', 'HkeZayq10p8', 'Jg-oNqDOXtg', 'KJYUsRlj_34', 'OcWzHqqeLNg', 'Rtee8TRU0vg',
    'dwiAKx06Q9E', 'eKAOw0yaqyA', 'exMFzra96vo', 'haNXJMir3Zk', 'prd7LxnJtL4', 'vm0JynHlzys'];
  function set(a) { var o = {}; a.forEach(function (k) { o[k] = 1; }); return o; }
  function bezier(x1, y1, x2, y2) {   /* y(x) of a CSS cubic-bezier, by bisection */
    function B(t, a, b) { var u = 1 - t; return 3 * u * u * t * a + 3 * u * t * t * b + t * t * t; }
    return function (x) { var lo = 0, hi = 1; for (var i = 0; i < 24; i++) { var m = (lo + hi) / 2; if (B(m, x1, x2) < x) lo = m; else hi = m; } return B((lo + hi) / 2, y1, y2); };
  }
  var UP = CM.gameFxUpgrades = [
    /* Spell Chess freeze: g6_spellc castFreeze flashes the centre square #7cc0ff */
    { ids: set(SPELL), when: function (e) { return e.type === 'flash' && e.color === '#7cc0ff'; },
      run: function (v, e, info) { return v.fx_frost({ at: e.at, image: potion(v.game.spec.id, 'freeze') }, info); } },
    /* Dice Chess: the mode's dice overlay (id 'dice') - the dice tumble in and settle */
    { ids: set(DICE), when: function (e) { return e.type === 'overlay' && e.id === 'dice'; },
      run: function (v, e, info, el) {
        if (!el || v.reduced()) return;
        Array.prototype.forEach.call(el.querySelectorAll('img'), function (im, i) {
          var s = i % 2 ? 1 : -1;
          im.animate([{ opacity: 0, transform: 'translate(' + (-s * 26) + 'px,-46px) rotate(' + (s * 220) + 'deg) scale(0.55)' },
            { opacity: 1, transform: 'translate(0,5px) rotate(' + (-s * 8) + 'deg) scale(1.04)', offset: 0.62 },
            { opacity: 1, transform: 'translate(0,-3px) rotate(' + (s * 3) + 'deg) scale(1)', offset: 0.82 }, { opacity: 1, transform: 'none' }],
            { duration: 460, delay: i * 70, easing: 'cubic-bezier(.25,.75,.35,1)', fill: 'backwards' });
        });
      } },
    /* Spinner Wheel (g4_wheel): the pointer flicks as each slice passes it, the picked label pops when the wheel stops */
    { ids: set(['6YEM7m8owJ4', 'nick8PeAXLA']), when: function (e) { return e.type === 'overlay' && e.id === 'g4wheel'; },
      run: function (v, e, info, el) {
        if (!el || v.reduced()) return;
        var ptr = el.querySelector('[aria-hidden="true"]'), lab = el.querySelector('[id$="l"]'), m = /rotate\((\d+)deg\)\}\}/.exec(el.innerHTML), end = m ? +m[1] : 1440;
        var D = 1900, f = bezier(0.12, 0.7, 0.18, 1), SL = (v.game.spec.params || {}).wheel === 'action' ? 30 : 60,   /* the video wheels: 12 action / 6 piece slices */ kf = [{ offset: 0, transform: 'translateX(-50%) rotate(0)' }], last = 0, prev = 0;
        for (var i = 1; i <= 200; i++) {
          var x = i / 200, ang = f(x) * end, t = x * D;
          if (Math.floor(ang / SL) > Math.floor(prev / SL)) {
            if (t - last >= 70 && x - kf[kf.length - 1].offset > 0.012) {
              var o = Math.min(0.985, x), back = Math.min(0.998, o + Math.min(0.04, 55 / D));
              kf.push({ offset: o, transform: 'translateX(-50%) rotate(-20deg)', easing: 'ease-out' }, { offset: back, transform: 'translateX(-50%) rotate(0)' });
              last = t;
            }
          }
          prev = ang;
        }
        kf = kf.filter(function (k, i) { return i === 0 || k.offset > kf[i - 1].offset; });
        if (kf[kf.length - 1].offset < 1) kf.push({ offset: 1, transform: 'translateX(-50%) rotate(0)' });
        if (ptr) ptr.animate(kf, { duration: D, easing: 'linear' });
        if (lab) lab.animate([{ transform: 'translateX(-50%) scale(0.6)' }, { transform: 'translateX(-50%) scale(1.12)', offset: 0.6 }, { transform: 'translateX(-50%) scale(1)' }],
          { duration: 260, delay: D - 40, easing: 'cubic-bezier(.3,.7,.4,1)', fill: 'backwards' });
      } },
    /* Pawnbarian: the video's splash / zap / bolt sprites placed on a square spring in */
    { ids: set(['Kzt9ItpGtYg', 'zP9TzlgA-W0']), when: function (e) { return e.type === 'overlay' && e.image && e.at != null && e.at !== 'board' && e.at !== 'screen'; },
      run: function (v, e, info, el) {
        if (!el || v.reduced()) return;
        el.animate([{ transform: 'scale(0.45) rotate(-10deg)' }, { transform: 'scale(1.14) rotate(2deg)', offset: 0.55 }, { transform: 'scale(1) rotate(0)' }], { duration: 240, easing: 'cubic-bezier(.3,.7,.4,1)' });
      } },
    /* Ouroboros King: the Reaper's purple reap flash gets a scythe arc */
    { ids: set(['JAz_qMQpI1o', '_RFXN1Ye3sY', 'rf2HSTXTehE']), when: function (e) { return e.type === 'flash' && e.color === '#9b5cff'; },
      run: function (v, e, info) { return v.fx_reap({ at: e.at }, info); } },
    /* Gambonanza: a tile falls (the mode's 14-dust burst on the cracked square) */
    { ids: set(['qqvbb2r2k5I']), when: function (e) { return e.type === 'particles' && e.kind === 'dust' && e.count === 14 && typeof e.at === 'number'; },
      run: function (v, e, info) { return v.fx_tilefall({ at: e.at }, info); } },
    /* Drawback (js/modes/g2_drawback.js, any mode): the site's card deals in; the game-over dialog rises, then the two
       difficulty markers glide from the Easy end to their places (the reveal) */
    { ids: null, when: function (e) { return e.type === 'overlay' && typeof e.html === 'string' && /g2db-(dlg|card)/.test(e.html); },
      run: function (v, e, info, el) {
        if (!el || v.reduced()) return;
        var card = el.querySelector('.g2db-card'), dlg = el.querySelector('.g2db-dlg'), E = 'cubic-bezier(.2,.8,.2,1)';
        if (card) card.animate([{ transform: 'translateY(26px) rotate(-2.5deg) scale(0.96)' }, { transform: 'none' }], { duration: 340, easing: E });
        if (!dlg) return;
        dlg.animate([{ transform: 'translateY(18px) scale(0.97)' }, { transform: 'none' }], { duration: 300, easing: E });
        var was = dlg.querySelector('.was'); if (was) was.animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 260, delay: 240, easing: 'ease-out', fill: 'backwards' });
        var sl = dlg.querySelector('.g2sl'), W = sl ? sl.getBoundingClientRect().width : 0; if (!W) return;
        Array.prototype.forEach.call(dlg.querySelectorAll('.g2sl u, .lrow .lab'), function (n) {
          var pct = parseFloat(n.style.left) || 0, base = getComputedStyle(n).transform; base = base && base !== 'none' ? base : '';
          n.animate([{ transform: base + ' translateX(' + (-W * pct / 100) + 'px)', opacity: 0 }, { opacity: 1, offset: 0.2 }, { transform: base || 'none', opacity: 1 }],
            { duration: 640, delay: 420, easing: 'cubic-bezier(.25,.8,.3,1)', fill: 'backwards' });
        });
      } }
  ];
  var play = P.play;
  P.play = function (effect, info) {
    this._lastEl = null;
    var r = play.call(this, effect, info), id = this.game && this.game.spec && this.game.spec.id;
    if (!effect || !id || (typeof effect === 'object' && (effect.delay_ms || effect._up))) return r;
    var e = typeof effect === 'object' ? effect : CM.vfxParse.effect(effect), el = this._lastEl, self = this;
    for (var i = 0; i < UP.length; i++) {
      var u = UP[i]; if (u.ids && !u.ids[id]) continue;
      try { if (u.when(e)) { var at = e.at != null ? self._resolve(e.at, info || {}) : null; u.run(self, Object.assign({}, e, { at: typeof at === 'number' ? at : e.at, _up: 1 }), info || {}, el); } }
      catch (err) { console.error('[game-fx upgrade]', err); }
    }
    return r;
  };
})();
