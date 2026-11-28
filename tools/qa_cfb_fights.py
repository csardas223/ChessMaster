"""cfb-fights: Battle Chess 3D shows the 'New fights' / 'All fights' pill beside the speed pill, the choice persists, and
0 app console errors at 390 and 360. (The repeat-pair skip itself: js/fx/battle3d.js sequence(), B.seen.)
Run: python3 -m http.server 8467 & python3 tools/qa_cfb_fights.py [390x844 360x780]"""
import sys
from playwright.sync_api import sync_playwright
URL = 'http://localhost:8467/'
NOISE = ('net::', 'Failed to load resource', 'ERR_', 'unavailable', 'blocked', 'GL Driver', 'GPU stall', 'WebGL')
ok = True
with sync_playwright() as p:
    b = p.chromium.launch(args=['--use-gl=swiftshader', '--enable-unsafe-swiftshader'])
    for a in (sys.argv[1:] or ['390x844', '360x780']):
        w, h = map(int, a.split('x'))
        pg = b.new_page(viewport={'width': w, 'height': h}, is_mobile=True, has_touch=True)
        errs = []
        pg.on('console', lambda m: m.type == 'error' and errs.append(m.text))
        pg.on('pageerror', lambda e: errs.append('PAGEERROR ' + str(e)))
        pg.goto(URL + '#/play/IbRrzKtieqs'); pg.wait_for_timeout(5000)
        pg.evaluate("() => { const t = document.querySelector('.tapstart'); if (t) t.click(); }")
        try: pg.wait_for_selector('.b3-fights', timeout=25000)
        except Exception: pass
        r1 = pg.evaluate("() => { const f = document.querySelector('.b3-fights'); return f ? f.textContent : null; }")
        if r1: pg.evaluate("document.querySelector('.b3-fights').click()")
        r2 = pg.evaluate("() => [document.querySelector('.b3-fights') && document.querySelector('.b3-fights').textContent, localStorage.getItem('cm.battle3d.fights'), CM.battle3d.current() && CM.battle3d.current().allFights]")
        pg.screenshot(path=f'/workspace/work/cfb_fights_{w}.png')
        pg.evaluate("localStorage.removeItem('cm.battle3d.fights')")
        app = [e for e in errs if not any(n in e for n in NOISE)]
        good = r1 == 'New fights' and r2 == ['All fights', 'all', True] and not app
        ok = ok and good
        print(('ok   ' if good else 'FAIL ') + f'{w} default={r1!r} after_tap={r2} errs={app[:2]}')
        pg.close()
    b.close()
sys.exit(0 if ok else 1)
