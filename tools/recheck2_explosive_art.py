"""Explosive Magic (lmmKhSrRn_c) General + Dragon Knight pieces cut from the video's still
research/frames/video_thumbs/lmmKhSrRn_c_maxres2.jpg (10x10 board seen from Black, 68px squares from x=177, y=22):
white dragon knight a? = row 0 col 1, white general = row 1 col 4, black dragon knight = row 9 col 1, black general = row 9 col 5.
(cm-recheck2 2026-11-25). Square background removed by flood fill from the crop edges."""
from PIL import Image
import os
R = os.path.join(os.path.dirname(__file__), '..', '..')
out = os.path.join(R, 'app/assets/modes/lmmKhSrRn_c')
src = Image.open(os.path.join(R, 'research/frames/video_thumbs/lmmKhSrRn_c_maxres2.jpg')).convert('RGBA')
X0, Y0, S = 177, 22, 68
def cut(col, row, size=128):
    im = src.crop((X0 + col * S + 2, Y0 + row * S + 2, X0 + (col + 1) * S - 2, Y0 + (row + 1) * S - 2))
    w, h = im.size; px = im.load()
    def bg(p):
        r, g, b, a = p
        return (r > 200 and g > 200 and b > 165 and abs(r - g) < 25) or (g - r > 20 and g > 105 and b < 150)
    st = [(x, 0) for x in range(w)] + [(x, h - 1) for x in range(w)] + [(0, y) for y in range(h)] + [(w - 1, y) for y in range(h)]
    seen = set()
    while st:
        x, y = st.pop()
        if (x, y) in seen or not (0 <= x < w and 0 <= y < h): continue
        seen.add((x, y))
        if not bg(px[x, y]): continue
        px[x, y] = (0, 0, 0, 0); st += [(x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)]
    for y in range(h):
        for x in range(w):
            if x < 3 or y < 5 or x >= w - 3 or y >= h - 3: px[x, y] = (0, 0, 0, 0)
    return im.resize((size, size), Image.LANCZOS)
cut(1, 0).save(os.path.join(out, 'horse_w.png'))
cut(4, 1).save(os.path.join(out, 'general_w.png'))
cut(1, 9).save(os.path.join(out, 'horse_b.png'))
cut(5, 9).save(os.path.join(out, 'general_b.png'))
print('ok')
