/* Button press for touch (owner 2026-11-27, Z Flip6): Chrome on Android paints :active only after its tap-down gesture,
   and iOS Safari not at all without a touchstart listener, so a quick tap barely showed the 3D press. This marks the
   pressed button with [data-pressed] on pointerdown and keeps it for at least 90 ms (one full press) after release;
   css/balatro.css "PRESS" styles :active and [data-pressed] the same. Purely visual: never touches clicks. */
(function () {
  'use strict';
  var SEL = '.btn:not(.btn--ghost), .feat__play, .hero__play, .rnd__play, .rnd__roll, .hype-btn, .g3-peekbtn, .view-lobby .tab, .sort, .gctl, ' +
    '.b3-ui button, #g6-3d-rot button, #g6-3d-pad button, .g6tt-bar button, .g5fps__ctl button, .g5cu-bar button, .tapstart, button.duo-node';
  var PLAIN = '#board-col, #side, .pbar, .game-controls';
  var MIN = 90, cur = null;
  function find(t) {
    if (!t || !t.closest) return null;
    var el = t.closest(SEL);
    if (!el) { var b = t.closest('button'); if (b && !b.hasAttribute('class') && b.closest(PLAIN)) el = b; }
    if (!el || el.disabled || el.getAttribute('aria-disabled') === 'true') return null;
    return el;
  }
  function clear(el) { clearTimeout(el._cmPressT); el.removeAttribute('data-pressed'); }
  function down(e) {
    if (e.button > 0 || e.isPrimary === false) return;
    if (cur) clear(cur);
    var el = find(e.target); if (!el) { cur = null; return; }
    clearTimeout(el._cmPressT); el._cmPressAt = performance.now(); el.setAttribute('data-pressed', ''); cur = el;
    if (window.CM && CM.haptics) CM.haptics[el.classList.contains('tapstart') ? 'start' : 'tap']();   /* js/ui/haptics.js */
  }
  function up() {
    var el = cur; if (!el) return; cur = null;
    var left = MIN - (performance.now() - (el._cmPressAt || 0));
    if (left > 0) el._cmPressT = setTimeout(function () { el.removeAttribute('data-pressed'); }, left); else clear(el);
  }
  function cancel() { if (cur) { clear(cur); cur = null; } }   /* the finger started a scroll, or the page lost focus */
  document.addEventListener('pointerdown', down, { capture: true, passive: true });
  document.addEventListener('pointerup', up, { capture: true, passive: true });
  document.addEventListener('pointercancel', cancel, { capture: true, passive: true });
  document.addEventListener('dragstart', cancel, true);
  window.addEventListener('blur', cancel);
  document.addEventListener('touchstart', function () {}, { passive: true });   /* lets iOS Safari apply :active */
})();
