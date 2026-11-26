#!/usr/bin/env python3
"""Link-preview card for index.html (og:image / twitter:image), s6 refresh 2026-11-26.
Writes assets/og/og-default.png, 1200x630, in the app's current look (css/balatro.css): chess.com colours,
Jersey 15 title (assets/fonts, OFL), rimmed cards with hard shadows, chunky green slab.
Art is real: board shots of SCP-4975 / Pac-Man / Duck chess from the README store page (docs/media/shots,
made by tools/readme_store.py --capture) and iwantcheckmate's video stills (research/frames/video_thumbs).
All text stays inside the centre safe area (100..1100 x 55..575) because some platforms crop.
Usage (repo root): python3 tools/og_image.py   (needs Pillow + fontTools; re-run readme_store.py --capture first for fresh shots)."""
import os, sys
from PIL import Image, ImageDraw, ImageFont
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from readme_store import ROOT, felt, card, drop, thumb, px, shadow_text, GREEN, GREEN_D   # shared look helpers

W, H = 1200, 630
SANS_B = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
def sans(sz): return ImageFont.truetype(SANS_B, sz)
def shot(slug):
    """board only, cropped out of the framed README screenshot (board card sits at ~144..756 x 30..642)"""
    return Image.open(os.path.join(ROOT, 'docs/media/shots', slug + '.jpg')).convert('RGB').crop((144, 30, 756, 642))

# (image, x, y, w, h, angle, label): a loose wall of cards on the right; art may bleed off the edge, text never does
WALL = [
    (lambda: thumb('PszkLYudcws'), 905, -40, 330, 200, -4, None),            # FPS chess
    (lambda: thumb('AvZiSnngZjA'), 590, -30, 330, 200, 3, None),             # Shotgun King
    (lambda: thumb('BbgwPj-u_gs'), 950, 455, 320, 200, 4, None),             # 5D chess
    (lambda: thumb('AWFB4EzGtDc'), 575, 470, 330, 200, -3, None),            # Gun King
    (lambda: shot('pac-man-chess'), 925, 160, 285, 285, 5, None),
    (lambda: shot('duck-chess'), 600, 175, 270, 270, -6, None),
    (lambda: shot('scp-4975'), 735, 120, 330, 330, 0, 'SCP-4975'),         # hero shot, front and centre of the wall
]

def build(out):
    im = felt(W, H).convert('RGBA')
    for get, x, y, w, h, ang, lab in WALL:
        drop(im, card(get(), w, h, rim=6, r=18, label=lab), x, y, angle=ang, sh=12)
    # solid left panel so the text never sits on busy art (flat slab, hard edge, no blur/glass)
    d = ImageDraw.Draw(im)
    d.rounded_rectangle((60, 70, 572, 572), 26, fill=(0, 0, 0, 255))                       # hard shadow
    d.rounded_rectangle((60, 58, 572, 560), 26, fill=(38, 36, 33, 255), outline=(60, 58, 55), width=4)
    cx = 316
    shadow_text(d, (cx, 140), 'CHESS', px(118), sh=8, stroke=4)
    shadow_text(d, (cx, 248), 'MASTER', px(118), sh=8, stroke=4)
    d.text((cx, 336), 'iwantcheckmate fan remake', font=sans(28), fill=(209, 209, 208), anchor='mm')
    # chunky green slab, same build as the app's play buttons
    bx0, by0, bx1, by1 = 96, 386, 536, 476
    d.rounded_rectangle((bx0, by0 + 10, bx1, by1 + 10), 18, fill=GREEN_D)
    d.rounded_rectangle((bx0, by0, bx1, by1), 18, fill=GREEN)
    d.text((cx, (by0 + by1) // 2 - 13), '500+ CHESS MODES', font=px(50), fill=(255, 255, 255), anchor='mm', stroke_width=2, stroke_fill=(46, 82, 28))
    d.text((cx, (by0 + by1) // 2 + 23), 'from the videos', font=sans(22), fill=(240, 250, 235), anchor='mm')
    d.text((cx, 520), 'Free in your browser. No account.', font=sans(22), fill=(160, 158, 155), anchor='mm')
    im = im.convert('RGB')
    im.save(out, optimize=True)
    if os.path.getsize(out) > 600_000:   # keep under the size budget: palette PNG still looks clean at this size
        im.quantize(256, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.FLOYDSTEINBERG).save(out, optimize=True)
    print('wrote', out, os.path.getsize(out), 'bytes')

if __name__ == '__main__':
    build(sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'assets/og/og-default.png'))
