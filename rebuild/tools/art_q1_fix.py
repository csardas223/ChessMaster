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


def _blob_from_ring(ring, seed, close=1):
    """piece = the filled region of the ring-coloured outline component that encloses the seed (x, y);
    falls back to the biggest filled component."""
    if close:
        ring = ndi.binary_closing(ring, iterations=close) | ring
    lab, n = ndi.label(ring, structure=np.ones((3, 3)))
    best, area = None, 0
    for i in range(1, n + 1):
        f = ndi.binary_fill_holes(lab == i)
        if f[seed[1], seed[0]]:
            if f.sum() > area: best, area = f, f.sum()
    if best is None:
        raise SystemExit(f'no outline encloses {seed}')
    return best


@job
def gunking():
    """2. AWFB4EzGtDc Gun King. pawn.png (blue background blotches) recut from video_thumbs/AWFB4EzGtDc_frame_62.jpg ~(1110,686):
    the grey pawn = its black pixel outline + everything inside. red_pawn.png (solid blue square behind it) from frame_492
    ~(416,436): the red outline + inside (the neighbouring elite pawn on its right is cut off at x<441).
    gun_king.png (dark corners outside the round badge): alpha = the white ring + inside."""
    f = np.asarray(frame('AWFB4EzGtDc', 'frame_62')).astype(np.float32)
    c = f[630:740, 1070:1160]
    dark = c.max(-1) < 70
    fg = _blob_from_ring(dark, (44, 54), 2)
    fg |= ndi.binary_dilation(fg, iterations=2) & (c.max(-1) < 110)  # keep the full width of the black outline
    Image.fromarray(np.dstack([c, fg * 255]).astype(np.uint8), 'RGBA')
    square_canvas(np.dstack([c, fg * 255.0]), None, 2).save(os.path.join(M, 'AWFB4EzGtDc', 'pawn.png'), optimize=True)
    f = np.asarray(frame('AWFB4EzGtDc', 'frame_492')).astype(np.float32)
    c = f[390:480, 380:441]
    r, g, b = c[..., 0], c[..., 1], c[..., 2]
    red = (r - np.maximum(g, b) > 40)
    fg = _blob_from_ring(red, (38, 50), 3)
    fg[70:, 55:] = False  # the neighbouring pawn's outline running down the right edge
    square_canvas(np.dstack([c, fg * 255.0]), None, 2).save(os.path.join(M, 'AWFB4EzGtDc', 'red_pawn.png'), optimize=True)
    p = os.path.join(M, 'AWFB4EzGtDc', 'gun_king.png')
    k = np.asarray(Image.open(p).convert('RGBA')).astype(np.float32)
    white = k[..., :3].min(-1) > 200
    fg = _blob_from_ring(white, (k.shape[1] // 2, k.shape[0] // 2), 2)
    k[..., 3] = np.minimum(k[..., 3], fg * 255)
    Image.fromarray(k.astype(np.uint8), 'RGBA').save(p, optimize=True)  # same canvas: the king keeps its in-game scale


if __name__ == '__main__':
    for k in (sys.argv[1:] or list(JOBS)):
        JOBS[k]()
