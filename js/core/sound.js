/* Sound: pooled HTMLAudio (works on file:// where fetch/decodeAudioData cannot load local files).
   Every sound is our own, synthesised from scratch by tools/sfx/make_sfx.py (python3 + numpy/scipy + ffmpeg):
   board sounds and victory / defeat / draw stings as assets/sounds/<name>.mp3, tick / jumpscare / explosion as
   .wav, and mode effects as assets/modes/<id>/<name>.wav. Re-run the script to regenerate all of them.
   A mode may register more:
     CM.sound.register('scream', 'assets/modes/<id>/scream.wav')
   or pass a URL directly to CM.sound.play(). */
(function () {
  'use strict';
  var CM = window.CM;
  var BASE = 'assets/sounds/';
  var CORE = ['move-self', 'move-opponent', 'capture', 'castle', 'move-check', 'promote', 'game-start', 'game-end',
    'illegal', 'notify', 'premove', 'tenseconds', 'victory', 'defeat', 'draw'];
  var OWN = ['tick', 'jumpscare', 'explosion'];
  var NAMES = CORE.concat(OWN);
  var ALIAS = { move: 'move-self', check: 'move-check', start: 'game-start', end: 'game-end', scream: 'jumpscare', boom: 'explosion' };
  var map = {}, pools = {}, unlocked = false;
  CORE.forEach(function (n) { map[n] = BASE + n + '.mp3'; });
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
    S.preload(CORE);
  }
  document.addEventListener('pointerdown', unlock, true); document.addEventListener('keydown', unlock, true);
})();
