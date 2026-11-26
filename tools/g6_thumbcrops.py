"""Group-6 (impl-6): crops of the video's own art from YouTube frame thumbnails (i.ytimg.com/vi/<id>/maxres1-3.jpg,
maxresdefault.jpg = real frames of the video) for avatars/pieces with no sprite in research/frames/sprites.
Owner rule 2026-11-24: art is copied from the videos, never drawn. Boxes are fractions of the 1280x720 frame.
Run: python3 tools/g6_thumbcrops.py   (downloads into /tmp/g6thumbs)"""
import os, sys, urllib.request
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(HERE, '..', 'assets', 'modes')
SPR = os.path.join(HERE, '..', '..', 'research', 'frames', 'sprites')
CACHE = '/tmp/g6thumbs'; os.makedirs(CACHE, exist_ok=True)
def frame(vid, k):
    p = os.path.join(CACHE, f'{vid}_{k}.jpg')
    if not os.path.exists(p): urllib.request.urlretrieve(f'https://i.ytimg.com/vi/{vid}/{k}.jpg', p)
    return Image.open(p).convert('RGB')
def sq(im, size=128):
    w, h = im.size; s = min(w, h); l, t = (w - s) // 2, (h - s) // 2
    return im.crop((l, t, l + s, t + s)).resize((size, size), Image.LANCZOS)
K = 1280 / 480  # boxes below were measured on a 480-wide preview
def crop(vid, k, box, mid, name, size=128):
    im = frame(vid, k); b = [int(v * K * im.size[0] / 1280) for v in box]
    d = os.path.join(OUT, mid); os.makedirs(d, exist_ok=True); sq(im.crop(b), size).save(os.path.join(d, name), optimize=True)
def sprite(src, mid, name, box=None, size=128):
    im = Image.open(os.path.join(SPR, src)).convert('RGBA')
    if box: W, H = im.size; im = im.crop((int(box[0] * W), int(box[1] * H), int(box[2] * W), int(box[3] * H)))
    d = os.path.join(OUT, mid); os.makedirs(d, exist_ok=True); sq(im, size).save(os.path.join(d, name), optimize=True)

# Earth Day bots: the five portraits on the video's title card (maxres1)
for n, b in [('dodo', (5, 82, 95, 190)), ('turtle', (88, 85, 188, 190)), ('rhino', (193, 85, 292, 190)), ('leopard', (292, 85, 372, 190)), ('mammoth', (372, 85, 478, 190))]:
    crop('dz81n87sILE', 'maxres1', b, 'dz81n87sILE', n + '.png')
# Advanced bots: chess.com bot portraits in the side panel
for n, k in [('pablo', 'maxres1'), ('arthur', 'maxres2'), ('lorenzo', 'maxres3')]:
    crop('tfPyy36nwc4', k, (302, 50, 344, 92), 'tfPyy36nwc4', n + '.png')
# GothamChess bot: portrait on the thumbnail
crop('h4FZjGSccFg', 'maxresdefault', (285, 60, 475, 250), 'h4FZjGSccFg', 'gotham.png')
# King of the Bridge: troll cut-out and the cobble swamp backdrop from the video frames
crop('hv_NHWqysZE', 'maxres2', (150, 0, 330, 150), 'hv_NHWqysZE', 'troll_big.png', 256)
im = frame('hv_NHWqysZE', 'maxres1'); b = [int(v * K) for v in (0, 60, 200, 270)]
im.crop(b).save(os.path.join(OUT, 'hv_NHWqysZE', 'swamp.jpg'), quality=85)
# Martin (chess.com bot) portrait sprite, shared by the Martin modes of group 6
for mid in ['fnDkGF-EF44', 'rtoo4ojjxHU', 'rQQKF0ZZQfg']: sprite('B0F9nSVSB-k_martin_bot.png', mid, 'martin.png')
# Stockfish avatar as it appears in the videos
for mid in ['iqfHW2_sMmc', 'zDFsnRE_Gig', 'tpXg3mxSfY0']: sprite('vEk6QGmqLdA_stockfish_fish.png', mid, 'stockfish.png')
# Passant AI knight, shared by the four Passant modes
for mid in ['dkCMhNcZezM', 'qZyNuiVbGMI', 'rMSar6g_2HY']: sprite('dztzDlPfqSI_ai_knight.png', mid, 'passant_ai.png')
# Petrified Chess: plain cobble stone tile from the stone-king sprite (frame crop)
sprite('ppwoznHliD8_stone_king.png', 'ppwoznHliD8', 'stone.png', box=(0.04, 0.04, 0.30, 0.30), size=96)
# Villagers Chess: the fleur-de-lis villager from the video's title frame; black = darkened copy
def villager():
    from g6_sprites import square as sqp, recolor
    im = frame('djfYBXvvaYI', 'maxres1').crop([int(v * K) for v in (218, 140, 294, 195)]).convert('RGBA'); px = im.load()
    for y in range(im.height):
        for x in range(im.width):
            r, g, b, a = px[x, y]
            if (g > r + 10 and g > b + 10) or (r > 225 and g > 225 and b > 190 and abs(r - g) < 8 and r - b > 12): px[x, y] = (r, g, b, 0)
    k = sqp(im, 128, 0.04); d = os.path.join(OUT, 'djfYBXvvaYI'); k.save(os.path.join(d, 'villager_w.png'))
    recolor(k, lambda r, g, b: (int(r * 0.22 + 20), int(g * 0.22 + 20), int(b * 0.22 + 24))).save(os.path.join(d, 'villager_b.png'))
# Pac-Man Chess: the yellow and orange ghosts from the video's sprite sheet; the purple backdrop is keyed by colour
def ghosts():
    src = Image.open(os.path.join(SPR, 'sO-lD2On610_ghosts.png')).convert('RGBA'); W, H = src.size
    for name, box in [('ghost_y.png', (0.11, 0.29, 0.51, 0.67)), ('ghost_o.png', (0.51, 0.29, 0.93, 0.67))]:
        im = src.crop((int(box[0] * W), int(box[1] * H), int(box[2] * W), int(box[3] * H))); px = im.load()
        for y in range(im.height):
            for x in range(im.width):
                r, g, b, a = px[x, y]
                if b > g + 50 and b > 90: px[x, y] = (r, g, b, 0)   # purple / magenta background
        bb = im.getbbox(); im = im.crop(bb) if bb else im
        s = max(im.size); c = Image.new('RGBA', (s, s), (0, 0, 0, 0)); c.paste(im, ((s - im.width) // 2, (s - im.height) // 2), im)
        c.resize((128, 128), Image.NEAREST).save(os.path.join(OUT, 'sO-lD2On610', name), optimize=True)
sys.path.insert(0, HERE); villager(); ghosts()
print('ok')
