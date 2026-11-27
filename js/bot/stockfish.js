/* Stockfish, real builds compiled to WASM, loaded from unpkg at runtime (lazy: nothing is fetched until a bot asks).
   The worker script is fetched and started from a blob URL, with the .wasm URL passed in the hash; this works from any
   static host and from file:// (unpkg serves CORS headers).
   Versions (pol-human): a mode whose video played an older Stockfish asks for that build (data/bot_engines.js):
     '19'  stockfish@19.0.1  bin/stockfish-19-lite-single      (default; NNUE lite, single-threaded)
     '18'  stockfish@18.0.8  bin/stockfish-18-lite-single      (the build iwantcheckmate.com runs; MirrorFish rank + review)
     '17'  stockfish@17.1.0  src/stockfish-17.1-lite-single    (nearest real build of Stockfish 17: npm has no 17.0)
     '10'  stockfish@10.0.2  src/stockfish.js + stockfish.wasm (Stockfish 10, nmrugg's stockfish.js port; no UCI_Elo,
                                                                 strength limit maps to Skill Level)
   API:
     CM.stockfish.ask(fen, {movetime, elo, version}) -> Promise<uci string | null>   (null = engine unavailable)
     CM.stockfish.analyse(fen, {version, multipv, depth, movetime, searchmoves}) -> Promise<{ best, lines: [{ rank, uci,
                                     depth, cp | null, mate | null }] } | null>  (full strength, scores from the side to move)
     CM.stockfish.state(version)  -> 'idle' | 'loading' | 'ready' | 'failed'  (no version: Stockfish 19, but 'loading'
                                     while any engine, Maia and Fairy-Stockfish included, is still downloading, for the "Loading engine…" line)
     CM.stockfish.warm(version), CM.stockfish.idName(version), CM.stockfish.cancelAll(), CM.stockfish.VERSIONS
*/
(function () {
  'use strict';
  var CM = window.CM;
  var VERSIONS = {
    '18': { js: 'https://unpkg.com/stockfish@18.0.8/bin/stockfish-18-lite-single.js', wasm: 'https://unpkg.com/stockfish@18.0.8/bin/stockfish-18-lite-single.wasm', label: 'Stockfish 18', elo: 'uci', encode: true },
    '19': { js: 'https://unpkg.com/stockfish@19.0.1/bin/stockfish-19-lite-single.js', wasm: 'https://unpkg.com/stockfish@19.0.1/bin/stockfish-19-lite-single.wasm', label: 'Stockfish 19', elo: 'uci', encode: true },
    '17': { js: 'https://unpkg.com/stockfish@17.1.0/src/stockfish-17.1-lite-single-03e3232.js', wasm: 'https://unpkg.com/stockfish@17.1.0/src/stockfish-17.1-lite-single-03e3232.wasm', label: 'Stockfish 17.1', elo: 'uci', encode: true },
    '10': { js: 'https://unpkg.com/stockfish@10.0.2/src/stockfish.js', wasm: 'https://unpkg.com/stockfish@10.0.2/src/stockfish.wasm', label: 'Stockfish 10', elo: 'skill', encode: false }
  };
  var engines = {};

  function Engine(v) {
    this.v = v; this.cfg = VERSIONS[v]; this.W = null; this.st = 'idle'; this.queue = []; this.cur = null; this.timer = 0;
  }
  var E = Engine.prototype;
  E.fail = function () {
    this.st = 'failed'; clearTimeout(this.timer);
    try { if (this.W) this.W.terminate(); } catch (e) { }
    this.W = null; if (this.cur) { this.cur.res(null); this.cur = null; } this.queue.splice(0).forEach(function (j) { j.res(null); });
    if (window.console) console.warn('[engine] ' + this.cfg.label + ' unavailable');
    CM.bus.emit('stockfish', this.st, this.v);
  };
  E.load = function () {
    var self = this, c = this.cfg;
    if (this.st !== 'idle') return; this.st = 'loading'; CM.bus.emit('stockfish', this.st, this.v);
    this.timer = setTimeout(function () { if (self.st === 'loading') self.fail(); }, 20000);
    fetch(c.js).then(function (r) { if (!r.ok) throw new Error('stockfish http ' + r.status); return r.text(); }).then(function (src) {
      if (self.st === 'failed') return;
      var url = URL.createObjectURL(new Blob([src], { type: 'text/javascript' }));
      self.W = new Worker(url + '#' + (c.encode ? encodeURIComponent(c.wasm) : c.wasm));
      self.W.onmessage = function (e) { self.onLine(String(e.data)); };
      self.W.onerror = function () { self.fail(); };
      self.W.postMessage('uci'); self.W.postMessage('isready');
    }).catch(function () { self.fail(); });
  };
  E.onLine = function (line) {
    if (line.indexOf('id name ') === 0) this.idName = line.slice(8).trim();
    if (line === 'readyok' && this.st === 'loading') { this.st = 'ready'; clearTimeout(this.timer); CM.bus.emit('stockfish', this.st, this.v); this.next(); return; }
    if (this.cur && this.cur.an && line.indexOf('info ') === 0) { parseInfo(this.cur, line); return; }
    if (line.indexOf('bestmove') === 0 && this.cur) {
      clearTimeout(this.timer); var j = this.cur; this.cur = null;
      var u = line.split(/\s+/)[1], bm = u && u !== '(none)' ? u : null;
      if (j.an) j.res({ best: bm, lines: Object.keys(j.lines).map(function (k) { return j.lines[k]; }).sort(function (a, b) { return a.rank - b.rank; }) });
      else j.res(bm);
      this.next();
    }
  };
  /* analyse(): newest exact score per multipv line (bound-only lines skipped) */
  function parseInfo(j, line) {
    if (/ (lowerbound|upperbound)/.test(line) || line.indexOf(' pv ') < 0) return;
    var mp = /\bmultipv (\d+)/.exec(line), sc = /\bscore (cp|mate) (-?\d+)/.exec(line), pv = /\bpv (\S+)/.exec(line), d = /\bdepth (\d+)/.exec(line);
    if (!sc || !pv) return;
    var r = mp ? +mp[1] : 1;
    j.lines[r] = { rank: r, uci: pv[1], depth: d ? +d[1] : 0, cp: sc[1] === 'cp' ? +sc[2] : null, mate: sc[1] === 'mate' ? +sc[2] : null };
  }
  E.next = function () {
    var self = this, W = this.W;
    if (this.cur || this.st !== 'ready' || !this.queue.length) return;
    this.cur = this.queue.shift(); var o = this.cur.o;
    if (this.cur.an) {
      if (this.cfg.elo === 'uci') W.postMessage('setoption name UCI_LimitStrength value false'); else W.postMessage('setoption name Skill Level value 20');
      W.postMessage('setoption name MultiPV value ' + (o.multipv || 1));
      W.postMessage('position fen ' + this.cur.fen);
      W.postMessage('go' + (o.depth ? ' depth ' + o.depth : '') + (o.movetime ? ' movetime ' + o.movetime : '') + (o.searchmoves && o.searchmoves.length ? ' searchmoves ' + o.searchmoves.join(' ') : ''));
      clearTimeout(this.timer); this.timer = setTimeout(function () { self.fail(); }, 30000 + (o.movetime || 0));
      return;
    }
    W.postMessage('setoption name MultiPV value 1');
    if (this.cfg.elo === 'uci') {
      if (o.elo && o.elo < 3190) { W.postMessage('setoption name UCI_LimitStrength value true'); W.postMessage('setoption name UCI_Elo value ' + Math.max(1320, Math.round(o.elo))); }
      else W.postMessage('setoption name UCI_LimitStrength value false');
    } else {
      /* Stockfish 10 has no UCI_Elo: Skill Level 0..20 (20 = full strength), roughly 1350 + 90 per level */
      var sk = o.elo && o.elo < 3190 ? Math.max(0, Math.min(20, Math.round((o.elo - 1350) / 90))) : 20;
      W.postMessage('setoption name Skill Level value ' + sk);
    }
    W.postMessage('position fen ' + this.cur.fen);
    W.postMessage('go movetime ' + (o.movetime || 600));
    clearTimeout(this.timer); this.timer = setTimeout(function () { self.fail(); }, 10000 + (o.movetime || 600));
  };
  function eng(v) { v = VERSIONS[v] ? String(v) : '19'; return engines[v] || (engines[v] = new Engine(v)); }

  CM.stockfish = {
    VERSIONS: VERSIONS,
    state: function (v) {
      if (v) return eng(v).st;
      var s = eng('19').st;
      if (s === 'failed') return s;
      var any = Object.keys(engines).some(function (k) { return engines[k].st === 'loading'; }) || (CM.maia && CM.maia.state() === 'loading') || (CM.fairy && CM.fairy.state() === 'loading');
      return any ? 'loading' : s;
    },
    warm: function (v) { eng(v).load(); },
    idName: function (v) { return eng(v).idName || null; },   /* the engine's own 'id name' line, e.g. 'Stockfish 10 64' */
    ask: function (fen, o) {
      o = o || {}; var e = eng(o.version);
      if (e.st === 'failed') return Promise.resolve(null);
      e.load();
      return new Promise(function (res) { e.queue.push({ fen: fen, o: o, res: res }); e.next(); });
    },
    analyse: function (fen, o) {
      o = o || {}; var e = eng(o.version);
      if (e.st === 'failed') return Promise.resolve(null);
      e.load();
      return new Promise(function (res) { e.queue.push({ fen: fen, o: o, res: res, an: true, lines: {} }); e.next(); });
    },
    cancelAll: function () { Object.keys(engines).forEach(function (k) { engines[k].queue.splice(0).forEach(function (j) { j.res(null); }); }); }
  };
})();
