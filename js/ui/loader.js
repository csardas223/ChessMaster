/* Mode loading screen. loader-v3 (owner 2026-11-26 12:27 PM ET): "make the loading animation same as the one where you
   scroll down and the thumbnails are loaded with that pawn in the middle, except the pawn is a 2D pawn rotating on the
   Y-axis and spinning like a loading animation", show it longer, and use that time to really load the mode.
   Look: the game screen drawn as skeleton blocks placed on the real element rects (top bar, both player bars, side
   panel); the board block IS a lobby thumbnail placeholder (css/lobby.css .vrow__th: the category hue gradient, the
   same `skel` sweep) with the same flat pawn (CM.pawnSVG, shared with lobby.js) in the middle, spinning on its Y axis
   (css/base.css .pawnspin, 1.6 s per turn). The lobby thumbnails use the very same spinning pawn while they load.
   Reduced motion: no sweep and a calm, slow turn (8 s).
   Timing: hide() (CM.gameUI.setLoading(false) once the controller has started) only fades out when ALL of these hold:
     - at least MIN_MS since show(), so it never just flashes;
     - every promise handed to CM.loader.wait() settled (js/app.js: the mode's scripts, its art + sounds preloaded by
       CM.loader.preload(spec), the bot engine warmed up), each capped by its own timeout;
     - every <img> now in the game view (pieces, avatars, board art, HUD art) has loaded and decoded;
   or MAX_MS has passed (fallback: never stuck on the loader). Then an opacity-only fade over FADE_MS.
   The overlay takes no pointer events, so the real back button under the skeleton top bar keeps working.
   API: CM.loader.show({ hue }), CM.loader.hide(now), CM.loader.wait(promise, capMs), CM.loader.preload(spec) -> promise,
   CM.loader.isVisible(), CM.loader.MIN_MS / MAX_MS / FADE_MS. */
(function () {
  'use strict';
  var CM = window.CM;
  var MIN_MS = 1300, MAX_MS = 7000, FADE_MS = 260, IMG_CAP = 4000, SND_CAP = 3000;
  var el = null, shownAt = 0, hideT = 0, visible = false, gates = [], token = 0;

  /* the lobby thumbnail pawn (one path for both, so they always match) */
  var PAWN_PATH = 'M22.5 9a4 4 0 0 0-3.22 6.38 6.48 6.48 0 0 0-.87 10.65C15.41 27.09 11 31.58 11 39.5h23c0-7.92-4.41-12.41-7.41-13.47a6.46 6.46 0 0 0-.87-10.65A4 4 0 0 0 22.5 9z';
  CM.pawnSVG = function (cls) { return '<svg class="' + (cls || '') + ' pawnspin" viewBox="0 0 45 45" aria-hidden="true"><path d="' + PAWN_PATH + '"/></svg>'; };
  var BACK_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>';

  function reduced() { return CM.settings && CM.settings.reducedMotion ? CM.settings.reducedMotion() : (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches); }
  function delay(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function capped(p, ms) { return Promise.race([Promise.resolve(p).catch(function () { }), delay(ms)]); }

  function pbarHTML(id) {
    return '<div class="mload__pbar" data-k="' + id + '"><i class="sk sk--ava"></i><span class="mload__lines"><i class="sk sk--l1"></i><i class="sk sk--l2"></i></span><i class="sk sk--clock"></i></div>';
  }
  function build() {
    if (el) return;
    el = document.createElement('div');
    el.className = 'mload'; el.id = 'mode-loader'; el.setAttribute('aria-hidden', 'true'); el.hidden = true;
    el.innerHTML = '<div class="mload__bar"><span class="mload__back">' + BACK_SVG + '</span><span class="mload__title"><i class="sk sk--t1"></i><i class="sk sk--t2"></i></span><span class="mload__icons"><i class="sk sk--ic"></i><i class="sk sk--ic"></i></span></div>' +
      pbarHTML('top') +
      '<div class="mload__board vrow__th">' + CM.pawnSVG('vrow__ph mload__pawn') + '</div>' +
      pbarHTML('bottom') +
      '<div class="mload__side sk"><i class="sk sk--tab"></i><i class="sk sk--row"></i><i class="sk sk--row"></i><i class="sk sk--row sk--short"></i></div>';
    (document.getElementById('view-game') || document.body).appendChild(el);
  }

  /* place each skeleton block on the real element it stands for (the game layout is already laid out under
     .is-loading, its contents only visibility:hidden); fall back to a centred column when a rect is empty */
  function rectOf(id) { var n = document.getElementById(id); if (!n) return null; var r = n.getBoundingClientRect(); return r.width > 8 && r.height > 8 ? r : null; }
  function put(node, r) { if (!r) { node.style.display = 'none'; return; } node.style.display = ''; Object.assign(node.style, { left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px' }); }
  function layout() {
    if (!el) return;
    var W = window.innerWidth, H = window.innerHeight;
    var bar = rectOf('view-game') ? document.querySelector('#view-game .gamebar') : null, br = bar && bar.getBoundingClientRect();
    put(el.querySelector('.mload__bar'), br && br.height > 8 ? br : { left: 0, top: 0, width: W, height: 52 });
    var board = rectOf('board-wrap'), top = rectOf('card-top'), bot = rectOf('card-bottom'), side = rectOf('side');
    if (!board) { var s = Math.min(W - 16, H - 52 - 140, 640), x = (W - s) / 2, y = 52 + 56 + Math.max(0, (H - 52 - s - 112) / 2); board = { left: x, top: y, width: s, height: s }; }
    if (!top) top = { left: board.left, top: board.top - 56, width: board.width, height: 56 };
    if (!bot) bot = { left: board.left, top: board.top + board.height, width: board.width, height: 56 };
    put(el.querySelector('.mload__board'), board);
    put(el.querySelector('[data-k="top"]'), top); put(el.querySelector('[data-k="bottom"]'), bot);
    put(el.querySelector('.mload__side'), side && side.left >= board.left + board.width - 1 ? { left: side.left, top: side.top, width: side.width, height: Math.min(side.height, H - side.top) } : null);
  }

  /* ---------- preloading ---------- */
  var IMG_RE = /\.(png|jpe?g|webp|gif|svg|avif)(\?.*)?$/i, SND_RE = /\.(wav|mp3|ogg|m4a)(\?.*)?$/i;
  var seenImg = {};
  function loadImg(u) {
    if (seenImg[u]) return seenImg[u];
    seenImg[u] = new Promise(function (res) {
      var i = new Image(); i.decoding = 'async';
      i.onload = function () { (i.decode ? i.decode() : Promise.resolve()).then(res, res); };
      i.onerror = function () { delete seenImg[u]; res(); };
      i.src = u;
    });
    return seenImg[u];
  }
  function loadSnd(u) {
    if (CM.sound && CM.sound.preload) CM.sound.preload([u]);   /* builds the HTMLAudio pool (preload=auto) the game plays from */
    if (location.protocol === 'file:' || !window.fetch) return Promise.resolve();
    return fetch(u, { cache: 'force-cache' }).then(function (r) { return r.ok ? r.arrayBuffer() : null; }).catch(function () { });
  }
  /* every local asset path named anywhere in a mode spec (piece art, avatars, board images, intro stills, sounds) */
  function collect(o, out, depth) {
    if (depth > 6 || o == null) return;
    if (typeof o === 'string') {
      if (/^(https?:)?\/\//.test(o) || o.length > 300) return;
      if (IMG_RE.test(o)) out.img[o] = 1; else if (SND_RE.test(o)) out.snd[o] = 1;
      return;
    }
    if (typeof o !== 'object') return;
    for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) collect(o[k], out, depth + 1);
  }
  function preload(spec) {
    var out = { img: {}, snd: {} };
    try { collect(spec, out, 0); } catch (e) { /* ignore */ }
    /* the user's piece set (standard pieces are drawn from it in most modes) */
    if (CM.settings && CM.settings.pieceUrl) ['w', 'b'].forEach(function (c) { 'PNBRQK'.split('').forEach(function (t) { out.img[CM.settings.pieceUrl(c, t)] = 1; }); });
    var imgs = Object.keys(out.img).map(function (u) { return capped(loadImg(u), IMG_CAP); });
    var snds = Object.keys(out.snd).map(function (u) { return capped(loadSnd(u), SND_CAP); });
    return Promise.all(imgs.concat(snds));
  }
  /* every image the game view is about to show: wait for it to load and decode (pieces, avatars, HUD art) */
  function viewImages() {
    var v = document.getElementById('view-game'); if (!v) return Promise.resolve();
    var list = Array.prototype.slice.call(v.querySelectorAll('img')).filter(function (i) { return !el || !el.contains(i); });
    var bg = [];
    var bw = document.getElementById('board-wrap');
    if (bw) { var m = /url\(["']?([^"')]+)["']?\)/.exec(getComputedStyle(bw).getPropertyValue('--board-image') || ''); if (m) bg.push(loadImg(m[1])); }
    return Promise.all(list.map(function (i) {
      var src = i.currentSrc || i.src; if (!src || /^data:/.test(src)) return null;
      if (i.complete) return i.naturalWidth && i.decode ? i.decode().catch(function () { }) : null;
      return capped(new Promise(function (r) { i.addEventListener('load', r, { once: true }); i.addEventListener('error', r, { once: true }); }), IMG_CAP);
    }).concat(bg));
  }

  function show(opts) {
    build();
    clearTimeout(hideT); token++; gates = [];
    var h = opts && opts.hue != null ? opts.hue : 30;
    el.style.setProperty('--h', h);
    el.classList.toggle('is-static', !!reduced());
    el.hidden = false; el.classList.remove('is-out');
    layout();
    void el.offsetWidth; el.classList.add('is-in');
    requestAnimationFrame(layout);   /* once the loading layout has settled */
    shownAt = performance.now(); visible = true;
  }
  function wait(p, cap) { if (visible) gates.push(capped(p, cap || MAX_MS)); return p; }
  /* s6b: callbacks waiting for the loading screen to leave (the match-start cue) run as it starts fading out */
  var onHide = [];
  function flushHide() { var q = onHide; onHide = []; q.forEach(function (f) { try { f(); } catch (e) { console.error(e); } }); }
  function whenHidden(f) { if (!visible) setTimeout(f, 0); else onHide.push(f); }
  function fadeOut() {
    if (!visible) return;
    setTimeout(flushHide, 0);
    el.classList.remove('is-in'); el.classList.add('is-out');
    hideT = setTimeout(function () { visible = false; el.hidden = true; el.classList.remove('is-out'); }, FADE_MS);
  }
  function hide(now) {
    if (!el || !visible) return;
    clearTimeout(hideT);
    if (now) { fadeOut(); return; }
    var my = ++token, left = function (ms) { return Math.max(0, ms - (performance.now() - shownAt)); };
    /* two frames so the controller's first render (board, bars, avatars) is in the DOM before we look for its images */
    var ready = new Promise(function (r) { requestAnimationFrame(function () { requestAnimationFrame(r); }); })
      .then(function () { return Promise.all(gates.concat([viewImages()])); });
    Promise.race([Promise.all([ready, delay(left(MIN_MS))]), delay(left(MAX_MS))]).then(function () {
      if (my !== token) return;   /* a newer show()/hide() took over */
      layout(); fadeOut();
    });
  }
  window.addEventListener('resize', function () { if (visible) layout(); });

  CM.loader = { show: show, hide: hide, wait: wait, preload: preload, isVisible: function () { return visible; }, whenHidden: whenHidden, MIN_MS: MIN_MS, MAX_MS: MAX_MS, FADE_MS: FADE_MS };
})();
