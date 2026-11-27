#!/usr/bin/env python3
"""cm_acc 2026-11-26: Chessformer (RDl-EmbTRWc) thin one-way ledges at 390x844: python3 tools/qa_cf1.py [SHOTS_DIR]"""
import threading, http.server, socketserver, functools, json, sys
from playwright.sync_api import sync_playwright
import os
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SHOTS=sys.argv[1] if len(sys.argv)>1 else ''
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(('127.0.0.1',8961),functools.partial(Q,directory=ROOT)); threading.Thread(target=srv.serve_forever,daemon=True).start()
fails=[]
def check(n,ok,info=''):
    print(('PASS ' if ok else 'FAIL ')+n+('' if ok else ' '+str(info)),flush=True)
    if not ok: fails.append(n)
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':390,'height':844},device_scale_factor=2,is_mobile=True,has_touch=True)
    errs=[]; pg.on('pageerror',lambda x:errs.append(str(x))); pg.on('console',lambda m:errs.append(m.text) if m.type=='error' and 'Failed to load resource' not in m.text else None)
    pg.goto('http://127.0.0.1:8961/index.html#/play/RDl-EmbTRWc')
    pg.wait_for_function('window.CM && CM.gameUI && CM.gameUI.controller && CM.gameUI.controller.state',timeout=20000)
    pg.wait_for_timeout(2500)
    try: pg.locator('.tapstart').first.click(timeout=1500)
    except Exception: pass
    pg.wait_for_timeout(500)
    SHOTS and pg.screenshot(path=SHOTS+'/app_l1.png')
    H="const c=CM.gameUI.controller, V=c.V, g=V.geo;"
    r=pg.evaluate('() => {'+H+''' const ms=c.moves.filter(m=>g.name(m.f)==='o10'); return { tiles:c.state.x.tiles, dests: ms.map(m=>g.name(m.t)), land: ms.map(m=>{ const n=m.n||V.make(c.state,m); return g.name(n.b.findIndex((q,i)=>q&&q.t==='R')); }), wallo10: !!c.state.b[g.parse('o9')], bars: document.querySelectorAll('#board .sq-label').length }; }''')
    print(json.dumps(r))
    check('ledge tiles loaded', r['tiles'] and r['tiles'].get('o10')=='ledge' and r['tiles'].get('o4')=='ledge', r)
    check('ledge square below the rook is open (no wall at o9)', not r['wallo10'], r)
    check('rook moves down through its ledge', 'o9' in r['dests'] and 'o5' in r['dests'], r['dests'])
    i=r['dests'].index('o7') if 'o7' in r['dests'] else -1
    check('rook dropped at o7 falls onto the o4 ledge', i>=0 and r['land'][i]=='o4', r)
    check('ledge bars drawn', r['bars']>=2, r['bars'])
    # play it: tap rook, tap o7
    sq=lambda n: pg.evaluate('(n)=>CM.gameUI.controller.V.geo.parse(n)', n)
    pg.locator('#board .sq[data-i="%d"]'%sq('o10')).first.click(); pg.wait_for_timeout(150)
    SHOTS and pg.screenshot(path=SHOTS+'/app_l1_sel.png')
    pg.locator('#board .sq[data-i="%d"]'%sq('o7')).first.click(); pg.wait_for_timeout(1800)
    rr=pg.evaluate('() => {'+H+' return g.name(c.state.b.findIndex(q=>q&&q.t==="R")); }')
    check('tapped move: rook lands on the o4 ledge', rr=='o4', rr)
    SHOTS and pg.screenshot(path=SHOTS+'/app_l1_after.png')
    # from below: rook o4 moves up through o4? rook at o4 moving up passes ledge under o10 (bar under o10 = between o10 and o9)
    up=pg.evaluate('() => {'+H+' return c.moves.filter(m=>g.name(m.f)==="o4").map(m=>g.name(m.t)); }')
    check('rook passes up through the o10 ledge from below', 'o10' in up and 'o11' in up, up)
    # level 2
    pg.evaluate('() => { const c=CM.gameUI.controller; c.hooks.runSetLevel(c.ctx,1); }')
    pg.evaluate("() => CM.gameUI.controller.newGame ? CM.gameUI.controller.newGame() : null"); pg.wait_for_timeout(2500)
    try: pg.locator('.tapstart').first.click(timeout=1000)
    except Exception: pass
    pg.wait_for_timeout(600)
    r2=pg.evaluate('() => {'+H+' return { tiles:c.state.x.tiles, pawn: g.name(c.state.b.findIndex(q=>q&&q.t==="P"&&q.c==="w")), pm: c.moves.filter(m=>m.p==="P").map(m=>g.name(m.t)) }; }')
    print(json.dumps(r2))
    check('level 12 ledges c9-c11', r2['tiles'] and all(r2['tiles'].get(k)=='ledge' for k in ('c9','c10','c11')), r2)
    SHOTS and pg.screenshot(path=SHOTS+'/app_l12.png')
    check('0 console errors', not errs, errs[:4])
    b.close()
srv.shutdown()
print('FAILED: '+', '.join(fails) if fails else 'ALL PASS'); sys.exit(1 if fails else 0)
