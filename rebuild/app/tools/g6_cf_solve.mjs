// Fast BFS for the Chessformer levels (same rules as tools/g6_cf_levels.py Level.settle/targets/succ, ported to node).
// Usage: python3 tools/g6_cf_levels.py --grids > /tmp/cf.json; node tools/g6_cf_solve.mjs /tmp/cf.json [L25 L26 ...] [--limit=4000000]
import fs from 'fs';
const W = 16, H = 10, N = W * H, CHOICE = ['R', 'B', 'N', 'K', 'P'];
const BLUE = new Set('KQRBNPA?'.split(''));
const SL = { R: [[1, 0], [-1, 0], [0, 1], [0, -1]], B: [[1, 1], [1, -1], [-1, 1], [-1, -1]] }; SL.Q = SL.R.concat(SL.B);
const KN = [[1, 2], [2, 1], [-1, 2], [-2, 1], [1, -2], [2, -1], [-1, -2], [-2, -1]];
const args = process.argv.slice(2), data = JSON.parse(fs.readFileSync(args[0], 'utf8'));
const only = args.slice(1).filter(a => !a.startsWith('--')), lim = +((args.find(a => a.startsWith('--limit=')) || '=3000000').split('=')[1]);
const FILES = 'abcdefghijklmnop', sq = i => FILES[i % W] + (H + 1 - Math.floor(i / W));
function mk(lv) {
  const g = lv.grid.join('').split(''), btn = [], purple = [], ledge = new Set(lv.ledges.map(([c, r]) => r * W + c));
  g.forEach((ch, i) => { if (ch === 'o') { btn.push(i); g[i] = '.'; } if (ch === 'p') purple.push(i); });
  function settle(b) {   // b: array, mutated; returns 'win' when a piece fell onto the king
    for (let it = 0; it < 8; it++) {
      let ch = false;
      for (let r = H - 2; r >= 0; r--) for (let c = 0; c < W; c++) {
        const i = r * W + c; if (!BLUE.has(b[i]) && b[i] !== 'k') continue;
        let j = i; while (!ledge.has(j) && j + W < N && b[j + W] === '.') j += W;
        if (j !== i && BLUE.has(b[i]) && !ledge.has(j) && j + W < N && b[j + W] === 'k') { b[j + W] = b[i]; b[i] = '.'; return 'win'; }
        if (j !== i) { b[j] = b[i]; b[i] = '.'; ch = true; }
      }
      if (purple.length) {
        const pressed = btn.some(i => b[i] !== '.');
        for (const i of purple) { if (pressed && b[i] === 'p') { b[i] = '.'; ch = true; } else if (!pressed && b[i] === '.') { b[i] = 'p'; ch = true; } }
      }
      if (!ch) break;
    }
    return null;
  }
  function targets(b, i, t) {
    const c = i % W, r = Math.floor(i / W), out = [], ok = j => b[j] === '.' || b[j] === 'k' || b[j] === 'y';
    if (SL[t]) { for (const [dx, dy] of SL[t]) { let x = c, y = r; for (;;) { x += dx; y += dy; if (x < 0 || x >= W || y < 0 || y >= H) break; const j = y * W + x; if (b[j] === '.') { out.push(j); continue; } if (b[j] === 'k' || b[j] === 'y') out.push(j); break; } } }
    else if (t === 'K') { for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) { if (!dx && !dy) continue; const x = c + dx, y = r + dy; if (x >= 0 && x < W && y >= 0 && y < H && ok(y * W + x)) out.push(y * W + x); } }
    else if (t === 'N') { for (const [dx, dy] of KN) { const x = c + dx, y = r + dy; if (x >= 0 && x < W && y >= 0 && y < H && ok(y * W + x)) out.push(y * W + x); } }
    else if (t === 'P' || t === 'A') {
      if (r > 0 && b[i - W] === '.') { out.push(i - W); if (t === 'P' && r > 1 && b[i - 2 * W] === '.') out.push(i - 2 * W); }
      for (const dx of [-1, 1]) { const x = c + dx; if (r > 0 && x >= 0 && x < W && (b[(r - 1) * W + x] === 'k' || b[(r - 1) * W + x] === 'y')) out.push((r - 1) * W + x); }
    }
    return out;
  }
  const s0 = g.slice(); settle(s0);
  return { start: s0.join(''), *succ(s) {
    for (let i = 0; i < N; i++) {
      const ch = s[i]; if (!BLUE.has(ch)) continue;
      for (const t of (ch === '?' ? CHOICE : [ch])) for (const j of targets(s, i, t)) {
        if (s[j] === 'k') { yield [[i, j, t], null]; continue; }
        const nt = (t === 'P' || t === 'A') ? 'A' : t, promos = nt === 'A' && j < W ? ['Q', 'R', 'B', 'N'] : [nt];
        for (const pt of promos) {
          const b = s.split(''), cap = b[j]; b[j] = pt; b[i] = '.';
          if (cap === 'y' && !b.includes('y')) for (let q = 0; q < N; q++) if (b[q] === 'L') b[q] = '.';
          const w = settle(b);
          yield [[i, j, pt === nt ? t : t + '=' + pt], w ? null : b.join('')];
        }
      }
    }
  } };
}
for (const vid of Object.keys(data)) for (const lv of data[vid]) {
  const key = lv.name.replace('Level ', 'L'); if (only.length && !only.includes(key)) continue;
  const L = mk(lv), par = new Map([[L.start, null]]); let q = [L.start], sol = null, t0 = Date.now();
  outer: while (q.length && par.size < lim) {
    const nq = [];
    for (const s of q) for (const [mv, ns] of L.succ(s)) {
      if (ns === null) { const p = [mv]; let x = s; while (par.get(x)) { const [ps, pm] = par.get(x); p.push(pm); x = ps; } sol = p.reverse(); break outer; }
      if (!par.has(ns)) { par.set(ns, [s, mv]); nq.push(ns); }
    }
    q = nq;
  }
  if (process.env.SOLJSON && sol) { const o = fs.existsSync(process.env.SOLJSON) ? JSON.parse(fs.readFileSync(process.env.SOLJSON)) : {}; (o[vid] = o[vid] || {})[data[vid].indexOf(lv)] = sol.map(([i, j, t]) => [sq(i), sq(j), t]); fs.writeFileSync(process.env.SOLJSON, JSON.stringify(o)); }
  console.log(vid, key, 'states', par.size, ((Date.now() - t0) / 1000).toFixed(1) + 's', sol ? 'SOLVED in ' + sol.length + ': ' + sol.map(([i, j, t]) => t + ':' + sq(i) + '-' + sq(j)).join(' ') : (par.size >= lim ? 'LIMIT' : 'NOT SOLVED (exhausted)'));
}
