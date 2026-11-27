# Horror-cine QA (fin-icm). Usage: see tools/qa_cine/README.md
import sys, os, json, time, threading, http.server, socketserver, functools, random
from playwright.sync_api import sync_playwright
ROOT=os.environ.get('ROOT', os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))); PORT=int(os.environ.get('PORT','8881'))
TAPSTART="() => { const t = document.querySelector('.tapstart'); if (t) { t.click(); return 'tap'; } if (!(CM.loader && CM.loader.isVisible && CM.loader.isVisible()) && !(CM.gameUI && CM.gameUI.waitingStart)) return 'none'; return false; }"
def serve():
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self,*a,**k): pass
    socketserver.TCPServer.allow_reuse_address=True
    with socketserver.TCPServer(('127.0.0.1',PORT),functools.partial(Q,directory=ROOT)) as s: s.serve_forever()
threading.Thread(target=serve,daemon=True).start(); time.sleep(0.4)
IGN=('i.ytimg.com','unpkg','ERR_','407','jsdelivr','Proxy','maia','raw.githubusercontent')
modes=sys.argv[1].split(','); N=int(sys.argv[2]) if len(sys.argv)>2 else 5; RM=os.environ.get('RM')=='1'; SHOT=os.environ.get('SHOT')=='1'
with sync_playwright() as p:
    b=p.chromium.launch()
    for mid in modes:
        ctx=b.new_context(viewport={'width':390,'height':844},device_scale_factor=2,is_mobile=True,has_touch=True,reduced_motion='reduce' if RM else 'no-preference')
        pg=ctx.new_page(); errs=[]
        pg.on('console',lambda m: errs.append(m.text[:240]) if m.type in('error','warning') and ('[cine]' in m.text or m.type=='error') and not any(s in m.text for s in IGN) else None)
        pg.on('pageerror',lambda e: errs.append('PAGEERR '+str(e)[:300]))
        r={'moves':0}
        try:
            pg.goto(f'http://127.0.0.1:{PORT}/index.html#/play/'+mid); pg.wait_for_function('CM.app.current && CM.app.current.state',timeout=25000)
            try: pg.wait_for_function(TAPSTART,timeout=30000)   # direct opens wait on the "Tap to start" plate (js/ui/game-ui.js)
            except Exception: pass
            try: pg.wait_for_selector('.cine-title',timeout=5000); pg.wait_for_timeout(650)
            except Exception: pass
            r['intro']=pg.evaluate('({title:!!document.querySelector(".cine-title"), bars:!!document.querySelector(".cine-bars"), txt:(document.querySelector(".cine-title b")||{}).textContent})')
            if SHOT: pg.screenshot(path=f'{OUT}/cine_{mid}_intro.png')
            pg.wait_for_timeout(1800)
            r['amb']=pg.evaluate('({grain:!!document.querySelector(".cine-grain"), vig:Object.keys(CM.gameUI.vfx.persist).join(","), title_left:!!document.querySelector(".cine-title")})')
            for k in range(N):
                pg.wait_for_function('(()=>{const g=CM.app.current; return g.over || (g.state.turn===g.human && !g.busy && g.moves.length)})()',timeout=30000)
                if pg.evaluate('!!CM.app.current.over'): break
                mv=pg.evaluate('''(()=>{const g=CM.app.current; const ms=g.moves.filter(m=>m.f>=0); const caps=ms.filter(m=>m.cap); const m=(caps.length&&Math.random()<.6?caps:ms)[Math.floor(Math.random()*(caps.length&&Math.random()<.6?caps:ms).length)]||ms[0]; return [m.f,m.t]})()''')
                h0=pg.evaluate('CM.app.current.history.length')
                for i in mv:
                    c=pg.evaluate(f'(()=>{{const r=CM.gameUI.board.rectOf({i}); return [r.left+r.width/2,r.top+r.height/2]}})()'); pg.touchscreen.tap(c[0],c[1]); pg.wait_for_timeout(160)
                pg.wait_for_timeout(250)
                pk=pg.query_selector('#promo button')
                if pk and pk.is_visible(): pk.tap(); pg.wait_for_timeout(200)
                if pg.evaluate('CM.app.current.history.length')>h0: r['moves']+=1
            pg.wait_for_timeout(600)
            # force a dilation beat + heartbeat directly to exercise them
            pg.evaluate('(()=>{const a=CM.horrorCine.active; if(a){a.dilate(CM.app.current.V.geo.parse("e4"),true); a.heartbeat(); a.flicker(2); if(a.blink) a.blink(); a.alarm();}})()')
            pg.wait_for_timeout(1300)
            if not pg.evaluate('!!CM.app.current.over'):
                pg.wait_for_function('(()=>{const g=CM.app.current; return g.over || !g.busy})()',timeout=30000)
                pg.evaluate('document.getElementById("resign").click()'); pg.wait_for_timeout(300); pg.evaluate('document.getElementById("resign").click()')
            pg.wait_for_timeout(1100)
            if SHOT: pg.screenshot(path=f'{OUT}/cine_{mid}_end.png')
            r['end']=pg.evaluate('({over:JSON.stringify(CM.app.current.over), cap:(document.querySelector(".cine-caption")||{}).textContent||null, dead:document.getElementById("board").classList.contains("cine-dead"), scare:!!document.querySelector(".fx-jumpscare")})')
            # new game clears the layer
            pg.evaluate('CM.app.current.newGame()'); pg.wait_for_timeout(500)
            r['cleared']=pg.evaluate('!document.getElementById("board").classList.contains("cine-dead") && !document.querySelector(".cine-caption")')
        except Exception as e: r['exc']=str(e)[:300]
        r['errors']=errs[:6]
        print(mid, json.dumps(r), flush=True)
        ctx.close()
    b.close()
