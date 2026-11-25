#!/usr/bin/env python3
"""Core UI bug scan at a phone width (playwright + chromium): lobby (tabs, search, empty state, rows open), options
sheet (every board theme + piece set, toggles, Escape), board/piece skins actually drawn, sounds present, the
standard game (move, bot reply, flip, undo, new game), the promotion picker (Q/R/B/N), resign + game-over modal +
rematch, and back navigation (back button, browser back/forward, lobby scroll restore).

  python3 tools/qa_ui.py [--width 390] [--out DIR] [--port 8795]
Prints a JSON report and exits 1 when any check fails."""
import sys, os, json, time, threading, http.server, socketserver, functools, argparse
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ap = argparse.ArgumentParser()
ap.add_argument('--width', type=int, default=390)
ap.add_argument('--out', default='/workspace/work/qa_ui_shots')
ap.add_argument('--port', type=int, default=8795)
args = ap.parse_args()
os.makedirs(args.out, exist_ok=True)


def serve():
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a, **k): pass
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(('127.0.0.1', args.port), functools.partial(Q, directory=ROOT)) as s: s.serve_forever()
threading.Thread(target=serve, daemon=True).start(); time.sleep(0.4)
BASE = f'http://127.0.0.1:{args.port}/index.html'
IGNORE = ('i.ytimg.com', 'unpkg', 'ERR_NAME_NOT_RESOLVED', 'ERR_TUNNEL', 'ERR_PROXY', 'ERR_CONNECTION', 'ERR_ABORTED')

res = {'checks': {}, 'errors': [], 'missing': []}
def check(name, ok, info=None):
    res['checks'][name] = {'ok': bool(ok), **({'info': info} if info is not None else {})}
    print(('ok   ' if ok else 'FAIL ') + name + ('' if info is None else '  ' + json.dumps(info)[:300]), flush=True)

with sync_playwright() as p:
    b = p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required'])
    ctx = b.new_context(viewport={'width': args.width, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True)
    pg = ctx.new_page()
    def on_console(m):
        if m.type != 'error' or any(s in m.text for s in IGNORE): return
        loc = (m.location or {}).get('url') or ''
        if loc and urlparse(loc).hostname not in ('127.0.0.1', None): return   # external CDN/thumbnail behind the sandbox proxy
        if '407 (Proxy Authentication Required)' in m.text: return
        res['errors'].append(m.text[:300])
    pg.on('console', on_console)
    pg.on('pageerror', lambda e: res['errors'].append('pageerror: ' + str(e)[:300]))
    def on_resp(r):
        u = urlparse(r.url)
        if u.hostname == '127.0.0.1' and r.status >= 400: res['missing'].append(f'{r.status} {u.path}')
    pg.on('response', on_resp)
    pg.goto(BASE); pg.wait_for_timeout(800)
    W = lambda: pg.evaluate('document.documentElement.scrollWidth')

    # ---- lobby ----
    tabs = pg.eval_on_selector_all('#tabs [data-tab]', 'e => e.map(x => x.dataset.tab)')
    check('lobby: tabs rendered', len(tabs) >= 3, len(tabs))
    check('lobby: rows rendered', pg.eval_on_selector_all('#rows .vrow', 'e => e.length') > 10)
    check('lobby: no horizontal overflow', W() <= args.width, W())
    bad = []
    for t in tabs:
        pg.click(f'#tabs [data-tab="{t}"]'); pg.wait_for_timeout(60)
        n = pg.eval_on_selector_all('#rows .vrow', 'e => e.length')
        if n == 0 or W() > args.width: bad.append([t, n, W()])
    check('lobby: every tab lists videos without overflow', not bad, bad or len(tabs))
    pg.click('#tabs [data-tab="all"]')
    pg.click('[data-more]'); pg.wait_for_timeout(80)
    check('lobby: "See all" switches tab', pg.eval_on_selector('#tabs [aria-selected="true"]', 'e => e.dataset.tab') != 'all')
    pg.click('#tabs [data-tab="all"]')
    pg.fill('#q', 'atomic'); pg.wait_for_timeout(150)
    n = pg.eval_on_selector_all('#rows .vrow', 'e => e.length')
    check('search: "atomic" finds rows, quick row hidden', n > 0 and pg.eval_on_selector('#quick', 'e => e.hidden'), n)
    pg.fill('#q', 'Atómic'); pg.wait_for_timeout(150)
    check('search: accent/case-insensitive', pg.eval_on_selector_all('#rows .vrow', 'e => e.length') == n)
    pg.fill('#q', 'zzqqxxnotavideo'); pg.wait_for_timeout(150)
    check('search: empty state shown', not pg.eval_on_selector('#empty', 'e => e.hidden'))
    pg.fill('#q', ''); pg.wait_for_timeout(150)
    check('search: clearing restores lobby', pg.eval_on_selector('#empty', 'e => e.hidden') and not pg.eval_on_selector('#quick', 'e => e.hidden'))
    pg.screenshot(path=f'{args.out}/lobby_{args.width}.png')

    # ---- options sheet ----
    pg.click('#open-settings'); pg.wait_for_timeout(300)
    check('options: sheet opens', pg.eval_on_selector('#settings', 'e => e.classList.contains("is-open")'))
    boards = pg.eval_on_selector_all('[data-board]', 'e => e.map(x => x.dataset.board)')
    pieces = pg.eval_on_selector_all('[data-pieces]', 'e => e.map(x => x.dataset.pieces)')
    for k in boards: pg.click(f'[data-board="{k}"]'); pg.wait_for_timeout(40)
    for k in pieces: pg.click(f'[data-pieces="{k}"]'); pg.wait_for_timeout(40)
    pg.wait_for_timeout(400)
    broken = pg.evaluate('''() => Array.from(document.querySelectorAll('#settings img')).filter(i => i.complete && !i.naturalWidth).map(i => i.getAttribute('src'))''')
    check('options: every board/piece swatch image loads', not broken, broken[:5] or [len(boards), len(pieces)])
    sheet_w = pg.evaluate('document.querySelector("#settings .sheet__panel").scrollWidth - document.querySelector("#settings .sheet__panel").clientWidth')
    check('options: sheet has no horizontal overflow', sheet_w <= 1, sheet_w)
    pg.screenshot(path=f'{args.out}/options_{args.width}.png')
    pg.keyboard.press('Escape'); pg.wait_for_timeout(300)
    check('options: Escape closes', not pg.eval_on_selector('#settings', 'e => e.classList.contains("is-open")'))
    pg.evaluate('localStorage.clear()'); pg.reload(); pg.wait_for_timeout(600)

    # ---- sounds ----
    snd = pg.evaluate('''async () => { const n = ['move-self','move-opponent','capture','castle','move-check','promote','game-start','game-end','illegal','notify','premove','tenseconds'];
      const r = []; for (const x of n) { const q = await fetch('assets/sounds/' + x + '.mp3'); if (!q.ok) r.push(x); }
      for (const x of ['tick','jumpscare','explosion']) { const q = await fetch('assets/sounds/' + x + '.wav'); if (!q.ok) r.push(x); } return r; }''')
    check('sounds: every core sound file is served', not snd, snd)

    # ---- standard game ----
    pg.evaluate('window.scrollTo(0, 600)'); pg.wait_for_timeout(100)
    y0 = pg.evaluate('window.scrollY')
    pg.evaluate('document.querySelector("[data-quick=stockfish]").click()')  # a real click would scroll the row into view first
    pg.wait_for_function('CM.gameUI.controller && CM.gameUI.controller.state', timeout=15000); pg.wait_for_timeout(500)
    check('game: opens from quick row', pg.evaluate('CM.app.view') == 'game' and '#/play/stockfish' in pg.url, pg.url)
    check('game: no horizontal overflow', W() <= args.width, W())
    bw = pg.evaluate('document.getElementById("board").getBoundingClientRect().right')
    check('game: board fits screen', bw <= args.width + 0.5, bw)
    sq = lambda n: pg.evaluate(f'''(() => {{ const c = CM.gameUI.controller, g = c.V.geo || c.V.g; const i = (g.parse ? g.parse('{n}') : null);
        const r = CM.gameUI.board.rectOf(i); return [r.left + r.width/2, r.top + r.height/2]; }})()''')
    def tap(n):
        x, y = sq(n); pg.mouse.click(x, y); pg.wait_for_timeout(120)
    tap('e2'); dots = pg.eval_on_selector_all('#board .sq.is-target', 'e => e.length')
    check('game: selecting a pawn shows legal-move dots', dots >= 2, dots)
    tap('e4')
    try:
        pg.wait_for_function('CM.gameUI.controller.history.length >= 2', timeout=20000); ok = True
    except Exception: ok = False
    check('game: move played and bot replied', ok, pg.evaluate('CM.gameUI.controller.sans'))
    pg.click('#flip'); pg.wait_for_timeout(250)
    check('game: flip', pg.evaluate('CM.gameUI.controller.flipped()'))
    pg.click('#flip'); pg.wait_for_timeout(250)
    pg.click('#undo'); pg.wait_for_timeout(400)
    check('game: undo takes back to the human turn', pg.evaluate('CM.gameUI.controller.history.length') == 0, pg.evaluate('CM.gameUI.controller.history.length'))
    pg.click('#act-options'); pg.wait_for_timeout(300)
    for k in ('neo', 'wood', 'green'):
        if pg.query_selector(f'[data-board="{k}"]'): pg.click(f'[data-board="{k}"]'); pg.wait_for_timeout(60)
    pset = [x for x in pg.eval_on_selector_all('[data-pieces]', 'e => e.map(x => x.dataset.pieces)')]
    skin_bad = []
    for k in pset:
        pg.click(f'[data-pieces="{k}"]'); pg.wait_for_timeout(250)
        srcs = pg.evaluate('''() => Array.from(document.querySelectorAll('#board img')).map(i => [i.getAttribute('src'), i.complete && !!i.naturalWidth])''')
        if not srcs or not all(s[1] for s in srcs) or not any(k in (s[0] or '') for s in srcs): skin_bad.append([k, [s for s in srcs if not s[1]][:2] or srcs[:1]])
    check('skins: every piece set is drawn on the board', not skin_bad, skin_bad[:3] or pset)
    if pg.query_selector('[data-board="wood"]'):
        pg.click('[data-board="wood"]'); pg.wait_for_timeout(400)
        img = pg.evaluate('getComputedStyle(document.querySelector("#board .sq.is-light")).backgroundImage')
        check('skins: wood board texture resolves (no css/ relative url)', 'wood-light' in img and '/css/' not in img, img[:120])
    pg.evaluate('localStorage.clear()'); pg.keyboard.press('Escape'); pg.wait_for_timeout(300)
    pg.screenshot(path=f'{args.out}/game_{args.width}.png')

    # ---- promotion picker ----
    pg.evaluate('''() => { const c = CM.gameUI.controller; window.__setup0 = c.spec.setup; c.spec.setup = Object.assign({}, c.spec.setup, { fen: '7k/P7/8/8/8/8/8/K7' }); CM.settings.set('autoQueen', false); c.newGame(); }''')
    pg.wait_for_timeout(500)
    tap('a7'); tap('a8'); pg.wait_for_timeout(300)
    vis = pg.evaluate('!document.getElementById("promo").hidden')
    opts = pg.eval_on_selector_all('#promo [data-promo], #promo button, #promo .promo__pc', 'e => e.length')
    check('promotion: picker opens with options', vis and opts >= 4, {'visible': vis, 'options': opts})
    if vis:
        pr = pg.evaluate('(() => { const b = document.querySelector("#promo .promo__col").getBoundingClientRect(); return [b.left, b.right, b.top, b.bottom]; })()')
        check('promotion: picker inside the screen', pr[0] >= 0 and pr[1] <= args.width and pr[2] >= 0, pr)
        pg.screenshot(path=f'{args.out}/promo_{args.width}.png')
        btn = pg.query_selector_all('#promo [data-promo], #promo button, #promo .promo__pc')
        btn[min(3, len(btn) - 1)].click(); pg.wait_for_timeout(400)
        a8 = pg.evaluate('''(() => { const c = CM.gameUI.controller, g = c.V.geo || c.V.g; const p = c.state.b[g.parse('a8')]; return p && (p.type || p.t || p); })()''')
        check('promotion: chosen piece lands (not a queen)', a8 not in (None, 'Q', 'P'), a8)
    pg.evaluate('CM.settings.set("autoQueen", true)')

    # ---- resign + game over + rematch ----
    pg.evaluate('''() => { const c = CM.gameUI.controller; c.spec.setup = window.__setup0; }''')
    pg.click('#newg'); pg.wait_for_timeout(500)
    has_resign = pg.query_selector('#resign') is not None
    check('resign: Resign button in the game actions', has_resign)
    if has_resign:
        pg.click('#resign'); pg.wait_for_timeout(200)
        check('resign: first tap only arms (asks Sure?)', not pg.evaluate('!!CM.gameUI.controller.over') and 'Sure' in pg.inner_text('#resign'))
        pg.click('#resign')
        try: pg.wait_for_selector('#gover.is-open', timeout=4000); op = True
        except Exception: op = False
        check('resign: game-over modal opens', op, pg.eval_on_selector('#gotitle', 'e => e.textContent'))
        pg.screenshot(path=f'{args.out}/gameover_{args.width}.png')
        pg.click('#gonew'); pg.wait_for_timeout(500)
        check('rematch: New Game resets the board', not pg.evaluate('!!CM.gameUI.controller.over') and pg.evaluate('CM.gameUI.controller.history.length') == 0)

    # ---- back navigation ----
    pg.click('#back'); pg.wait_for_timeout(600)
    check('back: header back returns to lobby', pg.evaluate('CM.app.view') == 'lobby' and not pg.evaluate('document.getElementById("view-lobby").hidden'), pg.url)
    check('back: lobby scroll position restored', abs(pg.evaluate('window.scrollY') - y0) < 5, [y0, pg.evaluate('window.scrollY')])
    pg.go_forward(); pg.wait_for_timeout(1200)
    check('history: forward reopens the game', pg.evaluate('CM.app.view') == 'game', pg.url)
    pg.go_back(); pg.wait_for_timeout(800)
    check('history: browser back returns to lobby', pg.evaluate('CM.app.view') == 'lobby', pg.url)
    pg.click("#rows .vrow", timeout=5000) if pg.evaluate("CM.app.view") == "lobby" else None; pg.wait_for_timeout(2500)
    check('lobby: tapping a video row opens a game', pg.evaluate('CM.app.view') == 'game', pg.url)
    pg.click('#act-lobby'); pg.wait_for_timeout(600)
    check('back: Lobby action returns to lobby', pg.evaluate('CM.app.view') == 'lobby')
    pg.goto(BASE + '#/play/wTudFnunSL0'); pg.wait_for_timeout(2500)
    check('deep link: #/play/<id> opens the mode', pg.evaluate('CM.app.view') == 'game' and pg.evaluate('!!(CM.gameUI.controller)'))
    pg.goto(BASE + '#/play/notARealId123'); pg.wait_for_timeout(1500)
    check('deep link: unknown id falls back to lobby', pg.evaluate('CM.app.view') == 'lobby')
    lic = pg.evaluate('''async () => { const a = Array.from(document.querySelectorAll('.foot a')).filter(x => !/^https?:/.test(x.getAttribute('href'))); const r = []; for (const x of a) { const q = await fetch(x.getAttribute('href')); if (!q.ok) r.push(x.getAttribute('href')); } return r; }''')
    check('lobby: footer links resolve', not lic, lic)

    check('no console errors', not res['errors'], res['errors'][:5])
    check('no 4xx/5xx local files', not res['missing'], sorted(set(res['missing']))[:8])
    b.close()

fails = [k for k, v in res['checks'].items() if not v['ok']]
print(json.dumps({'width': args.width, 'pass': len(res['checks']) - len(fails), 'fail': fails}, indent=1))
sys.exit(1 if fails else 0)
