#!/usr/bin/env python3
"""art-audit-q2 part 2 (2026-11-25): the q2 leftovers of research/art_audit_todo.md.

Sources (all from the videos unless noted):
  research/frames/video_thumbs/<id>_maxres.jpg (or <id>_maxresdefault.jpg) = i.ytimg.com/vi/<id>/maxresdefault.jpg
  research/frames/sprites/...                  = earlier frame cuts
  research/frames/sprites_web/VV9Wb6egokU_yugobandai_chesscom_200.png = YugoBandai's chess.com avatar (same lion art as
      the video's player bar), https://images.chesscomfiles.com/uploads/v1/user/191487185.ca0a57d1.200x200o.3f99e09f798d.png
      via https://api.chess.com/pub/player/yugobandai
Steps that clean an existing asset read the version at BASE (git show), so re-running is idempotent.
Run from anywhere: python3 rebuild/tools/art_q2_fix2.py [step ...]
"""
import os, sys, io, math, subprocess
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage as ndi

HERE = os.path.dirname(os.path.abspath(__file__))
R = os.path.normpath(os.path.join(HERE, '..'))
A = os.path.join(R, 'app/assets/modes')
BASE = 'f35652a'  # rebuild HEAD before this pass
sys.path.insert(0, HERE)
import art_q2_recut as Q  # key(), save(), magenta_bg()


def thumb(vid):
    for n in (f'{vid}_maxres.jpg', f'{vid}_maxresdefault.jpg'):
        p = os.path.join(R, 'research/frames/video_thumbs', n)
        if os.path.exists(p):
            return Image.open(p).convert('RGB')
    return Q.thumb(vid)


def orig(rel):
    """asset as it was at BASE (rel = path under app/assets/modes)."""
    data = subprocess.run(['git', '-C', R, 'show', f'{BASE}:rebuild/app/assets/modes/{rel}'], capture_output=True, check=True).stdout
    return Image.open(io.BytesIO(data))


def out(rel):
    return os.path.join(A, rel)


# ---------------------------------------------------------------- 96px avatars
def avatars():
    # Martin XIII (GQ6MT1m78Yo): the baby from the video's thumbnail, head + pink shirt on the thumbnail's purple
    thumb('GQ6MT1m78Yo').crop((415, 236, 865, 686)).resize((256, 256), Image.LANCZOS).save(out('GQ6MT1m78Yo/opponent.png'), optimize=True)
    # GothamChess bot (SC1loYlAJRE): the thumbnail's cartoon Levy; the title letters behind his hair are painted over with
    # a quadratic fit of the pink backdrop (only outside the hair silhouette, top 240 rows of the crop)
    t = np.asarray(thumb('SC1loYlAJRE')).astype(float)
    X0, Y0, S, TOP = 340, 30, 600, 200
    a = t[Y0:Y0 + S, X0:X0 + S].copy()
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    pink = (r > 150) & (g < 120) & (b > 60) & (r - g > 90)
    dark = (a.sum(-1) < 360) & (b > r + 5)
    band = dark[:TOP + 60]
    lab, n = ndi.label(band); sz = ndi.sum(band, lab, range(1, n + 1))
    hair = np.zeros_like(dark); hair[:TOP + 60] = lab == 1 + int(np.argmax(sz))
    head = np.zeros(a.shape[:2], bool)
    for y in range(TOP + 40):
        cols = np.where(hair[y, 120:480])[0] + 120
        if len(cols):
            head[y, max(0, cols.min() - 8):cols.max() + 9] = True
    yy, xx = np.mgrid[0:TOP + 60, 0:S]
    m = pink[:TOP + 60] & ~head[:TOP + 60]
    feats = lambda X, Y: np.stack([np.ones(X.size), X.ravel(), Y.ravel(), X.ravel() ** 2, Y.ravel() ** 2, (X * Y).ravel()], 1)
    Af = feats(xx, yy); Am = feats(xx[m], yy[m])
    fill = np.zeros((TOP + 60, S, 3))
    for c in range(3):
        co, *_ = np.linalg.lstsq(Am, a[:TOP + 60][..., c][m], rcond=None)
        fill[..., c] = (Af @ co).reshape(TOP + 60, S)
    rep = (~pink[:TOP + 60]) & (~head[:TOP + 60]); rep[TOP + 40:] = False
    rep = ndi.binary_dilation(rep, iterations=2) & ~head[:TOP + 60]; rep[TOP + 40:] = False
    a[:TOP + 60][rep] = fill[rep]
    Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).resize((256, 256), Image.LANCZOS).save(out('SC1loYlAJRE/opponent.png'), optimize=True)
    # YugoBandai (VV9Wb6egokU): his chess.com avatar (same lion), white backdrop -> the video bar's grey (186,186,184)
    y = np.asarray(Image.open(os.path.join(R, 'research/frames/sprites_web/VV9Wb6egokU_yugobandai_chesscom_200.png')).convert('RGB')).astype(float)
    w = y.min(-1) > 235
    lab, n = ndi.label(w)
    border = set(np.unique(np.r_[lab[0], lab[-1], lab[:, 0], lab[:, -1]])) - {0}
    bg = np.isin(lab, list(border))
    edge = ndi.binary_dilation(bg, iterations=2) & ~bg
    grey = np.array([186, 186, 184.])
    o = y.copy(); o[bg] = grey
    wt = np.clip((y.min(-1) - 150) / 105, 0, 1)[..., None]
    o[edge] = (y - 255 * wt + grey * wt)[edge]
    Image.fromarray(np.clip(o, 0, 255).astype(np.uint8)).save(out('VV9Wb6egokU/opponent.png'), optimize=True)
    # ilikecheese (QrKIKcYN5m4): no larger copy exists (no chess.com avatar any more); trim the red crop strip (top/right)
    orig('QrKIKcYN5m4/opponent.png').convert('RGB').crop((0, 10, 85, 95)).resize((96, 96), Image.LANCZOS).save(out('QrKIKcYN5m4/opponent.png'), optimize=True)
    # Oj5rYPqpldg chadkatter: photo avatar, no larger source (chess.com account has no avatar now) -> left as is


# ---------------------------------------------------------------- Anarchy Chess doodles
WX = ['R_w', 'R_b', 'Iq_w', 'Iq_b', 'B_w', 'B_b', 'Ch_w', 'Ch_b', 'K_w', 'K_b', 'Knook_w', 'Knook_b', 'N_w', 'N_b', 'P_w', 'P_b',
      'Q_w', 'Q_b', 'U_w', 'U_b', 'T_n']


def _wx_clean(arr, ref=None):
    a = arr[..., 3].astype(float); rgb = arr[..., :3].astype(float)
    dark = (rgb.mean(-1) < 90) & (a > 140)
    dark = ndi.binary_closing(dark, iterations=1)
    filled = ndi.binary_fill_holes(dark)
    lab, n = ndi.label(filled); sz = ndi.sum(filled, lab, range(1, n + 1))
    filled = np.isin(lab, 1 + np.where(sz >= max(40, sz.max() * 0.03))[0])
    if filled.sum() < 0.75 * (a > 128).sum():  # white doodle whose pencil outline is not closed
        m = a > 40; lab, n = ndi.label(m, structure=np.ones((3, 3))); sz = ndi.sum(m, lab, range(1, n + 1))
        filled = np.isin(lab, 1 + np.where(sz >= max(40, sz.max() * 0.03))[0])
    keep = ndi.binary_dilation(filled, iterations=1)
    if ref is not None:
        keep &= ndi.binary_dilation(ref, iterations=1)
    o = arr.copy(); o[..., 3] = (a * keep).astype(np.uint8)
    return o, filled


def wx():
    """WXcmWG7Eczs: drop everything outside each doodle's closed outline (speckle halos); a white doodle is also clipped to
    its black twin's silhouette (same drawing, same placement), which removes R_w's blue-grey streak."""
    BF = {}
    for nm in sorted(WX, key=lambda n: not n.endswith('_b')):
        arr = np.asarray(orig(f'WXcmWG7Eczs/{nm}.png').convert('RGBA')).copy()
        ref = BF.get(nm[:-2] + '_b') if nm.endswith('_w') else None
        o, filled = _wx_clean(arr, ref)
        if nm.endswith('_b'):
            BF[nm] = filled
        Image.fromarray(o, 'RGBA').save(out(f'WXcmWG7Eczs/{nm}.png'), optimize=True)


# ---------------------------------------------------------------- Secret Queen
def secretq():
    # corner badge: the video's 32px blue star disc redrawn at 96px in its sampled colours (blue ~(52,18,186), white star)
    S = 384; im = Image.new('RGBA', (S, S), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    d.ellipse((8, 8, S - 8, S - 8), fill=(255, 255, 255, 235))
    d.ellipse((28, 28, S - 28, S - 28), fill=(52, 18, 186, 255))
    cx = cy = S / 2; Ro = S * 0.30; ri = Ro * 0.45
    pts = [(cx + (Ro if k % 2 == 0 else ri) * math.cos(-math.pi / 2 + k * math.pi / 5),
            cy + 6 + (Ro if k % 2 == 0 else ri) * math.sin(-math.pi / 2 + k * math.pi / 5)) for k in range(10)]
    d.polygon(pts, fill=(246, 244, 255, 255))
    im.resize((96, 96), Image.LANCZOS).save(out('JPDYufARCQU/star_pawn.png'), optimize=True)
    # intro overlay: the thumbnail's secret-queen pawn (white pawn wearing the queen's crown outline)
    t = thumb('JPDYufARCQU'); sc = t.width / 960
    rgb = np.asarray(t.crop([int(v * sc) for v in (600, 100, 860, 415)])).astype(float)
    f = ndi.binary_fill_holes(ndi.binary_closing(rgb.mean(-1) < 80, iterations=2))
    lab, n = ndi.label(f); sz = ndi.sum(f, lab, range(1, n + 1)); f = lab == 1 + int(np.argmax(sz))
    al = np.asarray(Image.fromarray((f * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.7))).astype(float) * f
    ys, xs = np.where(f)
    arr = np.dstack([rgb, al]).astype(np.uint8)[ys.min() - 3:ys.max() + 4, xs.min() - 3:xs.max() + 4]
    p = Image.fromarray(arr, 'RGBA'); s = max(p.size)
    c = Image.new('RGBA', (s, s), (0, 0, 0, 0)); c.paste(p, ((s - p.width) // 2, (s - p.height) // 2))
    c.save(out('JPDYufARCQU/secret_queen_pawn.png'), optimize=True)


# ---------------------------------------------------------------- tiles
def tiles():
    # Re3c-3qomgQ TNT: the video's tile without the neighbour strips, snapped back to its 16x16 Minecraft pixel grid
    t = orig('Re3c-3qomgQ/tnt.png').convert('RGB').crop((14, 11, 116, 114))
    a = np.asarray(t).astype(float); H, W = a.shape[:2]
    px = np.zeros((16, 16, 3))
    for i in range(16):
        for j in range(16):
            y0, y1 = int(i * H / 16), int((i + 1) * H / 16); x0, x1 = int(j * W / 16), int((j + 1) * W / 16)
            px[i, j] = np.median(a[y0 + 1:max(y0 + 2, y1 - 1), x0 + 1:max(x0 + 2, x1 - 1)].reshape(-1, 3), 0)
    Image.fromarray(px.astype(np.uint8)).resize((128, 128), Image.NEAREST).save(out('Re3c-3qomgQ/tnt.png'), optimize=True)
    # cobble: drop the black strip on top and the beige strip on the left (the tile is only partly visible in the frame,
    # so no grid snap)
    orig('Re3c-3qomgQ/cobble.png').convert('RGB').crop((7, 12, 123, 128)).resize((128, 128), Image.LANCZOS) \
        .filter(ImageFilter.UnsharpMask(1.5, 50, 2)).save(out('Re3c-3qomgQ/cobble.png'), optimize=True)
    # VVuAgqLzD_o rock: the grey tile only (no green neighbour squares)
    Image.open(os.path.join(R, 'research/frames/sprites/VVuAgqLzD_o_rock.png')).convert('RGB').crop((20, 20, 122, 122)) \
        .resize((256, 256), Image.LANCZOS).filter(ImageFilter.UnsharpMask(2, 60, 2)).save(out('VVuAgqLzD_o/rock.png'), optimize=True)
    # I07GcHQtY2o pit: the hole + its red rim as an ellipse on transparency (no stone tile / piece bits around it)
    a = np.asarray(orig('I07GcHQtY2o/pit.png').convert('RGB')).astype(float)
    d = ndi.binary_opening(a.mean(-1) < 75, iterations=2)
    lab, n = ndi.label(d); sz = ndi.sum(d, lab, range(1, n + 1)); d = ndi.binary_fill_holes(lab == 1 + int(np.argmax(sz)))
    ys, xs = np.where(d); cy, cx = ys.mean(), xs.mean(); ry = (ys.max() - ys.min()) / 2; rx = (xs.max() - xs.min()) / 2
    yy, xx = np.mgrid[0:a.shape[0], 0:a.shape[1]]; rim = 5
    e = np.sqrt(((yy - cy) / (ry + rim)) ** 2 + ((xx - cx) / (rx + rim)) ** 2)
    al = np.clip(0.5 - (e - 1) * (min(ry, rx) + rim), 0, 1) * 255
    Image.fromarray(np.dstack([a, al]).astype(np.uint8), 'RGBA').resize((192, 192), Image.LANCZOS).save(out('I07GcHQtY2o/pit.png'), optimize=True)
    # Rtee8TRU0vg die: the big die of the video's own thumbnail keyed off its magenta backdrop
    rgb = np.asarray(thumb('Rtee8TRU0vg').crop((400, 220, 880, 720))).astype(np.float32)
    Q.save(rgb, Q.key(rgb, Q.magenta_bg), out('Rtee8TRU0vg/die.png'), 320)


def flag():
    """X-aULHXsAaI: remove the dark/purple backdrop fringe along the flag's right/top edge and the dark specks between
    pole and cloth (the art has no near-black), then smooth the edge and pull rim colours from the solid interior."""
    arr = np.asarray(orig('X-aULHXsAaI/checkered_flag.png').convert('RGBA')).astype(float)
    m = (arr[..., 3] > 128) & ~(arr[..., :3].mean(-1) < 60)
    m = ndi.median_filter(m.astype(np.uint8), size=5).astype(bool)
    lab, n = ndi.label(m); sz = ndi.sum(m, lab, range(1, n + 1)); m = np.isin(lab, 1 + np.where(sz >= sz.max() * 0.05)[0])
    core = ndi.binary_erosion(m, iterations=2)
    _, (iy, ix) = ndi.distance_transform_edt(~core, return_indices=True)
    rgb = arr[..., :3].copy(); ring = m & ~core; rgb[ring] = arr[iy, ix, :3][ring]
    m2 = ndi.binary_erosion(m, iterations=1)
    al = np.asarray(Image.fromarray((m2 * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.1))).astype(float)
    Image.fromarray(np.dstack([rgb, al]).astype(np.uint8), 'RGBA').save(out('X-aULHXsAaI/checkered_flag.png'), optimize=True)


if __name__ == '__main__':
    steps = sys.argv[1:] or ['avatars', 'wx', 'secretq', 'tiles', 'flag']
    for s in steps:
        globals()[s]()
        print('done', s)
