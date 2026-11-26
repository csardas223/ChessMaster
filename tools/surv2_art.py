#!/usr/bin/env python3
"""surv2 (2026-11-25): Chess Survivors pass-2 art cut from paused 1080p YouTube frames
(research/frames/video_thumbs/spJibM5qaNQ_frame_<s>.jpg, 1920x1440 page, video at y 180..1260).

  frame_1326 (22:06 'Unlocks' panel): tiny wizard  -> wizard.png, cat -> cat.png
  frame_472  (7:52, Act 1 72 turns left): wandering bot companion -> bot.png, one Bubbles bubble -> bubble.png
  frame_38   (0:38, Act 1 start): reference for the green dashed turn-timer ring around the hero (drawn in CSS, no cut)

Background keying: flood fill from the crop border over pixels close to the panel / board colours. The mouse cursor
that overlaps the wizard's robe in frame 1326 is painted over with the robe red sampled next to it (inferred pixels).
Run from rebuild/app:  python3 tools/surv2_art.py
"""
import os
from collections import deque
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FR = os.path.join(ROOT, 'research', 'frames', 'video_thumbs')
OUT = os.path.join(ROOT, 'assets', 'modes', 'spJibM5qaNQ')


def near(a, b, tol):
    return abs(a[0] - b[0]) + abs(a[1] - b[1]) + abs(a[2] - b[2]) <= tol


def flood_key(im, bgs, tol):
    im = im.convert('RGBA'); px = im.load(); w, h = im.size
    seen = set(); q = deque()
    for x in range(w):
        q.append((x, 0)); q.append((x, h - 1))
    for y in range(h):
        q.append((0, y)); q.append((w - 1, y))
    while q:
        x, y = q.popleft()
        if (x, y) in seen or x < 0 or y < 0 or x >= w or y >= h:
            continue
        seen.add((x, y))
        c = px[x, y]
        if not any(near(c, b, tol) for b in bgs):
            continue
        px[x, y] = (0, 0, 0, 0)
        q.extend([(x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)])
    return im


def trim(im, size):
    bb = im.getbbox(); im = im.crop(bb)
    w, h = im.size; s = max(w, h)
    sq = Image.new('RGBA', (s, s), (0, 0, 0, 0)); sq.paste(im, ((s - w) // 2, s - h))   # feet on the bottom edge
    return sq.resize((size, size), Image.LANCZOS)


def keep_colours(im, pred):
    """mask = pixels matching pred, then fill enclosed holes (dark interior pixels of the sprite)."""
    im = im.convert('RGBA'); px = im.load(); w, h = im.size
    m = [[pred(px[x, y]) for x in range(w)] for y in range(h)]
    out = [[True] * w for _ in range(h)]   # outside = reachable from border through non-mask
    q = deque([(x, y) for x in range(w) for y in (0, h - 1)] + [(x, y) for y in range(h) for x in (0, w - 1)])
    seen = set()
    while q:
        x, y = q.popleft()
        if (x, y) in seen or not (0 <= x < w and 0 <= y < h) or m[y][x]:
            continue
        seen.add((x, y)); q.extend([(x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)])
    for y in range(h):
        for x in range(w):
            if not m[y][x] and (x, y) in seen:
                px[x, y] = (0, 0, 0, 0)
    return im


def keep_rows_cols(im, pred):
    """keep a pixel when it lies between matching pixels both on its row and on its column (fills the dark core)."""
    im = im.convert('RGBA'); px = im.load(); w, h = im.size
    m = [[pred(px[x, y]) for x in range(w)] for y in range(h)]
    rows = [[x for x in range(w) if m[y][x]] for y in range(h)]
    cols = [[y for y in range(h) if m[y][x]] for x in range(w)]
    for y in range(h):
        for x in range(w):
            r, c = rows[y], cols[x]
            if not (r and c and r[0] <= x <= r[-1] and c[0] <= y <= c[-1]):
                px[x, y] = (0, 0, 0, 0)
    return im


def main():
    os.makedirs(OUT, exist_ok=True)
    f = Image.open(os.path.join(FR, 'spJibM5qaNQ_frame_1326.jpg')).convert('RGB')
    # tiny wizard (unlock tile 1, panel #310b6e); the cursor sits on its robe hem
    wz = f.crop((495, 430, 715, 742)).convert('RGBA'); px = wz.load(); w, h = wz.size
    red = (212, 84, 84, 255)
    for y in range(h):
        for x in range(w):
            X, Y = x + 495, y + 430
            if 595 <= X <= 660 and 688 <= Y <= 755:
                c = px[x, y]
                if not (c[0] > 150 and c[0] - c[1] > 70):
                    px[x, y] = red if Y < 705 and X < 652 else (0, 0, 0, 0)
    wz = flood_key(wz, [(49, 11, 110), (60, 20, 120)], 70)
    trim(wz, 128).save(os.path.join(OUT, 'wizard.png'))
    # cat (unlock tile 2, panel #24054b)
    ct = f.crop((835, 480, 1030, 690))
    ct = flood_key(ct, [(36, 5, 75), (45, 12, 90)], 60)
    trim(ct, 128).save(os.path.join(OUT, 'cat.png'))

    g = Image.open(os.path.join(FR, 'spJibM5qaNQ_frame_472.jpg')).convert('RGB')
    # wandering bot: orange shell + cyan core; dark navy interior kept by hole filling; smoke trail (grey-brown) dropped
    bt = g.crop((773, 500, 832, 552))
    def bot_px(c):
        r, gg, b = c[0], c[1], c[2]
        orange = r > 170 and 60 < gg < 190 and b < 110
        cyan = b > 150 and gg > 120 and r < 140
        return orange or cyan
    bt = keep_rows_cols(bt, bot_px)
    trim(bt, 96).save(os.path.join(OUT, 'bot.png'))
    # one bubble: the frame's bubble is see-through over the bullseye, so it is redrawn at the cut's size from its own look:
    # 2-px white rim (pink-tinted on the inside), pale see-through body, the two small highlight squares at lower left
    bb = Image.new('RGBA', (52, 52), (0, 0, 0, 0)); px = bb.load(); w, h = bb.size
    cx, cy, R = w / 2, h / 2, w / 2 - 1
    for y in range(h):
        for x in range(w):
            d = ((x + .5 - cx) ** 2 + (y + .5 - cy) ** 2) ** .5
            if d > R: continue
            px[x, y] = (255, 255, 255, 255) if d > R - 2.2 else (246, 214, 232, 150) if d > R - 3.5 else (236, 222, 240, 60)
    for (x, y) in [(15, 33), (16, 33), (15, 34), (16, 34), (20, 37), (21, 37), (20, 38), (21, 38)]:
        px[x, y] = (255, 236, 246, 220)
    bb.resize((96, 96), Image.LANCZOS).save(os.path.join(OUT, 'bubble.png'))
    print('ok', os.listdir(OUT))


if __name__ == '__main__':
    main()
