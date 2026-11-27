/* Fairy-Stockfish: the bot for variant modes whose rules are a Fairy-Stockfish built-in variant (data/fairy_modes.js).
   Engine: Fairy-Stockfish (GPLv3, https://github.com/fairy-stockfish/Fairy-Stockfish), built for this project as a
   single-threaded WebAssembly worker (js/vendor/fairy-stockfish/, build recipe and patch in tools/fairy-stockfish/), so it
   runs on GitHub Pages without cross-origin isolation (no SharedArrayBuffer, no COOP/COEP). The published npm build
   (fairy-stockfish-nnue.wasm) is pthread-only and fails there. Classical evaluation (no NNUE net download).
   Like js/bot/stockfish.js the worker script is fetched and started from a blob URL with the .wasm URL in the hash;
   nothing is fetched until a mapped mode first asks for a move. Sources: the site's own copy, then jsDelivr's mirror of
   the repo (so file:// still gets an engine when online).
   API:
     CM.fairy.planFor(V, st, cfg, hooks, ctx) -> { engine: 'fairy', variant, elo, entry } | null
     CM.fairy.choose(V, st, moves, pick, cfg) -> Promise<move | null>   (null = engine unavailable or no matching legal move)
     CM.fairy.ask(o) -> Promise<uci | null>   o: { variant, chess960, fen, elo, movetime }
     CM.fairy.analyse(o) -> Promise<{ best, lines } | null>   o: { variant, fen, multipv, depth, movetime, searchmoves }
     CM.fairy.toFEN(V, st, entry), CM.fairy.fromUCI(V, moves, uci, entry), CM.fairy.state(), CM.fairy.warm(), CM.fairy.idName()
   Fallbacks: engine fails to load / times out -> state 'failed', planFor returns null and every mode keeps CM.Search. */
(function () {
  'use strict';
  var CM = window.CM;
  var BASES = ['js/vendor/fairy-stockfish/', 'https://cdn.jsdelivr.net/gh/csardas223/ChessMaster@main/js/vendor/fairy-stockfish/'];
  var JS = 'fairy-stockfish.js', WASM = 'fairy-stockfish.wasm';
  var E = { st: 'idle', W: null, queue: [], cur: null, timer: 0, idName: null, opts: {} };

  function abs(u) { try { return new URL(u, document.baseURI || location.href).href; } catch (e) { return u; } }
  function fail() {
    E.st = 'failed'; clearTimeout(E.timer);
    try { if (E.W) E.W.terminate(); } catch (e) { }
    E.W = null; if (E.cur) { E.cur.res(null); E.cur = null; } E.queue.splice(0).forEach(function (j) { j.res(null); });
    if (window.console) console.warn('[engine] Fairy-Stockfish unavailable, variant bots keep the built-in search');
    if (CM.bus) CM.bus.emit('fairy', E.st);
  }
  function load() {
    if (E.st !== 'idle') return; E.st = 'loading'; if (CM.bus) CM.bus.emit('fairy', E.st);
    E.timer = setTimeout(function () { if (E.st === 'loading') fail(); }, 30000);
    var k = 0;
    (function tryBase() {
      if (k >= BASES.length) return fail();
      var base = abs(BASES[k++]);
      fetch(base + JS).then(function (r) { if (!r.ok) throw new Error('fairy http ' + r.status); return r.text(); }).then(function (src) {
        if (E.st === 'failed') return;
        var url = URL.createObjectURL(new Blob([src], { type: 'text/javascript' }));
        E.W = new Worker(url + '#' + encodeURIComponent(base + WASM));
        E.W.onmessage = function (e) { onLine(String(e.data)); };
        E.W.onerror = function (e) { if (e && e.preventDefault) e.preventDefault(); fail(); };
        E.W.postMessage('uci'); E.W.postMessage('setoption name Use NNUE value false'); E.W.postMessage('isready');
      }).catch(function () { if (E.st === 'loading') tryBase(); });
    })();
  }
  function onLine(line) {
    if (line.indexOf('error ') === 0) return fail();
    if (line.indexOf('id name ') === 0) E.idName = line.slice(8).trim();
    if (line === 'readyok' && E.st === 'loading') { E.st = 'ready'; clearTimeout(E.timer); if (CM.bus) CM.bus.emit('fairy', E.st); next(); return; }
    if (E.cur && E.cur.an && line.indexOf('info ') === 0) { parseInfo(E.cur, line); return; }
    if (line.indexOf('bestmove') === 0 && E.cur) {
      clearTimeout(E.timer); var j = E.cur; E.cur = null;
      var u = line.split(/\s+/)[1], bm = u && u !== '(none)' && u !== '0000' ? u : null;
      if (j.an) {   /* analyse(): every multipv line of the last completed depth, rank order */
        var L = Object.keys(j.lines).map(function (k) { return j.lines[k]; }).sort(function (a, b) { return a.rank - b.rank; });
        j.res({ best: bm, lines: L });
      } else j.res(bm);
      next();
    }
  }
  function opt(name, value) {
    if (E.opts[name] === String(value)) return;
    E.opts[name] = String(value); E.W.postMessage('setoption name ' + name + ' value ' + value);
  }
  /* analyse(): keep the newest exact score per multipv line (bound-only lines are skipped) */
  function parseInfo(j, line) {
    if (/ (lowerbound|upperbound)/.test(line) || line.indexOf(' pv ') < 0) return;
    var mp = /\bmultipv (\d+)/.exec(line), sc = /\bscore (cp|mate) (-?\d+)/.exec(line), pv = /\bpv (\S+)/.exec(line), d = /\bdepth (\d+)/.exec(line);
    if (!sc || !pv) return;
    var r = mp ? +mp[1] : 1;
    j.lines[r] = { rank: r, uci: pv[1], depth: d ? +d[1] : 0, cp: sc[1] === 'cp' ? +sc[2] : null, mate: sc[1] === 'mate' ? +sc[2] : null };
  }
  function next() {
    if (E.cur || E.st !== 'ready' || !E.queue.length) return;
    var j = E.cur = E.queue.shift(), o = j.o;
    opt('UCI_Chess960', o.chess960 ? 'true' : 'false');
    opt('UCI_Variant', o.variant);
    opt('MultiPV', j.an ? (o.multipv || 1) : 1);
    if (j.an) {
      opt('UCI_LimitStrength', 'false');
      E.W.postMessage('position fen ' + o.fen);
      E.W.postMessage('go' + (o.depth ? ' depth ' + o.depth : '') + (o.movetime ? ' movetime ' + o.movetime : '') + (o.searchmoves && o.searchmoves.length ? ' searchmoves ' + o.searchmoves.join(' ') : ''));
      clearTimeout(E.timer); E.timer = setTimeout(fail, 20000 + (o.movetime || 0));
      return;
    }
    if (o.elo && o.elo < 2850) { opt('UCI_LimitStrength', 'true'); opt('UCI_Elo', Math.max(500, Math.round(o.elo))); }
    else opt('UCI_LimitStrength', 'false');
    E.W.postMessage('position fen ' + o.fen);
    E.W.postMessage('go movetime ' + (o.movetime || 600));
    clearTimeout(E.timer); E.timer = setTimeout(fail, 15000 + (o.movetime || 600));
  }
  function ask(o) {
    if (E.st === 'failed') return Promise.resolve(null);
    load();
    return new Promise(function (res) { E.queue.push({ o: o, res: res }); next(); });
  }

  /* analyse(o) -> Promise<{ best: uci, lines: [{ rank, uci, depth, cp | null, mate | null }] } | null>, scores from the side
     to move. o: { variant ('chess'), fen, multipv (1), depth, movetime, searchmoves: [uci] }; full strength. Used by the
     MirrorFish rank (multipv 5, 700 ms, as iwantcheckmate.com) and its move-quality review (js/modes/g2_fish.js). */
  function analyse(o) {
    if (E.st === 'failed') return Promise.resolve(null);
    load();
    return new Promise(function (res) { E.queue.push({ o: o, res: res, an: true, lines: {} }); next(); });
  }

  /* ---------------- position: our state -> Fairy-Stockfish FEN ---------------- */
  function letter(t, entry) {
    var m = entry.pieces || {};
    if (m[t] != null) return m[t];
    return 'PNBRQK'.indexOf(t) >= 0 || (entry.variant === 'seirawan' && (t === 'H' || t === 'E')) || (entry.variant === 'gothic' && (t === 'A' || t === 'C')) ? t : null;
  }
  function typeOf(ch, entry) {   /* Fairy-Stockfish letter -> our type (promotions, drops, gates) */
    var up = ch.toUpperCase(), m = entry.pieces || {};
    for (var k in m) if (m[k] === up && k !== 'XT') return k;
    return up;
  }
  /* castling rights for colour c ('' if none): K/Q, or Shredder-FEN files for chess960 */
  function castling(V, st, entry, c) {
    if (entry.castling === false || V.rules.castling === false) return '';
    var g = V.geo, row = c === 'w' ? g.ranks - 1 : 0, ks = -1, s = '';
    for (var f = 0; f < g.files; f++) { var p = st.b[g.idx(f, row)]; if (p && p.c === c && p.t === 'K' && !p.m) ks = f; }
    if (ks < 0) return '';
    var rook = function (f) { var p = st.b[g.idx(f, row)]; return p && p.c === c && p.t === 'R' && !p.m; };
    if (entry.chess960) {
      for (var f2 = g.files - 1; f2 >= 0; f2--) if (f2 !== ks && rook(f2)) s += g.fileName(f2).toUpperCase();
    } else {
      if (rook(g.files - 1) && ks < g.files - 1) s += 'K';
      if (rook(0) && ks > 0) s += 'Q';
    }
    return c === 'w' ? s : s.toLowerCase();
  }
  /* S-chess gating rights for colour c: files of unmoved back-rank pieces (king/rooks are covered by K/Q while castling stands) */
  function gating(V, st, c, cast) {
    var g = V.geo, res = st.x.res || {};
    if (!(res[c] || '').length) return '';
    var row = c === 'w' ? g.ranks - 1 : 0, s = '', hasK = /k/i.test(cast), hasQ = /q/i.test(cast);
    for (var f = 0; f < g.files; f++) {
      var p = st.b[g.idx(f, row)]; if (!p || p.c !== c || p.m || V.def(p.t).pawn) continue;
      if (p.t === 'K' && (hasK || hasQ)) continue;
      if (p.t === 'R' && ((f === g.files - 1 && hasK) || (f === 0 && hasQ))) continue;
      s += g.fileName(f).toUpperCase();
    }
    return c === 'w' ? s : s.toLowerCase();
  }
  function toFEN(V, st, entry) {
    var g = V.geo, rows = [], v = entry.variant;
    for (var r = 0; r < g.ranks; r++) {
      var row = '', e = 0;
      for (var c = 0; c < g.files; c++) {
        var p = st.b[g.idx(c, r)];
        if (!p || p.probe) { e++; continue; }
        var L = letter(p.t, entry), ch = L === '*' ? '*' : L == null ? null : p.c === 'w' ? L.toUpperCase() : p.c === 'b' ? L.toLowerCase() : null;
        if (ch == null) return null;   /* a piece Fairy-Stockfish cannot express: keep the built-in search */
        if (e) { row += e; e = 0; }
        row += ch;
        if (v === 'crazyhouse' && p.promoted) row += '~';
      }
      if (e) row += e; rows.push(row);
    }
    var board = rows.join('/');
    if (v === 'crazyhouse') {
      var pk = (st.hands.w || []).map(function (t) { return t.toUpperCase(); }).join('') + (st.hands.b || []).map(function (t) { return t.toLowerCase(); }).join('');
      board += '[' + pk + ']';
    } else if (v === 'seirawan') {
      var rs = st.x.res || {};
      board += '[' + (rs.w || '').toUpperCase() + (rs.b || '').toLowerCase() + ']';
    }
    var cr = ['w', 'b'].map(function (c) { var k = castling(V, st, entry, c); return v === 'seirawan' ? k + gating(V, st, c, k) : k; }).join('');
    var ep = st.ep >= 0 ? g.name(st.ep) : '-', extra = '';
    if (v === '3check') {
      var n = (V.winTypes.nchecks && V.winTypes.nchecks.n) || 3;
      extra = ' ' + Math.max(0, n - ((st.checks || {}).w || 0)) + '+' + Math.max(0, n - ((st.checks || {}).b || 0));
    }
    return board + ' ' + st.turn + ' ' + (cr || '-') + ' ' + ep + extra + ' ' + Math.min(st.half || 0, 999) + ' ' + (Math.floor((st.ply || 0) / 2) + 1);
  }

  /* ---------------- answer: Fairy-Stockfish UCI -> one of our legal moves ---------------- */
  function sq(V, s) { var i = V.geo.parse(s); return i == null ? -1 : i; }
  function fromUCI(V, moves, u, entry) {
    if (!u) return null;
    var part = String(u).split(',')[0], m;
    if ((m = /^([A-Za-z*])@([a-z]+\d+)$/.exec(part))) {
      var t = sq(V, m[2]), dt = typeOf(m[1], entry);
      return moves.find(function (x) { return x.drop && x.t === t && x.drop === dt; }) || null;
    }
    if (!(m = /^([a-z]+\d+)([a-z]+\d+)([a-z+]?)$/.exec(part))) return null;
    var f = sq(V, m[1]), to = sq(V, m[2]), suf = m[3] && m[3] !== '+' ? typeOf(m[3], entry) : null;
    var cand = moves.filter(function (x) { return !x.drop && x.f === f && x.t === to; });
    if (!cand.length) {
      /* castling written as king-onto-rook while our move lands the king elsewhere (or the reverse) */
      cand = moves.filter(function (x) { return x.f === f && x.castle && (x.castle.rf === to || x.t === to); });
    }
    if (suf) return cand.find(function (x) { return x.promo === suf; }) || null;
    return cand.find(function (x) { return !x.promo; }) || cand.find(function (x) { return x.gateOpt || x.gate === '' || (x.promo && x.promo === x.p && !x.gate); }) || null;
  }

  function mapped(ctx) { var id = ctx && ctx.spec && ctx.spec.id, T = window.CM_DATA && CM_DATA.fairyModes; return (T && id && T[id]) || null; }
  function planFor(V, st, cfg, hooks, ctx) {
    var entry = mapped(ctx); if (!entry || E.st === 'failed' || typeof Worker === 'undefined') return null;
    cfg = cfg || {};
    var style = cfg.style || 'elo';
    if (cfg.engine === 'random' || (style !== 'elo' && style !== 'best') || (hooks && hooks.botPick)) return null;
    var elo = style === 'best' ? 4000 : CM.bot && CM.bot.eloOf ? CM.bot.eloOf(cfg, ctx) : (cfg.elo || 1600);
    return { engine: 'fairy', variant: entry.variant, elo: elo, entry: entry };
  }

  /* duck chess: the engine answers "move,duck" for the whole turn; the duck half is kept for the bot's second sub-move */
  var duckNext = null;
  function choose(V, st, moves, pick, cfg) {
    var entry = pick.entry;
    if (entry.variant === 'duck' && (st.sub || 0) === 1) {
      var d = duckNext; duckNext = null;
      if (!d || d.ply !== st.ply) return Promise.resolve(null);
      return Promise.resolve(moves.find(function (x) { return x.drop === '*' && x.t === d.sq; }) || null);
    }
    var fen = toFEN(V, st, entry); if (!fen) return Promise.resolve(null);
    return ask({ variant: entry.variant, chess960: !!entry.chess960, fen: fen, elo: pick.elo, movetime: (cfg && cfg.time_ms) || 700 }).then(function (u) {
      var m = fromUCI(V, moves, u, entry);
      if (m && entry.variant === 'duck') {
        var dk = /,[a-z]+\d+([a-z]+\d+)$/.exec(u || '');
        duckNext = dk ? { ply: st.ply + 1, sq: sq(V, dk[1]) } : null;
      }
      return m;
    }, function () { return null; });
  }

  CM.fairy = {
    planFor: planFor, choose: choose, ask: ask, analyse: analyse, toFEN: toFEN, fromUCI: fromUCI,
    state: function () { return E.st; }, warm: load, idName: function () { return E.idName; }
  };
})();
