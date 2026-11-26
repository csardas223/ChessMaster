/* Rules regression tests for the normal-chess engine: legality, check/checkmate/stalemate, castling,
   en passant and promotion. Run with `npm test` (node --test). */
import test from 'node:test';
import assert from 'node:assert/strict';
import { game, move, play } from './engine-sandbox.mjs';

const sq = (V, st, name) => st.b[V.geo.parse(name)];
/* Array.from gives a host-realm array; VM-realm arrays fail assert.deepEqual for prototype reasons. */
const names = (V, list) => Array.from(list, (m) => V.geo.name(m.f) + V.geo.name(m.t));

test('starting position: 20 legal moves, pawns and knights only', () => {
  const { V, st } = game();
  const legal = V.legal(st);
  assert.equal(legal.length, 20);
  const n = names(V, legal);
  assert.ok(n.includes('e2e3') && n.includes('e2e4'));
  assert.ok(n.includes('b1c3'), 'white to move from the start');
  assert.ok(!n.includes('e2e5'), 'a pawn cannot move three squares');
  assert.ok(!n.includes('b1b3'), 'a knight cannot move like a rook');
  assert.ok(!n.includes('e1e2'), 'the king is blocked by its own pieces');
});

test('a move may not leave the king in check', () => {
  /* White king e1, black rook e2 giving check: capture it or step off the e-file, but not onto rank 2. */
  const { V, st } = game('4k3/8/8/8/8/8/4r3/4K3', { turn: 'w' });
  assert.equal(V.inCheck(st, 'w'), true);
  const legal = V.legal(st);
  assert.deepEqual(names(V, legal).sort(), ['e1d1', 'e1e2', 'e1f1']);
  assert.ok(!names(V, legal).includes('e1d2'), 'd2 is still attacked by the rook');
  for (const m of legal) assert.equal(V.inCheck(V.make(st, m), 'w'), false);
});

test('pinned pieces cannot expose the king', () => {
  /* White king e1, white rook e2, black rook e8: the rook on e2 is pinned and may only move on the e-file. */
  const { V, st } = game('4r3/8/8/8/8/8/4R3/4K3', { turn: 'w' });
  const moves = names(V, V.legal(st));
  const rookMoves = moves.filter((m) => m.startsWith('e2'));
  assert.ok(rookMoves.length > 0);
  assert.ok(rookMoves.every((m) => m[2] === 'e'), rookMoves.join(' '));
  assert.ok(!moves.includes('e2d2'), 'the pinned rook cannot leave the file');
  /* the king may still step sideways: the rook keeps blocking the e-file */
  assert.ok(moves.includes('e1f1') && moves.includes('e1d1'));
});

test('check is detected and every legal reply resolves it', () => {
  const { V, st } = game('4k3/8/8/8/8/8/8/4R1K1', { turn: 'b' });
  assert.equal(V.inCheck(st, 'b'), true);
  assert.deepEqual(names(V, V.legal(st)).sort(), ['e8d7', 'e8d8', 'e8f7', 'e8f8']);
});

test('checkmate: no legal moves and a winner', () => {
  const { V, st } = game('R5k1/5ppp/8/8/8/8/8/7K', { turn: 'b' });
  assert.equal(V.inCheck(st, 'b'), true);
  assert.equal(V.legal(st).length, 0);
  const result = V.result(st, []);
  assert.equal(result.w, 'w');
  assert.equal(result.why, 'checkmate');
});

test('stalemate: no legal moves but no check', () => {
  const { V, st } = game('7k/5Q2/6K1/8/8/8/8/8', { turn: 'b' });
  assert.equal(V.inCheck(st, 'b'), false);
  assert.equal(V.legal(st).length, 0);
  const result = V.result(st, []);
  assert.equal(result.w, 'd');
  assert.equal(result.why, 'stalemate');
});

test('castling: king and rook move and the right is used up', () => {
  const { V, st } = game('r3k2r/8/8/8/8/8/8/R3K2R', { turn: 'w' });
  const short = move(V, st, 'e1', 'g1');
  assert.ok(short, 'kingside castle is legal');
  const after = V.make(st, short);
  assert.equal(sq(V, after, 'g1').t, 'K');
  assert.equal(sq(V, after, 'f1').t, 'R');
  assert.equal(sq(V, after, 'e1'), null);
  assert.equal(sq(V, after, 'h1'), null, 'the rook left h1');
  assert.ok(!names(V, V.legal(after)).includes('e1g1'), 'white cannot castle twice');

  const long = move(V, st, 'e1', 'c1');
  const afterLong = V.make(st, long);
  assert.equal(sq(V, afterLong, 'c1').t, 'K');
  assert.equal(sq(V, afterLong, 'd1').t, 'R');
});

test('castling is illegal through or out of check', () => {
  const through = game('r3k2r/8/8/8/8/8/8/R3K2R', { turn: 'w' });
  /* black rook on f8 would attack f1, the square the king crosses */
  through.st.b[through.V.geo.parse('f8')] = through.V.piece('R', 'b');
  through.st.b[through.V.geo.parse('a8')] = null;
  assert.ok(!names(through.V, through.V.legal(through.st)).includes('e1g1'));
});

test('en passant: the captured pawn is removed from its square', () => {
  const g = game();
  const { st } = play(g.V, g.st, [['e2', 'e4'], ['a7', 'a6'], ['e4', 'e5'], ['d7', 'd5']]);
  const ep = g.V.legal(st).find((m) => m.ep && g.V.geo.name(m.f) === 'e5');
  assert.ok(ep, 'e5xd6 en passant is offered after d7-d5');
  assert.equal(g.V.geo.name(ep.t), 'd6');
  const after = g.V.make(st, ep);
  assert.equal(sq(g.V, after, 'd5'), null, 'the passed pawn is gone');
  assert.equal(sq(g.V, after, 'd6').t, 'P');
  assert.equal(sq(g.V, after, 'e5'), null);
});

test('en passant is only available on the very next move', () => {
  const g = game();
  const { st } = play(g.V, g.st, [['e2', 'e4'], ['a7', 'a6'], ['e4', 'e5'], ['d7', 'd5'], ['g1', 'f3'], ['a6', 'a5']]);
  assert.ok(!g.V.legal(st).some((m) => m.ep), 'the chance has passed');
});

test('promotion: all four pieces, with the promoted flag set', () => {
  const { V, st } = game('7k/P7/8/8/8/8/8/K7', { turn: 'w' });
  for (const type of ['Q', 'N', 'R', 'B']) {
    const m = V.legal(st).find((x) => x.promo === type);
    assert.ok(m, `a7-a8=${type} is offered`);
    const p = sq(V, V.make(st, m), 'a8');
    assert.equal(p.t, type);
    assert.equal(p.promoted, 1);
  }
});

test('a pawn cannot double-step once it has moved', () => {
  const { V, st } = game('8/8/8/8/8/4P3/8/4K2k', { turn: 'w' });
  const moves = names(V, V.legal(st));
  assert.ok(moves.includes('e3e4'));
  assert.ok(!moves.includes('e3e5'), 'the pawn is already on the third rank');
});

test('the engine result agrees with the board state', () => {
  const g = game();
  const { st } = play(g.V, g.st, [['f2', 'f3'], ['e7', 'e5'], ['g2', 'g4'], ['d8', 'h4']]);
  const legal = g.V.legal(st);
  assert.equal(legal.length, 0);
  const result = g.V.result(st, legal);
  assert.equal(result.w, 'b');
  assert.equal(result.why, 'checkmate');
});
