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

ANARCHY_SQ = (((234, 233, 214), 24), ((90, 114, 150), 30), ((236, 168, 120), 40), ((196, 140, 115), 40))
def flood_key(im, seeds=None, open_lines=False, colours=ANARCHY_SQ):
    """background = pixels connected to the crop border that are close to a board-square colour (the video's cream
    #eae9d6 / blue #5a7296 squares, or the orange last-move tint); everything else (the piece, its outline and face) stays
    opaque. Islands that are not part of the largest opaque part (board coordinate letters, neighbour slivers) are dropped."""
    from scipy.ndimage import label, binary_dilation
    a = np.asarray(im.convert('RGB')).astype(int); h, w, _ = a.shape
    cand = np.zeros((h, w), bool)
    for c, t in colours:
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

# ------------------------------------------------ Chess Knightmare (zxRM5dD5b7w): 6:28 level frame (Swedish cow level)
# board x 551..1367, y 137..953 (8 x 102 px), light #fdf89d, dark #a4630f. White knight (crowned) d4, Rock (grey stone with a
# stained-glass window) e7, black army on rank 8/7 (f8 bishop carries a red hit mark, c8 used).
KM_SQ = (((253, 248, 157), 34), ((164, 99, 15), 34))
def km_cell(F, f, row, m=0):
    x = 551 + f * 102; y = 137 + row * 102
    return F.crop((x - m, y - m, x + 102 + m, y + 102 + m))
def knightmare():
    F = frame('zxRM5dD5b7w', 388)
    cuts = {'knight_w': (3, 4), 'rock': (4, 1), 'rook_b': (0, 0), 'bishop_b': (2, 0), 'queen_b': (3, 0), 'king_b': (4, 0),
            'knight_b': (6, 0), 'pawn_b': (0, 1)}
    for k, (f, row) in cuts.items():
        save(square(trim(flood_key(km_cell(F, f, row, 2), colours=KM_SQ))), 'zxRM5dD5b7w/%s.png' % k, 128)

JOBS = {'fool': fool, 'anarchy': anarchy, 'knightmare': knightmare}

# ------------------------------------------------ Shotgun King (pzxXxIsKRRo): the white army, rebuilt pixel for pixel
# The game renders 16x16-pixel sprites at 6 screen px per pixel under a CRT scanline filter; board x 576..1344, y 178..946
# (96 px squares). Each game pixel is sampled (4x4 block mean) and snapped to the game's 3-colour palette (navy outline,
# cream fill, lavender detail); outside = flood from the sprite border over non-outline pixels (4-connected), transparent.
SK_PAL = {'o': (26, 26, 52), 'c': (247, 226, 198), 'l': (160, 140, 196)}
def sk_sprite(F, f, r, top=3):
    """classify each game pixel; the sprite = per row, everything from the leftmost to the rightmost outline pixel (the
    sprites' bases are open and the lavender detail lines touch the outline, so a flood fill would leak). Above the board
    the page is navy too: there a dark pixel only counts as outline when it touches a cream one (the king's cross)."""
    a = np.asarray(F).astype(float); X0, Y0, P = 576, 179, 6
    H, W = 16 + top, 16
    cls = np.empty((H, W), dtype='<U1')
    for gy in range(H):
        for gx in range(W):
            x = X0 + f * 96 + gx * P; y = Y0 + r * 96 + (gy - top) * P
            c = a[y + 1:y + 5, x + 1:x + 5].reshape(-1, 3).mean(0)
            cls[gy, gx] = min(SK_PAL, key=lambda k: ((c - np.array(SK_PAL[k])) ** 2).sum())
    if r == 0:
        for gy in range(top):
            for gx in range(W):
                nb = ((1, 0), (-1, 0), (0, -1)) if gy == top - 1 else ((1, 0), (-1, 0), (0, 1), (0, -1))   # not the board below
                if cls[gy, gx] == 'o' and not any(0 <= gx + dx < W and 0 <= gy + dy < H and cls[gy + dy, gx + dx] == 'c'
                                                  for dx, dy in nb): cls[gy, gx] = 'x'
                elif cls[gy, gx] == 'l': cls[gy, gx] = 'x'
    img = np.zeros((H, W, 4), 'uint8')
    for y in range(H):
        xs = [x for x in range(W) if cls[y, x] == 'o']
        if not xs or len(xs) >= 12: continue      # the board's top edge line is not part of a sprite
        for x in range(min(xs), max(xs) + 1):
            if cls[y, x] != 'x': img[y, x] = SK_PAL[cls[y, x]] + (255,)
    return trim(Image.fromarray(img, 'RGBA'), 0)

def shotgun():
    F1, F8 = frame('pzxXxIsKRRo', 111), frame('pzxXxIsKRRo', 1017)
    cuts = {'wN': (F1, 2, 0), 'wK': (F1, 3, 0), 'wB': (F1, 4, 0), 'wP': (F1, 2, 1), 'wR': (F8, 4, 0)}   # (frame, file, row from the top)
    for k, (F, f, r) in cuts.items():
        im = sk_sprite(F, f, r, 3 if r == 0 else 0)
        s = Image.new('RGBA', (16, 19), (0, 0, 0, 0)); s.paste(im, ((16 - im.size[0]) // 2, 19 - im.size[1] - 1))
        save(s.resize((16 * 8, 19 * 8), Image.NEAREST), 'pzxXxIsKRRo/%s.png' % k)


def shotgun_fx():
    """the shot at 3:59 (frame 239, the king fires from a5): three ejected shells above the king and the spark trail along the
    barrel, on the dark square a6 (lavender background -> transparent). Game pixels x 576.., y 311..371; the king's own cross
    (rows 9-11, columns 5-9 of this box) is blanked."""
    a = np.asarray(frame('pzxXxIsKRRo', 239)).astype(float); X0, Y0, W, H = 576, 311, 16, 10
    img = np.zeros((H, W, 4), 'uint8')
    for gy in range(H):
        for gx in range(W):
            x = X0 + gx * 6; y = Y0 + gy * 6
            c = a[y + 1:y + 5, x + 1:x + 5].reshape(-1, 3).mean(0)
            k = min(SK_PAL, key=lambda q: ((c - np.array(SK_PAL[q])) ** 2).sum())
            if k == 'l' or (gy >= 7 and 4 <= gx <= 8) or gx >= 15: continue
            img[gy, gx] = SK_PAL[k] + (255,)
    im = trim(Image.fromarray(img, 'RGBA'), 0)
    save(im.resize((im.size[0] * 8, im.size[1] * 8), Image.NEAREST), 'pzxXxIsKRRo/muzzle.png')

JOBS['shotgun'] = shotgun
JOBS['shotfx'] = shotgun_fx
if __name__ == '__main__':
    only = sys.argv[1:]
    for k, fn in JOBS.items():
        if not only or any(k.startswith(o) for o in only): fn()
