/* SpecGame: the controller for spec-driven modes. Owns the Variant, the live state, history/undo, clocks,
   events, the VFX timeline, the bot, and builds the render model for BoardView.
   Hooks receive `ctx` (built here) - the full game API is documented in ARCHITECTURE.md "ctx". */
(function () {
  'use strict';
  var CM = window.CM, U = CM.util, UI;
  var GID = 0;

  function SpecGame(spec, video, hooks) {
    UI = CM.gameUI;
    this.spec = spec; this.video = video || null; this.hooks = hooks || {};
    this.V = CM.spec.buildVariant(spec, this.hooks);
    this.human = this.V.colors.indexOf(spec.player_side) >= 0 ? spec.player_side : this.V.colors[0];
    this.botColor = this.V.colors.filter(function (c) { return c !== this.human; }, this)[0];
    this.frame = 'chess';
    this.userFlip = false; this.ctx = makeCtx(this);
    this.clockCfg = parseClock(spec.clock || CM.settings.get('clock'));
  }
  var P = SpecGame.prototype;
  function parseClock(c) {
    if (!c || c === 'none') return null;
    if (typeof c === 'string') { var m = /^(\d+)\+(\d+)$/.exec(c); return m ? { w: +m[1] * 60, b: +m[1] * 60, inc: +m[2] } : null; }
    return { w: c.w || c.total || 600, b: c.b || c.total || 600, inc: c.inc || 0, bot: c.bot !== false };
  }

  /* ---------- lifecycle ---------- */
  P.start = function () {
    var s = this.spec, self = this;
    UI.attach(this);
    var b = s.board || {}, th = s.theme || {};
    var light = th.light || b.light, dark = th.dark || b.dark, tex = th.texture || b.texture;
    CM.settings.applyBoard(light || dark || tex ? { light: light, dark: dark, lightImg: tex && tex.light, darkImg: tex && tex.dark } : null);
    var view = document.getElementById('view-game'), bg = th.background || b.background;
    var useTheme = CM.settings.get('modeTheme');
    view.style.setProperty('--mode-bg', bg || '');
    view.classList.toggle('has-mode-bg', !!bg && useTheme);
    UI.zoomOk = UI.zoomAllowedFor(s);   /* intentional limited-view modes opt out of the universal zoom */
    UI.setViewport(b.viewport || null);
    document.getElementById('board-wrap').style.setProperty('--board-image', U.cssUrl(b.image));
    document.getElementById('board-wrap').classList.toggle('has-board-image', !!b.image);
    UI.setTitle(s.name || s.title, s.category, s.id && !s.no_video ? s.id : null);
    UI.setInfo(s.description || '', s.how_to_win || '');
    var opp = s.opponent;
    UI.setOpponentCard({ avatar: opp.avatar || defaultAvatar(opp.name), name: opp.name, rating: opp.rating, tagline: opp.tagline || s.description });
    UI.vfx.registerSounds(s.sounds);
    Object.keys(s.sounds || {}).forEach(function (k) { CM.sound.register(k, s.sounds[k]); });
    (s.assets ? Object.values(s.assets) : []).forEach(function (u) { if (/\.(png|jpe?g|webp|gif|svg)$/i.test(u)) { var i = new Image(); i.src = u; } });
    if (this.hooks.init) this.hooks.init(this.ctx);
    this.newGame();
    UI.layout();
    this._tickT = setInterval(function () { self.tick(); }, 100);
  };
  P.detach = function () { GID++; clearInterval(this._tickT); this.over = this.over || { w: 'd', why: 'left' }; CM.settings.applyBoard(null); var v = document.getElementById('view-game'); v.classList.remove('has-mode-bg'); seriesPaint(null); /* impl-6 */ if (this.hooks.onExit) this.hooks.onExit(this.ctx); };
  /* impl-6: video opponent rotation + win boxes for online-series modes (params.series) */
  function seriesBar(s, G) {
    var ser = s.params && s.params.series, sk = ser ? CM.store.get('g6series.' + s.id, { n: 0, w: 0 }) : null;
    if (ser && ser.opponents && ser.opponents.length) Object.assign(G.opponent, ser.opponents[(sk.n || 0) % ser.opponents.length]);
    seriesPaint(ser, sk);
  }
  function seriesPaint(ser, sk) {
    var el = document.getElementById('g6-wins');
    if (!ser || !ser.boxes) { if (el) el.remove(); return; }
    if (!el) { el = document.createElement('div'); el.id = 'g6-wins'; el.className = 'g6-wins'; var cb = document.getElementById('card-bottom'); cb.insertBefore(el, document.getElementById('clock-bottom')); }
    var h = ''; for (var i = 1; i <= ser.boxes; i++) h += '<b class="' + (i <= (sk.w || 0) ? 'is-won' : '') + '">' + i + '</b>';
    el.innerHTML = h; el.setAttribute('aria-label', (sk.w || 0) + ' of ' + ser.boxes + ' wins');
  }
  function defaultAvatar(name) { return /stockfish/i.test(name || '') ? 'assets/avatars/stockfish.png' : null; }
  P.isBot = function (c) { return c !== this.human && c !== 'n'; };
  /* profile (name, rating, avatar) for a colour: the human, spec.players[k] in multi-player, else spec.opponent */
  P.profile = function (c) {
    if (c === this.human) return this.spec.player;
    var pl = (this.spec.players || []).filter(function (p) { return p.color === c; })[0];
    if (this.V.multi && pl) return { name: pl.name || pl.color, rating: pl.rating, avatar: pl.avatar || defaultAvatar(pl.name), swatch: pl.swatch };
    return this.opponent;
  };

  P.newGame = function () {
    GID++; this.gid = GID;
    var s = this.spec, V = this.V;
    UI.hideOver(); UI.hidePromo(); UI.vfx.reset(); UI.vfx.setGame(this);
    UI.vfx.setTimeline(s.vfx_timeline);
    this.state = CM.spec.initialState(V, s);
    this.over = null; this.sel = -1; this.premove = null; this.last = null; this.history = []; this.sans = [];
    this.cap = { w: [], b: [] }; this.busy = false; this.hand = null; this.justSelected = -1;
    this.opponent = Object.assign({}, s.opponent); this.knocked = [];
    /* impl-6: params.series = { opponents: [{name, rating, avatar}], boxes: 5 } -> the video's opponent for the next game of the
       session (rotates per game, stored per mode in CM.store 'g6series.<id>') and chess.com's 1..N win boxes in the player bar */
    seriesBar(s, this);
    this.clock = this.clockCfg ? { w: this.clockCfg.w * 1000, b: this.clockCfg.b * 1000, t: performance.now() } : null;
    this.events = new CM.Events(this, s.events);
    if (this.hooks.setup) this.hooks.setup(this.ctx);
    this.moves = V.legal(this.state);
    this._knockouts();
    this.render({ instant: true });
    (s.vfx || []).forEach(function (e) { UI.vfx.play(e, {}); });
    CM.sound.play('game-start');
    this.emit('game_start', {});
    if (this.hooks.onStart) this.hooks.onStart(this.ctx);
    if (s.intro_message) UI.toast(s.intro_message);
    this.afterChange();
  };

  /* ---------- helpers ---------- */
  P.flipped = function () { return (this.human === 'b') !== this.userFlip; };
  P.side = function (c) { return c === this.human ? 'player' : c !== 'n' && this.V.colors.indexOf(c) >= 0 ? 'bot' : 'neutral'; };
  P.emit = function (name, info) {
    info = info || {};
    UI.vfx.trigger(name, info);
    if (this.events) this.events.trigger(name, info);
    if (this.hooks.onTrigger) this.hooks.onTrigger(this.ctx, name, info);
  };
  /* image for a piece: piece.img, the type's img (string or per colour), else the user's piece set (or the mode's own) */
  P.pieceImage = function (p) {
    var d = this.V.def(p.t), pc = p.dead ? (p.was || 'w') : p.c, base = this.baseColor(pc);
    if (p.img) return p.img;
    if (d.img) { var di = typeof d.img === 'string' ? d.img : (d.img[pc] || d.img[base] || d.img.w || d.img.n); if (di) return di; }   /* a type with art for some colours only (Thermopylae red Q/K/B) falls back to the set for the others */
    var t = d.glyph || p.t, c = p.c === 'n' && !p.dead ? (d.glyphColor || 'w') : base;
    var th = this.spec.theme || {}, set = CM.settings.get('modeTheme') ? (th.pieces || this.spec.board.pieces) : null;
    if ('PNBRQK'.indexOf(t) >= 0 && t.length === 1) return CM.settings.pieceUrl(c, t, set || undefined);
    return letterPiece(d.badge || t, c);
  };
  /* colours beyond w/b draw a white or black set, tinted by CSS (pc--tint-<colour>) */
  P.baseColor = function (c) {
    if (c === 'w' || c === 'b' || c === 'n') return c;
    var pl = (this.spec.players || []).filter(function (p) { return p.color === c; })[0];
    return pl && pl.base ? pl.base : 'w';
  };
  var letterCache = {};
  function letterPiece(txt, c) {
    var k = txt + c; if (letterCache[k]) return letterCache[k];
    var fill = c === 'b' ? '#3a3734' : c === 'n' ? '#8b5fbf' : '#f4f1ea', ink = c === 'b' ? '#f4f1ea' : '#2b2926';
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><circle cx="22.5" cy="22.5" r="17" fill="' + fill + '" stroke="#1d1b19" stroke-width="1.5"/><text x="22.5" y="28" font-family="Arial,Helvetica,sans-serif" font-weight="700" font-size="' + (txt.length > 2 ? 10 : 15) + '" text-anchor="middle" fill="' + ink + '">' + U.esc(txt.slice(0, 4)) + '</text></svg>';
    return (letterCache[k] = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg));
  }
  P.colorOf = function (who) { return who === 'player' || who === 'human' ? this.human : who === 'bot' ? this.botColor : who; };
  P.resolveSquare = function (at, info) {
    var g = this.V.geo, st = this.state, self = this;
    if (typeof at === 'number') return at;
    info = info || {};
    switch (at) {
      case 'to': return info.to != null ? info.to : (this.last ? this.last.t : -1);
      case 'from': return info.from != null ? info.from : (this.last ? this.last.f : -1);
      case 'player_king': return this.V.royals(st, this.human)[0];
      case 'bot_king': return this.V.royals(st, this.botColor)[0];
      case 'king:w': return this.V.royals(st, 'w')[0];
      case 'king:b': return this.V.royals(st, 'b')[0];
      case 'center': return g.idx(Math.floor(g.files / 2), Math.floor(g.ranks / 2));
      case 'random': return U.pick(g.squares());
      case 'board': case 'screen': return at;
    }
    if (typeof at === 'string' && at.indexOf('piece:') === 0) { var t = at.slice(6); for (var i = 0; i < st.b.length; i++) if (st.b[i] && st.b[i].t === t) return i; return -1; }
    return g.parse(at);
  };
  P.resolveSquares = function (list) { var self = this; return (Array.isArray(list) ? list : String(list).split(/[\s,]+/)).map(function (a) { return self.resolveSquare(a); }).filter(function (i) { return i >= 0; }); };
  /* vision set for darkness / fog masks: returns {dist: Int array, 0 visible, 1 edge, 99 dark} */
  P.visionSet = function (m) {
    if (this.hooks.vision) { var hv = this.hooks.vision(this.ctx, m); if (hv) return hv; }
    var g = this.V.geo, st = this.state, me = m.side ? this.colorOf(m.side) : this.human, src = [], dist = new Array(g.size).fill(99), r = m.radius == null ? 1 : m.radius;
    if (this.over && m.reveal_on_end !== false) { dist.fill(0); return { dist: dist }; }
    var srcKind = m.source || 'own_pieces';
    if (srcKind === 'reach') {
      st.b.forEach(function (p, i) { if (p && p.c === me) dist[i] = 0; });
      var tmp = Object.assign({}, st, { turn: me }); this.V.gen(tmp).forEach(function (mv) { dist[mv.t] = 0; });
      return { dist: dist };
    }
    if (srcKind === 'king') src = this.V.royals(st, me);
    else if (srcKind === 'squares') src = this.resolveSquares(m.squares || []);
    else if (srcKind === 'all_pieces') st.b.forEach(function (p, i) { if (p && p.c !== 'n') src.push(i); });
    else st.b.forEach(function (p, i) { if (p && p.c === me) src.push(i); });
    for (var i = 0; i < g.size; i++) { var d = 99; for (var k = 0; k < src.length; k++) { var x = g.dist(i, src[k]); if (x < d) d = x; } dist[i] = d <= r ? 0 : d === r + 1 ? 1 : 99; }
    return { dist: dist };
  };
  P.transformPiece = function (sq, to) { this.ctx.transform(sq, to); this.render({ instant: true }); };

  /* ---------- input ---------- */
  P.canDrag = function (i) {
    var p = this.state.b[i]; if (!p || this.over) return false;
    var mine = p.c === this.human || (p.c === 'n' && this.moves.some(function (m) { return m.f === i; }));
    if (!mine) return false;
    if (this.state.turn !== this.human) return CM.settings.get('premoves') && p.c === this.human;
    return true;
  };
  P.onDragStart = function (i) { if (this.sel !== i) { this.sel = i; this.hand = null; this.justSelected = i; this.render(); } };
  /* A mode's extra action on a square, done with a double-tap instead of a modal picker (Sniper Bishops: tap a target to
     move there, double-tap it to shoot). hooks.canDoubleTap(ctx, sq) says the square has one, hooks.doubleTap(ctx, sq)
     runs it and returns true when it consumed the tap. Without canDoubleTap, any legal move from the selected square
     counts, so a mode that only defines doubleTap still gets the delay it needs. */
  P.canDoubleTap = function (i) {
    var h = this.hooks;
    if (!h.doubleTap || this.over || this.busy || this.state.turn !== this.human) return false;
    /* a mode may offer its extra action without anything selected (Sniper Bishops: double-click any enemy a bishop sees) */
    if (h.canDoubleTap) return !!h.canDoubleTap(this.ctx, i);
    if (this.sel < 0 || this.sel === i) return false;
    return this.moves.some(function (m) { return m.f === this.sel && m.t === i; }, this);
  };
  /* a tap that could become a double-tap waits this long before it becomes an ordinary move - only when the same tap
     would really move a piece, so normal moves keep their instant response */
  P.tapDelay = function (i) {
    if (this.sel < 0 || this.sel === i || !this.canDoubleTap(i)) return 0;
    return this.moves.some(function (m) { return m.f === this.sel && m.t === i; }, this) ? 300 : 0;
  };
  P.onDoubleTap = function (i) {
    if (!this.canDoubleTap(i)) return false;
    if (this.hooks.doubleTap(this.ctx, i) !== true) return false;
    this.justSelected = -1;
    return true;
  };
  /* the same idea on the right button (Portals: double right-click places the orange portal) */
  P.onDoubleRightTap = function (i) {
    if (!this.hooks.doubleRightTap || this.over || this.busy || this.state.turn !== this.human) return false;
    return this.hooks.doubleRightTap(this.ctx, i) === true;
  };
  P.onTap = function (i, o) {
    if (this.over) return;
    var st = this.state, p = st.b[i], myTurn = st.turn === this.human && !this.busy;
    if (o && o.dragCancel) { this.justSelected = -1; this.render(); return; }
    /* impl-4 (g4, inm7KvllVu0 portals): optional game hook hooks.onTap(ctx, square, opts); returning true consumes the tap */
    if (this.hooks.onTap && this.hooks.onTap(this.ctx, i, o || {}) === true) return;
    if (this.hand && myTurn) { var dm = this.moves.find(function (m) { return m.drop === this.hand && m.t === i; }, this); this.hand = null; if (dm) return this.commit(dm, {}); CM.sound.play('illegal'); return this.render(); }
    if (this.justSelected === i) { this.justSelected = -1; return; }
    this.justSelected = -1;
    if (this.sel >= 0 && this.sel !== i) {
      if (!myTurn) { this.setPremove(this.sel, i); return; }
      if (this.moves.some(function (m) { return m.f === this.sel && m.t === i; }, this)) return this.tryMove(this.sel, i, false);
    }
    if (this.premove && !myTurn) { this.premove = null; }
    var selectable = p && (p.c === this.human || this.moves.some(function (m) { return m.f === i; }));
    if (this.sel >= 0 && !selectable && this.sel !== i && myTurn) CM.sound.play('illegal');
    this.sel = selectable && this.sel !== i ? i : -1; this.render();
  };
  P.onDrop = function (f, t, info) {
    /* a mode may read the drag itself instead of a drop square (Launch Pawns: drag backwards to slingshot) */
    if (this.hooks.drop && this.hooks.drop(this.ctx, f, t, info || {}) === true) return;
    if (t < 0) { this.sel = -1; this.render(); return; }
    if (this.state.turn !== this.human || this.busy) { this.setPremove(f, t); return; }
    this.tryMove(f, t, true);
  };
  P.setPremove = function (f, t) {
    if (!CM.settings.get('premoves')) { this.sel = -1; this.render(); return; }
    this.premove = { f: f, t: t }; this.sel = -1; this.render(); CM.sound.play('premove'); /* chess.com premove sound */
  };
  P.tryMove = function (f, t, dragged) {
    var self = this, c = this.moves.filter(function (m) { return m.f === f && m.t === t; });
    if (!c.length) { CM.sound.play('illegal'); this.sel = -1; this.render(); return; }
    /* a mode may add an extra move on the same from/to as an ordinary one (marked special, e.g. snipe / time travel);
       a plain tap always plays the ordinary move, the special one is a double-tap (hooks.doubleTap) */
    var plain = c.filter(function (m) { return !m.special; }); if (plain.length) c = plain;
    var pr = this.V.rules.promotion || {}, auto = pr.auto || (CM.settings.get('autoQueen') && c.some(function (m) { return m.promo === 'Q'; }) ? 'Q' : null);
    if (auto && c[0].promo) c = c.filter(function (m) { return m.promo === auto; }).concat(c.filter(function (m) { return m.promo !== auto; })).slice(0, 1);
    var pick = c.length > 1 && c[0].promo
      ? UI.promote(t, c.map(function (m) { return { type: m.promo, src: self.pieceImage({ t: m.promo, c: m.c }) }; })).then(function (ty) { return c.find(function (m) { return m.promo === ty; }); })
      : Promise.resolve(c.find(function (m) { return m.promo === 'Q'; }) || c[0]);
    var gid = this.gid;
    pick.then(function (m) {
      if (gid !== self.gid) return;
      if (!m) { self.sel = -1; self.render(); return; }
      if (self.hooks.beforeMove && self.hooks.beforeMove(self.ctx, m) === false) { CM.sound.play('illegal'); self.sel = -1; self.render(); return; }
      self.commit(m, { dragged: dragged });
    });
  };

  /* ---------- moves ---------- */
  function counts(b) { var o = {}; b.forEach(function (p) { if (p && p.c !== 'n') { o[p.c] = o[p.c] || {}; o[p.c][p.t] = (o[p.c][p.t] || 0) + 1; } }); return o; }
  P.commit = function (m, o) {
    o = o || {};
    var V = this.V, prev = this.state, mover = prev.turn, by = this.side(mover);
    var capCopy = {}; Object.keys(this.cap).forEach(function (k) { capCopy[k] = this.cap[k].slice(); }, this);
    this.history.push({ state: prev, sans: this.sans.length, cap: capCopy, last: this.last, clock: this.clock ? Object.assign({}, this.clock) : null, opponent: Object.assign({}, this.opponent), knocked: this.knocked.slice() });
    var c0 = counts(prev.b); c0[mover] = c0[mover] || {};
    if (m.promo) { c0[mover][m.p] = (c0[mover][m.p] || 0) - 1; c0[mover][m.promo] = (c0[mover][m.promo] || 0) + 1; }
    if (m.drop) c0[mover][m.drop] = (c0[mover][m.drop] || 0) + 1;
    this.state = m.n || V.make(prev, m);
    var san = V.san(prev, m, this.moves, this.state);
    this.last = m; this.sel = -1; this.hand = null; this._dirty = false;
    /* pol-ui: like chess.com the clocks only start once the first move is made (no time spent, no increment before that) */
    if (this.clock) { if (this.clock.started) { this._clockSpend(mover); if (this.clockCfg.inc) this.clock[mover] += this.clockCfg.inc * 1000; } this.clock.started = true; this.clock.t = performance.now(); }
    var info = this._info(m, prev, mover, by);
    /* hooks.afterMove may return a Promise (scripted sequences: monsters, forced moves); input stays locked until it resolves */
    var ret = null, self = this, gid = this.gid;
    /* a hook that throws must never freeze the game: log it and carry on as if it returned nothing */
    if (this.hooks.afterMove) { try { ret = this.hooks.afterMove(this.ctx, m, info); } catch (e) { console.error(e); ret = null; } }
    var hint = [m.castle ? { f: m.castle.rf, t: m.castle.rt } : null, { f: m.f, t: m.t, dragged: o.dragged }].filter(Boolean);
    if (m.drop) {   /* a drop glides in from its button in the hand (reserve) */
      var hb = document.querySelector('#hand [data-drop="' + String(m.drop).replace(/"/g, '') + '"] img'), hr = hb && hb.getBoundingClientRect();
      if (hr && hr.width) hint.push({ f: -1, t: m.t, from: { x: hr.left + hr.width / 2, y: hr.top + hr.height / 2 } });
    }
    if (ret && typeof ret.then === 'function') {
      this.busy = true; this.moves = []; this.sans.push({ san: san, c: mover }); this.sound(m, false, info.capture); this.render({ hint: hint });
      ret.then(function () { if (gid !== self.gid) return; self.busy = false; self._finishCommit(m, o, info, c0, mover, by, null, true); },
        function (e) { console.error(e); if (gid === self.gid) { self.busy = false; self._finishCommit(m, o, info, c0, mover, by, null, true); } });
      return;
    }
    this._finishCommit(m, o, info, c0, mover, by, san, false, hint);
  };
  P._finishCommit = function (m, o, info, c0, mover, by, san, async, hint) {
    var V = this.V;
    var c1 = counts(this.state.b);
    Object.keys(c0).forEach(function (c) { var got = c === this.human ? this.botColor : (this.V.multi ? mover : this.human); if (c === mover && this.V.multi) return;
      for (var t in c0[c]) { var d = c0[c][t] - ((c1[c] || {})[t] || 0); for (var k = 0; k < d; k++) (this.cap[got] = this.cap[got] || []).push({ t: t, c: c }); } }, this);
    if (!async) this.sans.push({ san: san, c: mover });
    this.emit('move', info);
    this.emit(by === 'player' ? 'player_move' : 'bot_move', info);
    if (info.capture) { this.emit('capture', info); this.emit(by + '_capture', info); }
    if (m.promo) this.emit('promotion', info);
    if (m.castle) this.emit('castle', info);
    this.moves = V.legal(this.state);
    this._knockouts();
    if (!this.over) { var r = V.result(this.state, this.moves); if (r) this.over = r; }
    var chk = !this.over && V.checkRule(this.state.turn) !== 'none' && V.inCheck(this.state, this.state.turn);
    if (chk) { info.check = true; this.emit('check', info); }
    if (!async) this.sound(m, chk, info.capture); else if (chk || this.over) this.sound(m, chk, false);
    this.render(async ? {} : { hint: hint });
    this.afterChange();
  };
  /* multi-player: knock out players with no legal moves or no king; their pieces turn grey */
  P._knockouts = function () {
    var V = this.V; if (!V.multi) return;
    for (var guard = 0; guard < 4; guard++) {
      var ko = V.knockedOut(this.state, this.moves); if (!ko) break;
      this.state = V.eliminate(this.state, ko.c); this.knocked.push(ko.c);
      var pr = this.profile(ko.c); UI.toast((ko.c === this.human ? 'You were ' : (pr.name || ko.c) + ' was ') + ko.why + '.', 2600);
      this.emit('knockout', { side: ko.c, why: ko.why });
      if (ko.c === this.human && !this.over) { this.over = { w: 'd', lost: true, why: 'you were ' + ko.why }; }
      this.moves = V.legal(this.state);
    }
  };
  P._info = function (m, prev, mover, by) {
    var g = this.V.geo;
    return { ply: this.state.ply, side: mover, by: by, piece: m.p, from: m.f, to: m.t, toName: g.name(m.t), fromName: m.f >= 0 ? g.name(m.f) : null,
      capture: !!m.cap, captured: m.cap ? m.cap.t : null, capturedColor: m.cap ? m.cap.c : null, move: m, check: false };
  };
  P.sound = function (m, chk, cap) {
    if (this.over) return;   /* the result cue is played once by finish() */
    CM.sound.play(chk ? 'move-check' : m.promo ? 'promote' : m.castle ? 'castle' : cap ? 'capture' : (m.c === this.human ? 'move-self' : 'move-opponent'));
  };
  /* called after every state change: game over, bot turn, premove */
  P.afterChange = function () {
    var self = this;
    if (this.over) return this.finish();
    if (this.isBot(this.state.turn)) {
      this.busy = true; this.render();
      var gid = this.gid, st = this.state, t0 = performance.now();
      setTimeout(function () {
        if (gid !== self.gid || self.over || self.state !== st) return;
        if (!self.moves.length) { self.busy = false; return; }
        CM.bot.choose(self.V, st, self.moves, Object.assign({}, self.spec.bot, self.opponent.elo != null ? { elo: self.opponent.elo } : {}), self.hooks, self.ctx).then(function (m) {
          if (!m) { self.busy = false; return; }
          if (gid !== self.gid || self.over || self.state !== st) return;
          var wait = Math.max(0, (self.spec.bot.min_ms || 380) - (performance.now() - t0));
          setTimeout(function () { if (gid !== self.gid || self.state !== st) return; self.busy = false; self.commit(m, {}); }, wait);
        }, function (e) {
          /* QA (seventh session): a bot/search/hook error used to leave the game locked (busy forever); log it and play
             the first legal move so the game goes on */
          console.error(e);
          if (gid !== self.gid || self.over || self.state !== st) return;
          self.busy = false; if (self.moves.length) self.commit(self.moves[0], {});
        });
      }, 60);
    } else {
      this.busy = false;
      if (this.hooks.onTurn) this.hooks.onTurn(this.ctx, this.state.turn);
      this.emit('player_turn', {});
      if (this.premove) {
        var pm = this.premove; this.premove = null;
        var c = this.moves.filter(function (m) { return m.f === pm.f && m.t === pm.t; });
        if (c.length) { var m = c.find(function (x) { return x.promo === 'Q'; }) || c[0]; setTimeout(function () { if (self.state.turn === self.human && !self.over) self.commit(m, {}); }, 120); return; }
      }
      this.render();
    }
  };
  P.finish = function () {
    if (UI.controller !== this) return;   /* QA: a result arriving after the player left must not touch the lobby */
    if (this._finished === this.gid) { this.render(); return; }
    this._finished = this.gid; this.busy = false; this.premove = null;
    var w = this.over.w, res = this.over.lost ? 'loss' : w === 'd' ? 'draw' : (w === this.human || (this.V.multi && this.over.team != null && String(this.V.team[this.human]) === String(this.over.team))) ? 'win' : 'loss';
    /* Lichess has separate victory / defeat / draw cues (resignation and flag falls included, they end here) */
    CM.sound.play(res === 'win' ? 'victory' : res === 'loss' ? 'defeat' : 'draw');
    this.render();
    this.emit('game_over', { result: res, why: this.over.why });
    this.emit(res, { why: this.over.why });
    /* impl-6: series win boxes (see seriesBar) */
    var ser = this.spec.params && this.spec.params.series;
    if (ser) { var sk = CM.store.get('g6series.' + this.spec.id, { n: 0, w: 0 }); sk = { n: (sk.n || 0) + 1, w: (sk.w || 0) + (res === 'win' ? 1 : 0) }; seriesPaint(ser, sk); if (ser.boxes && sk.w >= ser.boxes) { UI.toast(ser.boxes + ' wins!'); sk = { n: sk.n, w: 0 }; } CM.store.set('g6series.' + this.spec.id, sk); }
    /* a mode that continues (level ladders) returns true: it shows its own result panel instead of the game-over modal */
    var handled = this.hooks.onGameOver ? this.hooks.onGameOver(this.ctx, this.over) === true : false;
    var msgs = this.spec.messages || {};
    var oppP = this.V.multi && w !== 'd' && w !== this.human ? this.profile(w) : this.opponent;
    /* a mode with a line-up of opponents keeps going (seriesBar rotates the next one), so the button says so */
    var moreOpp = !!(ser && ser.opponents && ser.opponents.length > 1);
    if (!handled) UI.showOver({ result: res, why: (msgs[res] || this.over.why), title: msgs[res + '_title'], newLabel: moreOpp ? 'Next game' : null, you: Object.assign({}, this.spec.player), opp: { name: oppP.name, avatar: oppP.avatar || defaultAvatar(oppP.name) } });
    UI.vfx.refreshMask();
  };
  P.undo = function () {
    if (!this.history.length || (this.busy && !this.over)) return;
    GID++; this.gid = GID; var h;
    do { h = this.history.pop(); } while (this.history.length && h.state.turn !== this.human);
    this.state = h.state; this.sans.length = h.sans; this.cap = h.cap; this.last = h.last; this.over = null; this._finished = null; this.sel = -1; this.premove = null; this.busy = false; this.knocked = h.knocked || [];
    UI.vfx.clear('overlay'); if (this.hooks.onUndo) this.hooks.onUndo(this.ctx);
    if (h.clock) this.clock = Object.assign({}, h.clock, { t: performance.now() });
    this.opponent = h.opponent;
    this.moves = this.V.legal(this.state); UI.hideOver(); this.render({ instant: false });
    this.afterChange();
  };
  P.flip = function () { this.userFlip = !this.userFlip; this.render({ instant: true }); UI.vfx.refreshMask(); };
  P.resign = function () { if (this.over) return; this.over = { w: this.botColor, why: 'you resigned' }; this.finish(); };
  P._clockSpend = function (c) { var now = performance.now(); if (this.clock) { this.clock[c] -= now - this.clock.t; this.clock.t = now; } };
  P.tick = function () {
    if (this.events && !this.over) this.events.tick();
    if (this.hooks.onTick && !this.over) this.hooks.onTick(this.ctx, performance.now());
    if (this._dirty) { this._dirty = false; this.moves = this.V.legal(this.state); this.render(); }
    if (!this.clock || this.over) return;
    if (!this.clock.started) { this.clock.t = performance.now(); this._renderClocks(); return; }  /* pol-ui: waiting for the first move; hooks reading clock[c] - (now - t) see the full time */
    var c = this.state.turn, left = this.clock[c] - (performance.now() - this.clock.t);
    if (left <= 0 && (c === this.human || this.clockCfg.bot)) { this.clock[c] = 0; this.over = { w: c === 'w' ? 'b' : 'w', why: (c === this.human ? 'you' : this.opponent.name) + ' ran out of time' }; this.finish(); return; }
    this._renderClocks();
  };
  P._renderClocks = function () {
    if (!this.clock) { UI.setClocks(null); return; }
    var now = performance.now(), c = this.state.turn, live = function (x) { return this.clock[x] - (!this.over && c === x ? now - this.clock.t : 0); }.bind(this);
    var flip = this.flipped(), top = flip ? 'w' : 'b';
    UI.setClocks({ top: live(top), bottom: live(top === 'w' ? 'b' : 'w'), running: this.over || !this.clock.started ? null : (c === top ? 'top' : 'bottom') });
  };

  /* ---------- rendering ---------- */
  P.render = function (o) {
    if (UI.controller !== this) return;
    var V = this.V, g = V.geo, st = this.state, self = this, sqs = new Array(g.size);
    var targets = {}, capT = {};
    if (this.sel >= 0 && CM.settings.get('legalDots')) {
      var src = this.state.turn === this.human && !this.busy ? this.moves : V.gen(Object.assign({}, st, { turn: this.human }));
      src.forEach(function (m) { if (m.f === self.sel) { targets[m.t] = 1; if (m.cap) capT[m.t] = 1; } });
    }
    if (this.hand) this.moves.forEach(function (m) { if (m.drop === self.hand) targets[m.t] = 1; });
    var checkSq = {}; V.colors.forEach(function (c) { if (V.checkRule(c) !== 'none' && !(st.out && st.out[c]) && V.inCheck(st, c)) V.royals(st, c).forEach(function (k) { if (V.royalAttacked(st, k, c)) checkSq[k] = 1; }); });
    var hidden = null;
    if (V.rules.fog && !this.over) { var vs = this.visionSet({ source: 'reach' }); hidden = vs.dist; }
    var zones = {}; var bs = this.spec.board.squares || {};
    Object.keys(bs).forEach(function (n) { var i = g.parse(n); if (i >= 0) zones[i] = bs[n]; });
    for (var i = 0; i < g.size; i++) {
      if (!g.valid[i]) { sqs[i] = { valid: false }; continue; }
      var p = st.b[i], cls = [], html = '';
      var lastOn = CM.settings.get('lastMove') && this.last && (this.last.t === i || this.last.f === i);
      if (lastOn) cls.push('is-last');
      if (this.sel === i) cls.push('is-sel');
      if (this.premove && (this.premove.f === i || this.premove.t === i)) cls.push('is-premove');
      if (checkSq[i]) cls.push('is-check');
      if (targets[i]) cls.push(capT[i] || (p && p.c !== this.human) ? 'is-target-cap' : 'is-target');
      var z = zones[i]; if (z) { if (z.color) html += '<span class="sq-tint" style="background:' + U.esc(z.color) + '"></span>'; if (z.image) html += '<img class="sq-tint" alt="" style="width:100%;height:100%;object-fit:cover;opacity:' + (z.opacity != null ? z.opacity : 1) + '" src="' + U.esc(z.image) + '">'; /* impl-6: square art copied from the video (walls, hill) */ if (z.label) html += '<span class="sq-label">' + U.esc(z.label) + '</span>'; if (z.cls) cls.push(z.cls); }
      var piece = null, fogged = hidden && hidden[i] && p && p.c !== this.human && !V.def(p.t).blocker;
      if (this.hooks.visible && !this.over && p && p.c !== this.human && this.hooks.visible(this.ctx, i, p) === false) fogged = true;
      if (p && !fogged) {
        var d = V.def(p.t);
        if (d.overlay) html += '<span class="blk blk--' + d.overlay + '"></span>';
        else piece = { src: this.pieceImage(p), key: p.t + p.c + (p.id || ''), badge: p.badge || (d.glyph ? d.badge : null), label: (p.c === 'w' ? 'white ' : p.c === 'b' ? 'black ' : p.c === 'n' ? 'neutral ' : '') + (d.name || p.t),
          cls: (p.dead ? 'pc--dead' : p.c === 'n' ? (d.neutralGlow === false || d.img ? '' : 'pc--neutral') : (p.c !== 'w' && p.c !== 'b' && !(d.img && typeof d.img === 'object' && d.img[p.c]) ? 'pc--tint-' + p.c : '') /* impl-6: no CSS tint when the type ships its own art for that colour (Chaturaji boats from the video) */) + (p.cls ? ' ' + p.cls : '') + (d.cls ? ' ' + d.cls : '') };
      }
      if (hidden && hidden[i]) cls.push('is-fog');
      if (this.hooks.decorate) { var dec = this.hooks.decorate(this.ctx, i, p); if (dec) { if (dec.cls) cls.push(dec.cls); if (dec.html) html += dec.html; if (dec.badge && piece) piece.badge = dec.badge; if (dec.hidePiece) piece = null; if (dec.img && piece) piece.src = dec.img; } }
      sqs[i] = { valid: true, piece: piece, cls: cls.join(' '), html: html };
    }
    UI.board.on({ canDrag: this.canDrag.bind(this), onTap: this.onTap.bind(this), onDrop: this.onDrop.bind(this), onDragStart: this.onDragStart.bind(this),
      onDoubleTap: this.onDoubleTap.bind(this), onDoubleRightTap: this.onDoubleRightTap.bind(this), tapDelay: this.tapDelay.bind(this) });
    var vp = this.spec.board.viewport, follow = null;
    if (vp) { follow = this.hooks.camera ? this.hooks.camera(this.ctx) : this.resolveSquare(vp.follow || 'player_king'); if (follow == null || follow < 0) follow = this._lastFollow; this._lastFollow = follow; }
    var selfH = this;
    UI.board.render({ files: g.files, ranks: g.ranks, flip: this.flipped(), squares: sqs, follow: follow, home: function () { try { return selfH.resolveSquare('player_king'); } catch (_) { return null; } }, name: { rank: function (i) { return g.rank(i); }, file: function (i) { return g.fileName(g.col(i)); }, sq: function (i) { return g.name(i); } } }, o || {});
    /* chrome */
    /* g6 fix: a flipped board shows White at the top, so with 2 players the top card is White's (was: flip ? human : bot,
       which put "You" on top when playing Black). Multi-player keeps human/bot placement.
       g5 addition: in multi-player a human seated as colour 'b' is drawn at the bottom by the auto-flip, so the human
       card goes on top only after a manual Flip. */
    var flip = this.flipped(), twoWB = !V.multi && V.colors.indexOf('w') >= 0 && V.colors.indexOf('b') >= 0;
    var humanTop = flip !== (this.human === 'b');
    var topC = twoWB ? (flip ? 'w' : 'b') : (humanTop ? this.human : this.botColor), botC = twoWB ? (flip ? 'b' : 'w') : (humanTop ? this.botColor : this.human);
    var topP = this.profile(topC), botP = this.profile(botC), self2 = this;
    var others = !V.multi ? [] : V.colors.filter(function (c) { return c !== self2.human && c !== self2.botColor; }).map(function (c) { var pr = self2.profile(c); return { name: pr.name, short: pr.name, avatar: pr.avatar, swatch: pr.swatch, active: st.turn === c && !self2.over, out: !!(st.out && st.out[c]) }; });
    UI.setPlayers({ top: { name: topP.name, rating: topP.rating, avatar: topP.avatar || defaultAvatar(topP.name) }, bottom: { name: botP.name, rating: botP.rating, avatar: botP.avatar || defaultAvatar(botP.name) }, others: others });
    UI.setOpponentCard({ avatar: this.opponent.avatar || defaultAvatar(this.opponent.name), name: this.opponent.name, rating: this.opponent.rating, tagline: this.opponent.tagline || this.spec.description });
    var mat = function (list) { return list.reduce(function (a, x) { var d = V.def(x.t); return a + (d.royal ? 0 : Math.round(d.value / 100)); }, 0); };
    var imgs = function (list) { var o2 = 'PNBRQ'; return list.slice().sort(function (a, b) { return (o2.indexOf(a.t) + 10) % 15 - (o2.indexOf(b.t) + 10) % 15; }).map(function (x) { return self.pieceImage(x); }); };
    var capOf = function (c) { return self.cap[c] || []; };
    var adv = mat(capOf(topC)) - mat(capOf(botC));
    if (V.winTypes.points) { var sc = st.score || {}; adv = (sc[topC] || 0) - (sc[botC] || 0); }
    UI.setCaptured(imgs(capOf(topC)), imgs(capOf(botC)), adv > 0 ? adv : 0, adv < 0 ? -adv : 0);
    UI.setActive(this.over ? null : (st.turn === topC ? 'top' : 'bottom'));
    UI.setThinking(this.busy && !this.over ? (CM.stockfish.state() === 'loading' ? 'Loading engine…' : 'Thinking…') : '');
    UI.setMoves(this.sans);
    UI.setUndoEnabled(this.history.length > 0 && (!this.busy || !!this.over));
    this._renderHand();
    this._renderClocks();
    /* modes without a status hook still get a one-line goal, so the objective is always on screen */
    UI.setStatus(this.hooks.status ? this.hooks.status(this.ctx) : goalLine(this.spec));
    UI.vfx.refreshMask();
  };
  var goalCache = {};
  function goalLine(s) {
    var k = s.id || s.name || '', t = goalCache[k];
    if (t != null) return t;
    t = String(s.how_to_win || '').replace(/\s+/g, ' ').trim();
    var cut = t.search(/\.(\s|$)/); if (cut > 0) t = t.slice(0, cut + 1);
    if (t.length > 118) t = t.slice(0, 115).replace(/[,;:\s]+$/, '') + '\u2026';
    return (goalCache[k] = t);
  }
  P._renderHand = function () {
    var el = document.getElementById('hand'), self = this, bar = document.getElementById('card-bottom');
    if (!this.V.rules.drops) { el.innerHTML = ''; return; }
    if (el.parentNode !== bar) bar.insertBefore(el, document.getElementById('clock-bottom'));
    document.getElementById('capw').style.display = this.flipped() ? '' : 'none';
    var h = this.state.hands[this.human], seen = {};
    el.innerHTML = h.filter(function (t) { if (seen[t]) return false; seen[t] = 1; return true; }).map(function (t) {
      return '<button type="button" data-drop="' + U.esc(t) + '" aria-pressed="' + (self.hand === t) + '"><img src="' + self.pieceImage({ t: t, c: self.human }) + '" alt=""><small>' + h.filter(function (x) { return x === t; }).length + '</small></button>';
    }).join('');
    el.onclick = function (e) { var b = e.target.closest('[data-drop]'); if (!b || self.over || self.state.turn !== self.human) return; self.sel = -1; self.hand = self.hand === b.dataset.drop ? null : b.dataset.drop; self.render(); };
  };

  /* ---------- ctx: the API hooks and events use ---------- */
  function makeCtx(G) {
    var ctx = {
      get state() { return G.state; }, set state(s) { G.state = s; G._dirty = true; },
      get V() { return G.V; }, get geo() { return G.V.geo; }, get spec() { return G.spec; }, get params() { return G.spec.params || {}; },
      get hooks() { return G.hooks; }, get human() { return G.human; }, get bot() { return G.botColor; }, get ply() { return G.state.ply; }, get colors() { return G.V.colors; },
      get x() { return G.state.x; }, get over() { return G.over; }, get last() { return G.last; }, get opponent() { return G.opponent; },
      sq: function (name) { return G.V.geo.parse(name); }, name: function (i) { return G.V.geo.name(i); },
      at: function (i) { return G.state.b[typeof i === 'string' ? G.V.geo.parse(i) : i]; },
      colorOf: function (who) { return G.colorOf(who); },
      resolveSquare: function (a, info) { return G.resolveSquare(a, info); },
      piece: function (t, c, extra) { return G.V.piece(t, G.colorOf(c), extra); },
      /* mutations (copy-on-write on the live state; legal moves are recomputed by refresh()) */
      set: function (i, p) { i = typeof i === 'string' ? G.V.geo.parse(i) : i; if (i < 0 || !G.V.geo.valid[i]) return; G.state.b[i] = p; G._dirty = true; },
      spawn: function (t, c, i, props) { ctx.set(i, G.V.piece(t, G.colorOf(c), props)); },
      remove: function (i) { ctx.set(i, null); },
      move: function (f, t) { var p = ctx.at(f); ctx.set(f, null); ctx.set(t, p); },
      transform: function (i, to) { var p = ctx.at(i); if (!p) return; var np = Object.assign({}, p); if (to.type) np.t = to.type; if (to.color) np.c = to.color; if (to.props) Object.assign(np, to.props); ctx.set(i, np); },
      setX: function (k, v) { var x = Object.assign({}, G.state.x); x[k] = v; G.state.x = x; },
      emptySquares: function (filter) { var o = []; for (var i = 0; i < G.V.geo.size; i++) if (G.V.geo.valid[i] && !G.state.b[i] && (!filter || filter(i))) o.push(i); return o; },
      pieces: function (filter) { var o = []; G.state.b.forEach(function (p, i) { if (p && (!filter || filter(p, i))) o.push(i); }); return o; },
      moveToward: function (o) {
        var g = G.V.geo, st = G.state, color = G.colorOf(o.color || 'n');
        ctx.pieces(function (p) { return p.t === o.type && p.c === color; }).forEach(function (from) {
          var target = o.target === 'nearest_enemy' ? nearest(from) : G.resolveSquare(o.target || 'player_king');
          if (target == null || target < 0) return; var cur = from;
          for (var s = 0; s < (o.steps || 1); s++) {
            var best = -1, bd = 1e9;
            for (var dc = -1; dc <= 1; dc++) for (var dr = -1; dr <= 1; dr++) { if (!dc && !dr) continue; var j = g.step(cur, dc, dr); if (j < 0) continue; var q = st.b[j]; if (q && (q.c === color || (!o.captures && j !== target))) continue; var d = g.dist(j, target); if (d < bd) { bd = d; best = j; } }
            if (best < 0) break;
            var victim = st.b[best];
            ctx.move(cur, best); cur = best;
            if (victim && G.V.def(victim.t).royal && o.win_on_reach !== false) { ctx.endGame(victim.c === 'w' ? 'b' : 'w', (o.why || (G.V.def(o.type).name || 'the monster') + ' reached the king')); break; }
            if (victim) ctx.trigger('neutral_capture', { to: best, captured: victim.t });
            if (best === target) break;
          }
        });
        function nearest(from) { var bd = 1e9, b = -1; st.b.forEach(function (p, i) { if (p && p.c !== color && p.c !== 'n') { var d = g.dist(i, from); if (d < bd) { bd = d; b = i; } } }); return b; }
      },
      /* presentation */
      fx: function (e, info) { return CM.gameUI.vfx.play(e, info || {}); },
      clearFx: function (type) { CM.gameUI.vfx.clear(type); },
      sound: function (n) { CM.gameUI.vfx.sound(n); },
      toast: function (t, ms) { CM.gameUI.toast(t, ms); },
      trigger: function (name, info) { G.emit(name.indexOf('event:') === 0 ? name : 'event:' + name, info || {}); },
      setOpponent: function (o) { Object.assign(G.opponent, o); G.render(); },
      refresh: function (o) { G._dirty = false; G.moves = G.V.legal(G.state); if (!G.over) { var r = G.V.result(G.state, G.moves); if (r) G.over = r; } G.render(o); if (G.over) G.finish(); },   /* o.instant: skip the slide (an ability fx already moved the pieces) */
      endGame: function (winner, why) { if (G.over) return; var w = winner === 'player' ? G.human : winner === 'bot' ? G.botColor : winner; G.over = { w: w || 'd', why: why || '' }; G.finish(); },
      after: function (ms, fn) { var gid = G.gid; setTimeout(function () { if (gid === G.gid) fn(); }, ms); },
      random: function (n) { return U.rand(n); }, chance: function (p) { return Math.random() < p; }, pick: U.pick,
      game: G
    };
    return ctx;
  }

  CM.SpecGame = SpecGame;
})();
