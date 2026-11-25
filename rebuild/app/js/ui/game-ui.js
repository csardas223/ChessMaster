/* GameUI: the game screen chrome shared by every controller (spec games, legacy modes, video-game frames):
   board sizing/viewport, player bars (avatar, name, rating, captured strip + material, clock, extra players),
   SAN move list (side panel) + move strip (phones), rules panel, status line, game-over modal, promotion picker,
   bottom action bar. The active controller registers with CM.gameUI.attach(controller); the action bar calls
   controller.newGame() / undo() / flip() and the lobby button calls CM.app.showLobby(). */
(function () {
  'use strict';
  var CM = window.CM, U = CM.util, $ = U.$;
  var UI = CM.gameUI = { controller: null };
  var toastT = 0;

  UI.init = function () {
    if (UI.board) return;
    UI.board = new CM.BoardView($('board'), $('board-fx'));
    UI.board.onBuild = function () { UI.layout(); };
    UI.vfx = new CM.VFX({ wrap: $('board-wrap'), board: $('board'), layer: $('board-fx'), screen: $('screen-fx'), view: UI.board });
    var call = function (fn) { return function () { var c = UI.controller; if (c && c[fn]) c[fn](); }; };
    $('newg').addEventListener('click', call('newGame'));
    $('gonew').addEventListener('click', function () { UI.hideOver(); call('newGame')(); });
    $('undo').addEventListener('click', call('undo'));
    $('flip').addEventListener('click', call('flip'));
    $('goclose').addEventListener('click', function () { UI.hideOver(); });
    $('gobg').addEventListener('click', function () { UI.hideOver(); });
    $('golobby').addEventListener('click', function () { UI.hideOver(); CM.app.showLobby(); });
    $('act-lobby').addEventListener('click', function () { CM.app.showLobby(); });
    $('act-options').addEventListener('click', function () { CM.settingsPanel.open(); });
    $('back').addEventListener('click', function () { CM.app.showLobby(); });
    $('mute').addEventListener('click', function () { CM.settings.set('sound', !CM.settings.get('sound')); });
    $('tab-moves').addEventListener('click', function () { UI.sideTab('moves'); });
    $('tab-info').addEventListener('click', function () { UI.sideTab('info'); });
    CM.bus.on('settings', function () { UI.syncMute(); var c = UI.controller; if (c && c.render) c.render({ instant: true }); });
    UI.syncMute();
    var rT = 0; window.addEventListener('resize', function () { cancelAnimationFrame(rT); rT = requestAnimationFrame(function () { UI.layout(); var c = UI.controller; if (c && c.onResize) c.onResize(); }); });
    document.addEventListener('keydown', function (e) {
      if (!UI.controller || CM.app.view !== 'game') return;
      if (e.target && /INPUT|SELECT|TEXTAREA/.test(e.target.tagName)) return;
      if (e.key === 'Escape' && $('gover').classList.contains('is-open')) { UI.hideOver(); return; }
      if (UI.controller.frame === 'game') return;   /* mini-games own the keyboard */
      if (e.key === 'f' && !e.metaKey && !e.ctrlKey) call('flip')();
      if ((e.key === 'z' && (e.metaKey || e.ctrlKey)) || e.key === 'Backspace') { e.preventDefault(); call('undo')(); }
    });
  };
  UI.sideTab = function (t) {
    $('tab-moves').setAttribute('aria-selected', t === 'moves'); $('tab-info').setAttribute('aria-selected', t === 'info');
    $('pane-moves').hidden = t !== 'moves'; $('pane-info').hidden = t !== 'info';
  };
  UI.syncMute = function () {
    var on = CM.settings.get('sound'), b = $('mute'); b.setAttribute('aria-pressed', on); b.setAttribute('aria-label', on ? 'Sound on' : 'Sound off'); b.classList.toggle('is-off', !on);
  };
  /* frame: 'chess' shows the board, 'game' shows the canvas frame */
  UI.attach = function (ctrl) {
    if (UI.controller && UI.controller !== ctrl && UI.controller.detach) UI.controller.detach();
    UI.controller = ctrl; UI.vfx.reset(); UI.vfx.setGame(ctrl); UI.hideOver(true); UI.hidePromo();
    var game = ctrl.frame === 'game';
    $('board-wrap').hidden = game; $('game-frame').hidden = !game; $('game-controls').hidden = true;
    $('status').textContent = ''; $('status').classList.remove('is-show', 'is-sticky');
    $('cntwrap').hidden = true; $('hand').innerHTML = ''; $('others').innerHTML = ''; $('capw').style.display = '';
    if ($('hand').parentNode.id === 'card-bottom') document.querySelector('#side .side__body').appendChild($('hand'));
    UI.setViewport(null); UI.setAspect(1); UI.sideTab('moves');
    $('flip').disabled = game && !ctrl.flip; $('undo').disabled = false;
  };

  /* ---------- layout: size the board (or game canvas) to the screen ---------- */
  UI.aspect = 1; UI.vp = null;
  UI.setAspect = function (a) { UI.aspect = a || 1; UI.layout(); };
  /* viewport {files, ranks, mobile:{files, ranks}} shows a window of a big board that follows the action */
  UI.setViewport = function (vp) { UI.vp = vp || null; UI.layout(); };
  UI.layout = function () {
    var view = $('view-game'); if (view.hidden) return;
    var W = window.innerWidth, H = window.innerHeight, desk = W >= 900, game = UI.controller && UI.controller.frame === 'game';
    var ctl = !$('game-controls').hidden ? $('game-controls').offsetHeight + 4 : 0;
    var availW, availH;
    if (desk) { availW = W - 360 - 16 - 48; availH = H - 48 - 52 * 2 - 24 - 20 - ctl; }
    else { availW = document.documentElement.clientWidth || W; availH = H - 48 - 32 - 52 * 2 - 20 - 56 - ctl - 6; }
    availH = Math.max(availH, desk ? 320 : Math.min(availW, 300));
    var bf = UI.board.files || 8, br = UI.board.ranks || 8, vf = bf, vr = br, vp = UI.vp;
    if (vp && !game) { var m = !desk && vp.mobile ? vp.mobile : vp; vf = Math.min(bf, m.files || bf); vr = Math.min(br, m.ranks || br); }
    var a = game ? UI.aspect : vf / vr;
    var bw = Math.min(availW, availH * a);
    if (!game) bw = Math.floor(bw / vf) * vf;
    bw = Math.max(200, Math.floor(bw)); var bh = Math.round(bw / a);
    if (!game && !vp) bh = Math.round(bw / vf * vr);
    var col = $('board-col');
    col.style.setProperty('--bw', bw + 'px');
    $('board-wrap').style.setProperty('--bh', bh + 'px'); $('board-wrap').style.height = bh + 'px';
    $('game-frame').style.height = bh + 'px';
    UI.size = { bw: bw, bh: bh, vf: vf, vr: vr, desk: desk };
    if (!game && UI.board.files) UI.board.setLayout(UI.size);
    if (UI.controller && UI.controller.onLayout) UI.controller.onLayout(UI.size);
    UI.vfx.refreshMask();
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
  function rating(r) { return r != null && r !== '' ? '(' + r + ')' : ''; }
  /* players: { top: {name, rating, avatar}, bottom: {...}, others: [{name, avatar, color, active, out}] } */
  UI.setPlayers = function (pl) {
    if (pl.top) { $('botname').textContent = pl.top.name || 'Bot'; $('botrating').textContent = rating(pl.top.rating); setAva('botava', pl.top); }
    if (pl.bottom) { $('youname').textContent = pl.bottom.name || 'You'; $('yourating').textContent = rating(pl.bottom.rating); setAva('youava', pl.bottom); }
    var o = pl.others || [];
    $('others').innerHTML = o.map(function (x) {
      return '<span class="pchip' + (x.active ? ' is-active' : '') + (x.out ? ' is-out' : '') + '"><i>' + UI.avatarHTML(x) + '</i>' + (x.swatch ? '<b style="background:' + U.esc(x.swatch) + '"></b>' : '') + U.esc(x.short || x.name || '') + '</span>';
    }).join('');
  };
  function setAva(id, p) { var el = $(id), key = (p.avatar || '') + '|' + (p.name || ''); if (el._k === key) return; el._k = key; el.innerHTML = UI.avatarHTML(p); }
  UI.setOpponentCard = function (o) {
    $('opp-img').innerHTML = UI.avatarHTML(o);
    $('opp-name').textContent = o.name || 'Bot';
    $('opp-rating').textContent = rating(o.rating);
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
    var a = h(top, advTop), b = h(bottom, advBottom);
    if ($('capb')._h !== a) { $('capb').innerHTML = a; $('capb')._h = a; }
    if ($('capw')._h !== b) { $('capw').innerHTML = b; $('capw')._h = b; }
  };
  /* clocks: {top: ms|null, bottom: ms|null, running: 'top'|'bottom'|null} */
  UI.setClocks = function (c) {
    ['top', 'bottom'].forEach(function (s) {
      var el = $('clock-' + s), ms = c && c[s];
      if (ms == null) { el.hidden = true; return; }
      el.hidden = false; el.textContent = U.fmtClock(ms); el.classList.toggle('is-running', c.running === s); el.classList.toggle('is-low', ms < 20000);
      /* chess.com 'tenseconds' warning: once when the player's (bottom) running clock drops under 10 s */
      if (s === 'bottom') {
        if (ms >= 10000) el._warned = false;
        else if (c.running === 'bottom' && ms > 0 && !el._warned) { el._warned = true; CM.sound.play('tenseconds'); }
      }
    });
  };
  /* moves: array of strings (alternating, white first) or {san, c} objects */
  UI.setMoves = function (list, startBlack) {
    var rows = [], row = null, n = 0;
    list.forEach(function (x, k) {
      var san = typeof x === 'string' ? x : x.san, c = typeof x === 'string' ? ((k + (startBlack ? 1 : 0)) % 2 ? 'b' : 'w') : x.c;
      var m = { s: san, k: k };
      if (c === 'w' || !row) { n++; row = { n: n, w: c === 'w' ? m : null, b: c === 'w' ? null : m, extra: [] }; rows.push(row); }
      else if (row.b == null) row.b = m;
      else row.extra.push(m);
    });
    var last = list.length - 1, cell = function (m, empty) { return m ? '<span class="mv' + (m.k === last ? ' is-cur' : '') + '">' + U.esc(m.s) + '</span>' : '<span class="mv mv--empty">' + (empty || '') + '</span>'; };
    var el = $('moves'), strip = $('movestrip');
    el.innerHTML = rows.map(function (r) { return '<div class="mrow"><span class="mn">' + r.n + '.</span>' + cell(r.w, r.w ? '' : '...') + cell(r.b) + r.extra.map(function (m) { return cell(m); }).join('') + '</div>'; }).join('') || '<p class="moves__empty">Make your first move.</p>';
    strip.innerHTML = rows.map(function (r) { return '<span class="mn">' + r.n + '.</span>' + (r.w ? cell(r.w) : '') + (r.b ? cell(r.b) : '') + r.extra.map(function (m) { return cell(m); }).join(''); }).join('') || '<span class="moves__empty">Make your first move.</span>';
    el.parentNode.parentNode.scrollTop = 1e6; strip.scrollLeft = strip.scrollWidth;
  };
  UI.toast = function (t, ms) {
    var e = $('status'); if (!t) { e.classList.remove('is-show'); return; }
    e.textContent = t; e.classList.add('is-show'); clearTimeout(toastT); toastT = setTimeout(function () { e.classList.remove('is-show'); }, ms || 3200);
  };
  UI.setStatus = function (t) { var e = $('status'); if (t) { e.textContent = t; e.classList.add('is-sticky'); } else e.classList.remove('is-sticky'); };
  UI.setUndoEnabled = function (on) { $('undo').disabled = !on; };

  /* ---------- game over (chess.com style modal) ---------- */
  UI.showOver = function (o) {
    var title = o.title || (o.result === 'win' ? 'You Won!' : o.result === 'loss' ? (o.lossTitle || 'You Lost') : 'Draw');
    $('gotitle').textContent = title;
    var why = o.why ? String(o.why) : '';
    $('gowhy').textContent = why ? (/^by |^on /.test(why) ? why : 'by ' + why.replace(/[.!]$/, '')) : '';
    if (o.whyRaw) $('gowhy').textContent = o.whyRaw;
    $('go-you').innerHTML = UI.avatarHTML(o.you || { name: 'You' }); $('go-opp').innerHTML = UI.avatarHTML(o.opp || { name: 'Bot' });
    $('go-youn').textContent = (o.you && o.you.name) || 'You'; $('go-oppn').textContent = (o.opp && o.opp.name) || 'Bot';
    $('go-score').textContent = o.result === 'win' ? '1 - 0' : o.result === 'loss' ? '0 - 1' : '½ - ½';
    $('go-you').classList.toggle('is-winner', o.result === 'win'); $('go-opp').classList.toggle('is-winner', o.result === 'loss');
    var g = $('gover'); g.dataset.result = o.result || 'draw';
    clearTimeout(UI._goT); UI._goT = setTimeout(function () { g.classList.add('is-open'); g.setAttribute('aria-hidden', 'false'); setTimeout(function () { $('gonew').focus({ preventScroll: true }); }, 60); }, o.delay == null ? 700 : o.delay);
  };
  UI.hideOver = function () { clearTimeout(UI._goT); var g = $('gover'); g.classList.remove('is-open'); g.setAttribute('aria-hidden', 'true'); };

  /* ---------- promotion picker (column above/below the target square) ---------- */
  UI.promote = function (sq, options) {
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
