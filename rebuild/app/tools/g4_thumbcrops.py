#!/usr/bin/env python3
"""Group-4 (impl-4, seventh session) art for the 18 group-4 modes with no research sprite. Everything is copied from
the video itself (owner rule 2026-11-24 10:13 PM ET): the thumbnail (i.ytimg.com/vi/<id>/maxresdefault.jpg) becomes the
mode's intro card, and the chess.com player-bar avatars visible in the video's own frames (maxres1..3 = frames YouTube
grabs at 25/50/75%) become the opponent avatar. The player avatar is iwantcheckmate's purple king icon from the video's
end card (134MBhzRN2c maxres3). Boxes are (l, t, r, b) measured on a 480x270 preview (scaled x 1280/480).
Run from rebuild/app:  python3 tools/g4_thumbcrops.py"""
import os, urllib.request
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(HERE, '..', 'assets', 'modes')
VT = os.path.join(HERE, '..', '..', 'research', 'frames', 'video_thumbs')
K = 1280 / 480

def frame(vid, var):
    os.makedirs(VT, exist_ok=True); p = os.path.join(VT, vid + '_' + var + '.jpg')
    if not os.path.exists(p):
        open(p, 'wb').write(urllib.request.urlopen('https://i.ytimg.com/vi/%s/%s.jpg' % (vid, var), timeout=30).read())
    return Image.open(p).convert('RGB')

def save(im, mid, name, **kw):
    d = os.path.join(OUT, mid); os.makedirs(d, exist_ok=True); im.save(os.path.join(d, name), optimize=True, **kw)

def avatar(vid, var, box, mid, name='opponent.png', size=96):
    im = frame(vid, var); W = im.size[0] / 1280
    b = [int(v * K * W) for v in box]; c = im.crop(b)
    s = min(c.size); l, t = (c.size[0] - s) // 2, (c.size[1] - s) // 2
    save(c.crop((l, t, l + s, t + s)).resize((size, size), Image.LANCZOS), mid, name)

def intro(vid):
    im = frame(vid, 'maxresdefault'); save(im.resize((640, 360), Image.LANCZOS), vid, 'intro.jpg', quality=84)

IDS = '134MBhzRN2c 1Q4rfOd0al8 2xysVDt8Qzs 34iAKIAMKb8 3PfBlaosAmY 3_eutZExN2c 4oJgefAYN4k 5K72RRDBN5U 88CgS9anXJs 8XmhGMnypjc 9bvch-UHQhg BbgwPj-u_gs LjehdkzmCho Pz5ZWCrUQyY Swv1fEVI_CM WXcmWG7Eczs mm11vzcLPhk q8dteqd_2YY'.split()
# opponent avatars from the chess.com player bar in the video's frames
OPP = {
    '34iAKIAMKb8': ('maxres2', (310, 10, 340, 40)),     # Dan-kyu_S
    '3PfBlaosAmY': ('maxres3', (327, 10, 355, 38)),     # cookieVortex
    '3_eutZExN2c': ('maxres2', (301, 10, 327, 38)),     # minhduc77
    '4oJgefAYN4k': ('maxres3', (287, 12, 313, 38)),     # miradilzey
    '5K72RRDBN5U': ('maxres2', (325, 8, 345, 28)),      # PhillipsHea
    '88CgS9anXJs': ('maxres3', (287, 12, 313, 40)),     # BobbyFisc...
    '9bvch-UHQhg': ('maxres3', (322, 12, 344, 34)),     # Gandalf_77
    '8XmhGMnypjc': ('maxres1', (320, 8, 348, 36)),      # teammate portrait in the 4PC sidebar
    'WXcmWG7Eczs': ('maxres2', (300, 228, 332, 260)),   # slomg
    'mm11vzcLPhk': ('maxres1', (302, 10, 320, 28)),     # torima
    'q8dteqd_2YY': ('maxres2', (280, 6, 312, 38)),      # BIGGESTBAUCE
    'Swv1fEVI_CM': ('maxres2', (306, 10, 336, 40)),     # RealMrHater
    'BbgwPj-u_gs': ('maxres2', (5, 5, 265, 265)),      # 5D Chess title screen (built-in engine)
}
SP = os.path.join(HERE, '..', '..', 'research', 'frames', 'sprites')
def sprite_crop(src, box, mid, name, size=None):
    im = Image.open(os.path.join(SP, src)).convert('RGB').crop(box)
    if size: im = im.resize((size, size), Image.LANCZOS)
    save(im, mid, name)
def extras():
    # Spell Chess grass board: one light and one dark square cut from the video's grass board sprite (8CtX9G07bMU)
    for mid in ['8CtX9G07bMU', 'Ag3KKsIrax4']:
        sprite_crop('8CtX9G07bMU_grass_board.png', (3, 3, 40, 40), mid, 'grass_light.png', 64)
        sprite_crop('8CtX9G07bMU_grass_board.png', (45, 3, 82, 40), mid, 'grass_dark.png', 64)
def snake():
    # Snake vs Chess: head = the video's snake-head sprite (eyes look up = travel direction); body = a plain green strip of
    # the same sprite below the eyes, squared
    im = Image.open(os.path.join(SP, 'H_5UviR2nTU_snake_head.png')).convert('RGB')
    save(im.crop((6, 6, 122, 122)).resize((96, 96), Image.LANCZOS), 'H_5UviR2nTU', 'head.png')
    save(im.crop((14, 92, 114, 120)).resize((96, 96), Image.LANCZOS), 'H_5UviR2nTU', 'body.png')
def checkers():
    # Chess vs Checkers bonus segment: the real checkers board in the video (maxres2 frame): red / black men, wood squares
    fr = frame('3Sr5lJbHKKU', 'maxres2'); b = fr.crop([int(v * K) for v in (128, 18, 352, 242)])  # the board, ~72 px squares
    sq = lambda r, c: (13 + 72 * c, 13 + 72 * r, 85 + 72 * c, 85 + 72 * r)
    for name, rc in [('red.png', (0, 1)), ('black.png', (7, 0)), ('wood_light.png', (0, 0)), ('wood_dark.png', (3, 0))]:
        im = b.crop(sq(*rc)).resize((72, 72), Image.LANCZOS)
        if name in ('red.png', 'black.png'):  # keep the disc, clear the wood around it (circular mask)
            from PIL import ImageDraw
            m = Image.new('L', (72, 72), 0); ImageDraw.Draw(m).ellipse((4, 4, 67, 67), fill=255)
            o = Image.new('RGBA', (72, 72), (0, 0, 0, 0)); o.paste(im, (0, 0), m); im = o
        save(im, '3Sr5lJbHKKU', name)
    print('felt', fr.getpixel((60, 400)))
if __name__ == '__main__':
    extras(); snake(); checkers()
    for vid in IDS:
        intro(vid)
        if vid in OPP: avatar(vid, OPP[vid][0], OPP[vid][1], vid)
        avatar('134MBhzRN2c', 'maxres3', (185, 80, 295, 190), vid, 'you.png')
    print('ok')
