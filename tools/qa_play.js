/* qa_play.js: in-page driver shared by tools/test_browser.py and tools/qa_all.py (evaluated with page.evaluate).
   Plays `plies` moves for the human side through real clicks on the board squares (the board's click handler ->
   SpecGame.onTap: select + target, or the hand + target for drops; capture-phase click listeners of hooks see them
   too), falling back to onTap for squares that are not in the DOM. When a mode stops and asks for a square (busy,
   no legal moves listed: e.g. "place a pawn" after a move, a vent square, a mine), it clicks highlighted squares
   (class *pick* / *target* / *choose*) or else empty ones until the game moves on, so placement phases (Duck, Setup, Ambush, pawn placement, crazyhouse drops) are covered:
   when a side has only drops (placement phase) it places; otherwise it mostly moves and sometimes drops.
   Falls back to commit() only if the tap path did not move (and reports it). Waits for bots between plies.
   Legacy port: plays G.ms via play(). Game frame: returns {kind:'game'} (the caller drives keys). */
async ({ plies, seed, maxWait }) => {
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  let rs = seed || 1; const rnd = n => { rs = (rs * 1103515245 + 12345) & 0x7fffffff; return rs % n; };
  const out = { kind: null, moves: [], notes: [], tapFallback: 0, over: null };
  for (let t = 0; t < 60 && !CM.gameUI.controller; t++) await sleep(100);
  let g = CM.gameUI.controller;
  if (!g) { out.kind = 'none'; return out; }
  if (g.frame === 'game') { out.kind = 'game'; out.module = g.spec && g.spec.game && g.spec.game.module; return out; }
  if (g === CM.legacyGame) {
    out.kind = 'legacy';
    for (let k = 0; k < plies; k++) {
      for (let t = 0; t < (maxWait || 9000) / 100 && (window.busy || (G && G.s.turn !== 'w' && !G.over)); t++) await sleep(100);
      if (G.over) { out.over = 'over'; break; }
      if (G.s.turn !== 'w' || !G.ms.length) { out.notes.push('legacy: not my turn / no moves'); break; }
      const m = G.ms[rnd(G.ms.length)]; play(m); out.moves.push(sqName(m.f) + sqName(m.t));
      await sleep(400);
    }
    return out;
  }
  out.kind = 'spec';
  const human = g.human;
  const label = m => (m.drop ? m.drop + '@' : (m.f >= 0 ? g.V.geo.name(m.f) : '?')) + g.V.geo.name(m.t) + (m.promo ? '=' + m.promo : '');
  const tap = i => {
    const el = document.querySelector('#board .sq[data-i="' + i + '"]');
    if (el && el.getClientRects().length) el.click(); else g.onTap(i, {});
  };
  /* a mode waiting for a square answer: busy with no move list (afterMove promise), or our turn with no moves */
  let prompts = 0;
  const answerPrompt = () => {
    const sqs = [...document.querySelectorAll('#board .sq[data-i]')];
    let cand = sqs.filter(e => /pick|target|choose/.test(e.className));
    if (!cand.length) cand = sqs.filter(e => !g.state.b[+e.dataset.i]);
    if (!cand.length) return false;
    cand[rnd(cand.length)].click(); prompts++; return true;
  };
  const waitTurn = async ms => {
    let stall = 0;
    for (let t = 0; t < ms / 100; t++) {
      g = CM.gameUI.controller; if (!g) return 'gone';
      if (g.over) return 'over';
      if ((g.busy && !g.moves.length) || (!g.busy && g.state.turn === g.human && !g.moves.length)) {
        if (++stall % 12 === 0 && prompts < 12) answerPrompt();
      } else stall = 0;
      const promo = document.getElementById('promo');
      if (promo && !promo.hidden) return 'promo';
      if (!g.busy && g.state.turn === g.human && g.moves.length) return 'ok';
      await sleep(100);
    }
    return 'timeout';
  };
  for (let k = 0; k < plies; k++) {
    const w = await waitTurn(maxWait || 9000);
    if (w === 'over') { out.over = (g.over && (g.over.why || g.over.w)) || 'over'; break; }
    if (w === 'gone') { out.notes.push('controller gone'); break; }
    if (w === 'promo') { const b = document.querySelector('#promo .promo__col > *'); if (b) b.click(); out.notes.push('promo picker left open'); await sleep(200); continue; }
    if (w === 'timeout') {
      out.stuck = { turn: g.state.turn, human: g.human, busy: !!g.busy, moves: g.moves.length, ply: g.sans.length, prompts: prompts, status: (document.getElementById('status') || {}).textContent };
      break;
    }
    const all = g.moves, nd = all.filter(m => !m.drop), dr = all.filter(m => m.drop);
    const pool = !nd.length ? dr : (dr.length && rnd(4) === 0 ? dr : nd);
    const m = pool[rnd(pool.length)];
    const st0 = g.state, n0 = g.sans.length;
    try {
      if (m.drop) { g.hand = m.drop; g.sel = -1; tap(m.t); }
      else { g.sel = -1; g.justSelected = -1; g.hand = null; tap(m.f); tap(m.t); }
    } catch (e) { out.notes.push('tap threw: ' + e); }
    await sleep(120);
    const promo = document.getElementById('promo');
    if (promo && !promo.hidden) {   /* promotion picker: pick the wanted piece (or the first one) */
      const imgs = [...promo.querySelectorAll('.promo__col [data-t], .promo__col button, .promo__col img')];
      const want = imgs.find(x => (x.dataset && x.dataset.t) === m.promo) || imgs[0];
      if (want) want.click(); else out.notes.push('promo picker without options');
      await sleep(150);
    }
    if (g.state === st0 && g.sans.length === n0 && !g.busy && !g.over) {
      out.tapFallback++; out.notes.push('click did not move ' + label(m) + ', committed directly');
      try { g.commit(m, {}); } catch (e) { out.notes.push('commit threw: ' + e); break; }
    }
    out.moves.push(label(m));
    await sleep(200);
  }
  g = CM.gameUI.controller;
  for (let t = 0; t < 60 && g && g.busy; t++) await sleep(100);
  out.prompts = prompts;
  out.sans = g && g.sans ? g.sans.map(x => x.san || x) : [];
  if (g && g.over && !out.over) out.over = g.over.why || g.over.w;
  return out;
}
