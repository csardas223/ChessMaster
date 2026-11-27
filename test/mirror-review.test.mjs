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



test('g2_elofish.js is a byte-identical copy of g2_fish.js', () => {
  assert.equal(fs.readFileSync(path.join(ROOT, 'js/modes/g2_elofish.js'), 'utf8'), SRC);
});

const mv = (V, st, u) => V.legal(st).find((m) => V.geo.name(m.f) + V.geo.name(m.t) === u);

test('book: every book line is legal; 1.e4 / 1.d4 / 1.Nf3 / 1.c4, standard replies and the Ruy Lopez are Book', () => {
  const { V, st, R } = setup();
  R.bookSet(V, st);
  assert.deepEqual(Array.from(V._mqBookBad), []);
  for (const u of ['e2e4', 'd2d4', 'g1f3', 'c2c4']) assert.equal(R.isBook(V, st, mv(V, st, u), st), true, u);
  assert.equal(R.isBook(V, st, mv(V, st, 'g1h3'), st), false, '1.Nh3 is not book');
  const { st: s2 } = play(V, st, [['e2', 'e4']]);
  for (const u of ['e7e5', 'c7c5', 'e7e6', 'c7c6']) assert.equal(R.isBook(V, s2, mv(V, s2, u), st), true, '1.e4 ' + u);
  const { st: s5 } = play(V, st, [['e2', 'e4'], ['e7', 'e5'], ['g1', 'f3'], ['b8', 'c6']]);
  assert.equal(R.isBook(V, s5, mv(V, s5, 'f1b5'), st), true, '3.Bb5');
  const { st: s3 } = play(V, st, [['g1', 'f3'], ['d7', 'd5']]);
  assert.equal(R.isBook(V, s3, mv(V, s3, 'd2d4'), st), true, 'transposition to 1.d4 d5 2.Nf3');
});

test('Classification V2 bands on expected points lost', () => {
  const { R } = setup();
  const cp = (e) => ({ cp: Math.log(1 / e - 1) / -0.00368208 });   /* inverse of ep() */
  const g = (best, played, extra = {}) => R.grade({ best: cp(best), second: cp(Math.min(best, 0.5)), played: cp(played), playedIsBest: false, ...extra }).k;
  assert.equal(R.grade({ best: cp(0.6), second: cp(0.58), played: cp(0.6), playedIsBest: true }).k, 'best');
  assert.equal(g(0.6, 0.59), 'excellent');
  assert.equal(g(0.6, 0.565), 'good');
  assert.equal(g(0.6, 0.52), 'inaccuracy');
  assert.equal(g(0.6, 0.44), 'mistake');
  assert.equal(g(0.6, 0.2), 'blunder');
  assert.equal(R.grade({ best: { mate: 3 }, second: { cp: 50 }, played: { mate: -2 }, playedIsBest: false }).k, 'blunder', 'mate missed into mated');
  assert.equal(R.grade({ best: { mate: 2 }, second: { mate: 4 }, played: { mate: 4 }, playedIsBest: false }).k, 'best', 'a slower mate loses no points');
  assert.equal(R.ep({ mate: 5 }), 1); assert.equal(R.ep({ mate: -5 }), 0); assert.equal(Math.round(R.ep({ cp: 0 }) * 100), 50);
  /* Great: the only good move */
  assert.equal(R.grade({ best: cp(0.55), second: cp(0.3), played: cp(0.55), playedIsBest: true }).k, 'great');
  assert.equal(R.grade({ best: cp(0.55), second: cp(0.3), played: cp(0.55), playedIsBest: true, recapture: true }).k, 'best', 'a plain recapture is not Great');
  /* Brilliant: a sound sacrifice, not already completely winning */
  assert.equal(R.grade({ best: cp(0.6), second: cp(0.5), played: cp(0.6), playedIsBest: true, sac: true }).k, 'brilliant');
  assert.equal(R.grade({ best: { mate: 4 }, second: cp(0.99), played: { mate: 4 }, playedIsBest: true, sac: true }).k, 'best', 'already winning');
  /* Miss: the opponent blundered, a win was there, the move left it equal */
  assert.equal(R.grade({ best: cp(0.85), second: cp(0.8), played: cp(0.52), playedIsBest: false, oppLoss: 0.3 }).k, 'miss');
  assert.equal(R.grade({ best: cp(0.85), second: cp(0.8), played: cp(0.52), playedIsBest: false, oppLoss: 0.01 }).k, 'blunder');
});

test('sacrifice detection', () => {
  const { V, st, R } = setup();
  /* 1.e4 e5 2.Qh5 Nc6 3.Bc4 Nf6?? : 4.Qxf7# is not a sac (mate, queen defended by the bishop); 4.Qxe5+ is not either */
  const { st: s } = play(V, st, [['e2', 'e4'], ['d7', 'd5']]);
  assert.equal(R.isSacrifice(V, s, mv(V, s, 'd1g4')), true, 'Qg4 hangs the queen to Bxg4');
  assert.equal(R.isSacrifice(V, s, mv(V, s, 'e4d5')), false, 'exd5 wins a pawn');
  assert.equal(R.isSacrifice(V, s, mv(V, s, 'g1f3')), false, 'Nf3 is safe');
});

test('review without the engine (built-in fallback): hanging the queen is a Blunder, the top move is near-best', async () => {
  const { V, st, R } = setup();
  const { st: s } = play(V, st, [['e2', 'e4'], ['d7', 'd5']]);
  const r = await R.review(V, s, mv(V, s, 'd1g4'), null, null, null);
  assert.equal(r.k, 'blunder');
  const t = await R.review(V, s, mv(V, s, 'e4d5'), null, null, null);
  assert.ok(['best', 'great', 'excellent'].includes(t.k), 'exd5: ' + t.k);   /* the built-in search is time-bound; the engine path is checked by tools/mirror_validate */
  const b = await R.review(V, st, mv(V, st, 'e2e4'), st, null, null);
  assert.equal(b.k, 'book');
});
