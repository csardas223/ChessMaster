#!/usr/bin/env python3
"""art-audit-q1 (2026-11-25 ET): fixes for the q1 items of research/art_audit_todo.md (mode ids -TKJ..GGvp).
Run from anywhere:  python3 rebuild/tools/art_q1_fix.py [job ...]   (no args = every job)
Sources are the videos' own frames (i.ytimg.com maxres1-3 = real video frames, cached in research/frames/video_thumbs/)
and research/frames/sprites. Originals stay in git history.
"""
import os, sys, urllib.request
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage as ndi

HERE = os.path.dirname(os.path.abspath(__file__))
R = os.path.join(HERE, '..')
THUMBS = os.path.join(R, 'research/frames/video_thumbs')
SPRITES = os.path.join(R, 'research/frames/sprites')
M = os.path.join(R, 'app/assets/modes')


def frame(vid, k='maxresdefault'):
    p = os.path.join(THUMBS, f'{vid}_{k}.jpg')
    if not os.path.exists(p):
        open(p, 'wb').write(urllib.request.urlopen(f'https://i.ytimg.com/vi/{vid}/{k}.jpg', timeout=20).read())
    return Image.open(p).convert('RGB')


def soft(fg, r=0.6):
    a = np.asarray(Image.fromarray((fg * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(r))).astype(np.float32)
    return np.where(ndi.binary_dilation(fg), a, 0)


def square_canvas(rgba, size=None, pad=3):
    a = rgba[..., 3]
    ys, xs = np.where(a > 5)
    h, w = a.shape
    y0, y1, x0, x1 = max(0, ys.min() - pad), min(h, ys.max() + 1 + pad), max(0, xs.min() - pad), min(w, xs.max() + 1 + pad)
    im = Image.fromarray(rgba[y0:y1, x0:x1].astype(np.uint8), 'RGBA')
    S = max(im.size)
    c = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    c.paste(im, ((S - im.size[0]) // 2, (S - im.size[1]) // 2))
    if size and S != size:
        c = c.resize((size, size), Image.LANCZOS)
    return c


def key_square(crop, tol=38, size=None, pad=3, trim=True):
    """piece on a flat board square: flood the square colour (median of the crop border) from the border, keep the
    biggest foreground blob with holes filled, 1px soft edge, centre on a square canvas."""
    rgb = np.asarray(crop).astype(np.float32)
    border = np.concatenate([rgb[0], rgb[-1], rgb[:, 0], rgb[:, -1]])
    bgc = np.median(border, axis=0)
    bgl = np.abs(rgb - bgc).max(-1) < tol
    lab, _ = ndi.label(bgl)
    bl = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    fg = ~np.isin(lab, list(bl))
    fl, n = ndi.label(fg)
    fg = fl == 1 + int(np.argmax(ndi.sum(fg, fl, range(1, n + 1))))
    fg = ndi.binary_fill_holes(fg)
    rgba = np.dstack([rgb, soft(fg)])
    if not trim:  # keep the square's own framing so the piece sits at the same scale as the video's other pieces
        c = Image.fromarray(rgba.astype(np.uint8), 'RGBA')
        return c.resize((size, size), Image.LANCZOS) if size else c
    return square_canvas(rgba, size, pad)


JOBS = {}


def job(f):
    JOBS[f.__name__] = f
    return f


@job
def xiangqi():
    """1. GGvpHVEgqwY Chinese vs Modern: the old chariot/advisor were blurry 128px crops on beige squares (and advisor.png
    was actually the ELEPHANT head), cannon/elephant were thumbnail crops spilling off the square.
    Recut from the video frame maxres1 (opening position, board x80..762 y18..700, 85.25px squares):
    a8 chariot, c8 elephant, e8 advisor (the spiked piece beside the general), g7 cannon."""
    im = frame('GGvpHVEgqwY', 'maxres1')
    x0, y0, sq = 80, 18, 682 / 8
    for name, (c, r) in {'chariot': (0, 0), 'elephant': (2, 0), 'advisor': (4, 0), 'cannon': (6, 1)}.items():
        box = (round(x0 + c * sq) + 1, round(y0 + r * sq) + 1, round(x0 + (c + 1) * sq) - 1, round(y0 + (r + 1) * sq) - 1)
        out = key_square(im.crop(box), size=96, trim=False)
        out.save(os.path.join(M, 'GGvpHVEgqwY', f'{name}.png'), optimize=True)
        print('GGvp', name, box)


if __name__ == '__main__':
    for k in (sys.argv[1:] or list(JOBS)):
        JOBS[k]()
