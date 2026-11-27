"""QA for the MirrorFish (eCC-U9w9RvQ) move-quality review badges, touch, default 390x844 and the Flip6 cover 360x374.
Plays White by tapping the board, choosing moves of a set engine rank each round (best, 2nd, 3rd, 4th, 7th, worst...),
and checks after every move: no badge while the piece slides, then exactly one badge (img loaded) inside the piece's
attached layer on the destination square, pinned near the square's top-right corner and inside the board viewport;
the player's badge tier is the rank MirrorFish copies (x.mirrorK) and the fish's reply badge is in the same tier;
the old badge is gone as soon as the next move is made; after a manual board flip the badge stays on the same square
at its new top-right corner. Console must be clean. Screenshots go to --out.
  python3 tools/qa_mirror_badges.py [--out /tmp/qa_mirror] [--size 390x844] [--rounds 7] [--port 8861]"""
import os, json, time, threading, http.server, socketserver, functools, argparse, re
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ap = argparse.ArgumentParser(); ap.add_argument('--out', default='/tmp/qa_mirror'); ap.add_argument('--rounds', type=int, default=7)
ap.add_argument('--size', default='390x844'); ap.add_argument('--port', type=int, default=8861)
args = ap.parse_args(); os.makedirs(args.out, exist_ok=True)
VW, VH = (int(x) for x in args.size.split('x'))
NOISE = re.compile(r'407|ERR_TUNNEL|ERR_FAILED|net::|unpkg|jsdelivr|Failed to load resource|youtube|ytimg', re.I)
TAPSTART = "() => { const t = document.querySelector('.tapstart'); if (t) { t.click(); return 'tap'; } if (!(CM.loader && CM.loader.isVisible && CM.loader.isVisible()) && !(CM.gameUI && CM.gameUI.waitingStart)) return 'none'; return false; }"
TIER = {'brilliant': 0, 'great': 0, 'best': 0, 'excellent': 1, 'good': 2, 'inaccuracy': 3, 'mistake': 4, 'miss': 4, 'blunder': 4}
KIND = {'Brilliant': 'brilliant', 'Great move': 'great', 'Best move': 'best', 'Excellent': 'excellent', 'Good': 'good', 'Book move': 'book',
        'Inaccuracy': 'inaccuracy', 'Mistake': 'mistake', 'Miss': 'miss', 'Blunder': 'blunder'}
BADGES = r'''() => { const vp = document.querySelector('.board-viewport') || document.querySelector('.board'), vr = vp.getBoundingClientRect();
  return [...document.querySelectorAll('.mq-badge')].map(b => { const sq = b.closest('.sq'), r = b.getBoundingClientRect(), s = sq.getBoundingClientRect(),
    cs = getComputedStyle(b);
    return { sq: +sq.dataset.i, alt: b.alt, loaded: b.complete && b.naturalWidth > 0, att: !!b.closest('.pc-att'), w: r.width,
      cx: r.left + r.width / 2 - s.right, cy: r.top + r.height / 2 - s.top, sqw: s.width, op: +cs.opacity,
      inside: r.left >= vr.left - 0.5 && r.right <= vr.right + 0.5 && r.top >= vr.top - 0.5 && r.bottom <= vr.bottom + 0.5 }; }); }'''
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
    ctx = b.new_context(viewport={'width': VW, 'height': VH}, device_scale_factor=2.6 if VH < 500 else 2, has_touch=True, is_mobile=True)
    ctx.route(re.compile(r'https?://(?!127\.0\.0\.1).*'), lambda r: r.abort())
    pg = ctx.new_page(); errs = []
    pg.on('console', lambda m: m.type == 'error' and not NOISE.search(m.text) and errs.append(m.text[:200]))
    pg.on('pageerror', lambda e: errs.append('pageerror: ' + str(e)[:200]))
    pg.goto(base + '#/play/eCC-U9w9RvQ', timeout=20000)
    pg.wait_for_function('window.CM && CM.gameUI && CM.gameUI.controller && CM.gameUI.controller.state', timeout=30000)
    try: pg.wait_for_function(TAPSTART, timeout=30000)
    except Exception: pass
    pg.wait_for_timeout(1200)
    # the fish answers 1.6 s later than usual so the player's badge can be checked on its own; a rAF monitor records any
    # frame where a badge is visible while the piece under it is still sliding
    pg.evaluate('''(() => { const c = CM.bot.choose; CM.bot.choose = function () { const a = arguments; return new Promise(r => setTimeout(() => r(c.apply(null, a)), 1600)); };
      window.__mqBad = []; const loop = () => { document.querySelectorAll('.mq-badge').forEach(b => { const sq = b.closest('.sq');
        if (sq && sq.querySelector('.pc.is-moving') && +getComputedStyle(b).opacity > 0.05) window.__mqBad.push(+sq.dataset.i); }); requestAnimationFrame(loop); }; loop(); })()''')

    def box(): return pg.query_selector('.board').bounding_box()
    def tap(i):
        pg.evaluate("document.querySelector('.board').scrollIntoView({ block: 'center' })")   # the cover screen scrolls the board
        bx = box(); name = pg.evaluate(f'CM.gameUI.controller.V.geo.name({i})'); flip = pg.evaluate('CM.gameUI.controller.flipped()')
        fc = ord(name[0]) - 97; rn = int(name[1:])
        x = bx['x'] + (fc + 0.5) * bx['width'] / 8; y = bx['y'] + (8 - rn + 0.5) * bx['height'] / 8
        if flip: x = bx['x'] + bx['width'] - (x - bx['x']); y = bx['y'] + bx['height'] - (y - bx['y'])
        pg.touchscreen.tap(x, y); pg.wait_for_timeout(120)
    def check_badge(where, sq, want_kind=None):
        bs = pg.evaluate(BADGES)
        if len(bs) != 1: fails.append(f'{where}: {len(bs)} badges (want 1): {bs}'); return None
        x = bs[0]; k = KIND.get(x['alt'])
        if x['sq'] != sq: fails.append(f'{where}: badge on {x["sq"]}, move landed on {sq}')
        if not x['loaded']: fails.append(f'{where}: badge image did not load')
        if not x['att']: fails.append(f'{where}: badge not in the piece layer (.pc-att)')
        if not x['inside']: fails.append(f'{where}: badge outside the board viewport')
        if abs(x['cx']) > x['sqw'] * 0.4 or abs(x['cy']) > x['sqw'] * 0.4: fails.append(f'{where}: badge not at the top-right corner {x}')
        if x['w'] < 14.5: fails.append(f'{where}: badge {x["w"]:.1f} px wide (min 15)')
        if x['op'] < 0.99: fails.append(f'{where}: badge not fully shown (opacity {x["op"]})')
        if want_kind and k != want_kind: fails.append(f'{where}: badge {k}, want {want_kind}')
        return k
    ranks = [0, 1, 2, 3, 6, 99, 4, 0, 1]
    for rnd in range(args.rounds):
        g = pg.evaluate('(() => { const g = CM.gameUI.controller; return { over: !!g.over, turn: g.state.turn, human: g.human }; })()')
        if g['over']: log.append(('over', rnd)); break
        want = ranks[rnd % len(ranks)]
        mv = pg.evaluate(f"""(() => {{ const g = CM.gameUI.controller, S = new CM.Search(g.V, {{}});
          const L = S.rank(g.state, {{ moves: g.moves.filter(m => !m.promo || m.promo === 'Q'), maxDepth: 3, timeMs: 350, noise: 0 }});
          const x = L[Math.min({want}, L.length - 1)].m; return [x.f, x.t, g.V.geo.name(x.f) + g.V.geo.name(x.t)]; }})()""")
        tap(mv[0]); tap(mv[1])
        early = pg.evaluate(BADGES)   # the fish's old badge is gone as soon as you move
        if any(x['sq'] != mv[1] for x in early): fails.append(f'round {rnd}: old badge still up after your move: {early}')
        try: pg.wait_for_function("(() => { const g = CM.gameUI.controller; return g.over || g.state.x.qbadge; })()", timeout=20000)
        except Exception: fails.append(f'round {rnd}: no badge for the player move'); break
        pg.wait_for_timeout(400)
        k = pg.evaluate('(() => { const g = CM.gameUI.controller; return { k: (g.state.x.qbadge || {}).k, rk: g.state.x.mirrorK, ply: g.state.ply, turn: g.state.turn, human: g.human }; })()')
        pk = None
        if k['turn'] != k['human']:   # still the fish's turn: player's badge is up
            pk = check_badge(f'round {rnd} you {mv[2]}', mv[1], k['k'])
            if pk and pk != 'book' and TIER[pk] != min(k['rk'], 4): fails.append(f'round {rnd}: your badge {pk} but rank {k["rk"] + 1}')
            if rnd == 0: pg.screenshot(path=os.path.join(args.out, 'r0_player.png'))
        try: pg.wait_for_function("(() => { const g = CM.gameUI.controller; return g.over || (g.state.turn === g.human && !g.busy); })()", timeout=40000)
        except Exception: fails.append(f'round {rnd}: fish did not answer'); break
        pg.wait_for_timeout(700)
        if pg.evaluate('!!CM.gameUI.controller.over'): log.append(('over after fish', rnd)); break
        last = pg.evaluate('(() => { const l = CM.gameUI.controller.last; return [l.f, l.t, CM.gameUI.controller.V.geo.name(l.f) + CM.gameUI.controller.V.geo.name(l.t)]; })()')
        fk = check_badge(f'round {rnd} fish {last[2]}', last[1])
        if fk and pk and fk != 'book' and pk != 'book' and TIER[fk] != TIER[pk]:
            fails.append(f'round {rnd}: fish badge {fk} not in the tier of your {pk}')
        log.append((rnd, mv[2], pk, last[2], fk))
        pg.screenshot(path=os.path.join(args.out, f'r{rnd}_fish.png'))
        if rnd == 2:   # flip: same square, new top-right corner
            pg.evaluate('(() => { const g = CM.gameUI.controller; g.userFlip = !g.userFlip; g.render(); })()'); pg.wait_for_timeout(200)
            check_badge(f'round {rnd} flipped', last[1], fk)
            pg.screenshot(path=os.path.join(args.out, f'r{rnd}_flipped.png'))
            pg.evaluate('(() => { const g = CM.gameUI.controller; g.userFlip = !g.userFlip; g.render(); })()'); pg.wait_for_timeout(200)
    bad = pg.evaluate('window.__mqBad.length')
    if bad: fails.append(f'{bad} frames with a badge visible over a sliding piece')
    bd = pg.query_selector('.board').bounding_box()
    pg.screenshot(path=os.path.join(args.out, 'board_crop.png'), clip={'x': bd['x'] - 4, 'y': bd['y'] - 4, 'width': bd['width'] + 8, 'height': bd['height'] + 8})
    if errs: fails.append('console: ' + ' | '.join(errs[:5]))
    b.close()
for l in log: print(l)
print('FAIL' if fails else 'OK', len(fails)); [print(' -', f) for f in fails]
raise SystemExit(1 if fails else 0)
