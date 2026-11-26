#!/usr/bin/env python3
"""Group 3 (Challenges & Odds) art pass 2: copy the videos' own art into app/assets/modes/<id>/.
   python3 tools/g3_sprites.py            (run from rebuild/app)
Sources only: research/frames/sprites/<videoId>_<thing>.png (cut out of the video) and the video's own YouTube
thumbnail i.ytimg.com/vi/<id>/maxresdefault.jpg (cached in /tmp/g3thumbs). Nothing is drawn or generated:
pieces get their tile background removed (flood fill from the border) and are trimmed/padded to a square; avatars are
square crops of the thumbnail. A black copy of a piece the video only shows in white is the same pixels with the
light body darkened (outline and details kept)."""
import os, sys, subprocess
from collections import deque
from PIL import Image

APP = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SPR = os.path.join(APP, 'research', 'frames', 'sprites')
TH = '/tmp/g3thumbs'
OUT = os.path.join(APP, 'assets', 'modes')


def thumb(vid):
    os.makedirs(TH, exist_ok=True)
    p = os.path.join(TH, vid + '.jpg')
    if not os.path.exists(p) or os.path.getsize(p) < 5000:
        subprocess.run(['curl', '-s', '-o', p, f'https://i.ytimg.com/vi/{vid}/maxresdefault.jpg'], check=True)
    return Image.open(p).convert('RGB')


def ring(w, h, f=0.08):
    r = max(1, int(min(w, h) * f))
    for y in range(h):
        for x in range(w):
            if x < r or y < r or x >= w - r or y >= h - r: yield x, y


def cutout(im, tol=48, rf=0.08):
    """flood fill: remove the background connected to the outer ring (tile colour, frame), keep the outlined piece"""
    im = im.convert('RGBA'); w, h = im.size; px = im.load()
    seen = bytearray(w * h); q = deque(ring(w, h, rf))
    def near(a, b):
        return abs(a[0] - b[0]) + abs(a[1] - b[1]) + abs(a[2] - b[2]) <= tol
    while q:
        x, y = q.popleft(); i = y * w + x
        if seen[i]: continue
        seen[i] = 1
        c = px[x, y]
        # background = anything that is not the dark outline: border pixels seed, spread to similar neighbours
        if c[0] + c[1] + c[2] < 150: continue
        px[x, y] = (c[0], c[1], c[2], 0)
        for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if 0 <= nx < w and 0 <= ny < h and not seen[ny * w + nx] and near(px[nx, ny], c):
                q.append((nx, ny))
    return im


def keyout(im, dist=70, dark=False):
    """colour key: the tile colours seen in the outer ring are removed everywhere (low-res sprites whose thin outline
    leaks a flood fill); the piece's own white/black body is far from the tile colours and stays"""
    im = im.convert('RGBA'); w, h = im.size; px = im.load(); cnt = {}
    pts = list(ring(w, h))
    for x, y in pts:
        c = px[x, y]
        if c[0] + c[1] + c[2] < 150 and not dark: continue
        k = (c[0] // 40, c[1] // 40, c[2] // 40); cnt.setdefault(k, []).append(c)
    pal = [tuple(sum(c[i] for c in v) // len(v) for i in range(3)) for v in cnt.values() if len(v) > len(pts) * 0.03]
    if dark: pal = [p for p in pal if sum(p) < 250]   # dark backdrop: the piece base may touch the frame, never key white
    orig = im.copy(); op = orig.load()
    for y in range(h):
        for x in range(w):
            c = px[x, y]
            if any(abs(c[0] - p[0]) + abs(c[1] - p[1]) + abs(c[2] - p[2]) <= dist for p in pal): px[x, y] = (c[0], c[1], c[2], 0)
    if dark:   # give the light piece back a 2px rim of the video's own dark outline
        keep = [(x, y) for y in range(h) for x in range(w) if px[x, y][3]]
        for _ in range(2):
            add = set()
            for x, y in keep:
                for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                    if 0 <= nx < w and 0 <= ny < h and not px[nx, ny][3]: add.add((nx, ny))
            for x, y in add: px[x, y] = op[x, y][:3] + (255,)
            keep = list(add)
    return im


def largest(im):
    """keep the biggest opaque blob (drops neighbouring pieces, tile lines and coordinates caught in the sprite)"""
    w, h = im.size; px = im.load(); lab = [0] * (w * h); best = (0, 0); n = 0
    for sy in range(h):
        for sx in range(w):
            if lab[sy * w + sx] or px[sx, sy][3] < 40: continue
            n += 1; size = 0; q = deque([(sx, sy)]); lab[sy * w + sx] = n
            while q:
                x, y = q.popleft(); size += 1
                for dx in (-1, 0, 1):
                    for dy in (-1, 0, 1):
                        nx, ny = x + dx, y + dy
                        if 0 <= nx < w and 0 <= ny < h and not lab[ny * w + nx] and px[nx, ny][3] >= 40:
                            lab[ny * w + nx] = n; q.append((nx, ny))
            if size > best[0]: best = (size, n)
    for y in range(h):
        for x in range(w):
            if lab[y * w + x] != best[1]:
                c = px[x, y]; px[x, y] = (c[0], c[1], c[2], 0)
    return im


def square(im, size=256, pad=0.06):
    bb = im.getbbox() or (0, 0) + im.size
    im = im.crop(bb); w, h = im.size; s = int(max(w, h) * (1 + 2 * pad))
    c = Image.new('RGBA', (s, s), (0, 0, 0, 0)); c.paste(im, ((s - w) // 2, (s - h) // 2), im)
    return c.resize((size, size), Image.LANCZOS)


def darken(im):
    """black side of a piece the video only shows in white: light, unsaturated body -> dark grey; outline kept"""
    im = im.copy(); px = im.load(); w, h = im.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a and max(r, g, b) - min(r, g, b) < 40 and r + g + b > 300:
                v = int(30 + (765 - (r + g + b)) / 765 * 140)
                px[x, y] = (v, v, v, a)
    return im


def sprite(vid, thing):
    return Image.open(os.path.join(SPR, f'{vid}_{thing}.png'))


def save(im, mode, name):
    d = os.path.join(OUT, mode); os.makedirs(d, exist_ok=True)
    im.save(os.path.join(d, name), optimize=True); print('wrote', mode, name)


# ---- pieces: (mode, out name, sprite video, sprite thing, recolor) ----
PIECES = [
    # the Dragon series (cR6r8NZz-CA, FBrM-CLBZDA, ...) all use one dragon image; the clean 400px copy in
    # assets/modes/cR6r8NZz-CA/dragon_[wb].png (bb07480) is shared, the per-video crops are lower-res copies of it.
    ('Y3Jneu7zoq0', 'knibis_b.png', 'Y3Jneu7zoq0', 'black_knibis', False, {}),
    ('d-4NWgCwzco', 'bomb_w.png', 'd-4NWgCwzco', 'bomb', False, {'how': 'flood', 'ring': 0.16}),
    ('d-4NWgCwzco', 'bomb_b.png', 'd-4NWgCwzco', 'bomb', True, {'how': 'flood', 'ring': 0.16}),
    ('d-4NWgCwzco', 'grenade_w.png', 'd-4NWgCwzco', 'grenade', False, {'how': 'flood'}),
    ('d-4NWgCwzco', 'grenade_b.png', 'd-4NWgCwzco', 'grenade', True, {'how': 'flood'}),
    ('VVuAgqLzD_o', 'rock.png', 'VVuAgqLzD_o', 'rock', False, {'how': 'tile', 'box': (12, 12, 124, 124)}),
    ('VVuAgqLzD_o', 'medusa_w.png', 'VVuAgqLzD_o', 'variant_queen', False, {'how': 'flood'}),
    ('VVuAgqLzD_o', 'sniper_w.png', 'VVuAgqLzD_o', 'variant_bishop', False, {'how': 'flood'}),
    ('VVuAgqLzD_o', 'dragonfly_w.png', 'VVuAgqLzD_o', 'pegasus', False, {'dark': True, 'dist': 60}),
    ('VVuAgqLzD_o', 'camel_b.png', 'VVuAgqLzD_o', 'variant_knight', True, {'how': 'flood'}),
    ('VVuAgqLzD_o', 'sumo_b.png', 'VVuAgqLzD_o', 'variant_pawn', True, {'how': 'flood'}),
]

# ---- avatars cropped from the video's own thumbnail: (mode dir, out name, thumbnail video, box in 1280x720) ----
AVATARS = [
    ('49AZVEzA7zU', 'gotham.png', '49AZVEzA7zU', (718, 60, 1138, 480)),
    ('7XDtMA4WPSU', 'gotham.png', '7XDtMA4WPSU', (718, 60, 1138, 480)),
    ('V_3rvGDzv_U', 'ding.png', 'V_3rvGDzv_U', (600, 40, 1060, 500)),
    ('DStCmEElxW0', 'leela.png', 'DStCmEElxW0', (456, 140, 856, 540)),
    ('goDcorwxJnA', 'vector.png', 'goDcorwxJnA', (600, 20, 1100, 520)),
    ('D2B85mhGtT0', 'hikaru.png', 'D2B85mhGtT0', (712, 104, 1112, 504)),
    ('B3wErwlKytA', 'twoniche.png', 'B3wErwlKytA', (708, 84, 1148, 524)),
    ('ZZMXaJ0vbgQ', 'tushar.png', 'ZZMXaJ0vbgQ', (772, 132, 1212, 572)),
    ('cR6r8NZz-CA', 'arturchix.png', 'cR6r8NZz-CA', (814, 110, 1234, 530)),
    ('eJsNNi7rBro', 'jacksark.png', 'eJsNNi7rBro', (734, 94, 1154, 514)),
    ('k0EOBEhh85w', 'jacksark.png', 'k0EOBEhh85w', (750, 110, 1170, 530)),
    ('fRoyaduwh5I', 'chessvibes.png', 'fRoyaduwh5I', (750, 126, 1170, 546)),
    ('hMC2ZvGkDEQ', 'viperking.png', 'hMC2ZvGkDEQ', (750, 110, 1170, 530)),
    ('xu4yhPGGjTg', 'botez.png', 'xu4yhPGGjTg', (750, 126, 1170, 546)),
    ('FBrM-CLBZDA', 'croissant.png', 'FBrM-CLBZDA', (782, 78, 1202, 498)),
    ('patgvfwk5gA', 'babygotham.png', 'patgvfwk5gA', (688, 144, 1168, 624)),
    ('wD9UssXbCqA', 'engine.png', 'wD9UssXbCqA', (460, 270, 820, 630)),
    ('WLmt62Ll9Hs', 'laura.png', 'WLmt62Ll9Hs', (228, 42, 528, 342)),
    ('WLmt62Ll9Hs', 'vin.png', 'WLmt62Ll9Hs', (900, 46, 1180, 326)),
    ('WLmt62Ll9Hs', 'amir.png', 'WLmt62Ll9Hs', (58, 330, 358, 630)),
    ('WLmt62Ll9Hs', 'david.png', 'WLmt62Ll9Hs', (790, 360, 1070, 640)),
]
# avatars cropped from a sprite: (mode dir, out name, sprite video, thing, box)
SPRITE_AVATARS = [
    ('UZ79sKLa6z4', 'redpanda.png', 'UZ79sKLa6z4', 'hunter_avatars', (0, 90, 62, 152)),
    ('UZ79sKLa6z4', 'viper.png', 'UZ79sKLa6z4', 'hunter_avatars', (82, 90, 216, 224)),
    ('UZ79sKLa6z4', 'franchise.png', 'UZ79sKLa6z4', 'hunter_avatars', (232, 108, 300, 176)),
    ('CSjh4NrnxLE', 'tony.png', 'xjEz7bCQxho', 'tony_bot', None),
]

# whole video images shipped as-is (intro overlays / piece art): (mode, out name, sprite video, thing)
COPY = [
    ('D2B85mhGtT0', 'knight_wall.png', 'D2B85mhGtT0', 'knight_wall'),
    ('V_3rvGDzv_U', 'queen_wall.png', 'V_3rvGDzv_U', 'queen_wall'),
    ('uKy9Lb98G3E', 'bishop_wall.png', 'uKy9Lb98G3E', 'bishop_wall'),
    ('KCQ75vB5Jzw', 'multi_boards.png', 'KCQ75vB5Jzw', 'multi_boards'),
    ('qUROR6pcKKw', 'promotion_picker.png', 'qUROR6pcKKw', 'promotion_picker'),
    ('GH9tTFMWEUg', 'eggs.png', 'GH9tTFMWEUg', 'eggs'),
    ('D8rD3rTwgjc', 'pawn_spawn.png', 'D8rD3rTwgjc', 'pawn_spawn'),
]

if __name__ == '__main__':
    for mode, name, vid, thing in COPY:
        save(sprite(vid, thing).convert('RGBA'), mode, name)
    # the transformer: the video's pixel-glitch piece, cut out of its tile
    save(square(largest(keyout(sprite('A7gdM2GD1b0', 'transforming_piece').convert('RGBA')))), 'A7gdM2GD1b0', 'transformer.png')
    for mode, name, vid, thing, dark, o in PIECES:
        im = sprite(vid, thing).convert('RGBA')
        if o.get('how') == 'tile':   # the rock is a whole grey square in the video: keep it as a tile
            im = im.crop(o['box']).resize((256, 256), Image.LANCZOS)
        else:
            im = cutout(im, rf=o.get('ring', 0.08)) if o.get('how') == 'flood' else keyout(im, o.get('dist', 70), o.get('dark', False))
            im = square(largest(im))
        if dark: im = darken(im)
        save(im, mode, name)
    for mode, name, vid, box in AVATARS:
        save(thumb(vid).crop(box).resize((256, 256), Image.LANCZOS), mode, name)
    for mode, name, vid, thing, box in SPRITE_AVATARS:
        im = sprite(vid, thing).convert('RGB')
        if box: im = im.crop(box)
        save(im.resize((256, 256), Image.LANCZOS), mode, name)
