/* ov-newvid: "new video, mode coming soon" hype feature. Self-contained: everything lives in this file + css/hype.css.
   HOOK: index.html loads css/hype.css and this script (after js/lobby/lobby.js, before js/app.js). No other file is touched:
   this script wraps CM.lobby.init (to mount once the lobby is built), CM.app.openVideo (so a coming-soon video opens the
   coming-soon screen instead of a game: row taps, deep links #/play/<id>, anything else) and CM.lobby.quick (Random never
   lands on it). Which videos are coming soon is data: `coming_soon: true` (+ optional `teaser`) in data/videos.json; the
   newest such video gets the banner. When its mode ships, drop the flag and this feature disappears by itself. */
(function () {
  'use strict';
  var CM = window.CM; if (!CM || !CM.lobby || !CM.util) return;
  var U = CM.util, L = CM.lobby;
  var H = CM.hype = { ids: {}, featured: null, open: false };
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function fmtDate(d) { var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(d || ''); return m ? MON[+m[2] - 1] + ' ' + (+m[3]) + ', ' + m[1] : ''; }
  function fmtDur(s) { if (!s) return ''; var m = Math.floor(s / 60), x = String(s % 60).padStart(2, '0'); return m + ':' + x; }
  function yt(id) { return 'https://www.youtube.com/watch?v=' + encodeURIComponent(id); }
  function thumb(id) { return 'assets/modes/' + encodeURIComponent(id) + '/thumb.jpg'; }
  function ytThumb(id) { return 'https://i.ytimg.com/vi/' + encodeURIComponent(id) + '/maxresdefault.jpg'; }
  function reduced() { return CM.settings && CM.settings.reducedMotion ? CM.settings.reducedMotion() : false; }
  var ICO_CONE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10.2 3.5h3.6L19 19H5z"/><path d="M8.1 10h7.8M6.6 14.5h10.8M3 20.5h18"/></svg>';
  var ICO_PLAY = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l10.5-6.5z"/></svg>';
  var ICO_BACK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>';
  var ICO_ARROW = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>';

  H.is = function (id) { return !!H.ids[id]; };

  function collect() {
    (CM.DATA.videos || []).forEach(function (v) { if (v.coming_soon) H.ids[v.id] = v; });
    var list = Object.keys(H.ids).map(function (k) { return H.ids[k]; }).sort(function (a, b) { return (b.date || '').localeCompare(a.date || ''); });
    H.featured = list[0] || null;
    /* never a "playable" row: Random skips it */
    Object.keys(H.ids).forEach(function (id) { var o = L.byId[id]; if (o) o.hasLegacy = false; });
  }

  /* ---------- lobby banner ---------- */
  function bannerHtml(v) {
    var t = U.esc(U.cleanTitle(v.title));
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
          '<span class="hype-status"><span class="hype-status__dot" aria-hidden="true"></span>' + ICO_CONE + 'Mode in development</span>' +
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
    el.innerHTML = bannerHtml(v);
    lobby.insertBefore(el, quick || lobby.firstChild);
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
    var t = U.esc(U.cleanTitle(v.title));
    return '<div class="hype-screen__bar"><button type="button" class="hype-screen__close" data-hype-close aria-label="Back to lobby">' + ICO_BACK + '</button><span class="hype-screen__bt">Coming soon</span></div>' +
      '<div class="hype-screen__scroll"><div class="hype-screen__inner">' +
        '<div class="hype-screen__hero"><div class="hype-banner__stripe hype-screen__stripe" aria-hidden="true"><span></span></div>' +
          '<img src="' + thumb(v.id) + '" alt="Video thumbnail" width="960" height="540" decoding="async" onerror="if(this.src.indexOf(\'ytimg\')<0)this.src=\'' + ytThumb(v.id) + '\'">' +
          '<span class="hype-screen__flag">' + ICO_CONE + 'Under construction</span></div>' +
        '<div class="hype-screen__eyebrow"><span class="hype-badge">NEW VIDEO</span><span>' + U.esc(fmtDate(v.date)) + (v.dur ? ' · ' + fmtDur(v.dur) : '') + '</span></div>' +
        '<h2 class="hype-screen__t" id="hype-screen-t">' + t + '</h2>' +
        '<div class="hype-screen__by"><img src="assets/avatars/iwantcheckmate.png" alt="" width="28" height="28"><span>iwantcheckmate</span></div>' +
        (v.teaser ? '<p class="hype-screen__teaser">' + U.esc(v.teaser) + '</p>' : '') +
        '<div class="hype-screen__card"><div class="hype-status hype-status--lg"><span class="hype-status__dot" aria-hidden="true"></span>Mode in development</div>' +
          '<p>This video is being turned into a playable mode. It is not playable yet. Watch the video now and check back here soon.</p></div>' +
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
    scr.className = 'hype-screen'; scr.setAttribute('role', 'dialog'); scr.setAttribute('aria-modal', 'true'); scr.setAttribute('aria-labelledby', 'hype-screen-t');
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
      collect(); mountBanner(); markRows();
      var rows = U.$('rows'); if (rows && window.MutationObserver) new MutationObserver(markRows).observe(rows, { childList: true });
      var app = CM.app;
      if (app && app.openVideo && !app.openVideo._hype) {
        var ov = app.openVideo;
        app.openVideo = function (id, fromHash) {
          if (H.is(id)) {
            if (/^#\/play\//.test(location.hash)) history.replaceState(null, '', '#/');
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
