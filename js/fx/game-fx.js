/* game-fx: game-like VFX on top of js/fx/vfx.js (owner 2026-11-26 10:30 AM ET: "the other modes get cinematic or
   gamelike vfx if needed"). Shared by fin-sprites-a (mode ids -TKJ..X1aD) and fin-sprites-b (X5kL..): reuse, don't fork.

   New effect types (usable in any vfx_timeline / ctx.fx):
     ring    { at, color, size (squares, default 1.9), width (px), duration_ms }    impact ring expanding from a square
     burst   { at, color, kind (particle kind), ring: false, flash: false, shake }  one-shot impact: square flash + ring + particles
     banner  { text, sub, color, accent, duration_ms, at 'board'|'screen' }         title card band across the board
     popup   { text, at, color, size, duration_ms }                                 floating score text ("+1000") with a pop
   Presets (CM.gameFx.PRESETS) are short lists of timeline entries; CM.gameFxModes (js/fx/game-fx-modes.js) maps a mode
   id to preset names and/or extra entries. They are appended to the mode's own vfx_timeline when its game starts,
   except triggers the mode already handles itself (its own entries win).

   Rules kept: everything is a one-shot pulse (no persistent rings), nothing moves pieces, reduced motion = short fades
   only (no scaling, travel or shake), at most ~24 particles per burst, transform/opacity animations only (smooth on phones). */
(function () {
  'use strict';
  var CM = window.CM; if (!CM || !CM.VFX) return;
  var P = CM.VFX.prototype;

  function anim(el, frames, opt) { var a = el.animate(frames, opt); return new Promise(function (r) { a.onfinish = a.oncancel = function () { r(); }; }); }
  P._gfxAt = function (e, info) {
    var at = e.at || 'to';
    if (at === 'checked_king' || at === 'mover_king') {
      var g = this.game, turn = g && g.state && g.state.turn;
      var c = at === 'checked_king' ? turn : (info && info.side) || turn;
      at = c ? 'king:' + c : 'to';
    }
    var r = this._resolve(at, info);
    return typeof r === 'number' ? r : null;
  };
  P._gfxCenter = function (sq) {
    var lr = this.layer.getBoundingClientRect(), r = sq != null ? this._sqRect(sq) : null;
    if (!r) { var s = lr.width / 8; return { x: lr.width / 2, y: lr.height / 2, s: s }; }
    return { x: r.x + r.w / 2, y: r.y + r.h / 2, s: r.w };
  };

  P.fx_ring = function (e, info) {
    var sq = this._gfxAt(e, info); if (sq == null && e.at !== 'board') return;
    var c = this._gfxCenter(sq), d = c.s * (e.size || 1.9), red = this.reduced();
    var el = this._el(this.layer, 'gfx-ring', { left: (c.x - d / 2) + 'px', top: (c.y - d / 2) + 'px', width: d + 'px', height: d + 'px',
      borderColor: e.color || '#ffd54a', color: e.color || '#ffd54a', borderWidth: (e.width || Math.max(2, Math.round(c.s * 0.07))) + 'px' });
    var dur = e.duration_ms || 560;
    var fr = red ? [{ opacity: 0.7, transform: 'scale(0.8)' }, { opacity: 0, transform: 'scale(0.8)' }]
      : [{ opacity: 0.95, transform: 'scale(0.22)' }, { opacity: 0.8, transform: 'scale(0.75)', offset: 0.45 }, { opacity: 0, transform: 'scale(1)' }];
    return anim(el, fr, { duration: red ? 320 : dur, easing: 'ease-out' }).then(function () { el.remove(); });
  };

  P.fx_burst = function (e, info) {
    var sq = this._gfxAt(e, info); if (sq == null) return;
    var jobs = [], col = e.color || '#ffd54a';
    if (e.flash !== false) jobs.push(this.fx_flash({ at: sq, color: col, opacity: 0.45, duration_ms: 300 }, info));
    if (e.ring !== false) jobs.push(this.fx_ring({ at: sq, color: col, size: e.size, duration_ms: e.duration_ms }, info));
    if (e.kind !== 'none') jobs.push(this.fx_particles({ at: sq, kind: e.kind || 'sparks', count: Math.min(e.count || 14, 24) }, info));
    if (e.shake) jobs.push(this.fx_shake({ intensity: e.shake === true ? 5 : e.shake, duration_ms: 260 }));
    return Promise.all(jobs);
  };

  P.fx_banner = function (e) {
    var parent = e.at === 'screen' ? this.screen : this.layer, red = this.reduced(), dur = e.duration_ms || 1250;
    var el = this._el(parent, 'gfx-banner' + (e.cls ? ' ' + e.cls : ''));
    el.style.setProperty('--gfx-accent', e.accent || e.color || '#ffd54a');
    var band = document.createElement('div'); band.className = 'gfx-banner__band'; el.appendChild(band);
    var t = document.createElement('div'); t.className = 'gfx-banner__text'; t.textContent = e.text || ''; if (e.color) t.style.color = e.color; el.appendChild(t);
    if (e.sub) { var s = document.createElement('div'); s.className = 'gfx-banner__sub'; s.textContent = e.sub; el.appendChild(s); }
    if (red) return anim(el, [{ opacity: 0 }, { opacity: 1, offset: 0.15 }, { opacity: 1, offset: 0.8 }, { opacity: 0 }], { duration: dur }).then(function () { el.remove(); });
    var E = 'cubic-bezier(.2,.8,.2,1)';
    anim(band, [{ transform: 'scaleX(0)', opacity: 1, easing: E }, { transform: 'scaleX(1)', opacity: 1, offset: 0.14 }, { transform: 'scaleX(1)', opacity: 1, offset: 0.84, easing: 'ease-in' },
      { transform: 'scaleX(1.04)', opacity: 0 }], { duration: dur, easing: 'linear' });
    anim(t, [{ transform: 'translateX(-14%) scale(1.25)', opacity: 0, easing: E }, { transform: 'translateX(0) scale(1)', opacity: 1, offset: 0.18 },
      { transform: 'translateX(1.5%) scale(1)', opacity: 1, offset: 0.82, easing: 'ease-in' }, { transform: 'translateX(9%) scale(0.98)', opacity: 0 }], { duration: dur, easing: 'linear' });
    return anim(el, [{ opacity: 1 }, { opacity: 1 }], { duration: dur }).then(function () { el.remove(); });
  };

  P.fx_popup = function (e, info) {
    var sq = this._gfxAt(e, info), c = this._gfxCenter(sq), red = this.reduced(), dur = e.duration_ms || 1100;
    var el = this._el(this.layer, 'gfx-popup', { left: c.x + 'px', top: (c.y - c.s * 0.35) + 'px', color: e.color || '#7CFC6A' });
    el.textContent = e.text || ''; if (e.size) el.style.fontSize = e.size;
    var rise = red ? 0 : -c.s * 0.9;
    return anim(el, [{ opacity: 0, transform: 'translate(-50%,-50%) scale(' + (red ? 1 : 0.4) + ')' }, { opacity: 1, transform: 'translate(-50%,-50%) scale(' + (red ? 1 : 1.18) + ')', offset: 0.14 },
      { opacity: 1, transform: 'translate(-50%,-50%) scale(1)', offset: 0.3 }, { opacity: 0, transform: 'translate(-50%,calc(-50% + ' + rise + 'px)) scale(1)' }], { duration: dur, easing: 'ease-out' }).then(function () { el.remove(); });
  };

  /* ---------- presets ---------- */
  var PRESETS = {
    /* chess.com-game feel: sparks + ring on captures, ring on the checked king, gold burst on promotion */
    capture_sparks: [{ trigger: 'capture', effect: { type: 'burst', kind: 'sparks', color: '#ffd54a', count: 12 } }],
    capture_explode: [{ trigger: 'capture', effect: { type: 'explosion', intensity: 6 } }],
    capture_smoke: [{ trigger: 'capture', effect: { type: 'burst', kind: 'smoke', color: '#cfcfcf', flash: false, count: 8 } }],
    capture_dust: [{ trigger: 'capture', effect: { type: 'burst', kind: 'dust', color: '#e2d6bf', flash: false, count: 10 } }],
    capture_blood: [{ trigger: 'capture', effect: { type: 'burst', kind: 'blood', color: '#c0141c', count: 12 } }],
    check_ring: [{ trigger: 'check', effect: { type: 'ring', at: 'checked_king', color: '#ff3b30', size: 2.1 } }],
    promo_gold: [{ trigger: 'promotion', effect: { type: 'burst', kind: 'gold', color: '#ffd54a', count: 18 } }],
    castle_dust: [{ trigger: 'castle', effect: { type: 'burst', at: 'to', kind: 'dust', color: '#e2d6bf', flash: false, ring: false, count: 8 } }],
    win_banner: [{ trigger: 'win', effects: [{ type: 'banner', text: 'VICTORY', accent: '#ffd54a', color: '#ffe9a3', duration_ms: 950 }, { type: 'particles', kind: 'confetti', at: 'board', delay_ms: 120 }] }],
    loss_banner: [{ trigger: 'loss', effects: [{ type: 'banner', text: 'DEFEAT', accent: '#e5484d', color: '#ffd9d9', duration_ms: 950 }, { type: 'vignette', color: '#2a0000', size: 40, duration_ms: 1200 }] }],
    draw_banner: [{ trigger: 'draw', effect: { type: 'banner', text: 'DRAW', accent: '#b8c0cc', color: '#eef2f6', duration_ms: 950 } }]
  };
  PRESETS.arcade = [].concat(PRESETS.capture_sparks, PRESETS.check_ring, PRESETS.promo_gold, PRESETS.win_banner, PRESETS.loss_banner, PRESETS.draw_banner);
  PRESETS.results = [].concat(PRESETS.win_banner, PRESETS.loss_banner, PRESETS.draw_banner);
  PRESETS.battle = [].concat(PRESETS.capture_explode, PRESETS.check_ring, PRESETS.promo_gold, PRESETS.results);

  function trigName(t) { if (t && typeof t === 'object') return t.on || t.kind || ''; return String(t || '').split(':')[0] === 'event' ? String(t) : String(t || '').split(':')[0]; }
  function extrasFor(id, own) {
    var cfg = (CM.gameFxModes || {})[id]; if (!cfg) return [];
    var taken = {}; (own || []).forEach(function (en) { taken[trigName(en.trigger)] = 1; });
    /* a mode's own win/loss/game_over art beats the generic banners */
    if (taken.game_over) { taken.win = taken.loss = taken.draw = 1; }
    var out = [];
    (Array.isArray(cfg) ? cfg : [cfg]).forEach(function (c) {
      var list = typeof c === 'string' ? (PRESETS[c] || []) : [c];
      list.forEach(function (en) {
        var n = trigName(en.trigger);
        if (typeof c === 'string' && taken[n]) return;   /* presets never double a trigger the mode drives itself */
        out.push(JSON.parse(JSON.stringify(en)));
      });
    });
    return out;
  }
  var setTimeline = P.setTimeline;
  P.setTimeline = function (list) {
    var id = this.game && this.game.spec && this.game.spec.id;
    var extra = id ? extrasFor(id, list) : [];
    return setTimeline.call(this, extra.length ? (list || []).concat(extra) : list);
  };
  CM.gameFx = { PRESETS: PRESETS, extrasFor: extrasFor };
})();
