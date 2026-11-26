#!/usr/bin/env python3
"""fin-sprites-b batch 2 (2026-11-26): Petrified Pawns (sGXmiyvZDE4) board sprites. Run from rebuild/app.
- wB.png / wP.png: were the pale video cuts re-shaded dark (no frame shows a dark pawn/bishop) and blurry; now rendered
  with the repo's own lathe renderer (tools/g3d_staunton.py, same geometry) in the player's dark glossy slate, no shadow,
  512px, bottom-aligned like the other pieces (B 84 %, P 74 % of the canvas height).
- gold.png (board pickup): was a 96px smudge on a baked dark square; now game-icons.net 'gold-nuggets' by Delapouite
  (CC BY 3.0) with a gold gradient + dark outline, transparent 512px at ~88 %.
- orb.png (new, board 'Healing orb' piece): sp_orb.png is the spell's square HUD icon with its dark background baked in; on
  the board the orb is now a transparent glowing green orb drawn to the icon's design (green sphere, cross sparkle, ring).
"""
import io, re, subprocess, urllib.request, numpy as np, cairosvg
from PIL import Image, ImageDraw, ImageFilter

A = 'assets/modes/sGXmiyvZDE4/'


def render_dark():
    src = open('tools/g3d_staunton.py').read()
    src = re.sub(r"^COL = .*$", "COL = {'d': (np.array([58, 66, 74]), .55, 50)}", src, flags=re.M)
    src = re.sub(r"^PIECES = \{.*$", "PIECES = {'P': pawn, 'B': bishop_f}", src, flags=re.M)
    src = src.replace(", 0, 1) * .35", ", 0, 1) * 0")   # no contact shadow
    src = src.replace("resize((256, 256), Image.LANCZOS)", "resize((512, 512), Image.LANCZOS)")
    open('/tmp/fsb_g3d_pp.py', 'w').write(src)
    subprocess.run(['python3', '/tmp/fsb_g3d_pp.py', '/tmp/fsb_g3d'], check=True)
    for t, frac in (('B', .84), ('P', .74)):
        im = Image.open(f'/tmp/fsb_g3d/d{t}.png').convert('RGBA')
        im = im.crop(im.getbbox())
        h = int(512 * frac); w = round(im.width * h / im.height)
        im = im.resize((w, h), Image.LANCZOS)
        out = Image.new('RGBA', (512, 512), (0, 0, 0, 0))
        out.alpha_composite(im, ((512 - w) // 2, int(512 * .95) - h))
        out.save(A + f'w{t}.png')


def gold():
    svg = urllib.request.urlopen('https://raw.githubusercontent.com/game-icons/icons/master/delapouite/gold-nuggets.svg').read().decode()
    svg = svg.replace('<path d="M0 0h512v512H0z"/>', '')
    svg = re.sub(r'<svg([^>]*)>', r'<svg\1><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe27a"/>'
                 r'<stop offset=".55" stop-color="#f2b51c"/><stop offset="1" stop-color="#b8720a"/></linearGradient></defs>', svg, count=1)
    svg = re.sub(r'fill="#fff"', 'fill="url(#g)" stroke="#4a2c05" stroke-width="12" paint-order="stroke"', svg)
    im = Image.open(io.BytesIO(cairosvg.svg2png(bytestring=svg.encode(), output_width=1024, output_height=1024))).convert('RGBA')
    im = im.crop(im.getbbox())
    s = 0.88 * 512 / max(im.size)
    im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    out = Image.new('RGBA', (512, 512), (0, 0, 0, 0))
    out.alpha_composite(im, ((512 - im.width) // 2, (512 - im.height) // 2))
    out.save(A + 'gold.png')


def orb():
    S = 512; k = 2; N = S * k
    yy, xx = np.mgrid[0:N, 0:N] / k
    c = S / 2; r = np.hypot(xx - c, yy - c)
    R = 150
    sphere = np.clip((R - r) / 1.5, 0, 1)
    # shaded sphere: bright core upper-left, deep green rim
    lt = np.clip(1 - np.hypot(xx - (c - 45), yy - (c - 50)) / (R * 1.6), 0, 1)
    col = np.stack([40 + 150 * lt**2, 140 + 115 * lt, 60 + 120 * lt**2], -1)
    glow = np.clip(1 - (r - R) / 70, 0, 1) ** 2 * (r > R)
    ring = np.exp(-((r - (R + 40)) / 6) ** 2) * .9
    # cross sparkle
    sp = np.maximum(np.exp(-np.abs(xx - c) / 5) * np.clip(1 - np.abs(yy - c) / 230, 0, 1),
                    np.exp(-np.abs(yy - c) / 5) * np.clip(1 - np.abs(xx - c) / 230, 0, 1)) ** 1.2
    a = np.clip(sphere + glow * .55 + ring + sp * .9, 0, 1)
    rgb = col * sphere[..., None] + np.array([90, 255, 120]) * (1 - sphere[..., None])
    rgb = rgb * (1 - sp[..., None] * .8) + np.array([235, 255, 235]) * sp[..., None] * .8
    out = np.dstack([np.clip(rgb, 0, 255), a * 255]).astype('uint8')
    Image.fromarray(out, 'RGBA').resize((S, S), Image.LANCZOS).save(A + 'orb.png')


if __name__ == '__main__':
    import sys
    for n in (sys.argv[1:] or ['render_dark', 'gold', 'orb']):
        globals()[n](); print('ok', n)
