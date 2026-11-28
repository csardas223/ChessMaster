/* Haptics (owner 2026-11-27, "add mobile haptics crispy"; plays on a Galaxy Z Flip6 in Android Chrome).
   CM.haptics.tap / select / move / capture / check / illegal / win / loss / draw / start / longPress -> navigator.vibrate.
   Patterns stay CRISP: single pulses of 6-12 ms (Android's floor is ~8-15 ms) and short multi-pulse figures.
   Rules:
   - Settings > Haptics (key 'haptics', default ON on touch devices, js/core/settings.js) gates everything.
   - Never before the first user gesture (Chrome blocks vibrate without sticky activation and logs an intervention).
   - Throttle: at least 40 ms between pulses; inside that window only a stronger event (higher rank) gets through,
     so a capture never swallows the checkmate's win figure, and rapid taps do not buzz.
   - iOS Safari has no Vibration API: every call is a silent no-op there.
   Wiring: js/ui/press.js (button / tap-to-start), js/ui/board-view.js (drag pick-up, long-press),
   js/game/spec-game.js (select, move, capture, check), CM.sound.play('illegal') (every illegal-move cue, all frames),
   js/ui/game-ui.js showOver (result modal, every frame). QA: tools/qa_haptics.py */
(function () {
  'use strict';
  var CM = window.CM = window.CM || {};
  var PAT = {
    tap: [8, 0], start: [10, 0], select: [6, 0], move: [12, 1], longPress: [18, 1],
    capture: [[14, 30, 18], 2], illegal: [[10, 30, 10, 30, 10], 2], check: [[20, 40, 20], 3],
    win: [[15, 60, 15, 60, 40], 4], loss: [[60], 4], draw: [[12, 50, 12], 4]
  };
  var GAP = 40, lastAt = -1e9, lastRank = -1, gestured = false;
  var can = typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';
  function onGesture() { gestured = true; }
  ['pointerdown', 'keydown', 'touchstart'].forEach(function (t) { window.addEventListener(t, onGesture, { capture: true, passive: true });   /* window capture: runs before press.js's document listener */ });
  function activated() {   /* our own flag (a real pointer / key event seen) and, where the browser exposes it, its sticky activation */
    var ua = navigator.userActivation; return gestured && (!ua || ua.hasBeenActive);
  }
  function enabled() {
    var S = CM.settings; if (!S) return true;
    var v = S.get('haptics'); return v == null ? H.touch : !!v;
  }
  function fire(name) {
    var p = PAT[name]; if (!p || !can || !enabled() || !activated()) return false;
    var now = performance.now(), rank = p[1];
    if (now - lastAt < GAP && rank <= lastRank) return false;
    lastAt = now; lastRank = rank;
    try { return navigator.vibrate(p[0]) !== false; } catch (_) { return false; }
  }
  var H = CM.haptics = {
    PATTERNS: PAT, GAP: GAP,
    touch: !!((window.matchMedia && window.matchMedia('(pointer: coarse)').matches) || 'ontouchstart' in window || navigator.maxTouchPoints > 0),
    supported: can, enabled: enabled, fire: fire,
    /* a played move: the human's own moves buzz; a bot / remote move only when it captures one of your pieces or gives check */
    fromMove: function (m, chk, cap, human) {
      var mine = m && m.c === human;
      if (chk) return fire('check');
      if (cap) return mine || (m.cap && m.cap.c === human) || !m.cap ? fire('capture') : false;
      return mine ? fire('move') : false;
    },
    result: function (res) { return fire(res === 'win' ? 'win' : res === 'loss' ? 'loss' : 'draw'); },
    _reset: function () { lastAt = -1e9; lastRank = -1; }   /* QA */
  };
  Object.keys(PAT).forEach(function (k) { H[k] = function () { return fire(k); }; });
  /* every illegal-move cue in the app goes through CM.sound.play('illegal'); buzz with it (sound on or off) */
  function wrapSound() {
    var s = CM.sound; if (!s || s._hapWrapped) return !!s;
    var play = s.play; s._hapWrapped = true;
    s.play = function (name) { if (name === 'illegal') fire('illegal'); return play.apply(this, arguments); };
    return true;
  }
  if (!wrapSound()) document.addEventListener('DOMContentLoaded', wrapSound);
})();
