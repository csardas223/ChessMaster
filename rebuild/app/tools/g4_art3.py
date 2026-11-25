#!/usr/bin/env python3
"""Group-4 art, ninth session (impl-4 art pass). Everything is cut from frames already in the repo
(rebuild/research/frames/video_thumbs/<id>_maxres1..3.jpg = the stills YouTube grabs at 25/50/75%), per the owner rule
(2026-11-24 10:13 PM ET: all mode art copied from the videos; use the repo's sprites/thumbs first).
  - 9M2Mj2WFFys Kung Fu Chess: the site's piece set (12 pieces) cut from the 25% still, background keyed out
  - 8XmhGMnypjc 4 Player Team Chess: Croissant (GM_Croissant, Mona Lisa avatar) and Millionaire-... (grey pawn) avatars
  - 1Q4rfOd0al8 Rosen Score: PURESATURDAYY's avatar (chess.com default pawn) from the 50% still
  - LjehdkzmCho Seirawan Chess: the Hawk piece (white + black) as chess.com draws it, from the 75% still
Run from rebuild/app:  python3 tools/g4_art3.py"""
import os
from collections import deque
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(HERE, '..', 'assets', 'modes')
VT = os.path.join(HERE, '..', '..', 'research', 'frames', 'video_thumbs')

def frame(vid, var): return Image.open(os.path.join(VT, '%s_%s.jpg' % (vid, var))).convert('RGB')
def save(im, mid, name):
    d = os.path.join(OUT, mid); os.makedirs(d, exist_ok=True); im.save(os.path.join(d, name), optimize=True)

def key_out(im, tol=70):
    """flood-fill the flat square colour from the border (pieces have closed dark outlines)"""
    im = im.convert('RGBA'); w, h = im.size; px = im.load(); seen = bytearray(w * h); q = deque()
    for x in range(w):
        for y in (0, h - 1): q.append((x, y))
    for y in range(h):
        for x in (0, w - 1): q.append((x, y))
    while q:
        x, y = q.popleft()
        if seen[y * w + x]: continue
        seen[y * w + x] = 1; c = px[x, y]
        if min(c[:3]) < 150 and not (c[1] > 150 and c[0] < 200): continue  # dark outline / black piece body stops the fill
        px[x, y] = (c[0], c[1], c[2], 0)
        for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if 0 <= nx < w and 0 <= ny < h and not seen[ny * w + nx]: q.append((nx, ny))
    return im

def square(im, size):
    w, h = im.size; s = min(w, h); l, t = (w - s) // 2, (h - s) // 2
    return im.crop((l, t, l + s, t + s)).resize((size, size), Image.LANCZOS)

def kungfu():
    fr = frame('9M2Mj2WFFys', 'maxres1'); x0, y0, S = 130, 26, 84.4
    at = {'bN': (0, 1), 'bB': (0, 2), 'bK': (0, 4), 'bR': (0, 5), 'bQ': (1, 2), 'bP': (2, 2),
          'wR': (3, 3), 'wB': (4, 0), 'wP': (4, 2), 'wN': (5, 5), 'wQ': (6, 2), 'wK': (7, 6)}
    for name, (r, c) in at.items():
        box = (int(x0 + S * c) + 3, int(y0 + S * r) + 3, int(x0 + S * (c + 1)) - 3, int(y0 + S * (r + 1)) - (9 if name == 'bR' else 3))
        im = key_out(fr.crop(box)); bb = im.getbbox(); im = im.crop(bb)
        w, h = im.size; s = int(max(w, h) * 1.12); c2 = Image.new('RGBA', (s, s), (0, 0, 0, 0)); c2.paste(im, ((s - w) // 2, (s - h) // 2), im)
        save(c2.resize((128, 128), Image.LANCZOS), '9M2Mj2WFFys/pieces', name + '.png')

def fourpc():
    fr = frame('8XmhGMnypjc', 'maxres2')
    save(square(fr.crop((416, 106, 443, 133)), 96), '8XmhGMnypjc', 'croissant.png')
    save(square(fr.crop((847, 106, 872, 131)), 96), '8XmhGMnypjc', 'millionaire.png')

def rosen():
    save(square(frame('1Q4rfOd0al8', 'maxres2').crop((805, 24, 855, 74)), 96), '1Q4rfOd0al8', 'opponent.png')

def hawk():
    fr = frame('LjehdkzmCho', 'maxres3')
    for name, box in (('H_w.png', (413, 584, 485, 656)), ('H_b.png', (793, 128, 865, 200))):
        im = key_out(fr.crop(box)); im = im.crop(im.getbbox())
        w, h = im.size; s = int(max(w, h) * 1.12); c2 = Image.new('RGBA', (s, s), (0, 0, 0, 0)); c2.paste(im, ((s - w) // 2, (s - h) // 2), im)
        save(c2.resize((128, 128), Image.LANCZOS), 'LjehdkzmCho', name)

if __name__ == '__main__':
    kungfu(); fourpc(); rosen(); hawk(); print('ok')
