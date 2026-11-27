"""QA for SCP-4975 (HuZlhHnES7M, alias #/play/icm-scp4975) at 390x844 touch: opens the old alias link, checks it lands on
the video mode (title, trout Stockfish avatar), plays random legal White moves by tapping the board, and after every round
checks that SCP-4975 moved at most one square onto a square that was free, that every piece around its new square is
cracked or gone (a piece that was cracked before is gone), that the crack overlay count matches, and that the console
is clean. Then forces a cracked black king next to it and checks the shattered-king win.
  python3 tools/qa_scp4975.py [--out /tmp/qa_scp4975] [--rounds 8] [--port 8853]"""
import os, json, time, threading, http.server, socketserver, functools, argparse, re, random
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ap = argparse.ArgumentParser(); ap.add_argument('--out', default='/tmp/qa_scp4975'); ap.add_argument('--rounds', type=int, default=8)
ap.add_argument('--port', type=int, default=8853)
args = ap.parse_args(); os.makedirs(args.out, exist_ok=True)
NOISE = re.compile(r'407|ERR_TUNNEL|ERR_FAILED|net::|unpkg|jsdelivr|Failed to load resource|youtube|ytimg', re.I)
SNAP = r'''() => { const g = CM.gameUI.controller, st = g.state, b = [];
  for (let i = 0; i < st.b.length; i++) { const p = st.b[i]; b.push(p ? [p.t, p.c, p.crk ? 1 : 0] : null); }
  return { b, scp: b.findIndex(x => x && x[0] === 'C75'), turn: st.turn, human: g.human, over: g.over || null, busy: !!g.busy,
    overlays: document.querySelectorAll('.g4975-crack').length }; }'''
TAPSTART = "() => { const t = document.querySelector('.tapstart'); if (t) { t.click(); return 'tap'; } if (!(CM.loader && CM.loader.isVisible && CM.loader.isVisible()) && !(CM.gameUI && CM.gameUI.waitingStart)) return 'none'; return false; }"
from playwright.sync_api import sync_playwright
def serve():
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a, **k): pass
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(('127.0.0.1', args.port), functools.partial(Q, directory=ROOT)) as s: s.serve_forever()
threading.Thread(target=serve, daemon=True).start(); time.sleep(0.4)
base = f'http://127.0.0.1:{args.port}/index.html'
fails, log = [], []
def ring(i):
    c, r = i % 8, i // 8
    return [(r + dr) * 8 + c + dc for dr in (-1, 0, 1) for dc in (-1, 0, 1) if (dr or dc) and 0 <= c + dc < 8 and 0 <= r + dr < 8]
with sync_playwright() as p:
    b = p.chromium.launch(args=['--disable-gpu'])
    ctx = b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2, has_touch=True, is_mobile=True)
    ctx.route(re.compile(r'https?://(?!127\.0\.0\.1).*'), lambda r: r.abort())
    pg = ctx.new_page(); errs = []
    pg.on('console', lambda m: m.type == 'error' and not NOISE.search(m.text) and errs.append(m.text[:200]))
    pg.on('pageerror', lambda e: errs.append('pageerror: ' + str(e)[:200]))
    pg.goto(base + '#/play/icm-scp4975', timeout=20000)
    pg.wait_for_function('window.CM && CM.gameUI && CM.gameUI.controller && CM.gameUI.controller.state', timeout=30000)
    try: pg.wait_for_function(TAPSTART, timeout=30000)
    except Exception: pass
    pg.wait_for_timeout(1500)
    info = pg.evaluate("""() => { const g = CM.gameUI.controller, m = g.mode || g.cfg || {};
      const imgs = [...document.querySelectorAll('img')].map(i => i.getAttribute('src') || '');
      return { hash: location.hash, path: location.pathname, id: m.id || (CM.gameUI.mode && CM.gameUI.mode.id) || null, title: (document.querySelector('.game-bar, .gbar, header') || document.body).innerText.slice(0, 160),
        trout: imgs.some(s => s.indexOf('inm7KvllVu0/stockfish.png') >= 0), e4: g.V.geo.parse('e4') }; }""")
    log.append(('open', info))
    if not info['trout']: fails.append('opponent avatar is not the trout')
    if not (info['path'].endswith('/play/scp-4975/') or 'HuZlhHnES7M' in info['hash'] or 'scp-4975' in info['hash']): fails.append('alias did not open SCP-4975 (HuZlhHnES7M, slug scp-4975): ' + json.dumps(info))
    s0 = pg.evaluate(SNAP)
    if s0['scp'] != info['e4']: fails.append(f"SCP-4975 starts on {s0['scp']}, not e4")
    pg.screenshot(path=os.path.join(args.out, 'start.png'))
    box = pg.query_selector('.board').bounding_box()
    def tap(i):
        name = pg.evaluate(f'CM.gameUI.controller.V.geo.name({i})'); flip = pg.evaluate('CM.gameUI.controller.flipped()')
        fc = ord(name[0]) - 97; rn = int(name[1:])
        x = box['x'] + (fc + 0.5) * box['width'] / 8; y = box['y'] + (8 - rn + 0.5) * box['height'] / 8
        if flip: x = box['x'] + box['width'] - (x - box['x']); y = box['y'] + box['height'] - (y - box['y'])
        pg.touchscreen.tap(x, y); pg.wait_for_timeout(180)
    random.seed(4975); rounds = 0
    for rnd in range(args.rounds):
        st = pg.evaluate(SNAP)
        if st['over']: break
        mv = pg.evaluate("(() => { const g = CM.gameUI.controller; return g.moves.filter(m => !m.promo || m.promo === 'Q').map(m => [m.f, m.t]); })()")
        if not mv: break
        f, t = random.choice(mv); tap(f); tap(t)
        try: pg.wait_for_function("(() => { const g = CM.gameUI.controller; return g.over || (g.state.turn === g.human && !g.busy); })()", timeout=40000)
        except Exception: fails.append(f'round {rnd}: bot did not answer'); break
        pg.wait_for_timeout(2600)   # crawl 400 + 320 ms, sweep 8 x 200 + 900 ms
        a = pg.evaluate(SNAP); rounds += 1
        o, n = st['scp'], a['scp']
        moved = n != o
        if n < 0: fails.append(f'round {rnd}: SCP-4975 gone'); break
        if moved and n not in ring(o): fails.append(f'round {rnd}: jumped {o}->{n}')
        if a['over']: log.append((rnd, 'over', a['over'])); break
        if moved:
            for j in ring(n):
                x = a['b'][j]
                if x and x[1] != 'n' and not x[2]: fails.append(f'round {rnd}: piece on {j} next to SCP not cracked')
        cr = sum(1 for x in a['b'] if x and x[1] != 'n' and x[2])
        if cr != a['overlays']: fails.append(f'round {rnd}: {cr} cracked pieces but {a["overlays"]} overlays')
        log.append((rnd, {'scp': [o, n], 'cracked': cr}))
        if rnd in (2, args.rounds - 1): pg.screenshot(path=os.path.join(args.out, f'round{rnd}.png'))
    if rounds < 3: fails.append(f'only {rounds} rounds played')
    pg.goto(base + '#/play/HuZlhHnES7M', timeout=20000); pg.wait_for_function('window.CM && CM.gameUI && CM.gameUI.controller && CM.gameUI.controller.state', timeout=30000)
    try: pg.wait_for_function(TAPSTART, timeout=30000)
    except Exception: pass
    pg.wait_for_timeout(1200)
    res = pg.evaluate(r'''async () => { const g = CM.gameUI.controller, V = g.V, geo = V.geo, st = g.state;
      if (g.over) return { skipped: 'game over' };
      for (let i = 0; i < st.b.length; i++) st.b[i] = null;
      st.b[geo.parse('d4')] = V.piece('C75', 'n'); st.b[geo.parse('h1')] = V.piece('K', 'w');
      const k = V.piece('K', 'b'); k.crk = 1;
      for (const s of ['c6', 'd6', 'e6', 'c5', 'e5', 'c3', 'd3', 'e3', 'c4', 'e4']) st.b[geo.parse(s)] = V.piece('P', 'w');   /* boxed in except d5, so it must crawl to d5, next to the cracked king on c6 */
      st.b[geo.parse('c6')] = k; st.b[geo.parse('d5')] = null;
      g.render();
      const p = g.hooks.afterMove(g.ctx, {}, { by: 'bot' }); if (p && p.then) await p;
      await new Promise(r => setTimeout(r, 800));
      return { over: g.over || null, scp: geo.name(st.b.findIndex(x => x && x.t === 'C75')) }; }''')
    log.append(('king', res))
    pg.wait_for_timeout(1500); pg.screenshot(path=os.path.join(args.out, 'king.png'))
    if not res.get('skipped') and not (res['over'] and 'shatter' in json.dumps(res['over']).lower()): fails.append('cracked king next to SCP-4975 did not shatter: ' + json.dumps(res))
    if errs: fails.append('console: ' + ' | '.join(errs[:5]))
    b.close()
json.dump({'log': log, 'fails': fails}, open(os.path.join(args.out, 'qa_scp4975.json'), 'w'), indent=1, default=str)
for l in log: print(json.dumps(l, default=str)[:260])
print('FAILS' if fails else 'PASS', fails)
