"""cm-g6b (2026-11-25): Chess Survivors (spJibM5qaNQ) pickup art from the repo stills research/frames/video_thumbs/spJibM5qaNQ_maxres2/3.jpg:
the movement coin (white disc + purple-grey bishop, maxres3 at 381-435 x 241-294) and the orange key (maxres3). The rook / knight / queen
coins are the same disc with that piece's silhouette (from the video's own enemy sprites in assets/modes/spJibM5qaNQ/<piece>.png),
painted in the coin's purple-grey; the video only shows bishop and (cut off) rook coins. No chest is visible on any repo still."""
from PIL import Image, ImageDraw, ImageFilter
import os
R = os.path.join(os.path.dirname(__file__), '..', 'research', 'frames', 'video_thumbs')
O = os.path.join(os.path.dirname(__file__), '..', 'assets', 'modes', 'spJibM5qaNQ')
s3 = Image.open(os.path.join(R, 'spJibM5qaNQ_maxres3.jpg')).convert('RGB')
# coin: circular alpha (disc + soft glow)
c = s3.crop((370, 230, 446, 306)).convert('RGBA'); cx, cy, r = 38, 37.5, 28
m = Image.new('L', c.size, 0); px = m.load()
for y in range(c.height):
    for x in range(c.width):
        d = ((x - cx) ** 2 + (y - cy) ** 2) ** 0.5
        px[x, y] = 255 if d <= r else max(0, int(255 * (1 - (d - r) / 8)))
c.putalpha(m); c.save(os.path.join(O, 'coin_b.png'))
# plain disc (bishop painted out with the disc white) for the other coins
cp = c.copy(); d = ImageDraw.Draw(cp); d.ellipse((cx - 19, cy - 20, cx + 19, cy + 20), fill=(254, 254, 254, 255))
cp.putalpha(m); ink = (157, 147, 199, 255)
for t in ['rook', 'knight', 'queen']:
    sp = Image.open(os.path.join(O, t + '.png')).convert('RGBA'); bb = sp.getbbox(); sp = sp.crop(bb)
    k = 30 / max(sp.size); sp = sp.resize((max(1, int(sp.width * k)), max(1, int(sp.height * k))), Image.NEAREST)
    a = sp.split()[3].point(lambda v: 255 if v > 100 else 0); sil = Image.new('RGBA', sp.size, ink); sil.putalpha(a)
    out = cp.copy(); out.paste(sil, (int(cx - sp.width / 2), int(cy - sp.height / 2) + 1), sil); out.save(os.path.join(O, 'coin_' + t[0] if t != 'knight' else 'coin_n') + '.png' if False else os.path.join(O, 'coin_' + {'rook': 'r', 'knight': 'n', 'queen': 'q'}[t] + '.png'))
# key: orange pixels only
k = s3.crop((246, 228, 304, 276)).convert('RGBA'); px = k.load()
for y in range(k.height):
    for x in range(k.width):
        r_, g_, b_, _ = px[x, y]; px[x, y] = (r_, g_, b_, 255 if (r_ > 170 and 90 < g_ < 200 and b_ < 120) else 0)
bb = k.getbbox(); k = k.crop(bb); k.save(os.path.join(O, 'key.png'))
print('ok', k.size)
