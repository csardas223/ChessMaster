"""QA for the Under construction template (js/lobby/hype.js + css/hype.css, templates/under-construction/README.md).
Injects a fake coming-soon video (uploaded after FEATURED.date, with a `build` checklist and an `accent`) into data/videos.js
on the fly (nothing on disk changes), then at each size checks: the coming-soon banner took the hero slot from the
featured mode, the banner says "n of 6 built", the screen lists all 6 parts with the right done states, the accent is
applied, the page does not scroll sideways, and the console is clean. Without --fake it checks the real lobby only.
  python3 tools/qa_under_construction.py [--out /tmp/qa_uc] [--sizes 390x844,360x780,360x374] [--port 8861]"""
import os, json, time, threading, http.server, socketserver, functools, argparse, re
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ap = argparse.ArgumentParser(); ap.add_argument('--out', default='/tmp/qa_uc'); ap.add_argument('--sizes', default='390x844,360x780,360x374')
ap.add_argument('--port', type=int, default=8861)
args = ap.parse_args(); os.makedirs(args.out, exist_ok=True)
NOISE = re.compile(r'407|ERR_TUNNEL|ERR_FAILED|net::|unpkg|jsdelivr|Failed to load resource|youtube|ytimg', re.I)
FAKE = {'id': 'HuZlhHnES7M', 'title': 'Chess, But SCP-4975 Is Trying to Crack You', 'date': '2099-01-01', 'dur': 972, 'coming_soon': True,
        'teaser': 'Template check: a coming-soon entry with a build list.', 'accent': '#c9483c',
        'build': {'rules': True, 'board': True, 'art': False, 'characters': True, 'sound': False, 'qa': False}}
from playwright.sync_api import sync_playwright
def serve():
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a, **k): pass
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(('127.0.0.1', args.port), functools.partial(Q, directory=ROOT)) as s: s.serve_forever()
threading.Thread(target=serve, daemon=True).start(); time.sleep(0.4)
base = f'http://127.0.0.1:{args.port}/index.html'
src = open(os.path.join(ROOT, 'data/videos.js')).read()
fake_js = src.replace('window.CM_DATA.videos=[', 'window.CM_DATA.videos=[' + json.dumps(FAKE) + ',', 1)
fails = []
with sync_playwright() as p:
    b = p.chromium.launch(args=['--disable-gpu'])
    for size in args.sizes.split(','):
        w, h = map(int, size.split('x'))
        ctx = b.new_context(viewport={'width': w, 'height': h}, device_scale_factor=2.6 if w <= 412 else 1, has_touch=w <= 412, is_mobile=w <= 412)
        ctx.route(re.compile(r'https?://(?!127\.0\.0\.1).*'), lambda r: r.abort())
        ctx.route('**/data/videos.js*', lambda r: r.fulfill(status=200, content_type='application/javascript', body=fake_js))
        pg = ctx.new_page(); errs = []
        pg.on('console', lambda m: m.type == 'error' and not NOISE.search(m.text) and errs.append(m.text[:200]))
        pg.on('pageerror', lambda e: errs.append('pageerror: ' + str(e)[:200]))
        pg.goto(base + '#/', timeout=30000)
        pg.wait_for_selector('#hype-banner', timeout=30000); pg.wait_for_timeout(900)
        r = pg.evaluate("""() => { const b = document.getElementById('hype-banner'), f = document.getElementById('featured');
          return { banner: b && !b.hidden, featured: !!(f && f.innerHTML.trim() && !f.hidden), n: (b.querySelector('.hype-status__n') || {}).textContent || '',
            accent: getComputedStyle(b).getPropertyValue('--uc-accent').trim(), sw: document.documentElement.scrollWidth }; }""")
        if not r['banner']: fails.append(f'{size}: banner not shown')
        if r['featured']: fails.append(f'{size}: featured hero still shown over a newer coming-soon video')
        if r['n'] != '3 of 6 built': fails.append(f'{size}: banner count {r["n"]!r}')
        if r['accent'] != '#c9483c': fails.append(f'{size}: accent {r["accent"]!r}')
        if r['sw'] > w: fails.append(f'{size}: lobby {r["sw"]} px wide')
        r2 = pg.evaluate("(() => { const r = document.getElementById('hype-banner').getBoundingClientRect(); return [r.top, r.height, document.getElementById('hype-banner').parentElement.id]; })()")
        print(size, r, r2)
        if r2[0] > 260: fails.append(f'{size}: banner starts at y={r2[0]:.0f}, not in the hero slot')
        pg.wait_for_timeout(100)
        pg.screenshot(path=os.path.join(args.out, f'banner_{size}.png'))
        pg.click('#hype-banner .hype-banner__hit'); pg.wait_for_selector('.hype-screen.is-in', timeout=5000); pg.wait_for_timeout(500)
        s = pg.evaluate("""() => { const sc = document.querySelector('.hype-screen');
          return { items: [...sc.querySelectorAll('.hype-build__i')].map(i => [i.querySelector('.hype-build__l').textContent, i.classList.contains('is-done')]),
            sw: document.documentElement.scrollWidth, over: [...sc.querySelectorAll('*')].filter(e => !e.closest('.hype-banner__stripe') && e.getBoundingClientRect().right > innerWidth + 0.5).map(e => e.className).slice(0, 4) }; }""")
        want = [['Rules', True], ['Board and setup', True], ['Art', False], ['Characters and opponent', True], ['Sound', False], ['Phone QA', False]]
        if s['items'] != want: fails.append(f'{size}: build list {s["items"]}')
        if s['over']: fails.append(f'{size}: past the viewport: {s["over"]}')
        pg.screenshot(path=os.path.join(args.out, f'screen_{size}.png'))
        pg.evaluate("document.querySelector('.hype-screen__scroll').scrollTo(0, 1e5)"); pg.wait_for_timeout(250)
        pg.screenshot(path=os.path.join(args.out, f'screen_{size}_end.png'))
        if errs: fails.append(f'{size}: console: ' + ' | '.join(errs[:4]))
        ctx.close()
    b.close()
print('FAILS' if fails else 'PASS', fails)
