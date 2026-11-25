#!/usr/bin/env python3
"""Group 5 art pass 2 (owner 2026-11-24 22:13 ET: all art copied directly from the videos, no invented art).
Cuts real art out of (a) the reference sprites research/frames/sprites/<id>_<thing>.png and (b) the video frames
YouTube publishes for every video (https://i.ytimg.com/vi/<id>/maxres1.jpg .. maxres3.jpg, maxresdefault.jpg;
1280x720 stills taken from the video itself). Frames are downloaded to a cache (/tmp/g5_yt) on first run.
yt-dlp is blocked in the sandbox (HTTP 403/429), so these stills are the only frame source.
Outputs go to assets/modes/<id>/. Run: python3 tools/g5_frames.py [job-prefix ...]
Credit: all art (c) the original games / iwantcheckmate videos."""
import os, sys, base64, io, urllib.request
from collections import deque
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
SPR = os.path.join(HERE, '..', '..', 'research', 'frames', 'sprites')
DST = os.path.join(HERE, '..', 'assets', 'modes')
CACHE = '/tmp/g5_yt'

def frame(vid, which):
    os.makedirs(CACHE, exist_ok=True)
    p = os.path.join(CACHE, vid + '_' + which + '.jpg')
    if not os.path.exists(p):
        urllib.request.urlretrieve('https://i.ytimg.com/vi/%s/%s.jpg' % (vid, which), p)
    return Image.open(p).convert('RGB')
def sprite(name): return Image.open(os.path.join(SPR, name)).convert('RGBA')
def lum(p): return (p[0] * 299 + p[1] * 587 + p[2] * 114) // 1000
def border(w, h): return [(x, 0) for x in range(w)] + [(x, h - 1) for x in range(w)] + [(0, y) for y in range(h)] + [(w - 1, y) for y in range(h)]

def flood_key(im, tol):
    """make the background transparent: flood from the border over pixels close to their neighbour"""
    im = im.convert('RGBA'); w, h = im.size; px = im.load(); seen = bytearray(w * h); q = deque()
    for (x, y) in border(w, h): q.append((x, y, px[x, y][:3]))
    while q:
        x, y, c = q.popleft()
        if x < 0 or y < 0 or x >= w or y >= h or seen[y * w + x]: continue
        p = px[x, y]
        if sum((p[i] - c[i]) ** 2 for i in range(3)) > tol * tol: continue
        seen[y * w + x] = 1; px[x, y] = (p[0], p[1], p[2], 0)
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)): q.append((x + dx, y + dy, p[:3]))
    return im
def outline_cut(im, thr=45):
    """pixel-art piece with a dark outline: background = everything reachable from the border without crossing
    an outline pixel (luminance < thr, thickened by 1 px to close JPEG gaps)"""
    im = im.convert('RGBA'); w, h = im.size; px = im.load()
    ol = [[lum(px[x, y]) < thr for x in range(w)] for y in range(h)]
    n = [r[:] for r in ol]
    for y in range(h):
        for x in range(w):
            if ol[y][x]:
                for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    if 0 <= x + dx < w and 0 <= y + dy < h: n[y + dy][x + dx] = True
    ol = n; bg = bytearray(w * h); q = deque(border(w, h))
    while q:
        x, y = q.popleft()
        if x < 0 or y < 0 or x >= w or y >= h or bg[y * w + x] or ol[y][x]: continue
        bg[y * w + x] = 1
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)): q.append((x + dx, y + dy))
    for y in range(h):
        for x in range(w):
            if bg[y * w + x]: px[x, y] = (0, 0, 0, 0)
    return im
def demag(im):
    """the reference sprites sit on the thumbnail's purple/magenta backdrop: drop it"""
    im = im.convert('RGBA'); px = im.load(); w, h = im.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if (g < 0.45 * min(r, b) and r + b > 90) or (r + g + b < 40): px[x, y] = (r, g, b, 0)
    return im
def open_keep(im, seed, r=2):
    """erode the alpha r px, keep the component nearest seed, grow it back inside the original alpha
    (cuts away neighbouring pieces that overlap the crop)"""
    w, h = im.size; px = im.load(); A = [[px[x, y][3] > 0 for x in range(w)] for y in range(h)]; E = A
    for _ in range(r):
        E = [[E[y][x] and all(0 <= x + dx < w and 0 <= y + dy < h and E[y + dy][x + dx] for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))) for x in range(w)] for y in range(h)]
    sx, sy = seed; best = None
    for y in range(h):
        for x in range(w):
            if E[y][x]:
                d = (x - sx) ** 2 + (y - sy) ** 2
                if best is None or d < best[0]: best = (d, x, y)
    if not best: return im
    K = [[False] * w for _ in range(h)]; q = deque([(best[1], best[2])])
    while q:
        x, y = q.popleft()
        if x < 0 or y < 0 or x >= w or y >= h or K[y][x] or not E[y][x]: continue
        K[y][x] = True
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)): q.append((x + dx, y + dy))
    for _ in range(r + 1):
        n = [row[:] for row in K]
        for y in range(h):
            for x in range(w):
                if K[y][x]:
                    for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                        if 0 <= x + dx < w and 0 <= y + dy < h and A[y + dy][x + dx]: n[y + dy][x + dx] = True
        K = n
    for y in range(h):
        for x in range(w):
            if not K[y][x]: px[x, y] = (0, 0, 0, 0)
    return im
def trim(im, pad=1):
    bb = im.getchannel('A').point(lambda a: 255 if a > 20 else 0).getbbox()
    if not bb: return im
    im = im.crop(bb); w, h = im.size; o = Image.new('RGBA', (w + 2 * pad, h + 2 * pad), (0, 0, 0, 0)); o.paste(im, (pad, pad)); return o
def square(im, bottom=True):
    w, h = im.size; s = max(w, h); o = Image.new('RGBA', (s, s), (0, 0, 0, 0)); o.paste(im, ((s - w) // 2, s - h if bottom else (s - h) // 2)); return o
def refill(im, fill, thr=90):
    """recolour the fill of a dark-outlined piece (outline kept): the game's other side uses the same sprite"""
    im = im.copy(); px = im.load(); w, h = im.size
    for y in range(h):
        for x in range(w):
            p = px[x, y]
            if p[3] and lum(p) >= thr:
                px[x, y] = (fill[0], fill[1], fill[2], p[3])
    return im
def blackify(im):
    """dark version of a white chess.com-style piece (used where the video only shows the white one)"""
    im = im.convert('RGBA'); px = im.load(); w, h = im.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a == 0: continue
            l = lum((r, g, b)); v = 255 - l; v = int(40 + v * 0.75) if l > 128 else int(200 + (128 - l) * 0.3)
            px[x, y] = (v, v, v, a)
    return im
def darken(im, f):
    im = im.copy(); px = im.load(); w, h = im.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]; px[x, y] = (int(r * f), int(g * f), int(b * f), a)
    return im
def save(im, rel, size=None, nearest=False):
    if size and max(im.size) != size:
        s = size / float(max(im.size)); im = im.resize((max(1, round(im.size[0] * s)), max(1, round(im.size[1] * s))), Image.NEAREST if nearest else Image.LANCZOS)
    p = os.path.join(DST, rel); os.makedirs(os.path.dirname(p), exist_ok=True)
    if p.endswith('.jpg'): im.convert('RGB').save(p, quality=82, optimize=True)
    else: im.save(p, optimize=True)
    print(p); return im
def svg_wrap(im, rel):
    """piece sets are looked up as <set>/<colour><type>.svg: wrap the cut PNG in an SVG (pixelated scaling)"""
    b = io.BytesIO(); im.save(b, 'PNG', optimize=True); w, h = im.size
    s = ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %d %d"><image width="%d" height="%d" style="image-rendering:pixelated" '
         'href="data:image/png;base64,%s"/></svg>') % (w, h, w, h, base64.b64encode(b.getvalue()).decode())
    p = os.path.join(DST, rel); os.makedirs(os.path.dirname(p), exist_ok=True); open(p, 'w').write(s); print(p)

# ---------------------------------------------------------------------------------------------------------------
def kotb_pieces():
    """King of the Bridge (WEYUcaJTBso, M0rsyuvaTrk, Y7KKKTTkwNk): the game's pixel pieces, cut from the board in
    M0rsyuvaTrk maxres2 (board origin 178,150, 51.5 px squares, sprites stand ~half a square above their square)
    and WEYUcaJTBso maxres3 (white queen). Black R/N/B/Q/K are not shown unobstructed in any still (they sit
    against the board frame), so they are the same sprites with the dark-green fill of the real black pawn."""
    A = frame('M0rsyuvaTrk', 'maxres2'); B = frame('WEYUcaJTBso', 'maxres3'); c = 51.5
    def cut(img, r, f, rr, top=0.5, x0=178, y0=150, Y=None):
        X = int(x0 + f * c); Y = Y if Y is not None else int(y0 + r * c)
        cr = img.crop((X - 4, Y - int(top * c), X + int(c) + 4, Y + int(c) - 2)); w, h = cr.size
        return trim(open_keep(outline_cut(cr, 45), (w // 2, h - int(.45 * c)), rr))
    white = {'P': cut(A, 5, 4, 2), 'R': cut(A, 7, 0, 3), 'N': cut(A, 7, 6, 3), 'B': cut(A, 7, 2, 3), 'K': cut(A, 7, 4, 2),
             'Q': refill(cut(B, 0, 3, 2, Y=511), (240, 236, 198), 80)}
    black = {t: refill(im, (62, 84, 66)) for t, im in white.items()}; black['P'] = cut(A, 1, 4, 2)
    for side, d in (('w', white), ('b', black)):
        for t, im in d.items():
            im = square(im); im = im.resize((im.size[0] * 2, im.size[1] * 2), Image.NEAREST)
            svg_wrap(im, 'WEYUcaJTBso/pixel/%s%s.svg' % (side, t))

def pawnbarian():
    """Pawnbarian (Kzt9ItpGtYg) monsters from maxres3 (5x5 board origin 444,66, 81 px squares)"""
    A = frame('Kzt9ItpGtYg', 'maxres3'); c = 81
    def mon(r, f, tol=38):
        X = 444 + f * c; Y = 66 + r * c; cr = A.crop((X, Y, X + c, Y + c))
        return trim(open_keep(flood_key(cr, tol), (c // 2, c // 2), 2))
    save(square(mon(0, 3), False), 'Kzt9ItpGtYg/cappy.png', 160)        # white capybara-bear face
    save(square(mon(1, 1), False), 'Kzt9ItpGtYg/horned_cappy.png', 160) # orange horned beast
    save(square(mon(2, 2), False), 'Kzt9ItpGtYg/brute.png', 160)        # orange armoured beast
    save(A.crop((444, 66, 444 + 5 * c, 66 + 5 * c)), 'Kzt9ItpGtYg/board_ref.jpg', 405)
    B = frame('Kzt9ItpGtYg', 'maxres2')
    save(B.crop((600, 70, 860, 310)), 'Kzt9ItpGtYg/slash_ref.jpg', 260)

def sprites():
    def dm(name, keep=True):
        im = demag(sprite(name)); w, h = im.size
        if keep: im = open_keep(im, (w // 2, h // 2), 2)
        return trim(im)
    d = square(dm('E2x-QTgBD5k_duck.png')); save(d, 'E2x-QTgBD5k/duck.png', 160)
    p = square(dm('GawuFHUIj6o_phantom_rook.png', False)); save(p, 'GawuFHUIj6o/phantom_w.png', 160); save(blackify(p), 'GawuFHUIj6o/phantom_b.png', 160)
    g = square(dm('HtNZ9DTxHUs_dragon_bishop.png')); save(g, 'HtNZ9DTxHUs/dragon_w.png', 160); save(blackify(g), 'HtNZ9DTxHUs/dragon_b.png', 160)
    k = square(dm('cWvs-sIvktw_checker_disc_metal.png'), False); save(k, 'cWvs-sIvktw/disc_w.png', 128); save(darken(k, 0.38), 'cWvs-sIvktw/disc_b.png', 128)

def fps():
    """FPS Chess: the duel title cards and the arena, straight from the stills"""
    save(frame('PszkLYudcws', 'maxres2'), 'PszkLYudcws/duel_card.jpg', 640)
    save(frame('PszkLYudcws', 'maxres1'), 'PszkLYudcws/arena.jpg', 640)   # the red Victorian room (both FPS videos)
    save(frame('Nz2A-g73_iM', 'maxres2'), 'Nz2A-g73_iM/duel_card.jpg', 640)

JOBS = {'kotb': kotb_pieces, 'pawnbarian': pawnbarian, 'sprites': sprites, 'fps': fps}
if __name__ == '__main__':
    only = sys.argv[1:]
    for k, fn in JOBS.items():
        if not only or any(k.startswith(o) for o in only): fn()
