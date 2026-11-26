#!/usr/bin/env python3
"""loader-v3 QA (owner 2026-11-26 12:27 PM ET): the mode loading screen + lobby thumbnail pawn.
For each width (default 390 and 360, phone touch): open the lobby, check the thumbnail placeholder pawn spins
(.pawnspin running a rotateY animation), open a few modes from the lobby and measure how long #mode-loader stays,
check that when it fades every <img> in the game view is loaded (no pop-in), the spinning pawn sits centred on the
board skeleton, reduced motion gives the slow 8 s turn, and 0 console errors / 0 local 4xx.

  python3 tools/qa_loader.py [--widths 390,360] [--ids a,b,c] [--out DIR] [--port 8796]
Prints a JSON report; exits 1 on any failure."""
import sys, os, json, time, threading, http.server, socketserver, functools, argparse, tempfile
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ap = argparse.ArgumentParser()
ap.add_argument('--widths', default='390,360')
ap.add_argument('--ids', default='HuZlhHnES7M,Kzt9ItpGtYg,LK1gJhFKgwU,2i9QlDwuZZ4')
ap.add_argument('--out', default=os.path.join(tempfile.gettempdir(), 'qa_loader'))
ap.add_argument('--port', type=int, default=8796)
args = ap.parse_args()
os.makedirs(args.out, exist_ok=True)


def serve():
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a, **k): pass
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(('127.0.0.1', args.port), functools.partial(Q, directory=ROOT)) as s: s.serve_forever()
threading.Thread(target=serve, daemon=True).start(); time.sleep(0.4)
BASE = f'http://127.0.0.1:{args.port}/index.html'
IGNORE = ('i.ytimg.com', 'unpkg', 'jsdelivr', 'ERR_NAME_NOT_RESOLVED', 'ERR_TUNNEL', 'ERR_PROXY', 'ERR_CONNECTION', 'ERR_ABORTED', '407', 'net::ERR_FAILED')  # ERR_FAILED = this script's own aborted thumbnails
res = {'checks': {}, 'errors': [], 'missing': [], 'timings': {}}
def check(name, ok, info=None):
    res['checks'][name] = {'ok': bool(ok), **({'info': info} if info is not None else {})}
    print(('ok   ' if ok else 'FAIL ') + name + ('' if info is None else '  ' + json.dumps(info)[:300]), flush=True)

SPIN_JS = """sel => { const e = document.querySelector(sel); if (!e) return null; const a = e.getAnimations()[0];
  const cs = getComputedStyle(e); return { name: cs.animationName, dur: cs.animationDuration, running: !!a && a.playState === 'running', tf: cs.transform }; }"""
WATCH_JS = """id => { window._lw = null; const r = v => { window._lw = v; }; CM.app.openMode(id); { const t0 = performance.now(); let seen = false;
  (function f() { const l = document.getElementById('mode-loader'); const vis = l && !l.hidden && !l.classList.contains('is-out');
    if (vis) seen = true;
    if (seen && !vis) { const imgs = [...document.querySelectorAll('#view-game img')].filter(i => !l.contains(i) && i.offsetParent && (i.currentSrc || i.src) && !/^data:/.test(i.src));
      return r({ ms: Math.round(performance.now() - t0), imgs: imgs.length, notLoaded: imgs.filter(i => !i.complete || !i.naturalWidth).map(i => i.getAttribute('src')).slice(0, 5) }); }
    if (performance.now() - t0 > 12000) return r({ ms: -1 }); requestAnimationFrame(f); })(); } }"""

with sync_playwright() as p:
    b = p.chromium.launch()
    for w in [int(x) for x in args.widths.split(',')]:
        for rm in (False, True):
            ctx = b.new_context(viewport={'width': w, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True,
                                reduced_motion='reduce' if rm else 'no-preference')
            pg = ctx.new_page(); tag = f'{w}{"_rm" if rm else ""}'
            def on_console(m, tag=tag):
                if m.type != 'error' or any(s in m.text for s in IGNORE): return
                loc = (m.location or {}).get('url') or ''
                if loc and urlparse(loc).hostname not in ('127.0.0.1', None): return
                res['errors'].append(f'[{tag}] ' + m.text[:300])
            pg.on('console', on_console)
            pg.on('pageerror', lambda e, tag=tag: res['errors'].append(f'[{tag}] pageerror: ' + str(e)[:300]))
            pg.on('response', lambda r: res['missing'].append(f'{r.status} {urlparse(r.url).path}') if urlparse(r.url).hostname == '127.0.0.1' and r.status >= 400 else None)
            # block thumbnails so placeholders stay up and can be inspected
            pg.route('**/thumb.jpg', lambda route: route.abort())
            pg.route('**/i.ytimg.com/**', lambda route: route.abort())
            pg.goto(BASE, wait_until='domcontentloaded'); pg.wait_for_selector('.vrow, .mcard', timeout=20000); time.sleep(0.6)
            sp = pg.evaluate(SPIN_JS, '.vrow__th:not(.is-done) .pawnspin')
            if not rm:
                check(f'{tag} lobby: placeholder pawn spins on Y while its thumbnail loads', sp and sp['name'] == 'pawnspin' and sp['running'], sp)
                pg.screenshot(path=os.path.join(args.out, f'lobby_ph_{tag}.png'))
            else:
                check(f'{tag} lobby: reduced motion = slow 8 s turn', sp and sp['dur'] == '8s', sp)
            pg.unroute('**/thumb.jpg'); pg.unroute('**/i.ytimg.com/**')
            for i, mid in enumerate(args.ids.split(',') if not rm else args.ids.split(',')[:1]):
                pg.goto(BASE + '#/', wait_until='domcontentloaded'); pg.wait_for_selector('.vrow, .mcard', timeout=20000); time.sleep(0.4)
                pg.evaluate(WATCH_JS, mid)
                if i == 0:
                    pg.wait_for_function("() => { const l = document.getElementById('mode-loader'); return l && l.classList.contains('is-in') && getComputedStyle(l).opacity === '1' && l.querySelector('.mload__board').getBoundingClientRect().width > 100; }", timeout=5000, polling=16)
                    time.sleep(0.05)
                    geo = pg.evaluate("""() => { const l = document.getElementById('mode-loader'), bd = l && l.querySelector('.mload__board'), pw = bd && bd.querySelector('.pawnspin');
                      if (!pw) return null; const a = bd.getBoundingClientRect(), c = pw.getBoundingClientRect(), cs = getComputedStyle(pw);
                      return { dx: Math.round((c.left + c.width / 2) - (a.left + a.width / 2)), dy: Math.round((c.top + c.height / 2) - (a.top + a.height / 2)), w: Math.round(c.width), board: Math.round(a.width), anim: cs.animationName, dur: cs.animationDuration, op: getComputedStyle(l).opacity }; }""")
                    pg.screenshot(path=os.path.join(args.out, f'loader_{tag}.png'))
                    check(f'{tag} loader: spinning pawn centred on the thumbnail-style board', geo and geo['w'] > 20 and geo['op'] == '1' and abs(geo['dx']) <= 3 and abs(geo['dy']) <= 3 and geo['anim'] == 'pawnspin' and geo['dur'] == ('8s' if rm else '1.6s'), geo)
                pg.wait_for_function('window._lw', timeout=15000); r = pg.evaluate('window._lw')
                res['timings'][f'{tag}:{mid}'] = r
                check(f'{tag} {mid}: loader shown >= MIN and gone within MAX', r['ms'] >= 1200 and r['ms'] <= 7600, r)
                check(f'{tag} {mid}: every game image loaded when the loader leaves', r.get('imgs', 0) > 0 and not r.get('notLoaded'), r)
                if i == 0: time.sleep(0.4); pg.screenshot(path=os.path.join(args.out, f'game_{tag}.png'))
            ctx.close()
    b.close()
check('0 console errors', not res['errors'], res['errors'][:6])
check('0 local 4xx', not res['missing'], res['missing'][:6])
fails = [k for k, v in res['checks'].items() if not v['ok']]
print(json.dumps({'pass': len(res['checks']) - len(fails), 'fail': fails, 'timings': res['timings'], 'out': args.out}, indent=1))
sys.exit(1 if fails else 0)
