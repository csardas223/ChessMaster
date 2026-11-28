"""cfb-lobby: the lobby tab strip is one list of <= 8 groups; every mode sits in exactly one tab, the tab counts sum to the
All count, every Type option is reachable, search + sort still work. 0 app console errors at 390 and 360.
Run: python3 -m http.server 8467 & python3 tools/qa_cfb_tabs.py"""
import sys
from playwright.sync_api import sync_playwright
URL = 'http://localhost:8467/'
ok = True
def chk(c, m):
    global ok
    print(('ok   ' if c else 'FAIL ') + m); ok = ok and c
with sync_playwright() as p:
    b = p.chromium.launch()
    for w, h in ((390, 844), (360, 780)):
        pg = b.new_page(viewport={'width': w, 'height': h}, is_mobile=True, has_touch=True)
        errs = []
        pg.on('console', lambda m: m.type == 'error' and errs.append(m.text))
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto(URL); pg.wait_for_function('window.CM && CM.lobby && CM.lobby.list.length > 0'); pg.wait_for_timeout(800)
        r = pg.evaluate('''() => { const L = CM.lobby, tabs = [...document.querySelectorAll('#tabs [data-tab]')].map(b => b.dataset.tab);
          const per = {}; tabs.filter(t => t !== 'all').forEach(t => per[t] = L.list.filter(v => L.inTab(v, t)).length);
          const homeless = L.list.filter(v => tabs.filter(t => t !== 'all' && L.inTab(v, t)).length !== 1).map(v => v.id);
          const kinds = [...document.querySelectorAll('#kind option')].map(o => o.value).filter(Boolean);
          const kindless = L.list.filter(v => v.kind && kinds.indexOf(v.kind) < 0).map(v => v.id);
          return { tabs, per, total: L.list.length, homeless, kinds, kindless,
            ow: document.documentElement.scrollWidth > innerWidth + 1 }; }''')
        print(w, r['per'], 'total', r['total'])
        chk(len(r['tabs']) <= 8, f"{w}: {len(r['tabs'])} tabs <= 8 ({r['tabs']})")
        chk(sum(r['per'].values()) == r['total'], f"{w}: tab counts sum {sum(r['per'].values())} == total {r['total']}")
        chk(not r['homeless'], f"{w}: every mode in exactly one tab ({len(r['homeless'])} not)")
        chk(not r['kindless'], f"{w}: every type reachable in the Type picker ({len(r['kinds'])} types)")
        chk(not r['ow'], f"{w}: no sideways overflow")
        # each tab lists its count; Type filter narrows inside a tab; search + sort
        for t, n in r['per'].items():
            pg.click(f'#tabs [data-tab="{t}"]'); pg.wait_for_timeout(80)
            shown = pg.evaluate('CM.lobby._feed.length'); chk(shown == n, f'{w}: tab {t} lists {shown} == {n}')
        pg.click('#tabs [data-tab="Rule Twists"]'); pg.select_option('#kind', 'Dice'); pg.wait_for_timeout(80)
        chk(pg.evaluate("CM.lobby._feed.every(v => v.kind === 'Dice') && CM.lobby._feed.length > 0"), f'{w}: Rule Twists + Dice filter')
        pg.click('#tabs [data-tab="all"]'); pg.select_option('#kind', '3D'); pg.wait_for_timeout(80)
        chk(pg.evaluate("CM.lobby._feed.length > 0 && CM.lobby._feed.every(v => v.tags.includes('3D'))"), f'{w}: 3D type filter')
        pg.select_option('#kind', ''); pg.fill('#q', 'atomic'); pg.wait_for_timeout(150)
        chk(pg.evaluate("CM.lobby._feed.length > 0 && CM.lobby._feed.every(v => v.s.includes('atomic'))"), f'{w}: search atomic')
        pg.fill('#q', ''); pg.select_option('#sort', 'az'); pg.wait_for_timeout(100)
        chk(pg.evaluate("(() => { const f = CM.lobby._feed.map(v => CM.util.norm(v.title)); return f.every((x, i) => !i || f[i-1].localeCompare(x) <= 0); })()"), f'{w}: sort A to Z')
        pg.select_option('#sort', 'new')
        pg.evaluate('scrollTo(0,0)'); pg.wait_for_timeout(100)
        pg.screenshot(path=f'/workspace/work/cfb_lobby_{w}.png')
        app = [e for e in errs if 'ERR_' not in e and 'net::' not in e and 'Failed to load resource' not in e]
        chk(not app, f'{w}: 0 app console errors {app[:3]}')
        pg.evaluate("localStorage.clear()")
        pg.close()
    b.close()
sys.exit(0 if ok else 1)
