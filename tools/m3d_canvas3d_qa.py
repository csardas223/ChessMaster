#!/usr/bin/env python3
"""QA for the 3D views of the canvas mini-games (js/games/lift3d.js): Chess Arena (CONozr99agQ, g4_rt arena) and
Table Tactics (xvlHij1tgk8). Phone 390x844 touch, SwiftShader. Checks: the WebGL view attaches under the 2D canvas,
real taps (CDP touch) select and move a piece / unit through the 3D pick, 0 console errors. Screenshots to --out.
  python3 tools/m3d_canvas3d_qa.py [--only arena|tt] [--out DIR]"""
import os, json, time, threading, http.server, socketserver, functools, argparse, tempfile, socket
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ap = argparse.ArgumentParser()
ap.add_argument('--out', default=os.path.join(tempfile.gettempdir(), 'm3d_canvas3d'))
ap.add_argument('--only', default='')
args = ap.parse_args()
os.makedirs(args.out, exist_ok=True)
_s = socket.socket(); _s.bind(('127.0.0.1', 0)); PORT = _s.getsockname()[1]; _s.close()


def serve():
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a, **k): pass
    socketserver.ThreadingTCPServer.allow_reuse_address = True
    with socketserver.ThreadingTCPServer(('127.0.0.1', PORT), functools.partial(Q, directory=ROOT)) as s: s.serve_forever()


threading.Thread(target=serve, daemon=True).start(); time.sleep(0.4)
IGNORE = ('ERR_TUNNEL', 'ERR_PROXY', 'ERR_NAME_NOT_RESOLVED', 'ERR_CONNECTION', 'i.ytimg.com', 'GPU stall', 'GL Driver', '407')
errs, FAILS = [], []


TAPSTART = "() => { const t = document.querySelector('.tapstart'); if (t) { t.click(); return 'tap'; } if (!(CM.loader && CM.loader.isVisible && CM.loader.isVisible()) && !(CM.gameUI && CM.gameUI.waitingStart)) return 'none'; return false; }"


def tap_to_start(pg, timeout=30000):
    # a direct #/play/<id> open shows the "Tap to start" plate (js/ui/game-ui.js tapToStart) once the loading screen
    # leaves; it eats the first tap and the match (bot, clocks) waits on it, so press it like a player would
    try: return pg.wait_for_function(TAPSTART, timeout=timeout).json_value()
    except Exception: return None


def check(name, ok, info=None):
    if not ok: FAILS.append(name)
    print(('ok   ' if ok else 'FAIL ') + name + ('' if info is None else '  ' + json.dumps(info)[:300]), flush=True)


def tap(pg, cdp, x, y):
    cdp.send('Input.dispatchTouchEvent', {'type': 'touchStart', 'touchPoints': [{'x': x, 'y': y, 'id': 1}]})
    pg.wait_for_timeout(80)
    cdp.send('Input.dispatchTouchEvent', {'type': 'touchEnd', 'touchPoints': []})
    pg.wait_for_timeout(400)


def shot(pg, name):
    try: pg.screenshot(path=os.path.join(args.out, name), timeout=120000)
    except Exception as e: print('screenshot skipped', name, str(e)[:80])


with sync_playwright() as p:
    b = p.chromium.launch(args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
    ctx = b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=1, has_touch=True, is_mobile=True)
    pg = ctx.new_page(); cdp = ctx.new_cdp_session(pg)
    pg.on('pageerror', lambda e: errs.append('pageerror ' + str(e)[:300]))
    pg.on('console', lambda m: m.type == 'error' and not any(s in m.text for s in IGNORE) and errs.append(m.text[:200]))
    Q = 'CM.gameUI.controller.mod.qa'
    if args.only in ('', 'arena'):
        pg.goto(f'http://127.0.0.1:{PORT}/index.html#/play/CONozr99agQ', timeout=180000, wait_until='domcontentloaded')
        pg.wait_for_function('() => CM.gameUI && CM.gameUI.controller && CM.gameUI.controller.mod && CM.gameUI.controller.mod.qa', timeout=150000)
        tap_to_start(pg, 60000)
        pg.wait_for_function(f'() => {Q}({{}}).three', timeout=150000)
        check('arena: 3D view attached', True)
        shot(pg, 'arena_0_pick.png')
        pg.evaluate(f'() => {Q}({{ pick: 0 }})'); pg.wait_for_timeout(500)
        pg.evaluate(f'() => {Q}({{ summon: true, wait: 1.5 }})'); pg.wait_for_timeout(1500)
        st = pg.evaluate(f'() => {Q}({{}})')
        check('arena: army summoned', st['mine'] > 3, st['positions'])
        shot(pg, 'arena_1_army.png')
        # tap a ready non-king piece, then a free target square
        moved = False
        for pos in st['positions']:
            t = pos[0]; x, y = [int(v) for v in pos[1:].split(',')]
            if t == 'K': continue
            pr = pg.evaluate(f'() => {Q}({{ proj: [{x}, {y}] }}).proj')
            tap(pg, cdp, pr[0], pr[1])
            s2 = pg.evaluate(f'() => {Q}({{}})')
            if s2['sel'] != [x, y]: continue
            check('arena: tap selects ' + pos + ' through the 3D pick', True)
            shot(pg, 'arena_2_selected.png')
            for dx, dy in [(0, -1), (0, 1), (1, 0), (-1, 0), (1, -1), (-1, -1), (0, -2), (0, 2)]:
                pr2 = pg.evaluate(f'() => {Q}({{ proj: [{x + dx}, {y + dy}] }}).proj')
                tap(pg, cdp, pr2[0], pr2[1])
                s3 = pg.evaluate(f'() => {Q}({{}})')
                if (t + str(x + dx) + ',' + str(y + dy)) in s3['positions']:
                    moved = True; check(f'arena: tap moves {pos} -> {x + dx},{y + dy}', True); break
                tap(pg, cdp, pr[0], pr[1])
            break
        check('arena: a piece moved by taps', moved)
        pg.wait_for_timeout(800); shot(pg, 'arena_3_moved.png')
    if args.only in ('', 'tt'):
        pg.goto(f'http://127.0.0.1:{PORT}/index.html#/play/xvlHij1tgk8', timeout=180000, wait_until='domcontentloaded')
        pg.wait_for_function('() => CM.gameUI && CM.gameUI.controller && CM.gameUI.controller.mod && CM.gameUI.controller.mod.qa', timeout=150000)
        tap_to_start(pg, 60000)
        pg.wait_for_function(f'() => {Q}({{}}).three', timeout=150000)
        check('tt: 3D view attached', True)
        pg.wait_for_timeout(2500); shot(pg, 'tt_0_start.png')
        st = pg.evaluate(f'() => {Q}({{}})')
        u = st['units'][0]
        pr = pg.evaluate(f'() => {Q}({{ proj: [{u["x"]}, {u["y"]}, 1] }}).proj')
        tap(pg, cdp, pr[0], pr[1]); s2 = pg.evaluate(f'() => {Q}({{}})')
        check('tt: tap on a unit body selects it', s2['sel'] == u['id'], [u, s2['sel']])
        tgt = [u['x'] - 55, u['y']]
        pr2 = pg.evaluate(f'() => {Q}({{ proj: [{tgt[0]}, {tgt[1]}, 0] }}).proj')
        tap(pg, cdp, pr2[0], pr2[1]); pg.wait_for_timeout(1200)
        s3 = pg.evaluate(f'() => {Q}({{}})'); u2 = [v for v in s3['units'] if v['id'] == u['id']][0]
        check('tt: tap on the ground moves it there', abs(u2['y'] - tgt[1]) < 20 and abs(u2['x'] - tgt[0]) < 20, [u2, tgt])
        shot(pg, 'tt_1_moved.png')
    b.close()
check('0 console errors', not errs, errs[:5])
print('RESULT', 'PASS' if not FAILS else 'FAIL ' + ', '.join(FAILS))
print('shots in', args.out)
