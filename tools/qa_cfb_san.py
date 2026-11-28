"""cfb-san: the move list shows readable text, never raw engine tokens like '*@e6' or 'Bfo10'. Plays a few moves in
Backrooms (30-file board) and Atomic (normal SAN stays SAN), and labels a synthetic drop at 390 and 360; 0 app console errors.
Run: python3 -m http.server 8467 & python3 tools/qa_cfb_san.py [390x844 360x780]"""
import sys, re
from playwright.sync_api import sync_playwright
URL = 'http://localhost:8467/'
NOISE = ('net::', 'Failed to load resource', 'ERR_', 'unavailable', 'blocked')
JS = '''async () => { const c = CM.gameUI.controller; for (let k = 0; k < 4 && !c.over; k++) {
    for (let w = 0; w < 120 && (c.busy || c.state.turn !== c.human); w++) await new Promise(r => setTimeout(r, 100));
    const ms = c.moves; if (!ms.length || c.over) break; const m = ms[Math.floor(ms.length / 2)];
    if (m.f >= 0) c.tryMove(m.f, m.t, false); else if (c.commit) c.commit(m, {});
    await new Promise(r => setTimeout(r, 400)); }
  for (let w = 0; w < 60 && c.busy; w++) await new Promise(r => setTimeout(r, 100));
  const V = c.V, g = V.geo, ty = Object.keys(V.types), drop = { drop: ty.find(t => V.types[t].pawn) || ty[0], t: g.idx(4, 3), f: -1, c: c.human };
  const dl = CM.SpecGame.readableMove(V, drop, '*@e5');
  return { dl, cells: [...document.querySelectorAll('#moves .mv:not(.mv--empty)')].map(e => e.textContent), sans: c.sans.map(x => x.san) }; }'''
ok = True
with sync_playwright() as p:
    b = p.chromium.launch()
    for a in (sys.argv[1:] or ['390x844', '360x780']):
        w, h = map(int, a.split('x'))
        for vid in ('xp6Pr-rB4JA', 'wTudFnunSL0'):
            pg = b.new_page(viewport={'width': w, 'height': h}, is_mobile=True, has_touch=True)
            errs = []
            pg.on('console', lambda m: m.type == 'error' and errs.append(m.text))
            pg.on('pageerror', lambda e: errs.append('PAGEERROR ' + str(e)))
            pg.goto(URL + '#/play/' + vid); pg.wait_for_timeout(4500)
            pg.evaluate("() => { const t = document.querySelector('.tapstart'); if (t) t.click(); }")
            pg.wait_for_function('CM.gameUI && CM.gameUI.controller && CM.gameUI.controller.moves', timeout=20000); pg.wait_for_timeout(1200)
            r = pg.evaluate(JS)
            raw = [c for c in r['cells'] if '*' in c or re.fullmatch(r'[A-Z][a-z]{1,2}\d{1,2}', c) and vid == 'xp6Pr-rB4JA']
            app = [e for e in errs if not any(n in e for n in NOISE)]
            good = r['cells'] and not raw and not app and r['dl'] and ' on ' in r['dl']
            ok = ok and bool(good)
            print(('ok   ' if good else 'FAIL ') + f"{w} {vid} drop={r["dl"]!r} cells={r['cells'][:8]} sans={r['sans'][:8]} raw={raw} errs={app[:2]}")
            pg.close()
    b.close()
sys.exit(0 if ok else 1)
