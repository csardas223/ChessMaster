// s6-soko (2026-11-26): proves every Soko Chess level (data/modes/7lEglazTlo8.js) solvable with the SHIPPED rules.
// Loads the real engine (test/engine-sandbox.mjs) + the mode file, builds each level exactly like the mode's load()
// (CORE.fen + priority badges), and runs a breadth-first search over V.legal / V.make, so the mode's sokoGen + onMake
// hooks (push, capture resolution by priority) are what is searched. Win = CORE.won after the move, as in afterMove.
// Prints the shortest solution of each level. Usage: node tools/soko_bfs_verify.mjs [--limit=2000000]
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { makeSandbox } from '../test/engine-sandbox.mjs';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const LIMIT = +((process.argv.find((a) => a.startsWith('--limit=')) || '').split('=')[1] || 2000000);
const sb = makeSandbox();
vm.runInContext(fs.readFileSync(path.join(ROOT, 'data/modes/7lEglazTlo8.js'), 'utf8'), sb, { filename: '7lEglazTlo8.js' });
const CM = sb.CM, CORE = CM.sokoCore, spec0 = CM.MODES['7lEglazTlo8'];
const LEVELS = spec0.hooks && CM.sokoLevels ? CM.sokoLevels : null;
const spec = CM.spec.normalize(spec0);
const V = CM.spec.buildVariant(spec, spec0.hooks);
const key = (st) => st.b.map((p) => (p ? (p.t === '#' ? '' : p.t + p.c + (p.n || '')) : '.')).join(',');
let fail = 0;
(LEVELS || []).forEach((L, k) => {
  const st = CM.spec.initialState(V, Object.assign({}, spec, { setup: { fen: CORE.fen(L), turn: 'w' } }));
  Object.keys(L.pri || {}).forEach((s) => { const i = CORE.sq(s); if (st.b[i]) st.b[i] = Object.assign({}, st.b[i], { n: L.pri[s] }); });
  const T = CORE.build(L).targets, seen = new Map([[key(st), null]]);
  let q = [st], depth = 0, win = null;
  while (q.length && !win && seen.size < LIMIT) {
    const nq = [];
    for (const s of q) {
      for (const m of V.legal(s)) {
        const n = V.make(s, m), kk = key(n); if (seen.has(kk)) continue;
        seen.set(kk, { p: key(s), m: V.geo.name(m.f) + '-' + V.geo.name(m.t) });
        if (CORE.won(n.b, T)) { win = kk; break; }
        if (CORE.whites(n.b)) nq.push(n);
      }
      if (win) break;
    }
    q = nq; depth++;
  }
  const line = []; for (let kk = win; kk && seen.get(kk); kk = seen.get(kk).p) line.unshift(seen.get(kk).m);
  if (!win) fail++;
  console.log(`L${k + 1} ${L.name}: ${win ? 'SOLVABLE in ' + line.length + ' moves' : 'NOT SOLVED'} (${seen.size} states)${win ? '  ' + line.join(' ') : ''}`);
});
if (!LEVELS) { console.log('no levels exposed (CM.sokoLevels)'); fail = 1; }
process.exit(fail ? 1 : 0);
