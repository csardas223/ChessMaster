#!/usr/bin/env python3
"""art-audit (2026-11-25): Shotgun King (pzxXxIsKRRo) white army from the Shotgun King Wiki (Fandom) piece sprites, which are the
game's own 16-px sprites at 10x (exact same art as the video, owner rule 11:37 AM ET: higher-res web copies of the exact art win).
Sources (CC-BY-SA, saved in research/frames/sprites_web/pzxXxIsKRRo_wiki_<Piece>.png):
  https://static.wikia.nocookie.net/shotgun-king/images/{1/1d/King,6/6b/Knight,f/f0/Bishop,1/1b/Rook,f/f4/Pawn,a/ab/Queen}.png
The wiki uses the game's default palette (peach #ffccaa / navy #0e1529 / grey-violet #83769c); the video runs a palette with cream
#f7e2c6 / navy #1a1a34 / lavender #a08cc4 (sampled by tools/g6c_art.py), so each pixel is mapped 1:1 to the video palette.
Output: assets/modes/pzxXxIsKRRo/w<T>.png on the same 16x19 grid x8 (bottom row empty, centred) as the frame cuts."""
import os
import numpy as np
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, '..', '..', 'research', 'frames', 'sprites_web')
OUT = os.path.join(HERE, '..', 'assets', 'modes', 'pzxXxIsKRRo')
PAL = {(255, 204, 170): (247, 226, 198), (14, 21, 41): (26, 26, 52), (131, 118, 156): (160, 140, 196)}
for t, n in {'K': 'King', 'Q': 'Queen', 'R': 'Rook', 'B': 'Bishop', 'N': 'Knight', 'P': 'Pawn'}.items():
    a = np.array(Image.open(os.path.join(SRC, 'pzxXxIsKRRo_wiki_%s.png' % n)).convert('RGBA'))[5::10, 5::10]
    o = np.zeros(a.shape, 'uint8')
    for y in range(a.shape[0]):
        for x in range(a.shape[1]):
            if a[y, x, 3]: o[y, x] = PAL[tuple(int(v) for v in a[y, x, :3])] + (255,)
    im = Image.fromarray(o, 'RGBA'); W, H = 16, 19
    s = Image.new('RGBA', (W, H), (0, 0, 0, 0)); s.paste(im, ((W - im.size[0]) // 2, H - im.size[1] - 1))
    s.resize((W * 8, H * 8), Image.NEAREST).save(os.path.join('/tmp' if os.environ.get('DRY') else OUT, 'w%s.png' % t))
    print(t, im.size)
