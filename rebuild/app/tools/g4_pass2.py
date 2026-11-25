#!/usr/bin/env python3
"""Group-4 (impl-4, eighth session) pass-2 art cut from the video stills (owner rule 2026-11-24 10:13 PM ET: art is copied
from the videos, never invented). Same sources/methods as tools/g4_sprites.py (it is imported): ('fr', vid, variant) =
i.ytimg.com/vi/<vid>/<variant>.jpg cached in research/frames/video_thumbs (maxres1..3 = frames at 25/50/75%).
Boxes are (l, t, r, b) in 1280x720 frame pixels.
Run from rebuild/app:  python3 tools/g4_pass2.py [--preview out.png] [filter]"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import g4_sprites as G
from PIL import Image

def F(v, k): return ('fr', v, k)
MAP = [
    # Passant: The Conclusion
    ('1L_sxGgxX9M/rainbow_bishop.png', F('1L_sxGgxX9M', 'maxres1'), 'cut', (402, 554, 448, 612), {'tol': 70}),
    ('1L_sxGgxX9M/rainbow_card.png', F('1L_sxGgxX9M', 'maxres2'), 'raw', (8, 158, 242, 362), {}),
    ('1L_sxGgxX9M/boss_card.png', F('1L_sxGgxX9M', 'maxres3'), 'raw', (8, 106, 242, 362), {}),
    ('1L_sxGgxX9M/beam.png', F('1L_sxGgxX9M', 'maxres3'), 'raw', (398, 192, 418, 396), {}),
    ('1L_sxGgxX9M/shop_full.png', F('1L_sxGgxX9M', 'maxres1'), 'raw', (360, 88, 964, 500), {'max': 640}),
    # Chess vs Shogi: the GUI draws Fairy-Stockfish's lance and silver as these two shapes (other shogi pieces use chess glyphs)
    ('8rqN9o9lZOM/lance_b.png', F('8rqN9o9lZOM', 'maxres1'), 'cut', (80, 25, 149, 94), {'tol': 50}),
    ('8rqN9o9lZOM/silver_b.png', F('8rqN9o9lZOM', 'maxres1'), 'cut', (230, 25, 299, 94), {'tol': 50}),
    ('8rqN9o9lZOM/fairy_stockfish.png', F('8rqN9o9lZOM', 'maxres1'), 'tile', (774, 30, 834, 90), {}),
    ('3Sr5lJbHKKU/fairy_stockfish.png', F('8rqN9o9lZOM', 'maxres1'), 'tile', (774, 30, 834, 90), {}),
    ('inm7KvllVu0/stockfish.png', F('inm7KvllVu0', 'maxres1'), 'tile', (789, 35, 841, 87), {}),
    ('8rqN9o9lZOM/ref_card.png', F('8rqN9o9lZOM', 'maxres1'), 'raw', (862, 120, 1146, 685), {}),
    # Soko Chess (level 4 'Cunning Pawns' still)
    ('7lEglazTlo8/pawn_b.png', F('7lEglazTlo8', 'maxres1'), 'cut', (646, 251, 689, 294), {'tol': 60}),
    ('7lEglazTlo8/pawn_y.png', F('7lEglazTlo8', 'maxres1'), 'cut', (725, 318, 756, 360), {'tol': 60}),
    ('7lEglazTlo8/target_red.png', F('7lEglazTlo8', 'maxres1'), 'cut', (705, 440, 721, 466), {'tol': 60, 'max': 64}),
    ('7lEglazTlo8/target_green.png', F('7lEglazTlo8', 'maxres1'), 'cut', (704, 312, 723, 338), {'tol': 60, 'max': 64}),
    ('7lEglazTlo8/undo.png', F('7lEglazTlo8', 'maxres1'), 'cut', (536, 616, 608, 688), {'tol': 60, 'max': 96}),
    ('7lEglazTlo8/restart.png', F('7lEglazTlo8', 'maxres1'), 'cut', (660, 616, 732, 688), {'tol': 60, 'max': 96}),
]

# Anarchy Chess: the site's hand-drawn meme pieces, cut from the 50%/75% stills (10x10 board, 68 px squares). Kept at
# board scale (no trim) so the underage pawn stays small; stray coordinate letters removed (largest blob kept).
ANARCHY = [
    ('WXcmWG7Eczs/K_w.png', F('WXcmWG7Eczs', 'maxres3'), 'cut', (315, 629, 379, 693), {'tol': 45}),
    ('WXcmWG7Eczs/R_w.png', F('WXcmWG7Eczs', 'maxres3'), 'cut', (383, 629, 447, 693), {'tol': 45}),
    ('WXcmWG7Eczs/B_w.png', F('WXcmWG7Eczs', 'maxres3'), 'cut', (519, 629, 583, 693), {'tol': 45}),
    ('WXcmWG7Eczs/Q_w.png', F('WXcmWG7Eczs', 'maxres3'), 'cut', (519, 561, 583, 625), {'tol': 45}),
    ('WXcmWG7Eczs/P_w.png', F('WXcmWG7Eczs', 'maxres3'), 'cut', (111, 561, 175, 625), {'tol': 45}),
    ('WXcmWG7Eczs/U_w.png', F('WXcmWG7Eczs', 'maxres3'), 'cut', (315, 561, 379, 625), {'tol': 45}),
    ('WXcmWG7Eczs/N_w.png', F('WXcmWG7Eczs', 'maxres3'), 'cut', (247, 493, 311, 557), {'tol': 45}),
    ('WXcmWG7Eczs/Knook_w.png', F('WXcmWG7Eczs', 'maxres3'), 'cut', (315, 493, 379, 557), {'tol': 45}),
    ('WXcmWG7Eczs/Iq_w.png', F('WXcmWG7Eczs', 'maxres3'), 'cut', (451, 493, 515, 557), {'tol': 45}),
    ('WXcmWG7Eczs/Ch_w.png', F('WXcmWG7Eczs', 'maxres3'), 'cut', (315, 357, 379, 421), {'tol': 45}),
    ('WXcmWG7Eczs/T_n.png', F('WXcmWG7Eczs', 'maxres3'), 'cut', (723, 425, 787, 489), {'tol': 45}),
    ('WXcmWG7Eczs/R_b.png', F('WXcmWG7Eczs', 'maxres3'), 'cut', (111, 17, 175, 81), {'tol': 45}),
    ('WXcmWG7Eczs/B_b.png', F('WXcmWG7Eczs', 'maxres3'), 'cut', (315, 17, 379, 81), {'tol': 45}),
    ('WXcmWG7Eczs/Q_b.png', F('WXcmWG7Eczs', 'maxres3'), 'cut', (383, 17, 447, 81), {'tol': 45}),
    ('WXcmWG7Eczs/K_b.png', F('WXcmWG7Eczs', 'maxres3'), 'cut', (655, 17, 719, 81), {'tol': 45}),
    ('WXcmWG7Eczs/P_b.png', F('WXcmWG7Eczs', 'maxres3'), 'cut', (179, 85, 243, 149), {'tol': 45}),
    ('WXcmWG7Eczs/U_b.png', F('WXcmWG7Eczs', 'maxres3'), 'cut', (315, 85, 379, 149), {'tol': 45}),
    ('WXcmWG7Eczs/N_b.png', F('WXcmWG7Eczs', 'maxres3'), 'cut', (247, 153, 311, 217), {'tol': 45}),
    ('WXcmWG7Eczs/Knook_b.png', F('WXcmWG7Eczs', 'maxres3'), 'cut', (315, 153, 379, 217), {'tol': 45}),
    ('WXcmWG7Eczs/Ch_b.png', F('WXcmWG7Eczs', 'maxres3'), 'cut', (451, 153, 515, 217), {'tol': 45}),
    ('WXcmWG7Eczs/Iq_b.png', F('WXcmWG7Eczs', 'maxres2'), 'cut', (247, 493, 311, 557), {'tol': 45}),
]

def largest_blob(im):
    w, h = im.size; px = im.load(); seen = bytearray(w * h); best = []
    for y0 in range(h):
        for x0 in range(w):
            if seen[y0 * w + x0] or px[x0, y0][3] == 0: continue
            comp = []; st = [(x0, y0)]; seen[y0 * w + x0] = 1
            while st:
                x, y = st.pop(); comp.append((x, y))
                for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                    if 0 <= nx < w and 0 <= ny < h and not seen[ny * w + nx] and px[nx, ny][3]: seen[ny * w + nx] = 1; st.append((nx, ny))
            if len(comp) > len(best): best = comp
    keep = set(best)
    for y in range(h):
        for x in range(w):
            if px[x, y][3] and (x, y) not in keep: px[x, y] = (0, 0, 0, 0)
    return im

def anarchy():
    for dest, s, how, box, o in ANARCHY:
        im = G.key_out(G.src(s).convert('RGBA').crop(box), o.get('tol', 45))
        im = largest_blob(im).resize((128, 128), Image.LANCZOS)
        im.save(os.path.join(G.OUT, dest), optimize=True)
    # the only white Inverse Queen in the stills has the site's orange arrow over it: rebuild it from the black one
    # (same drawing) by turning its grey fill white and keeping the dark outline, as the site draws white pieces
    b = Image.open(os.path.join(G.OUT, 'WXcmWG7Eczs/Iq_b.png')).convert('RGBA'); px = b.load()
    for y in range(b.size[1]):
        for x in range(b.size[0]):
            r, g, bb, a = px[x, y]
            if a and G.lum((r, g, bb)) if hasattr(G, 'lum') else False: pass
            l = (r * 299 + g * 587 + bb * 114) // 1000
            if a and l > 62: px[x, y] = (250, 250, 250, a)
    b.save(os.path.join(G.OUT, 'WXcmWG7Eczs/Iq_w.png'), optimize=True)

def post():
    # the Rainbow Bishop crop keeps the edge line of its square on both sides: keep only the piece's own column
    p = os.path.join(G.OUT, '1L_sxGgxX9M/rainbow_bishop.png')
    if os.path.exists(p):
        im = Image.open(p).convert('RGBA'); w, h = im.size; px = im.load()
        for y in range(h):
            half = 0.20 * w if y < 0.42 * h else 0.33 * w
            for x in range(w):
                if abs(x - w / 2) > half: px[x, y] = (0, 0, 0, 0)
        im.save(p, optimize=True)

if __name__ == '__main__':
    G.MAP = MAP; G.run(sys.argv[1:])
    if not sys.argv[1:] or any('WXcm' in a for a in sys.argv[1:]): anarchy()
    if not [a for a in sys.argv[1:] if not a.startswith('-') and not a.endswith('.png')] or any('1L_' in a or 'rainbow' in a for a in sys.argv[1:]): post()
