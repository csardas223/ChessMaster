#!/usr/bin/env python3
"""README store-page art (README rebuild, 2026-11-26): composes the static images in docs/media/ from art already
in the repo (video stills in research/frames/video_thumbs = iwantcheckmate's thumbnails, credited; app fonts in
assets/fonts; iwantcheckmate avatar; piece sprites).
  hero.jpg          wide key art (title, subtitle, credit)
  play.png          Play Now button      mirror.png  secondary mirror button
  tags.png          tag chips row        tiles/*.png feature tiles     cards/<slug>.jpg  mode grid cards
  python3 tools/readme_art.py   (needs Pillow + fontTools + brotli to read the woff2 fonts)"""
import os, io
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
from fontTools.ttLib import TTFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'docs/media'); TH = os.path.join(ROOT, 'research/frames/video_thumbs')
os.makedirs(OUT + '/cards', exist_ok=True); os.makedirs(OUT + '/tiles', exist_ok=True)
def ttf(name):
    p = f'/tmp/readme_{name}.ttf'
    if not os.path.exists(p):
        f = TTFont(os.path.join(ROOT, f'assets/fonts/{name}.woff2')); f.flavor = None; f.save(p)
    return p
CINZEL = ttf('Cinzel')
SANS_B = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'; SANS = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
def cinzel(size, wght=900):
    f = ImageFont.truetype(CINZEL, size)
    try: f.set_variation_by_axes([wght])
    except Exception: pass
    return f
GREEN, GREEN_D, INK, PANEL, MUTED = (129, 182, 76), (69, 117, 60), (38, 36, 33), (49, 46, 43), (190, 186, 180)
def thumb(mid): return Image.open(os.path.join(TH, f'{mid}_maxresdefault.jpg')).convert('RGB')
def cover(im, w, h):
    s = max(w / im.width, h / im.height); im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    x, y = (im.width - w) // 2, (im.height - h) // 2; return im.crop((x, y, x + w, y + h))
def rrect(size, r, fill):
    m = Image.new('L', size, 0); ImageDraw.Draw(m).rounded_rectangle((0, 0, size[0] - 1, size[1] - 1), r, fill=255)
    im = Image.new('RGBA', size, fill); im.putalpha(m); return im

# ---------- hero key art 1280x560 ----------
HERO = ['AvZiSnngZjA', 'vPEVQgvjoL4', 'AWFB4EzGtDc', 'BbgwPj-u_gs', 'spJibM5qaNQ', 'HuZlhHnES7M',
        'sGXmiyvZDE4', 'CONozr99agQ', 's2WDIfvefEk', 'inm7KvllVu0', '9M2Mj2WFFys', 'IbRrzKtieqs',
        'C9v7G3dJl7E', 'PszkLYudcws', 'qqvbb2r2k5I', '8XmhGMnypjc', 'Ag3KKsIrax4', 'zP9TzlgA-W0',
        '2Sud5_YAp84', 'oAoik9Dj2qQ', 'E2x-QTgBD5k', 'sO-lD2On610', '1L_sxGgxX9M', '7lEglazTlo8']
def hero():
    W, H = 1280, 560; tw, th = 330, 186; gap = 10
    wall = Image.new('RGB', (W + 700, H + 600), (20, 19, 17)); k = 0
    for row in range(5):
        off = (row % 2) * (tw // 2) - 120
        for col in range(7):
            t = cover(thumb(HERO[k % len(HERO)]), tw, th); k += 1
            wall.paste(t, (off + col * (tw + gap), 40 + row * (th + gap)))
    wall = wall.rotate(-8, resample=Image.BICUBIC, fillcolor=(20, 19, 17))
    bg = wall.crop((300, 230, 300 + W, 230 + H))
    bg = ImageEnhance.Color(bg).enhance(0.85).filter(ImageFilter.GaussianBlur(1.2))
    # darken toward the centre band where the title sits (one flat shade + a soft centre pool, no colour gradients)
    shade = Image.new('L', (W, H), 0); d = ImageDraw.Draw(shade)
    d.ellipse((W * .08, H * .2, W * .92, H * .82), fill=255); shade = shade.filter(ImageFilter.GaussianBlur(90))
    dark = Image.new('RGB', (W, H), (18, 17, 15))
    bg = Image.composite(dark, Image.blend(bg, dark, 0.5), shade.point(lambda v: int(v * .9)))
    im = bg.convert('RGBA'); d = ImageDraw.Draw(im)
    title = 'CHESS MASTER'; f = cinzel(118, 900)
    tw_ = d.textlength(title, font=f); x = (W - tw_) / 2; y = 160
    glow = Image.new('RGBA', (W, H), (0, 0, 0, 0)); ImageDraw.Draw(glow).text((x, y + 6), title, font=f, fill=(0, 0, 0, 230))
    im = Image.alpha_composite(im, glow.filter(ImageFilter.GaussianBlur(10))); d = ImageDraw.Draw(im)
    d.text((x, y), title, font=f, fill=(250, 246, 236))
    # rule + subtitle
    sub = 'AN  IWANTCHECKMATE  FAN  REMAKE'; fs = ImageFont.truetype(SANS_B, 24)
    sw = d.textlength(sub, font=fs); sy = y + 150
    d.text(((W - sw) / 2, sy), sub, font=fs, fill=GREEN)
    d.line(((W - sw) / 2 - 90, sy + 13, (W - sw) / 2 - 24, sy + 13), fill=GREEN, width=2)
    d.line(((W + sw) / 2 + 24, sy + 13, (W + sw) / 2 + 90, sy + 13), fill=GREEN, width=2)
    line = 'Every crazy chess mode from the videos.  Free in your browser.'; fl = ImageFont.truetype(SANS, 26)
    d.text(((W - d.textlength(line, font=fl)) / 2, sy + 52), line, font=fl, fill=(232, 228, 220))
    # credit, bottom right
    av = Image.open(os.path.join(ROOT, 'assets/avatars/iwantcheckmate.png')).convert('RGBA').resize((40, 40), Image.LANCZOS)
    m = Image.new('L', (40, 40), 0); ImageDraw.Draw(m).ellipse((0, 0, 39, 39), fill=255); av.putalpha(m)
    cr = 'Modes, art and videos by iwantcheckmate'; fc = ImageFont.truetype(SANS, 17); cw = d.textlength(cr, font=fc)
    d.rounded_rectangle((int(W - 40 - cw - 50), H - 70, W - 16, H - 16), 10, fill=(18, 17, 15, 200))
    im.alpha_composite(av, (int(W - 28 - cw - 50), H - 62)); d.text((W - 28 - cw, H - 52), cr, font=fc, fill=(220, 216, 208))
    im.convert('RGB').save(os.path.join(OUT, 'hero.jpg'), quality=86, optimize=True, progressive=True)

# ---------- buttons ----------
def button(text, sub, path, fill, edge, w=520):
    S = 2; h = 92; im = Image.new('RGBA', (w * S, h * S), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    d.rounded_rectangle((0, 6 * S, w * S - 1, h * S - 1), 14 * S, fill=edge)
    d.rounded_rectangle((0, 0, w * S - 1, (h - 6) * S), 14 * S, fill=fill)
    f = ImageFont.truetype(SANS_B, 34 * S); fs = ImageFont.truetype(SANS, 17 * S)
    tw = d.textlength(text, font=f); tri = 22 * S; gapx = 18 * S; total = tri + gapx + tw
    x0 = (w * S - total) / 2; cy = (30 if sub else 40) * S
    d.polygon([(x0, cy - tri * .6), (x0, cy + tri * .6), (x0 + tri, cy)], fill='white')
    d.text((x0 + tri + gapx, cy), text, font=f, fill='white', anchor='lm')
    if sub: d.text((w * S / 2, 64 * S), sub, font=fs, fill=(240, 246, 232), anchor='mm')
    im.resize((w, h), Image.LANCZOS).save(os.path.join(OUT, path), optimize=True)

# ---------- tag chips ----------
TAGS = ['Strategy', 'Chess variants', 'Horror', 'Roguelike', 'Arcade', '3D', 'FPS', 'Puzzle', 'Party / 4-player',
        'Single-player', 'Touch first', 'Free to play']
def chips():
    S = 2; f = ImageFont.truetype(SANS, 17 * S); pad = 16 * S; h = 36 * S; gap = 10 * S; maxw = 860 * S
    rows, row, x = [], [], 0
    for t in TAGS:
        w = int(ImageDraw.Draw(Image.new('L', (1, 1))).textlength(t, font=f)) + 2 * pad
        if x + w > maxw and row: rows.append(row); row, x = [], 0
        row.append((t, w)); x += w + gap
    rows.append(row)
    H = len(rows) * h + (len(rows) - 1) * gap
    im = Image.new('RGBA', (maxw, H), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    for r, row in enumerate(rows):
        tot = sum(w for _, w in row) + gap * (len(row) - 1); x = (maxw - tot) // 2; y = r * (h + gap)
        for t, w in row:
            d.rounded_rectangle((x, y, x + w, y + h), 6 * S, fill=(58, 79, 96)); d.text((x + w / 2, y + h / 2), t, font=f, fill=(103, 193, 245), anchor='mm'); x += w + gap
    im.resize((maxw // S, H // S), Image.LANCZOS).save(os.path.join(OUT, 'tags.png'), optimize=True)

# ---------- feature tiles (picture + headline + one line, Steam "about" style) ----------
TILES = [
    ('modes', '500+ modes, one lobby', 'Every video in one phone-sized hub.', 'AvZiSnngZjA'),
    ('faithful', 'True to the videos', 'Their rules, boards, pieces and bots.', 'BbgwPj-u_gs'),
    ('horror', 'Horror nights', 'SCP monsters with their own cinema.', 'vPEVQgvjoL4'),
    ('3d', '3D and FPS', 'Battle Chess fights, first-person duels.', 'IbRrzKtieqs'),
    ('rogue', 'Full games inside', 'Roguelikes, platformers, Pac-Man.', 'zP9TzlgA-W0'),
    ('bots', 'Real opponents', 'Stockfish, Maia and the video bots.', '2Sud5_YAp84'),
]
def tiles():
    W, H = 420, 330; ih = 236
    for key, head, line, mid in TILES:
        im = Image.new('RGB', (W, H), INK); im.paste(cover(thumb(mid), W, ih), (0, 0)); d = ImageDraw.Draw(im)
        d.rectangle((0, ih, W, ih + 3), fill=GREEN)
        d.text((18, ih + 18), head, font=ImageFont.truetype(SANS_B, 25), fill='white')
        d.text((18, ih + 56), line, font=ImageFont.truetype(SANS, 18), fill=MUTED)
        im.save(os.path.join(OUT, f'tiles/{key}.jpg'), quality=85, optimize=True)

# ---------- mode grid cards ----------
CARDS = [
    ('scp-4975', 'SCP-4975', 'Horror', 'HuZlhHnES7M'), ('shotgun-king', 'Shotgun King', 'Roguelike', 'AvZiSnngZjA'),
    ('fps-chess', 'FPS Chess', '3D / FPS', 'PszkLYudcws'), ('battle-chess', 'Battle Chess', '3D', 'IbRrzKtieqs'),
    ('gun-king', 'Gun King', 'Arcade', 'AWFB4EzGtDc'), ('5d-chess', '5D Chess', 'Variant', 'BbgwPj-u_gs'),
    ('once-a-pawn-a-king', 'Once a Pawn a King', 'Roguelike', 'C9v7G3dJl7E'), ('chess-survivors', 'Chess Survivors', 'Arcade', 'spJibM5qaNQ'),
    ('portal-chess', 'Portal Chess', 'Variant', 'inm7KvllVu0'), ('kung-fu-chess', 'Kung Fu Chess', 'Real time', '9M2Mj2WFFys'),
    ('petrified-pawns', 'Petrified Pawns', '3D', 'sGXmiyvZDE4'), ('4-player-team-chess', '4 Player Team Chess', 'Party', '8XmhGMnypjc'),
]
def cards():
    W = 480; ih = 270; H = ih + 62
    for slug, name, tag, mid in CARDS:
        im = Image.new('RGB', (W, H), PANEL); im.paste(cover(thumb(mid), W, ih), (0, 0)); d = ImageDraw.Draw(im)
        d.text((16, ih + 31), name, font=ImageFont.truetype(SANS_B, 26), fill='white', anchor='lm')
        ft = ImageFont.truetype(SANS_B, 16); tw = d.textlength(tag.upper(), font=ft)
        d.rounded_rectangle((W - 16 - tw - 20, ih + 17, W - 16, ih + 45), 5, fill=(58, 79, 96))
        d.text((W - 16 - tw / 2 - 10, ih + 31), tag.upper(), font=ft, fill=(103, 193, 245), anchor='mm')
        im.save(os.path.join(OUT, f'cards/{slug}.jpg'), quality=84, optimize=True)

if __name__ == '__main__':
    hero()
    button('PLAY NOW', 'Free in your browser. No install, no account.', 'play.png', GREEN, GREEN_D)
    button('MIRROR', 'chessmaster-game.github.io', 'mirror.png', (69, 66, 62), (40, 38, 35), w=300)
    chips(); tiles(); cards()
    print('ok', sorted(os.listdir(OUT)))
