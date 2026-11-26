#!/usr/bin/env python3
"""pol-q1: key out the video's square colour behind a cut sprite (flood fill from the border), so the
piece sits on whatever square it stands on. usage: key_square.py file.png [tol]"""
import sys
from PIL import Image, ImageFilter
from collections import deque
p = sys.argv[1]; tol = int(sys.argv[2]) if len(sys.argv) > 2 else 26
im = Image.open(p).convert('RGBA'); W, H = im.size; px = im.load()
bg = px[2, 2][:3]
def near(c, t): return sum(abs(a - b) for a, b in zip(c[:3], bg)) <= t
seen = bytearray(W * H); q = deque()
for x in range(W):
    q.append((x, 0)); q.append((x, H - 1))
for y in range(H):
    q.append((0, y)); q.append((W - 1, y))
mask = Image.new('L', (W, H), 255); mp = mask.load()
while q:
    x, y = q.popleft()
    if x < 0 or y < 0 or x >= W or y >= H or seen[y * W + x]: continue
    seen[y * W + x] = 1
    c = px[x, y]
    if c[3] == 0 or near(c, tol):
        mp[x, y] = 0
        q.extend(((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)))
# soft 1px edge: pixels next to the keyed area that are still close to bg become half transparent
mask = mask.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.7))
out = im.copy(); a = out.getchannel('A')
from PIL import ImageChops
out.putalpha(ImageChops.multiply(a, mask))
out.save(p, optimize=True)
print(p, 'keyed', sum(1 for v in mask.getdata() if v < 128), 'px of', W * H)
