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


if __name__ == '__main__':
    for k in (sys.argv[1:] or list(JOBS)):
        JOBS[k]()
