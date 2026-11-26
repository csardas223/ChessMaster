#!/usr/bin/env python3
"""Long README art, s6 2026-11-26 (owner: "make the readme longer and more appealing and eyecatching like that graphic
you just made" = assets/og/og-default.png). Same look as tools/og_image.py / tools/readme_store.py: chess.com page colour,
Jersey 15 pixel titles (big titles only), rimmed cards with hard drop shadows, chunky green slab. No gradients, no glass.
Writes (docs/media/):
  banner.jpg          README hero: the social card widened to 1280x640 (title slab beside a wall of real mode cards)
  numbers.png         "by the numbers" band; every number is counted from the repo at build time (play/, data/, settings)
  how.png             pick / play / share strip (real lobby + game screenshots and the real social card)
  h-numbers.png h-how.png   section headers (readme_store.header)
  s-<theme>.png       theme shelf labels (Horror, Roguelikes, 3D/FPS/arcade, 4-player, puzzles, wild variants)
  cards/<slug>.png    mode cards, face = iwantcheckmate's video still, or a real in-game screenshot (tag IN GAME)
Usage (repo root): python3 tools/readme_long.py --capture   (headless Chromium screenshots into /tmp/readme_long_raw, then art)
                   python3 tools/readme_long.py             (art only, reuses the screenshots)
Needs Pillow, fontTools, brotli, playwright (capture only). Card links in README.md must point at existing play/<slug>/."""
import os, sys, json, subprocess, threading, http.server, socketserver, functools
from PIL import Image, ImageDraw, ImageFont
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from readme_store import ROOT, OUT, felt, card, drop, thumb, px, shadow_text, header, GREEN, GREEN_D, RED, ORANGE, BLUE, SLAB, RIM
import og_image

RAW = '/tmp/readme_long_raw'; os.makedirs(RAW, exist_ok=True)
SANS_B = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'; SANS = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
def sans(sz, bold=True): return ImageFont.truetype(SANS_B if bold else SANS, sz)
SLUGS = json.load(open(os.path.join(ROOT, 'data/slugs.json')))
ID = {v: k for k, v in SLUGS.items()}
PURPLE = (140, 80, 200); TEAL = (40, 150, 130)

def save_png(im, path):
    """palette PNG with alpha: same look, a third of the bytes"""
    im.quantize(256, method=Image.Quantize.FASTOCTREE, dither=Image.Dither.FLOYDSTEINBERG).save(path, optimize=True)

# ---------- screenshots (real, headless Chromium) ----------
CAPTURE = ['backrooms-chess', '4-player-chess', 'chessformer', 'atomic-chess', 'dice-chess']
def capture():
    from playwright.sync_api import sync_playwright
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a, **k): pass
    socketserver.TCPServer.allow_reuse_address = True
    srv = socketserver.ThreadingTCPServer(('127.0.0.1', 8891), functools.partial(Q, directory=ROOT)); threading.Thread(target=srv.serve_forever, daemon=True).start()
    with sync_playwright() as p:
        b = p.chromium.launch(); pg = b.new_context(viewport={'width': 1280, 'height': 720}, device_scale_factor=1.5).new_page()
        pg.goto('http://127.0.0.1:8891/index.html'); pg.wait_for_timeout(3500); pg.screenshot(path=f'{RAW}/lobby.png')
        for slug in CAPTURE:
            pg.evaluate(f"CM.app.openVideo('{ID[slug]}')"); pg.wait_for_timeout(6000)
            for k in range(2 if slug == 'atomic-chess' else 5):   # atomic: few moves, or the bot's king blast ends the game
                pg.evaluate("""(()=>{try{var G=CM.gameUI.controller; if(!G||!G.V||G.busy||G.over||G.state.turn!==G.human) return;
                  var ms=G.moves.filter(m=>m.f>=0), caps=ms.filter(m=>m.cap), pick=caps.length&&Math.random()<.6?caps:ms;
                  if(pick.length) G.commit(pick[Math.floor(Math.random()*pick.length)],{});}catch(e){}})()""")
                pg.wait_for_timeout(1500)
            pg.screenshot(path=f'{RAW}/{slug}.png')
        b.close()
def ingame(slug):
    """game view without the top bar (1280x720 css px at 1.5x)"""
    im = Image.open(f'{RAW}/{slug}.png').convert('RGB'); s = im.width / 1280
    return im.crop((int(110 * s), int(48 * s), int(1170 * s), int(716 * s)))

# ---------- hero banner: the social card, widened ----------
def banner():
    W, H, dx = 1280, 640, 80
    im = felt(W, H).convert('RGBA')
    for get, x, y, w, h, ang, lab in og_image.WALL:
        drop(im, card(get(), w, h, rim=6, r=18, label=lab), x + dx, y + 5, angle=ang, sh=12)
    d = ImageDraw.Draw(im); y0 = 5
    d.rounded_rectangle((60, 70 + y0, 572, 572 + y0), 26, fill=(0, 0, 0, 255))
    d.rounded_rectangle((60, 58 + y0, 572, 560 + y0), 26, fill=SLAB + (255,), outline=RIM, width=4)
    cx = 316
    shadow_text(d, (cx, 140 + y0), 'CHESS', px(118), sh=8, stroke=4)
    shadow_text(d, (cx, 248 + y0), 'MASTER', px(118), sh=8, stroke=4)
    d.text((cx, 336 + y0), 'iwantcheckmate fan remake', font=sans(28), fill=(209, 209, 208), anchor='mm')
    bx0, by0, bx1, by1 = 96, 386 + y0, 536, 476 + y0
    d.rounded_rectangle((bx0, by0 + 10, bx1, by1 + 10), 18, fill=GREEN_D); d.rounded_rectangle((bx0, by0, bx1, by1), 18, fill=GREEN)
    d.text((cx, (by0 + by1) // 2 - 13), '500+ CHESS MODES', font=px(50), fill=(255, 255, 255), anchor='mm', stroke_width=2, stroke_fill=(46, 82, 28))
    d.text((cx, (by0 + by1) // 2 + 23), 'from the videos', font=sans(22), fill=(240, 250, 235), anchor='mm')
    d.text((cx, 520 + y0), 'Free in your browser. No account.', font=sans(22), fill=(160, 158, 155), anchor='mm')
    im.convert('RGB').save(OUT + '/banner.jpg', quality=88, optimize=True)

# ---------- true numbers, counted from the repo ----------
def count_modes():
    return sum(1 for s in os.listdir(os.path.join(ROOT, 'play')) if os.path.isfile(os.path.join(ROOT, 'play', s, 'index.html')))
def facts():
    js = r"""global.window={};require('./data/videos.js');const fs=require('fs');const s=fs.readFileSync('js/core/settings.js','utf8');
      const grab=n=>{const i=s.indexOf(n+' = {');let d=0,j=i+n.length+3;for(;j<s.length;j++){if(s[j]=='{')d++;if(s[j]=='}'){d--;if(!d)break}}let o;eval('o='+s.slice(i+n.length+3,j+1));return Object.keys(o).length};
      const sf=(fs.readFileSync('js/bot/stockfish.js','utf8').match(/stockfish@[0-9.]+/g)||[]);
      console.log(JSON.stringify({videos:window.CM_DATA.videos.length,boards:grab('BOARDS'),pieces:grab('PIECES'),sf:[...new Set(sf)].length}))"""
    f = json.loads(subprocess.check_output(['node', '-e', js], cwd=ROOT))
    engines = f['sf'] + 2   # Stockfish builds + Maia (js/bot/maia.js) + Fairy-Stockfish (js/bot/fairy.js)
    return [(str(count_modes()), 'playable modes', GREEN), (str(f['videos']), 'videos indexed', None),
            (str(engines), 'chess engines', None), (str(f['pieces']), 'piece sets', None), (str(f['boards']), 'boards', None)]
def numbers():
    F = facts(); W, H = 1280, 210; im = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    gap = 18; sw = (W - gap * (len(F) - 1)) // len(F)
    for i, (n, lab, col) in enumerate(F):
        x0 = i * (sw + gap); x1 = x0 + sw; fill = col or SLAB; edge = GREEN_D if col else (0, 0, 0)
        d.rounded_rectangle((x0, 14, x1, H - 4), 20, fill=edge)
        d.rounded_rectangle((x0, 0, x1, H - 18), 20, fill=fill, outline=None if col else RIM, width=0 if col else 3)
        shadow_text(d, ((x0 + x1) // 2, 78), n, px(96), sh=6, stroke=3)
        d.text(((x0 + x1) // 2, 150), lab, font=sans(24), fill=(240, 250, 235) if col else (209, 209, 208), anchor='mm')
    save_png(im, OUT + '/numbers.png')

# ---------- pick / play / share ----------
def how():
    steps = [('1', 'PICK', 'Search the lobby or roll one', Image.open(f'{RAW}/lobby.png').convert('RGB')),
             ('2', 'PLAY', 'The video\'s rules and bot', ingame('dice-chess')),
             ('3', 'SHARE', 'Every mode has its own link', Image.open(os.path.join(ROOT, 'assets/og/og-default.png')).convert('RGB'))]
    W, H = 1280, 470; im = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    cw, gap = 392, (W - 3 * 392) // 2
    for i, (num, t, sub, face) in enumerate(steps):
        x = i * (cw + gap)
        drop(im, card(face, cw, 250, rim=5, r=16), x, 8, sh=10)
        d = ImageDraw.Draw(im)
        bx, by = x + 18, 0   # step number chip, top-left, overlapping the card edge
        d.rounded_rectangle((bx, by + 6, bx + 62, by + 68), 14, fill=GREEN_D); d.rounded_rectangle((bx, by, bx + 62, by + 62), 14, fill=GREEN)
        d.text((bx + 31, by + 30), num, font=px(52), fill=(255, 255, 255), anchor='mm', stroke_width=2, stroke_fill=(46, 82, 28))
        shadow_text(d, (x + cw // 2, 330), t, px(72), sh=5, stroke=3)
        d.text((x + cw // 2, 400), sub, font=sans(22), fill=(140, 138, 135), anchor='mm')
    save_png(im, OUT + '/how.png')

# ---------- theme shelves ----------
def shelf(text, sub, path, col):
    W, H = 1280, 80; im = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    f = px(38); tb = d.textbbox((0, 0), text, font=f); tw = tb[2] - tb[0] + 48
    d.rounded_rectangle((0, 12, tw, H - 4), 14, fill=tuple(int(v * 0.55) for v in col)); d.rounded_rectangle((0, 4, tw, H - 12), 14, fill=col)
    d.text((24, (H - 8) // 2), text, font=f, fill=(255, 255, 255), anchor='lm')
    if sub: d.text((tw + 22, (H - 8) // 2), sub, font=sans(24), fill=(140, 138, 135), anchor='lm')
    save_png(im, OUT + '/' + path)

def face(slug):
    if os.path.exists(f'{RAW}/{slug}.png') and slug in CAPTURE: return ingame(slug), 'IN GAME'
    mid = ID[slug]
    try: return thumb(mid), None
    except FileNotFoundError: pass
    import glob   # any other still of that video (maxres / frame / storyboard), biggest first, then the mode's own thumb
    alt = sorted(glob.glob(os.path.join(ROOT, 'research/frames/video_thumbs', mid + '_*.jpg')), key=lambda q: -Image.open(q).width)
    return Image.open(alt[0] if alt else os.path.join(ROOT, 'assets/modes', mid, 'thumb.jpg')), None
# (shelf file, title, kinds counted for the subtitle or None, colour, [(slug, card label, tag)])
THEMES = [
    ('s-horror.png', 'HORROR', ['Horror'], (168, 50, 43), [('scp-4975', 'SCP-4975', 'HORROR'), ('scp-096-shy-guy', 'SCP-096', 'HORROR'), ('backrooms-chess', 'BACKROOMS CHESS', None)]),
    ('s-rogue.png', 'ROGUELIKES', ['Roguelike'], ORANGE, [('shotgun-king', 'SHOTGUN KING', 'ROGUELIKE'), ('once-a-pawn-a-king', 'ONCE A PAWN A KING', 'ROGUELIKE'), ('gambonanza', 'GAMBONANZA', 'ROGUELIKE')]),
    ('s-3d.png', '3D, FPS AND ARCADE', None, BLUE, [('fps-chess', 'FPS CHESS', '3D / FPS'), ('battle-chess', 'BATTLE CHESS', '3D'), ('gun-king', 'GUN KING', 'ARCADE'),
        ('chess-survivors', 'CHESS SURVIVORS', 'ARCADE'), ('chess-arena-battle-royale', 'CHESS ARENA', 'BATTLE ROYALE'), ('kung-fu-chess', 'KUNG FU CHESS', 'REAL-TIME')]),
    ('s-4p.png', '4-PLAYER', ['4-Player'], GREEN, [('4-player-team-chess', '4 PLAYER TEAMS', 'PARTY'), ('chaturaji-4-player', 'CHATURAJI', '4-PLAYER'), ('4-player-chess', '4 PLAYER CHESS', None)]),
    ('s-puzzle.png', 'PUZZLES', ['Puzzle'], PURPLE, [('soko-chess', 'SOKO CHESS', 'PUZZLE'), ('beyond-the-board', 'BEYOND THE BOARD', 'PUZZLE'), ('chessformer', 'CHESSFORMER', None)]),
    ('s-wild.png', 'WILD VARIANTS', None, TEAL, [('5d-chess', '5D CHESS', 'VARIANT'), ('portal-chess', 'PORTAL CHESS', 'VARIANT'), ('petrified-pawns', 'PETRIFIED PAWNS', 'POWER-UP'),
        ('atomic-chess', 'ATOMIC CHESS', None), ('dice-chess', 'DICE CHESS', None), ('duck-chess', 'DUCK CHESS', 'VARIANT')]),
]
def kind_count(kinds):
    js = "global.window={};require('./data/kinds.js');console.log(JSON.stringify(window.CM_DATA.videoKinds))"
    k = json.loads(subprocess.check_output(['node', '-e', js], cwd=ROOT))
    return sum(1 for mid, slug in SLUGS.items() if k.get(mid) in kinds and os.path.isdir(os.path.join(ROOT, 'play', slug)))
def themes():
    for path, title, kinds, col, items in THEMES:
        shelf(title, f'{kind_count(kinds)} modes' if kinds else None, path, col)
        for slug, lab, tag in items:
            assert os.path.isfile(os.path.join(ROOT, 'play', slug, 'index.html')), slug
            f, t2 = face(slug); W, H = 640, 420; bg = Image.new('RGBA', (W, H), (0, 0, 0, 0))
            drop(bg, card(f, W - 24, H - 30, rim=5, r=16, label=lab, tag=tag or t2, tag_col=(60, 58, 55)), 12, 4, sh=10)
            save_png(bg, f'{OUT}/cards/{slug}.png')

if __name__ == '__main__':
    if '--capture' in sys.argv: capture()
    banner(); numbers(); how(); themes()
    header('BY THE NUMBERS', 'h-numbers.png', GREEN); header('HOW IT WORKS', 'h-how.png', GREEN)
    print('ok')
