#!/usr/bin/env python3
"""g4 art pass 7 (2026-11-25, art-g4b): Gun King (AWFB4EzGtDc) start room, exits and biome floors.

Frames (owner-approved, committed 1920x1080 in research/frames/video_thumbs):
  AWFB4EzGtDc_frame_38.jpg   0:38 start room: mossy stone checker floor, EXIT on all four sides; the top exit's edge is
                             a dirt/grass strip, the bottom exit's edge is the icy-blue floor; left/right edges are not
                             visible (the room continues off screen)
  AWFB4EzGtDc_frame_62.jpg   1:02 the icy-blue biome (light/dark blue checker with snow flecks)
  AWFB4EzGtDc_frame_492.jpg / _1573.jpg   8:12 CHECKMATE and 26:13 VICTORY end-of-run summaries (styled in code, g4_gunking.js)
Floor textures repeat every 4 tiles in the game (autocorrelation period 257 px at 1080p, 64 px tiles), so each floor is a
257x257 crop scaled to 256 = 4x4 tiles. Output in app/assets/modes/AWFB4EzGtDc/:
  floor_start.png, floor_icy.png (cut), floor_forest.png (2x2 checker of the grass and dirt blocks of the top exit's edge
  strip, blocks stretched to square: INFERRED, the video never enters that biome), edge_top.png, edge_bottom.png
  (257 px wide repeating exit strips with their white arrows).
Run from rebuild/app: python3 tools/g4_art7.py
"""
from PIL import Image
T = 'research/frames/video_thumbs/AWFB4EzGtDc_frame_%s.jpg'
D = 'assets/modes/AWFB4EzGtDc/'


def main():
    f38 = Image.open(T % '38').convert('RGB'); f62 = Image.open(T % '62').convert('RGB')
    f38.crop((118, 560, 375, 817)).resize((256, 256), Image.LANCZOS).save(D + 'floor_start.png')
    f62.crop((150, 690, 407, 947)).resize((256, 256), Image.LANCZOS).save(D + 'floor_icy.png')
    f38.crop((600, 10, 857, 64)).save(D + 'edge_top.png')
    f38.crop((600, 1014, 857, 1068)).save(D + 'edge_bottom.png')
    grass = f38.crop((700, 12, 758, 46)).resize((64, 64), Image.NEAREST)
    dirt = f38.crop((602, 12, 660, 46)).resize((64, 64), Image.NEAREST)
    fo = Image.new('RGB', (256, 256))
    for i in range(4):
        for j in range(4): fo.paste(grass if (i + j) % 2 == 0 else dirt, (i * 64, j * 64))
    fo.save(D + 'floor_forest.png')


if __name__ == '__main__':
    main(); print('ok')
