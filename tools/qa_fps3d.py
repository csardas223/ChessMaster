#!/usr/bin/env python3
"""QA for the 3D FPS Chess duel (js/modes/fps3d/duel.js): plays real captures end to end in headless Chromium
(SwiftShader WebGL) at 390x844 touch (PszkLYudcws, CDP touch: joystick, look-drag, held FIRE) and 1366x900 desktop
(Nz2A-g73_iM, WASD + mouse), wins one duel and loses one, and checks the board result and 0 console errors.
  python3 tools/qa_fps3d.py [--out DIR] [--port 8796]
Aiming uses CM.fps3d.dbgAim() (the bot cannot see the screen); every shot still goes through the real input path."""
import sys, os, json, time, threading, http.server, socketserver, functools, argparse, tempfile
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright
def shot(pg, path):
    try: pg.screenshot(path=path, timeout=20000)
    except Exception as e: print('screenshot skipped', path, str(e)[:80])

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

def hud_check(pg, tag):
    h = pg.evaluate('''() => ({ tiles: [...document.querySelectorAll(".f3d__tile small")].map(s => s.textContent),
      banned: [".f3d__bar", ".f3d__ammo", ".f3d__map", ".f3d__clock", ".f3d__dmg", "[data-a=reload]"].filter(s => document.querySelector(s)),
      cross: !!document.querySelector(".f3d__x"), crack: !!document.querySelector(".f3d__crack") })''')
    check(f'{tag}: HUD = Left Shift + E tiles + crosshair + cracked glass only (no health bar/ammo/minimap/timer/reload)', h['tiles'] == ['Left Shift', 'E'] and not h['banned'] and h['cross'] and h['crack'], h)

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
    pg.goto(BASE + '#/play/' + mid); pg.wait_for_function('() => CM.gameUI && CM.gameUI.controller && CM.gameUI.controller.moves && CM.gameUI.controller.moves.length > 0', timeout=90000)
    pg.wait_for_timeout(2500)   # view3d attaches; intro overlay passes
    pg.evaluate("() => CM.util.loadScripts(['js/modes/fps3d/models.js', 'js/modes/fps3d/duel.js']).then(() => { CM.fps3d.maxPR = innerWidth > 1000 ? 0.3 : 0.5; })")   # SwiftShader is slow: render at half resolution

def start_duel(pg, tag, frm='e2', to='d3', foe='P'):
    caps = pg.evaluate(SETUP, [to, foe])
    check(f'{tag}: capture available {frm}{to}', f'{frm}{to}' in caps, caps)
    pg.evaluate(f"() => {{ const G = CM.gameUI.controller; G.tryMove(G.V.geo.parse('{frm}'), G.V.geo.parse('{to}')); }}")
    pg.wait_for_function('() => document.querySelector(".f3d") && CM.fps3d && CM.fps3d.dbg()', timeout=90000)
    pg.wait_for_timeout(500); shot(pg, f'{args.out}/{tag}_1_intro.png')
    pg.wait_for_function('() => CM.fps3d.dbg() && CM.fps3d.dbg().phase === "fight"', timeout=90000)
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
    pg.evaluate('() => { CM.fps3d.qaHold = true; }')   # freeze enemy fire while the control checks run (screenshots are slow on SwiftShader)
    vis = pg.evaluate('() => [...document.querySelectorAll(".f3d__btn, .f3d__tile")].map(b => { const r = b.getBoundingClientRect(); return [b.dataset.a, Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)]; })')
    check('phone: 5 controls (FIRE, JUMP, BLOCK, Left Shift + E tiles) inside the screen', len(vis) == 5 and all(v[1] >= 0 and v[2] >= 0 and v[3] <= 390 and v[4] <= 844 for v in vis), vis)
    hud_check(pg, 'phone')
    # the Left Shift tile (pawn: sprint) starts its cooldown and shows the seconds left
    tb = pg.evaluate('() => { const r = document.querySelector(".f3d__tile[data-a=sprint]").getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }')
    touch('touchStart', [(5, tb[0], tb[1])]); pg.wait_for_timeout(150); touch('touchEnd', [])
    try: pg.wait_for_function('() => document.querySelector(".f3d__tile[data-a=sprint] b").textContent !== ""', timeout=20000)
    except Exception: pass
    cd = pg.evaluate('() => { const t = document.querySelector(".f3d__tile[data-a=sprint]"); return [t.classList.contains("off"), t.querySelector("b").textContent]; }')
    check('phone: Left Shift tile -> cooldown number on the dimmed tile', cd[0] and cd[1].isdigit(), cd)
    shot(pg, f'{args.out}/phone_2_fight.png')
    # joystick: hold up for 1.2 s, the player should move
    touch('touchStart', [(0, 90, 700)]); 
    for k in range(12): touch('touchMove', [(0, 90, 700 - 5 * (k + 1))]); pg.wait_for_timeout(100)
    shot(pg, f'{args.out}/phone_3_joystick.png')
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
    pg.evaluate('() => { CM.fps3d.qaHold = false; }')
    pg.evaluate('CM.fps3d.dbgAim()'); touch('touchStart', [(2, fb[0], fb[1])])
    while time.time() - t0 < 60:
        d = pg.evaluate('CM.fps3d.dbg()')
        if not d or d['phase'] in ('end', 'dead'): won = d['phase'] == 'end' if d else (pg.evaluate('CM.fps3dLast || CM.fps3d.lastResult') or {}).get('won'); break
        pg.evaluate('CM.fps3d.dbgAim()'); touch('touchMove', [(2, fb[0] + (shots % 2), fb[1])]); shots += 1
        if shots == 8: shot(pg, f'{args.out}/phone_4_firing.png')
        pg.wait_for_timeout(120)
    touch('touchEnd', [])
    pg.wait_for_timeout(300); shot(pg, f'{args.out}/phone_5_result.png')
    check('phone: duel resolved by fire', won is not None, {'won': won, 'secs': round(time.time() - t0, 1)})
    pg.wait_for_function('() => !document.querySelector(".f3d")', timeout=8000)
    p_d3 = board_at(pg, 'd3'); p_e2 = board_at(pg, 'e2')
    if won: check('phone: winner took the square (white pawn on d3, hp kept)', p_d3 and p_d3['c'] == 'w' and p_e2 is None and p_d3['hp'] is not None, p_d3)
    else: check('phone: defender held (black pawn on d3)', p_d3 and p_d3['c'] == 'b', p_d3)
    pg.wait_for_timeout(1500); shot(pg, f'{args.out}/phone_6_board.png')
    vpc = pg.evaluate('document.querySelector("meta[name=viewport]").content')
    check('phone: viewport meta restored', 'user-scalable=no' not in vpc, vpc)
    b.close()

def desktop(p, part):
    b = p.chromium.launch(args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'])
    ctx = b.new_context(viewport={'width': 1366, 'height': 900})
    pg = ctx.new_page(); hook(pg)
    open_mode(pg, 'Nz2A-g73_iM')
    if part == 2: return desktop_win(pg, b)
    d0 = start_duel(pg, 'desk', 'e2', 'f3', 'N')
    check('desk: mouse/keyboard mode', d0['touch'] is False)
    pg.mouse.move(683, 450); pg.mouse.click(683, 450); pg.wait_for_timeout(200)
    pg.evaluate('() => { CM.fps3d.qaHold = true; }')   # freeze enemy fire during the control checks
    # SwiftShader at 1366x900 renders a few frames a second and dt is capped, so hold W for 1.2 s of GAME time, not wall time
    # walk along the open walkway ring of the board (statues of the position stand on the squares and block)
    pg.evaluate('CM.fps3d.dbgPut(-4.5 * 4.2, CM.fps3d.TY, -4.5 * 4.2, -Math.PI / 2)'); pg.wait_for_timeout(300); d0 = pg.evaluate('CM.fps3d.dbg()')
    c0 = pg.evaluate('CM.fps3d.dbg().clock'); pg.keyboard.down('w'); t0 = time.time()
    while time.time() - t0 < 40 and pg.evaluate('CM.fps3d.dbg().clock') - c0 < 1.2: pg.wait_for_timeout(250)
    pg.keyboard.up('w')
    d1 = pg.evaluate('CM.fps3d.dbg()'); moved = ((d1['me']['x'] - d0['me']['x']) ** 2 + (d1['me']['z'] - d0['me']['z']) ** 2) ** .5
    check('desk: WASD moves the player', moved > .8, round(moved, 2))
    pg.keyboard.press('Space'); ys = []; c0 = pg.evaluate('CM.fps3d.dbg().clock'); t0 = time.time()
    while time.time() - t0 < 30 and pg.evaluate('CM.fps3d.dbg().clock') - c0 < .8: ys.append(pg.evaluate('CM.fps3d.dbg().me.y')); pg.wait_for_timeout(60)
    check('desk: Space jumps', max(ys) > d1['me']['y'] + .15, round(max(ys), 2))
    pg.mouse.move(683, 450); pg.mouse.down(button='right'); pg.wait_for_timeout(150); blk = pg.evaluate('CM.fps3d.dbg().me.block'); pg.mouse.up(button='right'); pg.wait_for_timeout(150)
    check('desk: hold right click blocks', blk is True and pg.evaluate('CM.fps3d.dbg().me.block') is False, blk)
    hud_check(pg, 'desk')
    pg.keyboard.press('Shift'); pg.keyboard.press('e')
    try: pg.wait_for_function('() => [...document.querySelectorAll(".f3d__tile b")].every(b => b.textContent !== "")', timeout=20000)
    except Exception: pass
    cd = pg.evaluate('() => [...document.querySelectorAll(".f3d__tile")].map(t => [t.classList.contains("off"), t.querySelector("b").textContent])')
    check('desk: LShift + E start their cooldowns (numbers on the dimmed tiles)', all(c[0] and c[1].isdigit() for c in cd), cd)
    # jump off the board, then climb back up a table leg by holding Space against it
    TY = pg.evaluate('CM.fps3d.TY'); TX = pg.evaluate('CM.fps3d.TX'); TZ = pg.evaluate('CM.fps3d.TZ')
    pg.evaluate(f'CM.fps3d.dbgPut({TX - 1.3 + 1.15 + .5}, 0, {TZ - 1.3}, Math.PI / 2)')
    pg.keyboard.down('Space'); pg.keyboard.down('w'); c0 = pg.evaluate('CM.fps3d.dbg().clock'); t0 = time.time(); top = 0
    while time.time() - t0 < 60 and pg.evaluate('CM.fps3d.dbg().clock') - c0 < 4.5:
        top = max(top, pg.evaluate('CM.fps3d.dbg().me.y')); pg.wait_for_timeout(200)
    pg.keyboard.up('Space'); pg.keyboard.up('w'); pg.wait_for_timeout(400)
    d2 = pg.evaluate('CM.fps3d.dbg()'); shot(pg, f'{args.out}/desk_2b_climbed.png')
    check('desk: hold Space on a table leg climbs back onto the table', d2['me']['y'] >= TY - .1, {'y': round(d2['me']['y'], 2), 'max': round(top, 2), 'TY': TY})
    yaw0 = pg.evaluate('CM.fps3d.dbg().me.yaw'); pg.mouse.move(683, 450); pg.mouse.down(button='right'); pg.mouse.move(783, 450, steps=5); pg.mouse.up(button='right')
    check('desk: mouse look (drag fallback without pointer lock)', abs(pg.evaluate('CM.fps3d.dbg().me.yaw') - yaw0) > .2)
    shot(pg, f'{args.out}/desk_2_fight.png')
    pg.evaluate('() => { CM.fps3d.qaHold = false; }')
    # duel A: stand still and let the knight shoot -> LOSS, the attacker is knocked out
    t0 = time.time(); won = None
    while time.time() - t0 < 90:
        d = pg.evaluate('CM.fps3d.dbg()')
        if not d or d['phase'] in ('end', 'dead'): won = d['phase'] == 'end' if d else (pg.evaluate('CM.fps3dLast || CM.fps3d.lastResult') or {}).get('won'); break
        pg.wait_for_timeout(300)
    pg.wait_for_timeout(300); shot(pg, f'{args.out}/desk_3_loss.png')
    check('desk: idle player loses -> LOSS', won is False, {'won': won, 'secs': round(time.time() - t0, 1)})
    pg.wait_for_function('() => !CM.fps3d.dbg() || CM.fps3d.dbg().phase !== "dead"', timeout=90000)   # slow frames: the bot's next duel may already be open
    f3 = board_at(pg, 'f3'); e2 = board_at(pg, 'e2')
    knights = lambda: pg.evaluate("() => CM.gameUI.controller.state.b.filter(p => p && p.c === 'b' && p.t === 'N').length")
    check('desk: attacker knocked out, the knight survives (3 black knights, e2 empty)', knights() == 3 and e2 is None, [f3, e2, knights()])
    # duel B: the bot's knight attacks next; defend with mouse clicks and win
    try: pg.wait_for_function('() => CM.fps3d.dbg() && CM.fps3d.dbg().phase === "fight"', timeout=120000)
    except Exception: check('desk: bot attacks next (duel B)', False); b.close(); return
    nk = knights(); d = pg.evaluate('CM.fps3d.dbg()'); check('desk: bot attack opens a defend duel', d['foe']['t'] == 'N', [d['me']['t'], d['foe']['t']])
    # SwiftShader under load runs well below 1 game second per wall second, so the loop is bounded by a generous wall cap
    pg.evaluate('() => { CM.fps3d.lastResult = null; CM.fps3dLast = null; }')
    t0 = time.time(); won = None; n = 0; walking = False
    while time.time() - t0 < 420:
        d = pg.evaluate('CM.fps3d.dbg()')
        if not d or d['phase'] in ('end', 'dead'):
            won = d['phase'] == 'end' if d else (pg.evaluate('CM.fps3dLast || CM.fps3d.lastResult') or {}).get('won'); lr = pg.evaluate('CM.fps3dLast || CM.fps3d.lastResult'); break
        # the king swings a blade: keep walking at the knight (dbgAim turns toward it) and swing
        if d['me']['t'] == 'K' and not walking: pg.keyboard.down('w'); walking = True
        pg.evaluate('CM.fps3d.dbgAim()'); pg.mouse.click(683, 450); n += 1
        if n == 4: shot(pg, f'{args.out}/desk_4_firing.png')
        pg.wait_for_timeout(150)
    if walking: pg.keyboard.up('w')
    pg.wait_for_timeout(200); shot(pg, f'{args.out}/desk_5_result.png')
    lr = pg.evaluate('CM.fps3dLast || CM.fps3d.lastResult') or {}
    check('desk: fire / melee resolves the defend duel', won is not None, {'won': won, 'clicks': n, 'last': lr, 'secs': round(time.time() - t0, 1)})
    pg.wait_for_timeout(1500)
    if won: check('desk: attacker knocked out (one black knight fewer)', knights() == nk - 1, [nk, knights()])
    b.close()

def desktop_win(pg, b):
    d0 = start_duel(pg, 'desk2', 'e2', 'd3', 'P')
    # click registration under load: a quick click (down + up inside one slow frame) with the musket ready fires one shot, 3 times
    pg.evaluate('() => { CM.fps3d.qaHold = true; }'); pg.evaluate('CM.fps3d.dbgAim()')
    s0 = pg.evaluate('CM.fps3d.dbg().stat.shots'); t0 = time.time()
    for k in range(3):
        while time.time() - t0 < 60 and not pg.evaluate('CM.fps3d.dbg().me.ready'): pg.wait_for_timeout(150)
        pg.mouse.click(683, 450, delay=5); n0 = s0 + k + 1
        while time.time() - t0 < 60 and pg.evaluate('CM.fps3d.dbg().stat.shots') < n0: pg.wait_for_timeout(150)
    s1 = pg.evaluate('CM.fps3d.dbg().stat.shots')
    check('desk2: every quick click fires when the musket is ready (3 clicks -> 3 shots)', s1 - s0 == 3, {'shots': s1 - s0, 'secs': round(time.time() - t0, 1)})
    pg.evaluate('() => { CM.fps3d.qaHold = false; CM.fps3d.lastResult = null; CM.fps3dLast = null; }')
    t0 = time.time(); won = None; n = 0
    while time.time() - t0 < 420:
        d = pg.evaluate('CM.fps3d.dbg()')
        if not d or d['phase'] in ('end', 'dead'): won = d['phase'] == 'end' if d else (pg.evaluate('CM.fps3dLast || CM.fps3d.lastResult') or {}).get('won'); break
        pg.evaluate('CM.fps3d.dbgAim()'); pg.mouse.click(683, 450); n += 1
        if n == 3: shot(pg, f'{args.out}/desk2_firing.png')
        pg.wait_for_timeout(200)
    pg.wait_for_timeout(300); shot(pg, f'{args.out}/desk2_result.png')
    check('desk2: mouse fire resolves the duel', won is not None, {'won': won, 'clicks': n, 'stat': d and d.get('stat')})
    st = (d or {}).get('stat') or {}
    check('desk2: clicks reach the fire input (shots > 0)', won is not None and st.get('shots', 0) > 0, {'clicks': n, 'shots': st.get('shots')})
    pg.wait_for_function('() => !document.querySelector(".f3d") || (CM.fps3d.dbg() && CM.fps3d.dbg().phase === "intro")', timeout=240000)   # m3-fps: KILL CAM + result banner take minutes of wall time at load 20
    d3 = board_at(pg, 'd3'); check('desk2: board matches the result', d3 and d3['c'] == ('w' if won else 'b'), d3)
    b.close()

with sync_playwright() as p:
    if args.only in ('', 'phone'): phone(p)
    if args.only in ('', 'desk', 'desk1'): desktop(p, 1)
    if args.only in ('', 'desk', 'desk2'): desktop(p, 2)
check('no console errors', not res['errors'], res['errors'][:6])
check('no missing files', not res['missing'], res['missing'][:6])
check('3D used (no 2D fallback warning)', not res['warnings'], res['warnings'][:3])
print(json.dumps({k: v['ok'] for k, v in res['checks'].items()}))
sys.exit(0 if all(v['ok'] for v in res['checks'].values()) else 1)
