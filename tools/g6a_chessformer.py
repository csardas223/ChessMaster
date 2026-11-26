"""impl-6a (2026-11-25): Chessformer art cut from the repo stills (research/frames/video_thumbs/p6W3yDU-v88_maxres3.jpg,
Level 39 board, 16 x 11 grid of 65.5 px cells starting at x=116): the '?' piece-choice slot and the purple button dome.
Tan board pixels are keyed out to transparency."""
from PIL import Image
import os
SRC = os.path.join(os.path.dirname(__file__), '../../research/frames/video_thumbs/p6W3yDU-v88_maxres3.jpg')
OUT = os.path.join(os.path.dirname(__file__), '../assets/modes/p6W3yDU-v88')
im = Image.open(SRC).convert('RGB'); CW = (1164 - 116) / 16
def cell(r, c, pad=0):
    x = 116 + c * CW; y = r * CW
    return im.crop((int(x) + pad, int(y) + pad, int(x + CW) - pad, int(y + CW) - pad))
def key_tan(img):
    img = img.convert('RGBA'); px = img.load()
    for y in range(img.height):
        for x in range(img.width):
            r, g, b, a = px[x, y]
            if r > 140 and 100 < g < 190 and 50 < b < 130 and r - b > 60:   # tan / brown board squares
                px[x, y] = (0, 0, 0, 0)
    return img
x = 116 + 5 * CW
q0 = key_tan(im.crop((int(x) + 4, 580, int(x + CW) - 3, 655)))
q = Image.new('RGBA', (75, 75), (0, 0, 0, 0)); q.alpha_composite(q0, ((75 - q0.width) // 2, 0)); q = q.resize((128, 128), Image.LANCZOS); q.save(os.path.join(OUT, 'choice.png'))
d = key_tan(cell(6, 3, 0)); d = d.crop((0, int(CW * 0.55), d.width, d.height)).resize((128, 64), Image.LANCZOS); d.save(os.path.join(OUT, 'button.png'))
print('ok')
