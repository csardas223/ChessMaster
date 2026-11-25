#!/usr/bin/env python3
"""Group 5 (impl-5, seventh session): art for the 27 group-5 modes that have no research sprite. Everything is copied
from the video itself (owner rule 2026-11-24 10:13 PM ET, no invented art):
  - intro.jpg  : the video's own thumbnail/title card (i.ytimg.com/vi/<id>/maxresdefault.jpg), shown over the board for
                 1.6 s when a game starts (same 'g5intro' overlay as tools/g5_wire_sprites.py)
  - opponent.png: the opponent's chess.com player-bar avatar cut from the video stills (maxres1..3 = frames YouTube
                 grabs from the video), only where the bar shows one
  - Seirawan Chess hawk + elephant: the video's own piece art from its rules explainer (DGlqJG6kzn8 maxres1); black =
                 darkened copy (inferred: the explainer only shows the white pieces)
Boxes are (l, t, r, b) on the 1280x720 still. Run from rebuild/app:  python3 tools/g5_thumbcrops.py"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from PIL import Image
from g5_frames import frame, outline_cut, trim, square, darken, save
from g5_wire_sprites import patch, rel

IDS = ('DGlqJG6kzn8 EqOwqolOZOo Fbk0Xbcz728 GQ6MT1m78Yo IbRrzKtieqs IjUqZLgF_xM LK1gJhFKgwU Obcl5GCtNHc Oj5rYPqpldg '
       'SC1loYlAJRE SmCty_pVF7A TsA-ro0GZ0I VV9Wb6egokU WGuczpW2zds X5kLXAJeAQI XhtzHTEsh9Q XrS4pFAd56c XxsQ7s3UYAc '
       'YP-PIQhyGwE YZjdissxTyA ZP5cnusxKgA Zdkiyvn1iLA amZRnocbNr8 bLwXpCK_h4k cYVauucyLyQ cxUz0IjYQMQ d8pJkdxtXAA').split()
OPP = {  # chess.com player-bar avatar of the opponent named in the mode file
    'SC1loYlAJRE': ('maxres1', (804, 54, 857, 108)),    # GothamChess
    'SmCty_pVF7A': ('maxres2', (806, 25, 855, 73)),     # FeFiFoFimothy (default pawn avatar)
    'XhtzHTEsh9Q': ('maxres1', (834, 32, 900, 98)),     # Martin (250)
    'amZRnocbNr8': ('maxres2', (811, 16, 869, 74)),     # Judit
    'Oj5rYPqpldg': ('maxres1', (828, 28, 913, 112)),    # chadkatter
    'VV9Wb6egokU': ('maxres2', (876, 33, 945, 101)),    # YugoBandai
    'ZP5cnusxKgA': ('maxres2', (767, 28, 839, 100)),    # PlayerOCh
    'YZjdissxTyA': ('maxres2', (756, 30, 828, 102)),    # Neocolouri... (Cross Derby opponent)
    'GQ6MT1m78Yo': ('maxres2', (794, 16, 852, 74)),     # Martin XIII (baby Martin)
    'Fbk0Xbcz728': ('maxres2', (868, 22, 913, 67)),     # HPD_Phuongnguyen2013 (default pawn avatar)
    'X5kLXAJeAQI': ('maxres3', (806, 25, 856, 74)),     # papangmaster (default pawn avatar)
}
PIECES = {'DGlqJG6kzn8': [('hawk', 'H', (175, 60, 405, 305)), ('elephant', 'E', (175, 340, 405, 645))]}

def main(only):
    for vid in IDS:
        if only and vid not in only: continue
        done = []
        im = frame(vid, 'maxresdefault').resize((640, 360), Image.LANCZOS)
        d = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'assets', 'modes', vid); os.makedirs(d, exist_ok=True)
        im.save(os.path.join(d, 'intro.jpg'), quality=84, optimize=True)
        done.append(('thumb', 'intro', None, rel(vid, 'intro.jpg'), None))
        if vid in OPP:
            var, box = OPP[vid]; c = frame(vid, var).crop(box); s = min(c.size); l, t = (c.size[0] - s) // 2, (c.size[1] - s) // 2
            c.crop((l, t, l + s, t + s)).resize((96, 96), Image.LANCZOS).save(os.path.join(d, 'opponent.png'), optimize=True)
            done.append(('bar', 'avatar', None, rel(vid, 'opponent.png'), None))
        for (name, t, box) in PIECES.get(vid, []):
            p = square(trim(outline_cut(frame(vid, 'maxres1').crop(box), 28)))
            save(p, vid + '/' + name + '.png', 160); save(darken(p, 0.42), vid + '/' + name + '_b.png', 160)
            done.append((name, 'piece', t, rel(vid, name + '.png'), rel(vid, name + '_b.png')))
        patch(vid, done)

if __name__ == '__main__':
    main(sys.argv[1:])
