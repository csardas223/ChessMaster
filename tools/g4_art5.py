#!/usr/bin/env python3
"""g4 art pass 5 (2026-11-25, art-g4 avatars): chess.com Advanced-bot portraits for tfPyy36nwc4 (Wendy, Miguel, Li)
cut from owner-approved single video frames (browser on youtube.com, 1080p60, paused, full screen, controls hidden;
the task's last screenshot is 1920x1440 with the video at y 180..1260).
Frames committed as research/frames/video_thumbs/tfPyy36nwc4_frame_<s>.jpg (17 = Wendy, 1316 = Miguel, 1657 = Li).
The portrait is the large copy in chess.com's right-side bot panel (same box as g4_art4.avatars), on the panel colour.
Run from rebuild/app:  python3 tools/g4_art5.py [dir with <id>_<seconds>.png screenshots]
(without the dir it re-cuts from the committed jpg frames, where the panel box is shifted up by 180 px)."""
import os, sys
from PIL import Image

THUMBS = '../research/frames/video_thumbs'
A = 'assets/modes/tfPyy36nwc4'
SRC = sys.argv[1] if len(sys.argv) > 1 else None
BOTS = {'wendy': 17, 'miguel': 1316, 'li': 1657}
BOX = (1226, 381, 1366, 524)   # in the 1920x1440 screenshot


def frame(s):
    if SRC:
        f = Image.open(os.path.join(SRC, 'tfPyy36nwc4_%d.png' % s)).convert('RGB')
        f.crop((0, 180, 1920, 1260)).save(os.path.join(THUMBS, 'tfPyy36nwc4_frame_%d.jpg' % s), quality=90)
        return f, 0
    return Image.open(os.path.join(THUMBS, 'tfPyy36nwc4_frame_%d.jpg' % s)).convert('RGB'), 180


def main():
    os.makedirs(A, exist_ok=True)
    for name, s in BOTS.items():
        f, dy = frame(s)
        b = (BOX[0], BOX[1] - dy, BOX[2], BOX[3] - dy)
        im = f.crop(b).convert('RGBA'); bg = im.getpixel((2, 2))
        if name == 'miguel':   # the chat bubble's tail touches the portrait's right edge: paint its white/grey pixels back to the panel
            px = im.load()
            for y in range(im.size[1]):
                for x in range(100, im.size[0]):
                    r, g, bb, _ = px[x, y]
                    if min(r, g, bb) > 48 and max(r, g, bb) - min(r, g, bb) < 22 and x > 104: px[x, y] = bg
        w, h = im.size; n = max(w, h)
        out = Image.new('RGBA', (n, n), bg); out.paste(im, ((n - w) // 2, (n - h) // 2))
        out.resize((128, 128), Image.LANCZOS).save(os.path.join(A, name + '.png'))
    print('ok')


if __name__ == '__main__':
    main()
