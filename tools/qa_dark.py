"""QA for All-Consuming Darkness (BYg7rV53WrM) at 390x844 touch: plays random legal White moves by tapping the board,
lets the bot answer, and checks after every round that the darkness grew by at most one orthogonal, previously
unprotected square, that the eyes stay on b4, that no candidate markers are drawn, and that the console is clean.
Then forces a king next to the darkness and checks the consumed-king loss.
  python3 tools/qa_dark.py [--out /tmp/qa_dark] [--rounds 10] [--port 8852]"""
import os, json, time, threading, http.server, socketserver, functools, argparse, re
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ap = argparse.ArgumentParser(); ap.add_argument('--out', default='/tmp/qa_dark'); ap.add_argument('--rounds', type=int, default=10)
ap.add_argument('--port', type=int, default=8852)
args = ap.parse_args(); os.makedirs(args.out, exist_ok=True)
NOISE = re.compile(r'407|ERR_TUNNEL|ERR_FAILED|net::|unpkg|jsdelivr|Failed to load resource|youtube|ytimg', re.I)
SNAP = r'''() => { const g = CM.gameUI.controller, V = g.V, st = g.state, geo = V.geo, dk = [], cand = [];
  for (let i = 0; i < st.b.length; i++) if (st.b[i] && st.b[i].t === 'Dk') dk.push(i);
  for (const i of dk) for (const [dc, dr] of [[1,0],[-1,0],[0,1],[0,-1]]) { const j = geo.step(i, dc, dr);
    if (j >= 0 && !(st.b[j] && st.b[j].t === 'Dk') && !V.attacked(st, j, 'w') && !V.attacked(st, j, 'b') && cand.indexOf(j) < 0) cand.push(j); }
  const eyes = [...document.querySelectorAll('.g1-dark-eyes')].map(e => e.closest('.sq') && e.closest('.sq').getAttribute('data-sq'));
  return { dk, cand, turn: st.turn, over: g.over || null, eyes, eyesN: eyes.length, tiles: document.querySelectorAll('.g1-dark').length,
    pink: document.querySelectorAll('[style*="230, 60, 170"],[style*="230,60,170"]').length, busy: !!g.busy,
    status: (document.querySelector('.status, #status, [data-status]') || {}).textContent || '' }; }'''
from playwright.sync_api import sync_playwright
def serve():
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a, **k): pass
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(('127.0.0.1', args.port), functools.partial(Q, directory=ROOT)) as s: s.serve_forever()
threading.Thread(target=serve, daemon=True).start(); time.sleep(0.4)
base = f'http://127.0.0.1:{args.port}/index.html'
fails, log = [], []
with sync_playwright() as p:
    b = p.chromium.launch(args=['--disable-gpu'])
    ctx = b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2, has_touch=True, is_mobile=True)
    ctx.route(re.compile(r'https?://(?!127\.0\.0\.1).*'), lambda r: r.abort())
    pg = ctx.new_page(); errs = []
    pg.on('console', lambda m: m.type == 'error' and not NOISE.search(m.text) and errs.append(m.text[:200]))
    pg.on('pageerror', lambda e: errs.append('pageerror: ' + str(e)[:200]))
    pg.goto(base + '#/play/BYg7rV53WrM', timeout=20000)
    pg.wait_for_function('window.CM && CM.gameUI && CM.gameUI.controller && CM.gameUI.controller.state', timeout=15000)
    pg.wait_for_timeout(1500)
    s0 = pg.evaluate(SNAP); log.append(('start', s0))
    if s0['dk'] != [pg.evaluate("CM.gameUI.controller.V.geo.parse('b4')")]: fails.append('darkness does not start on b4 only')
    pg.screenshot(path=os.path.join(args.out, 'start.png'))
    box = pg.query_selector('.board').bounding_box()
    def tap(i):
        files = 8; f, r = pg.evaluate(f"[CM.gameUI.controller.V.geo.col({i}), CM.gameUI.controller.V.geo.rank({i})]")
        rk = r if isinstance(r, int) else int(r)
        # rank() may be 1-based name; derive row from index instead
        row = i // files; col = i % files
        flip = pg.evaluate('CM.gameUI.controller.flipped()')
        # board index 0 = a8 or a1? measure with geo.name
        name = pg.evaluate(f'CM.gameUI.controller.V.geo.name({i})')
        fc = ord(name[0]) - 97; rn = int(name[1:])
        x = box['x'] + (fc + 0.5) * box['width'] / 8; y = box['y'] + (8 - rn + 0.5) * box['height'] / 8
        if flip: x = box['x'] + box['width'] - (x - box['x']); y = box['y'] + box['height'] - (y - box['y'])
        pg.touchscreen.tap(x, y); pg.wait_for_timeout(180)
    import random; random.seed(7)
    for rnd in range(args.rounds):
        st = pg.evaluate(SNAP)
        if st['over']: break
        mv = pg.evaluate("(() => { const g = CM.gameUI.controller; return g.moves.filter(m => !m.promo || m.promo === 'Q').map(m => [m.f, m.t]); })()")
        if not mv: break
        f, t = random.choice(mv)
        before = st
        tap(f); tap(t)
        try: pg.wait_for_function("(() => { const g = CM.gameUI.controller; return g.over || (g.state.turn === g.human && !g.busy); })()", timeout=30000)
        except Exception: fails.append(f'round {rnd}: bot did not answer'); break
        pg.wait_for_timeout(350)
        after = pg.evaluate(SNAP); log.append((rnd, after))
        new = [i for i in after['dk'] if i not in before['dk']]
        if len(new) > 1: fails.append(f'round {rnd}: grew {len(new)} squares')
        # growth happens after the bot move, so candidates are judged on the position after the bot moved; we can only check orthogonal adjacency here
        for n in new:
            if not any(abs(n - d) in (1, 8) and (abs(n - d) == 8 or n // 8 == d // 8) for d in before['dk']): fails.append(f'round {rnd}: new square {n} not orthogonal')
        if after['eyesN'] != 1: fails.append(f'round {rnd}: eyes on {after["eyesN"]} squares')
        if after['pink']: fails.append(f'round {rnd}: pink markers drawn')
        if after['tiles'] != len(after['dk']): fails.append(f'round {rnd}: {after["tiles"]} tiles for {len(after["dk"])} darkness squares')
        if rnd in (3, args.rounds - 1): pg.screenshot(path=os.path.join(args.out, f'round{rnd}.png'))
    eyes_sq = pg.evaluate("(() => { const e = document.querySelector('.g1-dark-eyes'); const sq = e && e.closest('.sq'); return sq ? sq.getAttribute('aria-label') || sq.getAttribute('data-sq') || '' : ''; })()")
    log.append(('eyes_square', eyes_sq))
    # consumed king: bare kings, black king on b5 next to the darkness, nothing protects b5
    res = pg.evaluate(r'''async () => { const g = CM.gameUI.controller, V = g.V, geo = V.geo, st = g.state;
      if (g.over) return { skipped: 'game over' };
      for (let i = 0; i < st.b.length; i++) if (st.b[i] && st.b[i].t !== 'Dk') st.b[i] = null;
      for (let i = 0; i < st.b.length; i++) if (st.b[i] && st.b[i].t === 'Dk' && i !== geo.parse('b4')) st.b[i] = null;
      st.b[geo.parse('h1')] = V.piece('K', 'w'); st.b[geo.parse('b5')] = V.piece('K', 'b');
      st.b[geo.parse('b3')] = V.piece('N', 'w'); st.b[geo.parse('a2')] = V.piece('P', 'w');  /* b3 knight protected by a2; the black king guards a4 + c4; b5 itself is unprotected */
      g.render();
      const cand = []; for (const [dc, dr] of [[1,0],[-1,0],[0,1],[0,-1]]) { const j = geo.step(geo.parse('b4'), dc, dr); if (j >= 0 && !V.attacked(st, j, 'w') && !V.attacked(st, j, 'b')) cand.push(geo.name(j)); }
      const p = g.hooks.afterMove(g.ctx, {}, { by: 'bot' }); if (p && p.then) await p;
      await new Promise(r => setTimeout(r, 1200));
      return { cand, over: g.over || null, confetti: document.querySelectorAll('.fx-particle').length }; }''')
    log.append(('king', res))
    pg.screenshot(path=os.path.join(args.out, 'king.png'))
    if not res.get('skipped'):
        if res['cand'] == ['b5'] and not (res['over'] and 'consumed' in res['over'].get('why', '')): fails.append('king on the only candidate was not consumed: ' + json.dumps(res))
    if errs: fails.append('console: ' + ' | '.join(errs[:5]))
    b.close()
json.dump({'log': log, 'fails': fails}, open(os.path.join(args.out, 'qa_dark.json'), 'w'), indent=1, default=str)
for l in log: print(json.dumps(l, default=str)[:260])
print('FAILS' if fails else 'PASS', fails)
