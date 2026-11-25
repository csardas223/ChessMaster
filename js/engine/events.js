/* Declarative game events for spec modes (spec.events). Game-level only: they run on the real game, never
   inside the search, so they may be random. Each event: { id, when: <trigger>, do: [actions], once, chance }.
   <trigger> uses the same vocabulary as vfx_timeline triggers (see ARCHITECTURE.md). Actions run through the
   game ctx, so anything an event can do a hook can do too. */
(function () {
  'use strict';
  var CM = window.CM, U = CM.util;

  function Events(game, list) {
    this.game = game; this.list = (list || []).map(function (e, k) { return Object.assign({ _k: k, _t: CM.vfxParse.trigger(e.when || e.trigger) }, e); });
    this.fired = {}; this.t0 = performance.now();
  }
  Events.prototype.trigger = function (name, info) {
    var self = this;
    this.list.forEach(function (e) {
      if (e.once && self.fired[e._k]) return;
      if (!CM.VFX.prototype._matches(e._t, name, info || {})) return;
      if (e.chance != null && Math.random() >= e.chance) return;
      self.fired[e._k] = (self.fired[e._k] || 0) + 1;
      self.run(e, info || {});
    });
  };
  Events.prototype.tick = function () {
    var t = performance.now() - this.t0, self = this;
    this.list.forEach(function (e) {
      var tr = e._t;
      if (tr.kind === 'time' && !self.fired[e._k] && t >= tr.n) { self.fired[e._k] = 1; self.run(e, {}); }
      else if (tr.kind === 'every_ms' && tr.n > 0) { var due = Math.floor(t / tr.n); if (due > (self.fired[e._k] || 0)) { self.fired[e._k] = due; if (e.chance == null || Math.random() < e.chance) self.run(e, {}); } }
    });
  };
  Events.prototype.run = function (e, info) {
    var ctx = this.game.ctx, acts = Array.isArray(e.do) ? e.do : [e.do];
    acts.forEach(function (a) { if (a) runAction(ctx, a, info); });
    ctx.refresh();
  };

  function squaresFor(ctx, at, info, filter) {
    if (at == null || at === 'random' || at === 'random_empty' || at === 'random_piece') {
      var all = [];
      for (var i = 0; i < ctx.geo.size; i++) if (ctx.geo.valid[i] && filter(i)) all.push(i);
      return U.shuffle(all);
    }
    var r = ctx.resolveSquare(at, info);
    if (typeof r === 'number') return r >= 0 ? [r] : [];
    return ctx.geo.parseList(at);
  }
  function runAction(ctx, a, info) {
    var st = ctx.state, V = ctx.V;
    if (a.spawn) {
      var s = a.spawn, rows = s.rows, n = s.count || 1;
      var sq = squaresFor(ctx, s.at || 'random_empty', info, function (i) { return !st.b[i] && (!rows || rows.indexOf(ctx.geo.rank(i)) >= 0); });
      sq.slice(0, n).forEach(function (i) { ctx.spawn(s.type, s.color || 'n', i, s.props); });
    }
    if (a.remove) {
      var r = a.remove, types = r.types;
      var rs = squaresFor(ctx, r.at || 'random_piece', info, function (i) { var p = st.b[i]; return p && (!r.color || p.c === ctx.colorOf(r.color)) && (!types || types.indexOf(p.t) >= 0) && !V.def(p.t).royal; });
      rs.slice(0, r.count || 1).forEach(function (i) { ctx.remove(i); });
    }
    if (a.transform) {
      var t = a.transform;
      var ts = squaresFor(ctx, t.at || 'random_piece', info, function (i) { var p = st.b[i]; return p && (!t.color || p.c === ctx.colorOf(t.color)) && (!t.from || t.from.indexOf(p.t) >= 0); });
      ts.slice(0, t.count || 1).forEach(function (i) { ctx.transform(i, { type: t.to, color: t.to_color ? ctx.colorOf(t.to_color) : undefined }); if (t.fx !== false) ctx.fx({ type: 'piece_transform', at: i, style: t.fx || 'flip' }); });
    }
    if (a.move_toward) ctx.moveToward(a.move_toward);
    if (a.fx || a.vfx) ctx.fx(a.fx || a.vfx, info);
    if (a.message) ctx.toast(a.message);
    if (a.sound) ctx.sound(a.sound);
    if (a.set) { var x = Object.assign({}, st.x); x[a.set.key] = a.set.value; st.x = x; }
    if (a.hook) { var h = ctx.hooks[a.hook]; if (h) h(ctx, info, a); else console.warn('[events] no hook named ' + a.hook); }
    if (a.trigger) ctx.trigger(a.trigger, info);
    if (a.end) ctx.endGame(a.end.winner, a.end.why || a.end.reason);
  }

  CM.Events = Events;
  CM.events = { runAction: runAction };
})();
