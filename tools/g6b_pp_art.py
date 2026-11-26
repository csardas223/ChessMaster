#!/usr/bin/env python3
"""art-g6b (2026-11-25): Petrified Pawns (sGXmiyvZDE4) dungeon tileset + unit art from paused 1080p full-screen youtube.com
frames committed as research/frames/video_thumbs/sGXmiyvZDE4_frame_<s>.jpg (1920x1440 page, video at y 180..1260):
  21  = level 1 (your King, crate, enemy knights)       192 = level 2 (your rook, enemy pawns/bishops/rook)
  471 = level 2 later (your King + rook, enemy queen)
Pieces are cut out of the 3D scene with rembg's u2net model (pip rembg; the model downloads once) on a 3x upscale of the
crop; floor tiles are perspective-warped (OpenCV) from two of the move-highlighted floor tiles so the square is the video's
own stone tile; the wall is the video's stone-brick wall face.
In the video YOU play the dark pieces (green health bars) and the monsters are the pale pieces (red bars); in our engine
the player is 'w', so w = dark cuts, b = pale cuts.
INFERRED (no frame shows them): your Pawn / Queen / Bishop (promotion) = the pale monster cut re-shaded to the dark
pieces' palette; your Knight = the dark knight from the repo sprite (thumbnail).
Run from rebuild/app: python3 tools/g6b_pp_art.py     Credit: art (c) Petrified Pawns / iwantcheckmate."""
import os
import numpy as np
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__))
THUMBS = os.path.join(HERE, '..', '..', 'research', 'frames', 'video_thumbs')
SPR = os.path.join(HERE, '..', '..', 'research', 'frames', 'sprites')
OUT = os.path.join(HERE, '..', 'assets', 'modes', 'sGXmiyvZDE4')
VID = 'sGXmiyvZDE4'

def frame(t): return Image.open(os.path.join(THUMBS, '%s_frame_%s.jpg' % (VID, t))).convert('RGB')

CUTS = {  # name: (frame seconds, crop box in the 1920x1440 page)
    'wK': (471, (245, 305, 365, 485)), 'wR': (471, (585, 528, 670, 635)),
    'bQ': (471, (780, 360, 872, 525)), 'bR': (192, (1318, 345, 1410, 450)), 'bB': (192, (1565, 465, 1655, 592)),
    'bP': (192, (745, 518, 815, 602)), 'bN': (21, (1240, 272, 1310, 365)),
}

def cut(session, im):
    from rembg import remove
    im = im.resize((im.width * 3, im.height * 3), Image.LANCZOS)
    o = remove(im, session=session, post_process_mask=True)
    a = np.asarray(o.getchannel('A')); a = np.where(a > 40, a, 0).astype('uint8'); o.putalpha(Image.fromarray(a))
    return o.crop(o.getbbox())

def to_square(im, size=160):
    w, h = im.size; s = max(w, h) * 1.06
    sc = size / s; im = im.resize((max(1, round(w * sc)), max(1, round(h * sc))), Image.LANCZOS)
    o = Image.new('RGBA', (size, size), (0, 0, 0, 0)); o.paste(im, ((size - im.width) // 2, size - im.height - 3), im); return o

def darken(im):
    """re-shade a pale cut to the dark pieces' palette (inferred): keep the shading, map body tones to ~#2e3438 and keep
    the brightest edge pixels light like the dark pieces' white rim"""
    a = np.asarray(im).astype(float); rgb = a[..., :3]; L = rgb.mean(2, keepdims=True) / 255.0
    body = np.array([40, 46, 50]) + (L - 0.55) * np.array([90, 95, 98])
    rim = (L > 0.86)
    out = np.where(rim, rgb * 0.95, np.clip(body, 10, 255))
    a[..., :3] = out; return Image.fromarray(a.astype('uint8'), 'RGBA')

def warp(im, quad, size=128, inset=0.22):
    import cv2
    q = np.array(quad, float); c = q.mean(0); q = c + (q - c) * (1 - inset)
    M = cv2.getPerspectiveTransform(q.astype(np.float32), np.float32([[0, 0], [size, 0], [size, size], [0, size]]))
    return Image.fromarray(cv2.warpPerspective(np.asarray(im), M, (size, size), flags=cv2.INTER_CUBIC))

def main():
    from rembg import new_session
    os.makedirs(OUT, exist_ok=True)
    s = new_session('u2net')
    pcs = {k: cut(s, frame(t).crop(b)) for k, (t, b) in CUTS.items()}
    kn = Image.open(os.path.join(SPR, VID + '_black_knight.png')).convert('RGB').crop((20, 0, 240, 270))
    pcs['wN'] = cut(s, kn.resize((kn.width // 3, kn.height // 3), Image.LANCZOS))
    pcs['wP'] = darken(pcs['bP']); pcs['wQ'] = darken(pcs['bQ']); pcs['wB'] = darken(pcs['bB'])
    for k, im in pcs.items():
        to_square(im).save(os.path.join(OUT, k + '.png'), optimize=True); print(k)
    f = frame(192)
    # two move-highlighted floor tiles (corners T, R, B, L in page pixels, frame 192), warped top-down
    warp(f, [(822, 807), (880, 850), (820, 920), (765, 867)]).save(os.path.join(OUT, 'floor_dark.jpg'), quality=85)
    warp(f, [(760, 882), (820, 920), (760, 977), (700, 930)]).save(os.path.join(OUT, 'floor_light.jpg'), quality=85)
    f.crop((1110, 505, 1230, 600)).resize((128, 128), Image.LANCZOS).save(os.path.join(OUT, 'wall.jpg'), quality=85)
    print('tiles')

if __name__ == '__main__':
    main()
