#!/usr/bin/env python3
"""art-audit-q4 (2026-11-25 ET): small, deterministic clean-ups of mode art found by the q4 art audit.
Each job rewrites one file under app/assets/modes in place (originals stay in git history).

  python3 tools/art_q4_fix.py [job ...]      (no args = every job; re-running on an already fixed file is a no-op-ish)

Helpers:
  despeckle(path)  near-white / light-grey specks (board grid lines, arrow dots, anti-alias rings of the video's square)
                   that are connected to the outside of the cut-out through transparent or near-white pixels -> transparent;
                   white areas enclosed by the piece outline (king eye holes) are kept. Then drops tiny loose islands.
  strip_cols(path, test)  removes whole edge columns/rows matching a colour test (magenta crop strips) and re-squares by
                   cropping the opposite side, then resizes back to the original size.
  drop_islands(path, min_px)  keeps only alpha components with >= min_px pixels (stray lines / leftover bits).
"""
import os, sys
import numpy as np
from PIL import Image
from scipy import ndimage

M = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'assets', 'modes')


def load(p):
    return np.asarray(Image.open(os.path.join(M, p)).convert('RGBA')).astype(np.int32)


def save(p, a):
    Image.fromarray(np.clip(a, 0, 255).astype(np.uint8), 'RGBA').save(os.path.join(M, p), optimize=True)


def drop_islands_arr(a, min_px):
    lab, n = ndimage.label(a[..., 3] > 0, structure=np.ones((3, 3)))
    if n == 0:
        return a
    sizes = ndimage.sum(np.ones_like(lab), lab, range(1, n + 1))
    keep = np.zeros(n + 1, bool)
    keep[1:] = sizes >= min_px
    a = a.copy()
    a[~keep[lab], 3] = 0
    return a


def despeckle(p, light=165, sat=45, min_px=40):
    a = load(p)
    rgb, al = a[..., :3], a[..., 3]
    nearwhite = (rgb.min(-1) >= light) & ((rgb.max(-1) - rgb.min(-1)) <= sat)
    passable = (al < 40) | nearwhite
    lab, _ = ndimage.label(passable)
    border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    outside = np.isin(lab, list(border))
    kill = outside & nearwhite & (al > 0)
    a = a.copy()
    a[kill, 3] = 0
    a = drop_islands_arr(a, min_px)
    save(p, a)
    return int(kill.sum())


def drop_islands(p, min_px):
    save(p, drop_islands_arr(load(p), min_px))


def strip_edges(p, test):
    """remove right/left/top/bottom edge lines where >=60% of pixels pass test(rgb); re-square + resize back."""
    a = load(p)
    h, w = a.shape[:2]
    t = test(a[..., :3])
    x0, x1, y0, y1 = 0, w, 0, h
    while x1 > x0 and t[:, x1 - 1].mean() > .6: x1 -= 1
    while x0 < x1 and t[:, x0].mean() > .6: x0 += 1
    while y1 > y0 and t[y1 - 1, :].mean() > .6: y1 -= 1
    while y0 < y1 and t[y0, :].mean() > .6: y0 += 1
    # also eat a 1-2 px anti-aliased seam next to the strip
    if x1 < w: x1 -= 2
    if x0 > 0: x0 += 2
    if y1 < h: y1 -= 2
    if y0 > 0: y0 += 2
    cw, ch = x1 - x0, y1 - y0
    if w == h:                       # keep square avatars square: crop the longer side centred
        s = min(cw, ch)
        x0 += (cw - s) // 2; y0 += (ch - s) // 2; cw = ch = s
    im = Image.fromarray(a[y0:y0 + ch, x0:x0 + cw].astype(np.uint8), 'RGBA').resize((w, h), Image.LANCZOS)
    im.save(os.path.join(M, p), optimize=True)
    return (x0, y0, cw, ch)


def magenta(rgb):
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    return (r > 180) & (g < 90) & (b > 150)


JOBS = {}


def job(f):
    JOBS[f.__name__] = f
    return f


@job
def cornered():          # y5MBC8OCYlI: white board-grid / arrow specks around the red and yellow pieces
    for n in ['bishop', 'dknight', 'king', 'knight', 'royal', 'sergeant', 'soldier']:
        for c in 'ry':
            print('y5MBC8OCYlI', n, c, despeckle(f'y5MBC8OCYlI/{n}_{c}.png'))


@job
def viper():             # sEXa38X1bhY: magenta crop strip on the right of the avatar; stray orange line right of the dragon
    print(strip_edges('sEXa38X1bhY/viperking.png', magenta))
    drop_islands('sEXa38X1bhY/dragon_b.png', 200)


@job
def yeti():              # wMdAOirSvQQ: 128px video crop of chess.com's Yeti-BOT with the neighbouring bot's acorn/pawn on the right
    # -> exact chess.com art (api.chess.com/pub/player/yeti-bot avatar, 200x200 transparent,
    # https://images.chesscomfiles.com/uploads/v1/user/405091115.7df3155a.200x200o.b416a2dde195.png, kept in
    # research/frames/sprites_web/chesscom_yeti-bot.png) on the crop's own purple background (median of its purple pixels).
    # Old crop kept in research/frames/sprites_web/video_crops/wMdAOirSvQQ_yeti.png.  Credit: avatar (c) chess.com.
    R = os.path.join(M, '..', '..', '..', 'research', 'frames', 'sprites_web')
    C = np.asarray(Image.open(os.path.join(R, 'video_crops', 'wMdAOirSvQQ_yeti.png')).convert('RGB')).astype(np.int32)
    r, g, b = C[..., 0], C[..., 1], C[..., 2]
    purple = (r > 70) & (b > 70) & (g < 40) & (np.abs(r - b) < 25)
    bg = tuple(int(v) for v in np.median(C[purple], axis=0))
    fig = Image.open(os.path.join(R, 'chesscom_yeti-bot.png')).convert('RGBA')
    out = Image.new('RGBA', fig.size, bg + (255,)); out.alpha_composite(fig)
    out.convert('RGB').save(os.path.join(M, 'wMdAOirSvQQ', 'yeti.png'), optimize=True)
    print('yeti bg', bg, fig.size)


@job
def strips():            # magenta crop strips (Finegold avatar bottom, Chess Cube card bottom); black strip right of Torture Fish;
    # stray 1px line right of the King of the Hill flag
    print(strip_edges('x-ISu_8MDvY/finegold.png', magenta))
    print(strip_edges('qSwTtgUWqUw/cube.png', magenta))
    print(strip_edges('vDzojyJO3sI/torturefish.png', lambda c: c.max(-1) < 30))
    drop_islands('vQ3hLgU6jLA/flag.png', 1000)


@job
def tony():              # xjEz7bCQxho: the avatar crop caught the video UI's white undo arrow and a bracket on its right edge;
    # the portrait sits on a flat dark background, so that strip (x >= 106, y 20..110 of 128) is filled with it.
    a = load('xjEz7bCQxho/tony.png')
    bg = np.median(a[2:20, 2:20, :3].reshape(-1, 3), axis=0).astype(np.int32)
    a = a.copy(); a[20:111, 106:, :3] = bg; a[20:111, 106:, 3] = 255
    save('xjEz7bCQxho/tony.png', a)


def key_bg(rgb, bgfn, size=None, pad=4):
    """flood the background from the crop border over bgfn pixels, keep the biggest foreground blob with its holes
    filled (as tools/art_q2_recut.py), 1px soft edge; trim, centre on a square canvas, optional downscale."""
    from PIL import ImageFilter
    lab, _ = ndimage.label(bgfn(rgb))
    border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    fg = ~np.isin(lab, list(border))
    fl, n = ndimage.label(fg)
    fg = fl == 1 + int(np.argmax(ndimage.sum(fg, fl, range(1, n + 1))))
    fg = ndimage.binary_fill_holes(fg)
    a = np.asarray(Image.fromarray((fg * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.6))).astype(np.float32)
    a = np.where(ndimage.binary_dilation(fg), a, 0)
    ys, xs = np.where(a > 5)
    y0, y1, x0, x1 = max(0, ys.min() - pad), ys.max() + 1 + pad, max(0, xs.min() - pad), xs.max() + 1 + pad
    im = Image.fromarray(np.dstack([rgb, a]).astype(np.uint8)[y0:y1, x0:x1], 'RGBA')
    S = max(im.size); c = Image.new('RGBA', (S, S), (0, 0, 0, 0)); c.paste(im, ((S - im.size[0]) // 2, (S - im.size[1]) // 2))
    if size and S != size: c = c.resize((size, size), Image.LANCZOS)
    return c


def purple_bg(rgb):
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    return ((b - g) > 25) & ((r - g) > 12)


@job
def chaturaji():         # oGP4TUDjSVk + tsqxjK8GP10 (same chess.com Chaturaji boats): the old cuts had see-through holes between
    # the sails/hull (oGP4) and a purple glow left from the thumbnail backdrop (tsqx). Recut from oGP4TUDjSVk's own maxres
    # thumbnail (the four boats side by side, research/frames/video_thumbs/oGP4TUDjSVk_maxres.jpg), keyed on the purple.
    th = Image.open(os.path.join(M, '..', '..', '..', 'research', 'frames', 'video_thumbs', 'oGP4TUDjSVk_maxres.jpg')).convert('RGB')
    boxes = {'u': (60, 290, 340, 590), 'y': (340, 290, 630, 590), 'r': (640, 290, 930, 590), 'g': (920, 290, 1220, 590)}
    for c, box in boxes.items():
        out = key_bg(np.asarray(th.crop(box)).astype(np.float32), purple_bg, 128)
        for vid in ('oGP4TUDjSVk', 'tsqxjK8GP10'):
            out.save(os.path.join(M, vid, f'boat_{c}.png'), optimize=True)


@job
def egg():               # pHItplJMih0: the egg intro overlay was keyed so badly its shell was see-through; recut from the video
    # sprite research/frames/sprites/pHItplJMih0_egg.png (egg on the thumbnail's purple) at 256px.
    sp = Image.open(os.path.join(M, '..', '..', '..', 'research', 'frames', 'sprites', 'pHItplJMih0_egg.png')).convert('RGB')
    key_bg(np.asarray(sp).astype(np.float32), purple_bg, 256).save(os.path.join(M, 'pHItplJMih0', 'egg.png'), optimize=True)


# ---- q4 leftovers (2026-11-25 ~3 PM ET) ------------------------------------------------------------------------
R_ = os.path.join(M, '..', '..', '..', 'research', 'frames')
BOARD = [(240, 216, 180), (181, 135, 99)]          # chess.com brown board as in the videos' maxres thumbnails


def near(rgb, cols, tol):
    rgb = np.asarray(rgb, np.float32)
    return np.min([np.sqrt(((rgb - np.array(c, np.float32)) ** 2).sum(-1)) for c in cols], axis=0) < tol


def cutout(rgb, bgmask, seed=None, size=None, pad=3, fill=True, soft=0.7, direct=False):
    """bg = bgmask pixels connected to the crop border; fg = the component containing seed (else the biggest),
    holes filled; soft 1px edge; trimmed + centred on a transparent square; optional resize."""
    from PIL import ImageFilter
    lab, _ = ndimage.label(bgmask)
    border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    fg = ~bgmask if direct else ~np.isin(lab, list(border))
    fl, n = ndimage.label(fg)
    k = fl[seed[1], seed[0]] if seed else 1 + int(np.argmax(ndimage.sum(fg, fl, range(1, n + 1))))
    fg = fl == k
    if fill: fg = ndimage.binary_fill_holes(fg)
    a = np.asarray(Image.fromarray((fg * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(soft))).astype(np.float32)
    a = np.where(ndimage.binary_dilation(fg), a, 0)
    ys, xs = np.where(a > 5)
    y0, y1, x0, x1 = max(0, ys.min() - pad), ys.max() + 1 + pad, max(0, xs.min() - pad), xs.max() + 1 + pad
    im = Image.fromarray(np.dstack([np.asarray(rgb)[..., :3], a]).astype(np.uint8)[y0:y1, x0:x1], 'RGBA')
    S = max(im.size); c = Image.new('RGBA', (S, S), (0, 0, 0, 0)); c.paste(im, ((S - im.size[0]) // 2, (S - im.size[1]) // 2))
    if size and S != size: c = c.resize((size, size), Image.LANCZOS)
    return c


def thumb(vid, name='maxresdefault'):
    p = os.path.join(R_, 'video_thumbs', f'{vid}_{name}.jpg')
    return Image.open(p).convert('RGB')


@job
def board_pieces():      # uncut square backgrounds: the video's brown/cream board squares were baked into these on-board pieces
    # shadow (mymJwfSPeFA): the 128 on-board sprite keyed (the maxres version overlaps a pawn)
    sp = np.asarray(Image.open(os.path.join(R_, 'sprites', 'mymJwfSPeFA_shadow_entity_piece.png')).convert('RGB')).astype(np.float32)
    a = np.asarray(cutout(sp, near(sp, BOARD, 60))).astype(np.float32)
    warm = (a[..., 0] - a[..., 2]) * (a[..., :3].mean(-1) > 45)        # brown board fringe around the black silhouette
    a[..., 3] *= np.clip(1 - (warm - 10) / 20, 0, 1)
    Image.fromarray(a.astype(np.uint8), 'RGBA').resize((128, 128), Image.LANCZOS).save(os.path.join(M, 'mymJwfSPeFA', 'shadow.png'), optimize=True)
    # scp939 (s2WDIfvefEk) + mal0 (vPEVQgvjoL4): cut from the video's own maxres thumbnail (same art at 1280x720,
    # research/frames/video_thumbs/<id>_maxresdefault.jpg), board squares keyed out
    th = np.asarray(thumb('s2WDIfvefEk').crop((700, 820 - 720, 1280, 720)).convert('RGB')).astype(np.float32)
    cutout(th, near(th, BOARD, 55), size=256).save(os.path.join(M, 's2WDIfvefEk', 'scp939.png'), optimize=True)
    # mal0 is a greyscale photo: the board shows through gaps in its hair, so key by colour (board = warm tan, r-b > ~30)
    th = np.asarray(thumb('vPEVQgvjoL4').crop((640, 0, 1280, 720))).astype(np.float32)
    c = cutout(th, near(th, BOARD, 45), size=None, fill=True)
    a = np.asarray(c).astype(np.float32)
    warm = a[..., 0] - a[..., 2]
    a[..., 3] *= np.clip(1 - (warm - 14) / 26, 0, 1)
    a = drop_islands_arr(a.astype(np.int32), 60)
    Image.fromarray(a.astype(np.uint8), 'RGBA').resize((256, 256), Image.LANCZOS).save(os.path.join(M, 'vPEVQgvjoL4', 'mal0.png'), optimize=True)
    # lapis token (sPNWgAzFzxM): the dark board square + its orange JPEG fringe keyed out, the blue gem kept
    sp = np.asarray(Image.open(os.path.join(R_, 'sprites', 'sPNWgAzFzxM_diamond_token.png')).convert('RGB')).astype(np.float32)
    r, g, b = sp[..., 0], sp[..., 1], sp[..., 2]
    cutout(sp, (b - r) < 15, size=128, soft=0.9).save(os.path.join(M, 'sPNWgAzFzxM', 'lapis.png'), optimize=True)
    # orange breeding knight (rsI_92dNd9M): cream square keyed out of the existing 256 cut
    a = np.asarray(Image.open(os.path.join(M, 'rsI_92dNd9M', 'horse.png')).convert('RGBA')).astype(np.float32)
    bgm = (a[..., 3] < 40) | near(a[..., :3], BOARD, 45)
    cutout(a[..., :3], bgm, size=256).save(os.path.join(M, 'rsI_92dNd9M', 'horse.png'), optimize=True)


@job
def crater():
    from PIL import ImageFilter            # w15Ev7q2HmI: the crater sprite (thumbnail) sits on a light-green square and has a white pawn standing in it;
    # the app draws it as an overlay on the (lavender) square a piece blew up on, usually empty -> green keyed out, the pawn
    # (white body + its black outline) filled from the surrounding crater pixels by diffusion (inferred fill, not in the video).
    sp = np.asarray(Image.open(os.path.join(R_, 'sprites', 'w15Ev7q2HmI_crater.png')).convert('RGB')).astype(np.float32)
    r, g, b = sp[..., 0], sp[..., 1], sp[..., 2]
    green = (g - r > 12) & (g - b > 8) & (g > 150)
    pawn = (sp.min(-1) > 150) & ~green
    pl, n = ndimage.label(pawn)
    pawn = pl == 1 + int(np.argmax(ndimage.sum(pawn, pl, range(1, n + 1))))
    pawn = ndimage.binary_dilation(ndimage.binary_fill_holes(pawn), iterations=4)   # + its dark outline
    crat = ~green & ~pawn
    cl, n = ndimage.label(crat)
    crat = cl == 1 + int(np.argmax(ndimage.sum(crat, cl, range(1, n + 1))))
    # crater footprint: axis-aligned ellipse fitted to the crater's outer edge (pixels next to the green), so the ring
    # closes under where the pawn's base was; pawn pixels inside it are filled by copying the crater at the same
    # normalised radius from a rotated angle (keeps the olive rim / orange ring / dark pit), then softened.
    edge = crat & ndimage.binary_dilation(green, iterations=2)
    ys, xs = np.nonzero(edge)
    A_ = np.c_[xs ** 2, ys ** 2, xs, ys]; sol = np.linalg.lstsq(A_, np.ones(len(xs)), rcond=None)[0]
    a1, b1, c1, d1 = sol; cx, cy = -c1 / (2 * a1), -d1 / (2 * b1); k = 1 + c1 ** 2 / (4 * a1) + d1 ** 2 / (4 * b1)
    rx, ry = np.sqrt(k / a1), np.sqrt(k / b1)
    H, W = crat.shape; yy, xx = np.mgrid[0:H, 0:W]
    rho = np.sqrt(((xx - cx) / rx) ** 2 + ((yy - cy) / ry) ** 2); th_ = np.arctan2(yy - cy, xx - cx)
    foot = (rho <= 1.0) & ~green | crat
    out = sp.copy(); hole = foot & ~crat
    pit = np.median(sp[crat & (rho < 0.55)], axis=0)            # the dark pit colour, for the centre no rotation reaches
    out[hole] = pit
    angs = [s_ * k * np.pi / 12 for k in range(2, 13) for s_ in (1, -1)]
    for (y, x) in zip(*np.nonzero(hole)):
        for d in angs:
            t = th_[y, x] + d
            sx = int(round(cx + rho[y, x] * rx * np.cos(t))); sy = int(round(cy + rho[y, x] * ry * np.sin(t)))
            if 0 <= sx < W and 0 <= sy < H and crat[sy, sx]:
                out[y, x] = sp[sy, sx]; break
    bl = np.asarray(Image.fromarray(out.astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2))).astype(np.float32)
    out[hole] = bl[hole]
    from PIL import ImageFilter
    al = np.asarray(Image.fromarray((foot * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.8))).astype(np.float32)
    al = np.where(ndimage.binary_dilation(foot), al, 0)
    Image.fromarray(np.dstack([out, al]).astype(np.uint8), 'RGBA').save(os.path.join(M, 'w15Ev7q2HmI', 'crater.png'), optimize=True)


@job
def golem_avatar():      # zP9TzlgA-W0 opponent avatar: the 64px crop carried the board squares, red attack notches and a spike;
    # recut the goblin token from research/frames/video_thumbs/zP9TzlgA-W0_maxres2.jpg, keyed inside its dark outline.
    th = np.asarray(thumb('zP9TzlgA-W0', 'maxres2').crop((505, 130, 625, 245))).astype(np.float32)
    r, g, b = th[..., 0], th[..., 1], th[..., 2]; lum = th.mean(-1)
    face = (r - g > 35) & (r > 150) & (g > 85)                 # pink skin (not the red attack notches)
    outl = (r > b - 8) & (lum < 100) & (r - g > 12)            # dark plum outline (navy squares have b >> r)
    m = ndimage.binary_closing(face | outl, np.ones((3, 3)), iterations=2)
    m[:, 101:] = False                                         # right pink square touches the ear tip
    l, n = ndimage.label(m); m = l == 1 + int(np.argmax(ndimage.sum(m, l, range(1, n + 1))))
    fg = ndimage.binary_dilation(ndimage.binary_fill_holes(m))
    c = cutout(th, ~fg, size=128, pad=4, soft=0.6)
    c.save(os.path.join(M, 'zP9TzlgA-W0', 'skull_enemy.png'), optimize=True)

@job
def specks():            # light/dark specks and stray lines around four sprites
    # Chaturanga chariot/elephant (o5yiE_GHcrQ): white anti-alias specks of the video's square around the black outline
    for n in ('chariot', 'elephant'):
        print('o5yiE_GHcrQ', n, despeckle(f'o5yiE_GHcrQ/{n}.png', light=150, sat=60, min_px=30))
    # Table Tactics purple slime (xvlHij1tgk8): red specks of the board's red ring + the red ball's edge, olive grass bits
    a = load('xvlHij1tgk8/slime.png')
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    red = (r - g > 60) & (b < 110) & ~((g > 120) & (r > 170))          # keep the yellow-orange antenna bulbs
    grass = (g >= r) & (g > b + 15)
    a = a.copy(); a[red | grass, 3] = 0
    a = drop_islands_arr(a, 25)
    lab, n = ndimage.label(a[..., 3] > 40, structure=np.ones((3, 3)))   # keep the body and the blobs touching it (bulbs)
    sizes = ndimage.sum(np.ones_like(lab), lab, range(1, n + 1)); big = 1 + int(np.argmax(sizes))
    near_body = ndimage.binary_dilation(lab == big, iterations=3)
    keep = np.zeros(n + 1, bool); keep[0] = False
    for k in range(1, n + 1):
        keep[k] = k == big or (near_body & (lab == k)).any() and sizes[k - 1] >= 25
    a[(lab > 0) & ~keep[lab], 3] = 0
    a[(lab == 0) & (a[..., 3] <= 40), 3] = 0
    save('xvlHij1tgk8/slime.png', a)


@job
def survivors():         # spJibM5qaNQ: joker had beige/red tile bits + a stray UI line; peg had dark specks under it.
    # Recut both from research/frames/video_thumbs/spJibM5qaNQ_maxres3.jpg (same boxes as tools/g6_art_pass2.py).
    im = thumb('spJibM5qaNQ', 'maxres3')
    j = np.asarray(im.crop((596, 446, 684, 550))).astype(np.float32)
    bgc = [(196, 184, 170), (158, 88, 95), (120, 160, 110)]           # beige tile, red tile, the green grid line
    bgm = near(j, bgc, 34) & ~(j.min(-1) > 215)
    out = cutout(j, bgm, size=None, pad=3, soft=0.01)
    o = np.asarray(out).copy(); fg = o[..., 3] > 0                       # drop 1px stray lines (art pixels are ~3px)
    o[fg & ~ndimage.binary_dilation(ndimage.binary_opening(fg, np.ones((3, 3)))), 3] = 0
    out = Image.fromarray(o, 'RGBA')
    out = out.resize((128, 128), Image.NEAREST)
    out.save(os.path.join(M, 'spJibM5qaNQ', 'joker.png'), optimize=True)
    p = np.asarray(im.crop((940, 482, 1028, 520))).astype(np.float32)
    lum = p.mean(-1)
    pm = lum > 150
    l, n = ndimage.label(pm, structure=np.ones((3, 3))); pm = l == 1 + int(np.argmax(ndimage.sum(pm, l, range(1, n + 1))))
    pm = ndimage.binary_fill_holes(pm)
    al = np.clip((lum - 120) / 50, 0, 1) * ndimage.binary_dilation(pm) * 255
    ys, xs = np.nonzero(al > 10); pc = np.dstack([p, al])[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    pi = Image.fromarray(pc.astype(np.uint8), 'RGBA'); S = max(pi.size)
    c = Image.new('RGBA', (S, S)); c.paste(pi, (0, (S - pi.size[1]) // 2))
    c.resize((128, 128), Image.LANCZOS).save(os.path.join(M, 'spJibM5qaNQ', 'peg.png'), optimize=True)


@job
def sword_king():        # rx-HCGCNuDo: 12 loose 1-18px specks around the crown (the motion-blur lines stay: they are the art)
    drop_islands('rx-HCGCNuDo/sword_king.png', 30)

@job
def shotgun_king():      # pzxXxIsKRRo player avatar: the old key left the thumbnail's checker squares in patches through the figure.
    # Recut from research/frames/sprites/pzxXxIsKRRo_shotgun_king.png (the thumbnail illustration): navy figure + shotgun,
    # holes filled, plus its white sticker outline (not under the title text at the top).
    a = np.asarray(Image.open(os.path.join(R_, 'sprites', 'pzxXxIsKRRo_shotgun_king.png')).convert('RGB')).astype(np.float32)
    r, b = a[..., 0], a[..., 2]
    m = ndimage.binary_closing((r < 45) & (b > r + 30), np.ones((3, 3)), iterations=3)
    l, n = ndimage.label(m); m = l == 1 + int(np.argmax(ndimage.sum(m, l, range(1, n + 1))))
    ring = ndimage.binary_dilation(m, iterations=8) & (a.min(-1) > 200); ring[:62] = False
    g_ = a[..., 1]
    checker = ((b > r + 10) & (r > 40)) | ((r > b + 25) & (r > 110) & (r < 185) & (g_ < 160))   # lavender / beige squares
    base = m | ring
    holes = ndimage.binary_fill_holes(base) & ~base
    hl, n = ndimage.label(holes)
    frac = ndimage.mean(checker, hl, range(1, n + 1))
    fg = base | np.isin(hl, 1 + np.nonzero(frac < 0.25)[0])      # fill holes that are figure (face, gun), not the checker gaps
    cutout(a, ~fg, size=256, pad=4, soft=0.8, fill=False, direct=True).save(os.path.join(M, 'pzxXxIsKRRo', 'shotgun_king.png'), optimize=True)
    drop_islands('pzxXxIsKRRo/shotgun_king.png', 40)


@job
def three_plus():        # qTXES0F1MVQ: the old key dropped the teal fill and kept only the outline; recut from
    # research/frames/sprites/qTXES0F1MVQ_3plus_icon.png, magenta backdrop keyed out, both glyphs ("3" and "+") kept.
    a = np.asarray(Image.open(os.path.join(R_, 'sprites', 'qTXES0F1MVQ_3plus_icon.png')).convert('RGB')).astype(np.float32)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    teal = (g > r + 25) | ((b > r + 25) & (g > 60) & (g > b - 40))
    teal = ndimage.binary_opening(teal, np.ones((3, 3)))
    l, n = ndimage.label(teal); sizes = ndimage.sum(teal, l, range(1, n + 1))
    fg = np.isin(l, 1 + np.nonzero(sizes > 0.02 * sizes.max())[0])
    fg = ndimage.binary_fill_holes(fg)
    from PIL import ImageFilter
    al = np.asarray(Image.fromarray((fg * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.0))).astype(np.float32)
    al = np.where(ndimage.binary_dilation(fg), al, 0)
    ys, xs = np.nonzero(al > 5); y0, y1, x0, x1 = ys.min() - 6, ys.max() + 7, xs.min() - 6, xs.max() + 7
    im = Image.fromarray(np.dstack([a, al]).astype(np.uint8)[max(0, y0):y1, max(0, x0):x1], 'RGBA')
    S = max(im.size); c = Image.new('RGBA', (S, S)); c.paste(im, ((S - im.size[0]) // 2, (S - im.size[1]) // 2))
    c.resize((128, 128), Image.LANCZOS).save(os.path.join(M, 'qTXES0F1MVQ', 'three_plus.png'), optimize=True)


@job
def ambush_gaps():       # pGVRaaLnMAY: the soldier/sergeant cuts had see-through horizontal gaps between head / collar / body and a
    # ragged fringe; in the video (research/frames/sprites/pGVRaaLnMAY_ambush_pawn*.png, piece on the flat (46,47,42) panel)
    # those gaps are the piece's near-black outline lines. Recut: only the panel colour is keyed (flood from the border), so the
    # outline + gap lines stay; black pieces use the same dark recolour as tools/g6_sprites.py (dark=True).
    for src, n in (('pGVRaaLnMAY_ambush_pawn.png', 'soldier'), ('pGVRaaLnMAY_ambush_pawn_spiked.png', 'sergeant')):
        sp = np.asarray(Image.open(os.path.join(R_, 'sprites', src)).convert('RGB')).astype(np.float32)
        c = np.asarray(cutout(sp, near(sp, [(46, 47, 42)], 22), pad=2, soft=0.5)).astype(np.int32).copy()
        on = c[..., 3] > 100                                    # gap lines lighter than the tolerance: close them vertically
        gap = ndimage.binary_closing(on, structure=np.ones((11, 1)), border_value=0) & ~on
        c[gap, :3] = 22; c[gap, 3] = 255
        c = Image.fromarray(c.astype(np.uint8), 'RGBA')
        c = c.resize((128, 128), Image.LANCZOS) if c.size[0] != 128 else c
        c.save(os.path.join(M, 'pGVRaaLnMAY', f'{n}_w.png'), optimize=True)
        a = np.asarray(c).astype(np.float32).copy()
        a[..., 0] = a[..., 0] * 0.22 + 20; a[..., 1] = a[..., 1] * 0.22 + 20; a[..., 2] = a[..., 2] * 0.22 + 24
        save(f'pGVRaaLnMAY/{n}_b.png', a.astype(np.int32))

@job
def klub4konej():        # piiE6JB8pWw opp1 (Klub4Konej, owl): the 96px frame crop (maxres2) was blurry with a dark crop strip on top.
    # Swapped for the exact chess.com avatar (same owl drawing): api.chess.com/pub/player/klub4konej ->
    # https://images.chesscomfiles.com/uploads/v1/user/332003097.a562041e.200x200o.07e91296c402.jpg (200x200, fetched with a
    # browser User-Agent + chess.com Referer), kept in research/frames/sprites_web/chesscom_klub4konej.png. Avatar (c) its owner / chess.com.
    Image.open(os.path.join(R_, 'sprites_web', 'chesscom_klub4konej.png')).convert('RGB').save(
        os.path.join(M, 'piiE6JB8pWw', 'opp1.png'), optimize=True)


@job
def zach():              # vwJw6aaggn8 Zach: the 160px video crop was an upscale with chess-board squares on its left.
    # -> exact chess.com art: api.chess.com/pub/player/zach-bot avatar
    # https://images.chesscomfiles.com/uploads/v1/user/560979413.a48f5f20.200x200o.eefb10043bdc.png (180x180, transparent),
    # kept in research/frames/sprites_web/chesscom_zach-bot.png, on the crop's own purple (median of its purple pixels), like yeti().
    # Old crop: research/frames/sprites_web/video_crops/vwJw6aaggn8_zach.png. Credit: avatar (c) chess.com.
    W = os.path.join(R_, 'sprites_web')
    C = np.asarray(Image.open(os.path.join(W, 'video_crops', 'vwJw6aaggn8_zach.png')).convert('RGB')).astype(np.int32)
    r, g, b = C[..., 0], C[..., 1], C[..., 2]
    purple = (b > 90) & (r > 60) & (g < 40) & (b > g + 60)
    bg = tuple(int(v) for v in np.median(C[purple], axis=0))
    fig = Image.open(os.path.join(W, 'chesscom_zach-bot.png')).convert('RGBA')
    out = Image.new('RGBA', fig.size, bg + (255,)); out.alpha_composite(fig)
    out.convert('RGB').save(os.path.join(M, 'vwJw6aaggn8', 'zach.png'), optimize=True)
    print('zach bg', bg, int(purple.sum()))


@job
def cat_knight_av():     # xvlHij1tgk8 player avatar: black crop strip along the top edge
    print(strip_edges('xvlHij1tgk8/cat_knight_av.png', lambda c: c.max(-1) < 30))


if __name__ == '__main__':
    for k in (sys.argv[1:] or list(JOBS)):
        JOBS[k]()
