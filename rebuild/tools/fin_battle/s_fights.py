import json
SPEED = 5
ST = "() => { const B = CM.battle3d.current(), G = CM.gameUI.controller; return { turn: G.state.turn, gbusy: !!G.busy, bbusy: B.busy, clock: +B.clock.toFixed(2), sans: G.sans.length, over: G.over && G.over.why }; }"
pg.evaluate(f"() => {{ CM.battle3d.current().speed = {SPEED}; CM.scene3d.current().renderer.setPixelRatio(.5); }}")
pg.screenshot(path=OUT + '/f0_start.png', timeout=90000)
pg.wait_for_timeout(4000)
pg.screenshot(path=OUT + '/f0_idle.png', timeout=90000)
SETUP = """([vt, used]) => { const G = CM.gameUI.controller, V = G.V, g = V.geo;
  for (let r = 2; r <= 5; r++) for (let c = 0; c < 8; c++) { const i = g.parse('abcdefgh'[c] + (r + 1)); if (G.state.b[i]) continue;
    G.ctx.set(i, V.piece(vt, 'b')); G.moves = V.legal(G.state);
    const caps = G.moves.filter(m => m.t === i && m.cap && G.state.b[m.f].c === 'w');
    const glyph = m => (V.def(G.state.b[m.f].t) || {}).glyph || G.state.b[m.f].t;
    const fresh = caps.filter(m => used.indexOf(glyph(m)) < 0 && glyph(m) !== 'K');
    const any = fresh.length ? fresh : caps.filter(m => glyph(m) !== 'K'); if (any.length && (fresh.length || r >= 4)) { G.render(); return [g.name(any[0].f), g.name(i), glyph(any[0])]; }
    G.ctx.set(i, null); }
  G.moves = V.legal(G.state); return null; }"""
used = []
for n, vt in enumerate(['R', 'Q', 'N', 'P', 'B']):
    st = pg.evaluate(ST)
    if st['turn'] != 'w' or st['over']: print('stop', st); break
    r = pg.evaluate(SETUP, [vt, used])
    print('setup', vt, r, flush=True)
    if not r: continue
    used.append(r[2])
    pg.wait_for_timeout(1500)
    pg.evaluate(f"() => {{ const G = CM.gameUI.controller; G.tryMove(G.V.geo.parse('{r[0]}'), G.V.geo.parse('{r[1]}')); }}")
    for k in range(40):
        pg.wait_for_timeout(1000)
        s2 = pg.evaluate(ST)
        if k in (2, 5, 8): pg.screenshot(path=OUT + f'/f{n+1}_{r[2]}x{vt}_{k}.png', timeout=90000)
        if not s2['bbusy'] and not s2['gbusy'] and s2['turn'] == 'w': break
    print(n, s2, 'took', k, flush=True)
    pg.wait_for_timeout(1500)
    print('sync', pg.evaluate("""() => { const B = CM.battle3d.current(), G = CM.gameUI.controller, bad = [];
      G.state.b.forEach((p, i) => { const ch = B.map[i]; if (!p) { if (ch) bad.push('extra' + i); return; } const gl = (G.V.def(p.t) || {}).glyph || p.t; if (!ch || ch.t + ch.c !== gl + p.c) bad.push(i); }); return bad; }"""), flush=True)
pg.screenshot(path=OUT + '/f9_end.png', timeout=90000)
# castle: clear f1/g1 then O-O; promotion: put a white pawn on b7 with b8 empty
pg.evaluate("() => { const G = CM.gameUI.controller, g = G.V.geo; ['f1','g1'].forEach(n => G.ctx.set(g.parse(n), null)); G.moves = G.V.legal(G.state); G.render(); }")
pg.wait_for_timeout(1500)
cm = pg.evaluate("() => { const G = CM.gameUI.controller; const m = G.moves.find(m => m.castle); return m ? [G.V.geo.name(m.f), G.V.geo.name(m.t)] : null; }")
print('castle', cm, flush=True)
if cm and pg.evaluate(ST)['turn'] == 'w':
    pg.evaluate(f"() => {{ const G = CM.gameUI.controller; G.tryMove(G.V.geo.parse('{cm[0]}'), G.V.geo.parse('{cm[1]}')); }}")
    for k in range(30):
        pg.wait_for_timeout(1000)
        if k in (2, 4, 6): pg.screenshot(path=OUT + f'/c_castle_{k}.png', timeout=90000)
        s2 = pg.evaluate(ST)
        if not s2['bbusy'] and not s2['gbusy'] and s2['turn'] == 'w': break
    print('castle done', s2, flush=True)
pg.evaluate("() => { const G = CM.gameUI.controller, g = G.V.geo; G.ctx.set(g.parse('b7'), G.V.piece('P', 'w')); G.ctx.set(g.parse('b8'), null); G.ctx.set(g.parse('a8'), null); G.moves = G.V.legal(G.state); G.render(); }")
pg.wait_for_timeout(1500)
if pg.evaluate(ST)['turn'] == 'w':
    pg.evaluate("() => { const G = CM.gameUI.controller, g = G.V.geo; const m = G.moves.find(m => g.name(m.f) === 'b7' && g.name(m.t) === 'b8' && (!m.promo || m.promo === 'Q')); if (m) G.commit ? G.tryMove(m.f, m.t) : 0; }")
    for k in range(30):
        pg.wait_for_timeout(1000)
        if k in (1, 3): pg.screenshot(path=OUT + f'/p_promo_{k}.png', timeout=90000)
        s2 = pg.evaluate(ST)
        if not s2['bbusy'] and not s2['gbusy'] and s2['turn'] == 'w': break
    print('promo done', s2, pg.evaluate("() => document.querySelector('.promo, .promotion, [class*=promo]') ? 'picker' : 'none'"), flush=True)
print('sync2', pg.evaluate("""() => { const B = CM.battle3d.current(), G = CM.gameUI.controller, bad = [];
  G.state.b.forEach((p, i) => { const ch = B.map[i]; if (!p) { if (ch) bad.push('extra' + i); return; } const gl = (G.V.def(p.t) || {}).glyph || p.t; if (!ch || ch.t + ch.c !== gl + p.c) bad.push(i); }); return bad; }"""), flush=True)
