#!/usr/bin/env python3
"""cm_h5 2026-11-27: Chessformer (RDl-EmbTRWc) Level 12 pawn promotion, per the video (7:04-7:26 "a promotion tactic", queen;
3:41-3:44 every pawn may double-step on its first move). Puts Level 12 first, then plays the pawn c7-c9 (double step onto the
c9 ledge), c9-c10, c10-c11=Q through real taps and the promotion picker, and checks it rests on each ledge and becomes a queen.
  python3 tools/qa_cf12.py [--size 390x844] [--port 8962] [--shots DIR]   (exit 1 on a failure or console error)"""
import os, sys, threading, http.server, socketserver, functools, argparse
from playwright.sync_api import sync_playwright
ap = argparse.ArgumentParser(); ap.add_argument('--size', default='390x844'); ap.add_argument('--port', type=int, default=8962); ap.add_argument('--shots', default='')
a = ap.parse_args(); W, H = map(int, a.size.split('x'))
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *x): pass
socketserver.TCPServer.allow_reuse_address = True
srv = socketserver.TCPServer(('127.0.0.1', a.port), functools.partial(Q, directory=ROOT)); threading.Thread(target=srv.serve_forever, daemon=True).start()
fails = []
def check(n, ok, info=''):
    print(('PASS ' if ok else 'FAIL ') + n + ('' if ok else ' ' + str(info)))
    if not ok: fails.append(n)
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': W, 'height': H}, device_scale_factor=2, is_mobile=True, has_touch=True); errs = []
    pg.on('pageerror', lambda x: errs.append(str(x))); pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' and '407' not in m.text and 'TUNNEL' not in m.text else None)
    pg.goto('http://127.0.0.1:%d/index.html#/play/RDl-EmbTRWc' % a.port)
    pg.wait_for_function('window.CM && CM.gameUI && CM.gameUI.controller && CM.gameUI.controller.state', timeout=20000)
    try: pg.wait_for_selector('.tapstart', timeout=4000); pg.locator('.tapstart').first.click()
    except Exception: pass
    pg.wait_for_timeout(1800)
    pg.evaluate('() => { const c = CM.gameUI.controller, L = c.ctx.params.levels; c.ctx.params.levels = [L[1], L[0]]; c.newGame(); }')
    pg.wait_for_timeout(1500)
    at = lambda s: pg.evaluate('s => { const c = CM.gameUI.controller, p = c.state.b[c.V.geo.parse(s)]; return p ? p.c + p.t : null; }', s)
    check('Level 12: blue pawn on c7', at('c7') == 'wP', at('c7'))
    tg = pg.evaluate('() => { const c = CM.gameUI.controller, g = c.V.geo; return c.moves.filter(m => m.f === g.parse("c7")).map(m => g.name ? g.name(m.t) : m.t); }')
    check('the pawn may double-step from c7 (not its 2nd rank)', len(tg) >= 2, tg)
    def tap(f, t):
        pg.evaluate('() => CM.gameUI.zoom && CM.gameUI.zoom("fit")')
        for s in (f, t):
            i = pg.evaluate('s => CM.gameUI.controller.V.geo.parse(s)', s)
            pg.locator('#board .sq[data-i="%d"]' % i).first.click(); pg.wait_for_timeout(150)
        pg.wait_for_timeout(900)
    tap('c7', 'c9'); check('c7-c9 rests on the c9 ledge', at('c9') == 'wP', [at('c7'), at('c8'), at('c9')])
    tap('c9', 'c10'); check('c9-c10 rests on the c10 ledge', at('c10') == 'wP', at('c10'))
    tap('c10', 'c11')
    opts = pg.evaluate('() => [...document.querySelectorAll("#promo:not([hidden]) [data-t]")].map(b => b.dataset.t).sort()')
    check('promotion picker on the top rank offers Q/R/B/N', opts == ['B', 'N', 'Q', 'R'], opts)
    if a.shots: pg.screenshot(path=os.path.join(a.shots, 'cf12_promo_%s.png' % a.size))
    if opts: pg.locator('#promo [data-t="Q"]').first.click(); pg.wait_for_timeout(1000)
    check('queen on c11 (video 7:10 "straight away with the queen")', at('c11') == 'wQ', at('c11'))
    if a.shots: pg.screenshot(path=os.path.join(a.shots, 'cf12_queen_%s.png' % a.size))
    check('0 console errors', not errs, errs[:4])
    b.close()
srv.shutdown(); print('FAILED: ' + ', '.join(fails) if fails else 'ALL PASS'); sys.exit(1 if fails else 0)
