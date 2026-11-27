"""cfb-ava: no grey silhouette and no broken avatar image on the critic's modes (and a wider sample) at 390 and 360;
0 app console errors (blocked network requests are sandbox noise). Run: python3 -m http.server 8467 & python3 tools/qa_cfb_avatars.py"""
import sys, json
from playwright.sync_api import sync_playwright
URL = 'http://localhost:8467/'
IDS = sys.argv[1:] or ['wTudFnunSL0', 'E2x-QTgBD5k', 'CEkC0TINhm8', 'AvZiSnngZjA', 'IbRrzKtieqs', 'PszkLYudcws', 'nXpanP8v3pg', 'Ag3KKsIrax4', 'agJbUnr6PCQ']
NOISE = ('net::', 'Failed to load resource', 'ERR_', 'unavailable', 'blocked')
ok = True
with sync_playwright() as p:
    b = p.chromium.launch(args=['--use-gl=swiftshader', '--enable-unsafe-swiftshader'])
    for w, h in ((390, 844), (360, 780)):
        for vid in IDS:
            pg = b.new_page(viewport={'width': w, 'height': h}, is_mobile=True, has_touch=True)
            errs = []
            pg.on('console', lambda m: m.type == 'error' and errs.append(m.text))
            pg.on('pageerror', lambda e: errs.append('PAGEERROR ' + str(e)))
            pg.goto(URL + '#/play/' + vid); pg.wait_for_timeout(6000)
            r = pg.evaluate('''() => { const sel = '#botava, #youava, #opp-img, #others, #intro-ava, #go-you, #go-opp';
              const boxes = [...document.querySelectorAll(sel)];
              const sil = boxes.reduce((n, b) => n + b.querySelectorAll('.ava-def').length, 0);
              const broken = boxes.flatMap(b => [...b.querySelectorAll('img')]).filter(i => i.complete && !i.naturalWidth).map(i => i.getAttribute('src'));
              const top = document.querySelector('#botava'); return { sil, broken, top: top ? top.innerHTML.slice(0, 80) : '', name: (document.querySelector('#botname') || {}).textContent }; }''')
            app = [e for e in errs if not any(n in e for n in NOISE)]
            good = r['sil'] == 0 and not r['broken'] and not app
            ok = ok and good
            print(('ok   ' if good else 'FAIL ') + f"{w} {vid} opp={r['name']!r} sil={r['sil']} broken={r['broken']} errs={app[:2]} top={r['top'][:60]!r}")
            if w == 390: pg.screenshot(path=f'/workspace/work/cfb_ava_{vid}.png', clip={'x': 0, 'y': 0, 'width': w, 'height': 160})
            pg.close()
    b.close()
sys.exit(0 if ok else 1)
