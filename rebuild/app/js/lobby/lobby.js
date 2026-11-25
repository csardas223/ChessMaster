/* Lobby: Play-menu style quick rows, underline category tabs, search, compact video rows.
   Each video row opens its remastered mode (data/modes/<id>.js, listed in CM_DATA.modeIndex) or, until one
   exists, the ported legacy mode for that video. */
(function () {
  'use strict';
  var CM = window.CM, U = CM.util, $ = U.$;
  var CAT_ORDER = ['Horror Chess', 'Variants & Games', 'Variant Bots', 'Challenges & Odds', 'Powerups & Rule Twists', 'Drawback Chess', 'Dice Chess', 'Other Videos'];
  var L = CM.lobby = { tab: 'all', list: [], byId: {} };

  function fmtDur(s) { if (!s) return ''; var h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = String(s % 60).padStart(2, '0'); return h ? h + ':' + String(m).padStart(2, '0') + ':' + x : m + ':' + x; }
  function fmtViews(n) { var f = function (x, u) { return (x >= 10 ? Math.floor(x) : Math.floor(x * 10) / 10) + u; }; return n >= 1e6 ? f(n / 1e6, 'M') : n >= 1e3 ? f(n / 1e3, 'K') : String(n || 0); }

  L.init = function () {
    var vids = (CM.DATA.videos || []), idx = CM.DATA.modeIndex || {};
    /* legacy table: VIDEOS holds [id, title, category] arrays that modes_extra.js maps to its ported modes */
    vids.forEach(function (v) { var a = [v.id, v.title, v.category]; a.explain = null; VIDEOS.push(a); });
    VIDEOS.forEach(function (a) { try { a.mode = modeFor(a[1], a[2]); a.md = modeName(a.mode.m, a.mode.arg); a.exp = explainOf(a); } catch (e) { a.mode = null; } });
    L.list = vids.map(function (v, k) {
      var a = VIDEOS[k], m = idx[v.id];
      var o = { id: v.id, title: U.cleanTitle(v.title), rawTitle: v.title, cat: v.category, date: v.date || '', views: v.views || 0, dur: v.dur || 0,
        remastered: !!m, mode: m ? (m.name || m.title) : (a && a.md) || 'Chess', legacy: a, frame: m && m.frame };
      o.s = U.norm(v.title + ' ' + o.mode + ' ' + v.category);
      L.byId[v.id] = o; return o;
    });
    L.cats = CAT_ORDER.filter(function (c) { return L.list.some(function (v) { return v.cat === c; }); })
      .concat(Array.from(new Set(L.list.map(function (v) { return v.cat; }))).filter(function (c) { return CAT_ORDER.indexOf(c) < 0; }));
    L.renderTabs(); L.renderQuick(); L.render();
    $('q').addEventListener('input', function () { cancelAnimationFrame(L._qT); L._qT = requestAnimationFrame(L.render); });
    $('tabs').addEventListener('click', function (e) { var b = e.target.closest('[data-tab]'); if (b) L.setTab(b.dataset.tab); });
    $('lobby').addEventListener('click', function (e) {
      var more = e.target.closest('[data-more]'); if (more) { L.setTab(more.dataset.more); window.scrollTo({ top: 0 }); return; }
      var r = e.target.closest('[data-open]'); if (r) CM.app.openVideo(r.dataset.open);
      var q = e.target.closest('[data-quick]'); if (q) L.quick(q.dataset.quick);
    });
    $('lobby').addEventListener('load', function (e) { if (e.target.tagName === 'IMG') e.target.classList.add('is-loaded'); }, true);
    $('lobby').addEventListener('error', function (e) { if (e.target.tagName === 'IMG') e.target.remove(); }, true);
  };
  L.renderTabs = function () {
    var n = function (c) { return L.list.filter(function (v) { return v.cat === c; }).length; };
    var rem = L.list.filter(function (v) { return v.remastered; }).length;
    var tabs = [['all', 'All', L.list.length]].concat(rem ? [['remastered', 'Remastered', rem]] : []).concat(L.cats.map(function (c) { return [c, c.replace(' & ', ' & '), n(c)]; }));
    $('tabs').innerHTML = tabs.map(function (t) { return '<button type="button" role="tab" class="tab" data-tab="' + U.esc(t[0]) + '" aria-selected="' + (L.tab === t[0]) + '">' + U.esc(t[1]) + '<small>' + t[2] + '</small></button>'; }).join('');
  };
  L.setTab = function (t) {
    L.tab = t; U.qsa('[data-tab]', $('tabs')).forEach(function (b) { b.setAttribute('aria-selected', b.dataset.tab === t); });
    var b = $('tabs').querySelector('[aria-selected="true"]'); if (b) b.scrollIntoView({ inline: 'nearest', block: 'nearest' });
    L.render();
  };
  L.renderQuick = function () {
    var idx = CM.DATA.modeIndex || {}, h = '';
    if (idx.stockfish) h += '<button type="button" class="qrow" data-quick="stockfish"><span class="qrow__ico"><img src="assets/avatars/stockfish.svg" alt=""></span><span><span class="qrow__t">Play Stockfish</span><span class="qrow__s">Standard chess against the engine</span></span></button>';
    h += '<button type="button" class="qrow" data-quick="random"><span class="qrow__ico"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="3"/><circle cx="9" cy="9" r="1.2"/><circle cx="15" cy="15" r="1.2"/><circle cx="15" cy="9" r="1.2"/><circle cx="9" cy="15" r="1.2"/></svg></span><span><span class="qrow__t">Random Video</span><span class="qrow__s">Jump into any of the ' + L.list.length + ' modes</span></span></button>';
    $('quick').innerHTML = h;
  };
  L.quick = function (k) {
    if (k === 'stockfish') return CM.app.openMode('stockfish');
    if (k === 'random') { var pool = L.list.filter(function (v) { return v.legacy && v.legacy.mode; }); return CM.app.openVideo(U.pick(pool).id); }
  };
  function row(v) {
    return '<button type="button" class="vrow" data-open="' + U.esc(v.id) + '"><span class="vrow__th"><img loading="lazy" src="https://i.ytimg.com/vi/' + encodeURIComponent(v.id) + '/mqdefault.jpg" alt="">' +
      (v.dur ? '<span class="vrow__dur">' + fmtDur(v.dur) + '</span>' : '') + '</span><span class="vrow__body"><span class="vrow__t">' + U.esc(v.title) + '</span>' +
      '<span class="vrow__m">' + (v.remastered ? '<span class="rm">Remastered</span> · ' : '') + U.esc(v.mode) + '</span>' +
      '<span class="vrow__m">' + fmtViews(v.views) + ' views</span></span></button>';
  }
  function byNew(a, b) { return (b.date || '').localeCompare(a.date || ''); }
  L.render = function () {
    var q = U.norm($('q').value.trim()), h = '', list;
    $('quick').hidden = !!q || L.tab !== 'all';
    if (q) {
      list = L.list.filter(function (v) { return v.s.indexOf(q) >= 0; }).sort(byNew);
      h = list.length ? '<section class="sec"><h2 class="sec__h">Results <small>' + list.length + '</small></h2>' + list.map(row).join('') + '</section>' : '';
    } else if (L.tab === 'all') {
      var rem = L.list.filter(function (v) { return v.remastered; }).sort(byNew);
      if (rem.length) h += '<section class="sec"><h2 class="sec__h"><span>Remastered</span><button type="button" class="sec__more" data-more="remastered">See all ' + rem.length + '</button></h2>' + rem.slice(0, 5).map(row).join('') + '</section>';
      L.cats.forEach(function (c) {
        var l = L.list.filter(function (v) { return v.cat === c; }).sort(byNew);
        h += '<section class="sec"><h2 class="sec__h"><span>' + U.esc(c) + '</span><button type="button" class="sec__more" data-more="' + U.esc(c) + '">See all ' + l.length + '</button></h2>' + l.slice(0, 4).map(row).join('') + '</section>';
      });
      list = [1];
    } else {
      list = L.list.filter(function (v) { return L.tab === 'remastered' ? v.remastered : v.cat === L.tab; }).sort(byNew);
      h = '<section class="sec">' + list.map(row).join('') + '</section>';
    }
    $('rows').innerHTML = h; $('empty').hidden = !!list.length;
  };
})();
