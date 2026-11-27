/* Compare MirrorFish review classes: the in-game evaluator (fairy_<tag>.json, CM.mirrorReview.evalFen) vs a native
   Stockfish reference (ref.json), both graded by the SAME CM.mirrorReview.grade (+ book, sacrifice, recapture and the
   Miss chain from js/modes/g2_fish.js). Usage: node tools/mirror_validate/compare.mjs [tag=sf18_d14] [--ref ref.json] [--out report.md] */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { makeSandbox } from '../../test/engine-sandbox.mjs';

const D = path.dirname(fileURLToPath(import.meta.url)), ROOT = path.resolve(D, '../..');
const tag = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : 'd14';
const outI = process.argv.indexOf('--out'), outF = outI > 0 ? process.argv[outI + 1] : null;
const P = JSON.parse(fs.readFileSync(path.join(D, 'positions.json'), 'utf8'));
const refI = process.argv.indexOf('--ref'), refF = refI > 0 ? process.argv[refI + 1] : 'ref.json';
const REF = JSON.parse(fs.readFileSync(path.join(D, refF), 'utf8'));
const FA = JSON.parse(fs.readFileSync(path.join(D, `fairy_${tag}.json`), 'utf8'));
const sb = makeSandbox(), CM = sb.CM;
vm.runInContext(fs.readFileSync(path.join(ROOT, 'js/modes/g2_fish.js'), 'utf8'), sb, { filename: 'g2_fish.js' });
const R = CM.mirrorReview;
const spec = CM.spec.normalize({ id: 'v', board: { files: 8, ranks: 8 }, setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR' } });
const V = CM.spec.buildVariant(spec, {}), st0 = CM.spec.initialState(V, spec);
const name = (m) => V.geo.name(m.f) + V.geo.name(m.t) + (m.promo ? m.promo.toLowerCase() : '');
const rows = []; let st = st0, game = null, prevMove = null; const loss = { ref: {}, fa: {} };
for (const p of P) {
  const k = `${p.game}#${p.ply}`;
  if (p.game !== game) { game = p.game; st = st0; prevMove = null; loss.ref = {}; loss.fa = {}; }
  const m = V.legal(st).find((x) => name(x) === p.uci);
  if (!m) throw new Error('illegal ' + k + ' ' + p.uci);
  const ctx = { book: R.isBook(V, st, m, st0), sac: R.isSacrifice(V, st, m), recapture: !!(m.cap && prevMove && prevMove.cap && prevMove.t === m.t) };
  const g = (src, e) => { if (!e) return null; const r = R.grade({ ...e, ...ctx, oppLoss: loss[src][p.ply - 1] ?? null }); loss[src][p.ply] = r.loss; return r; };
  const a = g('ref', REF[k]), b = g('fa', FA[k]);
  if (a && b) rows.push({ k, san: p.uci, ref: a.k, fa: b.k, refLoss: a.loss, faLoss: b.loss });
  prevMove = m; st = m.n || V.make(st, m);
}
const GOOD = new Set(['book', 'best', 'great', 'brilliant', 'excellent']), BAD = new Set(['mistake', 'blunder', 'miss']);
const same = rows.filter((r) => r.ref === r.fa).length;
const near = rows.filter((r) => r.ref === r.fa || Math.abs(R.LEVEL[r.ref] - R.LEVEL[r.fa]) <= 1).length;
const severe = rows.filter((r) => (GOOD.has(r.ref) && BAD.has(r.fa)) || (BAD.has(r.ref) && GOOD.has(r.fa)));
const classes = ['book', 'brilliant', 'great', 'best', 'excellent', 'good', 'inaccuracy', 'mistake', 'miss', 'blunder'];
let md = `# MirrorFish review validation (${tag})\n\nIn-game evaluator (CM.mirrorReview.evalFen, ${tag}: sf18_* = Stockfish 18 lite NNUE, d* = Fairy-Stockfish fallback) vs native Stockfish reference (${refF}), ` +
  `same grade() thresholds. ${rows.length} plies from ${new Set(P.map((p) => p.game)).size} games.\n\n` +
  `- same class: **${same}/${rows.length} (${(100 * same / rows.length).toFixed(1)}%)**\n- within one level: ${near}/${rows.length} (${(100 * near / rows.length).toFixed(1)}%)\n` +
  `- severe (Book/Best/Great/Brilliant/Excellent vs Mistake/Miss/Blunder): **${severe.length}**\n\n| ref \\ in-game | ${classes.join(' | ')} |\n|---|${classes.map(() => '---').join('|')}|\n`;
for (const c of classes) md += `| ${c} | ${classes.map((d) => rows.filter((r) => r.ref === c && r.fa === d).length || '').join(' | ')} |\n`;
md += '\n## Disagreements\n\n| ply | move | reference | in-game | ref EP loss | in-game EP loss |\n|---|---|---|---|---|---|\n';
for (const r of rows.filter((x) => x.ref !== x.fa)) md += `| ${r.k} | ${r.san} | ${r.ref} | ${r.fa} | ${r.refLoss.toFixed(3)} | ${r.faLoss.toFixed(3)} |\n`;
if (outF) fs.writeFileSync(outF, md);
console.log(md.split('\n## Disagreements')[0]);
console.log('severe:', severe.map((r) => `${r.k} ${r.san} ref=${r.ref} in-game=${r.fa}`).join('; ') || 'none');
