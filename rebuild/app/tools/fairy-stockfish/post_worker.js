// Worker bootstrap (Chess Master): when this file runs as a Web Worker (e.g. from a blob URL), the .wasm URL is taken
// from location.hash (URI-encoded), UCI commands arrive via postMessage and engine output is posted back line by line.
(function () {
  if (typeof self === 'undefined' || typeof importScripts !== 'function' || typeof window !== 'undefined' || self.__fsfNoAutoStart) return;
  var wasm = decodeURIComponent((self.location.hash || '').slice(1)) || 'fairy-stockfish.wasm';
  var pending = [], engine = null;
  self.onmessage = function (e) { if (engine) engine.postMessage(e.data); else pending.push(e.data); };
  Stockfish({ locateFile: function (p) { return /\.wasm$/.test(p) ? wasm : p; } }).then(function (sf) {
    engine = sf;
    sf.addMessageListener(function (line) { self.postMessage(line); });
    pending.splice(0).forEach(function (c) { sf.postMessage(c); });
  }, function (err) { self.postMessage('error ' + err); throw err; });
})();
