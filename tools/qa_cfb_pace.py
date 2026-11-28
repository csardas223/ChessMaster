"""cfb-pace: measure (reply_ms = [wall time, paced minimum]; offline the wall time includes the engine-load fallback) the bot's reply time (player move -> bot move committed) in human-persona modes and a 3D mode at 390
and 360; 0 app console errors. Run: python3 -m http.server 8467 & python3 tools/qa_cfb_pace.py"""
import sys
from playwright.sync_api import sync_playwright
URL = 'http://localhost:8467/'
import os
CASES = [c for c in [('wTudFnunSL0', True), ('Ag3KKsIrax4', True), ('IbRrzKtieqs', False)] if c[0] in os.environ.get('ONLY', c[0])]
NOISE = ('net::', 'Failed to load resource', 'ERR_', 'unavailable', 'blocked')
ok = True
JS = '''async () => { const c = CM.gameUI.controller; const res = [];
  for (let k = 0; k < 3; k++) {
    for (let w = 0; w < 100 && (c.busy || c.state.turn !== c.human); w++) await new Promise(r => setTimeout(r, 100));
    if (c.over) break;
    const m = c.moves.filter(m => m.f >= 0 && !m.cap)[0] || c.moves[0]; if (!m) break;
    const ply = c.state.ply; c.tryMove(m.f, m.t, false); const t0 = performance.now();
    for (let w = 0; w < 120 && c.state.ply <= ply + 1 && !c.over; w++) await new Promise(r => setTimeout(r, 20));
    res.push([Math.round(performance.now() - t0), CM.bot.lastPace]);
  }
  return { res, human: CM.bot.posesAsHuman(c.spec, c.opponent) }; }'''
with sync_playwright() as p:
    b = p.chromium.launch(args=['--use-gl=swiftshader', '--enable-unsafe-swiftshader'])
    for w, h in [(int(a.split("x")[0]), int(a.split("x")[1])) for a in (sys.argv[1:] or ["390x844", "360x780"])]:
        for vid, human in CASES:
            pg = b.new_page(viewport={'width': w, 'height': h}, is_mobile=True, has_touch=True)
            errs = []
            pg.on('console', lambda m: m.type == 'error' and errs.append(m.text))
            pg.on('pageerror', lambda e: errs.append('PAGEERROR ' + str(e)))
            pg.goto(URL + '#/play/' + vid); pg.wait_for_timeout(5000)
            pg.evaluate("() => { const t = document.querySelector('.tapstart'); if (t) t.click(); }"); pg.wait_for_timeout(1600)   # 'Tap to start' (sound needs a gesture); the bot waits 1 s after the start cue
            r = pg.evaluate(JS)
            app = [e for e in errs if not any(n in e for n in NOISE)]
            t = r['res']
            good = r['human'] == human and not app and t and (all(x[1] is not None and 600 <= x[1] <= 1800 and x[0] >= 550 for x in t) if human else all(x[1] is None for x in t))
            ok = ok and bool(good)
            print(("ok   " if good else 'FAIL ') + f'{w} {vid} human={r["human"]} reply_ms={t} errs={app[:2]}')
            pg.close()
    b.close()
sys.exit(0 if ok else 1)
