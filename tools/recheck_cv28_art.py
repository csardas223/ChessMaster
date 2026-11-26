"""Sergeant's Checkers (Cv28-UoZseg) piece art cut from the video's own stills (cm-recheck 2026-11-25).
research/frames/video_thumbs/Cv28-UoZseg_maxres1.jpg (close-up of Blue's king pocket, 145px squares) and maxres2 (full board).
Square background removed by flood fill from the corners; the blue soldier / green sergeant / green barrelina are the
high-res blue/green pieces hue-shifted to the other army's colour as seen in maxres2."""
from PIL import Image, ImageDraw
import colorsys, os
R = os.path.join(os.path.dirname(__file__), '..', '..')
src = Image.open(os.path.join(R, 'research/frames/video_thumbs/Cv28-UoZseg_maxres1.jpg')).convert('RGBA')
out = os.path.join(R, 'app/assets/modes/Cv28-UoZseg')

def cut(box, tol=38):
    x0, y0, x1, y1 = box
    im = src.crop((x0 + 4, y0 + 4, x1 - 4, y1 - 4)).copy()
    w, h = im.size
    px = im.load()
    seen = set(); stack = [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1), (w // 2, 2), (2, h // 2), (w - 3, h // 2)]
    while stack:
        x, y = stack.pop()
        if (x, y) in seen or not (0 <= x < w and 0 <= y < h): continue
        seen.add((x, y)); r, g, b, a = px[x, y]
        if max(r, g, b) - min(r, g, b) > 14 or r < 150: continue   # grey square only
        px[x, y] = (0, 0, 0, 0)
        stack += [(x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)]
    return im

def hue(im, target_rgb):
    th, ts, tv = colorsys.rgb_to_hsv(*[c / 255 for c in target_rgb])
    im = im.copy(); px = im.load()
    for y in range(im.size[1]):
        for x in range(im.size[0]):
            r, g, b, a = px[x, y]
            if not a: continue
            h, s, v = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
            if s > 0.25 and v > 0.2:
                h = th; s = min(1, s * ts / 0.55)
                r, g, b = [int(c * 255) for c in colorsys.hsv_to_rgb(h, s, v)]
            px[x, y] = (r, g, b, a)
    return im

BLUE = (66, 134, 196); GREEN = (86, 150, 96)
sq = 145
blue_sgt = cut((27, 0, 27 + sq, sq - 2))
green_sol = cut((461, 289, 461 + sq, 289 + sq))
blue_king = cut((605, 433, 605 + sq, 433 + sq - 2))
stone = src.crop((461, 433, 461 + sq, 433 + sq))
blue_sgt.save(os.path.join(out, 'sergeant_w.png'))
hue(blue_sgt, GREEN).save(os.path.join(out, 'sergeant_b.png'))
green_sol.save(os.path.join(out, 'soldier_b.png'))
hue(green_sol, BLUE).save(os.path.join(out, 'soldier_w.png'))
blue_king.save(os.path.join(out, 'barrelina_w.png'))
hue(blue_king, GREEN).save(os.path.join(out, 'barrelina_b.png'))
stone.convert('RGB').save(os.path.join(out, 'stone.png'))
# promoted king: the crowned piece without the royal fleur-de-lis badge (badge region painted out = cropped above it)
# the piece is left-right symmetric: mirror its left half over the badge side
nb = blue_king.copy(); w, h = nb.size; cx = 70 - 4   # piece axis in the crop (x=677 in the still)
nb2 = nb.copy(); left = nb.crop((cx - (w - cx), 0, cx, h)).transpose(Image.FLIP_LEFT_RIGHT)
clear = Image.new('RGBA', (w - cx, h), (0, 0, 0, 0)); nb2.paste(clear, (cx, 0)); nb2.paste(left, (cx, 0), left)
nb2.save(os.path.join(out, 'king_w.png')); hue(nb2, GREEN).save(os.path.join(out, 'king_b.png'))
print('ok')
