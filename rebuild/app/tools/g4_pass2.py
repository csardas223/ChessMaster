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
    if not [a for a in sys.argv[1:] if not a.startswith('-') and not a.endswith('.png')] or any('1L_' in a or 'rainbow' in a for a in sys.argv[1:]): post()
