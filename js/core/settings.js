/* User settings (board theme, piece set, sound, motion, ...) persisted to localStorage. */
(function () {
  'use strict';
  var CM = window.CM;

  var BOARDS = {
    green: { name: 'Green', light: '#ebecd0', dark: '#739552' },
    brown: { name: 'Brown', light: '#f0d9b5', dark: '#b58863' },
    classic: { name: 'Classic', light: '#eacfac', dark: '#aa7a5b' },
    blue: { name: 'Blue', light: '#dee3e6', dark: '#8ca2ad' },
    wood: { name: 'Wood', light: '#e7c491', dark: '#b07b4c', lightImg: 'assets/boards/wood-light.jpg', darkImg: 'assets/boards/wood-dark.jpg' },
    slate: { name: 'Dark', light: '#9da3a8', dark: '#4f565c' },
    purple: { name: 'Purple', light: '#e6dff0', dark: '#8a76b0' },
    ice: { name: 'Ice', light: '#e4eef3', dark: '#7da2b9' },
    olive: { name: 'Olive', light: '#e3e1c8', dark: '#8a8a5c' },
    coral: { name: 'Coral', light: '#f1e2d6', dark: '#c4806a' }
  };
  /* open-licensed piece sets (see assets/pieces/LICENSES.md) */
  var PIECES = {
    staunty: { name: 'Staunty', license: 'CC BY-NC-SA 4.0' },   /* default: the set iwantcheckmate.com uses (lichess "staunty" by sadsnake1) */
    cburnett: { name: 'Classic (cburnett)', license: 'GPLv2+' },
    merida: { name: 'Merida', license: 'GPLv2+' },
    chessnut: { name: 'Chessnut', license: 'Apache-2.0' },
    fantasy: { name: 'Fantasy', license: 'MIT' },
    celtic: { name: 'Celtic', license: 'MIT' },
    spatial: { name: 'Spatial', license: 'MIT' },
    mpchess: { name: 'MPChess', license: 'GPLv3+' }
  };
  var DEFAULTS = {
    board: 'green', pieces: 'staunty', sound: true, volume: 0.8, coords: 'inside', anim: 'normal',
    legalDots: true, lastMove: true, premoves: true, modeTheme: true, motion: 'system', autoQueen: false, clock: 'none'
  };
  var data = Object.assign({}, DEFAULTS, CM.store.get('settings', {}));
  /* default set changed cburnett -> staunty (2026-11-25). Saved settings carry pieces:'cburnett' even for players who never
     picked a set (set() stores the whole object), so move them over unless they chose a set themselves (piecesPicked). */
  if (data.pieces === 'cburnett' && !data.piecesPicked) data.pieces = DEFAULTS.pieces;
  if (!BOARDS[data.board]) data.board = DEFAULTS.board;
  if (!PIECES[data.pieces]) data.pieces = DEFAULTS.pieces;

  var S = CM.settings = {
    BOARDS: BOARDS, PIECES: PIECES, DEFAULTS: DEFAULTS,
    get: function (k) { return data[k]; },
    all: function () { return Object.assign({}, data); },
    set: function (k, v) { data[k] = v; if (k === 'pieces') data.piecesPicked = true; CM.store.set('settings', data); S.apply(); CM.bus.emit('settings', k, v); },
    reducedMotion: function () {
      if (data.motion === 'reduce') return true; if (data.motion === 'full') return false;
      return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    },
    animMs: function () { if (S.reducedMotion() || data.anim === 'off') return 0; return { fast: 140, normal: 200, slow: 300 }[data.anim] || 200; },
    pieceUrl: function (color, type, set) { var st = set || data.pieces; return 'assets/pieces/' + st + '/' + color + type + (st === 'staunton3d' ? '.png' : '.svg'); },   /* staunton3d: pre-rendered PNG sprites (3D Glasses mode) */
    /* write CSS variables for the active board theme; a mode may override via CM.settings.applyBoard(theme) */
    apply: function () {
      var root = document.documentElement;
      root.dataset.coords = data.coords;
      root.classList.toggle('reduce-motion', S.reducedMotion());
      root.style.setProperty('--anim-ms', S.animMs() + 'ms');
      S.applyBoard(null);
    },
    applyBoard: function (override) {
      var t = BOARDS[data.board], root = document.documentElement, o = override && data.modeTheme ? override : null;
      var light = (o && o.light) || t.light, dark = (o && o.dark) || t.dark;
      root.style.setProperty('--sq-light', light);
      root.style.setProperty('--sq-dark', dark);
      var cu = CM.util.cssUrl;
      var li = o && (o.light || o.dark) ? cu(o.lightImg) : cu(t.lightImg);
      var di = o && (o.light || o.dark) ? cu(o.darkImg) : cu(t.darkImg);
      root.style.setProperty('--sq-light-img', li);
      root.style.setProperty('--sq-dark-img', di);
    }
  };
  if (window.matchMedia) {
    var mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.addEventListener) mq.addEventListener('change', function () { S.apply(); });
  }
})();
