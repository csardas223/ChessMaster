"""cm_s5 2026-11-27: crisp re-trace of the Despair silhouette (U67wZoy-1fE).

No web copy of the creature exists. The previous cut (video frame maxres1.jpg, 200 px square, 3x Lanczos) was soft.
This re-traces it: the alpha is upsampled 4x, smoothed, thresholded to a hard silhouette and box-downsampled for a
1-2 px anti-aliased edge (no fading). The white eye rings are re-traced the same way. Output 512 px, same framing.
Usage: python3 tools/art_s5_despair.py [src.png] [out.png]
"""
import sys
from PIL import Image, ImageFilter
src = sys.argv[1] if len(sys.argv) > 1 else 'assets/modes/U67wZoy-1fE/despair.png'
out = sys.argv[2] if len(sys.argv) > 2 else src
im = Image.open(src).convert('RGBA')
S = 4
a = im.getchannel('A')
lum = im.convert('L')
# eye mask: bright pixels inside the body
px_l, px_a = lum.load(), a.load()
EYES = (180, 295, 320, 350)  # the two eye arcs sit in this box (x0, y0, x1, y1) of the 512 px cut
eye = Image.new('L', im.size, 0); pe = eye.load()
hole = a.copy(); ph = hole.load()
for y in range(im.height):
    for x in range(im.width):
        if px_l[x, y] > 70 and px_a[x, y] > 40:
            if EYES[0] <= x <= EYES[2] and EYES[1] <= y <= EYES[3]:
                pe[x, y] = 255
            else:  # light gaps between the tendrils are board showing through: transparent, not white
                ph[x, y] = 0
a = hole

def retrace(m, blur, thr):
    big = m.resize((m.width * S, m.height * S), Image.BICUBIC).filter(ImageFilter.GaussianBlur(blur))
    big = big.point(lambda v: 255 if v >= thr else 0)
    return big.resize(m.size, Image.BOX)

A = retrace(a, 1.4, 128)
E = retrace(eye, 1.2, 100)
rgb = Image.new('RGB', im.size, (8, 8, 10))
rgb.paste((240, 240, 236), (0, 0), E)
res = rgb.convert('RGBA'); res.putalpha(A)
res.save(out, optimize=True)
print('wrote', out, res.getchannel('A').getbbox())
