#!/usr/bin/env python3
"""m3-themes: skin screenshots + highlight readability check at 390x844 touch.
Writes research/ref/m3-themes/: options sheet (preview strip + pickers), one in-game shot per board with a selected pawn
(selection tint + legal dots) after a move (last-move tint), and a contact sheet of every piece set on the board.
Readability: for each board, the legal dot and last-move tint must differ from the bare square by >= MIN_DE (RGB distance)
on both light and dark squares (tints: >= MIN_HL). Exit 1 on failure.
Usage: python3 tools/m3_themes_shots.py [--port 8797]"""
import os, sys, time, threading, http.server, socketserver, functools, argparse, io
from playwright.sync_api import sync_playwright
from PIL import Image

ap = argparse.ArgumentParser(); ap.add_argument('--port', type=int, default=8797); ap.add_argument('--no-shots', action='store_true')
args = ap.parse_args()
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'research', 'ref', 'm3-themes'); os.makedirs(OUT, exist_ok=True)
MIN_DE = 28   # legal dot vs its square
MIN_HL = 20   # last-move / selection tint vs a bare square of the same colour (the default yellow 0.5 on green dark = ~29)


def serve():
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(('127.0.0.1', args.port), functools.partial(Q, directory=ROOT)) as s: s.serve_forever()


threading.Thread(target=serve, daemon=True).start(); time.sleep(0.4)
BASE = f'http://127.0.0.1:{args.port}/index.html'
fails = []


def px(img, x, y):
    return img.getpixel((int(x), int(y)))[:3]


def de(a, b):
    return sum((p - q) ** 2 for p, q in zip(a, b)) ** 0.5


with sync_playwright() as p:
    b = p.chromium.launch()
    ctx = b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True)
    pg = ctx.new_page(); pg.goto(BASE); pg.wait_for_timeout(1500)
    boards = pg.evaluate('Object.keys(CM.settings.BOARDS)')
    sets = pg.evaluate('Object.keys(CM.settings.PIECES)')
    # options sheet
    pg.click('#open-settings'); pg.wait_for_timeout(500)
    for k in ('night', 'green'):
        pg.click(f'[data-board="{k}"]'); pg.wait_for_timeout(300)
        if not args.no_shots: pg.screenshot(path=f'{OUT}/options_{k}.png')
    pg.evaluate('document.querySelector("#settings-body").scrollTop = 700'); pg.wait_for_timeout(200)
    if not args.no_shots: pg.screenshot(path=f'{OUT}/options_pieces.png')
    pg.keyboard.press('Escape'); pg.wait_for_timeout(300)
    # a standard game
    pg.evaluate('location.hash = "#/play/stockfish"')
    pg.wait_for_function('CM.gameUI.controller && CM.gameUI.controller.state', timeout=20000); pg.wait_for_timeout(800)
    rect = lambda n: pg.evaluate(f'''(() => {{ const c = CM.gameUI.controller, g = c.V.geo || c.V.g; const r = CM.gameUI.board.rectOf(g.parse('{n}')); return [r.left, r.top, r.width, r.height]; }})()''')
    def tap(n):
        x, y, w, h = rect(n); pg.mouse.click(x + w / 2, y + h / 2); pg.wait_for_timeout(150)
    tap('e2'); tap('e4')
    pg.wait_for_function('CM.gameUI.controller.history.length >= 2', timeout=30000); pg.wait_for_timeout(600)
    for k in boards:
        pg.evaluate(f'CM.settings.set("board", "{k}")'); pg.wait_for_timeout(200)
        tap('d2')  # selection + dots on d3 (light) / d4 (dark)
        pg.wait_for_timeout(250)
        img = Image.open(io.BytesIO(pg.screenshot())).convert('RGB'); S = 2
        def at(n, fx=0.5, fy=0.5):
            x, y, w, h = rect(n); return px(img, (x + w * fx) * S, (y + h * fy) * S)
        last = pg.evaluate('Array.from(document.querySelectorAll("#board .sq.is-last")).length')
        res = {}
        # dot on d3 / d4 vs the same square's corner (bare colour)
        for n in ('d3', 'd4'):
            res['dot_' + n] = de(at(n), at(n, 0.92, 0.08))
        # last-move tint: each .is-last square vs a bare square of the same colour (no highlight class), top-right corner pixel (coords sit top-left / bottom-right)
        q = pg.evaluate('''() => { const all = Array.from(document.querySelectorAll('#board .sq'));
            const bare = c => all.find(e => e.classList.contains(c) && !/is-(last|sel|check|target|premove|marked)/.test(e.className));
            return Array.from(document.querySelectorAll('#board .sq.is-last')).map(e => { const c = e.classList.contains('is-light') ? 'is-light' : 'is-dark';
              const r = e.getBoundingClientRect(), b = bare(c).getBoundingClientRect(); return [c, r.left + r.width * 0.92, r.top + r.height * 0.08, b.left + b.width * 0.92, b.top + b.height * 0.08]; }); }''')
        for c, x1, y1, x2, y2 in q:
            res['last_' + c] = min(res.get('last_' + c, 999), de(px(img, x1 * S, y1 * S), px(img, x2 * S, y2 * S)))
        sel = de(at('d2', 0.92, 0.08), at('b2', 0.92, 0.08))
        res['sel_d2'] = sel
        bad = {kk: round(v) for kk, v in res.items() if v < (MIN_DE if kk.startswith('dot') else MIN_HL)}
        print(k, {kk: round(v) for kk, v in res.items()}, 'last-squares', last)
        if bad: fails.append([k, bad])
        if not args.no_shots: img.resize((390, 844)).save(f'{OUT}/game_{k}.png')
        tap('d2')  # deselect
    pg.evaluate('CM.settings.set("board", "green")')
    # every piece set drawn on the board
    tiles = []
    for k in sets:
        pg.evaluate(f'CM.settings.set("pieces", "{k}")'); pg.wait_for_timeout(350)
        srcs = pg.evaluate('Array.from(document.querySelectorAll("#board img")).map(i => [i.getAttribute("src"), i.complete && !!i.naturalWidth])')
        if not srcs or not all(s[1] for s in srcs) or not any(('/' + k + '/') in (s[0] or '') for s in srcs): fails.append([k, 'set not drawn', srcs[:2]])
        el = pg.query_selector('#board')
        tiles.append((k, Image.open(io.BytesIO(el.screenshot())).convert('RGB').resize((180, 180))))
    if not args.no_shots:
        cols = 6; rows = (len(tiles) + cols - 1) // cols
        sheet = Image.new('RGB', (cols * 190, rows * 205), (38, 37, 34))
        from PIL import ImageDraw
        d = ImageDraw.Draw(sheet)
        for i, (k, t) in enumerate(tiles):
            x, y = (i % cols) * 190 + 5, (i // cols) * 205 + 5
            sheet.paste(t, (x, y)); d.text((x, y + 183), k, fill=(230, 230, 230))
        sheet.save(f'{OUT}/piece_sets_sheet.png')
    b.close()

print('FAILS' if fails else 'PASS', fails)
sys.exit(1 if fails else 0)
