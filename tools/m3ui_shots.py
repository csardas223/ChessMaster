#!/usr/bin/env python3
"""m3-ui: 390x844 touch screenshots of the lobby home and a game screen.
  python3 tools/m3ui_shots.py ROOT OUTPREFIX [--recent] [--intro ID] [--over]"""
import sys, os, time, threading, http.server, socketserver, functools
from playwright.sync_api import sync_playwright
root, pre = sys.argv[1], sys.argv[2]; a = sys.argv[3:]
port = 8800 + (abs(hash(pre)) % 90)
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *x): pass
socketserver.TCPServer.allow_reuse_address = True
srv = socketserver.TCPServer(('127.0.0.1', port), functools.partial(Q, directory=root))
threading.Thread(target=srv.serve_forever, daemon=True).start()
with sync_playwright() as p:
    b = p.chromium.launch()
    ctx = b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True)
    pg = ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(f'http://127.0.0.1:{port}/index.html#/'); pg.wait_for_timeout(2500)
    if '--recent' in a:
        pg.evaluate("""() => { const ids = Object.keys(CM.lobby.byId).filter(i => CM.lobby.byId[i].remastered).slice(0, 5);
          localStorage.setItem('cm.recent', JSON.stringify(ids.map((id, k) => ({ id, t: Date.now() - k * 3.7e6 })))); }""")
        pg.reload(); pg.wait_for_timeout(2500)
    pg.screenshot(path=pre + '_home.png')
    pg.evaluate('window.scrollTo(0, 700)'); pg.wait_for_timeout(600); pg.screenshot(path=pre + '_home2.png')
    if '--intro' in a:
        mid = a[a.index('--intro') + 1]
        pg.evaluate("localStorage.setItem('cm.introForce', 'true'); localStorage.removeItem('cm.introSeen')")
        pg.goto(f'http://127.0.0.1:{port}/index.html#/play/{mid}'); pg.wait_for_timeout(6000)
        pg.screenshot(path=pre + '_intro.png')
        pg.evaluate("document.querySelector('#intro-play') && document.querySelector('#intro-play').click()"); pg.wait_for_timeout(800)
        pg.screenshot(path=pre + '_game.png')
    if '--over' in a:
        for r in ['win', 'loss', 'draw']:
            pg.evaluate("r => CM.gameUI.showOver({result: r, why: r === 'draw' ? 'stalemate' : 'checkmate', you: {name: 'You'}, opp: {name: 'Stockfish', avatar: 'assets/avatars/stockfish.png'}, delay: 0})", r)
            pg.wait_for_timeout(900); pg.screenshot(path=pre + '_over_' + r + '.png'); pg.evaluate('CM.gameUI.hideOver()'); pg.wait_for_timeout(300)
    print('errors', errs)
    b.close()
