import sys, os, glob
import numpy as np
from PIL import Image, ImageFilter
from collections import deque
SRC, OUT, TOL = sys.argv[1], sys.argv[2], float(sys.argv[3]) if len(sys.argv) > 3 else 12
os.makedirs(OUT, exist_ok=True)
for f in sorted(glob.glob(SRC + '/*_w.png')):
    im = np.array(Image.open(f).convert('RGBA')).astype(float); h, w = im.shape[:2]; cx, cy = w / 2, h / 2
    yy, xx = np.mgrid[0:h, 0:w]; r = np.hypot(xx - cx + .5, yy - cy + .5) / (w / 2)
    # the disc's light gradient: per-row colour sampled just inside the ring on both sides (median of a band)
    inner = (r > .80) & (r < .86)
    bg = np.zeros((h, 3))
    for y in range(h):
        px = im[y][inner[y]][:, :3]
        bg[y] = np.median(px, axis=0) if len(px) else bg[y - 1]
    from scipy.ndimage import median_filter
    bg = median_filter(bg, size=(21, 1), mode='nearest')
    d = np.linalg.norm(im[:, :, :3] - bg[:, None, :], axis=2)
    keep = np.ones((h, w), bool); keep[r >= .835] = False
    # flood fill from the inner ring through background-like pixels
    seen = np.zeros((h, w), bool); q = deque()
    for y, x in zip(*np.where((r > .82) & (r < .86))):
        if d[y, x] < TOL * 2: q.append((y, x)); seen[y, x] = True
    while q:
        y, x = q.popleft(); keep[y, x] = False
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            ny, nx = y + dy, x + dx
            if 0 <= ny < h and 0 <= nx < w and not seen[ny, nx] and r[ny, nx] < .86 and d[ny, nx] < TOL:
                seen[ny, nx] = True; q.append((ny, nx))
    # stray background specks the fill could not reach (enclosed by the ring) go too
    keep &= ~((d < TOL * .8) & (r > .6))
    a = Image.fromarray((keep * 255).astype(np.uint8)).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(.7))
    out = Image.fromarray(im.astype(np.uint8)); out.putalpha(a)
    bb = out.getbbox(); out = out.crop(bb) if bb else out
    # pad to a square with the feet at the bottom centre
    S = max(out.size); sq = Image.new('RGBA', (S, S), (0, 0, 0, 0)); sq.paste(out, ((S - out.size[0]) // 2, S - out.size[1])); sq = sq.resize((256, 256), Image.LANCZOS)
    sq.save(os.path.join(OUT, os.path.basename(f).replace('_w.png', '.png')))
