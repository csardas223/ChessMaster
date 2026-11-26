"""Group-2 (impl-2) art copied from the videos (owner instruction 2026-11-24 10:13 PM ET: use the video's own art,
no invented/redrawn art; credit iwantcheckmate).
Run from rebuild/app:  python3 tools/g2_art.py
- Bot avatars with no reference sprite: cropped straight from each video's own thumbnail
  (https://i.ytimg.com/vi/<id>/maxresdefault.jpg, 1280x720). Boxes are pixel boxes on that image.
- Drawback Chess difficulty slider: cropped from research/frames/sprites/evpcydnu8To_drawback_card.png (the site's card).
Avatars that DO have a reference sprite were copied earlier from research/frames/sprites/<id>_*.png (commit d34107d)."""
import os, urllib.request
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
SP = os.path.join(HERE, '..', 'research', 'frames', 'sprites')
OUT = os.path.join(HERE, '..', 'assets', 'modes')
CACHE = os.environ.get('G2_THUMBS', '/tmp/g2thumbs')

# dest "<id>/<name>.png": (video id whose thumbnail holds the art, crop box l,t,r,b)
THUMB = {
    'Uccowk6xbFc/tiredfish.png': ('Uccowk6xbFc', (660, 0, 1180, 520)),
    'oJu13RUrGl4/zebrafish.png': ('oJu13RUrGl4', (660, 0, 1180, 520)),
    'vIvVdaTQi3s/panicfish.png': ('vIvVdaTQi3s', (680, 40, 1200, 560)),
    'Q6sj5N3oQjI/alternatefish.png': ('Q6sj5N3oQjI', (660, 0, 1180, 520)),
    'Q6sj5N3oQjI/martin.png': ('nx6jkHl2k_Y', (700, 40, 1260, 600)),   # same chess.com Martin art as the Martin-bot video
    'nx6jkHl2k_Y/martin.png': ('nx6jkHl2k_Y', (700, 40, 1260, 600)),
    'PPvPTwZg0JQ/smarten.png': ('PPvPTwZg0JQ', (660, 40, 1260, 640)),
    'TQR5zCSzrqw/betafish.png': ('TQR5zCSzrqw', (540, 20, 1060, 540)),
    'Y0LOmrRicgw/martinfish.png': ('Y0LOmrRicgw', (330, 60, 990, 720)),
    'SsOtn3iDkv8/zach.png': ('SsOtn3iDkv8', (640, 80, 1280, 720)),
    'SsOtn3iDkv8/worstfish.png': ('SsOtn3iDkv8', (20, 160, 560, 700)),
}
# dest: (sprite file, crop box)
SPRITE = {
    'evpcydnu8To/drawback_slider.png': ('evpcydnu8To_drawback_card.png', (9, 120, 204, 162)),
    # whole sprites shipped as-is (intro card / post-game reveal screens seen in these videos)
    'evpcydnu8To/drawback_card.png': ('evpcydnu8To_drawback_card.png', None),
    'ypac0SBFqb8/drawback_card.png': ('ypac0SBFqb8_drawback_card.png', None),
    '2r5tef-Qdyg/drawback_reveal.png': ('2r5tef-Qdyg_drawback_reveal.png', None),
}


def thumb(vid):
    os.makedirs(CACHE, exist_ok=True)
    f = os.path.join(CACHE, vid + '_maxresdefault.jpg')
    if not os.path.exists(f):
        urllib.request.urlretrieve('https://i.ytimg.com/vi/%s/maxresdefault.jpg' % vid, f)
    return f


def save(im, dest):
    p = os.path.join(OUT, dest)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    im.save(p, optimize=True)
    print('wrote', dest, im.size)


for dest, (vid, box) in THUMB.items():
    im = Image.open(thumb(vid)).convert('RGB').crop(box).resize((256, 256), Image.LANCZOS)
    save(im, dest)
for dest, (f, box) in SPRITE.items():
    im = Image.open(os.path.join(SP, f)).convert('RGB')
    if box: im = im.crop(box)
    save(im, dest)
