#!/usr/bin/env python3
"""Group 5 art pass 6 (Hark g5 session, 2026-11-25 ~1:30 AM ET). Cuts from frames already committed in
research/frames/video_thumbs (paused 1080p youtube.com frames, no downloaders, no audio). Nothing drawn.
Run from rebuild/app:  python3 tools/g5_art6.py [job ...]
Credit: all art (c) the original games / iwantcheckmate videos."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from PIL import Image, ImageOps
from g5_frames import trim, square, save
from g5_art4 import invert_rgb, abs_key
from g5_art5 import frame

def icon(F, box):
    im = abs_key(F.crop(box), 30)
    a = im.getchannel('A'); im = Image.merge('RGBA', (*ImageOps.autocontrast(im.convert('L')).convert('RGB').split(), a))
    return square(trim(im), False)

# ------------------------------------------------ Ouroboros King: Prince + Marching Pawn (third Ouroboros video rf2HSTXTehE)
def ouro():
    V = 'rf2HSTXTehE'
    for name, t in (('marching_pawn', 70), ('prince', 82)):   # recruit cards 1:10 (Marching pawn) / 1:22 (Prince)
        im = icon(frame(V, t), (1390, 240, 1510, 345))
        save(im, 'JAz_qMQpI1o/%s_w.png' % name, 120)
        save(invert_rgb(im), 'JAz_qMQpI1o/%s_b.png' % name, 120)   # other side = fill/outline swap, as the game draws it (inferred)

# ------------------------------------------------ Passant (OO3XlFQ32i0): pink last-move arrow tile, 17:58 boss round
def passant():
    F = frame('OO3XlFQ32i0', 1078).crop((555, 310, 665, 420)).convert('RGBA'); px = F.load(); w, h = F.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            px[x, y] = (r, g, b, 255 if (r > 180 and b > 170 and g > 120) else 0)
    save(square(trim(F), False), 'OO3XlFQ32i0/arrow.png', 96)

JOBS = {'ouro': ouro, 'passant': passant}
if __name__ == '__main__':
    only = sys.argv[1:]
    for k, fn in JOBS.items():
        if not only or any(k.startswith(o) for o in only): fn()
