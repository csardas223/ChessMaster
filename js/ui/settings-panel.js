/* Options sheet: board theme, piece set and play preferences. Opened from the lobby gear and the game's Options button. */
(function () {
  'use strict';
  var CM = window.CM, U = CM.util, $ = U.$;
  var S = CM.settings, lastFocus = null;

  function swatchBoard(k, t) {
    var li = t.lightImg ? 'url(' + t.lightImg + ')' : 'none', di = t.darkImg ? 'url(' + t.darkImg + ')' : 'none';
    var a = 'background:' + t.light + ' ' + li + ' center/cover', b = 'background:' + t.dark + ' ' + di + ' center/cover';
    return '<button type="button" class="swatch" role="radio" data-board="' + k + '" aria-checked="' + (S.get('board') === k) + '"><span class="swatch__b"' + (t.frame ? ' style="border:2px solid ' + t.frame + '"' : '') + '><i style="' + a + '"></i><i style="' + b + '"></i><i style="' + b + '"></i><i style="' + a + '"></i></span><span>' + U.esc(t.name) + '</span></button>';
  }
  function swatchPieces(k, t) {
    return '<button type="button" class="swatch" role="radio" data-pieces="' + k + '" aria-checked="' + (S.get('pieces') === k) + '"><span class="pieceset"><img src="' + S.pieceUrl('w', 'N', k) + '" alt=""><img src="' + S.pieceUrl('b', 'Q', k) + '" alt=""><img src="' + S.pieceUrl('w', 'K', k) + '" alt=""></span><span>' + U.esc(t.name) + '</span></button>';
  }
  /* m3-themes: live preview strip = the chosen board + piece set with last-move, selection, legal dots, a capture ring and
     check drawn with the real board classes, so the highlight colours can be judged before playing. Its own CSS variables
     (not the root ones) so a mode's own board look on the page underneath does not leak into the preview. */
  var PV = [['bR', 0], ['bN', 0], ['', 'last'], ['bQ', 'cap'], ['bK', 'check'], ['', 'last'],
    ['wP', 'sel'], ['', 'dot'], ['', 'dot'], ['wN', 0], ['wQ', 0], ['wK', 0]];
  function previewVars(frame) {
    var t = S.BOARDS[S.get('board')] || S.BOARDS[S.DEFAULTS.board], cu = U.cssUrl || function (u) { return u ? 'url(' + u + ')' : 'none'; };
    return '--sq-light:' + t.light + ';--sq-dark:' + t.dark + ';--sq-light-img:' + cu(t.lightImg) + ';--sq-dark-img:' + cu(t.darkImg) +
      ';--hl-last:' + (t.hl || 'rgba(255, 255, 51, 0.5)') + ';--dot:' + (t.dot || 'rgba(0, 0, 0, 0.14)') +
      (frame && t.frame ? ';box-shadow:0 0 0 3px ' + t.frame : '');   /* framed board (Duolingo): preview strip only, not the piece grid */
  }
  function previewHtml() {
    return PV.map(function (c, i) {
      var r = Math.floor(i / 6), f = i % 6, cls = 'sq ' + ((r + f) % 2 ? 'is-dark' : 'is-light');
      if (c[1] === 'last') cls += ' is-last'; if (c[1] === 'sel') cls += ' is-sel'; if (c[1] === 'dot') cls += ' is-target';
      if (c[1] === 'cap') cls += ' is-target-cap'; if (c[1] === 'check') cls += ' is-check';
      return '<span class="' + cls + '">' + (c[0] ? '<img src="' + S.pieceUrl(c[0][0], c[0][1]) + '" alt="">' : '') + '</span>';
    }).join('');
  }
  function refreshPreview() {
    var el = $('skin-preview'); if (!el) return;
    el.setAttribute('style', previewVars(true)); el.innerHTML = previewHtml();
    var sw = $('settings-body').querySelector('.swatches--pieces'); if (sw) sw.setAttribute('style', previewVars());
    var lab = $('skin-preview-cap'), b = S.BOARDS[S.get('board')], pc = S.PIECES[S.get('pieces')];
    if (lab && b && pc) lab.textContent = b.name + ' board · ' + pc.name + ' pieces (' + pc.license + ')';
  }
  function toggle(key, label) { return '<div class="opt-row"><label for="opt-' + key + '">' + label + '</label><input class="switch" type="checkbox" id="opt-' + key + '" data-toggle="' + key + '"' + (S.get(key) ? ' checked' : '') + '></div>'; }
  function select(key, label, opts) {
    return '<div class="opt-row"><label for="opt-' + key + '">' + label + '</label><select id="opt-' + key + '" data-select="' + key + '">' +
      opts.map(function (o) { return '<option value="' + o[0] + '"' + (String(S.get(key)) === o[0] ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') + '</select></div>';
  }
  /* options of the mode being played (only shown in that mode) */
  function modeOptions() {
    var c = CM.gameUI && CM.gameUI.controller, pr = c && c.spec && c.spec.params;
    if (!pr || pr.pick !== 'mirror' || (CM.app && CM.app.view === 'lobby')) return '';
    return '<div class="opt-sec"><h3>MirrorFish</h3></div><div class="opt-list">' +
      toggle('mqRank', 'Show move rank') + toggle('mqBadges', 'Show move quality badges') + '</div>';
  }
  function build() {
    var B = S.BOARDS, Pc = S.PIECES;
    $('settings-body').innerHTML =
      '<div class="opt-sec"><h3>Preview</h3><div class="skin-preview" id="skin-preview" aria-hidden="true"></div><p class="skin-preview__cap" id="skin-preview-cap"></p></div>' +
      '<div class="opt-sec"><h3>Board</h3><div class="swatches" role="radiogroup" aria-label="Board theme">' + Object.keys(B).map(function (k) { return swatchBoard(k, B[k]); }).join('') + '</div></div>' +
      '<div class="opt-sec"><h3>Pieces</h3><div class="swatches swatches--pieces" role="radiogroup" aria-label="Piece set">' + Object.keys(Pc).map(function (k) { return swatchPieces(k, Pc[k]); }).join('') + '</div></div>' +
      '<div class="opt-sec"><h3>Play</h3></div>' +
      '<div class="opt-list">' +
      toggle('sound', 'Sound') +
      toggle('haptics', 'Haptics') +
      toggle('modeTheme', 'Use each mode\'s own board look') +
      select('coords', 'Coordinates', [['inside', 'Inside the board'], ['off', 'Hidden']]) +
      toggle('legalDots', 'Show legal moves') +
      toggle('lastMove', 'Highlight last move') +
      select('anim', 'Piece animation', [['fast', 'Fast'], ['normal', 'Normal'], ['slow', 'Slow'], ['off', 'None']]) +
      select('motion', 'Screen motion', [['system', 'Follow system setting'], ['reduce', 'Reduced'], ['full', 'Full']]) +
      toggle('premoves', 'Premoves') +
      toggle('autoQueen', 'Always promote to queen') +
      '</div>' + modeOptions();
    refreshPreview();
  }
  function open() {
    build(); lastFocus = document.activeElement;
    var s = $('settings'); s.classList.add('is-open'); s.setAttribute('aria-hidden', 'false');
    setTimeout(function () { var b = s.querySelector('[data-close].icon-btn'); if (b) b.focus({ preventScroll: true }); }, 40);
  }
  function close() {
    var s = $('settings'); if (!s.classList.contains('is-open')) return; s.classList.remove('is-open'); s.setAttribute('aria-hidden', 'true');
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }
  function init() {
    var s = $('settings');
    s.addEventListener('click', function (e) {
      if (e.target.closest('[data-close]')) return close();
      var b = e.target.closest('[data-board]'); if (b) { S.set('board', b.dataset.board); U.qsa('[data-board]', s).forEach(function (x) { x.setAttribute('aria-checked', x === b); }); refreshPreview(); return; }
      var p = e.target.closest('[data-pieces]'); if (p) { S.set('pieces', p.dataset.pieces); U.qsa('[data-pieces]', s).forEach(function (x) { x.setAttribute('aria-checked', x === p); }); refreshPreview(); }
    });
    s.addEventListener('change', function (e) {
      var t = e.target;
      if (t.dataset.toggle) S.set(t.dataset.toggle, t.checked);
      if (t.dataset.select) S.set(t.dataset.select, t.value);
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && s.classList.contains('is-open')) close(); });
    $('open-settings').addEventListener('click', open);
  }
  CM.settingsPanel = { open: open, close: close, init: init };
})();
