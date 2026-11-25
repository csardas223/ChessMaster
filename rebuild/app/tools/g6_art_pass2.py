"""Group-6 art pass 2 (art-g6, 2026-11-25): crops of the videos' own art for the group-6 todo_pass2 ART items.
Owner rule 2026-11-24 10:13 PM ET: all mode art is copied from the videos (never drawn). Source frames are the real video
stills YouTube serves (i.ytimg.com/vi/<id>/maxres1-3.jpg + maxresdefault.jpg, 1280x720); boxes below are pixel boxes on
those 1280x720 frames. Backgrounds are keyed out by colour (key functions per game) and the cut-out is trimmed and padded
onto a transparent square. Run: python3 tools/g6_art_pass2.py   (downloads into /tmp/g6thumbs)"""
import os, urllib.request
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(HERE, '..', 'assets', 'modes')
CACHE = '/tmp/g6thumbs'; os.makedirs(CACHE, exist_ok=True)

THUMBS = os.path.join(HERE, '..', '..', 'research', 'frames', 'video_thumbs')
def frame(vid, k):
    # repo first (research/frames/video_thumbs); YouTube only for a still the repo does not have
    p = os.path.join(THUMBS, f'{vid}_{k}.jpg')
    if os.path.exists(p): return Image.open(p).convert('RGBA')
    p = os.path.join(CACHE, f'{vid}_{k}.jpg')
    if not os.path.exists(p): urllib.request.urlretrieve(f'https://i.ytimg.com/vi/{vid}/{k}.jpg', p)
    return Image.open(p).convert('RGBA')

def pad(im, size=128, margin=0.06):
    bb = im.getbbox()
    if bb: im = im.crop(bb)
    w, h = im.size; s = max(w, h); m = int(s * margin); S = s + 2 * m
    c = Image.new('RGBA', (S, S), (0, 0, 0, 0)); c.paste(im, ((S - w) // 2, (S - h) // 2 if h < w else m), im)
    return c.resize((size, size), Image.LANCZOS)

def key(im, drop):
    """drop(r, g, b) -> True for background pixels (made transparent)."""
    im = im.copy(); px = im.load()
    for y in range(im.height):
        for x in range(im.width):
            r, g, b, a = px[x, y]
            if drop(r, g, b): px[x, y] = (r, g, b, 0)
    return im

def flood(im, tol=40, seeds=None):
    """Make the background connected to the crop border transparent (colour distance to the seed pixel < tol)."""
    im = im.copy(); px = im.load(); W, H = im.size; seen = set()
    stack = seeds or [(x, 0) for x in range(W)] + [(x, H - 1) for x in range(W)] + [(0, y) for y in range(H)] + [(W - 1, y) for y in range(H)]
    while stack:
        x, y = stack.pop()
        if (x, y) in seen or not (0 <= x < W and 0 <= y < H): continue
        seen.add((x, y)); r, g, b, a = px[x, y]
        px[x, y] = (r, g, b, 0)
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < W and 0 <= ny < H and (nx, ny) not in seen:
                r2, g2, b2, a2 = px[nx, ny]
                if abs(r2 - r) + abs(g2 - g) + abs(b2 - b) < tol: stack.append((nx, ny))
    return im

def largest(im, keep=1):
    """Keep only the biggest opaque blob(s) (drops stray specks and ring fragments left by keying)."""
    im = im.copy(); px = im.load(); W, H = im.size; lab = {}; blobs = []
    for y in range(H):
        for x in range(W):
            if px[x, y][3] and (x, y) not in lab:
                st = [(x, y)]; lab[(x, y)] = len(blobs); cur = []
                while st:
                    p = st.pop(); cur.append(p)
                    for dx in (-1, 0, 1):
                        for dy in (-1, 0, 1):
                            q = (p[0] + dx, p[1] + dy)
                            if 0 <= q[0] < W and 0 <= q[1] < H and q not in lab and px[q][3]: lab[q] = len(blobs); st.append(q)
                blobs.append(cur)
    big = sorted(blobs, key=len, reverse=True)[:keep]; ok = set(p for b in big for p in b)
    for b in blobs:
        for p in b:
            if p not in ok: r, g, bb, a = px[p]; px[p] = (r, g, bb, 0)
    return im

def save(im, mid, name):
    d = os.path.join(OUT, mid); os.makedirs(d, exist_ok=True); im.save(os.path.join(d, name), optimize=True); return im

def cut(vid, k, box, mid, name, drop=None, size=128, tol=None, margin=0.06, raw=False, blob=False):
    im = frame(vid, k).crop(box)
    if raw: return save(im.convert('RGB').resize((size, int(size * im.height / im.width)), Image.LANCZOS) if size else im.convert('RGB'), mid, name)
    if drop: im = key(im, drop)
    if tol: im = flood(im, tol)
    if blob: im = largest(im, int(blob))
    return save(pad(im, size, margin), mid, name)

def recolor(im, fn):
    im = im.copy(); px = im.load()
    for y in range(im.height):
        for x in range(im.width):
            r, g, b, a = px[x, y]
            if a: px[x, y] = fn(r, g, b) + (a,)
    return im

JOBS = ['chessformer', 'pawnbarian', 'survivors']

# ---- Chessformer (oAoik9Dj2qQ levels 21-35, p6W3yDU-v88 levels 37-48): the blue player set from the title screens,
# the single green platform block, the yellow padlock tile (lock) from the level frames.
tan = lambda r, g, b: r - b > 38 and g > 95 and not (g > r + 20)
def chessformer():
    for mid in ['oAoik9Dj2qQ', 'p6W3yDU-v88']:
        cut('oAoik9Dj2qQ', 'maxres1', (183, 256, 247, 326), mid, 'blue_p.png', tan)
        cut('oAoik9Dj2qQ', 'maxres1', (308, 256, 380, 326), mid, 'blue_n.png', tan)
        cut('p6W3yDU-v88', 'maxres1', (440, 256, 510, 326), mid, 'blue_b.png', tan)
        cut('oAoik9Dj2qQ', 'maxres1', (768, 256, 838, 326), mid, 'blue_r.png', tan)
        cut('oAoik9Dj2qQ', 'maxres1', (896, 256, 972, 326), mid, 'blue_q.png', tan)
        cut('oAoik9Dj2qQ', 'maxres1', (1030, 256, 1100, 326), mid, 'blue_k.png', tan)
        save(frame('oAoik9Dj2qQ', 'maxres3').crop((968, 523, 1034, 589)).convert('RGB').resize((96, 96), Image.LANCZOS), mid, 'green_block.png')
        save(frame('p6W3yDU-v88', 'maxres2').crop((574, 0, 640, 62)).convert('RGB').resize((96, 96), Image.LANCZOS), mid, 'lock_tile.png')


# ---- Pawnbarian (zP9TzlgA-W0): the horned-helmet hero and two of the white monsters (furry Cappy Bear, horned helm)
# cut from the floor-3 / floor-5 frames; the board background around them is flood-keyed (they are outlined in white).
notwhite = lambda r, g, b: min(r, g, b) < 170
def pawnbarian():
    mid = 'zP9TzlgA-W0'
    gold = lambda r, g, b: r > 180 and b < 120 and r - b > 90
    def wcut(k, box, name, tol, drop=None):
        im = frame(mid, k).crop(box)
        if drop: im = key(im, drop)
        im = flood(im, tol); save(pad(im), mid, name)
    wcut('maxres2', (488, 250, 642, 390), 'hero.png', 45)
    wcut('maxres3', (606, 143, 692, 228), 'cappy_bear.png', 70, gold)
    wcut('maxres3', (603, 303, 693, 392), 'horned_bear.png', 70)

# ---- Chess Survivors (spJibM5qaNQ): the Joker hero cut out of its bullseye (beige + maroon rings keyed out), the salmon
# pixel enemy pieces and the peg projectile from the gameplay stills (grey dungeon floor flood-keyed).
def survivors():
    mid = 'spJibM5qaNQ'
    ring = lambda r, g, b: (165 <= r <= 215 and 150 <= g <= 200 and 135 <= b <= 190 and r - b < 55) or (125 <= r <= 180 and 60 <= g <= 120 and 60 <= b <= 125 and r - g > 40)
    cut(mid, 'maxres3', (596, 446, 684, 550), mid, 'joker.png', ring, blob=True)
    for name, box, nb in [('pawn.png', (976, 112, 1024, 180), 1), ('knight.png', (422, 102, 480, 178), 1), ('bishop.png', (884, 2, 934, 86), 1), ('queen.png', (516, 92, 570, 180), 1)]:
        cut(mid, 'maxres3', box, mid, name, tol=40, blob=nb)
    cut(mid, 'maxres2', (596, 284, 694, 462), mid, 'rook.png', tol=40)
    cut(mid, 'maxres3', (946, 488, 1022, 514), mid, 'peg.png', tol=40, margin=0.02)
    cut(mid, 'maxres1', (55, 18, 565, 392), mid, 'title.png', size=480, raw=True)

if __name__ == '__main__':
    import sys
    for fn in (sys.argv[1:] or JOBS): globals()[fn]()
