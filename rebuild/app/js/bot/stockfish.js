/* Stockfish 19 lite (single-threaded WASM) loaded from unpkg at runtime.
   The worker script is fetched and started from a blob URL, with the .wasm URL passed in the hash; this
   works from any static host and from file:// (unpkg serves CORS headers).
   API:
     CM.stockfish.ask(fen, {movetime, elo}) -> Promise<uci string | null>   (null = engine unavailable)
     CM.stockfish.state()                    -> 'idle' | 'loading' | 'ready' | 'failed'
*/
(function () {
  'use strict';
  var CM = window.CM;
  var BASE = 'https://unpkg.com/stockfish@19.0.1/bin/stockfish-19-lite-single';
  var W = null, st = 'idle', queue = [], cur = null, readyWaiters = [], timer = 0;

  function fail() {
    st = 'failed'; clearTimeout(timer);
    try { if (W) W.terminate(); } catch (e) { }
    W = null; if (cur) { cur.res(null); cur = null; } queue.splice(0).forEach(function (j) { j.res(null); });
    readyWaiters.splice(0).forEach(function (f) { f(false); });
    CM.bus.emit('stockfish', st);
  }
  function load() {
    if (st !== 'idle') return; st = 'loading'; CM.bus.emit('stockfish', st);
    timer = setTimeout(function () { if (st === 'loading') fail(); }, 12000);
    fetch(BASE + '.js').then(function (r) { if (!r.ok) throw new Error('stockfish http ' + r.status); return r.text(); }).then(function (src) {
      if (st === 'failed') return;
      var url = URL.createObjectURL(new Blob([src], { type: 'text/javascript' }));
      W = new Worker(url + '#' + encodeURIComponent(BASE + '.wasm'));
      W.onmessage = function (e) { onLine(String(e.data)); };
      W.onerror = fail;
      W.postMessage('uci'); W.postMessage('isready');
    }).catch(fail);
  }
  function onLine(line) {
    if (line === 'readyok' && st === 'loading') { st = 'ready'; clearTimeout(timer); readyWaiters.splice(0).forEach(function (f) { f(true); }); CM.bus.emit('stockfish', st); next(); return; }
    if (line.indexOf('bestmove') === 0 && cur) { clearTimeout(timer); var j = cur; cur = null; j.res(line.split(/\s+/)[1] || null); next(); }
  }
  function next() {
    if (cur || st !== 'ready' || !queue.length) return;
    cur = queue.shift(); var o = cur.o;
    if (o.elo && o.elo < 3190) { W.postMessage('setoption name UCI_LimitStrength value true'); W.postMessage('setoption name UCI_Elo value ' + Math.max(1320, Math.round(o.elo))); }
    else W.postMessage('setoption name UCI_LimitStrength value false');
    W.postMessage('position fen ' + cur.fen);
    W.postMessage('go movetime ' + (o.movetime || 600));
    clearTimeout(timer); timer = setTimeout(fail, 10000);
  }
  CM.stockfish = {
    state: function () { return st; },
    warm: function () { load(); },
    ask: function (fen, o) {
      if (st === 'failed') return Promise.resolve(null);
      load();
      return new Promise(function (res) { queue.push({ fen: fen, o: o || {}, res: res }); next(); });
    },
    cancelAll: function () { queue.splice(0).forEach(function (j) { j.res(null); }); }
  };
})();
