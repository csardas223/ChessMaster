#!/usr/bin/env python3
"""pol-ui: screenshots of the app shell for visual review (lobby, search, tab, options, game, game-over, game frame)
at several widths, plus every 4-player mode's board.

  python3 tools/pol_ui_shots.py --out DIR [--widths 390,1280] [--port 8806] [--four] [--only lobby,game,...]
"""
import os, sys, time, threading, http.server, socketserver, functools, argparse, glob, re
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ap = argparse.ArgumentParser()
ap.add_argument('--out', required=True)
ap.add_argument('--widths', default='390,1280')
ap.add_argument('--port', type=int, default=8806)
ap.add_argument('--four', action='store_true', help='also shoot every 4-player mode')
ap.add_argument('--only', default='')
ap.add_argument('--ids', default='', help='extra mode ids to shoot (game screen)')
args = ap.parse_args()
os.makedirs(args.out, exist_ok=True)
only = set(filter(None, args.only.split(',')))
want = lambda k: not only or k in only


def serve():
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a, **k): pass
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(('127.0.0.1', args.port), functools.partial(Q, directory=ROOT)) as s: s.serve_forever()
threading.Thread(target=serve, daemon=True).start(); time.sleep(0.4)
BASE = f'http://127.0.0.1:{args.port}/index.html'


def four_ids():
    out = []
    for f in sorted(glob.glob(os.path.join(ROOT, 'data/modes/*.js'))):
        s = open(f, encoding='utf-8').read()
        if os.path.basename(f) == 'index.js': continue
        if re.search(r"players:\s*\[", s) and re.search(r"color:\s*'[ruygp]'", s) or re.search(r"hooks:\s*'g[56]_4pc'", s):
            out.append(os.path.basename(f)[:-3])
    return out


errors = []
with sync_playwright() as p:
    b = p.chromium.launch()
    for w in [int(x) for x in args.widths.split(',')]:
        h = 844 if w < 700 else (1024 if w < 1100 else 800)
        mob = w < 700
        ctx = b.new_context(viewport={'width': w, 'height': h}, device_scale_factor=1 if w > 700 else 2, is_mobile=mob, has_touch=mob)
        pg = ctx.new_page()
        pg.on('pageerror', lambda e: errors.append(str(e)[:200]))
        pg.goto(BASE); pg.wait_for_timeout(900)
        if want('lobby'):
            pg.screenshot(path=f'{args.out}/lobby_{w}.png')
            pg.screenshot(path=f'{args.out}/lobby_full_{w}.png', full_page=True, clip={'x': 0, 'y': 0, 'width': w, 'height': min(2600, pg.evaluate('document.documentElement.scrollHeight'))})
        if want('tab'):
            tabs = pg.eval_on_selector_all('#tabs [data-tab]', 'e => e.map(x => x.dataset.tab)')
            pg.click(f'#tabs [data-tab="{tabs[2]}"]'); pg.wait_for_timeout(500)
            pg.screenshot(path=f'{args.out}/tab_{w}.png')
            pg.click('#tabs [data-tab="all"]'); pg.wait_for_timeout(200)
        if want('search'):
            pg.fill('#q', 'atomic'); pg.wait_for_timeout(500); pg.screenshot(path=f'{args.out}/search_{w}.png')
            pg.fill('#q', 'zzqqxx'); pg.wait_for_timeout(300); pg.screenshot(path=f'{args.out}/empty_{w}.png')
            pg.fill('#q', ''); pg.wait_for_timeout(200)
        if want('options'):
            pg.click('#open-settings'); pg.wait_for_timeout(500); pg.screenshot(path=f'{args.out}/options_{w}.png')
            pg.keyboard.press('Escape'); pg.wait_for_timeout(400)
        if want('game'):
            pg.evaluate('CM.app.openMode("stockfish")')
            pg.wait_for_function('CM.gameUI.controller && CM.gameUI.controller.state', timeout=15000); pg.wait_for_timeout(700)
            pg.screenshot(path=f'{args.out}/game_{w}.png')
            pg.click('#resign'); pg.wait_for_timeout(150); pg.click('#resign')
            try: pg.wait_for_selector('#gover.is-open', timeout=4000)
            except Exception: pass
            pg.wait_for_timeout(500); pg.screenshot(path=f'{args.out}/gameover_{w}.png')
            pg.evaluate('CM.gameUI.hideOver()'); pg.wait_for_timeout(300)
            pg.evaluate('document.getElementById("back").click()'); pg.wait_for_timeout(500)
        for mid in [x for x in args.ids.split(',') if x]:
            pg.goto(BASE + '#/play/' + mid); pg.wait_for_timeout(3500)
            pg.screenshot(path=f'{args.out}/mode_{mid}_{w}.png')
        if args.four:
            for mid in four_ids():
                pg.goto(BASE + '#/play/' + mid); pg.wait_for_timeout(3000)
                pg.screenshot(path=f'{args.out}/four_{mid}_{w}.png')
        ctx.close()
    b.close()
print('errors:', errors[:10])
