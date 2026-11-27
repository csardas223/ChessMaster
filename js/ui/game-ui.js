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
    /* Resign (QA 2026-11-25: SpecGame.resign existed but had no button): first tap arms it ("Sure?"), second tap within 3 s resigns */
    $('resign').addEventListener('click', function () {
      var b = $('resign'), c = UI.controller; if (!c || !c.resign || c.over) return;
      if (b.classList.contains('is-armed')) { UI.disarmResign(); c.resign(); return; }
      b.classList.add('is-armed'); b.querySelector('span').textContent = 'Sure?';
      clearTimeout(UI._rsT); UI._rsT = setTimeout(UI.disarmResign, 3000);
    });
    $('goclose').addEventListener('click', function () { UI.hideOver(); });
    $('intro-play').addEventListener('click', function () { UI.hideIntro(); });
    U.qsa('[data-intro-close]', $('intro')).forEach(function (b) { b.addEventListener('click', function () { UI.hideIntro(); }); });
    $('gobg').addEventListener('click', function () { UI.hideOver(); });
    $('golobby').addEventListener('click', function () { UI.hideOver(); CM.app.showLobby(); });
    $('act-lobby').addEventListener('click', function () { CM.app.showLobby(); });
    $('act-options').addEventListener('click', function () { CM.settingsPanel.open(); });
    $('back').addEventListener('click', function () { CM.app.showLobby(); });
    $('mute').addEventListener('click', function () { CM.settings.set('sound', !CM.settings.get('sound')); });
    /* m-og: share the mode's short link (<site>/play/<slug>/, a static page with this mode's link preview) */
    var shareBtn = $('share');
    if (shareBtn) shareBtn.addEventListener('click', function () {
      var m = /^#\/play\/(.+)$/.exec(location.hash), id = (CM.app && CM.app.curId) || (m && decodeURIComponent(m[1])); if (!id) return;
      var url = CM.app && CM.app.shareUrl ? CM.app.shareUrl(id) : location.href, title = $('mname').textContent + ' \u00b7 Chess Master';
      var copy = function () {
        var done = function () { UI.toast('Link copied: ' + url.replace(/^https?:\/\//, ''), 2600); };
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(done, function () { UI.toast(url, 6000); });
        else UI.toast(url, 6000);
      };
      if (navigator.share && /Android|iPhone|iPad|Mobi/i.test(navigator.userAgent)) navigator.share({ title: title, url: url }).catch(function (e) { if (!e || e.name !== 'AbortError') copy(); });
      else copy();
    });
    $('tab-moves').addEventListener('click', function () { UI.sideTab('moves'); });
    $('tab-info').addEventListener('click', function () { UI.sideTab('info'); });
    CM.bus.on('settings', function () { UI.syncMute(); var c = UI.controller; if (c && c.render) c.render({ instant: true }); });
    UI.syncMute();
    var rT = 0; window.addEventListener('resize', function () { cancelAnimationFrame(rT); rT = requestAnimationFrame(function () { UI.layout(); var c = UI.controller; if (c && c.onResize) c.onResize(); }); });
    document.addEventListener('keydown', function (e) {
      if (!UI.controller || CM.app.view !== 'game') return;
      if (e.target && /INPUT|SELECT|TEXTAREA/.test(e.target.tagName)) return;
      if (e.key === 'Escape' && $('gover').classList.contains('is-open')) { UI.hideOver(); return; }
      if (e.key === 'Escape' && $('intro').classList.contains('is-open')) { UI.hideIntro(); return; }
      if (UI.controller.frame === 'game') return;   /* mini-games own the keyboard */
      if (e.key === 'f' && !e.metaKey && !e.ctrlKey) call('flip')();
      if ((e.key === 'z' && (e.metaKey || e.ctrlKey)) || e.key === 'Backspace') { e.preventDefault(); call('undo')(); }
    });
  };
  UI.setLoading = function (on, title, cat) {
    var v = $('view-game'); v.classList.toggle('is-loading', !!on); v.setAttribute('aria-busy', on ? 'true' : 'false');
    if (on) { try { UI.layout(); } catch (e) { console.error(e); } }   /* s6d: the skeleton sits exactly where the real board and bars will be */
    if (CM.loader) { var hu = CM.lobby && CM.lobby.catHue ? CM.lobby.catHue[cat] : null; if (on) CM.loader.show({ hue: hu != null ? hu : 30 }); else CM.loader.hide(); }  /* loader-v3: thumbnail-style loading screen, spinning 2D pawn */
    if (on) { UI.hideOver(); UI.hidePromo(); $('mname').textContent = title || ''; $('mcat').textContent = cat || ''; $('movestrip').innerHTML = ''; $('status').classList.remove('is-show', 'is-sticky'); }
  };
  UI.disarmResign = function () { var b = $('resign'); clearTimeout(UI._rsT); b.classList.remove('is-armed'); b.querySelector('span').textContent = 'Resign'; };
  UI.sideTab = function (t) {
    $('tab-moves').setAttribute('aria-selected', t === 'moves'); $('tab-info').setAttribute('aria-selected', t === 'info');
    $('pane-moves').hidden = t !== 'moves'; $('pane-info').hidden = t !== 'info';
  };
  UI.syncMute = function () {
    var on = CM.settings.get('sound'), b = $('mute'); b.setAttribute('aria-pressed', on); b.setAttribute('aria-label', on ? 'Sound on' : 'Sound off'); b.classList.toggle('is-off', !on);
  };
  /* board-level overlay (hooks.boardOverlay, e.g. the MirrorFish review badge): a layer over #board-wrap that is NOT
     inside the board viewport, so it may overhang the board edge and sits above pieces, highlights and slides.
     o = { key, html } | null; the html is rewritten only when the key changes (so a CSS pop runs once). Children are
     placed in display-square percentages of the board (left = col/files, top = row/ranks). */
  UI.setBoardOverlay = function (o) {
    var wrap = $('board-wrap'), el = $('board-ovl');
    if (!o) { if (el && el._key) { el.innerHTML = ''; el._key = ''; } return; }
    if (!el) { el = document.createElement('div'); el.id = 'board-ovl'; el.className = 'board-ovl'; el.setAttribute('aria-hidden', 'true'); wrap.appendChild(el); }
    if (el._key !== o.key) { el.innerHTML = o.html || ''; el._key = o.key; }
  };
  /* frame: 'chess' shows the board, 'game' shows the canvas frame */
  UI.attach = function (ctrl) {
    if (UI.board && UI.board.clearAnnotations) UI.board.clearAnnotations();   /* s6d: no arrows from the last game */
    UI.setBoardOverlay(null);   /* cm_mirror: no review badge from the last game */
    if (UI.controller && UI.controller !== ctrl && UI.controller.detach) UI.controller.detach();
    UI.setLoading(false); UI.hideIntro(); UI._introPending = true; UI.controller = ctrl; if (CM.family) UI.fam = CM.family.apply(CM.family.curId()); UI.vfx.reset(); UI.vfx.setGame(ctrl); UI.hideOver(true); UI.hidePromo();
    var game = ctrl.frame === 'game';
    $('board-wrap').hidden = game; $('game-frame').hidden = !game; $('game-controls').hidden = true;
    $('status').textContent = ''; $('status').classList.remove('is-show', 'is-sticky');
    $('cntwrap').hidden = true; $('hand').innerHTML = ''; $('others').innerHTML = ''; $('capw').style.display = '';
    if ($('hand').parentNode.id === 'card-bottom') document.querySelector('#side .side__body').appendChild($('hand'));
    UI.watchChrome(); UI.zoomOk = true; UI.setViewport(null); UI.setAspect(1); UI.sideTab('moves');
    $('flip').disabled = game && !ctrl.flip; $('undo').disabled = false;
    $('resign').disabled = !ctrl.resign; UI.disarmResign();
  };

  /* ---------- layout: size the board (or game canvas) to the screen ---------- */
  UI.aspect = 1; UI.vp = null;
  UI.setAspect = function (a) { UI.aspect = a || 1; UI.layout(); };
  /* viewport {files, ranks, mobile:{files, ranks}} shows a window of a big board that follows the action */
  /* ---------- board zoom opt-out ----------
     The universal zoom/pan (js/ui/board-view.js) is for boards that are simply big. Modes whose small window IS the
     gameplay keep the exact pre-zoom behaviour (fixed follow camera, no buttons, pinch, wheel, pan or minimap).
     Per mode: board.zoom = false (off) / true (on) in the mode file wins; otherwise this central default list decides. */
  UI.ZOOM_OFF = {
    'xp6Pr-rB4JA': 'Backrooms: "you can only see a small window around you" on a 30x30 maze; the window is the horror',
    'sGXmiyvZDE4': 'Petrified Pawns: real-time dungeon crawl whose camera follows the selected unit (owner: keep it unzoomable)',
    'Ji7frCIfmAQ': 'SCP Containment Breach: fog-of-war horror whose scripted camera cuts to each SCP as it acts'
  };
  UI.zoomOk = true;
  UI.zoomAllowedFor = function (spec) {
    var b = (spec && spec.board) || {};
    if (b.zoom === false) return false; if (b.zoom === true) return true;
    return !(spec && Object.prototype.hasOwnProperty.call(UI.ZOOM_OFF, spec.id));
  };
  UI.setZoomAllowed = function (on) { UI.zoomOk = on !== false; UI.layout(); };
  UI.ZOOM_ROW_H = 56; UI.ZOOM_SIDE_W = 64;   /* phone: height of the zoom row under the board / gutter needed beside it */
  UI.setViewport = function (vp) { UI.vp = vp || null; if (UI.board) UI.board.resetCam(); UI.layout(); };
  /* universal board zoom for modes and scripts: 'in' | 'out' | 'fit' (whole board) | 'reset' (default view) */
  UI.zoom = function (cmd) {
    var b = UI.board; if (!b || !b.zoomOn) return false;
    if (cmd === 'in') b.zoomBy(1.4); else if (cmd === 'out') b.zoomBy(1 / 1.4); else if (cmd === 'fit') b.zoomFit(); else b.zoomReset();
    return true;
  };
  UI.layout = function () {
    var view = $('view-game'); if (view.hidden) return;
    var W = window.innerWidth, H = window.innerHeight, desk = W >= 900, game = UI.controller && UI.controller.frame === 'game';
    /* pol-ui2: measure what really sits around the board (player bars, status, game controls, a mode's HUD row) instead
       of assuming two 52px bars, so a mode with an extra row (Ouroboros relics) is not pushed under the top bar */
    var extra = UI.chromeH(), availW, availH, tab = !desk && W >= 600;
    if (desk) { availW = W - 360 - 16 - 48; availH = H - 52 - 24 - extra; }
    else { availW = (document.documentElement.clientWidth || W) - (tab ? 32 : 0); availH = H - 52 - 58 - extra - 6; }
    /* cm_mirror: a controller may ask for a side gutter so things overhanging the board edge (MirrorFish badges on the
       right file) stay on screen on an edge-to-edge phone board */
    if (!desk && UI.controller && UI.controller.boardGutter) availW -= 2 * UI.controller.boardGutter;
    UI._extra = extra;
    /* mobile leftovers A (2026-11-26): on a short phone screen (Galaxy Z Flip cover, 360x374) the 300 px floor made the
       board taller than the band between the sticky game bar and the fixed action bar, so its top or bottom rank was
       always hidden; the floor now never exceeds that band (page still scrolls for the bars and panel) */
    availH = Math.max(availH, desk ? 320 : Math.min(availW, 300, Math.max(200, H - 52 - 58 - 6)));
    var ld = view.classList.contains('is-loading');   /* s6d: while loading, size for a standard board with the real chrome */
    var bf = ld ? 8 : (UI.board.files || 8), br = ld ? 8 : (UI.board.ranks || 8), vp = ld ? null : UI.vp;
    /* universal zoom/pan: a board bigger than 8x8 whose squares would be small (< 36px) at fit-to-screen, or that
       declares a viewport, gets the zoomable camera (pinch / drag / wheel / + - fit buttons). Standard boards don't. */
    var fitSq = Math.min(availW / bf, availH / br), legible = desk ? 30 : (bf >= 12 || br >= 12 ? 36 : 26);   /* critic 2026-11-27: 14x14 (4-player) boards were 27 px at 390; on phones they open zoomed to 36 px on the player's side (Fit shows the whole board) */   /* below this a fit-to-screen square is too small to play: start zoomed in */
    var zoomOn = UI.zoomOk && !game && !!UI.board.files && (bf > 8 || br > 8) && (!!vp || fitSq < 36);
    /* size of the board window for a given height budget (the phone zoom row below the board takes some of it) */
    var sizeFor = function (aH) {
      var fs = Math.min(availW / bf, aH / br);
      if (zoomOn && !vp) {
        var zd = fs >= legible ? Math.floor(fs) : 36;
        var zw = Math.max(200, Math.floor(Math.min(availW, bf * zd))), zh = Math.floor(Math.min(Math.max(aH, 200), br * zd));
        if (fs >= legible) { zw = zd * bf; zh = zd * br; }
        return { bw: zw, bh: zh, vf: zw / zd, vr: zh / zd, def: zd };
      }
      var f = bf, r = br;
      if (vp && !game) { var m = !desk && vp.mobile ? vp.mobile : vp; f = Math.min(bf, m.files || bf); r = Math.min(br, m.ranks || br); }
      var a = game ? UI.aspect : f / r;
      var w = Math.min(availW, aH * a);
      if (!game) w = Math.floor(w / f) * f;
      w = Math.max(200, Math.floor(w)); var h = Math.round(w / a);
      if (!game && !vp) h = Math.round(w / f * r);
      return { bw: w, bh: h, vf: f, vr: r, def: w / f };
    };
    var S = sizeFor(availH), place = null;
    if (zoomOn) {
      /* where the - / fit / + buttons go so they never cover a square: beside the board when there is a gutter
         (desktop, phone landscape), else a row under the board on touch screens, else (narrow mouse window) on the board */
      var touch = !desk || (window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
      place = (availW - S.bw) / 2 >= UI.ZOOM_SIDE_W ? 'side' : touch ? 'row' : 'overlay';
      if (place === 'row') S = sizeFor(Math.max(200, availH - UI.ZOOM_ROW_H));
    }
    UI._applySize(S.bw, S.bh, S.vf, S.vr, desk, zoomOn ? { active: true, def: S.def, place: place } : null);
  };
  UI._applySize = function (bw, bh, vf, vr, desk, zoom) {
    var game = UI.controller && UI.controller.frame === 'game';
    var col = $('board-col');
    col.style.setProperty('--bw', bw + 'px');
    $('board-wrap').style.setProperty('--bh', bh + 'px'); $('board-wrap').style.height = bh + 'px';
    $('game-frame').style.height = bh + 'px';
    $('board-wrap').classList.toggle('has-zoomrow', !!(zoom && zoom.place === 'row'));
    UI.size = { bw: bw, bh: bh, vf: vf, vr: vr, desk: desk, zoom: zoom || null };
    if (!game && UI.board.files) UI.board.setLayout(UI.size);
    if (UI.controller && UI.controller.onLayout) UI.controller.onLayout(UI.size);
    UI.vfx.refreshMask();
  };

  /* height of everything in the board column except the board itself (pbars, move strip, status, controls, mode HUDs) */
  UI.chromeH = function () {
    var col = $('board-col'), h = 0;
    for (var i = 0; i < col.children.length; i++) { var c = col.children[i]; if (c.id !== 'board-area') h += c.offsetHeight + (parseFloat(getComputedStyle(c).marginTop) || 0) + (parseFloat(getComputedStyle(c).marginBottom) || 0); }
    return Math.max(h, 52 * 2 + 20);
  };
  UI.watchChrome = function () {
    if (UI._ro || !window.ResizeObserver) return;
    /* a mode that adds or grows a HUD row after start re-fits the board once (guarded: only when the chrome height changed) */
    UI._ro = new ResizeObserver(function () { if ($('view-game').hidden || UI._extra == null) return; var e = UI.chromeH(); if (Math.abs(e - UI._extra) > 2) { cancelAnimationFrame(UI._roT); UI._roT = requestAnimationFrame(function () { UI.layout(); }); } });
    UI._ro.observe($('board-col'));
    /* ov-ui: on desktop the board column is a fixed grid cell, so it never resizes when a HUD row or the status line grows;
       watch each chrome child too (and children modes add later) so the board re-fits instead of pushing rows off-screen */
    var col = $('board-col'), watch = function (c) { if (c.id !== 'board-area' && !c._cmRo) { c._cmRo = 1; UI._ro.observe(c); } };
    Array.prototype.forEach.call(col.children, watch);
    if (window.MutationObserver) new MutationObserver(function () { Array.prototype.forEach.call(col.children, watch); }).observe(col, { childList: true });
  };

  /* ---------- avatars ---------- */
  function initials(name) { var w = U.norm(name || '?').replace(/[^a-z0-9 ]/g, ' ').trim().split(/\s+/); return ((w[0] || '?')[0] + (w[1] ? w[1][0] : '')).toUpperCase(); }
  function hue(name) { var h = 0; for (var i = 0; i < (name || '').length; i++) h = (h * 31 + name.charCodeAt(i)) % 360; return h; }
  /* cfb-ava (critic 2026-11-27: grey silhouette on 7/16 modes): a player with no art gets a calm coloured initial chip,
     like chess.com's monogram, with the persona's flag in the corner. The flag comes from p.flag (ISO-2), a trailing
     country code in the handle ("Vlad26ru"), or else a stable pick from the name. "You" and colour seats get no flag.
     A broken image (blocked host, missing file) swaps to the same chip, so no silhouette or broken icon remains. */
  var FLAGS = {   /* simple stripe flags as tiny SVGs, so they render the same on every OS (emoji flags do not on Windows) */
    fr: ['v', '#0055a4', '#fff', '#ef4135'], it: ['v', '#009246', '#fff', '#ce2b37'], ie: ['v', '#169b62', '#fff', '#ff883e'],
    be: ['v', '#000', '#fdda24', '#ef3340'], ro: ['v', '#002b7f', '#fcd116', '#ce1126'], de: ['h', '#000', '#dd0000', '#ffce00'],
    nl: ['h', '#ae1c28', '#fff', '#21468b'], ru: ['h', '#fff', '#0039a6', '#d52b1e'], at: ['h', '#ed2939', '#fff', '#ed2939'],
    hu: ['h', '#ce2939', '#fff', '#477050'], ee: ['h', '#0072ce', '#000', '#fff'], ua: ['h', '#0057b7', '#ffd700'],
    pl: ['h', '#fff', '#dc143c'], id: ['h', '#ce1126', '#fff'], lt: ['h', '#fdb913', '#006a44', '#c1272d'], bg: ['h', '#fff', '#00966e', '#d62612']
  };
  var FLAG_KEYS = Object.keys(FLAGS);
  function flagSvg(cc) {
    var f = FLAGS[cc]; if (!f) return '';
    var n = f.length - 1, r = '';
    for (var i = 0; i < n; i++) r += f[0] === 'v' ? '<rect x="' + (i * 12 / n) + '" y="0" width="' + (12 / n + 0.05) + '" height="8" fill="' + f[i + 1] + '"/>' : '<rect x="0" y="' + (i * 8 / n) + '" width="12" height="' + (8 / n + 0.05) + '" fill="' + f[i + 1] + '"/>';
    return '<svg class="ava-flag" viewBox="0 0 12 8" aria-hidden="true">' + r + '</svg>';
  }
  function flagOf(p) {
    var n = (p && p.name) || '', f = p && p.flag;
    if (f === false || !n || /^(you|white|black|red|blue|yellow|green|bot)$/i.test(n.trim())) return '';
    if (typeof f === 'string' && FLAGS[f.toLowerCase()]) return f.toLowerCase();
    var m = /[0-9_]([a-z]{2})$/.exec(n); if (m && FLAGS[m[1]]) return m[1];
    return FLAG_KEYS[hue(n + '#flag') % FLAG_KEYS.length];
  }
  UI.avatarChip = function (p) {
    var n = (p && p.name) || '?', h = hue(n), cc = flagOf(p);
    var ini = /^[^a-z]*$/i.test(n) ? initials(n) : initials(n.replace(/^[^a-z]+/i, ''));   /* '2025ramr' -> R, not 2 */
    return '<span class="ava-ini" style="--h:' + h + '" title="' + U.esc(n) + '"><b>' + U.esc(ini) + '</b>' + flagSvg(cc) + '</span>';
  };
  UI.avatarHTML = function (p) {
    if (p && p.avatar) return '<img src="' + U.esc(p.avatar) + '" alt="" data-ava-fb="' + U.esc(p.name || '') + '">';
    return UI.avatarChip(p);
  };
  /* one listener for every avatar image: error events do not bubble, so listen in the capture phase */
  document.addEventListener('error', function (e) {
    var im = e.target; if (!im || im.tagName !== 'IMG' || !im.hasAttribute('data-ava-fb')) return;
    var t = document.createElement('span'); t.innerHTML = UI.avatarChip({ name: im.getAttribute('data-ava-fb') });
    if (im.parentNode) im.parentNode.replaceChild(t.firstChild, im);
  }, true);

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
      return '<span class="pchip' + (x.active ? ' is-active' : '') + (x.out ? ' is-out' : '') + '"><i>' + UI.avatarHTML(x) + '</i>' + (x.swatch ? '<b style="background:' + U.esc(x.swatch) + '"></b>' : '') + '<span class="pchip__n">' + U.esc(x.short || x.name || '') + '</span></span>';
    }).join('');
  };
  function setAva(id, p) { var el = $(id), key = (p.avatar || '') + '|' + (p.name || ''); if (el._k === key) return; el._k = key; el.innerHTML = UI.avatarHTML(p); }
  UI.setOpponentCard = function (o) {
    /* owner 2026-11-26 2:31 PM ET: no rules card on game open; the rules live in the panel's Mode tab (How it works / How to win).
       Only the short title strip plays. UI.intro(o) stays callable but nothing opens it automatically. */
    if (UI._introPending) { UI._introPending = false; if (CM.family) CM.family.strip(CM.family.curId(), o); }
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
  UI.setMoves = function (list, startBlack, who) {
    UI._nMoves = list.length;
    /* critic 2026-11-27: 3-4 player games were laid out in 2-player triplets, so nobody could tell whose move was whose.
       With colours beyond w/b: one row per round (a round starts with the first mover's colour), every move tagged
       with its player's colour dot (name in the tooltip / aria-label). who = { colour: { name, swatch } }. */
    var multi = list.some(function (x) { return x && typeof x === 'object' && x.c && x.c !== 'w' && x.c !== 'b'; });
    if (multi) { UI._setMovesMulti(list, who || {}); return; }
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
    strip.innerHTML = rows.map(function (r) { return '<span class="mn">' + r.n + '.</span>' + (r.w ? cell(r.w) : '') + (r.b ? cell(r.b) : '') + r.extra.map(function (m) { return cell(m); }).join(''); }).join('');  /* pol-ui2: chess.com leaves the strip empty before the first move */
    el.parentNode.parentNode.scrollTop = 1e6; strip.scrollLeft = strip.scrollWidth;
  };
  UI._setMovesMulti = function (list, who) {
    var rows = [], row = null, first = list.length ? list[0].c : null, last = list.length - 1;
    list.forEach(function (x, k) { if (!row || (x.c === first && row.m.length)) { row = { n: rows.length + 1, m: [] }; rows.push(row); } row.m.push({ s: x.san, c: x.c, k: k }); });
    var cell = function (m) {
      var p = who[m.c] || {}, nm = p.name || m.c;
      return '<span class="mv mv--who' + (m.k === last ? ' is-cur' : '') + '" title="' + U.esc(nm) + '" aria-label="' + U.esc(nm + ': ' + m.s) + '"><i class="mdot" style="background:' + U.esc(p.swatch || '#888') + '"></i>' + U.esc(m.s) + '</span>';
    };
    var el = $('moves'), strip = $('movestrip');
    el.innerHTML = rows.map(function (r) { return '<div class="mrow mrow--multi"><span class="mn">' + r.n + '.</span>' + r.m.map(cell).join('') + '</div>'; }).join('') || '<p class="moves__empty">Make your first move.</p>';
    strip.innerHTML = rows.map(function (r) { return '<span class="mn">' + r.n + '.</span>' + r.m.map(cell).join(''); }).join('');
    el.parentNode.parentNode.scrollTop = 1e6; strip.scrollLeft = strip.scrollWidth;
  };
  /* s6b: before any tap on the page (a mode opened from a link) browsers block sound, so the match waits on one tap:
     a "Tap to start" plate over the board; afterwards (or where the browser can't tell) it starts at once */
  UI.tapToStart = function (go) {
    /* s6c (owner): only when the mode was opened straight from its address (reload or a link), never from the lobby */
    var stale = document.querySelector('.tapstart'); if (stale) stale.remove();
    /* t4a (owner: "sometimes when I open a game from the lobby it shows Tap to play in the loading screen"): never for a
       game the player already left, and never while the loading screen is up (wait for it to leave instead) */
    if (CM.app && CM.app.view !== 'game') return;
    if (!(CM.app && CM.app.bootOpen)) { go(); return; }
    if (CM.loader && CM.loader.isVisible() && CM.loader.whenGone) { CM.loader.whenGone(function () { UI.tapToStart(go); }); return; }
    CM.app.bootOpen = false;
    var host = document.getElementById('board-wrap') || document.body, old = document.querySelector('.tapstart'); if (old) old.remove();
    var b = document.createElement('button'); b.type = 'button'; b.className = 'tapstart';
    b.innerHTML = '<span class="tapstart__plate"><b>Tap to start</b><small>' + U.esc(($('mname') && $('mname').textContent) || 'Chess Master') + '</small></span>';
    var seq = CM.app ? CM.app.seq : 0;
    var fire = function (e) { if (e) e.preventDefault(); b.remove(); if (!CM.app || (CM.app.seq === seq && CM.app.view === 'game')) go(); };
    b.addEventListener('click', fire, { once: true });
    host.appendChild(b); try { b.focus({ preventScroll: true }); } catch (_) { }
  };
  /* t4a: leaving the game view (back button, browser back) while a mode is still loading or waiting on its start cue:
     drop the queued cue and any Tap to start plate, so nothing from that mode shows up on the lobby or the next mode */
  UI.abortStart = function (keepEl) {
    if (CM.loader && CM.loader.cancel) CM.loader.cancel(keepEl);
    var t = document.querySelector('.tapstart'); if (t) t.remove();
    UI.waitingStart = false;
  };
  UI.toast = function (t, ms) {
    var e = $('status'); if (!t) { e.classList.remove('is-show'); return; }
    e.textContent = t; e.classList.add('is-show'); clearTimeout(toastT); toastT = setTimeout(function () { e.classList.remove('is-show'); }, ms || 3200);
  };
  UI.setStatus = function (t) { var e = $('status'); if (t) { e.textContent = t; e.classList.add('is-sticky'); } else e.classList.remove('is-sticky'); };
  UI.setUndoEnabled = function (on) { $('undo').disabled = !on; };

  /* ---------- mode intro card (m3-ui, owner 2026-11-26 "make the UI more interesting") ----------
     Before a mode's first game on this device: the mode name, its category, the opponent (avatar, name, rating,
     tagline) and the rules summary from the mode file (description + how to win, the same text as the Mode panel).
     Shown once per mode (CM.store 'introSeen'); after the loading screen fades. Automated browsers (navigator.webdriver,
     i.e. every QA tool) skip it unless CM.store 'introForce' is true, so scripted board taps are never blocked. */
  function modeId() { if (CM.app && CM.app.curId) return CM.app.curId; var m = /^#\/play\/(.+)$/.exec(location.hash); return m ? decodeURIComponent(m[1]) : ''; }
  function clip(s, n) { s = String(s || '').replace(/\s+/g, ' ').trim(); if (s.length <= n) return s; var c = s.slice(0, n), k = Math.max(c.lastIndexOf('. '), c.lastIndexOf('! ')); return k > n * 0.5 ? c.slice(0, k + 1) : c.replace(/\s+\S*$/, '') + '\u2026'; }
  UI.intro = function (o) {
    var id = modeId(); if (!id) return;
    if (navigator.webdriver && !CM.store.get('introForce', false)) return;
    var seen = CM.store.get('introSeen', []); if (!Array.isArray(seen)) seen = [];
    if (seen.indexOf(id) >= 0) return;
    var rule = clip($('mrule').textContent, 260), how = clip($('mhow').textContent, 140);
    if (!rule && !how) return;
    seen.push(id); CM.store.set('introSeen', seen.slice(-800));
    var lv = CM.lobby && CM.lobby.byId[id], cat = (lv && (lv.kind || lv.cat)) || $('mcat').textContent || '', f = UI.fam;
    /* m3-ui family chrome: the eyebrow carries the family icon + label (accent from --fam on the card) */
    $('intro-cat').innerHTML = (f && CM.icon ? CM.icon(f.icon) : '') + U.esc(f && f.key !== 'standard' ? f.label + (cat && cat !== f.label ? ' \u00b7 ' + cat : '') : cat);
    $('intro-cat').hidden = !cat && !f;
    $('intro').style.setProperty('--fam', f ? f.accent : '');
    $('intro-t').textContent = $('mname').textContent;
    $('intro-ava').innerHTML = UI.avatarHTML(o || {});
    $('intro-on').textContent = (o && o.name) || 'Bot'; $('intro-or').textContent = rating(o && o.rating);
    var tag = o && o.tagline && o.tagline !== $('mrule').textContent ? clip(o.tagline, 90) : '';
    $('intro-tag').textContent = tag; $('intro-tag').hidden = !tag;
    $('intro-rule').textContent = rule; $('intro-rule').hidden = !rule;
    $('intro-how').textContent = how; $('intro-how').hidden = $('intro-howh').hidden = !how;
    var seq = CM.app ? CM.app.seq : 0, t0 = Date.now();
    clearTimeout(UI._inT);
    (function open() {
      if (CM.app && (CM.app.seq !== seq || CM.app.view !== 'game')) return;
      if (CM.loader && CM.loader.isVisible() && Date.now() - t0 < 9000) { UI._inT = setTimeout(open, 120); return; }
      var m = $('intro'); m.classList.add('is-open'); m.setAttribute('aria-hidden', 'false');
      setTimeout(function () { $('intro-play').focus({ preventScroll: true }); }, 60);
    })();
  };
  UI.hideIntro = function () { clearTimeout(UI._inT); var m = $('intro'); if (!m) return; m.classList.remove('is-open'); m.setAttribute('aria-hidden', 'true'); };

  /* ---------- game-over reason as a sentence (critic 2026-11-27: "you were king captured") ----------
     Rules and modes hand in short causes ("checkmate", "3 checks", "reached 10 points", "you ran out of time"). The
     result card shows one full sentence: a subject, a verb, a full stop. W = the winner ("You" on a win, the opponent
     on a loss), L = the loser. Clauses that are already sentences only get a capital and a full stop. */
  UI.reasonSentence = function (why, result, oppName) {
    var t = String(why || '').replace(/\s+/g, ' ').trim().replace(/[.!]+$/, '');
    if (!t) return '';
    var opp = oppName || 'Your opponent', youWin = result === 'win', draw = result !== 'win' && result !== 'loss';
    var W = youWin ? 'You' : opp, L = youWin ? opp : 'You', Lp = youWin ? opp + '\u2019s' : 'Your';
    var be = function (who) { return who === 'You' ? 'are' : 'is'; }, have = function (who) { return who === 'You' ? 'have' : 'has'; }, was = function (who) { return who === 'You' ? 'were' : 'was'; };
    var cap = function (x) { return x.charAt(0).toUpperCase() + x.slice(1); };
    var m, short = { checkmate: 'checkmate', stalemate: 'stalemate', draw: 'agreement', repetition: 'repetition', insufficient: 'insufficient material', 'insufficient material': 'insufficient material', 'move limit': 'the move limit', resignation: 'resignation', timeout: 'timeout', agreement: 'agreement', points: 'points' };
    var k = t.toLowerCase();
    if (/^you resigned$/.test(k)) return youWin ? opp + ' resigned.' : 'You resigned.';
    if (k === 'timeout' || k === 'on time') return (youWin ? opp : 'You') + ' ran out of time.';
    if (short[k]) return draw ? 'Draw by ' + short[k] + '.' : W + ' won by ' + short[k] + '.';
    if (/^by /.test(k)) return draw ? 'Draw ' + t + '.' : W + ' won ' + t + '.';
    if ((m = /^(\d+|two|three|four|five|six|seven|eight|nine|ten) checks?( in a row)?$/.exec(k))) return W + ' gave ' + t + '.';
    if ((m = /^(reached|survived|held|claimed) (.+)$/.exec(t))) return W + ' ' + m[1] + ' ' + m[2] + '.';
    if ((m = /^claimed win \((.+)\)$/.exec(k))) return W + ' claimed the win on a ' + m[1] + '.';
    if ((m = /^\+(\d+) material (.+)$/.exec(t))) return W + ' held +' + m[1] + ' material ' + m[2] + '.';
    if (k === 'ran out of pieces') return W + ' ran out of pieces first, which wins this mode.';
    if (k === 'no moves left' || k === 'no pieces left to move') return W + ' ran out of moves first, which wins this mode.';
    if (k === 'last one standing') return draw ? 'One player is left standing.' : W + ' ' + be(W) + ' the last one standing.';
    if (k === 'nobody is left') return 'Nobody is left standing.';
    if (k === 'move limit reached') return 'The move limit was reached.';
    if (k === 'no pieces left') return L + ' ' + have(L) + ' no pieces left.';
    if (k === 'bare king') return L + ' ' + was(L) + ' left with a bare king.';
    if (k === 'king captured') return Lp + ' king was captured.';
    if (k === 'checkmated') return L + ' ' + was(L) + ' checkmated.';
    if (k === 'stalemated') return L + ' ' + have(L) + ' no legal moves.';
    if (k === 'left') return 'The game was abandoned.';
    return cap(t) + '.';
  };

  /* ---------- game over (chess.com style modal) ---------- */
  UI.showOver = function (o) {
    /* QA: a result that arrives late (mode timer, bot reply, mini-game) must never open over the lobby */
    if (CM.app && CM.app.view !== 'game') return;
    var fam = UI.fam || null;
    var title = o.title || (o.result === 'win' ? (fam && fam.win) || 'You Won!' : o.result === 'loss' ? (o.lossTitle || (fam && fam.loss) || 'You Lost') : 'Draw');
    $('gotitle').textContent = title;
    /* s5-ui (owner 3:17 PM "more stimulating"): the result card opens on the mode's own key art (card art or the
       video's thumbnail), full colour on a win, drained on a loss, with the result disc overlapping its foot */
    try {
      var card = document.querySelector('#gover .modal__card'), key = card && card.querySelector('.modal__key');
      var mid = (CM.family && CM.family.curId && CM.family.curId()) || '', lv = CM.lobby && CM.lobby.byId && CM.lobby.byId[mid];
      var src = lv && lv.thumb ? lv.thumb : (lv && !lv.site && /^[\w-]{11}$/.test(mid) ? 'https://i.ytimg.com/vi/' + encodeURIComponent(mid) + '/mqdefault.jpg' : '');
      if (card && !key) { key = document.createElement('span'); key.className = 'modal__key'; key.setAttribute('aria-hidden', 'true'); card.insertBefore(key, card.firstChild); }
      if (key) {
        key.hidden = !src; card.classList.toggle('has-key', !!src);
        if (src && key.dataset.src !== src) { key.dataset.src = src; key.innerHTML = '<img alt="" decoding="async" src="' + src + '">'; }
      }
    } catch (e) { /* key art is decoration only */ }
    var why = o.why ? String(o.why) : '';
    /* pol-ui: chess.com wording ("by resignation", "on time") instead of "by you resigned" */
    var w0 = UI.reasonSentence(why, o.result, o.opp && o.opp.name);
    $('gowhy').textContent = w0;
    if (o.whyRaw) $('gowhy').textContent = o.whyRaw;
    $('go-you').innerHTML = UI.avatarHTML(o.you || { name: 'You' }); $('go-opp').innerHTML = UI.avatarHTML(o.opp || { name: 'Bot' });
    $('go-youn').textContent = (o.you && o.you.name) || 'You'; $('go-oppn').textContent = (o.opp && o.opp.name) || 'Bot';
    $('go-score').textContent = o.result === 'win' ? '1 - 0' : o.result === 'loss' ? '0 - 1' : '½ - ½';
    /* ov-ui: video-game frames and modes that end on a non-chess goal show 'vs' instead of a chess score */
    if ((UI.controller && UI.controller.frame === 'game') || o.score === false) $('go-score').textContent = 'vs';
    if (typeof o.score === 'string') $('go-score').textContent = o.score;
    $('go-you').classList.toggle('is-winner', o.result === 'win'); $('go-opp').classList.toggle('is-winner', o.result === 'loss');
    var g = $('gover'); g.dataset.result = o.result || 'draw';
    /* m3-ui: result art over the title (Lucide: trophy = win, handshake = draw; none on a loss) */
    /* family chrome: a win shows the family's own icon (crosshair, flame, dice ...) in its accent; standard = trophy */
    var winIco = fam && fam.key !== 'standard' && fam.key !== 'challenge' ? fam.icon : 'trophy';
    /* owner 2026-11-27 ("the flag icon looks too vibecoded"): a loss shows no art; the title and the reason carry it */
    var art = $('go-art');
    art.innerHTML = o.result === 'loss' || !CM.icon ? '' : CM.icon(o.result === 'win' ? winIco : 'handshake');
    art.hidden = !art.innerHTML;
    g.style.setProperty('--fam', fam ? fam.accent : ''); g.dataset.family = fam ? fam.key : '';
    /* a progression mode can relabel the primary button (g3_ladder: "Next game") */
    var gn = $('gonew'); gn.textContent = o.newLabel || 'New Game'; gn.dataset.label = o.newLabel ? 'custom' : '';
    clearTimeout(UI._goT); UI._goT = setTimeout(function () {
      if (CM.app && CM.app.view !== 'game') return;
      g.classList.add('is-open'); g.setAttribute('aria-hidden', 'false'); setTimeout(function () { $('gonew').focus({ preventScroll: true }); }, 60);
    }, o.delay == null ? 700 : o.delay);
  };
  UI.hideOver = function () {
    if (CM.app && CM.app.view !== 'game') UI.hideIntro(); clearTimeout(UI._goT); var g = $('gover'); g.classList.remove('is-open'); g.setAttribute('aria-hidden', 'true'); var gn = $('gonew'); if (gn) gn.textContent = 'New Game'; };

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
