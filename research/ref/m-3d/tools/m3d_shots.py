import sys, time, threading, http.server, socketserver, functools, os
from playwright.sync_api import sync_playwright
ROOT, PORT, OUT = sys.argv[1], int(sys.argv[2]), sys.argv[3]; IDS = sys.argv[4].split(','); TAG = sys.argv[5] if len(sys.argv) > 5 else ''
os.makedirs(OUT, exist_ok=True)
def serve():
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a, **k): pass
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(('127.0.0.1', PORT), functools.partial(Q, directory=ROOT)) as s: s.serve_forever()
threading.Thread(target=serve, daemon=True).start(); time.sleep(.4)
IGN = ('TUNNEL', '407', 'CORS', 'ERR_FAILED', 'Maia', 'ytimg', 'unpkg', 'NAME_NOT_RESOLVED', 'GPU stall', 'GL Driver')
with sync_playwright() as p:
    b = p.chromium.launch(args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
    ctx = b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=1, is_mobile=True, has_touch=True)
    for mid in IDS:
        pg = ctx.new_page(); errs = []
        pg.on('console', lambda m: errs.append(m.text[:200]) if m.type == 'error' and not any(s in m.text for s in IGN) else None)
        pg.on('pageerror', lambda e: errs.append('PE ' + str(e)[:200]))
        try:
            pg.goto(f'http://127.0.0.1:{PORT}/index.html#/play/{mid}')
            pg.wait_for_timeout(6000)
            try: pg.wait_for_function('() => CM.scene3d && CM.scene3d.current && CM.scene3d.current()', timeout=30000)
            except Exception: pass
            pg.wait_for_timeout(5000)
            pg.screenshot(path=f'{OUT}/{mid}{TAG}.png', timeout=90000)
            info = pg.evaluate("() => { const S = CM.scene3d && CM.scene3d.current && CM.scene3d.current(); return S ? { pr: S.renderer.getPixelRatio(), calls: S.renderer.info.render.calls } : null; }")
            print('OK', mid, info, errs[:3], flush=True)
        except Exception as e:
            print('ERR', mid, str(e)[:200], errs[:3], flush=True)
        pg.close()
    b.close()
