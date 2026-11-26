"""Render a pre-shaded '3D Staunton' sprite set (flat PNG sprites that read as 3D) for the 3D Glasses mode.
Procedural: lathe-profile solids (+ an extruded, rounded knight head) ray-marched in numpy, orthographic camera
25 deg above the board, Lambert+Blinn shading, thin dark outline, soft contact shadow. Output 512x512 RGBA PNG."""
import numpy as np, sys, os
from PIL import Image, ImageDraw
from scipy.ndimage import distance_transform_edt, binary_erosion
OUT = sys.argv[1] if len(sys.argv) > 1 else 'assets/pieces/staunton3d'
os.makedirs(OUT, exist_ok=True)
N = 512; E = np.radians(25); SPAN = 1.24; CY = 0.40
R = np.array([1., 0, 0]); U = np.array([0, np.cos(E), -np.sin(E)]); V = np.array([0, np.sin(E), np.cos(E)])
def prof(pts):
    ys, rs = np.array(pts).T
    return lambda y: np.interp(y, ys, rs, left=-1, right=-1)
BASE = [(0, .40), (.05, .40), (.07, .36), (.10, .35), (.12, .31)]
def lathe(p): return lambda x, y, z: np.hypot(x, z) < p(y)
def sph(c, r): return lambda x, y, z: (x - c[0])**2 + (y - c[1])**2 + (z - c[2])**2 < r * r
def box(lo, hi): return lambda x, y, z: (x > lo[0]) & (x < hi[0]) & (y > lo[1]) & (y < hi[1]) & (z > lo[2]) & (z < hi[2])
def U_(*fs): return lambda x, y, z: np.logical_or.reduce([f(x, y, z) for f in fs])
pawn = U_(lathe(prof(BASE + [(.14, .25), (.17, .22), (.40, .12), (.43, .21), (.47, .21), (.49, .12)])), sph((0, .60, 0), .15))
def rook_f(x, y, z):
    rho = np.hypot(x, z); a = np.arctan2(z, x)
    body = rho < prof(BASE + [(.15, .27), (.55, .23), (.58, .30), (.74, .30)])(y)
    notch = (y > .64) & (np.mod(a + .3, 2 * np.pi / 5) < .5)
    hollow = (y > .66) & (rho < .2)
    return body & ~notch & ~hollow
bishop_body = U_(lathe(prof(BASE + [(.15, .24), (.50, .11), (.52, .21), (.56, .21), (.58, .12)])),
                 lambda x, y, z: (x / .155)**2 + ((y - .72) / .2)**2 + (z / .155)**2 < 1, sph((0, .95, 0), .045))
def bishop_f(x, y, z):
    slit = (np.abs((y - .78) - .9 * (x + .02)) < .025) & (z > -.2) & (y > .70) & (x > -.06)
    return bishop_body(x, y, z) & ~(slit & (y < .9))
def crown(top, cup, pts):
    ang = np.linspace(0, 2 * np.pi, pts, endpoint=False)
    balls = [sph((cup * np.cos(a), top, cup * np.sin(a)), .05) for a in ang]
    return balls
queen = U_(lathe(prof(BASE + [(.15, .25), (.58, .13), (.60, .23), (.64, .23), (.66, .15), (.84, .26), (.86, .24)])),
           sph((0, .82, 0), .14), sph((0, .99, 0), .055), *crown(.87, .25, 8))
king = U_(lathe(prof(BASE + [(.15, .26), (.60, .14), (.62, .24), (.66, .24), (.68, .16), (.84, .23), (.87, .23), (.88, .12)])),
          sph((0, .87, 0), .12), box((-.035, .92, -.035), (.035, 1.13, .035)), box((-.10, 1.02, -.035), (.10, 1.08, .035)))
# knight: lathe base + extruded head silhouette (facing left), rounded by distance transform
kb = lathe(prof(BASE + [(.15, .30), (.22, .29), (.24, .27)]))
G = 400; img = Image.new('L', (G, G), 0)   # head grid covers x,y in [-.5,.5]x[.1,1.1]
poly = [(.26, .2), (.27, .45), (.22, .66), (.12, .80), (.02, .87), (-.02, .95), (-.06, .86), (-.16, .80), (-.30, .66),
        (-.36, .56), (-.33, .50), (-.24, .50), (-.12, .56), (-.03, .58), (-.10, .45), (-.20, .32), (-.22, .2)]
ImageDraw.Draw(img).polygon([((x + .5) * G, (1.1 - y) * G) for x, y in poly], fill=255)
hm = np.array(img) > 0; hd = distance_transform_edt(hm) / G
hw = np.minimum(.14, np.sqrt(hd * .05) * 1.0) * hm
def knight_f(x, y, z):
    gi = np.clip(((1.1 - y) * G).astype(int), 0, G - 1); gj = np.clip(((x + .5) * G).astype(int), 0, G - 1)
    head = np.abs(z) < hw[gi, gj]
    eye = ((x + .02)**2 + (y - .74)**2 < .025**2) & (np.abs(z) > hw[gi, gj] - .03)
    return (kb(x, y, z) | head) & ~eye
PIECES = {'P': pawn, 'R': rook_f, 'B': bishop_f, 'N': knight_f, 'Q': queen, 'K': king}
def render(f):
    s = (np.arange(N) + .5) / N * SPAN - SPAN / 2
    sx, sy = np.meshgrid(s, -s + CY)
    depth = np.full((N, N), np.nan); ts = np.linspace(1.2, -1.2, 600)
    o = sx[..., None] * R + sy[..., None] * U
    for t in ts:
        p = o + t * V
        hit = f(p[..., 0], p[..., 1], p[..., 2]) & np.isnan(depth)
        depth[hit] = t
    m = ~np.isnan(depth)
    d = np.where(m, depth, -2.0)
    from scipy.ndimage import gaussian_filter
    w = gaussian_filter(m.astype(float), 2); d = np.where(m, gaussian_filter(np.where(m, depth, 0), 2) / np.maximum(w, 1e-3), -2.0)
    # normals from depth map in screen space
    gy, gx = np.gradient(d, SPAN / N)
    gx = np.clip(gx, -8, 8); gy = np.clip(gy, -8, 8)
    n = np.stack([-gx, gy, np.ones_like(d)], -1)   # screen space (right, up, toward cam)
    n /= np.linalg.norm(n, axis=-1, keepdims=True)
    return m, n
L = np.array([-.55, .65, .55]); L /= np.linalg.norm(L); H = L + np.array([0, 0, 1.]); H /= np.linalg.norm(H)
COL = {'w': (np.array([238, 205, 152]), .35, 40), 'b': (np.array([62, 58, 55]), .55, 60)}
for t, f in PIECES.items():
    m, n = render(f)
    lam = np.clip(n @ L, 0, 1); spec = np.clip(n @ H, 0, 1)
    edge = m & ~binary_erosion(m, iterations=5)
    for c, (base, ks, sh) in COL.items():
        rgb = base * (.42 + .68 * lam[..., None]) + 255 * ks * spec[..., None]**sh
        rgb[edge] = rgb[edge] * .35
        a = m.astype(float)
        # soft contact shadow ellipse under the base
        yy, xx = np.mgrid[0:N, 0:N]; cy0 = (CY - (-.0)) / SPAN * N + N / 2 - (CY / SPAN * N) + (CY) / SPAN * N
        by = (CY + 0.0 * np.cos(E)) / SPAN * N + N / 2   # screen row of world y=0 (centre)
        sh_a = np.clip(1 - (((xx - N / 2) / (.47 / SPAN * N))**2 + ((yy - by) / (.22 / SPAN * N))**2), 0, 1) * .35
        out = np.zeros((N, N, 4))
        out[..., :3] = np.where(m[..., None], rgb, 0); out[..., 3] = np.where(m, 1, sh_a)
        im = Image.fromarray(np.clip(out * [1, 1, 1, 255], 0, 255).astype(np.uint8), 'RGBA')   # m-3d 2026-11-26: kept at the full 512 px render (owner rule: sprites >= 512 px)
        im.save(f'{OUT}/{c}{t}.png'); print(c + t, m.mean().round(3))
