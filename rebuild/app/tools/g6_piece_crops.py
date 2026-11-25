"""Group-6 (impl-6, eighth session): piece art copied from the real frames (i.ytimg.com/vi/<id>/maxres1-3.jpg) for modes
whose video shows its own pieces on a chess.com-style board. Each square is cut out and the flat square colour is made
transparent by a flood fill from the square's edge (the pieces have dark outlines, so the fill stops at them).
- Cloister (qfHZlae8XVU): the wazir piece, white + black (maxres1, 4x4 board); the brick = stone tile on the title card
- Tiny Chess (piiE6JB8pWw): dragon knight, tall bishop and spiked piece, white + black (maxres3, 4x4 board)
Run: python3 tools/g6_piece_crops.py"""
import os, sys, urllib.request
from collections import deque
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__)); APP = os.path.join(HERE, '..')
CACHE = '/tmp/g6t'; os.makedirs(CACHE, exist_ok=True)

def frame(vid, k):
    p = os.path.join(CACHE, f'{vid}_{k}.jpg')
    if not os.path.exists(p): urllib.request.urlretrieve(f'https://i.ytimg.com/vi/{vid}/{k}.jpg', p)
    return Image.open(p).convert('RGBA')

def cut(im, box, tol=46, inset=3):
    """crop box, flood the square colour from the edges to transparent, trim, pad square"""
    x0, y0, x1, y1 = box; c = im.crop((x0 + inset, y0 + inset, x1 - inset, y1 - inset)); w, h = c.size; px = c.load()
    seen = set(); q = deque()
    for x in range(w): q.append((x, 0)); q.append((x, h - 1))
    for y in range(h): q.append((0, y)); q.append((w - 1, y))
    def near(a, b): return abs(a[0] - b[0]) + abs(a[1] - b[1]) + abs(a[2] - b[2]) <= tol
    while q:
        x, y = q.popleft()
        if (x, y) in seen: continue
        seen.add((x, y)); r = px[x, y]
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < w and 0 <= ny < h and (nx, ny) not in seen and near(px[nx, ny], r): q.append((nx, ny))
    edge_cols = {px[x, 0][:3] for x in range(w)}
    for (x, y) in seen: px[x, y] = (0, 0, 0, 0)
    bb = c.getbbox(); c = c.crop(bb); s = max(c.size) + 8
    out = Image.new('RGBA', (s, s)); out.paste(c, ((s - c.width) // 2, s - c.height - 4)); return out.resize((128, 128), Image.LANCZOS)

def sq(x0, y0, size, col, row): return (round(x0 + col * size), round(y0 + row * size), round(x0 + (col + 1) * size), round(y0 + (row + 1) * size))

def save(img, mid, name):
    d = os.path.join(APP, 'assets', 'modes', mid); os.makedirs(d, exist_ok=True); img.save(os.path.join(d, name), optimize=True)

JOBS = {
    # id: (frame, board x0, y0, square size, {file: (col,row)})
    'qfHZlae8XVU': ('maxres1', 60, 60, 148, {'monk_w.png': (0, 0), 'monk_b.png': (1, 0)}),
    'piiE6JB8pWw': ('maxres3', 140, 30, 166, {'knight_b.png': (1, 0), 'bishop_b.png': (2, 0), 'spike_b.png': (0, 0),
                                               'knight_w.png': (1, 1), 'bishop_w.png': (1, 3), 'spike_w.png': (3, 3)}),
}
if __name__ == '__main__':
    dbg = len(sys.argv) > 1
    for mid, (k, x0, y0, s, items) in JOBS.items():
        im = frame(mid, k)
        for name, (c, r) in items.items():
            img = cut(im, sq(x0, y0, s, c, r)); save(img, mid, name)
            if dbg: im.crop(sq(x0, y0, s, c, r)).save(f'/workspace/work/g6v/pc/raw_{mid}_{name}')
    # Cloister brick: the stone tile from the video's title card (maxresdefault)
    frame('qfHZlae8XVU', 'maxresdefault').convert('RGB').crop((536, 459, 741, 664)).resize((128, 128), Image.LANCZOS).save(os.path.join(APP, 'assets', 'modes', 'qfHZlae8XVU', 'brick.png'), optimize=True)
    print('ok')
