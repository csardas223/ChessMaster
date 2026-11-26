#!/usr/bin/env python3
"""pol-perf: measure Chess Master load performance the way a phone sees it.

Serves <site_dir> with gzip for text types (like GitHub Pages) at / , opens it in headless Chromium at 390x844 with
Slow-4G-like throttling (150 ms RTT, 1.6 Mbit/s down, 750 kbit/s up) and 4x CPU slowdown, then reports:
  lobby_ms     navigation start -> lobby interactive (rows rendered and CM.lobby ready)
  lobby_bytes  bytes transferred (encoded) until then, same-origin; count of requests
  mode_ms[id]  hash route -> board/frame drawn, and the bytes that open pulled in
  heap_mb      JS heap after the lobby and after the modes
External hosts (YouTube thumbnails, unpkg Stockfish) are blocked so numbers are stable; their request counts are kept.

  python3 perf_measure.py <site_dir> [--modes a,b,c] [--port 8807] [--runs 2] [--no-throttle] [--json out.json]"""
import argparse, functools, gzip, http.server, io, json, os, socketserver, sys, threading, time
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright

ap = argparse.ArgumentParser()
ap.add_argument('site')
ap.add_argument('--modes', default='stockfish,8CtX9G07bMU,-TKJGtBKK8U,iqfHW2_sMmc,oAoik9Dj2qQ')
ap.add_argument('--legacy', default='', help='a video id with no mode file (legacy port); auto-picked if empty')
ap.add_argument('--port', type=int, default=8807)
ap.add_argument('--runs', type=int, default=2)
ap.add_argument('--no-throttle', action='store_true')
ap.add_argument('--json', default='')
args = ap.parse_args()
site = os.path.abspath(args.site)
TEXT = ('.js', '.css', '.html', '.json', '.svg', '.txt', '.mjs')

class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a, **k): pass
    def end_headers(self):
        self.send_header('Cache-Control', 'max-age=600')
        super().end_headers()
    def send_head(self):
        path = self.translate_path(self.path)
        if os.path.isfile(path) and path.endswith(TEXT) and 'gzip' in self.headers.get('Accept-Encoding', ''):
            data = open(path, 'rb').read(); z = gzip.compress(data, 6)
            self.send_response(200); self.send_header('Content-Type', self.guess_type(path))
            self.send_header('Content-Encoding', 'gzip'); self.send_header('Content-Length', str(len(z)))
            self.end_headers(); return io.BytesIO(z)
        return super().send_head()
class S(socketserver.ThreadingMixIn, socketserver.TCPServer):
    allow_reuse_address = True; daemon_threads = True
srv = S(('127.0.0.1', args.port), functools.partial(Q, directory=site))
threading.Thread(target=srv.serve_forever, daemon=True).start(); time.sleep(0.2)
host = f'127.0.0.1:{args.port}'; base = f'http://{host}/'

legacy = args.legacy
if not legacy:
    vids = json.load(open(os.path.join(site, 'data/videos.json')))
    have = set(f[:-3] for f in os.listdir(os.path.join(site, 'data/modes')) if f.endswith('.js'))
    legacy = next((v['id'] for v in vids if v['id'] not in have), '')
modes = [m for m in args.modes.split(',') if m] + ([legacy] if legacy else [])

def run_once(b):
    ctx = b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=3, is_mobile=True, has_touch=True)
    ext = {'n': 0, 'thumbs': 0}
    def route(r):
        u = r.request.url
        if urlparse(u).netloc != host:
            ext['n'] += 1
            if 'ytimg' in u: ext['thumbs'] += 1
            return r.abort()
        return r.continue_()
    ctx.route('**/*', route)
    pg = ctx.new_page(); cdp = ctx.new_cdp_session(pg)
    cdp.send('Network.enable'); cdp.send('Performance.enable')
    if not args.no_throttle:
        cdp.send('Network.emulateNetworkConditions', {'offline': False, 'latency': 150,
                 'downloadThroughput': 1.6 * 1024 * 1024 / 8, 'uploadThroughput': 750 * 1024 / 8})
        cdp.send('Emulation.setCPUThrottlingRate', {'rate': 4})
    acc = {'bytes': 0, 'n': 0, 'raw': 0}; urls = {}
    def fin(e):
        acc['bytes'] += e.get('encodedDataLength', 0); acc['n'] += 1
    def resp(e):
        urls[e['requestId']] = e['response']['url']
    cdp.on('Network.loadingFinished', fin); cdp.on('Network.responseReceived', resp)
    errs = []; pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
    t0 = time.time()
    pg.goto(base, wait_until='commit')
    pg.wait_for_function("() => window.CM && CM.lobby && CM.lobby.list && CM.lobby.list.length > 0 && document.querySelectorAll('#rows .vrow').length > 0", timeout=120000, polling=50)
    lobby_ms = (time.time() - t0) * 1000
    # interactive: main thread answers (a task can run)
    pg.evaluate("() => new Promise(r => setTimeout(r, 0))"); lobby_ti = (time.time() - t0) * 1000
    nav = pg.evaluate("() => { const n = performance.getEntriesByType('navigation')[0]; return { dcl: n.domContentLoadedEventEnd, load: n.loadEventEnd } }")
    pg.wait_for_timeout(1500)
    lobby_bytes, lobby_n = acc['bytes'], acc['n']
    heap = lambda: round(next(m['value'] for m in cdp.send('Performance.getMetrics')['metrics'] if m['name'] == 'JSHeapUsedSize') / 1048576, 1)
    out = {'lobby_ms': round(lobby_ms), 'lobby_interactive_ms': round(lobby_ti), 'dcl_ms': round(nav['dcl']), 'load_ms': round(nav['load']),
           'lobby_bytes': lobby_bytes, 'lobby_requests': lobby_n, 'lobby_thumb_requests': ext['thumbs'], 'heap_lobby_mb': heap(), 'modes': {}}
    for mid in modes:
        b0, n0 = acc['bytes'], acc['n']; t1 = time.time()
        pg.evaluate("h => { location.hash = h }", '#/play/' + mid)
        try:
            pg.wait_for_function("""() => { const v = document.getElementById('view-game'); if (!v || v.hidden) return false;
                const t = (document.getElementById('mname') || {}).textContent || '';
                const gf = document.getElementById('game-frame');
                return t.trim() && (document.querySelectorAll('#board > *').length > 0 || (gf && !gf.hidden)); }""", timeout=120000, polling=50)
            ms = round((time.time() - t1) * 1000)
        except Exception as e:
            ms = None
        pg.wait_for_timeout(1200)
        out['modes'][mid] = {'ms': ms, 'bytes': acc['bytes'] - b0, 'requests': acc['n'] - n0}
        pg.evaluate("() => { location.hash = '#/' }"); pg.wait_for_timeout(600)
    out['heap_after_modes_mb'] = heap(); out['total_bytes'] = acc['bytes']; out['pageerrors'] = errs
    ctx.close(); return out

res = []
with sync_playwright() as p:
    b = p.chromium.launch()
    for i in range(args.runs): res.append(run_once(b))
    b.close()
srv.shutdown()
def med(vals):
    v = sorted(x for x in vals if x is not None); return v[len(v) // 2] if v else None
summ = {k: med([r[k] for r in res]) for k in res[0] if k not in ('modes', 'pageerrors')}
summ['modes'] = {m: {k: med([r['modes'][m][k] for r in res]) for k in ('ms', 'bytes', 'requests')} for m in modes}
summ['pageerrors'] = sorted(set(e for r in res for e in r['pageerrors']))
summ['throttle'] = 'none' if args.no_throttle else 'slow4G 150ms/1.6Mbps + 4x CPU'
print(json.dumps(summ, indent=1))
if args.json: json.dump({'summary': summ, 'runs': res}, open(args.json, 'w'), indent=1)
