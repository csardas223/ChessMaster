"""QA for SCP-4000 (b2QHgQAQTp0) at phone sizes, touch.
Opens #/play/b2QHgQAQTp0, checks the opponent, board, pieces and the rabbit's start (e4, white king identity), then:
  A. real taps d2-d4: Stockfish replies, the rabbit hops one king step to an empty square (or stays when boxed in) and,
     with a neighbour, swaps with it; it now carries that piece's identity; one rabbit, piece count kept
  B. pawn identity (video 0:51): rabbit on d3 as a white pawn, a black queen alone next to d4 -> hops d3-d4, swaps with
     the queen (queen on d4, rabbit on e5 moving like a black queen); the swap must SLIDE (rabbit sprite seen between squares)
  C. promotion: rabbit on a8 as a white pawn (no move), a white pawn on b7 its only neighbour -> the pawn lands on a8 and
     becomes a queen; rabbit on b7 as a white pawn
  D. king capture (video 12:52): a swap drops a white knight on d6, checking Ke8 with White to move -> real taps Nd6xe8 wins
  E. random play for N rounds with real taps; after each settled round: one rabbit, valid identity, nothing on its square,
     no horizontal overflow
Screenshots: start, mid-tremor, after the swap, the win, random end. Fails on any console error.
  python3 tools/qa_scp4000.py [--out /tmp/qa_scp4000] [--rounds 10] [--sizes 390x844,360x780] [--port 8873] [--base URL]"""
import os, json, time, threading, http.server, socketserver, functools, argparse, re, random
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODE = 'b2QHgQAQTp0'
ap = argparse.ArgumentParser(); ap.add_argument('--out', default='/tmp/qa_scp4000'); ap.add_argument('--rounds', type=int, default=10)
ap.add_argument('--sizes', default='390x844,360x780'); ap.add_argument('--port', type=int, default=8873); ap.add_argument('--base', default='')
args = ap.parse_args(); os.makedirs(args.out, exist_ok=True)
NOISE = re.compile(r'407|ERR_TUNNEL|ERR_FAILED|net::|unpkg|jsdelivr|Failed to load resource|youtube|ytimg|stockfish|maia', re.I)
TAPSTART = "() => { const t = document.querySelector('.tapstart'); if (t) { t.click(); return 'tap'; } if (!(CM.loader && CM.loader.isVisible && CM.loader.isVisible()) && !(CM.gameUI && CM.gameUI.waitingStart)) return 'none'; return false; }"
SNAP = r'''() => { const g = CM.gameUI.controller, st = g.state, geo = g.V.geo;
  const rab = []; st.b.forEach((p, i) => { if (p && p.t === 'S40') rab.push([geo.name(i), p.ab || 'wK', p.c]); });
  return { b: st.b.map(p => p ? [p.t, p.c] : null), rab: rab, turn: st.turn, human: g.human, over: g.over || null,
    sw: document.documentElement.scrollWidth, status: (document.querySelector('#status, .status, .game-status') || {}).textContent || '' }; }'''
SETTLED = "(() => { const g = CM.gameUI.controller; return g.over || (g.state.turn === g.human && !g.busy && !g._hookBusy); })()"
# run the rabbit's turn directly (the mode's own afterMove hook, as after a Black move) with a fixed choice function
RUN = r'''(pickSq) => { const g = CM.gameUI.controller, c = g.ctx, keep = c.pick;
  window.__qaRun = 'running';
  if (pickSq) c.pick = arr => { const j = c.sq(pickSq); return arr.indexOf(j) >= 0 ? j : arr[0]; };
  Promise.resolve(g.hooks.afterMove(c, null, { side: 'b', by: 'bot' })).then(() => { c.pick = keep; window.__qaRun = 'done'; }, e => { c.pick = keep; window.__qaRun = 'err ' + e; }); }'''
SETUP = r'''(spec) => { const g = CM.gameUI.controller, c = g.ctx;
  for (let i = 0; i < 64; i++) c.set(i, null);
  spec.forEach(([sq, t, col, ab]) => c.set(c.sq(sq), g.V.piece(t, col, Object.assign({ m: 1 }, ab ? { ab: ab } : {}))));
  c.refresh(); }'''
# samples the rabbit sprite's translate every animation frame (a swap or hop that teleports never shows a moving sprite)
SAMPLER = r'''() => { window.__qaMove = 0; window.__qaSamp = true;
  const tick = () => { if (!window.__qaSamp) return; document.querySelectorAll('.pc').forEach(el => {
      if (!(el.src || '').includes('scp4000')) return; const m = new DOMMatrix(getComputedStyle(el).transform);
      if (Math.abs(m.m41) > 2 || Math.abs(m.m42) > 2) window.__qaMove++; }); requestAnimationFrame(tick); };
  requestAnimationFrame(tick); }'''
from playwright.sync_api import sync_playwright

if not args.base:
    def serve():
        class Q(http.server.SimpleHTTPRequestHandler):
            def log_message(self, *a, **k): pass
        socketserver.TCPServer.allow_reuse_address = True
        with socketserver.TCPServer(('127.0.0.1', args.port), functools.partial(Q, directory=ROOT)) as s: s.serve_forever()
    threading.Thread(target=serve, daemon=True).start(); time.sleep(0.4)
base = args.base or f'http://127.0.0.1:{args.port}/index.html'
fails, log, nav = [], [], [0]

def ring(name):
    f, r = ord(name[0]) - 97, int(name[1:]); o = []
    for df in (-1, 0, 1):
        for dr in (-1, 0, 1):
            if (df or dr) and 0 <= f + df < 8 and 1 <= r + dr <= 8: o.append(chr(97 + f + df) + str(r + dr))
    return o

def idx(name): return (8 - int(name[1:])) * 8 + ord(name[0]) - 97

def check_invariants(tag, s):
    if len(s['rab']) != 1: fails.append(f'{tag}: {len(s["rab"])} rabbits'); return
    sq, ab, col = s['rab'][0]
    if col != 'n': fails.append(f'{tag}: rabbit colour {col}')
    if not re.fullmatch(r'[wb][KQRBNP]', ab): fails.append(f'{tag}: rabbit identity {ab}')
    if s['sw'] > W: fails.append(f'{tag}: page {s["sw"]} px wide at {W}')

with sync_playwright() as p:
    launch = {'args': ['--disable-gpu']}
    px = os.environ.get('HTTPS_PROXY') if args.base else None
    if px:
        from urllib.parse import urlparse
        u = urlparse(px if '://' in px else 'http://' + px)
        launch['proxy'] = {'server': f'{u.scheme}://{u.hostname}:{u.port}', **({'username': u.username, 'password': u.password or ''} if u.username else {})}
    br = p.chromium.launch(**launch)
    for size in args.sizes.split(','):
        W, H = map(int, size.split('x'))
        ctx = br.new_context(viewport={'width': W, 'height': H}, device_scale_factor=2.6, has_touch=True, is_mobile=True, ignore_https_errors=bool(px))
        site = re.escape(re.sub(r'^https?://', '', re.match(r'https?://[^/]+', base).group(0)))
        ctx.route(re.compile(r'https?://(?!' + site + r').*'), lambda r: r.abort())
        pg = ctx.new_page(); errs = []
        pg.on('console', lambda m: m.type == 'error' and not NOISE.search(m.text) and errs.append(m.text[:200]))
        pg.on('pageerror', lambda e: errs.append('pageerror: ' + str(e)[:200]))

        def open_mode():
            nav[0] += 1
            pg.goto(base + '?qa=' + str(nav[0]) + '#/play/' + MODE, timeout=45000, wait_until='domcontentloaded')
            pg.wait_for_function('window.CM && CM.gameUI && CM.gameUI.controller && CM.gameUI.controller.state && CM.gameUI.controller.spec && CM.gameUI.controller.spec.id === "' + MODE + '"', timeout=30000)
            try: pg.wait_for_function(TAPSTART, timeout=30000)
            except Exception: pass
            pg.wait_for_timeout(1500)
            if pg.evaluate('CM.gameUI.controller.state.ply') != 0: fails.append(f'{size}: mode did not open on a new game')

        def tap(name):
            box = pg.query_selector('.board').bounding_box()
            flip = pg.evaluate('CM.gameUI.controller.flipped()')
            fc = ord(name[0]) - 97; rn = int(name[1:])
            x = box['x'] + (fc + 0.5) * box['width'] / 8; y = box['y'] + (8 - rn + 0.5) * box['height'] / 8
            if flip: x = box['x'] + box['width'] - (x - box['x']); y = box['y'] + box['height'] - (y - box['y'])
            pg.touchscreen.tap(x, y); pg.wait_for_timeout(200)

        def settle(t=60000):
            pg.wait_for_function(SETTLED, timeout=t); pg.wait_for_timeout(600)

        def run(pick=None, shot=None):
            pg.evaluate(SAMPLER)
            pg.evaluate(RUN, pick)
            if shot:
                pg.wait_for_timeout(shot[0]); pg.screenshot(path=os.path.join(args.out, shot[1]))
            pg.wait_for_function("window.__qaRun !== 'running'", timeout=20000)
            pg.evaluate('window.__qaSamp = false')
            r = pg.evaluate('window.__qaRun')
            if r != 'done': fails.append(f'{size}: rabbit turn {r}')
            pg.wait_for_timeout(500)
            return pg.evaluate('window.__qaMove')

        # start
        open_mode()
        info = pg.evaluate("""() => { const g = CM.gameUI.controller, im = [...document.querySelectorAll('.pc')].map(e => e.getAttribute('src') || '');
          return { opp: g.opponent && g.opponent.name, rating: g.opponent && g.opponent.rating, light: g.spec.theme.light, dark: g.spec.theme.dark,
            staunty: im.filter(s => s.includes('/staunty/')).length, rabbitImg: im.filter(s => s.includes('scp4000.png')).length }; }""")
        s0 = pg.evaluate(SNAP); log.append((size, 'start', info, s0['rab'], s0['status']))
        if info['opp'] != 'Stockfish' or info['rating'] != 3600: fails.append(f'{size}: opponent {info["opp"]} {info["rating"]}')
        if info['staunty'] != 32: fails.append(f'{size}: {info["staunty"]} Staunty pieces drawn (want 32)')
        if info['rabbitImg'] != 1: fails.append(f'{size}: rabbit sprite drawn {info["rabbitImg"]} times')
        if s0['rab'] != [['e4', 'wK', 'n']]: fails.append(f'{size}: start rabbit {s0["rab"]}')
        if 'white king' not in s0['status']: fails.append(f'{size}: status "{s0["status"]}"')
        check_invariants(f'{size} start', s0)
        pg.screenshot(path=os.path.join(args.out, f'{size}_start.png'))

        # A. real taps d2-d4, Stockfish replies, the rabbit acts
        n0 = sum(1 for x in s0['b'] if x)
        tap('d2'); tap('d4')
        pg.wait_for_timeout(2600); pg.screenshot(path=os.path.join(args.out, f'{size}_A_mid.png'))
        settle()
        sA = pg.evaluate(SNAP); check_invariants(f'{size} A', sA)
        nA = sum(1 for x in sA['b'] if x)
        if nA not in (n0, n0 - 1): fails.append(f'{size} A: piece count {n0} -> {nA}')
        if sA['rab']:
            rsq, rab, _ = sA['rab'][0]
            if rab != 'wK':   # it swapped: the piece it copied now stands next to it
                if not any(sA['b'][idx(j)] and (sA['b'][idx(j)][1] + sA['b'][idx(j)][0]) == rab for j in ring(rsq)):
                    fails.append(f'{size} A: identity {rab} but no such piece next to {rsq}')
            elif rsq != 'e4' and any(sA['b'][idx(j)] and sA['b'][idx(j)][0] != 'S40' for j in ring(rsq)):
                fails.append(f'{size} A: rabbit on {rsq} kept the king identity with a neighbour next to it')
        log.append((size, 'A', sA['rab'], sA['status']))
        pg.screenshot(path=os.path.join(args.out, f'{size}_A_after.png'))

        # B. pawn identity: d3 -> d4, then swap with the black queen on e5
        open_mode()
        pg.evaluate(SETUP, [['e1', 'K', 'w'], ['h8', 'K', 'b'], ['d3', 'S40', 'n', 'wP'], ['e5', 'Q', 'b'], ['a2', 'P', 'w']])
        pg.wait_for_timeout(300)
        moved = run(None, (2300, f'{size}_B_tremor.png'))
        sB = pg.evaluate(SNAP)
        if sB['rab'] != [['e5', 'bQ', 'n']]: fails.append(f'{size} B: rabbit {sB["rab"]} (want e5 bQ)')
        if sB['b'][idx('d4')] != ['Q', 'b']: fails.append(f'{size} B: d4 holds {sB["b"][idx("d4")]}')
        if moved < 6: fails.append(f'{size} B: rabbit sprite seen moving in only {moved} frames (teleport?)')
        if 'black queen' not in sB['status']: fails.append(f'{size} B: status "{sB["status"]}"')
        log.append((size, 'B', sB['rab'], moved, sB['status']))
        pg.screenshot(path=os.path.join(args.out, f'{size}_B_swapped.png'))

        # C. promotion by swap
        open_mode()
        pg.evaluate(SETUP, [['e1', 'K', 'w'], ['h5', 'K', 'b'], ['a8', 'S40', 'n', 'wP'], ['b7', 'P', 'w']])
        pg.wait_for_timeout(300); run()
        sC = pg.evaluate(SNAP)
        if sC['b'][idx('a8')] != ['Q', 'w']: fails.append(f'{size} C: a8 holds {sC["b"][idx("a8")]} (want a white queen)')
        if sC['rab'] != [['b7', 'wP', 'n']]: fails.append(f'{size} C: rabbit {sC["rab"]}')
        log.append((size, 'C', sC['b'][idx('a8')], sC['rab']))

        # D. a swap gives check, White takes the king with real taps
        open_mode()
        pg.evaluate(SETUP, [['g1', 'K', 'w'], ['e8', 'K', 'b'], ['d6', 'S40', 'n', 'wP'], ['d7', 'P', 'b'], ['c5', 'N', 'w']])
        pg.wait_for_timeout(300); run('c5')
        sD = pg.evaluate(SNAP)
        if sD['b'][idx('d6')] != ['N', 'w']: fails.append(f'{size} D: d6 holds {sD["b"][idx("d6")]}')
        pg.screenshot(path=os.path.join(args.out, f'{size}_D_check.png'))
        tap('d6'); tap('e8'); pg.wait_for_timeout(2500)
        sD2 = pg.evaluate(SNAP)
        if not sD2['over'] or sD2['over'].get('w') != 'w': fails.append(f'{size} D: taking the king did not win: {sD2["over"]}')
        log.append((size, 'D', sD2['over']))
        pg.wait_for_timeout(2500); pg.screenshot(path=os.path.join(args.out, f'{size}_D_win.png'))

        # E. random play
        open_mode()
        random.seed(4000 + W)
        for rnd in range(args.rounds):
            st = pg.evaluate(SNAP)
            if st['over']: break
            mv = pg.evaluate("(() => { const g = CM.gameUI.controller; return g.moves.filter(m => m.c === g.human && (!m.promo || m.promo === 'Q')).map(m => [g.V.geo.name(m.f), g.V.geo.name(m.t)]); })()")
            if not mv: break
            f, t = random.choice(mv)
            tap(f); tap(t)
            try: settle()
            except Exception: fails.append(f'{size} E{rnd}: did not settle'); break
            a = pg.evaluate(SNAP); check_invariants(f'{size} E{rnd}', a)
            log.append((size, 'E', rnd, f + t, a['rab'], a['over']))
        pg.screenshot(path=os.path.join(args.out, f'{size}_E_end.png'))
        if errs: fails.append(f'{size} console: ' + ' | '.join(errs[:5]))
        ctx.close()
    br.close()
json.dump({'log': log, 'fails': fails}, open(os.path.join(args.out, 'qa.json'), 'w'), indent=1, default=str)
for l in log: print(l)
print('FAILS' if fails else 'PASS', fails)
