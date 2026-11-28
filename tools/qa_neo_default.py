#!/usr/bin/env python3
"""Neo default QA (2026-11-27, owner "Use Neo"). python3 tools/qa_neo_default.py [--port 8974]  (exit 1 on failure)
390x844, fresh storage: default game (#/play/stockfish) draws Neo; picker starts "Neo (default)", "Staunty"; an explicit
Cburnett pick persists across reload; an auto-saved old default (pieces:'staunty', no piecesPicked) migrates to Neo once,
an explicit Staunty pick is kept; Duolingo Chess (eCzxOgc4fTY) keeps its own set; 0 console errors except off-site."""
import os, sys, threading, http.server, socketserver, functools, argparse, json
from playwright.sync_api import sync_playwright
ap = argparse.ArgumentParser(); ap.add_argument('--port', type=int, default=8974); a = ap.parse_args()
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *x): pass
socketserver.ThreadingTCPServer.allow_reuse_address = True
srv = socketserver.ThreadingTCPServer(('127.0.0.1', a.port), functools.partial(Q, directory=ROOT)); threading.Thread(target=srv.serve_forever, daemon=True).start()
BASE = 'http://127.0.0.1:%d/index.html' % a.port
fails = []
def check(n, ok, info=''):
    print(('PASS ' if ok else 'FAIL ') + n + ('' if ok else ' ' + str(info)))
    if not ok: fails.append(n)
def ready(pg): pg.wait_for_function('window.CM && CM.settings', timeout=20000)
def game(pg, route='stockfish'):
    pg.goto(BASE + '#/play/' + route); pg.wait_for_function('CM.gameUI && CM.gameUI.controller && CM.gameUI.controller.state', timeout=20000)
    pg.wait_for_timeout(1200); pg.evaluate('(() => { const t = document.querySelector(".tapstart"); if (t) t.click(); })()'); pg.wait_for_timeout(800)
    if route == 'eCzxOgc4fTY':
        try: pg.wait_for_selector('#duo-play', timeout=8000); pg.click('#duo-play'); pg.wait_for_timeout(1500)
        except Exception: pass
    return pg.evaluate('() => [...document.querySelectorAll("#board img")].map(i => i.getAttribute("src")).filter(Boolean)')
SKEY = '() => Object.keys(localStorage).find(k => /settings/.test(k))'
with sync_playwright() as p:
    b = p.chromium.launch(); ctx = b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True)
    pg = ctx.new_page(); errs = []; rf = []
    pg.on('pageerror', lambda x: errs.append(str(x)))
    pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
    pg.on('requestfailed', lambda r: rf.append(r.url + ' ' + str(r.failure)))
    pg.goto(BASE + '#/'); ready(pg); pg.evaluate('() => localStorage.clear()'); pg.reload(); ready(pg)
    check('fresh storage: pieces = neo', pg.evaluate('() => CM.settings.get("pieces")') == 'neo')
    src = game(pg)
    check('default game draws Neo', src and all('/pieces/neo/' in s for s in src), src[:2])
    if os.environ.get('SHOTS'): pg.screenshot(path=os.path.join(os.environ['SHOTS'], 'neo_default_game_390.png'))
    pg.goto(BASE + '#/'); ready(pg); pg.click('#open-settings'); pg.wait_for_timeout(700)
    names = pg.evaluate('() => [...document.querySelectorAll("#settings [data-pieces]")].slice(0, 2).map(x => [x.dataset.pieces, x.querySelector("span:last-child").textContent, x.getAttribute("aria-checked")])')
    check('picker: Neo (default) first and selected, Staunty second', names == [['neo', 'Neo (default)', 'true'], ['staunty', 'Staunty', 'false']], names)
    pg.locator('#settings [data-pieces="cburnett"]').scroll_into_view_if_needed(); pg.click('#settings [data-pieces="cburnett"]'); pg.wait_for_timeout(300)
    pg.reload(); ready(pg)
    check('explicit Cburnett persists across reload', pg.evaluate('() => CM.settings.get("pieces")') == 'cburnett')
    src = game(pg)
    check('game draws Cburnett after reload', src and all('/pieces/cburnett/' in s for s in src), src[:2])
    k = pg.evaluate(SKEY)
    for saved, picked, want in (('staunty', False, 'neo'), ('cburnett', False, 'neo'), ('staunty', True, 'staunty')):
        pg.evaluate('([k, v, pk]) => { const d = JSON.parse(localStorage.getItem(k)); d.pieces = v; if (pk) d.piecesPicked = true; else delete d.piecesPicked; localStorage.setItem(k, JSON.stringify(d)); }', [k, saved, picked])
        pg.reload(); ready(pg)
        check('saved %s (picked=%s) -> %s' % (saved, picked, want), pg.evaluate('() => CM.settings.get("pieces")') == want)
    pg.evaluate('() => CM.settings.set("pieces", "neo")')
    sd = game(pg, 'eCzxOgc4fTY')
    check('Duolingo Chess keeps its own pieces', sd and all('eCzxOgc4fTY' in s for s in sd), sd[:2])
    local_rf = [u for u in rf if '127.0.0.1' in u and 'ERR_ABORTED' not in u]
    errs = [e for e in errs if not (e.startswith('Failed to load resource') and not local_rf) and not any(x in e for x in ('cdn.jsdelivr.net', 'raw.githubusercontent.com', 'unpkg.com', '407', 'TUNNEL'))]
    if rf: print('     (off-site failed, ignored: %s)' % sorted(set(u.split('/')[2] for u in rf if '127.0.0.1' not in u)))
    check('no failed local requests', not local_rf, local_rf[:5])
    check('0 console errors', not errs, errs[:5])
    b.close()
print('FAILS: %d' % len(fails)); sys.exit(1 if fails else 0)
