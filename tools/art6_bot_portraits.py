#!/usr/bin/env python3
"""Small chess.com bot portraits -> exact-match 200px chess.com copies (Hark art leftovers, 2026-11-25 PM ET).

Owner rule: art comes from the videos; a web image is swapped in only when it is visibly the exact same art at higher
resolution. Each portrait below was a 66-98px crop of the chess.com bot avatar seen in the video. chess.com serves the same
avatar PNGs (transparent, 200x200) through its public API: api.chess.com/pub/player/<username> -> 'avatar'.
To keep the video's look (the avatar square / themed background behind the figure), each new file is:
  video crop (kept in research/frames/sprites_web/video_crops/) upscaled to 200px (background only)  +  the 200px chess.com figure on top, registered to the crop
  (scale + offset search, least mean abs difference on the figure's opaque pixels), tone-matched per channel to the crop.
Sources (downloaded copies kept in research/frames/sprites_web/chesscom_<username>.png):
  wally-jr-bot, hustler-bot, samantha-bot (AaHmMC3HA0E), frosty-bot, cabana-santa-bot (CHde4g8Jpuk),
  visualization-5 / -10 / -15 / -20 (D8olpXjblQ0 Level 5/10/15/20 blindfolded Visualization bots).
Run from rebuild/app: python3 tools/art6_bot_portraits.py  (reads the repo copies; --fetch re-downloads them)
Credit: avatars (c) chess.com."""
import os, sys, json, urllib.request
import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
WEB = os.path.join(HERE, '..', 'research', 'frames', 'sprites_web')
A = os.path.join(HERE, '..', 'assets', 'modes')
OLD = os.path.join(WEB, 'video_crops')   # the replaced video crops, kept so the script can be re-run
JOBS = [('AaHmMC3HA0E/wally.png', 'wally-jr-bot'), ('AaHmMC3HA0E/hustler.png', 'hustler-bot'),
        ('AaHmMC3HA0E/samantha.png', 'samantha-bot'), ('CHde4g8Jpuk/frosty.png', 'frosty-bot'),
        ('CHde4g8Jpuk/santa.png', 'cabana-santa-bot'), ('D8olpXjblQ0/lvl5.png', 'visualization-5'),
        ('D8olpXjblQ0/lvl10.png', 'visualization-10'), ('D8olpXjblQ0/lvl15.png', 'visualization-15'),
        ('D8olpXjblQ0/lvl20.png', 'visualization-20')]
S = 200

def fetch(user):
    req = urllib.request.Request('https://api.chess.com/pub/player/' + user, headers={'User-Agent': 'Mozilla/5.0'})
    url = json.load(urllib.request.urlopen(req, timeout=20))['avatar']
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0', 'Referer': 'https://www.chess.com/'})
    open(os.path.join(WEB, 'chesscom_%s.png' % user), 'wb').write(urllib.request.urlopen(req, timeout=20).read())
    return url

def _score(B, fig, sc, dx, dy, R):
    n = int(round(R * sc)); f = np.asarray(fig.resize((n, n), Image.BILINEAR), dtype=np.float32)
    x0, y0 = (R - n) // 2 + dx, (R - n) // 2 + dy
    ax0, ay0, ax1, ay1 = max(0, x0), max(0, y0), min(R, x0 + n), min(R, y0 + n)
    if ax1 - ax0 < R * 0.5 or ay1 - ay0 < R * 0.5: return None
    ff = f[ay0 - y0:ay1 - y0, ax0 - x0:ax1 - x0]; m = ff[..., 3] > 240
    if m.sum() < R * R * 0.05: return None
    return float(np.abs(ff[..., :3][m] - B[ay0:ay1, ax0:ax1][m]).mean())

def register(bg, fig):
    """best (diff, scale, dx, dy) placing fig (RGBA, SxS) over bg (RGB, SxS): coarse search at 100px, refine at 200px"""
    R = 100; B = np.asarray(bg.resize((R, R), Image.BILINEAR), dtype=np.float32); f2 = fig.resize((R, R), Image.LANCZOS)
    best = None
    for sc in np.arange(0.80, 1.21, 0.03):
        for dy in range(-12, 13, 2):
            for dx in range(-12, 13, 2):
                d = _score(B, f2, sc, dx, dy, R)
                if d is not None and (best is None or d < best[0]): best = (d, sc, dx * 2, dy * 2)
    B = np.asarray(bg, dtype=np.float32); d0, sc0, dx0, dy0 = best; best = None
    for sc in (sc0 - 0.02, sc0 - 0.01, sc0, sc0 + 0.01, sc0 + 0.02):
        for dy in range(dy0 - 3, dy0 + 4):
            for dx in range(dx0 - 3, dx0 + 4):
                d = _score(B, fig, sc, dx, dy, S)
                if d is not None and (best is None or d < best[0]): best = (d, sc, dx, dy)
    return best

def tone_match(bg, fig, sc, dx, dy, osz):
    """per-channel gain/offset fitting the chess.com figure to the video crop's colours (the video shows some of these
    avatars dimmed / washed out; keep that look) on the registered opaque pixels"""
    n = int(round(S * sc)); f = fig.resize((n, n), Image.LANCZOS); F = np.asarray(f, dtype=np.float32)
    B = np.asarray(bg, dtype=np.float32); x0, y0 = (S - n) // 2 + dx, (S - n) // 2 + dy
    ax0, ay0, ax1, ay1 = max(0, x0), max(0, y0), min(S, x0 + n), min(S, y0 + n)
    ff = F[ay0 - y0:ay1 - y0, ax0 - x0:ax1 - x0]; m = ff[..., 3] > 240; bb = B[ay0:ay1, ax0:ax1]
    # fit against the figure blurred the way the video crop is (down to the crop's size and back up), so blur does not
    # flatten the fitted gain
    lay = Image.new('RGBA', (S, S)); lay.paste(f, (x0, y0)); comp = bg.convert('RGBA'); comp.alpha_composite(lay)
    Fb = np.asarray(comp.convert('RGB').resize((osz, osz), Image.LANCZOS).resize((S, S), Image.LANCZOS), dtype=np.float32)[ay0:ay1, ax0:ax1]
    m = m & (np.asarray(lay, dtype=np.float32)[ay0:ay1, ax0:ax1, 3] > 240)
    out = F.copy(); fit = []
    for c in range(3):
        x = Fb[..., c][m]; y = bb[..., c][m]; a = float(np.cov(x, y)[0, 1] / max(1e-3, x.var())); a = min(1.15, max(0.45, a))
        b = float(y.mean() - a * x.mean()); out[..., c] = np.clip(F[..., c] * a + b, 0, 255); fit.append((round(a, 2), round(b, 1)))
    return Image.fromarray(out.astype(np.uint8), 'RGBA'), fit

def main():
    os.makedirs(WEB, exist_ok=True)
    only = [a for a in sys.argv[1:] if not a.startswith('--')]
    for rel, user in JOBS:
        if only and not any(o in rel or o == user for o in only): continue
        src = os.path.join(WEB, 'chesscom_%s.png' % user)
        if '--fetch' in sys.argv or not os.path.exists(src): print(user, fetch(user))
        fig = Image.open(src).convert('RGBA').resize((S, S), Image.LANCZOS)
        old = Image.open(os.path.join(OLD, rel.replace('/', '_'))).convert('RGBA')   # the original video crop
        flat = Image.new('RGBA', old.size, (38, 37, 34, 255)); flat.alpha_composite(old)
        bg = flat.convert('RGB').resize((S, S), Image.LANCZOS)
        d, sc, dx, dy = register(bg, fig)
        n = int(round(S * sc)); out = bg.convert('RGBA'); tf, fit = tone_match(bg, fig, sc, dx, dy, min(old.size))
        layer = Image.new('RGBA', (S, S)); layer.paste(tf, ((S - n) // 2 + dx, (S - n) // 2 + dy)); out.alpha_composite(layer)
        out.convert('RGB').save(os.path.join(A, rel), optimize=True)
        print('%-26s %-18s diff %.1f scale %.2f dx %d dy %d tone %s' % (rel, user, d, sc, dx, dy, fit))

if __name__ == '__main__':
    main()
