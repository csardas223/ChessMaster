/* Options sheet: board theme, piece set and play preferences. Opened from the lobby gear and the game's Options button. */
(function () {
  'use strict';
  var CM = window.CM, U = CM.util, $ = U.$;
  var S = CM.settings, lastFocus = null;

  function swatchBoard(k, t) {
    var li = t.lightImg ? 'url(' + t.lightImg + ')' : 'none', di = t.darkImg ? 'url(' + t.darkImg + ')' : 'none';
    var a = 'background:' + t.light + ' ' + li + ' center/cover', b = 'background:' + t.dark + ' ' + di + ' center/cover';
    return '<button type="button" class="swatch" role="radio" data-board="' + k + '" aria-checked="' + (S.get('board') === k) + '"><span class="swatch__b"><i style="' + a + '"></i><i style="' + b + '"></i><i style="' + b + '"></i><i style="' + a + '"></i></span><span>' + U.esc(t.name) + '</span></button>';
  }
  function swatchPieces(k, t) {
    return '<button type="button" class="swatch" role="radio" data-pieces="' + k + '" aria-checked="' + (S.get('pieces') === k) + '"><span class="pieceset"><img src="' + S.pieceUrl('w', 'N', k) + '" alt=""><img src="' + S.pieceUrl('b', 'Q', k) + '" alt=""><img src="' + S.pieceUrl('w', 'K', k) + '" alt=""></span><span>' + U.esc(t.name) + '</span></button>';
  }
  function toggle(key, label) { return '<div class="opt-row"><label for="opt-' + key + '">' + label + '</label><input class="switch" type="checkbox" id="opt-' + key + '" data-toggle="' + key + '"' + (S.get(key) ? ' checked' : '') + '></div>'; }
  function select(key, label, opts) {
    return '<div class="opt-row"><label for="opt-' + key + '">' + label + '</label><select id="opt-' + key + '" data-select="' + key + '">' +
      opts.map(function (o) { return '<option value="' + o[0] + '"' + (String(S.get(key)) === o[0] ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') + '</select></div>';
  }
  function build() {
    var B = S.BOARDS, Pc = S.PIECES;
    $('settings-body').innerHTML =
      '<div class="opt-sec"><h3>Board</h3><div class="swatches" role="radiogroup" aria-label="Board theme">' + Object.keys(B).map(function (k) { return swatchBoard(k, B[k]); }).join('') + '</div></div>' +
      '<div class="opt-sec"><h3>Pieces</h3><div class="swatches swatches--pieces" role="radiogroup" aria-label="Piece set">' + Object.keys(Pc).map(function (k) { return swatchPieces(k, Pc[k]); }).join('') + '</div></div>' +
      '<div class="opt-sec"><h3>Play</h3></div>' +
      '<div class="opt-list">' +
      toggle('sound', 'Sound') +
      toggle('modeTheme', 'Use each mode\'s own board look') +
      select('coords', 'Coordinates', [['inside', 'Inside the board'], ['off', 'Hidden']]) +
      toggle('legalDots', 'Show legal moves') +
      toggle('lastMove', 'Highlight last move') +
      select('anim', 'Piece animation', [['fast', 'Fast'], ['normal', 'Normal'], ['slow', 'Slow'], ['off', 'None']]) +
      select('motion', 'Screen motion', [['system', 'Follow system setting'], ['reduce', 'Reduced'], ['full', 'Full']]) +
      toggle('premoves', 'Premoves') +
      toggle('autoQueen', 'Always promote to queen') +
      '</div>';
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
      var b = e.target.closest('[data-board]'); if (b) { S.set('board', b.dataset.board); U.qsa('[data-board]', s).forEach(function (x) { x.setAttribute('aria-checked', x === b); }); return; }
      var p = e.target.closest('[data-pieces]'); if (p) { S.set('pieces', p.dataset.pieces); U.qsa('[data-pieces]', s).forEach(function (x) { x.setAttribute('aria-checked', x === p); }); }
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
