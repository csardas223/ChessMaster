#!/usr/bin/env python3
"""art_fit.py - put a clean transparent sprite on a square canvas, centred, longest side at FILL of the canvas.

Owner art rules (HANDOFF.md): transparent PNG >= 512 px, centred at about 90%, no faded edges.
Resampling is done on premultiplied colour (no dark/white fringes), Lanczos.

usage: python3 tools/art_fit.py IN.png OUT.png [--size 512] [--fill 0.9] [--bottom]
  --bottom   align the art to the bottom margin instead of centring vertically (standing pieces)
"""
import argparse
import numpy as np
from PIL import Image


def fit(im, size=512, fill=0.9, bottom=False):
    im = im.convert('RGBA')
    bb = im.getchannel('A').point(lambda v: 255 if v > 8 else 0).getbbox()
    if not bb:
        raise SystemExit('empty image')
    im = im.crop(bb)
    a = np.asarray(im).astype(np.float64) / 255.0
    pre = a.copy()
    pre[..., :3] *= pre[..., 3:4]
    w, h = im.size
    s = size * fill / max(w, h)
    nw, nh = max(1, round(w * s)), max(1, round(h * s))
    chans = [Image.fromarray((pre[..., c] * 255).astype(np.float32), 'F').resize((nw, nh), Image.LANCZOS) for c in range(4)]
    out = np.stack([np.asarray(c) for c in chans], -1) / 255.0
    out = np.clip(out, 0, 1)
    al = out[..., 3:4]
    rgb = np.where(al > 1e-4, out[..., :3] / np.maximum(al, 1e-4), 0)
    res = np.concatenate([np.clip(rgb, 0, 1), al], -1)
    sprite = Image.fromarray((res * 255 + 0.5).astype(np.uint8), 'RGBA')
    canvas = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    x = (size - nw) // 2
    y = (size - nh) - round(size * (1 - fill) / 2) if bottom else (size - nh) // 2
    canvas.alpha_composite(sprite, (x, y))
    return canvas


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('inp')
    ap.add_argument('out')
    ap.add_argument('--size', type=int, default=512)
    ap.add_argument('--fill', type=float, default=0.9)
    ap.add_argument('--bottom', action='store_true')
    o = ap.parse_args()
    fit(Image.open(o.inp), o.size, o.fill, o.bottom).save(o.out, optimize=True)
    print('wrote', o.out)
