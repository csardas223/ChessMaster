// g6-3d (2026-11-25): solvability check for the Beyond the Board rook levels (data/modes/xlErokL2-4c.js).
//   node tools/btb_solve.js     -> shortest winning line per level (BFS over White moves; Black = sentries that strike
//                                  whatever enters their line, else pass), using the real engine + the mode's rule hooks.
global.window = global; global.location = { protocol: 'http:' }; global.performance = global.performance || require('perf_hooks').performance;
global.document = { getElementById: () => null };
const fs = require('fs'), path = require('path'), root = path.join(__dirname, '..');
for (const f of ['js/core/ns.js', 'js/engine/geometry.js', 'js/engine/movement.js', 'js/engine/variant.js', 'js/engine/search.js', 'js/engine/spec.js', 'js/modes/g6_levels.js', 'data/modes/xlErokL2-4c.js'])
  eval(fs.readFileSync(path.join(root, f), 'utf8'));
const C = window.CM, raw = C.MODES['xlErokL2-4c'];
const base = C.hooks.g6_levels, hooks = Object.assign({}, base, raw.hooks); hooks._base = base;
const spec = C.spec.normalize(JSON.parse(JSON.stringify(Object.assign({}, raw, { hooks: undefined }))));
const V = C.spec.buildVariant(spec, hooks);
let allOk = true;
raw.params.levels.forEach((lv, k) => {
  if (lv.kidnap) return;
  const g = V.geo, st = C.spec.initialState(V, spec);
  st.b = C.spec.parseSetup(V, lv.fen);
  (lv.mask || []).forEach((row, r) => { for (let c = 0; c < row.length; c++) if (row[c] === 'x' && !st.b[r * g.files + c]) st.b[r * g.files + c] = V.piece('Vd', 'n'); });
  Object.keys(lv.buttons || {}).forEach(a => (lv.buttons[a].bridge || []).forEach(nm => { const j = g.parse(nm); if (!st.b[j]) st.b[j] = V.piece('Vd', 'n'); }));
  st.turn = 'w';
  st.x = Object.assign({ chk: 0, lead: 0 }, lv.x || {}, { btns: lv.buttons || null, tick: 0, act: null, hex: 0, boss: !!lv.boss, up: !lv.boss, beam: null, fell: null });
  st.start = { wRoyal: false, bRoyal: true };
  const key = s => s.b.map(p => p ? p.t + p.c : '.').join('') + JSON.stringify([s.x.tick, s.x.act, s.x.hex, s.x.up]);
  const seen = new Set([key(st)]); let q = [{ s: st, line: [] }], found = null;
  for (let d = 0; d < 14 && q.length && !found; d++) {
    const nq = [];
    for (const { s, line } of q) {
      for (const m of V.legal(s)) {
        const n = m.n || V.make(s, m), san = g.name(m.f) + (m.cap ? 'x' : '-') + g.name(m.t);
        const r = V.result(n, V.legal(n));
        if (r && r.w === 'w') { found = line.concat(san); break; }
        if (r) continue;
        if (!n.b.some(p => p && p.c === 'w')) continue;
        const bl = V.legal(n), caps = bl.filter(x => x.cap);
        if (caps.length) continue;                // a sentry (or the king) strikes
        const n2 = bl.length ? (bl[0].n || V.make(n, bl[0])) : n;
        if (!n2.b.some(p => p && p.c === 'w')) continue;
        const kk = key(n2); if (seen.has(kk)) continue; seen.add(kk);
        nq.push({ s: n2, line: line.concat(san) });
      }
      if (found) break;
    }
    q = nq;
  }
  if (!found) allOk = false;
  console.log(`level ${k + 1} ${lv.name}: ` + (found ? `solvable in ${found.length}: ${found.join(' ')}` : 'NO SOLUTION'));
});
process.exit(allOk ? 0 : 1);
