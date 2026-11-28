/* Lobby hero banners. Self-contained: everything lives in this file + css/hype.css.
   HOOK: index.html loads css/hype.css and this script (after js/lobby/lobby.js, before js/app.js). No other file is touched
   beyond the empty #featured slot in index.html: this script wraps CM.lobby.init (to mount once the lobby is built),
   CM.app.openVideo (so a coming-soon video opens the coming-soon screen instead of a game) and CM.lobby.quick (Random
   never lands on a coming-soon video).

   1. FEATURED MODE (fin2-lobby, owner 2026-11-26): the big "just released" hero at the top of the lobby is a fixed
      config, FEATURED below. It is NOT picked from data/videos.json, so the daily new-video task (which only adds
      `coming_soon` entries to videos.json) can never replace it. To feature another mode, edit FEATURED (id = a key of
      CM_DATA.modeIndex; art = a crisp 16:9 image, >= 1280 px wide). Set FEATURED = null to fall back to (2).
   2. COMING SOON (ov-newvid): with no FEATURED, the newest `coming_soon: true` video in data/videos.json gets the
      "mode in development" banner. Coming-soon rows and #/play/<id> deep links always open the coming-soon screen.
      A coming-soon video uploaded AFTER FEATURED.date takes the hero slot (new videos always come first, owner
      2026-11-26); once its mode ships, point FEATURED at it and drop `coming_soon`.
   3. UNDER CONSTRUCTION TEMPLATE (templates/under-construction/README.md): a coming-soon entry may carry
      `build: { rules, board, art, characters, sound, qa }` (true = done). The banner then says "n of 6 built" and the
      screen lists each part, so an unfinished mode never looks finished. Optional `accent` (#rrggbb, picked from the
      video's thumbnail) tints the construction stripe, dot and flag. */
(function () {
  'use strict';
  var CM = window.CM; if (!CM || !CM.lobby || !CM.util) return;
  var U = CM.util, L = CM.lobby;
  var H = CM.hype = { ids: {}, featured: null, open: false };
  var FEATURED = {
    id: 'b2QHgQAQTp0',   /* SCP-4000 (video 2026-11-28); replaced SCP-956 (agJbUnr6PCQ, 2026-11-27; its art stays in assets/lobby/featured-agJbUnr6PCQ*) */
    eyebrow: 'New mode',
    title: 'SCP-4000 steals your identity',   /* the video's title (oEmbed, RSS, watch page) */
    teaser: 'After every Stockfish move a rabbit makes its own move, then swaps places with a piece next to it and steals the way that piece moves.',
    meta: 'Horror · vs Stockfish 3600',
    art: 'assets/lobby/featured-b2QHgQAQTp0.jpg',          /* 1280x720, the video's own YouTube thumbnail (maxresdefault; assets/lobby/source.notes) */
    artSmall: 'assets/lobby/featured-b2QHgQAQTp0-640.jpg',  /* 640x360 */
    /* montage frames after the key art (the video's own stills, YouTube maxres1/2; source.notes) */
    frames: [['assets/lobby/featured-b2QHgQAQTp0-f1.jpg', 'assets/lobby/featured-b2QHgQAQTp0-f1-640.jpg'],
      ['assets/lobby/featured-b2QHgQAQTp0-f2.jpg', 'assets/lobby/featured-b2QHgQAQTp0-f2-640.jpg']],
    family: 'Horror', opponent: 'Stockfish', rating: 3600,
    date: '2026-11-28'   /* the video's upload date: a coming-soon video uploaded later takes the hero slot (header, 2) */
  };

  H.config = FEATURED;
  /* lobby.js reads this to drop its "new video" strip and keep the featured mode out of "Recommended" */
  if (FEATURED && (CM.DATA.modeIndex || {})[FEATURED.id]) L.featuredId = FEATURED.id; else FEATURED = null;
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function fmtDate(d) { var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(d || ''); return m ? MON[+m[2] - 1] + ' ' + (+m[3]) + ', ' + m[1] : ''; }
  function fmtDur(s) { if (!s) return ''; var m = Math.floor(s / 60), x = String(s % 60).padStart(2, '0'); return m + ':' + x; }
  function yt(id) { return 'https://www.youtube.com/watch?v=' + encodeURIComponent(id); }
  function thumb(id) { return 'assets/modes/' + encodeURIComponent(id) + '/thumb.jpg'; }
  function ytThumb(id) { return 'https://i.ytimg.com/vi/' + encodeURIComponent(id) + '/maxresdefault.jpg'; }
  var PARTS = [['rules', 'Rules'], ['board', 'Board and setup'], ['art', 'Art'], ['characters', 'Characters and opponent'], ['sound', 'Sound'], ['qa', 'Phone QA']];
  function parts(v) { var b = v && v.build; if (!b || typeof b !== 'object') return null; return PARTS.map(function (x) { return { label: x[1], done: !!b[x[0]] }; }); }
  function doneCount(ps) { return ps.filter(function (x) { return x.done; }).length; }
  function accentStyle(v) { return v && /^#[0-9a-f]{6}$/i.test(v.accent || '') ? ' style="--uc-accent:' + v.accent + '"' : ''; }
  var ICO_TICK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.2 4.2L19 7"/></svg>';
  function reduced() { return CM.settings && CM.settings.reducedMotion ? CM.settings.reducedMotion() : false; }
  var ico = function (n) { return CM.icon ? CM.icon(n) : ''; };
  var ICO_CONE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10.2 3.5h3.6L19 19H5z"/><path d="M8.1 10h7.8M6.6 14.5h10.8M3 20.5h18"/></svg>';
  var ICO_PLAY = ico('play'), ICO_BACK = ico('back'), ICO_ARROW = ico('chev');

  H.is = function (id) { return !!H.ids[id]; };

  function collect() {
    (CM.DATA.videos || []).forEach(function (v) { if (v.coming_soon) H.ids[v.id] = v; });
    var list = Object.keys(H.ids).map(function (k) { return H.ids[k]; }).sort(function (a, b) { return (b.date || '').localeCompare(a.date || ''); });
    H.featured = list[0] || null;
    /* never a "playable" row: Random skips it */
    Object.keys(H.ids).forEach(function (id) { var o = L.byId[id]; if (o) o.hasLegacy = false; });
  }

  /* ---------- featured mode hero (FEATURED) ---------- */
  function mountFeatured() {
    var f = FEATURED, el = U.$('featured'), quick = U.$('quick'); if (!f || !el) return;
    var href = '#/play/' + encodeURIComponent(f.id);
    /* s5-ui (owner 3:17 PM "UI looks vibecoded, more stimulating"): the banner is the video itself: key art, then its
       gameplay stills crossfading with a slow push-in (CSS, 4 s per frame, off under reduced motion), the title set
       big over the art's dark foot, a solid family tag instead of a pill, opponent + rating as a plain meta line */
    var fr = [[f.art, f.artSmall]].concat(f.frames || []);
    var frames = fr.map(function (a, i) {
      return '<img class="feat__fr" style="--i:' + i + ';--n:' + fr.length + '" src="' + U.esc(a[0]) + '" srcset="' + U.esc(a[1]) + ' 640w, ' + U.esc(a[0]) + ' 1280w"' +
        ' sizes="(min-width: 900px) 900px, 100vw" width="1280" height="720" alt="" decoding="async"' + (i ? ' loading="lazy"' : ' fetchpriority="high"') + '>';
    }).join('');
    el.style.setProperty('--n', fr.length);
    el.innerHTML =
      '<a class="feat__media" href="' + href + '" data-featured-play tabindex="-1" aria-hidden="true">' + frames + '</a>' +
      '<div class="feat__body">' +
        '<p class="feat__eyebrow"><span class="feat__new">' + U.esc(f.eyebrow) + '</span>' + (f.family ? '<span class="feat__fam">' + U.esc(f.family) + '</span>' : '') + '</p>' +
        '<h2 class="feat__t" id="feat-t">' + U.esc(f.title) + '</h2>' +
        '<p class="feat__s">' + U.esc(f.teaser) + '</p>' +
        '<div class="feat__acts"><a class="btn btn--primary feat__play" href="' + href + '" data-featured-play>' + ICO_PLAY + '<span>Play now</span></a>' +
          (f.opponent ? '<span class="feat__vs">vs <b>' + U.esc(f.opponent) + '</b>' + (f.rating ? ' ' + f.rating : '') + '</span>' : '') + '</div>' +
      '</div>';
    var img = el.querySelector('img');
    var loaded = function () { el.classList.add('is-loaded'); };
    img.addEventListener('load', loaded); if (img.complete && img.naturalWidth) loaded();
    img.addEventListener('error', function () { el.classList.add('is-noimg'); });
    el.addEventListener('click', function (e) {
      if (!e.target.closest('[data-featured-play]') || e.ctrlKey || e.metaKey || e.shiftKey || e.button > 0) return;
      e.preventDefault(); CM.app.openVideo(f.id);
    });
    var sync = function () { el.hidden = !!(quick && quick.hidden); };
    sync(); if (quick && window.MutationObserver) new MutationObserver(sync).observe(quick, { attributes: true, attributeFilter: ['hidden'] });
  }

  /* ---------- coming-soon banner ---------- */
  function bannerHtml(v) {
    var t = U.esc(U.cleanTitle(v.title)), ps = parts(v);
    return '<div class="hype-banner__stripe" aria-hidden="true"><span></span></div>' +
      '<button type="button" class="hype-banner__hit" data-hype-open="' + U.esc(v.id) + '" aria-label="New video: ' + t + '. Mode coming soon. Open details"></button>' +
      '<span class="hype-banner__media"><img src="' + thumb(v.id) + '" alt="" decoding="async" fetchpriority="high" width="960" height="540" data-fallback="' + ytThumb(v.id) + '">' +
        '<span class="hype-banner__shade" aria-hidden="true"></span>' +
        (v.dur ? '<span class="hype-banner__dur">' + fmtDur(v.dur) + '</span>' : '') + '</span>' +
      '<span class="hype-banner__body">' +
        '<span class="hype-banner__eyebrow"><span class="hype-badge">NEW</span><span class="hype-banner__date">Uploaded ' + U.esc(fmtDate(v.date)) + '</span></span>' +
        '<span class="hype-banner__t">' + t + '</span>' +
        (v.teaser ? '<span class="hype-banner__s">' + U.esc(v.teaser) + '</span>' : '') +
        '<span class="hype-banner__foot">' +
          '<span class="hype-status"><span class="hype-status__dot" aria-hidden="true"></span>' + ICO_CONE + 'Mode in development' +
            (ps ? '<span class="hype-status__n">' + doneCount(ps) + ' of ' + ps.length + ' built</span>' : '') + '</span>' +
          '<a class="hype-link" href="' + yt(v.id) + '" target="_blank" rel="noopener">' + ICO_PLAY + 'Watch on YouTube</a>' +
        '</span>' +
      '</span>' +
      '<span class="hype-banner__chev" aria-hidden="true">' + ICO_ARROW + '</span>';
  }
  function mountBanner() {
    var v = H.featured, lobby = U.$('lobby'), quick = U.$('quick');
    if (!v || !lobby || U.$('hype-banner')) return;
    var el = document.createElement('section');
    el.id = 'hype-banner'; el.className = 'hype-banner'; el.setAttribute('aria-label', 'New video');
    if (accentStyle(v)) el.style.setProperty('--uc-accent', v.accent);
    el.innerHTML = bannerHtml(v);
    /* the hero slot: where the featured mode would sit (top of the lobby), else above the quick rows */
    var slot = U.$('featured');
    if (slot && slot.parentNode === lobby) lobby.insertBefore(el, slot); else lobby.insertBefore(el, quick || lobby.firstChild);
    var img = el.querySelector('img');
    img.addEventListener('error', function () { if (img.dataset.fallback && img.src.indexOf('ytimg') < 0) img.src = img.dataset.fallback; else el.classList.add('is-noimg'); });
    img.addEventListener('load', function () { el.classList.add('is-loaded'); });
    if (img.complete && img.naturalWidth) el.classList.add('is-loaded');
    el.addEventListener('click', function (e) {
      if (e.target.closest('.hype-link')) return;   /* the YouTube link just opens YouTube */
      H.show(v.id);
    });
    /* the banner follows the quick rows: shown on the All tab with no search / type filter (lobby.js toggles #quick) */
    var sync = function () { el.hidden = !!(quick && quick.hidden); };
    sync(); if (quick && window.MutationObserver) new MutationObserver(sync).observe(quick, { attributes: true, attributeFilter: ['hidden'] });
  }

  /* ---------- the video's own row(s): same "Coming soon" state ---------- */
  function markRows() {
    Object.keys(H.ids).forEach(function (id) {
      U.qsa('[data-open="' + id + '"]', U.$('rows')).forEach(function (r) {
        if (r.classList.contains('hype-row')) return;
        r.classList.add('hype-row');
        r.setAttribute('aria-label', U.cleanTitle(H.ids[id].title) + '. New video, mode coming soon');
        var th = r.querySelector('.vrow__th'); if (th) { var s = document.createElement('span'); s.className = 'hype-row__band'; s.setAttribute('aria-hidden', 'true'); s.textContent = 'Coming soon'; th.appendChild(s); }
        var m = r.querySelector('.vrow__m'); if (m) { var b = document.createElement('span'); b.className = 'hype-row__tag'; b.textContent = 'Coming soon'; m.insertBefore(b, m.firstChild); }
      });
    });
  }

  /* ---------- full-screen coming-soon screen ---------- */
  var scr = null, lastFocus = null, pushed = false;
  function screenHtml(v) {
    var t = U.esc(U.cleanTitle(v.title)), ps = parts(v);
    var list = ps ? '<ul class="hype-build" aria-label="What is built so far">' + ps.map(function (x) {
      return '<li class="hype-build__i' + (x.done ? ' is-done' : '') + '"><span class="hype-build__mk" aria-hidden="true">' + (x.done ? ICO_TICK : '') + '</span>' +
        '<span class="hype-build__l">' + U.esc(x.label) + '</span><span class="hype-build__s">' + (x.done ? 'Done' : 'In progress') + '</span></li>';
    }).join('') + '</ul>' : '';
    return '<div class="hype-screen__bar"><button type="button" class="hype-screen__close" data-hype-close aria-label="Back to lobby">' + ICO_BACK + '</button><span class="hype-screen__bt">Coming soon</span></div>' +
      '<div class="hype-screen__scroll"><div class="hype-screen__inner">' +
        '<div class="hype-screen__hero"><div class="hype-banner__stripe hype-screen__stripe" aria-hidden="true"><span></span></div>' +
          '<img src="' + thumb(v.id) + '" alt="Video thumbnail" width="960" height="540" decoding="async" onerror="if(this.src.indexOf(\'ytimg\')<0)this.src=\'' + ytThumb(v.id) + '\'">' +
          '<span class="hype-screen__flag">' + ICO_CONE + 'Under construction</span></div>' +
        '<div class="hype-screen__eyebrow"><span class="hype-badge">NEW VIDEO</span><span>' + U.esc(fmtDate(v.date)) + (v.dur ? ' · ' + fmtDur(v.dur) : '') + '</span></div>' +
        '<h2 class="hype-screen__t" id="hype-screen-t">' + t + '</h2>' +
        '<div class="hype-screen__by"><img src="assets/avatars/iwantcheckmate.png" alt="" width="28" height="28"><span>iwantcheckmate</span></div>' +
        (v.teaser ? '<p class="hype-screen__teaser">' + U.esc(v.teaser) + '</p>' : '') +
        '<div class="hype-screen__card"><div class="hype-status hype-status--lg"><span class="hype-status__dot" aria-hidden="true"></span>Mode in development' +
            (ps ? '<span class="hype-status__n">' + doneCount(ps) + ' of ' + ps.length + ' built</span>' : '') + '</div>' +
          '<p>This video is being turned into a playable mode. It is not playable yet. Watch the video now and check back here soon.</p>' + list + '</div>' +
        '<div class="hype-screen__actions">' +
          '<a class="hype-btn hype-btn--primary" href="' + yt(v.id) + '" target="_blank" rel="noopener">' + ICO_PLAY + 'Watch on YouTube</a>' +
          '<button type="button" class="hype-btn" data-hype-close>Back to lobby</button>' +
        '</div>' +
      '</div></div>';
  }
  function onKey(e) {
    if (!H.open) return;
    if (e.key === 'Escape') { e.preventDefault(); H.hide(); return; }
    if (e.key === 'Tab') {   /* keep focus inside the screen */
      var f = U.qsa('button, a[href]', scr).filter(function (x) { return x.offsetParent !== null; }); if (!f.length) return;
      var a = f[0], z = f[f.length - 1];
      if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
      else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
    }
  }
  H.show = function (id) {
    var v = H.ids[id]; if (!v || H.open) return;
    lastFocus = document.activeElement;
    if (scr) scr.remove();
    scr = document.createElement('div');
    scr.className = 'hype-screen'; if (accentStyle(v)) scr.style.setProperty('--uc-accent', v.accent); scr.setAttribute('role', 'dialog'); scr.setAttribute('aria-modal', 'true'); scr.setAttribute('aria-labelledby', 'hype-screen-t');
    scr.innerHTML = screenHtml(v);
    scr.addEventListener('click', function (e) { if (e.target.closest('[data-hype-close]')) H.hide(); });
    document.body.appendChild(scr);
    document.documentElement.classList.add('hype-lock');
    H.open = true;
    void scr.offsetWidth; scr.classList.add('is-in');
    document.addEventListener('keydown', onKey, true);
    /* phone back button closes the screen: one history entry on the lobby URL (the app's router ignores it) */
    try { history.pushState({ hype: id }, '', '#/'); pushed = true; } catch (e) { pushed = false; }
    var c = scr.querySelector('.hype-screen__close'); if (c) c.focus({ preventScroll: true });
  };
  H.hide = function (fromPop) {
    if (!H.open || !scr) return;
    H.open = false;
    document.removeEventListener('keydown', onKey, true);
    var el = scr; scr = null;
    el.classList.remove('is-in'); el.classList.add('is-out');
    var done = function () { el.remove(); document.documentElement.classList.remove('hype-lock'); };
    if (reduced()) done(); else setTimeout(done, 240);
    if (!fromPop && pushed) { pushed = false; history.back(); } else pushed = false;
    if (lastFocus && lastFocus.focus && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
  };
  window.addEventListener('popstate', function () { if (H.open) { pushed = false; H.hide(true); } });

  /* ---------- hooks (wrappers, see header) ---------- */
  var init0 = L.init;
  L.init = function () {
    var r = init0.apply(this, arguments);
    try {
      collect();
      /* a coming-soon video newer than the pinned mode takes the hero slot (header, 2) */
      if (FEATURED && H.featured && (H.featured.date || '') > (FEATURED.date || '')) { FEATURED = null; L.featuredId = null; }
      if (FEATURED) mountFeatured(); else mountBanner(); markRows();
      /* rows arrive page by page (infinite scroll): mark each new page */
      document.addEventListener('cm:lobby-rows', markRows);
      var app = CM.app;
      if (app && app.openVideo && !app.openVideo._hype) {
        var ov = app.openVideo;
        app.openVideo = function (id, fromHash) {
          if (H.is(id)) {
            if (app.isPlayUrl ? app.isPlayUrl() : /^#\/play\//.test(location.hash)) history.replaceState(null, '', app.lobbyUrl ? app.lobbyUrl() : '#/');
            if (app.view !== 'lobby') app.showLobby(true);
            H.show(id); return;
          }
          return ov.apply(this, arguments);
        };
        app.openVideo._hype = true;
      }
    } catch (e) { console.warn('hype: ' + e.message); }
    return r;
  };
  var quick0 = L.quick;
  L.quick = function (k) {
    if (k === 'random') { var pool = L.list.filter(function (v) { return v.hasLegacy && !H.is(v.id); }); if (pool.length) return CM.app.openVideo(U.pick(pool).id); }
    return quick0.apply(this, arguments);
  };
})();
