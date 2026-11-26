#!/usr/bin/env python3
"""QA for the 3D FPS Chess duel (js/modes/fps3d/duel.js): plays real captures end to end in headless Chromium
(SwiftShader WebGL) at 390x844 touch (PszkLYudcws, CDP touch: joystick, look-drag, held FIRE) and 1366x900 desktop
(Nz2A-g73_iM, WASD + mouse), wins one duel and loses one, and checks the board result and 0 console errors.
  python3 tools/qa_fps3d.py [--out DIR] [--port 8796]
Aiming uses CM.fps3d.dbgAim() (the bot cannot see the screen); every shot still goes through the real input path."""
import sys, os, json, time, threading, http.server, socketserver, functools, argparse, tempfile
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ap = argparse.ArgumentParser()
ap.add_argument('--out', default=os.path.join(tempfile.gettempdir(), 'qa_fps3d'))
ap.add_argument('--port', type=int, default=8796)
ap.add_argument('--only', default='')
args = ap.parse_args()
os.makedirs(args.out, exist_ok=True)

def serve():
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a, **k): pass
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(('127.0.0.1', args.port), functools.partial(Q, directory=ROOT)) as s: s.serve_forever()
threading.Thread(target=serve, daemon=True).start(); time.sleep(0.4)
BASE = f'http://127.0.0.1:{args.port}/index.html'
IGNORE = ('i.ytimg.com', 'unpkg', 'ERR_NAME_NOT_RESOLVED', 'ERR_TUNNEL', 'ERR_PROXY', 'ERR_CONNECTION', 'ERR_ABORTED', '407 (Proxy')
res = {'checks': {}, 'errors': [], 'missing': [], 'warnings': []}
def check(name, ok, info=None):
    res['checks'][name] = {'ok': bool(ok), **({'info': info} if info is not None else {})}
    print(('ok   ' if ok else 'FAIL ') + name + ('' if info is None else '  ' + json.dumps(info)[:400]), flush=True)

SETUP = """([sq, foe]) => { const G = CM.gameUI.controller; G.ctx.set(sq, G.V.piece(foe, 'b')); G.moves = G.V.legal(G.state); G.render(); return G.moves.filter(m => m.cap).map(m => G.V.geo.name(m.f) + G.V.geo.name(m.t)); }"""
def hook(pg):
    def on_console(m):
        if m.type == 'warning' and 'fps3d' in m.text: res['warnings'].append(m.text[:200])
        if m.type != 'error' or any(s in m.text for s in IGNORE): return
        loc = (m.location or {}).get('url') or ''
        if loc and urlparse(loc).hostname not in ('127.0.0.1', None): return
        res['errors'].append(m.text[:300])
    pg.on('console', on_console)
    pg.on('pageerror', lambda e: res['errors'].append('pageerror: ' + str(e)[:300]))
    pg.on('response', lambda r: (urlparse(r.url).hostname == '127.0.0.1' and r.status >= 400) and res['missing'].append(f'{r.status} {urlparse(r.url).path}'))

def open_mode(pg, mid):
    pg.goto(BASE + '#/play/' + mid); pg.wait_for_function('() => CM.gameUI && CM.gameUI.controller && CM.gameUI.controller.moves && CM.gameUI.controller.moves.length > 0', timeout=30000)
    pg.wait_for_timeout(2500)   # view3d attaches; intro overlay passes

def start_duel(pg, tag, frm='e2', to='d3', foe='P'):
    caps = pg.evaluate(SETUP, [to, foe])
    check(f'{tag}: capture available {frm}{to}', f'{frm}{to}' in caps, caps)
    pg.evaluate(f"() => {{ const G = CM.gameUI.controller; G.tryMove(G.V.geo.parse('{frm}'), G.V.geo.parse('{to}')); }}")
    pg.wait_for_function('() => document.querySelector(".f3d") && CM.fps3d && CM.fps3d.dbg()', timeout=20000)
    pg.wait_for_timeout(500); pg.screenshot(path=f'{args.out}/{tag}_1_intro.png')
    pg.wait_for_function('() => CM.fps3d.dbg() && CM.fps3d.dbg().phase === "fight"', timeout=15000)
    d = pg.evaluate('CM.fps3d.dbg()'); check(f'{tag}: duel live (3D)', d and d['phase'] == 'fight', d)
    return d

def board_at(pg, sq):
    return pg.evaluate(f"() => {{ const p = CM.gameUI.controller.state.b[CM.gameUI.controller.V.geo.parse('{sq}')]; return p ? {{t: p.t, c: p.c, hp: p.hp}} : null; }}")

def phone(p):
    b = p.chromium.launch(args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'])
    ctx = b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True)
    pg = ctx.new_page(); hook(pg); cdp = ctx.new_cdp_session(pg)
    def touch(kind, pts): cdp.send('Input.dispatchTouchEvent', {'type': kind, 'touchPoints': [{'x': x, 'y': y, 'id': i} for (i, x, y) in pts]})
    open_mode(pg, 'PszkLYudcws')
    d0 = start_duel(pg, 'phone')
    check('phone: touch controls on', d0['touch'] is True)
    vis = pg.evaluate('() => [...document.querySelectorAll(".f3d__btn")].map(b => { const r = b.getBoundingClientRect(); return [b.dataset.a, Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)]; })')
    check('phone: 6 buttons inside the screen', len(vis) == 6 and all(v[1] >= 0 and v[2] >= 0 and v[3] <= 390 and v[4] <= 844 for v in vis), vis)
    pg.screenshot(path=f'{args.out}/phone_2_fight.png')
    # joystick: hold up for 1.2 s, the player should move
    touch('touchStart', [(0, 90, 700)]); 
    for k in range(12): touch('touchMove', [(0, 90, 700 - 5 * (k + 1))]); pg.wait_for_timeout(100)
    pg.screenshot(path=f'{args.out}/phone_3_joystick.png')
    touch('touchEnd', [])
    d1 = pg.evaluate('CM.fps3d.dbg()'); moved = ((d1['me']['x'] - d0['me']['x']) ** 2 + (d1['me']['z'] - d0['me']['z']) ** 2) ** .5
    check('phone: joystick moves the player', moved > 1.0, round(moved, 2))
    # look-drag on the right half
    y0 = d1['me']['yaw']; touch('touchStart', [(1, 250, 400)])
    for k in range(6): touch('touchMove', [(1, 250 + 10 * (k + 1), 400)]); pg.wait_for_timeout(40)
    touch('touchEnd', []); y1 = pg.evaluate('CM.fps3d.dbg().me.yaw')
    check('phone: look-drag turns the view', abs(y1 - y0) > .2, round(y1 - y0, 3))
    # fire: hold the FIRE button (aim with dbgAim) until the duel resolves
    fb = pg.evaluate('() => { const r = document.querySelector(".f3d__btn--fire").getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }')
    shots = 0; t0 = time.time(); won = None
    pg.evaluate('CM.fps3d.dbgAim()'); touch('touchStart', [(2, fb[0], fb[1])])
    while time.time() - t0 < 60:
        d = pg.evaluate('CM.fps3d.dbg()')
        if not d or d['phase'] in ('end', 'dead'): won = d and d['phase'] == 'end'; break
        pg.evaluate('CM.fps3d.dbgAim()'); touch('touchMove', [(2, fb[0] + (shots % 2), fb[1])]); shots += 1
        if shots == 8: pg.screenshot(path=f'{args.out}/phone_4_firing.png')
        pg.wait_for_timeout(120)
    touch('touchEnd', [])
    pg.wait_for_timeout(300); pg.screenshot(path=f'{args.out}/phone_5_result.png')
    check('phone: duel resolved by fire', won is not None, {'won': won, 'secs': round(time.time() - t0, 1)})
    pg.wait_for_function('() => !document.querySelector(".f3d")', timeout=8000)
    p_d3 = board_at(pg, 'd3'); p_e2 = board_at(pg, 'e2')
    if won: check('phone: winner took the square (white pawn on d3, hp kept)', p_d3 and p_d3['c'] == 'w' and p_e2 is None and p_d3['hp'] is not None, p_d3)
    else: check('phone: defender held (black pawn on d3)', p_d3 and p_d3['c'] == 'b', p_d3)
    pg.wait_for_timeout(1500); pg.screenshot(path=f'{args.out}/phone_6_board.png')
    check('phone: viewport meta restored', 'user-scalable=no' not in pg.evaluate('document.querySelector("meta[name=viewport]").content'))
    b.close()

def desktop(p):
    b = p.chromium.launch(args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'])
    ctx = b.new_context(viewport={'width': 1366, 'height': 900})
    pg = ctx.new_page(); hook(pg)
    open_mode(pg, 'Nz2A-g73_iM')
    d0 = start_duel(pg, 'desk', 'e2', 'f3', 'N')
    check('desk: mouse/keyboard mode', d0['touch'] is False)
    pg.mouse.move(683, 450); pg.mouse.click(683, 450); pg.wait_for_timeout(200)
    pg.keyboard.down('w'); pg.wait_for_timeout(900); pg.keyboard.up('w')
    pg.keyboard.down('d'); pg.wait_for_timeout(500); pg.keyboard.up('d')
    d1 = pg.evaluate('CM.fps3d.dbg()'); moved = ((d1['me']['x'] - d0['me']['x']) ** 2 + (d1['me']['z'] - d0['me']['z']) ** 2) ** .5
    check('desk: WASD moves the player', moved > 1.0, round(moved, 2))
    pg.keyboard.press('Space'); pg.wait_for_timeout(150); jy = pg.evaluate('CM.fps3d.dbg().me.y')
    check('desk: Space jumps', jy > d1['me']['y'] + .2, round(jy, 2))
    pg.keyboard.down('q'); pg.wait_for_timeout(100); blk = pg.evaluate('CM.fps3d.dbg().me.block'); pg.keyboard.up('q')
    check('desk: Q blocks', blk is True)
    pg.screenshot(path=f'{args.out}/desk_2_fight.png')
    # lose on purpose first? no: this duel we stand still and let the knight shoot us -> LOSS path
    t0 = time.time(); won = None
    while time.time() - t0 < 75:
        d = pg.evaluate('CM.fps3d.dbg()')
        if not d or d['phase'] in ('end', 'dead'): won = d and d['phase'] == 'end'; break
        pg.wait_for_timeout(300)
    pg.wait_for_timeout(300); pg.screenshot(path=f'{args.out}/desk_3_loss.png')
    check('desk: idle player loses (or times out) -> defender holds', won is False, {'won': won, 'secs': round(time.time() - t0, 1)})
    pg.wait_for_function('() => !document.querySelector(".f3d")', timeout=8000)
    f3 = board_at(pg, 'f3'); e2 = board_at(pg, 'e2')
    check('desk: attacker knocked out, knight holds f3', f3 and f3['c'] == 'b' and f3['t'] == 'N' and e2 is None, [f3, e2])
    # second duel: win it with mouse clicks (d2 pawn takes a pawn on c3; the bot's reply may differ, so set up again)
    pg.wait_for_function('() => { const G = CM.gameUI.controller; return G.state.turn === G.human && !G.busy; }', timeout=30000)
    caps = pg.evaluate(SETUP, ['c3', 'R'])
    if 'd2c3' in caps or 'b2c3' in caps:
        frm = 'd2' if 'd2c3' in caps else 'b2'
        pg.evaluate(f"() => {{ const G = CM.gameUI.controller; G.tryMove(G.V.geo.parse('{frm}'), G.V.geo.parse('c3')); }}")
        pg.wait_for_function('() => CM.fps3d.dbg() && CM.fps3d.dbg().phase === "fight"', timeout=20000)
        t0 = time.time(); won = None; n = 0
        while time.time() - t0 < 60:
            d = pg.evaluate('CM.fps3d.dbg()')
            if not d or d['phase'] in ('end', 'dead'): won = d and d['phase'] == 'end'; break
            pg.evaluate('CM.fps3d.dbgAim(true)'); pg.mouse.click(683, 450); n += 1
            if n == 6: pg.screenshot(path=f'{args.out}/desk_4_firing.png')
            pg.wait_for_timeout(330)
        check('desk: clicking fire resolves the duel', won is not None, {'won': won, 'clicks': n})
        pg.wait_for_function('() => !document.querySelector(".f3d")', timeout=8000)
        c3 = board_at(pg, 'c3'); check('desk: board matches the duel result', c3 and c3['c'] == ('w' if won else 'b'), c3)
    else: check('desk: second capture available', False, caps)
    b.close()

with sync_playwright() as p:
    if args.only in ('', 'phone'): phone(p)
    if args.only in ('', 'desk'): desktop(p)
check('no console errors', not res['errors'], res['errors'][:6])
check('no missing files', not res['missing'], res['missing'][:6])
check('3D used (no 2D fallback warning)', not res['warnings'], res['warnings'][:3])
print(json.dumps({k: v['ok'] for k, v in res['checks'].items()}))
sys.exit(0 if all(v['ok'] for v in res['checks'].values()) else 1)
