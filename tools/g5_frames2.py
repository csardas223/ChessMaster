#!/usr/bin/env python3
"""Group 5 art pass 3 (impl-5, 2026-11-24 ~11:40 PM ET): the 27 modes that had no research sprite.
Every image here is cut from the video's own 1280x720 stills (https://i.ytimg.com/vi/<id>/maxres1..3.jpg, cached in
/tmp/g5_yt by tools/g5_frames.py) - nothing is drawn. Run: python3 tools/g5_frames2.py
Credit: all art (c) the original games / sites / iwantcheckmate videos."""
import os, io, base64
from PIL import Image
import importlib.util
HERE = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location('g5f', os.path.join(HERE, 'g5_frames.py')); g5f = importlib.util.module_from_spec(spec); spec.loader.exec_module(g5f)
frame = g5f.frame
DST = os.path.join(HERE, '..', 'assets', 'modes')

def out(vid, name):
    d = os.path.join(DST, vid); os.makedirs(d, exist_ok=True); return os.path.join(d, name)
def save_png(im, vid, name): im.save(out(vid, name), optimize=True); return name
def save_jpg(im, vid, name, w=960, q=78):
    im = im.convert('RGB'); im = im.resize((w, round(im.size[1] * w / im.size[0])), Image.LANCZOS); im.save(out(vid, name), quality=q, optimize=True); return name
def svg_wrap(im, path, pixelated=False):
    b = io.BytesIO(); im.save(b, 'PNG', optimize=True); w, h = im.size
    st = ' style="image-rendering:pixelated"' if pixelated else ''
    open(path, 'w').write('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %d %d"><image width="%d" height="%d"%s href="data:image/png;base64,%s"/></svg>' % (w, h, w, h, st, base64.b64encode(b.getvalue()).decode()))

# ---------------------------------------------------------------- Chess Roulette (cYVauucyLyQ): the site's pixel set
def roulette():
    V = 'cYVauucyLyQ'; f1 = frame(V, 'maxres1')
    xs = [24, 110.5, 198, 285.5, 373, 460.5, 548.5, 636, 723.5]; ys = [28, 109, 192, 275, 357.5, 440, 523, 606, 688]
    def cell(c, r, im=f1, inset=5):
        return im.crop((round(xs[c]) + inset, round(ys[r]) + inset, round(xs[c + 1]) - inset, round(ys[r + 1]) - inset))
    def key(cimg, white):
        cimg = cimg.convert('RGB'); w, h = cimg.size; px = cimg.load()
        # background = the square's own grey (median of the border ring)
        ring = sorted(sum(px[x, y]) // 3 for x in range(w) for y in (0, h - 1))
        bg = ring[len(ring) // 2]; o = Image.new('RGBA', (w, h)); po = o.load()
        for y in range(h):
            for x in range(w):
                L = sum(px[x, y]) // 3
                a = (L - bg) / max(1, 255 - bg) if white else (bg - L) / max(1, bg)
                a = max(0.0, min(1.0, a * 1.25))
                if a < 0.2: a = 0.0   # JPEG noise on the flat square
                po[x, y] = ((255, 255, 255) if white else (0, 0, 0)) + (int(a * 255),)
        return o
    def sq(im):  # squares are 87x83 in the video (scaled 16:9 capture); store them square like the site
        bb = im.getbbox() or (0, 0, im.size[0], im.size[1]); return im.resize((96, 96), Image.LANCZOS)
    d = out(V, 'pieces'); os.makedirs(d, exist_ok=True)
    W = {'R': (0, 7), 'N': (1, 7), 'B': (2, 7), 'Q': (3, 7), 'K': (4, 7), 'P': (1, 6)}
    B = {'R': (0, 0), 'K': (4, 0), 'N': (3, 1), 'P': (0, 1)}
    got = {}
    for t, (c, r) in W.items(): got['w' + t] = sq(key(cell(c, r), True))
    for t, (c, r) in B.items(): got['b' + t] = sq(key(cell(c, r), False))
    for t in ('B', 'Q'):  # not on screen in either still: the set is flat silhouettes, so black = the white shape in black (inferred)
        a = got['w' + t].split()[3]; got['b' + t] = Image.merge('RGBA', (Image.new('L', a.size, 0),) * 3 + (a,))
    for k, im in got.items(): svg_wrap(im, os.path.join(d, k + '.svg'))
    # red splat left on a square where a piece exploded (b7 in maxres1)
    s = cell(1, 1, inset=3).convert('RGB'); w, h = s.size; o = Image.new('RGBA', (w, h)); px = s.load(); po = o.load()
    for y in range(h):
        for x in range(w):
            r, g, b = px[x, y]; a = max(0, min(255, (r - max(g, b) - 25) * 3)); po[x, y] = (r, g, b, a)
    save_png(o.resize((96, 96), Image.LANCZOS), V, 'splat.png')
    # skull card shown on an explosion (maxres2, right panel)
    save_png(frame(V, 'maxres2').crop((836, 200, 1126, 488)), V, 'skull.png')
    # the site's player-bar icons: black king on Stockfish's white bar, white king on the player's dark bar
    save_png(frame(V, 'maxres2').crop((1156, 30, 1220, 92)), V, 'bar_stockfish.png')

# ---------------------------------------------------------------- Battle Chess (IbRrzKtieqs): fight cutscenes
def battle():
    V = 'IbRrzKtieqs'
    for k in ('maxres1', 'maxres2', 'maxres3'): save_jpg(frame(V, k), V, 'fight_' + k[-1] + '.jpg', 800, 74)

# ---------------------------------------------------------------- Judit Polgar bots (amZRnocbNr8): ladder portraits
def judit():
    V = 'amZRnocbNr8'; f = frame(V, 'maxres1')
    save_png(f.crop((207, 0, 367, 105)), V, 'judit9.png')
    save_png(f.crop((218, 255, 378, 415)), V, 'judit11.png')
    save_png(f.crop((222, 562, 382, 720)), V, 'judit15.png')

# ---------------------------------------------------------------- Roblox (EqOwqolOZOo): the opponent's avatar at the table
def roblox():
    V = 'EqOwqolOZOo'; f = frame(V, 'maxres2')
    save_png(f.crop((880, 35, 1180, 265)).resize((180, 138), Image.LANCZOS), V, 'opponent.png')

# ---------------------------------------------------------------- chess.com default (grey pawn) avatars from the bars
def defaults():
    save_png(frame('XrS4pFAd56c', 'maxres1').crop((775, 30, 841, 96)), 'XrS4pFAd56c', 'opponent.png')
    save_png(frame('cxUz0IjYQMQ', 'maxres1').crop((888, 33, 955, 100)), 'cxUz0IjYQMQ', 'opponent.png')

# ---------------------------------------------------------------- Racing Kings (bLwXpCK_h4k): the red X the edit puts on a checking move
def racing_x():
    V = 'bLwXpCK_h4k'; s = frame(V, 'maxres1').crop((518, 278, 688, 444)).convert('RGB'); w, h = s.size
    o = Image.new('RGBA', (w, h)); px = s.load(); po = o.load()
    for y in range(h):
        for x in range(w):
            r, g, b = px[x, y]; X, Y = x + 518, y + 278
            in_red_sq = 603 <= X <= 777 and Y <= 354          # the king's dark-red square behind the X
            red = r - max(g, b)
            if in_red_sq: keep = r > 165 and red > 60 or (r > 200 and g > 120 and b > 120 and r - g > 25)
            else: keep = red > 55 or (r > 200 and r - g > 25 and abs(g - b) < 40)
            po[x, y] = (r, g, b, 255 if keep else 0)
    save_png(o, V, 'red_x.png')

# ---------------------------------------------------------------- Hyper Chess (d8pJkdxtXAA): logo + the arena's blue grid
def hyper():
    V = 'd8pJkdxtXAA'; f = frame(V, 'maxres1')
    save_jpg(f.crop((24, 34, 312, 160)), V, 'logo.jpg', 288, 84)   # kept on its own blue grid (keying ate the outline)
    save_jpg(frame(V, 'maxres2').crop((0, 0, 400, 260)), V, 'grid.jpg', 400, 72)

# ---------------------------------------------------------------- Rosen Score (SmCty_pVF7A): the Rosen score card
def rosen():
    V = 'SmCty_pVF7A'; save_jpg(frame(V, 'maxres1'), V, 'rosen_card.jpg', 800, 76)

JOBS = [roulette, battle, judit, roblox, defaults, racing_x, hyper, rosen]
if __name__ == '__main__':
    import sys
    for j in JOBS:
        if len(sys.argv) < 2 or j.__name__ in sys.argv[1:]: j(); print('ok', j.__name__)
