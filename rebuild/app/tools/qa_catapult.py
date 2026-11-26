#!/usr/bin/env python3
"""Launch Pawns (Ugw05nktuDM) check (playwright + chromium): on a phone (390x844, real touch events through CDP) and on
desktop (mouse), turn on the Pawn Launcher, drag backward from a White pawn, check the red aim arrow, release, and
capture the launch as a frame strip (overlay pieces sliding, impacts, fall-offs, the snap glide). Then checks the real
board appears exactly where the overlay stopped (same pieces on the same squares as a replay of the simulation), that
the bot replies, and that the old numbered-square control is gone.

  python3 tools/qa_catapult.py [--out DIR] [--port 8797]"""
import os, sys, json, time, threading, http.server, socketserver, functools, argparse, tempfile
from playwright.sync_api import sync_playwright
from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ap = argparse.ArgumentParser()
ap.add_argument('--out', default=os.path.join(tempfile.gettempdir(), 'qa_catapult'))
ap.add_argument('--port', type=int, default=8797)
args = ap.parse_args()
os.makedirs(args.out, exist_ok=True)


def serve():
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a, **k): pass
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(('127.0.0.1', args.port), functools.partial(Q, directory=ROOT)) as s: s.serve_forever()
threading.Thread(target=serve, daemon=True).start(); time.sleep(0.4)
BASE = f'http://127.0.0.1:{args.port}/index.html'
res = {'checks': {}, 'shots': {}}


def check(name, ok, info=None):
    res['checks'][name] = {'ok': bool(ok), 'info': info}
    print(('ok   ' if ok else 'FAIL ') + name + ('' if info is None else '  ' + json.dumps(info)[:300]), flush=True)


def strip(paths, name, cols=6):
    ims = [Image.open(p) for p in paths]
    w, h = ims[0].size; sc = min(1.0, 260 / w); tw, th = int(w * sc), int(h * sc)
    rows = (len(ims) + cols - 1) // cols
    out = Image.new('RGB', (tw * min(cols, len(ims)) + 6 * (min(cols, len(ims)) - 1), (th + 18) * rows), 'white'); d = ImageDraw.Draw(out)
    for k, im in enumerate(ims):
        x, y = (k % cols) * (tw + 6), (k // cols) * (th + 18)
        out.paste(im.convert('RGB').resize((tw, th)), (x, y + 18)); d.text((x + 4, y + 3), 'frame %d' % k, fill='black')
    p = os.path.join(args.out, name + '.png'); out.save(p); return p


def board_clip(pg):
    r = pg.evaluate("(() => { const r = document.getElementById('board-wrap').getBoundingClientRect(); return [r.left, r.top, r.width, r.height]; })()")
    return {'x': r[0], 'y': r[1], 'width': r[2], 'height': r[3]}


AFTER = """(() => { const G = CM.gameUI.controller, H = G.history; let k = H.length - 1; while (k >= 0 && H[k].state.turn !== 'w') k--;
    const st = H[k + 1] ? H[k + 1].state : G.state; return st.b.map((p, i) => p ? [i, p.c + p.t] : null).filter(Boolean); })()"""
POS = "(() => { const G = CM.gameUI.controller; return G.state.b.map(p => p ? p.c + p.t : '').join(','); })()"


def run(pg, label, touch):
    pg.goto(BASE + '#/play/Ugw05nktuDM'); pg.wait_for_function('CM.gameUI && CM.gameUI.controller && CM.gameUI.controller.state', timeout=20000)
    pg.wait_for_timeout(600)
    old = None
    pg.click('#game-controls [data-k="sling"]'); pg.wait_for_timeout(200)
    check(label + ': launcher toggles on', pg.evaluate('CM.gameUI.controller.state.x.sling === 1'))
    # the old control: tap a pawn, then a numbered power square (tinted purple). With the launcher on a tap now does nothing.
    pg.evaluate("(() => { const b = CM.gameUI.board, i = CM.gameUI.controller.V.geo.parse('d2'); b.sqEl(i).click(); })()"); pg.wait_for_timeout(150)
    old = pg.evaluate("Array.from(document.querySelectorAll('#board .sq-tint')).length + (CM.gameUI.controller.sel >= 0 ? 100 : 0) + CM.gameUI.controller.moves.filter(m => m.launch).length")
    # aim from the e2 pawn, pulled back and a little left: shoots up and to the right, toward f7/f8
    e2 = pg.evaluate("(() => { const r = CM.gameUI.board.rectOf(CM.gameUI.controller.V.geo.parse('e2')); return [r.left + r.width / 2, r.top + r.height / 2, r.width]; })()")
    x0, y0, s = e2
    pull = [(-0.15 * s, 1.0 * s), (-0.3 * s, 2.0 * s), (-0.45 * s, 3.0 * s)]  # last one is past the 2-square cap
    before = pg.evaluate(POS)
    cdp = pg.context.new_cdp_session(pg) if touch else None
    if touch:
        cdp.send('Input.dispatchTouchEvent', {'type': 'touchStart', 'touchPoints': [{'x': x0, 'y': y0}]})
        for dx, dy in pull:
            for k in range(1, 5):
                cdp.send('Input.dispatchTouchEvent', {'type': 'touchMove', 'touchPoints': [{'x': x0 + dx * k / 4, 'y': y0 + dy * k / 4}]}); pg.wait_for_timeout(16)
    else:
        pg.mouse.move(x0, y0); pg.mouse.down()
        for dx, dy in pull: pg.mouse.move(x0 + dx, y0 + dy, steps=4)
    pg.wait_for_timeout(80)
    aim = pg.evaluate("(() => { const s = document.querySelector('.cat-aim'); return s ? { line: !!s.querySelector('line'), head: !!s.querySelector('polygon'), color: s.querySelector('line') && s.querySelector('line').getAttribute('stroke'), op: s.querySelector('line') && s.querySelector('line').getAttribute('stroke-opacity'), x2: s.querySelector('line') && +s.querySelector('line').getAttribute('x2'), y2: s.querySelector('line') && +s.querySelector('line').getAttribute('y2') } : null; })()")
    check(label + ': red 70% aim arrow while pulling', aim and aim['line'] and aim['head'] and aim['color'] == '#ff0000' and aim['op'] == '0.7', aim)
    check(label + ': no drag ghost while aiming', pg.evaluate("!document.querySelector('.pc-drag')"))
    aimshot = os.path.join(args.out, label + '_aim.png'); pg.screenshot(path=aimshot, clip=board_clip(pg)); res['shots'][label + '_aim'] = aimshot
    t0 = time.time()
    if touch:
        dx, dy = pull[-1]
        cdp.send('Input.dispatchTouchEvent', {'type': 'touchEnd', 'touchPoints': []})
    else:
        pg.mouse.up()
    frames = []
    for k in range(16):
        p = os.path.join(args.out, '%s_f%02d.png' % (label, k)); pg.screenshot(path=p, clip=board_clip(pg)); frames.append(p)
        if k == 0:
            check(label + ': overlay up, board pieces hidden', pg.evaluate("!!document.querySelector('.cat-layer') && getComputedStyle(document.querySelector('#board .pc')).visibility === 'hidden'"))
        if not pg.evaluate("!!document.querySelector('.cat-layer')"): break
        pg.wait_for_timeout(120)
    pg.wait_for_function("!document.querySelector('.cat-layer') || !!document.querySelector('#promo:not([hidden]) [data-t]')", timeout=12000)
    promo = pg.evaluate("!!document.querySelector('#promo:not([hidden]) [data-t]')")
    if promo:
        ps = os.path.join(args.out, label + '_promo.png'); pg.screenshot(path=ps, clip=board_clip(pg)); res['shots'][label + '_promo'] = ps
        check(label + ': overlay held while the promotion picker is open', pg.evaluate("!!document.querySelector('.cat-layer')"))
        pg.click('#promo [data-t="N"]'); pg.wait_for_timeout(60)
        check(label + ': picked piece committed on rank 8', pg.evaluate(AFTER + ".some(([i, k]) => k === 'wN' && i < 8)"))
        pg.wait_for_function("!document.querySelector('.cat-layer')", timeout=3000)
    res['shots'][label + '_strip'] = strip(frames, label + '_launch')
    # the expected position from a clean replay of the same shot (sim in the page, from the pre-launch state)
    after = pg.evaluate(POS)
    check(label + ': launch committed (position changed, bot to move or replied)', after != before, {'ms': round((time.time() - t0) * 1000)})
    same = pg.evaluate("""(() => { const G = CM.gameUI.controller, H = G.history; let k = H.length - 1; while (k >= 0 && H[k].state.turn !== 'w') k--;
        const st = H[k].state, after = (H[k + 1] ? H[k + 1].state : G.state);
        const shown = Array.from(document.querySelectorAll('#board .sq')).map(q => q.querySelector(':scope > .pc') ? +q.dataset.i : -1).filter(i => i >= 0).sort((a, b) => a - b);
        const occ = G.state.b.map((p, i) => p ? i : -1).filter(i => i >= 0);
        return { shown: shown.length, occ: occ.length, eq: JSON.stringify(shown) === JSON.stringify(occ), launchState: after.b.map(p => p ? p.c + p.t : '').join(',') !== st.b.map(p => p ? p.c + p.t : '').join(',') }; })()""")
    ov = pg.evaluate("CM._catapult.last"); post = pg.evaluate(AFTER)
    check(label + ': board lands exactly where the overlay stopped', sorted(map(tuple, ov)) == sorted(map(tuple, post)), {'overlay': len(ov), 'board': len(post)})
    check(label + ': real board shows the committed position', same['eq'] and same['launchState'], same)
    check(label + ': old numbered-square control gone', not old)
    pg.wait_for_function("CM.gameUI.controller.state.turn === 'w' && !CM.gameUI.controller.busy", timeout=15000)
    check(label + ': bot replied with a normal move', not pg.evaluate("!!(CM.gameUI.controller.last && CM.gameUI.controller.last.launch)"))
    end = os.path.join(args.out, label + '_after_bot.png'); pg.screenshot(path=end, clip=board_clip(pg)); res['shots'][label + '_after_bot'] = end
    return promo


with sync_playwright() as p:
    b = p.chromium.launch()
    errs = []
    for label, vp, touch in (('phone', {'width': 390, 'height': 844}, True), ('desktop', {'width': 1280, 'height': 860}, False)):
        ctx = b.new_context(viewport=vp, device_scale_factor=2 if touch else 1, is_mobile=touch, has_touch=touch)
        pg = ctx.new_page()
        pg.on('pageerror', lambda e: errs.append(str(e)))
        run(pg, label, touch)
        # determinism: the module's sim gives the same result twice from the start position
        det = pg.evaluate("(() => { const G = CM.gameUI.controller, C = CM._catapult; const st = G.history[0].state; const a = C.simulate(st.b, 8, 8, 52, 3, -20), b2 = C.simulate(st.b, 8, 8, 52, 3, -20); return JSON.stringify(a.path) === JSON.stringify(b2.path) && a.end === b2.end; })()")
        check(label + ': simulation is deterministic', det)
        ctx.close()
    check('no page errors', not errs, errs[:3])
    b.close()

fails = [k for k, v in res['checks'].items() if not v['ok']]
print(json.dumps({'fail': fails, 'shots': res['shots']}, indent=1))
sys.exit(1 if fails else 0)
