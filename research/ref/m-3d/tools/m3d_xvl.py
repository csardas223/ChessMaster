import sys, time, subprocess
from playwright.sync_api import sync_playwright
root, port, out = sys.argv[1], int(sys.argv[2]), sys.argv[3]
srv = subprocess.Popen([sys.executable,'-m','http.server',str(port),'-d',root],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL); time.sleep(1)
errs=[]
with sync_playwright() as p:
    b = p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
    pg = b.new_context(viewport={'width':390,'height':844}, is_mobile=True, has_touch=True).new_page()
    pg.on('pageerror', lambda e: errs.append(str(e)[:200])); pg.on('console', lambda m: errs.append(m.text[:200]) if m.type=='error' else None)
    pg.goto(f'http://127.0.0.1:{port}/index.html#/play/xvlHij1tgk8'); pg.wait_for_timeout(9000)
    # freeze rAF so the screenshot can settle
    pg.evaluate("() => { window.requestAnimationFrame = () => 0; }"); pg.wait_for_timeout(1500)
    pg.screenshot(path=out, timeout=150000); print('OK', [e for e in errs if 'TUNNEL' not in e and '407' not in e][:5])
    b.close()
srv.terminate()
