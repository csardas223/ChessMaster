"""qa_pol: critic leftovers (Shotgun stats line, lobby date/titles, Fog name/chips, SCP-4975 sprite, Spell ice/board).
Loads each route at 390x844 and 360x780, prints a probe, screenshots to --out, counts app console errors.
Run: python3 -m http.server 8791 & python3 tools/qa_pol.py --base http://localhost:8791/ [route ...]"""
import sys, json, argparse
from playwright.sync_api import sync_playwright
ap = argparse.ArgumentParser(); ap.add_argument('--base', default='http://localhost:8791/'); ap.add_argument('--out', default='/workspace/work/qa_pol')
ap.add_argument('--wait', type=int, default=6000); ap.add_argument('--js', default=''); ap.add_argument('routes', nargs='*')
a = ap.parse_args()
import os; os.makedirs(a.out, exist_ok=True)
NOISE = ('net::', 'Failed to load resource', 'ERR_', 'unavailable', 'blocked')
PROBE = a.js or '''() => ({ status: (document.querySelector('#status') || {}).textContent, you: (document.querySelector('#youname') || {}).textContent,
  opp: (document.querySelector('#botname') || {}).textContent })'''
bad = 0
with sync_playwright() as p:
    b = p.chromium.launch(args=['--use-gl=swiftshader', '--enable-unsafe-swiftshader'])
    for w, h in ((390, 844), (360, 780)):
        for r in a.routes or ['#/play/AvZiSnngZjA']:
            pg = b.new_page(viewport={'width': w, 'height': h}, is_mobile=True, has_touch=True, device_scale_factor=2)
            errs = []
            pg.on('console', lambda m: m.type == 'error' and errs.append(m.text))
            pg.on('pageerror', lambda e: errs.append('PAGEERROR ' + str(e)))
            pg.goto(a.base + r); pg.wait_for_timeout(a.wait)
            res = pg.evaluate(PROBE)
            app = [e for e in errs if not any(n in e for n in NOISE)]
            bad += len(app)
            name = r.replace('#/', '').replace('/', '_').replace('?', '_')
            pg.screenshot(path=f'{a.out}/{name}_{w}.png')
            print(w, r, 'errs=%d' % len(app), app[:2], json.dumps(res)[:400])
            pg.close()
    b.close()
sys.exit(1 if bad else 0)
