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
