/* Maia (pol-human): human-like move prediction for standard chess, rating-matched.
   Maia-1 (CSSLab, https://github.com/CSSLab/maia-chess, GPLv3) are Leela-format nets (6 SE-residual blocks x 64
   filters, convolutional policy head) trained to predict the move a human of a given Lichess rating plays: one net per
   100-point bucket, 1100..1900. This file downloads the bucket's original weights (maia-XXXX.pb.gz, ~1.3 MB) from
   jsDelivr's GitHub mirror (raw.githubusercontent.com as a second source) only when a bot first needs it, decodes the
   Leela protobuf (LINEAR16 weights) and runs the network in plain JS (~40 M multiply-adds, one evaluation per move,
   no search: Maia is meant to be played at 1 node). Nothing is fetched at lobby load.
   API:
     CM.maia.bucket(elo)                       -> 1100..1900
     CM.maia.policy(fens, ucis, elo)            -> Promise<{uci: logit} | null>   (null = net unavailable)
         fens: [current, previous, ...] standard FENs (up to 8; history improves the prediction), ucis: legal moves
     CM.maia.state(), CM.maia.warm(elo), CM.maia.SOURCES (url templates, {b} = bucket; tests may override)
   Input encoding = lc0 INPUT_CLASSICAL_112_PLANE: 8 history boards x 13 planes (our P N B R Q K, their P N B R Q K,
   repetition) from the side to move's view (ranks mirrored when Black moves), then castling (our O-O-O, our O-O,
   their O-O-O, their O-O), side-to-move-is-black, rule50/99, zeros, ones. Policy = 73x8x8 conv planes: 56 queen-like
   (8 directions x 7 distances, N NE E SE S SW W NW), 8 knight jumps, 9 under/queen promotions (dx -1,0,1 x r,b,q);
   a plain 7th->8th rank move is the knight promotion. Castling is scored as max(e1g1, e1h1) / max(e1c1, e1a1). */
(function () {
  'use strict';
  var CM = window.CM;
  var SHA = '749204cf5979ce7f8b0412e804a4ee7c83c49ff8';  /* CSSLab/maia-chess master, pinned */
  var SOURCES = [
    'https://cdn.jsdelivr.net/gh/CSSLab/maia-chess@' + SHA + '/maia_weights/maia-{b}.pb.gz',
    'https://raw.githubusercontent.com/CSSLab/maia-chess/' + SHA + '/maia_weights/maia-{b}.pb.gz'
  ];
  var nets = {}, loading = 0, failedAll = false;

  function bucket(elo) { return Math.max(1100, Math.min(1900, Math.round((elo == null ? 1500 : elo) / 100) * 100)); }

  /* ---------- weights: fetch, gunzip, protobuf ---------- */
  function fetchFirst(urls, i) {
    i = i || 0; if (i >= urls.length) return Promise.reject(new Error('maia: no source answered'));
    var ctl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var t = setTimeout(function () { if (ctl) ctl.abort(); }, 15000);
    return fetch(urls[i], ctl ? { signal: ctl.signal } : {}).then(function (r) {
      clearTimeout(t); if (!r.ok) throw new Error('maia http ' + r.status); return r.arrayBuffer();
    }).catch(function () { clearTimeout(t); return fetchFirst(urls, i + 1); });
  }
  function gunzip(buf) {
    var u = new Uint8Array(buf);
    if (!(u[0] === 0x1f && u[1] === 0x8b)) return Promise.resolve(buf);      /* already inflated by the transport */
    if (typeof DecompressionStream === 'undefined') return Promise.reject(new Error('maia: no DecompressionStream'));
    return new Response(new Blob([buf]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
  }
  /* minimal protobuf reader: returns {field: [values]} with sub-messages as byte ranges */
  function pb(u8, start, end) {
    var o = {}, p = start, dv = new DataView(u8.buffer, u8.byteOffset);
    function varint() { var x = 0, s = 1, b; do { b = u8[p++]; x += (b & 127) * s; s *= 128; } while (b & 128); return x; }
    while (p < end) {
      var key = varint(), f = Math.floor(key / 8), wt = key & 7, v;
      if (wt === 0) v = varint();
      else if (wt === 1) { v = null; p += 8; }
      else if (wt === 2) { var n = varint(); v = [p, p + n]; p += n; }
      else if (wt === 5) { v = dv.getFloat32(p, true); p += 4; }
      else throw new Error('maia: bad protobuf wire type ' + wt);
      (o[f] || (o[f] = [])).push(v);
    }
    return o;
  }
  function layer(u8, r) {          /* Weights.Layer: 1 min_val, 2 max_val, 3 params (uint16 LE, linear) */
    if (!r) return null;
    var L = pb(u8, r[0], r[1]), mn = L[1] ? L[1][0] : 0, mx = L[2] ? L[2][0] : 0, pr = L[3][0], n = (pr[1] - pr[0]) >> 1;
    if (L[4] && L[4][0] !== 1) throw new Error('maia: unsupported weight encoding ' + L[4][0]);
    var out = new Float32Array(n), dv = new DataView(u8.buffer, u8.byteOffset + pr[0], pr[1] - pr[0]), k = (mx - mn) / 65535;
    for (var i = 0; i < n; i++) out[i] = mn + k * dv.getUint16(i * 2, true);
    return out;
  }
  function convBlock(u8, r) {       /* ConvBlock: 1 weights 2 biases 3 bn_means 4 bn_stddivs(variance) 5 gammas 6 betas */
    var C = pb(u8, r[0], r[1]), w = layer(u8, C[1] && C[1][0]), bias = layer(u8, C[2] && C[2][0]);
    var mean = layer(u8, C[3] && C[3][0]), vari = layer(u8, C[4] && C[4][0]), gam = layer(u8, C[5] && C[5][0]), bet = layer(u8, C[6] && C[6][0]);
    var cout = mean ? mean.length : bias.length, scale = new Float32Array(cout), shift = new Float32Array(cout);
    for (var o = 0; o < cout; o++) {
      if (mean) { var s = (gam ? gam[o] : 1) / Math.sqrt(vari[o] + 1e-5); scale[o] = s; shift[o] = (bet ? bet[o] : 0) - mean[o] * s + (bias ? bias[o] * s : 0); }
      else { scale[o] = 1; shift[o] = bias[o]; }
    }
    return { w: w, cout: cout, cin: w.length / (cout * 9), scale: scale, shift: shift };
  }
  function parseNet(buf) {
    var u8 = new Uint8Array(buf), net = pb(u8, 0, u8.length);
    if (!net[10]) throw new Error('maia: no weights');
    var W = pb(u8, net[10][0][0], net[10][0][1]);   /* Weights: 1 input, 2 residual[], 3 policy, 11 policy1 */
    var res = (W[2] || []).map(function (r) {
      var R = pb(u8, r[0], r[1]), S = pb(u8, R[3][0][0], R[3][0][1]);
      return { c1: convBlock(u8, R[1][0]), c2: convBlock(u8, R[2][0]), w1: layer(u8, S[1][0]), b1: layer(u8, S[2][0]), w2: layer(u8, S[3][0]), b2: layer(u8, S[4][0]) };
    });
    var n = { input: convBlock(u8, W[1][0]), res: res, pol1: convBlock(u8, W[11][0]), pol: convBlock(u8, W[3][0]) };
    if (n.input.cin !== 112 || n.pol.cout !== 80 && n.pol.cout !== 73) throw new Error('maia: unexpected net shape');
    return n;
  }

  /* ---------- inference ---------- */
  /* 3x3 conv as a small GEMM: col = the 9 shifted copies of every input plane (zero padded), out = W (cout x cin*9) . col */
  function conv3(x, B, relu) {
    var cin = B.cin, cout = B.cout, w = B.w, K = cin * 9, col = new Float32Array(K * 64), out = new Float32Array(cout * 64);
    for (var i = 0; i < cin; i++) for (var tp = 0; tp < 9; tp++) {
      var dy = ((tp / 3) | 0) - 1, dx = tp % 3 - 1, cb = (i * 9 + tp) * 64, xb = i * 64;
      for (var y = 0; y < 8; y++) {
        var yy = y + dy; if (yy < 0 || yy > 7) continue;
        for (var xx = 0; xx < 8; xx++) { var sx = xx + dx; if (sx >= 0 && sx < 8) col[cb + y * 8 + xx] = x[xb + yy * 8 + sx]; }
      }
    }
    var acc = new Float32Array(64);
    for (var o = 0; o < cout; o++) {
      acc.fill(0); var wb = o * K;
      for (var j = 0; j < K; j++) {
        var k = w[wb + j]; if (k === 0) continue;
        var c0 = j * 64;
        for (var q = 0; q < 64; q++) acc[q] += k * col[c0 + q];
      }
      var sc = B.scale[o], sh = B.shift[o], ob = o * 64;
      for (var q2 = 0; q2 < 64; q2++) { var v = acc[q2] * sc + sh; out[ob + q2] = relu && v < 0 ? 0 : v; }
    }
    return out;
  }
  function forward(N, planes) {
    var x = conv3(planes, N.input, true);
    for (var r = 0; r < N.res.length; r++) {
      var R = N.res[r], y = conv3(conv3(x, R.c1, true), R.c2, false), C = R.c2.cout, nh = R.b1.length;
      var s = new Float32Array(C), h = new Float32Array(nh), g = new Float32Array(2 * C), c, j, q;
      for (c = 0; c < C; c++) { var t = 0; for (q = 0; q < 64; q++) t += y[c * 64 + q]; s[c] = t / 64; }
      for (j = 0; j < nh; j++) { var a = R.b1[j]; for (c = 0; c < C; c++) a += R.w1[j * C + c] * s[c]; h[j] = a > 0 ? a : 0; }
      for (c = 0; c < 2 * C; c++) { var b = R.b2[c]; for (j = 0; j < nh; j++) b += R.w2[c * nh + j] * h[j]; g[c] = b; }
      for (c = 0; c < C; c++) {
        var gm = 1 / (1 + Math.exp(-g[c])), bt = g[C + c];
        for (q = 0; q < 64; q++) { var v = y[c * 64 + q] * gm + bt + x[c * 64 + q]; y[c * 64 + q] = v > 0 ? v : 0; }
      }
      x = y;
    }
    return conv3(conv3(x, N.pol1, true), N.pol, false);
  }

  /* ---------- encoding ---------- */
  var PIECES = 'PNBRQK';
  function parseFEN(fen) {
    var f = fen.trim().split(/\s+/), b = new Array(64).fill(null), rows = f[0].split('/');
    for (var r = 0; r < 8; r++) {
      var c = 0, row = rows[r] || '';
      for (var i = 0; i < row.length; i++) {
        var ch = row[i];
        if (ch >= '1' && ch <= '8') { c += +ch; continue; }
        var up = ch.toUpperCase(); b[(7 - r) * 8 + c] = { t: up, c: ch === up ? 'w' : 'b' }; c++;
      }
    }
    return { b: b, turn: f[1] || 'w', cr: f[2] || '-', half: +(f[4] || 0), key: f[0] + ' ' + (f[1] || 'w') };
  }
  var START = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w';
  function encode(fens) {
    var P = fens.map(parseFEN), cur = P[0], us = cur.turn, flip = us === 'b', x = new Float32Array(112 * 64), h, sq;
    for (h = 0; h < 8; h++) {
      var p = P[h];
      if (!p) { if (P[P.length - 1].key === START) break; p = P[P.length - 1]; }   /* lc0 fen_only fill */
      for (sq = 0; sq < 64; sq++) {
        var pc = p.b[sq]; if (!pc) continue;
        var t = PIECES.indexOf(pc.t); if (t < 0) continue;
        var s2 = flip ? (7 - (sq >> 3)) * 8 + (sq & 7) : sq;
        x[(h * 13 + (pc.c === us ? 0 : 6) + t) * 64 + s2] = 1;
      }
      var rep = 0; for (var k = h + 1; k < P.length; k++) if (P[k].key === p.key) { rep = 1; break; }
      if (rep) for (sq = 0; sq < 64; sq++) x[(h * 13 + 12) * 64 + sq] = 1;
    }
    var cr = cur.cr, fill = function (pl, v) { for (var q = 0; q < 64; q++) x[pl * 64 + q] = v; };
    var oQ = us === 'w' ? 'Q' : 'q', oK = us === 'w' ? 'K' : 'k', tQ = us === 'w' ? 'q' : 'Q', tK = us === 'w' ? 'k' : 'K';
    fill(104, cr.indexOf(oQ) >= 0 ? 1 : 0); fill(105, cr.indexOf(oK) >= 0 ? 1 : 0);
    fill(106, cr.indexOf(tQ) >= 0 ? 1 : 0); fill(107, cr.indexOf(tK) >= 0 ? 1 : 0);
    fill(108, flip ? 1 : 0); fill(109, Math.min(cur.half, 99) / 99); fill(111, 1);
    return x;
  }
  var DIRS = [[0, 1], [1, 1], [1, 0], [1, -1], [0, -1], [-1, -1], [-1, 0], [-1, 1]];
  var KN = [[1, 2], [2, 1], [2, -1], [1, -2], [-1, -2], [-2, -1], [-2, 1], [-1, 2]];
  function planeOf(dx, dy, promo) {
    if (promo && promo !== 'n') return dy === 1 && Math.abs(dx) <= 1 ? 64 + (dx + 1) * 3 + 'rbq'.indexOf(promo) : -1;
    for (var k = 0; k < 8; k++) if (KN[k][0] === dx && KN[k][1] === dy) return 56 + k;
    var dist = Math.max(Math.abs(dx), Math.abs(dy));
    if (dist < 1 || dist > 7 || (dx && dy && Math.abs(dx) !== Math.abs(dy))) return -1;
    for (var d = 0; d < 8; d++) if (DIRS[d][0] === Math.sign(dx) && DIRS[d][1] === Math.sign(dy)) return d * 7 + dist - 1;
    return -1;
  }
  function sqOf(s, flip) { var f = s.charCodeAt(0) - 97, r = +s[1] - 1; if (flip) r = 7 - r; return { f: f, r: r, i: r * 8 + f }; }
  function logitOf(out, u, flip, board) {
    var a = sqOf(u.slice(0, 2), flip), b = sqOf(u.slice(2, 4), flip), pr = u[4] || '';
    var pl = planeOf(b.f - a.f, b.r - a.r, pr), v = pl >= 0 ? out[pl * 64 + a.i] : -1e9;
    var pc = board.b[(+u[1] - 1) * 8 + (u.charCodeAt(0) - 97)];
    if (pc && pc.t === 'K' && Math.abs(b.f - a.f) === 2 && b.r === a.r) {   /* castling: lc0 may score it as king-takes-rook */
      var alt = planeOf((b.f > a.f ? 7 : 0) - a.f, 0, ''); if (alt >= 0) v = Math.max(v, out[alt * 64 + a.i]);
    }
    return v;
  }

  /* ---------- loading + public API ---------- */
  function get(b) {
    if (nets[b]) return nets[b];
    loading++; CM.bus && CM.bus.emit('stockfish', 'loading', 'maia');
    var urls = SOURCES.map(function (s) { return s.replace('{b}', b); });
    nets[b] = fetchFirst(urls).then(gunzip).then(parseNet).then(function (n) { loading--; CM.bus && CM.bus.emit('stockfish', 'ready', 'maia'); return n; },
      function (e) { loading--; if (window.console) console.warn('[engine] Maia ' + b + ' unavailable: ' + (e && e.message)); failedAll = true; CM.bus && CM.bus.emit('stockfish', 'failed', 'maia'); return null; });
    return nets[b];
  }
  CM.maia = {
    SOURCES: SOURCES,
    bucket: bucket,
    state: function () { return loading ? 'loading' : failedAll ? 'failed' : 'idle'; },
    warm: function (elo) { get(bucket(elo)); },
    policy: function (fens, ucis, elo) {
      if (!fens || !fens.length || !ucis || !ucis.length) return Promise.resolve(null);
      return get(bucket(elo)).then(function (N) {
        if (!N) return null;
        var board = parseFEN(fens[0]), out = forward(N, encode(fens.slice(0, 8))), flip = board.turn === 'b', L = {};
        ucis.forEach(function (u) { L[u] = logitOf(out, u, flip, board); });
        return L;
      });
    },
    _test: { encode: encode, forward: forward, parseNet: parseNet, planeOf: planeOf }
  };
})();
