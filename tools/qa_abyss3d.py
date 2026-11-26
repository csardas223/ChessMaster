#!/usr/bin/env python3
# s5-3d: Abyss SMOXF1bSsDk 3D tap probe (390x844 touch, CDP taps on projected squares). Usage: L2=1 python3 tools/qa_abyss3d.py a8,d8,d8,d6,... (L2=1 solves level 1 by engine calls first, then taps level 2).
import os, sys, json, time, threading, http.server, socketserver, functools
from playwright.sync_api import sync_playwright
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__))); PORT=8831; OUT=os.environ.get('OUT','/tmp/qa_abyss3d'); os.makedirs(OUT,exist_ok=True)
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a,**k): pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.ThreadingTCPServer(('127.0.0.1',PORT),functools.partial(Q,directory=ROOT)); threading.Thread(target=srv.serve_forever,daemon=True).start()
PROJ="""(name) => { const S = CM.scene3d.current(); if (!S) return null; const G = CM.gameUI.controller, i = G.V.geo.parse(name);
  const v = S.sq2world(i).clone(); v.y += 0.08; S.root.localToWorld(v); v.project(S.camera); const r = S.canvas.getBoundingClientRect();
  return [r.left + (v.x + 1) / 2 * r.width, r.top + (1 - v.y) / 2 * r.height]; }"""
ST="""() => { const G = CM.gameUI.controller; return {sel:G.sel, n:G.sans.length, turn:G.state.turn, over:G.over?G.over.why:null, busy:!!G.busy, lvl: (G.ctx&&G.ctx.x)?JSON.stringify(G.ctx.x).slice(0,80):null}; }"""
errs=[]
route=sys.argv[1].split(',') if len(sys.argv)>1 else 'a8,d8,d8,d8,d6,d6,h6,h6,h4,h4,g4,g4,g2,g2,f2,f2,f1,f1,e1'.split(',')
with sync_playwright() as p:
    b=p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
    ctx=b.new_context(viewport={'width':390,'height':844},device_scale_factor=2.6,is_mobile=True,has_touch=True)
    pg=ctx.new_page(); pg.on('console',lambda m: errs.append(m.text[:200]) if m.type=='error' else None)
    cdp=ctx.new_cdp_session(pg)
    pg.goto(f'http://127.0.0.1:{PORT}/index.html#/play/SMOXF1bSsDk')
    pg.wait_for_function('() => CM.gameUI && CM.gameUI.controller && CM.gameUI.controller.moves', timeout=60000)
    pg.wait_for_function('() => CM.scene3d && CM.scene3d.current && CM.scene3d.current()', timeout=60000)
    pg.wait_for_timeout(3000)
    if os.environ.get('L2'):
        for i in range(0,len(route),2):
            pg.evaluate("([a,b]) => { const G=CM.gameUI.controller,g=G.V.geo; G.onTap(g.parse(a),{}); G.onTap(g.parse(b),{}); }", route[i:i+2]); pg.wait_for_timeout(700)
        pg.wait_for_timeout(1500); pg.get_by_text('Next level').click(); pg.wait_for_timeout(4000)
        pg.wait_for_function('() => CM.scene3d && CM.scene3d.current && CM.scene3d.current()', timeout=60000); pg.wait_for_timeout(2000)
        print('L2 start', pg.evaluate("() => { const G=CM.gameUI.controller,g=G.V.geo; return Object.keys(G.state.b).filter(k=>G.state.b[k]).map(k=>g.name(+k)+':'+G.state.b[k].t); }"))
    pg.evaluate('() => CM.scene3d.current().renderer.setPixelRatio(.5)')
    pg.screenshot(path=OUT+'/0.png')
    pg.evaluate("() => { window.__ev=[]; const cv=CM.scene3d.current().canvas; ['pointerdown','pointerup','pointercancel','click'].forEach(t=>cv.addEventListener(t,e=>window.__ev.push(t+':'+e.pointerId+':'+e.pointerType+':'+(CM.scene3d.current().pinching?'P':'')),true)); const G=CM.gameUI.controller; const o=G.onTap.bind(G); G.onTap=function(i,x){ window.__ev.push('onTap:'+i); return o(i,x); }; }")
    for i in range(0,len(route),2):
        for sq in route[i:i+2]:
            xy=pg.evaluate(PROJ,sq)
            cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':xy[0],'y':xy[1],'id':1}]}); pg.wait_for_timeout(60)
            cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]}); pg.wait_for_timeout(500)
            print(sq, [round(v) for v in xy], pg.evaluate(ST), pg.evaluate('() => window.__ev.splice(0)'), flush=True)
        pg.wait_for_timeout(1500)
    pg.screenshot(path=OUT+'/1.png')
    print('final', pg.evaluate(ST)); print('errors', errs[:8])
    b.close()
