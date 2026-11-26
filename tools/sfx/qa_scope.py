"""Headless check of the v6 per-mode sound sets. Usage: python3 tools/sfx/qa_scope.py . [port] [id,id,...]
For every wired mode (tools/sfx/modes_v6.WIRE, or the ids given): open it, play e2-e4 when the board has those squares,
wait for the reply / entity turn, and record every HTMLMediaElement.play. Pass when: each mode with a 'game-start'
override plays its own file and not assets/sounds/game-start.mp3; every played file loads (no 4xx); 0 console errors;
and after leaving, a plain Stockfish game plays the core game-start.mp3 again (the mode's set does not leak)."""
import sys, os, json, threading, http.server, socketserver, functools
from playwright.sync_api import sync_playwright
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from modes_v6 import WIRE
ROOT = sys.argv[1]; PORT = int(sys.argv[2]) if len(sys.argv) > 2 else 8874
IDS = sys.argv[3].split(',') if len(sys.argv) > 3 else list(WIRE)


class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass


socketserver.TCPServer.allow_reuse_address = True
srv = socketserver.ThreadingTCPServer(('127.0.0.1', PORT), functools.partial(Q, directory=ROOT))
threading.Thread(target=srv.serve_forever, daemon=True).start()
BASE = f'http://127.0.0.1:{PORT}/index.html'
HOOK = """(() => { window.__plays = []; const P = HTMLMediaElement.prototype.play;
 HTMLMediaElement.prototype.play = function () { const rec = {src: this.src, ok: null}; window.__plays.push(rec);
  const r = P.call(this); if (r && r.then) r.then(() => rec.ok = true, e => rec.ok = String(e)); return r; }; })();"""


def ignorable(t):
    t = t.lower(); return 'maia' in t or 'unpkg.com' in t or ('@ http' in t and '@ http://127.0.0.1' not in t)


res, errs, bad = {}, [], []
with sync_playwright() as p:
    b = p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required'])
    pg = b.new_page(viewport={'width': 390, 'height': 844})
    pg.add_init_script(HOOK)
    cur = {'id': None}
    pg.on('console', lambda m: m.type == 'error' and not ignorable(m.text + ' @ ' + (m.location or {}).get('url', '')) and errs.append((cur['id'], m.text)))
    pg.on('pageerror', lambda e: errs.append((cur['id'], 'pageerror: ' + str(e))))
    pg.on('response', lambda r: r.status >= 400 and '127.0.0.1' in r.url and bad.append((cur['id'], r.status, r.url)))
    for mid in IDS + ['stockfish']:
        cur['id'] = mid
        pg.goto(BASE + '#/play/' + mid)
        try:
            pg.wait_for_function('CM.gameUI && CM.gameUI.controller && (CM.gameUI.controller.state || CM.gameUI.controller.mod)', timeout=20000)
        except Exception as e:
            errs.append((mid, 'did not boot: ' + str(e)[:120])); continue
        pg.wait_for_timeout(900)
        try:
            for n in ('e2', 'e4'):
                xy = pg.evaluate(f'''(() => {{ const c = CM.gameUI.controller, g = c.V && (c.V.geo || c.V.g); if (!g || !g.parse) return null;
                    const i = g.parse('{n}'); if (i == null || i < 0) return null; const r = CM.gameUI.board.rectOf(i); return r ? [r.left + r.width/2, r.top + r.height/2] : null; }})()''')
                if xy: pg.mouse.click(*xy); pg.wait_for_timeout(250)
        except Exception:
            pass
        pg.wait_for_timeout(4500)
        res[mid] = pg.evaluate('window.__plays.map(r => [r.src.replace(location.origin + "/", ""), r.ok])')
        pg.evaluate('window.__plays.length = 0')
    b.close()
srv.shutdown()
fails = []
for mid in IDS:
    gs = WIRE.get(mid, {}).get('sounds', {}).get('game-start')
    srcs = [s for s, _ in res.get(mid, [])]
    if gs and gs not in srcs: fails.append('%s: own game-start %s not played' % (mid, gs))
    if gs and 'assets/sounds/game-start.mp3' in srcs: fails.append('%s: core game-start also played' % mid)
if 'assets/sounds/game-start.mp3' not in [s for s, _ in res.get('stockfish', [])]: fails.append('stockfish after the modes: core game-start.mp3 not played (scope leak)')
leak = [s for s, _ in res.get('stockfish', []) if s.startswith('assets/modes/')]
if leak: fails.append('stockfish after the modes played mode sounds: %s' % leak)
out = {'plays': res, 'console_errors': errs, 'http_4xx_5xx': bad, 'fails': fails, 'pass': not fails and not errs and not bad}
print(json.dumps(out, indent=1)); sys.exit(0 if out['pass'] else 1)
