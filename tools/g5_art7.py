#!/usr/bin/env python3
"""g5 art 7 (2026-11-25): Pawnbarian (Kzt9ItpGtYg) run HUD art cut from the repo frame
research/frames/video_thumbs/Kzt9ItpGtYg_frame_703.jpg (11:43, The Goblin Caves floor 3): gold bag (its baked '1' painted
over with the bag's own orange so the live count can sit on it), red gem, gold nugget (the decaying loot row), heart.
Background navy (57,57,93) keyed to transparent."""
import os
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__)); APP = os.path.dirname(HERE)
SRC = os.path.join(APP, 'research/frames/video_thumbs/Kzt9ItpGtYg_frame_703.jpg')
OUT = os.path.join(APP, 'assets/modes/Kzt9ItpGtYg')
im = Image.open(SRC).convert('RGBA')
def key(c, bg=(57, 57, 93), tol=70):
    px = c.load()
    for y in range(c.height):
        for x in range(c.width):
            r, g, b, a = px[x, y]
            d = abs(r - bg[0]) + abs(g - bg[1]) + abs(b - bg[2])
            if d < tol: px[x, y] = (r, g, b, 0)
            elif d < tol * 2: px[x, y] = (r, g, b, int(255 * (d - tol) / tol))
    return c.crop(c.getbbox())
bag = im.crop((645, 0, 732, 80)).copy()
px = bag.load()
for y in range(36, 76):   # paint the baked digit with the bag orange (inner body only)
    for x in range(24, 64):
        r, g, b, a = px[x, y]
        if g < 186 and r > 60: px[x, y] = (250, 176, 58, 255)
key(bag).save(os.path.join(OUT, 'gold_bag.png'))
key(im.crop((733, 10, 792, 72)).copy()).save(os.path.join(OUT, 'gem.png'))
key(im.crop((790, 14, 836, 64)).copy()).save(os.path.join(OUT, 'nugget.png'))
key(im.crop((655, 730, 706, 812)).copy()).save(os.path.join(OUT, 'heart.png'))
print('ok')
