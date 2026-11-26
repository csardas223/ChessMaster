"""Cornered (y5MBC8OCYlI) red/yellow piece art cut from the video's own stills (cm-recheck2 2026-11-25).
research/frames/video_thumbs/y5MBC8OCYlI_maxres2.jpg / _maxres3.jpg: the 10x8 board (4 stone files + 6 play files),
81.6px squares from x=32, y=34 (file a = 0, rank 8 = row 0). Square background (light #dbdbdb / dark #acacac / move-highlight
pink) removed by flood fill from the crop edges. royal = king with the fleur-de-lis badge."""
from PIL import Image
import os
R = os.path.join(os.path.dirname(__file__), '..')
out = os.path.join(R, 'assets/modes/y5MBC8OCYlI')
X0, Y0, S = 32, 34, 81.6
def cut(still, sq, size=128):
    c = 'abcdefghij'.index(sq[0]); r = 8 - int(sq[1:])
    src = Image.open(os.path.join(R, 'research/frames/video_thumbs', 'y5MBC8OCYlI_' + still + '.jpg')).convert('RGBA')
    im = src.crop((int(X0 + c * S) + 3, int(Y0 + r * S) + 3, int(X0 + (c + 1) * S) - 3, int(Y0 + (r + 1) * S) - 3))
    w, h = im.size; px = im.load()
    def bg(p):
        r_, g, b, a = p
        grey = abs(r_ - g) < 14 and abs(g - b) < 14 and r_ > 150
        pink = r_ > 160 and 105 < g < 205 and 115 < b < 215 and r_ - g > 25
        return grey or pink
    st = [(x, 0) for x in range(w)] + [(x, h - 1) for x in range(w)] + [(0, y) for y in range(h)] + [(w - 1, y) for y in range(h)]
    seen = set()
    while st:
        x, y = st.pop()
        if (x, y) in seen or not (0 <= x < w and 0 <= y < h): continue
        seen.add((x, y))
        if not bg(px[x, y]): continue
        px[x, y] = (0, 0, 0, 0); st += [(x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)]
    return im.resize((size, size), Image.LANCZOS)
JOBS = {  # name: (still, square)
    'royal_r': ('maxres2', 'a6'), 'royal_y': ('maxres2', 'a3'),
    'king_r': ('maxres2', 'c3'), 'king_y': ('maxres2', 'c6'),
    'dknight_r': ('maxres2', 'e1'), 'dknight_y': ('maxres2', 'e8'),
    'bishop_r': ('maxres3', 'h1'), 'bishop_y': ('maxres2', 'h8'),
    'knight_r': ('maxres2', 'h4'), 'knight_y': ('maxres2', 'j7'),
    'soldier_r': ('maxres2', 'e4'), 'soldier_y': ('maxres2', 'g7'),
    'sergeant_r': ('maxres2', 'f4'), 'sergeant_y': ('maxres2', 'j5'),
}
for name, (still, sq) in JOBS.items():
    cut(still, sq).save(os.path.join(out, name + '.png'))
# the hill square (d3, a lighter square with an inset shadow) as a square image
src = Image.open(os.path.join(R, 'research/frames/video_thumbs/y5MBC8OCYlI_maxres2.jpg')).convert('RGB')
src.crop((int(X0 + 3 * S) + 1, int(Y0 + 5 * S) + 1, int(X0 + 4 * S) - 1, int(Y0 + 6 * S) - 1)).resize((128, 128), Image.LANCZOS).save(os.path.join(out, 'hill.png'))
print('ok')
