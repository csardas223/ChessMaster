"""m3-art: key a clean cut-out off a coloured (chroma) background in a video frame / thumbnail sprite.
Background = pixels connected to the border whose chroma matches the bg hue; alpha from the chroma ratio against the
nearest background pixel's chroma (un-premultiply), so dark outlines keep a hard anti-aliased edge (no fading).
Output: RGBA trimmed + centred on an NxN canvas at FILL of the side."""
import numpy as np
from PIL import Image
from scipy.ndimage import distance_transform_edt, label, binary_fill_holes
def chroma_vec(a, bg):
    # project colour onto the bg's chroma direction (bg minus its grey level)
    g = a.mean(-1, keepdims=True); d = (bg - bg.mean()) ; d = d / (np.linalg.norm(d) + 1e-6)
    return ((a - g) * d).sum(-1)
def key(src, bg_rgb, thr=0.35, N=512, FILL=0.9, crop=None, keep_largest=True, hard=0.72, up=1):
    im = Image.open(src).convert('RGB')
    if crop: im = im.crop(crop)
    if up > 1: im = im.resize((im.size[0] * up, im.size[1] * up), Image.LANCZOS)
    a = np.asarray(im).astype(float); bg = np.array(bg_rgb, float)
    c = chroma_vec(a, bg); cb = chroma_vec(bg[None, None], bg)[0, 0]
    isbg = c > cb * 0.55
    # local bg chroma: nearest confident-bg pixel
    _, (iy, ix) = distance_transform_edt(~isbg, return_indices=True)
    cloc = np.maximum(c[iy, ix], 1.0)
    alpha = np.clip(1 - c / cloc, 0, 1)
    alpha[alpha < thr * 0.2] = 0
    if hard:   # drop soft glows / drop shadows: hard edge at `hard`, ~1.5 px anti-alias ramp
        from scipy.ndimage import gaussian_filter
        alpha = np.clip((gaussian_filter((alpha > hard).astype(float), 0.7 * up) - 0.5) * 2.2 + 0.5, 0, 1)
    fgm = alpha > 0.5
    if keep_largest:
        lab, n = label(fgm); 
        if n > 1:
            sizes = np.bincount(lab.ravel()); sizes[0] = 0; keep = lab == sizes.argmax()
            keep = binary_fill_holes(keep)
            from scipy.ndimage import binary_dilation
            alpha = np.where(binary_dilation(keep, iterations=3), alpha, 0)
    # un-premultiply colour: pix = a*fg + (1-a)*bg_local
    bgl = a[iy, ix]
    fg = (a - (1 - alpha[..., None]) * bgl) / np.maximum(alpha[..., None], 1e-3)
    fg = np.clip(fg, 0, 255)
    out = np.dstack([fg, alpha * 255]).astype(np.uint8)
    return place(Image.fromarray(out, 'RGBA'), N, FILL)
def place(im, N=512, FILL=0.9):
    a = np.asarray(im)[..., 3]; ys, xs = np.nonzero(a > 8)
    im = im.crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))
    s = FILL * N / max(im.size); w, h = max(1, round(im.size[0] * s)), max(1, round(im.size[1] * s))
    # premultiplied Lanczos resize
    p = np.asarray(im).astype(float); p[..., :3] *= p[..., 3:] / 255
    ch = [np.asarray(Image.fromarray(p[..., i].astype(np.float32), 'F').resize((w, h), Image.LANCZOS)) for i in range(4)]
    q = np.dstack(ch); al = np.clip(q[..., 3], 0, 255); rgb = np.clip(q[..., :3] / np.maximum(al[..., None], 1) * 255, 0, 255)
    rgb[al < 1] = 0
    out = Image.new('RGBA', (N, N), (0, 0, 0, 0))
    out.paste(Image.fromarray(np.dstack([rgb, al]).astype(np.uint8), 'RGBA'), ((N - w) // 2, (N - h) // 2))
    return out
def recolor_lum(im, pts):
    """map luminance of an RGBA image through piecewise-linear pts [(L_in, L_out), ...] (greyscale art)"""
    from scipy.ndimage import median_filter
    a = np.asarray(im).astype(float); L = median_filter(a[..., :3].mean(-1), 3); xs, ys = zip(*pts)
    v = np.interp(L, xs, ys); out = a.copy(); out[..., 0] = out[..., 1] = out[..., 2] = v
    return Image.fromarray(out.astype(np.uint8), 'RGBA')

def key_outlined(src, crop=None, dark=90, N=512, FILL=0.9, up=2, hard=0.6, seed=None):
    """Cut a black-outlined piece off any background (tile, frame): outside = border-connected non-dark pixels;
    piece = the rest (outline + everything it encloses), component at `seed` (default centre). Edge alpha from
    projection onto the local background colour (fg outline is near-black), then a hard ~1.5 px ramp."""
    from scipy.ndimage import binary_dilation, binary_erosion, gaussian_filter
    im = Image.open(src).convert('RGB')
    if crop: im = im.crop(crop)
    if up > 1: im = im.resize((im.size[0] * up, im.size[1] * up), Image.LANCZOS)
    a = np.asarray(im).astype(float); L = a.mean(-1)
    nd = L >= dark
    lab, n = label(nd); border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    outside = np.isin(lab, list(border))
    piece = ~outside
    lab2, n2 = label(piece)
    H, W = piece.shape; sy, sx = seed if seed else (H // 2, W // 2)
    k = lab2[sy, sx]
    if k == 0:
        sizes = np.bincount(lab2.ravel()); sizes[0] = 0; k = sizes.argmax()
    piece = binary_fill_holes(lab2 == k)
    deep = binary_erosion(outside, iterations=3 * up) | (outside & ~binary_dilation(piece, iterations=4 * up))
    _, (iy, ix) = distance_transform_edt(~deep, return_indices=True)
    B = a[iy, ix]
    proj = (a * B).sum(-1) / np.maximum((B * B).sum(-1), 1)
    alpha = np.where(piece, 1.0, np.clip(1 - proj, 0, 1))
    alpha[~binary_dilation(piece, iterations=2 * up)] = 0
    if hard:
        alpha = np.clip((gaussian_filter((alpha > hard).astype(float), 0.7 * up) - 0.5) * 2.2 + 0.5, 0, 1)
    fg = np.where(piece[..., None], a, a.min(axis=(0, 1)) * 0 + np.array([20., 20, 20]))
    out = np.dstack([np.clip(fg, 0, 255), alpha * 255]).astype(np.uint8)
    return place(Image.fromarray(out, 'RGBA'), N, FILL)

def fit_lum_map(old_w, old_b, bins=17):
    """luminance map w->b fitted on the old aligned crops (same canvas): median b lum per w-lum bin"""
    w = np.asarray(Image.open(old_w).convert('RGBA')).astype(float); b = np.asarray(Image.open(old_b).convert('RGBA')).astype(float)
    if w.shape != b.shape: return None
    m = (w[..., 3] > 250) & (b[..., 3] > 250); Lw = w[..., :3].mean(-1)[m]; Lb = b[..., :3].mean(-1)[m]
    pts = []
    for lo in np.linspace(0, 256, bins)[:-1]:
        s = (Lw >= lo) & (Lw < lo + 256 / (bins - 1))
        if s.sum() > 20: pts.append((lo + 8, float(np.median(Lb[s]))))
    if pts and pts[0][1] > pts[-1][1]:   # black piece = inverted: force a monotone (decreasing) map, drops noisy bins
        mono = []; cur = 1e9
        for x, y in pts: cur = min(cur, y); mono.append((x, cur))
        pts = mono
    iou = m.sum() / max(1, ((w[..., 3] > 250) | (b[..., 3] > 250)).sum())
    return pts, float(iou)
