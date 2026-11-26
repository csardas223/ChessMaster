#!/usr/bin/env python3
"""art-g6b (2026-11-25): Gambonanza (qqvbb2r2k5I) pixel-art piece set cut from paused 1080p full-screen youtube.com frames
committed as research/frames/video_thumbs/qqvbb2r2k5I_frame_<s>.jpg (1920x1440 page, video at y 180..1260):
  42   = 0:42 stage 1 in play (5x5 board): white rook, white king, black pawn
  539  = 8:59 Judit boss: skull king (a DARK king with a red skull badge), black bishop
  1317 = 21:57 Mech Magnus: black rook, skull knight (dark knight + skull badge), white queen
  1193 = 19:53 stage 2: the purple-haired copycat (Cp)
Method: crop the box, flood-key every border-connected pixel that is brighter than the pieces' closed near-black outline
(board cream ~#f0dcb4 / maroon ~#8b4a55 with CRT scanlines), keep the largest component (plus the skull badge for the skull
pieces), pad square and NEAREST-scale so it stays pixel art.
INFERRED (no frame shows them): black Queen = the white queen recoloured to the dark palette; white Pawn / Knight / Bishop =
the black cuts recoloured to the pale palette (luminance-quantile palette swap between the white king and the black pawn);
plain black King = the skull king cut without its badge.
Also writes board.json with the board colours sampled from frame 42.
Run from rebuild/app: python3 tools/g6b_gb_art.py     Credit: art (c) Gambonanza / iwantcheckmate."""
import os, json
import numpy as np
from PIL import Image
from scipy import ndimage

HERE = os.path.dirname(os.path.abspath(__file__))
THUMBS = os.path.join(HERE, '..', '..', 'research', 'frames', 'video_thumbs')
OUT = os.path.join(HERE, '..', 'assets', 'modes', 'qqvbb2r2k5I')
VID = 'qqvbb2r2k5I'
SIZE = 160

def frame(t): return Image.open(os.path.join(THUMBS, '%s_frame_%s.jpg' % (VID, t))).convert('RGB')

# name: (frame seconds, crop box in the 1920x1440 page, keep skull badge, outline gap closing px)
CUTS = {
    'wR': (42, (1128, 530, 1220, 640), False, 0),
    'wK': (42, (688, 758, 792, 860), False, 0),
    'bP': (42, (690, 652, 790, 758), False, 0),
    'wB': (539, (95, 460, 160, 575), False, 1),      # white bishop in the left stock bar (smaller scale)
    'bR': (1317, (805, 575, 875, 662), False, 0),
    'Sn': (1317, (875, 625, 960, 750), True, 0),
    'wQ': (1317, (1045, 660, 1135, 745), False, 0),
    'Cp': (1193, (755, 520, 880, 640), False, 0),
}
BN = (225, (906, 418, 1010, 534))      # black knight on a hatched formation tile (3:45): cut by its pink body (key_body)
SKULL = (1317, (874, 629, 921, 667))   # the red skull badge (crispest on the 21:57 skull knight)
THR = 62

def key(im, keep_badge, close=0):
    """the pieces have a closed near-black outline: fill the holes of the dark mask (= outline + everything it encloses),
    open away thin bits (scanlines, hatching, shadow fringes), keep the largest blob (+ the red skull badge if asked)"""
    a = np.asarray(im).astype(int); lum = (a[..., 0] * 299 + a[..., 1] * 587 + a[..., 2] * 114) // 1000
    redish = (a[..., 0] > 150) & (a[..., 1] < 90) & (a[..., 2] < 100)
    dark = lum < THR
    if close: dark = ndimage.binary_closing(dark, iterations=close)
    solid = ndimage.binary_fill_holes(dark)
    solid = ndimage.binary_opening(solid, iterations=2)
    lab, n = ndimage.label(solid)
    if n == 0: raise SystemExit('nothing cut')
    sizes = ndimage.sum(solid, lab, range(1, n + 1)); big = 1 + int(np.argmax(sizes))
    keep = lab == big
    if keep_badge:
        for k in range(1, n + 1):
            m = lab == k
            if k != big and redish[m].mean() > 0.2: keep |= m
    else:
        keep &= ~ndimage.binary_dilation(redish, iterations=1)
    keep = ndimage.binary_fill_holes(keep)
    out = np.dstack([a.astype('uint8'), (keep * 255).astype('uint8')])
    o = Image.fromarray(out, 'RGBA'); return o.crop(o.getbbox())

def key_body(im):
    """for a piece on a dark / hatched background: the pink body blob, its holes filled, plus the dark outline ring"""
    a = np.asarray(im).astype(int); lum = (a[..., 0] * 299 + a[..., 1] * 587 + a[..., 2] * 114) // 1000
    pink = (a[..., 0] > 80) & (a[..., 0] > a[..., 1] + 15) & (a[..., 0] > a[..., 2] + 5)
    pink = ndimage.binary_opening(pink, iterations=1)
    lab, n = ndimage.label(pink); sizes = ndimage.sum(pink, lab, range(1, n + 1))
    bodym = ndimage.binary_fill_holes(lab == 1 + int(np.argmax(sizes)))
    ring = ndimage.binary_dilation(bodym, iterations=6) & (lum < THR)
    keep = ndimage.binary_fill_holes(bodym | ring)
    keep = ndimage.binary_opening(keep, iterations=2)
    out = np.dstack([a.astype('uint8'), (keep * 255).astype('uint8')])
    o = Image.fromarray(out, 'RGBA'); return o.crop(o.getbbox())

def skull(im):
    a = np.asarray(im).astype(int); lum = a[..., :3].mean(2)
    red = (a[..., 0] > 140) & (a[..., 0] > a[..., 1] + 70) & (a[..., 0] > a[..., 2] + 60)
    lab, n = ndimage.label(red); sizes = ndimage.sum(red, lab, range(1, n + 1))
    from scipy.spatial import ConvexHull
    from PIL import ImageDraw
    ys, xs = np.nonzero(lab == 1 + int(np.argmax(sizes))); pts = np.c_[xs, ys]; hull = pts[ConvexHull(pts).vertices]
    hm = Image.new('L', (a.shape[1], a.shape[0]), 0); ImageDraw.Draw(hm).polygon([tuple(map(int, q)) for q in hull], fill=1)
    m = np.asarray(hm).astype(bool)   # the skull is round: its convex hull keeps the dark eyes / mouth inside
    m = m | (ndimage.binary_dilation(m, iterations=3) & (lum < 70))
    out = np.dstack([a.astype('uint8'), (m * 255).astype('uint8')])
    o = Image.fromarray(out, 'RGBA'); return o.crop(o.getbbox())

def with_badge(piece, badge):
    """inferred composite: the badge sits on the piece's top-left like the 8:59 skull king"""
    w, h = piece.size; bw, bh = badge.size; sc = (w * 0.42) / bw
    badge = badge.resize((max(1, round(bw * sc)), max(1, round(bh * sc))), Image.NEAREST)
    top = int(badge.height * 0.55)
    c = Image.new('RGBA', (w, h + top), (0, 0, 0, 0)); c.paste(piece, (0, top), piece); c.paste(badge, (0, 0), badge); return c

def square(im):
    w, h = im.size; s = int(max(w, h) * 1.08)
    c = Image.new('RGBA', (s, s), (0, 0, 0, 0)); c.paste(im, ((s - w) // 2, s - h - max(1, s // 40)), im)
    return c.resize((SIZE, SIZE), Image.NEAREST)

def body(im):
    a = np.asarray(im).astype(float); m = a[..., 3] > 0
    lum = a[..., :3].mean(2); return a, m, lum

def recolour(src, ref):
    """luminance-quantile palette swap: every opaque pixel of src brighter than the outline takes the colour found at the
    same luminance quantile among ref's opaque non-outline pixels (outline stays near-black)"""
    a, m, lum = body(src); r, rm, rl = body(ref)
    sm = m & (lum > THR); rmask = rm & (rl > THR)
    rc = r[..., :3][rmask]; order = np.argsort(rl[rmask]); rc = rc[order]
    sv = lum[sm]; q = (np.argsort(np.argsort(sv)) / max(1, len(sv) - 1))
    idx = np.clip((q * (len(rc) - 1)).round().astype(int), 0, len(rc) - 1)
    out = a.copy(); out[..., :3][sm] = rc[idx]
    return Image.fromarray(out.astype('uint8'), 'RGBA')

def main():
    os.makedirs(OUT, exist_ok=True)
    pcs = {k: key(frame(t).crop(b), kb, c) for k, (t, b, kb, c) in CUTS.items()}
    pcs['bN'] = key_body(frame(BN[0]).crop(BN[1]))
    pale, dark = pcs['wK'], pcs['bP']
    pcs['bK'] = recolour(pcs['wK'], dark)                            # inferred (the 8:59 skull king is faded / overlapped)
    pcs['Sk'] = with_badge(pcs['bK'], skull(frame(SKULL[0]).crop(SKULL[1])))   # inferred composite, badge from the frame
    pcs['bQ'] = recolour(pcs['wQ'], dark)                            # inferred
    pcs['bB'] = recolour(pcs['wB'], dark)                            # inferred (the 8:59 black bishop is behind the king)
    pcs['wP'] = recolour(pcs['bP'], pale)                            # inferred
    pcs['wN'] = recolour(pcs['bN'], pale)                            # inferred
    for k, im in pcs.items():
        square(im).save(os.path.join(OUT, k + '.png'), optimize=True); print(k, im.size)
    f = np.asarray(frame(42)).astype(int)
    # stage-1 board (frame 42): a light and a dark cell well away from any piece; median over the cell (scanlines averaged)
    light = np.median(f[460:540, 700:780].reshape(-1, 3), 0).astype(int)
    darkc = np.median(f[460:540, 810:890].reshape(-1, 3), 0).astype(int)
    hx = lambda c: '#%02x%02x%02x' % tuple(int(v) for v in c)
    json.dump({'light': hx(light), 'dark': hx(darkc), 'frame': 42}, open(os.path.join(OUT, 'board.json'), 'w'))
    print('board', hx(light), hx(darkc))

if __name__ == '__main__':
    main()
