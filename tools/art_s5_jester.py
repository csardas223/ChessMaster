#!/usr/bin/env python3
"""s5-art 2026-11-26: WXcmWG7Eczs Queen / Inverse Queen jester crowns (128 px doodles whose side tip balls were cut by
the crop) -> clean 512 px.

Method: pad the old sprite, copy the crown's intact tip ball (a top ball) and template-match it onto the cut side balls
(only pixels inside the old 128 px canvas count), paste the whole ball there, then re-trace (tools/sprite_vec.vec:
palette + potrace) and render 512 px centred at 90%.
usage: python3 tools/art_s5_jester.py OUTDIR    (writes OUTDIR/<name>.png, then copy into assets/modes/WXcmWG7Eczs/)
"""
import os, sys
import numpy as np
from PIL import Image
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sprite_vec import vec
from art_fit import fit
import re, io, cairosvg
PAL = {'w': [(30, 30, 30), (245, 245, 240)], 'b': [(25, 25, 25), (85, 85, 82)]}
OUTLINE = '#30322d'
FILL = {'w': '#fafcfa', 'b': '#565551'}

M = 'assets/modes/WXcmWG7Eczs/'
PAD = 14
R = 7  # template half size (ball diameter ~10 px in the 128 px sprite)


def ball_centre(a, win):
    """centroid of the ball's opaque pixels in window (x0,y0,x1,y1): the ring + its fill."""
    x0, y0, x1, y1 = win
    al = a[y0:y1, x0:x1, 3] > 128
    ys, xs = np.nonzero(al)
    return x0 + xs.mean(), y0 + ys.mean()


def fix(name, top_win, cut_wins):
    im = np.array(Image.open(M + name + '.png').convert('RGBA')).astype(float)
    H, W = im.shape[:2]
    big = np.zeros((H + 2 * PAD, W + 2 * PAD, 4))
    big[PAD:PAD + H, PAD:PAD + W] = im
    valid = np.zeros(big.shape[:2], bool)
    valid[PAD:PAD + H, PAD:PAD + W] = True
    cx, cy = ball_centre(im, top_win)
    cx, cy = int(round(cx)) + PAD, int(round(cy)) + PAD
    tpl = big[cy - R:cy + R + 1, cx - R:cx + R + 1].copy()
    yy, xx = np.mgrid[-R:R + 1, -R:R + 1]
    disc = (xx ** 2 + yy ** 2) <= (R - 0.5) ** 2
    tpl[~disc] = 0
    for win in cut_wins:
        if len(win) == 2:  # fixed centre (same drawing as the other colour, where the match is clearer)
            px, py = win[0] + PAD, win[1] + PAD
            best = (0, px, py)
            x0 = y0 = x1 = y1 = 0
        else:
            x0, y0, x1, y1 = win
            best = None
        for py in range(y0 + PAD, y1 + PAD):
            for px in range(x0 + PAD, x1 + PAD):
                sl = (slice(py - R, py + R + 1), slice(px - R, px + R + 1))
                patch = big[sl]
                if patch.shape[:2] != tpl.shape[:2]:
                    continue
                v = valid[sl] & disc
                if v.sum() < 12:
                    continue
                d = np.abs(patch[..., 3][v] - tpl[..., 3][v]).mean() + 0.5 * np.abs(patch[..., :3][v] - tpl[..., :3][v]).mean()
                if best is None or d < best[0]:
                    best = (d, px, py)
        d, px, py = best
        print(name, 'ball at', px - PAD, py - PAD, 'score', round(d, 1))
        sl = (slice(py - R, py + R + 1), slice(px - R, px + R + 1))
        ta = tpl[..., 3:4] / 255.0
        big[sl][..., :3] = tpl[..., :3] * ta + big[sl][..., :3] * (1 - ta)
        big[sl][..., 3] = np.maximum(big[sl][..., 3], tpl[..., 3])
    # drop the pale halo outside the dark outline: flood from the border through transparent / light pixels
    lum = big[..., :3].mean(-1)
    passable = (big[..., 3] < 170) | (lum > 140)
    seen = np.zeros(passable.shape, bool)
    stack = [(y, x) for y in range(big.shape[0]) for x in (0, big.shape[1] - 1)] + \
            [(y, x) for x in range(big.shape[1]) for y in (0, big.shape[0] - 1)]
    while stack:
        y, x = stack.pop()
        if y < 0 or x < 0 or y >= big.shape[0] or x >= big.shape[1] or seen[y, x] or not passable[y, x]:
            continue
        seen[y, x] = True
        stack += [(y + 1, x), (y - 1, x), (y, x + 1), (y, x - 1)]
    big[seen, 3] = 0
    return Image.fromarray(np.clip(big, 0, 255).astype(np.uint8))


# windows in the old 128 px sprite coordinates: top ball (intact), regions to search the cut side balls in
JOBS = {
    'Q_w': ((24, 18, 38, 30), [(4, 46), (126, 44)]),  # = Q_b's matched centres (same drawing)
    'Q_b': ((24, 18, 38, 30), [(-6, 38, 8, 54), (120, 28, 134, 46)]),
    'Iq_w': ((28, 106, 44, 122), [(2, 94), (127, 92)]),  # left = Iq_b's match
    'Iq_b': ((28, 106, 44, 122), [(-6, 84, 8, 102), (120, 80, 134, 100)]),
}

if __name__ == '__main__':
    out = sys.argv[1]
    os.makedirs(out, exist_ok=True)
    for n, (tw, cw) in JOBS.items():
        padded = fix(n, tw, cw)
        p = os.path.join(out, n + '_padded.png')
        padded.save(p)
        o = os.path.join(out, n + '.png')
        side = n[-1]
        vec(p, o, k=2, palette=PAL[side], base=0, lab_smooth=0.6, smooth=1.0, up=8, alpha_thr=170)
        # recolour the two layers to this set's own outline / fill (sampled from K_w, K_b at 512 px) and re-render
        svg = open(o + '.svg').read()
        cols = re.findall(r'fill="(#[0-9a-f]{6})"', svg)
        svg = svg.replace('fill="%s"' % cols[0], 'fill="%s"' % OUTLINE, 1)
        for c in cols[1:]:
            svg = svg.replace('fill="%s"' % c, 'fill="%s"' % FILL[side])
        png = cairosvg.svg2png(bytestring=svg.encode(), output_width=2048)
        fit(Image.open(io.BytesIO(png)), 512, 0.9).save(o, optimize=True)
        os.remove(o + '.svg')
        print('ok', n)
