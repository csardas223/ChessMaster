/* qa_gravity.js: checks rx-HCGCNuDo (Gravity platformer, js/games/sword-king.js) through its qa() hook: the king runs
   right, jumps, lands back on the floor, swings, and Stockfish moves on its timer. Used by test_browser.py + qa_all.py. */
async () => {
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const g = CM.gameUI.controller, m = g.mod; if (!m || !m.qa) return {ok: false, why: 'sword-king qa() hook missing'};
  const s0 = m.qa(); const r = {start: s0};
  g._send('right', true); await sleep(500); g._send('right', false); await sleep(100);
  const s1 = m.qa(); r.afterRun = s1;
  g._send('jump', true); await sleep(60); g._send('jump', false);
  let peak = 0; for (let t = 0; t < 12; t++) { await sleep(50); peak = Math.max(peak, m.qa().ky); }
  await sleep(900); const s2 = m.qa(); r.peak = peak; r.afterJump = s2;
  g._send('action', true); await sleep(80); g._send('action', false); await sleep(200); r.afterSwing = m.qa();
  await sleep(Math.max(0, (s0.timer || 3) * 1000 - 1700) + 900); r.afterTimer = m.qa();
  const why = [];
  if (!(s1.kx > s0.kx + 0.3)) why.push('king did not run right');
  if (!(peak > 0.5)) why.push('king did not jump');
  if (!(Math.abs(s2.ky) < 0.05 && s2.ground)) why.push('king did not land back (gravity)');
  if (!(r.afterTimer.moves > 0) && !g.over) why.push('Stockfish never moved on its timer');
  r.ok = !why.length; r.why = why.join('; '); r.over = g.over ? (g.over.why || 'over') : null;
  return r;
}
