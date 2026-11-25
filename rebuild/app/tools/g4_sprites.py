#!/usr/bin/env python3
"""Group-4 (impl-4) art copied from the videos (owner instruction 2026-11-24 10:13 PM ET: all mode art comes straight
from the iwantcheckmate videos; no invented/AI art). Sources, in order of preference:
  ('sp', file)            rebuild/research/frames/sprites/<file> (frame crops made during research)
  ('fr', vid, variant)    a real frame/thumbnail of the video from i.ytimg.com (maxresdefault = thumbnail,
                          maxres1..3 = frames YouTube grabs at 25/50/75% of the video, 1280x720), cached in
                          rebuild/research/frames/video_thumbs/
  ('as', path)            an asset another group already cropped from a video (same channel art, e.g. Martin)
Methods: 'tile'  keep the crop as is, centre-squared (avatars, cards, tiles)
         'cut'   key out the flat background connected to the border, trim, pad square (pieces, icons)
         'token' circular Chess Ultimate style token (white ring for White, dark ring for Black) -> <name>_w/_b.png
         'raw'   keep the crop as is, no squaring (overlays, banners, boards)
Box: (l, t, r, b) in source pixels, or fractions (all values <= 1).
Run from rebuild/app:  python3 tools/g4_sprites.py [--preview out.png] [filter]"""
import os, sys, urllib.request
from collections import deque
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
SP = os.path.join(HERE, '..', '..', 'research', 'frames', 'sprites')
VT = os.path.join(HERE, '..', '..', 'research', 'frames', 'video_thumbs')
OUT = os.path.join(HERE, '..', 'assets', 'modes')
AS = os.path.join(HERE, '..')

def src(s):
    if s[0] == 'sp': return Image.open(os.path.join(SP, s[1]))
    if s[0] == 'as': return Image.open(os.path.join(AS, s[1]))
    vid, var = s[1], s[2]; os.makedirs(VT, exist_ok=True); p = os.path.join(VT, vid + '_' + var + '.jpg')
    if not os.path.exists(p):
        data = urllib.request.urlopen('https://i.ytimg.com/vi/%s/%s.jpg' % (vid, var), timeout=30).read()
        open(p, 'wb').write(data)
    return Image.open(p)

def key_out(im, tol=60):
    im = im.convert('RGBA'); w, h = im.size; px = im.load(); seen = bytearray(w * h); q = deque()
    for x, y in [(x, 0) for x in range(w)] + [(x, h - 1) for x in range(w)] + [(0, y) for y in range(h)] + [(w - 1, y) for y in range(h)]:
        if not seen[y * w + x]: seen[y * w + x] = 1; q.append((x, y, px[x, y]))
    while q:
        x, y, ref = q.popleft(); c = px[x, y]
        if abs(c[0] - ref[0]) + abs(c[1] - ref[1]) + abs(c[2] - ref[2]) > tol: continue
        px[x, y] = (c[0], c[1], c[2], 0)
        for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if 0 <= nx < w and 0 <= ny < h and not seen[ny * w + nx]: seen[ny * w + nx] = 1; q.append((nx, ny, c))
    return im

def pad_square(im, pad=0.05):
    bb = im.getbbox()
    if bb: im = im.crop(bb)
    w, h = im.size; s = int(max(w, h) * (1 + 2 * pad))
    c = Image.new('RGBA', (s, s), (0, 0, 0, 0)); c.paste(im, ((s - w) // 2, (s - h) // 2), im); return c

def centre_square(im):
    w, h = im.size; s = min(w, h); l, t = (w - s) // 2, (h - s) // 2
    return im.crop((l, t, l + s, t + s))

def token(im, ring, size=128):
    im = centre_square(im.convert('RGBA')).resize((size, size), Image.LANCZOS)
    m = Image.new('L', (size, size), 0); ImageDraw.Draw(m).ellipse((4, 4, size - 5, size - 5), fill=255)
    out = Image.new('RGBA', (size, size), (0, 0, 0, 0)); out.paste(im, (0, 0), m)
    d = ImageDraw.Draw(out)
    d.ellipse((3, 3, size - 4, size - 4), outline=(20, 20, 20, 255), width=7)
    d.ellipse((6, 6, size - 7, size - 7), outline=ring, width=5)
    return out

# (dest under assets/modes, source, method, box, opts)
F = lambda v, var: ('fr', v, var)
MAP = [
    # ---- opponents / avatars (chess.com bot portraits and thumbnails from each video)
    ('2Sud5_YAp84/ghosted.png', F('2Sud5_YAp84', 'maxres1'), 'tile', (772, 108, 884, 214), {}),
    ('2Sud5_YAp84/djron.png', F('2Sud5_YAp84', 'maxres2'), 'tile', (772, 98, 882, 208), {}),
    ('2Sud5_YAp84/trisha.png', F('2Sud5_YAp84', 'maxres3'), 'tile', (780, 105, 880, 210), {}),
    ('2Sud5_YAp84/goose.png', F('2Sud5_YAp84', 'maxresdefault'), 'tile', (280, 240, 880, 680), {}),
    ('2Sud5_YAp84/bachelor.png', ('as', 'assets/modes/Q6sj5N3oQjI/martin.png'), 'tile', None, {}),
    ('30CbSsx8ixM/martin_fireworks.png', ('sp', '30CbSsx8ixM_exploding_martin.png'), 'tile', None, {}),
    ('4tDIBl14AX8/martin.png', F('4tDIBl14AX8', 'maxres1'), 'tile', (812, 24, 886, 98), {}),
    ('6qVgF1OO_cw/martin.png', F('6qVgF1OO_cw', 'maxresdefault'), 'tile', (700, 40, 1280, 720), {}),
    ('A0mFldyCgfw/zach.png', F('A0mFldyCgfw', 'maxresdefault'), 'tile', (420, 150, 940, 720), {}),
    ('AaHmMC3HA0E/wally.png', F('AaHmMC3HA0E', 'maxres1'), 'tile', (812, 134, 912, 232), {}),
    ('AaHmMC3HA0E/hustler.png', F('AaHmMC3HA0E', 'maxres2'), 'tile', (832, 135, 902, 232), {}),
    ('AaHmMC3HA0E/samantha.png', F('AaHmMC3HA0E', 'maxres3'), 'tile', (826, 135, 904, 232), {}),
    ('AtmctmxLq58/maria.png', F('AtmctmxLq58', 'maxres1'), 'tile', (796, 56, 878, 162), {}),
    ('AtmctmxLq58/azeez.png', F('AtmctmxLq58', 'maxres2'), 'tile', (785, 58, 885, 162), {}),
    ('AtmctmxLq58/vinh.png', F('AtmctmxLq58', 'maxres3'), 'tile', (798, 60, 890, 160), {}),
    ('CHde4g8Jpuk/turkey.png', ('sp', 'CHde4g8Jpuk_leftover_turkey.png'), 'tile', None, {}),
    ('CHde4g8Jpuk/frosty.png', F('CHde4g8Jpuk', 'maxres2'), 'tile', (818, 98, 908, 198), {}),
    ('CHde4g8Jpuk/santa.png', F('CHde4g8Jpuk', 'maxres3'), 'tile', (832, 102, 908, 198), {}),
    ('Cs6knoD0INQ/ai.png', F('Cs6knoD0INQ', 'maxres2'), 'tile', (1100, 60, 1250, 180), {}),
    ('D8olpXjblQ0/lvl5.png', F('D8olpXjblQ0', 'maxres1'), 'tile', (812, 24, 886, 98), {}),
    ('D8olpXjblQ0/lvl10.png', F('D8olpXjblQ0', 'maxres2'), 'tile', (812, 22, 878, 92), {}),
    ('D8olpXjblQ0/lvl15.png', F('D8olpXjblQ0', 'maxres3'), 'tile', (815, 22, 885, 92), {}),
    ('D8olpXjblQ0/lvl25.png', F('D8olpXjblQ0', 'maxresdefault'), 'tile', (680, 180, 1280, 720), {}),
    ('LfzNhUjl3qE/sleepy_martin.png', F('LfzNhUjl3qE', 'maxres1'), 'tile', (762, 32, 842, 108), {}),
    ('LfzNhUjl3qE/evil_martin.png', F('LfzNhUjl3qE', 'maxres2'), 'tile', (770, 15, 840, 85), {}),
    ('hymgaszLxnw/evil_martin.png', F('hymgaszLxnw', 'maxresdefault'), 'tile', (620, 20, 1180, 720), {}),
    ('Pp4r8PFPW2w/magnus.png', F('Pp4r8PFPW2w', 'maxresdefault'), 'tile', (690, 0, 1280, 720), {}),
    ('VBsA2Z6ijkg/martin.png', F('VBsA2Z6ijkg', 'maxres1'), 'tile', (80, 240, 290, 490), {}),
    ('VBsA2Z6ijkg/elani.png', F('VBsA2Z6ijkg', 'maxres1'), 'tile', (320, 250, 560, 490), {}),
    ('VBsA2Z6ijkg/aron.png', F('VBsA2Z6ijkg', 'maxres1'), 'tile', (570, 230, 800, 490), {}),
    ('VBsA2Z6ijkg/emir.png', F('VBsA2Z6ijkg', 'maxres1'), 'tile', (800, 230, 1030, 490), {}),
    ('WciUSfeqGgs/manuel.png', F('WciUSfeqGgs', 'maxres1'), 'tile', (820, 132, 916, 230), {}),
    ('sEXa38X1bhY/viperking.png', F('sEXa38X1bhY', 'maxresdefault'), 'tile', (730, 40, 1280, 720), {}),
    ('sEXa38X1bhY/dragon_b.png', ('sp', 'sEXa38X1bhY_dragon.png'), 'cut', None, {'tol': 40}),
    ('sPNWgAzFzxM/lapeace.png', ('sp', 'sPNWgAzFzxM_lapeace.png'), 'tile', None, {}),
    ('sPNWgAzFzxM/lapis.png', ('sp', 'sPNWgAzFzxM_diamond_token.png'), 'tile', None, {}),
    ('vwJw6aaggn8/pepe.png', F('vwJw6aaggn8', 'maxres1'), 'tile', (826, 122, 922, 218), {}),
    ('vwJw6aaggn8/june.png', F('vwJw6aaggn8', 'maxres2'), 'tile', (822, 120, 900, 220), {}),
    ('vwJw6aaggn8/zach.png', ('as', 'assets/modes/EggsUiFTAwI/zach.png'), 'tile', None, {}),
    ('Bzbzs0K5IBs/duck.png', ('sp', 'Bzbzs0K5IBs_duck.png'), 'tile', None, {}),
    ('ioUPg_z2KpA/duck.png', ('sp', 'ioUPg_z2KpA_duck_big.png'), 'tile', None, {}),
    ('6YEM7m8owJ4/wheel.png', ('sp', '6YEM7m8owJ4_spinner_wheel.png'), 'tile', None, {}),
    ('nick8PeAXLA/wheel.png', ('sp', 'nick8PeAXLA_spinner_wheel.png'), 'raw', None, {}),
    ('0VbTOk8X1TY/revolver.png', F('0VbTOk8X1TY', 'maxres1'), 'raw', (530, 15, 750, 100), {}),
    ('0VbTOk8X1TY/blood.png', ('sp', '0VbTOk8X1TY_blood_splat.png'), 'tile', None, {}),
    ('0VbTOk8X1TY/gun_fish.png', ('sp', '0VbTOk8X1TY_gun_fish.png'), 'tile', None, {}),
    # ---- Chess Ultimate roster cards (F0nfkeR-QEg maxres2, onr_ABfEMGk maxres1), pawns from w4L_Obw74dE
    ('CxtttdnwNWk/cu/Turtle', F('F0nfkeR-QEg', 'maxres2'), 'token', (14, 354, 126, 466), {}),
    ('CxtttdnwNWk/cu/Copycat', F('F0nfkeR-QEg', 'maxres2'), 'token', (156, 354, 270, 466), {}),
    ('CxtttdnwNWk/cu/Knight', F('F0nfkeR-QEg', 'maxres2'), 'token', (304, 354, 416, 466), {}),
    ('CxtttdnwNWk/cu/Sludge', F('F0nfkeR-QEg', 'maxres2'), 'token', (896, 354, 1010, 466), {}),
    ('CxtttdnwNWk/cu/Rock', F('F0nfkeR-QEg', 'maxres2'), 'token', (1044, 354, 1158, 466), {}),
    ('CxtttdnwNWk/cu/Parasite', F('onr_ABfEMGk', 'maxres1'), 'token', (12, 362, 118, 468), {}),
    ('CxtttdnwNWk/cu/QueenBee', F('onr_ABfEMGk', 'maxres1'), 'token', (296, 362, 408, 468), {}),
    ('CxtttdnwNWk/cu/Sniper', F('onr_ABfEMGk', 'maxres1'), 'token', (438, 362, 552, 468), {}),
    ('CxtttdnwNWk/cu/Prince', F('onr_ABfEMGk', 'maxres1'), 'token', (726, 362, 838, 468), {}),
    ('CxtttdnwNWk/cu/Minion', F('onr_ABfEMGk', 'maxres1'), 'token', (152, 362, 264, 468), {}),
    ('CxtttdnwNWk/cu/Penguin', F('F0nfkeR-QEg', 'maxres1'), 'token', (500, 246, 624, 370), {}),
    ('CxtttdnwNWk/cu/Pawn', F('w4L_Obw74dE', 'maxres2'), 'token', (340, 376, 446, 482), {}),
    ('CxtttdnwNWk/cu/checkmate.png', ('sp', 'pPQDMtvu5rk_checkmate_banner.png'), 'raw', None, {}),
]


def build(entry):
    dest, s, how, box, o = entry
    im = src(s).convert('RGBA')
    if box:
        W, H = im.size
        if all(v <= 1 for v in box): box = (int(box[0] * W), int(box[1] * H), int(box[2] * W), int(box[3] * H))
        im = im.crop(box)
    out = []
    if how == 'token':
        out.append((dest + '_w.png', token(im, (250, 250, 250, 255))))
        out.append((dest + '_b.png', token(im, (50, 50, 50, 255))))
        return out
    if how == 'cut': im = pad_square(key_out(im, o.get('tol', 60)))
    elif how == 'tile': im = centre_square(im)
    lim = o.get('max', 256 if how != 'raw' else 720)
    im.thumbnail((lim, lim), Image.LANCZOS)
    return [(dest, im)]


def run(args):
    prev = None
    if args[:1] == ['--preview']: prev, args = args[1], args[2:]
    items = []
    for e in MAP:
        if args and not any(a in e[0] for a in args): continue
        for dest, im in build(e):
            p = os.path.join(OUT, dest); os.makedirs(os.path.dirname(p), exist_ok=True)
            im.save(p, optimize=True); items.append((dest, im))
    if prev:
        T = 150; cols = 8; rows = (len(items) + cols - 1) // cols
        sh = Image.new('RGB', (cols * T, rows * (T + 16)), (110, 140, 90)); d = ImageDraw.Draw(sh)
        for k, (dest, im) in enumerate(items):
            t = im.copy(); t.thumbnail((T, T)); x, y = (k % cols) * T, (k // cols) * (T + 16)
            sh.paste(t, (x, y), t); d.text((x + 2, y + T + 2), dest[-24:], fill=(255, 255, 0))
        sh.save(prev)
    print('wrote', len(items))


if __name__ == '__main__':
    run(sys.argv[1:])
