"""Headless check that the game plays sounds. Usage: python3 tools/sfx/qa_sound.py . [port] [comma-separated extra files, e.g. every assets/modes/*/*.wav]
Wraps HTMLMediaElement.play, plays e2-e4 vs Stockfish, then loads + plays every core sound and the extra files; 0 console errors (external CDN/Maia/thumbnail fetches behind the sandbox proxy ignored, as in tools/qa_ui.py)."""
import sys, os, json, threading, http.server, socketserver, functools, glob, subprocess
from playwright.sync_api import sync_playwright
ROOT = sys.argv[1]; PORT = int(sys.argv[2]) if len(sys.argv) > 2 else 8873
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
socketserver.TCPServer.allow_reuse_address = True
srv = socketserver.ThreadingTCPServer(('127.0.0.1', PORT), functools.partial(Q, directory=ROOT))
threading.Thread(target=srv.serve_forever, daemon=True).start()
BASE = f'http://127.0.0.1:{PORT}/index.html'
HOOK = """(() => { window.__plays = []; const P = HTMLMediaElement.prototype.play;
 HTMLMediaElement.prototype.play = function () { const rec = {src: this.src, ok: null}; window.__plays.push(rec);
  const r = P.call(this); if (r && r.then) r.then(() => rec.ok = true, e => rec.ok = String(e)); return r; }; })();"""
errs, bad = [], []
def ignorable(t):
    # same rule as tools/qa_ui.py: external CDN/thumbnail/Maia behind the sandbox proxy is not an app error
    t = t.lower(); return 'maia' in t or 'unpkg.com' in t or ('@ http' in t and '@ http://127.0.0.1' not in t)
changed = sys.argv[3].split(',') if len(sys.argv) > 3 else []
with sync_playwright() as p:
    b = p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required'])
    pg = b.new_page(viewport={'width': 390, 'height': 844})
    pg.add_init_script(HOOK)
    pg.on('console', lambda m: m.type == 'error' and not ignorable(m.text + ' @ ' + (m.location or {}).get('url', '')) and errs.append(m.text + ' @ ' + (m.location or {}).get('url', '')))
    pg.on('pageerror', lambda e: errs.append('pageerror: ' + str(e)))
    pg.on('response', lambda r: r.status >= 400 and '127.0.0.1' in r.url and bad.append((r.status, r.url)))
    pg.goto(BASE + '#/play/stockfish'); pg.wait_for_function('CM.gameUI && CM.gameUI.controller && CM.gameUI.controller.state', timeout=20000)
    pg.wait_for_timeout(800)
    sq = lambda n: pg.evaluate(f'''(() => {{ const c = CM.gameUI.controller, g = c.V.geo || c.V.g; const i = (g.parse ? g.parse('{n}') : null);
        const r = CM.gameUI.board.rectOf(i); return [r.left + r.width/2, r.top + r.height/2]; }})()''')
    for n in ('e2', 'e4'):
        x, y = sq(n); pg.mouse.click(x, y); pg.wait_for_timeout(250)
    pg.wait_for_timeout(2500)
    game = pg.evaluate('window.__plays.map(r => [r.src.split("/").pop(), r.ok])')
    # every built sound: core set + every mode wav, played through CM.sound.play, must load (duration > 0) and play
    files = sorted(glob.glob(os.path.join(ROOT, 'assets/sounds/*.mp3')) + glob.glob(os.path.join(ROOT, 'assets/sounds/*.wav'))
                   + glob.glob(os.path.join(ROOT, 'assets/sounds/sets/*.mp3'))
                   + [os.path.join(ROOT, c) for c in changed])
    rels = [os.path.relpath(f, ROOT) for f in files]
    res = pg.evaluate("""async (rels) => { const out = [];
      for (const u of rels) { const a = new Audio(u); a.volume = 0.01;
        const r = await new Promise(res => { a.onloadedmetadata = () => res({d: a.duration}); a.onerror = () => res({err: a.error && a.error.code}); setTimeout(() => res({err: 'timeout'}), 8000); });
        if (!r.err) { try { await a.play(); r.played = true; a.pause(); } catch (e) { r.played = String(e); } }
        out.push([u, r]); }
      window.__plays.length = 0; CM.sound.play('game-start'); CM.sound.play('capture'); await new Promise(r => setTimeout(r, 600));
      out.push(['CM.sound.play', window.__plays.map(x => [x.src.split('/').pop(), x.ok])]); return out; }""", rels)
    # FPS duel page boots without console errors
    pg.goto(BASE + '#/play/AWFB4EzGtDc'); pg.wait_for_timeout(4000)
    b.close()
srv.shutdown()
fails = [r for r in res[:-1] if r[1].get('err') or r[1].get('played') is not True or not r[1].get('d')]
gnames = [g[0] for g in game]
out = {'move_sounds': game, 'files_checked': len(res) - 1, 'file_failures': fails, 'api': res[-1][1],
       'console_errors': errs, 'http_4xx_5xx': bad,
       'pass': not fails and not errs and not bad and any(g in gnames for g in ('game-start.mp3', 'game-start-2.mp3', 'game-start-3.mp3', 'game-start-4.mp3')) and any(g in gnames for g in ('move-self.mp3', 'move-opponent.mp3'))
               and all(ok is True for _, ok in game) and all(ok is True for _, ok in res[-1][1])}
print(json.dumps(out, indent=1)); sys.exit(0 if out['pass'] else 1)
