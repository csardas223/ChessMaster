#!/usr/bin/env python3
"""s5-art 2026-11-26: 4XV3SBMQgXE SCP-035 piece (hat top cut by the video crop) -> clean 512 px.

The mask itself is the creator's own art from iwantcheckmate.com (Containment Breach engine.js -> mask.png, 1536 px,
https://iwantcheckmate.com/challenges/containment-breach/assets/mask.png). In this video the mask sits on a white bust
(round ears, shoulders, white behind the mouth): that bust is taken from the video sprite
research/frames/sprites/4XV3SBMQgXE_scp035.png (board beige/brown keyed out, grey mask pixels dropped), re-traced
crisp (tools/sprite_vec.py, black + white), and the site mask is laid on top at the position/scale that best matches
the video (IoU search: scale 0.244, offset 15,-26 in the 400 px sprite).
usage: python3 tools/art_s5_mask.py SITE_MASK.png OUT.png
"""
import io, os, re, sys
import numpy as np
import cairosvg
from PIL import Image
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sprite_vec import vec
from art_fit import fit

SPRITE = 'research/frames/sprites/4XV3SBMQgXE_scp035.png'
S, DX, DY = 0.244, 15, -26
PAD = 40  # sprite px


def main(site, out):
    sp = np.array(Image.open(SPRITE).convert('RGB')).astype(float)
    H, W = sp.shape[:2]
    lum = sp.mean(-1)
    sat = sp.max(-1) - sp.min(-1)
    beige = np.sqrt(((sp - [234, 210, 174]) ** 2).sum(-1)) < 40
    brown = np.sqrt(((sp - [174, 126, 102]) ** 2).sum(-1)) < 45
    grey = (sat < 25) & (lum >= 70) & (lum < 222)
    # grey only belongs to the mask where the site mask lies; elsewhere it is the bust's shading (right ear)
    m0 = Image.open(site).convert('RGBA')
    w = round(m0.size[0] * S)
    ma = np.array(m0.resize((w, w), Image.BILINEAR))[..., 3] > 20
    cover = np.zeros((H, W), bool)
    y0, x0, y1, x1 = max(0, DY), max(0, DX), min(H, DY + w), min(W, DX + w)
    cover[y0:y1, x0:x1] = ma[y0 - DY:y1 - DY, x0 - DX:x1 - DX]
    keep = ~(beige | brown | (grey & cover))
    sp[grey & ~cover] = 244
    a = np.zeros((H, W, 4))
    a[..., :3] = sp
    a[..., 3] = keep * 255
    # the bust is whatever is left, minus the grey mask: black outline + white
    bust = np.zeros((H + 2 * PAD, W + 2 * PAD, 4))
    bust[PAD:PAD + H, PAD:PAD + W] = a
    tmp = out + '.bust.png'
    Image.fromarray(bust.astype(np.uint8)).resize(((W + 2 * PAD) // 2, (H + 2 * PAD) // 2), Image.LANCZOS).save(tmp)
    vec(tmp, tmp + '.v.png', k=2, palette=[(20, 20, 20), (245, 245, 245)], base=0, lab_smooth=0.5, smooth=0.8, up=8, alpha_thr=150)
    svg = open(tmp + '.v.png.svg').read()
    cols = re.findall(r'fill="(#[0-9a-f]{6})"', svg)
    svg = svg.replace('fill="%s"' % cols[0], 'fill="#111111"', 1)
    for c in cols[1:]:
        svg = svg.replace('fill="%s"' % c, 'fill="#f4f4f4"')
    # render the bust in site-mask pixel space: 1 sprite px = 1/S site px
    big_w = round((W + 2 * PAD) / S)
    png = cairosvg.svg2png(bytestring=svg.encode(), output_width=big_w, output_height=big_w)
    canvas = Image.open(io.BytesIO(png)).convert('RGBA')
    m = Image.open(site).convert('RGBA')
    canvas.alpha_composite(m, (round((DX + PAD) / S), round((DY + PAD) / S)))
    fit(canvas, 512, 0.9).save(out, optimize=True)
    for f in (tmp, tmp + '.v.png', tmp + '.v.png.svg'):
        os.remove(f)
    print('wrote', out)


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
