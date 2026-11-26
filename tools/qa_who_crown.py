# Headless QA of Who Takes the Crown (UzoZVdmGpyc, js/games/who-crown.js) at 390x844 touch: loads the mode, jumps by the
# on-screen button (tap + hold), plays the leading moves by real taps, checks check-immobility (f4 Re1+), Bc3# -> super jump,
# super jump through the pawn rows, respawn at a checkpoint, and the crown. Prints states + console errors (CDN 407s ignored).
import os, sys, threading, http.server, socketserver, functools, json
from playwright.sync_api import sync_playwright
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__))); OUT=os.environ.get('OUT','/tmp')
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
srv=socketserver.ThreadingTCPServer(('127.0.0.1',0),functools.partial(Q,directory=ROOT)); port=srv.server_address[1]
threading.Thread(target=srv.serve_forever,daemon=True).start()
BASE=f'http://127.0.0.1:{port}/index.html'
errs=[]; fails=[]
def real(t): return not any(k in t for k in ('407','ERR_TUNNEL','Proxy','unpkg','jsdelivr'))
def ok(c,msg):
    print(('PASS ' if c else 'FAIL ')+msg)
    if not c: fails.append(msg)
with sync_playwright() as p:
    b=p.chromium.launch(); ctx=b.new_context(viewport={'width':390,'height':844},device_scale_factor=2,has_touch=True,is_mobile=True)
    pg=ctx.new_page()
    pg.on('console',lambda m: errs.append(m.text) if m.type=='error' and real(m.text) else None)
    pg.on('pageerror',lambda e: errs.append('PAGEERR '+str(e)))
    pg.goto(BASE+'#/play/UzoZVdmGpyc'); pg.wait_for_timeout(3500)
    C="document.getElementById('game-frame').__crown"
    def st(): return pg.evaluate(f"()=>{{const S={C}.S();return {{x:S.pawn.x,y:S.pawn.y,g:S.pawn.ground,sup:S.supers,armed:S.armed,cp:S.cp,won:S.won,imm:S.immobile,t:S.t}}}}")
    def mv(bi,u): r=pg.evaluate(f"()=>{C}.move({bi},'{u}')"); pg.wait_for_timeout(900); return r
    def warp(x,y): pg.evaluate(f"()=>{C}.warp({x},{y})"); pg.wait_for_timeout(700)
    def press(k,ms):
        el=pg.query_selector(f'#game-controls [data-k="{k}"]'); bb=el.bounding_box()
        pg.mouse.move(bb['x']+bb['width']/2,bb['y']+bb['height']/2); pg.mouse.down(); pg.wait_for_timeout(ms); pg.mouse.up(); pg.wait_for_timeout(900)
    pg.screenshot(path=OUT+'/crown_start.png')
    s=st(); ok(s['g'] and abs(s['y'])<0.01,'pawn spawns on the floor %s'%s)
    press('jump',60); pg.wait_for_timeout(1200); s1=st(); ok(s1['g'],'tap jump lands again')
    # walk right to the board
    el=pg.query_selector('#game-controls [data-k="right"]'); bb=el.bounding_box(); pg.mouse.move(bb['x']+20,bb['y']+20); pg.mouse.down(); pg.wait_for_timeout(1300); pg.mouse.up(); pg.wait_for_timeout(300)
    s2=st(); ok(s2['x']>s1['x']+1,'walks right %s'%s2)
    # overcharge fails
    press('jump',1700); s3=st(); ok(s3['y']<1.01,'held too long: failed jump %s'%s3)
    # tap-move d2d4 on board 0 by real taps on the canvas
    def tapsq(bi,sq):
        geo=pg.evaluate(f"()=>{{const c=document.getElementById('game-canvas'),r=c.getBoundingClientRect(),cam={C}.cam,T={C}.T,B=T.boards[{bi}],W=c.width,sc=W/(cam.free?22:11);return [r.left,r.top,r.width,r.height,cam.x,cam.y,sc,c.width,c.height,B.x,B.y]}}")
        L,Tp,Wd,Hd,cx,cy,sc,cw,ch,bx,by=geo
        f='abcdefgh'.index(sq[0]); r=int(sq[1])-1
        wx=bx+f+0.5; wy=by+r+0.5
        px=(wx-cx)*sc+cw/2; py=ch/2-(wy-cy)*sc
        pg.mouse.click(L+px/cw*Wd, Tp+py/ch*Hd); pg.wait_for_timeout(250)
    tapsq(0,'d2'); tapsq(0,'d4'); pg.wait_for_timeout(1500)
    fen=pg.evaluate(f"()=>{{const S={C}.S();return S.boards[0].st.b.map(p=>p?(p.c=='w'?p.t:p.t.toLowerCase()):'.').join('')}}")
    ok(fen[35]=='P' and fen[30]=='q','tap d2-d4 by touch, scripted reply Qg5 (%s)'%fen)
    pg.screenshot(path=OUT+'/crown_d4.png')
    # board 2: Rxe6+ Kf8
    ok(mv(2,'e1e6'),'Rxe6+ played'); pg.wait_for_timeout(800)
    # board 3: f4 then Re1+ -> immobile when standing on the board
    warp(12.6,25.2); ok(mv(3,'f2f4'),'f4 played'); pg.wait_for_timeout(900)
    s=st(); ok(s['imm'],'in check -> immobile %s'%s); pg.screenshot(path=OUT+'/crown_check.png')
    press('jump',300); s2=st(); ok(abs(s2['y']-s['y'])<0.05,'cannot jump while in check')
    ok(mv(3,'e2f2'),'Kf2 played'); pg.wait_for_timeout(900); s=st(); ok(not s['imm'],'out of check -> mobile again')
    ok(st()['cp']>=0,'checkpoint 1 crossed')
    # board 4: Bc3# -> super jump
    warp(17.5,42.05); ok(mv(4,'e1c3'),'Bc3 played'); s=st(); ok(s['sup']==1,'checkmate grants a super jump %s'%s)
    press('jump',400); s=st(); ok(s['y']<43,'normal jump does not pass the pawn rows %s'%s)
    press('action',80); ok(st()['armed'],'E arms the super jump')
    press('jump',500); pg.wait_for_timeout(700); s=st(); ok(s['y']>=45-0.01,'super jump went through the pawn rows %s'%s); pg.screenshot(path=OUT+'/crown_super.png')
    # respawn (hold reset) -> last checkpoint
    warp(16.5,34.3); pg.wait_for_timeout(300); press('reset',700); s=st(); ok(s['cp']==1 and s['y']<36 and s['y']>33,'reset -> checkpoint 2 %s'%s)
    # drag on the canvas = free cam
    bb=pg.query_selector('#game-canvas').bounding_box(); pg.mouse.move(bb['x']+200,bb['y']+300); pg.mouse.down(); pg.mouse.move(bb['x']+200,bb['y']+120,steps=6); pg.mouse.up(); pg.wait_for_timeout(300)
    ok(pg.evaluate(f"()=>{C}.cam.free"),'drag pans the free cam')
    # crown: warp onto the last king and jump
    warp(9.5,65.1); press('jump',350); pg.wait_for_timeout(1500); s=st(); ok(s['won'],'crown taken %s'%s)
    pg.wait_for_timeout(1200); pg.screenshot(path=OUT+'/crown_win.png')
    over=pg.evaluate("()=>{const m=document.querySelector('#over, .over, [id*=over]');return m?m.innerText.slice(0,120):''}")
    print('over:',over.replace('\n',' | '))
    print('console errors:',errs)
    ok(not errs,'no console errors')
    b.close()
print('RESULT', 'PASS' if not fails else 'FAIL %d'%len(fails))
