"""m3-art QA: open modes at 390x844 touch (DPR 2), count console errors (CDN 407/tunnel noise ignored), save a
screenshot of the board area per mode.
  python3 tools/m3art_qa.py --ids a,b --out research/ref/m3-art [--port 8823]"""
import os, sys, json, time, threading, http.server, socketserver, functools, argparse, re
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ap = argparse.ArgumentParser(); ap.add_argument('--ids', default=''); ap.add_argument('--out', default='/tmp/m3art_qa')
ap.add_argument('--port', type=int, default=8823); ap.add_argument('--wait', type=int, default=2000)
args = ap.parse_args(); os.makedirs(args.out, exist_ok=True)
NOISE = re.compile(r'407|ERR_TUNNEL|ERR_FAILED|ERR_BLOCKED|net::|unpkg|jsdelivr|Failed to load resource|youtube|ytimg', re.I)
from playwright.sync_api import sync_playwright
def serve():
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a, **k): pass
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(('127.0.0.1', args.port), functools.partial(Q, directory=ROOT)) as s: s.serve_forever()
threading.Thread(target=serve, daemon=True).start(); time.sleep(0.4)
base = f'http://127.0.0.1:{args.port}/index.html'
res = {}
with sync_playwright() as p:
    b = p.chromium.launch(args=['--disable-gpu'])
    ctx = b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2, has_touch=True, is_mobile=True)
    ctx.route(re.compile(r'https?://(?!127\.0\.0\.1).*'), lambda r: r.abort())
    for mid in [i for i in args.ids.split(',') if i]:
        pg = ctx.new_page(); errs = []
        pg.on('console', lambda m: m.type == 'error' and not NOISE.search(m.text) and errs.append(m.text[:200]))
        pg.on('pageerror', lambda e: errs.append('pageerror: ' + str(e)[:200]))
        try:
            pg.goto(base + '#/play/' + mid, timeout=15000)
            try: pg.wait_for_function('window.CM && CM.gameUI && document.querySelector("#board")', timeout=9000)
            except Exception: pass
            pg.wait_for_timeout(args.wait)
            el = pg.query_selector('#board')
            (el or pg).screenshot(path=os.path.join(args.out, f'{mid}.png'))
        except Exception as e: errs.append('nav: ' + str(e)[:200])
        res[mid] = errs; print(mid, len(errs), errs[:2]); pg.close()
    b.close()
json.dump(res, open(os.path.join(args.out, 'console.json'), 'w'), indent=1)
print('modes', len(res), 'with errors', sum(1 for v in res.values() if v))
