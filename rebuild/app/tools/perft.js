// Engine self-test: node tools/perft.js   (perft counts must match standard chess)
global.window = global; global.location = { protocol: 'http:' }; global.performance = global.performance || require('perf_hooks').performance;
const fs = require('fs'), path = require('path'), root = path.join(__dirname, '..');
for (const f of ['js/core/ns.js', 'js/engine/geometry.js', 'js/engine/movement.js', 'js/engine/variant.js', 'js/engine/search.js', 'js/engine/spec.js'])
  eval(fs.readFileSync(path.join(root, f), 'utf8'));
const CM = window.CM;
function perft(V, st, d) { if (d === 0) return 1; const ms = V.legal(st); if (d === 1) return ms.length; let n = 0; for (const m of ms) n += perft(V, m.n, d - 1); return n; }
function mk(fen, extra) { const spec = CM.spec.normalize(Object.assign({ setup: { fen } }, extra || {})); const V = CM.spec.buildVariant(spec, {}); const st = CM.spec.initialState(V, spec); return { V, st }; }
let ok = true;
function check(name, fen, d, want, prep) {
  const { V, st } = mk(fen); if (prep) prep(V, st);
  const t = Date.now(), got = perft(V, st, d); const pass = got === want; ok = ok && pass;
  console.log((pass ? 'PASS' : 'FAIL') + ` ${name} d${d}: ${got} (want ${want}) ${Date.now() - t}ms`);
}
check('start', CM.spec.STD_FEN, 3, 8902);
check('start', CM.spec.STD_FEN, 4, 197281);
// kiwipete: needs castling rights (unmoved K/R) and all others counted as moved is irrelevant
check('kiwipete', 'r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R', 3, 97862, (V, st) => {
  // pawns not on start rows must count as moved so they do not double-step
  st.b.forEach((p, i) => { if (p && p.t === 'P') { const rr = V.geo.relRow(i, p.c); if (rr !== 1) p.m = 1; } });
});
check('pos3 ep/promo', '8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8', 4, 43238);
// search sanity: mate in 1
{ const { V, st } = mk('6k1/5ppp/8/8/8/8/5PPP/3R2K1'); const L = new CM.Search(V).rank(st, { maxDepth: 3, timeMs: 2000 }); const s = V.san(st, L[0].m, V.legal(st), L[0].m.n); console.log((s === 'Rd8#' ? 'PASS' : 'FAIL') + ' mate-in-1 found ' + s); ok = ok && s === 'Rd8#'; }
// big board with holes + custom piece
{ const spec = CM.spec.normalize({ board: { files: 10, ranks: 10, holes: ['a1', 'j10'] }, pieces: { S: { name: 'Snake', moves: 'W2', value: 400 } }, setup: { fen: 'rnbqkbnr2/pppppppp2/10/10/10/4[S]5/10/10/PPPPPPPP2/RNBQKBNR2' } });
  const V = CM.spec.buildVariant(spec, {}); const st = CM.spec.initialState(V, spec); const n = V.legal(st).length; console.log('10x10 legal moves: ' + n); }
// atomic + gravity smoke
{ const { V, st } = mk(CM.spec.STD_FEN, { rules: { gravity: { dir: 'down', exempt: ['P', 'K'] } } }); console.log('gravity moves: ' + V.legal(st).length); }
process.exit(ok ? 0 : 1);
