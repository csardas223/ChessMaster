# Horror-cine QA (fin-icm). Usage: see tools/qa_cine/README.md
import sys, os, time, threading, http.server, socketserver, functools
from playwright.sync_api import sync_playwright
ROOT=os.environ.get('ROOT', os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))); PORT=int(os.environ.get('PORT','8883'))
TAPSTART="() => { const t = document.querySelector('.tapstart'); if (t) { t.click(); return 'tap'; } if (!(CM.loader && CM.loader.isVisible && CM.loader.isVisible()) && !(CM.gameUI && CM.gameUI.waitingStart)) return 'none'; return false; }"
def serve():
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self,*a,**k): pass
    socketserver.TCPServer.allow_reuse_address=True
    with socketserver.TCPServer(('127.0.0.1',PORT),functools.partial(Q,directory=ROOT)) as s: s.serve_forever()
threading.Thread(target=serve,daemon=True).start(); time.sleep(0.4)
modes=sys.argv[1].split(','); T=int(os.environ.get('T','1300')); CAP=os.environ.get('CAP','loss')
with sync_playwright() as p:
    b=p.chromium.launch()
    for mid in modes:
        ctx=b.new_context(viewport={'width':390,'height':844},device_scale_factor=1,is_mobile=True,has_touch=True)
        pg=ctx.new_page(); errs=[]; pg.on('pageerror',lambda e: errs.append(str(e)[:200]))
        pg.goto(f'http://127.0.0.1:{PORT}/index.html#/play/'+mid); pg.wait_for_function('CM.app.current && CM.app.current.state',timeout=25000)
        try: pg.wait_for_function(TAPSTART,timeout=30000)   # direct opens wait on the "Tap to start" plate (js/ui/game-ui.js)
        except Exception: pass
        pg.wait_for_selector('.cine-title',timeout=8000)
        pg.evaluate(f'document.getAnimations().forEach(a=>{{try{{a.pause(); a.currentTime={T}}}catch(e){{}}}})'); pg.wait_for_timeout(100)
        pg.screenshot(path=f'{OUT}/st_{mid}_t.png', clip={'x':0,'y':120,'width':390,'height':440})
        pg.evaluate('document.getAnimations().forEach(a=>a.finish&&(()=>{try{a.finish()}catch(e){}})())'); pg.wait_for_timeout(300)
        pg.evaluate(f'(()=>{{const a=CM.horrorCine.active; a.R.scare=null; a.ending("{CAP}")}})()'); pg.wait_for_timeout(50)
        pg.evaluate('document.querySelectorAll(".cine-caption").forEach(c=>c.getAnimations().forEach(a=>{a.pause(); a.currentTime=300+1300}))'); pg.wait_for_timeout(100)
        pg.screenshot(path=f'{OUT}/st_{mid}_c.png', clip={'x':0,'y':120,'width':390,'height':440})
        print(mid, errs); ctx.close()
    b.close()
