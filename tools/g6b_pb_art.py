"""cm-g6b (2026-11-25): Pawnbarian (zP9TzlgA-W0) UI art cut from the repo stills research/frames/video_thumbs/zP9TzlgA-W0_maxres2/3.jpg:
loot row (gold bag, red crystal, gold nugget), card upgrade icons (cardinal splash +, diagonal splash x, shield, cantrip lightning),
filled / empty heart, end-turn chevrons, spark lightning. The UI background (#37375d) is keyed out to transparency."""
from PIL import Image
import os
R = os.path.join(os.path.dirname(__file__), '..', 'research', 'frames', 'video_thumbs')
O = os.path.join(os.path.dirname(__file__), '..', 'assets', 'modes', 'zP9TzlgA-W0')
BG = (0x37, 0x37, 0x5d)
def key(im, bg=BG, tol=38, soft=30):
    im = im.convert('RGBA'); px = im.load()
    for y in range(im.height):
        for x in range(im.width):
            r, g, b, a = px[x, y]; d = abs(r - bg[0]) + abs(g - bg[1]) + abs(b - bg[2])
            if d < tol: px[x, y] = (r, g, b, 0)
            elif d < tol + soft: px[x, y] = (r, g, b, int(255 * (d - tol) / soft))
    return im
def cut(src, box, name, k=True, bg=BG):
    im = Image.open(os.path.join(R, 'zP9TzlgA-W0_' + src + '.jpg')).crop(box)
    im = key(im, bg) if k else im.convert('RGBA')
    bb = im.getbbox(); im = im.crop(bb) if bb else im
    im.save(os.path.join(O, name + '.png')); print(name, im.size)
cut('maxres2', (433, 2, 486, 54), 'loot_bag')
cut('maxres2', (489, 4, 524, 48), 'loot_crystal')
cut('maxres2', (577, 16, 605, 46), 'loot_gold')
cut('maxres2', (148, 336, 184, 368), 'up_csplash')
cut('maxres2', (184, 336, 216, 368), 'up_dsplash')
cut('maxres2', (216, 334, 250, 370), 'up_shield')
cut('maxres2', (284, 334, 318, 370), 'up_cantrip')
cut('maxres2', (443, 489, 475, 541), 'heart_full')
cut('maxres2', (594, 489, 632, 541), 'heart_empty')
cut('maxres2', (791, 490, 856, 540), 'end_turn')
cut('maxres3', (870, 0, 1015, 275), 'spark_bolt')
# the bag's printed gold count is painted out with the bag colour (the page writes the live count on it)
from PIL import ImageDraw
b = Image.open(os.path.join(O, 'loot_bag.png')); d = ImageDraw.Draw(b); d.ellipse((14, 25, 38, 50), fill=(240, 182, 72, 255)); b.save(os.path.join(O, 'loot_bag.png'))
