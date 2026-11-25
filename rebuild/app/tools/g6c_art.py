#!/usr/bin/env python3
"""art-g6 part C (2026-11-25, owner: exact YouTube frames allowed when no repo sprite/still exists).
Cuts from paused 1080p full-screen youtube.com frames committed as research/frames/video_thumbs/<id>_frame_<s>.jpg
(1920x1080, no downloaders, no audio). Nothing drawn except where noted as a patch.
Run from rebuild/app:  python3 tools/g6c_art.py [job ...]
Credit: all art (c) the original games / iwantcheckmate videos."""
import os, sys, shutil
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from PIL import Image, ImageOps
import numpy as np
from g5_frames import trim, square, save
from g5_art4 import invert_rgb, abs_key
HERE = os.path.dirname(os.path.abspath(__file__))
THUMBS = os.path.join(HERE, '..', '..', 'research', 'frames', 'video_thumbs')
A = os.path.join(HERE, '..', 'assets', 'modes')
def frame(vid, t): return Image.open(os.path.join(THUMBS, '%s_frame_%s.jpg' % (vid, t))).convert('RGB')

def flood_key(im, seeds=None, open_lines=False):
    """background = pixels connected to the crop border that are close to a board-square colour (the video's cream
    #eae9d6 / blue #5a7296 squares, or the orange last-move tint); everything else (the piece, its outline and face) stays
    opaque. Islands that are not part of the largest opaque part (board coordinate letters, neighbour slivers) are dropped."""
    from scipy.ndimage import label, binary_dilation
    a = np.asarray(im.convert('RGB')).astype(int); h, w, _ = a.shape
    cand = np.zeros((h, w), bool)
    for c, t in (((234, 233, 214), 24), ((90, 114, 150), 30), ((236, 168, 120), 40), ((196, 140, 115), 40)):
        cand |= np.sqrt(((a - np.array(c)) ** 2).sum(2)) < t
    lab, n = label(cand)
    edge_labels = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    sizes = np.bincount(lab.ravel())
    big = set(np.nonzero(sizes > 250)[0]) - {0}            # a square's colour area cut off by the thin grid / frame lines
    bg = np.isin(lab, list(edge_labels | big))
    bg[:4, :] = bg[-4:, :] = True; bg[:, :4] = bg[:, -4:] = True   # neighbour squares' edges and the board frame
    fg = ~bg
    if open_lines:   # drop the 1-2 px square-edge lines a wider crop carries (opening, then grow back 3 px inside fg)
        from scipy.ndimage import binary_opening
        core = binary_opening(fg, iterations=2)
        fg = fg & binary_dilation(core, iterations=3)
    lab, n = label(fg)
    if n > 1:
        sizes = np.bincount(lab.ravel()); sizes[0] = 0; keep = lab == sizes.argmax()
        fg = keep
    alpha = (fg * 255).astype('uint8')
    # 1px soft edge against the square colour
    edge = binary_dilation(fg, iterations=1) & ~fg
    alpha[edge] = 90
    out = np.dstack([a.astype('uint8'), alpha])
    return Image.fromarray(out, 'RGBA')

# ------------------------------------------------ Ouroboros King: Fool (rf2HSTXTehE 1:49 recruit card, jester cap)
def fool():
    F = frame('rf2HSTXTehE', 109)
    im = abs_key(F.crop((1390, 230, 1510, 345)), 30)
    a = im.getchannel('A'); im = Image.merge('RGBA', (*ImageOps.autocontrast(im.convert('L')).convert('RGB').split(), a))
    im = square(trim(im), False)
    for d in ('rf2HSTXTehE', 'JAz_qMQpI1o'):
        save(im, d + '/fool_w.png', 120)
        save(invert_rgb(im), d + '/fool_b.png', 120)   # enemy side = fill/outline swap, as the other unit icons (inferred)

# ------------------------------------------------ Anarchy Chess (qDkxrnZfeXw): knook + anti-queen from the 1:42 board
S = 101.9; BX, BY = 173, 23       # 10x10 board in the 1920x1080 frame: x 173..1192, y 23..1042
def cell(F, f, r, m=8):
    x = BX + f * S; y = BY + (10 - r) * S
    return F.crop((round(x) - m, round(y) - m, round(x + S) + m, round(y + S) + m))

def whiten(im):
    a = np.asarray(im.convert('RGBA')).astype(float); L = a[:, :, :3].mean(2)
    v = np.where(L <= 85, np.clip(255 * (L - 15) / 70.0, 0, 250), 250 - np.clip(L - 95, 0, None) * 0.5)
    v = np.where(L < 15, L, v)
    out = np.dstack([v, v, v, a[:, :, 3]]).astype('uint8'); return Image.fromarray(out, 'RGBA')

def anarchy():
    F = frame('qDkxrnZfeXw', 102)
    out = {}
    out['knook_w'] = flood_key(cell(F, 2, 1, 2))          # c1: rook body with the horse head (knook)
    out['knook_b'] = flood_key(cell(F, 2, 10, 2))         # c10
    out['anti_queen_b'] = flood_key(cell(F, 8, 10, 2))    # i10: upside-down jester crown with a face
    # white anti-queen: on every frame checked the white one is covered (1:42 i1: the mouse pointer on its middle; 1:58 h3:
    # the orange move arrow across it, ~85% opaque). The site draws both colours from one outline drawing, so white = the
    # clean black i10 cut with its grey fill lifted to the white side's fill (outline kept; the fill/shade levels sampled
    # from the white pieces on the same frame). Shape exact, fill tone inferred. Frame 118 is kept as the reference.
    out['anti_queen_w'] = whiten(out['anti_queen_b'])
    for k, im in out.items():
        save(square(trim(im)), 'qDkxrnZfeXw/%s.png' % k, 128)

JOBS = {'fool': fool, 'anarchy': anarchy}
if __name__ == '__main__':
    only = sys.argv[1:]
    for k, fn in JOBS.items():
        if not only or any(k.startswith(o) for o in only): fn()
