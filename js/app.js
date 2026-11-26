/* App shell: boot, hash routing (#/ lobby, #/play/<id> game), screen crossfades, and dispatch of a video to
   its controller: SpecGame (data-driven chess modes), GameFrame (video-game frame) or the legacy port. */
(function () {
  'use strict';
  var CM = window.CM, U = CM.util, $ = U.$;
  var app = CM.app = { view: 'lobby', current: null, lobbyY: 0, seq: 0 };

  /* pol-perf: index.html only loads what the lobby needs; the game engine and controllers load on the first open (and
     are prefetched once the lobby is idle), the legacy 8x8 library only when a video without a mode file opens.
     Each bundle is a list of classic scripts run in order (CM.util.loadScripts), so file:// keeps working. */
  var BUNDLES = {
    game: ['js/engine/geometry.js', 'js/engine/movement.js', 'js/engine/variant.js', 'js/engine/search.js', 'js/engine/spec.js',
      'js/engine/events.js', 'data/bot_engines.js', 'data/fairy_modes.js', 'js/bot/stockfish.js', 'js/bot/maia.js', 'js/bot/fairy.js', 'js/bot/bot.js', 'js/fx/scene3d.js', 'js/game/spec-game.js', 'js/game/game-frame.js'],
    /* shared classic-script scope, order matters */
    legacy: ['data/legacy_modes.js', 'js/legacy/engine8.js', 'js/legacy/glue.js', 'js/legacy/modes_extra.js']
  };
  var bundles = {};
  app.ensure = function (name) {
    if (bundles[name]) return bundles[name];
    var p = name === 'legacy'
      ? app.ensure('game').then(function () { return U.loadScripts(BUNDLES.legacy); }).then(legacyBoot)
      : U.loadScripts(BUNDLES[name]);
    bundles[name] = p.catch(function (e) { delete bundles[name]; throw e; });
    return bundles[name];
  };
  function legacyBoot() {
    /* legacy renderer runs through modes_extra.js's wrapper; add our chrome fix-ups after it */
    if (typeof render === 'function') { var r0 = render; render = function () { r0.apply(this, arguments); CM.legacyGame.afterRender(); }; }
    var rew = $('xrew'); if (rew) { rew.className = 'btn'; document.querySelector('#side .side__body').appendChild(rew); }
    CM.lobby.attachLegacy();
  }
  function failed(e) {
    console.error(e); CM.gameUI.setLoading(false);
    var msg = 'This mode failed to load.';
    if (navigator.onLine === false) msg = 'This mode needs a connection for its engine. Check your connection and try again.';
    else if (e && /fetch|load|script|network/i.test(String(e.message || e))) msg += ' Check your connection and try again.';
    CM.gameUI.toast(msg);
  }

  function swap(from, to, done) {
    var a = $(from), b = $(to), ms = CM.settings.reducedMotion() ? 0 : 200;
    a.classList.add('is-leaving');
    setTimeout(function () { a.hidden = true; a.classList.remove('is-leaving'); b.hidden = false; b.classList.remove('view'); void b.offsetWidth; b.classList.add('view'); if (done) done(); }, ms);
  }
  app.showLobby = function (fromHash) {
    if (app.view === 'lobby') return;
    app.view = 'lobby'; app.seq++;
    var ctrl = CM.gameUI.controller; if (ctrl && ctrl.detach) ctrl.detach(); CM.gameUI.controller = null;
    CM.gameUI.hideOver(); CM.settingsPanel.close(); CM.sound.stopAll(); CM.gameUI.vfx.reset();
    document.title = 'Chess Master';
    var y = app.lobbyY;
    swap('view-game', 'view-lobby', function () { window.scrollTo(0, y); requestAnimationFrame(function () { window.scrollTo(0, y); }); });
    /* QA: the in-app back button pops the history entry the game pushed, so browser back/forward stay in step */
    if (!fromHash && /^#\/play\//.test(location.hash)) { if (app.pushed) history.back(); else history.replaceState(null, '', '#/'); }
    app.pushed = false;
  };
  function enterGame(id, fromHash) {
    if (!fromHash) { if (app.view === 'lobby') { history.pushState(null, '', '#/play/' + encodeURIComponent(id)); app.pushed = true; } else history.replaceState(null, '', '#/play/' + encodeURIComponent(id)); }
    if (app.view === 'lobby') app.lobbyY = window.scrollY;
    var first = app.view !== 'game';
    /* pol-ui2: skeleton board + the video's title while the mode bundle loads (no stale previous game, no blank screen) */
    var lv = CM.lobby.byId[id]; CM.gameUI.setLoading(true, lv ? lv.title : '', lv ? lv.cat : '');
    app.view = 'game'; var seq = ++app.seq;
    return new Promise(function (res) {
      if (first) swap('view-lobby', 'view-game', function () { window.scrollTo(0, 0); res(seq); });
      else res(seq);
    });
  }
  /* open a video by YouTube id */
  app.openVideo = function (id, fromHash) {
    var v = CM.lobby.byId[id];
    if (!v) { if ((CM.DATA.modeIndex || {})[id]) return app.openMode(id, fromHash); return app.showLobby(); }
    if (v.remastered) return app.openMode(id, fromHash);
    var pl = app.ensure('legacy');
    enterGame(id, fromHash).then(function (seq) {
      return pl.then(function () {
        if (seq !== app.seq || !v.legacy || !v.legacy.mode) return;
        CM.legacyGame.start(v.legacy);
      });
    }).catch(failed);
  };
  /* open a remastered mode file (data/modes/<id>.js) */
  app.openMode = function (id, fromHash) {
    var p = app.ensure('game').then(function () { return CM.spec.load(id); });
    enterGame(id, fromHash).then(function (seq) {
      return p.then(function (raw) {
        if (seq !== app.seq) return;
        if (!raw) {
          var v = CM.lobby.byId[id];
          if (v && v.hasLegacy) return app.ensure('legacy').then(function () { if (seq === app.seq && v.legacy && v.legacy.mode) CM.legacyGame.start(v.legacy); });
          CM.gameUI.toast('That mode is not available yet.');
          return app.showLobby();
        }
        /* loader-v3: the loading screen stays up while the mode's art + sounds load (CM.loader.wait, capped) */
        if (CM.loader) CM.loader.wait(CM.loader.preload(raw), 5000);
        var spec = CM.spec.normalize(raw), video = CM.lobby.byId[id] || null;
        if (!spec.title && video) spec.title = video.rawTitle;
        if (!spec.category && video) spec.category = video.cat;
        if (spec.frame === 'game') {
          var gf = new CM.GameFrame(spec, video);
          return gf.loadModule().then(function () { if (seq === app.seq) gf.start(); });
        }
        return CM.spec.loadHooks(spec).then(function (hooks) {
          if (seq !== app.seq) return;
          var g = new CM.SpecGame(spec, video, hooks); app.current = g;
          if (CM.loader) CM.loader.wait(warmEngine(g), 2500);   /* before start(): start() attaches the UI, which asks the loader to hide */
          g.start();
        });
      });
    }).catch(failed);
  };
  /* loader-v3 (owner 12:27 PM ET): warm the bot engine this mode will use while the loading screen is up, so the first
     bot move does not stall: Stockfish / Fairy-Stockfish workers load + 'isready', Maia's net downloads, and the JS
     search gets its hot paths compiled. Resolves when ready, failed or after the caller's cap (never throws). */
  function warmEngine(g) {
    return new Promise(function (res) {
      try {
        var spec = g.spec || {}, opp = g.opponent || spec.opponent || {};
        var cfg = Object.assign({}, spec.bot, opp.elo != null ? { elo: opp.elo } : {});
        var st = g.state || (g.V && CM.spec.initialState(g.V, spec));
        var plan = CM.bot && g.V && st ? CM.bot.engineFor(g.V, st, cfg, g.hooks, g.ctx || { spec: spec }) : null;
        var poll = function (stateFn) { var t0 = Date.now(); (function p() { var s0 = stateFn(); if (s0 === 'ready' || s0 === 'failed' || Date.now() - t0 > 4000) res(); else setTimeout(p, 100); })(); };
        if (plan && plan.engine === 'stockfish' && CM.stockfish) { CM.stockfish.warm(plan.version); poll(function () { return CM.stockfish.state(plan.version); }); return; }
        if (plan && plan.engine === 'fairy' && CM.fairy) { CM.fairy.warm(); poll(function () { return CM.fairy.state(); }); return; }
        if (plan && plan.engine === 'maia' && CM.maia) { CM.maia.warm(plan.elo); poll(function () { var s0 = CM.maia.state(); return s0 === 'idle' ? 'ready' : s0; }); return; }
        /* JS search (most variants): a few plies of move generation now instead of on the bot's first turn */
        if (g.V && st) { var L = g.V.legal(st); for (var i = 0; i < L.length && i < 12; i++) if (L[i].n) g.V.legal(L[i].n); }
      } catch (e) { /* warming is best-effort */ }
      res();
    });
  }
  /* old deep links to modes that were renamed once their video came out */
  var ALIAS = { 'icm-scp4975': 'HuZlhHnES7M' };
  /* m-og: short links. #/<slug> and #/play/<slug> open the mode with that slug (data/slugs.js, tools/build-share.mjs);
     the URL is then rewritten to the canonical #/play/<id>, so old #/play/<id> links and every QA tool keep working. */
  var SLUGS = (window.CM_DATA && window.CM_DATA.slugs) || {}, BYSLUG = {};
  Object.keys(SLUGS).forEach(function (k) { BYSLUG[SLUGS[k]] = k; });
  app.slugOf = function (id) { return SLUGS[id] || null; };
  /* the link the share button hands out: <site>/play/<slug>/ (a static page with this mode's preview), else the hash link */
  app.shareUrl = function (id) {
    var root = location.href.replace(/[#?].*$/, '').replace(/index\.html$/, '');
    return SLUGS[id] && /^https?:/.test(location.protocol) ? root + 'play/' + SLUGS[id] + '/' : root + '#/play/' + encodeURIComponent(id);
  };
  function route() {
    var m = /^#\/play\/(.+)$/.exec(location.hash), id = m && decodeURIComponent(m[1]);
    if (!m) { var sm = /^#\/([a-z0-9-]+)\/?$/.exec(location.hash); if (sm && BYSLUG[sm[1]]) { m = sm; id = sm[1]; } }
    if (id && !ALIAS[id] && BYSLUG[id] && !SLUGS[id]) id = BYSLUG[id];
    if (id && ALIAS[id]) id = ALIAS[id];
    if (m && location.hash !== '#/play/' + encodeURIComponent(id)) history.replaceState(null, '', '#/play/' + encodeURIComponent(id));
    if (m) app.openVideo(id, true); else app.showLobby(true);
  }
  function boot() {
    CM.settings.apply();
    CM.gameUI.init(); CM.settingsPanel.init(); CM.lobby.init();
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';  /* QA: we restore the lobby scroll ourselves */
    window.addEventListener('popstate', route);
    if (/^#\/play\//.test(location.hash) || /^#\/[a-z0-9-]+\/?$/.test(location.hash)) route();
    /* pol-perf: warm the game bundle once the lobby is up and the page is idle, so the first open stays instant */
    var warm = function () { (window.requestIdleCallback || function (f) { setTimeout(f, 300); })(function () { app.ensure('game').catch(function () { }); }, { timeout: 4000 }); };
    if (document.readyState === 'complete') setTimeout(warm, 500); else window.addEventListener('load', function () { setTimeout(warm, 500); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
