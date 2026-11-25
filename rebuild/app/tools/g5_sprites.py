#!/usr/bin/env python3
"""Group 5: copy the video reference sprites (research/frames/sprites/<id>_<thing>.png) into assets/modes/<id>/
as game art (owner instruction 2026-11-24 22:13 ET: use the video's art; credit iwantcheckmate).
Ops per entry: crop (x0,y0,x1,y1 in source px), key (flood-fill the background from the border, tolerance),
trim, size (max side px), recolor ('black': dark version of a white piece), square (pad to square).
Run: python3 tools/g5_sprites.py"""
import os
from collections import deque
from PIL import Image, ImageOps
HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, '..', '..', 'research', 'frames', 'sprites')
DST = os.path.join(HERE, '..', 'assets', 'modes')

def key(im, tol=70, seeds=None, dark=None):
    im = im.convert('RGBA'); w, h = im.size; px = im.load(); seen = bytearray(w * h); q = deque()
    border = seeds or ([(x, 0) for x in range(w)] + [(x, h - 1) for x in range(w)] + [(0, y) for y in range(h)] + [(w - 1, y) for y in range(h)])
    for (x, y) in border:
        c = px[x, y][:3]
        if dark is not None and (c[0] * 299 + c[1] * 587 + c[2] * 114) // 1000 > dark: continue
        q.append((x, y, c))
    while q:
        x, y, c = q.popleft()
        if x < 0 or y < 0 or x >= w or y >= h or seen[y * w + x]: continue
        p = px[x, y]
        if sum((p[i] - c[i]) ** 2 for i in range(3)) > tol * tol: continue
        seen[y * w + x] = 1; px[x, y] = (p[0], p[1], p[2], 0)
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)): q.append((x + dx, y + dy, c))
    return im
def trim(im, pad=2):
    bb = im.getchannel('A').point(lambda a: 255 if a > 20 else 0).getbbox()
    if not bb: return im
    im = im.crop(bb); w, h = im.size; out = Image.new('RGBA', (w + 2 * pad, h + 2 * pad), (0, 0, 0, 0)); out.paste(im, (pad, pad)); return out
def square(im):
    w, h = im.size; s = max(w, h); out = Image.new('RGBA', (s, s), (0, 0, 0, 0)); out.paste(im, ((s - w) // 2, s - h)); return out
def blackify(im):
    """dark version of a white piece: light pixels -> dark grey, dark outline -> light"""
    im = im.convert('RGBA'); px = im.load(); w, h = im.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a == 0: continue
            l = (r * 299 + g * 587 + b * 114) // 1000
            v = 255 - l; v = int(40 + v * 0.75) if l > 128 else int(200 + (128 - l) * 0.3)
            px[x, y] = (v, v, v, a)
    return im
def keep(im, colors, tol=60, grow=2):
    """keep only pixels near the given colours (plus a grown outline); everything else transparent"""
    im = im.convert('RGBA'); px = im.load(); w, h = im.size; m = [[False] * w for _ in range(h)]
    for y in range(h):
        for x in range(w):
            p = px[x, y]
            if any(sum((p[i] - c[i]) ** 2 for i in range(3)) <= tol * tol for c in colors): m[y][x] = True
    for _ in range(grow):
        n = [r[:] for r in m]
        for y in range(h):
            for x in range(w):
                if m[y][x]:
                    for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                        if 0 <= x + dx < w and 0 <= y + dy < h: n[y + dy][x + dx] = True
        m = n
    for y in range(h):
        for x in range(w):
            if not m[y][x]: px[x, y] = (0, 0, 0, 0)
    return im
def make(src, dst, crop=None, tol=None, keyseeds=None, do_trim=True, size=256, recolor=None, sq=True, dark=None, keepc=None, grow=2):
    im = Image.open(os.path.join(SRC, src)).convert('RGBA')
    if crop: im = im.crop(crop)
    if keepc: im = trim(keep(im, keepc, tol or 60, grow))
    elif tol: im = key(im, tol, keyseeds, dark)
    if do_trim and tol and not keepc: im = trim(im)
    if recolor == 'black': im = blackify(im)
    if sq: im = square(im)
    if size and max(im.size) > size: im.thumbnail((size, size), Image.LANCZOS)
    p = os.path.join(DST, dst); os.makedirs(os.path.dirname(p), exist_ok=True); im.save(p, optimize=True)
    return p

JOBS = []
def J(*a, **k): JOBS.append((a, k))
if __name__ == '__main__':
    import sys
    only = sys.argv[1:] 
    from g5_sprite_jobs import add_jobs
    add_jobs(J)
    for a, k in JOBS:
        if only and not any(a[1].startswith(o) for o in only): continue
        print(make(*a, **k))
