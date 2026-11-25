"""Group-6 art pass 2 (art-g6, 2026-11-25): crops of the videos' own art for the group-6 todo_pass2 ART items.
Owner rule 2026-11-24 10:13 PM ET: all mode art is copied from the videos (never drawn). Source frames are the real video
stills YouTube serves (i.ytimg.com/vi/<id>/maxres1-3.jpg + maxresdefault.jpg, 1280x720); boxes below are pixel boxes on
those 1280x720 frames. Backgrounds are keyed out by colour (key functions per game) and the cut-out is trimmed and padded
onto a transparent square. Run: python3 tools/g6_art_pass2.py   (downloads into /tmp/g6thumbs)"""
import os, urllib.request
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(HERE, '..', 'assets', 'modes')
CACHE = '/tmp/g6thumbs'; os.makedirs(CACHE, exist_ok=True)

def frame(vid, k):
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

def save(im, mid, name):
    d = os.path.join(OUT, mid); os.makedirs(d, exist_ok=True); im.save(os.path.join(d, name), optimize=True); return im

def cut(vid, k, box, mid, name, drop=None, size=128, tol=None, margin=0.06, raw=False):
    im = frame(vid, k).crop(box)
    if raw: return save(im.convert('RGB').resize((size, int(size * im.height / im.width)), Image.LANCZOS) if size else im.convert('RGB'), mid, name)
    if drop: im = key(im, drop)
    if tol: im = flood(im, tol)
    return save(pad(im, size, margin), mid, name)

def recolor(im, fn):
    im = im.copy(); px = im.load()
    for y in range(im.height):
        for x in range(im.width):
            r, g, b, a = px[x, y]
            if a: px[x, y] = fn(r, g, b) + (a,)
    return im

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

if __name__ == '__main__':
    import sys
    for fn in (sys.argv[1:] or ['chessformer']): globals()[fn]()
