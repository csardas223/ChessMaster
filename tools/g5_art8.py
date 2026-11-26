#!/usr/bin/env python3
"""g5 art 8 (2026-11-25): Ouroboros King HUD icons cut from the repo still research/frames/video_thumbs/JAz_qMQpI1o_maxres2.jpg
(1280x720, 'Ridge of Ruin - 4'): the Ouroboros Sigil relic (the snake ring, first icon of the Relics bar), the rewind item
(circular arrow, first icon of the Items bar) and the gold bag next to the gold count. White line art on the dark
background: alpha from luminance."""
import os
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__)); APP = os.path.dirname(HERE)
SRC = os.path.join(os.path.dirname(APP), 'research/frames/video_thumbs/JAz_qMQpI1o_maxres2.jpg')
OUT = os.path.join(APP, 'assets/modes/JAz_qMQpI1o')
im = Image.open(SRC).convert('RGB')
def cut(box, name):
    c = im.crop(box); o = Image.new('RGBA', c.size); px = c.load(); po = o.load()
    for y in range(c.height):
        for x in range(c.width):
            r, g, b = px[x, y]; L = (r * 299 + g * 587 + b * 114) // 1000
            a = max(0, min(255, (L - 75) * 255 // 110)); po[x, y] = (255, 255, 255, a)
    bb = o.getbbox(); o = o.crop(bb)
    s = max(o.size); sq = Image.new('RGBA', (s, s)); sq.paste(o, ((s - o.width) // 2, (s - o.height) // 2))
    sq.resize((96, 96), Image.LANCZOS).save(os.path.join(OUT, name))
cut((222, 620, 270, 668), 'relic_sigil.png')
cut((224, 668, 268, 708), 'rewind.png')
cut((872, 666, 920, 714), 'gold.png')
print('ok')
