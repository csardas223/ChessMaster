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
    # ireallywantcheckmate / iwantcheckmate player-bar avatar (purple king) and the Speedrunner's purple king
    ('uUXev8TPVak/iwantcheckmate.png', 'uUXev8TPVak', 'maxres2', (876, 624, 944, 692), 'square'),
    ('UZ79sKLa6z4/speedrunner.png', 'UZ79sKLa6z4', 'maxresdefault', (490, 290, 770, 570), 'square'),
    # online opponents (replace the invented human.svg): CocoCola_8, chess.com default pawn avatar, viewers, "Opponent"
    ('uUXev8TPVak/cococola.png', 'uUXev8TPVak', 'maxres2', (876, 34, 944, 102), 'square'),
    ('uUXev8TPVak/default.png', 'uUXev8TPVak', 'maxres3', (878, 36, 942, 100), 'square'),
    ('98Fzc7uQ7Ns/sphereplays.png', '98Fzc7uQ7Ns', 'maxres1', (728, 110, 790, 172), 'square'),
    ('98Fzc7uQ7Ns/oloh_flow.png', '98Fzc7uQ7Ns', 'maxres2', (728, 110, 790, 172), 'square'),
    ('GH9tTFMWEUg/opponent.png', 'GH9tTFMWEUg', 'maxres1', (792, 22, 836, 66), 'square'),
]


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
        if im.size[0] < 128: im = im.resize((128, 128 * im.size[1] // im.size[0]), Image.LANCZOS)
        im.thumbnail((256, 256), Image.LANCZOS)
        d = os.path.join(OUT, dest); os.makedirs(os.path.dirname(d), exist_ok=True)
        im.save(d, optimize=True)
    print('wrote', len(FRAMES))


if __name__ == '__main__':
    run()
