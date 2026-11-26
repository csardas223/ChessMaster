#!/usr/bin/env python3
"""g4 art pass 6 (2026-11-25, art-g4b): Chess Arena (CONozr99agQ) piece models + end-of-match stats screen.

Frames (owner-approved, one browser task per frame, paused full-screen 1080p, committed as 1920x1080 jpgs):
  research/frames/video_thumbs/CONozr99agQ_frame_703.jpg   11:43 champion-select preview board (Base Purple skin)
  research/frames/video_thumbs/CONozr99agQ_frame_352.jpg   5:52 in game: brown guardian knight + king
  research/frames/video_thumbs/CONozr99agQ_frame_529.jpg   8:49 in game: brown guardian pawns + rook (pit)
  research/frames/video_thumbs/CONozr99agQ_frame_1400.jpg  23:20 Battle Royale RESULTS / VICTORY screen
Output: app/assets/modes/CONozr99agQ/pieces/{w,b,n}{K,Q,R,B,N,P}.png (128x128, transparent), victory.png, plate.png.
  w = your army (Base Purple models cut from the 11:43 preview; knight/queen bases hidden behind the king/rook there are the
      pawn's/rook's base, same model base: inferred)
  n = guardians (brown wood set seen in the pits: P R N K cut from the frames; B Q recoloured from the purple models to
      the brown palette of the cut pieces: inferred)
  b = rival players (their skins are other players' choices; the purple models with hue turned to green/gold like the
      rival king glimpsed at 20:30: inferred)
Needs: pip install rembg onnxruntime numpy scipy (u2netp model). Run from rebuild/app: python3 tools/g4_art6.py
"""
import os, colorsys
import numpy as np
from PIL import Image, ImageFilter
from rembg import remove, new_session
from scipy import ndimage

T = 'research/frames/video_thumbs/CONozr99agQ_frame_%d.jpg'
OUT = 'assets/modes/CONozr99agQ'
SESS = new_session('u2netp')
WMAX = {'P': 66, 'N': 76}


def frame(s):
    """committed frames are the 1920x1440 screenshot cropped to y 180..1260; coordinates below are screenshot coords."""
    im = Image.open(T % s).convert('RGB'); c = Image.new('RGB', (1920, 1440)); c.paste(im, (0, 180)); return c


def largest(m):
    m = ndimage.binary_opening(m, iterations=2)
    lab, n = ndimage.label(m)
    if n > 1: m = lab == (np.argmax(ndimage.sum(m, lab, range(1, n + 1))) + 1)
    return ndimage.binary_fill_holes(m)


def place(im, t):
    im = im.crop(im.getbbox()); w, h = im.size; s = min(WMAX.get(t, 82) / w, 124 / h)
    im = im.resize((max(1, round(w * s)), max(1, round(h * s))), Image.LANCZOS); w, h = im.size
    o = Image.new('RGBA', (128, 128), (0, 0, 0, 0)); o.alpha_composite(im, ((128 - w) // 2, 128 - h - 4)); return o


def cut(f, box, K=4):
    big = f.crop(box).resize(((box[2] - box[0]) * K, (box[3] - box[1]) * K), Image.LANCZOS)
    m = largest(np.array(remove(big, session=SESS).convert('RGBA'))[:, :, 3] > 110)
    a = np.array(big.convert('RGBA')); a[:, :, 3] = np.where(m, 255, 0); return Image.fromarray(a)


def purple():
    f = frame(703); X0, Y0, X1, Y1, K = 1400, 270, 1800, 600, 3
    big = f.crop((X0, Y0, X1, Y1)).resize(((X1 - X0) * K, (Y1 - Y0) * K), Image.LANCZOS)
    al = np.array(remove(big, session=SESS).convert('RGBA'))[:, :, 3] > 110; rgb = np.array(big.convert('RGBA'))
    def piece(box, keep=None):
        x0, y0, x1, y1 = [(v - o) * K for v, o in zip(box, (X0, Y0, X0, Y0))]
        m = np.zeros_like(al); m[y0:y1, x0:x1] = al[y0:y1, x0:x1]
        if keep is not None:
            yy, xx = np.mgrid[0:al.shape[0], 0:al.shape[1]]; m &= keep(xx / K + X0, yy / K + Y0)
        m = largest(m); a = rgb.copy(); a[:, :, 3] = np.where(m, 255, 0); im = Image.fromarray(a); return im.crop(im.getbbox())
    Kp = piece((1428, 326, 1522, 507), lambda x, y: ~(((x > 1482) & (y < 372)) | ((x > 1496) & (y < 455))))
    Pp = piece((1590, 284, 1665, 386)); Bp = piece((1532, 401, 1638, 588)); Rp = piece((1682, 393, 1775, 538))
    Qt = piece((1688, 296, 1765, 396)); Nt = piece((1476, 296, 1557, 370), lambda x, y: ~((x < 1503) & (y > 326)))
    def stack(top, src, frac):
        base = src.crop((0, int(src.size[1] * frac), src.size[0], src.size[1])); s = top.size[0] * 1.05 / base.size[0]
        base = base.resize((max(1, int(base.size[0] * s)), max(1, int(base.size[1] * s))), Image.LANCZOS)
        W = max(top.size[0], base.size[0]); ov = int(base.size[1] * 0.18)
        c = Image.new('RGBA', (W, top.size[1] + base.size[1] - ov), (0, 0, 0, 0))
        c.alpha_composite(base, ((W - base.size[0]) // 2, top.size[1] - ov)); c.alpha_composite(top, ((W - top.size[0]) // 2, 0)); return c
    return {'K': Kp, 'Q': stack(Qt, Rp, 0.62), 'R': Rp, 'B': Bp, 'N': stack(Nt, Pp, 0.55), 'P': Pp}


def hue(im, dh):
    a = np.array(im).astype(float) / 255.0; o = a.copy()
    for y, x in zip(*np.nonzero(a[:, :, 3])):
        h, l, s = colorsys.rgb_to_hls(*a[y, x, :3]); o[y, x, :3] = colorsys.hls_to_rgb((h + dh) % 1.0, l, s)
    return Image.fromarray((o * 255).astype('uint8'))


def to_palette(im, ref):
    """recolour by luminance onto the luminance-sorted colours of a reference piece (brown wood)."""
    r = np.array(ref).reshape(-1, 4); r = r[r[:, 3] > 200][:, :3].astype(float)
    lum = r @ [0.299, 0.587, 0.114]; r = r[np.argsort(lum)]; lum = np.sort(lum)
    a = np.array(im).astype(float); L = a[:, :, :3] @ [0.299, 0.587, 0.114]
    Ln = (L - L[a[:, :, 3] > 0].min()) / max(1, np.ptp(L[a[:, :, 3] > 0]))
    idx = np.clip((Ln * (len(r) - 1)).astype(int), 0, len(r) - 1); a[:, :, :3] = r[idx]
    return Image.fromarray(a.astype('uint8'))


def pieces():
    d = OUT + '/pieces'; os.makedirs(d, exist_ok=True)
    pp = purple()
    for t, im in pp.items():
        w = place(im, t); w.save(d + '/w' + t + '.png'); hue(w, -0.37).save(d + '/b' + t + '.png')
    f352, f529 = frame(352), frame(529)
    brown = {'N': cut(f352, (1308, 610, 1400, 725)), 'K': cut(f352, (1415, 755, 1500, 895)),
             'P': cut(f529, (538, 612, 618, 722)), 'R': cut(f529, (1400, 514, 1482, 640))}
    for t in 'BQ': brown[t] = to_palette(pp[t], brown['R'].crop(brown['R'].getbbox()))
    for t, im in brown.items(): place(im, t).save(d + '/n' + t + '.png')


def endscreen():
    f = frame(1400); c = f.crop((420, 370, 1560, 700)); w, h = c.size
    def feather(c):
        a = np.array(c.convert('RGBA')).astype(float); yy, xx = np.mgrid[0:h, 0:w]
        a[:, :, 3] = 255 * np.clip(np.minimum(xx, w - 1 - xx) / 70, 0, 1) * np.clip(np.minimum(yy, h - 1 - yy) / 30, 0, 1)
        return Image.fromarray(a.astype('uint8')).resize((w * 3 // 4, h * 3 // 4), Image.LANCZOS)
    feather(c).save(OUT + '/victory.png')
    p = np.array(c).astype(float); y0, y1 = 95, 195            # banner plate with the word painted out (for other results)
    for x in range(320, 800):
        for y in range(y0, y1): t = (y - y0) / (y1 - y0); p[y, x] = p[y0, x] * (1 - t) + p[y1, x] * t
    pl = feather(Image.fromarray(p.astype('uint8'))); box = (232, 66, 607, 150)
    pl.paste(pl.crop(box).filter(ImageFilter.GaussianBlur(10)), box); pl.save(OUT + '/plate.png')


if __name__ == '__main__':
    pieces(); endscreen(); print('ok')
