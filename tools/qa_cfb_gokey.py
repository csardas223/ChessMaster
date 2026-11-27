"""cfb-gokey: the result card's key art never shows a broken image or an empty band (YouTube art blocked in the sandbox,
which is the offline case). Opens a mode, shows the result card, checks the band at 390 and 360; 0 app console errors.
Run: python3 -m http.server 8467 & python3 tools/qa_cfb_gokey.py"""
import sys
from playwright.sync_api import sync_playwright
URL = 'http://localhost:8467/'
NOISE = ('net::', 'Failed to load resource', 'ERR_', 'unavailable', 'blocked')
ok = True
with sync_playwright() as p:
    b = p.chromium.launch()
    for w, h in ((390, 844), (360, 780)):
        for vid in ('wTudFnunSL0', 'agJbUnr6PCQ'):
            pg = b.new_page(viewport={'width': w, 'height': h}, is_mobile=True, has_touch=True)
            errs = []
            pg.on('console', lambda m: m.type == 'error' and errs.append(m.text))
            pg.on('pageerror', lambda e: errs.append('PAGEERROR ' + str(e)))
            pg.goto(URL + '#/play/' + vid); pg.wait_for_timeout(4500)
            pg.evaluate("CM.gameUI.showOver({ result: 'loss', why: 'checkmate', opp: { name: 'Bot' } })"); pg.wait_for_timeout(2500)
            r = pg.evaluate('''() => { const k = document.querySelector('#gover .modal__key'); if (!k) return { none: true };
              const im = k.querySelector('img'); return { hidden: k.hidden, ph: k.classList.contains('is-ph'), text: k.textContent.trim(),
                broken: !!(im && im.complete && !im.naturalWidth), ok: !!(im && im.naturalWidth) }; }''')
            app = [e for e in errs if not any(n in e for n in NOISE)]
            good = not app and not r.get('broken') and (r.get('hidden') or r.get('ok') or (r.get('ph') and r.get('text')))
            ok = ok and bool(good)
            print(('ok   ' if good else 'FAIL ') + f'{w} {vid} {r} errs={app[:2]}')
            pg.screenshot(path=f'/workspace/work/cfb_gokey_{vid}_{w}.png')
            pg.close()
    b.close()
sys.exit(0 if ok else 1)
