#!/usr/bin/env python3
"""fin-sprites-b batch 1 (2026-11-26): BLURRY_SPRITES.md avatars / intro art.
Run from rebuild/app. Downloads its sources (URLs below, also in each source.notes).
Owner art rule: same image from the web, else best alternate, else composite from clean parts; 512px, no faded edges.
"""
import io, subprocess, numpy as np, cairosvg
from PIL import Image, ImageDraw, ImageFilter

UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36'
A = 'assets/modes/'


def get(url):
    return subprocess.run(['curl', '-sL', '-A', UA, '-e', 'https://www.chess.com/', url], capture_output=True, check=True).stdout


def svg_png(svg_bytes, w, h=None):
    return Image.open(io.BytesIO(cairosvg.svg2png(bytestring=svg_bytes, output_width=w, output_height=h or w))).convert('RGBA')


def piece(code, w):
    return svg_png(open(f'assets/pieces/cburnett/{code}.svg', 'rb').read(), w)


def silhouette(code, w, col=(0, 0, 0), st='cburnett'):
    p = svg_png(open(f'assets/pieces/{st}/{code}.svg', 'rb').read(), w)
    a = p.split()[3]
    out = Image.new('RGBA', p.size, col + (0,))
    out.putalpha(a)
    return out


def tall_king(H, col=(0, 0, 0, 255)):
    """Solid tall Staunton king silhouette (as in the avatar crops), H px high, drawn 4x and downsampled."""
    k = 4; h = H * k
    prof = [(0.13, .045), (0.15, .085), (0.20, .105), (0.25, .075), (0.27, .095), (0.31, .095), (0.33, .06),
            (0.47, .068), (0.62, .105), (0.74, .145), (0.76, .185), (0.81, .185), (0.83, .215), (0.92, .235), (1.0, .235)]
    W = int(h * 0.5)
    im = Image.new('RGBA', (W, h), (0, 0, 0, 0)); d = ImageDraw.Draw(im); cx = W / 2
    pts = [(cx + hw * h, y * h) for y, hw in prof] + [(cx - hw * h, y * h) for y, hw in reversed(prof)]
    d.polygon(pts, fill=col)
    d.rectangle((cx - .02 * h, 0, cx + .02 * h, .14 * h), fill=col)
    d.rectangle((cx - .058 * h, .035 * h, cx + .058 * h, .075 * h), fill=col)
    return im.resize((W // k, H), Image.LANCZOS)


def outlined(im, px, col):
    """im with a solid px-wide outline in col (separates overlapping black silhouettes)."""
    a = im.split()[3].filter(ImageFilter.MaxFilter(2 * px + 1))
    o = Image.new('RGBA', im.size, col + (0,)); o.putalpha(a); o.alpha_composite(im); return o


# 1. yXE14E0QKNI/opp2.png (fintarSP): the account's avatar has changed (now a Panko photo), so the video's
#    Heart Pirates jolly roger is rebuilt from the CC0 vector at freesvg.org, recoloured to the video crop
#    (yellow -> orange symbol on near-black).
def law():
    src = Image.open(io.BytesIO(get('https://freesvg.org/img/trafalgar-law-logo.png'))).convert('RGB')
    src = src.resize((470, 470), Image.LANCZOS)
    lum = np.asarray(src.convert('L'), float)
    dark = np.clip((200 - lum) / 120, 0, 1)  # black strokes of the freesvg logo
    # the face disc: inside the ring every black stroke (eyes, nose, teeth lines) stays dark and the yellow
    # becomes the symbol; outside it the black strokes (ring + spokes) are the symbol, as in the video crop.
    row = dark[235]; xs = np.where(row > .5)[0]
    yy0, xx0 = np.mgrid[0:470, 0:470]
    cx = 235; cy = 235
    r_in = None
    for r in range(60, 230):
        if dark[cy, cx - r] > .5 and dark[cy, cx + r] > .5 and dark[cy - r if cy - r > 0 else 0, cx] > .5:
            r_in = r; break
    disc = (np.hypot(xx0 - cx, yy0 - cy) < (r_in or 170) - 1).astype(float)
    mask = disc * (1 - dark) + (1 - disc) * dark
    S = 512
    yy, xx = np.mgrid[0:470, 0:470]
    t = np.clip(np.hypot(xx - 235, yy - 210) / 250, 0, 1)[..., None]
    inner = np.array([255, 214, 64], float); outer = np.array([226, 112, 20], float)
    fill = inner * (1 - t) + outer * t
    bg = np.array([28, 26, 24], float)
    out = np.tile(bg, (S, S, 1))
    o = 21
    out[o:o + 470, o:o + 470] = bg * (1 - mask[..., None]) + fill * mask[..., None]
    Image.fromarray(out.astype('uint8')).save(A + 'yXE14E0QKNI/opp2.png')


# 2. smg98qv_xa0/opp1.png (ChocoCara... = ChocoCaramelPawn): the account's own chess.com avatar
#    (orange board + pawn, green corner as in the video crop; the account changed it slightly since).
def choco():
    im = Image.open(io.BytesIO(get('https://images.chesscomfiles.com/uploads/v1/user/58030492.a3488008.200x200o.d9272c8a92f4.png'))).convert('RGB')
    im.resize((512, 512), Image.LANCZOS).filter(ImageFilter.UnsharpMask(2, 40, 2)).save(A + 'smg98qv_xa0/opp1.png')


# 3. vIvVdaTQi3s/panicfish.png: the creator's own PanicFish art, iwantcheckmate.com/bot-thumbnails/panicfish.jpeg
#    (1536x864; the fish is motion-blurred on purpose in the original too), fish head cropped square.
def panicfish():
    im = Image.open(io.BytesIO(get('https://iwantcheckmate.com/bot-thumbnails/panicfish.jpeg'))).convert('RGB')
    im.crop((780, 108, 1536, 864)).resize((512, 512), Image.LANCZOS).save(A + 'vIvVdaTQi3s/panicfish.png')


# 4. vvCAEWKttT4/solo.png: chess.com's own Solo Chess icon (https://www.chess.com/bundles/web/images/color-icons/solo.svg)
#    on the dark chess.com background, as the video's Solo Chess header shows it.
def solo():
    ic = svg_png(get('https://www.chess.com/bundles/web/images/color-icons/solo.svg'), 420)
    out = Image.new('RGBA', (512, 512), (38, 36, 33, 255))
    out.alpha_composite(ic, (46, 46))
    out.convert('RGB').save(A + 'vvCAEWKttT4/solo.png')


# 5. qfHZlae8XVU/opp1.png (megan_34, account no longer exists): composite = the crop's flat grey + a solid black
#    king silhouette (cburnett outline filled black), same placement as the crop.
def megan():
    out = Image.new('RGBA', (512, 512), (197, 196, 192, 255))
    k = tall_king(420)
    out.alpha_composite(k, ((512 - k.width) // 2, 52))
    out.convert('RGB').save(A + 'qfHZlae8XVU/opp1.png')


# 6. xim3ocTGn4E/opp3.png (OriginalAn..., full name not recoverable): composite of the crop's chess-club logo:
#    rook / king / bishop silhouettes on a black plinth with side swooshes and a grey 'CHESS' word, light grey square.
def chesslogo():
    S = 512
    out = Image.new('RGBA', (S, S), (205, 205, 204, 255))
    d = ImageDraw.Draw(out)
    bgc = (205, 205, 204)
    k = tall_king(250)
    out.alpha_composite(k, ((S - k.width) // 2, 50))
    for code, x in (('bR', 112), ('bB', 270)):
        out.alpha_composite(outlined(silhouette(code, 130, st='staunty'), 5, bgc), (x, 172))
    d = ImageDraw.Draw(out)
    d.rectangle((150, 300, 362, 322), fill=(0, 0, 0))
    d.polygon([(70, 300), (150, 292), (150, 322), (100, 318)], fill=(0, 0, 0))
    d.polygon([(442, 300), (362, 292), (362, 322), (412, 318)], fill=(0, 0, 0))
    d.rectangle((190, 330, 322, 356), fill=(0, 0, 0))
    from PIL import ImageFont
    f = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf', 78)
    tw = d.textlength('CHESS', font=f)
    d.text(((S - tw) / 2, 368), 'CHESS', font=f, fill=(120, 120, 120))
    out.convert('RGB').save(A + 'xim3ocTGn4E/opp3.png')


# 7. qUROR6pcKKw/promotion_picker.png (intro overlay): composite redraw of the video still = brown board
#    (same two colours as the crop) with the white promotion column holding Q N R B (cburnett, the video's set).
def picker():
    S = 512; q = S // 4
    out = Image.new('RGBA', (S, S))
    d = ImageDraw.Draw(out)
    L, D = (236, 214, 175), (185, 131, 103)
    for r in range(4):
        for c in range(4):
            d.rectangle((c * q, r * q, c * q + q - 1, r * q + q - 1), fill=L if (r + c) % 2 == 0 else D)
    col = 2
    sh = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    ImageDraw.Draw(sh).rectangle((col * q - 4, 0, col * q + q + 4, S), fill=(0, 0, 0, 90))
    out.alpha_composite(sh.filter(ImageFilter.GaussianBlur(5)))
    d = ImageDraw.Draw(out)
    d.rectangle((col * q, 0, col * q + q - 1, S), fill=(255, 250, 240))
    for i, code in enumerate(('wQ', 'wN', 'wR', 'wB')):
        out.alpha_composite(piece(code, q - 12), (col * q + 6, i * q + 6))
    out.save(A + 'qUROR6pcKKw/promotion_picker.png')


if __name__ == '__main__':
    import sys
    for name in (sys.argv[1:] or ['law', 'choco', 'panicfish', 'solo', 'megan', 'chesslogo', 'picker']):
        globals()[name]()
        print('ok', name)
