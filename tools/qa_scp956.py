"""QA for SCP-956 the Pinata (agJbUnr6PCQ) at phone sizes, touch.
Opens #/play/agJbUnr6PCQ, checks the opponent and board match the video, then:
  A. scripted bonk: a hidden pinata put on d5, real taps play e2-e4, the pinata reveals and bonks e4 (one pinata more)
  B. reposition: a pinata on e4 under e2-e4 moves away (never stays under a piece)
  C. the cheese (video 9:10-9:37): Qa1 lined up on Ka8 through the a-pawn, Black's only move a6-a5 lands next to a
     pinata on b4, the pawn is bonked and the player takes the king with a real tap -> win
  D. random taps for N rounds; after every settled move: no pinata on an occupied square, none next to a pawn,
     no duplicates, at least one while pawns exist and none once every pawn is gone; page never wider than the screen.
Screenshots mid-bonk and at the end; fails on any console error.
  python3 tools/qa_scp956.py [--out /tmp/qa_scp956] [--rounds 14] [--sizes 390x844,360x780] [--port 8871] [--base URL]"""
import os, json, time, threading, http.server, socketserver, functools, argparse, re, random
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODE = 'agJbUnr6PCQ'
ap = argparse.ArgumentParser(); ap.add_argument('--out', default='/tmp/qa_scp956'); ap.add_argument('--rounds', type=int, default=14)
ap.add_argument('--sizes', default='390x844,360x780'); ap.add_argument('--port', type=int, default=8871); ap.add_argument('--base', default='')
args = ap.parse_args(); os.makedirs(args.out, exist_ok=True)
NOISE = re.compile(r'407|ERR_TUNNEL|ERR_FAILED|net::|unpkg|jsdelivr|Failed to load resource|youtube|ytimg|stockfish|maia', re.I)
TAPSTART = "() => { const t = document.querySelector('.tapstart'); if (t) { t.click(); return 'tap'; } if (!(CM.loader && CM.loader.isVisible && CM.loader.isVisible()) && !(CM.gameUI && CM.gameUI.waitingStart)) return 'none'; return false; }"
SNAP = r'''() => { const g = CM.gameUI.controller, st = g.state, geo = g.V.geo;
  return { b: st.b.map(p => p ? [p.t, p.c] : null), pins: ((st.x && st.x.p956) || []).slice(), turn: st.turn, human: g.human,
    over: g.over || null, busy: !!g.busy, sw: document.documentElement.scrollWidth, files: geo.files }; }'''
SETTLED = "(() => { const g = CM.gameUI.controller; return g.over || (g.state.turn === g.human && !g.busy && !g._hookBusy); })()"
from playwright.sync_api import sync_playwright

if not args.base:
    def serve():
        class Q(http.server.SimpleHTTPRequestHandler):
            def log_message(self, *a, **k): pass
        socketserver.TCPServer.allow_reuse_address = True
        with socketserver.TCPServer(('127.0.0.1', args.port), functools.partial(Q, directory=ROOT)) as s: s.serve_forever()
    threading.Thread(target=serve, daemon=True).start(); time.sleep(0.4)
base = args.base or f'http://127.0.0.1:{args.port}/index.html'
fails, log = [], []

def ring(i, files=8):
    c, r = i % files, i // files; o = []
    for dc in (-1, 0, 1):
        for dr in (-1, 0, 1):
            if (dc or dr) and 0 <= c + dc < files and 0 <= r + dr < 8: o.append((r + dr) * files + c + dc)
    return o

def check_invariants(tag, s):
    b, pins = s['b'], s['pins']
    pawns = [i for i, p in enumerate(b) if p and p[0] == 'P']
    if len(set(pins)) != len(pins): fails.append(f'{tag}: duplicate pinatas {pins}')
    for q in pins:
        if b[q]: fails.append(f'{tag}: pinata under a piece on {q}')
        if any(j in pawns for j in ring(q, s['files'])): fails.append(f'{tag}: undiscovered pinata next to a pawn on {q}')
    if pawns and not pins: fails.append(f'{tag}: pawns left but no pinata')
    if not pawns and pins: fails.append(f'{tag}: no pawns but {len(pins)} pinatas')
    if s['sw'] > W: fails.append(f'{tag}: page {s["sw"]} px wide at {W}')

with sync_playwright() as p:
    br = p.chromium.launch(args=['--disable-gpu'])
    for size in args.sizes.split(','):
        W, H = map(int, size.split('x'))
        ctx = br.new_context(viewport={'width': W, 'height': H}, device_scale_factor=2.6, has_touch=True, is_mobile=True)
        if not args.base: ctx.route(re.compile(r'https?://(?!127\.0\.0\.1).*'), lambda r: r.abort())
        pg = ctx.new_page(); errs = []
        pg.on('console', lambda m: m.type == 'error' and not NOISE.search(m.text) and errs.append(m.text[:200]))
        pg.on('pageerror', lambda e: errs.append('pageerror: ' + str(e)[:200]))

        def open_mode():
            pg.goto(base + '#/play/' + MODE, timeout=30000)
            pg.wait_for_function('window.CM && CM.gameUI && CM.gameUI.controller && CM.gameUI.controller.state && CM.gameUI.controller.spec && CM.gameUI.controller.spec.id === "' + MODE + '"', timeout=30000)
            try: pg.wait_for_function(TAPSTART, timeout=30000)
            except Exception: pass
            pg.wait_for_timeout(1500)

        def tap(name):
            box = pg.query_selector('.board').bounding_box()
            files = 8; flip = pg.evaluate('CM.gameUI.controller.flipped()')
            fc = ord(name[0]) - 97; rn = int(name[1:])
            x = box['x'] + (fc + 0.5) * box['width'] / files; y = box['y'] + (8 - rn + 0.5) * box['height'] / 8
            if flip: x = box['x'] + box['width'] - (x - box['x']); y = box['y'] + box['height'] - (y - box['y'])
            pg.touchscreen.tap(x, y); pg.wait_for_timeout(200)

        def settle(t=45000):
            pg.wait_for_function(SETTLED, timeout=t); pg.wait_for_timeout(700)

        open_mode()
        info = pg.evaluate("""() => { const g = CM.gameUI.controller; return { opp: g.opponent && g.opponent.name, rating: g.opponent && g.opponent.rating,
          avatar: g.opponent && g.opponent.avatar, light: g.spec.theme.light, dark: g.spec.theme.dark, pins: g.state.x.p956,
          status: (document.querySelector('.status, #status, .game-status') || {}).textContent || '' }; }""")
        log.append((size, 'start', info))
        if info['opp'] != 'Stockfish' or info['rating'] != 3600: fails.append(f'{size}: opponent {info["opp"]} {info["rating"]}')
        if not info['pins'] or len(info['pins']) != 1: fails.append(f'{size}: start pinatas {info["pins"]}')
        s0 = pg.evaluate(SNAP); check_invariants(f'{size} start', s0)
        pg.screenshot(path=os.path.join(args.out, f'{size}_start.png'))

        # A. scripted bonk on e4 from a pinata on d5
        pg.evaluate("() => { const c = CM.gameUI.controller.ctx; c.setX('p956', [c.sq('d5')]); c.refresh(); }")
        tap('e2'); tap('e4')
        pg.wait_for_timeout(560)
        pg.screenshot(path=os.path.join(args.out, f'{size}_A_bonk.png'))
        settle()
        sA = pg.evaluate(SNAP)
        e4 = pg.evaluate("CM.gameUI.controller.ctx.sq('e4')")
        if sA['b'][e4] and sA['b'][e4][0] == 'P': fails.append(f'{size} A: e4 pawn not bonked')
        log.append((size, 'A', {'pins': sA['pins'], 'pawns': sum(1 for x in sA['b'] if x and x[0] == 'P')}))
        check_invariants(f'{size} A', sA)

        # B. reposition: new game, pinata on e4 (touches no pawn), play e2-e4
        open_mode()
        pg.evaluate("() => { const c = CM.gameUI.controller.ctx; c.setX('p956', [c.sq('e4')]); c.refresh(); }")
        tap('e2'); tap('e4'); settle()
        sB = pg.evaluate(SNAP)
        if e4 in sB['pins']: fails.append(f'{size} B: pinata stayed under the e4 pawn')
        check_invariants(f'{size} B', sB); log.append((size, 'B', {'pins': sB['pins']}))

        # C. the cheese: Qa1 + Ka8 through the a-pawn, pinata on b4, Black's only move a6-a5
        open_mode()
        pg.evaluate("""() => { const g = CM.gameUI.controller, c = g.ctx;
          for (let i = 0; i < 64; i++) c.set(i, null);
          const put = (sq, t, col) => c.set(c.sq(sq), g.V.piece(t, col, { m: 1 }));
          put('h1', 'K', 'w'); put('a1', 'Q', 'w'); put('b1', 'R', 'w'); put('g1', 'B', 'w');
          put('a8', 'K', 'b'); put('a6', 'P', 'b');
          c.setX('p956', [c.sq('b4')]); c.refresh(); }""")
        pg.wait_for_timeout(400)
        tap('h1'); tap('h2')
        pg.wait_for_timeout(1500)
        pg.screenshot(path=os.path.join(args.out, f'{size}_C_bonk.png'))
        settle()
        sC = pg.evaluate(SNAP)
        a5 = pg.evaluate("CM.gameUI.controller.ctx.sq('a5')")
        if sC['b'][a5]: fails.append(f'{size} C: a5 pawn still there {sC["b"][a5]}')
        if sC['pins']: fails.append(f'{size} C: pinatas left with no pawns {sC["pins"]}')
        pg.screenshot(path=os.path.join(args.out, f'{size}_C_exposed.png'))
        tap('a1'); tap('a8'); pg.wait_for_timeout(1800)
        sC2 = pg.evaluate(SNAP)
        if not sC2['over'] or sC2['over'].get('w') != 'w': fails.append(f'{size} C: taking the king did not win: {sC2["over"]}')
        log.append((size, 'C', sC2['over']))
        pg.screenshot(path=os.path.join(args.out, f'{size}_C_win.png'))

        # D. random play
        open_mode()
        random.seed(956 + W)
        shot = False
        for rnd in range(args.rounds):
            st = pg.evaluate(SNAP)
            if st['over']: break
            mv = pg.evaluate("(() => { const g = CM.gameUI.controller; return g.moves.filter(m => m.c === g.human && (!m.promo || m.promo === 'Q')).map(m => [g.V.geo.name(m.f), g.V.geo.name(m.t), m.p && m.p.t]); })()")
            if not mv: break
            pawn_moves = [m for m in mv if m[2] == 'P']
            f, t, _ = random.choice(pawn_moves if pawn_moves and random.random() < 0.6 else mv)
            tap(f); tap(t)
            try: settle()
            except Exception: fails.append(f'{size} D{rnd}: did not settle'); break
            a = pg.evaluate(SNAP)
            check_invariants(f'{size} D{rnd}', a)
            npawn = sum(1 for x in a['b'] if x and x[0] == 'P')
            log.append((size, 'D', rnd, f + t, len(a['pins']), npawn, a['over']))
            if not shot and len(a['pins']) >= 3:
                pg.screenshot(path=os.path.join(args.out, f'{size}_D_mid.png')); shot = True
        pg.screenshot(path=os.path.join(args.out, f'{size}_D_end.png'))
        if errs: fails.append(f'{size} console: ' + ' | '.join(errs[:5]))
        ctx.close()
    br.close()
json.dump({'log': log, 'fails': fails}, open(os.path.join(args.out, 'qa.json'), 'w'), indent=1, default=str)
for l in log: print(l)
print('FAILS' if fails else 'PASS', fails)
