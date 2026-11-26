// m-levels (2026-11-26): independent Chessformer solvability check, read straight from the SHIPPED mode files
// (data/modes/p6W3yDU-v88.js + oAoik9Dj2qQ.js params.levels: fen + tiles + choice), with the rules of js/modes/g6_levels.js:
// blue pieces move like chess pieces (check none, no castling/en passant), may capture only the red king and keys; every
// unmoved pawn may double-step (params.pawnDoubleAnyRank); pawns promote to Q/R/B/N on the top rank; after a move the last
// key's capture removes all locks, then the board settles to a fixpoint: gravity bottom row first (keys, locks, purple blocks
// and terrain stay put; a thin ledge tile holds the piece on it), a blue piece that comes to rest straight above the red king
// takes it (params.gravity.fallCapture), and purple blocks vanish while any button square is occupied / return to their home
// squares when all buttons are empty. '?' slots (Ch) settle first and are then picked from the level's choice list.
// Method: breadth-first search over all start picks (multi-source BFS, shortest win) up to --limit states per level; a level
// that is too deep for plain BFS is verified by replaying its stored line (tools/g6_cf_solutions_verify.json) under these
// same rules. Usage: node tools/cf_bfs_verify.mjs [--limit=2000000] [--only=L39,L48] [--json=out.json]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const args = process.argv.slice(2), opt = (k, d) => { const a = args.find(x => x.startsWith('--' + k + '=')); return a ? a.split('=')[1] : d; };
const LIMIT = +opt('limit', 2000000), ONLY = opt('only', '') ? opt('only', '').split(',') : null, JSON_OUT = opt('json', '');
const W = 16, H = 11, N = W * H, FILES = 'abcdefghijklmnop';
const sqName = i => FILES[i % W] + (H - Math.floor(i / W)), sqIdx = s => (H - +s.slice(1)) * W + FILES.indexOf(s[0]);
const BLUE = new Set(['K', 'Q', 'R', 'B', 'N', 'P', 'A']);   // P = unmoved pawn (may double-step), A = moved pawn
const SL = { R: [[1, 0], [-1, 0], [0, 1], [0, -1]], B: [[1, 1], [1, -1], [-1, 1], [-1, -1]] }; SL.Q = SL.R.concat(SL.B);
const KN = [[1, 2], [2, 1], [-1, 2], [-2, 1], [1, -2], [2, -1], [-1, -2], [-2, -1]];

function levelsOf(id) {
  const s = fs.readFileSync(path.join(ROOT, 'data/modes', id + '.js'), 'utf8');
  return JSON.parse(s.match(/levels: (\[.*?\]) \}/s)[1]);
}
function parseFen(fen) {
  const b = [];
  for (const row of fen.split('/')) {
    let i = 0, n = 0;
    while (i < row.length) {
      const c = row[i];
      if (/\d/.test(c)) { let j = i; while (/\d/.test(row[j])) j++; const k = +row.slice(i, j); for (let q = 0; q < k; q++) b.push('.'); n += k; i = j; continue; }
      if (c === '[') { const j = row.indexOf(']', i), t = row.slice(i + 1, j); b.push({ 'n:Pb': 'p', 'n:Ky': 'y', 'n:Lk': 'L', Ch: '?' }[t] || '!'); n++; i = j + 1; continue; }
      b.push(c === '*' ? '#' : c === 'P' ? 'P' : c); n++; i++;
    }
    if (n !== W) throw new Error('row width ' + n + ' in ' + row);
  }
  if (b.length !== N) throw new Error('rows ' + b.length / W);
  return b;
}

function make(lv) {
  const tiles = lv.tiles || {}, ledge = new Uint8Array(N), btn = [];
  for (const [nm, t] of Object.entries(tiles)) { if (t === 'ledge') ledge[sqIdx(nm)] = 1; else if (t === 'button') btn.push(sqIdx(nm)); else throw new Error('tile ' + t); }
  const b0 = parseFen(lv.fen), home = [];
  b0.forEach((c, i) => { if (c === 'p') home.push(i); if (c === '!') throw new Error('unknown piece'); });
  const falls = c => BLUE.has(c) || c === 'k' || c === '?';
  // returns 'win' | 'lose' | null; mutates b
  function settle(b) {
    for (let it = 0; it < 12; it++) {
      let ch = false;
      for (let r = H - 1; r >= 0; r--) for (let c = 0; c < W; c++) {
        const s0 = r * W + c, p = b[s0]; if (!falls(p)) continue;
        let j = s0; while (!ledge[j]) { const nx = j + W; if (nx >= N || b[nx] !== '.') break; j = nx; }
        const land = j + W;
        if (land < N && !ledge[j]) {
          if (BLUE.has(p) && b[land] === 'k') { b[land] = p; b[s0] = '.'; return 'win'; }
          if (p === 'k' && b[land] === 'K') { b[land] = p; b[s0] = '.'; return 'lose'; }
        }
        if (j !== s0) { b[j] = p; b[s0] = '.'; ch = true; }
      }
      if (home.length && btn.length) {
        const pressed = btn.some(i => b[i] !== '.');
        for (const j of home) {
          if (pressed && b[j] === 'p') { b[j] = '.'; ch = true; } else if (!pressed && b[j] === '.') { b[j] = 'p'; ch = true; }
        }
      }
      if (!ch) break;
    }
    return null;
  }
  const start = b0.slice(); if (settle(start)) throw new Error('settles to a result at start');
  const slots = []; start.forEach((c, i) => { if (c === '?') slots.push(i); });
  const capt = c => c === 'k' || c === 'y';
  function moves(b) {   // [from, to, promo|null]
    const out = [];
    for (let i = 0; i < N; i++) {
      const t = b[i]; if (!BLUE.has(t)) continue; const c = i % W, r = (i / W) | 0;
      const add = (j, pr) => out.push([i, j, pr || null]);
      if (SL[t]) for (const [dx, dy] of SL[t]) { let x = c, y = r; for (;;) { x += dx; y += dy; if (x < 0 || x >= W || y < 0 || y >= H) break; const j = y * W + x; if (b[j] === '.') { add(j); continue; } if (capt(b[j])) add(j); break; } }
      else if (t === 'K' || t === 'N') {
        const D = t === 'N' ? KN : [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
        for (const [dx, dy] of D) { const x = c + dx, y = r + dy; if (x < 0 || x >= W || y < 0 || y >= H) continue; const j = y * W + x; if (b[j] === '.' || capt(b[j])) add(j); }
      } else {   // pawn: forward = up
        const promo = j => (j < W ? ['Q', 'R', 'B', 'N'].forEach(q => add(j, q)) : add(j));
        if (r > 0 && b[i - W] === '.') { promo(i - W); if (t === 'P' && r > 1 && b[i - 2 * W] === '.') promo(i - 2 * W); }
        for (const dx of [-1, 1]) { const x = c + dx; if (r > 0 && x >= 0 && x < W && capt(b[(r - 1) * W + x])) promo((r - 1) * W + x); }
      }
    }
    return out;
  }
  function play(b, [f, t, pr]) {   // returns [newBoard, 'win'|'lose'|null]
    const n = b.slice(), cap = n[t];
    let p = n[f]; if (p === 'P') p = 'A'; if (pr) p = pr;
    n[t] = p; n[f] = '.';
    if (cap === 'k') return [n, 'win'];
    if (cap === 'y' && !n.includes('y')) for (let q = 0; q < N; q++) if (n[q] === 'L') n[q] = '.';
    return [n, settle(n)];
  }
  return { start, slots, moves, play, choice: lv.choice || [] };
}

function bfs(L) {
  const { start, slots, moves, play, choice } = L;
  const starts = [];
  const rec = (k, b) => { if (k === slots.length) { starts.push(b); return; } for (const t of choice) { const n = b.slice(); n[slots[k]] = t === 'P' ? 'P' : t; rec(k + 1, n); } };
  rec(0, start);
  const seen = new Map(); let q = [];
  for (const s of starts) { const k = s.join(''); if (!seen.has(k)) { seen.set(k, null); q.push(s); } }
  let depth = 0;
  while (q.length) {
    depth++; const nq = [];
    for (const b of q) {
      const kb = b.join('');
      for (const m of moves(b)) {
        const [n, res] = play(b, m);
        if (res === 'win') {
          const line = [[sqName(m[0]), sqName(m[1]), m[2]]]; let k = kb;
          while (seen.get(k)) { const [pk, pm] = seen.get(k); line.unshift(pm); k = pk; }
          return { solved: true, moves: depth, states: seen.size, line, pick: slots.map(i => sqName(i) + '=' + start[i]) };
        }
        if (res === 'lose') continue;
        const kn = n.join(''); if (seen.has(kn)) continue;
        seen.set(kn, [kb, [sqName(m[0]), sqName(m[1]), m[2]]]); nq.push(n);
        if (seen.size > LIMIT) return { solved: false, capped: true, states: seen.size, depth };
      }
    }
    q = nq;
  }
  return { solved: false, exhausted: true, states: seen.size };
}

// replay a stored line ([from, to, type] per move); '?' slots are picked from the type of the first move out of each slot
function replay(L, line) {
  const { start, slots, moves, play, choice } = L;
  const b0 = start.slice();
  for (const s of slots) { const mv = line.find(m => sqIdx(m[0]) === s); b0[s] = mv ? mv[2][0].replace('A', 'P') : choice[0]; if (!choice.includes(b0[s] === 'A' ? 'P' : b0[s])) return { ok: false, why: 'pick ' + b0[s] + ' not allowed' }; }
  let b = b0;
  for (let k = 0; k < line.length; k++) {
    const [f, t, ty0] = line[k], fi = sqIdx(f), ti = sqIdx(t);
    const ty = ty0 && (ty0[0] === 'A' ? 'P' : ty0[0]), want = ty0 && ty0.includes('=') ? ty0.split('=')[1] : null;   // 'A' = moved pawn, 'P=N' = pawn promoting to N
    const have = b[fi] === 'A' || b[fi] === 'P' ? 'P' : b[fi];
    const cand = moves(b).filter(m => m[0] === fi && m[1] === ti);
    if (!cand.length || (ty && have !== ty && !(ty === 'P' && have === 'P'))) return { ok: false, why: 'move ' + (k + 1) + ' ' + f + '-' + t + ' (' + ty + ') illegal; piece there: ' + b[fi] };
    const m = want ? cand.find(x => x[2] === want) : (cand.find(x => !x[2]) || cand.find(x => x[2] === 'Q') || cand[0]);
    if (!m) return { ok: false, why: 'move ' + (k + 1) + ' promotion to ' + want + ' not available' };
    const [n, res] = play(b, m);
    if (res === 'win') return { ok: k === line.length - 1, moves: k + 1, why: k === line.length - 1 ? '' : 'won early' };
    if (res === 'lose') return { ok: false, why: 'lost at move ' + (k + 1) };
    b = n;
  }
  return { ok: false, why: 'line ends without capturing the king' };
}

const stored = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools/g6_cf_solutions_verify.json'), 'utf8'));
const report = {}; let bad = 0;
for (const id of ['oAoik9Dj2qQ', 'p6W3yDU-v88']) {
  levelsOf(id).forEach((lv, k) => {
    const tag = lv.name.replace('Level ', 'L');
    if (ONLY && !ONLY.includes(tag)) return;
    const L = make(lv), t0 = Date.now();
    const line = stored[id] && stored[id][String(k)];
    let r;
    if (line) { r = replay(L, line); r.method = 'replay of stored line (' + line.length + ' moves)'; if (!r.ok) { console.log("  stored line failed:", r.why); const b = bfs(L); if (b.solved) r = Object.assign(b, { method: 'BFS (stored line failed: ' + r.why + ')', ok: true }); } }
    else { r = bfs(L); r.method = 'BFS'; r.ok = r.solved; }
    r.ms = Date.now() - t0;
    report[id + ' ' + lv.name] = r; if (!r.ok) bad++;
    console.log(id, lv.name, r.ok ? 'SOLVABLE' : 'NOT PROVEN', '|', r.method, '|', r.moves != null ? r.moves + ' moves' : '', r.states != null ? r.states + ' states' : '', r.why || '', r.ms + ' ms');
  });
}
if (JSON_OUT) fs.writeFileSync(JSON_OUT, JSON.stringify(report, null, 1));
console.log(bad ? bad + ' level(s) not proven' : 'ALL LEVELS SOLVABLE');
process.exit(bad ? 1 : 0);
