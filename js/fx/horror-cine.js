/* Horror cinema (fin-icm, owner 10:29 AM ET 2026-11-26: "Make sure the horror modes have good cinematic vfx").

   A thin cinematic layer over every Horror / SCP mode, driven by the game's own events (it wraps CM.VFX.prototype
   .trigger, so no mode file changes are needed). Per mode (REG below, keyed by youtube id):
     - intro sting: letterbox bars + the monster's title card in the site's plain Arial look, one flicker, low hit
     - ambience: a vignette in the mode's tone (skipped when the mode already draws its own), film grain, rare flickers,
       per-mode extras (SCP-173 blinks, Backrooms fluorescent buzz, SCP-966 night-vision lines, breach alarm pulse)
     - check heartbeat: two vignette beats when your king is in check
     - key captures (a queen or rook, or a piece the monster takes off the board between your turns): a short time-
       dilation beat (board scale + desaturate), tone flash on the square, blood / static / dust per mode
     - ending: the final move plays in slow motion, then a loss closes the vignette and (where the mode has no scare of
       its own) the monster jumpscares once; a win floods the board with light; a one-line caption either way
   Rules kept: nothing here moves pieces (no teleports) and nothing persists on squares (ability pulses stay in
   js/fx/ability-fx.js); every element is .fx-tmp or a vfx.persist entry, so vfx.reset() (new game / leaving) clears
   it; prefers-reduced-motion drops shakes, zooms, flickers, grain motion and slow motion (fades only).
   Sounds reuse the shipped set ('cine-hit' is the explosion bus at low volume) until fin-sfx designs dedicated stings:
   CM.sound.register('cine-hit', <file>) swaps it everywhere. */
(function () {
  'use strict';
  var CM = window.CM; if (!CM || !CM.VFX) return;
  var A = function (id, f) { return 'assets/modes/' + id + '/' + f; };

  /* scare art: the site's own 512 px Containment Breach sprites where a mode's sprite is only 256 px (same creature);
     small: sprite has no large source (128-256 px), so it is shown smaller instead of blown up.
     tone: the mode's colour (site colour where the site has the mode); scare: loss jumpscare image (null = none, e.g. the
     site's Locust has no jumpscare); own: the mode already jumpscares itself; kill: particles for a monster kill;
     extra: per-mode ambience */
  var REG = {
    '-fax07t_o5s': { title: 'SCP-096', tag: "Don't look at its face", tone: '#ff2341', scare: A('Ji7frCIfmAQ', 'shyguy.png'), kill: 'glitch', lose: 'IT SAW YOU', win: 'YOU NEVER LOOKED' },
    'epzU65ZEdcs': { title: 'SCP-096', tag: 'Somewhere in the fog', tone: '#9aa2a8', own: 1, kill: 'glitch', lose: 'IT FOUND YOU', win: 'OUT OF THE FOG' },
    '06OeGk5Iu-s': { title: 'SCP-682', tag: 'The Hard-to-Destroy Reptile', tone: '#6f9a32', scare: A('Ji7frCIfmAQ', 'lizard.png'), kill: 'blood', heavy: 1, lose: 'IT ADAPTED', win: 'TERMINATED. FOR NOW.' },
    '4XV3SBMQgXE': { title: 'SCP-035', tag: 'Possessive Mask', tone: '#c9b27a', scare: A('Ji7frCIfmAQ', 'mask.png'), kill: 'smoke', lose: 'POSSESSED', win: 'THE MASK FALLS' },
    'BYg7rV53WrM': { title: 'All-Consuming Darkness', tag: 'The void stares back', tone: '#000000', scare: A('BYg7rV53WrM', 'darkness.png'), kill: 'smoke', lose: 'CONSUMED', win: 'YOU STARED BACK' },
    'JUlTxosCXuk': { title: 'SCP-2774', tag: 'Something is wearing your pieces', tone: '#c23b22', scare: A('JUlTxosCXuk', 'scp2774.png'), kill: 'blood', lose: 'TAKEN', win: 'SURVIVED' },
    'Ji7frCIfmAQ': { title: 'CONTAINMENT BREACH', tag: '10 SCPs are loose', tone: '#ff3b30', kill: 'blood', extra: 'alarm', lose: 'CONTAINMENT FAILED', win: 'CONTAINMENT RESTORED' },
    'PDCuJf3SdRY': { title: 'The Locust', tag: 'It eats the board', tone: '#7a6a3a', kill: 'dust', lose: 'DEVOURED', win: 'THE SWARM PASSES' },
    'PGBHL6Nc4X0': { title: 'SCP-2845', tag: 'The Deer', tone: '#175b61', scare: A('PGBHL6Nc4X0', 'deer.png'), kill: 'glitch', lose: 'THE DEER WATCHES', win: 'ESCAPED' },
    'U67wZoy-1fE': { title: 'Despair', tag: 'Every move weighs more', tone: '#2b3a55', scare: A('U67wZoy-1fE', 'despair.png'), kill: 'smoke', lose: 'DESPAIR', win: 'HOPE' },
    '_Kx4ChHuCgI': { title: 'SCP-106', tag: 'The Old Man', tone: '#3d2a17', scare: A('_Kx4ChHuCgI', 'oldman.png'), kill: 'smoke', lose: 'POCKET DIMENSION', win: 'YOU GOT OUT' },
    'amA3ARfEoU8': { title: 'SCP-173', tag: "Don't blink", tone: '#8a6d4b', own: 1, kill: 'dust', extra: 'blink', lose: 'YOU BLINKED', win: 'EYES OPEN' },
    'byhq5v6BUWg': { title: 'SCP-049', tag: 'The Plague Doctor', tone: '#5e7d3a', scare: A('Ji7frCIfmAQ', 'scp049.png'), kill: 'smoke', lose: 'CURED', win: 'NO CURE NEEDED' },
    'd9oDfmcMJvA': { title: 'Archangel Gabriel', tag: 'Be not afraid', tone: '#e040fb', scare: A('d9oDfmcMJvA', 'gabriel.png'), kill: 'glitch', lose: 'JUDGED', win: 'FORGIVEN' },
    'gHAmif0TenY': { title: 'Waldo', tag: 'Waldo finds you', tone: '#d32f2f', own: 1, kill: 'blood', lose: 'FOUND YOU', win: 'HIDDEN' },
    'icm-scp4975': { title: 'SCP-4975', tag: 'It is trying to crack you', tone: '#e6e6e6', scare: A('icm-scp4975', 'scp4975.png'), kill: 'dust', lose: 'SHATTERED', win: 'UNBROKEN' },
    'lpqVYTH9U-A': { title: 'SCP-426', tag: 'I am a toaster', tone: '#ff8f3a', scare: A('Ji7frCIfmAQ', 'toaster.png'), kill: 'sparks', lose: 'YOU ARE A TOASTER', win: 'STILL HUMAN' },
    'mwv48BWl2DY': { title: 'SCP-966', tag: 'You cannot see them at night', tone: '#7dff9a', scare: A('mwv48BWl2DY', 'scp966.png'), kill: 'dust', extra: 'nightvision', lose: 'SLEEPLESS', win: 'DAWN' },
    'mymJwfSPeFA': { title: 'He Knows You Are Alone', tag: 'Lights out', tone: '#000000', scare: A('mymJwfSPeFA', 'shadow.png'), kill: 'smoke', flick: 2, lose: 'NOT ALONE', win: 'LIGHTS ON' },
    'ndbf05-bvgQ': { title: 'SCP-409', tag: 'Contagious Crystal', tone: '#76d1ea', scare: A('Ji7frCIfmAQ', 'scp409.png'), kill: 'ice', lose: 'CRYSTALLIZED', win: 'THAWED' },
    's2WDIfvefEk': { title: 'SCP-939', tag: 'With many voices', tone: '#c2185b', scare: A('Ji7frCIfmAQ', 'scp939.png'), kill: 'blood', lose: 'IT HEARD YOU', win: 'SILENCE' },
    'vPEVQgvjoL4': { title: 'Mal0', tag: 'SCP-1471', tone: '#dddddd', scare: A('vPEVQgvjoL4', 'mal0.png'), kill: 'glitch', grain: 0.16, lose: 'MAL0 FOUND YOU', win: 'UNINSTALLED' },
    'xp6Pr-rB4JA': { title: 'The Backrooms', tag: 'Level 0', tone: '#d8c46a', scare: A('xp6Pr-rB4JA', 'horror_face.png'), small: 1, kill: 'dust', extra: 'fluoro', lose: 'NO-CLIPPED', win: 'EXIT FOUND' },
    'xvibqyL-CqQ': { title: 'The Boiled One', tag: "Don't look at it", tone: '#ff0000', scare: A('xvibqyL-CqQ', 'boiled.png'), small: 1, kill: 'glitch', grain: 0.12, lose: 'PARALYZED', win: 'YOU LOOKED AWAY' }
  };
  var VAL = { P: 1, N: 3, B: 3, R: 5, Q: 9, K: 0 };

  function rgba(hex, a) {
    var h = String(hex || '#000').replace('#', ''); if (h.length === 3) h = h.replace(/./g, '$&$&');
    var n = parseInt(h.slice(0, 6), 16); return 'rgba(' + (n >> 16 & 255) + ',' + (n >> 8 & 255) + ',' + (n & 255) + ',' + a + ')';
  }
  /* the tone pushed most of the way to black: a vignette that reads as shadow with a hint of the monster's colour */
  function dark(hex, a) {
    var h = String(hex || '#000').replace('#', ''), n = parseInt(h.slice(0, 6), 16), k = 0.28;
    return 'rgba(' + Math.round((n >> 16 & 255) * k) + ',' + Math.round((n >> 8 & 255) * k) + ',' + Math.round((n & 255) * k) + ',' + a + ')';
  }
  function anim(el, frames, opt) { if (!el || !el.animate) return Promise.resolve(); var a = el.animate(frames, opt); return new Promise(function (r) { a.onfinish = a.oncancel = function () { r(); }; }); }
  function sound(name, vol) { try { CM.sound.play(name, { volume: vol == null ? 1 : vol }); } catch (_) { } }
  try { CM.sound.register('cine-hit', 'assets/sounds/explosion.wav'); } catch (_) { }

  var Cine = CM.horrorCine = { REG: REG, active: null };

  function material(G, c) {
    var b = G.state && G.state.b, s = 0; if (!b) return 0;
    for (var i = 0; i < b.length; i++) { var p = b[i]; if (p && p.c === c) s += VAL[String(p.t).charAt(0)] || 0; }
    return s;
  }

  function Run(vfx, G, R) {
    this.vfx = vfx; this.G = G; this.R = R; this.gid = G.gid; this.ended = false;
    this.red = vfx.reduced(); this.matAfterMove = null;
  }
  var P = Run.prototype;
  P.alive = function () { return Cine.active === this && this.vfx.game === this.G && this.G.gid === this.gid; };
  P.el = function (parent, cls, css) { return this.vfx._el(parent, 'cine ' + cls, css); };
  P.later = function (ms, fn) { var self = this; return this.vfx._after(ms, function () { if (self.alive()) fn(); }); };

  /* ---------- intro ---------- */
  P.intro = function () {
    var self = this, R = this.R, v = this.vfx, loader = document.getElementById('mode-loader');
    var go = function () {
      if (!self.alive() || self.G.history && self.G.history.length > 1) return;
      var bars = self.el(v.screen, 'cine-bars');
      bars.innerHTML = '<i></i><i></i>';
      var card = self.el(v.layer, 'cine-title');
      card.innerHTML = '<b></b><span></span>';
      card.firstChild.textContent = R.title; card.lastChild.textContent = R.tag || '';
      card.style.setProperty('--tone', R.tone);
      sound('cine-hit', 0.28);
      var dur = 2300;
      if (self.red) {
        anim(bars, [{ opacity: 0 }, { opacity: 1, offset: 0.2 }, { opacity: 1, offset: 0.8 }, { opacity: 0 }], { duration: dur });
        anim(card, [{ opacity: 0 }, { opacity: 1, offset: 0.2 }, { opacity: 1, offset: 0.75 }, { opacity: 0 }], { duration: dur }).then(function () { bars.remove(); card.remove(); });
        return;
      }
      U_each(bars.children, function (b, k) {
        anim(b, [{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)', offset: 0.18 }, { transform: 'scaleY(1)', offset: 0.8 }, { transform: 'scaleY(0)' }], { duration: dur, easing: 'cubic-bezier(.2,.7,.2,1)' });
      });
      anim(card, [{ opacity: 0, transform: 'translate(-50%,-50%) scale(1.12)', letterSpacing: '0.5em' },
        { opacity: 1, transform: 'translate(-50%,-50%) scale(1)', letterSpacing: '0.18em', offset: 0.22 },
        { opacity: 1, offset: 0.36 }, { opacity: 0.25, offset: 0.4 }, { opacity: 1, offset: 0.44 },
        { opacity: 1, transform: 'translate(-50%,-50%) scale(0.98)', offset: 0.78 },
        { opacity: 0, transform: 'translate(-50%,-50%) scale(0.96)' }], { duration: dur, easing: 'ease-out' })
        .then(function () { bars.remove(); card.remove(); });
      self.later(dur * 0.38, function () { self.flicker(1); });
    };
    /* wait for the loading screen to leave (js/ui/loader.js), at most 3 s */
    var t0 = performance.now();
    (function wait() {
      if (!self.alive()) return;
      var busy = loader && !loader.hidden && getComputedStyle(loader).opacity !== '0';
      if (busy && performance.now() - t0 < 3000) { self.later(120, wait); return; }
      self.later(250, go);
    })();
  };
  function U_each(list, fn) { Array.prototype.forEach.call(list, fn); }

  /* ---------- ambience ---------- */
  P.ambience = function () {
    var self = this, R = this.R, v = this.vfx;
    /* a mode with its own persistent vignette (darkness masks, 966, Mal0, Backrooms...) keeps its own look */
    var own = Object.keys(v.persist).some(function (k) { return k.indexOf('vignette') === 0 && k !== 'vignette#cine'; });
    if (!own) v.fx_vignette({ id: 'cine', target: 'board', color: dark(R.tone, 0.72), size: 55, opacity: 1, fade_ms: 1200 });
    var grain = this.el(v.layer, 'cine-grain' + (this.red ? ' is-still' : '')); grain.innerHTML = '<i></i>';
    grain.style.opacity = R.grain != null ? R.grain : 0.07;
    v.persist['cine-grain'] = { remove: function () { grain.remove(); } };
    if (R.extra === 'nightvision') {
      var nv = this.el(v.layer, 'cine-nv'); v.persist['cine-nv'] = { remove: function () { nv.remove(); } };
    }
    if (this.red) return;
    var base = R.flick === 2 ? 5000 : 9000;
    (function next() { self.later(base + Math.random() * base, function () { if (!self.ended && !self.G.busy) self.flicker(R.flick === 2 ? 3 : 2); next(); }); })();
    if (R.extra === 'blink') (function blink() { self.later(7000 + Math.random() * 6000, function () { if (!self.ended) self.blink(); blink(); }); })();
  };
  P.flicker = function (n) {
    if (this.red) return;
    var R = this.R, v = this.vfx, el = this.el(v.layer, 'cine-flick'), frames = [{ opacity: 0 }], k;
    el.style.background = R.extra === 'fluoro' ? 'rgba(255,248,200,.5)' : 'rgba(0,0,0,.62)';
    for (k = 0; k < n; k++) { frames.push({ opacity: 1, offset: (k * 2 + 1) / (n * 2 + 1) }); frames.push({ opacity: k === n - 1 ? 0.15 : 0, offset: (k * 2 + 2) / (n * 2 + 1) }); }
    frames.push({ opacity: 0 });
    anim(el, frames, { duration: 110 * (n * 2 + 1), easing: 'steps(1, end)' }).then(function () { el.remove(); });
  };
  /* SCP-173: the screen blinks shut for a moment, like the video's blink meter running out */
  P.blink = function () {
    var v = this.vfx, el = this.el(v.screen, 'cine-blink');
    el.innerHTML = '<i></i><i></i>';
    U_each(el.children, function (b) { anim(b, [{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)', offset: 0.4 }, { transform: 'scaleY(1)', offset: 0.6 }, { transform: 'scaleY(0)' }], { duration: 320, easing: 'ease-in-out' }); });
    this.later(340, function () { el.remove(); });
  };

  /* ---------- beats ---------- */
  P.heartbeat = function () {
    var R = this.R, v = this.vfx, el = this.el(v.screen, 'cine-pulse', { background: 'radial-gradient(ellipse at center, transparent 45%, ' + rgba(R.tone === '#000000' ? '#8a0000' : R.tone, 0.55) + ' 100%)' });
    var f = this.red ? [{ opacity: 0 }, { opacity: 0.6 }, { opacity: 0 }] : [{ opacity: 0 }, { opacity: 1, offset: 0.12 }, { opacity: 0.2, offset: 0.3 }, { opacity: 0.9, offset: 0.42 }, { opacity: 0 }];
    anim(el, f, { duration: 1100, easing: 'ease-out' }).then(function () { el.remove(); });
  };
  P.dilate = function (sq, strong) {
    var self = this, R = this.R, v = this.vfx, w = v.wrap;
    sound('cine-hit', strong ? 0.45 : 0.3);
    if (sq != null && sq >= 0) v.fx_flash({ at: sq, color: R.tone === '#000000' ? '#600' : R.tone, opacity: 0.7, duration_ms: 700 });
    var k = R.kill;
    if (sq != null && sq >= 0 && k) {
      if (k === 'glitch') v.fx_glitch({ duration_ms: 380, intensity: 5 });
      else if (k === 'ice') v.fx_particles({ at: sq, kind: 'sparks', colors: ['#e9fbff', '#9fe6ff', '#76d1ea'], count: 16 });
      else v.fx_particles({ at: sq, kind: k });
    }
    if (this.red) return;
    if (strong || R.heavy) v.fx_shake({ intensity: R.heavy ? 10 : 6, duration_ms: 380 });
    /* the time-dilation beat: `scale` + `filter` so it never fights the transform-based shake */
    anim(w, [{ scale: '1', filter: 'none' }, { scale: '1.035', filter: 'saturate(.35) contrast(1.15)', offset: 0.3 }, { scale: '1.035', filter: 'saturate(.35) contrast(1.15)', offset: 0.65 }, { scale: '1', filter: 'none' }],
      { duration: strong ? 1100 : 850, easing: 'cubic-bezier(.3,.6,.3,1)' });
  };

  /* ---------- ending ---------- */
  P.ending = function (res) {
    if (this.ended) return; this.ended = true;
    var self = this, R = this.R, v = this.vfx, board = v.board;
    /* slow motion on the last move: whatever is still sliding finishes at a third of the speed */
    if (!this.red) {
      var an = []; try { an = board.getAnimations({ subtree: true }); } catch (_) { }
      an.forEach(function (a) { try { a.playbackRate = 0.33; } catch (_) { } });
    }
    var cap = this.el(v.layer, 'cine-caption');
    cap.textContent = res === 'win' ? R.win : res === 'loss' ? R.lose : 'STALEMATE';
    cap.style.setProperty('--tone', res === 'win' ? '#fff' : R.tone === '#000000' ? '#c00' : R.tone);
    if (res === 'win') {
      v.fx_flash({ at: 'board', color: '#fff8e8', opacity: 0.55, duration_ms: 1300 });
      if (v.persist['vignette#cine']) { v.persist['vignette#cine'].remove(); delete v.persist['vignette#cine']; }
    } else if (res === 'loss') {
      v.fx_vignette({ id: 'cine', target: 'board', color: 'rgba(0,0,0,.92)', size: 22, opacity: 1, fade_ms: 1400 });
      v.board.classList.add('cine-dead');
      v.persist['cine-dead'] = { remove: function () { v.board.classList.remove('cine-dead'); } };
      if (R.scare && !R.own) this.later(this.red ? 200 : 650, function () { v.fx_jumpscare({ image: R.scare, duration_ms: 950, background: 'radial-gradient(circle, ' + dark(R.tone === '#000000' ? '#600000' : R.tone, 0.9) + ' 0%, rgba(0,0,0,.94) 70%)', intensity: 16, cls: 'cine-scare' + (R.small ? ' is-small' : '') }); if (R.kill === 'glitch' && !self.red) v.fx_glitch({ duration_ms: 500 }); });
      else if (!this.red) v.fx_shake({ intensity: 8, duration_ms: 420 });
    }
    anim(cap, [{ opacity: 0, letterSpacing: '0.45em' }, { opacity: 1, letterSpacing: '0.2em', offset: 0.25 }, { opacity: 1, offset: 0.8 }, { opacity: 0 }], { duration: 2600, delay: res === 'loss' && R.scare && !R.own ? 1500 : 300, easing: 'ease-out', fill: 'backwards' })
      .then(function () { cap.remove(); });
  };

  /* ---------- event routing ---------- */
  P.on = function (name, info) {
    var G = this.G;
    if (name === 'game_start') { this.intro(); var self = this; this.later(600, function () { self.ambience(); }); return; }
    if (this.ended) return;
    if (name === 'move') { this.matAfterMove = material(G, G.human); return; }
    if (name === 'capture') {
      var t = String(info.captured || '').charAt(0), big = t === 'Q' || t === 'R';
      var sq = info.to != null ? info.to : (info.toName && G.V ? G.V.geo.parse(info.toName) : -1);
      if (big) { var self2 = this; this.later((CM.settings.animMs() || 0) + 40, function () { self2.dilate(sq, t === 'Q'); }); }
      return;
    }
    if (name === 'check') { if (G.state && G.state.turn === G.human) this.heartbeat(); return; }
    if (name === 'player_turn') {
      /* the monster took material between the bot's move and your turn (kills, conversions, shatters) */
      var now = material(G, G.human);
      if (this.matAfterMove != null && now < this.matAfterMove) this.dilate(null, this.matAfterMove - now >= 5);
      this.matAfterMove = now;
      if (this.R.extra === 'alarm' && G.history && G.history.length && G.history.length % 8 === 0) this.alarm();
      return;
    }
    if (name === 'win' || name === 'loss' || name === 'draw') this.ending(name);
  };
  /* Containment Breach: the site-wide alarm light sweeps the board every few rounds */
  P.alarm = function () {
    var v = this.vfx, el = this.el(v.layer, 'cine-alarm');
    anim(el, this.red ? [{ opacity: 0 }, { opacity: 0.5 }, { opacity: 0 }] : [{ opacity: 0 }, { opacity: 0.85, offset: 0.25 }, { opacity: 0.1, offset: 0.5 }, { opacity: 0.85, offset: 0.75 }, { opacity: 0 }], { duration: 1400, easing: 'ease-in-out' }).then(function () { el.remove(); });
  };

  var trig = CM.VFX.prototype.trigger;
  CM.VFX.prototype.trigger = function (name, info) {
    trig.call(this, name, info);
    try {
      var G = this.game, id = G && G.spec && G.spec.id, R = id && REG[id];
      if (!R || CM.settings.get('horrorCine') === false) return;
      if (name === 'game_start' || !Cine.active || Cine.active.G !== G || Cine.active.gid !== G.gid) Cine.active = new Run(this, G, R);
      Cine.active.on(name, info || {});
    } catch (e) { console.warn('[cine]', e); }
  };
  var reset = CM.VFX.prototype.reset;
  CM.VFX.prototype.reset = function () { Cine.active = null; this.board && this.board.classList.remove('cine-dead'); return reset.apply(this, arguments); };
})();
