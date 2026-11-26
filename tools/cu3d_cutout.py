import sys, os, glob
import numpy as np
from PIL import Image, ImageFilter
from collections import deque
SRC, OUT, TOL = sys.argv[1], sys.argv[2], float(sys.argv[3]) if len(sys.argv) > 3 else 12
os.makedirs(OUT, exist_ok=True)
# art that fills its whole disc (no background to cut away): a clean anti-aliased round medallion inside the ring
ROUND = ('Dragon', 'Fisherman', 'Minion')
for f in sorted(glob.glob(SRC + '/*_w.png')):
    if os.path.basename(f)[:-6] in ROUND:
        src = Image.open(f).convert('RGBA'); w0 = src.size[0]; SS = 4
        m = Image.new('L', (w0 * SS, w0 * SS), 0); from PIL import ImageDraw
        rr = w0 * SS * .78 / 2; c0 = w0 * SS / 2; ImageDraw.Draw(m).ellipse((c0 - rr, c0 - rr, c0 + rr, c0 + rr), fill=255)
        src.putalpha(m.resize((w0, w0), Image.LANCZOS)); out = src.crop(src.getbbox())
        S = max(out.size); sq = Image.new('RGBA', (S, S), (0, 0, 0, 0)); sq.paste(out, ((S - out.size[0]) // 2, S - out.size[1]))
        sq.resize((256, 256), Image.LANCZOS).save(os.path.join(OUT, os.path.basename(f).replace('_w.png', '.png'))); continue
    im = np.array(Image.open(f).convert('RGBA')).astype(float); h, w = im.shape[:2]; cx, cy = w / 2, h / 2
    yy, xx = np.mgrid[0:h, 0:w]; r = np.hypot(xx - cx + .5, yy - cy + .5) / (w / 2)
    # the disc's light gradient: per-row colour sampled just inside the ring on both sides (median of a band)
    inner = (r > .80) & (r < .86)
    bg = np.zeros((h, 3))
    for y in range(h):
        px = im[y][inner[y]][:, :3]
        bg[y] = np.median(px, axis=0) if len(px) else bg[y - 1]
    d = np.full((h, w), 1e9)
    for o in range(-3, 4):
        b2 = np.roll(bg, o, axis=0); d = np.minimum(d, np.linalg.norm(im[:, :, :3] - b2[:, None, :], axis=2))
    keep = np.ones((h, w), bool); keep[r >= .79] = False
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
    from scipy.ndimage import label, binary_opening
    k2 = binary_opening(keep, iterations=2); lab, n = label(k2)
    if n: sizes = np.bincount(lab.ravel()); sizes[0] = 0; big = sizes.argmax(); keep = keep & (lab == big) | (keep & np.isin(lab, np.where(sizes > sizes[big] * .15)[0]))
    a = Image.fromarray((keep * 255).astype(np.uint8)).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(.7))
    out = Image.fromarray(im.astype(np.uint8)); out.putalpha(a)
    bb = out.getbbox(); out = out.crop(bb) if bb else out
    # pad to a square with the feet at the bottom centre
    S = max(out.size); sq = Image.new('RGBA', (S, S), (0, 0, 0, 0)); sq.paste(out, ((S - out.size[0]) // 2, S - out.size[1])); sq = sq.resize((256, 256), Image.LANCZOS)
    sq.save(os.path.join(OUT, os.path.basename(f).replace('_w.png', '.png')))
