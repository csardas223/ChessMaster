#!/usr/bin/env python3
"""Group 5 art pass 4 (Hark art-g5 session, 2026-11-25 ~12:30 AM ET). Owner rule 2026-11-24 10:13 PM ET: all mode art is
copied from the videos. Every image below is cut from the video's own 1280x720 stills / thumbnail
(https://i.ytimg.com/vi/<id>/maxres1..3.jpg + maxresdefault.jpg, cached in /tmp/g5_yt by tools/g5_frames.py).
Nothing is drawn. Where one colour of a piece is all the video shows, the other colours are recoloured copies
(hue shift / luminance invert, as the game itself colours them) and marked "inferred".
Boxes are (l, t, r, b) on the 1280x720 still. Run from rebuild/app:  python3 tools/g5_art4.py [job ...]
Credit: all art (c) the original games / sites / iwantcheckmate videos."""
import os, sys, colorsys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from PIL import Image, ImageOps
import g5_frames
from g5_frames import demag, flood_key, open_keep, trim, square, save

THUMBS = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'research', 'frames', 'video_thumbs')
def frame(vid, which):
    """repo copy first (research/frames/video_thumbs/<id>_<which>.jpg, owner 2026-11-25: use the repo before YouTube);
    only a still missing there is fetched from i.ytimg (g5_frames.frame) - then commit it to video_thumbs"""
    p = os.path.join(THUMBS, '%s_%s.jpg' % (vid, which))
    return Image.open(p).convert('RGB') if os.path.exists(p) else g5_frames.frame(vid, which)

def hue_to(im, target_h, sat_mul=1.0):
    """recolour the saturated fill of a flat-coloured piece to another army colour (outline and shading kept)"""
    im = im.copy(); px = im.load(); w, h = im.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if not a: continue
            hh, ll, ss = colorsys.rgb_to_hls(r / 255., g / 255., b / 255.)
            if ss > 0.25 and 0.12 < ll < 0.9:
                r2, g2, b2 = colorsys.hls_to_rgb(target_h, ll, min(1, ss * sat_mul))
                px[x, y] = (int(r2 * 255), int(g2 * 255), int(b2 * 255), a)
    return im
def invert_rgb(im):
    r, g, b, a = im.split(); rgb = ImageOps.invert(Image.merge('RGB', (r, g, b))); return Image.merge('RGBA', (*rgb.split(), a))

# ---------------------------------------------------------------- Thermopylae (boaA9_TjXeU)
def thermopylae():
    V = 'boaA9_TjXeU'; T = frame(V, 'maxresdefault'); F = frame(V, 'maxres1')
    def piece(box):
        im = demag(T.crop(box)); w, h = im.size
        return square(trim(open_keep(im, (w // 2, h // 2), 2)))
    wb = piece((95, 245, 345, 560))       # red bull-head knight = Wildebeest (Red's piece, as in the video)
    nr = piece((655, 262, 905, 560))      # green double-headed knight = Nightrider; Red owns them: hue-shifted copy (inferred)
    save(wb, V + '/wildebeest_r.png', 160)
    save(nr, V + '/nightrider_g.png', 160)
    save(hue_to(nr, 0.99, 1.05), V + '/nightrider_r.png', 160)
    save(F.crop((20, 40, 680, 480)), V + '/ways_to_win.jpg', 640)   # the "Ways to Win" card (face cam left out)

# ---------------------------------------------------------------- Stone Gravitation (QrKIKcYN5m4)
def stone():
    V = 'QrKIKcYN5m4'
    save(frame(V, 'maxres1').crop((790, 0, 1280, 650)), V + '/meme.jpg', 480)          # the meme clip overlaid on the board
    save(frame(V, 'maxres2').crop((762, 30, 830, 98)), V + '/opponent.png', 96)        # ilikecheese's chess.com bar avatar

# ---------------------------------------------------------------- Martin's Family (GQ6MT1m78Yo)
def martins():
    V = 'GQ6MT1m78Yo'
    save(frame(V, 'maxres1').crop((185, 180, 475, 470)), V + '/martin.png', 160)         # Martin M. Martin, big intro art
    save(frame(V, 'maxresdefault').crop((470, 210, 810, 550)), V + '/martin13.png', 160)  # Baby Martin (Martin XIII) thumbnail art

# ---------------------------------------------------------------- Ouroboros King (JAz_qMQpI1o, _RFXN1Ye3sY)
OX, OY, OC = 95, 103, 63.2    # board origin + square size in JAz_qMQpI1o maxres2
def abs_key(im, tol=60):
    """flat-colour icon on a flat square: pixels close to the square's colour (median of the crop border) -> transparent,
    soft edge between tol and 1.6*tol (absolute distance, so the dark outlines survive)"""
    im = im.convert('RGBA'); w, h = im.size; px = im.load()
    bd = sorted([px[x, y][:3] for x, y in [(x, 0) for x in range(w)] + [(x, h - 1) for x in range(w)] + [(0, y) for y in range(h)] + [(w - 1, y) for y in range(h)]])
    bg = bd[len(bd) // 2]
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]; d = ((r - bg[0]) ** 2 + (g - bg[1]) ** 2 + (b - bg[2]) ** 2) ** .5
            px[x, y] = (r, g, b, 0 if d < tol else 255 if d > 1.6 * tol else int(255 * (d - tol) / (0.6 * tol)))
    return im
def ouro():
    V = 'JAz_qMQpI1o'; B = frame(V, 'maxres2')
    def unit(c, r, erase=None):
        x, y = round(OX + c * OC), round(OY + r * OC); cr = B.crop((x + 4, y + 4, x + 59, y + 59))
        im = abs_key(cr, 26)
        if erase:  # the mouse cursor sitting on the General in this still
            px = im.load()
            for yy in range(erase[1], erase[3]):
                for xx in range(erase[0], erase[2]): px[xx, yy] = (0, 0, 0, 0)
        a = im.getchannel('A'); im = Image.merge('RGBA', (*im.convert('L').convert('RGB').split(), a))  # icons are black/white: drop the square's tint
        return square(trim(im), False)   # whole cell kept: icons are split by their own outlines
    cuts = {'king_w': (3, 7, None), 'general_b': (2, 1, (36, 44, 55, 55)), 'viking_w': (4, 6, None), 'mage_w': (2, 7, None),
            'rook_w': (3, 6, None), 'knight_b': (1, 3, None), 'reaper_w': (2, 6, None)}
    for name, (c, r, er) in cuts.items():
        im = unit(c, r, er); save(im, V + '/' + name + '.png', 120)
        # the game draws the other side's units as the same icon with fill/outline swapped (General / knight in this still): inferred
        other = name[:-1] + ('b' if name.endswith('w') else 'w'); save(invert_rgb(im), V + '/' + other + '.png', 120)


# ---------------------------------------------------------------- Pawnbarian (Kzt9ItpGtYg)
def pawnbarian():
    """the pink diagonal slash splash: only the splash's pink pixels of slash_ref.jpg (already cut from the maxres2 still
    by tools/g5_frames.py), everything else transparent"""
    V = 'Kzt9ItpGtYg'; im = Image.open(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'assets', 'modes', V, 'slash_ref.jpg')).convert('RGBA')
    px = im.load(); w, h = im.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]; k = r - max(g, b * 0.8)
            px[x, y] = (r, g, b, 0 if k < 40 else min(255, int((k - 40) * 4)))
            if 0.3 * w < x < 0.7 * w and 0.3 * h < y < 0.6 * h: px[x, y] = (r, g, b, 0)   # the hero's pink eyes
    save(im, V + '/splash.png', 200)

# ---------------------------------------------------------------- Wizard Chess (DMtaRFMpCWc)
def wizard():
    """the Minotaur (The Teacher) dialogue frame (maxres3) as the start overlay; board colours sampled from maxres2
    (tan #b98e59 / maroon #3e1229). The units in the stills are ~30 px blurs under stat badges: not cut."""
    V = 'DMtaRFMpCWc'
    save(frame(V, 'maxres3').crop((300, 0, 980, 720)), V + '/teacher.jpg', 560)

JOBS = {'thermopylae': thermopylae, 'stone': stone, 'martins': martins, 'ouro': ouro, 'pawnbarian': pawnbarian, 'wizard': wizard}
if __name__ == '__main__':
    only = sys.argv[1:]
    for k, fn in JOBS.items():
        if not only or any(k.startswith(o) for o in only): fn()
