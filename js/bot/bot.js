/* Bot move selection for spec-driven modes.
   Picks the engine (CM.bot.engineFor), then applies a playing style. Spec: "bot": { engine: 'auto'|'maia'|'stockfish'|
   'search'|'random', elo, style, depth, time_ms, p }.
   pol-human engine choice for standard-rules positions (8x8, PNBRQK, checkmate, no rule hooks), style 'elo'/'best':
     - data/bot_engines.js (CM_DATA.botEngines[modeId]) can pin { engine: 'maia'|'stockfish', stockfish: '10'|'17'|'19' }
       (a mode whose video used an older Stockfish plays that real build);
     - style 'best', or an engine-named opponent (Stockfish, Komodo, ...) rated >= 1320, or anyone rated > 2150 (beyond Maia's top 1900 net): Stockfish with UCI_Elo;
     - everyone else (chess.com bots, people, anything rated < 1320): Maia, the human-move net of the nearest rating bucket
       (1100..1900), sampled with a little temperature (more below 1100, plus some random moves far below it).
   Fallbacks: Maia unavailable -> Stockfish (rating >= 1320) -> CM.Search; Stockfish unavailable -> CM.Search.
   Variants and non-standard positions always use CM.Search. */
(function () {
  'use strict';
  var CM = window.CM, U = CM.util;

  var eloStrength = function (e) { return Math.max(0, Math.min(1, (e - 250) / 3350)); };
  /* A player of strength st considers the top (1-st) share of the moves and leans towards the best of them.
     QA: the old version played a random move from the WORST (1-st) share 84% of the time at elo 1600, which made
     every variant bot feel like it was throwing the game; now strength interpolates from "random legal move"
     (st 0) to "always the best move" (st 1) without ever preferring a bad move over a good one. */
  function pickByStrength(L, st) {
    if (L.length < 2) return L[0];
    st = Math.max(0, Math.min(1, st));
    var k = Math.max(1, Math.min(L.length, Math.round(1 + (1 - st) * (L.length - 1))));
    var r = Math.pow(Math.random(), 1 + 2.5 * st);   /* high strength -> near 0 -> the best move */
    return L[Math.min(k - 1, Math.floor(r * k))];
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

  var ENGINE_NAME = /stockfish|komodo|leela|\blc0\b|alpha ?zero|houdini|rybka|torch|dragon by komodo|engine|fish\b/i;
  function modeId(ctx) { return ctx && ctx.spec && ctx.spec.id; }
  /* a mode's opponent rating is the advertised strength ("Stockfish 3600"); until now a variant bot without an explicit
     cfg.elo was silently capped at 1600 no matter what the card said */
  function eloOf(cfg, ctx) {
    if (cfg.elo != null) return cfg.elo;
    var r = ctx && ctx.game && ctx.game.opponent && ctx.game.opponent.rating;
    return r != null ? r : 1600;
  }
  function pinned(ctx) { var m = window.CM_DATA && CM_DATA.botEngines, id = modeId(ctx); return (m && id && m[id]) || {}; }
  /* engineFor(V, st, cfg, hooks, ctx) -> { engine: 'maia', elo } | { engine: 'stockfish', version, elo } | { engine: 'search' | 'random' } */
  function engineFor(V, st, cfg, hooks, ctx) {
    cfg = cfg || {};
    var engine = cfg.engine || 'auto', style = cfg.style || 'elo', elo = eloOf(cfg, ctx), pin = pinned(ctx);
    if (engine === 'random') return { engine: 'random' };
    if (engine === 'search' || (style !== 'elo' && style !== 'best') || (hooks && hooks.botPick) || !stockfishCompatible(V) || !positionStandard(V, st)) return { engine: 'search' };
    var sf = { engine: 'stockfish', version: pin.stockfish || '19', elo: elo };
    var name = (ctx && ctx.game && ctx.game.opponent && ctx.game.opponent.name) || (ctx && ctx.spec && ctx.spec.opponent && ctx.spec.opponent.name) || '';
    if (pin.engine === 'maia' || engine === 'maia') return { engine: 'maia', elo: elo, fallback: elo >= 1320 ? sf : null };
    if (pin.stockfish) return sf;
    if (style === 'best') return elo >= 1320 ? sf : { engine: 'search' };
    if (pin.engine === 'stockfish') return elo >= 1320 ? sf : { engine: 'maia', elo: elo };
    if (elo < 1320) return { engine: 'maia', elo: elo };
    if (engine === 'stockfish' || ENGINE_NAME.test(name) || elo > 2150) return sf;
    return { engine: 'maia', elo: elo, fallback: sf };
  }
  /* position history for Maia: [current, previous, ...] FENs (up to 8) from the SpecGame undo stack */
  function fenHistory(V, st, ctx) {
    var out = [V.toFEN(st)], h = ctx && ctx.game && ctx.game.history;
    if (h && h.length) for (var i = h.length - 1; i >= 0 && out.length < 8; i--) { try { out.push(V.toFEN(h[i].state)); } catch (e) { break; } }
    return out;
  }
  function uci(V, m) { var g = V.geo; return g.name(m.f) + g.name(m.t) + (m.promo ? String(m.promo).toLowerCase() : ''); }
  /* temperature by rating: below 1100 the 1100 net is sampled hotter and mixed with random moves */
  function maiaTemp(elo) {
    if (elo < 1100) return { t: 1 + (1100 - elo) / 700, rnd: Math.min(0.35, (1100 - elo) / 2400) };
    return { t: elo < 1400 ? 0.45 : elo < 1700 ? 0.25 : 0.12, rnd: 0 };
  }
  function viaMaia(V, st, moves, pick, ctx) {
    if (!CM.maia) return Promise.resolve(null);
    var list = moves.filter(function (m) { return m.f >= 0; }), ucis = list.map(function (m) { return uci(V, m); });
    return CM.maia.policy(fenHistory(V, st, ctx), ucis, pick.elo).then(function (L) {
      if (!L) return null;
      var T = maiaTemp(pick.elo);
      if (T.rnd && Math.random() < T.rnd) return U.pick(list);
      var mx = -Infinity, w = [], tot = 0, i;
      for (i = 0; i < ucis.length; i++) mx = Math.max(mx, L[ucis[i]]);
      for (i = 0; i < ucis.length; i++) { var e = Math.exp((L[ucis[i]] - mx) / T.t); w.push(e); tot += e; }
      var r = Math.random() * tot;
      for (i = 0; i < w.length; i++) { r -= w[i]; if (r <= 0) return list[i]; }
      return list[list.length - 1];
    }, function () { return null; });
  }

  /* choose(V, st, moves, botCfg) -> Promise<move> */
  function choose(V, st, moves, cfg, hooks, ctx) {
    cfg = cfg || {};
    var style = cfg.style || 'elo', elo = eloOf(cfg, ctx);
    var pick = engineFor(V, st, cfg, hooks, ctx);
    if (pick.engine === 'random') return Promise.resolve(U.pick(moves));
    /* a king left en prise (random-move modes, check-free colours) is always taken */
    var kc = moves.filter(function (m) { return m.cap && V.def(m.cap.t).royal && V.isEnemy(m.c, m.cap.c); });
    if (kc.length && cfg.style !== 'worst' && !(hooks && hooks.botPick)) return Promise.resolve(kc[0]);
    var viaSearch = function () {
      var S = new CM.Search(V, {}), L = S.rank(st, { moves: moves, maxDepth: cfg.depth || 4, timeMs: cfg.time_ms || 650 });
      if (hooks && hooks.botPick) { var m = hooks.botPick(ctx, L); if (m) return m.m || m; }
      var f = STYLES[style];
      var p = f ? f(L, cfg) : pickByStrength(L, eloStrength(elo));
      return (p || L[0]).m;
    };
    var viaSF = function (p) {
      return CM.stockfish.ask(V.toFEN(st), { movetime: cfg.time_ms || 600, elo: p.elo, version: p.version }).then(function (u) {
        var m = u && V.fromUCI(moves, u);
        if (!m) CM.bot.last = { engine: 'search' };
        return m || viaSearch();
      });
    };
    CM.bot.last = pick;
    if (pick.engine === 'maia') {
      return viaMaia(V, st, moves, pick, ctx).then(function (m) {
        if (m) return m;
        CM.bot.last = pick.fallback || { engine: 'search' };
        return pick.fallback ? viaSF(pick.fallback) : viaSearch();
      });
    }
    if (pick.engine === 'stockfish') return viaSF(pick);
    return new Promise(function (res) { setTimeout(function () { res(viaSearch()); }, 10); });
  }

  CM.bot = { choose: choose, engineFor: engineFor, eloOf: eloOf, last: null, STYLES: STYLES, stockfishCompatible: stockfishCompatible, eloStrength: eloStrength, pickByStrength: pickByStrength };
})();
