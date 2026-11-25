/* Chess Master: global namespace and small shared utilities.
   Every file in js/ is a classic script wrapped in an IIFE that hangs its exports on window.CM.
   Classic scripts (no ES modules) keep the app runnable from file:// as well as any static host. */
(function () {
  'use strict';
  var CM = window.CM = window.CM || {};
  CM.version = '2.0.0';
  CM.DATA = window.CM_DATA = window.CM_DATA || {};

  var U = CM.util = {};
  U.$ = function (id) { return document.getElementById(id); };
  U.qs = function (sel, root) { return (root || document).querySelector(sel); };
  U.qsa = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  /* CSS url() for a custom property: url() inside var() resolves against the stylesheet that uses it (css/), so
     app-relative paths like assets/... must be made absolute first (QA: 404 css/assets/modes/<id>/board.png) */
  U.cssUrl = function (u) {
    if (!u || u === 'none') return 'none';
    var m = /^\s*url\((['"]?)(.*?)\1\)\s*$/.exec(u); if (m) u = m[2];
    /* merge-prep 2026-11-25: older specs wrote css-relative '../assets/...'; resolved against the page that climbs
       out of a GitHub Pages subpath (/ChessMaster/ -> /assets 404), so treat it as the app-relative assets/... */
    u = u.replace(/^(\.\.\/)+(?=assets\/)/, '');
    try { u = new URL(u, document.baseURI).href; } catch (e) {}
    return 'url("' + u + '")';
  };
  U.esc = function (t) {
    return String(t == null ? '' : t).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  /* strip zalgo / combining marks for search and sorting */
  U.norm = function (t) {
    return String(t).normalize('NFKD')
      .replace(/[\u0300-\u036f\u0483-\u0489\u1ab0-\u1aff\u1dc0-\u1dff\u20d0-\u20ff\ufe20-\ufe2f]/g, '')
      .toLowerCase();
  };
  /* display-safe title: keep the text, drop stacked combining marks that overflow cards */
  U.cleanTitle = function (t) {
    return String(t).normalize('NFC').replace(/([\u0300-\u036f\u0483-\u0489\u1ab0-\u1aff\u1dc0-\u1dff\u20d0-\u20ff\ufe20-\ufe2f]){1,}/g, '');
  };
  U.clamp = function (x, a, b) { return x < a ? a : x > b ? b : x; };
  U.rand = function (n) { return Math.floor(Math.random() * n); };
  U.pick = function (a) { return a[Math.floor(Math.random() * a.length)]; };
  U.shuffle = function (a) {
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  };
  U.fmtClock = function (ms) {
    ms = Math.max(0, ms);
    if (ms < 10000) { var s = ms / 1000; return '0:0' + s.toFixed(1); }
    var t = Math.ceil(ms / 1000), h = Math.floor(t / 3600), m = Math.floor(t % 3600 / 60), x = String(t % 60).padStart(2, '0');
    return h ? h + ':' + String(m).padStart(2, '0') + ':' + x : m + ':' + x;
  };
  U.prefersReducedMotion = function () {
    return CM.settings ? CM.settings.reducedMotion() : (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  };
  U.isFileProtocol = location.protocol === 'file:';

  /* tiny event emitter */
  CM.Emitter = function () { this._h = {}; };
  CM.Emitter.prototype.on = function (ev, fn) { (this._h[ev] = this._h[ev] || []).push(fn); return this; };
  CM.Emitter.prototype.off = function (ev, fn) { var a = this._h[ev]; if (a) this._h[ev] = a.filter(function (f) { return f !== fn; }); };
  CM.Emitter.prototype.emit = function (ev) {
    var a = this._h[ev]; if (!a) return; var args = Array.prototype.slice.call(arguments, 1);
    a.slice().forEach(function (f) { try { f.apply(null, args); } catch (e) { console.error(e); } });
  };
  CM.bus = new CM.Emitter();

  /* localStorage with a namespace; never throws (private mode, file:// quirks) */
  CM.store = {
    get: function (k, d) { try { var v = localStorage.getItem('cm.' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem('cm.' + k, JSON.stringify(v)); } catch (e) { /* ignore */ } }
  };

  /* load a classic script once (used for mode hook modules and data bundles); works on file:// */
  var loaded = {};
  U.loadScript = function (src) {
    if (loaded[src]) return loaded[src];
    loaded[src] = new Promise(function (res, rej) {
      var s = document.createElement('script'); s.src = src; s.async = true;
      s.onload = function () { res(); };
      s.onerror = function () { delete loaded[src]; rej(new Error('failed to load ' + src)); };
      document.head.appendChild(s);
    });
    return loaded[src];
  };
  /* pol-perf: load several classic scripts that depend on each other: they download in parallel and run in list order
     (dynamically inserted scripts with async = false keep insertion order). Already loaded ones are not fetched again. */
  U.loadScripts = function (list) {
    return Promise.all(list.map(function (src) {
      if (loaded[src]) return loaded[src];
      loaded[src] = new Promise(function (res, rej) {
        var s = document.createElement('script'); s.src = src; s.async = false;
        s.onload = function () { res(); };
        s.onerror = function () { delete loaded[src]; rej(new Error('failed to load ' + src)); };
        document.head.appendChild(s);
      });
      return loaded[src];
    }));
  };
  U.fetchJSON = function (url) {
    return fetch(url, { cache: 'no-cache' }).then(function (r) { if (!r.ok) throw new Error(r.status + ' ' + url); return r.json(); });
  };
  U.sleep = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
})();
