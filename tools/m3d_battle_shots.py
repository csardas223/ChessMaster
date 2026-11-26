#!/usr/bin/env python3
"""Close-up look shots of the Battle Chess (IbRrzKtieqs) characters + hall, for comparing against
assets/modes/IbRrzKtieqs/fight_1.jpg / intro.jpg. Phone 390x844, SwiftShader, pixel ratio 1.
  python3 tools/m3d_battle_shots.py [--out DIR] [--port N (default: a free port)]
Writes <out>/overview.png and <out>/close_<sq>.png (rooks are shown awake as golems)."""
import os, time, threading, http.server, socketserver, functools, argparse, tempfile
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ap = argparse.ArgumentParser()
ap.add_argument('--out', default=os.path.join(tempfile.gettempdir(), 'm3d_battle_shots'))
ap.add_argument('--port', type=int, default=0)
ap.add_argument('--squares', default='b1,d1,a1,e1,c1,b8,d8,h8,e7')
ap.add_argument('--mode', default='IbRrzKtieqs')
args = ap.parse_args()
os.makedirs(args.out, exist_ok=True)


def serve():
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a, **k): pass
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(('127.0.0.1', args.port), functools.partial(Q, directory=ROOT)) as s: s.serve_forever()


if not args.port:
    import socket
    _s = socket.socket(); _s.bind(('127.0.0.1', 0)); args.port = _s.getsockname()[1]; _s.close()
threading.Thread(target=serve, daemon=True).start(); time.sleep(0.4)
errs = []
with sync_playwright() as p:
    b = p.chromium.launch(args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
    ctx = b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=1, has_touch=True, is_mobile=True)
    pg = ctx.new_page()
    pg.on('pageerror', lambda e: errs.append(str(e)[:300]))
    pg.on('console', lambda m: m.type == 'error' and '127.0.0.1' in ((m.location or {}).get('url') or '127.0.0.1') and errs.append(m.text[:200]))
    pg.goto(f'http://127.0.0.1:{args.port}/index.html#/play/{args.mode}')
    pg.wait_for_function('() => CM.scene3d && CM.scene3d.current && CM.scene3d.current()', timeout=60000)
    pg.wait_for_timeout(2500)
    pg.evaluate('() => { const S = CM.scene3d.current(); S.renderer.setPixelRatio(1); }')
    pg.screenshot(path=os.path.join(args.out, "overview.png"), timeout=120000)
    for spec in [s for s in args.squares.split(',') if s]:
        sq, _, view = spec.partition('@')
        pg.evaluate("""([sq, back]) => { const S = CM.scene3d.current(), G = CM.gameUI.controller, i = G.V.geo.parse(sq), B = CM.battle3d && CM.battle3d.current();
          if (B && B.map && B.map[i] && B.map[i].tower) B.map[i].awake = 1;
          const w = S.sq2world(i); const white = /[1-2]$/.test(sq);
          S.setCamera({ theta: (white ? Math.PI : 0) + 0.5 + (back ? Math.PI : 0), phi: 1.25, dist: 3.2, target: [w.x, 0.55, w.z] }, 0); }""", [sq, view == 'back'])
        pg.wait_for_timeout(1500)
        pg.locator('canvas').first.screenshot(path=os.path.join(args.out, f"close_{sq}{'_' + view if view else ''}.png"), timeout=120000)
    b.close()
print('errors:', errs)
print('shots in', args.out)
