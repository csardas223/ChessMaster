#!/usr/bin/env node
/* 5d-core (2026-11-25): generate + verify the six 5D Chess tutorial puzzles (one per piece) for BbgwPj-u_gs.
   The video's tutorial puzzles are only partly visible (King Tactics I ~ Mate-in-one at 9:10, frame 550: 5x5 boards),
   so the positions are our own, built the same way: 5x5 boards, a short history (random legal turns for both sides,
   time travel included), White to move and mate in one turn. A puzzle is kept only when
     * at least one White turn mates (Black has no legal turn and skipping leaves a king in check),
     * every mating turn moves the featured piece through time or across timelines (king, pawn: every mating turn
       moves it and at least one of them through time/timelines), and
     * there are at most 3 mating turns (so the idea is forced).
   The pawn puzzle (one board, a plain pawn mate as in the video at 6:37) and the opening trap (1.e4 e5 2.Qh5 Nf6,
   3.Qxe5 mate, video 10:55) are hand-made entries in g4_5d_puzzles.json (5d-qa); tools/test_5d.js verifies all seven.
   Usage: node tools/g4_5d_puzzles.js [--write]   (--write patches PUZZLES into js/games/g4_5d.js) */
const fs = require('fs'), path = require('path');
const FILE = path.join(__dirname, '../js/games/g4_5d.js');
const E = require(FILE);
let seed = +(process.env.SEED || 20261125);
function rnd() { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x80000000; }
function pick(a) { return a[Math.floor(rnd() * a.length)]; }
/* king and pawn: every mating turn moves that piece and at least one sends it through time/timelines (a strict
   'every mate is a time-travel move by it' search found none in ~10 min for these two) */
const RELAX = { K: 1, P: 1 };
const NAMES = { P: 'Pawn', N: 'Knight', B: 'Bishop', R: 'Rook', Q: 'Queen', K: 'King' };
const W = 5, H = 5;

function randomStart(piece) {
  const sq = new Array(W * H).fill(null), free = () => { let i; do { i = Math.floor(rnd() * W * H); } while (sq[i]); return i; };
  const put = (p, rows) => { for (let k = 0; k < 200; k++) { const i = free(), y = (i / W) | 0; if (rows && rows.indexOf(y) < 0) continue; if (p[1] === 'P' && (y === 0 || y === H - 1)) continue; sq[i] = p; return i; } };
  const wk = put('wK'), bk = put('bK');
  if (Math.abs(wk % W - bk % W) <= 1 && Math.abs(((wk / W) | 0) - ((bk / W) | 0)) <= 1) return null;
  if (piece !== 'K') put('w' + piece); else if (rnd() < 0.6) put('w' + pick(['R', 'B', 'N']));
  const nb = Math.floor(rnd() * 3); for (let k = 0; k < nb; k++) put('b' + pick(['P', 'P', 'N', 'B', 'R']));
  if (rnd() < 0.4) put('wP');
  return { sq, ply: 0, ep: -1, hl: null };
}
function randomTurn(S) {
  const c = E.toMove(S);
  for (let tries = 0; tries < 20; tries++) {
    let cur = S, ok = true, seq = [];
    while (E.toMove(cur) === c) {
      const ch = E.children(cur, c, E.budget(4000, 200)); if (!ch || !ch.length) { ok = false; break; }
      /* favour time travel so the history branches */
      const tt = ch.filter(e => e[0].tl !== e[0].fl || e[0].tp !== e[0].fp), e = (tt.length && rnd() < 0.45) ? pick(tt) : pick(ch);
      cur = e[1]; seq.push(e[0]);
    }
    if (ok && !E.inCheck(cur, c)) return cur;
  }
  return null;
}
function allTurns(S, c, ctl, prefix, out) {
  if (out.length > 4000 || ctl.aborted) return;
  if (E.toMove(S) !== c) { if (!E.inCheck(S, c)) out.push({ seq: prefix, S }); return; }
  const ch = E.children(S, c, ctl); if (!ch) return;
  for (const e of ch) allTurns(e[1], c, ctl, prefix.concat([e[0]]), out);
}
function usesPiece(seq, piece) { return seq.some(m => m.piece[0] === 'w' && m.piece[1] === piece && (m.tl !== m.fl || m.tp !== m.fp)); }
function tryOne(piece) {
  const b0 = randomStart(piece); if (!b0) return null;
  let S = { W, H, nW: 0, nB: 0, tl: { 0: { L: 0, start: 0, boards: [b0] } } };
  if (E.inCheck(S, 'w') || E.status(S, E.budget(20000, 500)).ok == null) return null;
  const turns = 3 + Math.floor(rnd() * 4);
  for (let k = 0; k < turns; k++) { S = randomTurn(S); if (!S) return null; const st = E.status(S, E.budget(20000, 500)); if (!st.ok) return null; }
  if (E.toMove(S) !== 'w') { S = randomTurn(S); if (!S) return null; }
  if (E.toMove(S) !== 'w') return null;
  /* the featured piece must still be White's and on a playable board */
  if (!E.playable(S, 'w').some(L => E.head(S.tl[L]).sq.indexOf('w' + piece) >= 0)) { why.lost = (why.lost || 0) + 1; return null; }
  const out = []; const ctl = E.budget(200000, 4000); allTurns(S, 'w', ctl, [], out); if (ctl.aborted || !out.length) return null;
  const mates = [];
  for (const t of out) { const st = E.status(t.S, E.budget(200000, 3000)); if (st.unknown) return null; if (st.mate) { mates.push(t); if (mates.length > 3) { why.many = (why.many || 0) + 1; return null; } } }
  if (!mates.length) { why.nomate = (why.nomate || 0) + 1; return null; }
  const moves = (seq) => seq.some(m => m.piece[0] === 'w' && m.piece[1] === piece);
  const okP = RELAX[piece] ? (mates.every(t => moves(t.seq)) && mates.some(t => usesPiece(t.seq, piece))) : mates.every(t => usesPiece(t.seq, piece));
  if (!okP) { why.other = (why.other || 0) + 1; return null; }
  return { S, mates, turns: out.length };
}
const OUT = process.env.OUTFILE || path.join(__dirname, 'g4_5d_puzzles.json');
const result = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : [];
const pieces = (process.argv.find(a => /^--pieces=/.test(a)) || '--pieces=PNBRQK').slice(9).split('');
const cap = +((process.argv.find(a => /^--secs=/.test(a)) || '--secs=100').slice(7)) * 1000;
const why = {};
for (const piece of pieces) {
  if (result.some(r => r.piece === piece)) { console.log(piece, 'already in', OUT); continue; }
  let found = null, n = 0; const t0 = Date.now();
  while (!found && Date.now() - t0 < cap) { n++; found = tryOne(piece); }
  if (!found) { console.log(piece, 'NOT FOUND after', n, 'tries', JSON.stringify(why)); continue; }
  const sol = found.mates.map(t => t.seq.map(m => E.san(found.S, m, { branch: E.isBranch(found.S, m) ? 1 : null })).join(' '));
  console.log(piece, 'found after', n, 'tries;', found.turns, 'white turns;', found.mates.length, 'mating:', sol.join(' | '));
  result.push({ piece, name: NAMES[piece] + ' Tactics ~ Mate-in-one', def: E.toDef(found.S), solutions: sol });
  fs.writeFileSync(OUT, JSON.stringify(result, null, 1));
}
if (process.argv.includes('--write')) {
  /* video order (0:20 rook, 2:52 knight, 4:31 bishop, 6:37 pawn, 6:56 queen, 8:29 king, 10:55 opening trap) */
  const order = 'RNBPQKT', json = JSON.stringify(result.slice().sort((a, b) => order.indexOf(a.piece) - order.indexOf(b.piece)).map(r => ({ piece: r.piece, name: r.name, def: r.def })));
  const src = fs.readFileSync(FILE, 'utf8').replace(/\/\*PUZZLES_BEGIN\*\/[\s\S]*?\/\*PUZZLES_END\*\//, '/*PUZZLES_BEGIN*/' + json + '/*PUZZLES_END*/');
  fs.writeFileSync(FILE, src); console.log('patched', FILE);
}
