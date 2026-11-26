#!/usr/bin/env python3
"""art-audit-q2 (2026-11-25): recut intro overlays / pieces that showed crop strips, halos or holes, from the videos'
own maxresdefault thumbnails (cached in research/frames/video_thumbs/<id>_maxres.jpg; fetched from i.ytimg.com if missing).

Keying: flood fill from the crop border over background-coloured pixels (the magenta/purple thumbnail backdrop),
stopping at the art's dark outline; then keep the connected component at the art's centre, soften a 1px edge.
"""
import os, sys, urllib.request, io
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage as ndi

HERE = os.path.dirname(os.path.abspath(__file__))
R = os.path.join(HERE, '..')
THUMBS = os.path.join(R, 'research/frames/video_thumbs')
ASSETS = os.path.join(R, 'app/assets/modes')


def thumb(vid):
    p = os.path.join(THUMBS, f'{vid}_maxres.jpg')
    if not os.path.exists(p):
        data = urllib.request.urlopen(f'https://i.ytimg.com/vi/{vid}/maxresdefault.jpg', timeout=20).read()
        open(p, 'wb').write(data)
    return Image.open(p).convert('RGB')


def key(rgb, bgfn, seed_centre=True, grow=0):
    """rgb: HxWx3 float. bgfn(rgb)->bool mask of background-like pixels. Returns alpha 0..1."""
    bgl = bgfn(rgb)
    lab, n = ndi.label(bgl)
    border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    bg = np.isin(lab, list(border))
    fg = ~bg
    if seed_centre:
        fl, n = ndi.label(fg)
        sizes = ndi.sum(fg, fl, range(1, n + 1))
        keep = 1 + int(np.argmax(sizes))
        fg = fl == keep
        fg = ndi.binary_fill_holes(fg) if grow >= 0 else fg
    a = fg.astype(np.float32)
    # soft 1px edge
    a = np.asarray(Image.fromarray((a * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.6))).astype(np.float32) / 255
    a = np.minimum(a, fg.astype(np.float32) * 0 + np.where(ndi.binary_dilation(fg), 1, 0))
    return a


def save(rgb, a, out, size=None):
    h, w = a.shape
    ys, xs = np.where(a > 0.02)
    y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    pad = 4
    y0, x0 = max(0, y0 - pad), max(0, x0 - pad)
    y1, x1 = min(h, y1 + pad), min(w, x1 + pad)
    arr = np.dstack([rgb, a[..., None] * 255]).astype(np.uint8)[y0:y1, x0:x1]
    im = Image.fromarray(arr, 'RGBA')
    # square canvas
    S = max(im.size)
    c = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    c.paste(im, ((S - im.size[0]) // 2, (S - im.size[1]) // 2))
    if size and S > size:
        c = c.resize((size, size), Image.LANCZOS)
    c.save(out, optimize=True)
    print('wrote', out, c.size)


def magenta_bg(rgb):
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    return ((r + b) / 2 - g) > 22


def purple_bg(rgb):
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    return ((b - g) > 25) & ((r - g) > 12)


def dice():
    for vid in ['HkeZayq10p8', 'Jg-oNqDOXtg', 'KJYUsRlj_34', 'OcWzHqqeLNg']:
        im = thumb(vid).crop((400, 190, 880, 705))
        rgb = np.asarray(im).astype(np.float32)
        if vid == 'Jg-oNqDOXtg':
            # the thumbnail's big die touches the dice behind it; the series' thumbnails all use this exact die
            # (same pose, pips and shading), so take the clean one from HkeZayq10p8's thumbnail
            im = thumb('HkeZayq10p8').crop((400, 190, 880, 705))
            rgb = np.asarray(im).astype(np.float32)
        a = key(rgb, magenta_bg)
        save(rgb, a, os.path.join(ASSETS, vid, 'die.png'), 320)


def boats():
    im = thumb('OVM-2QJ2NFQ')
    for name, box in [('blue', (60, 290, 340, 590)), ('yellow', (340, 290, 630, 590)), ('red', (640, 290, 930, 590)),
                      ('green', (920, 290, 1220, 590))]:
        rgb = np.asarray(im.crop(box)).astype(np.float32)
        a = key(rgb, purple_bg)
        save(rgb, a, os.path.join(ASSETS, 'OVM-2QJ2NFQ', f'boat_{name}.png'), 256)


def torpedo():
    # RnMKtGgKknQ: the flying pawn without the title text above it (the pink trail is see-through glow, keyed away)
    im = thumb('RnMKtGgKknQ').crop((420, 230, 900, 660))
    rgb = np.asarray(im).astype(np.float32)
    a = key(rgb, magenta_bg)
    save(rgb, a, os.path.join(ASSETS, 'RnMKtGgKknQ', 'torpedo_pawn.png'), 320)
    # OWbQgMUwgBQ: the thumbnail's torpedo strip (pawn + two 2-square arrows), opaque rectangle
    im = thumb('OWbQgMUwgBQ')
    rgb = np.asarray(im).astype(np.float32)
    # find the strip: light/green board pixels in the middle band
    band = rgb[250:600]
    light = band[..., 1] > 110  # cream / green / yellow squares; the purple backdrop and magenta frame have little green
    rows = np.where(light.mean(1) > 0.5)[0]
    cols = np.where(light[rows.min():rows.max()].mean(0) > 0.5)[0]
    y0, y1 = 250 + rows.min(), 250 + rows.max() + 1
    x0, x1 = cols.min(), cols.max() + 1
    strip = im.crop((x0, y0, x1, y1)).convert('RGBA')
    strip.save(os.path.join(ASSETS, 'OWbQgMUwgBQ', 'torpedo_pawn.png'), optimize=True)
    print('wrote OWbQ strip', (x0, y0, x1, y1))


def card(vid, out):
    """thumbnail's inner rounded card without the magenta frame (intro overlay)."""
    im = thumb(vid)
    rgb = np.asarray(im).astype(np.float32)
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    frame = (r > 200) & (b > 200) & (g < 80)
    inner = ~frame
    lab, n = ndi.label(inner)
    sizes = ndi.sum(inner, lab, range(1, n + 1))
    fg = lab == 1 + int(np.argmax(sizes))
    fg = ndi.binary_fill_holes(fg)
    a = fg.astype(np.float32)
    a = np.asarray(Image.fromarray((a * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.8))).astype(np.float32) / 255
    a *= fg
    ys, xs = np.where(fg)
    arr = np.dstack([rgb, a[..., None] * 255]).astype(np.uint8)[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    c = Image.fromarray(arr, 'RGBA')
    c = c.resize((640, int(640 * c.size[1] / c.size[0])), Image.LANCZOS)
    c.save(out, optimize=True)
    print('wrote', out, c.size)


def clean_largest(path, purple_holes=False):
    """drop stray fragments (keep the largest opaque component) and optionally key out leftover purple inside it."""
    im = Image.open(path).convert('RGBA')
    arr = np.asarray(im).astype(np.float32)
    a = arr[..., 3]
    m = a > 20
    lab, n = ndi.label(m, structure=np.ones((3, 3)))
    sizes = ndi.sum(m, lab, range(1, n + 1))
    keep = np.isin(lab, 1 + np.where(sizes >= max(sizes.max() * 0.05, 30))[0])  # main art + its outline pieces
    keep = ndi.binary_dilation(keep, iterations=1) & (a > 0)
    a2 = a * keep
    if purple_holes:
        p = purple_bg(arr[..., :3]) & (arr[..., :3].sum(-1) < 400)
        a2[p] = 0
    arr[..., 3] = a2
    Image.fromarray(arr.astype(np.uint8), 'RGBA').save(path, optimize=True)
    print('cleaned', path)


def midas():
    # LiXg0nHrjxg: the thumbnail's Midas glove (thick black outline) pointing at the gold pawn; the old cut had lost
    # the outline and carried stray crop lines. Glove = filled black outline loop.
    im = thumb('LiXg0nHrjxg').crop((622, 170, 870, 394))
    rgb = np.asarray(im).astype(np.float32)
    dark = (rgb.sum(-1) < 240) & ((rgb.max(-1) - rgb.min(-1)) < 40)  # neutral black only (not the gold pawn's brown rim)
    filled = ndi.binary_fill_holes(dark)
    lab, n = ndi.label(filled)
    sizes = ndi.sum(filled, lab, range(1, n + 1))
    fg = lab == 1 + int(np.argmax(sizes))
    a = fg.astype(np.float32)
    a = np.asarray(Image.fromarray((a * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.6))).astype(np.float32) / 255 * fg
    rgb2 = rgb.copy()
    edge = fg & ~ndi.binary_erosion(fg, iterations=2)
    rgb2[edge] = np.minimum(rgb2[edge], 40)  # the outline's own colour on the rim (no purple/white fringe)
    save(rgb2, a, os.path.join(ASSETS, 'LiXg0nHrjxg', 'midas_hand.png'))


if __name__ == '__main__':
    what = sys.argv[1:] or ['dice', 'boats', 'torpedo', 'cards', 'clean', 'midas']
    if 'dice' in what: dice()
    if 'boats' in what: boats()
    if 'torpedo' in what: torpedo()
    if 'cards' in what: card('SJrOiyN2-HA', os.path.join(ASSETS, 'SJrOiyN2-HA', 'intro.png'))
    if 'clean' in what:
        clean_largest(os.path.join(ASSETS, 'X-aULHXsAaI', 'checkered_flag.png'), purple_holes=True)
    if 'midas' in what: midas()
