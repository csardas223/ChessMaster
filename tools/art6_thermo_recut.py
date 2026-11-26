#!/usr/bin/env python3
"""Thermopylae (boaA9_TjXeU) piece recut (Hark art leftovers, 2026-11-25 PM ET).

The g5_art5.py cut keyed the cards with abs_key(40): the pieces' thick dark outline (~#262624) is within 40 of the card
background (#3a3935), so the outline was removed and only the light anti-alias ring around it survived -> the 'halo' the
art audit flagged (worst on the green copies). This recut keeps the video's dark outline:
  1. crop the same piece-introduction card boxes (1920x1080 frames 65/70/75/98, research/frames/video_thumbs);
  2. flood-fill 'outside' from the crop border over every pixel lighter than the outline (card bg, the dimmed board
     behind the Soldier card, the light ring);
  3. alpha = 1 inside; on the outside fringe alpha = darkness relative to the local background (soft edge, ring -> 0).
Green copies (General / Sergeant / Soldier): the red card recoloured to the video's own green, measured on the green
General icon of the 'Ways to Win' card (maxres1 1280x720, fill ~ (60,188,76)); red fill (196,69,80) is mapped there in
HSV with the shading kept. Video shows Green's pieces only that small, so green = recoloured red card (inferred colour
from the video).
art-leftovers 3 (2026-11-25 PM ET): red tone-matched to the board pieces (196,69,80 -> 184,61,71) and green copies
recoloured to the board green (78,145,97) measured on the 1:55 1080p frame, so every Thermopylae piece shares one palette.
Run from rebuild/app: python3 tools/art6_thermo_recut.py
Credit: all art (c) chess.com / iwantcheckmate videos."""
import os, colorsys
from collections import deque
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
THUMBS = os.path.join(HERE, '..', '..', 'research', 'frames', 'video_thumbs')
OUT = os.path.join(HERE, '..', 'assets', 'modes', 'boaA9_TjXeU')
V = 'boaA9_TjXeU'
CARDS = {'archbishop': (65, (215, 120, 770, 860)), 'general': (70, (230, 120, 760, 860)),
         'sergeant': (75, (230, 130, 770, 870)), 'soldier': (98, (210, 150, 720, 790))}
OUTLINE_MAX = 46      # outline pixels are ~35-42 luminance; bg 57+, light ring ~76
SIZE = 160

def lum(p): return 0.299 * p[0] + 0.587 * p[1] + 0.114 * p[2]

def cut(im):
    im = im.convert('RGB'); w, h = im.size; px = im.load()
    L = [[lum(px[x, y]) for x in range(w)] for y in range(h)]
    out = [[False] * w for _ in range(h)]; q = deque()
    for x in range(w):
        for y in (0, h - 1):
            if L[y][x] > OUTLINE_MAX and not out[y][x]: out[y][x] = True; q.append((x, y))
    for y in range(h):
        for x in (0, w - 1):
            if L[y][x] > OUTLINE_MAX and not out[y][x]: out[y][x] = True; q.append((x, y))
    while q:
        x, y = q.popleft()
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < w and 0 <= ny < h and not out[ny][nx] and L[ny][nx] > OUTLINE_MAX:
                out[ny][nx] = True; q.append((nx, ny))
    res = Image.new('RGBA', (w, h)); rp = res.load()
    for y in range(h):
        for x in range(w):
            r, g, b = px[x, y]
            if not out[y][x]:
                rp[x, y] = (r, g, b, 255); continue
            # outside: soft edge only right next to the piece; alpha from darkness vs the background around it
            near = any(0 <= x + dx < w and 0 <= y + dy < h and not out[y + dy][x + dx] for dx in (-1, 0, 1) for dy in (-1, 0, 1))
            if not near: rp[x, y] = (0, 0, 0, 0); continue
            bgl = 57.0; a = max(0.0, min(1.0, (bgl - L[y][x]) / (bgl - 38.0)))
            rp[x, y] = (38, 38, 36, int(a * 255))
    return res

def trim_square(im, pad=4):
    bb = im.getchannel('A').point(lambda a: 255 if a > 8 else 0).getbbox(); im = im.crop(bb)
    s = max(im.size) + 2 * pad; c = Image.new('RGBA', (s, s), (0, 0, 0, 0))
    c.paste(im, ((s - im.size[0]) // 2, (s - im.size[1]) // 2)); return c

CARD_RED = (196, 69, 80)    # fill of the red piece cards
BOARD_RED = (184, 61, 71)   # fill of Red's pieces on the 1:55 1080p board frame (frame_115), art-leftovers 3
BOARD_GREEN = (78, 145, 97) # fill of Green's pieces on that board frame (= chess.com 4-player green #4e9161), art-leftovers 3

def recolour(im, src, dst, keep_grey=True):
    """map fill colour src -> dst in HSV keeping the shading; greys (outline, highlights) stay"""
    rh, rs, rv = colorsys.rgb_to_hsv(*(v / 255 for v in src))
    gh, gs, gv = colorsys.rgb_to_hsv(*(v / 255 for v in dst))
    im = im.copy(); px = im.load(); w, h = im.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            hh, ss, vv = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
            if keep_grey and ss < 0.18: continue   # outline / greys stay
            ss = min(1.0, ss * gs / rs); vv = min(1.0, vv * gv / rv)
            nr, ng, nb = colorsys.hsv_to_rgb(gh, ss, vv)
            px[x, y] = (int(nr * 255 + .5), int(ng * 255 + .5), int(nb * 255 + .5), a)
    return im

def to_green(im, src=BOARD_RED):
    # art-leftovers 3: target = the green of Green's pieces on the board (78,145,97), not the brighter (60,188,76) of
    # the small 'Ways to Win' General icon used before; the video's board shows Green's army in chess.com green.
    return recolour(im, src, BOARD_GREEN)

def main():
    for n, (t, box) in CARDS.items():
        fr = Image.open(os.path.join(THUMBS, '%s_frame_%s.jpg' % (V, t))).crop(box)
        im = trim_square(cut(fr)).resize((SIZE, SIZE), Image.LANCZOS)
        im = recolour(im, CARD_RED, BOARD_RED)   # cards are drawn a little brighter than the board pieces
        im.save(os.path.join(OUT, n + '_r.png'), optimize=True)
        if n != 'archbishop':
            to_green(im).save(os.path.join(OUT, n + '_g.png'), optimize=True)
        print('wrote', n)

if __name__ == '__main__':
    main()
