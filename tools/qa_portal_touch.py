#!/usr/bin/env python3
"""portal_touch.py <root> <port>: 390x844 touch: place blue (button + tap), orange (long-press), tap-to-move a pawn
through the portal, plus drag variant; desktop double-click / double-right-click still works. 0 console errors."""
import sys, threading, http.server, socketserver, functools, json
from playwright.sync_api import sync_playwright
root, port = sys.argv[1], int(sys.argv[2]); ONLY = sys.argv[3] if len(sys.argv)>3 else ''
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.ThreadingTCPServer(('127.0.0.1',port),functools.partial(Q,directory=root)); threading.Thread(target=srv.serve_forever,daemon=True).start()
IGN=('stockfish','unpkg','jsdelivr','407','ERR_TUNNEL','ERR_FAILED','CORS','ytimg','youtube','maia','net::','Failed to load resource')
out={}
def sq(pg,name):
    return pg.evaluate("n=>{const e=[...document.querySelectorAll('#board .sq')].find(q=>(q.getAttribute('aria-label')||'').split(' ')[0]===n);if(!e)return null;const r=e.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2,lab:e.getAttribute('aria-label'),cls:e.className,html:e.innerHTML.length}}",name)
def touch(cdp,x,y,hold=60):
    cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':x,'y':y}]})
    import time; time.sleep(hold/1000)
    cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
def drag(cdp,a,b):
    import time
    cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':a['x'],'y':a['y']}]})
    for k in range(1,9):
        t=k/8; cdp.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[{'x':a['x']+(b['x']-a['x'])*t,'y':a['y']+(b['y']-a['y'])*t}]}); time.sleep(0.02)
    cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
with sync_playwright() as p:
    br=p.chromium.launch()
    for mid,btnB,btnO in [('inm7KvllVu0','[data-k="b"]','[data-k="o"]'),('7csbf0L-uio','[data-k="u"]','[data-k="o"]')]:
      if ONLY and ONLY!=mid: continue
      for variant in ['tap','drag','desktop']:
        mob = variant!='desktop'
        ctx=br.new_context(viewport={'width':390,'height':844} if mob else {'width':1280,'height':900},has_touch=mob,is_mobile=mob); pg=ctx.new_page()
        errs=[]
        pg.on('console',lambda m: errs.append(m.text[:200]) if m.type=='error' and not any(k.lower() in m.text.lower() for k in IGN) else None)
        pg.on('pageerror',lambda e: errs.append('PAGEERR '+str(e)[:200]))
        pg.goto(f'http://127.0.0.1:{port}/index.html#/play/{mid}',wait_until='load'); pg.wait_for_timeout(3000)
        cdp=ctx.new_cdp_session(pg); steps=[]
        try:
            if mob:
                pg.tap(btnB); pg.wait_for_timeout(200)
                pv=pg.evaluate("()=>document.querySelectorAll('#board .sq .sq-tint').length"); steps.append(('preview_tints',pv))
                e3=sq(pg,'e3'); touch(cdp,e3['x'],e3['y']); pg.wait_for_timeout(300)
                h5=sq(pg,'h5'); touch(cdp,h5['x'],h5['y'],hold=700); pg.wait_for_timeout(400)
                steps.append(('status',pg.inner_text('#status') if pg.query_selector('#status') else ''))
                pg.screenshot(path=f'/tmp/{mid}_{variant}_placed.png')
                e2=sq(pg,'e2')
                if variant=='tap':
                    touch(cdp,e2['x'],e2['y']); pg.wait_for_timeout(250); e3=sq(pg,'e3'); touch(cdp,e3['x'],e3['y'])
                else:
                    t=sq(pg,'e3'); t['y']+=0.6*(sq(pg,'e2')['y']-t['y']); drag(cdp,e2,t)  # app lifts touch drags 0.6 square
            else:
                e3=sq(pg,'e3'); pg.mouse.dblclick(e3['x'],e3['y']); pg.wait_for_timeout(300)
                h5=sq(pg,'h5'); pg.mouse.click(h5['x'],h5['y'],button='right'); pg.mouse.click(h5['x'],h5['y'],button='right'); pg.wait_for_timeout(300)
                e2=sq(pg,'e2'); pg.mouse.click(e2['x'],e2['y']); pg.wait_for_timeout(200); e3=sq(pg,'e3'); pg.mouse.click(e3['x'],e3['y'])
            pg.wait_for_timeout(1500)
            steps.append(('h5',sq(pg,'h5')['lab'])); steps.append(('e3',sq(pg,'e3')['lab'])); steps.append(('e2',sq(pg,'e2')['lab']))
            pg.screenshot(path=f'/tmp/{mid}_{variant}_after.png')
        except Exception as ex: errs.append('TEST '+str(ex)[:200])
        ok = any(k=='h5' and 'awn' in v for k,v in steps) or any(k=='h5' and 'P' in v for k,v in steps)
        out[f'{mid}/{variant}']={'teleported_to_h5':ok,'steps':steps,'errors':errs}
        ctx.close()
    br.close()
srv.shutdown(); print(json.dumps(out,indent=1))
