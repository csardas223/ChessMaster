#!/usr/bin/env python3
"""g5 art 9 (2026-11-25): Wizard Chess (DMtaRFMpCWc) cuts from the repo frame research/frames/video_thumbs/DMtaRFMpCWc_frame_1025.jpg
(17:05, boss room): the skull shield orb (pink skull, its blue glow dropped: we draw the glow in CSS) and the blue skull-face coin
of the top-left currency HUD (the shop's 'Buy (-6 [coin])' currency), circle-masked."""
import os
from PIL import Image, ImageDraw
HERE = os.path.dirname(os.path.abspath(__file__)); APP = os.path.dirname(HERE)
SRC = os.path.join(APP, 'research/frames/video_thumbs/DMtaRFMpCWc_frame_1025.jpg')
OUT = os.path.join(APP, 'assets/modes/DMtaRFMpCWc')
im = Image.open(SRC).convert('RGBA')
orb = im.crop((476, 760, 510, 790)).copy(); px = orb.load()
for y in range(orb.height):
    for x in range(orb.width):
        r, g, b, a = px[x, y]
        if not (r > 110 and b > 110 and r > g + 40): px[x, y] = (0, 0, 0, 0)
orb = orb.crop(orb.getbbox()); s = max(orb.size); sq = Image.new('RGBA', (s, s)); sq.paste(orb, ((s - orb.width) // 2, (s - orb.height) // 2))
sq.resize((96, 96), Image.NEAREST).save(os.path.join(OUT, 'shield_orb.png'))
coin = im.crop((58, 13, 82, 37)).resize((96, 96), Image.LANCZOS)
m = Image.new('L', coin.size, 0); ImageDraw.Draw(m).ellipse((2, 2, 93, 93), fill=255); coin.putalpha(m)
coin.save(os.path.join(OUT, 'skull_coin.png'))
print('ok')
