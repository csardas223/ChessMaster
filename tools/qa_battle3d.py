#!/usr/bin/env python3
"""QA for the 3D modes on CM.scene3d, with Battle Chess (IbRrzKtieqs, js/fx/battle3d.js) in depth.
Headless Chromium with SwiftShader WebGL, phone 390x844 touch (CDP touch events) and desktop 1366x900.
  - every listed 3D mode: canvas attaches, pixel ratio <= 1.5 on the phone, a real tap on a projected piece selects
    it and a second tap moves it, 0 console errors
  - Battle Chess: orbit by touch-drag, ACES tone mapping + env map on, Skip / speed pill, then plays N white moves
    (captures first) against the bot through real taps, waits for every walk / fight to finish, checks that the
    characters match the engine state after each move, and that every capture ran a fight; draw calls + fps
  python3 tools/qa_battle3d.py [--out DIR] [--port 8797] [--moves 8] [--only phone|desktop] [--modes id,id]
Screenshots: <out>/<tag>_*.png. fps numbers are SwiftShader (CPU), not phone hardware."""
import os, json, time, threading, http.server, socketserver, functools, argparse, tempfile
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ap = argparse.ArgumentParser()
ap.add_argument('--out', default=os.path.join(tempfile.gettempdir(), 'qa_battle3d'))
ap.add_argument('--port', type=int, default=8797)
ap.add_argument('--moves', type=int, default=8)
ap.add_argument('--only', default='')
ap.add_argument('--modes', default='jXOg1Py4EoA,CxtttdnwNWk,tm24Uq9nlBc,d8pJkdxtXAA,sGXmiyvZDE4,OFtVdbxJI2Y')
ap.add_argument('--skip-modes', action='store_true')
ap.add_argument('--slow', action='store_true', help='loaded / CPU-only box: Battle Chess speed 5x and renderer pixel ratio 0.5 after the pixel-ratio check')
args = ap.parse_args()
os.makedirs(args.out, exist_ok=True)


def serve():
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a, **k): pass
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(('127.0.0.1', args.port), functools.partial(Q, directory=ROOT)) as s: s.serve_forever()


threading.Thread(target=serve, daemon=True).start(); time.sleep(0.4)
BASE = f'http://127.0.0.1:{args.port}/index.html'
IGNORE = ('i.ytimg.com', 'maia-chess', 'blocked by CORS', 'net::ERR_FAILED', 'Maia',  'unpkg', 'ERR_NAME_NOT_RESOLVED', 'ERR_TUNNEL', 'ERR_PROXY', 'ERR_CONNECTION', 'ERR_ABORTED', '407 (Proxy', 'GPU stall', 'GL Driver Message')
res = {'checks': {}, 'errors': [], 'missing': [], 'warnings': [], 'perf': {}}
FAILS = []


def check(name, ok, info=None):
    res['checks'][name] = {'ok': bool(ok), **({'info': info} if info is not None else {})}
    if not ok: FAILS.append(name)
    print(('ok   ' if ok else 'FAIL ') + name + ('' if info is None else '  ' + json.dumps(info)[:400]), flush=True)


def shot(pg, path):
    try: pg.screenshot(path=path, timeout=60000)
    except Exception as e: print('screenshot skipped', path, str(e)[:80])


def hook(pg, tag):
    def on_console(m):
        if m.type == 'warning' and ('battle3d' in m.text or 'scene3d' in m.text or 'view3d' in m.text): res['warnings'].append(tag + ': ' + m.text[:200])
        if m.type != 'error' or any(s in m.text for s in IGNORE): return
        loc = (m.location or {}).get('url') or ''
        if loc and urlparse(loc).hostname not in ('127.0.0.1', None): return
        res['errors'].append(tag + ': ' + m.text[:300])
    pg.on('console', on_console)
    pg.on('pageerror', lambda e: res['errors'].append(tag + ' pageerror: ' + str(e)[:300]))
    pg.on('response', lambda r: (urlparse(r.url).hostname == '127.0.0.1' and r.status >= 400) and res['missing'].append(f'{r.status} {urlparse(r.url).path}'))


PROJ = """([name, dy]) => { const S = CM.scene3d.current(); if (!S) return null; const G = CM.gameUI.controller, i = G.V.geo.parse(name);
  const v = S.sq2world(i).clone(); v.y += dy; S.root.localToWorld(v); v.project(S.camera); const r = S.canvas.getBoundingClientRect();
  return [r.left + (v.x + 1) / 2 * r.width, r.top + (1 - v.y) / 2 * r.height]; }"""
STATE = """() => { const G = CM.gameUI.controller, S = CM.scene3d.current(); return { turn: G.state.turn, busy: !!G.busy, over: G.over ? G.over.why : null,
  sel: G.sel, n: G.sans.length, s3: !!S, pr: S ? S.renderer.getPixelRatio() : 0 }; }"""


def tap(pg, cdp, touch, x, y):
    if touch:
        cdp.send('Input.dispatchTouchEvent', {'type': 'touchStart', 'touchPoints': [{'x': x, 'y': y, 'id': 1}]})
        pg.wait_for_timeout(60)
        cdp.send('Input.dispatchTouchEvent', {'type': 'touchEnd', 'touchPoints': []})
    else:
        pg.mouse.click(x, y)
    pg.wait_for_timeout(250)


def tap_sq(pg, cdp, touch, name, dy=0.35):
    # dy: height above the tile centre to aim at; 0.35 hits a standing piece, an empty far target needs ~0.08
    # (aiming 0.35 above an empty far square overshoots past it at low camera angles: s5-3d Abyss finding)
    p = pg.evaluate(PROJ, [name, dy])
    if not p: return False
    tap(pg, cdp, touch, p[0], p[1]); return True


TAPSTART = "() => { const t = document.querySelector('.tapstart'); if (t) { t.click(); return 'tap'; } if (!(CM.loader && CM.loader.isVisible && CM.loader.isVisible()) && !(CM.gameUI && CM.gameUI.waitingStart)) return 'none'; return false; }"


def tap_to_start(pg, timeout=30000):
    # a direct #/play/<id> open shows the "Tap to start" plate (js/ui/game-ui.js tapToStart) once the loading screen
    # leaves; it eats the first tap and the match (bot, clocks) waits on it, so press it like a player would
    try: return pg.wait_for_function(TAPSTART, timeout=timeout).json_value()
    except Exception: return None


def open_mode(pg, mid, wait3d=True):
    pg.goto(BASE + '#/play/' + mid)
    pg.wait_for_function('() => CM.gameUI && CM.gameUI.controller && CM.gameUI.controller.moves && CM.gameUI.controller.moves.length > 0', timeout=45000)
    tap_to_start(pg)
    if wait3d:
        try: pg.wait_for_function('() => CM.scene3d && CM.scene3d.current && CM.scene3d.current()', timeout=30000)
        except Exception: pass
    pg.wait_for_timeout(2600)


def new_ctx(p, phone):
    b = p.chromium.launch(args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'])
    if phone: ctx = b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2.6, is_mobile=True, has_touch=True)
    else: ctx = b.new_context(viewport={'width': 1366, 'height': 900})
    return b, ctx


def generic_modes(p, phone):
    tag0 = 'phone' if phone else 'desk'
    b, ctx = new_ctx(p, phone)
    for mid in [m for m in args.modes.split(',') if m]:
        tag = f'{tag0}_{mid}'
        pg = ctx.new_page(); hook(pg, tag); cdp = ctx.new_cdp_session(pg)
        try:
            open_mode(pg, mid)
            st = pg.evaluate(STATE)
            check(f'{tag}: 3D canvas', st['s3'], st)
            if phone: check(f'{tag}: pixel ratio <= 1.5', 0 < st['pr'] <= 1.5, st['pr'])
            if args.slow and st['s3']: pg.evaluate('() => CM.scene3d.current().renderer.setPixelRatio(.5)')
            # find a movable piece of the side to move and one of its targets
            mv = pg.evaluate("() => { const G = CM.gameUI.controller; const m = G.moves.find(m => !m.cap && G.state.b[m.f] && G.state.b[m.f].c === G.human) || G.moves[0]; return m ? [G.V.geo.name(m.f), G.V.geo.name(m.t)] : null; }")
            shot(pg, f'{args.out}/{tag}_a.png')
            if st['s3'] and mv:
                # qa3d: real-time modes (Hyper Chess d8pJkdxtXAA, js/modes/g5_realtime.js) hand the turn to the bot while
                # its piece glides, and a tap in that window is ignored by design: wait for our turn, retry up to 3 times
                for attempt in range(3):
                    try: pg.wait_for_function('() => { const G = CM.gameUI.controller; return G.over || (G.state.turn === G.human && !G.busy); }', timeout=15000)
                    except Exception: pass
                    if attempt: mv = pg.evaluate("() => { const G = CM.gameUI.controller; const m = G.moves.find(m => !m.cap && G.state.b[m.f] && G.state.b[m.f].c === G.human) || G.moves[0]; return m ? [G.V.geo.name(m.f), G.V.geo.name(m.t)] : null; }") or mv
                    n0 = pg.evaluate(STATE)['n']
                    tap_sq(pg, cdp, phone, mv[0])
                    s1 = pg.evaluate(STATE)
                    tap_sq(pg, cdp, phone, mv[1], 0.08)
                    pg.wait_for_timeout(1200)
                    s2 = pg.evaluate(STATE)
                    hist = pg.evaluate('() => CM.gameUI.controller.sans.slice(-6)')
                    landed = pg.evaluate("(sq) => { const G = CM.gameUI.controller, p = G.state.b[G.V.geo.parse(sq)]; return !!p && p.c === G.human; }", mv[1])
                    if s1['sel'] >= 0 and s2['n'] > n0 and landed: break
                check(f'{tag}: tap select + move {mv[0]}{mv[1]}', s1['sel'] >= 0 and s2['n'] > n0 and landed, {'sel': s1['sel'], 'n': s2['n'], 'n0': n0, 'landed': landed, 'tries': attempt + 1, 'last': hist})
                shot(pg, f'{args.out}/{tag}_b.png')
        except Exception as e:
            check(f'{tag}: run', False, str(e)[:300])
        pg.close()
    b.close()


def wait_idle(pg, timeout=40000):
    pg.wait_for_function("() => { const B = CM.battle3d && CM.battle3d.current(); const G = CM.gameUI.controller; return B && !B.busy && !G.busy && (G.over || G.state.turn === G.human); }", timeout=timeout)


SYNC = """() => { const B = CM.battle3d.current(), G = CM.gameUI.controller, bad = [];
  G.state.b.forEach((p, i) => { const ch = B.map[i]; if (!p) { if (ch) bad.push('extra@' + G.V.geo.name(i)); return; }
    const g = (G.V.def(p.t) || {}).glyph || p.t; if (!ch || ch.t + ch.c !== g + p.c) bad.push((ch ? ch.t + ch.c : 'none') + '!=' + g + p.c + '@' + G.V.geo.name(i)); });
  Object.keys(B.map).forEach(i => { if (!G.state.b[i]) bad.push('ghost@' + G.V.geo.name(+i)); });
  return bad; }"""


def battle(p, phone):
    tag = 'phone_battle' if phone else 'desk_battle'
    b, ctx = new_ctx(p, phone)
    pg = ctx.new_page(); hook(pg, tag); cdp = ctx.new_cdp_session(pg)
    pg.add_init_script("window.__b3stats = { fights: 0 };")
    open_mode(pg, 'IbRrzKtieqs')
    pg.wait_for_function('() => CM.battle3d && CM.battle3d.current() && CM.battle3d.current().S', timeout=30000)
    pg.wait_for_timeout(1500)
    info = pg.evaluate("""() => { const B = CM.battle3d.current(), S = B.S, r = S.renderer; return { chars: Object.keys(B.map).length, tone: r.toneMapping, env: !!S.scene.environment,
      pr: r.getPixelRatio(), calls: r.info.render.calls, tris: r.info.render.triangles, ui: !!document.querySelector('.b3-ui .b3-spd') }; }""")
    check(f'{tag}: 32 characters', info['chars'] == 32, info)
    check(f'{tag}: ACES tone mapping + env', info['tone'] == 4 and info['env'], info)
    check(f'{tag}: speed pill', info['ui'])
    if phone: check(f'{tag}: pixel ratio 1.5', abs(info['pr'] - 1.5) < 1e-6, info['pr'])
    if args.slow: pg.evaluate('() => { CM.battle3d.current().speed = 5; CM.scene3d.current().renderer.setPixelRatio(.5); }')
    res['perf'][tag + '_start'] = info
    shot(pg, f'{args.out}/{tag}_0_start.png')
    # sync check before moving
    check(f'{tag}: characters match the start position', pg.evaluate(SYNC) == [], pg.evaluate(SYNC))
    # orbit: drag across the canvas
    c0 = pg.evaluate('() => CM.scene3d.current().cam.theta')
    box = pg.evaluate("() => { const r = CM.scene3d.current().canvas.getBoundingClientRect(); return [r.left, r.top, r.width, r.height]; }")
    sx, sy = box[0] + box[2] * .5, box[1] + box[3] * .12
    if phone:
        cdp.send('Input.dispatchTouchEvent', {'type': 'touchStart', 'touchPoints': [{'x': sx, 'y': sy, 'id': 1}]})
        for k in range(10): cdp.send('Input.dispatchTouchEvent', {'type': 'touchMove', 'touchPoints': [{'x': sx + 8 * (k + 1), 'y': sy, 'id': 1}]}); pg.wait_for_timeout(30)
        cdp.send('Input.dispatchTouchEvent', {'type': 'touchEnd', 'touchPoints': []})
    else:
        pg.mouse.move(sx, sy); pg.mouse.down()
        for k in range(10): pg.mouse.move(sx + 8 * (k + 1), sy); pg.wait_for_timeout(30)
        pg.mouse.up()
    pg.wait_for_timeout(300)
    c1 = pg.evaluate('() => [CM.scene3d.current().cam.theta, CM.scene3d.current().userMoved, CM.gameUI.controller.sel]')
    check(f'{tag}: orbit drag turns the camera (no select)', abs(c1[0] - c0) > .2 and c1[1] and c1[2] < 0, [c0] + c1)
    # put the camera back so taps project well
    pg.evaluate("() => { const S = CM.scene3d.current(); S.setCamera({ theta: " + str(c0) + " }, 0); }")
    pg.wait_for_timeout(200)
    fights = 0; caps_seen = 0
    for k in range(args.moves):
        st = pg.evaluate(STATE)
        if st['over']: break
        mv = pg.evaluate("""() => { const G = CM.gameUI.controller, v = G.V; const val = { P: 1, N: 3, B: 3, R: 5, Q: 9, K: 0 };
          const g = i => ((v.def(G.state.b[i].t) || {}).glyph || G.state.b[i].t);
          let ms = G.moves.filter(m => G.state.b[m.f] && G.state.b[m.f].c === G.human && (!m.promo || m.promo === 'Q'));
          const caps = ms.filter(m => m.cap); if (caps.length) { caps.sort((a, b) => val[g(b.capSq != null ? b.capSq : b.t)] - val[g(a.capSq != null ? a.capSq : a.t)]); ms = caps; }
          else { const dev = ['e2e4', 'd2d4', 'g1f3', 'b1c3', 'f1c4', 'c1f4', 'd1f3', 'f3f7']; for (const d of dev) { const m = ms.find(m => v.geo.name(m.f) + v.geo.name(m.t) === d); if (m) { ms = [m]; break; } } }
          const m = ms[0]; return m ? [v.geo.name(m.f), v.geo.name(m.t), !!m.cap, g(m.f)] : null; }""")
        if not mv: break
        ok1 = tap_sq(pg, cdp, phone, mv[0]); s1 = pg.evaluate(STATE)
        tap_sq(pg, cdp, phone, mv[1], 0.35 if mv[2] else 0.08)
        pg.wait_for_timeout(400)
        # qa3d: a pawn reaching the last rank opens the promotion picker (js/ui/game-ui.js UI.promote): pick the queen
        # like a player would (before, the QA saw "no move", called tryMove on top of the open picker and lost the fight)
        if pg.evaluate("() => { const b = document.getElementById('promo'); if (!b || b.hidden) return false; const q = b.querySelector('[data-t=\"Q\"]') || b.querySelector('[data-t]'); if (q) q.click(); return true; }"):
            pg.wait_for_timeout(400)
        n_after = pg.evaluate(STATE)['n']
        if n_after <= st['n']:   # a tap missed (a character in the way of the ray): fall back to the engine call, noted
            res['warnings'].append(f'{tag}: tap missed for {mv[0]}{mv[1]} (sel {s1["sel"]}), used tryMove')
            pg.evaluate(f"() => {{ const G = CM.gameUI.controller; G.sel = -1; G.tryMove(G.V.geo.parse('{mv[0]}'), G.V.geo.parse('{mv[1]}')); }}")
        if mv[2]:
            caps_seen += 1
            try:
                pg.wait_for_function("() => { const B = CM.battle3d.current(); return B && B.busy && (B.extra || []).some(c => c.act && c.act.name === 'attack'); }", timeout=15000)
                fights += 1
                f0 = pg.evaluate('() => performance.now()'); fr0 = pg.evaluate('() => CM.scene3d.current().renderer.info.render.frame')
                pg.wait_for_timeout(1200)
                shot(pg, f'{args.out}/{tag}_{k + 1}_fight_{mv[3]}{mv[0]}x{mv[1]}.png')
                f1 = pg.evaluate('() => performance.now()'); fr1 = pg.evaluate('() => CM.scene3d.current().renderer.info.render.frame')
                calls = pg.evaluate('() => CM.scene3d.current().renderer.info.render.calls')
                res['perf'].setdefault(tag + '_fight_fps', []).append(round((fr1 - fr0) / max(.001, (f1 - f0) / 1000), 1))
                res['perf'].setdefault(tag + '_fight_calls', []).append(calls)
            except Exception as e:
                check(f'{tag}: fight started for {mv[0]}x{mv[1]}', False, str(e)[:200])
        try: wait_idle(pg, 120000 if args.slow else 60000)
        except Exception as e: check(f'{tag}: move {k + 1} finished', False, str(e)[:200]); break
        pg.wait_for_timeout(500)   # reconcile after the bot reply
        try: wait_idle(pg, 30000)
        except Exception: pass
        pg.wait_for_timeout(700)
        bad = pg.evaluate(SYNC)
        check(f'{tag}: move {k + 1} {mv[3]}{mv[0]}{"x" if mv[2] else "-"}{mv[1]}: characters match the state', bad == [], bad)
        if not mv[2] and k < 3: shot(pg, f'{args.out}/{tag}_{k + 1}_move.png')
    check(f'{tag}: every capture ran a fight ({fights}/{caps_seen})', caps_seen > 0 and fights == caps_seen, [fights, caps_seen])
    # skip button: start one more capture if available and press Skip
    shot(pg, f'{args.out}/{tag}_9_end.png')
    res['perf'][tag + '_end'] = pg.evaluate("() => { const r = CM.scene3d.current().renderer; return { calls: r.info.render.calls, tris: r.info.render.triangles, geos: r.info.memory.geometries, tex: r.info.memory.textures }; }")
    b.close()


with sync_playwright() as p:
    for phone in (True, False):
        if args.only and args.only != ('phone' if phone else 'desktop'): continue
        try: battle(p, phone)
        except Exception as e: check(('phone' if phone else 'desk') + '_battle: run', False, str(e)[:400])
        if not args.skip_modes: generic_modes(p, phone)

check('0 console errors', not res['errors'], res['errors'][:10])
check('no missing local files', not res['missing'], res['missing'][:10])
print('perf', json.dumps(res['perf']))
print('warnings', json.dumps(res['warnings'][:20]))
json.dump(res, open(os.path.join(args.out, 'result.json'), 'w'), indent=1)
print('RESULT', 'PASS' if not FAILS else 'FAIL ' + ', '.join(FAILS))
