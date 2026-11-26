# Headless QA of Once a Pawn a King (C9v7G3dJl7E) at 390x844: intro, tutorial rooms 1-3 by real taps, Angel buys, Hop. Prints state + console errors (CDN 407s ignored).
import os, sys, threading, http.server, socketserver, functools, json
from playwright.sync_api import sync_playwright
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__))); OUT=os.environ.get('OUT','/tmp')
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
srv=socketserver.ThreadingTCPServer(('127.0.0.1',0),functools.partial(Q,directory=ROOT)); port=srv.server_address[1]
threading.Thread(target=srv.serve_forever,daemon=True).start()
BASE=f'http://127.0.0.1:{port}/index.html'
errs=[]
def real(t): return not any(k in t for k in ('407','ERR_TUNNEL','Proxy'))
with sync_playwright() as p:
    b=p.chromium.launch(); ctx=b.new_context(viewport={'width':390,'height':844},device_scale_factor=2,has_touch=True,is_mobile=True)
    pg=ctx.new_page()
    pg.on('console',lambda m: errs.append(m.text) if m.type=='error' and real(m.text) else None)
    pg.on('pageerror',lambda e: errs.append('PAGEERR '+str(e)))
    pg.goto(BASE+'#/play/C9v7G3dJl7E'); pg.wait_for_timeout(3000)
    def st(): return pg.evaluate("""()=>{const o=document.getElementById('game-frame').__opk;const S=o.S(),R=o.R();
      return {node:S.node,shards:S.shards,keys:S.keys,over:S.over,army:S.army.filter(p=>!p.dead).map(p=>[p.t,p.c,p.r,p.moved,p.bless]),
      phase:R&&R.phase,mana:R&&R.mana,cleared:R&&R.cleared,en:R?R.enemies.filter(e=>!e.dead).map(e=>[e.t,e.c,e.r,e.plan&&[e.plan.c,e.plan.r,!!e.plan.cap,!!e.plan.blocked]]):[]}}""")
    def tap(c,r):
        g=pg.evaluate("()=>document.getElementById('game-frame').__opk.geo()")
        bb=pg.eval_on_selector('#game-canvas','e=>{const r=e.getBoundingClientRect();return [r.left,r.top,r.width,r.height]}')
        x=bb[0]+(g['x0']+(c+.5)*g['ts'])/1000*bb[2]; y=bb[1]+(g['y0']+(r+.5)*g['ts'])/1000*bb[3]
        pg.mouse.click(x,y); pg.wait_for_timeout(250)
    def btn(c):
        el=pg.query_selector(f'[data-c="{c}"]')
        if el and el.is_enabled(): el.click(); pg.wait_for_timeout(300); return True
        return False
    def endturn(): btn('end'); pg.wait_for_timeout(2500)
    for i in range(8):
        if not btn('next'): break
    # T1
    tap(1,3); btn('start'); pg.wait_for_timeout(1200)
    for r in (2,1,0):
        tap(1,r); pg.wait_for_timeout(300)
        if st()['cleared']: break
        endturn()
    pg.wait_for_timeout(2000); print('after T1',st())
    # T2: place on B4 (2,3); white pawn goes to C2 (1,1)
    tap(2,3); btn('start'); pg.wait_for_timeout(1500); print('T2 start',st())
    pg.screenshot(path=OUT+'/t2.png')
    tap(3,3); endturn(); print('T2 t1',st()); endturn(); print('T2 t2',st())
    tap(3,2); endturn(); print('T2 t3',st())
    s=st(); e=s['en'][0] if s['en'] else None
    if e:
        tap(e[1],e[2]); pg.wait_for_timeout(2200)
    print('after T2',st())
    # angel
    pg.screenshot(path=OUT+'/angel.png')
    btn('buy:pull'); btn('buy:hop'); print('angel',st()); btn('leave'); pg.wait_for_timeout(500)
    # T3: place D5 (1,4), start
    tap(1,4); btn('start'); pg.wait_for_timeout(1800); print('T3 start',st()); pg.screenshot(path=OUT+'/t3.png')
    s=st()
    for e in s['en']:
        if e[1]==0 and e[2]==3: tap(0,3); break
    pg.wait_for_timeout(300); print('T3 cap',st()); endturn(); print('T3 t2',st())
    # try hop: select pong, use hop up
    s=st(); pc=s['army'][0]
    btn('bless:hop'); tap(pc[1],pc[2]-2); print('T3 hop',st()); pg.screenshot(path=OUT+'/t3b.png')
    b.close()
print('ERRORS',len(errs)); [print(' ',e) for e in errs[:20]]
