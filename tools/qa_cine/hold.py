# Horror-cine QA (fin-icm). Usage: see tools/qa_cine/README.md
import sys, os, time, threading, http.server, socketserver, functools, json
from playwright.sync_api import sync_playwright
ROOT=os.environ.get('ROOT', os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))); PORT=8977
TAPSTART="() => { const t = document.querySelector('.tapstart'); if (t) { t.click(); return 'tap'; } if (!(CM.loader && CM.loader.isVisible && CM.loader.isVisible()) && !(CM.gameUI && CM.gameUI.waitingStart)) return 'none'; return false; }"
def serve():
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self,*a,**k): pass
    socketserver.TCPServer.allow_reuse_address=True
    with socketserver.TCPServer(('127.0.0.1',PORT),functools.partial(Q,directory=ROOT)) as s: s.serve_forever()
threading.Thread(target=serve,daemon=True).start(); time.sleep(0.4)
with sync_playwright() as p:
    b=p.chromium.launch(args=['--enable-gpu-rasterization'])
    for mid in ['-fax07t_o5s','xp6Pr-rB4JA','U67wZoy-1fE']:
        ctx=b.new_context(viewport={'width':390,'height':844},device_scale_factor=2.75,is_mobile=True,has_touch=True); pg=ctx.new_page()
        pg.goto(f'http://127.0.0.1:{PORT}/index.html#/play/'+mid); pg.wait_for_function('CM.app.current && CM.app.current.state',timeout=25000)
        try: pg.wait_for_function(TAPSTART,timeout=30000)   # direct opens wait on the "Tap to start" plate (js/ui/game-ui.js)
        except Exception: pass
        pg.wait_for_selector('.cine-title',timeout=10000)
        ft=pg.evaluate('new Promise(r=>{const t=[];let l=performance.now();function f(n){t.push(n-l);l=n;if(t.length<120)requestAnimationFrame(f);else{t.sort((a,b)=>a-b);r({p50:t[60].toFixed(1),p95:t[114].toFixed(1),max:t[119].toFixed(1)})}}requestAnimationFrame(f)})')
        pg.wait_for_timeout(2500)
        pg.evaluate('document.getElementById("resign").click()'); pg.wait_for_timeout(200); pg.evaluate('document.getElementById("resign").click()')
        pg.wait_for_timeout(1200); a=pg.evaluate('document.getElementById("gover").classList.contains("is-open")')
        pg.wait_for_timeout(2400); c=pg.evaluate('document.getElementById("gover").classList.contains("is-open")')
        print(mid, 'frames(ms)',ft,'modal@1.4s',a,'modal@3.8s',c); ctx.close()
    b.close()
