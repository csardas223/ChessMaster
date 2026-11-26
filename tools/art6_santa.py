#!/usr/bin/env python3
"""wMdAOirSvQQ (Christmas bots) Santa portrait -> exact chess.com 200px Santa-BOT avatar (Hark art leftovers 2, 2026-11-25 PM ET).

The old santa.png was a 128px video crop of the bot art with the neighbouring Gingerbread bot in its left half. chess.com
serves the same art: api.chess.com/pub/player/santa-bot -> avatar
https://images.chesscomfiles.com/uploads/v1/user/405091209.5e56a3f6.200x200o.ab00ad904e54.png (200x200, transparent),
kept as research/frames/sprites_web/chesscom_santa-bot.png. Match check: registered onto the crop (avatar at 147px,
offset 19,-6 in the 128px crop; gingerbread pixels masked) the mean abs difference is ~4/255 = same art.
Output (like tools/art6_bot_portraits.py, but without the gingerbread): the crop's own flat background (brown, median of
the crop's background pixels, std < 3) as a 200px square + the chess.com figure in its own avatar framing on top,
tone-matched per channel to the video crop on the registered pixels.
The replaced crop is kept in research/frames/sprites_web/video_crops/wMdAOirSvQQ_santa.png.
Run from rebuild/app: python3 tools/art6_santa.py      Credit: avatar (c) chess.com."""
import os, shutil
import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
WEB = os.path.join(HERE, '..', 'research', 'frames', 'sprites_web')
DST = os.path.join(HERE, '..', 'assets', 'modes', 'wMdAOirSvQQ', 'santa.png')
OLD = os.path.join(WEB, 'video_crops', 'wMdAOirSvQQ_santa.png')
FIG = os.path.join(WEB, 'chesscom_santa-bot.png')
S = 200
REG = (147, 19, -6)   # avatar size and offset inside the 128px crop (found by search, see docstring)

def main():
    if not os.path.exists(OLD):
        os.makedirs(os.path.dirname(OLD), exist_ok=True); shutil.copy(DST, OLD)
    crop = Image.open(OLD).convert('RGB'); C = np.asarray(crop, dtype=np.float32); R = crop.size[0]
    r, g, b = C[..., 0], C[..., 1], C[..., 2]
    ginger = (r > 150) & (g > 70) & (g < 200) & (b < 120) & (r - b > 80) & (g - b > 30)
    bgm = (np.abs(r - 105) < 14) & (np.abs(g - 88) < 14) & (np.abs(b - 80) < 14)
    bgc = tuple(int(round(v)) for v in np.median(C[bgm], axis=0))
    fig = Image.open(FIG).convert('RGBA')
    n, x0, y0 = REG
    F = np.asarray(fig.resize((n, n), Image.LANCZOS), dtype=np.float32)
    ax0, ay0, ax1, ay1 = max(0, x0), max(0, y0), min(R, x0 + n), min(R, y0 + n)
    ff = F[ay0 - y0:ay1 - y0, ax0 - x0:ax1 - x0]; cc = C[ay0:ay1, ax0:ax1]
    m = (ff[..., 3] > 240) & ~ginger[ay0:ay1, ax0:ax1]
    print('match: mean abs diff %.2f over %d px' % (np.abs(ff[..., :3][m] - cc[m]).mean(), m.sum()))
    Fs = np.asarray(fig, dtype=np.float32); out = Fs.copy(); fit = []
    for c in range(3):
        x = ff[..., c][m]; y = cc[..., c][m]
        a = float(np.cov(x, y)[0, 1] / max(1e-3, x.var())); a = min(1.1, max(0.9, a)); bb = float(y.mean() - a * x.mean())
        out[..., c] = np.clip(Fs[..., c] * a + bb, 0, 255); fit.append((round(a, 3), round(bb, 1)))
    figt = Image.fromarray(out.astype(np.uint8), 'RGBA').resize((S, S), Image.LANCZOS)
    res = Image.new('RGBA', (S, S), bgc + (255,)); res.alpha_composite(figt)
    res.convert('RGB').save(DST, optimize=True)
    print('background', bgc, 'tone', fit, '->', DST)

if __name__ == '__main__':
    main()
