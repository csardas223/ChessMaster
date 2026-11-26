#!/usr/bin/env python3
"""m3-ui family chrome shots: for each presentation family (js/ui/family.js) opens one mode at 390x844 touch, shoots the
title strip over the board (<fam>_strip.png) and a forced win card (<fam>_win.png) into research/ref/m3-ui/family/.
  python3 tools/m3ui_family_shots.py [family ...]"""
import sys, os, threading, http.server, socketserver, functools, json
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); OUT = os.path.join(ROOT, 'research/ref/m3-ui/family')
os.makedirs(OUT, exist_ok=True); PORT = 8873
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
socketserver.TCPServer.allow_reuse_address = True
srv = socketserver.TCPServer(('127.0.0.1', PORT), functools.partial(Q, directory=ROOT)); threading.Thread(target=srv.serve_forever, daemon=True).start()
PREF = {'guns': 'AvZiSnngZjA', 'dragon': 'CSjh4NrnxLE', 'nuke': 'wTudFnunSL0', 'magic': 'Ag3KKsIrax4', 'arcade': 'sO-lD2On610', 'dice': 'vm0JynHlzys',
        'rogue': 'Kzt9ItpGtYg', 'duck': 'E2x-QTgBD5k', 'standard': 'stockfish'}
with sync_playwright() as p:
    b = p.chromium.launch()
    ctx = b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True)
    pg = ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(f'http://127.0.0.1:{PORT}/index.html#/'); pg.wait_for_timeout(2000)
    pick = pg.evaluate("""() => { const out = {}, ids = Object.keys(CM.DATA.modeIndex || {});
      for (const id of ids) { const f = CM.family.of(id); const m = CM.DATA.modeIndex[id]; if (m.frame === 'game') continue; (out[f] = out[f] || []).push(id); } return out; }""")
    print(json.dumps({k: len(v) for k, v in pick.items()}))
    fams = sys.argv[1:] or sorted(pick)
    pg.evaluate("localStorage.setItem('cm.introForce', 'true'); localStorage.setItem('cm.introSeen', JSON.stringify(Object.keys(CM.DATA.modeIndex)))")
    for f in fams:
        if f == 'horror' or f not in pick: continue
        mid = PREF.get(f) if PREF.get(f) in pick[f] else pick[f][0]
        pg.goto(f'http://127.0.0.1:{PORT}/index.html#/play/{mid}')
        try:
            pg.wait_for_selector('#fam-strip', timeout=15000); pg.wait_for_timeout(450)
            pg.screenshot(path=f'{OUT}/{f}_strip.png')
        except Exception as e: print('no strip', f, mid, e)
        pg.wait_for_timeout(2200)
        pg.evaluate("CM.gameUI.showOver({result: 'win', why: 'checkmate', you: {name: 'You'}, opp: {name: document.getElementById('botname').textContent}, delay: 0})")
        pg.wait_for_timeout(900); pg.screenshot(path=f'{OUT}/{f}_win.png'); pg.evaluate('CM.gameUI.hideOver()')
        print(f, mid, flush=True)
    print('errors', errs[:5]); b.close()
