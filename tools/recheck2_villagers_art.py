"""Villagers Chess (djfYBXvvaYI) soldier + sergeant art cut from the video's own stills (cm-recheck2 2026-11-25).
research/frames/video_thumbs/djfYBXvvaYI_maxres1.jpg: close-up of White's two back ranks (187px squares, b-file at x=8):
b2 = soldier, b1 = sergeant. maxres2: the full board mid-game (83.5px squares from x=184,y=29): b8 = black sergeant,
a7 = black soldier. Square background removed by flood fill from the crop edges (cream or green square)."""
from PIL import Image
import os
R = os.path.join(os.path.dirname(__file__), '..', '..')
out = os.path.join(R, 'app/assets/modes/djfYBXvvaYI')

def cut(src, box, size=128):
    im = Image.open(os.path.join(R, 'research/frames/video_thumbs', src)).convert('RGBA').crop(box)
    w, h = im.size; px = im.load()
    def bg(p):
        r, g, b, a = p
        return (r > 205 and g > 205 and b > 170 and abs(r - g) < 22) or (g - r > 22 and g > 110 and b < 140)
    seen = set(); st = [(x, 0) for x in range(w)] + [(x, h - 1) for x in range(w)] + [(0, y) for y in range(h)] + [(w - 1, y) for y in range(h)]
    while st:
        x, y = st.pop()
        if (x, y) in seen or not (0 <= x < w and 0 <= y < h): continue
        seen.add((x, y))
        if not bg(px[x, y]): continue
        px[x, y] = (0, 0, 0, 0); st += [(x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)]
    for y in range(h):          # grid lines / neighbour squares at the crop edge
        for x in range(w):
            if x < 3 or y < 3 or x >= w - 3 or y >= h - 3: px[x, y] = (0, 0, 0, 0)
    return im.resize((size, size), Image.LANCZOS)

cut('djfYBXvvaYI_maxres1.jpg', (10, 155, 194, 339)).save(os.path.join(out, 'soldier_w.png'))
cut('djfYBXvvaYI_maxres1.jpg', (10, 342, 194, 526)).save(os.path.join(out, 'sergeant_w.png'))
cut('djfYBXvvaYI_maxres2.jpg', (269, 30, 351, 112)).save(os.path.join(out, 'sergeant_b.png'))
cut('djfYBXvvaYI_maxres2.jpg', (185, 114, 267, 196)).save(os.path.join(out, 'soldier_b.png'))
print('ok')
