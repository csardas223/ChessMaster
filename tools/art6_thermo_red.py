#!/usr/bin/env python3
"""Thermopylae (boaA9_TjXeU) Red plain pieces from the video (Hark art leftovers 2, 2026-11-25 PM ET).

Red's ordinary kings, queens and bishops used the app's cream set + CSS tint; the video draws them as chess.com's red
4-player pieces. Source: paused full-screen 1080p youtube.com frame at 1:55 (research/frames/video_thumbs/
boaA9_TjXeU_frame_115.jpg, 1920x1080; the board is x 219..1254, y 30..1065, 14x14 squares of 73.93 px).
Method (difference matting, no invented pixels):
  1. cut every clean instance of a piece type (plain light #dedede-ish or dark #aeaeae-ish square; stone/highlighted
     squares and the counters skipped), 4x upscaled, registered to the first instance by brute-force sub-pixel shift;
  2. per-pixel median of the light-square instances (C1) and of the dark-square instances (C2), with the measured square
     colours B1/B2: alpha = 1 - (C1-C2).(B1-B2)/|B1-B2|^2, colour = (C1 - (1-alpha) B1) / alpha;
  3. trimmed, padded square, 160 px (same size as the other Thermopylae pieces).
Run from rebuild/app: python3 tools/art6_thermo_red.py [names...]      Credit: art (c) chess.com / iwantcheckmate video."""
import os
import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
FRAME = os.path.join(HERE, '..', 'research', 'frames', 'video_thumbs', 'boaA9_TjXeU_frame_115.jpg')
OUT = os.path.join(HERE, '..', 'assets', 'modes', 'boaA9_TjXeU')
X0, Y0, S = 219.0, 30.0, 1035.0 / 14
UP = 4
# (row, col) of clean instances on the 1:55 frame (row 0 = top of the 14x14 board)
INST = {
    'queen_r': [(3, 0), (3, 1), (4, 0), (4, 1), (4, 2), (7, 9), (8, 9), (9, 1), (9, 3), (9, 10), (10, 0), (10, 2), (12, 4), (13, 3)],
    'king_r': [(5, 3), (6, 3), (6, 4), (7, 3), (7, 4), (7, 8), (8, 4), (8, 5), (8, 6), (8, 8), (9, 4), (9, 5), (9, 6), (9, 7), (9, 8)],
    'bishop_r': [(9, 0), (9, 2), (10, 1), (10, 3)],
    # art-leftovers 3: the Nightrider (chess.com knight) - 8 clean instances on light + dark squares
    'nightrider_r': [(7, 0), (7, 1), (7, 2), (8, 0), (8, 1), (8, 2), (10, 4), (10, 6)],
    # the bull-head Wildebeest: 3 instances, all on dark squares (replaces the saturated thumbnail cut)
    'wildebeest_r': [(10, 5), (11, 5), (12, 3)],
}
SIZE = 160

def cell(a, r, c):
    x, y = X0 + c * S, Y0 + r * S
    box = (int(round(x)) + 1, int(round(y)) + 1, int(round(x + S)) - 1, int(round(y + S)) - 1)
    im = Image.fromarray(a).crop(box).resize(((box[2] - box[0]) * UP, (box[3] - box[1]) * UP), Image.BICUBIC)
    return np.asarray(im).astype(np.float64)

def bg_of(cl):
    e = np.concatenate([cl[:6, :, :].reshape(-1, 3), cl[-6:, :, :].reshape(-1, 3)])
    return np.median(e, axis=0)

def shift(img, dx, dy):
    return np.roll(np.roll(img, dy, axis=0), dx, axis=1)

def register(ref, img):
    """best integer shift on the 4x grid (= quarter pixel on the frame) using the darkness mask"""
    rl, il = ref.mean(2), img.mean(2)
    best = None
    for dy in range(-6, 7):
        for dx in range(-6, 7):
            d = np.abs(shift(il, dx, dy)[12:-12, 12:-12] - rl[12:-12, 12:-12]).mean()
            if best is None or d < best[0]: best = (d, dx, dy)
    return shift(img, best[1], best[2])

OUTLINE = np.array([52.0, 9.0, 10.0])   # the red pieces' dark-red outline (darkest 3% of a king/bishop/queen cell on the frame)

def outside(C, B, tol=34.0):
    """flood from the cell border over pixels close to the square colour -> True = outside the piece"""
    from collections import deque
    h, w = C.shape[:2]; near = np.sqrt(((C - B) ** 2).sum(2)) < tol
    out = np.zeros((h, w), bool); q = deque()
    for x in range(w):
        for y in (0, h - 1):
            if near[y, x] and not out[y, x]: out[y, x] = True; q.append((x, y))
    for y in range(h):
        for x in (0, w - 1):
            if near[y, x] and not out[y, x]: out[y, x] = True; q.append((x, y))
    while q:
        x, y = q.popleft()
        for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if 0 <= nx < w and 0 <= ny < h and not out[ny, nx] and near[ny, nx]: out[ny, nx] = True; q.append((nx, ny))
    return out

def outside_mask(passable):
    from collections import deque
    h, w = passable.shape; out = np.zeros((h, w), bool); q = deque()
    for x in range(w):
        for y in (0, h - 1):
            if passable[y, x] and not out[y, x]: out[y, x] = True; q.append((x, y))
    for y in range(h):
        for x in (0, w - 1):
            if passable[y, x] and not out[y, x]: out[y, x] = True; q.append((x, y))
    while q:
        x, y = q.popleft()
        for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if 0 <= nx < w and 0 <= ny < h and not out[ny, nx] and passable[ny, nx]: out[ny, nx] = True; q.append((nx, ny))
    return out

def fringe(out, r=UP * 2):
    """outside pixels within r (4x grid) of the piece: the anti-aliased edge"""
    ins = ~out; m = ins.copy()
    for dy in range(-r, r + 1):
        for dx in range(-r, r + 1):
            if dx * dx + dy * dy <= r * r: m |= shift(ins, dx, dy)
    return m & out

def trim_square(im, pad=4 * UP // 2):
    bb = im.getchannel('A').point(lambda a: 255 if a > 8 else 0).getbbox(); im = im.crop(bb)
    s = max(im.size) + 2 * pad; c = Image.new('RGBA', (s, s), (0, 0, 0, 0))
    c.paste(im, ((s - im.size[0]) // 2, (s - im.size[1]) // 2)); return c

def main(only=None):
    fr = np.asarray(Image.open(FRAME).convert('RGB'))
    for name, lst in INST.items():
        if only and name not in only: continue
        cells = [cell(fr, r, c) for r, c in lst]
        h = min(x.shape[0] for x in cells); w = min(x.shape[1] for x in cells)
        cells = [x[:h, :w] for x in cells]
        ref = cells[0]; light, dark = [], []
        for cl in cells:
            b = bg_of(cl); reg = register(ref, cl) if cl is not ref else cl
            (light if b.mean() > 195 else dark).append((reg, b))
        C1 = np.median([x for x, _ in light], axis=0) if light else None; B1 = np.median([b for _, b in light], axis=0) if light else None
        C2 = np.median([x for x, _ in dark], axis=0) if dark else None; B2 = np.median([b for _, b in dark], axis=0) if dark else None
        # edge (art-leftovers 3): the outer ring of every chess.com piece is its dark outline, so a fringe pixel is
        # outline blended over the square: alpha = projection onto (square -> outline) per background, averaged over the
        # light and dark medians; colour = the outline. (The old two-background colour estimate left light specks.)
        als = []
        for C, B in ((C1, B1), (C2, B2)):
            if C is None: continue
            dO = B - OUTLINE
            als.append(np.clip(((B - C) * dO).sum(2) / (dO * dO).sum(), 0, 1))
        am = np.mean(als, axis=0)
        # outside = flood from the cell border over square/outline blends that are not yet (nearly) solid outline; the thick outline
        # stops it, so the kings' light holes stay piece fill. Mid-tone edge pixels are outside -> soft alpha, no halo.
        Cp, Bp = (C1, B1) if light else (C2, B2)
        line = Bp + am[..., None] * (OUTLINE - Bp)        # the square->outline blend this alpha predicts
        offline = np.sqrt(((Cp - line) ** 2).sum(2))       # red fill / highlights sit far off that line
        out = outside_mask((am < 0.9) & ((offline < 40) | (am < 0.25)))   # am < 0.25: square incl. jpeg ringing
        edge = fringe(out)
        colf = np.broadcast_to(OUTLINE, (C1 if light else C2).shape).copy()
        Cin = C1 if light else C2
        alpha = np.where(out, np.where(edge, am, 0.0), 1.0)
        alpha[alpha < 0.08] = 0
        col = np.where(out[..., None], colf, Cin)
        rgba = np.dstack([np.clip(col, 0, 255), alpha * 255]).astype(np.uint8)
        im = trim_square(Image.fromarray(rgba, 'RGBA'))
        im.resize((SIZE, SIZE), Image.LANCZOS).save(os.path.join(OUT, name + '.png'), optimize=True)
        print('wrote', name, 'light', len(light), 'dark', len(dark))
        if name == 'nightrider_r':   # Green copy (setup has none on the board, but L carries a g image): same art in board green
            import sys; sys.path.insert(0, HERE); from art6_thermo_recut import to_green
            to_green(Image.open(os.path.join(OUT, name + '.png')).convert('RGBA')).save(os.path.join(OUT, 'nightrider_g.png'), optimize=True)
            print('wrote nightrider_g')

if __name__ == '__main__':
    import sys
    main(set(sys.argv[1:]) or None)   # e.g. python3 tools/art6_thermo_red.py nightrider_r
