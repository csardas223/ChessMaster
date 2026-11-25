/* GameUI: the game screen chrome shared by every controller (spec games and legacy modes):
   player cards (avatar, name, rating, captured strip + material, clock), opponent identity card,
   twist / how-to-win text, move list with SAN, status toasts, game-over card, promotion picker.
   The active controller registers itself with CM.gameUI.attach(controller); buttons call
   controller.newGame() / undo() / flip() / resign() / close(). */
(function () {
  'use strict';
  var CM = window.CM, U = CM.util, $ = U.$;
  var UI = CM.gameUI = { controller: null };
  var toastT = 0;

  UI.init = function () {
    if (UI.board) return;
    UI.board = new CM.BoardView($('board'), $('board-fx'));
    UI.vfx = new CM.VFX({ wrap: $('board-wrap'), board: $('board'), layer: $('board-fx'), screen: $('screen-fx'), view: UI.board });
    var call = function (fn) { return function () { var c = UI.controller; if (c && c[fn]) c[fn](); }; };
    $('newg').addEventListener('click', call('newGame'));
    $('gonew').addEventListener('click', call('newGame'));
    $('undo').addEventListener('click', call('undo'));
    $('flip').addEventListener('click', call('flip'));
    $('resign').addEventListener('click', call('resign'));
    $('goclose').addEventListener('click', function () { UI.hideOver(); });
    $('golobby').addEventListener('click', function () { CM.app.showLobby(); });
    $('back').addEventListener('click', function () { CM.app.showLobby(); });
    $('mute').addEventListener('click', function () { CM.settings.set('sound', !CM.settings.get('sound')); });
    CM.bus.on('settings', function () { UI.syncMute(); var c = UI.controller; if (c && c.render) c.render(); });
    UI.syncMute();
    document.addEventListener('keydown', function (e) {
      if (!UI.controller || CM.app.view !== 'game') return;
      if (e.target && /INPUT|SELECT|TEXTAREA/.test(e.target.tagName)) return;
      if (e.key === 'f' && !e.metaKey && !e.ctrlKey) { call('flip')(); }
    });
  };
  UI.syncMute = function () {
    var on = CM.settings.get('sound'), b = $('mute'); b.setAttribute('aria-pressed', on); b.setAttribute('aria-label', on ? 'Sound on' : 'Sound off'); b.classList.toggle('is-off', !on);
  };
  UI.attach = function (ctrl) {
    if (UI.controller && UI.controller !== ctrl && UI.controller.detach) UI.controller.detach();
    UI.controller = ctrl; UI.vfx.reset(); UI.vfx.setGame(ctrl); UI.hideOver(true); UI.hidePromo();
    $('status').textContent = ''; $('status').classList.remove('is-show');
    $('cntwrap').hidden = true; $('hand').innerHTML = '';
  };

  /* ---------- avatars ---------- */
  function initials(name) { var w = U.norm(name || '?').replace(/[^a-z0-9 ]/g, ' ').trim().split(/\s+/); return ((w[0] || '?')[0] + (w[1] ? w[1][0] : '')).toUpperCase(); }
  function hue(name) { var h = 0; for (var i = 0; i < (name || '').length; i++) h = (h * 31 + name.charCodeAt(i)) % 360; return h; }
  UI.avatarHTML = function (p) {
    if (p && p.avatar) return '<img src="' + U.esc(p.avatar) + '" alt="">';
    var n = (p && p.name) || '?';
    return '<span class="ava-ini" style="--h:' + hue(n) + '">' + U.esc(initials(n)) + '</span>';
  };

  UI.setTitle = function (name, cat, videoId) {
    $('mname').textContent = U.cleanTitle(name || ''); $('mcat').textContent = cat || '';
    var yt = $('ytlink'); if (videoId) { yt.href = 'https://www.youtube.com/watch?v=' + encodeURIComponent(videoId); yt.hidden = false; } else yt.hidden = true;
    document.title = U.cleanTitle(name || 'Game') + ' · Chess Master';
  };
  UI.setInfo = function (rule, how) {
    $('mrule').textContent = rule || ''; $('mhow').textContent = how || ''; $('mhow').hidden = $('howlab').hidden = !how;
  };
  /* players: { top: {name, rating, avatar}, bottom: {...} } */
  UI.setPlayers = function (pl) {
    if (pl.top) { $('botname').textContent = pl.top.name || 'Bot'; $('botrating').textContent = pl.top.rating != null && pl.top.rating !== '' ? '(' + pl.top.rating + ')' : ''; $('botava').innerHTML = UI.avatarHTML(pl.top); }
    if (pl.bottom) { $('youname').textContent = pl.bottom.name || 'You'; $('yourating').textContent = pl.bottom.rating != null && pl.bottom.rating !== '' ? '(' + pl.bottom.rating + ')' : ''; $('youava').innerHTML = UI.avatarHTML(pl.bottom); }
  };
  /* the identity card in the side panel (name, rating, tagline, large picture) */
  UI.setOpponentCard = function (o) {
    var img = $('opp-img');
    if (o.avatar) { img.src = o.avatar; img.hidden = false; $('opp').classList.remove('no-img'); } else { img.removeAttribute('src'); img.hidden = true; $('opp').classList.add('no-img'); }
    $('opp-name').textContent = o.name || 'Bot';
    $('opp-rating').textContent = o.rating != null && o.rating !== '' ? '(' + o.rating + ')' : '';
    $('opp-tag').textContent = o.tagline || '';
  };
  UI.setThinking = function (t) { $('botst').textContent = t || ''; $('card-top').classList.toggle('is-thinking', !!t); };
  UI.setActive = function (side) { $('card-top').classList.toggle('is-active', side === 'top'); $('card-bottom').classList.toggle('is-active', side === 'bottom'); };
  /* captured: arrays of image urls; adv: material lead in pawns (shown on the leading side) */
  UI.setCaptured = function (top, bottom, advTop, advBottom) {
    var h = function (list, adv) {
      var out = '', last = null;
      list.forEach(function (src) { out += '<img class="cap' + (src === last ? ' same' : '') + '" src="' + src + '" alt="">'; last = src; });
      return out + (adv > 0 ? '<span class="adv">+' + adv + '</span>' : '');
    };
    $('capb').innerHTML = h(top, advTop); $('capw').innerHTML = h(bottom, advBottom);
  };
  /* clocks: {top: ms|null, bottom: ms|null, running: 'top'|'bottom'|null} */
  UI.setClocks = function (c) {
    ['top', 'bottom'].forEach(function (s) {
      var el = $('clock-' + s), ms = c && c[s];
      if (ms == null) { el.hidden = true; return; }
      el.hidden = false; el.textContent = U.fmtClock(ms); el.classList.toggle('is-running', c.running === s); el.classList.toggle('is-low', ms < 20000);
    });
  };
  /* moves: array of strings (alternating, white first) or {san, c} objects */
  UI.setMoves = function (list, startBlack) {
    var rows = [], row = null, n = 0;
    list.forEach(function (x, k) {
      var san = typeof x === 'string' ? x : x.san, c = typeof x === 'string' ? ((k + (startBlack ? 1 : 0)) % 2 ? 'b' : 'w') : x.c;
      var m = { s: san, k: k };
      if (c === 'w') { n++; row = { n: n, w: m, b: null }; rows.push(row); }
      else if (row && row.b == null) row.b = m;
      else { n++; row = { n: n, w: null, b: m }; rows.push(row); }
    });
    var last = list.length - 1, el = $('moves');
    el.innerHTML = rows.map(function (r) {
      var cell = function (m) { return m ? '<span class="mv' + (m.k === last ? ' is-cur' : '') + '">' + U.esc(m.s) + '</span>' : '<span class="mv mv--empty">' + (r.w ? '' : '...') + '</span>'; };
      return '<div class="mrow"><span class="mn">' + r.n + '.</span>' + cell(r.w) + cell(r.b) + '</div>';
    }).join('') || '<p class="moves__empty">Make your first move.</p>';
    el.scrollTop = el.scrollHeight;
  };
  UI.toast = function (t, ms) {
    var e = $('status'); if (!t) { e.classList.remove('is-show'); return; }
    e.textContent = t; e.classList.add('is-show'); clearTimeout(toastT); toastT = setTimeout(function () { e.classList.remove('is-show'); }, ms || 3200);
  };
  UI.setUndoEnabled = function (on) { $('undo').disabled = !on; };

  /* ---------- game over ---------- */
  UI.showOver = function (o) {
    var title = o.title || (o.result === 'win' ? 'You Won!' : o.result === 'loss' ? 'You Lost' : 'Draw');
    $('gotitle').textContent = title; $('gowhy').textContent = o.why ? o.why.replace(/^./, function (x) { return x.toUpperCase(); }) + (/[.!?]$/.test(o.why) ? '' : '.') : '';
    $('go-you').innerHTML = UI.avatarHTML(o.you || { name: 'You' }); $('go-opp').innerHTML = UI.avatarHTML(o.opp || { name: 'Bot' });
    $('go-you').classList.toggle('is-winner', o.result === 'win'); $('go-opp').classList.toggle('is-winner', o.result === 'loss');
    var g = $('gover'); g.dataset.result = o.result || 'draw';
    clearTimeout(UI._goT); UI._goT = setTimeout(function () { g.classList.add('is-open'); }, o.delay == null ? 450 : o.delay);
  };
  UI.hideOver = function (instant) { clearTimeout(UI._goT); var g = $('gover'); g.classList.remove('is-open'); if (instant) g.classList.add('no-anim'), g.getBoundingClientRect(), g.classList.remove('no-anim'); };

  /* ---------- promotion picker (column above/below the target square, like most chess sites) ---------- */
  UI.promote = function (sq, options) {
    /* options: [{type, src}] ; resolves with a type or null */
    return new Promise(function (res) {
      var box = $('promo'), r = UI.board.rectOf(sq), br = $('board-wrap').getBoundingClientRect();
      if (!r) return res(options[0] && options[0].type);
      var down = r.top - br.top < br.height / 2;
      box.innerHTML = '<div class="promo__bg"></div><div class="promo__col" style="left:' + (r.left - br.left) + 'px;width:' + r.width + 'px;' + (down ? 'top:' + (r.top - br.top) + 'px' : 'bottom:' + (br.bottom - r.bottom) + 'px;flex-direction:column-reverse') + '">' +
        options.map(function (o) { return '<button type="button" data-t="' + U.esc(o.type) + '" style="height:' + r.height + 'px"><img src="' + o.src + '" alt="' + U.esc(o.type) + '"></button>'; }).join('') + '</div>';
      box.hidden = false;
      var done = function (v) { box.hidden = true; box.innerHTML = ''; res(v); };
      box.onclick = function (e) { var b = e.target.closest('[data-t]'); done(b ? b.dataset.t : null); };
    });
  };
  UI.hidePromo = function () { var b = $('promo'); b.hidden = true; b.innerHTML = ''; };
})();
