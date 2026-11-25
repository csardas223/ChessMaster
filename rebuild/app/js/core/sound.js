/* Sound: pooled HTMLAudio (works on file:// where fetch/decodeAudioData cannot load local files).
   Core board sounds are chess.com's default sound set (OWNER 2026-11-24 11:41 PM ET), shipped as
   assets/sounds/<name>.mp3 from images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/<name>.mp3.
   tick / jumpscare / explosion stay our own synthesised WAVs (tools/make_sounds.py). Mode effect sounds are
   our own too. A mode may register more:
     CM.sound.register('scream', 'assets/modes/<id>/scream.wav')
   or pass a URL directly to CM.sound.play(). */
(function () {
  'use strict';
  var CM = window.CM;
  var BASE = 'assets/sounds/';
  var CHESSCOM = ['move-self', 'move-opponent', 'capture', 'castle', 'move-check', 'promote', 'game-start', 'game-end',
    'illegal', 'notify', 'premove', 'tenseconds'];
  var OWN = ['tick', 'jumpscare', 'explosion'];
  var NAMES = CHESSCOM.concat(OWN);
  var ALIAS = { move: 'move-self', check: 'move-check', start: 'game-start', end: 'game-end', scream: 'jumpscare', boom: 'explosion' };
  var map = {}, pools = {}, unlocked = false;
  CHESSCOM.forEach(function (n) { map[n] = BASE + n + '.mp3'; });
  OWN.forEach(function (n) { map[n] = BASE + n + '.wav'; });

  function url(name) { if (!name) return null; name = ALIAS[name] || name; return map[name] || (/[./]/.test(name) ? name : null); }
  function pool(u) {
    var p = pools[u];
    if (!p) { p = pools[u] = []; for (var i = 0; i < 3; i++) { var a = new Audio(u); a.preload = 'auto'; p.push(a); } }
    return p;
  }
  var S = CM.sound = {
    enabled: function () { return CM.settings ? CM.settings.get('sound') : true; },
    volume: function () { return CM.settings ? CM.settings.get('volume') : 0.8; },
    register: function (name, u) { map[name] = u; },
    preload: function (names) { (names || NAMES).forEach(function (n) { var u = url(n); if (u) pool(u); }); },
    play: function (name, opts) {
      if (!S.enabled()) return;
      var u = url(name); if (!u) return;
      var p = pool(u), a = p.find(function (x) { return x.paused || x.ended; }) || p[0];
      try {
        a.currentTime = 0; a.volume = Math.max(0, Math.min(1, S.volume() * ((opts && opts.volume) || 1)));
        var r = a.play(); if (r && r.catch) r.catch(function () { /* autoplay blocked until first gesture */ });
      } catch (e) { /* ignore */ }
    },
    stopAll: function () { Object.keys(pools).forEach(function (k) { pools[k].forEach(function (a) { try { a.pause(); } catch (e) { } }); }); }
  };
  /* browsers require a gesture before audio; prime the common pools on the first one */
  function unlock() {
    if (unlocked) return; unlocked = true;
    document.removeEventListener('pointerdown', unlock, true); document.removeEventListener('keydown', unlock, true);
    S.preload(['move-self', 'move-opponent', 'capture', 'castle', 'move-check', 'promote', 'game-start', 'game-end', 'illegal', 'notify', 'premove', 'tenseconds']);
  }
  document.addEventListener('pointerdown', unlock, true); document.addEventListener('keydown', unlock, true);
})();
