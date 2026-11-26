# Horror-cine QA (fin-icm). Usage: see tools/qa_cine/README.md
import sys, os, time, threading, http.server, socketserver, functools, json
from playwright.sync_api import sync_playwright
ROOT=os.environ.get('ROOT', os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))); PORT=int(os.environ.get('PORT','8899'))
def serve():
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self,*a,**k): pass
    socketserver.TCPServer.allow_reuse_address=True
    with socketserver.TCPServer(('127.0.0.1',PORT),functools.partial(Q,directory=ROOT)) as s: s.serve_forever()
threading.Thread(target=serve,daemon=True).start(); time.sleep(0.4)
JS='''(()=>{const bad=[];document.getAnimations().forEach(a=>{const e=a.effect;if(!e||!e.getKeyframes)return;const t=e.target;const ks=e.getKeyframes();
 const mv=ks.some(k=>(k.transform&&k.transform!=='none'&&!/^translate\\(-50%, ?-50%\\)$/.test(k.transform))||k.scale&&k.scale!=='1'||k.letterSpacing||k.filter&&k.filter!=='none'||k.backgroundPosition);
 if(mv) bad.push((t&&t.className&&String(t.className.baseVal!=null?t.className.baseVal:t.className)).slice(0,40));});
 document.querySelectorAll('.cine-grain i').forEach(i=>{if(getComputedStyle(i).animationName!=='none')bad.push('grain-anim')});
 return bad})()'''
with sync_playwright() as p:
    b=p.chromium.launch()
    for mid in sys.argv[1].split(','):
        ctx=b.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True,reduced_motion='reduce'); pg=ctx.new_page()
        pg.goto(f'http://127.0.0.1:{PORT}/index.html#/play/'+mid); pg.wait_for_function('CM.app.current && CM.app.current.state',timeout=25000)
        pg.wait_for_selector('.cine-title',timeout=8000); pg.wait_for_timeout(300); a=pg.evaluate(JS)
        pg.evaluate('(()=>{const c=CM.horrorCine.active; c.dilate(CM.app.current.V.geo.parse("e4"),true); c.heartbeat(); c.flicker(3); c.blink&&c.R.extra==="blink"&&c.blink(); c.alarm(); c.ending("loss")})()'); pg.wait_for_timeout(250); b2=pg.evaluate(JS)
        print(mid, json.dumps({'intro':a,'beats':b2})); ctx.close()
    b.close()
