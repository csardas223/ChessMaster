#!/usr/bin/env python3
"""Headless browser smoke test for Chess Master (playwright + chromium).
   python3 tools/test_browser.py [--file] [--only lobby,stockfish,...] [--out DIR]
   Serves the app over http (or opens it via file:// with --file), loads the lobby, plays the standard game and
   every proof mode for a few moves, collects console errors, and writes screenshots at 360, 390 and 1280 px."""
import sys, os, json, time, threading, http.server, socketserver, functools, argparse
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ap = argparse.ArgumentParser()
ap.add_argument('--file', action='store_true')
ap.add_argument('--only', default='')
ap.add_argument('--out', default='/workspace/work/shots')
ap.add_argument('--widths', default='360,390,1280')
args = ap.parse_args()
os.makedirs(args.out, exist_ok=True)

PORT = 8765
def serve():
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a, **k): pass
    h = functools.partial(Q, directory=ROOT)
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(('127.0.0.1', PORT), h) as s:
        s.serve_forever()
if not args.file:
    threading.Thread(target=serve, daemon=True).start(); time.sleep(0.4)
BASE = ('file://' + ROOT + '/index.html') if args.file else f'http://127.0.0.1:{PORT}/index.html'

MODES = [  # (id, label, plies-to-try)
    ('stockfish', 'stockfish', 4),
    ('wTudFnunSL0', 'atomic', 4),
    ('xp6Pr-rB4JA', 'backrooms', 4),
    ('JUlTxosCXuk', 'scp2774', 4),
    ('YjXV6gL8SsA', 'mini6', 4),
    ('7REcDCBnXZ8', 'crossderby', 4),
    ('rx-HCGCNuDo', 'gravity', 0),
    ('IjUqZLgF_xM', 'fourplayer', 2),
    ('BYg7rV53WrM', 'legacy-darkness', 2),
]
only = set(x for x in args.only.split(',') if x)
results = {'errors': [], 'modes': {}}

def attach(page, tag):
    def on_console(msg):
        if msg.type in ('error',):
            t = msg.text
            if 'i.ytimg.com' in t or 'ERR_NAME_NOT_RESOLVED' in t or 'Failed to load resource' in t or 'unpkg' in t: return
            results['errors'].append(f'[{tag}] console.{msg.type}: {t}')
    page.on('console', on_console)
    page.on('pageerror', lambda e: results['errors'].append(f'[{tag}] pageerror: {e}'))

JS_PLAY = """async (n) => {
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const out = [];
  for (let k = 0; k < n; k++) {
    let g = CM.gameUI.controller; if (!g) return {err: 'no controller', out};
    for (let t = 0; t < 120 && (g.busy || (window.busy && g === CM.legacyGame)); t++) await sleep(100);
    if (g.over || (g === CM.legacyGame && G && G.over)) { out.push('over'); break; }
    if (g === CM.legacyGame) {
      if (G.s.turn !== 'w' || !G.ms.length) { out.push('not my turn'); break; }
      const m = G.ms[Math.floor(Math.random() * G.ms.length)]; play(m); out.push(sqName(m.f) + sqName(m.t));
    } else {
      if (g.state.turn !== g.human) { out.push('not my turn ' + g.state.turn); await sleep(800); continue; }
      const ms = g.moves.filter(m => !m.drop); if (!ms.length) { out.push('no moves'); break; }
      const m = ms[Math.floor(Math.random() * ms.length)];
      g.commit(m, {}); out.push((m.f >= 0 ? g.V.geo.name(m.f) : '@') + g.V.geo.name(m.t));
    }
    await sleep(500);
  }
  const g = CM.gameUI.controller;
  for (let t = 0; t < 100 && g && g.busy; t++) await sleep(100);
  return {out, sans: g && g.sans ? g.sans.map(x => x.san || x) : (window.G ? G.sans : [])};
}"""

with sync_playwright() as p:
    from urllib.parse import urlparse
    px = os.environ.get('HTTPS_PROXY') or os.environ.get('HTTP_PROXY')
    kw = {}
    if px:
        u = urlparse(px); kw['proxy'] = {'server': f'{u.scheme}://{u.hostname}:{u.port}', 'bypass': '127.0.0.1,localhost'}
        if u.username: kw['proxy'].update(username=u.username, password=u.password or '')
    br = p.chromium.launch(**kw)
    for w in [int(x) for x in args.widths.split(',')]:
        h = 800 if w <= 400 else 860
        ctx = br.new_context(viewport={'width': w, 'height': h}, device_scale_factor=1, has_touch=w <= 400)
        page = ctx.new_page(); attach(page, f'{w}px')
        page.goto(BASE); page.wait_for_timeout(900)
        if not only or 'lobby' in only:
            page.screenshot(path=f'{args.out}/lobby_{w}.png')
            sw = page.evaluate('document.documentElement.scrollWidth')
            if sw > w: results['errors'].append(f'[{w}px] lobby horizontal overflow: scrollWidth {sw}')
            results['lobby_rows_%d' % w] = page.evaluate("document.querySelectorAll('.vrow').length")
        for mid, label, plies in MODES:
            if only and label not in only: continue
            page.evaluate(f"CM.app.openVideo({json.dumps(mid)})"); page.wait_for_timeout(1300)
            ok = page.evaluate("!!CM.gameUI.controller")
            info = {'loaded': ok}
            if ok and plies and w == 390:
                try: info['play'] = page.evaluate(JS_PLAY, plies)
                except Exception as e: info['play_err'] = str(e)[:300]
            page.wait_for_timeout(400)
            if label == 'gravity':
                page.keyboard.down('ArrowRight'); page.wait_for_timeout(500); page.keyboard.up('ArrowRight'); page.keyboard.press('Space'); page.wait_for_timeout(500)
            page.screenshot(path=f'{args.out}/{label}_{w}.png')
            sw = page.evaluate('document.documentElement.scrollWidth')
            if sw > w: results['errors'].append(f'[{w}px] {label}: horizontal overflow scrollWidth {sw}')
            info['title'] = page.evaluate("document.getElementById('mname').textContent")
            info['engine'] = page.evaluate("CM.stockfish.state()")
            results['modes'].setdefault(label, {})[w] = info
            page.evaluate("CM.app.showLobby()"); page.wait_for_timeout(350)
        ctx.close()
    br.close()
print(json.dumps(results, indent=1)[:12000])
