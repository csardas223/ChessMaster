#!/usr/bin/env python3
"""cm-ps pass 2 (2026-11-25): Petrified Pawns (sGXmiyvZDE4) props + UI icons cut from the paused 1080p frames already in the
repo (research/frames/video_thumbs/sGXmiyvZDE4_frame_<s>.jpg, 1920x1440 page, video at y 180..1260):
  21  = level 1: the crate with the yellow marker, a closed chest and two vases (top right)
  471 = level 2: open chest, vase, the enemy cannon, the spell bar (1 / 2 / 3), the inventory (dull blade, orb staff,
        purple potion) and the gold-coins icon
3D props (crate, chest, vase, cannon) are cut out with OpenCV GrabCut (rect init, inset 4 px) and squared on a
transparent 128 px canvas; the spell / inventory / gold icons are the game's own square UI icons, cropped as-is.
Spell mapping (inferred, the video never shows the tooltips next to the icons): 1 = Lesser Heal (gold hand),
2 = Greater Heal (green leaves), 3 = Bouncing Orb (green orb rune). Red spell icons in frame 21 are the same icons with
too little mana: drawn by CSS (grayscale + red) instead of separate files.
Run from rebuild/app: python3 tools/pp2_art.py      Credit: art (c) Petrified Pawns / iwantcheckmate."""
import os
import numpy as np
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__))
THUMBS = os.path.join(HERE, '..', '..', 'research', 'frames', 'video_thumbs')
OUT = os.path.join(HERE, '..', 'assets', 'modes', 'sGXmiyvZDE4')
VID = 'sGXmiyvZDE4'
PROPS = {  # name: (frame, box) -> GrabCut cut-out
    'crate': (21, (948, 628, 1056, 735)), 'chest': (21, (1176, 228, 1268, 304)), 'marker': (21, (978, 586, 1032, 632)),
    'chest_open': (471, (108, 262, 246, 394)), 'vase': (471, (1508, 402, 1592, 498)), 'cannon': (471, (1668, 556, 1772, 642)),
}
ICONS = {  # name: (frame, box) -> square UI icon
    'sp_lesser': (471, (824, 1168, 895, 1239)), 'sp_greater': (471, (920, 1168, 991, 1239)), 'sp_orb': (471, (1015, 1168, 1086, 1239)),
    'it_blade': (471, (1486, 775, 1548, 838)), 'it_staff': (471, (1560, 775, 1622, 838)), 'it_potion': (471, (1635, 775, 1697, 838)),
    'gold': (471, (1802, 1142, 1843, 1180)),
}

def frame(t): return Image.open(os.path.join(THUMBS, '%s_frame_%s.jpg' % (VID, t))).convert('RGB')

def grabcut(im):
    import cv2
    a = np.asarray(im.resize((im.width * 3, im.height * 3), Image.LANCZOS))[:, :, ::-1].copy()
    mask = np.zeros(a.shape[:2], np.uint8); bg = np.zeros((1, 65), np.float64); fg = np.zeros((1, 65), np.float64)
    r = (12, 12, a.shape[1] - 24, a.shape[0] - 24)
    cv2.grabCut(a, mask, r, bg, fg, 6, cv2.GC_INIT_WITH_RECT)
    m = np.where((mask == 1) | (mask == 3), 255, 0).astype('uint8')
    m = cv2.GaussianBlur(m, (5, 5), 0)
    o = Image.fromarray(a[:, :, ::-1]).convert('RGBA'); o.putalpha(Image.fromarray(m))
    return o.crop(o.getbbox())

def square(im, size=128):
    w, h = im.size; s = max(w, h) * 1.06; sc = size / s
    im = im.resize((max(1, round(w * sc)), max(1, round(h * sc))), Image.LANCZOS)
    o = Image.new('RGBA', (size, size), (0, 0, 0, 0)); o.paste(im, ((size - im.width) // 2, (size - im.height) // 2), im); return o

def main():
    os.makedirs(OUT, exist_ok=True)
    for k, (t, b) in PROPS.items():
        square(grabcut(frame(t).crop(b))).save(os.path.join(OUT, k + '.png'))
    for k, (t, b) in ICONS.items():
        frame(t).crop(b).resize((96, 96), Image.LANCZOS).save(os.path.join(OUT, k + '.png'))
    print('wrote', sorted(list(PROPS) + list(ICONS)))

if __name__ == '__main__':
    main()

def lighten_king():
    """INFERRED: no frame shows the monsters' (pale) king up close, so bK = the dark King cut (wK.png, frame 471)
    re-shaded to the pale monster palette (the reverse of g6b_pp_art.darken). Run after main()."""
    a = np.asarray(Image.open(os.path.join(OUT, 'wK.png')).convert('RGBA')).astype(float)
    L = a[..., :3].mean(2, keepdims=True) / 255.0
    pale = np.clip(np.array([112, 128, 136]) + (L - 0.2) * np.array([150, 150, 148]), 0, 255)
    a[..., :3] = pale
    Image.fromarray(a.astype('uint8'), 'RGBA').save(os.path.join(OUT, 'bK.png'))

if __name__ == '__main__':
    lighten_king()
