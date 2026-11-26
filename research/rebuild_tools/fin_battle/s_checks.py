SPEED = 5
import os
ST = "() => { const B = CM.battle3d.current(), G = CM.gameUI.controller; return { turn: G.state.turn, gbusy: !!G.busy, bbusy: B.busy, clock: +B.clock.toFixed(2), sans: G.sans.length, last: G.sans.slice(-2).join(' '), over: G.over && G.over.why }; }"
SYNC = """() => { const B = CM.battle3d.current(), G = CM.gameUI.controller, bad = [];
  G.state.b.forEach((p, i) => { const ch = B.map[i]; if (!p) { if (ch) bad.push('extra' + i); return; } const gl = (G.V.def(p.t) || {}).glyph || p.t; if (!ch || ch.t + ch.c !== gl + p.c) bad.push(i); }); return bad; }"""
pg.evaluate(f"() => {{ CM.battle3d.current().speed = {SPEED}; CM.scene3d.current().renderer.setPixelRatio(.5); }}")
# place white attacker type at an empty square and a black pawn it can take
SETUP = """(at) => { const G = CM.gameUI.controller, V = G.V, g = V.geo;
  const empt = []; for (let i = 0; i < 64; i++) if (!G.state.b[i]) { const r = Math.floor(g.name(i)[1]); if (r >= 3 && r <= 6) empt.push(i); }
  for (const a of empt) for (const t of empt) { if (a === t) continue;
    G.ctx.set(a, V.piece(at, 'w')); G.ctx.set(t, V.piece('P', 'b'));
    G.moves = V.legal(G.state);
    if (G.moves.some(m => m.f === a && m.t === t)) { G.render(); return [g.name(a), g.name(t)]; }
    G.ctx.set(a, null); G.ctx.set(t, null); }
  G.moves = V.legal(G.state); G.render(); return null; }"""
def waitdone(tag, shots=(2, 4)):
    s2 = None
    for k in range(45):
        pg.wait_for_timeout(1000)
        if k in shots: pg.screenshot(path=OUT + f'/{tag}_{k}.png', timeout=90000)
        s2 = pg.evaluate(ST)
        if os.environ.get('V'): print(k, s2, pg.evaluate("() => { const B = CM.battle3d.current(); return [B.waits.length, B.seq, (B.extra||[]).length, Object.keys(B.map).length]; }"), flush=True)
        if not s2['bbusy'] and not s2['gbusy'] and s2['turn'] == 'w': break
    print(tag, 'done in', k, s2, 'sync', pg.evaluate(SYNC), flush=True)
    return k
import os
STAGE = os.environ.get('STAGE', 'all')
for at in (os.environ.get('ATT', 'QBRK') if STAGE in ('all', 'att') else ''):
    r = pg.evaluate(SETUP, at)
    print('setup', at, r, flush=True)
    if not r: continue
    pg.wait_for_timeout(1200)
    pg.evaluate(f"() => {{ const G = CM.gameUI.controller; G.tryMove(G.V.geo.parse('{r[0]}'), G.V.geo.parse('{r[1]}')); }}")
    waitdone('att' + at)
# castling
if STAGE in ('all', 'castle'): pg.evaluate("() => { const G = CM.gameUI.controller, g = G.V.geo; ['f1','g1'].forEach(n => G.ctx.set(g.parse(n), null)); G.moves = G.V.legal(G.state); G.render(); }")
cm = None
if STAGE in ('all', 'castle'):
    pg.wait_for_timeout(1200); cm = pg.evaluate("() => { const G = CM.gameUI.controller; const m = G.moves.find(m => m.castle); return m ? [G.V.geo.name(m.f), G.V.geo.name(m.t)] : null; }")
print('castle', cm, flush=True)
if cm and STAGE in ('all','castle'):
    pg.evaluate(f"() => {{ const G = CM.gameUI.controller; G.tryMove(G.V.geo.parse('{cm[0]}'), G.V.geo.parse('{cm[1]}')); }}")
    waitdone('castle', (1, 2, 3))
# promotion via picker
if STAGE not in ('all', 'promo'): raise SystemExit
pg.evaluate("() => { const G = CM.gameUI.controller, g = G.V.geo; G.ctx.set(g.parse('b7'), G.V.piece('P', 'w')); G.ctx.set(g.parse('b8'), null); G.ctx.set(g.parse('a8'), null); G.ctx.set(g.parse('c8'), null); G.moves = G.V.legal(G.state); G.render(); }")
pg.wait_for_timeout(1200)
pg.evaluate("() => { const G = CM.gameUI.controller, g = G.V.geo; G.tryMove(g.parse('b7'), g.parse('b8')); }")
pg.wait_for_timeout(1500)
pg.screenshot(path=OUT + '/promo_picker.png', timeout=90000)
vis = pg.evaluate("() => { const b = document.getElementById('promo'); if (!b || b.hidden) return null; const q = b.querySelector('[data-t]'); const r = q.getBoundingClientRect(); const top = document.elementFromPoint(r.left + r.width/2, r.top + r.height/2); return [b.querySelectorAll('[data-t]').length, !!(top && top.closest('#promo'))]; }")
print('picker', vis, flush=True)
if vis:
    b = pg.query_selector('#promo [data-t]')
    b.click()
    waitdone('promo', (1, 2))
print('final', pg.evaluate(ST), pg.evaluate("() => { const B = CM.battle3d.current(); const ch = B.map[CM.gameUI.controller.V.geo.parse('b8')]; return ch ? ch.t + ch.c : null; }"))
