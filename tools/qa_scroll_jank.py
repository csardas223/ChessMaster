#!/usr/bin/env python3
"""Lobby infinite-scroll jank check (HANDOFF #10, fin2-lobby step 4): phone viewport, CPU throttled (default 4x via CDP
Emulation.setCPUThrottlingRate), thumbnails optionally blocked so every placeholder pawn keeps spinning (worst case).
Scrolls the "All modes" feed with touch-like wheel steps for N seconds, records every animation frame interval and
every long task (PerformanceObserver 'longtask'), the number of rows rendered and how many pages the feed appended.
Reports p50/p95/p99 frame time, frames > 50 ms and the long tasks around each feed page append.

  python3 tools/qa_scroll_jank.py [--width 390] [--cpu 4] [--secs 12] [--block-thumbs] [--port 8798]
Exits 1 when p95 frame time > 50 ms or any long task > 200 ms (thresholds for a 4x-throttled phone)."""
import sys, os, json, time, threading, http.server, socketserver, functools, argparse
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ap = argparse.ArgumentParser()
ap.add_argument('--width', type=int, default=390); ap.add_argument('--cpu', type=float, default=4)
ap.add_argument('--secs', type=float, default=12); ap.add_argument('--block-thumbs', action='store_true')
ap.add_argument('--port', type=int, default=8798)
ap.add_argument('--nospin', action='store_true', help='A/B: freeze the placeholder pawns (.pawnspin) to measure what the spin costs')
a = ap.parse_args()
def serve():
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *x, **k): pass
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(('127.0.0.1', a.port), functools.partial(Q, directory=ROOT)) as s: s.serve_forever()
threading.Thread(target=serve, daemon=True).start(); time.sleep(0.4)
with sync_playwright() as p:
    b = p.chromium.launch()
    ctx = b.new_context(viewport={'width': a.width, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True)
    pg = ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
    if a.block_thumbs:
        pg.route('**/thumb.jpg', lambda r: r.abort()); pg.route('**/i.ytimg.com/**', lambda r: r.abort())
    pg.goto(f'http://127.0.0.1:{a.port}/index.html', wait_until='load'); pg.wait_for_selector('.vrow, .mcard', timeout=20000); time.sleep(1.5)
    if a.nospin: pg.add_style_tag(content='.pawnspin{animation:none!important}')
    cdp = ctx.new_cdp_session(pg); cdp.send('Emulation.setCPUThrottlingRate', {'rate': a.cpu})
    pg.evaluate("""() => { window._ft = []; window._lt = []; window._pages = 0; let last = performance.now();
      (function f(t) { window._ft.push(t - last); last = t; if (!window._stop) requestAnimationFrame(f); })(performance.now());
      try { new PerformanceObserver(l => l.getEntries().forEach(e => window._lt.push([Math.round(e.startTime), Math.round(e.duration)]))).observe({ type: 'longtask', buffered: false }); } catch (e) {}
      document.addEventListener('cm:lobby-rows', () => window._pages++); }""")
    t0 = time.time(); n = 0
    while time.time() - t0 < a.secs:
        pg.mouse.wheel(0, 260); n += 1; time.sleep(0.05)
    pg.evaluate('window._stop = true'); time.sleep(0.2)
    cdp.send('Emulation.setCPUThrottlingRate', {'rate': 1})
    r = pg.evaluate("""() => { const f = window._ft.slice(2).sort((x, y) => x - y), q = k => Math.round(f[Math.min(f.length - 1, Math.floor(f.length * k))]);
      return { frames: f.length, p50: q(.5), p95: q(.95), p99: q(.99), over50: f.filter(x => x > 50).length, max: Math.round(f[f.length - 1] || 0),
        longtasks: window._lt.length, longest: Math.max(0, ...window._lt.map(x => x[1])), pages: window._pages,
        rows: document.querySelectorAll('.vrow').length, spinning: [...document.querySelectorAll('.pawnspin')].filter(e => e.getAnimations().some(an => an.playState === 'running')).length, scrollY: Math.round(scrollY) }; }""")
    r.update({'nospin': a.nospin, 'width': a.width, 'cpu': a.cpu, 'block_thumbs': a.block_thumbs, 'wheel_steps': n, 'errors': errs})
    print(json.dumps(r, indent=1))
    b.close()
sys.exit(0 if r['p95'] <= 50 and r['longest'] <= 200 and not errs else 1)
