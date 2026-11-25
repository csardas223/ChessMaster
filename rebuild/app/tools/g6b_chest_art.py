#!/usr/bin/env python3
"""art-g6b (2026-11-25): Chess Survivors (spJibM5qaNQ) golden chest + its white down-arrow marker, cut from the paused 1080p
full-screen frame research/frames/video_thumbs/spJibM5qaNQ_frame_1215.jpg (20:15, chest on the board one tile below the
Level 11 bar; the 14:45 frame _885 has the same chest mid-flash). Background = the grey floor tile around the outlined
sprite: pixels connected to the crop border that are close to the tile colours are made transparent.
Run from rebuild/app: python3 tools/g6b_chest_art.py      Credit: art (c) Chess Survivors / iwantcheckmate."""
import os
import numpy as np
from PIL import Image
from scipy.ndimage import label
HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, '..', '..', 'research', 'frames', 'video_thumbs', 'spJibM5qaNQ_frame_1215.jpg')
OUT = os.path.join(HERE, '..', 'assets', 'modes', 'spJibM5qaNQ')

def key(im, thr=34):
    a = np.asarray(im.convert('RGB')).astype(int); h, w, _ = a.shape
    ring = np.concatenate([a[0], a[-1], a[:, 0], a[:, -1]]); bgc = np.median(ring, 0)
    cand = np.sqrt(((a - bgc) ** 2).sum(2)) < thr
    lab, n = label(cand); edge = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    bg = np.isin(lab, list(edge))
    fg = ~bg; lab2, n2 = label(fg)
    if n2 > 1:
        s = np.bincount(lab2.ravel()); s[0] = 0; fg = lab2 == s.argmax()
    rgba = np.dstack([a, (fg * 255)]).astype('uint8'); o = Image.fromarray(rgba, 'RGBA'); return o.crop(o.getbbox())

def sq(im, size=128):
    w, h = im.size; s = max(w, h) + 4; o = Image.new('RGBA', (s, s), (0, 0, 0, 0)); o.paste(im, ((s - w) // 2, (s - h) // 2), im)
    return o.resize((size, size), Image.LANCZOS)

f = Image.open(SRC).convert('RGB')
sq(key(f.crop((928, 313, 987, 351)), 44)).save(os.path.join(OUT, 'chest.png'), optimize=True)
sq(key(f.crop((938, 274, 972, 306))), 64).save(os.path.join(OUT, 'chest_arrow.png'), optimize=True)
print('ok')
