#!/usr/bin/env python3
"""s5-art 2026-11-26: WXcmWG7Eczs doodle set (blurry-a Lanczos upscales of the video sprites, JPEG-soft) -> crisp 512 px
re-traces in two/three flat colours, same look as the rebuilt Q/Iq (tools/art_s5_jester.py).
usage: python3 tools/art_s5_wxcm.py OUTDIR [names...]"""
import io, os, re, sys
import numpy as np
import cairosvg
from PIL import Image
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sprite_vec import vec
from art_fit import fit
M = 'assets/modes/WXcmWG7Eczs/'
OUTLINE = (0x30, 0x32, 0x2d)
WHITE = (0xfa, 0xfc, 0xfa)
GREY = (0x56, 0x55, 0x51)
NAMES = ['B_b', 'B_w', 'Ch_b', 'Ch_w', 'K_b', 'K_w', 'Knook_b', 'Knook_w', 'N_b', 'N_w', 'P_b', 'P_w', 'R_b', 'R_w', 'T_n', 'U_b', 'U_w']


def run(n, out):
    im = Image.open(M + n + '.png').convert('RGBA')
    bb = im.getbbox()
    fill = (bb[2] - bb[0]) / im.size[0], (bb[3] - bb[1]) / im.size[1]
    small = im.resize((160, 160), Image.LANCZOS)
    tmp = os.path.join(out, n + '_src.png')
    small.save(tmp)
    pal = [OUTLINE, WHITE, GREY] if n == 'T_n' else ([OUTLINE, GREY] if n.endswith('_b') else [OUTLINE, WHITE])
    o = os.path.join(out, n + '.png')
    vec(tmp, o, k=len(pal), palette=pal, base=0, lab_smooth=0.6, smooth=0.8, up=8, alpha_thr=150)
    svg = open(o + '.svg').read()
    cols = re.findall(r'fill="(#[0-9a-f]{6})"', svg)
    # snap every layer to the nearest set colour
    for c in dict.fromkeys(cols):
        rgb = np.array([int(c[i:i + 2], 16) for i in (1, 3, 5)])
        best = min(pal, key=lambda p: ((rgb - np.array(p)) ** 2).sum())
        svg = svg.replace('fill="%s"' % c, 'fill="#%02x%02x%02x"' % best)
    png = cairosvg.svg2png(bytestring=svg.encode(), output_width=2048)
    # keep each piece's own size inside the square (the set is drawn at its video proportions)
    fit(Image.open(io.BytesIO(png)), 512, min(0.92, max(fill))).save(o, optimize=True)
    os.remove(o + '.svg'); os.remove(tmp)
    print('ok', n, round(max(fill), 2))


if __name__ == '__main__':
    out = sys.argv[1]; os.makedirs(out, exist_ok=True)
    for n in sys.argv[2:] or NAMES:
        run(n, out)
