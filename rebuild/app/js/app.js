/* App shell: boot, hash routing (#/ lobby, #/play/<id> game), screen crossfades, and dispatch of a video to
   its controller: SpecGame (data-driven chess modes), GameFrame (video-game frame) or the legacy port. */
(function () {
  'use strict';
  var CM = window.CM, U = CM.util, $ = U.$;
  var app = CM.app = { view: 'lobby', current: null, lobbyY: 0, seq: 0 };

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
    swap('view-game', 'view-lobby', function () { window.scrollTo(0, app.lobbyY); });
    if (!fromHash && /^#\/play\//.test(location.hash)) history.pushState(null, '', '#/');
  };
  function enterGame(id, fromHash) {
    if (!fromHash) history.pushState(null, '', '#/play/' + encodeURIComponent(id));
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
    enterGame(id, fromHash).then(function (seq) {
      if (seq !== app.seq || !v.legacy || !v.legacy.mode) return;
      CM.legacyGame.start(v.legacy);
    });
  };
  /* open a remastered mode file (data/modes/<id>.js) */
  app.openMode = function (id, fromHash) {
    var p = CM.spec.load(id);
    enterGame(id, fromHash).then(function (seq) {
      return p.then(function (raw) {
        if (seq !== app.seq) return;
        if (!raw) { var v = CM.lobby.byId[id]; if (v && v.legacy && v.legacy.mode) return CM.legacyGame.start(v.legacy); return app.showLobby(); }
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
    }).catch(function (e) { console.error(e); CM.gameUI.toast('This mode failed to load.'); });
  };
  function route() {
    var m = /^#\/play\/(.+)$/.exec(location.hash);
    if (m) app.openVideo(decodeURIComponent(m[1]), true); else app.showLobby(true);
  }
  function boot() {
    CM.settings.apply();
    CM.gameUI.init(); CM.settingsPanel.init(); CM.lobby.init();
    /* legacy renderer runs through modes_extra.js's wrapper; add our chrome fix-ups after it */
    if (typeof render === 'function') { var r0 = render; render = function () { r0.apply(this, arguments); CM.legacyGame.afterRender(); }; }
    var rew = $('xrew'); if (rew) { rew.className = 'btn'; document.querySelector('#side .side__body').appendChild(rew); }
    window.addEventListener('popstate', route);
    if (/^#\/play\//.test(location.hash)) route();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
