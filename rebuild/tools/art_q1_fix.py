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


@job
def duck():
    """3. Bzbzs0K5IBs duck.png was the uncut 256px tile (purple background, bits of neighbouring ducks), and
    E2x-QTgBD5k/duck.png (same chess.com duck) still had brown bits of the background ducks at its base and its head cut off at
    the top. Both recut from research/frames/sprites/E2x-QTgBD5k_duck.png (460px, whole duck on the thumbnail's magenta):
    flood the magenta from the border, keep the duck (largest blob), 256px."""
    src = np.asarray(Image.open(os.path.join(SPRITES, 'E2x-QTgBD5k_duck.png')).convert('RGB')).astype(np.float32)
    r, g, b = src[..., 0], src[..., 1], src[..., 2]
    bgl = ((r + b) / 2 - g) > 40
    lab, _ = ndi.label(bgl)
    bl = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    fg = ~np.isin(lab, list(bl))
    # the brown background ducks touching the base / back: thick olive areas (the duck's own dark outline is thin)
    brown = fg & ~((r > 185) & (g > 135)) & ~((r < 70) & (g < 70))
    thick = ndi.binary_dilation(ndi.binary_opening(brown, iterations=3), iterations=4) & brown
    fg &= ~thick
    fl, n = ndi.label(fg)
    fg = fl == 1 + int(np.argmax(ndi.sum(fg, fl, range(1, n + 1))))
    fg = ndi.binary_opening(fg, iterations=1) | (fg & ndi.binary_erosion(fg))
    fl, n = ndi.label(fg)
    fg = fl == 1 + int(np.argmax(ndi.sum(fg, fl, range(1, n + 1))))
    fg = ndi.binary_fill_holes(fg)
    out = square_canvas(np.dstack([src, soft(fg)]), 256, 4)
    for vid in ('Bzbzs0K5IBs', 'E2x-QTgBD5k'):
        out.save(os.path.join(M, vid, 'duck.png'), optimize=True)


@job
def kungfu():
    """4. 9M2Mj2WFFys kfchess piece set (black-and-white set): green board fringe on the edges (bK, bN worst) and the bK's
    white ring between outline and body was see-through (looked like a halo). All 12 pieces: colour -> grey (the set has no
    colour, so this removes the green spill), and transparent gaps enclosed by the piece outline -> opaque white."""
    d = os.path.join(M, '9M2Mj2WFFys', 'pieces')
    for f in sorted(os.listdir(d)):
        p = os.path.join(d, f)
        a = np.asarray(Image.open(p).convert('RGBA')).astype(np.float32)
        al = a[..., 3]
        solid = al > 30
        it = {'bK.png': 6, 'bN.png': 4}.get(f, 1)        # bK's outer ring / bN's back line are open at the bottom
        filled = ndi.binary_fill_holes(ndi.binary_closing(np.pad(solid, it), iterations=it)[it:-it, it:-it] | solid)
        inner = ndi.binary_erosion(filled, iterations=1)  # leave the outer anti-aliased edge alone
        grey = a[..., :3].min(-1) if f.startswith('b') else a[..., :3].mean(-1)
        k = np.where(inner, al / 255, 1)                  # composite see-through gaps inside the outline over white
        grey = grey * k + 255 * (1 - k)
        rgb = np.repeat(grey[..., None], 3, -1)
        al = np.where(inner, 255, al)
        Image.fromarray(np.dstack([rgb, al]).astype(np.uint8), 'RGBA').save(p, optimize=True)


@job
def shotgunking():
    """5. AvZiSnngZjA. king.png (intro card + Shotgun King avatar, cut from the thumbnail) had the thumbnail title
    "hotgun King" across the top: crop y>=58 (title and its outline are gone, the crown's cross tip goes with it) and re-square on the king.
    king_b.png (the board's black king, 80px) had the dark band above its square across the top and green/pink fringe:
    recut from the video frame maxres1, the black king standing on a lavender square at ~(700,470) (clean on all sides);
    alpha = the navy silhouette (dark pixels) with holes filled."""
    p = os.path.join(M, 'AvZiSnngZjA', 'king.png')
    k = Image.open(p).convert('RGBA')
    if k.size == (256, 256):
        k.crop((40, 58, 238, 256)).resize((256, 256), Image.LANCZOS).save(p, optimize=True)
    im = np.asarray(frame('AvZiSnngZjA', 'maxres1')).astype(np.float32)
    c = im[436:504, 668:736]
    dark = c.mean(-1) < 95
    fl, n = ndi.label(dark)
    fg = fl == 1 + int(np.argmax(ndi.sum(dark, fl, range(1, n + 1))))
    fg = ndi.binary_fill_holes(fg)
    navy = np.median(c[fg], axis=0)
    rgb = np.broadcast_to(navy, c.shape)               # the game's sprite is one flat navy; the frame adds CRT lines/noise
    a = np.dstack([rgb, fg * 255.0]).astype(np.uint8)
    Image.fromarray(a, 'RGBA').resize((80, 80), Image.LANCZOS).save(os.path.join(M, 'AvZiSnngZjA', 'king_b.png'), optimize=True)


if __name__ == '__main__':
    for k in (sys.argv[1:] or list(JOBS)):
        JOBS[k]()
