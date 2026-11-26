#!/usr/bin/env python3
"""s5-ui: game chrome screenshots at 390x844 touch (chess.com Android check), before/after a css/game.css pass.

  python3 tools/s5_chrome_shots.py --tag before|after [--ids stockfish,8CtX9G07bMU,...] [--port 8931] [--moves 2]

Opens each mode, plays a couple of plies (taps random legal moves via the controller so player bars, move strip,
captures and status lines are populated), shoots the full viewport and the top/bottom chrome crops into
research/ref/s5-ui/<tag>_<id>.jpg. Also reports console errors. Small: one browser, ids run one by one."""
import os, sys, json, threading, http.server, socketserver, functools, argparse
from playwright.sync_api import sync_playwright

ap = argparse.ArgumentParser()
ap.add_argument('--tag', default='before')
ap.add_argument('--ids', default='stockfish,8CtX9G07bMU,LK1gJhFKgwU,Ag3KKsIrax4')
ap.add_argument('--port', type=int, default=0)  # 0 = any free port
ap.add_argument('--moves', type=int, default=3)
ap.add_argument('--width', type=int, default=390)
ap.add_argument('--reduce', action='store_true')
args = ap.parse_args()
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'research/ref/s5-ui'); os.makedirs(OUT, exist_ok=True)

class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
socketserver.TCPServer.allow_reuse_address = True
srv = socketserver.TCPServer(('127.0.0.1', args.port), functools.partial(Q, directory=ROOT))
threading.Thread(target=srv.serve_forever, daemon=True).start()
BASE = f'http://127.0.0.1:{srv.server_address[1]}/index.html'

rep = {}
import urllib.request
_yc = {}
def route(r):
    u = r.request.url
    if u.startswith('http://127.0.0.1'): return r.continue_()
    if 'i.ytimg.com' in u:
        try:
            if u not in _yc: _yc[u] = urllib.request.urlopen(u, timeout=8).read()
            return r.fulfill(status=200, body=_yc[u], headers={'content-type': 'image/jpeg'})
        except Exception: return r.fulfill(status=404, body=b'')
    return r.abort()
with sync_playwright() as p:
    b = p.chromium.launch()
    ctx = b.new_context(viewport={'width': args.width, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True,
                        reduced_motion='reduce' if args.reduce else 'no-preference')
    for mid in args.ids.split(','):
        pg = ctx.new_page(); errs = []
        pg.on('console', lambda m, e=errs: e.append(m.text) if m.type == 'error' and 'ERR_TUNNEL' not in m.text and '407' not in m.text else None)
        pg.on('pageerror', lambda x, e=errs: e.append(str(x)))
        pg.route('**/*', route)
        pg.goto(f'{BASE}#/play/{mid}', wait_until='domcontentloaded')
        try:
            pg.wait_for_function('window.CM && CM.gameUI && CM.gameUI.controller && CM.gameUI.controller.state', timeout=20000)
            pg.wait_for_function('!document.querySelector(".view-game.is-loading")', timeout=12000)
        except Exception as ex:
            errs.append('load: ' + str(ex)[:120])
        pg.wait_for_timeout(1800)
        for i in range(args.moves):
            try:
                pg.evaluate("""() => { const c = CM.gameUI.controller; const ms = (c.moves || []).filter(m => !m.special && !m.promo);
                  if (!ms.length || c.busy || c.over || (c.state && c.state.turn !== c.human)) return 0;
                  const m = ms[Math.floor(Math.random()*ms.length)]; c.tryMove(m.f, m.t); return 1; }""")
            except Exception as ex:
                errs.append('move: ' + str(ex)[:100]); break
            pg.wait_for_timeout(2200)
        pg.wait_for_timeout(500)
        ov = pg.evaluate('document.documentElement.scrollWidth - innerWidth')
        if ov > 0: errs.append(f'page overflows horizontally by {ov}px')
        clk = pg.evaluate("[...document.querySelectorAll('.clock')].filter(c => c.offsetParent).map(c => Math.round(c.getBoundingClientRect().right))")
        if any(r > args.width for r in clk): errs.append(f'clock past the right edge: {clk}')
        f = os.path.join(OUT, f'{args.tag}_{mid}_{args.width}.jpg')
        pg.screenshot(path=f, type='jpeg', quality=82)
        pg.evaluate('window.scrollTo(0, document.body.scrollHeight)'); pg.wait_for_timeout(400)
        pg.screenshot(path=f.replace('.jpg', '_scroll.jpg'), type='jpeg', quality=82)
        pg.evaluate('window.scrollTo(0, 0)')
        try:
            pg.evaluate('CM.gameUI.controller.resign()'); pg.wait_for_timeout(1200)
            pg.screenshot(path=f.replace('.jpg', '_over.jpg'), type='jpeg', quality=82)
        except Exception as ex: errs.append('resign: ' + str(ex)[:80])
        rep[mid] = {'shot': os.path.relpath(f, ROOT), 'errors': errs[:5]}
        pg.close()
    b.close()
srv.shutdown()
print(json.dumps(rep, indent=1))
