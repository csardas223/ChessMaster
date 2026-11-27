/* MirrorFish move-quality review (js/modes/g2_fish.js CM.mirrorReview): chess.com-style classes by evaluation loss,
   the opening book, and the fish's same-class reply. Run with `npm test`. */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { makeSandbox, play } from './engine-sandbox.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = fs.readFileSync(path.join(ROOT, 'js/modes/g2_fish.js'), 'utf8');
function setup(fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR', turn) {
  const sb = makeSandbox(), CM = sb.CM;
  vm.runInContext(SRC, sb, { filename: 'g2_fish.js' });
  const spec = CM.spec.normalize({ id: 'test', board: { files: 8, ranks: 8 }, setup: { fen, turn } });
  const V = CM.spec.buildVariant(spec, {});
  return { CM, V, st: CM.spec.initialState(V, spec), R: CM.mirrorReview };
}
const rank = (CM, V, st) => new CM.Search(V, {}).rank(st, { maxDepth: 3, timeMs: 60000, noise: 0 });
const entry = (V, L, uci) => L.find((x) => V.geo.name(x.m.f) + V.geo.name(x.m.t) === uci);

test('g2_elofish.js is a byte-identical copy of g2_fish.js', () => {
  assert.equal(fs.readFileSync(path.join(ROOT, 'js/modes/g2_elofish.js'), 'utf8'), SRC);
});

test('book: every book line is legal from the start; 1.e4 / 1.d4 / 1.Nf3 / 1.c4 and standard replies are Book', () => {
  const { CM, V, st, R } = setup();
  R.bookSet(V, st);
  assert.deepEqual(Array.from(V._mqBookBad), []);
  const L = rank(CM, V, st);
  for (const u of ['e2e4', 'd2d4', 'g1f3', 'c2c4']) assert.equal(R.classify(V, st, L, entry(V, L, u), st), 'book', u);
  assert.notEqual(R.classify(V, st, L, entry(V, L, 'g1h3'), st), 'book', '1.Nh3 is not book');
  const { st: s2 } = play(V, st, [['e2', 'e4']]);
  const L2 = rank(CM, V, s2);
  for (const u of ['e7e5', 'c7c5', 'e7e6', 'c7c6']) assert.equal(R.classify(V, s2, L2, entry(V, L2, u), st), 'book', '1.e4 ' + u);
  /* a transposition counts: 1.Nf3 d5 2.d4 reaches the 1.d4 d5 2.Nf3 position */
  const { st: s3 } = play(V, st, [['g1', 'f3'], ['d7', 'd5']]);
  const L3 = rank(CM, V, s3);
  assert.equal(R.classify(V, s3, L3, entry(V, L3, 'd2d4'), st), 'book');
});

test('a move that hangs the queen is a Blunder; the engine top move is Best (or Great/Brilliant)', () => {
  /* 1.e4 d5: 2.Qg4?? drops the queen to Bxg4 (no book: st0 = null) */
  const { CM, V, st, R } = setup();
  const { st: s } = play(V, st, [['e2', 'e4'], ['d7', 'd5']]);
  const L = rank(CM, V, s);
  assert.equal(R.classify(V, s, L, entry(V, L, 'd1g4'), null), 'blunder');
  assert.equal(R.LEVEL[R.classify(V, s, L, L[0], null)], 0, 'top move: ' + R.classify(V, s, L, L[0], null));
  assert.equal(V.geo.name(L[0].m.f) + V.geo.name(L[0].m.t), 'e4d5');
});

test('win chance curve and loss bands', () => {
  const { R, CM } = setup();
  assert.equal(Math.round(R.winPct(0)), 50);
  assert.ok(R.winPct(100) > 58 && R.winPct(100) < 60);
  assert.equal(R.winPct(CM.MATE + 3), 100);
  assert.equal(R.winPct(-CM.MATE - 3), 0);
  /* synthetic ranking: losses 0, 1.5, 4, 8, 15, 40 win-% points from an equal position */
  const { V, st } = setup('4k3/8/8/8/8/8/8/R3K3', 'w');
  const ms = V.legal(st);
  const cp = (w) => Math.log(100 / w - 1) / -0.00368208;   /* inverse of winPct */
  const vals = [50, 48.5, 46, 42, 35, 10].map(cp);
  const L = vals.map((v, i) => ({ m: ms[i], v }));
  assert.deepEqual(L.map((x) => R.classify(V, st, L, x, null)), ['best', 'excellent', 'good', 'inaccuracy', 'mistake', 'blunder']);
  /* miss: a winning position (80 %) thrown back to 55 % */
  const W = [80, 79, 55].map((w, i) => ({ m: ms[i], v: cp(w) }));
  assert.equal(R.classify(V, st, W, W[2], null), 'miss');
});

test('the fish replies with a move of your class', () => {
  const { CM, V, st, R } = setup();
  const { st: s } = play(V, st, [['e2', 'e4'], ['d7', 'd5'], ['b1', 'c3']]);
  const L = rank(CM, V, s);
  const cls = (x) => R.classify(V, s, L, x, st);
  assert.equal(R.pick(V, s, L, { k: 'best', loss: 0 }, st), L[0]);
  const bl = R.pick(V, s, L, { k: 'blunder', loss: 45 }, st);
  assert.ok(['blunder', 'miss'].includes(cls(bl)), cls(bl));
  for (const k of ['excellent', 'good', 'inaccuracy', 'mistake']) {
    const have = L.some((x) => cls(x) === k), x = R.pick(V, s, L, { k, loss: { excellent: 1, good: 3.5, inaccuracy: 7, mistake: 15 }[k] }, st);
    if (have) assert.equal(cls(x), k, k);
  }
  /* Book from the start: the fish answers 1.e4 with a book reply */
  const { st: s1 } = play(V, st, [['e2', 'e4']]);
  const L1 = rank(CM, V, s1);
  assert.equal(R.classify(V, s1, L1, R.pick(V, s1, L1, { k: 'book', loss: 0 }, st), st), 'book');
});
