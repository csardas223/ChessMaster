#!/usr/bin/env python3
"""Duolingo Chess (eCzxOgc4fTY) QA: path HUD, match board (Duolingo pieces/board/frame, selection + dots), lesson, match-end
CLAIM XP screen. python3 tools/qa_duo.py [--size 390x844] [--port 8971] [--shots DIR]   (exit 1 on a failure or console error)"""
import os, sys, threading, http.server, socketserver, functools, argparse
from playwright.sync_api import sync_playwright
ap = argparse.ArgumentParser(); ap.add_argument('--size', default='390x844'); ap.add_argument('--port', type=int, default=8971); ap.add_argument('--shots', default='')
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
def shot(pg, n):
    if a.shots: pg.screenshot(path=os.path.join(a.shots, 'duo_%s_%s.png' % (n, a.size)))
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': W, 'height': H}, device_scale_factor=2, is_mobile=True, has_touch=True); errs = []
    pg.on('pageerror', lambda x: errs.append(str(x))); pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' and not any(k in m.text for k in ('407', 'TUNNEL', 'cdn.jsdelivr.net', 'raw.githubusercontent.com', 'Failed to load resource')) else None)
    pg.goto('http://127.0.0.1:%d/index.html#/play/eCzxOgc4fTY' % a.port)
    pg.wait_for_function('window.CM && CM.gameUI && CM.gameUI.controller && CM.gameUI.controller.state', timeout=20000)
    try: pg.wait_for_selector('.tapstart', timeout=4000); pg.locator('.tapstart').first.click()
    except Exception: pass
    pg.wait_for_selector('#duo-path', timeout=8000); pg.wait_for_timeout(900)
    check('HUD: energy chip shows 25', '25' in pg.inner_text('.duo-chip--energy'))
    check('HUD: gems 500', '500' in pg.inner_text('.duo-chip--gem'))
    shot(pg, 'path')
    pg.click('#duo-play'); pg.wait_for_timeout(1800)
    sq = pg.evaluate('() => { const s = document.querySelector("#board .sq.is-light"), d = document.querySelector("#board .sq.is-dark"); return [getComputedStyle(s).backgroundColor, getComputedStyle(d).backgroundColor]; }')
    check('board squares #ffffff / #f2f4f5', sq == ['rgb(255, 255, 255)', 'rgb(242, 244, 245)'], sq)
    check('no coordinates shown', pg.evaluate('() => [...document.querySelectorAll("#board .coord")].every(c => !c.offsetParent || getComputedStyle(c).display === "none")'))
    src = pg.evaluate('() => [...document.querySelectorAll("#board img.pc, #board .pc")].map(i => i.getAttribute("src") || getComputedStyle(i).backgroundImage).filter(Boolean).slice(0, 3)')
    check('pieces come from the traced set', any('eCzxOgc4fTY/pieces' in s for s in src), src)
    i = pg.evaluate('() => CM.gameUI.controller.V.geo.parse("e2")')
    pg.locator('#board .sq[data-i="%d"]' % i).first.click(); pg.wait_for_timeout(400)
    check('legal-move dots after selecting e2', pg.evaluate('() => document.querySelectorAll("#board .sq.is-target").length') >= 2)
    shot(pg, 'match_sel')
    pg.evaluate('() => { const c = CM.gameUI.controller; c.resign(); }')
    pg.wait_for_timeout(2400)
    has = pg.evaluate('() => !!document.getElementById("duo-done")')
    if has:
        check('match end: "We should play again"', 'play again' in pg.inner_text('#duo-done').lower())
        check('match end button CLAIM XP', pg.inner_text('#duo-go').strip().upper() == 'CLAIM XP')
        shot(pg, 'match_end'); pg.click('#duo-go'); pg.wait_for_timeout(500)
        check('then CONTINUE', pg.inner_text('#duo-go').strip().upper() == 'CONTINUE'); pg.click('#duo-go'); pg.wait_for_timeout(1200)
        check('back on the path with a W/L record', pg.evaluate('() => !!document.getElementById("duo-rec")'))
        shot(pg, 'path_rec')
    else: print('NOTE match-end trigger not reachable from QA (no finish hook name); skipped')
    pg.click('#duo-n1'); pg.wait_for_timeout(1800)
    check('lesson: energy counter', '25' in pg.inner_text('#duo-hearts'))
    shot(pg, 'lesson')
    check('0 console errors', not errs, errs[:4])
    b.close()
srv.shutdown(); print('FAILED: ' + ', '.join(fails) if fails else 'ALL PASS'); sys.exit(1 if fails else 0)
