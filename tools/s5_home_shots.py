#!/usr/bin/env python3
"""s5-ui: Home/lobby screenshots (390x844 touch + 1366x768 desktop) for the owner's "less vibecoded, more stimulating" pass.

  python3 tools/s5_home_shots.py --tag before|after [--full]

Writes research/ref/s5-ui/<tag>_home_<w>.jpg (first screen), <tag>_home_<w>_s1.jpg (one screen down) and with --full
a full-page shot. Reports console errors and horizontal overflow."""
import os, json, threading, http.server, socketserver, functools, argparse
from playwright.sync_api import sync_playwright

ap = argparse.ArgumentParser(); ap.add_argument('--tag', default='before'); ap.add_argument('--full', action='store_true')
ap.add_argument('--widths', default='390,1366'); ap.add_argument('--reduce', action='store_true')
args = ap.parse_args()
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'research/ref/s5-ui'); os.makedirs(OUT, exist_ok=True)
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
srv = socketserver.TCPServer(('127.0.0.1', 0), functools.partial(Q, directory=ROOT)); threading.Thread(target=srv.serve_forever, daemon=True).start()
BASE = f'http://127.0.0.1:{srv.server_address[1]}/index.html'
rep = {}
import urllib.request
_yc = {}
def route(r):
    u = r.request.url
    if u.startswith('http://127.0.0.1'): return r.continue_()
    if 'i.ytimg.com' in u:   # Chromium here has no proxy auth; fetch YouTube thumbnails from Python like the real site would
        try:
            if u not in _yc: _yc[u] = urllib.request.urlopen(u, timeout=8).read()
            return r.fulfill(status=200, body=_yc[u], headers={'content-type': 'image/jpeg', 'access-control-allow-origin': '*'})
        except Exception: return r.fulfill(status=404, body=b'')
    return r.abort()
with sync_playwright() as p:
    b = p.chromium.launch()
    for w in [int(x) for x in args.widths.split(',')]:
        mob = w < 900
        ctx = b.new_context(viewport={'width': w, 'height': 844 if mob else 768}, device_scale_factor=2 if mob else 1, is_mobile=mob, has_touch=mob,
                            reduced_motion='reduce' if args.reduce else 'no-preference')
        pg = ctx.new_page(); errs = []
        pg.on('pageerror', lambda x, e=errs: e.append(str(x)))
        pg.on('console', lambda m, e=errs: e.append(m.text) if m.type == 'error' else None)
        pg.route('**/*', route)
        pg.goto(BASE, wait_until='domcontentloaded'); pg.wait_for_timeout(2500); print('loaded', w, flush=True)
        pg.wait_for_timeout(1500)
        pg.wait_for_timeout(600)
        t = args.tag
        pg.screenshot(path=f'{OUT}/{t}_home_{w}.jpg', type='jpeg', quality=80)
        pg.evaluate('window.scrollBy(0, innerHeight * 0.9)'); pg.wait_for_timeout(900)
        pg.screenshot(path=f'{OUT}/{t}_home_{w}_s1.jpg', type='jpeg', quality=80)
        pg.evaluate('window.scrollBy(0, innerHeight * 0.9)'); pg.wait_for_timeout(900)
        pg.screenshot(path=f'{OUT}/{t}_home_{w}_s2.jpg', type='jpeg', quality=80)
        if args.full:
            pg.evaluate('window.scrollTo(0,0)'); pg.wait_for_timeout(300)
            pg.screenshot(path=f'{OUT}/{t}_home_{w}_full.jpg', type='jpeg', quality=70, full_page=True)
        ov = pg.evaluate('document.documentElement.scrollWidth - innerWidth')
        rep[w] = {'errors': errs[:5], 'overflow_px': ov}
        ctx.close()
    b.close()
srv.shutdown()
print(json.dumps(rep, indent=1))
