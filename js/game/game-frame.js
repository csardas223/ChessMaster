/* GameFrame: the "video game" frame. Videos that are not a chess game on a board (a platformer, a top-down
   shooter, ...) set  frame: 'game', game: { module: '<name>', aspect: 16/9, ... }  in their mode file and ship a
   small canvas game at js/games/<name>.js:

     CM.defineGame('<name>', function (host) {
       // build your world from host.spec / host.params, draw on host.canvas (host.g = its 2D context)
       return {
         start: function () {},           // called once after mount
         newGame: function () {},         // New button / game-over "New Game"
         stop: function () {},            // leaving the screen; free timers
         undo: function () {},            // optional (Undo button disabled when absent)
         flip: function () {},            // optional
         key: function (code, down) {},   // keyboard + on-screen controls ('left','right','up','down','jump','action', or KeyboardEvent.code)
         resize: function (w, h, dpr) {}  // canvas backing size changed
       };
     });

   The host keeps the chess.com chrome: player bars, move list, rules panel, status line, game-over modal, sounds,
   VFX (host.fx) and the action bar. See ARCHITECTURE.md "Video game frame". */
(function () {
  'use strict';
  var CM = window.CM, U = CM.util, $ = U.$;
  CM.games = CM.games || {};
  CM.defineGame = function (name, factory) { CM.games[name] = factory; return factory; };

  var ICON = {
    left: '<svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>',
    right: '<svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>',
    up: '<svg viewBox="0 0 24 24"><path d="M5 15l7-7 7 7"/></svg>',
    down: '<svg viewBox="0 0 24 24"><path d="M5 9l7 7 7-7"/></svg>',
    jump: '<svg viewBox="0 0 24 24"><path d="M12 19V6M6 11l6-6 6 6"/></svg>',
    action: '<svg viewBox="0 0 24 24"><path d="M5 19L17 7M14 5l5 5M7 14l3 3"/></svg>'
  };
  var KEYMAP = { ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right', ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down', Space: 'jump', KeyJ: 'action', KeyK: 'action', Enter: 'action' };

  function GameFrame(spec, video) {
    this.spec = spec; this.video = video; this.frame = 'game'; this.over = null; this.alive = true; this.raf = 0; this.timers = [];
  }
  var P = GameFrame.prototype;

  P.start = function () {
    var self = this, s = this.spec, UI = CM.gameUI, g = s.game || {};
    UI.attach(this);
    var view = $('view-game'), bg = (s.theme && s.theme.background) || (s.board && s.board.background);
    view.style.setProperty('--mode-bg', bg || ''); view.classList.toggle('has-mode-bg', !!bg && CM.settings.get('modeTheme'));
    UI.setTitle(s.name || s.title, s.category, s.id && !s.no_video ? s.id : null);
    UI.setInfo(s.description || '', s.how_to_win || '');
    var opp = s.opponent || {};
    UI.setOpponentCard({ avatar: opp.avatar, name: opp.name, rating: opp.rating, tagline: opp.tagline || '' });
    this.setPlayers();
    UI.setMoves([]);
    Object.keys(s.sounds || {}).forEach(function (k) { CM.sound.register(k, s.sounds[k]); });
    var fr = $('game-frame'); fr.innerHTML = '<canvas id="game-canvas" aria-label="' + U.esc(s.name || 'Game') + '"></canvas><div class="game-frame__hud" id="game-hud"></div>';
    this.canvas = $('game-canvas'); this.g = this.canvas.getContext('2d');
    UI.setAspect(g.aspect || 1);
    this._buildControls(g.controls || ['left', 'right', '|', 'jump', 'action']);
    this._onKey = function (e) { self._key(e, e.type === 'keydown'); };
    document.addEventListener('keydown', this._onKey); document.addEventListener('keyup', this._onKey);
    var factory = CM.games[g.module];
    if (!factory) { UI.toast('This game module is missing: ' + g.module); return; }
    this.host = this._host();
    try { this.mod = factory(this.host) || {}; } catch (e) { console.error(e); this.mod = {}; }
    $('undo').disabled = !this.mod.undo; $('flip').disabled = !this.mod.flip;
    UI.layout();
    if (this.mod.start) this.mod.start();
    CM.sound.play('game-start');
  };
  P.setPlayers = function (o) {
    var s = this.spec, opp = Object.assign({}, s.opponent || {}, o && o.opp), you = Object.assign({}, s.player || {}, o && o.you);
    CM.gameUI.setPlayers({ top: { name: opp.name, rating: opp.rating, avatar: opp.avatar }, bottom: { name: you.name || 'You', rating: you.rating, avatar: you.avatar || 'assets/avatars/iwantcheckmate.png' } });
  };
  P._buildControls = function (list) {
    var el = $('game-controls'), groups = [[]];
    list.forEach(function (k) { if (k === '|') groups.push([]); else groups[groups.length - 1].push(k); });
    el.innerHTML = groups.map(function (g) { return '<div class="grp">' + g.map(function (k) { return '<button type="button" class="gctl' + (k === 'action' ? ' gctl--primary' : '') + '" data-k="' + k + '" aria-label="' + k + '">' + (ICON[k] || k) + '</button>'; }).join('') + '</div>'; }).join('');
    var self = this, coarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
    el.hidden = !coarse && window.innerWidth >= 900;
    var down = function (e) { var b = e.target.closest('[data-k]'); if (!b) return; e.preventDefault(); b.classList.add('is-down'); try { b.setPointerCapture(e.pointerId); } catch (_) { } self._send(b.dataset.k, true); };
    var up = function (e) { var b = e.target.closest('[data-k]'); if (!b) return; b.classList.remove('is-down'); self._send(b.dataset.k, false); };
    el.onpointerdown = down; el.onpointerup = up; el.onpointercancel = up; el.oncontextmenu = function (e) { e.preventDefault(); };
  };
  P._key = function (e, down) {
    if (CM.app.view !== 'game' || CM.gameUI.controller !== this) return;
    if (e.target && /INPUT|SELECT|TEXTAREA/.test(e.target.tagName)) return;
    var k = KEYMAP[e.code]; if (!k && !this.mod.wantsRawKeys) return;
    if (k && (e.code === 'Space' || e.code.indexOf('Arrow') === 0)) e.preventDefault();
    if (e.repeat) return;
    this._send(k || e.code, down);
  };
  P._send = function (k, down) { if (this.mod && this.mod.key && !this.over) this.mod.key(k, down); };
  P._host = function () {
    var self = this, UI = CM.gameUI;
    return {
      spec: this.spec, params: this.spec.params || {}, canvas: this.canvas, g: this.g, el: $('game-frame'),
      get size() { return UI.size; },
      dpr: function () { return Math.min(2, window.devicePixelRatio || 1); },
      reduced: function () { return CM.settings.reducedMotion(); },
      hud: function (html) { var h = $('game-hud'); if (h && h._h !== html) { h.innerHTML = html; h._h = html; } },
      toast: function (t, ms) { UI.toast(t, ms); },
      status: function (t) { UI.setStatus(t); },
      sound: function (n) { CM.sound.play(n); },
      fx: function (e) { return UI.vfx.play(e, {}); },
      setPlayers: function (o) { self.setPlayers(o); },
      setThinking: function (t) { UI.setThinking(t); },
      setActive: function (side) { UI.setActive(side); },
      setMoves: function (list) { UI.setMoves(list); },
      setCaptured: function (top, bottom) { UI.setCaptured(top || [], bottom || [], 0, 0); },
      pieceUrl: function (c, t) { return CM.settings.pieceUrl(c, t); },
      /* a row of choices under the rules (levels, speeds); onPick(value) */
      picker: function (label, options, cur, onPick) {
        var box = $('pane-info').querySelector('.gpicker') || (function () { var d = document.createElement('div'); d.className = 'gpicker'; $('pane-info').appendChild(d); return d; })();
        box.innerHTML = '<span class="visually-hidden">' + U.esc(label) + '</span>' + options.map(function (o) { return '<button type="button" data-v="' + U.esc(o.value) + '" aria-pressed="' + (String(o.value) === String(cur)) + '">' + U.esc(o.label) + '</button>'; }).join('');
        box.onclick = function (e) { var b = e.target.closest('[data-v]'); if (!b) return; U.qsa('[data-v]', box).forEach(function (x) { x.setAttribute('aria-pressed', x === b); }); onPick(b.dataset.v); };
      },
      loop: function (fn) {
        var last = performance.now();
        var step = function (t) { if (!self.alive) return; var dt = Math.min(0.05, (t - last) / 1000); last = t; try { fn(dt, t); } catch (e) { console.error(e); self.alive = false; return; } self.raf = requestAnimationFrame(step); };
        cancelAnimationFrame(self.raf); self.raf = requestAnimationFrame(step);
      },
      after: function (ms, fn) { var t = setTimeout(fn, ms); self.timers.push(t); return t; },
      over: function (o) {
        if (self.over) return; self.over = o; CM.sound.play('game-end');
        var opp = self.spec.opponent || {};
        UI.showOver({ result: o.result, why: o.why, title: o.title, you: Object.assign({ name: 'You', avatar: 'assets/avatars/iwantcheckmate.png' }, self.spec.player), opp: { name: opp.name, avatar: opp.avatar }, delay: 500 });
      },
      get isOver() { return !!self.over; }
    };
  };
  P.onLayout = function (L) {
    if (!this.canvas) return; var dpr = Math.min(2, window.devicePixelRatio || 1), w = Math.round(L.bw * dpr), h = Math.round(L.bh * dpr);
    if (this.canvas.width !== w || this.canvas.height !== h) { this.canvas.width = w; this.canvas.height = h; if (this.mod && this.mod.resize) this.mod.resize(w, h, dpr); }
  };
  P.newGame = function () { this.over = null; CM.gameUI.hideOver(); if (this.mod && this.mod.newGame) this.mod.newGame(); CM.sound.play('game-start'); };
  P.undo = function () { if (this.mod && this.mod.undo) this.mod.undo(); };
  P.flip = function () { if (this.mod && this.mod.flip) this.mod.flip(); };
  P.render = function () { if (this.mod && this.mod.redraw) this.mod.redraw(); };
  P.detach = function () {
    this.alive = false; cancelAnimationFrame(this.raf); this.timers.forEach(clearTimeout);
    document.removeEventListener('keydown', this._onKey); document.removeEventListener('keyup', this._onKey);
    if (this.mod && this.mod.stop) try { this.mod.stop(); } catch (e) { console.error(e); }
    $('game-frame').innerHTML = ''; $('game-controls').hidden = true; $('game-controls').innerHTML = '';
    var box = $('pane-info').querySelector('.gpicker'); if (box) box.remove();
    $('view-game').classList.remove('has-mode-bg');
  };
  P.loadModule = function () {
    var m = (this.spec.game || {}).module; if (!m || CM.games[m]) return Promise.resolve();
    return U.loadScript('js/games/' + m + '.js');
  };

  CM.GameFrame = GameFrame;
})();
