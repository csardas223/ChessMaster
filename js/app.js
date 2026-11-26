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
      'js/engine/events.js', 'data/bot_engines.js', 'js/bot/stockfish.js', 'js/bot/maia.js', 'js/bot/bot.js', 'js/fx/scene3d.js', 'js/game/spec-game.js', 'js/game/game-frame.js'],
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
    console.error(e);
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
        var spec = CM.spec.normalize(raw), video = CM.lobby.byId[id] || null;
        if (!spec.title && video) spec.title = video.rawTitle;
        if (!spec.category && video) spec.category = video.cat;
        if (spec.frame === 'game') {
          var gf = new CM.GameFrame(spec, video);
          return gf.loadModule().then(function () { if (seq === app.seq) gf.start(); });
        }
        return CM.spec.loadHooks(spec).then(function (hooks) {
          if (seq !== app.seq) return;
          var g = new CM.SpecGame(spec, video, hooks); app.current = g; g.start();
        });
      });
    }).catch(failed);
  };
  function route() {
    var m = /^#\/play\/(.+)$/.exec(location.hash);
    if (m) app.openVideo(decodeURIComponent(m[1]), true); else app.showLobby(true);
  }
  function boot() {
    CM.settings.apply();
    CM.gameUI.init(); CM.settingsPanel.init(); CM.lobby.init();
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';  /* QA: we restore the lobby scroll ourselves */
    window.addEventListener('popstate', route);
    if (/^#\/play\//.test(location.hash)) route();
    /* pol-perf: warm the game bundle once the lobby is up and the page is idle, so the first open stays instant */
    var warm = function () { (window.requestIdleCallback || function (f) { setTimeout(f, 300); })(function () { app.ensure('game').catch(function () { }); }, { timeout: 4000 }); };
    if (document.readyState === 'complete') setTimeout(warm, 500); else window.addEventListener('load', function () { setTimeout(warm, 500); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
