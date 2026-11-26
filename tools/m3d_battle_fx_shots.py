#!/usr/bin/env python3
# s5-3d: freeze-frame shots of a Battle Chess capture's fx (queen charge/bolt/burst): python3 tools/m3d_battle_fx_shots.py Q|B|R|K  (OUT env, default /tmp/m3d_battle_fx)
import os, sys, threading, http.server, socketserver, functools
from playwright.sync_api import sync_playwright
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__))); PORT=8834; OUT=os.environ.get('OUT','/tmp/m3d_battle_fx'); os.makedirs(OUT,exist_ok=True)
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a,**k): pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.ThreadingTCPServer(('127.0.0.1',PORT),functools.partial(Q,directory=ROOT)); threading.Thread(target=srv.serve_forever,daemon=True).start()
SETUP = """(at) => { const G = CM.gameUI.controller, V = G.V, g = V.geo;
  const empt = []; for (let i = 0; i < 64; i++) if (!G.state.b[i]) { const r = Math.floor(g.name(i)[1]); if (r >= 3 && r <= 6) empt.push(i); }
  for (const a of empt) for (const t of empt) { if (a === t) continue;
    G.ctx.set(a, V.piece(at, 'w')); G.ctx.set(t, V.piece('P', 'b'));
    G.moves = V.legal(G.state);
    if (G.moves.some(m => m.f === a && m.t === t)) { G.render(); return [g.name(a), g.name(t)]; }
    G.ctx.set(a, null); G.ctx.set(t, null); }
  G.moves = V.legal(G.state); G.render(); return null; }"""
errs=[]
at=sys.argv[1] if len(sys.argv)>1 else 'Q'
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
    ctx=b.new_context(viewport={'width':390,'height':844},device_scale_factor=1,is_mobile=True,has_touch=True)
    pg=ctx.new_page(); pg.on('pageerror',lambda e: errs.append(str(e)[:300]))
    pg.goto(f'http://127.0.0.1:{PORT}/index.html#/play/IbRrzKtieqs')
    pg.wait_for_function('() => CM.battle3d && CM.battle3d.current && CM.battle3d.current()', timeout=90000)
    pg.wait_for_timeout(2500)
    pg.evaluate('() => { CM.scene3d.current().renderer.setPixelRatio(.6); }')
    r=pg.evaluate(SETUP, at); print('setup', r, flush=True)
    pg.wait_for_timeout(1500)
    pg.evaluate(f"() => {{ const B=CM.battle3d.current(); B.speed=2; const G = CM.gameUI.controller; G.tryMove(G.V.geo.parse('{r[0]}'), G.V.geo.parse('{r[1]}')); }}")
    n=0
    for k in range(900):
        pg.wait_for_timeout(120)
        st=pg.evaluate("() => { const B=CM.battle3d.current(); return {fx:B.fx.length, tr:B.fx.filter(f=>f.track).length, busy:B.busy, clock:+B.clock.toFixed(2)}; }")
        if st['tr']>0 and n<4:
            pg.evaluate("() => { CM.battle3d.current().speed = 0; }")
            pg.locator('canvas').first.screenshot(path=f'{OUT}/{at}_{n}.png', timeout=90000); print('shot',n,st,flush=True); n+=1
            pg.evaluate("() => { CM.battle3d.current().speed = .5; }"); pg.wait_for_timeout(350)
        if not st['busy'] and k>10: break
    print('end', st, 'errors', errs)
    b.close()
