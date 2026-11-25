"""Group-3 (impl-3) opponent/player avatars cropped from the videos' own YouTube frames (7th Hark session).
Run from rebuild/app:  python3 tools/g3_frames.py
Source images are the video's thumbnail (maxresdefault) and storyboard stills (maxres1-3) on i.ytimg.com; nothing is drawn
or generated. Each row: (dest "<id>/<name>.png", video id, still, crop box in 1280x720 px, shape)."""
import os
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', 'assets', 'modes')
CACHE = '/tmp/g3_frames'

# lichess "BOT Fairy-Stockfish level 8" videos: the opponent is shown as the Stockfish fish on each video's thumbnail
LICHESS_FISH = ['Ex0PeXfb39I', 'FxQ-A3nbBzU', 'MSNUaDps49U', 'RqXorBCKAdA', 'Y3Jneu7zoq0', 'ZoSm2Wxlhvo', 'dKZfe4uB_RM',
                'dR76717W3JM', 'j5na3lPhw7g', 'lDlOC8KH0Zc', 'o8XcmMCIhIk', 'onv0NOspxH8']
FRAMES = [(vid + '/fish.png', vid, 'maxresdefault', (680, 60, 1240, 620), 'square') for vid in LICHESS_FISH] + [
    # "Fairy Stockfish (3000+)" player-bar avatar (rainbow fish) as the videos show it
    ('mvPXhAMcT7I/fairy_stockfish.png', 'mvPXhAMcT7I', 'maxres1', (800, 32, 872, 104), 'square'),
    # chess.com "Stockfish (3600)" player-bar fish
    ('JW9VnzQocLk/stockfish.png', 'JW9VnzQocLk', 'maxres1', (852, 28, 912, 88), 'square'),
    # chess.com Zach portrait (H34VPnGT8tA still 1)
    ('H34VPnGT8tA/zach.png', 'H34VPnGT8tA', 'maxres1', (80, 120, 380, 420), 'square'),
    # MetaChess site logo (the opponent Sarah is a MetaChess bot; the video never shows her portrait)
    ('VVuAgqLzD_o/metachess.png', 'VVuAgqLzD_o', 'maxres1', (40, 18, 120, 98), 'square'),
    # iwantcheckmate's avatar (purple king; the player-bar avatar in his chess.com games) and the Speedrunner's purple king
    ('uUXev8TPVak/iwantcheckmate.png', 'FxQ-A3nbBzU', 'maxres3', (486, 206, 794, 514), 'square'),   # channel logo card = his account avatar, full size
    ('UZ79sKLa6z4/speedrunner.png', 'UZ79sKLa6z4', 'maxresdefault', (490, 290, 770, 570), 'square'),
    # online opponents (replace the invented human.svg): CocoCola_8, chess.com default pawn avatar, viewers, "Opponent"
    ('uUXev8TPVak/cococola.png', 'uUXev8TPVak', 'maxres2', (876, 34, 944, 102), 'square'),
    ('uUXev8TPVak/default.png', 'uUXev8TPVak', 'maxres3', (878, 36, 942, 100), 'square'),
    ('98Fzc7uQ7Ns/sphereplays.png', '98Fzc7uQ7Ns', 'maxres1', (728, 110, 790, 172), 'square'),
    ('98Fzc7uQ7Ns/oloh_flow.png', '98Fzc7uQ7Ns', 'maxres2', (728, 110, 790, 172), 'square'),
    ('GH9tTFMWEUg/opponent.png', 'GH9tTFMWEUg', 'maxres1', (792, 22, 836, 66), 'square'),
    # Speedrunner hotbar: the green duck item (background cut out)
    ('UZ79sKLa6z4/duck.png', 'UZ79sKLa6z4', 'maxres2', (1136, 403, 1187, 454), 'cut'),
]
# research sprites reused for items this video only shows too small: Minecraft cobblestone block (Re3c-3qomgQ) as the brick
# obstacle, the egg from pHItplJMih0 as the dragon egg (approximations; replace with real frames when a downloader works)
SPRITES = [('UZ79sKLa6z4/brick.png', 'Re3c-3qomgQ_cobblestone.png', None), ('UZ79sKLa6z4/egg.png', 'pHItplJMih0_egg.png', (30, 10, 346, 366))]
SP = os.path.join(HERE, '..', '..', 'research', 'frames', 'sprites')

# chess.com bots the ladder videos play (Elsa 150, Noel 550, Zara 850): the stills on i.ytimg.com never show them, so the
# avatar is the exact image chess.com shows in the player bar on screen (the same bot art as the Martin/Juan crops from the
# frames), flattened onto the dark chess.com player-bar background like the other crops. Source: each bot's chess.com page.
CHESSCOM = [('AdbO98Fa7cY/elsa.png', 'https://images.chesscomfiles.com/uploads/v1/user/561052775.9c8f31c4.200x200o.d0c690bd240e.png'),
            ('AdbO98Fa7cY/noel.png', 'https://images.chesscomfiles.com/uploads/v1/user/66746138.a2a885dd.200x200o.09f7995cfeae.png'),
            ('vHVSgesfZ0o/zara.png', 'https://images.chesscomfiles.com/uploads/v1/user/66746114.0a759f9d.200x200o.1b6eb372ea29.png')]


def chesscom(dest, url):
    import urllib.request
    os.makedirs(CACHE, exist_ok=True)
    f = os.path.join(CACHE, os.path.basename(dest))
    if not os.path.exists(f):
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0', 'Referer': 'https://www.chess.com/'})
        open(f, 'wb').write(urllib.request.urlopen(req).read())
    im = Image.open(f).convert('RGBA').resize((160, 160), Image.LANCZOS)
    bg = Image.new('RGBA', im.size, (48, 47, 42, 255)); bg.alpha_composite(im)
    d = os.path.join(OUT, dest); os.makedirs(os.path.dirname(d), exist_ok=True)
    bg.convert('RGB').save(d, optimize=True)


def cut(im, tol=70):
    """remove the plain background connected to the border (flood fill from every edge pixel)"""
    im = im.convert('RGBA'); W, H = im.size; px = im.load(); bg = px[2, 2]
    seen = set(); stack = [(x, y) for x in range(W) for y in (0, H - 1)] + [(x, y) for y in range(H) for x in (0, W - 1)]
    while stack:
        x, y = stack.pop()
        if (x, y) in seen or not (0 <= x < W and 0 <= y < H): continue
        seen.add((x, y)); r, g, b, a = px[x, y]
        if abs(r - bg[0]) + abs(g - bg[1]) + abs(b - bg[2]) > tol: continue
        px[x, y] = (0, 0, 0, 0); stack += [(x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)]
    return im


def frame(vid, name):
    import urllib.request
    os.makedirs(CACHE, exist_ok=True)
    f = os.path.join(CACHE, vid + '_' + name + '.jpg')
    if not os.path.exists(f):
        urllib.request.urlretrieve('https://i.ytimg.com/vi/%s/%s.jpg' % (vid, name), f)
    return Image.open(f).convert('RGB')


def run():
    for dest, vid, name, box, shape in FRAMES:
        im = frame(vid, name).crop(box)
        if shape == 'cut': im = cut(im)
        if im.size[0] < 128: im = im.resize((128, 128 * im.size[1] // im.size[0]), Image.LANCZOS)
        im.thumbnail((256, 256), Image.LANCZOS)
        d = os.path.join(OUT, dest); os.makedirs(os.path.dirname(d), exist_ok=True)
        im.save(d, optimize=True)
    for dest, src, box in SPRITES:
        im = Image.open(os.path.join(SP, src)).convert('RGBA')
        if box: im = cut(im.crop(box), 150)
        if 'egg' in dest:   # drop the purple backdrop's shadow fringe (blue > red never occurs on the egg itself)
            im.putdata([(r, g, b, 0) if b > r else (r, g, b, a) for r, g, b, a in im.getdata()])
        im.thumbnail((256, 256), Image.LANCZOS); im.save(os.path.join(OUT, dest), optimize=True)
    for dest, url in CHESSCOM: chesscom(dest, url)
    print('wrote', len(FRAMES) + len(SPRITES) + len(CHESSCOM))


if __name__ == '__main__':
    run()
