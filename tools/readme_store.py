#!/usr/bin/env python3
"""README store page art, s6b (owner 2026-11-26: "Balatro + chess.com + Steam store page", no GIFs).
Everything is static and crisp, in the app's look (css/balatro.css): chess.com colours, Jersey 15 titles
(assets/fonts, OFL), white-rimmed cards with hard drop shadows, chunky colour buttons.
  (hero banner, numbers, how-it-works, theme shelves + final mode cards: tools/readme_long.py, run it after this one)
  docs/media/play.png           PLAY NOW button
  docs/media/tags.png           tag chips
  docs/media/h-*.png            Steam-style section headers
  docs/media/shots/<slug>.jpg   real gameplay screenshots (board column), framed as cards
  docs/media/cards/<slug>.png   featured mode cards (transparent)
Screenshots: python3 tools/readme_store.py --capture (headless Chromium, needs playwright) then python3 tools/readme_store.py."""
import os, sys, math, random, threading, http.server, socketserver, functools
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from fontTools.ttLib import TTFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'docs/media'); TH = os.path.join(ROOT, 'research/frames/video_thumbs'); RAW = '/tmp/readme_store_raw'
for d in (OUT, OUT + '/cards', OUT + '/shots', RAW): os.makedirs(d, exist_ok=True)
def ttf(name):
    p = f'/tmp/store_{name}.ttf'
    if not os.path.exists(p):
        f = TTFont(os.path.join(ROOT, f'assets/fonts/{name}.woff2')); f.flavor = None; f.save(p)
    return p
PIX = ttf('Jersey15')
def px(size, w=400):
    return ImageFont.truetype(PIX, int(size * 1.22), layout_engine=ImageFont.Layout.BASIC)   # Jersey runs small; BASIC = no ligatures
CREAM, INK, SLAB, RIM = (60, 58, 55), (255, 255, 255), (38, 36, 33), (60, 58, 55)   # s6d: chess.com palette (rim = #3c3a37)
RED, RED_D, BLUE, BLUE_D, ORANGE, ORANGE_D, GREEN, GREEN_D = (254, 95, 85), (168, 50, 43), (0, 157, 255), (11, 95, 156), (253, 162, 0), (168, 106, 0), (129, 182, 76), (74, 122, 44)

def felt(w, h, seed=3):
    """s6d: the app's chess.com page colour (#312e2b) with a soft top light, no colour swirl"""
    im = Image.new('RGB', (w, h), (49, 46, 43)); d = ImageDraw.Draw(im)
    glow = Image.new('L', (w, h), 0); ImageDraw.Draw(glow).ellipse((-w * 0.2, -h * 0.9, w * 1.2, h * 0.55), fill=60)
    glow = glow.filter(ImageFilter.GaussianBlur(h * 0.15))
    return Image.composite(Image.new('RGB', (w, h), (64, 61, 57)), im, glow)

def rr_mask(size, r):
    m = Image.new('L', size, 0); ImageDraw.Draw(m).rounded_rectangle((0, 0, size[0] - 1, size[1] - 1), r, fill=255); return m
def cover(im, w, h):
    s = max(w / im.width, h / im.height); im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    x, y = (im.width - w) // 2, (im.height - h) // 2; return im.crop((x, y, x + w, y + h))
def card(face, w, h, rim=10, r=22, label=None, tag=None, tag_col=RED):
    """a Balatro card: white rim, rounded, the face inside, optional pixel label plate at the bottom"""
    c = Image.new('RGBA', (w, h), (0, 0, 0, 0)); c.paste(Image.new('RGBA', (w, h), CREAM + (255,)), (0, 0), rr_mask((w, h), r))
    fw, fh = w - 2 * rim, h - 2 * rim; f = cover(face.convert('RGB'), fw, fh).convert('RGBA')
    c.paste(f, (rim, rim), rr_mask((fw, fh), max(4, r - rim)))
    d = ImageDraw.Draw(c)
    if label:
        sz = max(16, int(h * 0.085))
        while sz > 12 and d.textbbox((0, 0), label, font=px(sz))[2] + 36 > fw - 16: sz -= 1
        fnt = px(sz); tb = d.textbbox((0, 0), label, font=fnt); pw = tb[2] - tb[0] + 36; ph = tb[3] - tb[1] + 22
        x0, y0 = (w - pw) // 2, h - rim - ph - 12
        d.rounded_rectangle((x0, y0 + 5, x0 + pw, y0 + ph + 5), 12, fill=(0, 0, 0, 150))
        d.rounded_rectangle((x0, y0, x0 + pw, y0 + ph), 12, fill=SLAB + (235,), outline=RIM, width=2)
        d.text((w // 2, y0 + ph // 2 + 2), label, font=fnt, fill=(255, 255, 255), anchor='mm')
    if tag:
        fnt = px(max(14, int(h * 0.05))); tb = d.textbbox((0, 0), tag, font=fnt); tw = tb[2] - tb[0] + 20; th = tb[3] - tb[1] + 12
        d.rounded_rectangle((rim + 12, rim + 15, rim + 12 + tw, rim + 15 + th), 8, fill=tuple(int(v * 0.6) for v in tag_col))
        d.rounded_rectangle((rim + 12, rim + 12, rim + 12 + tw, rim + 12 + th), 8, fill=tag_col)
        d.text((rim + 12 + tw // 2, rim + 12 + th // 2 + 1), tag, font=fnt, fill=(255, 255, 255), anchor='mm')
    return c
def drop(base, im, x, y, angle=0, sh=12):
    """paste with a hard drop shadow (straight down, like the app's slabs), optionally rotated"""
    if angle: im = im.rotate(angle, resample=Image.BICUBIC, expand=True)
    a = im.split()[3]; s = Image.new('RGBA', im.size, (0, 0, 0, 120)); s.putalpha(a.point(lambda v: v * 120 // 255))
    base.alpha_composite(s, (int(x), int(y + sh))); base.alpha_composite(im, (int(x), int(y)))
def shadow_text(d, xy, text, font, fill=(255, 255, 255), sh=6, anchor='mm', stroke=0):
    d.text((xy[0], xy[1] + sh), text, font=font, fill=(0, 0, 0), anchor=anchor, stroke_width=stroke, stroke_fill=(0, 0, 0))
    d.text(xy, text, font=font, fill=fill, anchor=anchor, stroke_width=stroke, stroke_fill=(0, 0, 0))
def thumb(mid):
    for k in ('maxresdefault', 'maxres1', 'maxres2'):
        p = os.path.join(TH, f'{mid}_{k}.jpg')
        if os.path.exists(p): return Image.open(p)
    raise FileNotFoundError(mid)

HAND = [('AvZiSnngZjA', 'SHOTGUN KING'), ('HuZlhHnES7M', 'SCP-4975'), ('PszkLYudcws', 'FPS CHESS'), ('BbgwPj-u_gs', '5D CHESS'), ('C9v7G3dJl7E', 'ONCE A PAWN')]
def hero():
    W, H = 1280, 620; im = felt(W, H).convert('RGBA'); d = ImageDraw.Draw(im)
    shadow_text(d, (W // 2, 96), 'CHESS MASTER', px(104), sh=8, stroke=4)
    d.text((W // 2, 168), "every mode from iwantcheckmate's videos, playable in your browser", font=px(26, 400), fill=(207, 214, 217), anchor='mm')
    cw, ch, n = 300, 220, len(HAND)
    for k, (mid, lab) in enumerate(HAND):
        t = k - (n - 1) / 2; ang = -t * 5; x = W / 2 + t * 215 - cw / 2 - 14; y = 238 + abs(t) ** 1.6 * 24
        drop(im, card(thumb(mid), cw, ch, rim=5, r=16, label=lab), x, y, angle=ang * 0.6, sh=10)
    d = ImageDraw.Draw(im); d.text((W // 2, H - 16), "card art: thumbnails from iwantcheckmate's videos", font=px(15, 400), fill=(150, 160, 164), anchor='md')
    im.convert('RGB').save(OUT + '/hero.jpg', quality=92)

def button(text, sub, path, fill, edge, w=560, h=118):
    im = Image.new('RGBA', (w, h + 14), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    d.rounded_rectangle((0, 12, w - 1, h + 12), 18, fill=edge); d.rounded_rectangle((0, 0, w - 1, h), 18, fill=fill)
    d.rounded_rectangle((6, 5, w - 7, 18), 8, fill=tuple(min(255, int(v * 1.12)) for v in fill))
    shadow_text(d, (w // 2, h * 0.42), text, px(54), sh=4)
    d.text((w // 2, h * 0.8), sub, font=px(21, 400), fill=(240, 250, 235), anchor='mm')
    im.save(OUT + '/' + path)

G2 = (60, 58, 55)
TAGS = [('Chess variants', GREEN), ('Horror', G2), ('Roguelike', G2), ('Arcade', G2), ('3D', G2), ('FPS', G2),
        ('Puzzle', G2), ('4-player', G2), ('Phone first', G2), ('Free', GREEN)]
def chips():
    f = px(28); pad, gap, h = 22, 14, 52; ws = [ImageDraw.Draw(Image.new('L', (1, 1))).textbbox((0, 0), t, font=f)[2] + 2 * pad for t, _ in TAGS]
    rows, cur, maxw = [], [], 1240
    for t, w in zip(TAGS, ws):
        if cur and sum(x[1] for x in cur) + gap * len(cur) + w > maxw: rows.append(cur); cur = []
        cur.append((t, w))
    rows.append(cur)
    im = Image.new('RGBA', (maxw, len(rows) * (h + 22)), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    for r, row in enumerate(rows):
        tot = sum(w for _, w in row) + gap * (len(row) - 1); x = (maxw - tot) // 2; y = r * (h + 22)
        for (t, col), w in row:
            d.rounded_rectangle((x, y + 6, x + w, y + h + 6), 14, fill=tuple(int(v * 0.55) for v in col))
            d.rounded_rectangle((x, y, x + w, y + h), 14, fill=col)
            d.text((x + w // 2, y + h // 2 + 1), t, font=f, fill=(255, 255, 255), anchor='mm'); x += w + gap
    im.save(OUT + '/tags.png')

def header(text, path, col=RED):
    W, H = 1280, 96; im = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    f = px(46); tb = d.textbbox((0, 0), text, font=f); tw = tb[2] - tb[0] + 60
    d.rounded_rectangle((0, 12, tw, H - 6), 16, fill=tuple(int(v * 0.55) for v in col)); d.rounded_rectangle((0, 4, tw, H - 14), 16, fill=col)
    d.text((30, (H - 10) // 2), text, font=f, fill=(255, 255, 255), anchor='lm')
    d.rounded_rectangle((tw + 20, H // 2 - 5, W, H // 2 + 1), 3, fill=(79, 91, 97, 200))
    im.save(OUT + '/' + path)

SHOTS = [('scp-4975', 'HuZlhHnES7M', 'SCP-4975 cracks what it scans'), ('spell-chess', 'Ag3KKsIrax4', 'Freeze and Jump spells'),
         ('shotgun-king', 'AvZiSnngZjA', 'Shotgun King: one king, one shotgun'), ('soko-chess', '7lEglazTlo8', 'Soko Chess: push them home'),
         ('pac-man-chess', 'sO-lD2On610', 'Pac-Man Chess, four armies'), ('duck-chess', 'E2x-QTgBD5k', 'Duck Chess: place the duck')]
def capture():
    from playwright.sync_api import sync_playwright
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a, **k): pass
    socketserver.TCPServer.allow_reuse_address = True
    srv = socketserver.ThreadingTCPServer(('127.0.0.1', 8818), functools.partial(Q, directory=ROOT)); threading.Thread(target=srv.serve_forever, daemon=True).start()
    with sync_playwright() as p:
        b = p.chromium.launch(); pg = b.new_context(viewport={'width': 1280, 'height': 720}, device_scale_factor=2).new_page()
        pg.goto('http://127.0.0.1:8818/index.html'); pg.wait_for_timeout(1200); pg.mouse.click(5, 5)
        only = os.environ.get('SHOTS_ONLY', '').split(',') if os.environ.get('SHOTS_ONLY') else None
        for slug, mid, _ in SHOTS:
          if only and slug not in only: continue
          for attempt in range(5):  # never shoot a finished game (the game-over card would cover the board)
            pg.evaluate(f"CM.app.openVideo('{mid}')"); pg.wait_for_timeout(6000)
            for k in range(6 - attempt):
                pg.evaluate("""(()=>{try{var G=CM.gameUI.controller; if(!G||!G.V||G.busy||G.over||G.state.turn!==G.human) return;
                  var ms=G.moves.filter(m=>m.f>=0), caps=ms.filter(m=>m.cap), pick=caps.length&&Math.random()<.6?caps:ms;
                  if(pick.length) G.commit(pick[Math.floor(Math.random()*pick.length)],{});}catch(e){}})()""")
                pg.wait_for_timeout(1400)
            if not pg.evaluate("(()=>{try{var G=CM.gameUI.controller;return !!(G&&G.over)}catch(e){return false}})()"): break
          if True:
            r = pg.evaluate("(()=>{var a=document.getElementById('board-area')||document.getElementById('board-wrap');var e=a.getBoundingClientRect();return [e.x,e.y,e.width,e.height]})()")
            pg.screenshot(path=f'{RAW}/{slug}.png', clip={'x': max(0, r[0] - 8), 'y': max(0, r[1] - 8), 'width': r[2] + 16, 'height': r[3] + 16})
        b.close()

def shots():
    for slug, mid, cap in SHOTS:
        p = f'{RAW}/{slug}.png'
        if not os.path.exists(p): continue
        raw = Image.open(p).convert('RGB'); W, H = 900, 760
        bg = felt(W, H, seed=hash(slug) % 97).convert('RGBA'); d = ImageDraw.Draw(bg)
        ch = 620; cw = int(ch * raw.width / raw.height) + 20; cw = min(cw, W - 60)
        drop(bg, card(raw, cw, ch, rim=4, r=14), (W - cw) // 2, 26, sh=8)
        shadow_text(d, (W // 2, H - 44), cap, px(34), sh=4)
        bg.convert('RGB').save(f'{OUT}/shots/{slug}.jpg', quality=90)

FEAT = [('scp-4975', 'HuZlhHnES7M', 'SCP-4975', 'HORROR', (186, 70, 255)), ('shotgun-king', 'AvZiSnngZjA', 'SHOTGUN KING', 'ROGUELIKE', ORANGE),
        ('fps-chess', 'PszkLYudcws', 'FPS CHESS', '3D / FPS', RED), ('battle-chess', 'IbRrzKtieqs', 'BATTLE CHESS', '3D', (75, 194, 146)),
        ('gun-king', 'AWFB4EzGtDc', 'GUN KING', 'ARCADE', BLUE), ('5d-chess', 'BbgwPj-u_gs', '5D CHESS', 'VARIANT', ORANGE),
        ('once-a-pawn-a-king', 'C9v7G3dJl7E', 'ONCE A PAWN A KING', 'ROGUELIKE', ORANGE), ('chess-survivors', 'spJibM5qaNQ', 'CHESS SURVIVORS', 'ARCADE', BLUE),
        ('portal-chess', 'inm7KvllVu0', 'PORTAL CHESS', 'VARIANT', RED), ('kung-fu-chess', '9M2Mj2WFFys', 'KUNG FU CHESS', 'REAL-TIME', RED),
        ('petrified-pawns', 'sGXmiyvZDE4', 'PETRIFIED PAWNS', 'POWER-UP', (75, 194, 146)), ('4-player-team-chess', '8XmhGMnypjc', '4 PLAYER TEAMS', 'PARTY', BLUE)]
def cards():
    for slug, mid, lab, tag, col in FEAT:
        W, H = 640, 420; bg = Image.new('RGBA', (W, H), (0, 0, 0, 0))
        drop(bg, card(thumb(mid), W - 24, H - 30, rim=5, r=16, label=lab, tag=tag, tag_col=(60, 58, 55)), 12, 4, sh=10)
        bg.save(f'{OUT}/cards/{slug}.png', optimize=True)   # transparent: sits on GitHub's light or dark page

if __name__ == '__main__':
    if '--capture' in sys.argv: capture()
    button('PLAY NOW', 'free in your browser  /  no install  /  no account', 'play.png', GREEN, GREEN_D)
    chips(); shots(); cards()
    for t, f, c in [('ABOUT THIS GAME', 'h-about.png', GREEN), ('SCREENSHOTS', 'h-shots.png', GREEN), ('FEATURED MODES', 'h-modes.png', GREEN),
                    ('SYSTEM REQUIREMENTS', 'h-req.png', GREEN)]: header(t, f, c)
    print('ok')
