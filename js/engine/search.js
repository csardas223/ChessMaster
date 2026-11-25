/* Alpha-beta search for spec-driven variants. Generic (works with any Variant), iterative deepening with a
   time budget, capture-first ordering, a short capture-only quiescence, and turn-aware negation so that
   multi-move turns (the same side moving again) are handled. Returns every root move with a score so bot
   policies (elo noise, "worst move", "2nd best", ...) can choose among them. */
(function () {
  'use strict';
  var CM = window.CM;
  var MATE = 100000;

  function Search(V, opts) {
    this.V = V; this.opts = opts || {};
    this.nodes = 0; this.deadline = Infinity; this.aborted = false;
  }
  Search.prototype._time = function () {
    if ((++this.nodes & 255) === 0 && performance.now() > this.deadline) this.aborted = true;
    return this.aborted;
  };
  Search.prototype.score = function (st) { return this.V.evalFor(st, st.turn); };
  function order(V, ms) {
    return ms.sort(function (a, b) {
      var va = a.cap ? V.def(a.cap.t).value * 10 - V.def(a.p).value / 10 : 0;
      var vb = b.cap ? V.def(b.cap.t).value * 10 - V.def(b.p).value / 10 : 0;
      if (a.promo) va += 800; if (b.promo) vb += 800;
      return vb - va;
    });
  }
  Search.prototype.qs = function (st, a, b, depth) {
    var stand = this.score(st);
    if (depth <= 0) return stand;
    if (stand >= b) return stand;
    if (stand > a) a = stand;
    var V = this.V, ms = V.gen(st).filter(function (m) { return m.cap; });
    if (!ms.length) return stand;
    order(V, ms);
    for (var i = 0; i < ms.length; i++) {
      if (this._time()) break;
      var m = ms[i], n = V.make(st, m);
      if (V.checkRule(st.turn) !== 'none' && V.inCheck(n, st.turn)) continue;
      var sc = n.turn === st.turn ? this.qs(n, a, b, depth - 1) : -this.qs(n, -b, -a, depth - 1);
      if (sc >= b) return sc;
      if (sc > a) a = sc;
    }
    return a;
  };
  Search.prototype.nega = function (st, d, a, b) {
    var V = this.V;
    if (this._time()) return 0;
    var ms = V.legal(st), r = V.result(st, ms);
    if (r) return r.w === 'd' ? 0 : (r.w === st.turn ? MATE + d : -MATE - d);
    if (d <= 0) return this.opts.quiescence === false ? this.score(st) : this.qs(st, a, b, 3);
    order(V, ms);
    var best = -Infinity;
    for (var i = 0; i < ms.length; i++) {
      var m = ms[i];
      var v = m.n.turn === st.turn ? this.nega(m.n, d - 1, a, b) : -this.nega(m.n, d - 1, -b, -a);
      if (v > best) best = v; if (v > a) a = v; if (a >= b) break;
    }
    return best;
  };
  /* multi-player (3-4 colours): paranoid search, the root colour maximises and every other colour minimises its score */
  Search.prototype.para = function (st, d, root, a, b) {
    var V = this.V;
    if (this._time()) return 0;
    var r = V.result(st, []); if (r && r.w !== undefined && (r.w === 'd' || V.alive(st).length <= 1)) return r.w === root ? MATE + d : r.w === 'd' ? 0 : -MATE - d;
    if (d <= 0) return V.evalFor(st, root);
    var ms = V.legal(st);
    if (!ms.length) { var ko = V.eliminate(st, st.turn); return this.para(ko, d - 1, root, a, b); }
    order(V, ms);
    if (ms.length > 24) ms = ms.slice(0, 24);
    var maxi = st.turn === root, best = maxi ? -Infinity : Infinity;
    for (var i = 0; i < ms.length; i++) {
      var v = this.para(ms[i].n, d - 1, root, a, b);
      if (maxi) { if (v > best) best = v; if (v > a) a = v; } else { if (v < best) best = v; if (v < b) b = v; }
      if (a >= b) break;
    }
    return best;
  };
  /* rank(st, {maxDepth, timeMs}) -> [{m, v}] best first (v from the mover's point of view) */
  Search.prototype.rank = function (st, o) {
    o = o || {}; var V = this.V;
    var ms = o.moves || V.legal(st);
    if (!ms.length) return [];
    var maxD = o.maxDepth || 4, t0 = performance.now(), budget = o.timeMs || 700;
    var big = ms.length > 45 || V.geo.size > 100;
    if (big) maxD = Math.min(maxD, 3);
    if (V.multi) maxD = Math.min(maxD, 3);
    if (V.geo.size > 400) maxD = Math.min(maxD, 2);
    var ranked = ms.map(function (m) { return { m: m, v: 0 }; }), done = null;
    for (var d = 1; d <= maxD; d++) {
      this.deadline = t0 + budget; this.aborted = false;
      var cur = [];
      order(V, ms);
      for (var i = 0; i < ms.length; i++) {
        var m = ms[i];
        /* full window at the root: every move gets an exact score, which the bot policies need */
        var v = V.multi ? this.para(m.n, d - 1, st.turn, -Infinity, Infinity)
          : m.n.turn === st.turn ? this.nega(m.n, d - 1, -Infinity, Infinity) : -this.nega(m.n, d - 1, -Infinity, Infinity);
        if (this.aborted) break;
        cur.push({ m: m, v: v });
      }
      if (this.aborted && d > 1) break;
      if (cur.length === ms.length) done = cur;
      if (performance.now() - t0 > budget * 0.45) break;
    }
    ranked = done || ranked;
    ranked.forEach(function (x) { x.v += Math.random() * (o.noise == null ? 4 : o.noise); });
    return ranked.sort(function (x, y) { return y.v - x.v; });
  };

  CM.Search = Search;
  CM.MATE = MATE;
})();
