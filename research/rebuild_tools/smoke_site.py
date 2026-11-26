#!/usr/bin/env python3
"""Smoke test of a built Chess Master site tree (the main tree, or rebuild/app) the way GitHub Pages serves it.

Serves <site_dir> twice from a local static server: at the site root (/) and under a project subpath (/ChessMaster/),
then for each: loads the lobby (rows must render), opens each mode in --modes through the real hash route, checks the
game view shows the mode title, and collects console errors, page errors and failed same-origin requests.
External requests (YouTube thumbnails, Stockfish from unpkg) are left alone; failures on them caused by a sandbox proxy
(407 / ERR_TUNNEL / ERR_PROXY / ERR_NAME_NOT_RESOLVED / ERR_FAILED on another host) are reported as "ignored", not errors.

  pip install playwright && python -m playwright install --with-deps chromium
  python3 smoke_site.py <site_dir> [--modes id1,id2,id3] [--port 8790]
Exit 0 = pass, 1 = any real error."""
import argparse, functools, http.server, json, os, socketserver, sys, tempfile, threading, time
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright

ap = argparse.ArgumentParser()
ap.add_argument('site')
ap.add_argument('--modes', default='8CtX9G07bMU,-TKJGtBKK8U,iqfHW2_sMmc',
                help='mode ids to open (default: a textured spec mode, a game-frame mode, a 3D mode)')
ap.add_argument('--port', type=int, default=8790)
ap.add_argument('--wait', type=int, default=2500, help='ms to let each view settle')
args = ap.parse_args()
site = os.path.abspath(args.site)
if not os.path.isfile(os.path.join(site, 'index.html')):
    sys.exit(f'no index.html in {site}')

# docroot with the site at / and a symlink ChessMaster -> site for the Pages-style subpath
docroot = tempfile.mkdtemp(prefix='cm_smoke_')
for name in os.listdir(site):
    os.symlink(os.path.join(site, name), os.path.join(docroot, name))
os.symlink(site, os.path.join(docroot, 'ChessMaster'))

class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a, **k): pass
class S(socketserver.ThreadingMixIn, socketserver.TCPServer):
    allow_reuse_address = True; daemon_threads = True
srv = S(('127.0.0.1', args.port), functools.partial(Q, directory=docroot))
threading.Thread(target=srv.serve_forever, daemon=True).start(); time.sleep(0.3)
host = f'127.0.0.1:{args.port}'
PROXY = ('407', 'ERR_TUNNEL', 'ERR_PROXY', 'ERR_NAME_NOT_RESOLVED', 'ERR_INTERNET_DISCONNECTED', 'ERR_FAILED',
         'ERR_CONNECTION', 'ERR_CERT', 'Proxy Authentication')
modes = [m for m in args.modes.split(',') if m]
report = {'site': site, 'bases': {}, 'pass': True}

with sync_playwright() as p:
    b = p.chromium.launch()
    for label, base in (('root', f'http://{host}/'), ('pages-subpath', f'http://{host}/ChessMaster/')):
        ctx = b.new_context(viewport={'width': 390, 'height': 844})
        pg = ctx.new_page()
        cur = {'step': 'lobby'}; errors, ignored, steps = [], [], {}
        def same(u): return urlparse(u).netloc == host
        def on_resp(r):
            if r.status >= 400:
                (errors if same(r.url) else ignored).append(f"[{cur['step']}] HTTP {r.status} {r.url}")
        def on_fail(r):
            f = str(r.failure)
            if 'ERR_ABORTED' in f: return  # media range requests / navigations cancelled by the page itself
            (errors if same(r.url) else ignored).append(f"[{cur['step']}] FAILED {r.url} {f}")
        def on_console(m):
            if m.type != 'error': return
            t = m.text
            if 'Failed to load resource' in t:
                # the matching request is already classified by on_resp/on_fail (same-origin vs external)
                if any(k in t for k in PROXY): ignored.append(f"[{cur['step']}] console {t[:160]}")
                return
            if 'stockfish' in t.lower() and any(k in t for k in ('http', 'fetch', 'Failed')):
                ignored.append(f"[{cur['step']}] console {t[:160]}"); return
            errors.append(f"[{cur['step']}] console {t[:300]}")
        pg.on('response', on_resp); pg.on('requestfailed', on_fail); pg.on('console', on_console)
        pg.on('pageerror', lambda e: errors.append(f"[{cur['step']}] pageerror {str(e)[:300]}"))

        pg.goto(base, wait_until='load'); pg.wait_for_timeout(args.wait)
        rows = pg.evaluate("document.querySelectorAll('#rows > *').length")
        cards = pg.evaluate("document.querySelectorAll('#lobby a, #lobby button, #lobby [data-id]').length")
        steps['lobby'] = {'rows': rows, 'cards': cards, 'ok': rows > 0 and cards > 0}
        for mid in modes:
            cur['step'] = mid
            pg.evaluate("h => { location.hash = h }", '#/play/' + mid); pg.wait_for_timeout(args.wait)
            st = pg.evaluate("""() => { const v = document.getElementById('view-game');
                return { title: (document.getElementById('mname') || {}).textContent || '',
                         visible: !!v && !v.hidden && getComputedStyle(v).display !== 'none',
                         board: document.querySelectorAll('#board > *').length,
                         frame: !!document.getElementById('game-frame') && !document.getElementById('game-frame').hidden } }""")
            st['ok'] = bool(st['title'].strip()) and st['visible'] and (st['board'] > 0 or st['frame'])
            steps[mid] = st
            pg.evaluate("() => { location.hash = '#/' }"); pg.wait_for_timeout(400)
        ok = not errors and all(s['ok'] for s in steps.values())
        report['bases'][label] = {'url': base, 'ok': ok, 'steps': steps, 'errors': errors,
                                  'ignored_external': len(ignored), 'ignored_sample': ignored[:3]}
        report['pass'] &= ok
        ctx.close()
    b.close()
srv.shutdown()
print(json.dumps(report, indent=1))
print('SMOKE', 'PASS' if report['pass'] else 'FAIL')
sys.exit(0 if report['pass'] else 1)
