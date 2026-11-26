// g6_cf_l48.mjs (cf-2): staged search for Chessformer Level 48 (p6W3yDU-v88). Same rules as tools/g6_cf_astar.mjs (mk() copied verbatim).
// Usage: node tools/g6_cf_l48.mjs /tmp/cf.json --moves=b2-c3,d2-b3,... --goal=<js expr on helpers> [--limit=N] [--freeze=a2,...]
//   plays --moves from the start (each must be legal), then best-first/BFS searches until goal(s) is true; prints the full line.
//   goal helpers: at(t, sq) -> piece char on square, K -> index of the blue king, sqi('m5').
import fs from 'fs';
const W = 16, H = 10, N = W * H, CHOICE = ['R', 'B', 'N', 'K', 'P'];
const BLUE = new Set('KQRBNPA?'.split(''));
const SL = { R: [[1, 0], [-1, 0], [0, 1], [0, -1]], B: [[1, 1], [1, -1], [-1, 1], [-1, -1]] }; SL.Q = SL.R.concat(SL.B);
const KN = [[1, 2], [2, 1], [-1, 2], [-2, 1], [1, -2], [2, -1], [-1, -2], [-2, -1]];
const args = process.argv.slice(2), data = JSON.parse(fs.readFileSync(args[0], 'utf8'));
const opt = (k, d) => { const a = args.find(a => a.startsWith('--' + k + '=')); return a ? a.slice(k.length + 3) : d; };
const FILES = 'abcdefghijklmnop', sq = i => FILES[i % W] + (H + 1 - Math.floor(i / W)), sqi = s => FILES.indexOf(s[0]) + (H + 1 - +s.slice(1)) * W;
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


const lv = data['p6W3yDU-v88'].find(l => l.name === 'Level 48'), L = mk(lv);
const show = s => { for (let r = 0; r < H; r++) console.log(String(H + 1 - r).padStart(2), s.slice(r * W, r * W + W)); console.log('   ' + FILES); };
let root = L.start; const line = [], typed = [];
for (const m of opt('moves', '').split(',').filter(Boolean)) {
  const [f, t] = m.split('-').map(sqi), hit = [...L.succ(root)].find(([[i, j]]) => i === f && j === t);
  if (!hit) { console.log('ILLEGAL move', m, 'after', line.length); show(root); process.exit(2); }
  line.push(m); typed.push([sq(hit[0][0]), sq(hit[0][1]), hit[0][2]]);
  if (hit[1] === null) { console.log('WIN after', line.length, 'moves:', line.join(','));
    if (process.env.SOLJSON) { const f = process.env.SOLJSON, o = fs.existsSync(f) ? JSON.parse(fs.readFileSync(f)) : {}; (o['p6W3yDU-v88'] = o['p6W3yDU-v88'] || {})[data['p6W3yDU-v88'].indexOf(lv)] = typed; fs.writeFileSync(f, JSON.stringify(o)); console.log('wrote', f); }
    process.exit(0); }
  root = hit[1];
}
console.log('after', line.length, 'moves:'); show(root);
const goalSrc = opt('goal', ''); if (!goalSrc) process.exit(0);
const freeze = new Set(opt('freeze', '').split(',').filter(Boolean).map(sqi));   // squares whose piece may not move (tracked by identity is overkill: frozen pieces never move so their square is fixed)
const HELP = 'const kI = s.indexOf("K"), kR = 11 - Math.floor(kI / 16), kC = kI % 16; const pos = c => { const o = []; for (let i = 0; i < s.length; i++) if (s[i] === c) o.push([i % 16, 11 - Math.floor(i / 16)]); return o; };';
const goal = new Function('s', 'sqi', HELP + 'return (' + goalSrc + ');'), hsrc = opt('h', '0'), hf = new Function('s', 'sqi', HELP + 'return (' + hsrc + ');');
const lim = +opt('limit', '2000000'), WG = +opt('w', '1');
class Heap { constructor() { this.a = []; } push(p, v) { const a = this.a; a.push([p, v]); let i = a.length - 1; while (i) { const k = (i - 1) >> 1; if (a[k][0] <= a[i][0]) break; [a[k], a[i]] = [a[i], a[k]]; i = k; } }
  pop() { const a = this.a, top = a[0], last = a.pop(); if (a.length) { a[0] = last; let i = 0; for (;;) { const l = 2 * i + 1, r = l + 1; let m = i; if (l < a.length && a[l][0] < a[m][0]) m = l; if (r < a.length && a[r][0] < a[m][0]) m = r; if (m === i) break; [a[m], a[i]] = [a[i], a[m]]; i = m; } } return top; } get size() { return this.a.length; } }
const par = new Map([[root, null]]), dep = new Map([[root, 0]]), hp = new Heap(); hp.push(0, root); let found = null, win = null, t0 = Date.now(), seq = 0;
const path = s => { const p = []; while (par.get(s)) { const [ps, pm] = par.get(s); p.push(pm); s = ps; } return p.reverse(); };
const mv = ([i, j]) => sq(i) + '-' + sq(j);
if (goal(root, sqi)) found = root;
const SECS = +opt('secs', '95');
outer: while (!found && hp.size && par.size < lim && (par.size & 1023 || (Date.now() - t0) / 1000 < SECS)) {
  const [, s] = hp.pop(), d = dep.get(s);
  for (const [m, ns] of L.succ(s)) {
    if (freeze.has(m[0])) continue;
    if (ns === null) { win = path(s).concat([m]); break outer; }
    if (par.has(ns)) continue;
    par.set(ns, [s, m]); dep.set(ns, d + 1);
    if (goal(ns, sqi)) { found = ns; break outer; }
    hp.push(d + 1 + WG * hf(ns, sqi) + (seq++) * 1e-9, ns);
  }
}
console.log('states', par.size, ((Date.now() - t0) / 1000).toFixed(1) + 's');
if (win) { const all = line.concat(win.map(mv)); console.log('WIN in', all.length, ':', all.join(',')); }
else if (found) { const p = path(found).map(mv); console.log('GOAL in +' + p.length + ':', p.join(',')); console.log('FULL:', line.concat(p).join(',')); show(found); }
else console.log(par.size >= lim ? 'LIMIT' : hp.size ? 'TIMEOUT' : 'EXHAUSTED');
