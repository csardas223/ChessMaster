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
VT = os.path.join(HERE, '..', 'research', 'frames', 'video_thumbs')
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

IDS = 'GGvpHVEgqwY 134MBhzRN2c 1Q4rfOd0al8 2xysVDt8Qzs 34iAKIAMKb8 3PfBlaosAmY 3_eutZExN2c 4oJgefAYN4k 5K72RRDBN5U 88CgS9anXJs 8XmhGMnypjc 9bvch-UHQhg BbgwPj-u_gs LjehdkzmCho Pz5ZWCrUQyY Swv1fEVI_CM WXcmWG7Eczs mm11vzcLPhk q8dteqd_2YY'.split()
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
    'GGvpHVEgqwY': ('maxres1', (297, 8, 319, 30)),      # PietroCheckmate (player bar, top right)
    'Swv1fEVI_CM': ('maxres2', (306, 10, 336, 40)),     # RealMrHater
    'BbgwPj-u_gs': ('maxres2', (5, 5, 265, 265)),      # 5D Chess title screen (built-in engine)
}
SP = os.path.join(HERE, '..', 'research', 'frames', 'sprites')
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
def kotb():
    # King of the Bridge endings: the rule-book page (WEYUcaJTBso frame, 'RULE 00' book) shown on accusations, and the
    # ending cards (the troll art from each ending video's thumbnail / last-quarter frame)
    rb = frame('WEYUcaJTBso', 'maxres2').crop([int(v * K) for v in (262, 30, 480, 182)]); save(rb, '0LO0D0rOif0', 'rulebook.jpg', quality=86)
    save(frame('0LO0D0rOif0', 'maxresdefault').crop([int(v * K) for v in (10, 70, 470, 262)]), '0LO0D0rOif0', 'ending.jpg', quality=86)
    save(frame('1FKa1LnTDeQ', 'maxres3').crop([int(v * K) for v in (40, 0, 440, 230)]), '1FKa1LnTDeQ', 'ending.jpg', quality=86)
    save(frame('4KetMbEVvhI', 'maxresdefault').crop([int(v * K) for v in (10, 70, 470, 262)]), '4KetMbEVvhI', 'ending.jpg', quality=86)
def xiangqi8():
    # Chinese Chess vs Modern Chess: the Chinese side's horse / general / soldier icons as drawn in the video (maxres1 frame,
    # top rows of the board); square colour keyed out like tools/g4_sprites.py 'cut'
    import sys; sys.path.insert(0, HERE); from g4_sprites import key_out, pad_square
    fr = frame('GGvpHVEgqwY', 'maxres1')
    for name, box in [('horse.png', (63, 9, 93, 38)), ('general.png', (127, 9, 157, 38)), ('soldier.png', (31, 73, 61, 102))]:
        im = key_out(fr.crop([int(v * K) for v in box]), tol=46, seedall=True)
        save(pad_square(im, 0.06).resize((96, 96), Image.LANCZOS), 'GGvpHVEgqwY', name)
def xq_board():
    # Xiangqi board as on xiangqi.com in the video's frames (fUQXSj5jVUk maxres1-3): cream paper, thin grey lines through the
    # square centres (pieces stand on intersections), palace diagonals, open river with faint text. One cell = 90 px.
    from PIL import ImageDraw, ImageFont
    S = 90; W, H = 9 * S, 10 * S; im = Image.new('RGB', (W, H), (251, 248, 238)); d = ImageDraw.Draw(im)
    bg = (246, 246, 234)  # paper colour sampled from the frames (research spec: #f6f6ea)
    im.paste(bg, (0, 0, W, H)); line = (120, 116, 108); c = lambda k: S // 2 + k * S
    for r in range(10): d.line((c(0), c(r), c(8), c(r)), fill=line, width=2)
    for f in range(9):
        if f in (0, 8): d.line((c(f), c(0), c(f), c(9)), fill=line, width=2)
        else: d.line((c(f), c(0), c(f), c(4)), fill=line, width=2); d.line((c(f), c(5), c(f), c(9)), fill=line, width=2)
    for r0 in (0, 7): d.line((c(3), c(r0), c(5), c(r0 + 2)), fill=line, width=2); d.line((c(5), c(r0), c(3), c(r0 + 2)), fill=line, width=2)
    try: font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 26)
    except Exception: font = ImageFont.load_default()
    d.text((c(1), c(4) + 30), 'XIANGQI', fill=(200, 196, 186), font=font); d.text((c(5), c(4) + 30), 'XIANGQI.COM', fill=(200, 196, 186), font=font)
    save(im, 'fUQXSj5jVUk', 'board.png')
if __name__ == '__main__':
    extras(); snake(); checkers(); kotb(); xiangqi8(); xq_board()
    for vid in IDS:
        intro(vid)
        if vid in OPP: avatar(vid, OPP[vid][0], OPP[vid][1], vid)
        avatar('134MBhzRN2c', 'maxres3', (185, 80, 295, 190), vid, 'you.png')
    print('ok')
