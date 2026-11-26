/* Horror cinema (fin-icm, owner 10:29 AM ET 2026-11-26: "Make sure the horror modes have good cinematic vfx").

   A thin cinematic layer over every Horror / SCP mode, driven by the game's own events (it wraps CM.VFX.prototype
   .trigger, so no mode file changes are needed). Per mode (REG below, keyed by youtube id):
     - intro sting: letterbox bars + the monster's title card in one of three horror type treatments (css/cine.css):
         dossier  SCP Foundation file: Special Elite typewriter, characters type in, a redaction bar wipes off the tag
         trailer  film-trailer card: Cinzel caps, tracking closes in, a light sheen crosses, hairline rules open out
         vhs      found footage: VT323 with RGB split, PLAY / REC hud and timecode, tracking jitter
       on the site's own dark panel (#202020) and the mode's site colour; fonts in assets/fonts (OFL / Apache-2.0)
     - ambience: a vignette in the mode's tone (skipped when the mode already draws its own), film grain, rare flickers,
       per-mode extras (SCP-173 blinks, Backrooms fluorescent buzz, SCP-966 night-vision lines, breach alarm pulse)
     - check heartbeat: two vignette beats when your king is in check
     - key captures (a queen or rook, or a piece the monster takes off the board between your turns): a short time-
       dilation beat (board scale + desaturate), tone flash on the square, blood / static / dust per mode
     - ending: the final move plays in slow motion, then a loss closes the vignette and (where the mode has no scare of
       its own) the monster jumpscares once; a win floods the board with light; a one-line caption either way
   Rules kept: nothing here moves pieces (no teleports) and nothing persists on squares (ability pulses stay in
   js/fx/ability-fx.js); every element is .fx-tmp or a vfx.persist entry, so vfx.reset() (new game / leaving) clears
   it; prefers-reduced-motion drops shakes, zooms, flickers, grain motion, particles, glitches, typing / tracking / sheen
   title motion and slow motion: cards, captions, blinks and beats only fade (checked by icm_qa/rmcheck.py).
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
    '-fax07t_o5s': { look: 'dossier', title: 'SCP-096', tag: "Don't look at its face", tone: '#ff2341', scare: A('Ji7frCIfmAQ', 'shyguy.png'), kill: 'glitch', lose: 'IT SAW YOU', win: 'YOU NEVER LOOKED' },
    'epzU65ZEdcs': { look: 'dossier', title: 'SCP-096', tag: 'Somewhere in the fog', tone: '#9aa2a8', own: 1, kill: 'glitch', lose: 'IT FOUND YOU', win: 'OUT OF THE FOG' },
    '06OeGk5Iu-s': { look: 'dossier', title: 'SCP-682', tag: 'The Hard-to-Destroy Reptile', tone: '#6f9a32', scare: A('Ji7frCIfmAQ', 'lizard.png'), kill: 'blood', heavy: 1, lose: 'IT ADAPTED', win: 'TERMINATED. FOR NOW.' },
    '4XV3SBMQgXE': { look: 'dossier', title: 'SCP-035', tag: 'Possessive Mask', tone: '#c9b27a', scare: A('Ji7frCIfmAQ', 'mask.png'), kill: 'smoke', lose: 'POSSESSED', win: 'THE MASK FALLS' },
    'BYg7rV53WrM': { look: 'trailer', title: 'All-Consuming Darkness', tag: 'The void stares back', tone: '#000000', scare: A('BYg7rV53WrM', 'darkness.png'), kill: 'smoke', lose: 'CONSUMED', win: 'YOU STARED BACK' },
    'JUlTxosCXuk': { look: 'dossier', title: 'SCP-2774', tag: 'Something is wearing your pieces', tone: '#c23b22', scare: A('JUlTxosCXuk', 'scp2774.png'), kill: 'blood', lose: 'TAKEN', win: 'SURVIVED' },
    'Ji7frCIfmAQ': { look: 'dossier', title: 'CONTAINMENT BREACH', tag: '10 SCPs are loose', tone: '#ff3b30', kill: 'blood', extra: 'alarm', lose: 'CONTAINMENT FAILED', win: 'CONTAINMENT RESTORED' },
    'PDCuJf3SdRY': { look: 'trailer', title: 'The Locust', tag: 'It eats the board', tone: '#7a6a3a', kill: 'dust', lose: 'DEVOURED', win: 'THE SWARM PASSES' },
    'PGBHL6Nc4X0': { look: 'dossier', title: 'SCP-2845', tag: 'The Deer', tone: '#175b61', scare: A('PGBHL6Nc4X0', 'deer.png'), kill: 'glitch', lose: 'THE DEER WATCHES', win: 'ESCAPED' },
    'U67wZoy-1fE': { look: 'trailer', title: 'Despair', tag: 'Every move weighs more', tone: '#2b3a55', scare: A('U67wZoy-1fE', 'despair.png'), kill: 'smoke', lose: 'DESPAIR', win: 'HOPE' },
    '_Kx4ChHuCgI': { look: 'dossier', title: 'SCP-106', tag: 'The Old Man', tone: '#3d2a17', scare: A('_Kx4ChHuCgI', 'oldman.png'), kill: 'smoke', lose: 'POCKET DIMENSION', win: 'YOU GOT OUT' },
    'amA3ARfEoU8': { look: 'dossier', title: 'SCP-173', tag: "Don't blink", tone: '#8a6d4b', own: 1, kill: 'dust', extra: 'blink', lose: 'YOU BLINKED', win: 'EYES OPEN' },
    'byhq5v6BUWg': { look: 'dossier', title: 'SCP-049', tag: 'The Plague Doctor', tone: '#5e7d3a', scare: A('Ji7frCIfmAQ', 'scp049.png'), kill: 'smoke', lose: 'CURED', win: 'NO CURE NEEDED' },
    'd9oDfmcMJvA': { look: 'trailer', title: 'Archangel Gabriel', tag: 'Be not afraid', tone: '#e040fb', scare: A('d9oDfmcMJvA', 'gabriel.png'), kill: 'glitch', lose: 'JUDGED', win: 'FORGIVEN' },
    'gHAmif0TenY': { look: 'trailer', title: 'Waldo', tag: 'Waldo finds you', tone: '#d32f2f', own: 1, kill: 'blood', lose: 'FOUND YOU', win: 'HIDDEN' },
    'icm-scp4975': { look: 'dossier', title: 'SCP-4975', tag: 'It is trying to crack you', tone: '#e6e6e6', scare: A('icm-scp4975', 'scp4975.png'), kill: 'dust', lose: 'SHATTERED', win: 'UNBROKEN' },
    'lpqVYTH9U-A': { look: 'dossier', title: 'SCP-426', tag: 'I am a toaster', tone: '#ff8f3a', scare: A('Ji7frCIfmAQ', 'toaster.png'), kill: 'sparks', lose: 'YOU ARE A TOASTER', win: 'STILL HUMAN' },
    'mwv48BWl2DY': { look: 'vhs', hud: 'NV  REC', title: 'SCP-966', tag: 'You cannot see them at night', tone: '#7dff9a', scare: A('mwv48BWl2DY', 'scp966.png'), kill: 'dust', extra: 'nightvision', lose: 'SLEEPLESS', win: 'DAWN' },
    'mymJwfSPeFA': { look: 'trailer', title: 'He Knows You Are Alone', tag: 'Lights out', tone: '#000000', scare: A('mymJwfSPeFA', 'shadow.png'), kill: 'smoke', flick: 2, lose: 'NOT ALONE', win: 'LIGHTS ON' },
    'ndbf05-bvgQ': { look: 'dossier', title: 'SCP-409', tag: 'Contagious Crystal', tone: '#76d1ea', scare: A('Ji7frCIfmAQ', 'scp409.png'), kill: 'ice', lose: 'CRYSTALLIZED', win: 'THAWED' },
    's2WDIfvefEk': { look: 'dossier', title: 'SCP-939', tag: 'With many voices', tone: '#c2185b', scare: A('Ji7frCIfmAQ', 'scp939.png'), kill: 'blood', lose: 'IT HEARD YOU', win: 'SILENCE' },
    'vPEVQgvjoL4': { look: 'vhs', hud: 'SCP-1471.APK', title: 'Mal0', tag: 'SCP-1471', tone: '#dddddd', scare: A('vPEVQgvjoL4', 'mal0.png'), kill: 'glitch', grain: 0.16, lose: 'MAL0 FOUND YOU', win: 'UNINSTALLED' },
    'xp6Pr-rB4JA': { look: 'vhs', hud: 'PLAY', title: 'The Backrooms', tag: 'Level 0', tone: '#d8c46a', scare: A('xp6Pr-rB4JA', 'horror_face.png'), small: 1, kill: 'dust', extra: 'fluoro', lose: 'NO-CLIPPED', win: 'EXIT FOUND' },
    'xvibqyL-CqQ': { look: 'vhs', hud: 'PLAY', title: 'The Boiled One', tag: "Don't look at it", tone: '#ff0000', scare: A('xvibqyL-CqQ', 'boiled.png'), small: 1, kill: 'glitch', grain: 0.12, lose: 'PARALYZED', win: 'YOU LOOKED AWAY' }
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
  var FONT = { dossier: 'CineDossier', trailer: 'CineTrailer', vhs: 'CineVHS' }, fontP = {};
  /* resolves when the look's face is ready (or after 1.2 s, then the card falls back to the stack in css) */
  function fontReady(look) {
    var f = FONT[look]; if (!f || !document.fonts || !document.fonts.load) return Promise.resolve();
    if (!fontP[f]) fontP[f] = Promise.race([document.fonts.load('40px ' + f).catch(function () { }), new Promise(function (r) { setTimeout(r, 1200); })]);
    return fontP[f];
  }
  Cine.fontReady = fontReady;

  function material(G, c) {
    var b = G.state && G.state.b, s = 0; if (!b) return 0;
    for (var i = 0; i < b.length; i++) { var p = b[i]; if (p && p.c === c) s += VAL[String(p.t).charAt(0)] || 0; }
    return s;
  }

  function Run(vfx, G, R) {
    this.vfx = vfx; this.G = G; this.R = R; this.gid = G.gid; this.ended = false;
    this.red = vfx.reduced(); this.matAfterMove = null; this.look = R.look || 'dossier';
    var self = this; this.font = false; fontReady(this.look).then(function () { self.font = true; });
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
      var card = self.title();
      sound('cine-hit', 0.28);
      var dur = self.look === 'trailer' ? 2900 : 2600;
      var clean = function () { bars.remove(); card.remove(); };
      if (self.red) {
        anim(bars, [{ opacity: 0 }, { opacity: 1, offset: 0.2 }, { opacity: 1, offset: 0.8 }, { opacity: 0 }], { duration: dur });
        anim(card, [{ opacity: 0 }, { opacity: 1, offset: 0.2 }, { opacity: 1, offset: 0.78 }, { opacity: 0 }], { duration: dur }).then(clean);
        return;
      }
      U_each(bars.children, function (b) {
        anim(b, [{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)', offset: 0.16 }, { transform: 'scaleY(1)', offset: 0.82 }, { transform: 'scaleY(0)' }], { duration: dur, easing: 'cubic-bezier(.2,.7,.2,1)' });
      });
      self['intro_' + self.look](card, dur).then(clean);
      self.later(dur * 0.42, function () { self.flicker(1); });
    };
    /* wait for the loading screen to leave (js/ui/loader.js) and the title face, at most 3 s */
    var t0 = performance.now();
    (function wait() {
      if (!self.alive()) return;
      var busy = loader && !loader.hidden && getComputedStyle(loader).opacity !== '0';
      if ((busy || !self.font) && performance.now() - t0 < 3000) { self.later(120, wait); return; }
      self.later(250, go);
    })();
  };
  /* the card: <em> hud line, <b> title (one span per character so it can type in), <span> tag, <s> redaction bar */
  P.title = function () {
    var R = this.R, card = this.place(this.el(this.vfx.screen, 'cine-title is-' + this.look)), b = document.createElement('b'), i;
    card.style.setProperty('--tone', R.tone === '#000000' ? '#b00' : R.tone);
    var hud = document.createElement('em');
    if (this.look === 'vhs') {
      var lab = document.createElement('u'); lab.textContent = R.hud || 'PLAY';
      var tc = document.createElement('i'); tc.textContent = '00:00:00:00'; hud.appendChild(lab); hud.appendChild(tc); card._tc = tc;
    } else hud.textContent = this.look === 'dossier' ? 'SCP FOUNDATION · SECURE · CONTAIN · PROTECT' : '';
    for (i = 0; i < R.title.length; i++) { var c = document.createElement('i'); c.textContent = R.title.charAt(i); b.appendChild(c); }
    b.setAttribute('data-t', R.title);
    /* long names shrink to fit one line (trailer titles may wrap instead) */
    var W = parseFloat(card.style.width) || window.innerWidth, k = { dossier: 0.72, vhs: 0.56, trailer: 0.92 }[this.look] || 0.7, mx = { dossier: 46, vhs: 52, trailer: 36 }[this.look] || 40;
    b.style.fontSize = Math.round(Math.max(16, Math.min(mx, W * 0.1, 0.86 * W / (R.title.length * k)))) + 'px';
    var tag = document.createElement('span'); tag.textContent = R.tag || '';
    var bar = document.createElement('s');
    card.appendChild(hud); card.appendChild(b); card.appendChild(tag); if (this.look === 'dossier') tag.appendChild(bar);
    return card;
  };
  /* cards sit on the screen layer over the part of the board you can see (a zoomed 30x30 board's layer is far bigger
     than the screen, and the board layer's zoom would scale the type) */
  P.place = function (el) {
    var r = this.vfx.wrap.getBoundingClientRect(), t = Math.max(0, r.top), btm = Math.min(window.innerHeight, r.bottom), l = Math.max(0, r.left), rt = Math.min(window.innerWidth, r.right);
    if (btm - t < 80 || rt - l < 120) { t = 0; btm = window.innerHeight; l = 0; rt = window.innerWidth; }
    el.style.left = (l + rt) / 2 + 'px'; el.style.top = (t + btm) / 2 + 'px'; el.style.width = (rt - l) + 'px';
    return el;
  };
  /* how long the game-over modal waits so the ending beat (slow last move, scare, caption) is seen, not covered */
  P.hold = function (res) {
    if (this.red) return 1500;
    return res === 'loss' && this.R.scare && !this.R.own ? 2900 : 1900;
  };
  /* dossier: the file slides up, the name types in letter by letter, the redaction bar pulls off the tag */
  P.intro_dossier = function (card, dur) {
    var chars = card.querySelector('b').children, n = chars.length, step = Math.min(70, 700 / Math.max(1, n));
    U_each(chars, function (c, k) { anim(c, [{ opacity: 0 }, { opacity: 1 }], { duration: 1, delay: 380 + k * step, fill: 'backwards' }); });
    var bar = card.querySelector('s');
    if (bar) anim(bar, [{ transform: 'scaleX(1)' }, { transform: 'scaleX(1)', offset: 0.5 }, { transform: 'scaleX(0)' }], { duration: 1300, delay: 300, easing: 'cubic-bezier(.7,0,.3,1)', fill: 'forwards' });
    return anim(card, [{ opacity: 0, transform: 'translate(-50%,-44%)' }, { opacity: 1, transform: 'translate(-50%,-50%)', offset: 0.12 },
      { opacity: 1, offset: 0.84 }, { opacity: 0, transform: 'translate(-50%,-52%)' }], { duration: dur, easing: 'ease-out' });
  };
  /* trailer: slow push in while the tracking closes, a sheen crosses the letters, hairlines open */
  P.intro_trailer = function (card, dur) {
    var b = card.querySelector('b');
    anim(b, [{ letterSpacing: '0.62em', filter: 'blur(6px)' }, { letterSpacing: '0.28em', filter: 'blur(0)', offset: 0.35 }, { letterSpacing: '0.2em', filter: 'blur(0)' }], { duration: dur, easing: 'cubic-bezier(.2,.6,.2,1)' });
    anim(b, [{ backgroundPosition: '100% 0' }, { backgroundPosition: '100% 0', offset: 0.3 }, { backgroundPosition: '0% 0', offset: 0.7 }, { backgroundPosition: '0% 0' }], { duration: dur, easing: 'ease-in-out' });
    return anim(card, [{ opacity: 0, transform: 'translate(-50%,-50%) scale(1.06)' }, { opacity: 1, offset: 0.25 },
      { opacity: 1, transform: 'translate(-50%,-50%) scale(1)', offset: 0.82 }, { opacity: 0, transform: 'translate(-50%,-50%) scale(0.985)' }], { duration: dur, easing: 'ease-out' });
  };
  /* vhs: tape locks on with a tracking jump, the timecode runs, RGB split jitters twice */
  P.intro_vhs = function (card, dur) {
    var tc = card._tc, t0 = performance.now(), self = this;
    (function tick() { if (!tc.isConnected) return; var s = Math.floor((performance.now() - t0) / 1000) + 3, f = Math.floor((performance.now() - t0) / 33.3) % 30; tc.textContent = '00:00:0' + s + ':' + (f < 10 ? '0' : '') + f; self.vfx._after(66, tick); })();
    var b = card.querySelector('b');
    anim(b, [{ transform: 'translateX(0)' }, { transform: 'translateX(-5px) skewX(-8deg)', offset: 0.3 }, { transform: 'translateX(4px)', offset: 0.32 }, { transform: 'translateX(0)', offset: 0.34 },
      { transform: 'translateX(0)', offset: 0.62 }, { transform: 'translateX(6px) skewX(6deg)', offset: 0.64 }, { transform: 'translateX(0)', offset: 0.66 }, { transform: 'translateX(0)' }], { duration: dur, easing: 'steps(1,end)' });
    return anim(card, [{ opacity: 0, transform: 'translate(-50%,-50%) scaleY(0.04)' }, { opacity: 1, transform: 'translate(-50%,-50%) scaleY(1)', offset: 0.08 },
      { opacity: 0.55, offset: 0.1 }, { opacity: 1, offset: 0.12 }, { opacity: 1, transform: 'translate(-50%,-50%) scaleY(1)', offset: 0.86 }, { opacity: 0, transform: 'translate(-50%,-50%) scaleY(0.04)' }], { duration: dur });
  };
  function U_each(list, fn) { Array.prototype.forEach.call(list, fn); }

  /* ---------- ambience ---------- */
  P.ambience = function () {
    var self = this, R = this.R, v = this.vfx;
    /* a mode with its own persistent vignette (darkness masks, 966, Mal0, Backrooms...) keeps its own look */
    var own = Object.keys(v.persist).some(function (k) { return k.indexOf('vignette') === 0 && k !== 'vignette#cine'; });
    if (!own) v.fx_vignette({ id: 'cine', target: 'board', color: dark(R.tone, 0.72), size: 55, opacity: 1, fade_ms: 1200 });
    /* screen-wide layers live on the board's visible frame (#board-wrap), not the board layer: a zoomed 30x30 board's
       layer is many screens big and a blended grain over all of it costs frames on a phone */
    var grain = this.el(v.wrap, 'cine-grain' + (this.red ? ' is-still' : '')); grain.innerHTML = '<i></i>';
    grain.style.opacity = R.grain != null ? R.grain : 0.07;
    v.persist['cine-grain'] = { remove: function () { grain.remove(); } };
    if (R.extra === 'nightvision') {
      var nv = this.el(v.wrap, 'cine-nv'); v.persist['cine-nv'] = { remove: function () { nv.remove(); } };
    }
    if (this.red) return;
    var base = R.flick === 2 ? 5000 : 9000;
    (function next() { self.later(base + Math.random() * base, function () { if (!self.ended && !self.G.busy) self.flicker(R.flick === 2 ? 3 : 2); next(); }); })();
    if (R.extra === 'blink') (function blink() { self.later(7000 + Math.random() * 6000, function () { if (!self.ended) self.blink(); blink(); }); })();
  };
  P.flicker = function (n) {
    if (this.red) return;
    var R = this.R, v = this.vfx, el = this.el(v.wrap, 'cine-flick'), frames = [{ opacity: 0 }], k;
    el.style.background = R.extra === 'fluoro' ? 'rgba(255,248,200,.5)' : 'rgba(0,0,0,.62)';
    for (k = 0; k < n; k++) { frames.push({ opacity: 1, offset: (k * 2 + 1) / (n * 2 + 1) }); frames.push({ opacity: k === n - 1 ? 0.15 : 0, offset: (k * 2 + 2) / (n * 2 + 1) }); }
    frames.push({ opacity: 0 });
    anim(el, frames, { duration: 110 * (n * 2 + 1), easing: 'steps(1, end)' }).then(function () { el.remove(); });
  };
  /* SCP-173: the screen blinks shut for a moment, like the video's blink meter running out */
  P.blink = function () {
    var v = this.vfx, el = this.el(v.screen, 'cine-blink');
    if (this.red) { el.style.background = 'rgba(0,0,0,.55)'; anim(el, [{ opacity: 0 }, { opacity: 1 }, { opacity: 0 }], { duration: 500 }).then(function () { el.remove(); }); return; }
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
    if (sq != null && sq >= 0 && k && !this.red) {
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
    var cap = this.place(this.el(v.screen, 'cine-caption is-' + this.look + ' is-' + res));
    cap.textContent = res === 'win' ? R.win : res === 'loss' ? R.lose : 'STALEMATE';
    cap.setAttribute('data-t', cap.textContent);
    var cw = parseFloat(cap.style.width) || window.innerWidth, ck = { dossier: 0.74, vhs: 0.56, trailer: 0.95 }[this.look] || 0.8, cm = { dossier: 34, vhs: 46, trailer: 30 }[this.look] || 32;
    cap.style.fontSize = Math.round(Math.max(14, Math.min(cm, 0.78 * cw / (cap.textContent.length * ck)))) + 'px';
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
    var delay = res === 'loss' && R.scare && !R.own ? 1500 : 300, F;
    if (this.red) F = [{ opacity: 0 }, { opacity: 1, offset: 0.2 }, { opacity: 1, offset: 0.82 }, { opacity: 0 }];
    /* dossier: a rubber stamp thumps down on the file */
    else if (this.look === 'dossier') F = [{ opacity: 0, transform: 'translate(-50%,-50%) rotate(-6deg) scale(1.9)' }, { opacity: 1, transform: 'translate(-50%,-50%) rotate(-6deg) scale(1)', offset: 0.07 },
      { transform: 'translate(-50%,-50%) rotate(-6deg) scale(1.03)', offset: 0.1 }, { opacity: 1, transform: 'translate(-50%,-50%) rotate(-6deg) scale(1)', offset: 0.13 }, { opacity: 1, offset: 0.84 }, { opacity: 0, transform: 'translate(-50%,-50%) rotate(-6deg) scale(1)' }];
    else if (this.look === 'vhs') F = [{ opacity: 0 }, { opacity: 1, offset: 0.06 }, { opacity: 0.3, offset: 0.09 }, { opacity: 1, offset: 0.12 }, { opacity: 1, offset: 0.84 }, { opacity: 0 }];
    else F = [{ opacity: 0, letterSpacing: '0.5em', filter: 'blur(5px)' }, { opacity: 1, letterSpacing: '0.24em', filter: 'blur(0)', offset: 0.3 }, { opacity: 1, letterSpacing: '0.2em', offset: 0.84 }, { opacity: 0, letterSpacing: '0.2em' }];
    if (!this.red && this.look === 'dossier') this.later(delay + 180, function () { sound('cine-hit', 0.22); });
    anim(cap, F, { duration: this.hold(res) - delay + 500, delay: delay, easing: 'ease-out', fill: 'backwards' }).then(function () { cap.remove(); });
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
    var v = this.vfx, el = this.el(v.wrap, 'cine-alarm');
    anim(el, this.red ? [{ opacity: 0 }, { opacity: 0.5 }, { opacity: 0 }] : [{ opacity: 0 }, { opacity: 0.85, offset: 0.25 }, { opacity: 0.1, offset: 0.5 }, { opacity: 0.85, offset: 0.75 }, { opacity: 0 }], { duration: 1400, easing: 'ease-in-out' }).then(function () { el.remove(); });
  };

  function holdModal() {
    var UI = CM.gameUI; if (!UI || !UI.showOver || UI.showOver._cine) return;
    var show = UI.showOver;
    UI.showOver = function (o) {
      var a = Cine.active;
      if (a && a.alive() && o && CM.settings.get('horrorCine') !== false) {
        var d = a.hold(o.result === 'win' ? 'win' : o.result === 'loss' ? 'loss' : 'draw');
        o = Object.assign({}, o, { delay: Math.max(o.delay == null ? 700 : o.delay, d) });
      }
      return show.call(this, o);
    };
    UI.showOver._cine = true;
  }

  var trig = CM.VFX.prototype.trigger;
  CM.VFX.prototype.trigger = function (name, info) {
    trig.call(this, name, info);
    try {
      var G = this.game, id = G && G.spec && G.spec.id, R = id && REG[id];
      if (!R || CM.settings.get('horrorCine') === false) return;
      holdModal();
      if (name === 'game_start' || !Cine.active || Cine.active.G !== G || Cine.active.gid !== G.gid) Cine.active = new Run(this, G, R);
      Cine.active.on(name, info || {});
    } catch (e) { console.warn('[cine]', e); }
  };
  var reset = CM.VFX.prototype.reset;
  CM.VFX.prototype.reset = function () { Cine.active = null; this.board && this.board.classList.remove('cine-dead'); return reset.apply(this, arguments); };
})();
