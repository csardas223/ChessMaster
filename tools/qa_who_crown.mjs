/* QA for js/games/who-crown.js (Who Takes the Crown, UzoZVdmGpyc): ASCII map of the tower + a breadth-first search over
   the pawn's landing spots with the module's own physics (CM.whoCrown.phys).
   node tools/qa_who_crown.mjs                      -> start position: the climb must stall low (the d4/Qg5 leading moves are needed)
   node tools/qa_who_crown.mjs --hints              -> after every leading move: reaches the top of the Bc3# board, not above (pawn rows)
   node tools/qa_who_crown.mjs --hints --super --mate --noascii -> with super jumps and Ra6# played: the king under the crown is reached */
// ASCII render of a tower draft + BFS climb check using the module's physics
import fs from 'fs';
const src = fs.readFileSync(process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : 'js/games/who-crown.js', 'utf8');
const window = { CM: { defineGame() {} } }; globalThis.window = window;
new Function('window', src)(window);
const WC = window.CM.whoCrown, T = WC.TOWER;
const opts = process.argv.slice(2);
/* each unlocked board after its leading moves (computed with python-chess from the hints in TOWER) */
const HINTED = {
 "rnbqk3/5p2/7p/4p3/8/2P5/1P1P4/R3K3": "rnb1k3/5p2/7p/4p1q1/3P4/2P5/1P6/R3K3",
 "4k2r/8/1N2p2N/6B1/3P4/2P5/1P6/K3R3": "5k1r/8/1N2R2N/6B1/3P4/2P5/1P6/K7",
 "2n5/pp1r3p/8/6P1/4Q3/2PP4/1k2KP2/1r3R2": "2n5/pp1r3p/8/6P1/4rP2/2PP4/1k3K2/5R2",
 "7k/5K1p/4P3/3P4/2P5/1P6/P7/4B3": "7k/5K1p/4P3/3P4/2P5/1PB5/P7/8",
 "8/8/4R3/1k3p2/1P4p1/P7/1K2N2P/2R5": "8/8/4R3/1k3p2/1P1N2p1/P7/1K5P/2R5"
};
if (opts.includes('--mate')) HINTED['8/8/4R3/1k3p2/1P4p1/P7/1K2N2P/2R5'] = '8/8/R7/5p2/kP1N2p1/P7/1K5P/2R5';
const applyHints = opts.includes('--hints');
// build cell map
function boardsCells() {
  const cells = new Map();
  T.boards.forEach((B, bi) => {
    const rows = WC.fenRows(B.fen);
    let rowsUse = rows;
    if (applyHints && HINTED[B.fen]) rowsUse = WC.fenRows(HINTED[B.fen]);
    for (let r = 0; r < 8; r++) for (let f = 0; f < 8; f++) { const ch = rowsUse[7 - r][f]; if (ch && ch !== '.') cells.set((B.x + f) + ',' + (B.y + r), ch); }
  });
  (T.ledges || []).forEach(L => { for (let x = L.x; x < L.x + L.w; x++) cells.set(x + ',' + L.y, '='); });
  return cells;
}
const cells = boardsCells();
const solid = (cx, cy) => cy < 0 || cx < 0 || cx >= T.width || cells.has(cx + ',' + cy) ? (cells.has(cx + ',' + cy) && cells.get(cx + ',' + cy) !== '=' ? 2 : 1) : 0;
// render
let maxY = T.height;
const lines = [];
for (let y = maxY - 1; y >= 0; y--) {
  let s = String(y).padStart(3) + ' ';
  for (let x = 0; x < T.width; x++) {
    const c = cells.get(x + ',' + y);
    let bg = ' ';
    T.boards.forEach(B => { if (x >= B.x && x < B.x + 8 && y >= B.y && y < B.y + 8) bg = B.locked ? ':' : '.'; });
    if (T.crown && Math.floor(T.crown.x) === x && Math.floor(T.crown.y) === y) bg = '@';
    (T.checkpoints || []).forEach(F => { if (Math.floor(F.x) === x && Math.floor(F.y) === y) bg = 'F'; });
    s += c || bg;
  }
  lines.push(s);
}
if (!opts.includes('--noascii')) console.log(lines.join('\n'));
// BFS
const P = WC.phys;
function settle(x, y) { const b = { x, y, vx: 0, vy: 0, ground: false }; for (let i = 0; i < 400 && !b.ground; i++) P.step(b, 1 / 60, solid); return b; }
function sim(x, y, vx, vy, phase) {
  const b = { x, y, vx, vy, ground: false, phase };
  for (let i = 0; i < 600; i++) { P.step(b, 1 / 60, solid); if (b.ground && i > 1) return b; }
  return null;
}
const key = b => Math.round(b.x * 10) + ':' + Math.round(b.y * 100);
const start = settle(T.spawn.x, T.spawn.y);
const seen = new Map(); const q = [start]; seen.set(key(start), start);
let best = start;
const supers = opts.includes('--super');
while (q.length) {
  const s = q.shift();
  if (s.y > best.y) best = s;
  // walk: sample positions along the support by stepping
  const xs = [];
  for (const dir of [-1, 1]) {
    const b = { x: s.x, y: s.y, vx: 0, vy: 0, ground: true, walk: true };
    for (let i = 0; i < 400; i++) { b.vx = dir * P.WALK; P.step(b, 1 / 60, solid); if (!b.ground) { b.walk=false; const l = sim(b.x, b.y, b.vx, b.vy, false); if (l) xs.push(l); break; } if (i % 6 === 0) xs.push({ x: b.x, y: b.y, ground: true }); if (Math.abs(b.vx) < 1e-6) break; }
  }
  for (const n of xs) { const k = key(n); if (!seen.has(k)) { seen.set(k, n); q.push(n); } }
  for (const c of [0, 0.25, 0.5, 0.75, 1]) for (const d of [-1, 0, 1]) {
    for (const sup of supers ? [false, true] : [false]) {
      const j = P.jump(c, d, sup);
      const l = sim(s.x, s.y, j.vx, j.vy, sup);
      if (l) { const k = key(l); if (!seen.has(k)) { seen.set(k, l); q.push(l); } }
    }
  }
  if (seen.size > 60000) break;
}
console.log('states', seen.size, 'best height', best.y.toFixed(2), 'at x', best.x.toFixed(2));
const goal = T.crown; const got = [...seen.values()].some(b => Math.abs(b.x - goal.x) < 1.2 && b.y >= goal.y - 1.4 && b.y < goal.y + 1.5);
console.log('crown reachable:', got);
(T.checkpoints || []).forEach((F, i) => console.log('checkpoint', i, [...seen.values()].some(b => Math.abs(b.x - F.x) < 0.8 && Math.abs(b.y - F.y) < 0.6)));
