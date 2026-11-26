#!/usr/bin/env python3
"""g4 art pass 4 (2026-11-25): crops from owner-approved single video frames.

Frames: one browser task per frame on youtube.com (1080p60, paused, full screen, controls hidden); the task's last
screenshot is 1920x1440 with the video at y 180..1260. Committed as research/frames/video_thumbs/<id>_frame_<s>.jpg.
Run from rebuild/app:  python3 tools/g4_art4.py <dir with the .png frames named <id>_<seconds>.png>
"""
import os, sys, colorsys
from collections import deque
from PIL import Image
import numpy as np

SRC = sys.argv[1] if len(sys.argv) > 1 else '/workspace/work/agent-g4/frames'
THUMBS = '../research/frames/video_thumbs'
A = 'assets/modes'

FRAMES = ['AaHmMC3HA0E_1249', 'AaHmMC3HA0E_1354', 'D8olpXjblQ0_1087', 'LjehdkzmCho_272', 'CONozr99agQ_703',
          'AWFB4EzGtDc_38', 'AWFB4EzGtDc_62', 'AWFB4EzGtDc_492', 'AWFB4EzGtDc_1573', 'BbgwPj-u_gs_551']


def frame(name):
    return Image.open(os.path.join(SRC, name + '.png')).convert('RGB')


def save_frames():
    for f in FRAMES:
        vid, s = f.rsplit('_', 1)
        frame(f).crop((0, 180, 1920, 1260)).save(os.path.join(THUMBS, '%s_frame_%s.jpg' % (vid, s)), quality=90)


def square(im, bg, size):
    w, h = im.size; n = max(w, h)
    out = Image.new('RGBA', (n, n), bg); out.paste(im, ((n - w) // 2, (n - h) // 2))
    return out.resize((size, size), Image.LANCZOS)


def avatars():
    os.makedirs(A + '/AaHmMC3HA0E', exist_ok=True); os.makedirs(A + '/D8olpXjblQ0', exist_ok=True)
    # chess.com right-panel bot portraits (the large copy beside the chat bubble); panel colour as background
    tb = frame('AaHmMC3HA0E_1249').crop((1229, 381, 1346, 524)).convert('RGBA')
    square(tb, (39, 37, 35, 255), 128).save(A + '/AaHmMC3HA0E/trashbot1999.png')
    ms = frame('AaHmMC3HA0E_1354').crop((1229, 386, 1366, 524)).convert('RGBA')
    square(ms, (39, 37, 35, 255), 128).save(A + '/AaHmMC3HA0E/the_master.png')
    # Level 20 (2000): the player-bar avatar square (it is drawn on its own tile)
    lv = frame('D8olpXjblQ0_1087').crop((1227, 219, 1326, 320)).convert('RGBA')
    lv.resize((256, 256), Image.LANCZOS).save(A + '/D8olpXjblQ0/lvl20.png')


def flood_alpha(im, tol, seeds=None, stop=None):
    """transparent background: flood fill from the border through pixels within tol of the seed colour."""
    a = np.array(im.convert('RGBA')).astype(int); h, w = a.shape[:2]
    bg = a[0, 0, :3]; seen = np.zeros((h, w), bool); q = deque()
    for x in range(w):
        q.append((0, x)); q.append((h - 1, x))
    for y in range(h):
        q.append((y, 0)); q.append((y, w - 1))
    while q:
        y, x = q.popleft()
        if y < 0 or x < 0 or y >= h or x >= w or seen[y, x]: continue
        p = a[y, x, :3]
        ok = (np.abs(p - bg).sum() <= tol) if stop is None else not stop(p)
        if not ok: continue
        seen[y, x] = True; a[y, x, 3] = 0
        q.extend(((y + 1, x), (y - 1, x), (y, x + 1), (y, x - 1)))
    return Image.fromarray(a.astype('uint8'), 'RGBA'), seen


def elephant():
    f = frame('LjehdkzmCho_272')
    # black Elephant on h8 (dark green square, board shown from Black's side) and the white Elephant of the side legend
    b = f.crop((1300, 256, 1413, 369))
    a = np.array(b.convert('RGBA')).astype(int)
    green = np.array([121, 150, 90])
    d = np.abs(a[:, :, :3] - green).sum(2)
    a[:, :, 3] = np.where(d < 70, 0, 255)          # the piece is dark grey/black, far from the square green
    Image.fromarray(a.astype('uint8')).resize((128, 128), Image.LANCZOS).save(A + '/LjehdkzmCho/E_b.png')
    w = f.crop((1752, 1058, 1844, 1166))
    im, _ = flood_alpha(w, 20)
    square(im, (0, 0, 0, 0), 128).save(A + '/LjehdkzmCho/E_w.png')


def arena_pieces():
    """Chess Arena 'Base Purple' skin models from the champion-select preview board (11:43). Background removed with
    rembg (u2netp) on the preview at 3x; the knight stands behind the king and the queen behind the rook, so each is
    split along the front piece's outline; their hidden bases are the pawn's / rook's base (same model base; inferred)."""
    from rembg import remove, new_session
    f = frame('CONozr99agQ_703'); out = A + '/CONozr99agQ/pieces'; os.makedirs(out, exist_ok=True)
    X0, Y0, X1, Y1, K = 1400, 270, 1800, 600, 3
    big = f.crop((X0, Y0, X1, Y1)).resize(((X1 - X0) * K, (Y1 - Y0) * K), Image.LANCZOS)
    cut = remove(big, session=new_session('u2netp')).convert('RGBA')
    al = np.array(cut)[:, :, 3] > 110
    rgb = np.array(big.convert('RGBA'))
    def piece(box, keep=None):
        x0, y0, x1, y1 = [(v - o) * K for v, o in zip(box, (X0, Y0, X0, Y0))]
        m = np.zeros_like(al); m[y0:y1, x0:x1] = al[y0:y1, x0:x1]
        if keep is not None:
            yy, xx = np.mgrid[0:al.shape[0], 0:al.shape[1]]
            m &= keep(xx / K + X0, yy / K + Y0)
        from scipy import ndimage
        lab, n = ndimage.label(m)
        if n > 1: m = lab == (np.argmax(ndimage.sum(m, lab, range(1, n + 1))) + 1)   # drop slivers of neighbours
        a = rgb.copy(); a[:, :, 3] = np.where(m, 255, 0)
        im = Image.fromarray(a); return im.crop(im.getbbox())
    Kp = piece((1428, 326, 1522, 507), lambda x, y: ~((x > 1498) & (y < 416)))
    Pp = piece((1590, 284, 1665, 386))
    Bp = piece((1532, 401, 1638, 588))
    Rp = piece((1682, 393, 1775, 538))
    Qtop = piece((1688, 296, 1765, 396))
    Ntop = piece((1476, 296, 1557, 370), lambda x, y: ~((x < 1503) & (y > 326)))
    def stack(top, base_src, frac):
        base = base_src.crop((0, int(base_src.size[1] * frac), base_src.size[0], base_src.size[1]))
        s = top.size[0] * 1.05 / base.size[0]; base = base.resize((max(1, int(base.size[0] * s)), max(1, int(base.size[1] * s))), Image.LANCZOS)
        W = max(top.size[0], base.size[0]); ov = int(base.size[1] * 0.18)
        c = Image.new('RGBA', (W, top.size[1] + base.size[1] - ov), (0, 0, 0, 0))
        c.alpha_composite(base, ((W - base.size[0]) // 2, top.size[1] - ov)); c.alpha_composite(top, ((W - top.size[0]) // 2, 0))
        return c
    Qp = stack(Qtop, Rp, 0.62); Np = stack(Ntop, Pp, 0.55)
    for t, im in {'K': Kp, 'P': Pp, 'B': Bp, 'R': Rp, 'Q': Qp, 'N': Np}.items():
        sq = square(im, (0, 0, 0, 0), 128); sq.save(out + '/w' + t + '.png')
        # rival armies: same models, hue turned from purple/teal to red/orange (other players' skins; inferred)
        a = np.array(sq).astype(float) / 255.0; o = a.copy()
        for y in range(a.shape[0]):
            for x in range(a.shape[1]):
                if a[y, x, 3] == 0: continue
                h, l, s = colorsys.rgb_to_hls(*a[y, x, :3]); r, g, b = colorsys.hls_to_rgb((h + 0.22) % 1.0, l, s)
                o[y, x, :3] = (r, g, b)
        Image.fromarray((o * 255).astype('uint8')).save(out + '/b' + t + '.png')


def gunking():
    d = A + '/AWFB4EzGtDc'
    # floor tiles: a 2x2-tile patch of each biome (one light + one dark tile each way), used as a repeating pattern
    icy = frame('AWFB4EzGtDc_62')
    icy.crop((388, 452, 516, 580)).save(d + '/floor_icy.png')
    st = frame('AWFB4EzGtDc_38')
    st.crop((700, 760, 828, 888)).save(d + '/floor_start.png')


if __name__ == '__main__':
    save_frames(); avatars(); elephant(); arena_pieces(); gunking()
    print('ok')
