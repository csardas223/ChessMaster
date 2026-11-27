"""QA for MirrorFish (eCC-U9w9RvQ), touch, default 390x844 (also the Flip6 cover 360x374).
Plays White by tapping the board, choosing a move of a set Stockfish rank each round, and checks:
  - the site's mirror rule: x.mirrorK = your rank in the top 5 (ranks 1-4 copied, else 5) and the fish plays the move
    the plan picked (rankedMoves(fen, M, 700)[M - 1]);
  - your badge and the fish's badge (our chess.com Classification V2 add-on): one badge, image loaded, in the
    board-level overlay, centred on the destination square's top-right corner point (1.5 px), 22-44 px wide, not clipped,
    no badge while the piece slides, gone again ~1.3 s after it pops (1 s up + 300 ms fade), old badge cleared on your move;
  - the last move's from/to squares carry the class colour (mq-q-<kind>), not the yellow highlight;
  - board flip moves the badge to the same square's new corner; synthetic badges on h8 / e8 / h3 are not clipped;
  - options: "Show move rank" off -> no rank toast (rank still computed); "Show move quality badges" off -> no badge,
    no mq-q classes, the normal yellow last-move squares.
With --sf-dir (a local copy of the stockfish@18.0.8 npm package bin/) the unpkg Stockfish 18 the game asks for is served
locally (the sandbox cannot reach the CDN); without it the game falls back to Fairy-Stockfish. Console must be clean.
  python3 tools/qa_mirror_badges.py [--out /tmp/qa_mirror] [--size 390x844] [--rounds 6] [--sf-dir DIR] [--port 8861]"""
import os, time, threading, http.server, socketserver, functools, argparse, re
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ap = argparse.ArgumentParser(); ap.add_argument('--out', default='/tmp/qa_mirror'); ap.add_argument('--rounds', type=int, default=6)
ap.add_argument('--size', default='390x844'); ap.add_argument('--port', type=int, default=8861); ap.add_argument('--sf-dir', default='')
args = ap.parse_args(); os.makedirs(args.out, exist_ok=True)
VW, VH = (int(x) for x in args.size.split('x'))
NOISE = re.compile(r'407|ERR_TUNNEL|ERR_FAILED|net::|unpkg|jsdelivr|Failed to load resource|youtube|ytimg', re.I)
TAPSTART = "() => { const t = document.querySelector('.tapstart'); if (t) { t.click(); return 'tap'; } if (!(CM.loader && CM.loader.isVisible && CM.loader.isVisible()) && !(CM.gameUI && CM.gameUI.waitingStart)) return 'none'; return false; }"
LEVEL = {'brilliant': 0, 'great': 0, 'best': 0, 'book': 0, 'excellent': 1, 'good': 2, 'inaccuracy': 3, 'mistake': 4, 'miss': 5, 'blunder': 5}
KIND = {'Brilliant': 'brilliant', 'Great move': 'great', 'Best move': 'best', 'Excellent': 'excellent', 'Good': 'good', 'Book move': 'book',
        'Inaccuracy': 'inaccuracy', 'Mistake': 'mistake', 'Miss': 'miss', 'Blunder': 'blunder'}
BADGES = r'''() => [...document.querySelectorAll('.mq-badge')].map(b => {
    const i = +b.dataset.sq, sq = document.querySelector('.board .sq[data-i="' + i + '"]'), r = b.getBoundingClientRect(), s = sq.getBoundingClientRect(), cs = getComputedStyle(b);
    let clip = null;
    for (let a = b.parentElement; a && a !== document.documentElement; a = a.parentElement) {
      const st = getComputedStyle(a); if (st.overflowX === 'visible' && st.overflowY === 'visible') continue;
      const q = a.getBoundingClientRect();
      if (r.left < q.left - 0.5 || r.right > q.right + 0.5 || r.top < q.top - 0.5 || r.bottom > q.bottom + 0.5) { clip = (a.id || a.className) + ''; break; }
    }
    const vw = document.documentElement.clientWidth;
    if (!clip && (r.left < 0 || r.right > vw)) clip = 'viewport';
    return { sq: i, alt: b.alt, loaded: b.complete && b.naturalWidth > 0, ovl: !!b.closest('#board-ovl'), inSq: !!b.closest('.sq'), w: r.width,
      dx: r.left + r.width / 2 - s.right, dy: r.top + r.height / 2 - s.top, op: +cs.opacity, clip,
      z: +getComputedStyle(b.closest('#board-ovl') || b).zIndex || 0 }; })'''
TINT = r'''() => { const g = CM.gameUI.controller, l = g.last; if (!l) return null;
  return [l.f, l.t].map(i => { const e = document.querySelector('.board .sq[data-i="' + i + '"]');
    return { i, cls: [...e.classList].filter(c => c.startsWith('mq-q')).join(' '), bg: getComputedStyle(e, '::before').backgroundColor }; }); }'''
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
    def route(r):
        u = r.request.url
        if args.sf_dir and 'unpkg.com/stockfish@18' in u:
            f = os.path.join(args.sf_dir, u.split('/')[-1].split('?')[0])
            return r.fulfill(path=f, headers={'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/wasm' if f.endswith('.wasm') else 'text/javascript'})
        return r.abort()
    ctx.route(re.compile(r'https?://(?!127\.0\.0\.1).*'), route)
    pg = ctx.new_page(); errs = []
    pg.on('console', lambda m: m.type == 'error' and not NOISE.search(m.text) and errs.append(m.text[:200]))
    pg.on('pageerror', lambda e: errs.append('pageerror: ' + str(e)[:200]))
    pg.goto(base + '#/play/eCC-U9w9RvQ', timeout=20000)
    pg.wait_for_function('window.CM && CM.gameUI && CM.gameUI.controller && CM.gameUI.controller.state && CM.mirrorReview', timeout=30000)
    try: pg.wait_for_function(TAPSTART, timeout=30000)
    except Exception: pass
    pg.wait_for_timeout(1200)
    # the fish answers 3.2 s later than usual so the player's badge can be checked (and fade) on its own; a rAF monitor records any
    # frame where a badge is visible while the piece on its square is still sliding
    pg.evaluate('''(() => { const c = CM.bot.choose; CM.bot.choose = function () { const a = arguments; return new Promise(r => setTimeout(() => r(c.apply(null, a)), 3200)); };
      window.__mqBad = []; const loop = () => { document.querySelectorAll('.mq-badge').forEach(b => { const sq = document.querySelector('.board .sq[data-i="' + b.dataset.sq + '"]');
        if (sq && sq.querySelector('.pc.is-moving') && +getComputedStyle(b).opacity > 0.05) window.__mqBad.push(+b.dataset.sq); }); requestAnimationFrame(loop); }; loop(); })()''')

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
        if not x['ovl'] or x['inSq']: fails.append(f'{where}: badge not in the board-level overlay')
        if x['clip']: fails.append(f'{where}: badge clipped by {x["clip"]}')
        if abs(x['dx']) > 1.5 or abs(x['dy']) > 1.5: fails.append(f'{where}: badge centre {x["dx"]:.1f},{x["dy"]:.1f} px off the top-right corner point')
        if x['w'] < 21.5 or x['w'] > 44.5: fails.append(f'{where}: badge {x["w"]:.1f} px wide (22-44)')
        if x['op'] < 0.99: fails.append(f'{where}: badge not fully shown (opacity {x["op"]})')
        if want_kind and k != want_kind: fails.append(f'{where}: badge {k}, want {want_kind}')
        return k
    def check_tint(where, kind):
        t = pg.evaluate(TINT)
        if not t: return
        for e in t:
            if f'mq-q-{kind}' not in e['cls']: fails.append(f'{where}: square {e["i"]} classes "{e["cls"]}", want mq-q-{kind}')
            if e['bg'].replace(' ', '') in ('rgba(255,255,51,0.5)', 'rgba(0,0,0,0)'): fails.append(f'{where}: square {e["i"]} still {e["bg"]}')
    def wait_badge(where, sq):   # the badge pops once graded: check it while it is up, then that it goes away
        try: pg.wait_for_function(f"(() => {{ const b = CM.gameUI.controller.state.x.qbadge; return b && b.sq === {sq} && performance.now() > b.at + 300; }})()", timeout=30000)
        except Exception: fails.append(f'{where}: no badge'); return None, None
        at = pg.evaluate('CM.gameUI.controller.state.x.qbadge.at')
        k = check_badge(where, sq); shot = os.path.join(args.out, f'{where.replace(" ", "_")}_{k}.png'); pg.screenshot(path=shot)
        if k: check_tint(where, k)
        try: pg.wait_for_function("document.querySelectorAll('.mq-badge').length === 0 || +getComputedStyle(document.querySelector('.mq-badge')).opacity < 0.02", timeout=2500)
        except Exception: fails.append(f'{where}: badge still there 2 s after it popped')
        g = pg.evaluate(f'performance.now() - {at}')
        if g < 1250: fails.append(f'{where}: badge gone after only {g:.0f} ms (want ~1.3 s)')
        if k: check_tint(where + ' after fade', k)   # the colour stays until the next move
        return k, shot
    pg.evaluate("(() => { window.__toasts = []; const t = CM.gameUI.toast; CM.gameUI.toast = function (x, ms) { if (x) window.__toasts.push(String(x)); return t.apply(this, arguments); }; })()")
    def toasts(): return pg.evaluate("(() => { const t = window.__toasts.join(' | '); window.__toasts = []; return t; })()")
    ranks = [0, 1, 2, 3, 6, 99, 0, 4]
    for rnd in range(args.rounds):
        if pg.evaluate('!!CM.gameUI.controller.over'): log.append(('over', rnd)); break
        if rnd == args.rounds - 2: pg.evaluate("CM.settings.set('mqRank', false)")
        if rnd == args.rounds - 1: pg.evaluate("CM.settings.set('mqBadges', false)")
        want = ranks[rnd % len(ranks)]
        mv = pg.evaluate(f"""(async () => {{ const g = CM.gameUI.controller, fen = CM.fairy.toFEN(g.V, g.state, {{ variant: 'chess' }});
          const r = await CM.stockfish.analyse(fen, {{ version: '18', multipv: 12, movetime: 700 }}) || await CM.fairy.analyse({{ variant: 'chess', fen, multipv: 12, movetime: 700 }});
          const L = r.lines.map(l => l.uci), legal = g.moves.filter(m => !m.promo || m.promo === 'Q'), name = m => g.V.geo.name(m.f) + g.V.geo.name(m.t);
          let m = {want} < L.length ? legal.find(x => name(x) === L[{want}].slice(0, 4)) : null;
          if (!m) m = legal.find(x => !L.slice(0, 5).includes(name(x))) || legal[0];
          return [m.f, m.t, name(m), L.slice(0, 5).indexOf(name(m))]; }})()""")
        before = pg.evaluate('CM.gameUI.controller.state.ply')
        tap(mv[0]); tap(mv[1])
        early = pg.evaluate(BADGES)
        if any(x['sq'] != mv[1] for x in early): fails.append(f'round {rnd}: old badge still up after your move: {early}')
        exp_M = mv[3] + 1 if 0 <= mv[3] < 4 else 5
        try: pg.wait_for_function(f"CM.gameUI.controller.state.x.mirrorK != null && CM.gameUI.controller.state.ply === {before + 1} && !!CM.gameUI.controller._mqPlan || CM.gameUI.controller.state.ply > {before + 1}", timeout=30000)
        except Exception: fails.append(f'round {rnd}: no mirror plan')
        M = pg.evaluate('CM.gameUI.controller.state.x.mirrorK') + 1
        if M != exp_M: log.append((rnd, f'rank differs from the QA probe (engine timing): probe #{exp_M}, game #{M}'))
        tt = toasts()
        if rnd == args.rounds - 2 or rnd == args.rounds - 1:
            if 'MirrorFish will' in tt: fails.append(f'round {rnd}: rank toast shown with "Show move rank" off: {tt}')
        elif 'MirrorFish will' not in tt: log.append((rnd, 'no rank toast seen', tt))
        badges_on = rnd != args.rounds - 1
        pk = fk = None
        if badges_on: pk, _ = wait_badge(f'r{rnd} you {mv[2]}', mv[1])
        try: pg.wait_for_function("(() => { const g = CM.gameUI.controller; return g.over || (g.state.turn === g.human && !g.busy); })()", timeout=40000)
        except Exception: fails.append(f'round {rnd}: fish did not answer'); break
        if pg.evaluate('!!CM.gameUI.controller.over'): log.append(('over after fish', rnd)); break
        last = pg.evaluate('(() => { const g = CM.gameUI.controller, l = g.last, pl = g._mqLastPlan; return [l.f, l.t, g.V.geo.name(l.f) + g.V.geo.name(l.t), pl && pl.uci]; })()')
        if last[3] and last[3][:4] != last[2]: fails.append(f'round {rnd}: fish played {last[2]}, the plan was {last[3]}')
        if badges_on:
            fk, _ = wait_badge(f'r{rnd} fish {last[2]}', last[1])
            if rnd == 2:   # flip: same square, new top-right corner (re-show the badge to check it)
                pg.evaluate('(() => { const g = CM.gameUI.controller, b = g.state.x.qbadge; g.ctx.setX("qbadge", Object.assign({}, b, { gone: false, at: performance.now() })); g.userFlip = !g.userFlip; g.render(); })()'); pg.wait_for_timeout(350)
                check_badge(f'r{rnd} flipped', last[1], fk); pg.screenshot(path=os.path.join(args.out, f'r{rnd}_flipped.png'))
                pg.evaluate('(() => { const g = CM.gameUI.controller; g.userFlip = !g.userFlip; g.render(); })()'); pg.wait_for_timeout(1800)
        else:
            pg.wait_for_timeout(2500)
            n = pg.evaluate("document.querySelectorAll('.mq-badge, .sq[class*=mq-q]').length")
            if n: fails.append(f'round {rnd}: badges off but {n} badge/tint elements')
            t = pg.evaluate(TINT)
            if t and any(e['bg'].replace(' ', '') in ('rgba(0,0,0,0)',) for e in t): fails.append(f'round {rnd}: badges off but no last-move highlight {t}')
            pg.screenshot(path=os.path.join(args.out, f'r{rnd}_badges_off.png'))
        log.append((rnd, 'you', mv[2], f'#{M}', pk, 'fish', last[2], fk))
    pg.evaluate("CM.settings.set('mqRank', true); CM.settings.set('mqBadges', true)")
    bad = pg.evaluate('window.__mqBad.length')
    if bad: fails.append(f'{bad} frames with a badge visible over a sliding piece')
    # edge squares: a synthetic badge on h8 (top-right corner of the board), e8 (top row), h3 (right file)
    for name, kind in (('h8', 'brilliant'), ('e8', 'blunder'), ('h3', 'great')):
        i = pg.evaluate(f"CM.gameUI.controller.V.geo.parse('{name}')")
        pg.evaluate(f"(() => {{ const g = CM.gameUI.controller; g.ctx.setX('qbadge', {{ sq: {i}, f: -1, k: '{kind}', at: performance.now() }}); g.render(); }})()")
        pg.wait_for_timeout(400)
        check_badge(f'edge {name}', i, kind)
        bd = pg.query_selector('.board').bounding_box()
        pg.screenshot(path=os.path.join(args.out, f'edge_{name}.png'), clip={'x': max(0, bd['x'] - 12), 'y': max(0, bd['y'] - 12), 'width': min(VW - max(0, bd['x'] - 12), bd['width'] + 24), 'height': bd['height'] + 24})
    pg.screenshot(path=os.path.join(args.out, 'full.png'))
    if errs: fails.append('console: ' + ' | '.join(errs[:5]))
    b.close()
for l in log: print(l)
print('FAIL' if fails else 'OK', len(fails)); [print(' -', f) for f in fails]
raise SystemExit(1 if fails else 0)
