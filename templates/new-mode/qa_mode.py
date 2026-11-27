"""QA for TODO mode name (TODO_videoId) at phone sizes, touch. Copy to tools/qa_<short>.py and fill the TODOs.
Opens #/play/<id>, checks the opponent and board match the video, plays real taps for a few rounds, checks the
mode's own rule after every round (TODO), takes screenshots, and fails on any console error.
  python3 tools/qa_TODO.py [--out /tmp/qa_TODO] [--rounds 6] [--sizes 390x844,360x780] [--port 8870]"""
import os, json, time, threading, http.server, socketserver, functools, argparse, re, random
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODE = 'TODO_videoId'
ap = argparse.ArgumentParser(); ap.add_argument('--out', default='/tmp/qa_' + MODE); ap.add_argument('--rounds', type=int, default=6)
ap.add_argument('--sizes', default='390x844,360x780'); ap.add_argument('--port', type=int, default=8870)
args = ap.parse_args(); os.makedirs(args.out, exist_ok=True)
NOISE = re.compile(r'407|ERR_TUNNEL|ERR_FAILED|net::|unpkg|jsdelivr|Failed to load resource|youtube|ytimg', re.I)
TAPSTART = "() => { const t = document.querySelector('.tapstart'); if (t) { t.click(); return 'tap'; } if (!(CM.loader && CM.loader.isVisible && CM.loader.isVisible()) && !(CM.gameUI && CM.gameUI.waitingStart)) return 'none'; return false; }"
SNAP = r'''() => { const g = CM.gameUI.controller, st = g.state;
  return { b: st.b.map(p => p ? [p.t, p.c] : null), turn: st.turn, human: g.human, over: g.over || null, busy: !!g.busy,
    sw: document.documentElement.scrollWidth }; }'''
from playwright.sync_api import sync_playwright
def serve():
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a, **k): pass
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(('127.0.0.1', args.port), functools.partial(Q, directory=ROOT)) as s: s.serve_forever()
threading.Thread(target=serve, daemon=True).start(); time.sleep(0.4)
base = f'http://127.0.0.1:{args.port}/index.html'
fails, log = [], []

def check_round(size, rnd, before, after):
    """TODO the mode's own rule, e.g. 'the monster moved at most one square'. Append to fails on a mismatch."""
    return

with sync_playwright() as p:
    b = p.chromium.launch(args=['--disable-gpu'])
    for size in args.sizes.split(','):
        w, h = map(int, size.split('x'))
        ctx = b.new_context(viewport={'width': w, 'height': h}, device_scale_factor=2.6, has_touch=True, is_mobile=True)
        ctx.route(re.compile(r'https?://(?!127\.0\.0\.1).*'), lambda r: r.abort())
        pg = ctx.new_page(); errs = []
        pg.on('console', lambda m: m.type == 'error' and not NOISE.search(m.text) and errs.append(m.text[:200]))
        pg.on('pageerror', lambda e: errs.append('pageerror: ' + str(e)[:200]))
        pg.goto(base + '#/play/' + MODE, timeout=20000)
        pg.wait_for_function('window.CM && CM.gameUI && CM.gameUI.controller && CM.gameUI.controller.state', timeout=30000)
        try: pg.wait_for_function(TAPSTART, timeout=30000)
        except Exception: pass
        pg.wait_for_timeout(1200)
        # TODO video facts: opponent name/avatar, board size, start squares of special pieces
        info = pg.evaluate("() => ({ imgs: [...document.querySelectorAll('img')].map(i => i.getAttribute('src') || '') })")
        pg.screenshot(path=os.path.join(args.out, f'{size}_start.png'))
        box = pg.query_selector('.board').bounding_box()
        files = pg.evaluate('CM.gameUI.controller.V.geo.files'); ranks = pg.evaluate('CM.gameUI.controller.V.geo.ranks')
        def tap(i):
            name = pg.evaluate(f'CM.gameUI.controller.V.geo.name({i})'); flip = pg.evaluate('CM.gameUI.controller.flipped()')
            fc = ord(name[0]) - 97; rn = int(name[1:])
            x = box['x'] + (fc + 0.5) * box['width'] / files; y = box['y'] + (ranks - rn + 0.5) * box['height'] / ranks
            if flip: x = box['x'] + box['width'] - (x - box['x']); y = box['y'] + box['height'] - (y - box['y'])
            pg.touchscreen.tap(x, y); pg.wait_for_timeout(180)
        random.seed(1)
        for rnd in range(args.rounds):
            st = pg.evaluate(SNAP)
            if st['over']: break
            mv = pg.evaluate("(() => CM.gameUI.controller.moves.filter(m => !m.promo || m.promo === 'Q').map(m => [m.f, m.t]))()")
            if not mv: break
            f, t = random.choice(mv); tap(f); tap(t)
            try: pg.wait_for_function("(() => { const g = CM.gameUI.controller; return g.over || (g.state.turn === g.human && !g.busy); })()", timeout=40000)
            except Exception: fails.append(f'{size} round {rnd}: bot did not answer'); break
            pg.wait_for_timeout(800)   # TODO the mode's own animation time
            a = pg.evaluate(SNAP)
            if a['sw'] > w: fails.append(f'{size} round {rnd}: page {a["sw"]} px wide')
            check_round(size, rnd, st, a); log.append((size, rnd, a['over']))
        pg.screenshot(path=os.path.join(args.out, f'{size}_end.png'))
        if errs: fails.append(f'{size} console: ' + ' | '.join(errs[:5]))
        ctx.close()
    b.close()
json.dump({'log': log, 'fails': fails}, open(os.path.join(args.out, 'qa.json'), 'w'), indent=1, default=str)
print('FAILS' if fails else 'PASS', fails)
