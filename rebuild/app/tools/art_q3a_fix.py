#!/usr/bin/env python3
"""art-audit-q3a (2026-11-25 ET): clean-ups of q3 mode art (items 1-8 of research/art_audit_todo.md '## q3').
Each job rewrites one file under app/assets/modes from a video source (research/frames/sprites or the video's maxres
thumbnail, cached in research/frames/sprites_web/thumbs/<id>_maxres.jpg); originals stay in git history.

  python3 tools/art_q3a_fix.py [job ...]      (no args = every job)
"""
import os, sys
import numpy as np
from PIL import Image
from scipy import ndimage

APP = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
M = os.path.join(APP, 'assets', 'modes')
SP = os.path.join(APP, '..', 'research', 'frames', 'sprites')
TH = os.path.join(APP, '..', 'research', 'frames', 'sprites_web', 'thumbs')


def rgb(path):
    return np.asarray(Image.open(path).convert('RGB')).astype(np.int32)


def largest(mask):
    lab, n = ndimage.label(mask, structure=np.ones((3, 3)))
    if n == 0:
        return mask
    sizes = ndimage.sum(np.ones_like(lab), lab, range(1, n + 1))
    return lab == (1 + int(np.argmax(sizes)))


def soft_alpha(mask, blur=0.7):
    a = ndimage.gaussian_filter(mask.astype(float), blur)
    a = np.where(mask, np.maximum(a, 0.5), a)       # keep the cut edge, soften only the 1px rim
    return np.clip(a * 255 * 1.0, 0, 255)


def save_rgba(rgbarr, alpha, out, pad=2, size=None, square=True):
    ys, xs = np.where(alpha > 8)
    y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    a = np.dstack([rgbarr, alpha])[y0:y1, x0:x1].astype(np.uint8)
    im = Image.fromarray(a, 'RGBA')
    w, h = im.size
    if square:
        s = max(w, h) + 2 * pad
        c = Image.new('RGBA', (s, s), (0, 0, 0, 0)); c.alpha_composite(im, ((s - w) // 2, (s - h) // 2)); im = c
    if size:
        sc = size / max(im.size)
        im = im.resize((round(im.width * sc), round(im.height * sc)), Image.LANCZOS)
    im.save(os.path.join(M, out), optimize=True)
    print(out, im.size)


JOBS = {}


def job(f):
    JOBS[f.__name__] = f
    return f


@job
def die():               # exMFzra96vo: the old die.png was the whole 144px crop (3 dice, the outer two cut off, opaque grey bg).
    # Keep only the middle die (red rounded tile with a knight), grey background keyed out.
    a = rgb(os.path.join(SP, 'exMFzra96vo_dice.png'))[22:88, 39:105]
    bg = np.median(np.concatenate([a[:3].reshape(-1, 3), a[-3:].reshape(-1, 3)]), axis=0)
    d = np.abs(a - bg).sum(-1)
    m = largest(ndimage.binary_fill_holes(d > 40))
    save_rgba(a, soft_alpha(m), 'exMFzra96vo/die.png', pad=1, size=192)



@job
def ornate_knight():     # gY9DNg9xDUM: old file was an uncut 80px board tile (yellow square + neighbouring king).  The intro card is
    # the white dragon knight shown on the darkened board at the start (frames/sprites/gY9DNg9xDUM_tiny_intro_pieces.png);
    # bright piece pixels, largest blob, inner black lines (eye, scales) kept by filling holes.
    a = rgb(os.path.join(SP, 'gY9DNg9xDUM_tiny_intro_pieces.png'))[75:185, 85:180]
    br = a.min(-1) > 120
    lab, n = ndimage.label(br, structure=np.ones((3, 3)))
    sizes = ndimage.sum(np.ones_like(lab), lab, range(1, n + 1))
    m = np.isin(lab, 1 + np.where(sizes >= 6)[0])            # head, base and mane spikes (split by the black lines)
    m = ndimage.binary_dilation(m, iterations=3)            # bridge the black outline/inner lines, then shrink back
    m = ndimage.binary_erosion(ndimage.binary_fill_holes(m), iterations=2) | (br & m)
    save_rgba(a, soft_alpha(m), 'gY9DNg9xDUM/ornate_knight.png', pad=3, size=256)



@job
def four_kings():        # h7UFq4r59tM: old file was the whole thumbnail card (black bands, magenta lines, '4 Players?' title).
    # The four kings keyed off the purple card of the video's maxres thumbnail (i.ytimg.com/vi/h7UFq4r59tM/maxresdefault.jpg,
    # cached in research/frames/sprites_web/thumbs); the purple background has G~0 and B>=R, the kings and their dark
    # outlines do not.  Crown holes stay see-through (they show the purple card in the thumbnail).
    a = rgb(os.path.join(TH, 'h7UFq4r59tM_maxres.jpg'))[230:665, 40:1240]
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    fg = ~((g < 22) & (b > r - 15))
    lab, n = ndimage.label(fg)
    sizes = ndimage.sum(np.ones_like(lab), lab, range(1, n + 1))
    m = np.isin(lab, 1 + np.where(sizes >= 20000)[0])         # the 4 kings only (title text is above the crop)
    m = ndimage.binary_fill_holes(m) & ~(ndimage.binary_fill_holes(m) & ~m & ndimage.binary_erosion(~m, iterations=2))
    m = ndimage.gaussian_filter(m.astype(float), 1.6) > 0.5      # smooth the JPEG-ragged outer outline
    a = a.copy(); a[m & (g < 22)] = (30, 28, 32)                  # rim pixels that still carry the purple -> outline grey
    save_rgba(a, soft_alpha(m), 'h7UFq4r59tM/four_kings.png', pad=6, size=None, square=False)



@job
def hawk_b():            # hk85bBLSi7Q: old hawk_b.png was a cream rectangle with a green zigzag (bad cut).  No black hawk is visible in
    # the frames we have, so (inferred) the black hawk is a dark recolour of hawk_w.png in the default set's black-piece style:
    # the outer black outline kept, the white body -> near-black, the black inner feather lines -> light grey.
    a = np.asarray(Image.open(os.path.join(M, 'hk85bBLSi7Q', 'hawk_w.png')).convert('RGBA')).astype(np.float64)
    al = a[..., 3] > 0
    L = a[..., :3].mean(-1)
    # outer outline = dark pixels connected to the outside within a few px of the silhouette edge
    rim = al & ~ndimage.binary_erosion(al, iterations=7)
    dark = L < 110
    outline = dark & ndimage.binary_propagation(rim & dark & ~ndimage.binary_erosion(al, iterations=2), mask=dark & rim)
    outline = outline | (ndimage.binary_dilation(outline, iterations=3) & (L < 235))   # its anti-aliased inner edge too
    v = 40 + (255 - L) * (185 / 255.0)                       # body 255 -> 40, inner lines 0 -> 225
    v = np.where(outline, np.minimum(L * 0.6, 40), v)
    out = a.copy(); out[..., 0] = out[..., 1] = out[..., 2] = v
    Image.fromarray(np.clip(out, 0, 255).astype(np.uint8), 'RGBA').save(os.path.join(M, 'hk85bBLSi7Q', 'hawk_b.png'), optimize=True)
    print('hk85bBLSi7Q/hawk_b.png', int(outline.sum()))



@job
def troll():             # hv_NHWqysZE troll.png (avatar of hv_NHWqysZE, puKYAUl9x9s, ulE3YPZI9Sc): 8px black strip (+1px seam) across
    # the top of the 128px crop.  Drop rows 0-8, re-square by trimming the sides evenly, resize back to 128.
    p = os.path.join(M, 'hv_NHWqysZE', 'troll.png')
    im = Image.open(p).convert('RGBA')
    a = np.asarray(im)
    y0 = 0
    while y0 < 20 and a[y0, :, :3].mean() < 30: y0 += 1
    y0 += 1                                                   # the dark anti-aliased seam row
    if y0 <= 1:
        print('troll: no strip (already fixed)'); return
    h = im.height - y0; x0 = (im.width - h) // 2
    im.crop((x0, y0, x0 + h, im.height)).resize((128, 128), Image.LANCZOS).save(p, optimize=True)
    print('hv_NHWqysZE/troll.png cut top', y0)



@job
def goose():             # Y7KKKTTkwNk: the old cut lost the goose's thick black outline.  Recut from frames/sprites/Y7KKKTTkwNk_goose.png:
    # cream body + orange beak (largest blob), plus the black outline ring around it (pixels darker than the dark-green
    # background within the outline's width), cut at the green ground bar.  Right edge stays cut off as in the frame.
    a = rgb(os.path.join(SP, 'Y7KKKTTkwNk_goose.png'))[:508]
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    fill = ((r > 200) & (g > 190) & (b > 150)) | ((r > 150) & (g < 120) & (b < 90) & (r - g > 50))
    lab, n = ndimage.label(fill)
    sizes = ndimage.sum(np.ones_like(lab), lab, range(1, n + 1))
    fill = ndimage.binary_fill_holes(np.isin(lab, 1 + np.where(sizes >= 3000)[0]))     # body + beak (split by a black line)
    blk = a.max(-1) < 18
    ring = ndimage.binary_dilation(fill, iterations=18) & blk
    ring = ndimage.binary_propagation(ring & ndimage.binary_dilation(fill, iterations=3), mask=ring)   # only outline touching the goose
    m = ndimage.binary_fill_holes(fill | ring)
    m = ndimage.binary_opening(m, iterations=2) | fill
    save_rgba(a, soft_alpha(m), 'Y7KKKTTkwNk/goose.png', pad=4, size=256)



def inpaint(a, mask, iters=600, init=True):
    """fill mask pixels smoothly from their surroundings: normalized-convolution start, then Jacobi (harmonic) iterations."""
    a = a.astype(np.float64).copy(); K = (~mask).astype(np.float64)
    for c in range(a.shape[2] if init else 0):
        est = ndimage.gaussian_filter(a[..., c] * K, 8, mode='nearest') / np.maximum(ndimage.gaussian_filter(K, 8, mode='nearest'), 1e-6)
        a[..., c][mask] = est[mask]
    for _ in range(iters):
        e = np.pad(a, ((1, 1), (1, 1), (0, 0)), mode='edge')      # edge padding (np.roll would wrap the bottom in)
        avg = (e[:-2, 1:-1] + e[2:, 1:-1] + e[1:-1, :-2] + e[1:-1, 2:]) / 4
        a[mask] = avg[mask]
    return a


@job
def ouroboros_queen():   # _RFXN1Ye3sY: the video's title 'Ouroboros Queen' runs across the top of the boss portrait (no clean frame of the
    # boss exists in our frames).  Recut from the 580px sprite: the white title glyphs (white blobs starting in the top 70px)
    # + 10px (their dark drop shadow) are inpainted from their surroundings (navy background, crown), then the 580px square is resized to 256.
    a = rgb(os.path.join(SP, '_RFXN1Ye3sY_ouroboros_queen.png'))
    w = a.min(-1) > 170
    lab, n = ndimage.label(w)
    objs = ndimage.find_objects(lab)
    txt = np.zeros_like(w)
    for i, sl in enumerate(objs):
        if sl is not None and sl[0].start < 70 and sl[0].stop < 110:
            txt |= lab == i + 1
    m = ndimage.binary_dilation(txt, iterations=10)          # glyphs + their dark drop shadow
    # the title's dark shadow also darkens the whole band behind it: repaint the band (y < 105) except the crown
    # (red pixels + 7px for its outline) from the navy background below it
    r_, g_, b_ = a[..., 0], a[..., 1], a[..., 2]
    fig = (a.max(-1) > 70) & ~m & ~ndimage.binary_dilation(txt, iterations=14)   # crown, hair, forehead
    fig = ndimage.binary_dilation(fig, iterations=4)
    band = np.zeros_like(m); band[:105] = True
    m = m | (band & ~fig)
    a = a.copy(); a[:105] = np.where(m[:105, :, None], a[105:106], a[:105])   # start the band from the row below it
    out = inpaint(a, m, iters=1500, init=False)
    Image.fromarray(np.clip(out, 0, 255).astype(np.uint8), 'RGB').resize((256, 256), Image.LANCZOS) \
        .save(os.path.join(M, '_RFXN1Ye3sY', 'ouroboros_queen.png'), optimize=True)
    print('_RFXN1Ye3sY/ouroboros_queen.png text px', int(txt.sum()))


if __name__ == '__main__':
    for n in (sys.argv[1:] or list(JOBS)):
        JOBS[n]()
