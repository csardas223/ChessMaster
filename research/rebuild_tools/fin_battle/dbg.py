import sys, json, time, threading, http.server, socketserver, functools, os
from playwright.sync_api import sync_playwright
ROOT = sys.argv[1]; PORT = int(sys.argv[2]); OUT = sys.argv[3]; SCRIPT = sys.argv[4]
os.makedirs(OUT, exist_ok=True)
def serve():
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a, **k): pass
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(('127.0.0.1', PORT), functools.partial(Q, directory=ROOT)) as s: s.serve_forever()
threading.Thread(target=serve, daemon=True).start(); time.sleep(.4)
with sync_playwright() as p:
    b = p.chromium.launch(args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
    ctx = b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True)
    pg = ctx.new_page()
    pg.on('console', lambda m: print('CONSOLE', m.type, m.text[:300], flush=True) if m.type in ('error', 'warning') else None)
    pg.on('pageerror', lambda e: print('PAGEERROR', str(e)[:400], flush=True))
    pg.goto(f'http://127.0.0.1:{PORT}/index.html#/play/IbRrzKtieqs')
    pg.wait_for_function('() => CM.battle3d && CM.battle3d.current() && CM.battle3d.current().S', timeout=60000)
    pg.wait_for_timeout(3000)
    exec(open(SCRIPT).read())
    b.close()
