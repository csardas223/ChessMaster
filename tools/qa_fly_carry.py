#!/usr/bin/env python3
# fly-carry QA (The Fly, OFtVdbxJI2Y, 3D view): fly size vs a square, wings beat, the fly physically carries its own moves
# (piece held under the body mid-flight, captured piece removed on landing), full game to the end with a depth-3 search
# playing White, 0 console errors. Runs at 390x844 and 360x780 (the 360 run with prefers-reduced-motion: carrying must stay).
# Usage: python3 tools/qa_fly_carry.py [--shots DIR] [--only 390|360]
import os, sys, json, time, threading, http.server, socketserver, functools
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); PORT = int(os.environ.get('PORT', 8847))
SHOTS = sys.argv[sys.argv.index('--shots') + 1] if '--shots' in sys.argv else None
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a, **k): pass
socketserver.TCPServer.allow_reuse_address = True
srv = socketserver.ThreadingTCPServer(('127.0.0.1', PORT), functools.partial(Q, directory=ROOT)); threading.Thread(target=srv.serve_forever, daemon=True).start()
MEASURE = """() => { const S = CM.scene3d.current(), V = S.view3d, T = S.THREE, f = V.fly; f.updateMatrixWorld(true);
  const body = f.children[0], box = m => new T.Box3().setFromObject(m), sz = b => { const v = new T.Vector3(); b.getSize(v); return v; };
  const thx = sz(box(body.children[1])), core = new T.Box3(); [0,1,2,3,5].forEach(i => core.union(box(body.children[i])));
  const c = sz(core), wb = new T.Box3(); f.userData.wings.forEach(w => wb.union(box(w.hinge))); const w = sz(wb);
  return { thoraxWidth: +thx.x.toFixed(2), bodyWidth: +c.x.toFixed(2), bodyLength: +c.z.toFixed(2), wingspan: +w.x.toFixed(2), square: 1 }; }"""
STATE = """() => { const G = CM.gameUI.controller, S = CM.scene3d.current(), V = S && S.view3d;
  return { turn: G.state.turn, human: G.human, n: G.sans.length, over: G.over ? (G.over.why + ':' + G.over.w) : null, busy: !!G.busy, carry: !!(V && V.carry) }; }"""
CARRY = """() => { const V = CM.scene3d.current().view3d, C = V.carry; if (!C) return null; const f = V.fly.position, o = C.obj.position;
  return { fly: [f.x, f.y, f.z].map(v => +v.toFixed(2)), piece: [o.x, o.y, o.z].map(v => +v.toFixed(2)), wing: +V.fly.userData.wings[0].hinge.rotation.z.toFixed(2), cap: !!C.cap }; }"""
HUMAN = """() => { const G = CM.gameUI.controller; if (G.over || G.state.turn !== G.human || G.busy || !G.moves.length) return false;
  const L = new CM.Search(G.V, {}).rank(G.state, { moves: G.moves, maxDepth: 2, timeMs: 200 }); const m = (L[0] && (L[0].m || L[0])) || G.moves[0];
  G.onTap(m.f, {}); G.onTap(m.t, {}); return G.V.geo.name(m.f) + G.V.geo.name(m.t); }"""
res = []; ok_all = True
def check(c, msg):
    global ok_all
    res.append(('PASS ' if c else 'FAIL ') + msg); ok_all = ok_all and bool(c)
with sync_playwright() as p:
    b = p.chromium.launch(args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
    runs = [(390, 844, False), (360, 780, True)]
    if '--only' in sys.argv: runs = [r for r in runs if str(r[0]) == sys.argv[sys.argv.index('--only') + 1]]
    for (W, H, rm) in runs:
        tag = f'{W}{"-rm" if rm else ""}'
        ctx = b.new_context(viewport={'width': W, 'height': H}, device_scale_factor=1, is_mobile=True, has_touch=True, reduced_motion='reduce' if rm else 'no-preference')
        pg = ctx.new_page(); errs = []
        pg.on('console', lambda m: errs.append(m.text[:200]) if m.type == 'error' else None)
        pg.on('pageerror', lambda e: errs.append('pageerror ' + str(e)[:200]))
        pg.goto(f'http://127.0.0.1:{PORT}/index.html#/play/OFtVdbxJI2Y')
        pg.wait_for_function('() => CM.gameUI && CM.gameUI.controller && CM.gameUI.controller.moves', timeout=60000)
        pg.wait_for_function('() => CM.scene3d && CM.scene3d.current() && CM.scene3d.current().view3d && CM.scene3d.current().view3d.fly', timeout=60000)
        pg.wait_for_timeout(2500)
        ts = pg.evaluate("() => { const t = document.querySelector('.tapstart'); if (!t) return null; const r = t.getBoundingClientRect(), e = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return { onTop: !!(e && t.contains(e)) }; }")
        res.append(f'{tag} Tap to start plate: {ts}')
        for _ in range(60):   # the match-start cue: Tap to start (opened from a link) and 1 s before the bot may move
            if pg.evaluate("() => !CM.gameUI.controller.holdBot"): break
            if pg.evaluate("() => !!document.querySelector('.tapstart')"): pg.click('.tapstart', force=True)
            pg.wait_for_timeout(500)
        res.append(f'{tag} start cue: holdBot={pg.evaluate("() => CM.gameUI.controller.holdBot")} loader={pg.evaluate("() => CM.loader && CM.loader.isVisible && CM.loader.isVisible()")}')
        m = pg.evaluate(MEASURE); res.append(f'{tag} size (square = 1): {m}')
        check(m['bodyWidth'] < 1.0 and m['bodyLength'] < 2.2, f'{tag} fly body under a square wide and ~2 squares long (video app proportions), was a 5-square head')
        w1 = pg.evaluate('() => CM.scene3d.current().view3d.wingPhase'); pg.wait_for_timeout(1000)
        w2 = pg.evaluate('() => CM.scene3d.current().view3d.wingPhase'); hz = (w2 - w1) / 6.2832
        check(hz > 0.5, f'{tag} wings beating (~{hz:.1f} Hz of game time over 1 s wall clock; reduced motion slows it)')
        if SHOTS and not rm:
            os.makedirs(SHOTS, exist_ok=True); pg.screenshot(path=f'{SHOTS}/fly_{tag}_idle.png')
        if SHOTS and not rm: pg.evaluate('() => { CM.scene3d.current().view3d.P.carryMs = 9000; }')   # slow motion for the screenshot strip only
        mv = pg.evaluate(HUMAN); res.append(f'{tag} you: {mv}')
        try: pg.wait_for_function('() => { const V = CM.scene3d.current().view3d; return !!V.carry; }', timeout=30000)
        except Exception: res.append(f'{tag} no carry: {pg.evaluate(STATE)} errs {errs[:3]}'); print('\n'.join(res)); raise
        samples = []
        for k in range(7):
            c = pg.evaluate(CARRY)
            if c: samples.append(c)
            if SHOTS and c and not rm: pg.screenshot(path=f'{SHOTS}/fly_{tag}_carry{k}.png', clip=pg.evaluate("() => { const r = document.getElementById('board-wrap').getBoundingClientRect(); return { x: r.left, y: r.top, width: r.width, height: r.height }; }"))
            pg.wait_for_timeout(1100 if (SHOTS and not rm) else 200)
        res.append(f'{tag} carry samples: {json.dumps(samples)}')
        held = [s for s in samples if s['piece'][1] > .3 and abs(s['piece'][0] - s['fly'][0]) < .05 and abs(s['piece'][2] - s['fly'][2]) < .05 and s['fly'][1] > s['piece'][1]]
        check(len(held) >= 1, f'{tag} piece lifted and held under the fly mid-flight ({len(held)} samples)')
        pg.wait_for_function('() => !CM.scene3d.current().view3d.carry', timeout=20000)
        pg.evaluate('() => { delete CM.scene3d.current().view3d.P.carryMs; }')
        # the moved piece is back on its square
        okpos = pg.evaluate("""() => { const V = CM.scene3d.current().view3d; return Object.values(V.pieces).every(o => { const s = o.userData.sq; if (s == null || o.userData.sliding) return true; const q = V.S.sq2world(s); return Math.abs(o.position.x - q.x) < .01 && Math.abs(o.position.z - q.z) < .01 && Math.abs(o.position.y - q.y) < .01; }); }""")
        check(okpos, f'{tag} every piece rests on its square after the carry')
        pg.evaluate('() => CM.scene3d.current().renderer.setPixelRatio(.5)')   # swiftshader is slow: cheap frames for the long game
        # play on to the end (no waiting for the fly to land: no softlock from overlapping moves)
        t0 = time.time(); caps = 0
        while time.time() - t0 < 200:
            st = pg.evaluate(STATE)
            if st['over']: break
            if pg.evaluate(HUMAN): pass
            pg.wait_for_timeout(250)
        st = pg.evaluate(STATE); res.append(f'{tag} end: {st}')
        check(bool(st['over']), f'{tag} game finished ({st["over"]}, {st["n"]} plies)')
        pg.wait_for_timeout(2000)
        if SHOTS: pg.screenshot(path=f'{SHOTS}/fly_{tag}_end.png')
        check(pg.evaluate("() => { const S = CM.scene3d.current(); return !S || !S.view3d || !S.view3d.carry; }"), f'{tag} no carry stuck after the end')
        bad = [e for e in errs if '127.0.0.1' in e or 'pageerror' in e or 'Failed to load' not in e]
        check(not bad, f'{tag} 0 console errors {bad[:4]}')
        ctx.close()
    b.close()
print('\n'.join(res)); print('ALL OK' if ok_all else 'SOME FAILED')
sys.exit(0 if ok_all else 1)
