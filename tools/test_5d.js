#!/usr/bin/env node
/* 5d-qa (2026-11-25): engine self-test for js/games/g4_5d.js (5D Chess, BbgwPj-u_gs).  node tools/test_5d.js
   Checks: travel moves for every piece type (through time and across timelines), branching + timeline numbering,
   active/inactive timelines and the present line, multiverse check, the seven tutorial puzzles (every listed solution
   mates, a plain non-solution does not), and a few bot-vs-bot turns from the standard start (every bot turn is legal). */
const path = require('path');
const E = require(path.join(__dirname, '../js/games/g4_5d.js'));
let fails = 0;
function ok(cond, msg) { if (!cond) { fails++; console.log('FAIL', msg); } else console.log('ok  ', msg); }
const travel = m => m.tl !== m.fl || m.tp !== m.fp;

/* 1. a 3-board history on one timeline + a second timeline: every piece type gets time/timeline moves */
const W = 5, H = 5;
function hist(rows) { return E.fromDef({ W, H, nW: 0, nB: 0, tls: [{ L: 0, start: 0, boards: rows }] }); }
for (const t of ['R', 'B', 'N', 'Q', 'K', 'P']) {
  /* white piece on c2 (P: c2 too), kings far apart, two full turns of history (black king shuffles) */
  /* the piece went c1 -> c2 on White's last move, so the c2 squares of the older boards are empty */
  const pc = t, b0 = '4k/5/5/5/K1' + pc + '2', b1 = '3k1/5/5/5/K1' + pc + '2', b2 = '3k1/5/5/5/K1' + pc + '2', b3 = '3k1/5/5/2' + pc + '2/K4', b4 = '4k/5/5/2' + pc + '2/K4';
  const S = hist([b0, b1, b2, b3, b4]);
  const ms = E.movesFrom(S, 0).filter(m => m.piece === 'w' + t), tt = ms.filter(travel);
  if (t === 'P') { ok(tt.length === 0, 'P: no time travel on a single timeline (pawns cross timelines, not turns)'); continue; }
  ok(E.toMove(S) === 'w' && tt.length > 0, t + ': ' + tt.length + ' time-travel moves of ' + ms.length + ' (e.g. ' + (tt[0] ? E.san(S, tt[0], { branch: 1 }) : '-') + ')');
}
/* pawn: forward across timelines (White: towards L-1) and T/L-diagonal capture */
{
  const S = E.fromDef({ W, H, nW: 1, nB: 0, tls: [
    { L: 0, start: 0, boards: ['4k/5/5/5/K4', '4k/5/5/2n2/K4', '3k1/5/5/2n2/K4', '3k1/5/5/5/1K3', '4k/5/5/5/1K3'] },
    { L: 1, start: 3, boards: ['3k1/5/5/2P2/1K3', '4k/5/5/2P2/1K3'], parent: 0, bply: 2 }] });
  const ms = E.movesFrom(S, 1).filter(m => m.piece[1] === 'P');
  ok(ms.some(m => m.tl === 0 && m.tp === 4 && m.ti === m.fi && !m.cap), 'P: steps forward onto timeline L0 (same square, same turn)');
  ok(ms.some(m => m.tl === 0 && m.tp === 2 && m.ti === m.fi && m.cap === 'bN'), 'P: T/L-diagonal capture of the knight one turn back on L0');
}
/* knight geometry: 2 turns back + 1 file */
{
  const S = hist(['4k/5/5/2N2/K4', '4k/5/5/2N2/K4', '3k1/5/5/2N2/K4', '3k1/5/5/2N2/1K3', '4k/5/5/2N2/1K3']);
  const ms = E.movesFrom(S, 0).filter(m => m.piece === 'wN' && travel(m));
  ok(ms.some(m => m.tp === m.fp - 4 && Math.abs(m.ti % W - m.fi % W) === 1 && m.ti === m.fi + (m.ti - m.fi)), 'N: (2 turns back, 1 file) jump exists');
  ok(ms.every(m => m.tp % 2 === 0), 'N: only lands on White boards');
}

/* 2. branching: rook travels back one turn on its own timeline -> new timeline +1, present moves back */
{
  /* the rook went a1 -> a3 on White's last move, so one turn back the a3 square is empty */
  const S = hist(['4k/5/5/5/R1K2', '3k1/5/5/5/R1K2', '3k1/5/5/5/R1K2', '3k1/5/R4/5/2K2', '4k/5/R4/5/2K2']);
  const m2 = E.movesFrom(S, 0).find(m => m.piece === 'wR' && m.tl === 0 && m.tp === 2 && m.ti === 2 * W);
  ok(!!m2 && E.isBranch(S, m2), 'R: travel to own past board is a branch');
  const S2 = E.clone(S), r = E.apply(S2, m2);
  ok(r.branch === 1 && S2.tl[1] && S2.tl[1].start === 3 && S2.nW === 1, 'branch creates White timeline +1 starting after the target board');
  ok(E.active(S2, 1), 'first White timeline is active (Black has 0)');
  ok(E.present(S2) === 3 && E.toMove(S2) === 'b', 'present moves back to the new board (ply 3) and it is Black to move');
  ok(E.mandatory(S2).join() === '1', 'Black must move on the new timeline only');
  /* a second White branch is inactive until Black branches */
  const S3 = E.clone(S2); S3.nW = 2; S3.tl[2] = { L: 2, start: 3, boards: [S2.tl[1].boards[0]], parent: 0, bply: 2, by: 'w' };
  ok(!E.active(S3, 2), 'second White timeline is inactive while Black has none');
}

/* 3. check across timelines: rook on L0 head attacks the king on a past board of L0 */
{
  const S = hist(['k4/5/5/5/R1K2', '1k3/5/5/5/R1K2', '1k3/5/5/5/R2K1', 'k4/5/5/5/R2K1']);
  /* Black to move at ply 3? (4 boards: ply 0..3, head ply 3 = black) -> after Black's move white rook on a-file hits ... */
  ok(E.toMove(S) === 'b', 'history with Black to move');
  ok(E.inCheck(S, 'b') === false, 'Black is not in check from Black-coloured heads');
  const S2 = E.skipAll(S);
  ok(E.inCheck(S2, 'b'), 'if Black passes, the rook on the a-file checks (Black king on a5 of the head)');
}

/* 4. the seven tutorial puzzles */
const P = E.PUZZLES, src = require(path.join(__dirname, 'g4_5d_puzzles.json'));
ok(P.length === 7 && P.map(p => p.piece).join('') === 'RNBPQKT', 'seven puzzles in the video order R N B P Q K + opening trap: ' + P.map(p => p.piece).join(''));
for (const pz of src) {
  const S = E.fromDef(pz.def);
  ok(E.toMove(S) === 'w', pz.name + ': White to move');
  /* enumerate White turns (bounded) and recompute the mating ones */
  const out = [];
  (function all(Sx, pre, ctl) {
    if (out.length > 3000 || ctl.aborted) return;
    if (E.toMove(Sx) !== 'w') { if (!E.inCheck(Sx, 'w')) out.push({ seq: pre, S: Sx }); return; }
    const ch = E.children(Sx, 'w', ctl); if (!ch) return;
    for (const e of ch) all(e[1], pre.concat([e[0]]), ctl);
  })(S, [], E.budget(400000, 20000));
  const mates = [];
  for (const t of out) { const st = E.status(t.S, E.budget(200000, 8000)); if (st.mate) mates.push(t.seq.map(m => E.san(S, m, { branch: E.isBranch(S, m) ? 1 : null })).join(' ')); }
  ok(mates.length >= 1, pz.name + ': ' + out.length + ' White turns, mating: ' + mates.join(' | '));
  ok(pz.solutions.every(s => mates.indexOf(s) >= 0), pz.name + ': every listed solution mates (' + pz.solutions.join(' | ') + ')');
  if (pz.piece !== 'P' && pz.piece !== 'T') ok(mates.length <= 3, pz.name + ': the idea is forced (<= 3 mating turns)');
  const non = out.find(t => !mates.includes(t.seq.map(m => E.san(S, m, { branch: E.isBranch(S, m) ? 1 : null })).join(' ')));
  if (non) ok(!E.status(non.S, E.budget(200000, 8000)).mate, pz.name + ': a non-solution is not mate');
}

/* 5. bot vs bot from the standard start: every turn is a legal submission */
{
  let S = E.standard(), seed = 7; const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x80000000;
  let travels = 0, branches = 0, turns = 0;
  for (let k = 0; k < +(process.env.BOT_TURNS || 14); k++) {
    const c = E.toMove(S), seq = E.botTurn(S, rnd, 900);
    if (!seq || !seq.length) { ok(true, 'bot game ended at turn ' + k + ' (' + JSON.stringify(Object.keys(E.status(S))) + ')'); break; }
    for (const m of seq) { const r = E.apply(S = E.clone(S), m); if (travel(m)) travels++; if (r.branch != null) branches++; }
    turns++;
    if (E.toMove(S) === c || E.inCheck(S, c)) { ok(false, 'bot turn ' + k + ' (' + c + ') is not a legal submission'); break; }
  }
  ok(turns >= 6, 'bot vs bot: ' + turns + ' legal turns, ' + travels + ' travel moves, ' + branches + ' branches, ' + E.Ls(S).length + ' timelines');
}

console.log(fails ? fails + ' FAILED' : 'all 5D engine tests passed');
process.exit(fails ? 1 : 0);
