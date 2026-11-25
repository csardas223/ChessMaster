// Best-first (A*) companion of g6_cf_solve.mjs; fast BFS for the Chessformer levels (same rules as tools/g6_cf_levels.py Level.settle/targets/succ, ported to node).
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
        if (BLUE.has(b[i]) && !ledge.has(j) && j + W < N && b[j + W] === 'k') { b[j + W] = b[i]; b[i] = '.'; return 'win'; }
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

// Best-first search (weighted A*): f = depth + WGT * h, h = distance of the nearest blue piece to the red king
// (plus the distance to the key 'y' while locks remain). Not exhaustive-optimal, but finds deep lines BFS cannot reach.
const WGT = +((args.find(a => a.startsWith('--w=')) || '=3').split('=')[1]);
class Heap { constructor() { this.a = []; } push(p, v) { const a = this.a; a.push([p, v]); let i = a.length - 1; while (i) { const k = (i - 1) >> 1; if (a[k][0] <= a[i][0]) break; [a[k], a[i]] = [a[i], a[k]]; i = k; } }
  pop() { const a = this.a, top = a[0], last = a.pop(); if (a.length) { a[0] = last; let i = 0; for (;;) { const l = 2 * i + 1, r = l + 1; let m = i; if (l < a.length && a[l][0] < a[m][0]) m = l; if (r < a.length && a[r][0] < a[m][0]) m = r; if (m === i) break; [a[m], a[i]] = [a[i], a[m]]; i = m; } } return top; } get size() { return this.a.length; } }
// h: for every piece type, a per-square distance computed for that piece ALONE on the static board (walls, locks, purple
// blocks, ledges, gravity after every move) to capturing the target (the king, or the key 'y' while locks stand). Squares a lone
// piece cannot finish from (it needs other pieces as stepping stones) fall back to the gravity-free distance + PEN.
const PEN = +((args.find(a => a.startsWith('--pen=')) || '=4').split('=')[1]);
const TYPES = ['K', 'Q', 'R', 'B', 'N', 'P', 'A'];
function lonePiece(lv) {
  const ledge = new Set(lv.ledges.map(([c, r]) => r * W + c)), cache = new Map();
  return function maps(s, tgt, grav) {   // s: state string; tgt: target index
    const locks = s.includes('L'), key = tgt + ':' + locks + ':' + grav + ':' + (s.match(/p/g) || []).length; if (cache.has(key)) return cache.get(key);
    const solid = j => s[j] === '#' || s[j] === 'p' || (s[j] === 'L');
    const b = Array.from(s, (c, j) => (j === tgt ? 'k' : solid(j) ? '#' : '.'));
    function fall(j) { if (!grav) return j; while (!ledge.has(j) && j + W < N && b[j + W] === '.') j += W; return j; }
    function moves(i, t) {   // returns [landing, isGoal]
      const c = i % W, r = (i / W) | 0, out = [], add = j => { if (b[j] === 'k') { out.push([j, 1]); return; } const f = fall(j); out.push([f, grav && !ledge.has(f) && f + W < N && f + W === tgt ? 1 : 0]); };
      if (SL[t]) { for (const [dx, dy] of SL[t]) { let x = c, y = r; for (;;) { x += dx; y += dy; if (x < 0 || x >= W || y < 0 || y >= H) break; const j = y * W + x; if (b[j] === '.') { add(j); continue; } if (b[j] === 'k') add(j); break; } } }
      else if (t === 'K' || t === 'N') { const D = t === 'N' ? KN : [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]; for (const [dx, dy] of D) { const x = c + dx, y = r + dy; if (x >= 0 && x < W && y >= 0 && y < H && b[y * W + x] !== '#') add(y * W + x); } }
      else { if (r > 0 && b[i - W] === '.') { add(i - W); if (t === 'P' && r > 1 && b[i - 2 * W] === '.') add(i - 2 * W); }
        for (const dx of [-1, 1]) { const x = c + dx; if (r > 0 && x >= 0 && x < W && b[(r - 1) * W + x] === 'k') add((r - 1) * W + x); } }
      return out;
    }
    const res = {};
    for (const t of TYPES) {   // reverse graph BFS from the goal
      const rev = Array.from({ length: N + 1 }, () => []), GOAL = N;
      for (let i = 0; i < N; i++) { if (b[i] === '#') continue; for (const [j, g] of moves(i, t)) { if (g) rev[GOAL].push(i); else { const nt = (t === 'P' || t === 'A') ? 'A' : t; if (nt === t) rev[j].push(i); } } }
      // pawns change type after their first move: handle P via A's distances
      const d = new Int16Array(N).fill(999), q = [];
      for (const i of rev[GOAL]) if (d[i] === 999) { d[i] = 1; q.push(i); }
      for (let k = 0; k < q.length; k++) for (const i of rev[q[k]]) if (d[i] === 999) { d[i] = d[q[k]] + 1; q.push(i); }
      res[t] = d;
    }
    // P: one move then behaves as A
    const dP = new Int16Array(N).fill(999);
    for (let i = 0; i < N; i++) { if (b[i] === '#') continue; for (const [j, g] of moves(i, 'P')) dP[i] = Math.min(dP[i], g ? 1 : res.A[j] + 1); }
    res.P = dP; cache.set(key, res); return res;
  };
}
function mkH(lv) {
  const maps = lonePiece(lv);
  function dist(s, tgt) {
    const G = maps(s, tgt, true), F = maps(s, tgt, false); let best = 999;
    for (let i = 0; i < N; i++) { const ch = s[i]; if (!BLUE.has(ch)) continue;
      for (const t of (ch === '?' ? CHOICE : [ch])) best = Math.min(best, G[t][i] < 999 ? G[t][i] : F[t][i] + PEN); }
    return best;
  }
  return function h(s) {
    const k = s.indexOf('k'); if (k < 0) return 0; const y = s.indexOf('y');
    if (y >= 0 && s.includes('L')) return Math.min(dist(s, k), dist(s, y) + dist(s.replace(/L/g, '.').replace('y', '.'), k));   // the key is optional when the locks are not in the way
    return dist(s, k);
  };
}
for (const vid of Object.keys(data)) for (const lv of data[vid]) {
  const key = lv.name.replace('Level ', 'L'); if (only.length && !only.includes(key)) continue;
  const L = mk(lv), h = mkH(lv);
  // --prefix=b2-c3,d2-b3,...: play a known opening line first (each move must be legal) and search from the position it reaches
  const PRE = ((args.find(a => a.startsWith('--prefix=')) || '=').split('=')[1] || '').split(',').filter(Boolean), pidx = s => FILES.indexOf(s[0]) + (H + 1 - +s.slice(1)) * W;
  let root = L.start; const preMoves = [];
  for (const m of PRE) { const [f, t] = m.split('-').map(pidx), hit = [...L.succ(root)].find(([[i, j]]) => i === f && j === t);
    if (!hit) { console.log(vid, key, 'prefix move', m, 'is ILLEGAL after', preMoves.length, 'moves'); process.exit(2); }
    preMoves.push(hit[0]); if (hit[1] === null) { console.log('prefix already wins'); break; } root = hit[1]; }
  if (PRE.length) { console.log('prefix ok (' + preMoves.length + ' moves), position:'); for (let r = 0; r < H; r++) console.log(String(H + 1 - r).padStart(2), root.slice(r * W, r * W + W)); }
  const par = new Map([[root, null]]), dep = new Map([[root, 0]]), hp = new Heap(); hp.push(WGT * h(root), root);
  let sol = null, t0 = Date.now();
  outer: while (hp.size && par.size < lim) {
    const [, s] = hp.pop(), d = dep.get(s);
    for (const [mv, ns] of L.succ(s)) {
      if (ns === null) { const p = [mv]; let x = s; while (par.get(x)) { const [ps, pm] = par.get(x); p.push(pm); x = ps; } sol = preMoves.concat(p.reverse()); break outer; }
      if (!par.has(ns)) { par.set(ns, [s, mv]); dep.set(ns, d + 1); hp.push(d + 1 + WGT * h(ns), ns); }
    }
  }
  if (process.env.SOLJSON && sol) { const o = fs.existsSync(process.env.SOLJSON) ? JSON.parse(fs.readFileSync(process.env.SOLJSON)) : {}; (o[vid] = o[vid] || {})[data[vid].indexOf(lv)] = sol.map(([i, j, t]) => [sq(i), sq(j), t]); fs.writeFileSync(process.env.SOLJSON, JSON.stringify(o)); }
  console.log(vid, key, 'w=' + WGT, 'states', par.size, ((Date.now() - t0) / 1000).toFixed(1) + 's', sol ? 'SOLVED in ' + sol.length + ': ' + sol.map(([i, j, t]) => t + ':' + sq(i) + '-' + sq(j)).join(' ') : (par.size >= lim ? 'LIMIT' : 'NOT SOLVED (exhausted)'));
}
