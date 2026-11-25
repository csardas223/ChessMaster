/* Bot move selection for spec-driven modes.
   Decides between Stockfish (standard-compatible positions) and the built-in search, then applies a
   playing style. Spec: "bot": { engine: 'auto'|'stockfish'|'search'|'random', elo, style, depth, time_ms, p } */
(function () {
  'use strict';
  var CM = window.CM, U = CM.util;

  var eloStrength = function (e) { return Math.max(0, Math.min(1, (e - 250) / 3350)); };
  function pickByStrength(L, st) {
    if (L.length < 2) return L[0];
    if (Math.random() < st * st) return L[0];
    var k = Math.max(2, Math.ceil(L.length * (1 - st)));
    return L[U.rand(Math.min(k, L.length))];
  }
  var STYLES = {
    best: function (L) { return L[0]; },
    worst: function (L) { return L[L.length - 1]; },
    second: function (L) { return L[Math.min(1, L.length - 1)]; },
    random: function (L) { return U.pick(L); },
    top3: function (L) { return L[U.rand(Math.min(3, L.length))]; },
    nth_half: function (L) { var n = 0; while (n < L.length - 1 && Math.random() < 0.5) n++; return L[n]; },  /* P(n) = (1/2)^n */
    blunder5: function (L) { return Math.random() < 0.05 ? U.pick(L) : L[0]; },
    mix: function (L, o) { return Math.random() < (o.p == null ? 0.5 : o.p) ? L[0] : U.pick(L); },
    drawish: function (L) { return L.reduce(function (a, b) { return Math.abs(b.v) < Math.abs(a.v) ? b : a; }); },
    aggro: function (L) { var a = L.filter(function (x) { return x.m.cap; }); return a.length && Math.random() < 0.7 ? a[0] : L[0]; }
  };
  /* is this variant+position something stock Stockfish can play? */
  function stockfishCompatible(V) {
    var c = V.cfg, r = V.rules;
    if (V.geo.files !== 8 || V.geo.ranks !== 8 || V.geo.wrapFiles) return false;
    for (var i = 0; i < 64; i++) if (!V.geo.valid[i]) return false;
    if (V.multi || typeof r.check === 'object' || r.check !== 'standard' || r.drops || r.atomic || r.gravity || r.forcedCapture || r.movesPerTurn || r.friendlyCapture || r.fog) return false;
    var W = Object.keys(V.winTypes); if (W.length !== 1 || W[0] !== 'checkmate') return false;
    if (c.pieces && Object.keys(c.pieces).some(function (k) { return 'PNBRQK'.indexOf(k) < 0 || c.pieces[k].moves; })) return false;
    var h = V.hooks; if (h.moves || h.filterMoves || h.onMake || h.checkWin || h.attacks) return h.stockfishOk === true;
    return true;
  }
  function positionStandard(V, st) {
    var kings = { w: 0, b: 0 };
    for (var i = 0; i < st.b.length; i++) { var p = st.b[i]; if (!p) continue; if (p.c === 'n' || 'PNBRQK'.indexOf(p.t) < 0) return false; if (p.t === 'K') kings[p.c]++; }
    return kings.w === 1 && kings.b === 1 && !V.inCheck(st, V.opp(st.turn));
  }

  /* choose(V, st, moves, botCfg) -> Promise<move> */
  function choose(V, st, moves, cfg, hooks, ctx) {
    cfg = cfg || {};
    var engine = cfg.engine || 'auto', style = cfg.style || 'elo', elo = cfg.elo == null ? 1600 : cfg.elo;
    var useSF = (engine === 'stockfish' || engine === 'auto') && (style === 'elo' || style === 'best') && stockfishCompatible(V) && positionStandard(V, st) && elo >= 1320 && !(hooks && hooks.botPick);
    if (engine === 'random') return Promise.resolve(U.pick(moves));
    /* a king left en prise (random-move modes, check-free colours) is always taken */
    var kc = moves.filter(function (m) { return m.cap && V.def(m.cap.t).royal && V.isEnemy(m.c, m.cap.c); });
    if (kc.length && cfg.style !== 'worst' && !(hooks && hooks.botPick)) return Promise.resolve(kc[0]);
    var viaSearch = function () {
      var S = new CM.Search(V, {}), L = S.rank(st, { moves: moves, maxDepth: cfg.depth || 4, timeMs: cfg.time_ms || 650 });
      if (hooks && hooks.botPick) { var m = hooks.botPick(ctx, L); if (m) return m.m || m; }
      var f = STYLES[style];
      var pick = f ? f(L, cfg) : pickByStrength(L, eloStrength(elo));
      return (pick || L[0]).m;
    };
    if (useSF) {
      return CM.stockfish.ask(V.toFEN(st), { movetime: cfg.time_ms || 600, elo: elo }).then(function (u) {
        var m = u && V.fromUCI(moves, u);
        return m || viaSearch();
      });
    }
    return new Promise(function (res) { setTimeout(function () { res(viaSearch()); }, 10); });
  }

  CM.bot = { choose: choose, STYLES: STYLES, stockfishCompatible: stockfishCompatible, eloStrength: eloStrength, pickByStrength: pickByStrength };
})();
