#!/usr/bin/env python3
"""Piece-load timing (2026-11-27, owner on the Z Flip6: "piece sets take like a minute"). Needs a running server:
python3 tools/qa_piece_load.py http://127.0.0.1:PORT/index.html cburnett,duolingo,staunton3d [fast3g|slow4g]
In a standard game at 390x844 (DPR 3): throttle, open Options, tap the set; prints tap -> all board + preview pieces visible,
piece requests in that window, and the most board pieces left blank at once (must be 0). For the deploy, serve it through
a local mirror (the sandbox browser cannot reach github.io directly) that keeps Pages headers (max-age=600 + ETag)."""
from playwright.sync_api import sync_playwright
BASE = sys.argv[1]; SETS = sys.argv[2].split(','); prof = sys.argv[3] if len(sys.argv) > 3 else 'fast3g'
PROF = {'fast3g': dict(offline=False, latency=562.5, downloadThroughput=180000, uploadThroughput=84375),
        'slow4g': dict(offline=False, latency=150, downloadThroughput=200000, uploadThroughput=93750)}
DONE = '''(s)=>{const im=[...document.querySelectorAll("#board img.pc, #skin-preview img")]; return im.length>12 && im.every(i=>i.getAttribute("src").includes("/"+s+"/") && i.complete && i.naturalWidth>0);}'''
EMPTY = '''(s)=>{const im=[...document.querySelectorAll("#board img.pc")]; return im.filter(i=>!(i.complete && i.naturalWidth>0)).length;}'''
with sync_playwright() as p:
    b = p.chromium.launch()
    for s in SETS:
        ctx = b.new_context(viewport={'width':390,'height':844}, device_scale_factor=3, is_mobile=True, has_touch=True)
        pg = ctx.new_page(); errs=[]; reqs=[]; fails=[]
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.on('console', lambda m: errs.append(m.text) if m.type=='error' and 'Failed to load resource' not in m.text else None)
        pg.on('request', lambda r: reqs.append(r.url) if '/assets/pieces/' in r.url else None)
        pg.on('requestfailed', lambda r: fails.append(r.url) if '127.0.0.1' in r.url else None)
        pg.goto(BASE + '#/play/stockfish', timeout=0); pg.wait_for_function('window.CM && CM.gameUI && CM.gameUI.controller', timeout=60000)
        pg.wait_for_function('()=>{const im=[...document.querySelectorAll("#board img.pc")]; return im.length && im.every(i=>i.complete&&i.naturalWidth>0)}', timeout=60000)
        cdp = ctx.new_cdp_session(pg); cdp.send('Network.enable'); cdp.send('Network.emulateNetworkConditions', PROF[prof])
        reqs.clear(); t0 = time.time()
        pg.evaluate('()=>CM.settingsPanel.open()'); pg.wait_for_timeout(300)
        pg.evaluate('(s)=>document.querySelector("#settings [data-pieces=\\""+s+"\\"]").click()', s)
        maxempty = 0; t_done=None
        while time.time()-t0 < 100:
            if pg.evaluate(DONE, s): t_done = time.time()-t0; break
            maxempty = max(maxempty, pg.evaluate(EMPTY, s)); pg.wait_for_timeout(100)
        print(s, dict(tap_to_all_visible_s=t_done and round(t_done,2), piece_reqs=len(reqs), other_set_reqs=len([u for u in reqs if '/'+s+'/' not in u]), max_blank_board_pieces=maxempty, failed=len(fails), errs=errs[:2]), flush=True)
        ctx.close()
    b.close()
