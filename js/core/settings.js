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
    coral: { name: 'Coral', light: '#f1e2d6', dark: '#c4806a' },
    /* m3-themes: plain CSS colour pairs. hl = last-move/selected tint, dot = legal-move dot/ring (defaults in DEFAULT_HL/DEFAULT_DOT) */
    marble: { name: 'Marble', light: '#ecebe7', dark: '#a9a49c', dot: 'rgba(0, 0, 0, 0.2)' },
    night: { name: 'Night', light: '#8a9ab0', dark: '#34415a', hl: 'rgba(255, 214, 64, 0.55)', dot: 'rgba(255, 255, 255, 0.34)' },
    contrast: { name: 'High contrast', light: '#ffffff', dark: '#5a5a5a', hl: 'rgba(255, 196, 0, 0.7)', dot: 'rgba(0, 110, 230, 0.8)' },
    sand: { name: 'Sand', light: '#f4e7c8', dark: '#c9a66b' },
    teal: { name: 'Teal', light: '#dfeeea', dark: '#4f8c86', dot: 'rgba(0, 0, 0, 0.2)' },
    rose: { name: 'Rose', light: '#f6e3e6', dark: '#b8737f' }
  };
  var DEFAULT_HL = 'rgba(255, 255, 51, 0.5)', DEFAULT_DOT = 'rgba(0, 0, 0, 0.14)';
  /* open-licensed piece sets (see assets/pieces/LICENSES.md) */
  var PIECES = {
    staunty: { name: 'Staunty', license: 'CC BY-NC-SA 4.0' },   /* default: the set iwantcheckmate.com uses (lichess "staunty" by sadsnake1) */
    cburnett: { name: 'Classic (cburnett)', license: 'GPLv2+' },
    merida: { name: 'Merida', license: 'GPLv2+' },
    chessnut: { name: 'Chessnut', license: 'Apache-2.0' },
    fantasy: { name: 'Fantasy', license: 'MIT' },
    celtic: { name: 'Celtic', license: 'MIT' },
    spatial: { name: 'Spatial', license: 'MIT' },
    mpchess: { name: 'MPChess', license: 'GPLv3+' },
    /* m3-themes: more lichess sets (lila COPYING.md "free" table; each folder has LICENSE.txt) */
    maestro: { name: 'Maestro', license: 'CC BY-NC-SA 4.0' },
    fresca: { name: 'Fresca', license: 'CC BY-NC-SA 4.0' },
    cardinal: { name: 'Cardinal', license: 'CC BY-NC-SA 4.0' },
    icpieces: { name: 'ICPieces', license: 'CC BY-NC-SA 4.0' },
    gioco: { name: 'Gioco', license: 'CC BY-NC-SA 4.0' },
    tatiana: { name: 'Tatiana', license: 'CC BY-NC-SA 4.0' },
    dubrovny: { name: 'Dubrovny', license: 'CC BY-NC-SA 4.0' },
    california: { name: 'California', license: 'CC BY-NC-SA 4.0' },
    caliente: { name: 'Caliente', license: 'CC BY-NC-SA 4.0' },
    anarcandy: { name: 'Anarcandy', license: 'CC BY-NC-SA 4.0' },
    cooke: { name: 'Cooke', license: 'CC BY-NC-SA 4.0' },
    monarchy: { name: 'Monarchy', license: 'CC BY-NC-SA 4.0', ext: 'webp' },
    'minimal-warmth': { name: 'Minimal Warmth', license: 'CC BY-NC-SA 4.0' },
    chessboart: { name: 'ChessboArt', license: 'CC BY-NC-SA 4.0' },
    horsey: { name: 'Horsey', license: 'CC BY-NC-SA 4.0' },
    xkcd: { name: 'xkcd', license: 'CC BY-NC-SA 2.5' },
    firi: { name: 'Firi', license: 'CC BY 4.0' },
    'kiwen-suwi': { name: 'Kiwen-suwi', license: 'CC BY 4.0' },
    shapes: { name: 'Shapes', license: 'CC BY-SA 4.0' },
    rhosgfx: { name: 'RhosGFX', license: 'CC0 1.0' },
    letter: { name: 'Letter', license: 'AGPLv3+' },
    pirouetti: { name: 'Pirouetti', license: 'AGPLv3+' },
    pixel: { name: 'Pixel', license: 'AGPLv3+' }
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
    pieceUrl: function (color, type, set) { var st = set || data.pieces; var ext = st === 'staunton3d' ? 'png' : ((PIECES[st] && PIECES[st].ext) || 'svg'); return 'assets/pieces/' + st + '/' + color + type + '.' + ext; },   /* staunton3d: pre-rendered PNG sprites (3D Glasses mode) */
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
      /* highlight + dot colours follow the user's board unless a mode supplies its own squares */
      var own = o && (o.light || o.dark);
      root.style.setProperty('--hl-last', (own ? o.hl : t.hl) || DEFAULT_HL);
      root.style.setProperty('--dot', (own ? o.dot : t.dot) || DEFAULT_DOT);
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
