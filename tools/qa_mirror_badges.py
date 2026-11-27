"""QA for the MirrorFish (eCC-U9w9RvQ) move-quality review, touch, default 390x844 and the Flip6 cover 360x374.
Plays White by tapping the board. Each round it picks a move of a target quality class (Book, Best, Excellent, Good,
Inaccuracy, Mistake, Blunder, ...) with the same review the game uses (CM.mirrorReview), then checks:
  - your badge = the game's class for your move (x.mirrorQ), the fish's reply is in the same class (Book and the
    Best family count as one), or that class did not exist for the fish this turn (nearest class);
  - exactly one badge, image loaded, in the board-level overlay (#board-ovl, not inside a square), its centre on the
    destination square's top-right corner point (within 1.5 px), 11-22 px wide, not clipped by any ancestor;
  - no badge while the piece under it is still sliding; the old badge is gone as soon as you move;
  - the last move's from/to squares carry the class tint (mq-q-<kind>), not the yellow last-move colour;
  - board flip: the badge moves to the same square's new top-right corner;
  - synthetic badges on h8 (top row + right file), e8 (top row) and h3 (right file) are fully visible (overhang
    outside the board, nothing clips them).
Console must be clean. Screenshots go to --out.
  python3 tools/qa_mirror_badges.py [--out /tmp/qa_mirror] [--size 390x844] [--rounds 8] [--port 8861]"""
import os, time, threading, http.server, socketserver, functools, argparse, re
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ap = argparse.ArgumentParser(); ap.add_argument('--out', default='/tmp/qa_mirror'); ap.add_argument('--rounds', type=int, default=8)
ap.add_argument('--size', default='390x844'); ap.add_argument('--port', type=int, default=8861)
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
    ctx.route(re.compile(r'https?://(?!127\.0\.0\.1).*'), lambda r: r.abort())
    pg = ctx.new_page(); errs = []
    pg.on('console', lambda m: m.type == 'error' and not NOISE.search(m.text) and errs.append(m.text[:200]))
    pg.on('pageerror', lambda e: errs.append('pageerror: ' + str(e)[:200]))
    pg.goto(base + '#/play/eCC-U9w9RvQ', timeout=20000)
    pg.wait_for_function('window.CM && CM.gameUI && CM.gameUI.controller && CM.gameUI.controller.state && CM.mirrorReview', timeout=30000)
    try: pg.wait_for_function(TAPSTART, timeout=30000)
    except Exception: pass
    pg.wait_for_timeout(1200)
    # the fish answers 1.6 s later than usual so the player's badge can be checked on its own; a rAF monitor records any
    # frame where a badge is visible while the piece on its square is still sliding
    pg.evaluate('''(() => { const c = CM.bot.choose; CM.bot.choose = function () { const a = arguments; return new Promise(r => setTimeout(() => r(c.apply(null, a)), 1600)); };
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
        if x['w'] < 11 or x['w'] > 22.5: fails.append(f'{where}: badge {x["w"]:.1f} px wide (11-22)')
        if x['op'] < 0.99: fails.append(f'{where}: badge not fully shown (opacity {x["op"]})')
        if want_kind and k != want_kind: fails.append(f'{where}: badge {k}, want {want_kind}')
        return k
    def check_tint(where, kind):
        t = pg.evaluate(TINT)
        if not t: return
        for e in t:
            if f'mq-q-{kind}' not in e['cls']: fails.append(f'{where}: square {e["i"]} classes "{e["cls"]}", want mq-q-{kind}')
            if e['bg'].replace(' ', '') in ('rgba(255,255,51,0.5)', 'rgba(0,0,0,0)'): fails.append(f'{where}: square {e["i"]} still {e["bg"]}')
    want_seq = ['book', 'book', 'best', 'excellent', 'good', 'inaccuracy', 'mistake', 'blunder', 'best', 'good']
    for rnd in range(args.rounds):
        g = pg.evaluate('(() => { const g = CM.gameUI.controller; return { over: !!g.over }; })()')
        if g['over']: log.append(('over', rnd)); break
        want = want_seq[rnd % len(want_seq)]
        mv = pg.evaluate(f"""(() => {{ const g = CM.gameUI.controller, R = CM.mirrorReview, S = new CM.Search(g.V, {{}}), s0 = g.history.length ? g.history[0].state : g.state;
          const L = S.rank(g.state, {{ moves: g.moves.filter(m => !m.promo || m.promo === 'Q'), maxDepth: 4, timeMs: 900, noise: 0 }});
          const C = L.map(x => ({{ x, k: R.classify(g.V, g.state, L, x, s0) }}));
          const want = '{want}', lv = R.LEVEL[want];
          const c = C.find(c => c.k === want) || C.slice().sort((a, b) => Math.abs(R.LEVEL[a.k] - lv) - Math.abs(R.LEVEL[b.k] - lv))[0];
          return [c.x.m.f, c.x.m.t, g.V.geo.name(c.x.m.f) + g.V.geo.name(c.x.m.t), c.k]; }})()""")
        tap(mv[0]); tap(mv[1])
        early = pg.evaluate(BADGES)   # the fish's old badge is gone as soon as you move
        if any(x['sq'] != mv[1] for x in early): fails.append(f'round {rnd}: old badge still up after your move: {early}')
        try: pg.wait_for_function("(() => { const g = CM.gameUI.controller; return g.over || g.state.x.qbadge; })()", timeout=20000)
        except Exception: fails.append(f'round {rnd}: no badge for the player move'); break
        pg.wait_for_timeout(450)
        k = pg.evaluate('(() => { const g = CM.gameUI.controller; return { k: (g.state.x.qbadge || {}).k, q: g.state.x.mirrorQ, turn: g.state.turn, human: g.human }; })()')
        pk = None
        if k['turn'] != k['human']:   # still the fish's turn: the player's badge is up
            pk = check_badge(f'round {rnd} you {mv[2]}', mv[1], (k['q'] or {}).get('k'))
            if pk: check_tint(f'round {rnd} you', pk)
            pg.screenshot(path=os.path.join(args.out, f'r{rnd}_you_{pk}.png'))
        try: pg.wait_for_function("(() => { const g = CM.gameUI.controller; return g.over || (g.state.turn === g.human && !g.busy); })()", timeout=40000)
        except Exception: fails.append(f'round {rnd}: fish did not answer'); break
        pg.wait_for_timeout(700)
        if pg.evaluate('!!CM.gameUI.controller.over'): log.append(('over after fish', rnd)); break
        last = pg.evaluate('(() => { const l = CM.gameUI.controller.last; return [l.f, l.t, CM.gameUI.controller.V.geo.name(l.f) + CM.gameUI.controller.V.geo.name(l.t)]; })()')
        fk = check_badge(f'round {rnd} fish {last[2]}', last[1])
        if fk: check_tint(f'round {rnd} fish', fk)
        ml = pg.evaluate('CM.gameUI.controller._mqLast || null') or {}
        if fk and pk and LEVEL[fk] != LEVEL[pk]:
            had = ml.get('had') or []
            if any(LEVEL[h] == LEVEL[pk] for h in had):
                fails.append(f'round {rnd}: fish {fk} not in the class of your {pk} although it had {had}')
            else: log.append((rnd, f'no {pk} move for the fish, nearest {fk}', had))
        log.append((rnd, 'you', mv[2], pk, 'fish', last[2], fk))
        pg.screenshot(path=os.path.join(args.out, f'r{rnd}_fish_{fk}.png'))
        if rnd == 2:   # flip: same square, new top-right corner
            pg.evaluate('(() => { const g = CM.gameUI.controller; g.userFlip = !g.userFlip; g.render(); })()'); pg.wait_for_timeout(250)
            check_badge(f'round {rnd} flipped', last[1], fk)
            pg.screenshot(path=os.path.join(args.out, f'r{rnd}_flipped.png'))
            pg.evaluate('(() => { const g = CM.gameUI.controller; g.userFlip = !g.userFlip; g.render(); })()'); pg.wait_for_timeout(250)
    bad = pg.evaluate('window.__mqBad.length')
    if bad: fails.append(f'{bad} frames with a badge visible over a sliding piece')
    # edge squares: a synthetic badge on h8 (top-right corner of the board), e8 (top row), h3 (right file)
    for name, kind in (('h8', 'brilliant'), ('e8', 'blunder'), ('h3', 'great')):
        i = pg.evaluate(f"CM.gameUI.controller.V.geo.parse('{name}')")
        pg.evaluate(f"(() => {{ const g = CM.gameUI.controller; g.ctx.setX('qbadge', {{ sq: {i}, f: -1, k: '{kind}', at: performance.now() }}); g.render(); }})()")
        pg.wait_for_timeout(450)
        check_badge(f'edge {name}', i, kind)
        bd = pg.query_selector('.board').bounding_box()
        pg.screenshot(path=os.path.join(args.out, f'edge_{name}.png'), clip={'x': max(0, bd['x'] - 12), 'y': max(0, bd['y'] - 12), 'width': min(VW - max(0, bd['x'] - 12), bd['width'] + 24), 'height': bd['height'] + 24})
    pg.screenshot(path=os.path.join(args.out, 'full.png'))
    if errs: fails.append('console: ' + ' | '.join(errs[:5]))
    b.close()
for l in log: print(l)
print('FAIL' if fails else 'OK', len(fails)); [print(' -', f) for f in fails]
raise SystemExit(1 if fails else 0)
