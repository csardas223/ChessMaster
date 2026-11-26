ST = "() => { const B = CM.battle3d.current(), G = CM.gameUI.controller; return { turn: G.state.turn, gbusy: !!G.busy, bbusy: B.busy, seq: B.seq, waits: B.waits.length, clock: +B.clock.toFixed(2), extra: (B.extra||[]).map(c => c.t + c.c + (c.act ? ':' + c.act.name : '') + (c.path ? ':walk' : '')), sans: G.sans.join(' ') }; }"
def mv(a, b):
    pg.evaluate(f"() => {{ const G = CM.gameUI.controller; G.tryMove(G.V.geo.parse('{a}'), G.V.geo.parse('{b}')); }}")
mv('e2', 'e4')
for i in range(12):
    pg.wait_for_timeout(1000); print(pg.evaluate(ST), flush=True)
# capture anything
cap = pg.evaluate("() => { const G = CM.gameUI.controller; const m = G.moves.find(m => m.cap && G.state.b[m.f].c === 'w'); return m ? [G.V.geo.name(m.f), G.V.geo.name(m.t)] : null; }")
print('cap', cap)
if cap:
    mv(cap[0], cap[1])
    for i in range(25):
        pg.wait_for_timeout(1000); print(pg.evaluate(ST), flush=True)
        if i in (2, 4, 6): pg.screenshot(path=OUT + f'/hang_{i}.png')
