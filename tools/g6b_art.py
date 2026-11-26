"""g6b art (2026-11-25): Ouroboros King (rf2HSTXTehE) Prince + Marching Pawn icons from the video's recruit cards
(research/frames/video_thumbs/rf2HSTXTehE_frame_70.jpg 1:10 and _frame_82.jpg 1:22; icon box ~(1395,240)-(1505,345)),
cut like g5_art5.ouro() cuts the Glass Queen; black = fill/outline swap (inferred, as the game draws the enemy side).
Also shares JAz_qMQpI1o's Glass Queen + Reaper cuts with rf2HSTXTehE."""
import os, shutil
from PIL import Image, ImageOps
from g5_frames import trim, square, save
from g5_art4 import invert_rgb, abs_key
HERE = os.path.dirname(os.path.abspath(__file__))
THUMBS = os.path.join(HERE, '..', '..', 'research', 'frames', 'video_thumbs')
A = os.path.join(HERE, '..', 'assets', 'modes')
def frame(vid, t): return Image.open(os.path.join(THUMBS, '%s_frame_%s.jpg' % (vid, t))).convert('RGB')
def icon(F, box):
    im = abs_key(F.crop(box), 30)
    a = im.getchannel('A'); im = Image.merge('RGBA', (*ImageOps.autocontrast(im.convert('L')).convert('RGB').split(), a))
    return square(trim(im), False)
for name, t in (('marching_pawn', 70), ('prince', 82)):
    im = icon(frame('rf2HSTXTehE', t), (1395, 240, 1505, 345))
    save(im, 'rf2HSTXTehE/%s_w.png' % name, 120); save(invert_rgb(im), 'rf2HSTXTehE/%s_b.png' % name, 120)
for n in ('glass_queen_w', 'glass_queen_b', 'reaper_w', 'reaper_b'):
    shutil.copy(os.path.join(A, 'JAz_qMQpI1o', n + '.png'), os.path.join(A, 'rf2HSTXTehE', n + '.png'))

# ---- Pawnbarian Golem Fortress (zP9TzlgA-W0): monster tokens cut from the repo stills (maxres3 = Floor 5, maxres2 = Floor 3),
# as round tokens like g5_art5.monster() (the cells carry the red target notches right up to the sprites). Names follow the
# transcript's floor-5 roster (guard golem, spewer golem, coil golem, spark imps); which sprite is which is inferred except the
# imp (the floor-3 foe that "attacks targeted squares", maxres2).
def token(F, x, y, c, m=4):
    im = F.crop((round(x - m), round(y - m), round(x + c + m), round(y + c + m))).convert('RGBA')
    w, h = im.size; px = im.load(); R = w / 2.0
    for yy in range(h):
        for xx in range(w):
            d = ((xx + .5 - R) ** 2 + (yy + .5 - R) ** 2) ** .5
            px[xx, yy] = px[xx, yy][:3] + (0 if d > R else 255 if d < R - 4 else int(255 * (R - d) / 4),)
    return im
V3 = Image.open(os.path.join(THUMBS, 'zP9TzlgA-W0_maxres3.jpg')).convert('RGB'); X3, Y3, C3 = 440, 60, 84
V2 = Image.open(os.path.join(THUMBS, 'zP9TzlgA-W0_maxres2.jpg')).convert('RGB'); X2, Y2, C2 = 440, 62, 83.2
for name, (cc, rr, dy) in (('guard_golem', (2, 3, -12)), ('spewer_golem', (2, 1, 0)), ('coil_golem', (1, 2, 0)), ('knight_golem', (1, 1, 0))):
    save(token(V3, X3 + cc * C3, Y3 + rr * C3 + dy, C3), 'zP9TzlgA-W0/%s.png' % name, 120)
save(token(V2, X2 + 1 * C2, Y2 + 1 * C2, C2), 'zP9TzlgA-W0/spark_imp.png', 120)
